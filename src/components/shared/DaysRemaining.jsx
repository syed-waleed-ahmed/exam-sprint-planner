import { daysUntil } from '../../utils/dateHelpers';

export default function DaysRemaining({ examDate }) {
  const days = daysUntil(examDate);
  let styles = 'bg-success/15 text-success';
  if (days <= 3) styles = 'bg-danger/20 text-danger';
  else if (days <= 10) styles = 'bg-warning/20 text-warning';

  return <span className={`rounded-full px-2 py-1 text-xs font-semibold ${styles}`}>{days >= 0 ? `${days} days left` : 'Completed'}</span>;
}
