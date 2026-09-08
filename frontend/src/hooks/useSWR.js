import useSWR from 'swr';
import {
  products,
  categories,
  sales,
  customers,
  vendors,
  suppliers,
  stockMovements,
  accounts,
  notifications,
  analytics,
} from '../services/api';

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
    case 'suppliers':
      return suppliers.getAll(params).then(res => res.data);
    case 'supplier':
      return suppliers.getById(args[0]).then(res => res.data);
    case 'notifications':
      return notifications.getAll(params).then(res => res.data);
    case 'notification':
      return notifications.getById(args[0]).then(res => res.data);
    case 'notifications-stats':
      return notifications.getStats().then(res => res.data);
    case 'notifications-recent':
      return notifications.getRecent().then(res => res.data);

    // ✅ New Analytics Endpoints
    case 'analytics-dashboard':
      return analytics.getDashboardSummary(params).then(res => res.data);
    case 'analytics-sales-trend':
      return analytics.getSalesTrend(params).then(res => res.data);
    case 'analytics-top-products':
      return analytics.getTopProducts(params).then(res => res.data);
    case 'analytics-category-performance':
      return analytics.getCategoryPerformance(params).then(res => res.data);
    case 'analytics-customer':
      return analytics.getCustomerAnalytics(params).then(res => res.data);
    case 'analytics-inventory':
      return analytics.getInventoryInsights(params).then(res => res.data);
    case 'analytics-payment':
      return analytics.getPaymentAnalytics(params).then(res => res.data);

    default:
      throw new Error(`Unknown endpoint: ${endpoint}`);
  }
};

export const useAuthUser = (shouldFetch = true) => {
  return useSWR(shouldFetch ? 'auth-user' : null, fetcher, {
    shouldRetryOnError: (error) => error?.response?.status !== 401 && error?.response?.status !== 403,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    errorRetryCount: 1,
    errorRetryInterval: 5000,
  });
};

// Analytics Hooks
export const useDashboardSummary = (params = {}) =>
  useSWR(['analytics-dashboard', params], ([url, params]) => fetcher(url, params));

export const useSalesTrend = (params = {}) =>
  useSWR(['analytics-sales-trend', params], ([url, params]) => fetcher(url, params));

export const useTopProducts = (params = {}) =>
  useSWR(['analytics-top-products', params], ([url, params]) => fetcher(url, params));

export const useCategoryPerformance = (params = {}) =>
  useSWR(['analytics-category-performance', params], ([url, params]) => fetcher(url, params));

export const useCustomerAnalytics = (params = {}) =>
  useSWR(['analytics-customer', params], ([url, params]) => fetcher(url, params));

export const useInventoryInsights = (params = {}) =>
  useSWR(['analytics-inventory', params], ([url, params]) => fetcher(url, params));

export const usePaymentAnalytics = (params = {}) =>
  useSWR(['analytics-payment', params], ([url, params]) => fetcher(url, params));

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

export const useSuppliers = (params = {}) => {
  return useSWR(['suppliers', params], ([url, params]) => fetcher(url, params));
};

export const useSupplier = (id) => {
  return useSWR(id ? `supplier|${id}` : null, fetcher);
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