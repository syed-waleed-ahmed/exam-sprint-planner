import { useState } from 'react';
import DaysRemaining from '../shared/DaysRemaining';
import ReadinessBar from '../shared/ReadinessBar';
import TopicRow from './TopicRow';
import { sanitizeTextInput } from '../../utils/security';

const cycleStatus = {
  not_started: 'in_progress',
  in_progress: 'revised',
  revised: 'confident',
  confident: 'not_started',
};

export default function ExamCard({ exam, expanded, onToggle, onDeleteExam, addTopic, deleteTopic, updateTopic, setTopicStatus, onStudyTopic }) {
  const [topicName, setTopicName] = useState('');
  const [difficulty, setDifficulty] = useState(2);
  const [topicImportance, setTopicImportance] = useState(Math.max(1, Math.min(5, exam.importanceLevel || 3)));
  const [topicNameError, setTopicNameError] = useState('');
  const [confirmDeleteExam, setConfirmDeleteExam] = useState(false);
  const [topicToDelete, setTopicToDelete] = useState(null);
  const [editTopicDraft, setEditTopicDraft] = useState(null);

  const submitTopicEdit = () => {
    if (!editTopicDraft) return;
    const safeName = sanitizeTextInput(editTopicDraft.name, 120);
    if (!safeName) {
      setEditTopicDraft((prev) => ({ ...prev, error: 'Topic name is required.' }));
      return;
    }
    updateTopic(exam.id, editTopicDraft.topicId, {
      name: safeName,
      difficulty: Math.max(1, Math.min(3, Number(editTopicDraft.difficulty || 2))),
      importanceLevel: Math.max(1, Math.min(5, Number(editTopicDraft.importanceLevel || 3))),
    });
    setEditTopicDraft(null);
  };

  return (
    <article className="glass-card p-4">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h3 className="text-lg font-semibold">{exam.name}</h3>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
            <span className="rounded-full bg-secondary/20 px-2 py-1 text-secondary">{exam.subject}</span>
            <span className="text-muted">{exam.topics.length} topics</span>
            <DaysRemaining examDate={exam.examDate} />
          </div>
          <div className="mt-2 flex text-warning">{Array.from({ length: exam.importanceLevel }).map((_, i) => <span key={i}>★</span>)}</div>
        </div>
        <div className="w-full xl:max-w-xs">
          <ReadinessBar value={exam.readiness || 0} />
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <button className="btn-ghost" onClick={() => onToggle(exam.id)}>{expanded ? 'Close' : 'Open'}</button>
          <button className="btn-base bg-danger/20 text-danger hover:bg-danger/25" onClick={() => setConfirmDeleteExam(true)}>Delete</button>
        </div>
      </div>

      {confirmDeleteExam && (
        <div className="mt-3 rounded-elem border border-danger/40 bg-danger/10 p-3">
          <p className="text-sm">Delete this exam and all topics?</p>
          <div className="mt-2 flex gap-2">
            <button className="rounded-elem border border-white/20 px-3 py-2 text-sm" onClick={() => setConfirmDeleteExam(false)}>Cancel</button>
            <button
              className="rounded-elem bg-danger px-3 py-2 text-sm"
              onClick={() => {
                onDeleteExam(exam.id);
                setConfirmDeleteExam(false);
              }}
            >
              Yes, delete exam
            </button>
          </div>
        </div>
      )}

      {expanded && (
        <div className="mt-4 space-y-3">
          {exam.topics.map((topic) => (
            <TopicRow
              key={topic.id}
              exam={exam}
              topic={topic}
              onEdit={(_, topicId) => {
                setEditTopicDraft({
                  topicId,
                  name: topic.name,
                  difficulty: Math.max(1, Math.min(3, topic.difficulty || 2)),
                  importanceLevel: Math.max(1, Math.min(5, topic.importanceLevel || exam.importanceLevel || 3)),
                  error: '',
                });
              }}
              onDelete={(_, topicId) => setTopicToDelete(topicId)}
              onStudy={(xExam, xTopic) =>
                onStudyTopic({ ...xTopic, examId: xExam.id, examName: xExam.name, subject: xExam.subject, examDate: xExam.examDate })
              }
              onStatusChange={(examId, topicId) => {
                const current = exam.topics.find((x) => x.id === topicId)?.status || 'not_started';
                setTopicStatus(examId, topicId, cycleStatus[current]);
              }}
            />
          ))}

          <div className="grid gap-2 rounded-elem border border-dashed border-white/20 p-3 sm:grid-cols-2 xl:grid-cols-5">
            <input
              className="input-base sm:col-span-2 xl:col-span-2"
              placeholder="Add topic"
              value={topicName}
              onChange={(e) => {
                setTopicName(e.target.value);
                if (topicNameError) setTopicNameError('');
              }}
            />
            <select className="input-base" value={difficulty} onChange={(e) => setDifficulty(Number(e.target.value))}>
              <option value={1}>Easy</option>
              <option value={2}>Medium</option>
              <option value={3}>Hard</option>
            </select>
            <select className="input-base" value={topicImportance} onChange={(e) => setTopicImportance(Number(e.target.value))}>
              <option value={1}>Low priority</option>
              <option value={2}>Priority 2</option>
              <option value={3}>Priority 3</option>
              <option value={4}>Priority 4</option>
              <option value={5}>High priority</option>
            </select>
            <button
              className="btn-primary"
              onClick={() => {
                const safeName = sanitizeTextInput(topicName, 120);
                if (!safeName) {
                  setTopicNameError('Topic name is required.');
                  return;
                }
                addTopic(exam.id, safeName, difficulty, topicImportance);
                setTopicName('');
                setTopicNameError('');
              }}
            >
              Add Topic
            </button>
          </div>
          {topicNameError && <p className="text-xs text-danger">{topicNameError}</p>}

          {editTopicDraft && (
            <div className="rounded-elem border border-white/20 bg-slate-900/70 p-3">
              <p className="text-sm font-semibold">Edit topic</p>
              <div className="mt-2 grid gap-2 lg:grid-cols-4">
                <input
                  className="input-base lg:col-span-2"
                  value={editTopicDraft.name}
                  onChange={(e) => setEditTopicDraft((prev) => ({ ...prev, name: e.target.value, error: '' }))}
                />
                <select
                  className="input-base"
                  value={editTopicDraft.difficulty}
                  onChange={(e) => setEditTopicDraft((prev) => ({ ...prev, difficulty: Number(e.target.value), error: '' }))}
                >
                  <option value={1}>Easy</option>
                  <option value={2}>Medium</option>
                  <option value={3}>Hard</option>
                </select>
                <div className="rounded-elem border border-white/10 px-2 py-2">
                  <p className="text-xs text-muted">Priority</p>
                  <div className="mt-1 flex gap-1">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        className={`rounded px-1 text-base ${n <= editTopicDraft.importanceLevel ? 'text-warning' : 'text-slate-600'}`}
                        onClick={() => setEditTopicDraft((prev) => ({ ...prev, importanceLevel: n, error: '' }))}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2 lg:col-span-4 lg:justify-end">
                  <button className="rounded-elem border border-white/20 px-3 py-2 text-sm" onClick={() => setEditTopicDraft(null)}>Cancel</button>
                  <button className="rounded-elem bg-primary px-3 py-2 text-sm" onClick={submitTopicEdit}>Save</button>
                </div>
              </div>
              {editTopicDraft.error && <p className="mt-2 text-xs text-danger">{editTopicDraft.error}</p>}
            </div>
          )}

          {topicToDelete && (
            <div className="rounded-elem border border-danger/40 bg-danger/10 p-3">
              <p className="text-sm">Delete this topic?</p>
              <div className="mt-2 flex gap-2">
                <button className="rounded-elem border border-white/20 px-3 py-2 text-sm" onClick={() => setTopicToDelete(null)}>Cancel</button>
                <button
                  className="rounded-elem bg-danger px-3 py-2 text-sm"
                  onClick={() => {
                    deleteTopic(exam.id, topicToDelete);
                    setTopicToDelete(null);
                  }}
                >
                  Yes, delete topic
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </article>
  );
}
