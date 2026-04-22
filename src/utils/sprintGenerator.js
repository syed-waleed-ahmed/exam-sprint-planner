import { daysUntil } from './dateHelpers';

const sortByDifficulty = (topics) => {
  const hard = topics.filter((t) => t.difficulty === 3);
  const medium = topics.filter((t) => t.difficulty === 2);
  const easy = topics.filter((t) => t.difficulty === 1);
  return { hard, medium, easy };
};

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

const addDays = (date, days) => {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
};

const formatShort = (date) =>
  new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(date);

const toIso = (date) => date.toISOString().slice(0, 10);

export const estimateTopicHours = (difficulty) => {
  if (difficulty === 3) return 2;
  if (difficulty === 2) return 1.5;
  return 1;
};

export const generateSprintBlocks = (exam, options = {}) => {
  const totalDays = Math.max(daysUntil(exam.examDate), 1);
  const today = startOfDay(new Date());
  const examDay = startOfDay(exam.examDate);

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

  if (blocks.length === 0) {
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

  const reserveRevision = totalDays >= 7 && blocks.length > 1;
  const revisionBlockCount = reserveRevision ? 1 : 0;
  const planningBlockCount = Math.max(blocks.length - revisionBlockCount, 1);

  if (reserveRevision) {
    const revIdx = blocks.length - 1;
    blocks[revIdx].isRevision = true;
    blocks[revIdx].label = `${blocks[revIdx].label} - Revision`;
  }

  const missedDays = Math.max(0, options.missedDays || 0);
  const missedReason = options.missedReason || '';
  if (missedDays > 0) {
    blocks[0].adjustment = {
      missedDays,
      reason: missedReason,
    };
  }

  const topics = [...(exam.topics || [])].sort((a, b) => {
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

    blocks[bestIdx].topics.push(topic.id);
    plannedHours[bestIdx] += topicHours;
  });

  blocks.forEach((block, index) => {
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
  });

  return blocks;
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
