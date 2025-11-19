import { EventListSkeleton, Skeleton } from '@/components/ui/LoadingSkeleton';

export default function FavoritesLoading() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Skeleton className="mb-2 h-10 w-56" />
          <Skeleton className="h-5 w-80" />
        </div>

        {/* Events Grid */}
        <EventListSkeleton count={6} />
      </div>
    </div>
  );
}
