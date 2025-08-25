import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Tabs,
  Tab,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Divider,
  IconButton,
  Tooltip,
  useTheme,
  useMediaQuery,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Assessment,
  CalendarToday,
  AttachMoney,
  ShoppingCart,
  People,
  Inventory,
  FileDownload,
  Refresh,
  DateRange,
  FilterList
} from '@mui/icons-material';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts';

const ReportsPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [activeTab, setActiveTab] = useState(0);
  const [dateRange, setDateRange] = useState({
    start_date: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0]
  });
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);

  // Sample data - replace with actual API calls
  const sampleReportData = {
    period: { start: dateRange.start_date, end: dateRange.end_date },
    summary: {
      total_sales: 125000,
      total_items: 450,
      count: 85,
      average_order_value: 1470.59
    },
    sales_by_date: [
      { sale_date__date: '2024-01-01', total_sales: 5500, orders_count: 8, items_sold: 25, avg_order_value: 687.5 },
      { sale_date__date: '2024-01-02', total_sales: 7200, orders_count: 12, items_sold: 38, avg_order_value: 600 },
      { sale_date__date: '2024-01-03', total_sales: 4800, orders_count: 6, items_sold: 18, avg_order_value: 800 },
      { sale_date__date: '2024-01-04', total_sales: 9100, orders_count: 15, items_sold: 42, avg_order_value: 606.67 },
      { sale_date__date: '2024-01-05', total_sales: 6300, orders_count: 9, items_sold: 28, avg_order_value: 700 },
    ],
    payment_methods: [
      { payment_method: 'Credit Card', count: 35, total: 52500 },
      { payment_method: 'Cash', count: 28, total: 42000 },
      { payment_method: 'Debit Card', count: 15, total: 22500 },
      { payment_method: 'UPI', count: 7, total: 8000 }
    ],
    top_products: [
      { product__name: 'Wireless Headphones', quantity_sold: 45, total_amount: 22500 },
      { product__name: 'Smartphone Case', quantity_sold: 38, total_amount: 7600 },
      { product__name: 'Laptop Stand', quantity_sold: 32, total_amount: 16000 },
      { product__name: 'USB Cable', quantity_sold: 28, total_amount: 2800 },
      { product__name: 'Power Bank', quantity_sold: 25, total_amount: 12500 }
    ]
  };

  const sampleDashboardData = {
    today: {
      date: new Date().toISOString().split('T')[0],
      total_revenue: 2500,
      sales_count: 5,
      items_sold: 18,
      average_sale: 500,
      vs_yesterday: {
        changes: {
          revenue_change: 12.5,
          sales_count_change: -20,
          items_sold_change: 5.9,
          avg_sale_change: 40.6
        }
      }
    },
    month: {
      total_revenue: 85000,
      sales_count: 120,
      items_sold: 380,
      average_sale: 708.33,
      vs_previous_month: {
        changes: {
          revenue_change: 18.2,
          sales_count_change: 8.1,
          items_sold_change: 15.2,
          avg_sale_change: 9.3
        }
      }
    }
  };

  useEffect(() => {
    loadReportData();
    loadDashboardData();
  }, [dateRange]);

  const loadReportData = async () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setReportData(sampleReportData);
      setLoading(false);
    }, 1000);
  };

  const loadDashboardData = async () => {
    // Simulate API call
    setTimeout(() => {
      setDashboardData(sampleDashboardData);
    }, 500);
  };

  const handleDateRangeChange = (field, value) => {
    setDateRange(prev => ({ ...prev, [field]: value }));
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getChangeColor = (change) => {
    return change >= 0 ? theme.palette.success.main : theme.palette.error.main;
  };

  const getChangeIcon = (change) => {
    return change >= 0 ? <TrendingUp /> : <TrendingDown />;
  };

  const StatCard = ({ title, value, change, icon, subtitle }) => (
    <Card sx={{ height: '100%', position: 'relative', overflow: 'visible' }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography color="textSecondary" gutterBottom variant="body2">
              {title}
            </Typography>
            <Typography variant="h4" component="div" fontWeight="bold">
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="textSecondary">
                {subtitle}
              </Typography>
            )}
            {change !== undefined && (
              <Box display="flex" alignItems="center" mt={1}>
                <Box
                  display="flex"
                  alignItems="center"
                  color={getChangeColor(change)}
                  sx={{ fontSize: '0.875rem' }}
                >
                  {getChangeIcon(change)}
                  <Typography variant="body2" sx={{ ml: 0.5, fontWeight: 'medium' }}>
                    {Math.abs(change)}%
                  </Typography>
                </Box>
                <Typography variant="body2" color="textSecondary" sx={{ ml: 1 }}>
                  vs previous period
                </Typography>
              </Box>
            )}
          </Box>
          <Box
            sx={{
              backgroundColor: theme.palette.primary.main,
              color: 'white',
              borderRadius: 2,
              p: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  const TabPanel = ({ children, value, index }) => (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box>{children}</Box>}
    </div>
  );

  const SalesReportTab = () => (
    <Box>
      {/* Date Range Filters */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box display="flex" alignItems="center" mb={2}>
          <DateRange sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="h6">Report Filters</Typography>
        </Box>
        <Grid container spacing={2} alignItems="center">
          <Grid size={{xs:12, sm:4}}>
            <TextField
              fullWidth
              label="Start Date"
              type="date"
              value={dateRange.start_date}
              onChange={(e) => handleDateRangeChange('start_date', e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid size={{xs:12, sm:4}}>
            <TextField
              fullWidth
              label="End Date"
              type="date"
              value={dateRange.end_date}
              onChange={(e) => handleDateRangeChange('end_date', e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid size={{xs:12, sm:4}}>
            <Box display="flex" gap={1}>
              <Button
                variant="outlined"
                startIcon={<Refresh />}
                onClick={loadReportData}
                disabled={loading}
              >
                Refresh
              </Button>
              <Button
                variant="contained"
                startIcon={<FileDownload />}
                onClick={() => console.log('Export report')}
              >
                Export
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {loading ? (
        <Box display="flex" justifyContent="center" p={4}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* Summary Cards */}
          <Grid container spacing={3} mb={3}>
            <Grid size={{xs:12, sm:6, md:3}}>
              <StatCard
                title="Total Revenue"
                value={formatCurrency(reportData?.summary?.total_sales || 0)}
                icon={<AttachMoney />}
              />
            </Grid>
            <Grid size={{xs:12, sm:6, md:3}}>
              <StatCard
                title="Total Orders"
                value={reportData?.summary?.count || 0}
                icon={<ShoppingCart />}
              />
            </Grid>
            <Grid size={{xs:12, sm:6, md:3}}>
              <StatCard
                title="Items Sold"
                value={reportData?.summary?.total_items || 0}
                icon={<Inventory />}
              />
            </Grid>
            <Grid size={{xs:12, sm:6, md:3}}>
              <StatCard
                title="Avg Order Value"
                value={formatCurrency(reportData?.summary?.average_order_value || 0)}
                icon={<Assessment />}
              />
            </Grid>
          </Grid>

          {/* Charts */}
          <Grid container spacing={3} mb={3}>
            <Grid size={{xs:12, lg:8}}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" mb={2}>Sales Trend</Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={reportData?.sales_by_date || []}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.8}/>
                        <stop offset="95%" stopColor={theme.palette.primary.main} stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <XAxis 
                      dataKey="sale_date__date" 
                      tick={{ fontSize: 12 }}
                      tickFormatter={(date) => new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                    />
                    <YAxis tick={{ fontSize: 12 }} />
                    <CartesianGrid strokeDasharray="3 3" />
                    <RechartsTooltip 
                      formatter={(value) => [formatCurrency(value), 'Revenue']}
                      labelFormatter={(date) => new Date(date).toLocaleDateString('en-IN')}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="total_sales" 
                      stroke={theme.palette.primary.main}
                      fillOpacity={1}
                      fill="url(#colorRevenue)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
            <Grid size={{xs:12, lg:4}}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" mb={2}>Payment Methods</Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={reportData?.payment_methods || []}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="total"
                      label={({ payment_method, percent }) => `${payment_method} ${(percent * 100).toFixed(0)}%`}
                    >
                      {reportData?.payment_methods?.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={theme.palette.primary.main} fillOpacity={0.8 - (index * 0.1)} />
                      ))}
                    </Pie>
                    <RechartsTooltip formatter={(value) => [formatCurrency(value), 'Amount']} />
                  </PieChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
          </Grid>

          {/* Top Products */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" mb={2}>Top Selling Products</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={reportData?.top_products || []} layout="horizontal">
                <XAxis type="number" />
                <YAxis dataKey="product__name" type="category" width={120} tick={{ fontSize: 12 }} />
                <CartesianGrid strokeDasharray="3 3" />
                <RechartsTooltip formatter={(value) => [value, 'Quantity Sold']} />
                <Bar dataKey="quantity_sold" fill={theme.palette.secondary.main} />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </>
      )}
    </Box>
  );

  const CustomersReportTab = () => (
    <Box>
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <People sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
        <Typography variant="h5" mb={1}>Customers Report</Typography>
        <Typography color="textSecondary" mb={2}>
          Customer analytics and insights will be available here
        </Typography>
        <Alert severity="info">
          Customer reporting features will be implemented once you share the customer API endpoints.
        </Alert>
      </Paper>
    </Box>
  );

  const InventoryReportTab = () => (
    <Box>
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Inventory sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
        <Typography variant="h5" mb={1}>Inventory Report</Typography>
        <Typography color="textSecondary" mb={2}>
          Product inventory analytics and stock reports will be available here
        </Typography>
        <Alert severity="info">
          Inventory reporting features will be implemented once you share the inventory API endpoints.
        </Alert>
      </Paper>
    </Box>
  );

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box mb={4}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
          Reports & Analytics
        </Typography>
        <Typography variant="subtitle1" color="textSecondary">
          Comprehensive business insights and performance metrics
        </Typography>
      </Box>

      {/* Dashboard Overview (only show on Sales tab) */}
      {activeTab === 0 && dashboardData && (
        <Grid container spacing={3} mb={4}>
          <Grid size={{xs:12, md:6}}>
            <StatCard
              title="Today's Revenue"
              value={formatCurrency(dashboardData.today.total_revenue)}
              change={dashboardData.today.vs_yesterday.changes.revenue_change}
              subtitle={`${dashboardData.today.sales_count} orders • ${dashboardData.today.items_sold} items`}
              icon={<AttachMoney />}
            />
          </Grid>
          <Grid size={{xs:12, md:6}}>
            <StatCard
              title="Monthly Revenue"
              value={formatCurrency(dashboardData.month.total_revenue)}
              change={dashboardData.month.vs_previous_month.changes.revenue_change}
              subtitle={`${dashboardData.month.sales_count} orders • ${dashboardData.month.items_sold} items`}
              icon={<TrendingUp />}
            />
          </Grid>
        </Grid>
      )}

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          variant={isMobile ? "scrollable" : "fullWidth"}
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab
            label="Sales Reports"
            icon={<Assessment />}
            iconPosition="start"
            sx={{ minHeight: 48 }}
          />
          <Tab
            label="Customers"
            icon={<People />}
            iconPosition="start"
            sx={{ minHeight: 48 }}
          />
          <Tab
            label="Inventory"
            icon={<Inventory />}
            iconPosition="start"
            sx={{ minHeight: 48 }}
          />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      <TabPanel value={activeTab} index={0}>
        <SalesReportTab />
      </TabPanel>
      <TabPanel value={activeTab} index={1}>
        <CustomersReportTab />
      </TabPanel>
      <TabPanel value={activeTab} index={2}>
        <InventoryReportTab />
      </TabPanel>
    </Container>
  );
};

export default ReportsPage;