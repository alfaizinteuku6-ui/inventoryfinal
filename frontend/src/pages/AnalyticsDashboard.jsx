import React, { useState, useCallback, useMemo } from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  IconButton,
  Chip,
  LinearProgress,
  Alert,
  Skeleton,
  useTheme,
  alpha,
  Button,
  ButtonGroup,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Divider,
  Tooltip,
  Fade,
  Zoom,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  AttachMoney,
  ShoppingCart,
  People,
  Inventory,
  Refresh,
  Warning,
  Timer,
  CreditCard,
  Star,
  LocalOffer,
  Receipt,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import {
  useDashboardSummary,
  useSalesTrend,
  useTopProducts,
  useCategoryPerformance,
  useCustomerAnalytics,
  useInventoryInsights,
  usePaymentAnalytics,
} from '../hooks/useSWR';

// ==================== CONSTANTS ====================
const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444'];
const PERIOD_OPTIONS = ['day', 'week', 'month', 'year'];

// ==================== UTILITY FUNCTIONS ====================
const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(parseFloat(value || 0));
};

const formatNumber = (value) => {
  return new Intl.NumberFormat('en-IN').format(value);
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    year: 'numeric'
  });
};

const getShortDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric' 
  });
};

// ==================== STAT CARD COMPONENT ====================
const StatCard = ({ title, value, subtitle, icon: Icon, trend, trendValue, color = 'primary', loading }) => {
  const theme = useTheme();
  
  if (loading) {
    return (
      <Card elevation={0} sx={{ height: '100%', border: `1px solid ${theme.palette.divider}` }}>
        <CardContent>
          <Skeleton variant="text" width="60%" />
          <Skeleton variant="text" width="40%" height={40} sx={{ my: 1 }} />
          <Skeleton variant="text" width="50%" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Zoom in timeout={300}>
      <Card 
        elevation={0} 
        sx={{ 
          height: '100%',
          border: `1px solid ${theme.palette.divider}`,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          position: 'relative',
          overflow: 'hidden',
          '&:hover': {
            boxShadow: theme.shadows[8],
            transform: 'translateY(-4px)',
            borderColor: theme.palette[color].main,
          },
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '3px',
            bgcolor: theme.palette[color].main,
          }
        }}
      >
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
            <Typography variant="body2" color="text.secondary" fontWeight={600} letterSpacing={0.5}>
              {title}
            </Typography>
            <Avatar
              sx={{
                bgcolor: alpha(theme.palette[color].main, 0.1),
                color: theme.palette[color].main,
                width: 48,
                height: 48,
              }}
            >
              <Icon />
            </Avatar>
          </Box>
          
          <Typography variant="h3" fontWeight="bold" gutterBottom sx={{ fontSize: { xs: '1.75rem', md: '2.5rem' } }}>
            {value}
          </Typography>
          
          {subtitle && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: trend ? 1 : 0 }}>
              {subtitle}
            </Typography>
          )}
          
          {trend && (
            <Box display="flex" alignItems="center" gap={0.5}>
              <Chip
                icon={trend === 'up' ? <TrendingUp fontSize="small" /> : <TrendingDown fontSize="small" />}
                label={trendValue}
                size="small"
                sx={{
                  bgcolor: alpha(theme.palette[trend === 'up' ? 'success' : 'error'].main, 0.1),
                  color: theme.palette[trend === 'up' ? 'success' : 'error'].main,
                  fontWeight: 700,
                  '& .MuiChip-icon': {
                    color: 'inherit'
                  }
                }}
              />
              <Typography variant="caption" color="text.secondary">
                vs last period
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </Zoom>
  );
};

