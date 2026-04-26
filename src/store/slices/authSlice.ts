import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { User, AuthState } from '../../types';
import { STORAGE_KEYS } from '../../constants';
import { now } from '../../utils/dateUtils';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock users for demo
const MOCK_USERS: User[] = [
  {
    id: '1',
    email: 'admin@pos.com',
    name: 'Admin',
    role: 'admin',
    pin: '1234',
    createdAt: now() as any,
    updatedAt: now() as any,
  },
  {
    id: '2',
    email: 'kasir@pos.com',
    name: 'Kasir',
    role: 'cashier',
    pin: '1111',
    createdAt: now() as any,
    updatedAt: now() as any,
  },
];

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

export const login = createAsyncThunk(
  'auth/login',
  async ({ email, pin }: { email: string; pin: string }) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    const user = MOCK_USERS.find(u => u.email === email && u.pin === pin);
    if (!user) {
      throw new Error('Email atau PIN salah');
    }

    // Store user in AsyncStorage
    await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));

    return user;
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async () => {
    await AsyncStorage.removeItem(STORAGE_KEYS.USER);
  }
);

export const checkAuth = createAsyncThunk(
  'auth/checkAuth',
  async () => {
    const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER);
    if (userData) {
      return JSON.parse(userData) as User;
    }
    return null;
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action: PayloadAction<User>) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.error = action.error.message || 'Login gagal';
      })
      .addCase(logout.fulfilled, (state) => {
        state.isAuthenticated = false;
        state.user = null;
        state.error = null;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        if (action.payload) {
          state.isAuthenticated = true;
          state.user = action.payload;
        }
      });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;