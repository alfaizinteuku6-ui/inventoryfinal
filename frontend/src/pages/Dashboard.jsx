import React, { useState, useCallback, useMemo } from 'react';
import {
  Box,
  Container,
  Grid,
  Typography,
  IconButton,
  LinearProgress,
  useTheme,
  alpha,
  Button,
  ButtonGroup,
  Tooltip,
  Tabs,
  Tab,
  Paper,
} from '@mui/material';
import {
  TrendingUp,
  AttachMoney,
  ShoppingCart,
  Refresh,
  Timer,
  ShowChart,
  Inventory,
  Payment,
} from '@mui/icons-material';
import {
  useDashboardSummary,
  useSalesTrend,
  useTopProducts,
  useCategoryPerformance,
  useCustomerAnalytics,
  useInventoryInsights,
  usePaymentAnalytics,
} from '../hooks/useSWR';
import { formatCurrency, formatNumber } from '../utils/utilitys';
import StatCard from '../components/Dashboard/StatCard';
import SalesTrendChart from '../components/Dashboard/SalesTrendChart';
import PaymentStatusChart from '../components/Dashboard/PaymentStatusChart';
import TopProductsTable from '../components/Dashboard/TopProductsTable';
import CategoryPerformanceChart from '../components/Dashboard/CategoryPerformanceChart';
import InventoryAlerts from '../components/Dashboard/InventoryAlerts';
import TopCustomers from '../components/Dashboard/TopCustomers';
import PaymentAnalytics from '../components/Dashboard/PaymentAnalytics';
import PaymentMethodsChart from '../components/Dashboard/PaymentMethodsChart';

const PERIOD_OPTIONS = [
  { key: 'day', label: 'Hari Ini' },
  { key: 'week', label: 'Minggu Ini' },
  { key: 'month', label: 'Bulan Ini' },
  { key: 'year', label: 'Tahun Ini' },
];

