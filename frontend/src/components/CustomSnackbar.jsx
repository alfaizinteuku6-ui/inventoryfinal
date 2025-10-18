import React from 'react';
import { Snackbar, Alert } from '@mui/material';
import { useTheme } from '@mui/material/styles';

const CustomSnackbar = ({ open, severity, message, onClose, autoHideDuration = 4000 }) => {
  const theme = useTheme();

  // Convert message to string if it's an object
  const getMessage = (msg) => {
    if (!msg) return "";
    if (typeof msg === "string") return msg;
    if (msg.message) return msg.message; // common for Error objects
    try {
      return JSON.stringify(msg);
    } catch {
      return "An error occurred";
    }
  };

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
        {getMessage(message)}
      </Alert>
    </Snackbar>
  );
};

export default CustomSnackbar;
