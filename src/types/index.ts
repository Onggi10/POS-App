// Core Types for POS System

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'cashier';
  pin?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  color: string;
  icon: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  sku: string;
  categoryId: string;
  price: number;
  costPrice?: number; // For profit calculation
  stock: number;
  minStock: number;
  image?: string;
  variants?: ProductVariant[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductVariant {
  id: string;
  name: string;
  price: number;
  stock: number;
  sku: string;
}

export interface CartItem {
  id: string;
  productId: string;
  product: Product;
  variantId?: string;
  variant?: ProductVariant;
  quantity: number;
  price: number;
  discount?: number;
  notes?: string;
}

export interface Transaction {
  id: string;
  transactionNumber: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentAmount: number;
  change: number;
  customerId?: string;
  customer?: Customer;
  cashierId: string;
  cashier: User;
  status: TransactionStatus;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  totalTransactions: number;
  totalSpent: number;
  createdAt: Date;
  updatedAt: Date;
}

export type PaymentMethod = 'cash' | 'qris' | 'ewallet' | 'card';

export type TransactionStatus = 'pending' | 'completed' | 'cancelled' | 'refunded';

export interface StockMovement {
  id: string;
  productId: string;
  type: 'in' | 'out' | 'adjustment';
  quantity: number;
  previousStock: number;
  newStock: number;
  reason?: string;
  referenceId?: string; // Transaction ID or manual adjustment ID
  createdBy: string;
  createdAt: Date;
}

export interface SaleSummary {
  totalSales: number;
  totalTransactions: number;
  totalItems: number;
  averageTransaction: number;
  topProducts: Array<{
    productId: string;
    productName: string;
    quantity: number;
    revenue: number;
  }>;
  paymentMethods: Record<PaymentMethod, number>;
}

export interface Settings {
  storeName: string;
  storeAddress?: string;
  storePhone?: string;
  taxRate: number;
  currency: string;
  receiptFooter?: string;
  lowStockThreshold: number;
  enableTax: boolean;
  enableDiscount: boolean;
  enableCustomerManagement: boolean;
}

// Redux State Types
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface ProductState {
  products: Product[];
  categories: Category[];
  isLoading: boolean;
  error: string | null;
}

export interface CartState {
  items: CartItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
}

export interface TransactionState {
  transactions: Transaction[];
  currentTransaction: Transaction | null;
  isLoading: boolean;
  error: string | null;
}

export interface CustomerState {
  customers: Customer[];
  isLoading: boolean;
  error: string | null;
}

export interface SettingsState {
  settings: Settings;
  isLoading: boolean;
  error: string | null;
}

export interface AppState {
  auth: AuthState;
  products: ProductState;
  cart: CartState;
  transactions: TransactionState;
  customers: CustomerState;
  settings: SettingsState;
}