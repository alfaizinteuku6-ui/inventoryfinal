import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Tabs,
  Tab,
  Typography,
  Alert,
  Snackbar,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Person,
  Business,
  People,
  Lock,
} from '@mui/icons-material';
import TabPanel from '../components/Profile/TabPanel';
import ProfileTab from '../components/Profile/ProfileTab';
import BusinessTab from '../components/Profile/BusinessTab';
import StaffTab from '../components/Profile/StaffTab';
import SecurityTab from '../components/Profile/SecurityTab';
import { useAuth } from '../hooks/useAuth';
import { useVendors, useAuthUser } from '../hooks/useSWR';
import { accounts, vendors } from '../services/api';

// Mock API service
const api = {
  getUserProfile: async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return {
      id: 1,
      username: 'john_doe',
      email: 'john@example.com',
      first_name: 'John',
      last_name: 'Doe',
      phone: '+91 9876543210',
      address: '123 Main Street, City',
      role: 'admin',
      avatar: '',
      hire_date: '2023-01-15',
      salary: 50000,
      commission_rate: 5.0
    };
  },
  updateUserProfile: async (data) => {
    await new Promise(resolve => setTimeout(resolve, 800));
    return data;
  },
  getVendorDetails: async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return {
      id: 1,
      name: 'ABC Electronics Store',
      business_type: 'retail',
      contact_person: 'John Doe',
      email: 'contact@abcelectronics.com',
      phone: '+91 9876543210',
      address: '456 Business District',
      city: 'Mumbai',
      state: 'Maharashtra',
      postal_code: '400001',
      country: 'India',
      tax_number: 'GST123456789',
      pan_number: 'ABCDE1234F',
      payment_terms: 'Net 30',
      credit_limit: 100000,
      currency: 'INR',
      tax_rate: 18.0,
      logo: ''
    };
  },
  updateVendorDetails: async (data) => {
    await new Promise(resolve => setTimeout(resolve, 800));
    return data;
  },
  getStaffMembers: async () => [
    {
      id: 2,
      username: 'jane_smith',
      email: 'jane@example.com',
      first_name: 'Jane',
      last_name: 'Smith',
      full_name: 'Jane Smith',
      phone: '+91 9876543211',
      role: 'staff',
      avatar: '',
      hire_date: '2023-02-20',
      salary: 30000,
      commission_rate: 3.0,
      is_active_employee: true
    },
    {
      id: 3,
      username: 'mike_johnson',
      email: 'mike@example.com',
      first_name: 'Mike',
      last_name: 'Johnson',
      full_name: 'Mike Johnson',
      phone: '+91 9876543212',
      role: 'manager',
      avatar: '',
      hire_date: '2023-01-10',
      salary: 40000,
      commission_rate: 4.0,
      is_active_employee: true
    }
  ],
  createStaffMember: async (data) => {
    await new Promise(resolve => setTimeout(resolve, 800));
    return { id: Date.now(), ...data, full_name: `${data.first_name} ${data.last_name}` };
  },
  updateStaffMember: async (id, data) => {
    await new Promise(resolve => setTimeout(resolve, 800));
    return data;
  },
  deleteStaffMember: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return true;
  },
  changePassword: async (data) => {
    await new Promise(resolve => setTimeout(resolve, 800));
    return true;
  }
};

