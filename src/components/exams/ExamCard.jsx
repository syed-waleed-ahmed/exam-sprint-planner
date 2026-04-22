import { useState } from 'react';
import DaysRemaining from '../shared/DaysRemaining';
import ReadinessBar from '../shared/ReadinessBar';
import TopicRow from './TopicRow';

const cycleStatus = {
  not_started: 'in_progress',
  in_progress: 'revised',
  revised: 'confident',
  confident: 'not_started',
};

export default function ExamCard({ exam, expanded, onToggle, onDeleteExam, addTopic, deleteTopic, updateTopic, setTopicStatus, onStudyTopic }) {
  const [topicName, setTopicName] = useState('');
  const [difficulty, setDifficulty] = useState(2);

  return (
    <article className="glass-card p-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="text-lg font-semibold">{exam.name}</h3>
          <div className="mt-1 flex items-center gap-2 text-xs">
            <span className="rounded-full bg-secondary/20 px-2 py-1 text-secondary">{exam.subject}</span>
            <span className="text-muted">{exam.topics.length} topics</span>
            <DaysRemaining examDate={exam.examDate} />
          </div>
          <div className="mt-2 flex text-warning">{Array.from({ length: exam.importanceLevel }).map((_, i) => <span key={i}>★</span>)}</div>
        </div>
        <div className="w-full max-w-xs">
          <ReadinessBar value={exam.readiness || 0} />
        </div>
        <div className="flex gap-2">
          <button className="rounded-elem border border-white/20 px-3 py-2 text-sm" onClick={() => onToggle(exam.id)}>{expanded ? 'Close' : 'Open'}</button>
          <button className="rounded-elem bg-danger/20 px-3 py-2 text-sm text-danger" onClick={() => onDeleteExam(exam.id)}>Delete</button>
        </div>
      </div>

      {expanded && (
        <div className="mt-4 space-y-3">
          {exam.topics.map((topic) => (
            <TopicRow
              key={topic.id}
              exam={exam}
              topic={topic}
              onEdit={(examId, topicId) => {
                const nextName = prompt('Edit topic name', topic.name);
                if (!nextName) return;
                updateTopic(examId, topicId, { name: nextName });
              }}
              onDelete={deleteTopic}
              onStudy={(xExam, xTopic) =>
                onStudyTopic({ ...xTopic, examId: xExam.id, examName: xExam.name, subject: xExam.subject, examDate: xExam.examDate })
              }
              onStatusChange={(examId, topicId) => {
                const current = exam.topics.find((x) => x.id === topicId)?.status || 'not_started';
                setTopicStatus(examId, topicId, cycleStatus[current]);
              }}
            />
          ))}

          <div className="grid gap-2 rounded-elem border border-dashed border-white/20 p-3 md:grid-cols-4">
            <input className="rounded-elem border border-white/10 bg-slate-800 px-3 py-2 text-sm md:col-span-2" placeholder="Add topic" value={topicName} onChange={(e) => setTopicName(e.target.value)} />
            <select className="rounded-elem border border-white/10 bg-slate-800 px-3 py-2 text-sm" value={difficulty} onChange={(e) => setDifficulty(Number(e.target.value))}>
              <option value={1}>Easy</option>
              <option value={2}>Medium</option>
              <option value={3}>Hard</option>
            </select>
            <button
              className="rounded-elem bg-primary px-3 py-2 text-sm font-semibold"
              onClick={() => {
                if (!topicName.trim()) return;
                addTopic(exam.id, topicName.trim(), difficulty);
                setTopicName('');
              }}
            >
              Add Topic
            </button>
          </div>
        </div>
      )}
    </article>
  );
}
