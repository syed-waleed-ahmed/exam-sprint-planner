import { differenceInCalendarDays, isValid, parseISO } from 'date-fns';

const statusPriority = {
  not_started: 3,
  in_progress: 2,
  revised: 1,
  confident: 0,
};

const startOfDay = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

const parseIsoLocalDate = (isoDate) => {
  if (!isoDate) return startOfDay(new Date());
  const raw = String(isoDate);
  const parsed = raw.includes('T') ? new Date(raw) : parseISO(raw);
  return startOfDay(parsed);
};

const addDays = (date, days) => {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
};

const formatShort = (date) =>
  new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(date);

const toIso = (date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

export const clampBlocksToExamWindow = (exam, blocks = []) => {
  const examDay = parseIsoLocalDate(exam?.examDate);
  if (!isValid(examDay)) return [];

  return blocks
    .map((block, idx) => {
      const blockStart = parseIsoLocalDate(block.start);
      const parsedEnd = parseIsoLocalDate(block.end);
      if (!isValid(blockStart) || !isValid(parsedEnd) || blockStart > examDay) return null;
      const blockEnd = parsedEnd > examDay ? new Date(examDay) : parsedEnd;
      const isRevision = Boolean(block.isRevision);
      return {
        ...block,
        id: `${exam.id}-week-${idx + 1}`,
        start: toIso(blockStart),
        end: toIso(blockEnd),
        isRevision,
      };
    })
    .filter(Boolean)
    .sort((a, b) => parseIsoLocalDate(a.start) - parseIsoLocalDate(b.start))
    .map((block, idx) => {
      const weekStart = parseIsoLocalDate(block.start);
      const weekEnd = parseIsoLocalDate(block.end);
      return {
        ...block,
        id: `${exam.id}-week-${idx + 1}`,
        label: `Week ${idx + 1} - ${formatShort(weekStart)} to ${formatShort(weekEnd)}${block.isRevision ? ' - Revision' : ''}`,
      };
    });
};

export const estimateTopicHours = (difficulty) => {
  if (difficulty === 3) return 2;
  if (difficulty === 2) return 1.5;
  return 1;
};

export const generateSprintBlocks = (exam, options = {}) => {
  const today = startOfDay(new Date());
  const examDay = parseIsoLocalDate(exam.examDate);
  if (!isValid(examDay)) return [];

  const totalDays = Math.max(differenceInCalendarDays(examDay, today), 1);

  if (examDay < today) return [];

  const blocks = [];
  let cursor = new Date(today);
  let idx = 0;
  while (cursor <= examDay) {
    const weekStart = new Date(cursor);
    const weekEnd = addDays(weekStart, 6) > examDay ? new Date(examDay) : addDays(weekStart, 6);
    blocks.push({
      id: `${exam.id}-week-${idx + 1}`,
      label: `Week ${idx + 1} - ${formatShort(weekStart)} to ${formatShort(weekEnd)}`,
      start: toIso(weekStart),
      end: toIso(weekEnd),
      topics: [],
      isRevision: false,
    });
    cursor = addDays(weekStart, 7);
    idx += 1;
  }

  const inRangeBlocks = blocks.filter((block) => {
    const blockStart = parseIsoLocalDate(block.start);
    const blockEnd = parseIsoLocalDate(block.end);
    return blockStart <= examDay && blockStart <= blockEnd;
  });

  if (inRangeBlocks.length === 0) {
    return [
      {
        id: `${exam.id}-week-1`,
        label: 'Week 1 - Revision',
        start: toIso(today),
        end: toIso(examDay),
        topics: [],
        isRevision: true,
      },
    ];
  }

  const blocksToPlan = inRangeBlocks.map((block) => ({ ...block }));

  const reserveRevision = totalDays >= 7 && blocksToPlan.length > 1;
  const revisionBlockCount = reserveRevision ? 1 : 0;
  const planningBlockCount = Math.max(blocksToPlan.length - revisionBlockCount, 1);

  if (reserveRevision) {
    const revIdx = blocksToPlan.length - 1;
    blocksToPlan[revIdx].isRevision = true;
    blocksToPlan[revIdx].label = `${blocksToPlan[revIdx].label} - Revision`;
  }

  const missedDays = Math.max(0, options.missedDays || 0);
  const missedReason = options.missedReason || '';
  if (missedDays > 0) {
    blocksToPlan[0].adjustment = {
      missedDays,
      reason: missedReason,
    };
  }

  const examImportance = Math.max(1, Math.min(5, exam.importanceLevel || 3));

  const topics = [...(exam.topics || [])].sort((a, b) => {
    const aImportance = Math.max(1, Math.min(5, a.importanceLevel || examImportance));
    const bImportance = Math.max(1, Math.min(5, b.importanceLevel || examImportance));
    if (bImportance !== aImportance) return bImportance - aImportance;
    const aPriority = (a.priorityScore || 0);
    const bPriority = (b.priorityScore || 0);
    if (bPriority !== aPriority) return bPriority - aPriority;
    if ((b.difficulty || 2) !== (a.difficulty || 2)) return (b.difficulty || 2) - (a.difficulty || 2);
    if ((statusPriority[b.status] || 0) !== (statusPriority[a.status] || 0)) {
      return (statusPriority[b.status] || 0) - (statusPriority[a.status] || 0);
    }
    const aReviewed = a.lastReviewed ? new Date(a.lastReviewed).getTime() : 0;
    const bReviewed = b.lastReviewed ? new Date(b.lastReviewed).getTime() : 0;
    return aReviewed - bReviewed;
  });

  const plannedHours = Array.from({ length: planningBlockCount }, () => 0);
  const preferredStudyDays = Math.min(Math.max(options.preferredStudyDays || 5, 3), 7);
  const weeklyTargetHours = Math.max(((options.dailyGoalMinutes || 90) * preferredStudyDays) / 60, 3);
  const freeTimeBias = options.freeTimePreference === 'light' ? 0.8 : options.freeTimePreference === 'intense' ? 1.15 : 1;
  const adjustedTargetHours = weeklyTargetHours * freeTimeBias;

  topics.forEach((topic) => {
    const topicHours = estimateTopicHours(topic.difficulty || 2);
    const priorityBoost = Math.min((topic.priorityScore || 0) * 0.08, 1.8);

    let bestIdx = 0;
    let bestScore = Number.POSITIVE_INFINITY;
    for (let i = 0; i < planningBlockCount; i += 1) {
      const load = plannedHours[i];
      const latenessPenalty = Math.max(i * 0.35 - priorityBoost, 0);
      const lastPlanningWeekPenalty = i === planningBlockCount - 1 && planningBlockCount > 1 ? 1 : 0;
      const overloadPenalty = load > adjustedTargetHours ? (load - adjustedTargetHours) * 0.7 : 0;
      const missedDaysPenalty = missedDays > 0 ? (i / planningBlockCount) * Math.min(missedDays * 0.15, 1.2) : 0;
      const score = load + latenessPenalty + lastPlanningWeekPenalty + overloadPenalty + missedDaysPenalty;
      if (score < bestScore) {
        bestScore = score;
        bestIdx = i;
      }
    }

    blocksToPlan[bestIdx].topics.push(topic.id);
    plannedHours[bestIdx] += topicHours;
  });

  blocksToPlan.forEach((block, index) => {
    block.capacityHours = Math.round((adjustedTargetHours + Number.EPSILON) * 10) / 10;
    block.focusMode =
      index === 0 && missedDays > 0
        ? 'Recovery sprint'
        : block.isRevision
          ? 'Revision and mocks'
          : options.freeTimePreference === 'light'
            ? 'Compact sessions'
            : options.freeTimePreference === 'intense'
              ? 'High-output week'
              : 'Balanced cadence';

    const blockEnd = parseIsoLocalDate(block.end);
    if (blockEnd > examDay) {
      block.end = toIso(examDay);
      block.label = `${block.label.split(' - ')[0]} - ${formatShort(parseIsoLocalDate(block.start))} to ${formatShort(examDay)}${block.isRevision ? ' - Revision' : ''}`;
    }
  });

  return clampBlocksToExamWindow(exam, blocksToPlan);
};

export const blockStats = (block, topicMap) => {
  const topics = block.topics.map((id) => topicMap[id]).filter(Boolean);
  const hours = topics.reduce((sum, topic) => sum + estimateTopicHours(topic.difficulty), 0);
  const readiness =
    topics.length === 0
      ? 0
      : Math.round(topics.reduce((sum, topic) => sum + (topic.status === 'confident' ? 100 : topic.status === 'revised' ? 65 : topic.status === 'in_progress' ? 25 : 0), 0) / topics.length);
  return { hours, readiness };
};

export const buildLiveRebalancedPlan = (blocks = [], topicMap = {}, studyLog = [], examId = '') => {
  if (!blocks.length) {
    return {
      blocks: [],
      summary: { carryoverHours: 0, remainingHours: 0, dailyMinutesToday: 0 },
    };
  }

  const today = startOfDay(new Date());
  const byTopicMinutes = {};
  studyLog
    .filter((entry) => (!examId || entry.examId === examId) && entry.topicId)
    .forEach((entry) => {
      byTopicMinutes[entry.topicId] = (byTopicMinutes[entry.topicId] || 0) + (entry.minutesSpent || 0);
    });

  const withBase = blocks.map((block) => {
    const blockStart = parseIsoLocalDate(block.start);
    const blockEnd = parseIsoLocalDate(block.end);
    const topics = (block.topics || []).map((id) => topicMap[id]).filter(Boolean);
    const plannedHours = topics.reduce((sum, topic) => sum + estimateTopicHours(topic.difficulty || 2), 0);
    const loggedHours = topics.reduce((sum, topic) => sum + ((byTopicMinutes[topic.id] || 0) / 60), 0);
    const remainingHours = Math.max(plannedHours - loggedHours, 0);
    const isPast = blockEnd < today;
    const activeStart = blockStart > today ? blockStart : today;
    const daysLeft = isPast ? 0 : Math.max(differenceInCalendarDays(blockEnd, activeStart) + 1, 1);
    return {
      ...block,
      live: {
        plannedHours,
        loggedHours,
        remainingHours,
        daysLeft,
        carryoverHours: 0,
        adjustedRemainingHours: remainingHours,
        dailyMinutesTarget: daysLeft > 0 ? Math.ceil((remainingHours * 60) / daysLeft) : 0,
        isPast,
      },
    };
  });

  const carryoverHours = withBase
    .filter((block) => block.live.isPast)
    .reduce((sum, block) => sum + block.live.remainingHours, 0);

  const futureIndexes = withBase
    .map((block, index) => ({ block, index }))
    .filter(({ block }) => !block.live.isPast && block.live.daysLeft > 0);

  const totalFutureDays = futureIndexes.reduce((sum, { block }) => sum + block.live.daysLeft, 0);

  let remainingCarryover = carryoverHours;
  futureIndexes.forEach(({ index, block }, position) => {
    const isLast = position === futureIndexes.length - 1;
    const share = totalFutureDays > 0 ? carryoverHours * (block.live.daysLeft / totalFutureDays) : 0;
    const applied = isLast ? remainingCarryover : Math.max(0, Math.min(share, remainingCarryover));
    remainingCarryover -= applied;
    withBase[index] = {
      ...withBase[index],
      live: {
        ...withBase[index].live,
        carryoverHours: applied,
        adjustedRemainingHours: withBase[index].live.remainingHours + applied,
        dailyMinutesTarget: Math.ceil(((withBase[index].live.remainingHours + applied) * 60) / withBase[index].live.daysLeft),
      },
    };
  });

  const activeBlock = withBase.find((block) => {
    const start = parseIsoLocalDate(block.start);
    const end = parseIsoLocalDate(block.end);
    return start <= today && today <= end;
  });
  const nextBlock = withBase.find((block) => parseIsoLocalDate(block.start) > today);
  const focusBlock = activeBlock || nextBlock;

  return {
    blocks: withBase,
    summary: {
      carryoverHours: Math.round((carryoverHours + Number.EPSILON) * 10) / 10,
      remainingHours: Math.round(
        (withBase.reduce((sum, block) => sum + block.live.adjustedRemainingHours, 0) + Number.EPSILON) * 10
      ) / 10,
      dailyMinutesToday: focusBlock ? focusBlock.live.dailyMinutesTarget : 0,
    },
  };
};
