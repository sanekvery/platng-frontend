import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { paymentsAPI } from '@/lib/api/axios-instance';
import type { Purchase, TicketType } from '@/types/ticket';

/**
 * Query keys for orders/purchases
 */
export const orderKeys = {
  all: ['orders'] as const,
  lists: () => [...orderKeys.all, 'list'] as const,
  details: () => [...orderKeys.all, 'detail'] as const,
  detail: (id: number) => [...orderKeys.details(), id] as const,
};

/**
 * Order creation request payload
 */
export interface CreateOrderRequest {
  event_id: number;
  tickets: {
    ticket_type_id: number;
    quantity: number;
  }[];
  customer_info: {
    email: string;
    phone: string;
    full_name: string;
  };
}

/**
 * Order creation response
 */
export interface CreateOrderResponse {
  order: Purchase;
  payment_intent?: {
    reference: string;
    authorization_url?: string;
  };
}

/**
 * Payment verification request
 */
export interface VerifyPaymentRequest {
  reference: string;
}

/**
 * Payment verification response
 */
export interface VerifyPaymentResponse {
  status: 'success' | 'failed' | 'pending';
  order: Purchase;
  message?: string;
}

/**
 * Create a new order
 *
 * This mutation creates an order in the backend before initiating payment.
 * After order creation, use the payment reference to process Paystack payment.
 *
 * @returns Mutation function for creating orders
 *
 * @example
 * ```ts
 * const { mutate: createOrder, isPending } = useCreateOrder();
 *
 * createOrder({
 *   event_id: 123,
 *   tickets: [
 *     { ticket_type_id: 1, quantity: 2 },
 *     { ticket_type_id: 2, quantity: 1 }
 *   ],
 *   customer_info: {
 *     email: 'user@example.com',
 *     phone: '+2348012345678',
 *     full_name: 'John Doe'
 *   }
 * }, {
 *   onSuccess: (data) => {
 *     // Use data.payment_intent.reference for Paystack
 *     console.log('Order created:', data.order.id);
 *   }
 * });
 * ```
 */
export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderData: CreateOrderRequest) => {
      const { data } = await paymentsAPI.post<CreateOrderResponse>('/orders', orderData);
      return data;
    },
    onSuccess: (data) => {
      // Invalidate orders list
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });

      // Prefill order detail cache
      if (data.order) {
        queryClient.setQueryData(orderKeys.detail(data.order.id), data.order);
      }
    },
  });
}

/**
 * Verify Paystack payment and update order status
 *
 * This mutation verifies the payment with Paystack and updates the order
 * status in the backend. Call this after Paystack callback with the reference.
 *
 * @returns Mutation function for payment verification
 *
 * @example
 * ```ts
 * const { mutate: verifyPayment, isPending } = useVerifyPayment();
 *
 * // After Paystack callback with reference
 * verifyPayment({ reference: 'xyz123' }, {
 *   onSuccess: (data) => {
 *     if (data.status === 'success') {
 *       console.log('Payment verified!', data.order);
 *     }
 *   }
 * });
 * ```
 */
export function useVerifyPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: VerifyPaymentRequest) => {
      const { data } = await paymentsAPI.post<VerifyPaymentResponse>(
        '/orders/verify-payment',
        request
      );
      return data;
    },
    onSuccess: (data) => {
      // Invalidate orders list
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });

      // Update order detail cache
      if (data.order) {
        queryClient.setQueryData(orderKeys.detail(data.order.id), data.order);
      }

      // Invalidate tickets list (user now has new tickets)
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
    },
  });
}

/**
 * Get order by ID
 *
 * @param id - Order ID
 * @returns Order details
 *
 * @example
 * ```ts
 * const { data: order, isLoading } = useOrder(123);
 * ```
 */
export function useOrder(id: number) {
  return useQuery({
    queryKey: orderKeys.detail(id),
    queryFn: async () => {
      const { data } = await paymentsAPI.get<Purchase>(`/orders/${id}`);
      return data;
    },
    enabled: !!id && id > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Get user's order history
 *
 * @returns List of user's orders
 *
 * @example
 * ```ts
 * const { data: orders, isLoading } = useOrders();
 * ```
 */
export function useOrders() {
  return useQuery({
    queryKey: orderKeys.lists(),
    queryFn: async () => {
      const { data } = await paymentsAPI.get<{ orders: Purchase[] }>('/orders');
      return data.orders;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Calculate order total from ticket selections
 *
 * Utility function to calculate total amount before creating order
 *
 * @param tickets - Array of ticket types
 * @param selections - Map of ticket type ID to quantity
 * @returns Total amount in Naira
 *
 * @example
 * ```ts
 * const total = calculateOrderTotal(
 *   event.ticket_types,
 *   { 1: 2, 2: 1 } // 2 of ticket type 1, 1 of ticket type 2
 * );
 * ```
 */
export function calculateOrderTotal(
  tickets: TicketType[],
  selections: Record<number, number>
): number {
  return tickets.reduce((total, ticket) => {
    const quantity = selections[ticket.id] || 0;
    return total + (ticket.price * quantity);
  }, 0);
}

/**
 * Validate ticket availability before order creation
 *
 * @param tickets - Array of ticket types
 * @param selections - Map of ticket type ID to quantity
 * @returns Validation result with errors if any
 *
 * @example
 * ```ts
 * const validation = validateTicketSelection(
 *   event.ticket_types,
 *   { 1: 2, 2: 100 }
 * );
 *
 * if (!validation.valid) {
 *   console.error(validation.errors);
 * }
 * ```
 */
export function validateTicketSelection(
  tickets: TicketType[],
  selections: Record<number, number>
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  for (const ticket of tickets) {
    const quantity = selections[ticket.id] || 0;

    if (quantity > 0) {
      // Check availability
      if (!ticket.is_available) {
        errors.push(`${ticket.name} is not available for purchase`);
      }

      // Check quantity
      const available = ticket.quantity_available - ticket.quantity_sold;
      if (quantity > available) {
        errors.push(
          `Only ${available} ${ticket.name} ticket${available !== 1 ? 's' : ''} available (requested ${quantity})`
        );
      }

      // Check sale dates
      if (ticket.sale_start_date) {
        const startDate = new Date(ticket.sale_start_date);
        if (new Date() < startDate) {
          errors.push(`${ticket.name} sales start on ${startDate.toLocaleDateString()}`);
        }
      }

      if (ticket.sale_end_date) {
        const endDate = new Date(ticket.sale_end_date);
        if (new Date() > endDate) {
          errors.push(`${ticket.name} sales ended on ${endDate.toLocaleDateString()}`);
        }
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
