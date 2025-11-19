'use client';

import { useState, useCallback, useRef, useEffect, Suspense } from 'react';
import { Search, X, MapPin, Calendar } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useSearchEvents } from '@/hooks/useEvents';
import { debounce } from '@/lib/utils/debounce';
import Link from 'next/link';
import Image from 'next/image';
import { formatEventDate, formatNaira } from '@/lib/utils/formatters';

interface SearchBarProps {
  variant?: 'header' | 'hero' | 'inline';
  placeholder?: string;
  autoFocus?: boolean;
  showSuggestions?: boolean;
  onSearch?: (query: string) => void;
  className?: string;
}

/**
 * Search Bar Component
 *
 * Supports multiple variants:
 * - header: Compact search for navigation
 * - hero: Large search for landing page
 * - inline: Full-width search for search pages
 *
 * Features:
 * - Real-time search suggestions
 * - Debounced API calls
 * - Keyboard navigation (Arrow keys, Enter, Escape)
 * - Click-away detection
 *
 * @example
 * ```tsx
 * <SearchBar variant="header" showSuggestions />
 * ```
 */
function SearchBarContent({
  variant = 'inline',
  placeholder = 'Search events, venues, or organizers...',
  autoFocus = false,
  showSuggestions = true,
  onSearch,
  className,
}: SearchBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams?.get('q') || '');
  const [isFocused, setIsFocused] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Search with debounce to avoid excessive API calls
  const { data: searchResults, isLoading } = useSearchEvents(
    showSuggestions && query.length >= 2 ? query : ''
  );

  // Debounced search handler
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSearch = useCallback(
    debounce((value: string) => {
      if (onSearch) {
        onSearch(value);
      }
    }, 300),
    []
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setSelectedIndex(-1);
    debouncedSearch(value);
  };

  const handleSearch = useCallback(
    (searchQuery?: string) => {
      const finalQuery = searchQuery || query;
      if (!finalQuery.trim()) return;

      // Navigate to discover page with search query
      router.push(`/discover?q=${encodeURIComponent(finalQuery.trim())}`);
      setIsFocused(false);
      inputRef.current?.blur();
    },
    [query, router]
  );

  const handleClear = () => {
    setQuery('');
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  const handleSuggestionClick = (eventId: number, title: string) => {
    setQuery(title);
    setIsFocused(false);
    router.push(`/events/${eventId}`);
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || !searchResults?.events) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < searchResults.events.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && searchResults.events[selectedIndex]) {
          const event = searchResults.events[selectedIndex];
          handleSuggestionClick(event.id, event.title);
        } else {
          handleSearch();
        }
        break;
      case 'Escape':
        setIsFocused(false);
        inputRef.current?.blur();
        break;
    }
  };

  // Click away detection
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const showDropdown =
    isFocused &&
    showSuggestions &&
    query.length >= 2 &&
    searchResults?.events &&
    searchResults.events.length > 0;

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      {/* Search Input */}
      <div
        className={cn(
          'relative flex items-center',
          // Variants
          {
            'h-10': variant === 'header',
            'h-14 md:h-16': variant === 'hero',
            'h-12': variant === 'inline',
          }
        )}
      >
        <Search
          className={cn(
            'absolute left-3 text-gray-400',
            {
              'h-4 w-4': variant === 'header',
              'h-5 w-5 md:h-6 md:w-6': variant === 'hero',
              'h-5 w-5': variant === 'inline',
            }
          )}
        />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className={cn(
            'w-full rounded-lg border border-gray-300 bg-white transition-all',
            'focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20',
            {
              'pl-9 pr-9 text-sm': variant === 'header',
              'pl-11 pr-12 text-base md:pl-14 md:pr-14 md:text-lg':
                variant === 'hero',
              'pl-10 pr-10 text-base': variant === 'inline',
            },
            isFocused && 'border-brand-primary ring-2 ring-brand-primary/20'
          )}
        />
        {query && (
          <button
            onClick={handleClear}
            className={cn(
              'absolute right-3 text-gray-400 hover:text-gray-600',
              'transition-colors'
            )}
            aria-label="Clear search"
          >
            <X
              className={cn({
                'h-4 w-4': variant === 'header',
                'h-5 w-5 md:h-6 md:w-6': variant === 'hero',
                'h-5 w-5': variant === 'inline',
              })}
            />
          </button>
        )}
        {isLoading && (
          <div className="absolute right-3">
            <div
              className={cn(
                'animate-spin rounded-full border-2 border-gray-300 border-t-brand-primary',
                {
                  'h-4 w-4': variant === 'header',
                  'h-5 w-5 md:h-6 md:w-6': variant === 'hero',
                  'h-5 w-5': variant === 'inline',
                }
              )}
            />
          </div>
        )}
      </div>

      {/* Search Suggestions Dropdown */}
      {showDropdown && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-96 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg">
          <div className="p-2">
            <p className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase">
              Suggested Events ({searchResults.events.length})
            </p>
            {searchResults.events.map((event, index) => (
              <Link
                key={event.id}
                href={`/events/${event.id}`}
                onClick={() => handleSuggestionClick(event.id, event.title)}
                className={cn(
                  'flex items-start gap-3 rounded-md p-3 transition-colors',
                  selectedIndex === index
                    ? 'bg-brand-primary/10'
                    : 'hover:bg-gray-50'
                )}
              >
                {/* Event Image */}
                {event.image_url && (
                  <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded relative">
                    <Image
                      src={event.image_url}
                      alt={event.title}
                      fill
                      sizes="48px"
                      className="object-cover"
                    />
                  </div>
                )}

                {/* Event Details */}
                <div className="flex-1 min-w-0">
                  <h4 className="truncate text-sm font-semibold text-gray-900">
                    {event.title}
                  </h4>
                  <div className="mt-1 flex flex-col gap-1 text-xs text-gray-600">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>{formatEventDate(event.start_datetime)}</span>
                    </div>
                    {event.venue && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        <span className="truncate">{event.venue.name}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Event Price */}
                <div className="flex-shrink-0 text-right">
                  <p className="text-sm font-semibold text-brand-primary">
                    {event.is_free
                      ? 'Free'
                      : event.tickets && event.tickets.length > 0
                        ? formatNaira(event.tickets[0].price)
                        : 'TBA'}
                  </p>
                </div>
              </Link>
            ))}
          </div>

          {/* View All Results */}
          <button
            onClick={() => handleSearch()}
            className="w-full border-t border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium text-brand-primary hover:bg-gray-100 transition-colors"
          >
            View all results for &quot;{query}&quot;
          </button>
        </div>
      )}
    </div>
  );
}

