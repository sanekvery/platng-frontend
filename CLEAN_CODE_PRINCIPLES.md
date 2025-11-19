# Clean Code & Best Practices - PlatNG Frontend

**Принципы чистого кода и современные подходы для разработки**

---

## 🎯 Core Principles

### SOLID Principles
- **S**ingle Responsibility - каждый компонент/функция делает одно
- **O**pen/Closed - открыт для расширения, закрыт для модификации
- **L**iskov Substitution - наследники не ломают поведение
- **I**nterface Segregation - много маленьких интерфейсов
- **D**ependency Inversion - зависимость от абстракций

### DRY (Don't Repeat Yourself)
- Переиспользуемые компоненты
- Custom hooks для логики
- Утилиты для общих функций

### KISS (Keep It Simple, Stupid)
- Простые решения вместо сложных
- Читаемый код > умный код
- Избегаем преждевременной оптимизации

---

## 📁 Project Architecture

### Feature-Sliced Design (FSD)
```
src/
├── app/              # Next.js routes (pages)
├── components/       # Shared UI components
│   ├── ui/          # Base components (Button, Input)
│   └── features/    # Business logic components
├── hooks/           # Reusable React hooks
├── lib/             # Business logic, utilities
├── store/           # State management (Zustand)
├── types/           # TypeScript types
└── constants/       # App constants
```

### Separation of Concerns
- **Presentation** - компоненты только UI
- **Business Logic** - в hooks и lib
- **State** - в Zustand stores
- **API** - изолированные клиенты

---

## 🧩 Component Best Practices

### 1. Component Structure
```typescript
// ✅ GOOD: Clear, single responsibility
interface EventCardProps {
  event: Event;
  onFavorite?: (id: number) => void;
}

export function EventCard({ event, onFavorite }: EventCardProps) {
  const { formatDate } = useDateFormatter();
  const { formatCurrency } = useCurrencyFormatter();

  return (
    <Card>
      <EventImage src={event.image_url} alt={event.title} />
      <EventDetails>
        <Title>{event.title}</Title>
        <Date>{formatDate(event.start_datetime)}</Date>
        <Price>{formatCurrency(event.price)}</Price>
      </EventDetails>
      {onFavorite && (
        <FavoriteButton onClick={() => onFavorite(event.id)} />
      )}
    </Card>
  );
}

// ❌ BAD: Multiple responsibilities, no types
export function EventCard(props) {
  const [favorite, setFavorite] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleFavorite = async () => {
    setLoading(true);
    try {
      await fetch('/api/favorites', {
        method: 'POST',
        body: JSON.stringify({ id: props.event.id })
      });
      setFavorite(true);
    } catch (error) {
      console.log(error);
    }
    setLoading(false);
  };

  return <div>...</div>;
}
```

### 2. Component Composition over Props Drilling
```typescript
// ✅ GOOD: Composition
<Card>
  <CardHeader>
    <CardTitle>{event.title}</CardTitle>
    <FavoriteButton eventId={event.id} />
  </CardHeader>
  <CardContent>
    <EventDate date={event.start_datetime} />
    <EventVenue venue={event.venue} />
  </CardContent>
</Card>

// ❌ BAD: Props drilling
<Card
  title={event.title}
  showFavorite={true}
  eventId={event.id}
  date={event.start_datetime}
  venue={event.venue}
  showVenue={true}
/>
```

### 3. Extract Complex Logic to Hooks
```typescript
// ✅ GOOD: Custom hook
function useEventFavorite(eventId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      return favoritesAPI.post('/favorites', { event_id: eventId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['favorites']);
      toast.success('Added to favorites');
    },
    onError: (error) => {
      toast.error('Failed to add favorite');
      logError(error);
    }
  });
}

// Usage
function EventCard({ event }: EventCardProps) {
  const { mutate: addToFavorite, isPending } = useEventFavorite(event.id);

  return (
    <FavoriteButton onClick={addToFavorite} isLoading={isPending} />
  );
}
```

---

## 🎨 TypeScript Best Practices

### 1. Type Safety
```typescript
// ✅ GOOD: Strict types
interface Event {
  id: number;
  title: string;
  start_datetime: string; // ISO 8601
  venue: Venue;
  tickets: Ticket[];
  is_free: boolean;
}

interface Venue {
  id: number;
  name: string;
  city: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

// ❌ BAD: Any types
interface Event {
  id: any;
  title: any;
  venue: any;
}
```

### 2. Type Guards
```typescript
// ✅ GOOD: Type guards
function isOnlineEvent(event: Event): event is OnlineEvent {
  return event.type === 'online' && 'stream_url' in event;
}

function EventDetails({ event }: { event: Event }) {
  if (isOnlineEvent(event)) {
    return <StreamLink url={event.stream_url} />;
  }
  return <VenueMap venue={event.venue} />;
}
```

### 3. Discriminated Unions
```typescript
// ✅ GOOD: Discriminated unions
type ApiResponse<T> =
  | { status: 'loading' }
  | { status: 'error'; error: Error }
  | { status: 'success'; data: T };

function EventList() {
  const response = useEvents();

  switch (response.status) {
    case 'loading':
      return <Skeleton />;
    case 'error':
      return <ErrorMessage error={response.error} />;
    case 'success':
      return <EventGrid events={response.data} />;
  }
}
```

