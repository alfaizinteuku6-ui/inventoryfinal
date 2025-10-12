import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Skeleton,
  useTheme,
  alpha,
  Avatar,
  Zoom,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
} from '@mui/icons-material';

// ==================== STAT CARD COMPONENT ====================
const StatCard = ({ title, value, subtitle, icon: Icon, trend, trendValue, color = 'primary', loading }) => {
  const theme = useTheme();
  
  if (loading) {
    return (
      <Card elevation={0} sx={{ height: '100%', border: `1px solid ${theme.palette.divider}` }}>
        <CardContent>
          <Skeleton variant="text" width="60%" />
          <Skeleton variant="text" width="40%" height={40} sx={{ my: 1 }} />
          <Skeleton variant="text" width="50%" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Zoom in timeout={300}>
      <Card 
        elevation={0} 
        sx={{ 
          height: '100%',
          border: `1px solid ${theme.palette.divider}`,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          position: 'relative',
          overflow: 'hidden',
          '&:hover': {
            boxShadow: theme.shadows[8],
            transform: 'translateY(-4px)',
            borderColor: theme.palette[color].main,
          },
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '3px',
            bgcolor: theme.palette[color].main,
          }
        }}
      >
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
            <Typography variant="body2" color="text.secondary" fontWeight={600} letterSpacing={0.5}>
              {title}
            </Typography>
            <Avatar
              sx={{
                bgcolor: alpha(theme.palette[color].main, 0.1),
                color: theme.palette[color].main,
                width: 48,
                height: 48,
              }}
            >
              <Icon />
            </Avatar>
          </Box>
          
          <Typography variant="h3" fontWeight="bold" gutterBottom sx={{ fontSize: { xs: '1.75rem', md: '2.5rem' } }}>
            {value}
          </Typography>
          
          {subtitle && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: trend ? 1 : 0 }}>
              {subtitle}
            </Typography>
          )}
          
          {trend && (
            <Box display="flex" alignItems="center" gap={0.5}>
              <Chip
                icon={trend === 'up' ? <TrendingUp fontSize="small" /> : <TrendingDown fontSize="small" />}
                label={trendValue}
                size="small"
                sx={{
                  bgcolor: alpha(theme.palette[trend === 'up' ? 'success' : 'error'].main, 0.1),
                  color: theme.palette[trend === 'up' ? 'success' : 'error'].main,
                  fontWeight: 700,
                  '& .MuiChip-icon': {
                    color: 'inherit'
                  }
                }}
              />
              <Typography variant="caption" color="text.secondary">
                vs last period
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </Zoom>
  );
};
export default StatCard;

