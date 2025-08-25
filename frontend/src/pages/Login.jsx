// frontend/src/pages/Login.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Container,
  InputAdornment,
  IconButton,
  Divider,
  Fade,
  useTheme,
  useMediaQuery,
  Avatar,
  Chip,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  Store,
  TrendingUp,
  Security,
  Speed,
  Analytics,
  Inventory2,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const { login, isLoading, error, clearError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Get the redirect path from state or default to dashboard
  const from = location.state?.from?.pathname || '/';

  useEffect(() => {
    // Trigger fade in animation
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Clear errors when user starts typing
    if (error) {
      const timer = setTimeout(clearError, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  const handleInputChange = (field) => (e) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
    // Clear error when user starts typing
    if (error) clearError();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      return;
    }

    try {
      await login(formData);
      navigate(from, { replace: true });
    } catch (err) {
      // Error is handled by the AuthContext
      console.error('Login failed:', err);
    }
  };

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  const features = [
    { icon: <Speed />, title: 'Fast Checkout', desc: 'Process sales in seconds' },
    { icon: <Inventory2 />, title: 'Inventory Control', desc: 'Track stock in real-time' },
    { icon: <Analytics />, title: 'Sales Analytics', desc: 'Detailed reports & insights' },
    { icon: <Security />, title: 'Secure & Reliable', desc: 'Bank-level security' },
  ];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: isMobile 
          ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
          : `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
        display: 'flex',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background Pattern */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='m36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          opacity: 0.1,
        }}
      />

      <Container maxWidth="xl" sx={{ display: 'flex', alignItems: 'center', py: 4 }}>
        <Box
          sx={{
            display: 'flex',
            width: '100%',
            alignItems: 'center',
            gap: 8,
            flexDirection: isMobile ? 'column' : 'row',
          }}
        >
          {/* Left Side - Branding & Features (Hidden on mobile) */}
          {!isMobile && (
            <Fade in={isVisible} timeout={800}>
              <Box sx={{ flex: 1, color: 'white', maxWidth: 600 }}>
                {/* Logo and Brand */}
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                  <Avatar
                    sx={{
                      bgcolor: 'white',
                      color: 'primary.main',
                      mr: 2,
                      width: 56,
                      height: 56,
                    }}
                  >
                    <Store fontSize="large" />
                  </Avatar>
                  <Box>
                    <Typography variant="h3" sx={{ fontWeight: 700, mb: 0.5 }}>
                      POS Master
                    </Typography>
                    <Typography variant="h6" sx={{ opacity: 0.9, fontWeight: 400 }}>
                      Point of Sale Solution
                    </Typography>
                  </Box>
                </Box>

                {/* Value Proposition */}
                <Typography 
                  variant="h4" 
                  sx={{ 
                    fontWeight: 600, 
                    mb: 2,
                    lineHeight: 1.3
                  }}
                >
                  Streamline Your Business Operations
                </Typography>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    opacity: 0.9, 
                    mb: 4, 
                    fontWeight: 400,
                    lineHeight: 1.4
                  }}
                >
                  Complete POS solution designed for small and medium-scale vendors. 
                  Manage sales, inventory, customers, and reports all in one place.
                </Typography>

                {/* Features Grid */}
                <Box 
                  sx={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(2, 1fr)', 
                    gap: 3,
                    mb: 4 
                  }}
                >
                  {features.map((feature, index) => (
                    <Fade in={isVisible} timeout={1000 + index * 200} key={feature.title}>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                        <Avatar
                          sx={{
                            bgcolor: 'rgba(255,255,255,0.2)',
                            color: 'white',
                            width: 40,
                            height: 40,
                          }}
                        >
                          {feature.icon}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
                            {feature.title}
                          </Typography>
                          <Typography variant="body2" sx={{ opacity: 0.8 }}>
                            {feature.desc}
                          </Typography>
                        </Box>
                      </Box>
                    </Fade>
                  ))}
                </Box>

                {/* Trust Indicators */}
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Chip 
                    label="✓ Bank-Level Security" 
                    variant="outlined" 
                    sx={{ 
                      color: 'white', 
                      borderColor: 'rgba(255,255,255,0.3)',
                      bgcolor: 'rgba(255,255,255,0.1)'
                    }} 
                  />
                  <Chip 
                    label="✓ 24/7 Support" 
                    variant="outlined" 
                    sx={{ 
                      color: 'white', 
                      borderColor: 'rgba(255,255,255,0.3)',
                      bgcolor: 'rgba(255,255,255,0.1)'
                    }} 
                  />
                  <Chip 
                    label="✓ Cloud Backup" 
                    variant="outlined" 
                    sx={{ 
                      color: 'white', 
                      borderColor: 'rgba(255,255,255,0.3)',
                      bgcolor: 'rgba(255,255,255,0.1)'
                    }} 
                  />
                </Box>
              </Box>
            </Fade>
          )}

          {/* Right Side - Login Form */}
          <Fade in={isVisible} timeout={1200}>
            <Card
              sx={{
                maxWidth: 420,
                width: '100%',
                mx: 'auto',
                borderRadius: 3,
                boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
                backdropFilter: 'blur(10px)',
                bgcolor: 'rgba(255,255,255,0.95)',
              }}
            >
              <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
                {/* Mobile Logo */}
                {isMobile && (
                  <Box sx={{ textAlign: 'center', mb: 4 }}>
                    <Avatar
                      sx={{
                        bgcolor: 'primary.main',
                        mx: 'auto',
                        mb: 2,
                        width: 64,
                        height: 64,
                      }}
                    >
                      <Store fontSize="large" />
                    </Avatar>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>
                      POS Master
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Sign in to your account
                    </Typography>
                  </Box>
                )}

                {/* Desktop Header */}
                {!isMobile && (
                  <Box sx={{ mb: 4, textAlign: 'center' }}>
                    <Typography 
                      variant="h4" 
                      sx={{ 
                        fontWeight: 700, 
                        color: 'primary.main',
                        mb: 1
                      }}
                    >
                      Welcome Back
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      Sign in to access your POS dashboard
                    </Typography>
                  </Box>
                )}

                {/* Error Alert */}
                {error && (
                  <Alert 
                    severity="error" 
                    sx={{ 
                      mb: 3,
                      borderRadius: 2,
                      '& .MuiAlert-message': {
                        fontSize: '0.9rem'
                      }
                    }}
                    onClose={clearError}
                  >
                    {error}
                  </Alert>
                )}

                {/* Login Form */}
                <form onSubmit={handleSubmit} noValidate>
                  <TextField
                    label="Email Address"
                    type="email"
                    fullWidth
                    margin="normal"
                    value={formData.email}
                    onChange={handleInputChange('email')}
                    disabled={isLoading}
                    required
                    autoComplete="email"
                    autoFocus
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Email color="action" />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '&:hover fieldset': {
                          borderColor: 'primary.main',
                        },
                      },
                    }}
                  />

                  <TextField
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    fullWidth
                    margin="normal"
                    value={formData.password}
                    onChange={handleInputChange('password')}
                    disabled={isLoading}
                    required
                    autoComplete="current-password"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock color="action" />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={handleTogglePassword}
                            edge="end"
                            disabled={isLoading}
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '&:hover fieldset': {
                          borderColor: 'primary.main',
                        },
                      },
                    }}
                  />

                  <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    size="large"
                    disabled={isLoading || !formData.email || !formData.password}
                    sx={{
                      mt: 3,
                      mb: 2,
                      height: 48,
                      borderRadius: 2,
                      textTransform: 'none',
                      fontSize: '1rem',
                      fontWeight: 600,
                      boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
                      '&:hover': {
                        boxShadow: '0 6px 16px rgba(37, 99, 235, 0.4)',
                      },
                      '&:disabled': {
                        opacity: 0.7,
                      },
                    }}
                  >
                    {isLoading ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CircularProgress size={20} color="inherit" />
                        Signing In...
                      </Box>
                    ) : (
                      'Sign In to POS'
                    )}
                  </Button>
                </form>

                {/* Demo Credentials (Remove in production) */}
                <Box sx={{ mt: 3 }}>
                  <Divider sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Demo Access
                    </Typography>
                  </Divider>
                  <Box 
                    sx={{ 
                      bgcolor: 'grey.50', 
                      p: 2, 
                      borderRadius: 2,
                      border: '1px solid',
                      borderColor: 'grey.200'
                    }}
                  >
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      <strong>Demo Credentials:</strong>
                    </Typography>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                      Email: demo@posmaster.com<br />
                      Password: demo123
                    </Typography>
                  </Box>
                </Box>

                {/* Footer */}
                <Box sx={{ mt: 4, textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    © 2025 POS Master. All rights reserved.
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Fade>
        </Box>
      </Container>
    </Box>
  );
};

export default Login;