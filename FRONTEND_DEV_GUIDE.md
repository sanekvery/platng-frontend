# PlatNG Frontend Development Guide

**Контекстный файл для Claude при разработке фронтенда**  
*Аналог CLAUDE(1).md для backend*

## 📋 Project Overview

**Project**: PlatNG Event Portal - Nigerian Market Event Discovery Platform  
**Frontend Stack**: Next.js 14 + TypeScript + Tailwind CSS + React Query + Zustand  
**Target**: 84% mobile users, 65% on 2G/3G networks, data-cost sensitive  
**Reference Design**: Tix.Africa (discover, wishlist, seamless checkout)  
**Backend**: 7 microservices running locally (Auth, Event, Scraper, Notification, Favorites, Partner, Config)  

---

## 🎯 Core Philosophy

### Mobile-First Principles
- **Performance**: FCP <2s on 3G, TTI <5s, total page <1MB
- **Network**: Optimize for 2G/3G (65% of users), aggressive caching
- **Touch**: 44px minimum touch targets, gesture-friendly UI
- **Data**: Minimize API calls, lazy load images, prefetch next page

### Nigerian Market Optimization
- **Currency**: ₦ (Naira) formatting with Intl.NumberFormat
- **Timezone**: Africa/Lagos (WAT UTC+1)
- **Date Format**: DD/MM/YYYY (not MM/DD/YYYY)
- **Phone**: +234 format, click-to-call, WhatsApp integration
- **Payments**: Paystack (primary) + Flutterwave (backup)
- **SMS**: Termii for OTP (₦1.70/SMS)

### UI/UX Patterns (inspired by Tix.Africa)
- **Discovery First**: Event cards grid, category filters, search
- **Wishlist/Favorites**: Save events for later, easy access
- **Seamless Checkout**: Minimal steps, Paystack inline
- **Ticket Storage**: All tickets in one place, QR codes
- **Progressive Enhancement**: Guest browsing → Register when needed

---

## 🏗️ Project Structure

```
platng-frontend/
├── public/
│   ├── icons/              # PWA icons (192x192, 512x512)
│   ├── images/             # Static images
│   └── manifest.json       # PWA manifest
├── src/
│   ├── app/                # Next.js 14 App Router
│   │   ├── [locale]/       # Internationalization wrapper
│   │   │   ├── layout.tsx      # Root layout with i18n
│   │   │   ├── page.tsx        # Home (/)
│   │   │   ├── (auth)/         # Auth routes group
│   │   │   │   ├── login/page.tsx
│   │   │   │   └── register/page.tsx
│   │   │   ├── discover/       # Events discovery
│   │   │   │   └── page.tsx
│   │   │   ├── events/
│   │   │   │   ├── page.tsx    # Events list
│   │   │   │   └── [id]/page.tsx  # Event details
│   │   │   ├── favorites/page.tsx
│   │   │   ├── tickets/page.tsx    # My tickets
│   │   │   ├── profile/page.tsx
│   │   │   └── checkout/[eventId]/page.tsx
│   ├── components/
│   │   ├── ui/             # Shadcn/ui base components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   └── ...
│   │   ├── EventCard.tsx
│   │   ├── EventList.tsx
│   │   ├── CategoryFilter.tsx
│   │   ├── SearchBar.tsx
│   │   └── Layout/
│   │       ├── Header.tsx
│   │       ├── Footer.tsx
│   │       └── MobileNav.tsx
│   ├── hooks/              # Custom React hooks
│   │   ├── useAuth.ts
│   │   ├── useEvents.ts
│   │   ├── useFavorites.ts
│   │   ├── useInfiniteScroll.ts
│   │   └── usePaystack.ts
│   ├── lib/                # Utilities & helpers
│   │   ├── api.ts          # Axios instances
│   │   ├── queryClient.ts  # React Query config
│   │   ├── utils.ts        # Helper functions
│   │   └── constants.ts    # App constants
│   ├── store/              # Zustand stores
│   │   ├── authStore.ts
│   │   └── uiStore.ts
│   ├── types/              # TypeScript types
│   │   ├── event.ts
│   │   ├── user.ts
│   │   └── api.ts
│   ├── i18n/               # Internationalization
│   │   ├── locales/
│   │   │   ├── en.json
│   │   │   └── ru.json
│   │   └── config.ts
│   └── styles/
│       └── globals.css
├── .env.local              # Environment variables
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## 🔧 Tech Stack Configuration

### Core Dependencies

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "next": "^14.0.0",
    "typescript": "^5.3.0",
    "@tanstack/react-query": "^5.0.0",
    "axios": "^1.6.0",
    "zustand": "^4.4.0",
    "zod": "^3.22.0",
    "react-hook-form": "^7.48.0",
    "@hookform/resolvers": "^3.3.0",
    "date-fns": "^2.30.0",
    "date-fns-tz": "^2.0.0",
    "lucide-react": "^0.294.0",
    "tailwindcss": "^3.4.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.0.0",
    "next-intl": "^3.0.0"
  }
}
```

