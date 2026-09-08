import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  TextField,
  Typography,
  MenuItem,
  Alert,
  Avatar,
  Chip,
  Paper,
  InputAdornment,
  IconButton,
  Fade,
  Tooltip,
  ImageList,
  ImageListItem,
  ImageListItemBar,
  useTheme,
} from "@mui/material";
import {
  Add as AddIcon,
  CloudUpload as UploadIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Inventory as InventoryIcon,
  AttachMoney as MoneyIcon,
  Scale as WeightIcon,
  Category as CategoryIcon,
  Info as InfoIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";
import { products } from "../services/api";
import { useCategories, useProduct } from "../hooks/useSWR";
import CategoryDialog from "../components/CategoryDialog";
import HeaderCard from "../components/HeaderCard";
import CustomSnackbar from "../components/CustomSnackbar";

const ProductForm = () => {
  const { id } = useParams();
  const theme = useTheme();
  const { data: product, mutate: productMutate, isLoading } = useProduct(id);

  const { data: categories, mutate } = useCategories();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    stock_quantity: 0,
    selling_price: "",
    cost_price: "",
    max_stock_level: 0,
    min_stock_level: 0,
    weight: "0.00",
    category: "",
    is_active: true,
  });

  const [selectedImages, setSelectedImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [error, setError] = useState(null);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);

  // Add handler for new category creation
  const handleCategorySuccess = (newCategory) => {
    setFormData({
      ...formData,
      category: newCategory.id,
    });
  };

  const handleImagesChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setSelectedImages([...selectedImages, ...files]);
      
      // Create preview URLs for new images
      const newPreviews = files.map(file => ({
        url: URL.createObjectURL(file),
        isNew: true,
        file: file
      }));
      setImagePreviews([...imagePreviews, ...newPreviews]);
    }
  };

  const handleRemoveImage = (index) => {
    const newSelectedImages = selectedImages.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    
    // Revoke object URL to prevent memory leak
    URL.revokeObjectURL(imagePreviews[index].url);
    
    setSelectedImages(newSelectedImages);
    setImagePreviews(newPreviews);
  };

  const handleRemoveExistingImage = async (imageId, index) => {
    if (id) {
      try {
        await products.deleteImage(id, imageId);
        const newExistingImages = existingImages.filter((_, i) => i !== index);
        setExistingImages(newExistingImages);
      } catch (error) {
        console.error("Error deleting image:", error);
        setError("Failed to delete image");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const formDataToSend = new FormData();

      // Handle numeric fields
      const numericFields = {
        selling_price: parseFloat,
        cost_price: parseFloat,
        weight: parseFloat,
        stock_quantity: parseInt,
        min_stock_level: parseInt,
        max_stock_level: parseInt,
      };

      Object.keys(formData).forEach((key) => {
        if (key in numericFields) {
          const value = numericFields[key](formData[key]) || 0;
          formDataToSend.append(key, value.toString());
        } else {
          formDataToSend.append(key, formData[key] || "");
        }
      });

      // Append multiple images
      selectedImages.forEach((image) => {
        formDataToSend.append("images", image);
      });

      if (id) {
        await products.update(id, formDataToSend);
      } else {
        await products.create(formDataToSend);
      }
      
      productMutate();
      navigate("/products");
    } catch (error) {
      const errorMessage = error.response?.data
        ? Object.entries(error.response.data)
            .map(([key, value]) => `${key}: ${value}`)
            .join(", ")
        : "Error saving product";
      setError(errorMessage);
      console.error("Error saving product:", error);
    }
  };

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || "",
        description: product.description || "",
        stock_quantity: product.stock_quantity || 0,
        selling_price: parseFloat(product.selling_price || 0).toFixed(2),
        cost_price: parseFloat(product.cost_price || 0).toFixed(2),
        max_stock_level: product.max_stock_level || 0,
        min_stock_level: product.min_stock_level || 0,
        weight: product.weight || "0.00",
        category: product.category || "",
        is_active: product.is_active !== undefined ? product.is_active : true,
      });

      // Load existing images if editing
      if (id && product.images) {
        setExistingImages(product.images);
      }
    }
  }, [product, id]);

  // Cleanup preview URLs on unmount
  useEffect(() => {
    return () => {
      imagePreviews.forEach(preview => {
        if (preview.isNew) {
          URL.revokeObjectURL(preview.url);
        }
      });
    };
  }, []);

  const profitMargin =
    formData.selling_price && formData.cost_price
      ? (
          ((formData.selling_price - formData.cost_price) /
            formData.selling_price) *
          100
        ).toFixed(1)
      : 0;

  const allImages = [
    ...existingImages.map(img => ({ url: img.image, isNew: false, id: img.id })),
    ...imagePreviews
  ];

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", p: 3 }}>
      <CustomSnackbar
        open={Boolean(error)}
        severity="error"
        message={error}
        onClose={() => setError(null)}
      />
      
      {/* Header Section */}
      <HeaderCard
        icon={<InventoryIcon fontSize="large" />}
        title={id ? "Update Existing Product" : "Add New Product"}
        subtitle="Create and manage your inventory items"
      />

      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          {/* Product Images Section */}
          <Grid size={{ xs: 12 }}>
            <Card sx={{ borderRadius: 2 }}>
              <CardContent>
                <Typography
                  variant="h6"
                  gutterBottom
                  display="flex"
                  alignItems="center"
                  gap={1}
                >
                  <UploadIcon /> Product Images
                </Typography>

                <Box
                  sx={{
                    border: `2px dashed ${theme.palette.divider}`,
                    borderRadius: 2,
                    p: 3,
                    textAlign: "center",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      borderColor: theme.palette.primary.main,
                    }
                  }}
                  onClick={() =>
                    document.getElementById("product-images").click()
                  }
                >
                  <UploadIcon sx={{ fontSize: 48, color: "#94a3b8", mb: 1 }} />
                  <Typography variant="body1" color="textSecondary">
                    Click to upload images or drag and drop
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    PNG, JPG up to 5MB each (Multiple images allowed)
                  </Typography>
                </Box>

                <input
                  accept="image/*"
                  style={{ display: "none" }}
                  id="product-images"
                  type="file"
                  multiple
                  onChange={handleImagesChange}
                />

                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<UploadIcon />}
                  onClick={() =>
                    document.getElementById("product-images").click()
                  }
                  sx={{ mt: 2, borderRadius: 2 }}
                >
                  Add More Images
                </Button>

                {allImages.length > 0 && (
                  <Box sx={{ mt: 3 }}>
                    <ImageList cols={4} gap={16}>
                      {allImages.map((img, index) => (
                        <ImageListItem key={index} sx={{ position: "relative" }}>
                          <img
                            src={img.url}
                            alt={`Product ${index + 1}`}
                            loading="lazy"
                            style={{
                              height: 200,
                              objectFit: "cover",
                              borderRadius: 8,
                            }}
                          />
                          <ImageListItemBar
                            sx={{
                              background:
                                "linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 70%, rgba(0,0,0,0) 100%)",
                            }}
                            position="top"
                            actionIcon={
                              <IconButton
                                sx={{ color: "white" }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (img.isNew) {
                                    const newImageIndex = imagePreviews.findIndex(
                                      p => p.url === img.url
                                    );
                                    handleRemoveImage(newImageIndex);
                                  } else {
                                    const existingImageIndex = existingImages.findIndex(
                                      ei => ei.id === img.id
                                    );
                                    handleRemoveExistingImage(img.id, existingImageIndex);
                                  }
                                }}
                              >
                                <CloseIcon />
                              </IconButton>
                            }
                          />
                          {img.isNew && (
                            <Chip
                              label="New"
                              size="small"
                              color="primary"
                              sx={{
                                position: "absolute",
                                bottom: 8,
                                left: 8,
                              }}
                            />
                          )}
                        </ImageListItem>
                      ))}
                    </ImageList>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Product Details Section */}
          <Grid size={{ xs: 12 }}>
            <Card sx={{ borderRadius: 2 }}>
              <CardContent>
                <Typography
                  variant="h6"
                  gutterBottom
                  display="flex"
                  alignItems="center"
                  gap={1}
                >
                  <InfoIcon /> Basic Information
                </Typography>

                <Grid container spacing={2}>
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      label="Product Name"
                      fullWidth
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      required
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 2,
                        },
                      }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      label="Description"
                      fullWidth
                      multiline
                      rows={5}
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 2,
                        },
                      }}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Pricing Section */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Card sx={{ borderRadius: 2, height: "100%" }}>
              <CardContent>
                <Typography
                  variant="h6"
                  gutterBottom
                  display="flex"
                  alignItems="center"
                  gap={1}
                >
                  <MoneyIcon /> Pricing Information
                </Typography>

                <Grid container spacing={2}>
                  <Grid size={{ xs: 6 }}>
                    <TextField
                      label="Cost Price"
                      type="number"
                      fullWidth
                      value={formData.cost_price}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          cost_price: parseFloat(e.target.value) || 0,
                        })
                      }
                      required
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">Rp</InputAdornment>
                        ),
                      }}
                      inputProps={{ min: 0, step: "0.01" }}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 2,
                        },
                      }}
                    />
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <TextField
                      label="Selling Price"
                      type="number"
                      fullWidth
                      value={formData.selling_price}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          selling_price: parseFloat(e.target.value) || 0,
                        })
                      }
                      required
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">Rp</InputAdornment>
                        ),
                      }}
                      inputProps={{ min: 0, step: "0.01" }}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 2,
                        },
                      }}
                    />
                  </Grid>
                </Grid>

                {profitMargin > 0 && (
                  <Box mt={2}>
                    <Chip
                      label={`Profit Margin: ${profitMargin}%`}
                      color={
                        profitMargin > 20
                          ? "success"
                          : profitMargin > 10
                          ? "warning"
                          : "error"
                      }
                      variant="outlined"
                    />
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Inventory Section */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Card sx={{ borderRadius: 2, height: "100%" }}>
              <CardContent>
                <Typography
                  variant="h6"
                  gutterBottom
                  display="flex"
                  alignItems="center"
                  gap={1}
                >
                  <InventoryIcon /> Inventory Management
                </Typography>

                <Grid container spacing={2}>
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      label="Current Stock"
                      type="number"
                      fullWidth
                      value={formData.stock_quantity}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          stock_quantity: parseInt(e.target.value) || 0,
                        })
                      }
                      required
                      inputProps={{ min: 0 }}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 2,
                        },
                      }}
                    />
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <TextField
                      label="Low Stock Alert"
                      type="number"
                      fullWidth
                      value={formData.min_stock_level}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          min_stock_level: parseInt(e.target.value) || 0,
                        })
                      }
                      inputProps={{ min: 0 }}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 2,
                        },
                      }}
                    />
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <TextField
                      label="Max Stock Level"
                      type="number"
                      fullWidth
                      value={formData.max_stock_level}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          max_stock_level: parseInt(e.target.value) || 0,
                        })
                      }
                      inputProps={{ min: 0 }}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 2,
                        },
                      }}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Category and Weight Section */}
          <Grid size={{ xs: 12 }}>
            <Card sx={{ borderRadius: 2 }}>
              <CardContent>
                <Typography
                  variant="h6"
                  gutterBottom
                  display="flex"
                  alignItems="center"
                  gap={1}
                >
                  <CategoryIcon /> Category & Specifications
                </Typography>

                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, md: 8 }}>
                    <Box display="flex" gap={1}>
                      <TextField
                        select
                        label="Category"
                        fullWidth
                        value={formData.category}
                        onChange={(e) =>
                          setFormData({ ...formData, category: e.target.value })
                        }
                        required
                        sx={{
                          minWidth: 250,
                          "& .MuiOutlinedInput-root": {
                            borderRadius: 2,
                          },
                        }}
                      >
                        <MenuItem value="">Select Category</MenuItem>
                        {categories?.results?.map((category) => (
                          <MenuItem key={category.id} value={category.id}>
                            {category.name}
                          </MenuItem>
                        ))}
                      </TextField>
                      <Tooltip title="Add New Category">
                        <Button
                          variant="outlined"
                          onClick={() => setCategoryDialogOpen(true)}
                          sx={{
                            minWidth: 56,
                            height: 56,
                            borderRadius: 2,
                          }}
                        >
                          <AddIcon />
                        </Button>
                      </Tooltip>
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <TextField
                      label="Weight"
                      type="number"
                      fullWidth
                      value={formData.weight}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          weight: parseFloat(e.target.value) || 0,
                        })
                      }
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <WeightIcon fontSize="small" />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">kg</InputAdornment>
                        ),
                      }}
                      inputProps={{ min: 0, step: "0.01" }}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 2,
                        },
                      }}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Action Buttons */}
          <Grid size={{ xs: 12 }}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 2,
              }}
            >
              <Box display="flex" justifyContent="flex-end" gap={2}>
                <Button
                  variant="outlined"
                  size="large"
                  startIcon={<CancelIcon />}
                  onClick={() => navigate("/products")}
                  sx={{
                    borderRadius: 2,
                    px: 4,
                    py: 1.5,
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  startIcon={<SaveIcon />}
                  sx={{
                    borderRadius: 2,
                    px: 4,
                    py: 1.5,
                    background:
                      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    "&:hover": {
                      background:
                        "linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)",
                    },
                  }}
                >
                  {id ? "Update" : "Create"} Product
                </Button>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </form>
      <CategoryDialog
        open={categoryDialogOpen}
        onClose={() => setCategoryDialogOpen(false)}
        onSuccess={handleCategorySuccess}
        mutate={mutate}
      />
    </Box>
  );
};

export default ProductForm;
