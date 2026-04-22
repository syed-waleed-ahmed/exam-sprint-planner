export default function VelocityScore({ score }) {
  const color = score > 0.7 ? 'text-success' : score >= 0.3 ? 'text-warning' : 'text-danger';
  const message = score > 0.7 ? "You're on track" : score >= 0.3 ? 'You need to pick up pace' : 'High risk';
  return (
    <div className="glass-card p-4">
      <p className="text-sm text-muted">Velocity score</p>
      <p className={`mt-1 text-2xl font-bold ${color}`}>{score.toFixed(2)}</p>
      <p className="mt-1 text-xs text-muted">{message}</p>
    </div>
  );
}
