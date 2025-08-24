import React, { useState, useEffect } from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  LinearProgress,
  Divider,
  Stack,
  CircularProgress,
  Avatar,
} from "@mui/material";
import {
  TrendingUp,
  AttachMoney,
  ShoppingCart,
  Assessment,
  Refresh,
  AccountBalance,
  CreditCard,
  Smartphone,
  Star,
  ArrowUpward,
  ArrowDownward,
  Timeline,
} from "@mui/icons-material";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useSalesDashboard, useSalesReport } from "../hooks/useSWR";

const Dashboard = () => {
  const [timeRange, setTimeRange] = useState("30");
  const endDate = new Date().toISOString().split("T")[0];
  const startDate = new Date(Date.now() - timeRange * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];
  const { data: dashboardData, isLoading: dashboardLoading, error: dashboardError, mutate: mutateDashboard } = useSalesDashboard({
    start_date: startDate,
    end_date: endDate,
  });
  const {data: salesReport, isLoading: reportsLoading, error: reportsError, mutate: mutateReports} = useSalesReport({
    start_date: startDate,
    end_date: endDate,
  });
  const loading = dashboardLoading || reportsLoading;

  const handleRefresh = () => {
    mutateDashboard();
    mutateReports();
  }

  const formatChangePercentage = (change) => {
    if (!change && change !== 0) return null;
    const sign = change >= 0 ? "+" : "";
    return `${sign}${change.toFixed(1)}%`;
  };

  const MetricCard = ({
    title,
    value,
    change,
    icon: Icon,
    color = "primary",
    subtitle,
  }) => {
    const isPositive = change && change >= 0;

    return (
      <Card sx={{ height: "100%", position: "relative", overflow: "visible" }}>
        <CardContent>
          <Box
            display="flex"
            alignItems="flex-start"
            justifyContent="space-between"
          >
            <Box flex={1}>
              <Typography color="text.secondary" variant="body2" gutterBottom>
                {title}
              </Typography>
              <Typography
                variant="h4"
                component="div"
                fontWeight="bold"
                color="text.primary"
              >
                {value}
              </Typography>
              {subtitle && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 0.5 }}
                >
                  {subtitle}
                </Typography>
              )}
              {change !== null && change !== undefined && (
                <Box display="flex" alignItems="center" mt={1}>
                  {isPositive ? (
                    <ArrowUpward
                      sx={{ fontSize: 16, color: "success.main", mr: 0.5 }}
                    />
                  ) : (
                    <ArrowDownward
                      sx={{ fontSize: 16, color: "error.main", mr: 0.5 }}
                    />
                  )}
                  <Typography
                    variant="body2"
                    color={isPositive ? "success.main" : "error.main"}
                    fontWeight="medium"
                  >
                    {formatChangePercentage(change)}
                  </Typography>
                </Box>
              )}
            </Box>
            <Avatar
              sx={{
                bgcolor: `${color}.main`,
                width: 56,
                height: 56,
                boxShadow: (theme) =>
                  `0 8px 24px ${theme.palette[color].main}25`,
              }}
            >
              <Icon />
            </Avatar>
          </Box>
        </CardContent>
      </Card>
    );
  };

  const getPaymentMethodIcon = (method) => {
    const icons = {
      card: CreditCard,
      cash: AttachMoney,
      upi: Smartphone,
      bank_transfer: AccountBalance,
    };
    return icons[method] || CreditCard;
  };

  const CHART_COLORS = [
    "#1976d2",
    "#388e3c",
    "#f57c00",
    "#d32f2f",
    "#7b1fa2",
    "#0288d1",
  ];

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="60vh"
      >
        <Box textAlign="center">
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Loading Analytics...
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      {/* Header */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={4}
      >
        <Box>
          <Typography variant="h4" component="h1" fontWeight="bold">
            Sales Analytics Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
            Real-time insights and performance metrics
          </Typography>
        </Box>
        <Stack direction="row" spacing={2} alignItems="center">
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Time Range</InputLabel>
            <Select
              value={timeRange}
              label="Time Range"
              onChange={(e) => setTimeRange(e.target.value)}
            >
              <MenuItem value="1">Last 1 day</MenuItem>
              <MenuItem value="7">Last 7 days</MenuItem>
              <MenuItem value="30">Last 30 days</MenuItem>
              <MenuItem value="90">Last 90 days</MenuItem>
            </Select>
          </FormControl>
          <IconButton
            onClick={handleRefresh}
            color="primary"
            sx={{
              bgcolor: "primary.main",
              color: "white",
              "&:hover": { bgcolor: "primary.dark" },
            }}
          >
            <Refresh />
          </IconButton>
        </Stack>
      </Box>

      {/* Key Metrics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
          <MetricCard
            title="Today's Revenue"
            value={`₹${
              dashboardData?.today?.total_revenue?.toLocaleString() || "0"
            }`}
            change={dashboardData?.today?.vs_yesterday?.changes?.revenue_change}
            subtitle={`${dashboardData?.today?.sales_count || 0} transactions`}
            icon={AttachMoney}
            color="success"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
          <MetricCard
            title="Monthly Revenue"
            value={`₹${
              dashboardData?.month?.total_revenue?.toLocaleString() || "0"
            }`}
            change={dashboardData?.month?.vs_previous_month?.changes?.revenue_change}
            subtitle={`${dashboardData?.month?.sales_count || 0} orders`}
            icon={TrendingUp}
            color="primary"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
          <MetricCard
            title="Average Order Value"
            value={`₹${dashboardData?.month?.average_sale?.toFixed(0) || "0"}`}
            change={dashboardData?.month?.vs_previous_month?.changes?.avg_sale_change}
            subtitle="Monthly average"
            icon={Assessment}
            color="info"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
          <MetricCard
            title="Total Items Sold"
            value={dashboardData?.month?.items_sold?.toLocaleString() || "0"}
            change={dashboardData?.month?.vs_previous_month?.changes?.items_sold_change}
            subtitle="This month"
            icon={ShoppingCart}
            color="warning"
          />
        </Grid>
      </Grid>

      {/* Charts Section */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Sales Trend Chart */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <Card>
            <CardContent>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mb={3}
              >
                <Typography variant="h6" fontWeight="bold">
                  Sales Trend
                </Typography>
                <Timeline color="action" />
              </Box>
              <Box height={400}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dashboardData?.analytics?.daily_trend || []}>
                    <defs>
                      <linearGradient
                        id="colorSales"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#1976d2"
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor="#1976d2"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                    <XAxis
                      dataKey="day"
                      tickFormatter={(value) =>
                        new Date(value).toLocaleDateString("en-IN", {
                          month: "short",
                          day: "numeric",
                        })
                      }
                    />
                    <YAxis
                      tickFormatter={(value) =>
                        `₹${(value / 1000).toFixed(0)}K`
                      }
                    />
                    <Tooltip
                      formatter={(value) => [
                        `₹${value?.toLocaleString()}`,
                        "Revenue",
                      ]}
                      labelFormatter={(label) =>
                        new Date(label).toLocaleDateString("en-IN")
                      }
                    />
                    <Area
                      type="monotone"
                      dataKey="daily_revenue"
                      stroke="#1976d2"
                      fillOpacity={1}
                      fill="url(#colorSales)"
                      strokeWidth={3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Payment Methods Breakdown */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Payment Methods
              </Typography>
              <Box height={300}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={dashboardData?.analytics?.payment_methods || []}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="total"
                      label={({ payment_method, percent }) =>
                        `${payment_method.toUpperCase()} ${(
                          percent * 100
                        ).toFixed(0)}%`
                      }
                    >
                      {dashboardData?.analytics?.payment_methods?.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={CHART_COLORS[index % CHART_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => [
                        `₹${value?.toLocaleString()}`,
                        "Amount",
                      ]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Bottom Section */}
      <Grid container spacing={3}>
        {/* Top Products */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Top Selling Products
              </Typography>
              <List>
                {dashboardData?.analytics?.top_items
                  ?.slice(0, 5)
                  .map((product, index) => (
                    <React.Fragment key={product.product__name}>
                      <ListItem sx={{ px: 0 }}>
                        <ListItemIcon>
                          <Avatar
                            sx={{
                              bgcolor: CHART_COLORS[index],
                              width: 32,
                              height: 32,
                            }}
                          >
                            {index + 1}
                          </Avatar>
                        </ListItemIcon>
                        <ListItemText
                          primary={product.product__name}
                          secondary={`${product.total_quantity} units sold`}
                        />
                        <Box textAlign="right">
                          <Typography variant="body1" fontWeight="bold">
                            ₹{product.total_revenue?.toLocaleString()}
                          </Typography>
                          <LinearProgress
                            variant="determinate"
                            value={(product.total_quantity / Math.max(...(dashboardData?.analytics?.top_items?.map(p => p.total_quantity) || [1]))) * 100}
                            sx={{ mt: 0.5, width: 80 }}
                            color={index < 2 ? "success" : "primary"}
                          />
                        </Box>
                      </ListItem>
                      {index < 4 && <Divider />}
                    </React.Fragment>
                  ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Top Customers */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Top Customers This Month
              </Typography>
              <List>
                {dashboardData?.analytics?.top_customers?.slice(0, 5).map((customer, index) => (
                  <React.Fragment key={customer.customer__name}>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemIcon>
                        <Avatar sx={{ bgcolor: "primary.main" }}>
                          {customer.customer__name?.charAt(0)}
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText
                        primary={customer.customer__name}
                        secondary={`${customer.order_count} orders • ${customer.items_purchased} items`}
                      />
                      <Box textAlign="right">
                        <Typography variant="body1" fontWeight="bold">
                          ₹{customer.total_purchases?.toLocaleString()}
                        </Typography>
                        {index === 0 && (
                          <Chip
                            label="VIP"
                            size="small"
                            color="warning"
                            icon={<Star sx={{ fontSize: "16px !important" }} />}
                          />
                        )}
                      </Box>
                    </ListItem>
                    {index < 4 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;