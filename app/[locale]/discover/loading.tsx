import { EventListSkeleton } from '@/components/ui/LoadingSkeleton';
import { Skeleton } from '@/components/ui/LoadingSkeleton';

export default function DiscoverLoading() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Skeleton className="mb-4 h-10 w-64" />
          <Skeleton className="h-5 w-96" />
        </div>

        {/* Search and Filters */}
        <div className="mb-6 space-y-4">
          <Skeleton className="h-12 w-full" />
          <div className="flex gap-2 overflow-x-auto">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="h-10 w-24 flex-shrink-0 rounded-full" />
            ))}
          </div>
        </div>

        {/* Events Grid */}
        <EventListSkeleton count={9} />
      </div>
    </div>
  );
}
