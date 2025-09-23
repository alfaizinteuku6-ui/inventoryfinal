import React, { useState } from "react";
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
  Alert,
  Tab,
  Tabs,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import {
  TrendingUp,
  AttachMoney,
  ShoppingCart,
  Assessment,
  Refresh,
  AccountBalance,
  Star,
  ArrowUpward,
  ArrowDownward,
  Timeline,
  Warning,
  CheckCircle,
  Cancel,
  Pending,
  Receipt,
  TrendingDown,
  Info,
} from "@mui/icons-material";
import { useSalesDashboard, useSalesReport } from "../hooks/useSWR";
import { LineChart } from "@mui/x-charts/LineChart";
import { PieChart } from "@mui/x-charts/PieChart";

// Chart colors array (define this in your constants)
const CHART_COLORS = ["#1976d2", "#dc004e", "#ed6c02", "#2e7d32", "#9c27b0"];

// Enhanced MetricCard Component
const MetricCard = ({
  title,
  value,
  change,
  icon: Icon,
  color = "primary",
  subtitle,
  trend,
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
                  {change === 100
                    ? "New"
                    : `${change >= 0 ? "+" : ""}${change.toFixed(1)}%`}
                </Typography>
              </Box>
            )}
          </Box>
          <Avatar
            sx={{
              bgcolor: `${color}.main`,
              width: 56,
              height: 56,
              boxShadow: (theme) => `0 8px 24px ${theme.palette[color].main}25`,
            }}
          >
            <Icon />
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  );
};

// Payment Status Component
const PaymentStatusCard = ({ paymentData }) => {
  console.log("Payment Data:", paymentData);
  const getStatusIcon = (status) => {
    const icons = {
      paid: CheckCircle,
      pending: Pending,
      cancelled: Cancel,
      partial: Info,
      refunded: TrendingDown,
    };
    return icons[status] || Info;
  };

  const getStatusColor = (status) => {
    const colors = {
      paid: "success",
      pending: "warning",
      cancelled: "error",
      partial: "info",
      refunded: "secondary",
    };
    return colors[status] || "default";
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          Payment Status Breakdown
        </Typography>
        <Grid container spacing={2}>
          {Object.entries(paymentData?.payment_status_breakdown || {}).map(
            ([status, data]) => {
              const StatusIcon = getStatusIcon(status);
              return (
                <Grid size={{ xs: 12, md: 4, sm: 6 }} key={status}>
                  <Paper sx={{ p: 2, textAlign: "center", bgcolor: "grey.50" }}>
                    <StatusIcon
                      sx={{
                        fontSize: 32,
                        color: `${getStatusColor(status)}.main`,
                        mb: 1,
                      }}
                    />
                    <Typography variant="h6" fontWeight="bold">
                      {data.count}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 1 }}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </Typography>
                    <Typography variant="body2" fontWeight="medium">
                      ₹{data.paid_amount?.toLocaleString() || 0}
                    </Typography>
                  </Paper>
                </Grid>
              );
            }
          )}
        </Grid>
      </CardContent>
    </Card>
  );
};

