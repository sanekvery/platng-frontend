'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useUserTickets, useTicketStats } from '@/hooks/useTickets';
import { TicketCard } from '@/components/tickets/TicketCard';
import { Ticket, Calendar, TrendingUp, Search, Filter } from 'lucide-react';
import { TicketFilters, UserTicket } from '@/types/ticket';

export default function TicketsPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  const [filters, setFilters] = useState<TicketFilters>({
    event_status: 'upcoming',
  });
  const [searchQuery, setSearchQuery] = useState('');

  const { data: tickets, isLoading } = useUserTickets(filters);
  const { data: stats } = useTicketStats();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/tickets');
    }
  }, [isAuthenticated, router]);

  // Apply search filter locally
  const filteredTickets = tickets?.filter((ticket: UserTicket) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      ticket.event.title.toLowerCase().includes(query) ||
      ticket.event.venue.name.toLowerCase().includes(query) ||
      ticket.event.venue.city.toLowerCase().includes(query)
    );
  });

  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12 pt-8">
      <div className="container mx-auto max-w-7xl px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-gray-900 md:text-4xl">
            My Tickets
          </h1>
          <p className="text-gray-600">
            View and manage your event tickets
          </p>
        </div>

        {/* Statistics Cards */}
        {stats && (
          <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl bg-white p-6 shadow-md">
              <div className="mb-2 flex items-center gap-3">
                <div className="rounded-lg bg-brand-primary/10 p-3">
                  <Ticket className="h-6 w-6 text-brand-primary" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Tickets</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-white p-6 shadow-md">
              <div className="mb-2 flex items-center gap-3">
                <div className="rounded-lg bg-blue-500/10 p-3">
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Upcoming</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.upcoming}</p>
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-white p-6 shadow-md">
              <div className="mb-2 flex items-center gap-3">
                <div className="rounded-lg bg-green-500/10 p-3">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Active</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-white p-6 shadow-md">
              <div className="mb-2 flex items-center gap-3">
                <div className="rounded-lg bg-gray-500/10 p-3">
                  <Calendar className="h-6 w-6 text-gray-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Past Events</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.past}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters and Search */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Search */}
          <div className="relative flex-1 sm:max-w-md">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search tickets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilters({ ...filters, event_status: undefined })}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                !filters.event_status
                  ? 'bg-brand-primary text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilters({ ...filters, event_status: 'upcoming' })}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                filters.event_status === 'upcoming'
                  ? 'bg-brand-primary text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Upcoming
            </button>
            <button
              onClick={() => setFilters({ ...filters, event_status: 'past' })}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                filters.event_status === 'past'
                  ? 'bg-brand-primary text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Past
            </button>

            {/* Status Filter */}
            <div className="relative">
              <select
                value={filters.status || ''}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    status: e.target.value ? (e.target.value as any) : undefined,
                  })
                }
                className="appearance-none rounded-lg border border-gray-300 bg-white py-2 pl-3 pr-10 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="used">Used</option>
                <option value="cancelled">Cancelled</option>
                <option value="expired">Expired</option>
              </select>
              <Filter className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex min-h-[400px] items-center justify-center">
            <div className="text-center">
              <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-brand-primary border-t-transparent"></div>
              <p className="mt-4 text-gray-600">Loading your tickets...</p>
            </div>
          </div>
        )}

        {/* Tickets Grid */}
        {!isLoading && filteredTickets && filteredTickets.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredTickets.map((ticket: UserTicket) => (
              <TicketCard key={ticket.id} ticket={ticket} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredTickets && filteredTickets.length === 0 && (
          <div className="flex min-h-[400px] flex-col items-center justify-center rounded-xl bg-white p-12 shadow-md">
            <div className="mb-4 rounded-full bg-gray-100 p-6">
              <Ticket className="h-16 w-16 text-gray-400" />
            </div>
            <h3 className="mb-2 text-xl font-semibold text-gray-900">
              {searchQuery || filters.status || filters.event_status
                ? 'No tickets found'
                : 'No tickets yet'}
            </h3>
            <p className="mb-6 max-w-md text-center text-gray-600">
              {searchQuery || filters.status || filters.event_status
                ? 'Try adjusting your filters or search query'
                : 'Start by browsing upcoming events and booking tickets'}
            </p>
            <button
              onClick={() => router.push('/discover')}
              className="rounded-lg bg-brand-primary px-6 py-3 font-semibold text-white transition-colors hover:bg-brand-primary/90"
            >
              Discover Events
            </button>
          </div>
        )}

        {/* Help Text */}
        {!isLoading && filteredTickets && filteredTickets.length > 0 && (
          <div className="mt-8 rounded-lg bg-blue-50 p-4">
            <p className="text-sm text-blue-800">
              <strong>Tip:</strong> Show your QR code at the venue for quick check-in.
              Make sure to arrive early to avoid queues!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
