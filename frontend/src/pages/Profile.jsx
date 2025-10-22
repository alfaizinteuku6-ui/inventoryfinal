import React, { useState } from "react";
import {
  Box,
  Container,
  Paper,
  Tabs,
  Tab,
  Typography,
  useTheme,
  alpha,
} from "@mui/material";
import { Person, Business, People, Lock } from "@mui/icons-material";
import TabPanel from "../components/Profile/TabPanel";
import ProfileTab from "../components/Profile/ProfileTab";
import BusinessTab from "../components/Profile/BusinessTab";
import StaffTab from "../components/Profile/StaffTab";
import SecurityTab from "../components/Profile/SecurityTab";
import { useVendors, useAuthUser, useGetAllStaff } from "../hooks/useSWR";
import { accounts, vendors } from "../services/api";
import CustomSnackbar from "../components/CustomSnackbar";

// Main Profile Component
function Profile() {
  const [currentTab, setCurrentTab] = useState(0);
  const {
    data: userProfile,
    isLoading: userLoading,
    mutate: userRefresh,
  } = useAuthUser();
  const {
    data: vendorDetails,
    error: vendorError,
    isLoading: vendorLoading,
    mutate: vendorRefresh,
  } = useVendors();
  const {
    data: staffMembers,
    error: staffError,
    isLoading: staffLoading,
    mutate: staffRefresh,
  } = useGetAllStaff();
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const loading = userLoading || vendorLoading || staffLoading;

  const theme = useTheme();

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  const handleUpdateProfile = async (profileData) => {
    try {
      await accounts.updateMe(profileData);
      showSnackbar("Profile updated successfully");
      userRefresh();
    } catch (error) {
      showSnackbar("Error updating profile", "error");
    }
  };

  const handleUpdateVendor = async (vendorData) => {
    try {
      const formVendordata = new FormData();
      for (const key in vendorData) {
        formVendordata.append(key, vendorData[key]);
      }
      await vendors.update(vendorData?.id, formVendordata);
      showSnackbar("Business details updated successfully");
      vendorRefresh();
    } catch (error) {
      showSnackbar("Error updating business details", "error");
    }
  };

  const handlePasswordChange = async (passwordData) => {
    try {
      await accounts.changePassword(passwordData);
      showSnackbar("Password changed successfully");
    } catch (error) {
      showSnackbar("Error changing password", "error");
    }
  };

  const handleCreateStaff = async (staffData) => {
    try {
      await accounts.createStaff(staffData);
      staffRefresh();
      showSnackbar("Staff member created successfully");
    } catch (err) {
      showSnackbar("Error creating staff member", "error");
      console.error("Error:", err);
    }
  };

  const handleUpdateStaff = async (staffId, staffData) => {
    try {
      await accounts.updateStaff(staffId, staffData);
      staffRefresh();
      showSnackbar("Staff member updated successfully");
    } catch (err) {
      console.error("Error:", err);
      showSnackbar("Error updating staff member", "error");
    }
  };

  const onActivateStaff = async (staffId) => {
    try {
      await accounts.reactivateStaff(staffId);
      staffRefresh();
      showSnackbar("Staff member activated successfully");
    } catch (err) {
      console.error("Error:", err);
      showSnackbar("Error activating staff member", "error");
    }
  };

  const handleDeleteStaff = async (staffId) => {
    if (
      window.confirm("Are you sure you want to deactivate this staff member?")
    ) {
      try {
        await accounts.deleteStaff(staffId);
        staffRefresh();
        showSnackbar("Staff member deleted successfully");
      } catch (err) {
        console.error("Error:", err);
        showSnackbar("Error deleting staff member", "error");
      }
    }
  };

  const canManageVendor =
    userProfile?.role === "owner" || userProfile?.role === "admin";
  const canManageStaff = ["owner", "admin", "manager"].includes(
    userProfile?.role
  );

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "60vh",
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
            backgroundClip: "text",
            textFillColor: "transparent",
            mb: 1,
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
          overflow: "hidden",
          border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
        }}
      >
        <Tabs
          value={currentTab}
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{
            borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
            "& .MuiTab-root": {
              minHeight: 72,
              textTransform: "none",
              fontSize: "1rem",
              fontWeight: 500,
            },
          }}
        >
          <Tab
            icon={<Person sx={{ mb: 1 }} />}
            label="Profile"
            sx={{ flexDirection: "column" }}
          />
          <Tab
            icon={<Business sx={{ mb: 1 }} />}
            label="Business"
            disabled={!canManageVendor}
            sx={{ flexDirection: "column" }}
          />
          <Tab
            icon={<People sx={{ mb: 1 }} />}
            label="Staff"
            disabled={!canManageStaff}
            sx={{ flexDirection: "column" }}
          />
          <Tab
            icon={<Lock sx={{ mb: 1 }} />}
            label="Security"
            sx={{ flexDirection: "column" }}
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
          {!staffLoading && (
            <StaffTab
              userProfile={userProfile}
              staffMembers={staffMembers}
              canManageStaff={canManageStaff}
              onCreateStaff={handleCreateStaff}
              onUpdateStaff={handleUpdateStaff}
              onDeleteStaff={handleDeleteStaff}
              onActivateStaff={onActivateStaff}
              loading={loading}
            />
          )}
        </TabPanel>

        <TabPanel value={currentTab} index={3}>
          <SecurityTab
            onPasswordChange={handlePasswordChange}
            loading={loading}
          />
        </TabPanel>
      </Paper>

      <CustomSnackbar
        open={snackbar.open}
        severity={snackbar.severity}
        message={snackbar.message}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      />
    </Container>
  );
}

export default Profile;
