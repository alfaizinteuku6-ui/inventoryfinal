import React from "react";
import {
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from "@mui/material";
import {
  Visibility,
  Edit,
  Delete,
  ContentCopy,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

const ProductContextMenu = ({
  anchorEl,
  selectedProduct,
  onClose,
  onDeleteClick,
}) => {
  const navigate = useNavigate();

  const handleCopySKU = async () => {
    if (selectedProduct?.sku) {
      try {
        await navigator.clipboard.writeText(selectedProduct.sku);
      } catch (error) {
        console.error("Failed to copy SKU:", error);
      }
    }
    onClose();
  };

  return (
    <Menu
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      onClose={onClose}
      PaperProps={{
        elevation: 3,
        sx: {
          borderRadius: 2,
          minWidth: 180,
        },
      }}
    >
      <MenuItem onClick={() => navigate(`/products/${selectedProduct?.id}`)}>
        <ListItemIcon>
          <Visibility fontSize="small" />
        </ListItemIcon>
        <ListItemText>View Details</ListItemText>
      </MenuItem>
      <MenuItem
        onClick={() => navigate(`/products/${selectedProduct?.id}/edit`)}
      >
        <ListItemIcon>
          <Edit fontSize="small" />
        </ListItemIcon>
        <ListItemText>Edit Product</ListItemText>
      </MenuItem>
      <MenuItem onClick={handleCopySKU}>
        <ListItemIcon>
          <ContentCopy fontSize="small" />
        </ListItemIcon>
        <ListItemText>Copy SKU</ListItemText>
      </MenuItem>
      <Divider />
      <MenuItem onClick={onDeleteClick} sx={{ color: "error.main" }}>
        <ListItemIcon>
          <Delete fontSize="small" color="error" />
        </ListItemIcon>
        <ListItemText>Delete</ListItemText>
      </MenuItem>
    </Menu>
  );
};

export default ProductContextMenu;