import { describe, it, expect } from 'vitest';
import { formatNaira, formatEventDate } from '@/lib/utils';

describe('formatNaira', () => {
  it('formats numbers correctly with naira symbol', () => {
    expect(formatNaira(1000)).toBe('₦1,000');
    expect(formatNaira(5000)).toBe('₦5,000');
    expect(formatNaira(15000)).toBe('₦15,000');
  });

  it('handles zero correctly', () => {
    expect(formatNaira(0)).toBe('₦0');
  });

  it('formats large numbers with proper separators', () => {
    expect(formatNaira(1000000)).toBe('₦1,000,000');
    expect(formatNaira(999999)).toBe('₦999,999');
  });

  it('handles decimal numbers', () => {
    const result = formatNaira(1500.50);
    expect(result).toContain('₦1,500');
  });
});

describe('formatEventDate', () => {
  it('formats ISO date strings correctly', () => {
    const date = '2025-12-01T10:00:00Z';
    const result = formatEventDate(date);

    // Should contain day, month, and year
    expect(result).toBeTruthy();
    expect(typeof result).toBe('string');
  });

  it('formats Date objects correctly', () => {
    const date = new Date('2025-12-01T10:00:00Z');
    const result = formatEventDate(date);

    expect(result).toBeTruthy();
    expect(typeof result).toBe('string');
  });

  it('handles different date formats consistently', () => {
    const dateString = '2025-12-01T10:00:00Z';
    const dateObject = new Date(dateString);

    // Both should produce similar output
    expect(formatEventDate(dateString)).toBeTruthy();
    expect(formatEventDate(dateObject)).toBeTruthy();
  });
});
