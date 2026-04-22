import { DndContext } from '@dnd-kit/core';
import { useMemo, useState } from 'react';
import { generateSprintBlocks } from '../../utils/sprintGenerator';
import TimelineView from './TimelineView';

export default function SprintPlanner({ exams, sprintPlans, updateSprintPlan, studyLog = [], userProfile }) {
  const [selectedExamId, setSelectedExamId] = useState('');

  const selectedExam = exams.find((exam) => exam.id === selectedExamId);
  const blocks = selectedExam ? sprintPlans[selectedExam.id] || [] : [];

  const topicMap = useMemo(() => {
    if (!selectedExam) return {};
    return Object.fromEntries(selectedExam.topics.map((topic) => [topic.id, topic]));
  }, [selectedExam]);

  const getMissedStudyDays = () => {
    if (!selectedExam) return 0;
    const now = new Date();
    const lookbackStart = new Date(now);
    lookbackStart.setDate(now.getDate() - 7);

    const seenDays = new Set(
      studyLog
        .filter((entry) => entry.examId === selectedExam.id)
        .map((entry) => new Date(entry.date).toISOString().slice(0, 10))
    );

    let missed = 0;
    const cursor = new Date(lookbackStart);
    while (cursor < now) {
      const dayKey = cursor.toISOString().slice(0, 10);
      if (!seenDays.has(dayKey)) missed += 1;
      cursor.setDate(cursor.getDate() + 1);
    }
    return missed;
  };

  const autoGenerate = () => {
    if (!selectedExam) return;

    const missedDays = getMissedStudyDays();
    let missedReason = '';
    if (missedDays > 0) {
      missedReason =
        window.prompt(
          `You missed ${missedDays} recent study day(s). What was the reason? (optional)`,
          'personal reasons'
        ) || 'not specified';
    }

    updateSprintPlan(
      selectedExam.id,
      generateSprintBlocks(selectedExam, {
        dailyGoalMinutes: userProfile?.dailyGoalMinutes || 90,
        missedDays,
        missedReason,
      })
    );
  };

  const onDragEnd = (event) => {
    if (!selectedExam) return;
    const { active, over } = event;
    if (!over) return;

    const current = blocks.map((b) => ({ ...b, topics: [...b.topics] }));
    let fromBlockIdx = -1;
    let toBlockIdx = current.findIndex((b) => b.id === over.id);

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
        <p className="text-sm text-muted">Distribute topics week-by-week and drag chips between sprint blocks.</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <select className="rounded-elem border border-white/10 bg-slate-800 px-3 py-2 text-sm" value={selectedExamId} onChange={(e) => setSelectedExamId(e.target.value)}>
            <option value="">Select exam</option>
            {exams.map((exam) => (
              <option key={exam.id} value={exam.id}>{exam.name}</option>
            ))}
          </select>
          <button onClick={autoGenerate} className="rounded-elem bg-primary px-3 py-2 text-sm font-semibold">Auto-generate sprints</button>
          <button onClick={autoGenerate} className="rounded-elem border border-white/20 px-3 py-2 text-sm">Regenerate Plan</button>
        </div>
      </header>

      {!selectedExam ? (
        <div className="glass-card p-8 text-center text-muted">Select an exam to view its sprint plan</div>
      ) : blocks.length === 0 ? (
        <div className="glass-card p-8 text-center text-muted">No sprint blocks generated yet. Use Auto-generate sprints.</div>
      ) : (
        <DndContext onDragEnd={onDragEnd}>
          <TimelineView blocks={blocks} topicMap={topicMap} />
        </DndContext>
      )}
    </section>
  );
}
