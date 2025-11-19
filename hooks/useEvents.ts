import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { eventAPI } from '@/lib/api/axios-instance';
import type { Event, EventFilters } from '@/types/event';

/**
 * Query keys for events
 * Organized hierarchy for easy invalidation
 */
export const eventKeys = {
  all: ['events'] as const,
  lists: () => [...eventKeys.all, 'list'] as const,
  list: (filters: EventFilters) => [...eventKeys.lists(), filters] as const,
  details: () => [...eventKeys.all, 'detail'] as const,
  detail: (id: number) => [...eventKeys.details(), id] as const,
};

/**
 * API Response type for paginated events
 */
interface EventsResponse {
  events: Event[];
  total: number;
  skip: number;
  limit: number;
}

/**
 * Fetch a single event by ID
 *
 * @param id - Event ID
 * @returns Event data
 *
 * @example
 * ```ts
 * const { data: event, isLoading, error } = useEvent(123);
 * ```
 */
export function useEvent(id: number) {
  return useQuery({
    queryKey: eventKeys.detail(id),
    queryFn: async () => {
      const { data } = await eventAPI.get<Event>(`/events/${id}`);
      return data;
    },
    enabled: !!id && id > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Fetch paginated list of events with filters
 *
 * @param filters - Event filters (category, city, search, etc.)
 * @returns Events list with pagination info
 *
 * @example
 * ```ts
 * const { data, isLoading, error } = useEvents({
 *   city: 'Lagos',
 *   category_id: 1
 * });
 * ```
 */
export function useEvents(filters: EventFilters = {}) {
  return useQuery({
    queryKey: eventKeys.list(filters),
    queryFn: async () => {
      const { data } = await eventAPI.get<EventsResponse>('/events', {
        params: {
          ...filters,
          skip: 0,
          limit: 20,
        },
      });
      return data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Infinite scroll query for events
 * Automatically handles pagination
 *
 * @param filters - Event filters
 * @returns Infinite query with pages of events
 *
 * @example
 * ```ts
 * const {
 *   data,
 *   fetchNextPage,
 *   hasNextPage,
 *   isFetchingNextPage
 * } = useInfiniteEvents({ city: 'Lagos' });
 *
 * // In component:
 * <button onClick={() => fetchNextPage()} disabled={!hasNextPage}>
 *   Load More
 * </button>
 * ```
 */
export function useInfiniteEvents(filters: EventFilters = {}) {
  return useInfiniteQuery({
    queryKey: eventKeys.list(filters),
    queryFn: async ({ pageParam = 0 }) => {
      const { data } = await eventAPI.get<EventsResponse>('/events', {
        params: {
          ...filters,
          skip: pageParam,
          limit: 20,
        },
      });
      return data;
    },
    getNextPageParam: (lastPage, allPages) => {
      const loadedCount = allPages.reduce((sum, page) => sum + page.events.length, 0);
      return loadedCount < lastPage.total ? loadedCount : undefined;
    },
    initialPageParam: 0,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Search events by query string
 * Debounced search is recommended in the component
 *
 * @param search - Search query
 * @returns Matching events
 *
 * @example
 * ```ts
 * const [searchQuery, setSearchQuery] = useState('');
 * const debouncedSearch = useDebounce(searchQuery, 500);
 * const { data: results } = useSearchEvents(debouncedSearch);
 * ```
 */
export function useSearchEvents(search: string) {
  return useQuery({
    queryKey: [...eventKeys.lists(), { search }],
    queryFn: async () => {
      const { data } = await eventAPI.get<EventsResponse>('/events', {
        params: {
          search,
          limit: 50,
        },
      });
      return data;
    },
    enabled: search.length >= 3, // Only search if 3+ characters
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}

/**
 * Get featured/highlighted events
 * Typically used for homepage
 *
 * @returns Featured events
 *
 * @example
 * ```ts
 * const { data: featuredEvents } = useFeaturedEvents();
 * ```
 */
export function useFeaturedEvents() {
  return useQuery({
    queryKey: [...eventKeys.all, 'featured'],
    queryFn: async () => {
      const { data } = await eventAPI.get<EventsResponse>('/events/featured');
      return data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Get upcoming events (future events sorted by date)
 *
 * @param limit - Number of events to fetch
 * @returns Upcoming events
 *
 * @example
 * ```ts
 * const { data: upcomingEvents } = useUpcomingEvents(10);
 * ```
 */
export function useUpcomingEvents(limit = 20) {
  return useQuery({
    queryKey: [...eventKeys.all, 'upcoming', { limit }],
    queryFn: async () => {
      const { data } = await eventAPI.get<EventsResponse>('/events/upcoming', {
        params: { limit },
      });
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Create a new event (for organizers)
 * Not typically used in consumer app, but included for completeness
 *
 * @returns Mutation function
 *
 * @example
 * ```ts
 * const { mutate: createEvent, isPending } = useCreateEvent();
 *
 * createEvent(eventData, {
 *   onSuccess: (data) => {
 *     console.log('Event created:', data);
 *   }
 * });
 * ```
 */
export function useCreateEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (eventData: Partial<Event>) => {
      const { data } = await eventAPI.post<Event>('/events', eventData);
      return data;
    },
    onSuccess: () => {
      // Invalidate all event lists
      queryClient.invalidateQueries({ queryKey: eventKeys.lists() });
    },
  });
}

/**
 * Update an event
 *
 * @returns Mutation function
 */
export function useUpdateEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data: eventData }: { id: number; data: Partial<Event> }) => {
      const { data } = await eventAPI.put<Event>(`/events/${id}`, eventData);
      return data;
    },
    onSuccess: (data) => {
      // Invalidate specific event detail
      queryClient.invalidateQueries({ queryKey: eventKeys.detail(data.id) });
      // Invalidate all lists
      queryClient.invalidateQueries({ queryKey: eventKeys.lists() });
    },
  });
}

/**
 * Delete an event
 *
 * @returns Mutation function
 */
export function useDeleteEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      await eventAPI.delete(`/events/${id}`);
      return id;
    },
    onSuccess: () => {
      // Invalidate all event queries
      queryClient.invalidateQueries({ queryKey: eventKeys.all });
    },
  });
}
