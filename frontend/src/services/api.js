// frontend/src/services/api.js
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (config.data instanceof FormData) {
      config.headers['Content-Type'] = 'multipart/form-data';
    } else {
      config.headers['Content-Type'] = 'application/json';
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        const response = await axios.post(`${API_BASE_URL}/auth/refresh/`, {
          refresh: refreshToken,
        });

        const { access } = response.data;
        localStorage.setItem('access_token', access);
        originalRequest.headers.Authorization = `Bearer ${access}`;

        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// API functions
export const auth = {
  login: (credentials) => api.post('/auth/login/', credentials),
  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  },
};

export const accounts ={
  getMe : () => api.get('/accounts/users/me/'),
  updateMe : (data) => api.put('/accounts/users/me/', data),
} 

export const products = {
  getAll: (params) => api.get('/products/', { params }),
  getById: (id) => api.get(`/products/${id}/`),
  create: (data) => api.post('/products/', data),
  update: (id, data) => api.put(`/products/${id}/`, data),
  delete: (id) => api.delete(`/products/${id}/`),
  getLowStock: () => api.get('/products/low_stock/'),
  searchByBarcode: (barcode) => api.get(`/products/search_by_barcode/?barcode=${barcode}`),
};

export const stockMovements = {
  getAll: (params) => api.get("/stock-movements/", { params }),
  getById: (id) => api.get(`/stock-movements/${id}/`),
};

export const categories = {
  getAll: () => api.get('/categories/'),
  create: (data) => api.post('/categories/', data),
  update: (id, data) => api.put(`/categories/${id}/`, data),
  delete: (id) => api.delete(`/categories/${id}/`),
};

export const sales = {
  getAll: (params) => api.get('/sales/', { params }),
  getById: (id) => api.get(`/sales/${id}/`),
  create: (data) => api.post('/sales/', data),
  getTodaySales: () => api.get('/sales/today_sales/'),
  getSalesReport: (params) => api.get('/sales/sales_report/', { params }),
  getDashboardData: (params) => api.get('/sales/dashboard/', { params }),
  addPayment: (id, data) => api.post(`/sales/${id}/add_payment/`, data),
};

export const customers = {
  getAll: (params) => api.get('/customers/', { params }),
  getById: (id) => api.get(`/customers/${id}/`),
  create: (data) => api.post('/customers/', data),
  update: (id, data) => api.put(`/customers/${id}/`, data),
  delete: (id) => api.delete(`/customers/${id}/`),
};

export const vendors = {
  getAll: (params) => api.get('/vendors/', { params }),
  create: (data) => api.post('/vendors/', data),
  update: (id, data) => api.put(`/vendors/${id}/`, data),
  delete: (id) => api.delete(`/vendors/${id}/`),
};

export default api;