import { Event } from './event';

export interface UserTicket {
  id: number;
  user_id: number;
  ticket_id: number;
  event_id: number;
  purchase_id: number;
  qr_code: string;
  status: TicketStatus;
  checked_in_at?: string;
  created_at: string;
  updated_at: string;

  // Relations
  event: Event;
  ticket: TicketType;
}

export interface TicketType {
  id: number;
  event_id: number;
  name: string;
  description?: string;
  price: number;
  quantity_available: number;
  quantity_sold: number;
  is_available: boolean;
  sale_start_date?: string;
  sale_end_date?: string;
}

export type TicketStatus = 'active' | 'used' | 'cancelled' | 'expired';

export interface Purchase {
  id: number;
  user_id: number;
  total_amount: number;
  payment_status: PaymentStatus;
  payment_method?: string;
  payment_reference?: string;
  created_at: string;
  updated_at: string;

  // Relations
  tickets: UserTicket[];
}

export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';

export interface TicketFilters {
  status?: TicketStatus;
  event_status?: 'upcoming' | 'past';
  search?: string;
}
