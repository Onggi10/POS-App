/**
 * Currency utilities for formatting values to Indonesian Rupiah.
 */

export const formatIDR = (value: number | string | null | undefined): string => {
  const amount = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.-]+/g, '')) : value;
  const normalized = typeof amount === 'number' ? amount : 0;

  if (Number.isNaN(normalized)) {
    return 'Rp 0';
  }

  return `Rp ${normalized.toLocaleString('id-ID')}`;
};
