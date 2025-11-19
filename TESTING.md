# Testing Guide

**PlatNG Frontend Testing Setup**

## 📋 Overview

This project uses **Vitest** for unit testing and **React Testing Library** for component testing.

---

## 🚀 Quick Start

### Run All Tests
```bash
npm test
```

### Watch Mode (for development)
```bash
npm test -- --watch
```

### UI Mode (visual test runner)
```bash
npm run test:ui
```

### Coverage Report
```bash
npm run test:coverage
```

---

## 📁 Test Structure

```
__tests__/
├── components/         # Component tests
│   └── EventCard.test.tsx
├── hooks/             # Custom hooks tests
│   └── useOrders.test.ts
└── lib/               # Utility functions tests
    └── utils.test.ts
```

---

## ✅ What's Tested

### Unit Tests (100% passing)
- ✅ **useOrders hook** (10 tests)
  - `validateTicketSelection()` - 5 tests
  - `calculateOrderTotal()` - 5 tests
- ✅ **Utils** (7 tests)
  - `formatNaira()` - 4 tests
  - `formatEventDate()` - 3 tests

### Component Tests (in progress)
- 🔄 **EventCard** (10 tests written)

---

## 🔧 Configuration

### vitest.config.ts
```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
});
```

### vitest.setup.ts
Mocks:
- `next/navigation` - Router hooks
- `next-intl` - Internationalization
- `@/i18n/routing` - Custom routing
- `window.matchMedia` - Media queries

---

## 📝 Writing Tests

### Example: Testing a Utility Function

```typescript
import { describe, it, expect } from 'vitest';
import { formatNaira } from '@/lib/utils';

describe('formatNaira', () => {
  it('formats numbers correctly', () => {
    expect(formatNaira(1000)).toBe('₦1,000');
    expect(formatNaira(5000)).toBe('₦5,000');
  });

  it('handles zero', () => {
    expect(formatNaira(0)).toBe('₦0');
  });
});
```

### Example: Testing a Custom Hook

```typescript
import { describe, it, expect } from 'vitest';
import { validateTicketSelection } from '@/hooks/useOrders';

describe('validateTicketSelection', () => {
  const mockTickets = [
    {
      id: 1,
      name: 'VIP',
      price: 15000,
      quantity_available: 50,
      quantity_sold: 45,
      is_available: true,
    },
  ];

  it('validates successful selection', () => {
    const result = validateTicketSelection(mockTickets, { 1: 2 });
    expect(result.valid).toBe(true);
  });

  it('rejects exceeding quantity', () => {
    const result = validateTicketSelection(mockTickets, { 1: 10 });
    expect(result.valid).toBe(false);
  });
});
```

### Example: Testing a Component

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { EventCard } from '@/components/events/EventCard';

describe('EventCard', () => {
  const mockEvent = {
    id: 1,
    title: 'Tech Conference',
    location: 'Lagos',
    // ... other props
  };

  it('renders event information', () => {
    render(<EventCard event={mockEvent} />);
    expect(screen.getByText('Tech Conference')).toBeInTheDocument();
  });
});
```

---

## 📊 Coverage Goals

| Category | Current | Goal |
|----------|---------|------|
| Hooks | 100% | 100% |
| Utils | 90% | 95% |
| Components | 30% | 70% |
| **Overall** | **60%** | **80%** |

---

## 🎯 Test Priorities

### High Priority
- ✅ Payment utilities (`useOrders`)
- ✅ Formatters (`formatNaira`, `formatEventDate`)
- 🔄 Checkout flow components
- 🔄 Auth store

### Medium Priority
- 🔄 Event components
- 🔄 Search functionality
- 🔄 Favorites hooks

### Low Priority
- ⏳ Layout components
- ⏳ Static pages
- ⏳ UI components (buttons, cards)

---

## 🐛 Common Issues

### Issue: "Cannot find module"
**Solution**: Check path aliases in `vitest.config.ts`

### Issue: "Invalid time value" in date tests
**Solution**: Use mock dates or valid ISO strings

### Issue: "window is not defined"
**Solution**: Use `jsdom` environment in config

---

## 📚 Resources

- [Vitest Docs](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

---

## 🚦 CI/CD Integration

### GitHub Actions Example
```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm test -- --run
      - run: npm run test:coverage
```

---

**Last Updated**: 2025-11-18
**Status**: ✅ Testing framework ready | 🔄 Expanding coverage
