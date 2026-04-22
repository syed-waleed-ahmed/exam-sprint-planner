import { useDraggable } from '@dnd-kit/core';
import SprintBlock from './SprintBlock';

function TopicChip({ topic }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: topic.id });
  const style = transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` } : undefined;

  const diffClass = topic.difficulty === 3 ? 'border-danger/60 text-danger' : topic.difficulty === 2 ? 'border-warning/60 text-warning' : 'border-success/60 text-success';

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`cursor-grab rounded-elem border bg-slate-900 px-2 py-1 text-xs ${diffClass} ${isDragging ? 'opacity-50' : 'opacity-100'}`}
    >
      <span>{topic.name}</span>
      <span className="ml-2 inline-block h-2 w-2 rounded-full bg-primary" />
    </div>
  );
}

export default function TimelineView({ blocks, topicMap }) {
  return (
    <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-3">
      {blocks.map((block) => (
        <SprintBlock key={block.id} block={block} topicMap={topicMap}>
          {block.topics.length === 0 ? (
            <p className="rounded-elem border border-dashed border-white/20 p-2 text-xs text-muted">Drop topics here</p>
          ) : (
            block.topics.map((topicId) => {
              const topic = topicMap[topicId];
              if (!topic) return null;
              return <TopicChip key={topicId} topic={topic} />;
            })
          )}
        </SprintBlock>
      ))}
    </div>
  );
}
