// frontend/src/App.jsx
import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CssBaseline, Box, CircularProgress, Typography, LinearProgress } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

// Components
import Layout from './components/Layout/Layout';
import AuthProvider from './contexts/AuthContext';
import { useAuth } from './hooks/useAuth';
import NotificationProvider from './contexts/NotificationContext';
import ErrorBoundary from './components/ErrorBoundary';
import { ThemeContextProvider } from './contexts/ThemeContext';
// Lazy load pages for better performance
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const Products = React.lazy(() => import('./pages/Products'));
const ProductForm = React.lazy(() => import('./pages/ProductForm'));
const Sales = React.lazy(() => import('./pages/Sales'));
const CreateSale = React.lazy(() => import('./pages/CreateSale'));
const PosTerminal = React.lazy(() => import('./pages/PosTerminal'));
const SaleDetails = React.lazy(() => import('./pages/SaleDetails'));
const Customers = React.lazy(() => import('./pages/Customers'));
const Login = React.lazy(() => import('./pages/Login'));
const Profile = React.lazy(() => import('./pages/Profile'));
const ProductDetails = React.lazy(() => import('./pages/ProductDetails'));
const StockMovements = React.lazy(() => import('./pages/StockMovements'));
const Suppliers = React.lazy(() => import('./pages/Suppliers'));
const PrinterSettings = React.lazy(() => import('./pages/PrinterSettings'));

// Loading component
const LoadingFallback = () => (
  <Box 
    sx={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh', 
      width: '100vw'
    }}
  >
    <CircularProgress />
  </Box>
);

// Auth Loading component
const AuthLoadingFallback = () => (
  <Box
    sx={{
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      height: "100vh",
      width: "100vw",
      bgcolor: "background.default",
      px: 4,
    }}
  >
    <Typography
      variant="h6"
      sx={{ mb: 2, fontWeight: "bold", color: "primary.main" }}
    >
      Initializing POS System...
    </Typography>
    <LinearProgress
      sx={{
        width: "100%",
        maxWidth: 400,
        height: 8,
        borderRadius: 5,
        [`& .MuiLinearProgress-bar`]: {
          borderRadius: 5,
        },
      }}
    />
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

// Routes configuration for better maintainability
const routes = [
  { path: '/', element: Dashboard, index: true },
  { path: '/products', element: Products },
  { path: '/products/new', element: ProductForm },
  { path: '/products/:id/edit', element: ProductForm },
  { path: '/sales', element: Sales },
  { path: '/pos', element: PosTerminal },
  { path: '/sales/new', element: PosTerminal },
  { path: '/sales/:id/edit', element: CreateSale },
  { path: '/customers', element: Customers },
  { path: '/suppliers', element: Suppliers },
  { path: '/profile', element: Profile },
  { path: '/sales/:id', element: SaleDetails },
  { path: '/products/:id', element: ProductDetails },
  { path: '/stock-movements', element: StockMovements },
  { path: '/settings', element: PrinterSettings },
  { path: '/settings/printer', element: PrinterSettings },
];

function App() {
  return (
    <ErrorBoundary>
      <ThemeContextProvider>
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
      </ThemeContextProvider>
    </ErrorBoundary>
  );
}

export default App;