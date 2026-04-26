import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Product, Category, ProductState } from '../../types';
import { now } from '../../utils/dateUtils';

// Mock data
const MOCK_CATEGORIES: Category[] = [
  {
    id: '1',
    name: 'Makanan',
    description: 'Makanan siap saji',
    color: '#10B981',
    icon: 'food',
    createdAt: now() as any,
    updatedAt: now() as any,
  },
  {
    id: '2',
    name: 'Minuman',
    description: 'Minuman dingin dan panas',
    color: '#3B82F6',
    icon: 'coffee',
    createdAt: now() as any,
    updatedAt: now() as any,
  },
  {
    id: '3',
    name: 'Snack',
    description: 'Camilan dan makanan ringan',
    color: '#F59E0B',
    icon: 'cookie',
    createdAt: now() as any,
    updatedAt: now() as any,
  },
];

const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Nasi Goreng',
    description: 'Nasi goreng spesial dengan telur dan ayam',
    sku: 'NG001',
    categoryId: '1',
    price: 25000,
    costPrice: 15000,
    stock: 15,
    minStock: 5,
    image: 'https://via.placeholder.com/150',
    isActive: true,
    createdAt: now() as any,
    updatedAt: now() as any,
  },
  {
    id: '2',
    name: 'Es Teh Manis',
    description: 'Teh manis dingin segar',
    sku: 'ET001',
    categoryId: '2',
    price: 5000,
    costPrice: 2000,
    stock: 50,
    minStock: 10,
    image: 'https://via.placeholder.com/150',
    isActive: true,
    createdAt: now() as any,
    updatedAt: now() as any,
  },
  {
    id: '3',
    name: 'Keripik Kentang',
    description: 'Keripik kentang renyah original',
    sku: 'KK001',
    categoryId: '3',
    price: 15000,
    costPrice: 8000,
    stock: 8,
    minStock: 5,
    image: 'https://via.placeholder.com/150',
    isActive: true,
    createdAt: now() as any,
    updatedAt: now() as any,
  },
  {
    id: '4',
    name: 'Ayam Bakar',
    description: 'Ayam bakar madu dengan sambal',
    sku: 'AB001',
    categoryId: '1',
    price: 35000,
    costPrice: 20000,
    stock: 12,
    minStock: 3,
    image: 'https://via.placeholder.com/150',
    isActive: true,
    createdAt: now() as any,
    updatedAt: now() as any,
  },
  {
    id: '5',
    name: 'Jus Jeruk',
    description: 'Jus jeruk segar tanpa gula',
    sku: 'JJ001',
    categoryId: '2',
    price: 12000,
    costPrice: 6000,
    stock: 25,
    minStock: 8,
    image: 'https://via.placeholder.com/150',
    isActive: true,
    createdAt: now() as any,
    updatedAt: now() as any,
  },
];

const initialState: ProductState = {
  products: MOCK_PRODUCTS,
  categories: MOCK_CATEGORIES,
  isLoading: false,
  error: null,
};

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    addProduct: (state, action: PayloadAction<Product>) => {
      state.products.push(action.payload);
    },
    updateProduct: (state, action: PayloadAction<Product>) => {
      const index = state.products.findIndex(p => p.id === action.payload.id);
      if (index !== -1) {
        state.products[index] = action.payload;
      }
    },
    deleteProduct: (state, action: PayloadAction<string>) => {
      state.products = state.products.filter(p => p.id !== action.payload);
    },
    updateStock: (state, action: PayloadAction<{ productId: string; newStock: number }>) => {
      const product = state.products.find(p => p.id === action.payload.productId);
      if (product) {
        product.stock = action.payload.newStock;
        product.updatedAt = new Date();
      }
    },
    addCategory: (state, action: PayloadAction<Category>) => {
      state.categories.push(action.payload);
    },
    updateCategory: (state, action: PayloadAction<Category>) => {
      const index = state.categories.findIndex(c => c.id === action.payload.id);
      if (index !== -1) {
        state.categories[index] = action.payload;
      }
    },
    deleteCategory: (state, action: PayloadAction<string>) => {
      state.categories = state.categories.filter(c => c.id !== action.payload);
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  addProduct,
  updateProduct,
  deleteProduct,
  updateStock,
  addCategory,
  updateCategory,
  deleteCategory,
  clearError,
} = productSlice.actions;

export default productSlice.reducer;