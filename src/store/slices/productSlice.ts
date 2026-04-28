import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Product, Category, ProductState } from '../../types';
import { productsApi, categoriesApi } from '../../services/apiService';

// Async thunks untuk fetch data dari API
export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await productsApi.getAll();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Gagal mengambil data produk');
    }
  }
);

export const fetchCategories = createAsyncThunk(
  'products/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      const response = await categoriesApi.getAll();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Gagal mengambil data kategori');
    }
  }
);

export const addProductAsync = createAsyncThunk(
  'products/addProductAsync',
  async (product: any, { rejectWithValue }) => {
    try {
      const response = await productsApi.create(product);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Gagal menambah produk');
    }
  }
);

export const updateProductAsync = createAsyncThunk(
  'products/updateProductAsync',
  async ({ id, data }: { id: string; data: any }, { rejectWithValue }) => {
    try {
      const response = await productsApi.update(id, data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Gagal mengupdate produk');
    }
  }
);

export const deleteProductAsync = createAsyncThunk(
  'products/deleteProductAsync',
  async (id: string, { rejectWithValue }) => {
    try {
      await productsApi.delete(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Gagal menghapus produk');
    }
  }
);

export const addCategoryAsync = createAsyncThunk(
  'products/addCategoryAsync',
  async (category: any, { rejectWithValue }) => {
    try {
      const response = await categoriesApi.create(category);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Gagal menambah kategori');
    }
  }
);

export const updateCategoryAsync = createAsyncThunk(
  'products/updateCategoryAsync',
  async ({ id, data }: { id: string; data: any }, { rejectWithValue }) => {
    try {
      const response = await categoriesApi.update(id, data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Gagal mengupdate kategori');
    }
  }
);

export const deleteCategoryAsync = createAsyncThunk(
  'products/deleteCategoryAsync',
  async (id: string, { rejectWithValue }) => {
    try {
      await categoriesApi.delete(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Gagal menghapus kategori');
    }
  }
);

const initialState: ProductState = {
  products: [],
  categories: [],
  isLoading: false,
  error: null,
};

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    refreshData: (state) => {
      // This action will trigger data refresh in components
    },
  },
  extraReducers: (builder) => {
    // Fetch Products
    builder.addCase(fetchProducts.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchProducts.fulfilled, (state, action) => {
      state.isLoading = false;
      state.products = action.payload;
    });
    builder.addCase(fetchProducts.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Fetch Categories
    builder.addCase(fetchCategories.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchCategories.fulfilled, (state, action) => {
      state.isLoading = false;
      state.categories = action.payload;
    });
    builder.addCase(fetchCategories.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Add Product
    builder.addCase(addProductAsync.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(addProductAsync.fulfilled, (state, action) => {
      state.isLoading = false;
      state.products.push(action.payload);
    });
    builder.addCase(addProductAsync.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Update Product
    builder.addCase(updateProductAsync.fulfilled, (state, action) => {
      const index = state.products.findIndex(p => p.id === action.payload.id);
      if (index !== -1) {
        state.products[index] = action.payload;
      }
    });

    // Delete Product
    builder.addCase(deleteProductAsync.fulfilled, (state, action) => {
      state.products = state.products.filter(p => p.id !== action.payload);
    });

    // Add Category
    builder.addCase(addCategoryAsync.fulfilled, (state, action) => {
      state.categories.push(action.payload);
    });

    // Update Category
    builder.addCase(updateCategoryAsync.fulfilled, (state, action) => {
      const index = state.categories.findIndex(c => c.id === action.payload.id);
      if (index !== -1) {
        state.categories[index] = action.payload;
      }
    });

    // Delete Category
    builder.addCase(deleteCategoryAsync.fulfilled, (state, action) => {
      state.categories = state.categories.filter(c => c.id !== action.payload);
    });
  },
});

export const { clearError, refreshData } = productSlice.actions;

export default productSlice.reducer;