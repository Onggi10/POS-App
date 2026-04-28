import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Transaction, TransactionState, CartItem, PaymentMethod } from '../../types';
import { transactionsApi } from '../../services/apiService';

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
      createdAt: new Date() as any,
      updatedAt: new Date() as any,
    },
    status: 'completed',
    createdAt: new Date() as any,
    updatedAt: new Date() as any,
  },
];

const initialState: TransactionState = {
  transactions: MOCK_TRANSACTIONS,
  currentTransaction: null,
  isLoading: false,
  error: null,
};

export const fetchTransactions = createAsyncThunk(
  'transactions/fetchTransactions',
  async (_, { rejectWithValue }) => {
    try {
      const response = await transactionsApi.getAll();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Gagal mengambil data transaksi');
    }
  }
);

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
    const response = await transactionsApi.create({
      items: transactionData.items,
      paymentMethod: transactionData.paymentMethod,
      paymentAmount: transactionData.paymentAmount,
      cashierId: transactionData.cashierId,
      tax: transactionData.tax,
      discount: transactionData.discount,
    });
    return response.data;
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
      .addCase(fetchTransactions.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTransactions.fulfilled, (state, action: PayloadAction<Transaction[]>) => {
        state.isLoading = false;
        state.transactions = action.payload;
        state.error = null;
      })
      .addCase(fetchTransactions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Gagal mengambil data transaksi';
      })
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