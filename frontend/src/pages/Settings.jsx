import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Divider,
  Alert,
} from '@mui/material';
import { Save } from '@mui/icons-material';

const Settings = () => {
  const [settings, setSettings] = useState({
    companyName: 'My Company',
    email: 'contact@example.com',
    phone: '+1234567890',
    address: '',
    taxNumber: '',
    currency: 'INR',
    lowStockThreshold: 10,
    enableNotifications: true,
    enableAutoBackup: false,
  });

  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/settings/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      
      if (response.ok) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Settings
      </Typography>

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Settings saved successfully!
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          {/* Company Information */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Company Information
                </Typography>
                <Box display="flex" flexDirection="column" gap={2}>
                  <TextField
                    label="Company Name"
                    fullWidth
                    value={settings.companyName}
                    onChange={(e) =>
                      setSettings({ ...settings, companyName: e.target.value })
                    }
                  />
                  <TextField
                    label="Email"
                    type="email"
                    fullWidth
                    value={settings.email}
                    onChange={(e) =>
                      setSettings({ ...settings, email: e.target.value })
                    }
                  />
                  <TextField
                    label="Phone"
                    fullWidth
                    value={settings.phone}
                    onChange={(e) =>
                      setSettings({ ...settings, phone: e.target.value })
                    }
                  />
                  <TextField
                    label="Address"
                    fullWidth
                    multiline
                    rows={3}
                    value={settings.address}
                    onChange={(e) =>
                      setSettings({ ...settings, address: e.target.value })
                    }
                  />
                  <TextField
                    label="Tax Number"
                    fullWidth
                    value={settings.taxNumber}
                    onChange={(e) =>
                      setSettings({ ...settings, taxNumber: e.target.value })
                    }
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* System Settings */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  System Settings
                </Typography>
                <Box display="flex" flexDirection="column" gap={2}>
                  <TextField
                    label="Currency"
                    fullWidth
                    value={settings.currency}
                    onChange={(e) =>
                      setSettings({ ...settings, currency: e.target.value })
                    }
                  />
                  <TextField
                    label="Low Stock Threshold"
                    type="number"
                    fullWidth
                    value={settings.lowStockThreshold}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        lowStockThreshold: parseInt(e.target.value),
                      })
                    }
                  />
                  <Divider />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.enableNotifications}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            enableNotifications: e.target.checked,
                          })
                        }
                      />
                    }
                    label="Enable Notifications"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.enableAutoBackup}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            enableAutoBackup: e.target.checked,
                          })
                        }
                      />
                    }
                    label="Enable Automatic Backup"
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Box mt={3} display="flex" justifyContent="flex-end">
          <Button type="submit" variant="contained" startIcon={<Save />}>
            Save Settings
          </Button>
        </Box>
      </form>
    </Box>
  );
};

export default Settings;