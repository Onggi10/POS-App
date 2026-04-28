import axios from 'axios';

// API base URL - sesuaikan untuk device
// iOS Simulator: http://localhost:3000
// Android Emulator: http://10.0.2.2:3000
// Physical device: ganti dengan IP address komputer
const API_BASE_URL = __DEV__ ? 'http://localhost:3000/api' : 'http://10.134.194.26:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request/response interceptors for debugging
api.interceptors.request.use(
  (config) => {
    console.log('API Request:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('API Response Error:', error.response?.status, error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Transform snake_case to camelCase for API responses
const transformProduct = (product: any) => ({
  id: product.id.toString(),
  name: product.name,
  description: product.description,
  sku: product.sku,
  categoryId: product.category_id?.toString(),
  price: product.price,
  costPrice: product.cost_price,
  stock: product.stock,
  minStock: product.min_stock,
  image: product.image,
  isActive: product.is_active,
  createdAt: new Date(product.created_at),
  updatedAt: new Date(product.updated_at),
});

const transformCategory = (category: any) => ({
  id: category.id.toString(),
  name: category.name,
  description: category.description,
  color: category.color,
  icon: category.icon,
  createdAt: new Date(category.created_at),
  updatedAt: new Date(category.updated_at),
});

// ============ PRODUCTS API ============
export const productsApi = {
  getAll: async () => {
    const response = await api.get('/products');
    return { ...response, data: response.data.map(transformProduct) };
  },
  getById: async (id: string) => {
    const response = await api.get(`/products/${id}`);
    return { ...response, data: transformProduct(response.data) };
  },
  create: (data: any) => api.post('/products', data),
  update: (id: string, data: any) => api.put(`/products/${id}`, data),
  delete: (id: string) => api.delete(`/products/${id}`),
  updateStock: (id: string, stock: number) => 
    api.patch(`/products/${id}/stock`, { stock }),
};

// ============ CATEGORIES API ============
export const categoriesApi = {
  getAll: async () => {
    const response = await api.get('/categories');
    return { ...response, data: response.data.map(transformCategory) };
  },
  getById: async (id: string) => {
    const response = await api.get(`/categories/${id}`);
    return { ...response, data: transformCategory(response.data) };
  },
  create: (data: any) => api.post('/categories', data),
  update: (id: string, data: any) => api.put(`/categories/${id}`, data),
  delete: (id: string) => api.delete(`/categories/${id}`),
};

// ============ HEALTH CHECK ============
export const healthApi = {
  check: () => api.get('/health'),
};

export default api;
