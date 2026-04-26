import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Transaction, TransactionState, CartItem, PaymentMethod } from '../../types';
import { now } from '../../utils/dateUtils';
import { store } from '../index';

// Mock transactions
const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: '1',
    transactionNumber: 'TRX001',
    items: [],
    subtotal: 50000,
    tax: 0,
    discount: 0,
    total: 50000,
    paymentMethod: 'cash',
    paymentAmount: 50000,
    change: 0,
    cashierId: '2',
    cashier: {
      id: '2',
      email: 'kasir@pos.com',
      name: 'Kasir',
      role: 'cashier',
      createdAt: now() as any,
      updatedAt: now() as any,
    },
    status: 'completed',
    createdAt: now() as any,
    updatedAt: now() as any,
  },
];

const initialState: TransactionState = {
  transactions: MOCK_TRANSACTIONS,
  currentTransaction: null,
  isLoading: false,
  error: null,
};

export const createTransaction = createAsyncThunk(
  'transactions/create',
  async (transactionData: {
    items: CartItem[];
    paymentMethod: PaymentMethod;
    paymentAmount: number;
    cashierId: string;
    tax: number;
    discount: number;
  }) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));

    const { items, paymentMethod, paymentAmount, cashierId, tax, discount } = transactionData;
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const total = subtotal + tax - discount;
    const change = paymentAmount - total;

    const transaction: Transaction = {
      id: Date.now().toString(),
      transactionNumber: `TRX${Date.now()}`,
      items,
      subtotal,
      tax,
      discount,
      total,
      paymentMethod,
      paymentAmount,
      change,
      cashierId,
      cashier: {
        id: cashierId,
        email: '',
        name: 'Kasir',
        role: 'cashier',
        createdAt: now() as any,
        updatedAt: now() as any,
      },
      status: 'completed',
      createdAt: now() as any,
      updatedAt: now() as any,
    };

    return transaction;
  }
);

const transactionSlice = createSlice({
  name: 'transactions',
  initialState,
  reducers: {
    addTransaction: (state, action: PayloadAction<Transaction>) => {
      state.transactions.unshift(action.payload);
    },
    updateTransaction: (state, action: PayloadAction<Transaction>) => {
      const index = state.transactions.findIndex(t => t.id === action.payload.id);
      if (index !== -1) {
        state.transactions[index] = action.payload;
      }
    },
    cancelTransaction: (state, action: PayloadAction<string>) => {
      const transaction = state.transactions.find(t => t.id === action.payload);
      if (transaction) {
        transaction.status = 'cancelled';
        transaction.updatedAt = new Date();
      }
    },
    setCurrentTransaction: (state, action: PayloadAction<Transaction | null>) => {
      state.currentTransaction = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createTransaction.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createTransaction.fulfilled, (state, action: PayloadAction<Transaction>) => {
        state.isLoading = false;
        state.transactions.unshift(action.payload);
        state.currentTransaction = action.payload;
        state.error = null;
      })
      .addCase(createTransaction.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Gagal membuat transaksi';
      });
  },
});

export const {
  addTransaction,
  updateTransaction,
  cancelTransaction,
  setCurrentTransaction,
  clearError,
} = transactionSlice.actions;

export default transactionSlice.reducer;