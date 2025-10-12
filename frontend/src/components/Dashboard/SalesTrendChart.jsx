import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Chip,
  Skeleton,
  useTheme,
  Fade,
} from '@mui/material';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import { formatCurrency, formatDate, getShortDate } from '../../utils/utilitys';

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
export default SalesTrendChart;