---

## 🔧 React Query Best Practices

### 1. Query Keys Organization
```typescript
// ✅ GOOD: Organized query keys
export const queryKeys = {
  events: {
    all: ['events'] as const,
    lists: () => [...queryKeys.events.all, 'list'] as const,
    list: (filters: EventFilters) =>
      [...queryKeys.events.lists(), filters] as const,
    details: () => [...queryKeys.events.all, 'detail'] as const,
    detail: (id: number) =>
      [...queryKeys.events.details(), id] as const,
  },
  favorites: {
    all: ['favorites'] as const,
    list: () => [...queryKeys.favorites.all, 'list'] as const,
  }
};

// Usage
useQuery({
  queryKey: queryKeys.events.detail(eventId),
  queryFn: () => getEventById(eventId),
});
```

### 2. Custom Hooks for Queries
```typescript
// ✅ GOOD: Encapsulated query logic
export function useEvent(eventId: number) {
  return useQuery({
    queryKey: queryKeys.events.detail(eventId),
    queryFn: async () => {
      const { data } = await eventAPI.get(`/events/${eventId}`);
      return eventSchema.parse(data); // Zod validation
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!eventId,
  });
}

// Usage
function EventDetailsPage({ params }: { params: { id: string } }) {
  const { data: event, isLoading, error } = useEvent(Number(params.id));

  if (isLoading) return <EventSkeleton />;
  if (error) return <ErrorBoundary error={error} />;
  if (!event) return <NotFound />;

  return <EventDetails event={event} />;
}
```

---

## 🎭 State Management with Zustand

### 1. Slice Pattern
```typescript
// ✅ GOOD: Focused stores
interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;

  setUser: (user: User) => void;
  setAccessToken: (token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,

      setUser: (user) => set({ user, isAuthenticated: true }),
      setAccessToken: (accessToken) => set({ accessToken }),
      logout: () => set({ user: null, accessToken: null, isAuthenticated: false }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user }), // Don't persist token
    }
  )
);
```

### 2. Selectors
```typescript
// ✅ GOOD: Granular selectors
function UserProfile() {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!isAuthenticated) return <LoginPrompt />;
  return <Profile user={user} />;
}

// ❌ BAD: Subscribe to entire store
function UserProfile() {
  const { user, accessToken, isAuthenticated, logout } = useAuthStore();
  // Re-renders on ANY state change
}
```

---

## 🛡️ Error Handling

### 1. Error Boundaries
```typescript
// ✅ GOOD: Error boundary component
'use client';

interface ErrorBoundaryProps {
  error: Error;
  reset: () => void;
}

export function ErrorBoundary({ error, reset }: ErrorBoundaryProps) {
  useEffect(() => {
    logErrorToService(error);
  }, [error]);

  return (
    <div className="error-container">
      <h2>Something went wrong</h2>
      <p>{error.message}</p>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
```

### 2. API Error Handling
```typescript
// ✅ GOOD: Typed errors
class ApiError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function fetchEvents(): Promise<Event[]> {
  try {
    const { data } = await eventAPI.get('/events');
    return eventsSchema.parse(data);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new ApiError(
        error.response?.status || 500,
        error.response?.data?.message || 'Failed to fetch events',
        error.response?.data
      );
    }
    throw error;
  }
}
```

---

## 🎨 Styling Best Practices

### 1. Tailwind Utilities
```typescript
// ✅ GOOD: Utility classes with cn()
import { cn } from '@/lib/utils';

interface ButtonProps {
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Button({ variant = 'primary', size = 'md', className }: ButtonProps) {
  return (
    <button
      className={cn(
        'rounded-lg font-semibold transition-colors',
        {
          'bg-brand-primary text-white hover:bg-brand-primary/90': variant === 'primary',
          'bg-gray-200 text-gray-900 hover:bg-gray-300': variant === 'secondary',
        },
        {
          'px-3 py-1.5 text-sm': size === 'sm',
          'px-4 py-2 text-base': size === 'md',
          'px-6 py-3 text-lg': size === 'lg',
        },
        className
      )}
    />
  );
}
```

### 2. CSS Variables for Theming
```css
/* ✅ GOOD: CSS variables */
:root {
  --color-brand-primary: #1E40AF;
  --color-brand-orange: #FF6B35;
  --color-naira-green: #008751;
  --spacing-touch-target: 44px;
}

/* Tailwind config */
theme: {
  extend: {
    colors: {
      brand: {
        primary: 'var(--color-brand-primary)',
        orange: 'var(--color-brand-orange)',
      }
    }
  }
}
```

---

## 🧪 Testing Best Practices

