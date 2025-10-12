import React from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  LinearProgress,
  Skeleton,
  useTheme,
  alpha,
  Avatar,
  Fade,
} from '@mui/material';
import {
  CreditCard,
} from '@mui/icons-material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from 'recharts';
import { formatCurrency } from '../../utils/utilitys';
import { COLORS } from '../../utils/constants';

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
export default PaymentMethodsChart;