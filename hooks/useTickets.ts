import { useQuery } from '@tanstack/react-query';
import { eventAPI } from '@/lib/api';
import { UserTicket, TicketFilters } from '@/types/ticket';

/**
 * Fetch user's tickets
 */
export function useUserTickets(filters?: TicketFilters) {
  return useQuery({
    queryKey: ['user-tickets', filters],
    queryFn: async () => {
      try {
        const response = await eventAPI.get<UserTicket[]>('/user/tickets', {
          params: filters,
        });
        return response.data;
      } catch (error) {
        // Return mock data for development until API is ready
        return getMockUserTickets(filters);
      }
    },
  });
}

/**
 * Fetch single ticket details
 */
export function useTicket(ticketId: number) {
  return useQuery({
    queryKey: ['ticket', ticketId],
    queryFn: async () => {
      try {
        const response = await eventAPI.get<UserTicket>(`/user/tickets/${ticketId}`);
        return response.data;
      } catch (error) {
        // Return mock data for development
        const mockTickets = getMockUserTickets();
        return mockTickets.find(t => t.id === ticketId) || null;
      }
    },
    enabled: !!ticketId,
  });
}

/**
 * Get ticket statistics
 */
export function useTicketStats() {
  return useQuery({
    queryKey: ['ticket-stats'],
    queryFn: async () => {
      try {
        const response = await eventAPI.get<{
          total: number;
          upcoming: number;
          past: number;
          active: number;
        }>('/user/tickets/stats');
        return response.data;
      } catch (error) {
        // Return mock stats
        const tickets = getMockUserTickets();
        const now = new Date();
        return {
          total: tickets.length,
          upcoming: tickets.filter(t => new Date(t.event.start_datetime) > now).length,
          past: tickets.filter(t => new Date(t.event.start_datetime) <= now).length,
          active: tickets.filter(t => t.status === 'active').length,
        };
      }
    },
  });
}

// Mock data for development
function getMockUserTickets(filters?: TicketFilters): UserTicket[] {
  const now = new Date();
  const allTickets: UserTicket[] = [
    {
      id: 1,
      user_id: 1,
      ticket_id: 1,
      event_id: 1,
      purchase_id: 1,
      qr_code: 'TICKET-001-QR',
      status: 'active',
      created_at: '2025-01-15T10:00:00Z',
      updated_at: '2025-01-15T10:00:00Z',
      event: {
        id: 1,
        title: 'Lagos Tech Summit 2025',
        description: 'The biggest tech conference in West Africa',
        category_id: 1,
        venue_id: 1,
        organizer_id: 1,
        start_datetime: '2025-03-20T09:00:00Z',
        end_datetime: '2025-03-22T18:00:00Z',
        image_url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87',
        is_free: false,
        status: 'published',
        event_type: 'live',
        created_at: '2025-01-10T00:00:00Z',
        updated_at: '2025-01-10T00:00:00Z',
        venue: {
          id: 1,
          name: 'Eko Convention Centre',
          address: '1 Water Corporation Drive',
          city: 'Lagos',
          state: 'Lagos',
          country: 'Nigeria',
          capacity: 5000,
        },
        organizer: {
          id: 1,
          name: 'Tech Events Nigeria',
          email: 'info@techevents.ng',
          is_verified: true,
        },
        category: {
          id: 1,
          name: 'Technology',
          slug: 'technology',
          icon: '💻',
        },
        tickets: [],
      },
      ticket: {
        id: 1,
        event_id: 1,
        name: 'VIP Access',
        description: 'Full access to all sessions and networking events',
        price: 50000,
        quantity_available: 100,
        quantity_sold: 45,
        is_available: true,
      },
    },
    {
      id: 2,
      user_id: 1,
      ticket_id: 2,
      event_id: 2,
      purchase_id: 2,
      qr_code: 'TICKET-002-QR',
      status: 'active',
      created_at: '2025-01-18T14:30:00Z',
      updated_at: '2025-01-18T14:30:00Z',
      event: {
        id: 2,
        title: 'Afrobeats Live Concert',
        description: 'Experience the best of Afrobeats music',
        category_id: 2,
        venue_id: 2,
        organizer_id: 2,
        start_datetime: '2025-02-14T20:00:00Z',
        end_datetime: '2025-02-15T02:00:00Z',
        image_url: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3',
        is_free: false,
        status: 'published',
        event_type: 'live',
        created_at: '2025-01-05T00:00:00Z',
        updated_at: '2025-01-05T00:00:00Z',
        venue: {
          id: 2,
          name: 'Muri Okunola Park',
          address: 'Victoria Island',
          city: 'Lagos',
          state: 'Lagos',
          country: 'Nigeria',
          capacity: 10000,
        },
        organizer: {
          id: 2,
          name: 'Lagos Events Co',
          email: 'info@lagosevents.ng',
          is_verified: true,
        },
        category: {
          id: 2,
          name: 'Music',
          slug: 'music',
          icon: '🎵',
        },
        tickets: [],
      },
      ticket: {
        id: 2,
        event_id: 2,
        name: 'General Admission',
        description: 'Standing area access',
        price: 15000,
        quantity_available: 500,
        quantity_sold: 320,
        is_available: true,
      },
    },
    {
      id: 3,
      user_id: 1,
      ticket_id: 3,
      event_id: 3,
      purchase_id: 3,
      qr_code: 'TICKET-003-QR',
      status: 'used',
      checked_in_at: '2024-12-10T10:30:00Z',
      created_at: '2024-12-05T16:00:00Z',
      updated_at: '2024-12-10T10:30:00Z',
      event: {
        id: 3,
        title: 'Digital Marketing Workshop',
        description: 'Learn advanced digital marketing strategies',
        category_id: 3,
        venue_id: 3,
        organizer_id: 3,
        start_datetime: '2024-12-10T10:00:00Z',
        end_datetime: '2024-12-10T17:00:00Z',
        image_url: 'https://images.unsplash.com/photo-1557804506-669a67965ba0',
        is_free: true,
        status: 'completed',
        event_type: 'hybrid',
        created_at: '2024-11-20T00:00:00Z',
        updated_at: '2024-12-11T00:00:00Z',
        venue: {
          id: 3,
          name: 'Co-Creation Hub',
          address: '294 Herbert Macaulay Way',
          city: 'Lagos',
          state: 'Lagos',
          country: 'Nigeria',
          capacity: 150,
        },
        organizer: {
          id: 3,
          name: 'Digital Skills Academy',
          email: 'info@digitalskills.ng',
          is_verified: true,
        },
        category: {
          id: 3,
          name: 'Business',
          slug: 'business',
          icon: '💼',
        },
        tickets: [],
      },
      ticket: {
        id: 3,
        event_id: 3,
        name: 'Workshop Seat',
        description: 'Free workshop attendance',
        price: 0,
        quantity_available: 150,
        quantity_sold: 150,
        is_available: false,
      },
    },
  ];

  let filtered = allTickets;

  // Apply filters
  if (filters?.status) {
    filtered = filtered.filter(t => t.status === filters.status);
  }

  if (filters?.event_status === 'upcoming') {
    filtered = filtered.filter(t => new Date(t.event.start_datetime) > now);
  } else if (filters?.event_status === 'past') {
    filtered = filtered.filter(t => new Date(t.event.start_datetime) <= now);
  }

  if (filters?.search) {
    const searchLower = filters.search.toLowerCase();
    filtered = filtered.filter(t =>
      t.event.title.toLowerCase().includes(searchLower) ||
      t.event.venue.name.toLowerCase().includes(searchLower)
    );
  }

  return filtered;
}