// Daily Breakdown Table Component
const DailyBreakdownTable = ({ dailyData }) => {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          Daily Sales Breakdown
        </Typography>
        <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell align="right">Sales Count</TableCell>
                <TableCell align="right">Gross Revenue</TableCell>
                <TableCell align="right">Effective Revenue</TableCell>
                <TableCell align="right">Items Sold</TableCell>
                <TableCell align="right">Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {dailyData?.map((day, index) => (
                <TableRow key={index} hover>
                  <TableCell>
                    {new Date(day.day).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </TableCell>
                  <TableCell align="right">{day.sales_count}</TableCell>
                  <TableCell align="right">
                    ₹{day.gross_revenue?.toLocaleString()}
                  </TableCell>
                  <TableCell align="right">
                    ₹{day.effective_revenue?.toLocaleString()}
                  </TableCell>
                  <TableCell align="right">{day.items_sold}</TableCell>
                  <TableCell align="right">
                    <Stack
                      direction="row"
                      spacing={0.5}
                      justifyContent="flex-end"
                    >
                      {day.paid_count > 0 && (
                        <Chip
                          label={`${day.paid_count}P`}
                          size="small"
                          color="success"
                        />
                      )}
                      {day.cancelled_count > 0 && (
                        <Chip
                          label={`${day.cancelled_count}C`}
                          size="small"
                          color="error"
                        />
                      )}
                      {day.pending_count > 0 && (
                        <Chip
                          label={`${day.pending_count}Pe`}
                          size="small"
                          color="warning"
                        />
                      )}
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
};

// Performance Indicators Component
const PerformanceIndicators = ({ performanceData, alerts }) => {
  const indicators = [
    {
      key: "completion_rate",
      label: "Completion Rate",
      suffix: "%",
      target: 80,
      color: "primary",
    },
    {
      key: "tax_rate",
      label: "Tax Rate",
      suffix: "%",
      target: 90,
      color: "success",
    },
    {
      key: "refund_rate",
      label: "Refund Rate",
      suffix: "%",
      target: 5,
      color: "error",
      inverse: true,
    },
    {
      key: "discount_rate",
      label: "Discount Rate",
      suffix: "%",
      target: 10,
      color: "warning",
      inverse: true,
    },
  ];

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          Performance Indicators
        </Typography>

        {/* Alerts */}
        {alerts && alerts.length > 0 && (
          <Box sx={{ mb: 3 }}>
            {alerts.map((alert, index) => (
              <Alert
                key={index}
                severity={alert.type}
                sx={{ mb: 1 }}
                icon={<Warning />}
              >
                <Typography variant="body2" fontWeight="medium">
                  {alert.message}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {alert.recommendation}
                </Typography>
              </Alert>
            ))}
          </Box>
        )}

        {/* Performance Metrics */}
        <Grid container spacing={3}>
          {indicators.map((indicator) => {
            const value = performanceData?.[indicator.key] || 0;
            const isGood = indicator.inverse
              ? value <= indicator.target
              : value >= indicator.target;

            return (
              <Grid size={{ xs: 12, sm: 6 }} key={indicator.key}>
                <Box>
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    mb={1}
                  >
                    <Typography variant="body2" color="text.secondary">
                      {indicator.label}
                    </Typography>
                    <Typography
                      variant="body1"
                      fontWeight="bold"
                      color={isGood ? "success.main" : "warning.main"}
                    >
                      {value.toFixed(1)}
                      {indicator.suffix}
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={Math.min(value, 100)}
                    color={isGood ? "success" : "warning"}
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ mt: 0.5, display: "block" }}
                  >
                    Target: {indicator.target}
                    {indicator.suffix}
                  </Typography>
                </Box>
              </Grid>
            );
          })}
        </Grid>
      </CardContent>
    </Card>
  );
};

// Main Dashboard Component
const Dashboard = () => {
  const [timeRange, setTimeRange] = useState("30");
  const [activeTab, setActiveTab] = useState(0);

  const endDate = new Date().toISOString().split("T")[0];
  const startDate = new Date(Date.now() - timeRange * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  const {
    data: dashboardData,
    isLoading: dashboardLoading,
    error: dashboardError,
    mutate: mutateDashboard,
  } = useSalesDashboard({
    start_date: startDate,
    end_date: endDate,
  });

  const {
    data: salesReport,
    isLoading: reportsLoading,
    error: reportsError,
    mutate: mutateReports,
  } = useSalesReport({
    start_date: startDate,
    end_date: endDate,
  });

  const loading = dashboardLoading || reportsLoading;

  const handleRefresh = () => {
    mutateDashboard();
    mutateReports();
  };

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

  const periodData = dashboardData?.period || dashboardData?.monthly;
  const todayData = dashboardData?.today;

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

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
        >
          <Tab label="Overview" />
          <Tab label="Detailed Analytics" />
          <Tab label="Performance" />
        </Tabs>
      </Box>

      {/* Tab Content */}
      {activeTab === 0 && (
        <>
          {/* Key Metrics */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <MetricCard
                title="Today's Revenue"
                value={`₹${
                  todayData?.revenue_metrics?.gross_revenue?.toLocaleString() ||
                  "0"
                }`}
                change={todayData?.vs_yesterday?.changes?.revenue_change}
                subtitle={`${todayData?.total_sales_count || 0} transactions`}
                icon={AttachMoney}
                color="success"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <MetricCard
                title="Period Revenue"
                value={`₹${
                  periodData?.revenue_metrics?.gross_revenue?.toLocaleString() ||
                  "0"
                }`}
                change={periodData?.vs_previous_period?.changes?.revenue_change}
                subtitle={`${periodData?.total_sales_count || 0} orders`}
                icon={TrendingUp}
                color="primary"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <MetricCard
                title="Average Order Value"
                value={`₹${periodData?.average_sale_value?.toFixed(0) || "0"}`}
                change={
                  periodData?.vs_previous_period?.changes?.avg_sale_change
                }
                subtitle="Period average"
                icon={Assessment}
                color="info"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <MetricCard
                title="Total Items Sold"
                value={periodData?.total_items_sold?.toLocaleString() || "0"}
                subtitle="This period"
                icon={ShoppingCart}
                color="warning"
              />
            </Grid>
          </Grid>

          {/* Revenue Metrics */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <MetricCard
                title="Effective Revenue"
                value={`₹${
                  periodData?.revenue_metrics?.effective_revenue?.toLocaleString() ||
                  "0"
                }`}
                subtitle="Actual collected"
                icon={CheckCircle}
                color="success"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <MetricCard
                title="Total Paid"
                value={`₹${
                  periodData?.payment_metrics?.total_paid?.toLocaleString() ||
                  "0"
                }`}
                subtitle={`${
                  periodData?.payment_metrics?.collection_rate?.toFixed(1) || 0
                }% collected`}
                icon={Receipt}
                color="primary"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <MetricCard
                title="Tax Collected"
                value={`₹${
                  periodData?.revenue_metrics?.total_tax_collected?.toLocaleString() ||
                  "0"
                }`}
                subtitle="Total tax amount"
                icon={AccountBalance}
                color="info"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <MetricCard
                title="Discounts Given"
                value={`₹${
                  periodData?.revenue_metrics?.total_discount_given?.toLocaleString() ||
                  "0"
                }`}
                subtitle="Total discounts"
                icon={TrendingDown}
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
                    <LineChart
                      dataset={(
                        periodData?.analytics?.period_daily_breakdown ||
                        dashboardData?.monthly?.monthly_daily_breakdown ||
                        []
                      ).map((item) => ({
                        ...item,
                        day: new Date(item.day).getTime(), // Convert to timestamp
                        gross_revenue: Number(item.gross_revenue) || 0, // Ensure numeric
                      }))}
                      xAxis={[
                        {
                          dataKey: "day",
                          scaleType: "time",
                          valueFormatter: (value) =>
                            new Date(value).toLocaleDateString("en-IN", {
                              month: "short",
                              day: "numeric",
                            }),
                        },
                      ]}
                      yAxis={[
                        {
                          valueFormatter: (value) =>
                            `₹${(value / 1000).toFixed(0)}K`,
                        },
                      ]}
                      series={[
                        {
                          dataKey: "gross_revenue",
                          label: "Revenue",
                          color: "#1976d2",
                          area: true,
                          curve: "linear",
                        },
                      ]}
                      height={400}
                      margin={{ left: 25, right: 20, top: 20, bottom: 50 }}
                      grid={{ horizontal: true, vertical: true }}
                      slotProps={{
                        tooltip: {
                          formatter: (params) => {
                            if (params && params.value !== undefined) {
                              return `₹${Number(
                                params.value
                              ).toLocaleString()}`;
                            }
                            return "";
                          },
                        },
                      }}
                      sx={{
                        "& .MuiAreaElement-root": {
                          fillOpacity: 0.3,
                        },
                      }}
                    />
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
                    <PieChart
                      series={[
                        {
                          data: (
                            periodData?.analytics?.period_payment_methods ||
                            dashboardData?.monthly?.monthly_payment_methods ||
                            []
                          ).map((item, index) => ({
                            id: index,
                            value: item.revenue,
                            label: item.payment_method?.toUpperCase(),
                            color: CHART_COLORS[index % CHART_COLORS.length],
                          })),
                          innerRadius: 60,
                          outerRadius: 100,
                          paddingAngle: 5,
                          cornerRadius: 0,
                          highlightScope: {
                            faded: "global",
                            highlighted: "item",
                          },
                          faded: {
                            innerRadius: 30,
                            additionalRadius: -30,
                            color: "gray",
                          },
                        },
                      ]}
                      width={undefined}
                      height={300}
                      tooltip={{
                        formatter: (params) => {
                          const value = params.value;
                          return `₹${value?.toLocaleString()}`;
                        },
                      }}
                      slotProps={{
                        legend: {
                          direction: "column",
                          position: { vertical: "middle", horizontal: "right" },
                          padding: 0,
                        },
                      }}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Top Products and Customers */}
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Top Selling Products
                  </Typography>
                  <List>
                    {dashboardData?.insights?.top_products
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
                              primary={
                                <Typography variant="body2" noWrap>
                                  {product.product__name?.substring(0, 50)}...
                                </Typography>
                              }
                              secondary={`${product.total_quantity} units • ${product.total_orders} orders`}
                            />
                            <Box textAlign="right">
                              <Typography variant="body1" fontWeight="bold">
                                ₹{product.total_revenue?.toLocaleString()}
                              </Typography>
                            </Box>
                          </ListItem>
                          {index < 4 && <Divider />}
                        </React.Fragment>
                      ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Top Customers
                  </Typography>
                  <List>
                    {dashboardData?.insights?.top_customers
                      ?.slice(0, 5)
                      .map((customer, index) => (
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
                                  icon={
                                    <Star
                                      sx={{ fontSize: "16px !important" }}
                                    />
                                  }
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
        </>
      )}

      {activeTab === 1 && (
        <>
          {/* Payment Status Breakdown */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid size={{ xs: 12 }}>
              <PaymentStatusCard paymentData={periodData?.payment_metrics} />
            </Grid>
          </Grid>

          {/* Daily Breakdown Table */}
          <Grid container spacing={3}>
            <Grid size={{ xs: 12 }}>
              <DailyBreakdownTable
                dailyData={
                  salesReport?.detailed_analytics?.report_daily_breakdown ||
                  periodData?.analytics?.period_daily_breakdown ||
                  dashboardData?.monthly?.monthly_daily_breakdown
                }
              />
            </Grid>
          </Grid>
        </>
      )}

      {activeTab === 2 && (
        <Grid container spacing={3}>
          <Grid size={{ xs: 12 }}>
            <PerformanceIndicators
              performanceData={periodData?.performance_indicators}
              alerts={dashboardData?.insights?.alerts}
            />
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default Dashboard;
