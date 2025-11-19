export interface Event {
  id: number;
  title: string;
  description: string;
  category_id: number;
  venue_id: number;
  organizer_id: number;
  start_datetime: string; // ISO 8601
  end_datetime: string;
  image_url: string;
  is_free: boolean;
  status: EventStatus;
  event_type: EventType;
  external_url?: string;
  created_at: string;
  updated_at: string;

  // Relations
  venue: Venue;
  organizer: Organizer;
  category: Category;
  tickets: Ticket[];
  favorite_count?: number;
}

export type EventStatus = 'draft' | 'published' | 'cancelled' | 'completed';
export type EventType = 'live' | 'online' | 'hybrid';

export interface Venue {
  id: number;
  name: string;
  address: string;
  city: string;
  state: string;
  country: string;
  capacity?: number;
  latitude?: number;
  longitude?: number;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface Organizer {
  id: number;
  name: string;
  email: string;
  phone?: string;
  logo_url?: string;
  is_verified?: boolean;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  icon?: string;
}

export interface Ticket {
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

export interface EventFilters {
  category_id?: number;
  city?: string;
  search?: string;
  event_type?: EventType;
  is_free?: boolean;
  start_date?: string;
  end_date?: string;
}
