import DaysRemaining from '../shared/DaysRemaining';
import ReadinessBar from '../shared/ReadinessBar';

export default function ReadinessOverview({ exams }) {
  return (
    <section className="glass-card p-5">
      <h2 className="mb-4 text-lg font-bold">Readiness Overview</h2>
      {exams.length === 0 ? (
        <p className="text-sm text-muted">No exams yet. Add your first exam to see readiness insights.</p>
      ) : (
        <div className="space-y-4">
          {exams.map((exam) => (
            <div key={exam.id} className="rounded-elem border border-white/10 bg-slate-800/50 p-3">
              <div className="mb-2 flex items-center justify-between gap-2">
                <p className="font-semibold">{exam.name}</p>
                <DaysRemaining examDate={exam.examDate} />
              </div>
              <ReadinessBar value={exam.readiness || 0} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
