import { useEffect, useState } from 'react';
import { marked } from 'marked';
import { daysUntil } from '../../utils/dateHelpers';
import { useAI } from '../../hooks/useAI';
import LoadingSkeleton from '../shared/LoadingSkeleton';

export default function ExplainTab({ topic, onSave, onSetStatus, missingKey }) {
  const { requestText } = useAI();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const generate = async () => {
    setLoading(true);
    setError('');
    try {
      const prompt = `Explain '${topic.name}' for a ${topic.subject} student preparing for an exam in ${Math.max(daysUntil(topic.examDate), 1)} days. Include: 1) Core concept (2-3 sentences), 2) Key points to remember (bullet list), 3) Common exam pitfalls, 4) One memorable analogy. Format with clear sections.`;
      const text = await requestText(prompt);
      onSave('summary', text);
    } catch (e) {
      setError(e instanceof Error ? e.message : JSON.stringify(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!topic.aiContent?.summary && !missingKey) {
      generate();
    }
  }, [topic.id]);

  if (missingKey) return <div className="rounded-elem border border-warning/40 bg-warning/10 p-3 text-sm text-warning">Add your AI API key in Settings -&gt;</div>;

  if (loading) return <LoadingSkeleton lines={7} />;
  if (error) return <div className="rounded-elem border border-danger/50 bg-danger/10 p-3 text-sm text-danger">{error}</div>;

  return (
    <div className="space-y-3">
      <button className="rounded-elem border border-white/20 px-3 py-2 text-sm" onClick={generate}>Regenerate Explanation</button>
      <article className="prose prose-invert max-w-none rounded-card border border-white/10 bg-slate-900/30 p-4 text-sm" dangerouslySetInnerHTML={{ __html: marked.parse(topic.aiContent?.summary || '') }} />
      <div>
        <p className="mb-2 text-sm text-muted">How well do you understand this now?</p>
        <div className="flex flex-wrap gap-2">
          {[
            ['not_started', 'Not Yet'],
            ['in_progress', 'Getting There'],
            ['revised', 'Pretty Good'],
            ['confident', 'Confident'],
          ].map(([value, label]) => (
            <button key={value} className="rounded-full border border-white/20 px-3 py-1 text-xs" onClick={() => onSetStatus(value)}>{label}</button>
          ))}
        </div>
      </div>
    </div>
  );
}
