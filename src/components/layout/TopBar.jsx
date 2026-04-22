import { Menu, Plus, Timer } from 'lucide-react';

export default function TopBar({ onToggleNav, onOpenAddExam, onOpenTimer, activeTopicName }) {
  return (
    <header className="sticky top-0 z-20 flex items-center justify-between border-b border-white/10 bg-navy/80 px-4 py-3 backdrop-blur md:px-6">
      <button className="rounded-elem border border-white/10 p-2 text-muted md:hidden" onClick={onToggleNav}>
        <Menu className="h-4 w-4" />
      </button>
      <div className="hidden md:block">
        <p className="text-sm text-muted">Focused prep, active revision, AI guided sessions.</p>
      </div>
      <div className="flex items-center gap-2">
        <button onClick={onOpenTimer} className="rounded-elem border border-secondary/30 bg-secondary/10 px-3 py-2 text-xs font-semibold text-secondary">
          <span className="inline-flex items-center gap-1">
            <Timer className="h-4 w-4" />
            {activeTopicName ? `Focus: ${activeTopicName}` : 'Focus Timer'}
          </span>
        </button>
        <button onClick={onOpenAddExam} className="rounded-elem bg-primary px-3 py-2 text-xs font-semibold text-white hover:brightness-110">
          <span className="inline-flex items-center gap-1">
            <Plus className="h-4 w-4" /> Add Exam
          </span>
        </button>
      </div>
    </header>
  );
}
