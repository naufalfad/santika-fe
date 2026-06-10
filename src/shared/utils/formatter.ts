/**
 * Formatting utilities for the SANTIKA application.
 * Aligned with OOAD high cohesion principles.
 */

/**
 * Formats a numeric value into Indonesian Rupiah (IDR) currency format.
 * @param value - The numeric value to format.
 * @param options - Custom options for Intl formatting.
 * @returns Formatted currency string.
 */
export const formatIDR = (value: number, options?: Intl.NumberFormatOptions): string => {
    if (value === undefined || value === null || isNaN(value)) {
        return 'Rp 0';
    }
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
        ...options,
    }).format(value);
};

/**
 * Formats an ISO date string or Date object into localized Indonesian date.
 * @param date - Date representation (ISO string or Date object).
 * @param formatStyle - Predefined localized formatting styles.
 * @returns Formatted localized date string.
 */
export const formatDate = (
    date: string | Date,
    formatStyle: 'default' | 'short' | 'full' = 'default'
): string => {
    if (!date) return '-';
    const d = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(d.getTime())) return '-';

    const optionsMap: Record<string, Intl.DateTimeFormatOptions> = {
        short: { day: 'numeric', month: 'short', year: '2-digit' },
        default: { day: 'numeric', month: 'short', year: 'numeric' },
        full: { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' },
    };

    return new Intl.DateTimeFormat('id-ID', optionsMap[formatStyle] || optionsMap.default).format(d);
};

/**
 * Resolves an avatar path into a full URL referencing the backend server.
 * Uses the native URL object constructor to safely resolve murni origin server.
 *
 * @param path - Relative or absolute avatar path.
 * @returns Resolved absolute URL or null.
 */
export const getAvatarUrl = (path: string | null | undefined): string | null => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
  try {
    const origin = new URL(baseURL).origin;
    return `${origin}${path}`;
  } catch {
    return `http://localhost:8000${path}`;
  }
};