import { useState } from 'react';
import ExamCard from './ExamCard';

export default function ExamList({ exams, deleteExam, addTopic, deleteTopic, updateTopic, setTopicStatus, onStudyTopic }) {
  const [expandedId, setExpandedId] = useState(null);

  return (
    <section className="space-y-4">
      <header className="section-header">
        <div>
          <h2 className="text-2xl font-bold">My Exams</h2>
          <p className="text-sm text-muted">Track every exam, topic, and confidence level in one place.</p>
        </div>
      </header>

      {exams.length === 0 ? (
        <div className="glass-card p-8 text-center text-muted">
          <svg className="mx-auto mb-3 h-14 w-14 text-primary" viewBox="0 0 24 24" fill="none">
            <path d="M5 4h14v16H5z" stroke="currentColor" strokeWidth="1.5" />
            <path d="M9 8h6M9 12h6M9 16h4" stroke="currentColor" strokeWidth="1.5" />
          </svg>
          No exams yet. Press Add Exam in the top bar or use keyboard shortcut A.
        </div>
      ) : (
        <div className="grid gap-4">
          {exams.map((exam) => (
            <ExamCard
              key={exam.id}
              exam={exam}
              expanded={expandedId === exam.id}
              onToggle={(id) => setExpandedId(expandedId === id ? null : id)}
              onDeleteExam={deleteExam}
              addTopic={addTopic}
              deleteTopic={deleteTopic}
              updateTopic={updateTopic}
              setTopicStatus={setTopicStatus}
              onStudyTopic={onStudyTopic}
            />
          ))}
        </div>
      )}
    </section>
  );
}
