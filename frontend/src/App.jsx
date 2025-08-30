// frontend/src/App.jsx
import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline, Box, CircularProgress } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

// Components
import Layout from './components/Layout/Layout';
import AuthProvider from './contexts/AuthContext';
import { useAuth } from './hooks/useAuth';
import NotificationProvider from './contexts/NotificationContext';
import ErrorBoundary from './components/ErrorBoundary';

// Lazy load pages for better performance
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const Products = React.lazy(() => import('./pages/Products'));
const ProductForm = React.lazy(() => import('./pages/ProductForm'));
const Sales = React.lazy(() => import('./pages/Sales'));
const CreateSale = React.lazy(() => import('./pages/CreateSale'));
const Customers = React.lazy(() => import('./pages/Customers'));
const Vendors = React.lazy(() => import('./pages/Vendors'));
const Reports = React.lazy(() => import('./pages/Reports'));
const Settings = React.lazy(() => import('./pages/Settings'));
const Login = React.lazy(() => import('./pages/Login'));
const Profile = React.lazy(() => import('./pages/Profile'));

// Loading component
const LoadingFallback = () => (
  <Box 
    sx={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh' 
    }}
  >
    <CircularProgress />
  </Box>
);

// Auth Loading component
const AuthLoadingFallback = () => (
  <Box 
    sx={{ 
      display: 'flex', 
      flexDirection: 'column',
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      bgcolor: 'background.default'
    }}
  >
    <CircularProgress size={40} />
    <Box sx={{ mt: 2, color: 'text.secondary' }}>
      Initializing POS System...
    </Box>
  </Box>
);

// Private Route Component
const PrivateRoute = ({ children }) => {
  const { isAuthenticated, isLoading, isInitialized } = useAuth();

  // Show loading while auth is being initialized
  if (!isInitialized || isLoading) {
    return <AuthLoadingFallback />;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Public Route Component (for login page)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, isLoading, isInitialized } = useAuth();

  // Show loading while auth is being initialized
  if (!isInitialized || isLoading) {
    return <AuthLoadingFallback />;
  }

  // Redirect to dashboard if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// Enhanced theme for POS systems
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2563eb', // Modern blue
      light: '#3b82f6',
      dark: '#1d4ed8',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#f59e0b', // Amber for highlights
      light: '#fbbf24',
      dark: '#d97706',
      contrastText: '#000000',
    },
    success: {
      main: '#10b981',
      light: '#34d399',
      dark: '#059669',
    },
    warning: {
      main: '#f59e0b',
      light: '#fbbf24',
      dark: '#d97706',
    },
    error: {
      main: '#ef4444',
      light: '#f87171',
      dark: '#dc2626',
    },
    background: {
      default: '#f8fafc',
      paper: '#ffffff',
    },
    grey: {
      50: '#f8fafc',
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5e1',
      400: '#94a3b8',
      500: '#64748b',
      600: '#475569',
      700: '#334155',
      800: '#1e293b',
      900: '#0f172a',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: '2.25rem',
      lineHeight: 1.2,
    },
    h2: {
      fontWeight: 600,
      fontSize: '1.875rem',
      lineHeight: 1.3,
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.5rem',
      lineHeight: 1.4,
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.25rem',
      lineHeight: 1.4,
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.125rem',
      lineHeight: 1.4,
    },
    h6: {
      fontWeight: 600,
      fontSize: '1rem',
      lineHeight: 1.4,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.5,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
    },
    button: {
      fontWeight: 500,
      fontSize: '0.875rem',
      textTransform: 'none',
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          borderRadius: 8,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          },
        },
        contained: {
          '&:hover': {
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
          },
        },
        outlined: {
          borderWidth: 1.5,
          '&:hover': {
            borderWidth: 1.5,
            backgroundColor: 'rgba(0,0,0,0.04)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
          borderRadius: 12,
          border: '1px solid rgba(0,0,0,0.08)',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: 'rgba(0,0,0,0.23)',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderWidth: 2,
            },
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
        elevation1: {
          boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
          borderBottom: '1px solid rgba(0,0,0,0.08)',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRight: '1px solid rgba(0,0,0,0.08)',
        },
      },
    },
  },
});

// Routes configuration for better maintainability
const routes = [
  { path: '/', element: Dashboard, index: true },
  { path: '/products', element: Products },
  { path: '/products/new', element: ProductForm },
  { path: '/products/:id/edit', element: ProductForm },
  { path: '/sales', element: Sales },
  { path: '/sales/new', element: CreateSale },
  { path: '/customers', element: Customers },
  { path: '/vendors', element: Vendors },
  { path: '/reports', element: Reports },
  { path: '/settings', element: Settings },
  { path: '/profile', element: Profile },
];

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <AuthProvider>
            <NotificationProvider>
              <Router>
                <Suspense fallback={<LoadingFallback />}>
                  <Routes>
                    {/* Public Routes */}
                    <Route 
                      path="/login" 
                      element={
                        <PublicRoute>
                          <Login />
                        </PublicRoute>
                      } 
                    />

                    {/* Private Routes */}
                    <Route 
                      path="/" 
                      element={
                        <PrivateRoute>
                          <Layout />
                        </PrivateRoute>
                      }
                    >
                      {routes.map(({ path, element: Component, index }) => (
                        <Route 
                          key={path}
                          path={index ? undefined : path.substring(1)} 
                          index={index}
                          element={
                            <Suspense fallback={<LoadingFallback />}>
                              <Component />
                            </Suspense>
                          } 
                        />
                      ))}
                    </Route>

                    {/* Catch all route */}
                    <Route 
                      path="*" 
                      element={
                        <PrivateRoute>
                          <Navigate to="/" replace />
                        </PrivateRoute>
                      } 
                    />
                  </Routes>
                </Suspense>
              </Router>
            </NotificationProvider>
          </AuthProvider>
        </LocalizationProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;