import { useEffect, useMemo, useState } from 'react';
import { marked } from 'marked';
import { daysUntil } from '../../utils/dateHelpers';
import { useAI } from '../../hooks/useAI';
import { getReviewSchedule } from '../../utils/studyInsights';
import { safeMarkdownSource } from '../../utils/security';
import LoadingSkeleton from '../shared/LoadingSkeleton';

const levels = [
  ['quick', 'Quick refresh'],
  ['guided', 'Guided walkthrough'],
  ['exam-ready', 'Exam ready'],
];

export default function ExplainTab({ topic, onSave, onSetStatus, addCustomDefinition, studyLog, userProfile, missingKey }) {
  const { requestText } = useAI();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [level, setLevel] = useState(userProfile.preferredExplanationLevel || 'exam-ready');
  const [definitionForm, setDefinitionForm] = useState({ term: '', note: '' });

  const levelContent = topic.aiContent?.explanationLevels?.[level];
  const reviewSchedule = useMemo(
    () => getReviewSchedule(topic, topic.examDate, studyLog),
    [topic, studyLog]
  );

  const generate = async (targetLevel = level) => {
    setLoading(true);
    setError('');
    try {
      const prompt = `Explain '${topic.name}' for a ${topic.subject} student preparing for an exam in ${Math.max(daysUntil(topic.examDate), 1)} days. Target complexity: ${targetLevel}. Include: 1) Core concept, 2) Key points to remember, 3) Common exam pitfalls, 4) One memorable analogy, 5) What to practice next. Format with clear markdown sections.`;
      const text = await requestText(prompt);
      onSave('summary', text);
      onSave('explanationLevels', {
        ...(topic.aiContent?.explanationLevels || {}),
        [targetLevel]: text,
      });
      onSave('reviewSchedule', reviewSchedule);
    } catch (e) {
      setError(e instanceof Error ? e.message : JSON.stringify(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!levelContent && !missingKey) {
      generate(level);
    }
  }, [topic.id, level]);

  if (missingKey) return <div className="rounded-elem border border-warning/40 bg-warning/10 p-3 text-sm text-warning">Add your AI API key in Settings -&gt;</div>;

  if (loading) return <LoadingSkeleton lines={7} />;
  if (error) return <div className="rounded-elem border border-danger/50 bg-danger/10 p-3 text-sm text-danger">{error}</div>;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {levels.map(([value, label]) => (
          <button
            key={value}
            className={`rounded-full px-3 py-1 text-xs ${level === value ? 'bg-primary text-white' : 'border border-white/20'}`}
            onClick={() => {
              setLevel(value);
              if (!topic.aiContent?.explanationLevels?.[value]) generate(value);
            }}
          >
            {label}
          </button>
        ))}
        <button className="rounded-elem border border-white/20 px-3 py-2 text-sm" onClick={() => generate(level)}>Regenerate Explanation</button>
      </div>
      <article className="prose prose-invert max-w-none rounded-card border border-white/10 bg-slate-900/30 p-4 text-sm" dangerouslySetInnerHTML={{ __html: marked.parse(safeMarkdownSource(levelContent || topic.aiContent?.summary || '')) }} />
      <div className="rounded-elem border border-white/10 bg-slate-900/35 p-4">
        <h4 className="font-semibold">AI-driven review schedule</h4>
        <div className="mt-3 grid gap-2 md:grid-cols-3">
          {(topic.aiContent?.reviewSchedule || reviewSchedule).map((item) => (
            <div key={item.id} className="rounded-elem bg-slate-800/60 p-3">
              <p className="text-sm font-semibold">{item.label}</p>
              <p className="text-xs text-muted">{item.date}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="rounded-elem border border-white/10 bg-slate-900/35 p-4">
        <h4 className="font-semibold">Add your own definition or note</h4>
        <div className="mt-3 grid gap-2 md:grid-cols-[1fr_1.4fr_auto]">
          <input
            className="rounded-elem border border-white/10 bg-slate-800 px-3 py-2 text-sm"
            placeholder="Concept"
            value={definitionForm.term}
            onChange={(e) => setDefinitionForm((prev) => ({ ...prev, term: e.target.value }))}
          />
          <input
            className="rounded-elem border border-white/10 bg-slate-800 px-3 py-2 text-sm"
            placeholder="Clarification"
            value={definitionForm.note}
            onChange={(e) => setDefinitionForm((prev) => ({ ...prev, note: e.target.value }))}
          />
          <button
            className="rounded-elem bg-primary px-3 py-2 text-sm"
            onClick={() => {
              if (!definitionForm.term.trim()) return;
              addCustomDefinition({ term: definitionForm.term.trim(), note: definitionForm.note.trim(), addedAt: new Date().toISOString() });
              setDefinitionForm({ term: '', note: '' });
            }}
          >
            Save
          </button>
        </div>
      </div>
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
