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
              innerRadius={55}
              outerRadius={80}
              paddingAngle={3}
            >
              {(data || []).map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <RechartsTooltip 
              formatter={(value, name, props) => [
                `${value} transaksi (${formatCurrency(props.payload.amount)})`,
                props.payload.status
              ]}
              contentStyle={{
                backgroundColor: theme.palette.background.paper,
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 8,
                boxShadow: theme.shadows[4],
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        
        <Divider sx={{ my: 1.5 }} />
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
          {(data || []).map((item, index) => {
            const percentage = totalAmount > 0 ? (parseFloat(item.amount) / totalAmount * 100).toFixed(1) : 0;
            return (
              <Box 
                key={item.status} 
                display="flex" 
                justifyContent="space-between" 
                alignItems="center"
                py={0.75}
                px={1}
                borderRadius={1.5}
                sx={{
                  '&:hover': {
                    bgcolor: alpha(COLORS[index % COLORS.length], 0.06)
                  }
                }}
              >
                <Box display="flex" alignItems="center" gap={1.25} sx={{ minWidth: 0, flex: 1, mr: 1 }}>
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: 0.75,
                      bgcolor: COLORS[index % COLORS.length],
                      flexShrink: 0,
                    }}
                  />
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography variant="body2" textTransform="capitalize" fontWeight={600} noWrap>
                      {item.status}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" noWrap display="block">
                      {item.count} pesanan • {percentage}%
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="body2" fontWeight="bold" noWrap sx={{ flexShrink: 0 }}>
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