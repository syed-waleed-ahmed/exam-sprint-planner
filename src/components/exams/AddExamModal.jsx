import { useState } from 'react';
import { sanitizeTextInput } from '../../utils/security';

const subjects = ['Math', 'Science', 'History', 'Language', 'CS', 'Other'];

export default function AddExamModal({ onClose, onSubmit }) {
  const [name, setName] = useState('');
  const [subject, setSubject] = useState(subjects[0]);
  const [examDate, setExamDate] = useState('');
  const [importanceLevel, setImportanceLevel] = useState(3);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-3 sm:p-4" onClick={onClose}>
      <div className="glass-card max-h-[90vh] w-full max-w-lg overflow-y-auto p-4 sm:p-5" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-bold">Add Exam</h3>
        <div className="mt-4 space-y-3">
          <input className="input-base w-full" placeholder="Exam name" value={name} onChange={(e) => setName(e.target.value)} />
          <select className="input-base w-full" value={subject} onChange={(e) => setSubject(e.target.value)}>
            {subjects.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <input className="input-base w-full" type="date" value={examDate} onChange={(e) => setExamDate(e.target.value)} />
          <div>
            <p className="mb-2 text-sm text-muted">Importance</p>
            <div className="flex flex-wrap gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} className={`rounded-elem px-2 py-1 text-lg ${n <= importanceLevel ? 'bg-warning/15 text-warning' : 'text-slate-600'}`} onClick={() => setImportanceLevel(n)}>
                  ★
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button className="btn-ghost" onClick={onClose}>Cancel</button>
          <button
            className="btn-primary"
            onClick={() => {
              const nextName = sanitizeTextInput(name, 120);
              if (!nextName || !examDate) return;
              onSubmit({ name: nextName, subject: sanitizeTextInput(subject, 80), examDate, importanceLevel });
            }}
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
