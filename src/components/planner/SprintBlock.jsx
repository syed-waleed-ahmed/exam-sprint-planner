import { useDroppable } from '@dnd-kit/core';
import { blockStats } from '../../utils/sprintGenerator';

export default function SprintBlock({ block, topicMap, children }) {
  const { setNodeRef, isOver } = useDroppable({ id: block.id });
  const stats = blockStats(block, topicMap);

  return (
    <div ref={setNodeRef} className={`min-w-[260px] rounded-card border p-3 ${isOver ? 'border-secondary bg-secondary/10' : 'border-white/10 bg-slate-800/40'}`}>
      <h4 className="font-semibold">{block.label}</h4>
      <div className="mt-2 space-y-2">{children}</div>
      <div className="mt-3 text-xs text-muted">
        <p>Estimated study hours: <span className="text-text">{stats.hours.toFixed(1)}h</span></p>
        <div className="mt-1 h-1.5 w-full rounded-full bg-slate-700">
          <div className="h-1.5 rounded-full bg-primary" style={{ width: `${stats.readiness}%` }} />
        </div>
        <p className="mt-1">Block readiness: {stats.readiness}%</p>
      </div>
    </div>
  );
}
