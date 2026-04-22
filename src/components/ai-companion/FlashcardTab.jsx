import { useMemo, useState } from 'react';
import { useAI } from '../../hooks/useAI';
import LoadingSkeleton from '../shared/LoadingSkeleton';

export default function FlashcardTab({ topic, onSave, missingKey }) {
  const { requestJson } = useAI();
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const cards = useMemo(() => topic.aiContent?.flashcards || [], [topic.aiContent]);

  const generate = async () => {
    setLoading(true);
    setError('');
    try {
      const prompt = `Generate 8 flashcards for the topic '${topic.name}' in ${topic.subject}. Return ONLY valid JSON array: [{"front": string, "back": string}]. Make fronts concise questions/terms, backs thorough but scannable answers.`;
      const data = await requestJson(prompt);
      onSave('flashcards', data);
      setIndex(0);
      setFlipped(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : JSON.stringify(e));
    } finally {
      setLoading(false);
    }
  };

  if (missingKey) return <div className="rounded-elem border border-warning/40 bg-warning/10 p-3 text-sm text-warning">Add your AI API key in Settings -&gt;</div>;

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <button className="rounded-elem bg-secondary/20 px-3 py-2 text-sm font-semibold text-secondary" onClick={generate}>
          {cards.length ? 'Regenerate' : 'Generate Flashcards'}
        </button>
      </div>
      {loading ? (
        <LoadingSkeleton lines={6} />
      ) : error ? (
        <div className="rounded-elem border border-danger/50 bg-danger/10 p-3 text-sm text-danger">{error}</div>
      ) : cards.length === 0 ? (
        <p className="text-sm text-muted">No flashcards yet. Generate a deck.</p>
      ) : (
        <div className="space-y-3">
          <div className="flip-card" onClick={() => setFlipped((v) => !v)}>
            <div className={`flip-card-inner h-56 cursor-pointer rounded-card border border-white/10 ${flipped ? 'flipped' : ''}`}>
              <div className="flip-card-face absolute inset-0 rounded-card bg-slate-800 p-4">
                <p className="text-xs text-muted">Front</p>
                <p className="mt-4 text-lg font-semibold">{cards[index].front}</p>
              </div>
              <div className="flip-card-face flip-card-back absolute inset-0 rounded-card bg-primary/20 p-4">
                <p className="text-xs text-muted">Back</p>
                <p className="mt-4 text-sm leading-relaxed">{cards[index].back}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <button className="rounded-elem border border-white/20 px-3 py-2 text-sm" onClick={() => { setIndex((v) => Math.max(v - 1, 0)); setFlipped(false); }}>Previous</button>
            <p className="text-sm text-muted">{index + 1} of {cards.length}</p>
            <button className="rounded-elem border border-white/20 px-3 py-2 text-sm" onClick={() => { setIndex((v) => Math.min(v + 1, cards.length - 1)); setFlipped(false); }}>Next</button>
          </div>
          <details className="rounded-elem border border-white/10 bg-slate-900/40 p-3">
            <summary className="cursor-pointer text-sm text-muted">Raw JSON output</summary>
            <pre className="mt-2 max-h-48 overflow-auto text-xs text-slate-300">{JSON.stringify(cards, null, 2)}</pre>
          </details>
        </div>
      )}
    </div>
  );
}
