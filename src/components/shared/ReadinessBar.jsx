export default function ReadinessBar({ value }) {
  const color = value > 70 ? 'bg-success' : value > 40 ? 'bg-warning' : 'bg-danger';
  return (
    <div className="w-full">
      <div className="h-2 w-full rounded-full bg-slate-700/60">
        <div className={`h-2 rounded-full ${color}`} style={{ width: `${value}%` }} />
      </div>
      <p className="mt-1 text-right text-xs text-muted">{value}%</p>
    </div>
  );
}
