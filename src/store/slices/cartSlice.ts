import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CartItem, CartState } from '../../types';

const initialState: CartState = {
  items: [],
  subtotal: 0,
  tax: 0,
  discount: 0,
  total: 0,
};

const calculateTotals = (items: CartItem[], taxRate: number = 0, discount: number = 0) => {
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * (taxRate / 100);
  const total = subtotal + tax - discount;

  return { subtotal, tax, discount, total };
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<CartItem>) => {
      const existingItem = state.items.find(
        item =>
          item.productId === action.payload.productId &&
          item.variantId === action.payload.variantId
      );

      if (existingItem) {
        existingItem.quantity += action.payload.quantity;
      } else {
        state.items.push(action.payload);
      }

      const totals = calculateTotals(state.items, state.tax, state.discount);
      Object.assign(state, totals);
    },
    updateQuantity: (state, action: PayloadAction<{ itemId: string; quantity: number }>) => {
      const item = state.items.find(item => item.id === action.payload.itemId);
      if (item) {
        if (action.payload.quantity <= 0) {
          state.items = state.items.filter(item => item.id !== action.payload.itemId);
        } else {
          item.quantity = action.payload.quantity;
        }
      }

      const totals = calculateTotals(state.items, state.tax, state.discount);
      Object.assign(state, totals);
    },
    removeFromCart: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(item => item.id !== action.payload);
      const totals = calculateTotals(state.items, state.tax, state.discount);
      Object.assign(state, totals);
    },
    updateItemDiscount: (state, action: PayloadAction<{ itemId: string; discount: number }>) => {
      const item = state.items.find(item => item.id === action.payload.itemId);
      if (item) {
        item.discount = action.payload.discount;
      }
      const totals = calculateTotals(state.items, state.tax, state.discount);
      Object.assign(state, totals);
    },
    setTax: (state, action: PayloadAction<number>) => {
      state.tax = action.payload;
      const totals = calculateTotals(state.items, state.tax, state.discount);
      Object.assign(state, totals);
    },
    setDiscount: (state, action: PayloadAction<number>) => {
      state.discount = action.payload;
      const totals = calculateTotals(state.items, state.tax, state.discount);
      Object.assign(state, totals);
    },
    clearCart: (state) => {
      state.items = [];
      state.subtotal = 0;
      state.tax = 0;
      state.discount = 0;
      state.total = 0;
    },
    addItemNote: (state, action: PayloadAction<{ itemId: string; notes: string }>) => {
      const item = state.items.find(item => item.id === action.payload.itemId);
      if (item) {
        item.notes = action.payload.notes;
      }
    },
  },
});

export const {
  addToCart,
  updateQuantity,
  removeFromCart,
  updateItemDiscount,
  setTax,
  setDiscount,
  clearCart,
  addItemNote,
} = cartSlice.actions;

export default cartSlice.reducer;