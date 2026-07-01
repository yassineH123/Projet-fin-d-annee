export function SkeletonLine({ w = 'w-full', h = 'h-3' }) {
  return <div className={`${w} ${h} rounded-lg skeleton`} />;
}

export function SkeletonCard({ lines = 3, hasAvatar = false }) {
  return (
    <div className="card flex flex-col gap-4 animate-pulse">
      {hasAvatar && (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full skeleton shrink-0" />
          <div className="flex flex-col gap-2 flex-1">
            <SkeletonLine w="w-1/3" h="h-3" />
            <SkeletonLine w="w-1/5" h="h-2" />
          </div>
        </div>
      )}
      {Array.from({ length: lines }).map((_, i) => (
        <SkeletonLine key={i} w={i === 0 ? 'w-3/4' : i === lines - 1 ? 'w-1/2' : 'w-full'} />
      ))}
    </div>
  );
}

export function SkeletonRideCard() {
  return (
    <div className="card flex flex-col gap-3 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full skeleton" />
          <SkeletonLine w="w-24" h="h-3" />
        </div>
        <SkeletonLine w="w-16" h="h-6" />
      </div>
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full skeleton shrink-0" />
        <SkeletonLine w="w-28" h="h-3" />
      </div>
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full skeleton shrink-0" />
        <SkeletonLine w="w-32" h="h-3" />
      </div>
      <div className="flex items-center justify-between pt-1">
        <SkeletonLine w="w-20" h="h-4" />
        <SkeletonLine w="w-24" h="h-8" />
      </div>
    </div>
  );
}

export function SkeletonList({ count = 3, card = 'default' }) {
  const Card = card === 'ride' ? SkeletonRideCard : SkeletonCard;
  return (
    <div className="flex flex-col gap-4">
      {Array.from({ length: count }).map((_, i) => <Card key={i} />)}
    </div>
  );
}

export default SkeletonCard;
