import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Skeleton,
  useTheme,
  Fade,
} from '@mui/material';
import {
  LocalOffer,
} from '@mui/icons-material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { formatCurrency } from '../../utils/utilitys';

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
export default CategoryPerformanceChart;