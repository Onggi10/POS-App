import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Customer, CustomerState } from '../../types';

const initialState: CustomerState = {
  customers: [],
  isLoading: false,
  error: null,
};

const customerSlice = createSlice({
  name: 'customers',
  initialState,
  reducers: {
    addCustomer: (state, action: PayloadAction<Customer>) => {
      state.customers.push(action.payload);
    },
    updateCustomer: (state, action: PayloadAction<Customer>) => {
      const index = state.customers.findIndex(c => c.id === action.payload.id);
      if (index !== -1) {
        state.customers[index] = action.payload;
      }
    },
    deleteCustomer: (state, action: PayloadAction<string>) => {
      state.customers = state.customers.filter(c => c.id !== action.payload);
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  addCustomer,
  updateCustomer,
  deleteCustomer,
  clearError,
} = customerSlice.actions;

export default customerSlice.reducer;