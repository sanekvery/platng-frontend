'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import Image from 'next/image';
import { Link } from '@/i18n/routing';
import { useEvent } from '@/hooks/useEvents';
import { formatEventDate, formatNaira } from '@/lib/utils';
import {
  Calendar,
  MapPin,
  Users,
  Share2,
  ChevronLeft,
  ExternalLink,
  Tag,
  Heart,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { FavoriteButton } from '@/components/events/FavoriteButton';

export default function EventDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = parseInt(params?.id as string, 10);
  const { data: event, isLoading, error } = useEvent(eventId);
  const [imageError, setImageError] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<number | null>(null);

  const handleShare = async () => {
    if (navigator.share && event) {
      try {
        await navigator.share({
          title: event.title,
          text: event.description,
          url: window.location.href,
        });
      } catch {
        // User cancelled share
      }
    } else if (event) {
      navigator.clipboard.writeText(window.location.href);
      // TODO: Show toast notification
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        <div className="container mx-auto px-4 py-8">
          {/* Skeleton Loading */}
          <div className="animate-pulse">
            <div className="mb-6 h-8 w-24 rounded bg-gray-200" />
            <div className="mb-8 h-96 rounded-2xl bg-gray-200" />
            <div className="grid gap-8 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <div className="mb-4 h-10 w-3/4 rounded bg-gray-200" />
                <div className="space-y-3">
                  <div className="h-4 rounded bg-gray-200" />
                  <div className="h-4 rounded bg-gray-200" />
                  <div className="h-4 w-5/6 rounded bg-gray-200" />
                </div>
              </div>
              <div className="h-96 rounded-2xl bg-gray-200" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        <div className="container mx-auto px-4 py-8">
          <Link
            href="/discover"
            className="mb-6 inline-flex items-center gap-2 text-brand-primary hover:text-brand-primary/80"
          >
            <ChevronLeft className="h-5 w-5" />
            <span>Back to Events</span>
          </Link>

          <div className="rounded-lg border-2 border-red-200 bg-red-50 p-12 text-center">
            <div className="text-6xl">🎭</div>
            <h2 className="mt-4 text-2xl font-semibold text-red-800">
              Event Not Found
            </h2>
            <p className="mt-2 text-red-600">
              {error?.message || 'The event you are looking for does not exist.'}
            </p>
            <Link
              href="/discover"
              className="mt-6 inline-block rounded-lg bg-brand-primary px-6 py-3 font-semibold text-white transition-colors hover:bg-brand-primary/90"
            >
              Browse Events
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Link
          href="/discover"
          className="mb-6 inline-flex items-center gap-2 text-brand-primary transition-colors hover:text-brand-primary/80"
        >
          <ChevronLeft className="h-5 w-5" />
          <span className="font-medium">Back to Events</span>
        </Link>

        {/* Event Image */}
        <div className="relative mb-8 overflow-hidden rounded-2xl bg-gradient-to-br from-brand-primary to-brand-orange shadow-xl">
          <div className="aspect-[21/9] relative">
            {event.image_url && !imageError ? (
              <Image
                src={event.image_url}
                alt={event.title}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
                className="object-cover"
                onError={() => setImageError(true)}
                priority
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <div className="text-9xl opacity-50">🎭</div>
              </div>
            )}
          </div>

          {/* Floating Action Buttons */}
          <div className="absolute right-4 top-4 flex gap-2">
            <div className="backdrop-blur-sm rounded-full">
              <FavoriteButton eventId={eventId} variant="default" />
            </div>

            <button
              onClick={handleShare}
              className="rounded-full bg-white/90 p-3 text-gray-700 backdrop-blur-sm transition-all hover:bg-white"
              aria-label="Share event"
            >
              <Share2 className="h-5 w-5" />
            </button>
          </div>

          {/* Event Type Badge */}
          <div className="absolute bottom-4 left-4">
            <span
              className={cn(
                'rounded-full px-4 py-2 text-sm font-semibold backdrop-blur-sm',
                event.event_type === 'live'
                  ? 'bg-brand-orange/90 text-white'
                  : event.event_type === 'online'
                    ? 'bg-brand-green/90 text-white'
                    : 'bg-blue-500/90 text-white'
              )}
            >
              {event.event_type === 'live' && '🎪 Live Event'}
              {event.event_type === 'online' && '💻 Online Event'}
              {event.event_type === 'hybrid' && '🔀 Hybrid Event'}
            </span>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left Column - Event Details */}
          <div className="lg:col-span-2">
            {/* Category Badge */}
            {event.category && (
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700">
                <Tag className="h-4 w-4" />
                {event.category.icon} {event.category.name}
              </div>
            )}

            {/* Title */}
            <h1 className="mb-4 text-4xl font-bold text-gray-900 lg:text-5xl">
              {event.title}
            </h1>

            {/* Organizer */}
            {event.organizer && (
              <div className="mb-6 flex items-center gap-3">
                {event.organizer.logo_url ? (
                  <div className="h-12 w-12 rounded-full relative overflow-hidden">
                    <Image
                      src={event.organizer.logo_url}
                      alt={event.organizer.name}
                      fill
                      sizes="48px"
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-200 text-lg font-semibold text-gray-600">
                    {event.organizer.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-500">Organized by</p>
                  <p className="font-semibold text-gray-900">
                    {event.organizer.name}
                    {event.organizer.is_verified && (
                      <span className="ml-1 text-brand-primary">✓</span>
                    )}
                  </p>
                </div>
              </div>
            )}

            {/* Key Info Cards */}
            <div className="mb-8 grid gap-4 sm:grid-cols-2">
              {/* Date & Time */}
              <div className="rounded-xl border border-gray-200 bg-white p-4">
                <div className="mb-2 flex items-center gap-2 text-brand-primary">
                  <Calendar className="h-5 w-5" />
                  <span className="font-semibold">Date & Time</span>
                </div>
                <p className="text-gray-900">{formatEventDate(event.start_datetime)}</p>
                {event.end_datetime && (
                  <p className="mt-1 text-sm text-gray-600">
                    Ends: {formatEventDate(event.end_datetime)}
                  </p>
                )}
              </div>

              {/* Location */}
              {event.venue && (
                <div className="rounded-xl border border-gray-200 bg-white p-4">
                  <div className="mb-2 flex items-center gap-2 text-brand-primary">
                    <MapPin className="h-5 w-5" />
                    <span className="font-semibold">Location</span>
                  </div>
                  <p className="font-medium text-gray-900">{event.venue.name}</p>
                  <p className="mt-1 text-sm text-gray-600">
                    {event.venue.address}, {event.venue.city}
                  </p>
                  {event.venue.capacity && (
                    <p className="mt-2 flex items-center gap-1 text-sm text-gray-600">
                      <Users className="h-4 w-4" />
                      <span>Capacity: {event.venue.capacity.toLocaleString()}</span>
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Description */}
            <div className="mb-8 rounded-xl border border-gray-200 bg-white p-6">
              <h2 className="mb-4 text-2xl font-bold text-gray-900">
                About This Event
              </h2>
              <div className="prose prose-gray max-w-none">
                <p className="whitespace-pre-wrap text-gray-700">
                  {event.description}
                </p>
              </div>
            </div>

            {/* Venue Map Placeholder */}
            {event.venue && (event.venue.latitude && event.venue.longitude) && (
              <div className="mb-8 rounded-xl border border-gray-200 bg-white p-6">
                <h2 className="mb-4 flex items-center gap-2 text-2xl font-bold text-gray-900">
                  <MapPin className="h-6 w-6" />
                  Venue Location
                </h2>
                <div className="aspect-video w-full rounded-lg bg-gray-100 flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2 text-gray-600">
                      Map integration coming soon
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                      {event.venue.latitude}, {event.venue.longitude}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Ticket Booking */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-lg">
              <h2 className="mb-4 text-2xl font-bold text-gray-900">
                Get Tickets
              </h2>

              {/* Free Event */}
              {event.is_free ? (
                <div className="mb-6">
                  <div className="rounded-lg bg-brand-green/10 p-4 text-center">
                    <p className="text-3xl font-bold text-brand-green">Free</p>
                    <p className="mt-1 text-sm text-gray-600">
                      No payment required
                    </p>
                  </div>
                </div>
              ) : (
                /* Ticket Selection */
                <div className="mb-6 space-y-3">
                  {event.tickets && event.tickets.length > 0 ? (
                    event.tickets.map((ticket) => (
                      <button
                        key={ticket.id}
                        onClick={() => setSelectedTicket(ticket.id)}
                        className={cn(
                          'w-full rounded-lg border-2 p-4 text-left transition-all',
                          selectedTicket === ticket.id
                            ? 'border-brand-primary bg-brand-primary/5'
                            : 'border-gray-200 hover:border-gray-300'
                        )}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-semibold text-gray-900">
                              {ticket.name}
                            </p>
                            {ticket.description && (
                              <p className="mt-1 text-sm text-gray-600">
                                {ticket.description}
                              </p>
                            )}
                            {ticket.quantity_available !== undefined && (
                              <p className="mt-2 text-xs text-gray-500">
                                {ticket.quantity_available > 0
                                  ? `${ticket.quantity_available} available`
                                  : 'Sold out'}
                              </p>
                            )}
                          </div>
                          <div className="ml-4 text-right">
                            <p className="text-lg font-bold text-gray-900">
                              {formatNaira(ticket.price)}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="rounded-lg border border-gray-200 p-4 text-center text-gray-600">
                      Ticket pricing not available yet
                    </div>
                  )}
                </div>
              )}

              {/* Book Button */}
              <button
                onClick={() => router.push(`/checkout/${eventId}`)}
                className="w-full rounded-lg bg-brand-primary py-4 font-bold text-white shadow-lg transition-all hover:bg-brand-primary/90 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!event.is_free && !selectedTicket}
              >
                {event.is_free ? 'Register for Free' : 'Buy Tickets'}
              </button>

              {/* Additional Info */}
              <div className="mt-6 space-y-3 border-t border-gray-200 pt-6 text-sm text-gray-600">
                {event.favorite_count !== undefined && event.favorite_count > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Heart className="h-4 w-4" />
                      Favorites
                    </span>
                    <span className="font-semibold">{event.favorite_count}</span>
                  </div>
                )}

                {event.external_url && (
                  <a
                    href={event.external_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between text-brand-primary hover:text-brand-primary/80"
                  >
                    <span className="flex items-center gap-2">
                      <ExternalLink className="h-4 w-4" />
                      Event Website
                    </span>
                    <span>→</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
