import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Card,
  CardContent,
  Avatar,
  Typography,
  TextField,
  Button,
  Grid,
  Chip,
  IconButton,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Paper,
  CircularProgress,
  Skeleton,
  useTheme,
  useMediaQuery,
  Tab,
  Tabs,
  Stack,
  Fade,
  Slide,
  Zoom,
  Badge,
  LinearProgress,
} from '@mui/material';
import {
  Edit,
  Save,
  Cancel,
  Person,
  Business,
  Security,
  ExitToApp,
  PhotoCamera,
  Phone,
  Email,
  LocationOn,
  Work,
  BadgeOutlined,
  History,
  Visibility,
  VisibilityOff,
  TrendingUp,
  Schedule,
  Star,
  CheckCircle,
  SwapHoriz,
  Notifications,
  DarkMode,
  LightMode,
} from '@mui/icons-material';
import { useAuth } from "../contexts/AuthContext";

const Profile = () => {
  const { user, isLoading, logout, error: authError, updateProfile } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [darkMode, setDarkMode] = useState(false);

  // Enhanced state management with animations
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [logoutDialog, setLogoutDialog] = useState(false);
  const [vendorDialog, setVendorDialog] = useState(false);
  const [profileCompletion, setProfileCompletion] = useState(85);
  const [showStats, setShowStats] = useState(true);

  // Mock enhanced data
  const [vendors, setVendors] = useState([
    { 
      id: 1, 
      name: 'Coffee Corner Store', 
      status: 'active', 
      role: 'Store Manager',
      avatar: '☕',
      revenue: '$12.5k',
      growth: '+15%',
      color: '#8B4513'
    },
    { 
      id: 2, 
      name: 'Quick Mart Electronics', 
      status: 'active', 
      role: 'Sales Associate',
      avatar: '📱',
      revenue: '$8.2k',
      growth: '+8%',
      color: '#1976d2'
    },
    { 
      id: 3, 
      name: 'Downtown Boutique', 
      status: 'inactive', 
      role: 'Fashion Consultant',
      avatar: '👗',
      revenue: '$5.1k',
      growth: '-2%',
      color: '#e91e63'
    },
  ]);

  const [currentVendor, setCurrentVendor] = useState(vendors[0]);
  
  const stats = [
    { label: 'Total Sales', value: '$25.8k', change: '+12%', icon: TrendingUp, color: '#4caf50' },
    { label: 'Active Hours', value: '168h', change: '+5%', icon: Schedule, color: '#2196f3' },
    { label: 'Customer Rating', value: '4.9', change: '+0.2', icon: Star, color: '#ff9800' },
    { label: 'Transactions', value: '1,247', change: '+18%', icon: CheckCircle, color: '#9c27b0' },
  ];

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        email: user.email || '',
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        phone: user.phone || '',
        address: user.address || '',
        bio: user.bio || '',
        current_password: '',
        new_password: '',
        confirm_password: '',
      });
    }
  }, [user]);

  // Enhanced validation and handlers
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.first_name?.trim()) newErrors.first_name = 'First name is required';
    if (!formData.last_name?.trim()) newErrors.last_name = 'Last name is required';
    if (!formData.email?.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email format';
    
    if (formData.phone && !/^\+?[\d\s-()]+$/.test(formData.phone)) {
      newErrors.phone = 'Invalid phone format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setSnackbar({ open: true, message: '✨ Profile updated successfully!', severity: 'success' });
      setIsEditing(false);
    } catch (error) {
      setSnackbar({ open: true, message: '❌ Failed to update profile', severity: 'error' });
    }
    setLoading(false);
  };

  const handleVendorSwitch = (vendor) => {
    setCurrentVendor(vendor);
    setVendorDialog(false);
    setSnackbar({ 
      open: true, 
      message: `🏪 Switched to ${vendor.name}`, 
      severity: 'info' 
    });
  };

  if (isLoading) {
    return (
      <Box sx={{ 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <CircularProgress size={60} sx={{ color: 'white' }} />
      </Box>
    );
  }

  if (!user) {
    return (
      <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
        <Container maxWidth="sm" sx={{ pt: 8 }}>
          <Alert severity="warning" sx={{ borderRadius: 3, backdropFilter: 'blur(10px)' }}>
            No user data available
          </Alert>
        </Container>
      </Box>
    );
  }

  const ModernCard = ({ children, sx = {}, ...props }) => (
    <Card
      sx={{
        borderRadius: 4,
        boxShadow: '0 20px 60px rgba(0,0,0,0.08)',
        backdropFilter: 'blur(20px)',
        background: 'rgba(255,255,255,0.95)',
        border: '1px solid rgba(255,255,255,0.2)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 30px 80px rgba(0,0,0,0.12)',
        },
        ...sx
      }}
      {...props}
    >
      {children}
    </Card>
  );

  const GlassButton = ({ children, variant = 'outlined', ...props }) => (
    <Button
      variant={variant}
      sx={{
        borderRadius: 3,
        textTransform: 'none',
        fontWeight: 600,
        px: 3,
        py: 1.5,
        backdropFilter: 'blur(10px)',
        background: variant === 'contained' 
          ? 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)' 
          : 'rgba(255,255,255,0.1)',
        border: '1px solid rgba(255,255,255,0.2)',
        color: variant === 'contained' ? 'white' : 'inherit',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 10px 30px rgba(102,126,234,0.3)',
          background: variant === 'contained' 
            ? 'linear-gradient(45deg, #764ba2 30%, #667eea 90%)' 
            : 'rgba(255,255,255,0.2)',
        },
      }}
      {...props}
    >
      {children}
    </Button>
  );

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: `linear-gradient(135deg, 
        #667eea 0%, 
        #764ba2 25%, 
        #f093fb 50%, 
        #f5576c 75%, 
        #4facfe 100%)`,
      backgroundSize: '400% 400%',
      animation: 'gradientShift 15s ease infinite',
      '@keyframes gradientShift': {
        '0%': { backgroundPosition: '0% 50%' },
        '50%': { backgroundPosition: '100% 50%' },
        '100%': { backgroundPosition: '0% 50%' },
      },
      py: 4
    }}>
      <Container maxWidth="lg">
        <Fade in timeout={800}>
          <Box>
            {/* Modern Header Section */}
            <ModernCard sx={{ mb: 4, overflow: 'visible' }}>
              <CardContent sx={{ p: 4 }}>
                <Grid container spacing={4} alignItems="center">
                  {/* Avatar Section */}
                  <Grid item xs={12} md={4}>
                    <Box sx={{ textAlign: 'center', position: 'relative' }}>
                      <Zoom in timeout={1000}>
                        <Box sx={{ position: 'relative', display: 'inline-block' }}>
                          <Avatar
                            sx={{ 
                              width: 120, 
                              height: 120,
                              background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                              fontSize: '3rem',
                              fontWeight: 'bold',
                              border: '4px solid rgba(255,255,255,0.3)',
                              boxShadow: '0 15px 35px rgba(102,126,234,0.3)',
                              mx: 'auto',
                              mb: 2
                            }}
                          >
                            {user.first_name?.[0]}{user.last_name?.[0]}
                          </Avatar>
                          {isEditing && (
                            <IconButton
                              sx={{
                                position: 'absolute',
                                bottom: 8,
                                right: 8,
                                bgcolor: 'white',
                                boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                                '&:hover': { 
                                  bgcolor: 'white',
                                  transform: 'scale(1.1)',
                                },
                              }}
                              size="small"
                            >
                              <PhotoCamera />
                            </IconButton>
                          )}
                          <Badge
                            badgeContent={<CheckCircle sx={{ fontSize: 16 }} />}
                            color="success"
                            sx={{
                              position: 'absolute',
                              top: 8,
                              right: 8,
                            }}
                          />
                        </Box>
                      </Zoom>
                      
                      <Typography variant="h4" fontWeight="bold" gutterBottom>
                        {user.first_name} {user.last_name}
                      </Typography>
                      <Typography variant="body1" color="text.secondary" gutterBottom>
                        @{user.username}
                      </Typography>
                      
                      {/* Profile Completion */}
                      <Box sx={{ mt: 2, mb: 3 }}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Profile Completion
                        </Typography>
                        <LinearProgress 
                          variant="determinate" 
                          value={profileCompletion}
                          sx={{ 
                            height: 8, 
                            borderRadius: 4,
                            bgcolor: 'rgba(0,0,0,0.1)',
                            '& .MuiLinearProgress-bar': {
                              background: 'linear-gradient(45deg, #4caf50 30%, #8bc34a 90%)',
                              borderRadius: 4,
                            }
                          }}
                        />
                        <Typography variant="caption" color="text.secondary">
                          {profileCompletion}% Complete
                        </Typography>
                      </Box>

                      <Stack direction="row" spacing={1} justifyContent="center" flexWrap="wrap">
                        <Chip 
                          icon={<BadgeOutlined />} 
                          label={user.role}
                          sx={{ 
                            background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                            color: 'white',
                            fontWeight: 'bold'
                          }}
                        />
                        <Chip 
                          icon={<Business />} 
                          label={currentVendor.name}
                          onClick={() => setVendorDialog(true)}
                          clickable
                          sx={{ 
                            background: currentVendor.color + '20',
                            color: currentVendor.color,
                            fontWeight: 'bold',
                            '&:hover': {
                              background: currentVendor.color + '30',
                              transform: 'scale(1.05)',
                            }
                          }}
                        />
                      </Stack>
                    </Box>
                  </Grid>

                  {/* Stats Section */}
                  <Grid item xs={12} md={5}>
                    <Slide direction="left" in={showStats} timeout={1000}>
                      <Grid container spacing={2}>
                        {stats.map((stat, index) => {
                          const IconComponent = stat.icon;
                          return (
                            <Grid item xs={6} key={index}>
                              <Paper
                                sx={{
                                  p: 2,
                                  background: `linear-gradient(135deg, ${stat.color}15, ${stat.color}05)`,
                                  border: `1px solid ${stat.color}20`,
                                  borderRadius: 3,
                                  textAlign: 'center',
                                  transition: 'all 0.3s ease',
                                  '&:hover': {
                                    transform: 'translateY(-4px)',
                                    boxShadow: `0 10px 30px ${stat.color}30`,
                                  }
                                }}
                              >
                                <IconComponent sx={{ color: stat.color, fontSize: 28, mb: 1 }} />
                                <Typography variant="h6" fontWeight="bold">
                                  {stat.value}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {stat.label}
                                </Typography>
                                <Typography 
                                  variant="caption" 
                                  sx={{ 
                                    color: stat.change.startsWith('+') ? '#4caf50' : '#f44336',
                                    fontWeight: 'bold'
                                  }}
                                >
                                  {stat.change}
                                </Typography>
                              </Paper>
                            </Grid>
                          );
                        })}
                      </Grid>
                    </Slide>
                  </Grid>

                  {/* Action Buttons */}
                  <Grid item xs={12} md={3}>
                    <Stack spacing={2}>
                      {!isEditing ? (
                        <GlassButton
                          variant="contained"
                          startIcon={<Edit />}
                          onClick={() => setIsEditing(true)}
                          fullWidth
                        >
                          Edit Profile
                        </GlassButton>
                      ) : (
                        <>
                          <GlassButton
                            variant="contained"
                            startIcon={loading ? <CircularProgress size={16} /> : <Save />}
                            onClick={handleSave}
                            disabled={loading}
                            fullWidth
                          >
                            Save Changes
                          </GlassButton>
                          <GlassButton
                            startIcon={<Cancel />}
                            onClick={() => setIsEditing(false)}
                            fullWidth
                          >
                            Cancel
                          </GlassButton>
                        </>
                      )}
                      <GlassButton
                        startIcon={<SwapHoriz />}
                        onClick={() => setVendorDialog(true)}
                        fullWidth
                      >
                        Switch Vendor
                      </GlassButton>
                      <GlassButton
                        startIcon={<ExitToApp />}
                        onClick={() => setLogoutDialog(true)}
                        sx={{ 
                          background: 'linear-gradient(45deg, #f44336 30%, #e91e63 90%)',
                          color: 'white',
                          '&:hover': {
                            background: 'linear-gradient(45deg, #e91e63 30%, #f44336 90%)',
                          }
                        }}
                        fullWidth
                      >
                        Logout
                      </GlassButton>
                    </Stack>
                  </Grid>
                </Grid>
              </CardContent>
            </ModernCard>

            {/* Main Content with Modern Tabs */}
            <ModernCard>
              <Box sx={{ 
                background: 'linear-gradient(90deg, rgba(102,126,234,0.1) 0%, rgba(118,75,162,0.1) 100%)',
                borderBottom: '1px solid rgba(255,255,255,0.1)'
              }}>
                <Tabs 
                  value={activeTab} 
                  onChange={(e, v) => setActiveTab(v)}
                  variant={isMobile ? "scrollable" : "standard"}
                  scrollButtons="auto"
                  sx={{
                    '& .MuiTab-root': {
                      minHeight: 72,
                      fontWeight: 600,
                      fontSize: '1rem',
                      textTransform: 'none',
                      '&.Mui-selected': {
                        background: 'linear-gradient(45deg, #667eea15, #764ba215)',
                      }
                    },
                    '& .MuiTabs-indicator': {
                      height: 4,
                      borderRadius: 2,
                      background: 'linear-gradient(45deg, #667eea, #764ba2)',
                    }
                  }}
                >
                  <Tab icon={<Person />} label="Personal Info" />
                  <Tab icon={<Security />} label="Security" />
                  <Tab icon={<Work />} label="Work Details" />
                  <Tab icon={<History />} label="Activity" />
                </Tabs>
              </Box>

              <CardContent sx={{ p: 4 }}>
                {/* Personal Info Tab */}
                {activeTab === 0 && (
                  <Fade in timeout={500}>
                    <Grid container spacing={3}>
                      {Object.entries({
                        first_name: { label: 'First Name', icon: Person, required: true },
                        last_name: { label: 'Last Name', icon: Person, required: true },
                        email: { label: 'Email', icon: Email, required: true, type: 'email' },
                        phone: { label: 'Phone', icon: Phone },
                        address: { label: 'Address', icon: LocationOn, multiline: true },
                        bio: { label: 'Bio', multiline: true, rows: 3 }
                      }).map(([key, config], index) => (
                        <Grid item xs={12} sm={config.multiline ? 12 : 6} key={key}>
                          <TextField
                            fullWidth
                            label={config.label}
                            type={config.type || 'text'}
                            value={formData[key] || ''}
                            onChange={(e) => handleInputChange(key, e.target.value)}
                            disabled={!isEditing || key === 'username'}
                            error={!!errors[key]}
                            helperText={errors[key]}
                            multiline={config.multiline}
                            rows={config.rows}
                            InputProps={{
                              startAdornment: config.icon && (
                                <config.icon sx={{ mr: 1, color: 'text.secondary' }} />
                              ),
                            }}
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                                background: isEditing ? 'rgba(255,255,255,0.8)' : 'transparent',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                  '& .MuiOutlinedInput-notchedOutline': {
                                    borderColor: 'primary.main',
                                  }
                                }
                              }
                            }}
                          />
                        </Grid>
                      ))}
                    </Grid>
                  </Fade>
                )}

                {/* Security Tab */}
                {activeTab === 1 && (
                  <Fade in timeout={500}>
                    <Box>
                      <Alert 
                        severity="info" 
                        sx={{ 
                          mb: 3, 
                          borderRadius: 3,
                          background: 'linear-gradient(135deg, #2196f315, #2196f305)',
                          border: '1px solid #2196f330'
                        }}
                      >
                        🔒 Leave password fields empty if you don't want to change your password.
                      </Alert>
                      <Grid container spacing={3}>
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            label="Current Password"
                            type={showPassword ? 'text' : 'password'}
                            value={formData.current_password || ''}
                            onChange={(e) => handleInputChange('current_password', e.target.value)}
                            disabled={!isEditing}
                            InputProps={{
                              endAdornment: (
                                <IconButton onClick={() => setShowPassword(!showPassword)}>
                                  {showPassword ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                              ),
                            }}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 }}}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="New Password"
                            type={showPassword ? 'text' : 'password'}
                            value={formData.new_password || ''}
                            onChange={(e) => handleInputChange('new_password', e.target.value)}
                            disabled={!isEditing}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 }}}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Confirm New Password"
                            type={showPassword ? 'text' : 'password'}
                            value={formData.confirm_password || ''}
                            onChange={(e) => handleInputChange('confirm_password', e.target.value)}
                            disabled={!isEditing}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 }}}
                          />
                        </Grid>
                      </Grid>
                    </Box>
                  </Fade>
                )}

                {/* Work Details Tab */}
                {activeTab === 2 && (
                  <Fade in timeout={500}>
                    <Box>
                      <Typography variant="h5" fontWeight="bold" gutterBottom>
                        🏪 Current Vendor Assignment
                      </Typography>
                      <Paper
                        sx={{
                          p: 3,
                          mb: 4,
                          borderRadius: 3,
                          background: `linear-gradient(135deg, ${currentVendor.color}15, ${currentVendor.color}05)`,
                          border: `2px solid ${currentVendor.color}30`,
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                          <Typography sx={{ fontSize: '3rem', mr: 2 }}>
                            {currentVendor.avatar}
                          </Typography>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="h5" fontWeight="bold">
                              {currentVendor.name}
                            </Typography>
                            <Typography variant="body1" color="text.secondary">
                              {currentVendor.role}
                            </Typography>
                          </Box>
                          <GlassButton
                            startIcon={<SwapHoriz />}
                            onClick={() => setVendorDialog(true)}
                          >
                            Switch
                          </GlassButton>
                        </Box>
                        
                        <Grid container spacing={3}>
                          <Grid item xs={12} sm={4}>
                            <Box sx={{ textAlign: 'center', p: 2 }}>
                              <Typography variant="h4" fontWeight="bold" color={currentVendor.color}>
                                {currentVendor.revenue}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Monthly Revenue
                              </Typography>
                              <Typography 
                                variant="caption" 
                                sx={{ 
                                  color: currentVendor.growth.startsWith('+') ? '#4caf50' : '#f44336',
                                  fontWeight: 'bold'
                                }}
                              >
                                {currentVendor.growth}
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={12} sm={4}>
                            <Box sx={{ textAlign: 'center', p: 2 }}>
                              <Typography variant="h4" fontWeight="bold" color="primary.main">
                                4.9★
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Performance Rating
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={12} sm={4}>
                            <Box sx={{ textAlign: 'center', p: 2 }}>
                              <Chip 
                                label={currentVendor.status.toUpperCase()} 
                                color={currentVendor.status === 'active' ? 'success' : 'default'}
                                sx={{ fontWeight: 'bold', px: 2 }}
                              />
                              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                Current Status
                              </Typography>
                            </Box>
                          </Grid>
                        </Grid>
                      </Paper>

                      <Typography variant="h6" fontWeight="bold" gutterBottom>
                        📊 All Vendor Assignments
                      </Typography>
                      <Grid container spacing={2}>
                        {vendors.map((vendor) => (
                          <Grid item xs={12} sm={6} md={4} key={vendor.id}>
                            <Paper
                              sx={{
                                p: 3,
                                borderRadius: 3,
                                background: `linear-gradient(135deg, ${vendor.color}10, ${vendor.color}05)`,
                                border: currentVendor.id === vendor.id 
                                  ? `2px solid ${vendor.color}` 
                                  : `1px solid ${vendor.color}30`,
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                  transform: 'translateY(-4px)',
                                  boxShadow: `0 10px 30px ${vendor.color}30`,
                                }
                              }}
                              onClick={() => vendor.status === 'active' && handleVendorSwitch(vendor)}
                            >
                              <Box sx={{ textAlign: 'center' }}>
                                <Typography sx={{ fontSize: '2.5rem', mb: 1 }}>
                                  {vendor.avatar}
                                </Typography>
                                <Typography variant="h6" fontWeight="bold" gutterBottom>
                                  {vendor.name}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                  {vendor.role}
                                </Typography>
                                <Chip 
                                  label={vendor.status}
                                  size="small"
                                  color={vendor.status === 'active' ? 'success' : 'default'}
                                  sx={{ mb: 1 }}
                                />
                                <Typography variant="body2" fontWeight="bold" color={vendor.color}>
                                  {vendor.revenue} {vendor.growth}
                                </Typography>
                              </Box>
                            </Paper>
                          </Grid>
                        ))}
                      </Grid>
                    </Box>
                  </Fade>
                )}

                {/* Activity Tab */}
                {activeTab === 3 && (
                  <Fade in timeout={500}>
                    <Box>
                      <Typography variant="h5" fontWeight="bold" gutterBottom>
                        📈 Recent Activity
                      </Typography>
                      <List sx={{ bgcolor: 'transparent' }}>
                        {[
                          { icon: Person, primary: 'Profile Updated', secondary: 'Personal information changed', time: '2h ago', color: '#2196f3' },
                          { icon: SwapHoriz, primary: 'Vendor Switched', secondary: 'Changed to Coffee Corner Store', time: '1d ago', color: '#4caf50' },
                          { icon: Security, primary: 'Password Changed', secondary: 'Security settings updated', time: '3d ago', color: '#f44336' },
                          { icon: Work, primary: 'New Assignment', secondary: 'Assigned to Quick Mart Electronics', time: '1w ago', color: '#9c27b0' },
                        ].map((activity, index) => (
                          <ListItem
                            key={index}
                            sx={{
                              borderRadius: 2,
                              mb: 2,
                              bgcolor: 'rgba(255,255,255,0.6)',
                              boxShadow: '0 5px 20px rgba(0,0,0,0.08)',
                              '&:hover': { transform: 'translateY(-3px)', transition: 'all 0.3s ease' }
                            }}
                          >
                            <ListItemIcon>
                              <activity.icon sx={{ color: activity.color, fontSize: 28 }} />
                            </ListItemIcon>
                            <ListItemText
                              primary={
                                <Typography fontWeight="bold">{activity.primary}</Typography>
                              }
                              secondary={
                                <Typography variant="body2" color="text.secondary">
                                  {activity.secondary} • {activity.time}
                                </Typography>
                              }
                            />
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  </Fade>
                )}
              </CardContent>
            </ModernCard>
          </Box>
        </Fade>
      </Container>

      {/* Logout Confirmation Dialog */}
      <Dialog
        open={logoutDialog}
        onClose={() => setLogoutDialog(false)}
        PaperProps={{ sx: { borderRadius: 3, p: 2 } }}
      >
        <DialogTitle>Are you sure you want to logout?</DialogTitle>
        <DialogActions>
          <Button onClick={() => setLogoutDialog(false)}>Cancel</Button>
          <Button
            color="error"
            variant="contained"
            onClick={logout}
            startIcon={<ExitToApp />}
          >
            Logout
          </Button>
        </DialogActions>
      </Dialog>

      {/* Vendor Switch Dialog */}
      <Dialog
        open={vendorDialog}
        onClose={() => setVendorDialog(false)}
        PaperProps={{ sx: { borderRadius: 3, p: 2, minWidth: 400 } }}
      >
        <DialogTitle>Switch Vendor</DialogTitle>
        <DialogContent dividers>
          <List>
            {vendors.map((vendor) => (
              <ListItem
                key={vendor.id}
                button
                disabled={vendor.status !== 'active'}
                onClick={() => handleVendorSwitch(vendor)}
                sx={{
                  borderRadius: 2,
                  mb: 1,
                  border: vendor.id === currentVendor.id ? `2px solid ${vendor.color}` : '1px solid transparent',
                  '&:hover': {
                    bgcolor: `${vendor.color}15`,
                  },
                }}
              >
                <ListItemIcon>
                  <Typography sx={{ fontSize: '1.8rem' }}>{vendor.avatar}</Typography>
                </ListItemIcon>
                <ListItemText
                  primary={vendor.name}
                  secondary={vendor.role}
                  primaryTypographyProps={{ fontWeight: 'bold' }}
                />
                <Chip
                  label={vendor.status}
                  color={vendor.status === 'active' ? 'success' : 'default'}
                  size="small"
                />
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setVendorDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar Notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
          sx={{ borderRadius: 2 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Profile;
