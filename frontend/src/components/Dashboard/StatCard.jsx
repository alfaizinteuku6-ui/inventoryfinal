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
  Tooltip,
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
        <CardContent sx={{ p: { xs: 2, sm: 2.5 }, '&:last-child': { pb: { xs: 2, sm: 2.5 } } }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
            <Typography
              variant="body2"
              color="text.secondary"
              fontWeight={600}
              letterSpacing={0.5}
              noWrap
              sx={{ textTransform: 'uppercase', fontSize: '0.75rem' }}
            >
              {title}
            </Typography>
            <Avatar
              sx={{
                bgcolor: alpha(theme.palette[color].main, 0.1),
                color: theme.palette[color].main,
                width: 42,
                height: 42,
              }}
            >
              <Icon fontSize="small" />
            </Avatar>
          </Box>
          
          <Tooltip title={value || ''} arrow placement="top" disableHoverListener={!value}>
            <Typography
              variant="h4"
              fontWeight={800}
              sx={{
                fontSize: { xs: '1.35rem', sm: '1.5rem', md: '1.65rem', lg: '1.75rem' },
                lineHeight: 1.25,
                mb: 0.75,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                letterSpacing: '-0.02em',
                color: 'text.primary',
              }}
            >
              {value}
            </Typography>
          </Tooltip>
          
          {subtitle && (
            <Typography
              variant="caption"
              color="text.secondary"
              fontWeight={500}
              noWrap
              display="block"
              sx={{ mb: trend ? 1 : 0 }}
            >
              {subtitle}
            </Typography>
          )}
          
          {trend && (
            <Box display="flex" alignItems="center" gap={0.75} mt={0.5} flexWrap="wrap">
              <Chip
                icon={trend === 'up' ? <TrendingUp fontSize="small" /> : <TrendingDown fontSize="small" />}
                label={trendValue}
                size="small"
                sx={{
                  height: 22,
                  fontSize: '0.75rem',
                  bgcolor: alpha(theme.palette[trend === 'up' ? 'success' : 'error'].main, 0.1),
                  color: theme.palette[trend === 'up' ? 'success' : 'error'].main,
                  fontWeight: 700,
                  '& .MuiChip-icon': {
                    color: 'inherit'
                  }
                }}
              />
              <Typography variant="caption" color="text.secondary" noWrap>
                vs periode lalu
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </Zoom>
  );
};
export default StatCard;