### Environment Variables (.env.local)

```bash
# API URLs (все backend сервисы локально)
NEXT_PUBLIC_API_BASE_URL=http://localhost:5001
NEXT_PUBLIC_AUTH_API=http://localhost:5001/api/v1
NEXT_PUBLIC_EVENT_API=http://localhost:5002/api/v1
NEXT_PUBLIC_FAVORITES_API=http://localhost:5005/api/v1
NEXT_PUBLIC_NOTIFICATIONS_API=http://localhost:5004/api/v1
NEXT_PUBLIC_PARTNER_API=http://localhost:5006/api/v1

# Google OAuth
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id_here

# Paystack (Nigerian payments)
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_xxxxxxxxxxxxx

# App Config
NEXT_PUBLIC_APP_NAME=PlatNG
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_DEFAULT_LOCALE=en
```

---

## 🎨 Design System

### Colors (Tailwind Config)

```javascript
// tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        brand: {
          orange: '#FF6B35',  // Live events (like Tix)
          green: '#4CAF50',   // Online events
          primary: '#1E40AF', // Primary actions
          secondary: '#64748B',
        },
        naira: {
          green: '#008751',   // Nigerian currency color
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    }
  }
}
```

### Typography
- **Font**: Inter (Google Fonts) for clean, modern look
- **Sizes**: Mobile-first (16px base, 1.5 line-height)
- **Headings**: Bold 600-700, max 2-3 sizes for hierarchy

### Spacing
- **Touch Targets**: Minimum 44px (iOS) / 48px (Android)
- **Card Padding**: 16px mobile, 20px desktop
- **Grid Gap**: 16px mobile, 24px desktop

---

## 🔐 Authentication Implementation

### API Client Setup

```typescript
// lib/api.ts
import axios from 'axios';
import { authStore } from '@/store/authStore';

// Auth API (for login/register/refresh)
export const authAPI = axios.create({
  baseURL: process.env.NEXT_PUBLIC_AUTH_API,
  withCredentials: true, // For refresh token cookie
});

// Event API (with auth interceptor)
export const eventAPI = axios.create({
  baseURL: process.env.NEXT_PUBLIC_EVENT_API,
});

// Add access token to all requests
eventAPI.interceptors.request.use((config) => {
  const token = authStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto-refresh token on 401
eventAPI.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      try {
        // Try to refresh token
        const { data } = await authAPI.post('/auth/refresh');
        authStore.getState().setAccessToken(data.access_token);
        
        // Retry original request
        error.config.headers.Authorization = `Bearer ${data.access_token}`;
        return axios.request(error.config);
      } catch (refreshError) {
        // Refresh failed - logout user
        authStore.getState().logout();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

// Favorites API
export const favoritesAPI = axios.create({
  baseURL: process.env.NEXT_PUBLIC_FAVORITES_API,
});

favoritesAPI.interceptors.request.use((config) => {
  const token = authStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### Auth Store (Zustand)

```typescript
// store/authStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: number;
  email: string;
  full_name: string;
  phone: string;
}

interface AuthState {
  accessToken: string | null;
  user: User | null;
  setAccessToken: (token: string) => void;
  setUser: (user: User) => void;
  logout: () => void;
}

export const authStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      user: null,
      setAccessToken: (token) => set({ accessToken: token }),
      setUser: (user) => set({ user }),
      logout: () => {
        set({ accessToken: null, user: null });
        // Clear any other stored data
        localStorage.clear();
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user 
      }), // Don't persist token in localStorage
    }
  )
);
```

---

## 📡 API Integration with React Query

### Query Client Setup

```typescript
// lib/queryClient.ts
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 30, // 30 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});
```

### Custom Hooks Examples

```typescript
// hooks/useEvents.ts
import { useInfiniteQuery } from '@tanstack/react-query';
import { eventAPI } from '@/lib/api';

interface EventsParams {
  category_id?: number;
  city?: string;
  search?: string;
}

export function useEvents(params: EventsParams) {
  return useInfiniteQuery({
    queryKey: ['events', params],
    queryFn: async ({ pageParam = 0 }) => {
      const { data } = await eventAPI.get('/events', {
        params: { ...params, skip: pageParam, limit: 20 },
      });
      return data;
    },
    getNextPageParam: (lastPage, pages) => {
      const loadedCount = pages.length * 20;
      return loadedCount < lastPage.total ? loadedCount : undefined;
    },
  });
}

// hooks/useFavorites.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { favoritesAPI } from '@/lib/api';

