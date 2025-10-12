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
  Fade,
} from '@mui/material';
import {
  Receipt,
} from '@mui/icons-material';
import { formatCurrency } from '../../utils/utilitys';

// ==================== PAYMENT ANALYTICS ====================
const PaymentAnalytics = ({ data, loading }) => {
  const theme = useTheme();

  if (loading) {
    return <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2 }} />;
  }

  const collectionRate = data?.collection_rate || 0;

  return (
    <Fade in timeout={500}>
      <Paper elevation={0} sx={{ p: 3, border: `1px solid ${theme.palette.divider}`, borderRadius: 2 }}>
        <Box display="flex" alignItems="center" gap={1} mb={3}>
          <Receipt sx={{ color: theme.palette.info.main }} />
          <Box>
            <Typography variant="h6" fontWeight="bold">
              Payment Analytics
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Collection and outstanding summary
            </Typography>
          </Box>
        </Box>
        
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Box 
              textAlign="center" 
              p={2.5} 
              bgcolor={alpha(theme.palette.info.main, 0.1)} 
              borderRadius={2}
              sx={{
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: theme.shadows[4]
                }
              }}
            >
              <Typography variant="h4" fontWeight="bold" color="info.main">
                {collectionRate.toFixed(1)}%
              </Typography>
              <Typography variant="body2" color="text.secondary" mt={1} fontWeight={600}>
                Collection Rate
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={collectionRate} 
                sx={{ 
                  mt: 2, 
                  height: 8, 
                  borderRadius: 4,
                  bgcolor: alpha(theme.palette.info.main, 0.2),
                  '& .MuiLinearProgress-bar': {
                    bgcolor: theme.palette.info.main
                  }
                }}
              />
            </Box>
          </Grid>
          
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
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
              <Typography variant="h5" fontWeight="bold" color="success.main">
                {formatCurrency(data?.total_collected || 0)}
              </Typography>
              <Typography variant="body2" color="text.secondary" mt={1} fontWeight={600}>
                Collected
              </Typography>
              <Typography variant="caption" color="text.secondary">
                of {formatCurrency(data?.total_billed || 0)}
              </Typography>
            </Box>
          </Grid>
          
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
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
              <Typography variant="h5" fontWeight="bold" color="warning.main">
                {formatCurrency(data?.outstanding?.amount || 0)}
              </Typography>
              <Typography variant="body2" color="text.secondary" mt={1} fontWeight={600}>
                Outstanding
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {data?.outstanding?.count || 0} invoices
              </Typography>
            </Box>
          </Grid>
          
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
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
              <Typography variant="h5" fontWeight="bold" color="error.main">
                {formatCurrency(data?.overdue?.amount || 0)}
              </Typography>
              <Typography variant="body2" color="text.secondary" mt={1} fontWeight={600}>
                Overdue
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {data?.overdue?.count || 0} invoices
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Fade>
  );
};
export default PaymentAnalytics;