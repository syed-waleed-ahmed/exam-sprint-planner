import { format } from 'date-fns';
import ConfidencePill from '../shared/ConfidencePill';

export default function TodaysSprint({ items, onStudyTopic, onMarkReviewed }) {
  return (
    <section id="todays-focus" className="glass-card p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold">Today's Focus</h2>
          <p className="text-sm text-muted">{format(new Date(), 'EEEE, MMM d')}</p>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="rounded-elem border border-dashed border-white/20 p-6 text-center text-muted">
          <svg className="mx-auto mb-3 h-12 w-12 text-secondary" viewBox="0 0 24 24" fill="none">
            <path d="M4 12h16M12 4v16" stroke="currentColor" strokeWidth="1.5" />
          </svg>
          Add exams and topics to generate your sprint recommendations.
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <article key={item.topic.id} className="flex flex-col gap-3 rounded-elem border border-white/10 bg-slate-800/60 p-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="font-semibold">{item.topic.name}</h3>
                <p className="mt-1 inline-block rounded-full bg-primary/20 px-2 py-1 text-xs text-primary">{item.examName}</p>
              </div>
              <div className="flex items-center gap-2">
                <ConfidencePill status={item.topic.status} compact />
                <button className="rounded-elem bg-secondary/20 px-3 py-1 text-xs font-semibold text-secondary" onClick={() => onStudyTopic(item)}>
                  Study with AI -&gt;
                </button>
                <button className="rounded-elem bg-success/20 px-3 py-1 text-xs font-semibold text-success" onClick={() => onMarkReviewed(item.examId, item.topic.id)}>
                  Mark Reviewed
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
