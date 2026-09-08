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
  Tooltip,
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
              p={2} 
              bgcolor={alpha(theme.palette.success.main, 0.08)} 
              borderRadius={2}
              border={`1px solid ${alpha(theme.palette.success.main, 0.2)}`}
              sx={{
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-3px)',
                  boxShadow: theme.shadows[3]
                }
              }}
            >
              <Tooltip title={formatCurrency(data?.total_collected || 0)} arrow placement="top">
                <Typography
                  variant="h5"
                  fontWeight="bold"
                  color="success.main"
                  sx={{
                    fontSize: { xs: '1.15rem', sm: '1.25rem', md: '1.35rem' },
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {formatCurrency(data?.total_collected || 0)}
                </Typography>
              </Tooltip>
              <Typography variant="body2" color="text.secondary" mt={0.5} fontWeight={600} noWrap>
                Total Terkumpul
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap display="block">
                dari {formatCurrency(data?.total_billed || 0)}
              </Typography>
            </Box>
          </Grid>
          
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Box 
              textAlign="center" 
              p={2} 
              bgcolor={alpha(theme.palette.warning.main, 0.08)} 
              borderRadius={2}
              border={`1px solid ${alpha(theme.palette.warning.main, 0.2)}`}
              sx={{
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-3px)',
                  boxShadow: theme.shadows[3]
                }
              }}
            >
              <Tooltip title={formatCurrency(data?.outstanding?.amount || 0)} arrow placement="top">
                <Typography
                  variant="h5"
                  fontWeight="bold"
                  color="warning.main"
                  sx={{
                    fontSize: { xs: '1.15rem', sm: '1.25rem', md: '1.35rem' },
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {formatCurrency(data?.outstanding?.amount || 0)}
                </Typography>
              </Tooltip>
              <Typography variant="body2" color="text.secondary" mt={0.5} fontWeight={600} noWrap>
                Piutang Berjalan
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap display="block">
                {data?.outstanding?.count || 0} faktur
              </Typography>
            </Box>
          </Grid>
          
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Box 
              textAlign="center" 
              p={2} 
              bgcolor={alpha(theme.palette.error.main, 0.08)} 
              borderRadius={2}
              border={`1px solid ${alpha(theme.palette.error.main, 0.2)}`}
              sx={{
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-3px)',
                  boxShadow: theme.shadows[3]
                }
              }}
            >
              <Tooltip title={formatCurrency(data?.overdue?.amount || 0)} arrow placement="top">
                <Typography
                  variant="h5"
                  fontWeight="bold"
                  color="error.main"
                  sx={{
                    fontSize: { xs: '1.15rem', sm: '1.25rem', md: '1.35rem' },
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {formatCurrency(data?.overdue?.amount || 0)}
                </Typography>
              </Tooltip>
              <Typography variant="body2" color="text.secondary" mt={0.5} fontWeight={600} noWrap>
                Jatuh Tempo (Overdue)
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap display="block">
                {data?.overdue?.count || 0} faktur
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Fade>
  );
};
export default PaymentAnalytics;