import { Pencil, Trash2 } from 'lucide-react';
import ConfidencePill from '../shared/ConfidencePill';
import { formatDate } from '../../utils/dateHelpers';

const diffMap = {
  1: { label: 'Easy', cls: 'bg-success/20 text-success' },
  2: { label: 'Medium', cls: 'bg-warning/20 text-warning' },
  3: { label: 'Hard', cls: 'bg-danger/20 text-danger' },
};

export default function TopicRow({ exam, topic, onEdit, onDelete, onStudy, onStatusChange }) {
  const diff = diffMap[topic.difficulty] || diffMap[2];
  const topicImportance = Math.max(1, Math.min(5, topic.importanceLevel || 3));

  return (
    <div className="grid grid-cols-1 gap-3 rounded-elem border border-white/10 bg-slate-800/40 p-3 lg:grid-cols-[minmax(0,2fr)_auto_auto_auto_auto_auto_auto] lg:items-center">
      <p className="font-medium">{topic.name}</p>
      <span className={`inline-block w-fit rounded-full px-2 py-1 text-xs ${diff.cls}`}>{diff.label}</span>
      <span className="inline-block w-fit rounded-full bg-warning/20 px-2 py-1 text-xs text-warning">{'★'.repeat(topicImportance)}</span>
      <ConfidencePill status={topic.status} onClick={() => onStatusChange(exam.id, topic.id)} />
      <p className="text-xs text-muted">{topic.lastReviewed ? formatDate(topic.lastReviewed) : 'Not reviewed'}</p>
      <button className="btn-secondary w-full sm:w-fit" onClick={() => onStudy(exam, topic)}>
        Study with AI
      </button>
      <div className="flex items-center gap-2 lg:justify-end">
        <button className="rounded-elem p-2 hover:bg-white/10" onClick={() => onEdit(exam.id, topic.id)}><Pencil className="h-4 w-4" /></button>
        <button className="rounded-elem p-2 text-danger hover:bg-danger/20" onClick={() => onDelete(exam.id, topic.id)}><Trash2 className="h-4 w-4" /></button>
      </div>
    </div>
  );
}
