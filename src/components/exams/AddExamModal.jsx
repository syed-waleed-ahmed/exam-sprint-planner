import { useState } from 'react';

const subjects = ['Math', 'Science', 'History', 'Language', 'CS', 'Other'];

export default function AddExamModal({ onClose, onSubmit }) {
  const [name, setName] = useState('');
  const [subject, setSubject] = useState(subjects[0]);
  const [examDate, setExamDate] = useState('');
  const [importanceLevel, setImportanceLevel] = useState(3);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div className="glass-card w-full max-w-md p-5" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-bold">Add Exam</h3>
        <div className="mt-4 space-y-3">
          <input className="w-full rounded-elem border border-white/10 bg-slate-800 px-3 py-2" placeholder="Exam name" value={name} onChange={(e) => setName(e.target.value)} />
          <select className="w-full rounded-elem border border-white/10 bg-slate-800 px-3 py-2" value={subject} onChange={(e) => setSubject(e.target.value)}>
            {subjects.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <input className="w-full rounded-elem border border-white/10 bg-slate-800 px-3 py-2" type="date" value={examDate} onChange={(e) => setExamDate(e.target.value)} />
          <div>
            <p className="mb-2 text-sm text-muted">Importance</p>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} className={`rounded-elem px-2 py-1 text-lg ${n <= importanceLevel ? 'text-warning' : 'text-slate-600'}`} onClick={() => setImportanceLevel(n)}>
                  ★
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button className="rounded-elem border border-white/20 px-3 py-2 text-sm" onClick={onClose}>Cancel</button>
          <button
            className="rounded-elem bg-primary px-3 py-2 text-sm font-semibold"
            onClick={() => {
              if (!name || !examDate) return;
              onSubmit({ name, subject, examDate, importanceLevel });
            }}
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
