// frontend/src/pages/Login.jsx
import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  CircularProgress,
  Container,
  InputAdornment,
  IconButton,
  Fade,
  useTheme,
  useMediaQuery,
  Avatar,
  Chip,
} from "@mui/material";
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
} from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import CustomSnackbar from "../components/CustomSnackbar";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const { login, isLoading, error, clearError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // Get the redirect path from state or default to dashboard
  const from = location.state?.from?.pathname || "/";

  useEffect(() => {
    // Trigger fade in animation
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Show snackbar when error appears
    if (error) {
      setSnackbarOpen(true);
    }
  }, [error]);

  const handleInputChange = (field) => (e) => {
    setFormData((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!formData.email || !formData.password) {
      return;
    }

    try {
      const result = await login(formData);
      if (result) {
        navigate(from, { replace: true });
      }
    } catch (err) {
      console.error("Login failed:", err);
      // Error is handled by the AuthContext and displayed in snackbar
    }
  };

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
    clearError();
  };

  const features = [
    {
      icon: <Speed />,
      title: "Fast Checkout",
      desc: "Process sales in seconds",
    },
    {
      icon: <Inventory2 />,
      title: "Inventory Control",
      desc: "Track stock in real-time",
    },
    {
      icon: <Analytics />,
      title: "Sales Analytics",
      desc: "Detailed reports & insights",
    },
    {
      icon: <Security />,
      title: "Secure & Reliable",
      desc: "Bank-level security",
    },
  ];

  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100vw",
        background: theme.palette.background.default,
        display: "flex",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background Pattern */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='m36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          opacity: 0.1,
        }}
      />

      <Container
        maxWidth="xl"
        sx={{ display: "flex", alignItems: "center", py: 4 }}
      >
        <Box
          sx={{
            display: "flex",
            width: "100%",
            alignItems: "center",
            gap: 8,
            flexDirection: isMobile ? "column" : "row",
          }}
        >
          {/* Left Side - Branding & Features (Hidden on mobile) */}
          {!isMobile && (
            <Fade in={isVisible} timeout={800}>
              <Box sx={{ flex: 1, color: "white", maxWidth: 600 }}>
                {/* Logo and Brand */}
                <Box sx={{ display: "flex", alignItems: "center", mb: 4 }}>
                  <Avatar
                    sx={{
                      bgcolor: theme.palette.primary.main,
                      color: "white",
                      mr: 2,
                      width: 56,
                      height: 56,
                    }}
                  >
                    <Store fontSize="large" />
                  </Avatar>
                  <Box>
                    <Typography
                      variant="h3"
                      sx={{ fontWeight: 700, mb: 0.5, color: "text.primary" }}
                    >
                      POS Master
                    </Typography>
                    <Typography
                      variant="h6"
                      sx={{
                        opacity: 0.9,
                        fontWeight: 400,
                        color: "text.secondary",
                      }}
                    >
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
                    lineHeight: 1.3,
                    color: "text.primary",
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
                    lineHeight: 1.4,
                    color: "text.secondary",
                  }}
                >
                  Complete POS solution designed for small and medium-scale
                  vendors. Manage sales, inventory, customers, and reports all
                  in one place.
                </Typography>

                {/* Features Grid */}
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "repeat(2, 1fr)",
                    gap: 3,
                    mb: 4,
                  }}
                >
                  {features.map((feature, index) => (
                    <Fade
                      in={isVisible}
                      timeout={1000 + index * 200}
                      key={feature.title}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: 2,
                        }}
                      >
                        <Avatar
                          sx={{
                            bgcolor: theme.palette.primary.main,
                            color: "white",
                            width: 40,
                            height: 40,
                          }}
                        >
                          {feature.icon}
                        </Avatar>
                        <Box>
                          <Typography
                            variant="subtitle1"
                            sx={{ fontWeight: 600, mb: 0.5, color:'text.primary' }}
                          >
                            {feature.title}
                          </Typography>
                          <Typography variant="body2" sx={{ opacity: 0.8, color:'text.secondary' }}>
                            {feature.desc}
                          </Typography>
                        </Box>
                      </Box>
                    </Fade>
                  ))}
                </Box>

                {/* Trust Indicators */}
                <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                  <Chip label="✓ Bank-Level Security" variant="outlined" />
                  <Chip label="✓ 24/7 Support" variant="outlined" />
                  <Chip label="✓ Cloud Backup" variant="outlined" />
                </Box>
              </Box>
            </Fade>
          )}

          {/* Right Side - Login Form */}
          <Fade in={isVisible} timeout={1200}>
            <Card
              sx={{
                maxWidth: 420,
                width: "100%",
                mx: "auto",
                borderRadius: 3,
              }}
            >
              <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
                {/* Mobile Logo */}
                {isMobile && (
                  <Box sx={{ textAlign: "center", mb: 4 }}>
                    <Avatar
                      sx={{
                        bgcolor: "primary.main",
                        mx: "auto",
                        mb: 2,
                        width: 64,
                        height: 64,
                      }}
                    >
                      <Store fontSize="large" />
                    </Avatar>
                    <Typography
                      variant="h4"
                      sx={{ fontWeight: 700, color: "primary.main" }}
                    >
                      POS Master
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Sign in to your account
                    </Typography>
                  </Box>
                )}

                {/* Desktop Header */}
                {!isMobile && (
                  <Box sx={{ mb: 4, textAlign: "center" }}>
                    <Typography
                      variant="h4"
                      sx={{
                        fontWeight: 700,
                        color: "primary.main",
                        mb: 1,
                      }}
                    >
                      Welcome Back
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      Sign in to access your POS dashboard
                    </Typography>
                  </Box>
                )}

                {/* Login Form */}
                <form onSubmit={handleSubmit} noValidate>
                  <TextField
                    label="Email Address"
                    type="email"
                    fullWidth
                    margin="normal"
                    value={formData.email}
                    onChange={handleInputChange("email")}
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
                      "& .MuiOutlinedInput-root": {
                        "&:hover fieldset": {
                          borderColor: "primary.main",
                        },
                      },
                    }}
                  />

                  <TextField
                    label="Password"
                    type={showPassword ? "text" : "password"}
                    fullWidth
                    margin="normal"
                    value={formData.password}
                    onChange={handleInputChange("password")}
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
                      "& .MuiOutlinedInput-root": {
                        "&:hover fieldset": {
                          borderColor: "primary.main",
                        },
                      },
                    }}
                  />

                  <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    size="large"
                    disabled={
                      isLoading || !formData.email || !formData.password
                    }
                    sx={{
                      mt: 3,
                      mb: 2,
                      height: 48,
                      borderRadius: 2,
                      textTransform: "none",
                      fontSize: "1rem",
                      fontWeight: 600,
                      boxShadow: "0 4px 12px rgba(37, 99, 235, 0.3)",
                      "&:hover": {
                        boxShadow: "0 6px 16px rgba(37, 99, 235, 0.4)",
                      },
                      "&:disabled": {
                        opacity: 0.7,
                      },
                    }}
                  >
                    {isLoading ? (
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <CircularProgress size={20} color="inherit" />
                        Signing In...
                      </Box>
                    ) : (
                      "Sign In to POS"
                    )}
                  </Button>
                </form>
                {/* Footer */}
                <Box sx={{ mt: 4, textAlign: "center" }}>
                  <Typography variant="body2" color="text.secondary">
                    © 2025 POS Master. All rights reserved.
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Fade>
        </Box>
      </Container>

      {/* Custom Snackbar for Error Messages */}
      
      <CustomSnackbar
        open={snackbarOpen}
        severity="error"
        message={error || ""}
        onClose={handleSnackbarClose}
        autoHideDuration={4000}
      />
    </Box>
  );
};

export default Login;