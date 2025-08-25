// frontend/src/components/ErrorBoundary.jsx
import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Container,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Stack,
  Divider,
  Chip,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  ErrorOutline,
  Refresh,
  ExpandMore,
  BugReport,
  Home,
  ContactSupport,
} from '@mui/icons-material';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      errorId: Date.now().toString(36) + Math.random().toString(36).substr(2),
    };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to console and any error reporting service
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
    });

    // Here you would typically log to your error reporting service
    // Example: Sentry, LogRocket, Bugsnag, etc.
    // errorReportingService.logError(error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
    });
  };

  copyErrorDetails = () => {
    const errorDetails = `
Error ID: ${this.state.errorId}
Error: ${this.state.error?.message}
Stack: ${this.state.error?.stack}
Component Stack: ${this.state.errorInfo?.componentStack}
Timestamp: ${new Date().toISOString()}
    `.trim();

    navigator.clipboard.writeText(errorDetails).then(() => {
      // You could show a toast notification here
      console.log('Error details copied to clipboard');
    });
  };

  render() {
    if (this.state.hasError) {
      const { error, errorInfo, errorId } = this.state;

      return (
        <ErrorBoundaryUI
          error={error}
          errorInfo={errorInfo}
          errorId={errorId}
          onReload={this.handleReload}
          onGoHome={this.handleGoHome}
          onRetry={this.handleRetry}
          onCopyError={this.copyErrorDetails}
        />
      );
    }

    return this.props.children;
  }
}

// Functional component for the error UI to use hooks
const ErrorBoundaryUI = ({
  error,
  errorInfo,
  errorId,
  onReload,
  onGoHome,
  onRetry,
  onCopyError,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: 'background.default',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
      }}
    >
      <Container maxWidth="md">
        <Card
          elevation={3}
          sx={{
            maxWidth: '100%',
            mx: 'auto',
            borderRadius: 2,
          }}
        >
          <CardContent sx={{ p: { xs: 3, sm: 4, md: 5 } }}>
            {/* Header Section */}
            <Box
              sx={{
                textAlign: 'center',
                mb: 4,
              }}
            >
              <ErrorOutline
                sx={{
                  fontSize: { xs: 48, sm: 64 },
                  color: 'error.main',
                  mb: 2,
                }}
              />
              <Typography
                variant={isMobile ? 'h5' : 'h4'}
                component="h1"
                gutterBottom
                sx={{ fontWeight: 600 }}
              >
                Oops! Something went wrong
              </Typography>
              <Typography
                variant="body1"
                color="text.secondary"
                sx={{ mb: 3 }}
              >
                We apologize for the inconvenience. The POS system encountered an unexpected error.
              </Typography>

              {/* Error ID Chip */}
              <Chip
                label={`Error ID: ${errorId}`}
                variant="outlined"
                size="small"
                sx={{ mb: 3 }}
              />
            </Box>

            {/* Quick Actions */}
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              sx={{ mb: 4 }}
              justifyContent="center"
            >
              <Button
                variant="contained"
                startIcon={<Refresh />}
                onClick={onRetry}
                size={isMobile ? 'medium' : 'large'}
              >
                Try Again
              </Button>
              <Button
                variant="outlined"
                startIcon={<Refresh />}
                onClick={onReload}
                size={isMobile ? 'medium' : 'large'}
              >
                Reload Page
              </Button>
              <Button
                variant="outlined"
                startIcon={<Home />}
                onClick={onGoHome}
                size={isMobile ? 'medium' : 'large'}
              >
                Go Home
              </Button>
            </Stack>

            <Divider sx={{ mb: 3 }} />

            {/* Common Solutions Alert */}
            <Alert 
              severity="info" 
              sx={{ mb: 3 }}
              action={
                <Button 
                  color="inherit" 
                  size="small"
                  startIcon={<ContactSupport />}
                >
                  Contact Support
                </Button>
              }
            >
              <Typography variant="body2">
                <strong>Quick fixes:</strong> Try refreshing the page, clearing your browser cache, or checking your internet connection.
              </Typography>
            </Alert>

            {/* Technical Details Accordion */}
            <Accordion>
              <AccordionSummary
                expandIcon={<ExpandMore />}
                aria-controls="error-details-content"
                id="error-details-header"
              >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <BugReport sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography variant="subtitle1">
                    Technical Details
                  </Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Stack spacing={2}>
                  {/* Error Message */}
                  <Box>
                    <Typography variant="subtitle2" color="error" gutterBottom>
                      Error Message:
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        bgcolor: 'grey.100',
                        p: 2,
                        borderRadius: 1,
                        fontFamily: 'monospace',
                        fontSize: '0.875rem',
                        wordBreak: 'break-word',
                      }}
                    >
                      {error?.message || 'Unknown error occurred'}
                    </Typography>
                  </Box>

                  {/* Error Stack (for development) */}
                  {process.env.NODE_ENV === 'development' && error?.stack && (
                    <Box>
                      <Typography variant="subtitle2" color="error" gutterBottom>
                        Stack Trace:
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          bgcolor: 'grey.100',
                          p: 2,
                          borderRadius: 1,
                          fontFamily: 'monospace',
                          fontSize: '0.75rem',
                          maxHeight: 200,
                          overflow: 'auto',
                          wordBreak: 'break-word',
                        }}
                      >
                        {error.stack}
                      </Typography>
                    </Box>
                  )}

                  {/* Component Stack */}
                  {process.env.NODE_ENV === 'development' && errorInfo?.componentStack && (
                    <Box>
                      <Typography variant="subtitle2" color="error" gutterBottom>
                        Component Stack:
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          bgcolor: 'grey.100',
                          p: 2,
                          borderRadius: 1,
                          fontFamily: 'monospace',
                          fontSize: '0.75rem',
                          maxHeight: 150,
                          overflow: 'auto',
                          wordBreak: 'break-word',
                        }}
                      >
                        {errorInfo.componentStack}
                      </Typography>
                    </Box>
                  )}

                  {/* Copy Error Details Button */}
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={onCopyError}
                    sx={{ alignSelf: 'flex-start' }}
                  >
                    Copy Error Details
                  </Button>
                </Stack>
              </AccordionDetails>
            </Accordion>

            {/* Footer */}
            <Box sx={{ textAlign: 'center', mt: 4, pt: 3, borderTop: 1, borderColor: 'divider' }}>
              <Typography variant="caption" color="text.secondary">
                If this problem persists, please contact your system administrator or technical support team with the error ID above.
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default ErrorBoundary;