### 1. Component Testing
```typescript
// ✅ GOOD: Test behavior, not implementation
import { render, screen, userEvent } from '@testing-library/react';
import { EventCard } from './EventCard';

describe('EventCard', () => {
  const mockEvent: Event = {
    id: 1,
    title: 'Tech Conference',
    start_datetime: '2025-12-01T10:00:00Z',
    venue: { name: 'Eko Hotel', city: 'Lagos' },
    is_free: false,
    tickets: [{ price: 5000 }],
  };

  it('should display event information', () => {
    render(<EventCard event={mockEvent} />);

    expect(screen.getByText('Tech Conference')).toBeInTheDocument();
    expect(screen.getByText('Eko Hotel')).toBeInTheDocument();
    expect(screen.getByText(/₦5,000/)).toBeInTheDocument();
  });

  it('should call onFavorite when favorite button is clicked', async () => {
    const onFavorite = vi.fn();
    render(<EventCard event={mockEvent} onFavorite={onFavorite} />);

    const favoriteButton = screen.getByRole('button', { name: /favorite/i });
    await userEvent.click(favoriteButton);

    expect(onFavorite).toHaveBeenCalledWith(1);
  });
});
```

### 2. Hook Testing
```typescript
// ✅ GOOD: Test hooks in isolation
import { renderHook, waitFor } from '@testing-library/react';
import { useEvents } from './useEvents';

describe('useEvents', () => {
  it('should fetch events successfully', async () => {
    const { result } = renderHook(() => useEvents({ city: 'Lagos' }));

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toHaveLength(10);
    expect(result.current.data[0]).toHaveProperty('title');
  });
});
```

---

## 📝 Code Documentation

### 1. JSDoc for Complex Functions
```typescript
// ✅ GOOD: Clear documentation
/**
 * Formats a Nigerian phone number to international format
 * @param phone - Phone number in any format (e.g., "0803123456", "803123456")
 * @returns Formatted phone number with +234 prefix
 * @example
 * formatNigerianPhone("0803123456") // "+2348031234567"
 * formatNigerianPhone("8031234567") // "+2348031234567"
 */
export function formatNigerianPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('0')) {
    return `+234${cleaned.slice(1)}`;
  }
  return `+234${cleaned}`;
}
```

### 2. README for Features
```markdown
# Feature: Event Favorites

## Overview
Allows users to save events for later viewing.

## Components
- `FavoriteButton` - Toggle favorite status
- `FavoritesList` - Display user's favorites

## Hooks
- `useFavorites()` - Fetch user favorites
- `useFavoriteToggle(eventId)` - Add/remove favorite

## API
- `POST /api/v1/favorites` - Add favorite
- `DELETE /api/v1/favorites/:id` - Remove favorite
- `GET /api/v1/favorites` - Get user favorites
```

---

## 🚀 Performance Best Practices

### 1. Code Splitting
```typescript
// ✅ GOOD: Dynamic imports
const EventMap = dynamic(() => import('./EventMap'), {
  loading: () => <MapSkeleton />,
  ssr: false, // Don't render on server
});

const PaymentModal = dynamic(() => import('./PaymentModal'), {
  loading: () => <Spinner />,
});
```

### 2. Memoization
```typescript
// ✅ GOOD: Memoize expensive calculations
function EventList({ events, filters }: EventListProps) {
  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      if (filters.city && event.venue.city !== filters.city) return false;
      if (filters.category && event.category_id !== filters.category) return false;
      return true;
    });
  }, [events, filters]);

  return <EventGrid events={filteredEvents} />;
}
```

### 3. Image Optimization
```typescript
// ✅ GOOD: Next.js Image with proper sizes
import Image from 'next/image';

function EventImage({ src, alt }: { src: string; alt: string }) {
  return (
    <Image
      src={src}
      alt={alt}
      width={400}
      height={300}
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      loading="lazy"
      placeholder="blur"
      blurDataURL={BLUR_DATA_URL}
    />
  );
}
```

---

## 📦 Naming Conventions

### Files
- Components: `PascalCase.tsx` (e.g., `EventCard.tsx`)
- Hooks: `camelCase.ts` (e.g., `useEvents.ts`)
- Utils: `camelCase.ts` (e.g., `formatDate.ts`)
- Types: `camelCase.ts` (e.g., `event.ts`)
- Constants: `UPPER_SNAKE_CASE.ts` or `camelCase.ts`

### Variables & Functions
- Variables: `camelCase`
- Functions: `camelCase`
- Components: `PascalCase`
- Types/Interfaces: `PascalCase`
- Constants: `UPPER_SNAKE_CASE`

### Boolean Variables
```typescript
// ✅ GOOD: Clear boolean names
const isLoading = true;
const hasError = false;
const canEdit = true;
const shouldRender = false;

// ❌ BAD: Unclear
const loading = true;
const error = false;
```

---

## 🎯 Code Review Checklist

- [ ] TypeScript strict mode enabled
- [ ] No `any` types (use `unknown` if needed)
- [ ] Components are single-responsibility
- [ ] Business logic in hooks/lib, not components
- [ ] Error boundaries implemented
- [ ] Loading states handled
- [ ] Mobile-first responsive
- [ ] Accessibility (a11y) considered
- [ ] Performance optimized (memoization, code splitting)
- [ ] Tests written for critical paths
- [ ] No console.logs in production
- [ ] Proper error logging
- [ ] Clean git commits

---

**Last Updated**: November 17, 2025
**Version**: 1.0.0
