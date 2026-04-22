import { DndContext } from '@dnd-kit/core';
import { useMemo, useState } from 'react';
import { generateSprintBlocks } from '../../utils/sprintGenerator';
import { getMissedStudyDays } from '../../utils/studyInsights';
import TimelineView from './TimelineView';

export default function SprintPlanner({ exams, sprintPlans, updateSprintPlan, studyLog = [], userProfile }) {
  const [selectedExamId, setSelectedExamId] = useState('');
  const [planMode, setPlanMode] = useState(userProfile.freeTimePreference || 'balanced');

  const selectedExam = exams.find((exam) => exam.id === selectedExamId);
  const blocks = selectedExam ? sprintPlans[selectedExam.id] || [] : [];

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
        const priorityScore =
          (topic.difficulty || 2) * 2 +
          (topic.status === 'not_started' ? 4 : topic.status === 'in_progress' ? 2 : 0) +
          performance.weakQuizHits * 3 -
          Math.min(Math.round(performance.minutes / 30), 3);

        return [topic.id, { ...topic, priorityScore }];
      })
    );
  }, [selectedExam, studyLog]);

  const missedDays = selectedExam ? getMissedStudyDays(studyLog, selectedExam.id) : 0;

  const autoGenerate = () => {
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
  };

  const onDragEnd = (event) => {
    if (!selectedExam) return;
    const { active, over } = event;
    if (!over) return;

    const current = blocks.map((b) => ({ ...b, topics: [...b.topics] }));
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
          <button onClick={autoGenerate} className="rounded-elem border border-white/20 px-3 py-2 text-sm">Regenerate Plan</button>
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
          </div>
        )}
      </header>

      {!selectedExam ? (
        <div className="glass-card p-8 text-center text-muted">Select an exam to view its sprint plan</div>
      ) : blocks.length === 0 ? (
        <div className="glass-card p-8 text-center text-muted">No sprint blocks generated yet. Use Auto-generate sprints.</div>
      ) : (
        <div className="space-y-4">
          <div className="grid gap-3 md:grid-cols-3">
            {blocks.slice(0, 3).map((block) => (
              <div key={block.id} className="rounded-elem border border-white/10 bg-slate-900/35 p-3">
                <p className="text-sm font-semibold">{block.label}</p>
                <p className="mt-1 text-xs text-muted">{block.focusMode} · capacity {block.capacityHours}h</p>
              </div>
            ))}
          </div>
          <DndContext onDragEnd={onDragEnd}>
            <TimelineView blocks={blocks} topicMap={topicMap} />
          </DndContext>
        </div>
      )}
    </section>
  );
}
