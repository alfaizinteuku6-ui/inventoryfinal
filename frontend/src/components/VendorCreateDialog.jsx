import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
} from "@mui/material";
import { vendors } from "../services/api";
import BusinessTab from "./Profile/BusinessTab";

const VendorCreateDialog = ({ 
  open, 
  onClose, 
  vendorDetails, 
  mutate, 
  canManageVendor, 
  setSnackbar 
}) => {

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCreateVendor = async (vendorData) => {
    try {
      const formVendorData = new FormData();
      
      // Append all vendor data to FormData
      for (const key in vendorData) {
        // Skip undefined/null values and the id field for creation
        if (vendorData[key] !== undefined && vendorData[key] !== null && key !== 'id') {
          // Handle file uploads (logo)
          if (vendorData[key] instanceof File) {
            formVendorData.append(key, vendorData[key]);
          } else {
            formVendorData.append(key, vendorData[key]);
          }
        }
      }
      
      // Determine if we're creating or updating
      if (vendorDetails?.id) {
        // Update existing vendor
        await vendors.update(vendorDetails.id, formVendorData);
        showSnackbar("Business details updated successfully");
      } else {
        // Create new vendor
        await vendors.create(formVendorData);
        showSnackbar("Business created successfully");
      }
      
      // Refresh vendor data
      mutate();
      
      // Close dialog after successful operation
      onClose();
    } catch (error) {
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.message || 
                          "Error saving business details";
      showSnackbar(errorMessage, "error");
      console.error("Vendor operation error:", error);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
      disableEscapeKeyDown={!vendorDetails?.id} // Prevent closing if no vendor exists
    >
      <DialogTitle>
        {vendorDetails?.id ? "Update Your Business Info" : "Create Your Business"}
      </DialogTitle>
      <DialogContent>
        {!vendorDetails?.id && (
          <DialogContentText sx={{ mb: 2 }}>
            Please set up your business information to get started. This information
            will be used across your store for invoices, receipts, and customer communications.
          </DialogContentText>
        )}
        <BusinessTab
          vendorDetails={vendorDetails}
          onUpdate={handleCreateVendor}
          canManageVendor={canManageVendor || !vendorDetails?.id} // Allow creation if no vendor exists
          loading={false}
        />
      </DialogContent>
    </Dialog>
  );
};

export default VendorCreateDialog;