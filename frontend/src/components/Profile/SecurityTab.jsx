import React, { useState } from 'react';
import {
  Typography,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  IconButton,
  Divider,
  InputAdornment,
  useTheme,
  alpha,
  Stack,
  Switch,
  Collapse,
  Box
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Security,
  Dashboard
} from '@mui/icons-material';

// Security Tab Component
function SecurityTab({ onPasswordChange, loading }) {
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const theme = useTheme();

  const handlePasswordChange = async () => {
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      return;
    }
    
    await onPasswordChange(passwordForm);
    setPasswordForm({ current_password: '', new_password: '', confirm_password: '' });
    setIsChangingPassword(false);
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  return (
    <Grid container spacing={4}>
      <Grid size={{ xs: 12, md: 6 }}>
        <Card>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  color: theme.palette.primary.main
                }}
              >
                <Security fontSize="large" />
              </Box>
              <Box>
                <Typography variant="h6" fontWeight="bold">
                  Password Security
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Keep your account secure
                </Typography>
              </Box>
            </Box>

            <Collapse in={!isChangingPassword}>
              <Box sx={{ textAlign: 'center', py: 3 }}>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                  Update your password to keep your account secure
                </Typography>
                <Button
                  variant="contained"
                  onClick={() => setIsChangingPassword(true)}
                  sx={{ borderRadius: 3, px: 4, py: 1.5 }}
                >
                  Change Password
                </Button>
              </Box>
            </Collapse>

            <Collapse in={isChangingPassword}>
              <Stack spacing={3}>
                <TextField
                  fullWidth
                  label="Current Password"
                  type={showPasswords.current ? 'text' : 'password'}
                  value={passwordForm.current_password}
                  onChange={(e) => setPasswordForm({...passwordForm, current_password: e.target.value})}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => togglePasswordVisibility('current')}>
                          {showPasswords.current ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />
                <TextField
                  fullWidth
                  label="New Password"
                  type={showPasswords.new ? 'text' : 'password'}
                  value={passwordForm.new_password}
                  onChange={(e) => setPasswordForm({...passwordForm, new_password: e.target.value})}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => togglePasswordVisibility('new')}>
                          {showPasswords.new ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />
                <TextField
                  fullWidth
                  label="Confirm New Password"
                  type={showPasswords.confirm ? 'text' : 'password'}
                  value={passwordForm.confirm_password}
                  onChange={(e) => setPasswordForm({...passwordForm, confirm_password: e.target.value})}
                  error={passwordForm.confirm_password && passwordForm.new_password !== passwordForm.confirm_password}
                  helperText={passwordForm.confirm_password && passwordForm.new_password !== passwordForm.confirm_password ? "Passwords do not match" : ""}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => togglePasswordVisibility('confirm')}>
                          {showPasswords.confirm ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />
                <Stack direction="row" spacing={2}>
                  <Button
                    variant="outlined"
                    onClick={() => {
                      setIsChangingPassword(false);
                      setPasswordForm({ current_password: '', new_password: '', confirm_password: '' });
                    }}
                    sx={{ borderRadius: 3 }}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="contained"
                    onClick={handlePasswordChange}
                    disabled={loading || !passwordForm.current_password || !passwordForm.new_password || passwordForm.new_password !== passwordForm.confirm_password}
                    sx={{ borderRadius: 3 }}
                  >
                    Update Password
                  </Button>
                </Stack>
              </Stack>
            </Collapse>
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <Card>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  backgroundColor: alpha(theme.palette.success.main, 0.1),
                  color: theme.palette.success.main
                }}
              >
                <Dashboard fontSize="large" />
              </Box>
              <Box>
                <Typography variant="h6" fontWeight="bold">
                  Account Status
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Your account information
                </Typography>
              </Box>
            </Box>

            <Stack spacing={3}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body1">Two-Factor Authentication</Typography>
                <Switch disabled />
              </Box>
              <Divider />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body1">Email Notifications</Typography>
                <Switch defaultChecked />
              </Box>
              <Divider />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body1">SMS Notifications</Typography>
                <Switch />
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}

export default SecurityTab;