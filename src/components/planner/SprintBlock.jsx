import { useDroppable } from '@dnd-kit/core';
import { blockStats } from '../../utils/sprintGenerator';

export default function SprintBlock({ block, topicMap, children }) {
  const { setNodeRef, isOver } = useDroppable({ id: block.id });
  const stats = blockStats(block, topicMap);
  const live = block.live;

  return (
    <div ref={setNodeRef} className={`min-w-[280px] snap-start rounded-card border p-3 sm:min-w-[320px] ${isOver ? 'border-secondary bg-secondary/10' : 'border-white/10 bg-slate-800/40'}`}>
      <h4 className="font-semibold">{block.label}</h4>
      <div className="mt-2 space-y-2">{children}</div>
      <div className="mt-3 text-xs text-muted">
        <p>Estimated study hours: <span className="text-text">{stats.hours.toFixed(1)}h</span></p>
        {live && (
          <p className="mt-1">
            Live remaining: <span className="text-text">{live.adjustedRemainingHours.toFixed(1)}h</span>
            {live.carryoverHours > 0 ? ` (includes ${live.carryoverHours.toFixed(1)}h carried over)` : ''}
          </p>
        )}
        {live && live.daysLeft > 0 && (
          <p className="mt-1">
            Suggested pace: <span className="text-secondary">{live.dailyMinutesTarget} min/day</span> for this block
          </p>
        )}
        <div className="mt-1 h-1.5 w-full rounded-full bg-slate-700">
          <div className="h-1.5 rounded-full bg-primary" style={{ width: `${stats.readiness}%` }} />
        </div>
        <p className="mt-1">Block readiness: {stats.readiness}%</p>
      </div>
    </div>
  );
}
