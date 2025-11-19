'use client';

import { Link } from '@/i18n/routing';
import Image from 'next/image';
import { Event } from '@/types/event';
import { formatEventDate, formatNaira } from '@/lib/utils';
import { Calendar, MapPin, Share2, Users, Heart } from 'lucide-react';
import { useState, memo } from 'react';
import { cn } from '@/lib/utils';
import { FavoriteButton } from './FavoriteButton';

interface EventCardProps {
  event: Event;
  variant?: 'default' | 'compact' | 'featured';
}

/**
 * EventCard Component
 *
 * Displays event information in a card format with multiple variants.
 *
 * Features:
 * - Responsive image with fallback
 * - Event details (date, venue, category)
 * - Price display (free/paid)
 * - Favorite toggle
 * - Share functionality
 * - Multiple variants (default, compact, featured)
 * - Hover effects and animations
 * - Memoized for performance optimization
 *
 * @example
 * ```tsx
 * <EventCard
 *   event={event}
 *   onFavoriteToggle={handleFavorite}
 *   isFavorite={true}
 *   variant="default"
 * />
 * ```
 */
const EventCardComponent = ({
  event,
  variant = 'default'
}: EventCardProps) => {
  const [imageError, setImageError] = useState(false);

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Check if running in browser
    if (typeof window === 'undefined') return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: event.title,
          text: event.description,
          url: `/events/${event.id}`,
        });
      } catch {
        // User cancelled share or share failed
      }
    } else if (navigator.clipboard) {
      // Fallback: copy to clipboard
      const url = `${window.location.origin}/events/${event.id}`;
      try {
        await navigator.clipboard.writeText(url);
        // Could show a toast here
      } catch {
        // Clipboard write failed
      }
    }
  };

  // Get minimum ticket price
  const minPrice = event.tickets && event.tickets.length > 0
    ? Math.min(...event.tickets.map(t => t.price))
    : 0;

  const isCompact = variant === 'compact';
  const isFeatured = variant === 'featured';

  return (
    <Link
      href={`/events/${event.id}`}
      className={cn(
        'group block overflow-hidden rounded-xl bg-white shadow-md transition-all duration-300',
        'hover:shadow-xl hover:-translate-y-1',
        {
          'hover:shadow-2xl': isFeatured,
        }
      )}
    >
      {/* Image Section */}
      <div className={cn(
        'relative overflow-hidden bg-gradient-to-br from-brand-primary to-brand-orange',
        {
          'h-48': !isCompact && !isFeatured,
          'h-32': isCompact,
          'h-64 md:h-80': isFeatured,
        }
      )}>
        {event.image_url && !imageError ? (
          <Image
            src={event.image_url}
            alt={event.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-110"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <div className="text-6xl opacity-50">🎭</div>
          </div>
        )}

        {/* Status Badge */}
        <div className="absolute left-3 top-3 flex gap-2">
          <span
            className={cn(
              'rounded-full px-3 py-1 text-xs font-semibold backdrop-blur-sm',
              event.event_type === 'live'
                ? 'bg-brand-orange/90 text-white'
                : event.event_type === 'online'
                  ? 'bg-brand-green/90 text-white'
                  : 'bg-blue-500/90 text-white'
            )}
          >
            {event.event_type === 'live' ? '🎪 Live' :
             event.event_type === 'online' ? '💻 Online' :
             '🔀 Hybrid'}
          </span>

          {event.is_free && (
            <span className="rounded-full bg-brand-green/90 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
              Free
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="absolute right-3 top-3 flex gap-2">
          <div className="backdrop-blur-sm rounded-full">
            <FavoriteButton eventId={event.id} variant="compact" />
          </div>

          <button
            onClick={handleShare}
            className="rounded-full bg-white/90 p-2 text-gray-700 backdrop-blur-sm transition-all hover:bg-white"
            aria-label="Share event"
          >
            <Share2 className="h-4 w-4" />
          </button>
        </div>

        {/* Favorite Count (if available) */}
        {event.favorite_count && event.favorite_count > 0 && (
          <div className="absolute bottom-3 right-3 flex items-center gap-1 rounded-full bg-black/50 px-2 py-1 text-xs text-white backdrop-blur-sm">
            <Heart className="h-3 w-3 fill-current" />
            <span>{event.favorite_count}</span>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className={cn('p-4', isFeatured && 'p-6')}>
        {/* Category Badge */}
        {event.category && (
          <div className="mb-2">
            <span className="inline-block rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
              {event.category.icon} {event.category.name}
            </span>
          </div>
        )}

        {/* Title */}
        <h3 className={cn(
          'mb-2 font-semibold text-gray-900 line-clamp-2',
          {
            'text-base': isCompact,
            'text-lg': !isCompact && !isFeatured,
            'text-xl md:text-2xl': isFeatured,
          }
        )}>
          {event.title}
        </h3>

        {/* Description (only for featured) */}
        {isFeatured && (
          <p className="mb-3 text-sm text-gray-600 line-clamp-2">
            {event.description}
          </p>
        )}

        {/* Event Details */}
        <div className="space-y-2">
          {/* Date */}
          <div className="flex items-start gap-2 text-sm text-gray-600">
            <Calendar className="mt-0.5 h-4 w-4 flex-shrink-0 text-brand-primary" />
            <span className="line-clamp-1">{formatEventDate(event.start_datetime)}</span>
          </div>

          {/* Venue */}
          {event.venue && (
            <div className="flex items-start gap-2 text-sm text-gray-600">
              <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-brand-primary" />
              <span className="line-clamp-1">
                {event.venue.name}, {event.venue.city}
              </span>
            </div>
          )}

          {/* Capacity indicator (if venue has capacity) */}
          {event.venue?.capacity && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Users className="h-4 w-4 flex-shrink-0 text-brand-primary" />
              <span>Up to {event.venue.capacity.toLocaleString()} guests</span>
            </div>
          )}
        </div>

        {/* Price and CTA */}
        <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4">
          <div>
            {event.is_free ? (
              <span className="text-lg font-bold text-brand-green">Free</span>
            ) : event.tickets && event.tickets.length > 0 ? (
              <div>
                <span className="text-xs text-gray-500">From</span>
                <div className="text-lg font-bold text-gray-900">
                  {formatNaira(minPrice)}
                </div>
              </div>
            ) : (
              <span className="text-sm text-gray-500">Price TBA</span>
            )}
          </div>

          <div className={cn(
            'rounded-lg px-4 py-2 font-semibold transition-colors',
            'bg-brand-primary text-white',
            'group-hover:bg-brand-primary/90'
          )}>
            View Details
          </div>
        </div>

        {/* Organizer (only for featured) */}
        {isFeatured && event.organizer && (
          <div className="mt-4 flex items-center gap-2 border-t border-gray-100 pt-4">
            {event.organizer.logo_url ? (
              <div className="relative h-8 w-8 flex-shrink-0">
                <Image
                  src={event.organizer.logo_url}
                  alt={event.organizer.name}
                  fill
                  sizes="32px"
                  className="rounded-full object-cover"
                />
              </div>
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-xs font-semibold text-gray-600">
                {event.organizer.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <p className="text-xs text-gray-500">Organized by</p>
              <p className="text-sm font-medium text-gray-900">
                {event.organizer.name}
              </p>
            </div>
          </div>
        )}
      </div>
    </Link>
  );
};

/**
 * Memoized EventCard with custom comparison function
 * Only re-renders when event.id or variant changes
 */
export const EventCard = memo(EventCardComponent, (prevProps, nextProps) => {
  return (
    prevProps.event.id === nextProps.event.id &&
    prevProps.variant === nextProps.variant &&
    prevProps.event.image_url === nextProps.event.image_url &&
    prevProps.event.title === nextProps.event.title
  );
});

EventCard.displayName = 'EventCard';
