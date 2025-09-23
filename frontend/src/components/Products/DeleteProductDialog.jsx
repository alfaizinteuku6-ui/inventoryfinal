import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from "@mui/material";

const DeleteProductDialog = ({
  open,
  selectedProduct,
  onCancel,
  onConfirm,
}) => {
  return (
    <Dialog
      open={open}
      onClose={onCancel}
      PaperProps={{
        sx: { borderRadius: 3 },
      }}
    >
      <DialogTitle>Delete Product</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Are you sure you want to delete "{selectedProduct?.name}"? This
          action cannot be undone.
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button onClick={onCancel} sx={{ borderRadius: 2 }}>
          Cancel
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          color="error"
          sx={{ borderRadius: 2 }}
        >
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteProductDialog;