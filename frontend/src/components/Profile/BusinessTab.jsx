import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  useTheme,
  alpha,
  Stack,
  Avatar,
} from "@mui/material";
import { Edit, Save, Cancel, Upload } from "@mui/icons-material";

function BusinessTab({ vendorDetails, onUpdate, canManageVendor, loading }) {
  const [vendorForm, setVendorForm] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [logoPreview, setLogoPreview] = useState(null);
  const theme = useTheme();

  useEffect(() => {
    if (vendorDetails) {
      setVendorForm(vendorDetails);
      setLogoPreview(vendorDetails.logo || null);
    }
  }, [vendorDetails]);

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setVendorForm({ ...vendorForm, logo: file });
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    await onUpdate(vendorForm);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setVendorForm(vendorDetails);
    setLogoPreview(vendorDetails.logo || null);
    setIsEditing(false);
  };

  if (!canManageVendor) {
    return (
      <Alert severity="warning" sx={{ borderRadius: 3 }}>
        You don't have permission to manage business details.
      </Alert>
    );
  }

  return (
    <Card>
      <CardContent sx={{ p: 4 }}>
        {/* Header Section */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 4,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            {/* Business Logo */}
            <Avatar
              src={logoPreview}
              alt="Business Logo"
              sx={{
                width: 64,
                height: 64,
                borderRadius: 2,
                border: `2px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                backgroundColor: alpha(theme.palette.primary.main, 0.05),
                objectFit: "cover",
              }}
            />
            <Box>
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                Business Information
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Manage your business details and settings
              </Typography>
            </Box>
          </Box>

          {/* Action Buttons */}
          {!isEditing ? (
            <Button
              variant="contained"
              startIcon={<Edit />}
              onClick={() => setIsEditing(true)}
              sx={{ borderRadius: 3 }}
            >
              Edit Business
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

        {/* Logo Upload (only in edit mode) */}
        {isEditing && (
          <Box sx={{ mb: 3 }}>
            <Button
              variant="outlined"
              component="label"
              startIcon={<Upload />}
              sx={{ borderRadius: 3 }}
            >
              Upload Logo
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={handleLogoChange}
              />
            </Button>
            {logoPreview && (
              <Box sx={{ mt: 2 }}>
                <Avatar
                  src={logoPreview}
                  alt="Logo Preview"
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: 2,
                    objectFit: "cover",
                  }}
                />
              </Box>
            )}
          </Box>
        )}

        {/* Form Fields */}
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Business Name"
              value={vendorForm.name || ""}
              onChange={(e) =>
                setVendorForm({ ...vendorForm, name: e.target.value })
              }
              disabled={!isEditing}
              variant={isEditing ? "outlined" : "filled"}
              sx={{
                "& .MuiFilledInput-root": {
                  backgroundColor: alpha(theme.palette.primary.main, 0.05),
                },
              }}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormControl
              fullWidth
              disabled={!isEditing}
              variant={isEditing ? "outlined" : "filled"}
            >
              <InputLabel>Business Type</InputLabel>
              <Select
                value={vendorForm.business_type || ""}
                onChange={(e) =>
                  setVendorForm({
                    ...vendorForm,
                    business_type: e.target.value,
                  })
                }
                sx={{
                  "& .MuiFilledInput-root": {
                    backgroundColor: alpha(theme.palette.primary.main, 0.05),
                  },
                }}
              >
                <MenuItem value="retail">🏪 Retail Store</MenuItem>
                <MenuItem value="restaurant">🍽️ Restaurant</MenuItem>
                <MenuItem value="service">🔧 Service Provider</MenuItem>
                <MenuItem value="wholesale">📦 Wholesale</MenuItem>
                <MenuItem value="other">🏢 Other</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Contact Person"
              value={vendorForm.contact_person || ""}
              onChange={(e) =>
                setVendorForm({ ...vendorForm, contact_person: e.target.value })
              }
              disabled={!isEditing}
              variant={isEditing ? "outlined" : "filled"}
              sx={{
                "& .MuiFilledInput-root": {
                  backgroundColor: alpha(theme.palette.primary.main, 0.05),
                },
              }}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={vendorForm.email || ""}
              onChange={(e) =>
                setVendorForm({ ...vendorForm, email: e.target.value })
              }
              disabled={!isEditing}
              variant={isEditing ? "outlined" : "filled"}
              sx={{
                "& .MuiFilledInput-root": {
                  backgroundColor: alpha(theme.palette.primary.main, 0.05),
                },
              }}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Phone"
              value={vendorForm.phone || ""}
              onChange={(e) =>
                setVendorForm({ ...vendorForm, phone: e.target.value })
              }
              disabled={!isEditing}
              variant={isEditing ? "outlined" : "filled"}
              sx={{
                "& .MuiFilledInput-root": {
                  backgroundColor: alpha(theme.palette.primary.main, 0.05),
                },
              }}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Business Tagline"
              value={vendorForm.tagline || ""}
              onChange={(e) =>
                setVendorForm({ ...vendorForm, tagline: e.target.value })
              }
              disabled={!isEditing}
              variant={isEditing ? "outlined" : "filled"}
              sx={{
                "& .MuiFilledInput-root": {
                  backgroundColor: alpha(theme.palette.primary.main, 0.05),
                },
              }}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Website URL"
              type="url"
              value={vendorForm.website || ""}
              onChange={(e) =>
                setVendorForm({ ...vendorForm, website: e.target.value })
              }
              disabled={!isEditing}
              variant={isEditing ? "outlined" : "filled"}
              sx={{
                "& .MuiFilledInput-root": {
                  backgroundColor: alpha(theme.palette.primary.main, 0.05),
                },
              }}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="GST Number"
              value={vendorForm.gstin || ""}
              onChange={(e) =>
                setVendorForm({ ...vendorForm, gstin: e.target.value })
              }
              disabled={!isEditing}
              variant={isEditing ? "outlined" : "filled"}
              sx={{
                "& .MuiFilledInput-root": {
                  backgroundColor: alpha(theme.palette.primary.main, 0.05),
                },
              }}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="PAN Number"
              value={vendorForm.pan_number || ""}
              onChange={(e) =>
                setVendorForm({ ...vendorForm, pan_number: e.target.value })
              }
              disabled={!isEditing}
              variant={isEditing ? "outlined" : "filled"}
              sx={{
                "& .MuiFilledInput-root": {
                  backgroundColor: alpha(theme.palette.primary.main, 0.05),
                },
              }}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Payment Terms"
              value={vendorForm.payment_terms || ""}
              onChange={(e) =>
                setVendorForm({ ...vendorForm, payment_terms: e.target.value })
              }
              disabled={!isEditing}
              variant={isEditing ? "outlined" : "filled"}
              sx={{
                "& .MuiFilledInput-root": {
                  backgroundColor: alpha(theme.palette.primary.main, 0.05),
                },
              }}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Credit Limit"
              type="number"
              value={vendorForm.credit_limit || ""}
              onChange={(e) =>
                setVendorForm({ ...vendorForm, credit_limit: e.target.value })
              }
              disabled={!isEditing}
              variant={isEditing ? "outlined" : "filled"}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">₹</InputAdornment>
                ),
              }}
              sx={{
                "& .MuiFilledInput-root": {
                  backgroundColor: alpha(theme.palette.primary.main, 0.05),
                },
              }}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Tax Rate"
              type="number"
              value={vendorForm.tax_rate || ""}
              onChange={(e) =>
                setVendorForm({ ...vendorForm, tax_rate: e.target.value })
              }
              disabled={!isEditing}
              variant={isEditing ? "outlined" : "filled"}
              InputProps={{
                endAdornment: <InputAdornment position="end">%</InputAdornment>,
              }}
              sx={{
                "& .MuiFilledInput-root": {
                  backgroundColor: alpha(theme.palette.primary.main, 0.05),
                },
              }}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              label="Business Address"
              multiline
              rows={3}
              value={vendorForm.address || ""}
              onChange={(e) =>
                setVendorForm({ ...vendorForm, address: e.target.value })
              }
              disabled={!isEditing}
              variant={isEditing ? "outlined" : "filled"}
              sx={{
                "& .MuiFilledInput-root": {
                  backgroundColor: alpha(theme.palette.primary.main, 0.05),
                },
              }}
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}

export default BusinessTab;
