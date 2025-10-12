import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Skeleton,
  useTheme,
  alpha,
  Divider,
  Fade,
} from '@mui/material';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from 'recharts';
import { formatCurrency } from '../../utils/utilitys';
import { COLORS } from '../../utils/constants';

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
export default PaymentStatusChart;