'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { SlidersHorizontal, Calendar, DollarSign, MapPin } from 'lucide-react';
import { EventType, EventFilters } from '@/types/event';

interface FilterBarProps {
  filters: EventFilters;
  onFiltersChange: (filters: EventFilters) => void;
  resultCount?: number;
}

type SortOption = 'date_asc' | 'date_desc' | 'price_asc' | 'price_desc' | 'popular';

/**
 * FilterBar Component
 *
 * Provides filtering and sorting controls for event discovery.
 *
 * Features:
 * - Sort by date, price, popularity
 * - Filter by event type (live/online/hybrid)
 * - Filter by price (free/paid)
 * - Filter by city
 * - Date range selection
 * - Mobile-responsive drawer
 * - Active filter count indicator
 *
 * @example
 * ```tsx
 * <FilterBar
 *   filters={filters}
 *   onFiltersChange={setFilters}
 *   resultCount={totalEvents}
 * />
 * ```
 */
export function FilterBar({
  filters,
  onFiltersChange,
  resultCount
}: FilterBarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('date_asc');

  const handleSortChange = (option: SortOption) => {
    setSortBy(option);
    // Note: Sorting will be handled by the parent component
    // We're just managing the UI state here
  };

  const handleEventTypeToggle = (type: EventType) => {
    onFiltersChange({
      ...filters,
      event_type: filters.event_type === type ? undefined : type,
    });
  };

  const handlePriceToggle = (isFree: boolean) => {
    onFiltersChange({
      ...filters,
      is_free: filters.is_free === isFree ? undefined : isFree,
    });
  };

  const handleCityChange = (city: string) => {
    onFiltersChange({
      ...filters,
      city: city || undefined,
    });
  };

  const clearAllFilters = () => {
    onFiltersChange({});
    setSortBy('date_asc');
  };

  const activeFilterCount = [
    filters.event_type,
    filters.is_free !== undefined,
    filters.city,
    filters.start_date,
    filters.end_date,
  ].filter(Boolean).length;

  const nigerianCities = [
    'Lagos',
    'Abuja',
    'Port Harcourt',
    'Kano',
    'Ibadan',
    'Kaduna',
    'Enugu',
    'Benin City',
  ];

  return (
    <>
      {/* Filter Button and Sort (Desktop) */}
      <div className="flex items-center justify-between gap-4">
        {/* Result Count */}
        {resultCount !== undefined && (
          <p className="text-sm text-gray-600">
            {resultCount} {resultCount === 1 ? 'event' : 'events'} found
          </p>
        )}

        <div className="flex items-center gap-2 ml-auto">
          {/* Sort Dropdown */}
          <select
            value={sortBy}
            onChange={(e) => handleSortChange(e.target.value as SortOption)}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:border-gray-400 focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
          >
            <option value="date_asc">Date (Soonest)</option>
            <option value="date_desc">Date (Latest)</option>
            <option value="price_asc">Price (Low to High)</option>
            <option value="price_desc">Price (High to Low)</option>
            <option value="popular">Most Popular</option>
          </select>

          {/* Filter Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={cn(
              'flex items-center gap-2 rounded-lg border-2 px-4 py-2 text-sm font-medium transition-all',
              isOpen || activeFilterCount > 0
                ? 'border-brand-primary bg-brand-primary text-white'
                : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
            )}
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-xs font-bold text-brand-primary">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Filter Panel */}
      {isOpen && (
        <div className="mt-4 rounded-lg border border-gray-200 bg-white p-6 shadow-lg">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
            {activeFilterCount > 0 && (
              <button
                onClick={clearAllFilters}
                className="text-sm font-medium text-brand-primary hover:text-brand-primary/80"
              >
                Clear all
              </button>
            )}
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {/* Event Type Filter */}
            <div>
              <label className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-700">
                <Calendar className="h-4 w-4" />
                Event Type
              </label>
              <div className="space-y-2">
                {(['live', 'online', 'hybrid'] as EventType[]).map((type) => (
                  <button
                    key={type}
                    onClick={() => handleEventTypeToggle(type)}
                    className={cn(
                      'w-full rounded-lg border-2 px-4 py-2 text-left text-sm font-medium transition-all',
                      filters.event_type === type
                        ? 'border-brand-primary bg-brand-primary/10 text-brand-primary'
                        : 'border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                    )}
                  >
                    {type === 'live' && '🎪 Live Event'}
                    {type === 'online' && '💻 Online Event'}
                    {type === 'hybrid' && '🔀 Hybrid Event'}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Filter */}
            <div>
              <label className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-700">
                <DollarSign className="h-4 w-4" />
                Price
              </label>
              <div className="space-y-2">
                <button
                  onClick={() => handlePriceToggle(true)}
                  className={cn(
                    'w-full rounded-lg border-2 px-4 py-2 text-left text-sm font-medium transition-all',
                    filters.is_free === true
                      ? 'border-brand-green bg-brand-green/10 text-brand-green'
                      : 'border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                  )}
                >
                  Free Events
                </button>
                <button
                  onClick={() => handlePriceToggle(false)}
                  className={cn(
                    'w-full rounded-lg border-2 px-4 py-2 text-left text-sm font-medium transition-all',
                    filters.is_free === false
                      ? 'border-brand-primary bg-brand-primary/10 text-brand-primary'
                      : 'border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                  )}
                >
                  Paid Events
                </button>
              </div>
            </div>

            {/* City Filter */}
            <div>
              <label className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-700">
                <MapPin className="h-4 w-4" />
                City
              </label>
              <select
                value={filters.city || ''}
                onChange={(e) => handleCityChange(e.target.value)}
                className="w-full rounded-lg border-2 border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-all hover:border-gray-300 focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
              >
                <option value="">All Cities</option>
                {nigerianCities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Range (Placeholder for future implementation) */}
            <div>
              <label className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-700">
                <Calendar className="h-4 w-4" />
                Date Range
              </label>
              <div className="space-y-2">
                <input
                  type="date"
                  value={filters.start_date || ''}
                  onChange={(e) =>
                    onFiltersChange({
                      ...filters,
                      start_date: e.target.value || undefined,
                    })
                  }
                  className="w-full rounded-lg border-2 border-gray-200 px-4 py-2 text-sm text-gray-700 transition-all hover:border-gray-300 focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
                  placeholder="Start date"
                />
                <input
                  type="date"
                  value={filters.end_date || ''}
                  onChange={(e) =>
                    onFiltersChange({
                      ...filters,
                      end_date: e.target.value || undefined,
                    })
                  }
                  className="w-full rounded-lg border-2 border-gray-200 px-4 py-2 text-sm text-gray-700 transition-all hover:border-gray-300 focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
                  placeholder="End date"
                />
              </div>
            </div>
          </div>

          {/* Apply/Close Button (Mobile) */}
          <div className="mt-6 flex gap-3 md:hidden">
            <button
              onClick={() => setIsOpen(false)}
              className="flex-1 rounded-lg border-2 border-gray-300 px-4 py-2 font-semibold text-gray-700 transition-colors hover:bg-gray-50"
            >
              Close
            </button>
            {activeFilterCount > 0 && (
              <button
                onClick={clearAllFilters}
                className="flex-1 rounded-lg bg-gray-200 px-4 py-2 font-semibold text-gray-700 transition-colors hover:bg-gray-300"
              >
                Clear All
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}
