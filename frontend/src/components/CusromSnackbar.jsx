import React from 'react';
import { Snackbar, Alert } from '@mui/material';
import { useTheme } from '@mui/material/styles';

const CustomSnackbar = ({ open, severity, message, onClose, autoHideDuration = 4000 }) => {
  const theme = useTheme();

  return (
    <Snackbar
      open={open}
      autoHideDuration={autoHideDuration}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
    >
      <Alert
        severity={severity}
        sx={{
          borderRadius: 2,
          boxShadow: theme.shadows[8],
        }}
        onClose={onClose}
      >
        {message}
      </Alert>
    </Snackbar>
  );
};

export default CustomSnackbar;
