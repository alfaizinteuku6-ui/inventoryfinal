import useSWR from 'swr';
import { products, categories, sales, customers, vendors, stockMovements, accounts, notifications } from '../services/api';

const fetcher = (url, params) => {
  const [endpoint, ...args] = url.split('|');
  
  switch (endpoint) {
    case 'products':
      return products.getAll(params).then(res => res.data);
    case 'product':
      return products.getById(args[0]).then(res => res.data);
    case 'all-staff':
      return accounts.getAllStaff(params).then(res => res.data);
    case 'staff':
      return accounts.getStaffById(args[0]).then(res => res.data);
    case 'products-low-stock':
      return products.getLowStock().then(res => res.data);
    case 'stock-movements':
      return stockMovements.getAll(params).then(res => res.data);
    case 'categories':
      return categories.getAll().then(res => res.data);
    case 'sales':
      return sales.getAll(params).then(res => res.data);
    case 'saleById':
      return sales.getById(args[0]).then(res => res.data);
    case 'sales-today':
      return sales.getTodaySales().then(res => res.data);
    case 'sales-dashboard':
      return sales.getDashboardData(params).then(res => res.data);
    case 'sales-report':
      return sales.getSalesReport(params).then(res => res.data);
    case 'customers':
      return customers.getAll(params).then(res => res.data);
    case 'auth-user':
      return accounts.getMe().then(res => res.data);
    case 'vendors':
      return vendors.getAll(params).then(res => res.data);
    case 'notifications':
      return notifications.getAll(params).then(res => res.data);
    case 'notification':
      return notifications.getById(args[0]).then(res => res.data);
    case 'notifications-stats':
      return notifications.getStats().then(res => res.data);
    case 'notifications-recent':
      return notifications.getRecent().then(res => res.data);
    default:
      throw new Error(`Unknown endpoint: ${endpoint}`);
  }
};

export const useAuthUser = (shouldFetch = true) => {
  return useSWR(shouldFetch ? 'auth-user' : null, fetcher, {
    shouldRetryOnError: (error) => {
      // Don't retry on auth errors
      return error?.response?.status !== 401 && error?.response?.status !== 403;
    },
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    errorRetryCount: 1,
    errorRetryInterval: 5000,
  });
};

export const useSalesDashboard = (params = {}) => {
  return useSWR(['sales-dashboard', params], ([url, params]) => fetcher(url, params));
};

export const useSalesReport = (params = {}) => {
  return useSWR(['sales-report', params], ([url, params]) => fetcher(url, params));
};

export const useProducts = (params = {}) => {
  return useSWR(['products', params], ([url, params]) => fetcher(url, params));
};

export const useProduct = (id) => {
  return useSWR(id ? `product|${id}` : null, fetcher);
};

export const useSale = (id) => {
  return useSWR(id ? `saleById|${id}` : null, fetcher);
};

export const useGetAllStaff = (params = {}) => {
  return useSWR(['all-staff', params], ([url, params]) => fetcher(url, params));
};

export const useGetStaffById = (id) => {
  return useSWR(id ? `staff|${id}` : null, fetcher);
};

export const useStockMovements = (params = {}) => {
  return useSWR(["stock-movements", params], ([url, params]) =>
    fetcher(url, params)
  );
};

export const useLowStockProducts = () => {
  return useSWR('products-low-stock', fetcher);
};

export const useCategories = () => {
  return useSWR('categories', fetcher);
};

export const useSales = (params = {}) => {
  return useSWR(['sales', params], ([url, params]) => fetcher(url, params));
};

export const useTodaySales = () => {
  return useSWR('sales-today', fetcher, {
    refreshInterval: 60000, // Refresh every minute
  });
};

export const useCustomers = (params = {}) => {
  return useSWR(['customers', params], ([url, params]) => fetcher(url, params));
};

export const useVendors = (params = {}) => {
  return useSWR(['vendors', params], ([url, params]) => fetcher(url, params));
};

export const useNotifications = (params = {}) => {
  return useSWR(['notifications', params], ([url, params]) => fetcher(url, params), {
    refreshInterval: 30000, // Refresh every 30 seconds
  });
};

export const useNotification = (id) => {
  return useSWR(id ? `notification|${id}` : null, fetcher);
};

export const useNotificationStats = () => {
  return useSWR('notifications-stats', fetcher, {
    refreshInterval: 30000, // Refresh every 30 seconds
  });
};

export const useRecentNotifications = () => {
  return useSWR('notifications-recent', fetcher, {
    refreshInterval: 30000, // Refresh every 30 seconds
  });
};