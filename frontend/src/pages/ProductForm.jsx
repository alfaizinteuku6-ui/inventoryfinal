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
} from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";
import { products } from "../services/api";
import { useCategories, useProduct } from "../hooks/useSWR";
import CategoryDialog from "../components/CategoryDialog";
import HeaderCard from "../components/HeaderCard";
const ProductForm = () => {
  const { id } = useParams();
  const { data: product, mutate: productMutate, isLoading } = useProduct(id);

  const { data: categories, mutate } = useCategories();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    description: "",
    stock_quantity: 0,
    selling_price: "",
    cost_price: "",
    low_stock_threshold: 0,
    max_stock_threshold: 0,
    weight: "0.00",
    category: "",
    image: null,
  });

  const [imagePreview, setImagePreview] = useState(null);
  const [error, setError] = useState(null);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);

  // Add handler for new category creation
  const handleCategorySuccess = (newCategory) => {
    setFormData({
      ...formData,
      category: newCategory.id,
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, image: file });
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
    setFormData({ ...formData, image: null });
    setImagePreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const formDataToSend = new FormData();

      // Handle file upload
      if (formData.image instanceof File) {
        formDataToSend.append("image", formData.image);
      }

      // Handle numeric fields
      const numericFields = {
        selling_price: parseFloat,
        cost_price: parseFloat,
        weight: parseFloat,
        stock_quantity: parseInt,
        low_stock_threshold: parseInt,
      };

      Object.keys(formData).forEach((key) => {
        if (key === "image") return; // Skip image as it's handled above

        if (key in numericFields) {
          const value = numericFields[key](formData[key]) || 0;
          formDataToSend.append(key, value.toString());
        } else {
          formDataToSend.append(key, formData[key] || "");
        }
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
    setFormData({
      ...product,
      selling_price: parseFloat(product?.selling_price).toFixed(2),
      cost_price: parseFloat(product?.cost_price).toFixed(2),
    });
    if (product?.image) {
      setImagePreview(product.image);
    }
  }, [product]);

  const profitMargin =
    formData.selling_price && formData.cost_price
      ? (
          ((formData.selling_price - formData.cost_price) /
            formData.selling_price) *
          100
        ).toFixed(1)
      : 0;

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", p: 3 }}>
      {/* Header Section */}
      <HeaderCard
        icon={<InventoryIcon fontSize="large" />}
        title={id ? "Update Existing Product" : "Add New Product"}
        subtitle="Create and manage your inventory items"
      />

      {error && (
        <Fade in={Boolean(error)}>
          <Alert
            severity="error"
            sx={{ mb: 3, borderRadius: 2 }}
            onClose={() => setError(null)}
          >
            {error}
          </Alert>
        </Fade>
      )}

      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          {/* Product Image Section */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Card sx={{ height: "fit-content", borderRadius: 2 }}>
              <CardContent>
                <Typography
                  variant="h6"
                  gutterBottom
                  display="flex"
                  alignItems="center"
                  gap={1}
                >
                  <UploadIcon /> Product Image
                </Typography>

                <Box
                  sx={{
                    border: "2px dashed #e0e7ff",
                    borderRadius: 2,
                    p: 3,
                    textAlign: "center",
                    backgroundColor: imagePreview ? "transparent" : "#f8fafc",
                    position: "relative",
                    minHeight: 200,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexDirection: "column",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      borderColor: "#667eea",
                      backgroundColor: imagePreview ? "transparent" : "#f1f5f9",
                    },
                  }}
                  onClick={() =>
                    !imagePreview &&
                    document.getElementById("product-image").click()
                  }
                >
                  {imagePreview ? (
                    <Box sx={{ position: "relative", width: "100%" }}>
                      <img
                        src={imagePreview}
                        alt="Product preview"
                        style={{
                          width: "100%",
                          height: "200px",
                          objectFit: "cover",
                          borderRadius: 8,
                        }}
                      />
                      <IconButton
                        onClick={handleRemoveImage}
                        sx={{
                          position: "absolute",
                          top: 8,
                          right: 8,
                          backgroundColor: "rgba(255,255,255,0.9)",
                          "&:hover": { backgroundColor: "rgba(255,255,255,1)" },
                        }}
                        size="small"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  ) : (
                    <>
                      <UploadIcon
                        sx={{ fontSize: 48, color: "#94a3b8", mb: 1 }}
                      />
                      <Typography variant="body1" color="textSecondary">
                        Click to upload image
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        PNG, JPG up to 5MB
                      </Typography>
                    </>
                  )}
                </Box>

                <input
                  accept="image/*"
                  style={{ display: "none" }}
                  id="product-image"
                  type="file"
                  onChange={handleImageChange}
                />

                {!imagePreview && (
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<UploadIcon />}
                    onClick={() =>
                      document.getElementById("product-image").click()
                    }
                    sx={{ mt: 2, borderRadius: 2 }}
                  >
                    Choose Image
                  </Button>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Product Details Section */}
          <Grid size={{ xs: 12, md: 8 }}>
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
                  <Grid size={{ xs: 12, md: 8 }}>
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
                  <Grid size={{ xs: 12, md: 4 }}>
                    <TextField
                      label="SKU"
                      fullWidth
                      value={formData.sku}
                      onChange={(e) =>
                        setFormData({ ...formData, sku: e.target.value })
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
                          <InputAdornment position="start">₹</InputAdornment>
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
                          <InputAdornment position="start">₹</InputAdornment>
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
                      value={formData.low_stock_threshold}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          low_stock_threshold: parseInt(e.target.value) || 0,
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
                      value={formData.max_stock_threshold}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          max_stock_threshold: parseInt(e.target.value) || 0,
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