// Main Profile Component
function Profile() {
  const [currentTab, setCurrentTab] = useState(0);
  const  {data: userProfile, isLoading: userLoading, mutate: userRefresh} = useAuthUser();
  const { data: vendorDetails, error: vendorError, isLoading: vendorLoading, mutate: vendorRefresh } = useVendors();
  const [staffMembers, setStaffMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const theme = useTheme();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setInitialLoading(true);
      const [profile, vendor, staff] = await Promise.all([
        api.getUserProfile(),
        api.getVendorDetails(),
        api.getStaffMembers()
      ]);
      
      setStaffMembers(staff);
    } catch (error) {
      showSnackbar('Error loading data', 'error');
    } finally {
      setInitialLoading(false);
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  const handleUpdateProfile = async (profileData) => {
    try {
      await accounts.updateMe(profileData);
      showSnackbar('Profile updated successfully');
      userRefresh();
    } catch (error) {
      showSnackbar('Error updating profile', 'error');
    }
  };

  const handleUpdateVendor = async (vendorData) => {
    try {
      await vendors.update(vendorData?.id, vendorData);
      showSnackbar('Business details updated successfully');
      vendorRefresh();
    } catch (error) {
      showSnackbar('Error updating business details', 'error');
    }
  };

  const handlePasswordChange = async (passwordData) => {
    try {
      setLoading(true);
      await api.changePassword(passwordData);
      showSnackbar('Password changed successfully');
    } catch (error) {
      showSnackbar('Error changing password', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateStaff = async (staffData) => {
    try {
      setLoading(true);
      const newStaff = await api.createStaffMember(staffData);
      setStaffMembers([...staffMembers, newStaff]);
      showSnackbar('Staff member added successfully');
    } catch (error) {
      showSnackbar('Error adding staff member', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStaff = async (staffId, staffData) => {
    try {
      setLoading(true);
      const updated = await api.updateStaffMember(staffId, staffData);
      setStaffMembers(staffMembers.map(s => s.id === staffId ? { ...s, ...updated, full_name: `${updated.first_name} ${updated.last_name}` } : s));
      showSnackbar('Staff member updated successfully');
    } catch (error) {
      showSnackbar('Error updating staff member', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStaff = async (staffId) => {
    if (window.confirm('Are you sure you want to deactivate this staff member?')) {
      try {
        setLoading(true);
        await api.deleteStaffMember(staffId);
        setStaffMembers(staffMembers.map(s => 
          s.id === staffId ? { ...s, is_active_employee: false } : s
        ));
        showSnackbar('Staff member deactivated successfully');
      } catch (error) {
        showSnackbar('Error deactivating staff member', 'error');
      } finally {
        setLoading(false);
      }
    }
  };

  const canManageVendor = userProfile?.role === 'owner' || userProfile?.role === 'admin';
  const canManageStaff = ['owner', 'admin', 'manager'].includes(userProfile?.role);

  if (initialLoading) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '60vh' 
        }}
      >
        <Typography variant="h6" color="text.secondary">
          Loading your settings...
        </Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography 
          variant="h3" 
          fontWeight="bold" 
          sx={{ 
            background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            backgroundClip: 'text',
            textFillColor: 'transparent',
            mb: 1
          }}
        >
          Settings
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Manage your account, business, and team settings
        </Typography>
      </Box>

      <Paper 
        elevation={0}
        sx={{ 
          borderRadius: 4,
          overflow: 'hidden',
          border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
        }}
      >
        <Tabs 
          value={currentTab} 
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{ 
            borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
            '& .MuiTab-root': {
              minHeight: 72,
              textTransform: 'none',
              fontSize: '1rem',
              fontWeight: 500
            }
          }}
        >
          <Tab 
            icon={<Person sx={{ mb: 1 }} />} 
            label="Profile"
            sx={{ flexDirection: 'column' }}
          />
          <Tab 
            icon={<Business sx={{ mb: 1 }} />} 
            label="Business" 
            disabled={!canManageVendor}
            sx={{ flexDirection: 'column' }}
          />
          <Tab 
            icon={<People sx={{ mb: 1 }} />} 
            label="Staff" 
            disabled={!canManageStaff}
            sx={{ flexDirection: 'column' }}
          />
          <Tab 
            icon={<Lock sx={{ mb: 1 }} />} 
            label="Security"
            sx={{ flexDirection: 'column' }}
          />
        </Tabs>

        <TabPanel value={currentTab} index={0}>
          <ProfileTab 
            userProfile={userProfile}
            onUpdate={handleUpdateProfile}
            loading={loading}
          />
        </TabPanel>

        <TabPanel value={currentTab} index={1}>
          <BusinessTab
            vendorDetails={vendorDetails}
            onUpdate={handleUpdateVendor}
            canManageVendor={canManageVendor}
            loading={loading}
          />
        </TabPanel>

        <TabPanel value={currentTab} index={2}>
          <StaffTab
            staffMembers={staffMembers}
            canManageStaff={canManageStaff}
            onCreateStaff={handleCreateStaff}
            onUpdateStaff={handleUpdateStaff}
            onDeleteStaff={handleDeleteStaff}
            loading={loading}
          />
        </TabPanel>

        <TabPanel value={currentTab} index={3}>
          <SecurityTab
            onPasswordChange={handlePasswordChange}
            loading={loading}
          />
        </TabPanel>
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({...snackbar, open: false})}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          severity={snackbar.severity}
          sx={{ 
            borderRadius: 2,
            boxShadow: theme.shadows[8]
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default Profile;