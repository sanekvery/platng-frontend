'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useEvents } from '@/hooks/useEvents';
import { SearchBar } from '@/components/ui/SearchBar';
import { EventCard } from '@/components/events/EventCard';
import { CategoryFilter } from '@/components/events/CategoryFilter';

export default function DiscoverPage() {
  const searchParams = useSearchParams();
  const searchQuery = searchParams?.get('q') || '';
  const [filters] = useState({});
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  const { data, isLoading, error } = useEvents(filters);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="container mx-auto">
          <h1 className="mb-8 text-4xl font-bold">Discover Events</h1>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="animate-pulse rounded-lg bg-white p-6 shadow">
                <div className="mb-4 h-48 rounded bg-gray-200"></div>
                <div className="mb-2 h-6 rounded bg-gray-200"></div>
                <div className="h-4 rounded bg-gray-200"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="container mx-auto">
          <h1 className="mb-8 text-4xl font-bold">Discover Events</h1>
          <div className="rounded-lg border-2 border-red-200 bg-red-50 p-6">
            <h2 className="mb-2 text-xl font-semibold text-red-800">Error Loading Events</h2>
            <p className="text-red-600">
              {error instanceof Error ? error.message : 'Failed to load events'}
            </p>
            <p className="mt-4 text-sm text-red-500">
              Make sure the backend event service is running on{' '}
              <code className="rounded bg-red-100 px-1">
                {process.env.NEXT_PUBLIC_EVENT_API}
              </code>
            </p>
          </div>
        </div>
      </div>
    );
  }

  const events = data?.events || [];
  const total = data?.total || 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Discover Events</h1>
          <p className="mt-2 text-gray-600">
            Find amazing events happening in Nigeria • {total} events available
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <SearchBar variant="inline" showSuggestions placeholder="Search for events, venues, or organizers..." />
        </div>

        {/* Search Results Header */}
        {searchQuery && (
          <div className="mb-4 rounded-lg bg-white p-4 shadow-sm">
            <p className="text-gray-700">
              Showing results for <span className="font-semibold">&quot;{searchQuery}&quot;</span>
            </p>
          </div>
        )}

        {/* Filters */}
        <div className="mb-6">
          <CategoryFilter
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
          />
        </div>

        {/* Events Grid */}
        {events.length === 0 ? (
          <div className="rounded-lg border-2 border-gray-200 bg-white p-12 text-center">
            <div className="text-6xl">🎭</div>
            <h2 className="mt-4 text-2xl font-semibold text-gray-700">No Events Found</h2>
            <p className="mt-2 text-gray-500">
              No events are currently available. Check back later!
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                variant="default"
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
