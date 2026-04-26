/**
 * Date Utility Functions for Redux State Management
 * Converts between Date objects and ISO strings to avoid serialization issues
 */

/**
 * Convert Date object to ISO string for Redux storage
 */
export const dateToString = (date: Date | string | undefined): string | undefined => {
  if (!date) return undefined;
  if (typeof date === 'string') return date;
  return date.toISOString();
};

/**
 * Convert ISO string to Date object for usage
 */
export const stringToDate = (dateString: string | undefined): Date | undefined => {
  if (!dateString) return undefined;
  return new Date(dateString);
};

/**
 * Get current timestamp as ISO string
 */
export const now = (): string => {
  return new Date().toISOString();
};

/**
 * Format date for display
 */
export const formatDate = (date: Date | string | undefined, locale: string = 'id-ID'): string => {
  if (!date) return '';
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString(locale);
};

/**
 * Format date and time for display
 */
export const formatDateTime = (date: Date | string | undefined, locale: string = 'id-ID'): string => {
  if (!date) return '';
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleString(locale);
};
