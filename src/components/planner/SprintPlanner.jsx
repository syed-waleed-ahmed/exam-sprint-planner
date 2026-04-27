import { DndContext } from '@dnd-kit/core';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { buildLiveRebalancedPlan, clampBlocksToExamWindow, generateSprintBlocks } from '../../utils/sprintGenerator';
import { getMissedStudyDays } from '../../utils/studyInsights';
import { safeGetJson, safeSetJson } from '../../utils/storage';
import TimelineView from './TimelineView';

const parseIsoDay = (iso) => new Date(`${iso}T00:00:00`);
const PLANNER_PREFS_KEY = 'planner_prefs';
const isPlanOutOfBounds = (blocks = [], examDate) => {
  if (!examDate) return false;
  const examDay = parseIsoDay(examDate);
  return blocks.some((block) => parseIsoDay(block.end) > examDay);
};

export default function SprintPlanner({ exams, sprintPlans, updateSprintPlan, studyLog = [], userProfile }) {
  const [plannerPrefs, setPlannerPrefs] = useState(() =>
    safeGetJson(
      PLANNER_PREFS_KEY,
      { selectedExamId: '', planMode: userProfile.freeTimePreference || 'balanced' },
      'planner:prefs:read'
    )
  );
  const selectedExamId = plannerPrefs.selectedExamId || '';
  const planMode = plannerPrefs.planMode || userProfile.freeTimePreference || 'balanced';
  const setSelectedExamId = (value) => setPlannerPrefs((prev) => ({ ...prev, selectedExamId: value }));
  const setPlanMode = (value) => setPlannerPrefs((prev) => ({ ...prev, planMode: value }));

  const selectedExam = exams.find((exam) => exam.id === selectedExamId);
  const blocks = selectedExam ? sprintPlans[selectedExam.id] || [] : [];
  const normalizedBlocks = useMemo(
    () => (selectedExam ? clampBlocksToExamWindow(selectedExam, blocks) : []),
    [selectedExam, blocks]
  );

  const topicMap = useMemo(() => {
    if (!selectedExam) return {};

    const performanceByTopic = Object.fromEntries(
      studyLog
        .filter((entry) => entry.examId === selectedExam.id)
        .reduce((acc, entry) => {
          const prev = acc.get(entry.topicId) || { weakQuizHits: 0, minutes: 0 };
          const weakQuiz = typeof entry.sessionType === 'string' && entry.sessionType.startsWith('quiz-') && Number(entry.sessionType.split('-')[1]?.split('/')[0] || 0) <= 2;
          prev.weakQuizHits += weakQuiz ? 1 : 0;
          prev.minutes += entry.minutesSpent || 0;
          acc.set(entry.topicId, prev);
          return acc;
        }, new Map())
    );

    return Object.fromEntries(
      selectedExam.topics.map((topic) => {
        const performance = performanceByTopic[topic.id] || { weakQuizHits: 0, minutes: 0 };
        const topicImportance = Math.max(1, Math.min(5, topic.importanceLevel || selectedExam.importanceLevel || 3));
        const examImportance = Math.max(1, Math.min(5, selectedExam.importanceLevel || 3));
        const priorityScore =
          (topic.difficulty || 2) * 2 +
          topicImportance * 2.1 +
          examImportance * 1.3 +
          (topic.status === 'not_started' ? 4 : topic.status === 'in_progress' ? 2 : 0) +
          performance.weakQuizHits * 3 -
          Math.min(Math.round(performance.minutes / 30), 3);

        return [topic.id, { ...topic, importanceLevel: topicImportance, priorityScore }];
      })
    );
  }, [selectedExam, studyLog]);
  const livePlan = useMemo(
    () => buildLiveRebalancedPlan(normalizedBlocks, topicMap, studyLog, selectedExam?.id),
    [normalizedBlocks, topicMap, studyLog, selectedExam?.id]
  );
  const liveBlocks = livePlan.blocks;

  const missedDays = selectedExam ? getMissedStudyDays(studyLog, selectedExam.id) : 0;

  const autoGenerate = useCallback(() => {
    if (!selectedExam) return;

    const enrichedExam = {
      ...selectedExam,
      topics: selectedExam.topics.map((topic) => ({
        ...topic,
        priorityScore: topicMap[topic.id]?.priorityScore || 0,
      })),
    };

    updateSprintPlan(
      selectedExam.id,
      generateSprintBlocks(enrichedExam, {
        dailyGoalMinutes: userProfile?.dailyGoalMinutes || 90,
        missedDays,
        missedReason: missedDays > 0 ? 'automatic recovery adjustment' : '',
        preferredStudyDays: userProfile?.preferredStudyDays || 5,
        freeTimePreference: planMode,
      })
    );
  }, [selectedExam, topicMap, updateSprintPlan, userProfile?.dailyGoalMinutes, userProfile?.preferredStudyDays, missedDays, planMode]);

  useEffect(() => {
    if (!selectedExam) return;
    if (!blocks.length) return;
    if (JSON.stringify(blocks) === JSON.stringify(normalizedBlocks)) return;
    updateSprintPlan(selectedExam.id, normalizedBlocks);
  }, [selectedExam, blocks, normalizedBlocks, updateSprintPlan]);

  useEffect(() => {
    if (!selectedExam) return;
    if (!blocks.length) return;
    if (!isPlanOutOfBounds(blocks, selectedExam.examDate)) return;
    autoGenerate();
  }, [selectedExam, blocks, autoGenerate]);

  useEffect(() => {
    if (!exams.length) return;
    const exists = exams.some((exam) => exam.id === selectedExamId);
    if (!exists) {
      setSelectedExamId(exams[0].id);
    }
  }, [exams, selectedExamId]);

  useEffect(() => {
    safeSetJson(PLANNER_PREFS_KEY, plannerPrefs, 'planner:prefs:save');
  }, [plannerPrefs]);

  const onDragEnd = (event) => {
    if (!selectedExam) return;
    const { active, over } = event;
    if (!over) return;

    const current = liveBlocks.map((b) => ({ ...b, live: undefined, topics: [...b.topics] }));
    let fromBlockIdx = -1;
    const toBlockIdx = current.findIndex((b) => b.id === over.id);

    current.forEach((block, idx) => {
      if (block.topics.includes(active.id)) fromBlockIdx = idx;
    });

    if (fromBlockIdx === -1 || toBlockIdx === -1 || fromBlockIdx === toBlockIdx) return;

    current[fromBlockIdx].topics = current[fromBlockIdx].topics.filter((id) => id !== active.id);
    current[toBlockIdx].topics.push(active.id);
    updateSprintPlan(selectedExam.id, current);
  };

  return (
    <section className="space-y-4">
      <header className="glass-card p-4">
        <h2 className="text-2xl font-bold">Sprint Planner</h2>
        <p className="text-sm text-muted">Smart weekly planning that reacts to missed days, free time, and topic priority.</p>
        {selectedExam && (
          <p className="mt-1 text-xs text-secondary">Planning window ends on exam date: {selectedExam.examDate}</p>
        )}
        <div className="mt-3 flex flex-wrap gap-2">
          <select className="rounded-elem border border-white/10 bg-slate-800 px-3 py-2 text-sm" value={selectedExamId} onChange={(e) => setSelectedExamId(e.target.value)}>
            <option value="">Select exam</option>
            {exams.map((exam) => (
              <option key={exam.id} value={exam.id}>{exam.name}</option>
            ))}
          </select>
          <select className="rounded-elem border border-white/10 bg-slate-800 px-3 py-2 text-sm" value={planMode} onChange={(e) => setPlanMode(e.target.value)}>
            <option value="light">Light weeks</option>
            <option value="balanced">Balanced pace</option>
            <option value="intense">High intensity</option>
          </select>
          <button onClick={autoGenerate} className="rounded-elem bg-primary px-3 py-2 text-sm font-semibold">Auto-generate sprints</button>
          <button onClick={autoGenerate} className="rounded-elem border border-white/20 px-3 py-2 text-sm">Reschedule from today</button>
        </div>
        {selectedExam && (
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <div className="rounded-elem border border-white/10 bg-slate-900/35 p-3">
              <p className="text-xs text-muted">Missed study days</p>
              <p className="mt-1 text-xl font-bold">{missedDays}</p>
              <p className="text-xs text-muted">The planner will pull higher-yield topics forward automatically.</p>
            </div>
            <div className="rounded-elem border border-white/10 bg-slate-900/35 p-3">
              <p className="text-xs text-muted">Preferred study days</p>
              <p className="mt-1 text-xl font-bold">{userProfile.preferredStudyDays || 5}/week</p>
              <p className="text-xs text-muted">Daily goal: {userProfile.dailyGoalMinutes} minutes</p>
            </div>
            <div className="rounded-elem border border-white/10 bg-slate-900/35 p-3">
              <p className="text-xs text-muted">Priority focus</p>
              <p className="mt-1 text-xl font-bold">{Object.values(topicMap).sort((a, b) => (b.priorityScore || 0) - (a.priorityScore || 0))[0]?.name || 'N/A'}</p>
              <p className="text-xs text-muted">Weak or urgent topics get scheduled earlier.</p>
            </div>
            <div className="rounded-elem border border-white/10 bg-slate-900/35 p-3">
              <p className="text-xs text-muted">Live rebalance</p>
              <p className="mt-1 text-xl font-bold">{livePlan.summary.dailyMinutesToday || 0} min/day</p>
              <p className="text-xs text-muted">
                {livePlan.summary.carryoverHours > 0
                  ? `${livePlan.summary.carryoverHours}h carried from missed blocks`
                  : 'On track: no carried-over hours right now'}
              </p>
            </div>
          </div>
        )}
      </header>

      {!selectedExam ? (
        <div className="glass-card p-8 text-center text-muted">Select an exam to view its sprint plan</div>
      ) : liveBlocks.length === 0 ? (
        <div className="glass-card p-8 text-center text-muted">No sprint blocks generated yet. Use Auto-generate sprints.</div>
      ) : (
        <div className="space-y-4">
          <div className="grid gap-3 md:grid-cols-3">
            {liveBlocks.slice(0, 3).map((block) => (
              <div key={block.id} className="rounded-elem border border-white/10 bg-slate-900/35 p-3">
                <p className="text-sm font-semibold">{block.label}</p>
                <p className="mt-1 text-xs text-muted">{block.focusMode} · capacity {block.capacityHours}h · target {block.live?.dailyMinutesTarget || 0} min/day</p>
              </div>
            ))}
          </div>
          <DndContext onDragEnd={onDragEnd}>
            <TimelineView blocks={liveBlocks} topicMap={topicMap} />
          </DndContext>
        </div>
      )}
    </section>
  );
}
