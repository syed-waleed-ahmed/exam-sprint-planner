import { useMemo, useState } from 'react';
import { useAI } from '../../hooks/useAI';
import LoadingSkeleton from '../shared/LoadingSkeleton';

const statusByScore = (score, total) => {
  const ratio = total ? score / total : 0;
  if (ratio >= 0.85) return 'confident';
  if (ratio >= 0.6) return 'revised';
  if (ratio > 0.2) return 'in_progress';
  return 'not_started';
};

export default function QuizTab({ topic, onSave, onUpdateStatusFromQuiz, onLogQuiz, onLogPerformance, missingKey }) {
  const { requestJson } = useAI();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [mode, setMode] = useState('quiz');

  const quiz = useMemo(
    () => (mode === 'quiz' ? topic.aiContent?.quiz || [] : topic.aiContent?.practiceExam || []),
    [topic.aiContent, mode]
  );
  const current = quiz[currentIdx];

  const generate = async (targetMode) => {
    setLoading(true);
    setError('');
    setMode(targetMode);
    try {
      const diff = topic.difficulty === 3 ? 'hard' : topic.difficulty === 2 ? 'medium' : 'easy';
      const prompt =
        targetMode === 'quiz'
          ? `Generate 5 multiple choice questions for '${topic.name}' in ${topic.subject} at ${diff} level. Return ONLY valid JSON array: [{"question": string, "options": [string, string, string, string], "correctIndex": 0, "explanation": string}]`
          : `Generate a full-length practice exam for '${topic.name}' in ${topic.subject}. Return ONLY valid JSON array with 10 items: [{"question": string, "options": [string, string, string, string], "correctIndex": 0, "explanation": string, "skill": string}]. Questions should feel exam-like, cumulative, and progressively harder.`;
      const data = await requestJson(prompt);
      onSave(targetMode === 'quiz' ? 'quiz' : 'practiceExam', data);
      if (targetMode === 'practiceExam') {
        const followUp = await requestJson(
          `Generate 4 extra exam-like questions on demand for '${topic.name}' in ${topic.subject}. Return ONLY valid JSON array with the same schema.`
        );
        onSave('onDemandQuestions', followUp);
      }
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
    return (
      <div className="flex flex-wrap gap-2">
        <button className="rounded-elem bg-secondary/20 px-3 py-2 text-sm font-semibold text-secondary" onClick={() => generate('quiz')}>Generate Quiz</button>
        <button className="rounded-elem border border-white/20 px-3 py-2 text-sm" onClick={() => generate('practiceExam')}>Generate Practice Exam</button>
      </div>
    );
  }

  const answeredAll = Object.keys(answers).length === quiz.length;
  const score = quiz.reduce((sum, q, idx) => sum + (answers[idx] === q.correctIndex ? 1 : 0), 0);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex gap-2">
          <button className={`rounded-elem px-3 py-2 text-sm ${mode === 'quiz' ? 'bg-primary text-white' : 'border border-white/20'}`} onClick={() => generate('quiz')}>Quiz Mode</button>
          <button className={`rounded-elem px-3 py-2 text-sm ${mode === 'practiceExam' ? 'bg-primary text-white' : 'border border-white/20'}`} onClick={() => generate('practiceExam')}>Practice Exam</button>
        </div>
        <div className="h-2 w-40 rounded-full bg-slate-700">
          <div className="h-2 rounded-full bg-primary" style={{ width: `${((currentIdx + 1) / quiz.length) * 100}%` }} />
        </div>
      </div>

      {!answeredAll ? (
        <div className="rounded-card border border-white/10 bg-slate-800/50 p-4">
          <p className="text-sm text-muted">{mode === 'practiceExam' ? 'Practice exam' : 'Question'} {currentIdx + 1} of {quiz.length}</p>
          {current.skill && <p className="mt-1 text-xs text-secondary">Skill focus: {current.skill}</p>}
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
          {mode === 'practiceExam' && (topic.aiContent?.onDemandQuestions || []).length > 0 && (
            <details className="mt-3 rounded-elem border border-white/10 bg-slate-900/40 p-3">
              <summary className="cursor-pointer text-sm text-muted">On-demand extra questions</summary>
              <div className="mt-2 space-y-2">
                {topic.aiContent.onDemandQuestions.map((question, idx) => (
                  <div key={`${question.question}-${idx}`} className="rounded-elem bg-slate-800/60 p-2">
                    <p className="text-sm font-semibold">{question.question}</p>
                    <p className="mt-1 text-xs text-muted">{question.explanation}</p>
                  </div>
                ))}
              </div>
            </details>
          )}
        </div>
      ) : (
        <div className="rounded-card border border-white/10 bg-slate-800/50 p-4 text-center">
          <h4 className="text-xl font-bold">Score {score}/{quiz.length}</h4>
          <p className="mt-1 text-sm text-muted">
            {mode === 'practiceExam'
              ? score >= Math.ceil(quiz.length * 0.7)
                ? 'You are trending exam-ready on this topic.'
                : 'Use the review schedule below and retest weak skills.'
              : score >= 4
                ? 'Excellent momentum.'
                : score >= 2
                  ? 'Solid progress, refine weak spots.'
                  : 'Needs another review pass.'}
          </p>
          <button
            className="mt-3 rounded-elem bg-success/20 px-3 py-2 text-sm font-semibold text-success"
            onClick={() => {
              const status = statusByScore(score, quiz.length);
              onUpdateStatusFromQuiz(status);
              onLogQuiz(score);
              onLogPerformance(mode === 'practiceExam' ? 'practiceExamScores' : 'quizScores', score);
            }}
          >
            Update my confidence
          </button>
        </div>
      )}
    </div>
  );
}
