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
  Alert,
  Snackbar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Chip,
  InputAdornment,
  useTheme,
  Stack,
  Collapse
} from '@mui/material';
import {
  Edit,
  Delete,
  Add,
  Save,
  Cancel,
  Email,
  Phone,
  Work,
  AttachMoney,
} from '@mui/icons-material';

// Staff Tab Component
function StaffTab({ staffMembers, canManageStaff, onCreateStaff, onUpdateStaff, onDeleteStaff, loading }) {
  const [addingStaff, setAddingStaff] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [staffForm, setStaffForm] = useState({});
  const theme = useTheme();

  const initializeForm = (staff = null) => {
    setStaffForm(staff || {
      username: '',
      email: '',
      first_name: '',
      last_name: '',
      phone: '',
      role: 'staff',
      hire_date: new Date().toISOString().split('T')[0],
      salary: '',
      commission_rate: 0
    });
  };

  const handleAdd = () => {
    setAddingStaff(true);
    setEditingStaff(null);
    initializeForm();
  };

  const handleEdit = (staff) => {
    setEditingStaff(staff);
    setAddingStaff(false);
    initializeForm(staff);
  };

  const handleSave = async () => {
    if (editingStaff) {
      await onUpdateStaff(editingStaff.id, staffForm);
      setEditingStaff(null);
    } else {
      await onCreateStaff(staffForm);
      setAddingStaff(false);
    }
    initializeForm();
  };

  const handleCancel = () => {
    setAddingStaff(false);
    setEditingStaff(null);
    initializeForm();
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

  if (!canManageStaff) {
    return (
      <Alert severity="warning" sx={{ borderRadius: 3 }}>
        You don't have permission to manage staff members.
      </Alert>
    );
  }

  return (
    <Box>
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box>
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                Staff Management
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {staffMembers.length} staff members
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleAdd}
              sx={{ borderRadius: 3 }}
              disabled={addingStaff}
            >
              Add Staff Member
            </Button>
          </Box>
        </CardContent>
      </Card>

      <Collapse in={addingStaff || editingStaff !== null}>
        <Card sx={{ mb: 3, border: `2px solid ${theme.palette.primary.main}` }}>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" fontWeight="bold">
                {editingStaff ? 'Edit Staff Member' : 'Add New Staff Member'}
              </Typography>
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
                  {editingStaff ? 'Update' : 'Add'} Staff
                </Button>
              </Stack>
            </Box>

            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="First Name"
                  value={staffForm.first_name || ''}
                  onChange={(e) => setStaffForm({...staffForm, first_name: e.target.value})}
                  required
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Last Name"
                  value={staffForm.last_name || ''}
                  onChange={(e) => setStaffForm({...staffForm, last_name: e.target.value})}
                  required
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={staffForm.email || ''}
                  onChange={(e) => setStaffForm({...staffForm, email: e.target.value})}
                  required
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Phone"
                  value={staffForm.phone || ''}
                  onChange={(e) => setStaffForm({...staffForm, phone: e.target.value})}
                  required
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <FormControl fullWidth required>
                  <InputLabel>Role</InputLabel>
                  <Select
                    value={staffForm.role || 'staff'}
                    onChange={(e) => setStaffForm({...staffForm, role: e.target.value})}
                  >
                    <MenuItem value="staff">👤 Staff</MenuItem>
                    <MenuItem value="manager">👨‍💼 Manager</MenuItem>
                    <MenuItem value="admin">👑 Admin</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Hire Date"
                  type="date"
                  value={staffForm.hire_date || ''}
                  onChange={(e) => setStaffForm({...staffForm, hire_date: e.target.value})}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Salary"
                  type="number"
                  value={staffForm.salary || ''}
                  onChange={(e) => setStaffForm({...staffForm, salary: e.target.value})}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                  }}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Commission Rate"
                  type="number"
                  value={staffForm.commission_rate || ''}
                  onChange={(e) => setStaffForm({...staffForm, commission_rate: e.target.value})}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">%</InputAdornment>,
                  }}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Collapse>

      <Grid container spacing={3}>
        {staffMembers.map((staff) => (
          <Grid size={{ xs: 12, md: 6, lg: 4 }} key={staff.id}>
            <Card 
              sx={{ 
                height: '100%',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: theme.shadows[8]
                },
                opacity: staff.is_active_employee ? 1 : 0.6
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Avatar
                    sx={{ 
                      width: 56, 
                      height: 56,
                      backgroundColor: theme.palette.primary.main
                    }}
                    src={staff.avatar}
                  >
                    <Typography variant="h6" fontWeight="bold">
                      {staff.first_name?.[0]}{staff.last_name?.[0]}
                    </Typography>
                  </Avatar>
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <IconButton 
                      size="small" 
                      onClick={() => handleEdit(staff)}
                      disabled={editingStaff?.id === staff.id}
                    >
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      onClick={() => onDeleteStaff(staff.id)}
                      color="error"
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>

                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  {staff.full_name}
                </Typography>
                
                <Stack spacing={1} sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Email fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">
                      {staff.email}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Phone fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">
                      {staff.phone}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Work fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">
                      Since {new Date(staff.hire_date).toLocaleDateString()}
                    </Typography>
                  </Box>
                  {staff.salary && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <AttachMoney fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        ₹{staff.salary.toLocaleString()}/month
                      </Typography>
                    </Box>
                  )}
                </Stack>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Chip
                    label={staff.role.toUpperCase()}
                    color={getRoleColor(staff.role)}
                    size="small"
                    sx={{ fontWeight: 'bold' }}
                  />
                  <Chip
                    label={staff.is_active_employee ? 'Active' : 'Inactive'}
                    color={staff.is_active_employee ? 'success' : 'default'}
                    size="small"
                    variant={staff.is_active_employee ? 'filled' : 'outlined'}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
export default StaffTab;