import axios from 'axios';
import { mockApi } from './mockApi';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API === 'true' || false;

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds timeout
});

// Check if we should use mock API (when backend is not available)
let useMock = USE_MOCK_API;

// Wrapper function that falls back to mock API on network errors
const withMockFallback = async <T>(
  apiCall: () => Promise<T>,
  mockCall: () => Promise<T>
): Promise<T> => {
  if (useMock) {
    return mockCall();
  }
  
  try {
    return await apiCall();
  } catch (error: any) {
    // If it's a network error, fall back to mock API
    if (error.code === 'ECONNABORTED' || 
        error.message === 'Network Error' || 
        !error.response ||
        error.networkError) {
      console.warn('Backend API not available. Falling back to localStorage mock API.');
      useMock = true; // Remember to use mock for future calls
      return mockCall();
    }
    throw error;
  }
};

// Request interceptor for auth tokens if needed
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle network errors
    if (error.code === 'ECONNABORTED' || error.message === 'Network Error' || !error.response) {
      error.networkError = true;
      error.message = `Network Error: Cannot connect to API at ${API_BASE_URL}. Please check if the backend server is running.`;
    }
    
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

// Items API
export const itemsApi = {
  getAll: () => withMockFallback(
    () => api.get('/items'),
    () => mockApi.items.getAll()
  ),
  getById: (id: string) => withMockFallback(
    () => api.get(`/items/${id}`),
    () => mockApi.items.getById(id)
  ),
  create: (data: Partial<any>) => withMockFallback(
    () => api.post('/items', data),
    () => mockApi.items.create(data)
  ),
  update: (id: string, data: Partial<any>) => withMockFallback(
    () => api.put(`/items/${id}`, data),
    () => mockApi.items.update(id, data)
  ),
  delete: (id: string) => withMockFallback(
    () => api.delete(`/items/${id}`),
    () => mockApi.items.delete(id)
  ),
  getByItemNo: (itemNo: number) => withMockFallback(
    () => api.get(`/items/item-no/${itemNo}`),
    () => mockApi.items.getByItemNo(itemNo)
  ),
};

// Stock API
export const stockApi = {
  getByDate: (date: string) => withMockFallback(
    () => api.get(`/stock/date/${date}`),
    () => mockApi.stock.getByDate(date)
  ),
  createEntry: (data: Partial<any>) => withMockFallback(
    () => api.post('/stock', data),
    () => mockApi.stock.createEntry(data)
  ),
  updateEntry: (id: string, data: Partial<any>) => withMockFallback(
    () => api.put(`/stock/${id}`, data),
    () => mockApi.stock.updateEntry(id, data)
  ),
  getCurrentStock: (itemId: string) => api.get(`/stock/item/${itemId}/current`),
};

// Orders API
export const ordersApi = {
  getAll: (params?: { date?: string; status?: string }) => 
    withMockFallback(
      () => api.get('/orders', { params }),
      () => mockApi.orders.getAll(params)
    ),
  getById: (id: string) => api.get(`/orders/${id}`),
  create: (data: Partial<any>) => withMockFallback(
    () => api.post('/orders', data),
    () => mockApi.orders.create(data)
  ),
  update: (id: string, data: Partial<any>) => withMockFallback(
    () => api.put(`/orders/${id}`, data),
    () => mockApi.orders.update(id, data)
  ),
  updateStatus: (id: string, status: string) => 
    withMockFallback(
      () => api.patch(`/orders/${id}/status`, { status }),
      () => mockApi.orders.updateStatus(id, status)
    ),
  getByTable: (tableNo: string) => api.get(`/orders/table/${tableNo}`),
};

// Reports API
export const reportsApi = {
  getDailySales: (date: string) => api.get(`/reports/sales/${date}`),
  getDailyStock: (date: string) => api.get(`/reports/stock/${date}`),
  getStockSuggestions: (date: string) => api.get(`/reports/suggestions/${date}`),
};

// Tables API
export const tablesApi = {
  getAll: () => withMockFallback(
    () => api.get('/tables'),
    () => mockApi.tables.getAll()
  ),
  getById: (id: string) => api.get(`/tables/${id}`),
  updateStatus: (id: string, status: string) => 
    api.patch(`/tables/${id}/status`, { status }),
};

