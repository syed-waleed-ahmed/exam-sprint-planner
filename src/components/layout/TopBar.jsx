import { Menu, Plus, Timer } from 'lucide-react';

export default function TopBar({ onToggleNav, onOpenAddExam, onOpenTimer, activeTopicName, isOnline, syncMeta }) {
  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-navy/85 px-4 py-3 backdrop-blur md:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
      <button className="rounded-elem border border-white/10 p-2 text-muted md:hidden" onClick={onToggleNav}>
        <Menu className="h-4 w-4" />
      </button>
      <div className="min-w-0 flex-1">
        <p className="text-sm text-muted">Focused prep, active revision, AI guided sessions.</p>
        <p className="text-xs text-muted">{isOnline ? 'Online' : 'Offline'} · {syncMeta?.status || 'idle'}</p>
      </div>
      <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:justify-end">
        <button onClick={onOpenTimer} className="btn-secondary w-full sm:w-auto">
          <span className="inline-flex items-center gap-1">
            <Timer className="h-4 w-4" />
            <span className="truncate">{activeTopicName ? `Focus: ${activeTopicName}` : 'Focus Timer'}</span>
          </span>
        </button>
        <button onClick={onOpenAddExam} className="btn-primary w-full sm:w-auto">
          <span className="inline-flex items-center gap-1">
            <Plus className="h-4 w-4" /> Add Exam
          </span>
        </button>
      </div>
      </div>
    </header>
  );
}
