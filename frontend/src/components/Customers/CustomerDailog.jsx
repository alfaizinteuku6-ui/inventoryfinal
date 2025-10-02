import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  TextField,
  Typography,
  Grid,
  Paper,
  Avatar,
  Chip,
  MenuItem,
  IconButton,
  InputAdornment,
  CircularProgress,
  Divider,
} from "@mui/material";
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Business as BusinessIcon,
  Close as CloseIcon,
  Save as SaveIcon,
  PersonAdd as PersonAddIcon,
  Edit as EditIcon,
  Home as HomeIcon,
} from "@mui/icons-material";
import { customers } from "../../services/api";

const CustomerDialog = ({ open, onClose, editingCustomer, mutate }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    customer_type: "individual",
  });

  const customerTypes = [
    { value: "individual", label: "Individual Customer", color: "primary" },
    { value: "business", label: "Business Customer", color: "warning" },
  ];

  useEffect(() => {
    if (editingCustomer) {
      setFormData(editingCustomer);
    } else {
      setFormData({
        name: "",
        email: "",
        phone: "",
        address: "",
        customer_type: "individual",
      });
    }
    setErrors({});
  }, [editingCustomer, open]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Enter a valid email";
    if (!formData.phone.trim()) newErrors.phone = "Phone is required";
    else if (!/^\+?[\d\s\-\(\)]+$/.test(formData.phone))
      newErrors.phone = "Invalid phone number";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);
    try {
      if (editingCustomer) {
        await customers.update(editingCustomer.id, formData);
      } else {
        await customers.create(formData);
      }
      mutate();
      setIsSubmitting(false);
      onClose();
    } catch (err) {
      console.error("Error:", err);
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field) => (e) => {
    setFormData({ ...formData, [field]: e.target.value });
    if (errors[field]) setErrors({ ...errors, [field]: "" });
  };

  const getInitials = (name) =>
    name
      ? name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
      : "";

  if (!open) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{ sx: { borderRadius: 3, minHeight: 600 } }}
    >
      {/* Header */}
      <DialogTitle sx={{ p: 0 }}>
        <Paper
          elevation={0}
          sx={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
            p: 3,
            borderRadius: "12px 12px 0 0",
          }}
        >
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
          >
            <Box display="flex" alignItems="center" gap={2}>
              <Avatar
                sx={{ bgcolor: "rgba(255,255,255,0.2)", width: 56, height: 56 }}
              >
                {editingCustomer ? <EditIcon /> : <PersonAddIcon />}
              </Avatar>
              <Box>
                <Typography variant="h5" fontWeight="bold">
                  {editingCustomer ? "Edit Customer" : "Add New Customer"}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  {editingCustomer
                    ? "Update customer details"
                    : "Create a new profile"}
                </Typography>
              </Box>
            </Box>
            <IconButton onClick={onClose} sx={{ color: "white" }}>
              <CloseIcon />
            </IconButton>
          </Box>
        </Paper>
      </DialogTitle>

      {/* Body */}
      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ p: 3 }}>
          {/* Preview Card */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              mb: 3,
              bgcolor: "grey.50",
              borderRadius: 2,
              border: "2px dashed",
              borderColor: "primary.light",
            }}
          >
            <Box display="flex" alignItems="center" gap={3}>
              <Avatar
                sx={{
                  bgcolor: "primary.main",
                  width: 80,
                  height: 80,
                  fontSize: "2rem",
                }}
              >
                {formData.name ? (
                  getInitials(formData.name)
                ) : (
                  <PersonIcon fontSize="large" />
                )}
              </Avatar>
              <Box flex={1}>
                <Typography variant="h6" fontWeight="bold">
                  {formData.name || "Customer Name"}
                </Typography>
                <Box display="flex" gap={2} mt={1}>
                  <Chip
                    label={
                      customerTypes.find(
                        (t) => t.value === formData.customer_type
                      )?.label || "Individual Customer"
                    }
                    color={
                      customerTypes.find(
                        (t) => t.value === formData.customer_type
                      )?.color || "primary"
                    }
                    variant="outlined"
                    size="small"
                  />
                  {formData.company && (
                    <Chip
                      icon={<BusinessIcon fontSize="small" />}
                      label={formData.company}
                      variant="outlined"
                      size="small"
                    />
                  )}
                </Box>
              </Box>
            </Box>
          </Paper>

          {/* Section: Basic Info */}
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            Basic Information
          </Typography>
          <Grid container spacing={3} mb={3}>
            <Grid size={{ xs: 12, md: 8 }}>
              <TextField
                label="Full Name"
                fullWidth
                value={formData.name}
                onChange={handleInputChange("name")}
                required
                error={!!errors.name}
                helperText={errors.name}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                select
                label="Customer Type"
                fullWidth
                value={formData?.customer_type}
                onChange={handleInputChange("customer_type")}
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
              >
                {" "}
                {customerTypes.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    {" "}
                    <Box display="flex" alignItems="center" gap={1}>
                      {" "}
                      <Chip
                        label={type.label}
                        color={type.color}
                        size="small"
                        variant="outlined"
                      />{" "}
                    </Box>{" "}
                  </MenuItem>
                ))}{" "}
              </TextField>
            </Grid>
          </Grid>

          <Divider sx={{ my: 2 }} />

          {/* Section: Contact Info */}
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            Contact & Address
          </Typography>
          <Grid container spacing={3} mb={3}>
            <Grid Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="Email"
                type="email"
                fullWidth
                value={formData.email}
                onChange={handleInputChange("email")}
                error={!!errors.email}
                helperText={errors.email}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="Phone"
                fullWidth
                value={formData.phone}
                onChange={handleInputChange("phone")}
                required
                error={!!errors.phone}
                helperText={errors.phone}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PhoneIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                label="Address"
                fullWidth
                multiline
                rows={2}
                value={formData.address}
                onChange={handleInputChange("address")}
                InputProps={{
                  startAdornment: (
                    <InputAdornment
                      position="start"
                      sx={{ alignSelf: "flex-start", mt: 1 }}
                    >
                      <HomeIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>

        {/* Footer */}
        <DialogActions sx={{ p: 3 }}>
          <Box display="flex" justifyContent="flex-end" gap={2} width="100%">
            <Button
              onClick={onClose}
              disabled={isSubmitting}
              variant="outlined"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={isSubmitting}
              startIcon={
                isSubmitting ? <CircularProgress size={20} /> : <SaveIcon />
              }
              sx={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              }}
            >
              {isSubmitting
                ? "Saving..."
                : editingCustomer
                ? "Update Customer"
                : "Create Customer"}
            </Button>
          </Box>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default CustomerDialog;
