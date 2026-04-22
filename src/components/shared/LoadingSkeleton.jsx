export default function LoadingSkeleton({ lines = 4 }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, idx) => (
        <div key={idx} className="skeleton h-4 w-full" />
      ))}
    </div>
  );
}
