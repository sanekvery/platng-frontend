import { TicketListSkeleton, Skeleton } from '@/components/ui/LoadingSkeleton';

export default function TicketsLoading() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto max-w-4xl px-4">
        {/* Header */}
        <div className="mb-8">
          <Skeleton className="mb-2 h-10 w-48" />
          <Skeleton className="h-5 w-64" />
        </div>

        {/* Tickets List */}
        <TicketListSkeleton count={6} />
      </div>
    </div>
  );
}
