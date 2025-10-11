
// frontend/src/services/api.js
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // CRITICAL: Send cookies with requests
});

// Helper function to get CSRF token from cookies
const getCsrfToken = () => {
  const name = 'csrftoken';
  let csrfToken = '';
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === name + '=') {
        csrfToken = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return csrfToken;
};

// Initialize CSRF token by making a GET request
const initializeCsrfToken = async () => {
  try {
    await api.get('/csrf/', { withCredentials: true });
  } catch (error) {
    console.warn('Failed to initialize CSRF token:', error);
  }
};

// Call on module load
initializeCsrfToken();

// Request interceptor to add auth token and CSRF token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add CSRF token for state-changing requests
    if (['post', 'put', 'patch', 'delete'].includes(config.method?.toLowerCase())) {
      const csrfToken = getCsrfToken();
      if (csrfToken) {
        config.headers['X-CSRFToken'] = csrfToken;
      }
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

    // Only try to refresh if we have tokens and it's not a login/refresh request
    const isAuthRequest = originalRequest.url.includes('/auth/login/') || originalRequest.url.includes('/auth/refresh/');
    
    if (error.response?.status === 401 && !originalRequest._retry && !isAuthRequest) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) {
          throw new Error('No refresh token');
        }

        const response = await axios.post(`${API_BASE_URL}/auth/refresh/`, {
          refresh: refreshToken,
        }, {
          withCredentials: true,
        });

        const { access } = response.data;
        localStorage.setItem('access_token', access);
        originalRequest.headers.Authorization = `Bearer ${access}`;

        return api(originalRequest);
      } catch (refreshError) {
        // Clear tokens and dispatch logout event
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.dispatchEvent(new CustomEvent('auth:logout'));
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// API functions
export const auth = {
  getCsrfToken: () => api.get('/csrf/'),
  login: (credentials) => api.post('/auth/login/', credentials),
  refresh: (data) => api.post('/auth/refresh/', data),
  logout: (data) => api.post('/auth/logout/', data), 
};

export const accounts = {
  getMe: () => api.get('/accounts/users/me/'),
  updateMe: (data) => api.patch('/accounts/users/me/', data),
  changePassword: (data) => api.post('/accounts/users/change_password/', data),
  getAllStaff: (params) => api.get('/accounts/staff/', { params }),
  getStaffById: (id) => api.get(`/accounts/staff/${id}/`),
  createStaff: (data) => api.post('/accounts/staff/', data),
  updateStaff: (id, data) => api.patch(`/accounts/staff/${id}/`, data),
  deleteStaff: (id) => api.delete(`/accounts/staff/${id}/`),
  reactivateStaff: (id) => api.post(`/accounts/staff/${id}/reactivate/`),
};

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
  update: (id, data) => api.put(`/sales/${id}/`, data),
  partialUpdate: (id, data) => api.patch(`/sales/${id}/`, data),
  delete: (id) => api.delete(`/sales/${id}/`),
  cancelSale: (id, query) => api.post(`/sales/${id}/cancel_sale/${query}`),
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
  update: (id, data) => api.patch(`/vendors/${id}/`, data),
  delete: (id) => api.delete(`/vendors/${id}/`),
};

export const notifications = {
  getAll: (params) => api.get('/notifications/', { params }),
  getById: (id) => api.get(`/notifications/${id}/`),
  markAsRead: (id) => api.post(`/notifications/${id}/mark_as_read/`),
  markAllRead: () => api.post('/notifications/mark_all_read/'),
  dismiss: (id) => api.post(`/notifications/${id}/dismiss/`),
  generate: () => api.post('/notifications/generate/'),
  getStats: () => api.get('/notifications/stats/'),
  getRecent: () => api.get('/notifications/recent/'),
  cleanup: () => api.delete('/notifications/cleanup/'),
};

export default api;