// Tab Panel Component
function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`dashboard-tabpanel-${index}`}
      aria-labelledby={`dashboard-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 2 }}>{children}</Box>}
    </div>
  );
}

// ==================== MAIN DASHBOARD COMPONENT ====================
const Dashboard = () => {
  const theme = useTheme();
  const [period, setPeriod] = useState('month');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  // SWR hooks for data fetching
  const { data: dashboardData, isLoading: loadingDashboard, mutate: refetchDashboard } = useDashboardSummary({ period });
  const { data: trendData, isLoading: loadingTrend, mutate: refetchTrend } = useSalesTrend({ period, group_by: 'day' });
  const { data: topProducts, isLoading: loadingProducts, mutate: refetchProducts } = useTopProducts({ period, limit: 10 });
  const { data: categoryData, isLoading: loadingCategory, mutate: refetchCategory } = useCategoryPerformance({ period });
  const { data: customerData, isLoading: loadingCustomers, mutate: refetchCustomers } = useCustomerAnalytics({ period, limit: 10 });
  const { data: inventoryData, isLoading: loadingInventory, mutate: refetchInventory } = useInventoryInsights();
  const { data: paymentData, isLoading: loadingPayments, mutate: refetchPayments } = usePaymentAnalytics({ period });

  const isLoading = loadingDashboard || loadingTrend || loadingProducts || loadingCategory || loadingCustomers || loadingInventory || loadingPayments;

  // Refresh all data
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        refetchDashboard(),
        refetchTrend(),
        refetchProducts(),
        refetchCategory(),
        refetchCustomers(),
        refetchInventory(),
        refetchPayments(),
      ]);
    } finally {
      setTimeout(() => setIsRefreshing(false), 1000);
    }
  }, [refetchDashboard, refetchTrend, refetchProducts, refetchCategory, refetchCustomers, refetchInventory, refetchPayments]);

  const summary = useMemo(() => dashboardData?.summary || {}, [dashboardData]);
  const trend = useMemo(() => summary.revenue_change_percent >= 0 ? 'up' : 'down', [summary.revenue_change_percent]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <Box sx={{ width: '100%', minWidth: 0 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2.5} flexWrap="wrap" gap={2}>
        <Box>
          <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ 
            background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' },
          }}>
            Dashboard Analisis & Performa
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Ringkasan metrik penjualan, perputaran stok, dan arus kas toko
          </Typography>
        </Box>
        
        <Box display="flex" gap={1.5} alignItems="center" flexWrap="wrap">
          <ButtonGroup variant="outlined" size="small">
            {PERIOD_OPTIONS.map((p) => (
              <Button
                key={p.key}
                onClick={() => setPeriod(p.key)}
                variant={period === p.key ? 'contained' : 'outlined'}
                sx={{ 
                  minWidth: { xs: 65, sm: 80 },
                  fontWeight: 600,
                  fontSize: '0.8rem',
                }}
              >
                {p.label}
              </Button>
            ))}
          </ButtonGroup>
          
          <Tooltip title="Perbarui Data">
            <IconButton 
              onClick={handleRefresh} 
              disabled={isRefreshing}
              size="small"
              sx={{ 
                bgcolor: 'background.paper',
                border: `2px solid ${theme.palette.primary.main}`,
                '&:hover': {
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  transform: 'rotate(180deg)',
                },
                transition: 'all 0.5s ease'
              }}
            >
              <Refresh className={isRefreshing ? 'spin' : ''} />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Loading bar */}
      {isLoading && (
        <Box mb={2}>
          <LinearProgress sx={{ borderRadius: 1 }} />
        </Box>
      )}

      {/* Key Metrics - Always Visible */}
      <Grid container spacing={2} mb={3}>
        <Grid size={{ xs: 12, sm: 6, md: 6, lg: 3 }}>
          <StatCard
            title="Total Pendapatan"
            value={formatCurrency(summary.total_revenue)}
            subtitle={`${formatNumber(summary.total_sales)} transaksi`}
            icon={AttachMoney}
            trend={trend}
            trendValue={`${Math.abs(summary.revenue_change_percent || 0)}%`}
            color="primary"
            loading={loadingDashboard}
          />
        </Grid>
        
        <Grid size={{ xs: 12, sm: 6, md: 6, lg: 3 }}>
          <StatCard
            title="Total Keuntungan"
            value={formatCurrency(summary.total_profit)}
            subtitle={`${summary.profit_margin}% margin laba`}
            icon={TrendingUp}
            color="success"
            loading={loadingDashboard}
          />
        </Grid>
        
        <Grid size={{ xs: 12, sm: 6, md: 6, lg: 3 }}>
          <StatCard
            title="Piutang Berjalan"
            value={formatCurrency(summary.total_due)}
            subtitle={`${paymentData?.outstanding?.count || 0} faktur belum lunas`}
            icon={Timer}
            color="warning"
            loading={loadingDashboard}
          />
        </Grid>
        
        <Grid size={{ xs: 12, sm: 6, md: 6, lg: 3 }}>
          <StatCard
            title="Rata-rata Transaksi"
            value={formatCurrency(summary.average_order_value)}
            subtitle="Per penjualan"
            icon={ShoppingCart}
            color="info"
            loading={loadingDashboard}
          />
        </Grid>
      </Grid>

      {/* Tabs Navigation */}
      <Paper sx={{ mb: 3, borderRadius: 2, overflow: 'hidden' }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{
            '& .MuiTab-root': {
              minHeight: 56,
              fontWeight: 600,
              fontSize: { xs: '0.8rem', sm: '0.9rem' },
            },
          }}
        >
          <Tab 
            icon={<ShowChart />} 
            label="Tren Penjualan" 
            iconPosition="start"
          />
          <Tab 
            icon={<Inventory />} 
            label="Produk & Stok" 
            iconPosition="start"
          />
          <Tab 
            icon={<Payment />} 
            label="Pembayaran & Pelanggan" 
            iconPosition="start"
          />
        </Tabs>
      </Paper>

        {/* Tab 1: Sales & Trends */}
        <TabPanel value={activeTab} index={0}>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, lg: 8 }}>
              <SalesTrendChart 
                data={trendData?.data} 
                loading={loadingTrend} 
                period={period} 
              />
            </Grid>
            <Grid size={{ xs: 12, lg: 4 }}>
              <PaymentStatusChart 
                data={dashboardData?.payment_status} 
                loading={loadingDashboard} 
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <CategoryPerformanceChart 
                data={categoryData} 
                loading={loadingCategory} 
              />
            </Grid>
          </Grid>
        </TabPanel>

        {/* Tab 2: Products & Inventory */}
        <TabPanel value={activeTab} index={1}>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, lg: 6 }}>
              <TopProductsTable 
                products={topProducts} 
                loading={loadingProducts} 
              />
            </Grid>
            <Grid size={{ xs: 12, lg: 6 }}>
              <InventoryAlerts 
                data={inventoryData} 
                loading={loadingInventory} 
              />
            </Grid>
          </Grid>
        </TabPanel>

        {/* Tab 3: Payments & Customers */}
        <TabPanel value={activeTab} index={2}>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, lg: 4 }}>
              <TopCustomers 
                data={customerData} 
                loading={loadingCustomers} 
              />
            </Grid>
            <Grid size={{ xs: 12, lg: 8 }}>
              <PaymentMethodsChart 
                data={dashboardData?.payment_methods} 
                loading={loadingDashboard} 
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <PaymentAnalytics 
                data={paymentData} 
                loading={loadingPayments} 
              />
            </Grid>
          </Grid>
        </TabPanel>
      
      {/* Animations */}
      <style>{`
        .spin {
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </Box>
  );
};

export default Dashboard;