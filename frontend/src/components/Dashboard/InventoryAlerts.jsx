
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
  Divider,
  Fade,
} from '@mui/material';
import {
  Inventory,
  Warning,
} from '@mui/icons-material';
import { formatCurrency } from '../../utils/utilitys';

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
export default InventoryAlerts;