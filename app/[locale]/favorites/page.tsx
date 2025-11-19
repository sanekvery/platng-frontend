'use client';


import { useFavorites, useFavoriteCount } from '@/hooks/useFavorites';
import { EventCard } from '@/components/events/EventCard';
import { Heart, Loader2 } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { useAuthStore } from '@/store/authStore';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Favorites Page
 *
 * Displays user's saved/favorited events
 * Requires authentication
 */
export default function FavoritesPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { data: favorites, isLoading, error } = useFavorites();
  const { data: favoriteCount } = useFavoriteCount();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/favorites');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return null; // Will redirect
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900">My Favorites</h1>
            <p className="mt-2 text-gray-600">Your saved events</p>
          </div>

          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-12 w-12 animate-spin text-brand-primary" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900">My Favorites</h1>
            <p className="mt-2 text-gray-600">Your saved events</p>
          </div>

          <div className="rounded-lg border-2 border-red-200 bg-red-50 p-6">
            <h2 className="mb-2 text-xl font-semibold text-red-800">Error Loading Favorites</h2>
            <p className="text-red-600">
              {error instanceof Error ? error.message : 'Failed to load favorites'}
            </p>
            <p className="mt-4 text-sm text-red-500">
              Make sure the backend favorites service is running on{' '}
              <code className="rounded bg-red-100 px-1">
                {process.env.NEXT_PUBLIC_FAVORITES_API}
              </code>
            </p>
          </div>
        </div>
      </div>
    );
  }

  const favoriteEvents = (favorites?.map(fav => fav.event).filter((e): e is NonNullable<typeof e> => e != null)) || [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-red-100 p-3">
              <Heart className="h-8 w-8 fill-red-500 text-red-500" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">My Favorites</h1>
              <p className="mt-1 text-gray-600">
                {favoriteCount === 0
                  ? 'No saved events yet'
                  : `${favoriteCount} saved event${favoriteCount === 1 ? '' : 's'}`
                }
              </p>
            </div>
          </div>
        </div>

        {/* Empty State */}
        {favoriteEvents.length === 0 ? (
          <div className="rounded-lg border-2 border-gray-200 bg-white p-12 text-center">
            <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-gray-100">
              <Heart className="h-12 w-12 text-gray-400" />
            </div>
            <h2 className="mb-2 text-2xl font-semibold text-gray-700">No Favorites Yet</h2>
            <p className="mb-6 text-gray-500">
              Start exploring events and save your favorites for easy access later!
            </p>
            <Link
              href="/discover"
              className="inline-flex items-center gap-2 rounded-lg bg-brand-primary px-6 py-3 font-semibold text-white transition-all hover:bg-brand-primary/90"
            >
              Discover Events
            </Link>
          </div>
        ) : (
          <>
            {/* Stats Card */}
            <div className="mb-6 rounded-lg bg-white p-6 shadow-md">
              <div className="grid gap-6 sm:grid-cols-3">
                <div className="text-center">
                  <div className="text-3xl font-bold text-brand-primary">{favoriteCount}</div>
                  <div className="mt-1 text-sm text-gray-600">Saved Events</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-brand-green">
                    {favoriteEvents.filter(e => e.is_free).length}
                  </div>
                  <div className="mt-1 text-sm text-gray-600">Free Events</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-brand-orange">
                    {favoriteEvents.filter(e => e.event_type === 'live').length}
                  </div>
                  <div className="mt-1 text-sm text-gray-600">Live Events</div>
                </div>
              </div>
            </div>

            {/* Events Grid */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {favoriteEvents.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  variant="default"
                />
              ))}
            </div>

            {/* Bottom CTA */}
            <div className="mt-12 rounded-lg bg-gradient-to-r from-brand-primary to-brand-orange p-8 text-center text-white">
              <h3 className="mb-2 text-2xl font-bold">Looking for more events?</h3>
              <p className="mb-4 text-white/90">
                Discover thousands of events happening near you
              </p>
              <Link
                href="/discover"
                className="inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 font-semibold text-brand-primary transition-all hover:bg-white/90"
              >
                Explore More Events
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
