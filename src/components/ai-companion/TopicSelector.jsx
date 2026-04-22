import { useMemo } from 'react';

export default function TopicSelector({ exams, activeTopic, onSelect, query, onQuery }) {
  const filtered = useMemo(() => {
    if (!query.trim()) return exams;
    const lower = query.toLowerCase();
    return exams
      .map((exam) => ({
        ...exam,
        topics: exam.topics.filter((topic) => topic.name.toLowerCase().includes(lower)),
      }))
      .filter((exam) => exam.topics.length > 0);
  }, [exams, query]);

  return (
    <div className="glass-card p-4">
      <input
        id="topic-search"
        className="w-full rounded-elem border border-white/10 bg-slate-800 px-3 py-2 text-sm"
        placeholder="Search topics..."
        value={query}
        onChange={(e) => onQuery(e.target.value)}
      />
      <div className="mt-3 max-h-[70vh] space-y-3 overflow-y-auto pr-1">
        {filtered.map((exam) => (
          <details key={exam.id} open className="rounded-elem border border-white/10 bg-slate-800/50 p-2">
            <summary className="cursor-pointer text-sm font-semibold">{exam.name}</summary>
            <div className="mt-2 space-y-1">
              {exam.topics.map((topic) => {
                const isActive = activeTopic?.id === topic.id;
                return (
                  <button
                    key={topic.id}
                    onClick={() => onSelect({ ...topic, examId: exam.id, examName: exam.name, subject: exam.subject, examDate: exam.examDate })}
                    className={`w-full rounded-elem px-2 py-2 text-left text-xs ${isActive ? 'bg-primary/30 text-text' : 'hover:bg-slate-700/60 text-muted'}`}
                  >
                    {topic.name}
                  </button>
                );
              })}
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}
