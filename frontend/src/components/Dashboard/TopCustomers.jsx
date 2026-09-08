import React from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Chip,
  Skeleton,
  useTheme,
  alpha,
  Avatar,
  Divider,
  Fade,
} from '@mui/material';
import {
  People,
} from '@mui/icons-material';
import { formatCurrency } from '../../utils/utilitys';
import { COLORS } from '../../utils/constants';

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
              p={1} 
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
              <Typography variant="h4" fontWeight="bold" color="primary.main">
                {data?.customer_segments?.total_customers || 0}
              </Typography>
              <Typography variant="caption" color="text.secondary" fontWeight={600} noWrap display="block">
                Total Pelanggan
              </Typography>
            </Box>
          </Grid>
          <Grid size={{ xs: 6 }}>
            <Box 
              textAlign="center" 
              p={1.5} 
              bgcolor={alpha(theme.palette.success.main, 0.1)} 
              borderRadius={2}
              sx={{
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-3px)',
                  boxShadow: theme.shadows[3]
                }
              }}
            >
              <Typography variant="h4" fontWeight="bold" color="success.main">
                {data?.customer_segments?.high_value || 0}
              </Typography>
              <Typography variant="caption" color="text.secondary" fontWeight={600} noWrap display="block">
                High Value (> Rp 1jt)
              </Typography>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
          🌟 Pelanggan Teratas (Top Spenders)
        </Typography>
        <Box sx={{ maxHeight: 220, overflow: 'auto' }}>
          {(data?.top_customers || []).slice(0, 5).map((customer, index) => (
            <Box 
              key={customer.customer_id} 
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              py={1.25}
              px={1}
              borderRadius={1.5}
              sx={{
                '&:hover': {
                  bgcolor: alpha(theme.palette.primary.main, 0.05)
                }
              }}
            >
              <Box display="flex" alignItems="center" gap={1.5} sx={{ minWidth: 0, flex: 1, mr: 1.5 }}>
                <Avatar 
                  sx={{ 
                    width: 34,
                    height: 34,
                    fontSize: '0.85rem',
                    bgcolor: COLORS[index % COLORS.length],
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  {customer.customer_name.charAt(0)}
                </Avatar>
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography
                    variant="body2"
                    fontWeight={600}
                    noWrap
                    sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}
                  >
                    {customer.customer_name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" noWrap display="block">
                    {customer.total_purchases} pesanan
                  </Typography>
                </Box>
              </Box>
              <Box textAlign="right" sx={{ flexShrink: 0 }}>
                <Typography variant="body2" fontWeight={700} noWrap>
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
export default TopCustomers;