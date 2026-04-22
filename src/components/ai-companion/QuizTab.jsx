import { useMemo, useState } from 'react';
import { useAI } from '../../hooks/useAI';
import LoadingSkeleton from '../shared/LoadingSkeleton';

const statusByScore = (score) => {
  if (score === 5) return 'confident';
  if (score >= 3) return 'revised';
  if (score >= 1) return 'in_progress';
  return 'not_started';
};

export default function QuizTab({ topic, onSave, onUpdateStatusFromQuiz, onLogQuiz, missingKey }) {
  const { requestJson } = useAI();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({});

  const quiz = useMemo(() => topic.aiContent?.quiz || [], [topic.aiContent]);
  const current = quiz[currentIdx];

  const generate = async () => {
    setLoading(true);
    setError('');
    try {
      const diff = topic.difficulty === 3 ? 'hard' : topic.difficulty === 2 ? 'medium' : 'easy';
      const prompt = `Generate 5 multiple choice questions for '${topic.name}' in ${topic.subject} at ${diff} level. Return ONLY valid JSON array: [{"question": string, "options": [string, string, string, string], "correctIndex": 0, "explanation": string}]`;
      const data = await requestJson(prompt);
      onSave('quiz', data);
      setCurrentIdx(0);
      setAnswers({});
    } catch (e) {
      setError(e instanceof Error ? e.message : JSON.stringify(e));
    } finally {
      setLoading(false);
    }
  };

  if (missingKey) return <div className="rounded-elem border border-warning/40 bg-warning/10 p-3 text-sm text-warning">Add your AI API key in Settings -&gt;</div>;

  if (loading) return <LoadingSkeleton lines={7} />;

  if (error) return <div className="rounded-elem border border-danger/50 bg-danger/10 p-3 text-sm text-danger">{error}</div>;

  if (quiz.length === 0) {
    return <button className="rounded-elem bg-secondary/20 px-3 py-2 text-sm font-semibold text-secondary" onClick={generate}>Generate Quiz</button>;
  }

  const answeredAll = Object.keys(answers).length === quiz.length;
  const score = quiz.reduce((sum, q, idx) => sum + (answers[idx] === q.correctIndex ? 1 : 0), 0);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <button className="rounded-elem border border-white/20 px-3 py-2 text-sm" onClick={generate}>Regenerate</button>
        <div className="h-2 w-40 rounded-full bg-slate-700">
          <div className="h-2 rounded-full bg-primary" style={{ width: `${((currentIdx + 1) / quiz.length) * 100}%` }} />
        </div>
      </div>

      {!answeredAll ? (
        <div className="rounded-card border border-white/10 bg-slate-800/50 p-4">
          <p className="text-sm text-muted">Question {currentIdx + 1} of {quiz.length}</p>
          <h4 className="mt-2 font-semibold">{current.question}</h4>
          <div className="mt-3 space-y-2">
            {current.options.map((opt, idx) => {
              const picked = answers[currentIdx] === idx;
              const reveal = answers[currentIdx] !== undefined;
              const isCorrect = idx === current.correctIndex;
              let cls = 'border-white/20';
              if (reveal && isCorrect) cls = 'border-success bg-success/10';
              if (reveal && picked && !isCorrect) cls = 'border-danger bg-danger/10';
              return (
                <button key={idx} className={`w-full rounded-elem border px-3 py-2 text-left text-sm ${cls}`} onClick={() => setAnswers((prev) => ({ ...prev, [currentIdx]: idx }))}>
                  {opt}
                </button>
              );
            })}
          </div>
          {answers[currentIdx] !== undefined && <p className="mt-2 text-xs text-muted">{current.explanation}</p>}
          <div className="mt-3 flex justify-end">
            <button className="rounded-elem bg-primary px-3 py-2 text-sm" onClick={() => setCurrentIdx((v) => Math.min(v + 1, quiz.length - 1))}>
              Next
            </button>
          </div>
          <details className="mt-3 rounded-elem border border-white/10 bg-slate-900/40 p-3">
            <summary className="cursor-pointer text-sm text-muted">Raw JSON output</summary>
            <pre className="mt-2 max-h-48 overflow-auto text-xs text-slate-300">{JSON.stringify(quiz, null, 2)}</pre>
          </details>
        </div>
      ) : (
        <div className="rounded-card border border-white/10 bg-slate-800/50 p-4 text-center">
          <h4 className="text-xl font-bold">Score {score}/5</h4>
          <p className="mt-1 text-sm text-muted">{score >= 4 ? 'Excellent momentum.' : score >= 2 ? 'Solid progress, refine weak spots.' : 'Needs another review pass.'}</p>
          <button
            className="mt-3 rounded-elem bg-success/20 px-3 py-2 text-sm font-semibold text-success"
            onClick={() => {
              const status = statusByScore(score);
              onUpdateStatusFromQuiz(status);
              onLogQuiz(score);
            }}
          >
            Update my confidence
          </button>
        </div>
      )}
    </div>
  );
}
