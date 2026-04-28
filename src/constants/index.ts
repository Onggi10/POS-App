// Constants for POS System

export const COLORS = {
  primary: '#3B82F6',
  secondary: '#10B981',
  accent: '#F59E0B',
  danger: '#EF4444',
  warning: '#F59E0B',
  success: '#10B981',
  info: '#3B82F6',

  // Neutral colors
  white: '#FFFFFF',
  black: '#000000',
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },

  // POS specific colors
  pos: {
    background: '#F8FAFC',
    card: '#FFFFFF',
    border: '#E2E8F0',
    text: '#1E293B',
    textSecondary: '#64748B',
    textLight: '#94A3B8',
  }
};

export const IMAGE_BASE_PATH = __DEV__
  ? 'http://localhost:3000/images/products'
  : 'https://your-production-domain.com/images/products';

export const FONTS = {
  regular: 'System',
  medium: 'System',
  semibold: 'System',
  bold: 'System',
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const BORDER_RADIUS = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  round: 50,
};

export const SHADOWS = {
  sm: {
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
};

export const PAYMENT_METHODS = {
  cash: { label: 'Tunai', icon: 'cash' },
  qris: { label: 'QRIS', icon: 'qrcode' },
  ewallet: { label: 'E-Wallet', icon: 'wallet' },
  card: { label: 'Kartu', icon: 'credit-card' },
};

export const USER_ROLES = {
  admin: { label: 'Admin', permissions: ['all'] },
  cashier: { label: 'Kasir', permissions: ['pos', 'view_products'] },
};

export const TRANSACTION_STATUS = {
  pending: { label: 'Pending', color: COLORS.warning },
  completed: { label: 'Selesai', color: COLORS.success },
  cancelled: { label: 'Dibatalkan', color: COLORS.danger },
  refunded: { label: 'Dikembalikan', color: COLORS.info },
};

export const STOCK_MOVEMENT_TYPES = {
  in: { label: 'Masuk', color: COLORS.success },
  out: { label: 'Keluar', color: COLORS.danger },
  adjustment: { label: 'Penyesuaian', color: COLORS.warning },
};

export const DEFAULT_SETTINGS: import('../types').Settings = {
  storeName: 'Toko POS',
  storeAddress: '',
  storePhone: '',
  taxRate: 0,
  currency: 'IDR',
  receiptFooter: 'Terima Kasih atas Kunjungannya',
  lowStockThreshold: 10,
  enableTax: false,
  enableDiscount: true,
  enableCustomerManagement: false,
};

export const API_ENDPOINTS = {
  auth: {
    login: '/auth/login',
    logout: '/auth/logout',
    refresh: '/auth/refresh',
  },
  products: {
    list: '/products',
    create: '/products',
    update: '/products/:id',
    delete: '/products/:id',
  },
  categories: {
    list: '/categories',
    create: '/categories',
    update: '/categories/:id',
    delete: '/categories/:id',
  },
  transactions: {
    list: '/transactions',
    create: '/transactions',
    update: '/transactions/:id',
    cancel: '/transactions/:id/cancel',
  },
  customers: {
    list: '/customers',
    create: '/customers',
    update: '/customers/:id',
    delete: '/customers/:id',
  },
  reports: {
    sales: '/reports/sales',
    inventory: '/reports/inventory',
    profit: '/reports/profit',
  },
  settings: {
    get: '/settings',
    update: '/settings',
  },
};

export const STORAGE_KEYS = {
  USER: '@pos_user',
  SETTINGS: '@pos_settings',
  CART: '@pos_cart',
  OFFLINE_TRANSACTIONS: '@pos_offline_transactions',
  SYNC_STATUS: '@pos_sync_status',
};

export const SYNC_STATUS = {
  SYNCED: 'synced',
  PENDING: 'pending',
  FAILED: 'failed',
};