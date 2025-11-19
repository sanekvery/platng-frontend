import { describe, it, expect } from 'vitest';
import { validateTicketSelection, calculateOrderTotal } from '@/hooks/useOrders';
import type { TicketType } from '@/types/ticket';

describe('validateTicketSelection', () => {
  const mockTickets: TicketType[] = [
    {
      id: 1,
      event_id: 1,
      name: 'VIP Ticket',
      description: 'VIP access',
      price: 15000,
      quantity_available: 50,
      quantity_sold: 45,
      is_available: true,
    },
    {
      id: 2,
      event_id: 1,
      name: 'Regular Ticket',
      description: 'Regular access',
      price: 5000,
      quantity_available: 100,
      quantity_sold: 80,
      is_available: true,
    },
  ];

  it('validates successful ticket selection', () => {
    const selections = { 1: 2, 2: 5 }; // 2 VIP, 5 Regular
    const result = validateTicketSelection(mockTickets, selections);

    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('rejects selection exceeding available quantity', () => {
    const selections = { 1: 10 }; // Only 5 VIP tickets available (50 - 45)
    const result = validateTicketSelection(mockTickets, selections);

    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors[0]).toContain('available');
  });

  it('rejects unavailable tickets', () => {
    const unavailableTickets: TicketType[] = [
      {
        ...mockTickets[0],
        is_available: false,
      },
    ];

    const selections = { 1: 1 };
    const result = validateTicketSelection(unavailableTickets, selections);

    expect(result.valid).toBe(false);
    expect(result.errors[0]).toContain('not available');
  });

  it('allows zero quantity selection', () => {
    const selections = { 1: 0, 2: 0 };
    const result = validateTicketSelection(mockTickets, selections);

    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('validates multiple ticket types correctly', () => {
    const selections = { 1: 3, 2: 10 };
    const result = validateTicketSelection(mockTickets, selections);

    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });
});

describe('calculateOrderTotal', () => {
  const mockTickets: TicketType[] = [
    {
      id: 1,
      event_id: 1,
      name: 'VIP Ticket',
      price: 15000,
      quantity_available: 50,
      quantity_sold: 0,
      is_available: true,
    },
    {
      id: 2,
      event_id: 1,
      name: 'Regular Ticket',
      price: 5000,
      quantity_available: 100,
      quantity_sold: 0,
      is_available: true,
    },
  ];

  it('calculates total for single ticket type', () => {
    const selections = { 1: 2 }; // 2 VIP tickets
    const total = calculateOrderTotal(mockTickets, selections);

    expect(total).toBe(30000); // 15000 * 2
  });

  it('calculates total for multiple ticket types', () => {
    const selections = { 1: 2, 2: 3 }; // 2 VIP + 3 Regular
    const total = calculateOrderTotal(mockTickets, selections);

    expect(total).toBe(45000); // (15000 * 2) + (5000 * 3)
  });

  it('returns zero for no selections', () => {
    const selections = {};
    const total = calculateOrderTotal(mockTickets, selections);

    expect(total).toBe(0);
  });

  it('ignores zero quantities', () => {
    const selections = { 1: 0, 2: 2 }; // 0 VIP + 2 Regular
    const total = calculateOrderTotal(mockTickets, selections);

    expect(total).toBe(10000); // 5000 * 2
  });

  it('handles large quantities correctly', () => {
    const selections = { 1: 10, 2: 20 };
    const total = calculateOrderTotal(mockTickets, selections);

    expect(total).toBe(250000); // (15000 * 10) + (5000 * 20)
  });
});