export function useFavoriteEvent() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (eventId: number) => {
      const { data } = await favoritesAPI.post('/favorites', { 
        event_id: eventId 
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
  });
}

export function useUnfavoriteEvent() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (favoriteId: number) => {
      await favoritesAPI.delete(`/favorites/${favoriteId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
  });
}
```

---

## 🎭 Key Component Patterns

### EventCard Component

```typescript
// components/EventCard.tsx
import Image from 'next/image';
import { Heart } from 'lucide-react';
import { format } from 'date-fns';
import { formatNaira } from '@/lib/utils';
import { useFavoriteEvent } from '@/hooks/useFavorites';
import type { Event } from '@/types/event';

interface EventCardProps {
  event: Event;
  variant?: 'grid' | 'list';
}

export function EventCard({ event, variant = 'grid' }: EventCardProps) {
  const { mutate: addToFavorites, isPending } = useFavoriteEvent();
  
  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault(); // Don't navigate to event details
    addToFavorites(event.id);
  };
  
  return (
    <div className="relative rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
      {/* Event Image */}
      <div className="relative w-full aspect-video">
        <Image
          src={event.image_url}
          alt={event.title}
          fill
          className="object-cover"
          loading="lazy"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        
        {/* Favorite Button */}
        <button
          onClick={handleFavorite}
          disabled={isPending}
          className="absolute top-2 right-2 p-2 bg-white/90 rounded-full hover:bg-white transition-colors"
        >
          <Heart className="w-5 h-5" />
        </button>
      </div>
      
      {/* Event Details */}
      <div className="p-4">
        <h3 className="font-semibold text-lg line-clamp-2 mb-1">
          {event.title}
        </h3>
        
        <p className="text-sm text-gray-600">
          {format(new Date(event.start_datetime), 'EEE, MMM d • h:mm a')}
        </p>
        
        <p className="text-sm text-gray-600 line-clamp-1">
          {event.venue.name}
        </p>
        
        {/* Price */}
        <div className="mt-3 flex items-center justify-between">
          <span className="font-semibold text-lg">
            {event.is_free ? 'Free' : formatNaira(event.tickets[0]?.price || 0)}
          </span>
          
          <span className="text-xs text-gray-500">
            {event.favorite_count} favorites
          </span>
        </div>
      </div>
    </div>
  );
}
```

---

## 🌍 Internationalization (i18n)

### Setup with next-intl

```typescript
// i18n/config.ts
import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async ({ locale }) => ({
  messages: (await import(`./locales/${locale}.json`)).default
}));

// middleware.ts (route protection + i18n)
import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  locales: ['en', 'ru'],
  defaultLocale: 'en',
});

export const config = {
  matcher: ['/', '/(en|ru)/:path*']
};
```

### Translation Files

```json
// i18n/locales/en.json
{
  "common": {
    "discover": "Discover Events",
    "favorites": "My Favorites",
    "tickets": "My Tickets",
    "search": "Search events...",
    "viewAll": "View All"
  },
  "event": {
    "free": "Free",
    "getTickets": "Get Tickets",
    "addToFavorites": "Add to Favorites",
    "viewDetails": "View Details",
    "shareEvent": "Share Event"
  },
  "auth": {
    "login": "Log In",
    "register": "Sign Up",
    "logout": "Log Out",
    "email": "Email",
    "password": "Password",
    "forgotPassword": "Forgot Password?"
  }
}

// i18n/locales/ru.json
{
  "common": {
    "discover": "Открыть события",
    "favorites": "Избранное",
    "tickets": "Мои билеты",
    "search": "Поиск событий...",
    "viewAll": "Посмотреть все"
  },
  "event": {
    "free": "Бесплатно",
    "getTickets": "Получить билеты",
    "addToFavorites": "В избранное",
    "viewDetails": "Подробнее",
    "shareEvent": "Поделиться"
  },
  "auth": {
    "login": "Войти",
    "register": "Регистрация",
    "logout": "Выйти",
    "email": "Email",
    "password": "Пароль",
    "forgotPassword": "Забыли пароль?"
  }
}
```

---

## ⚡ Performance Optimization

### Image Optimization (Next.js)

```javascript
// next.config.js
module.exports = {
  images: {
    domains: ['cdn.platng.com', 's3.amazonaws.com'],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  // Compress output
  compress: true,
  // Enable SWC minification
  swcMinify: true,
};
```

### PWA Configuration

```javascript
// next.config.js
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/api\.platng\.com\/.*/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'api-cache',
        expiration: {
          maxEntries: 64,
          maxAgeSeconds: 24 * 60 * 60, // 24 hours
        },
      },
    },
    {
      urlPattern: /\.(?:png|jpg|jpeg|svg|webp)$/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'image-cache',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
        },
      },
    },
  ],
});

module.exports = withPWA({
  // ... other config
});
```

---

## 🧪 Testing Examples

### Component Test

```typescript
// __tests__/components/EventCard.test.tsx
import { render, screen } from '@testing-library/react';
import { EventCard } from '@/components/EventCard';

const mockEvent = {
  id: 1,
  title: 'Tech Conference Lagos',
  image_url: 'https://example.com/image.jpg',
  start_datetime: '2025-12-01T10:00:00Z',
  venue: { name: 'Eko Hotel', city: 'Lagos' },
  is_free: false,
  tickets: [{ price: 5000 }],
  favorite_count: 42,
};

describe('EventCard', () => {
  it('renders event details correctly', () => {
    render(<EventCard event={mockEvent} />);
    
    expect(screen.getByText('Tech Conference Lagos')).toBeInTheDocument();
    expect(screen.getByText('Eko Hotel')).toBeInTheDocument();
    expect(screen.getByText(/₦5,000/)).toBeInTheDocument();
  });

  it('shows "Free" for free events', () => {
    render(<EventCard event={{ ...mockEvent, is_free: true }} />);
    expect(screen.getByText('Free')).toBeInTheDocument();
  });
});
```

---

## 🚀 Development Workflow

### Daily Routine

1. **Start Backend** (if not running):
```bash
cd /workspace/PlatNG
docker-compose up -d
curl http://localhost:5001/health  # Verify
```

2. **Start Frontend**:
```bash
cd /workspace/platng-frontend
npm run dev
# Open http://localhost:3000
```

3. **Development Cycle**:
   - Create component
   - **Test in browser immediately** 👀
   - Write tests
   - Commit changes
   - Push to git

4. **Before Commits**:
```bash
npm run lint       # Check code quality
npm run test       # Run tests
npm run build      # Verify production build
```

---

## 🎯 Nigerian Market Helper Functions

```typescript
// lib/utils.ts

/** Format Nigerian Naira currency */
export function formatNaira(amount: number): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
  }).format(amount);
}

/** Format date in Nigerian timezone (WAT) */
export function formatEventDate(date: string): string {
  return formatInTimeZone(
    new Date(date),
    'Africa/Lagos',
    'EEE, MMM d • h:mm a'
  );
}

/** Format phone number to +234 format */
export function formatNigerianPhone(phone: string): string {
  // Remove any non-digits
  const cleaned = phone.replace(/\D/g, '');
  
  // If starts with 0, replace with 234
  if (cleaned.startsWith('0')) {
    return `+234${cleaned.slice(1)}`;
  }
  
  // If starts with 234, add +
  if (cleaned.startsWith('234')) {
    return `+${cleaned}`;
  }
  
  return `+234${cleaned}`;
}
```

---

## 📊 Performance Targets

### Core Web Vitals (on 3G)
- **LCP** (Largest Contentful Paint): <2.5s
- **FID** (First Input Delay): <100ms
- **CLS** (Cumulative Layout Shift): <0.1

### Nigerian Market Specific
- **FCP**: <2s on 3G
- **TTI**: <5s on 3G
- **Page Weight**: <1MB compressed
- **Image Load**: <1s with lazy loading

---

## 🆘 Common Issues & Solutions

### Backend Connection Issues
```bash
# Check if services are running
docker ps | grep platng

# Restart services if needed
docker-compose restart

# Check logs
docker-compose logs -f auth-service
```

### JWT Token Issues
- Check token in DevTools: Application → Local Storage
- Verify refresh token: Application → Cookies (should be httpOnly)
- Test token at https://jwt.io

### Build Errors
```bash
# Clear Next.js cache
rm -rf .next

# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Check for TypeScript errors
npm run type-check
```

---

## 📚 Key Resources

- **Backend API Docs**: http://localhost:5001/docs (Swagger)
- **Frontend Spec**: `/workspace/PlatNG/FRONTEND_TECHNICAL_SPEC.md`
- **Backend Context**: `/workspace/PlatNG/CLAUDE(1).md`
- **Tix Africa**: https://tix.africa/discover (design reference)
- **Next.js**: https://nextjs.org/docs
- **React Query**: https://tanstack.com/query/latest
- **Tailwind**: https://tailwindcss.com/docs

---

## ✅ Quick Commands

```bash
# Development
npm run dev              # Start dev server
npm run build           # Production build
npm run start           # Start production server
npm run lint            # Lint code
npm run type-check      # Check TypeScript

# Testing
npm run test            # Run tests
npm run test:watch      # Watch mode
npm run test:coverage   # Coverage report

# Performance
npm run lighthouse      # Lighthouse audit
npm run analyze         # Bundle analysis
```

---

**Ready to Build! 🚀**

**Current Phase**: Week 1 - Foundation Setup  
**Next Milestone**: Event Discovery Page Complete  
**Last Updated**: November 17, 2025