export function SearchBar(props: SearchBarProps) {
  return (
    <Suspense fallback={
      <div className={cn('relative', props.className)}>
        <div className={cn(
          'relative flex items-center',
          {
            'h-10': props.variant === 'header',
            'h-14 md:h-16': props.variant === 'hero',
            'h-12': props.variant === 'inline' || !props.variant,
          }
        )}>
          <Search className={cn(
            'absolute left-3 text-gray-400',
            {
              'h-4 w-4': props.variant === 'header',
              'h-5 w-5 md:h-6 md:w-6': props.variant === 'hero',
              'h-5 w-5': props.variant === 'inline' || !props.variant,
            }
          )} />
          <input
            type="text"
            placeholder={props.placeholder || 'Search events, venues, or organizers...'}
            disabled
            className={cn(
              'w-full rounded-lg border border-gray-300 bg-white transition-all',
              'focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20',
              {
                'pl-9 pr-9 text-sm': props.variant === 'header',
                'pl-11 pr-12 text-base md:pl-14 md:pr-14 md:text-lg': props.variant === 'hero',
                'pl-10 pr-10 text-base': props.variant === 'inline' || !props.variant,
              }
            )}
          />
        </div>
      </div>
    }>
      <SearchBarContent {...props} />
    </Suspense>
  );
}
