import { formatInTimeZone } from 'date-fns-tz';

/**
 * Format Nigerian Naira currency
 * @param amount - Amount in Naira
 * @returns Formatted currency string with ₦ symbol
 * @example formatNaira(5000) // "₦5,000"
 */
export function formatNaira(amount: number): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format date in Nigerian timezone (WAT - West Africa Time)
 * @param date - ISO date string or Date object
 * @param formatStr - Date format string (default: 'EEE, MMM d • h:mm a')
 * @returns Formatted date string
 * @example formatEventDate('2025-12-01T10:00:00Z') // "Mon, Dec 1 • 11:00 AM"
 */
export function formatEventDate(date: string | Date, formatStr = 'EEE, MMM d • h:mm a'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return formatInTimeZone(dateObj, 'Africa/Lagos', formatStr);
}

/**
 * Format phone number to Nigerian international format
 * @param phone - Phone number in any format
 * @returns Phone number with +234 prefix
 * @example formatNigerianPhone("0803123456") // "+2348031234567"
 */
export function formatNigerianPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');

  if (cleaned.startsWith('0')) {
    return `+234${cleaned.slice(1)}`;
  }

  if (cleaned.startsWith('234')) {
    return `+${cleaned}`;
  }

  return `+234${cleaned}`;
}

/**
 * Truncate text to specified length with ellipsis
 * @param text - Text to truncate
 * @param maxLength - Maximum length (default: 100)
 * @returns Truncated text with ellipsis if needed
 */
export function truncateText(text: string, maxLength = 100): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).trim()}...`;
}