// ==================== SALES TREND CHART ====================
const SalesTrendChart = ({ data, loading, period }) => {
  const theme = useTheme();

  if (loading) {
    return <Skeleton variant="rectangular" height={350} sx={{ borderRadius: 2 }} />;
  }

  return (
    <Fade in timeout={500}>
      <Paper elevation={0} sx={{ p: 3, border: `1px solid ${theme.palette.divider}`, borderRadius: 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box>
            <Typography variant="h6" fontWeight="bold">
              Sales Trend
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Revenue and profit over time
            </Typography>
          </Box>
          <Chip label={period.toUpperCase()} size="small" color="primary" variant="outlined" />
        </Box>
        
        <ResponsiveContainer width="100%" height={350}>
          <AreaChart data={data || []}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
            <XAxis 
              dataKey="period" 
              tickFormatter={getShortDate}
              stroke={theme.palette.text.secondary}
              style={{ fontSize: 12 }}
            />
            <YAxis 
              stroke={theme.palette.text.secondary}
              style={{ fontSize: 12 }}
              tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
            />
            <RechartsTooltip 
              formatter={(value) => formatCurrency(value)}
              labelFormatter={formatDate}
              contentStyle={{
                backgroundColor: theme.palette.background.paper,
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 8,
                boxShadow: theme.shadows[4]
              }}
            />
            <Legend />
            <Area 
              type="monotone" 
              dataKey="revenue" 
              stroke="#6366f1" 
              fillOpacity={1} 
              fill="url(#colorRevenue)" 
              name="Revenue"
              strokeWidth={3}
            />
            <Area 
              type="monotone" 
              dataKey="profit" 
              stroke="#10b981" 
              fillOpacity={1} 
              fill="url(#colorProfit)" 
              name="Profit"
              strokeWidth={3}
            />
          </AreaChart>
        </ResponsiveContainer>
      </Paper>
    </Fade>
  );
};

// ==================== PAYMENT STATUS PIE CHART ====================
const PaymentStatusChart = ({ data, loading }) => {
  const theme = useTheme();

  if (loading) {
    return <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 2 }} />;
  }

  const totalAmount = data?.reduce((sum, item) => sum + parseFloat(item.amount), 0) || 0;

  return (
    <Fade in timeout={500}>
      <Paper elevation={0} sx={{ p: 3, height: '100%', border: `1px solid ${theme.palette.divider}`, borderRadius: 2 }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          Payment Status
        </Typography>
        <Typography variant="caption" color="text.secondary" display="block" mb={2}>
          Distribution by status
        </Typography>
        
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={data || []}
              dataKey="count"
              nameKey="status"
              cx="50%"
              cy="50%"
              outerRadius={90}
              label={({ status, percent }) => `${status}: ${(percent * 100).toFixed(0)}%`}
              labelLine={false}
            >
              {(data || []).map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <RechartsTooltip 
              formatter={(value, name, props) => [
                `${value} orders (${formatCurrency(props.payload.amount)})`,
                props.payload.status
              ]}
              contentStyle={{
                backgroundColor: theme.palette.background.paper,
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 8
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        
        <Divider sx={{ my: 2 }} />
        
        <Box>
          {(data || []).map((item, index) => {
            const percentage = totalAmount > 0 ? (parseFloat(item.amount) / totalAmount * 100).toFixed(1) : 0;
            return (
              <Box 
                key={item.status} 
                display="flex" 
                justifyContent="space-between" 
                alignItems="center"
                py={1}
                px={1}
                borderRadius={1}
                sx={{
                  '&:hover': {
                    bgcolor: alpha(COLORS[index % COLORS.length], 0.05)
                  }
                }}
              >
                <Box display="flex" alignItems="center" gap={1.5}>
                  <Box
                    sx={{
                      width: 16,
                      height: 16,
                      borderRadius: 1,
                      bgcolor: COLORS[index % COLORS.length],
                    }}
                  />
                  <Box>
                    <Typography variant="body2" textTransform="capitalize" fontWeight={600}>
                      {item.status}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {item.count} orders • {percentage}%
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="body2" fontWeight="bold">
                  {formatCurrency(item.amount)}
                </Typography>
              </Box>
            );
          })}
        </Box>
      </Paper>
    </Fade>
  );
};

// ==================== TOP PRODUCTS TABLE ====================
const TopProductsTable = ({ products, loading }) => {
  const theme = useTheme();

  if (loading) {
    return <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 2 }} />;
  }

  return (
    <Fade in timeout={500}>
      <Paper elevation={0} sx={{ p: 3, border: `1px solid ${theme.palette.divider}`, borderRadius: 2 }}>
        <Box display="flex" alignItems="center" gap={1} mb={3}>
          <Star sx={{ color: theme.palette.warning.main }} />
          <Box>
            <Typography variant="h6" fontWeight="bold">
              Top Products
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Best performers by revenue
            </Typography>
          </Box>
        </Box>
        
        <TableContainer sx={{ maxHeight: 400 }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
                  Product
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
                  Sold
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
                  Revenue
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
                  Profit
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(products?.by_revenue || []).slice(0, 8).map((product, index) => (
                <TableRow 
                  key={product.product_id} 
                  hover
                  sx={{
                    '&:hover': {
                      bgcolor: alpha(theme.palette.primary.main, 0.02)
                    }
                  }}
                >
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Avatar 
                        sx={{ 
                          width: 32, 
                          height: 32, 
                          bgcolor: alpha(COLORS[index % COLORS.length], 0.2),
                          color: COLORS[index % COLORS.length],
                          fontSize: 14,
                          fontWeight: 700
                        }}
                      >
                        {index + 1}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight={600}>
                          {product.product_name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {product.sku}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    <Chip 
                      label={formatNumber(product.quantity_sold)} 
                      size="small" 
                      sx={{ 
                        fontWeight: 600,
                        bgcolor: alpha(theme.palette.info.main, 0.1),
                        color: theme.palette.info.main
                      }} 
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" fontWeight={700}>
                      {formatCurrency(product.revenue)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Box>
                      <Typography variant="body2" fontWeight={700} color="success.main">
                        {formatCurrency(product.profit)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {product.profit_margin}% margin
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Fade>
  );
};

// ==================== CATEGORY PERFORMANCE CHART ====================
const CategoryPerformanceChart = ({ data, loading }) => {
  const theme = useTheme();

  if (loading) {
    return <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 2 }} />;
  }

  const chartData = (data?.categories || []).slice(0, 8);

  return (
    <Fade in timeout={500}>
      <Paper elevation={0} sx={{ p: 3, border: `1px solid ${theme.palette.divider}`, borderRadius: 2 }}>
        <Box display="flex" alignItems="center" gap={1} mb={3}>
          <LocalOffer sx={{ color: theme.palette.secondary.main }} />
          <Box>
            <Typography variant="h6" fontWeight="bold">
              Category Performance
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Revenue and profit by category
            </Typography>
          </Box>
        </Box>
        
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
            <XAxis 
              dataKey="category_name" 
              stroke={theme.palette.text.secondary}
              angle={-45}
              textAnchor="end"
              height={100}
              style={{ fontSize: 11 }}
            />
            <YAxis 
              stroke={theme.palette.text.secondary}
              style={{ fontSize: 12 }}
              tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
            />
            <RechartsTooltip 
              formatter={(value) => formatCurrency(value)}
              contentStyle={{
                backgroundColor: theme.palette.background.paper,
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 8,
                boxShadow: theme.shadows[4]
              }}
            />
            <Legend />
            <Bar dataKey="revenue" fill="#6366f1" name="Revenue" radius={[8, 8, 0, 0]} />
            <Bar dataKey="profit" fill="#10b981" name="Profit" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Paper>
    </Fade>
  );
};

// ==================== INVENTORY ALERTS ====================
const InventoryAlerts = ({ data, loading }) => {
  const theme = useTheme();

  if (loading) {
    return <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 2 }} />;
  }

  return (
    <Fade in timeout={500}>
      <Paper elevation={0} sx={{ p: 3, border: `1px solid ${theme.palette.divider}`, borderRadius: 2 }}>
        <Box display="flex" alignItems="center" gap={1} mb={3}>
          <Inventory sx={{ color: theme.palette.warning.main }} />
          <Box>
            <Typography variant="h6" fontWeight="bold">
              Inventory Alerts
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Stock status and warnings
            </Typography>
          </Box>
        </Box>
        
        <Grid container spacing={2} mb={3}>
          <Grid size={{ xs: 4 }}>
            <Box 
              textAlign="center" 
              p={2.5} 
              bgcolor={alpha(theme.palette.error.main, 0.1)} 
              borderRadius={2}
              sx={{
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: theme.shadows[4]
                }
              }}
            >
              <Typography variant="h3" fontWeight="bold" color="error.main">
                {data?.out_of_stock_count || 0}
              </Typography>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                Out of Stock
              </Typography>
            </Box>
          </Grid>
          <Grid size={{ xs: 4 }}>
            <Box 
              textAlign="center" 
              p={2.5} 
              bgcolor={alpha(theme.palette.warning.main, 0.1)} 
              borderRadius={2}
              sx={{
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: theme.shadows[4]
                }
              }}
            >
              <Typography variant="h3" fontWeight="bold" color="warning.main">
                {data?.low_stock_products?.length || 0}
              </Typography>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                Low Stock
              </Typography>
            </Box>
          </Grid>
          <Grid size={{ xs: 4 }}>
            <Box 
              textAlign="center" 
              p={2.5} 
              bgcolor={alpha(theme.palette.success.main, 0.1)} 
              borderRadius={2}
              sx={{
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: theme.shadows[4]
                }
              }}
            >
              <Typography variant="h4" fontWeight="bold" color="success.main" sx={{ fontSize: '1.5rem' }}>
                {formatCurrency(data?.inventory_value?.retail_value || 0)}
              </Typography>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                Total Value
              </Typography>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle2" fontWeight="bold" gutterBottom color="warning.main">
          ⚠️ Low Stock Products
        </Typography>
        <Box sx={{ maxHeight: 200, overflow: 'auto' }}>
          {(data?.low_stock_products || []).slice(0, 5).map((product, index) => (
            <Box 
              key={product.id} 
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              py={1.5}
              px={1.5}
              mb={1}
              borderRadius={1}
              sx={{
                bgcolor: alpha(theme.palette.warning.main, 0.05),
                border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`,
                '&:hover': {
                  bgcolor: alpha(theme.palette.warning.main, 0.1)
                }
              }}
            >
              <Box>
                <Typography variant="body2" fontWeight={600}>
                  {product.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  SKU: {product.sku}
                </Typography>
              </Box>
              <Chip 
                label={`${product.stock_quantity} left`}
                size="small"
                color="warning"
                icon={<Warning fontSize="small" />}
                sx={{ fontWeight: 700 }}
              />
            </Box>
          ))}
        </Box>
      </Paper>
    </Fade>
  );
};

// ==================== TOP CUSTOMERS ====================
const TopCustomers = ({ data, loading }) => {
  const theme = useTheme();

  if (loading) {
    return <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 2 }} />;
  }

  return (
    <Fade in timeout={500}>
      <Paper elevation={0} sx={{ p: 3, border: `1px solid ${theme.palette.divider}`, borderRadius: 2 }}>
        <Box display="flex" alignItems="center" gap={1} mb={3}>
          <People sx={{ color: theme.palette.primary.main }} />
          <Box>
            <Typography variant="h6" fontWeight="bold">
              Top Customers
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Highest spending customers
            </Typography>
          </Box>
        </Box>
        
        <Grid container spacing={2} mb={3}>
          <Grid size={{ xs: 6 }}>
            <Box 
              textAlign="center" 
              p={2.5} 
              bgcolor={alpha(theme.palette.primary.main, 0.1)} 
              borderRadius={2}
              sx={{
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: theme.shadows[4]
                }
              }}
            >
              <Typography variant="h3" fontWeight="bold" color="primary.main">
                {data?.customer_segments?.total_customers || 0}
              </Typography>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                Total Customers
              </Typography>
            </Box>
          </Grid>
          <Grid size={{ xs: 6 }}>
            <Box 
              textAlign="center" 
              p={2.5} 
              bgcolor={alpha(theme.palette.success.main, 0.1)} 
              borderRadius={2}
              sx={{
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: theme.shadows[4]
                }
              }}
            >
              <Typography variant="h3" fontWeight="bold" color="success.main">
                {data?.customer_segments?.high_value || 0}
              </Typography>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                High Value (₹10k+)
              </Typography>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
          🌟 Top Spenders
        </Typography>
        <Box sx={{ maxHeight: 200, overflow: 'auto' }}>
          {(data?.top_customers || []).slice(0, 5).map((customer, index) => (
            <Box 
              key={customer.customer_id} 
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              py={1.5}
              px={1}
              borderRadius={1}
              sx={{
                '&:hover': {
                  bgcolor: alpha(theme.palette.primary.main, 0.05)
                }
              }}
            >
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar 
                  sx={{ 
                    bgcolor: COLORS[index % COLORS.length],
                    fontWeight: 700
                  }}
                >
                  {customer.customer_name.charAt(0)}
                </Avatar>
                <Box>
                  <Typography variant="body2" fontWeight={600}>
                    {customer.customer_name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {customer.total_purchases} purchases
                  </Typography>
                </Box>
              </Box>
              <Box textAlign="right">
                <Typography variant="body2" fontWeight={700}>
                  {formatCurrency(customer.total_spent)}
                </Typography>
                {parseFloat(customer.total_due) > 0 && (
                  <Chip
                    label={`Due: ${formatCurrency(customer.total_due)}`}
                    size="small"
                    color="warning"
                    sx={{ height: 18, fontSize: 10, mt: 0.5 }}
                  />
                )}
              </Box>
            </Box>
          ))}
        </Box>
      </Paper>
    </Fade>
  );
};

// ==================== PAYMENT ANALYTICS ====================
const PaymentAnalytics = ({ data, loading }) => {
  const theme = useTheme();

  if (loading) {
    return <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2 }} />;
  }

  const collectionRate = data?.collection_rate || 0;

  return (
    <Fade in timeout={500}>
      <Paper elevation={0} sx={{ p: 3, border: `1px solid ${theme.palette.divider}`, borderRadius: 2 }}>
        <Box display="flex" alignItems="center" gap={1} mb={3}>
          <Receipt sx={{ color: theme.palette.info.main }} />
          <Box>
            <Typography variant="h6" fontWeight="bold">
              Payment Analytics
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Collection and outstanding summary
            </Typography>
          </Box>
        </Box>
        
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Box 
              textAlign="center" 
              p={2.5} 
              bgcolor={alpha(theme.palette.info.main, 0.1)} 
              borderRadius={2}
              sx={{
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: theme.shadows[4]
                }
              }}
            >
              <Typography variant="h4" fontWeight="bold" color="info.main">
                {collectionRate.toFixed(1)}%
              </Typography>
              <Typography variant="body2" color="text.secondary" mt={1} fontWeight={600}>
                Collection Rate
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={collectionRate} 
                sx={{ 
                  mt: 2, 
                  height: 8, 
                  borderRadius: 4,
                  bgcolor: alpha(theme.palette.info.main, 0.2),
                  '& .MuiLinearProgress-bar': {
                    bgcolor: theme.palette.info.main
                  }
                }}
              />
            </Box>
          </Grid>
          
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Box 
              textAlign="center" 
              p={2.5} 
              bgcolor={alpha(theme.palette.success.main, 0.1)} 
              borderRadius={2}
              sx={{
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: theme.shadows[4]
                }
              }}
            >
              <Typography variant="h5" fontWeight="bold" color="success.main">
                {formatCurrency(data?.total_collected || 0)}
              </Typography>
              <Typography variant="body2" color="text.secondary" mt={1} fontWeight={600}>
                Collected
              </Typography>
              <Typography variant="caption" color="text.secondary">
                of {formatCurrency(data?.total_billed || 0)}
              </Typography>
            </Box>
          </Grid>
          
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Box 
              textAlign="center" 
              p={2.5} 
              bgcolor={alpha(theme.palette.warning.main, 0.1)} 
              borderRadius={2}
              sx={{
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: theme.shadows[4]
                }
              }}
            >
              <Typography variant="h5" fontWeight="bold" color="warning.main">
                {formatCurrency(data?.outstanding?.amount || 0)}
              </Typography>
              <Typography variant="body2" color="text.secondary" mt={1} fontWeight={600}>
                Outstanding
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {data?.outstanding?.count || 0} invoices
              </Typography>
            </Box>
          </Grid>
          
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Box 
              textAlign="center" 
              p={2.5} 
              bgcolor={alpha(theme.palette.error.main, 0.1)} 
              borderRadius={2}
              sx={{
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: theme.shadows[4]
                }
              }}
            >
              <Typography variant="h5" fontWeight="bold" color="error.main">
                {formatCurrency(data?.overdue?.amount || 0)}
              </Typography>
              <Typography variant="body2" color="text.secondary" mt={1} fontWeight={600}>
                Overdue
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {data?.overdue?.count || 0} invoices
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Fade>
  );
};

// ==================== PAYMENT METHODS CHART ====================
const PaymentMethodsChart = ({ data, loading }) => {
  const theme = useTheme();

  if (loading) {
    return <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 2 }} />;
  }

  const total = (data || []).reduce((sum, m) => sum + parseFloat(m.amount), 0);

  return (
    <Fade in timeout={500}>
      <Paper elevation={0} sx={{ p: 3, border: `1px solid ${theme.palette.divider}`, borderRadius: 2 }}>
        <Box display="flex" alignItems="center" gap={1} mb={3}>
          <CreditCard sx={{ color: theme.palette.secondary.main }} />
          <Box>
            <Typography variant="h6" fontWeight="bold">
              Payment Methods
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Distribution by payment type
            </Typography>
          </Box>
        </Box>
        
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={data || []} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                <XAxis 
                  type="number" 
                  stroke={theme.palette.text.secondary}
                  tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
                />
                <YAxis 
                  dataKey="method" 
                  type="category" 
                  stroke={theme.palette.text.secondary}
                  tickFormatter={(value) => value.toUpperCase()}
                  width={80}
                />
                <RechartsTooltip 
                  formatter={(value) => formatCurrency(value)}
                  contentStyle={{
                    backgroundColor: theme.palette.background.paper,
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: 8
                  }}
                />
                <Bar dataKey="amount" fill="#6366f1" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Grid>
          
          <Grid size={{ xs: 12, md: 6 }}>
            <Box>
              {(data || []).map((method, index) => {
                const percentage = total > 0 ? (parseFloat(method.amount) / total * 100).toFixed(1) : 0;
                
                return (
                  <Box key={method.method} mb={2.5}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                      <Box display="flex" alignItems="center" gap={1.5}>
                        <Avatar 
                          sx={{ 
                            width: 36, 
                            height: 36, 
                            bgcolor: alpha(COLORS[index % COLORS.length], 0.2),
                            color: COLORS[index % COLORS.length]
                          }}
                        >
                          <CreditCard fontSize="small" />
                        </Avatar>
                        <Typography variant="body2" fontWeight={700} textTransform="uppercase">
                          {method.method}
                        </Typography>
                      </Box>
                      <Box textAlign="right">
                        <Typography variant="body2" fontWeight="bold">
                          {formatCurrency(method.amount)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {percentage}% • {method.count} txns
                        </Typography>
                      </Box>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={parseFloat(percentage)} 
                      sx={{ 
                        height: 10, 
                        borderRadius: 5,
                        bgcolor: alpha(COLORS[index % COLORS.length], 0.1),
                        '& .MuiLinearProgress-bar': {
                          bgcolor: COLORS[index % COLORS.length],
                          borderRadius: 5
                        }
                      }}
                    />
                  </Box>
                );
              })}
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Fade>
  );
};

// ==================== MAIN DASHBOARD COMPONENT ====================
const AnalyticsDashboard = () => {
  const theme = useTheme();
  const [period, setPeriod] = useState('month');
  const [isRefreshing, setIsRefreshing] = useState(false);

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

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: 3 }}>
      <Container maxWidth="xl">
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4} flexWrap="wrap" gap={2}>
          <Box>
            <Typography variant="h3" fontWeight="bold" gutterBottom sx={{ 
              background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              Analytics Dashboard
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Real-time insights and performance metrics
            </Typography>
          </Box>
          
          <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
            <ButtonGroup variant="outlined" size="medium">
              {PERIOD_OPTIONS.map((p) => (
                <Button
                  key={p}
                  onClick={() => setPeriod(p)}
                  variant={period === p ? 'contained' : 'outlined'}
                  sx={{ 
                    textTransform: 'capitalize',
                    minWidth: 80,
                    fontWeight: 600
                  }}
                >
                  {p}
                </Button>
              ))}
            </ButtonGroup>
            
            <Tooltip title="Refresh Data">
              <IconButton 
                onClick={handleRefresh} 
                disabled={isRefreshing}
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
            <LinearProgress />
          </Box>
        )}

        {/* Key Metrics */}
        <Grid container spacing={3} mb={4}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard
              title="Total Revenue"
              value={formatCurrency(summary.total_revenue)}
              subtitle={`${formatNumber(summary.total_sales)} sales`}
              icon={AttachMoney}
              trend={trend}
              trendValue={`${Math.abs(summary.revenue_change_percent || 0)}%`}
              color="primary"
              loading={loadingDashboard}
            />
          </Grid>
          
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard
              title="Total Profit"
              value={formatCurrency(summary.total_profit)}
              subtitle={`${summary.profit_margin}% margin`}
              icon={TrendingUp}
              color="success"
              loading={loadingDashboard}
            />
          </Grid>
          
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard
              title="Outstanding"
              value={formatCurrency(summary.total_due)}
              subtitle={`${paymentData?.outstanding?.count || 0} invoices`}
              icon={Timer}
              color="warning"
              loading={loadingDashboard}
            />
          </Grid>
          
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard
              title="Average Order"
              value={formatCurrency(summary.average_order_value)}
              subtitle="Per transaction"
              icon={ShoppingCart}
              color="info"
              loading={loadingDashboard}
            />
          </Grid>
        </Grid>

        {/* Sales Trend & Payment Status */}
        <Grid container spacing={3} mb={4}>
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
        </Grid>

        {/* Top Products & Category Performance */}
        <Grid container spacing={3} mb={4}>
          <Grid size={{ xs: 12, lg: 6 }}>
            <TopProductsTable 
              products={topProducts} 
              loading={loadingProducts} 
            />
          </Grid>
          <Grid size={{ xs: 12, lg: 6 }}>
            <CategoryPerformanceChart 
              data={categoryData} 
              loading={loadingCategory} 
            />
          </Grid>
        </Grid>

        {/* Inventory & Customers */}
        <Grid container spacing={3} mb={4}>
          <Grid size={{ xs: 12, lg: 6 }}>
            <InventoryAlerts 
              data={inventoryData} 
              loading={loadingInventory} 
            />
          </Grid>
          <Grid size={{ xs: 12, lg: 6 }}>
            <TopCustomers 
              data={customerData} 
              loading={loadingCustomers} 
            />
          </Grid>
        </Grid>

        {/* Payment Analytics */}
        <Grid container spacing={3} mb={4}>
          <Grid size={{ xs: 12 }}>
            <PaymentAnalytics 
              data={paymentData} 
              loading={loadingPayments} 
            />
          </Grid>
        </Grid>

        {/* Payment Methods Distribution */}
        <Grid container spacing={3}>
          <Grid size={{ xs: 12 }}>
            <PaymentMethodsChart 
              data={dashboardData?.payment_methods} 
              loading={loadingDashboard} 
            />
          </Grid>
        </Grid>

      </Container>
      
      {/* Animations */}
      <style>{`
        .spin {
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </Box>
  );
};

export default AnalyticsDashboard;