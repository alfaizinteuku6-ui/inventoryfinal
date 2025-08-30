import useSWR from 'swr';
import { products, categories, sales, customers, vendors, stockMovements, accounts } from '../services/api';

const fetcher = (url, params) => {
  const [endpoint, ...args] = url.split('|');
  
  switch (endpoint) {
    case 'products':
      return products.getAll(params).then(res => res.data);
    case 'product':
      return products.getById(args[0]).then(res => res.data);
    case 'products-low-stock':
      return products.getLowStock().then(res => res.data);
    case 'stock-movements':
        return stockMovements.getAll().then(res => res.data);
    case 'categories':
      return categories.getAll().then(res => res.data);
    case 'sales':
      return sales.getAll(params).then(res => res.data);
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