'use client';

import { Heart } from 'lucide-react';
import { useToggleFavorite, useIsFavorite } from '@/hooks/useFavorites';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';

interface FavoriteButtonProps {
  eventId: number;
  variant?: 'default' | 'compact';
  className?: string;
  showText?: boolean;
}

/**
 * FavoriteButton component
 * Allows users to add/remove events from favorites
 * Requires authentication
 */
export function FavoriteButton({
  eventId,
  variant = 'default',
  className = '',
  showText = false,
}: FavoriteButtonProps) {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { data: isFavorited } = useIsFavorite(eventId);
  const { mutate: toggleFavorite, isPending } = useToggleFavorite();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      if (typeof window !== 'undefined') {
        router.push('/login?redirect=' + encodeURIComponent(window.location.pathname));
      }
      return;
    }

    toggleFavorite(eventId);
  };

  const baseClasses = {
    default: 'rounded-full p-2 transition-all hover:scale-110',
    compact: 'p-1 transition-all hover:scale-110',
  };

  const colorClasses = isFavorited
    ? 'bg-red-50 text-red-500'
    : 'bg-gray-100 text-gray-400 hover:text-red-500';

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className={`${baseClasses[variant]} ${colorClasses} ${className} ${
        isPending ? 'opacity-50 cursor-not-allowed' : ''
      }`}
      aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
      title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
    >
      <Heart
        className={`h-5 w-5 ${isFavorited ? 'fill-current' : ''}`}
        strokeWidth={isFavorited ? 0 : 2}
      />
      {showText && (
        <span className="ml-1 text-sm">
          {isFavorited ? 'Saved' : 'Save'}
        </span>
      )}
    </button>
  );
}
