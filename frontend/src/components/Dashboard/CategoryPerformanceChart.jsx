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
              Performa Kategori Produk
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Omzet dan keuntungan bersih per kategori barang
            </Typography>
          </Box>
        </Box>
        
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 25 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
            <XAxis 
              dataKey="category_name" 
              stroke={theme.palette.text.secondary}
              angle={-30}
              textAnchor="end"
              height={60}
              style={{ fontSize: 11 }}
            />
            <YAxis 
              stroke={theme.palette.text.secondary}
              style={{ fontSize: 12 }}
              tickFormatter={(value) => value >= 1000000 ? `Rp ${(value / 1000000).toFixed(1)}jt` : `Rp ${(value / 1000).toFixed(0)}rb`}
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
            <Bar dataKey="revenue" fill="#6366f1" name="Pendapatan (Omzet)" radius={[6, 6, 0, 0]} />
            <Bar dataKey="profit" fill="#10b981" name="Keuntungan (Laba)" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Paper>
    </Fade>
  );
};
export default CategoryPerformanceChart;