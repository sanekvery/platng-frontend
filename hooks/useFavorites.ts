import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { favoritesAPI } from '@/lib/api/axios-instance';
import { logger } from '@/lib/utils/logger';
import type { Event } from '@/types/event';

/**
 * Favorite model from backend
 */
interface Favorite {
  id: number;
  user_id: number;
  event_id: number;
  created_at: string;
  event?: Event; // Populated event data
}

/**
 * Query keys for favorites
 */
export const favoriteKeys = {
  all: ['favorites'] as const,
  lists: () => [...favoriteKeys.all, 'list'] as const,
  list: (userId?: number) => [...favoriteKeys.lists(), { userId }] as const,
  check: (eventId: number) => [...favoriteKeys.all, 'check', eventId] as const,
};

/**
 * Fetch user's favorite events
 *
 * @returns List of user's favorites with event details
 *
 * @example
 * ```ts
 * const { data: favorites, isLoading } = useFavorites();
 * ```
 */
export function useFavorites() {
  return useQuery({
    queryKey: favoriteKeys.list(),
    queryFn: async () => {
      const { data } = await favoritesAPI.get<Favorite[]>('/favorites');
      return data;
    },
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}

/**
 * Check if an event is favorited
 *
 * @param eventId - Event ID to check
 * @returns Boolean indicating if event is favorited
 *
 * @example
 * ```ts
 * const { data: isFavorited } = useIsFavorite(eventId);
 * ```
 */
export function useIsFavorite(eventId: number) {
  const { data: favorites } = useFavorites();

  return {
    data: favorites?.some((fav) => fav.event_id === eventId) || false,
    favorites,
  };
}

/**
 * Add event to favorites
 *
 * @returns Mutation function
 *
 * @example
 * ```ts
 * const { mutate: addToFavorites, isPending } = useAddFavorite();
 *
 * addToFavorites(eventId, {
 *   onSuccess: () => {
 *     toast.success('Added to favorites!');
 *   }
 * });
 * ```
 */
export function useAddFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (eventId: number) => {
      const { data } = await favoritesAPI.post<Favorite>('/favorites', {
        event_id: eventId,
      });
      return data;
    },
    onSuccess: () => {
      // Invalidate favorites list
      queryClient.invalidateQueries({ queryKey: favoriteKeys.all });
    },
    onError: (error) => {
      logger.error('Failed to add favorite', error);
    },
  });
}

/**
 * Remove event from favorites
 *
 * @returns Mutation function
 *
 * @example
 * ```ts
 * const { mutate: removeFavorite, isPending } = useRemoveFavorite();
 *
 * removeFavorite(favoriteId, {
 *   onSuccess: () => {
 *     toast.success('Removed from favorites');
 *   }
 * });
 * ```
 */
export function useRemoveFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (favoriteId: number) => {
      await favoritesAPI.delete(`/favorites/${favoriteId}`);
      return favoriteId;
    },
    onSuccess: () => {
      // Invalidate favorites list
      queryClient.invalidateQueries({ queryKey: favoriteKeys.all });
    },
    onError: (error) => {
      logger.error('Failed to remove favorite', error);
    },
  });
}

/**
 * Remove event from favorites by event ID
 * Useful when you don't have the favorite ID
 *
 * @returns Mutation function
 *
 * @example
 * ```ts
 * const { mutate: removeFavoriteByEventId } = useRemoveFavoriteByEventId();
 *
 * removeFavoriteByEventId(eventId);
 * ```
 */
export function useRemoveFavoriteByEventId() {
  const queryClient = useQueryClient();
  const { data: favorites } = useFavorites();

  return useMutation({
    mutationFn: async (eventId: number) => {
      const favorite = favorites?.find((fav) => fav.event_id === eventId);
      if (!favorite) {
        throw new Error('Favorite not found');
      }
      await favoritesAPI.delete(`/favorites/${favorite.id}`);
      return favorite.id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: favoriteKeys.all });
    },
  });
}

/**
 * Toggle favorite status (add if not favorited, remove if favorited)
 *
 * @returns Mutation function
 *
 * @example
 * ```ts
 * const { mutate: toggleFavorite, isPending } = useToggleFavorite();
 *
 * <button
 *   onClick={() => toggleFavorite(eventId)}
 *   disabled={isPending}
 * >
 *   {isFavorited ? '❤️' : '🤍'}
 * </button>
 * ```
 */
export function useToggleFavorite() {
  const queryClient = useQueryClient();
  const { data: favorites } = useFavorites();

  return useMutation({
    mutationFn: async (eventId: number) => {
      const favorite = favorites?.find((fav) => fav.event_id === eventId);

      if (favorite) {
        // Remove favorite
        await favoritesAPI.delete(`/favorites/${favorite.id}`);
        return { action: 'removed' as const, favoriteId: favorite.id, eventId };
      } else {
        // Add favorite
        const { data } = await favoritesAPI.post<Favorite>('/favorites', {
          event_id: eventId,
        });
        return { action: 'added' as const, favoriteId: data.id, eventId };
      }
    },
    // Optimistic update - update UI immediately before API response
    onMutate: async (eventId: number) => {
      // Cancel any outgoing refetches to avoid overwriting optimistic update
      await queryClient.cancelQueries({ queryKey: favoriteKeys.all });

      // Snapshot the previous values for rollback
      const previousFavorites = queryClient.getQueryData<Favorite[]>(favoriteKeys.list());
      const previousCheck = queryClient.getQueryData<boolean>(favoriteKeys.check(eventId));

      // Optimistically update the favorites list
      queryClient.setQueryData<Favorite[]>(favoriteKeys.list(), (old) => {
        if (!old) return old;

        const existing = old.find((fav) => fav.event_id === eventId);

        if (existing) {
          // Remove from favorites
          return old.filter((fav) => fav.event_id !== eventId);
        } else {
          // Add to favorites with temporary data
          const tempFavorite: Favorite = {
            id: Date.now(), // Temporary ID
            event_id: eventId,
            user_id: 0,
            created_at: new Date().toISOString(),
          };
          return [...old, tempFavorite];
        }
      });

      // Optimistically update the check query
      queryClient.setQueryData<boolean>(favoriteKeys.check(eventId), !previousCheck);

      // Return context for rollback
      return { previousFavorites, previousCheck, eventId };
    },
    // If mutation fails, rollback to previous values
    onError: (error, eventId, context) => {
      logger.error('Failed to toggle favorite', error);

      if (context?.previousFavorites !== undefined) {
        queryClient.setQueryData(favoriteKeys.list(), context.previousFavorites);
      }
      if (context?.previousCheck !== undefined) {
        queryClient.setQueryData(favoriteKeys.check(eventId), context.previousCheck);
      }
    },
    // Always refetch after mutation completes (success or error)
    onSettled: (data) => {
      queryClient.invalidateQueries({ queryKey: favoriteKeys.all });
      if (data?.eventId) {
        queryClient.invalidateQueries({ queryKey: favoriteKeys.check(data.eventId) });
      }
    },
  });
}

/**
 * Get favorite count for the current user
 *
 * @returns Number of favorites
 *
 * @example
 * ```ts
 * const { data: favoriteCount } = useFavoriteCount();
 * ```
 */
export function useFavoriteCount() {
  const { data: favorites } = useFavorites();
  return {
    data: favorites?.length || 0,
    favorites,
  };
}
