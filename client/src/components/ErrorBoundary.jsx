import React from 'react';
import { Box, Typography, Button } from '@mui/material';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    // You can also log the error to an error reporting service here
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '400px',
            p: 3,
            textAlign: 'center'
          }}
        >
          <Typography variant="h4" color="error" gutterBottom>
            Oops! Something went wrong
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            We apologize for the inconvenience. Please try refreshing the page or contact support if the problem persists.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => window.location.reload()}
            sx={{ mt: 2 }}
          >
            Refresh Page
          </Button>
          {process.env.NODE_ENV === 'development' && (
            <Box sx={{ mt: 2, textAlign: 'left' }}>
              <Typography variant="body2" color="error">
                {this.state.error && this.state.error.toString()}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {this.state.errorInfo && this.state.errorInfo.componentStack}
              </Typography>
            </Box>
          )}
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 