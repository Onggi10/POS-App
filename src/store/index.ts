import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { combineReducers } from '@reduxjs/toolkit';

// Import slices
import authReducer from './slices/authSlice';
import productReducer from './slices/productSlice';
import cartReducer from './slices/cartSlice';
import transactionReducer from './slices/transactionSlice';
import customerReducer from './slices/customerSlice';
import settingsReducer from './slices/settingsSlice';

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['auth', 'settings', 'cart'], // Only persist these slices
};

const rootReducer = combineReducers({
  auth: authReducer,
  products: productReducer,
  cart: cartReducer,
  transactions: transactionReducer,
  customers: customerReducer,
  settings: settingsReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          'persist/PERSIST',
          'persist/REHYDRATE',
          'auth/checkAuth/pending',
          'auth/checkAuth/fulfilled',
          'auth/login/pending',
          'auth/login/fulfilled',
          'transactions/create/pending',
          'transactions/create/fulfilled',
          'transactions/create/rejected',
        ],
        ignoredActionPaths: ['payload'],
        ignoredPaths: [
          'products.products',
          'products.categories',
          'transactions.transactions',
          'transactions.currentTransaction',
          'auth.user',
          'cart.items', // Cart items contain Product objects with Date fields
          'customers.customers',
        ],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;