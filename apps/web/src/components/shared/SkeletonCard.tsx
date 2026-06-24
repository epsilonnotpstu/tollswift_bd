export const SkeletonCard = () => <div className="h-24 animate-pulse rounded-app border border-border bg-surface shadow-sm" />;

export const SkeletonList = ({ count = 4 }: { count?: number }) => (
  <div className="space-y-3">
    {Array.from({ length: count }).map((_, index) => (
      <SkeletonCard key={index} />
    ))}
  </div>
);

