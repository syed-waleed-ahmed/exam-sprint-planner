const labels = {
  not_started: 'Not Started',
  in_progress: 'In Progress',
  revised: 'Revised',
  confident: 'Confident',
};

const colors = {
  not_started: 'bg-slate-600/50 text-slate-200',
  in_progress: 'bg-warning/20 text-warning',
  revised: 'bg-secondary/20 text-secondary',
  confident: 'bg-success/20 text-success',
};

export default function ConfidencePill({ status, onClick, compact = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3 py-1 text-xs font-medium ${colors[status] || colors.not_started} ${
        onClick ? 'hover:scale-105' : ''
      } ${compact ? 'px-2 py-0.5' : ''}`}
    >
      {labels[status] || labels.not_started}
    </button>
  );
}
