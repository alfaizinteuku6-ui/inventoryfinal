import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Avatar,
  Card,
  CardContent,
  IconButton,
  Chip,
  useTheme,
  alpha,
  Stack,
} from '@mui/material';
import {
  Edit,
  Save,
  Cancel,
  PhotoCamera,
  Email,
  Phone,
  Work,
} from '@mui/icons-material';


// Profile Tab Component
function ProfileTab({ userProfile, onUpdate, loading }) {
  const [profileForm, setProfileForm] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const theme = useTheme();

  useEffect(() => {
    if (userProfile) {
      setProfileForm(userProfile);
    }
  }, [userProfile]);

  const handleSave = async () => {
    await onUpdate(profileForm);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setProfileForm(userProfile);
    setIsEditing(false);
  };

  const getRoleColor = (role) => {
    const colors = {
      owner: 'error',
      admin: 'primary',
      manager: 'secondary',
      staff: 'default'
    };
    return colors[role] || 'default';
  };

  return (
    <Grid container spacing={4}>
      <Grid size={{ xs: 12, md: 4 }}>
        <Card 
          sx={{ 
            background: `linear-gradient(135deg, ${theme.palette.primary.main}20 0%, ${theme.palette.secondary.main}20 100%)`,
            backdropFilter: 'blur(10px)',
            border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
          }}
        >
          <CardContent sx={{ textAlign: 'center', p: 4 }}>
            <Box sx={{ position: 'relative', display: 'inline-block', mb: 3 }}>
              <Avatar
                sx={{ 
                  width: 120, 
                  height: 120, 
                  mx: 'auto',
                  boxShadow: theme.shadows[8],
                  border: `4px solid ${theme.palette.background.paper}`
                }}
                src={profileForm.avatar}
              >
                <Typography variant="h3" fontWeight="bold">
                  {profileForm.first_name?.[0]}{profileForm.last_name?.[0]}
                </Typography>
              </Avatar>
              <IconButton
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  backgroundColor: theme.palette.primary.main,
                  color: 'white',
                  '&:hover': {
                    backgroundColor: theme.palette.primary.dark,
                  },
                }}
                size="small"
              >
                <PhotoCamera fontSize="small" />
              </IconButton>
            </Box>
            
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              {profileForm.first_name} {profileForm.last_name}
            </Typography>
            
            <Chip 
              label={profileForm.role?.toUpperCase()} 
              color={getRoleColor(profileForm.role)}
              sx={{ 
                fontWeight: 'bold',
                mb: 2,
                px: 2,
                py: 1
              }}
            />

            <Stack spacing={1} sx={{ mt: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                <Email fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary">
                  {profileForm.email}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                <Phone fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary">
                  {profileForm.phone}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                <Work fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary">
                  Since {new Date(profileForm.hire_date).toLocaleDateString()}
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, md: 8 }}>
        <Card sx={{ height: '100%' }}>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
              <Typography variant="h5" fontWeight="bold">
                Personal Information
              </Typography>
              {!isEditing ? (
                <Button
                  variant="contained"
                  startIcon={<Edit />}
                  onClick={() => setIsEditing(true)}
                  sx={{ borderRadius: 3 }}
                >
                  Edit Profile
                </Button>
              ) : (
                <Stack direction="row" spacing={1}>
                  <Button
                    variant="outlined"
                    startIcon={<Cancel />}
                    onClick={handleCancel}
                    sx={{ borderRadius: 3 }}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<Save />}
                    onClick={handleSave}
                    disabled={loading}
                    sx={{ borderRadius: 3 }}
                  >
                    Save Changes
                  </Button>
                </Stack>
              )}
            </Box>

            <Grid container spacing={3}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="First Name"
                  value={profileForm.first_name || ''}
                  onChange={(e) => setProfileForm({...profileForm, first_name: e.target.value})}
                  disabled={!isEditing}
                  variant={isEditing ? "outlined" : "filled"}
                  sx={{ '& .MuiFilledInput-root': { backgroundColor: alpha(theme.palette.primary.main, 0.05) } }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Last Name"
                  value={profileForm.last_name || ''}
                  onChange={(e) => setProfileForm({...profileForm, last_name: e.target.value})}
                  disabled={!isEditing}
                  variant={isEditing ? "outlined" : "filled"}
                  sx={{ '& .MuiFilledInput-root': { backgroundColor: alpha(theme.palette.primary.main, 0.05) } }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Username"
                  value={profileForm.username || ''}
                  onChange={(e) => setProfileForm({...profileForm, username: e.target.value})}
                  disabled={!isEditing}
                  variant={isEditing ? "outlined" : "filled"}
                  sx={{ '& .MuiFilledInput-root': { backgroundColor: alpha(theme.palette.primary.main, 0.05) } }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={profileForm.email || ''}
                  onChange={(e) => setProfileForm({...profileForm, email: e.target.value})}
                  disabled={!isEditing}
                  variant={isEditing ? "outlined" : "filled"}
                  sx={{ '& .MuiFilledInput-root': { backgroundColor: alpha(theme.palette.primary.main, 0.05) } }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Phone"
                  value={profileForm.phone || ''}
                  onChange={(e) => setProfileForm({...profileForm, phone: e.target.value})}
                  disabled={!isEditing}
                  variant={isEditing ? "outlined" : "filled"}
                  sx={{ '& .MuiFilledInput-root': { backgroundColor: alpha(theme.palette.primary.main, 0.05) } }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Hire Date"
                  type="date"
                  value={profileForm.hire_date || ''}
                  onChange={(e) => setProfileForm({...profileForm, hire_date: e.target.value})}
                  disabled={!isEditing}
                  variant={isEditing ? "outlined" : "filled"}
                  InputLabelProps={{ shrink: true }}
                  sx={{ '& .MuiFilledInput-root': { backgroundColor: alpha(theme.palette.primary.main, 0.05) } }}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Address"
                  multiline
                  rows={3}
                  value={profileForm.address || ''}
                  onChange={(e) => setProfileForm({...profileForm, address: e.target.value})}
                  disabled={!isEditing}
                  variant={isEditing ? "outlined" : "filled"}
                  sx={{ '& .MuiFilledInput-root': { backgroundColor: alpha(theme.palette.primary.main, 0.05) } }}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}

export default ProfileTab;