import React, { useState, useMemo } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Grid,
  IconButton,
  Typography,
  Chip,
  Stack,
  TextField,
  InputAdornment,
  Fade,
  Skeleton,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Badge,
  Paper,
  Avatar,
  Divider,
  Fab,
  SpeedDial,
  SpeedDialIcon,
  SpeedDialAction,
  ToggleButton,
  ToggleButtonGroup,
  CardActions,
  ButtonGroup,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  Add,
  Edit,
  Delete,
  Inventory2,
  Search,
  MoreVert,
  Visibility,
  TrendingUp,
  TrendingDown,
  Warning,
  ContentCopy,
  ViewModule,
  ViewList,
  ShoppingCart,
  AttachMoney,
  Category,
  LocalOffer,
  Analytics,
  Refresh,
  Inventory,
  FilterList,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useProducts } from "../hooks/useSWR";
import HeaderCard from "../components/HeaderCard";
import StatsCard from "../components/StatsCard";

const Products = () => {
  // State management
  const theme = useTheme();
  const { data: products, mutate, isLoading, error } = useProducts();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [sortBy, setSortBy] = useState("name");
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    product: null,
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Filtered and searched products
  const filteredProducts = useMemo(() => {
    if (!products?.results) return [];

    let filtered = products.results.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        categoryFilter === "all" || product.category_name === categoryFilter;
      return matchesSearch && matchesCategory;
    });

    // Sort products
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "price":
          return parseFloat(b.selling_price) - parseFloat(a.selling_price);
        case "stock":
          return b.stock_quantity - a.stock_quantity;
        case "category":
          return a.category_name.localeCompare(b.category_name);
        default:
          return 0;
      }
    });

    return filtered;
  }, [products?.results, searchQuery, categoryFilter, sortBy]);

  // Get unique categories
  const categories = useMemo(() => {
    if (!products?.results) return [];
    const cats = [
      ...new Set(products.results.map((p) => p.category_name).filter(Boolean)),
    ];
    return cats.sort();
  }, [products?.results]);

  // Stock status helper
  const getStockStatus = (product) => {
    if (product.stock_quantity === 0)
      return {
        label: "Out of Stock",
        color: "error",
        severity: "high",
        icon: <Warning />,
      };
    if (product.is_low_stock)
      return {
        label: "Low Stock",
        color: "warning",
        severity: "medium",
        icon: <Warning />,
      };
    return { label: "In Stock", color: "success", severity: "low", icon: null };
  };

  // Profit margin calculation
  const getProfitMargin = (product) => {
    return (
      ((product.selling_price - product.cost_price) / product.selling_price) *
      100
    ).toFixed(1);
  };

  // Handle delete with confirmation
  const handleDeleteConfirm = (product) => {
    setDeleteDialog({ open: true, product });
  };

  const handleDelete = async () => {
    const { product } = deleteDialog;
    try {
      setSnackbar({
        open: true,
        message: `Product "${product.name}" deleted successfully`,
        severity: "success",
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Failed to delete product. Please try again.",
        severity: "error",
      });
    } finally {
      setDeleteDialog({ open: false, product: null });
    }
  };

  // Menu handlers
  const handleMenuOpen = (event, product) => {
    setAnchorEl(event.currentTarget);
    setSelectedProduct(product);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedProduct(null);
  };

  // Copy SKU to clipboard
  const handleCopySKU = (sku) => {
    navigator.clipboard.writeText(sku);
    setSnackbar({
      open: true,
      message: "SKU copied to clipboard",
      severity: "success",
    });
  };

  // Speed dial actions
  const speedDialActions = [
    {
      icon: <Add />,
      name: "Add Product",
      onClick: () => navigate("/products/new"),
    },
    {
      icon: <Refresh />,
      name: "Refresh",
      onClick: () => console.log("Refresh"),
    },
    {
      icon: <Analytics />,
      name: "Analytics",
      onClick: () => console.log("Analytics"),
    },
  ];

  // Loading skeleton
  const LoadingSkeleton = () => (
    <Grid container spacing={3}>
      {[...Array(8)].map((_, index) => (
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={index}>
          <Card sx={{ borderRadius: 4, overflow: "hidden" }}>
            <Skeleton variant="rectangular" height={200} />
            <CardContent>
              <Skeleton variant="text" height={32} />
              <Skeleton variant="text" height={24} width="60%" />
              <Box sx={{ display: "flex", gap: 1, my: 1 }}>
                <Skeleton variant="rounded" width={80} height={24} />
                <Skeleton variant="rounded" width={70} height={24} />
              </Box>
              <Skeleton variant="text" height={28} width="40%" />
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  if (error) {
    return (
      <Box width="100%">
        <Alert severity="error" sx={{ mb: 3 }}>
          Failed to load products. Please refresh the page or try again later.
        </Alert>
      </Box>
    );
  }

  const ProductCard = ({ product, index }) => {
    const stockStatus = getStockStatus(product);
    const profitMargin = getProfitMargin(product);

    return (
      <Fade in timeout={300 + index * 100}>
        <Card
          sx={{
            borderRadius: 4,
            boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
            border: "1px solid rgba(0,0,0,0.06)",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            background: "linear-gradient(135deg, #fff 0%, #f8f9ff 100%)",
            overflow: "hidden",
            position: "relative",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            "&:hover": {
              boxShadow: "0 12px 40px rgba(0,0,0,0.15)",
              transform: "translateY(-8px) scale(1.02)",
              "& .product-actions": {
                opacity: 1,
                transform: "translateY(0)",
              },
              "& .product-image": {
                transform: "scale(1.1)",
              },
            },
          }}
        >
          {/* Stock Status Badge */}
          {stockStatus.severity !== "low" && (
            <Chip
              label={stockStatus.label}
              color={stockStatus.color}
              size="small"
              icon={stockStatus.icon}
              sx={{
                position: "absolute",
                top: 12,
                right: 12,
                zIndex: 2,
                fontWeight: 600,
                backdropFilter: "blur(10px)",
                backgroundColor: `${
                  stockStatus.color === "error"
                    ? "rgba(211, 47, 47, 0.9)"
                    : "rgba(237, 108, 2, 0.9)"
                }`,
                color: "white",
                border: "1px solid rgba(255,255,255,0.2)",
              }}
            />
          )}

          {/* Profit Margin Badge */}
          <Chip
            label={`${profitMargin}% margin`}
            size="small"
            sx={{
              position: "absolute",
              top: 12,
              left: 12,
              zIndex: 2,
              fontWeight: 600,
              backgroundColor:
                profitMargin > 20
                  ? "rgba(46, 125, 50, 0.9)"
                  : "rgba(251, 140, 0, 0.9)",
              color: "white",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255,255,255,0.2)",
            }}
          />

          {/* Product Image */}
          <Box sx={{ position: "relative", overflow: "hidden", height: 220 }}>
            {product.image ? (
              <CardMedia
                component="img"
                height="220"
                image={product.image}
                alt={product.name}
                className="product-image"
                sx={{
                  objectFit: "cover",
                  transition: "transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
                  height: "100%",
                  width: "100%",
                }}
              />
            ) : (
              <Box
                height="220px"
                display="flex"
                alignItems="center"
                justifyContent="center"
                sx={{
                  background:
                    "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
                }}
              >
                <Inventory2 sx={{ fontSize: 80, color: "rgba(0,0,0,0.3)" }} />
              </Box>
            )}

            {/* Quick Action Overlay */}
            <Box
              className="product-actions"
              sx={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                background: "linear-gradient(transparent, rgba(0,0,0,0.8))",
                p: 2,
                opacity: 0,
                transform: "translateY(20px)",
                transition: "all 0.3s ease",
                display: "flex",
                gap: 1,
                justifyContent: "center",
              }}
            >
              <Tooltip title="View Details">
                <IconButton
                  onClick={() => navigate(`/products/${product.id}`)}
                  size="small"
                  sx={{
                    bgcolor: "rgba(255,255,255,0.9)",
                    "&:hover": { bgcolor: "white", transform: "scale(1.1)" },
                  }}
                >
                  <Visibility fontSize="small" color="primary" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Edit Product">
                <IconButton
                  onClick={() => navigate(`/products/${product.id}/edit`)}
                  size="small"
                  sx={{
                    bgcolor: "rgba(255,255,255,0.9)",
                    "&:hover": { bgcolor: "white", transform: "scale(1.1)" },
                  }}
                >
                  <Edit fontSize="small" color="primary" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Copy SKU">
                <IconButton
                  size="small"
                  onClick={() => handleCopySKU(product.sku)}
                  sx={{
                    bgcolor: "rgba(255,255,255,0.9)",
                    "&:hover": { bgcolor: "white", transform: "scale(1.1)" },
                  }}
                >
                  <ContentCopy fontSize="small" color="primary" />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          <CardContent
            sx={{ flexGrow: 1, display: "flex", flexDirection: "column", p: 3 }}
          >
            <Stack spacing={2} sx={{ flexGrow: 1 }}>
              {/* Product Name */}
              <Tooltip title={product.name} placement="top">
                <Typography
                  variant="h6"
                  fontWeight="700"
                  sx={{
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    minHeight: "3.2em",
                    lineHeight: 1.6,
                    color: "primary.main",
                  }}
                >
                  {product.name}
                </Typography>
              </Tooltip>

              {/* SKU and Category */}
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                flexWrap="wrap"
              >
                <Chip
                  label={product.sku}
                  size="small"
                  variant="outlined"
                  sx={{
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    color: "text.secondary",
                    borderColor: "rgba(0,0,0,0.12)",
                  }}
                />
                <Chip
                  label={product.category_name || "Uncategorized"}
                  size="small"
                  sx={{
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    backgroundColor: "primary.50",
                    color: "primary.main",
                    border: "1px solid",
                    borderColor: "primary.200",
                  }}
                />
              </Stack>

              {/* Price Section */}
              <Box>
                <Stack direction="row" alignItems="baseline" spacing={1}>
                  <Typography
                    variant="h5"
                    color="primary.main"
                    fontWeight="800"
                    sx={{ fontSize: "1.5rem" }}
                  >
                    ₹{parseFloat(product.selling_price).toLocaleString("en-IN")}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ textDecoration: "line-through", fontSize: "0.9rem" }}
                  >
                    ₹{parseFloat(product.cost_price).toLocaleString("en-IN")}
                  </Typography>
                </Stack>
                <Typography variant="caption" color="text.secondary">
                  Cost: ₹
                  {parseFloat(product.cost_price).toLocaleString("en-IN")}
                </Typography>
              </Box>

              <Divider sx={{ my: 1 }} />

              {/* Stock Information */}
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
              >
                <Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ fontSize: "0.8rem" }}
                  >
                    Stock Quantity
                  </Typography>
                  <Typography
                    variant="h6"
                    fontWeight="700"
                    color={
                      product.stock_quantity === 0
                        ? "error.main"
                        : product.is_low_stock
                        ? "warning.main"
                        : "success.main"
                    }
                  >
                    {product.stock_quantity} units
                  </Typography>
                </Box>

                {stockStatus.severity === "low" && (
                  <Chip
                    label={stockStatus.label}
                    color={stockStatus.color}
                    size="small"
                    icon={stockStatus.icon}
                    sx={{ fontSize: "0.7rem", fontWeight: 600 }}
                  />
                )}
              </Stack>

              {/* Stock Value */}
              <Typography variant="body2" color="text.secondary">
                Stock Value:{" "}
                <strong>
                  ₹
                  {(
                    product.selling_price * product.stock_quantity
                  ).toLocaleString("en-IN")}
                </strong>
              </Typography>
            </Stack>
          </CardContent>

          <CardActions sx={{ p: 3, pt: 0 }}>
            <ButtonGroup variant="outlined" fullWidth size="small">
              <Button
                onClick={() => navigate(`/products/${product.id}`)}
                startIcon={<Visibility />}
              >
                View
              </Button>
              <Button
                onClick={() => navigate(`/products/${product.id}/edit`)}
                startIcon={<Edit />}
              >
                Edit
              </Button>
              <IconButton
                onClick={(e) => handleMenuOpen(e, product)}
                size="small"
              >
                <MoreVert />
              </IconButton>
            </ButtonGroup>
          </CardActions>
        </Card>
      </Fade>
    );
  };

  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "100vh",
        bgcolor: "#f8fafc",
        p: { xs: 2, sm: 3 },
      }}
    >
      {/* Header Section */}
      <HeaderCard
        icon={<Inventory fontSize="large" />}
        title="Products Management"
        subtitle="Manage your Products"
        actionButton={
          !isMobile && (
            <Button
              variant="contained"
              size="large"
              startIcon={<Add />}
              onClick={() => navigate("/products/new")}
              sx={{
                bgcolor: "rgba(255,255,255,0.2)",
                "&:hover": { bgcolor: "rgba(255,255,255,0.3)" },
                borderRadius: 2,
              }}
            >
              Add Product
            </Button>
          )
        }
      />

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
          <StatsCard
            title="Total Products"
            value={products?.dashboard_stats?.total_products || 0}
            icon={<Inventory2 />}
            color="primary"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
          <StatsCard
            title="Inventory Value"
            value={`₹${
              products?.dashboard_stats?.total_inventory_value?.toLocaleString(
                "en-IN"
              ) || 0
            }`}
            icon={<AttachMoney />}
            color="success"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
          <StatsCard
            title="Low Stock Alert"
            value={products?.dashboard_stats?.low_stock_alert || 0}
            icon={<Warning />}
            color="warning"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
          <StatsCard
            title="Out of Stock"
            value={products?.dashboard_stats?.out_of_stock || 0}
            icon={<LocalOffer />}
            color="error"
          />
        </Grid>
      </Grid>

      {/* Search, Filter and View Controls */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 4,
          borderRadius: 3,
          border: "1px solid rgba(0,0,0,0.06)",
        }}
      >
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          alignItems={{ xs: "stretch", sm: "center" }}
          justifyContent="space-between"
        >
          <TextField
            placeholder="Search products by name or SKU..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search color="action" />
                </InputAdornment>
              ),
            }}
            sx={{
              minWidth: { xs: "100%", sm: 400 },
              "& .MuiOutlinedInput-root": {
                borderRadius: 3,
                "& fieldset": { borderColor: "rgba(0,0,0,0.1)" },
              },
            }}
          />
          <TextField
            select
            label="Category"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            sx={{ minWidth: 200 }}
            size="small"
            SelectProps={{ native: true }}
          >
            <option value="all">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </TextField>

          <TextField
            select
            label="Sort By"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            sx={{ minWidth: 160 }}
            size="small"
            SelectProps={{ native: true }}
          >
            <option value="name">Name</option>
            <option value="price">Price (High to Low)</option>
            <option value="stock">Stock Quantity</option>
            <option value="category">Category</option>
          </TextField>
          <Stack direction="row" spacing={1}>
            <Tooltip title="Filter">
              <IconButton
                sx={{
                  bgcolor: "rgba(0,0,0,0.04)",
                  borderRadius: 2,
                  "&:hover": { bgcolor: "rgba(0,0,0,0.08)" },
                }}
              >
                <FilterList />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>
      </Paper>

      {/* Products Grid/List */}
      {isLoading ? (
        <LoadingSkeleton />
      ) : filteredProducts.length > 0 ? (
        <Grid container spacing={3}>
          {filteredProducts.map((product, index) => (
            <Grid size={{ xs: 12, md: 6, lg: 4 }} key={product.id}>
              <ProductCard product={product} index={index} />
            </Grid>
          ))}
        </Grid>
      ) : (
        <Paper
          elevation={0}
          sx={{
            p: 8,
            textAlign: "center",
            borderRadius: 4,
            border: "2px dashed rgba(0,0,0,0.1)",
            bgcolor: "rgba(0,0,0,0.02)",
          }}
        >
          <Avatar
            sx={{
              width: 80,
              height: 80,
              bgcolor: "rgba(0,0,0,0.04)",
              mx: "auto",
              mb: 3,
            }}
          >
            <Inventory2 sx={{ fontSize: 40, color: "rgba(0,0,0,0.3)" }} />
          </Avatar>
          <Typography
            variant="h5"
            fontWeight="600"
            sx={{ mb: 1, color: "rgba(0,0,0,0.7)" }}
          >
            {searchQuery || categoryFilter !== "all"
              ? "No products match your criteria"
              : "No products found"}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            {searchQuery || categoryFilter !== "all"
              ? "Try adjusting your search terms or filters"
              : "Start by adding your first product to inventory"}
          </Typography>
          {searchQuery || categoryFilter !== "all" ? (
            <Button
              variant="outlined"
              onClick={() => {
                setSearchQuery("");
                setCategoryFilter("all");
              }}
              sx={{
                borderRadius: 3,
                textTransform: "none",
                px: 4,
                py: 1.5,
                fontWeight: 600,
                mr: 2,
              }}
            >
              Clear Filters
            </Button>
          ) : null}
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => navigate("/products/new")}
            sx={{
              borderRadius: 3,
              textTransform: "none",
              px: 4,
              py: 1.5,
              fontWeight: 600,
            }}
          >
            {searchQuery || categoryFilter !== "all"
              ? "Add Product"
              : "Add First Product"}
          </Button>
        </Paper>
      )}

      {/* Floating Speed Dial */}
      <SpeedDial
        ariaLabel="Product actions"
        sx={{
          position: "fixed",
          bottom: 32,
          right: 32,
          "& .MuiFab-primary": {
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            "&:hover": {
              background: "linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)",
            },
          },
        }}
        icon={<SpeedDialIcon />}
      >
        {speedDialActions.map((action) => (
          <SpeedDialAction
            key={action.name}
            icon={action.icon}
            tooltipTitle={action.name}
            onClick={action.onClick}
            sx={{
              "& .MuiFab-primary": {
                bgcolor: "white",
                color: "primary.main",
                "&:hover": {
                  bgcolor: "primary.50",
                },
              },
            }}
          />
        ))}
      </SpeedDial>

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
            border: "1px solid rgba(0,0,0,0.06)",
            minWidth: 200,
          },
        }}
      >
        <MenuItem
          onClick={() => {
            console.log("View product:", selectedProduct?.id);
            handleMenuClose();
          }}
        >
          <ListItemIcon>
            <Visibility fontSize="small" />
          </ListItemIcon>
          <ListItemText>View Details</ListItemText>
        </MenuItem>

        <MenuItem
          onClick={() => {
            navigate(`/products/${selectedProduct?.id}`);
            handleMenuClose();
          }}
        >
          <ListItemIcon>
            <Edit fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit Product</ListItemText>
        </MenuItem>

        <MenuItem
          onClick={() => {
            handleCopySKU(selectedProduct?.sku);
            handleMenuClose();
          }}
        >
          <ListItemIcon>
            <ContentCopy fontSize="small" />
          </ListItemIcon>
          <ListItemText>Copy SKU</ListItemText>
        </MenuItem>

        <Divider />

        <MenuItem
          onClick={() => {
            console.log("Duplicate product:", selectedProduct?.id);
            handleMenuClose();
          }}
        >
          <ListItemIcon>
            <Add fontSize="small" />
          </ListItemIcon>
          <ListItemText>Duplicate Product</ListItemText>
        </MenuItem>

        <MenuItem
          onClick={() => {
            handleDeleteConfirm(selectedProduct);
            handleMenuClose();
          }}
          sx={{ color: "error.main" }}
        >
          <ListItemIcon>
            <Delete fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Delete Product</ListItemText>
        </MenuItem>
      </Menu>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, product: null })}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: "0 16px 48px rgba(0,0,0,0.12)",
          },
        }}
      >
        <DialogTitle sx={{ pb: 2 }}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Avatar sx={{ bgcolor: "error.50", color: "error.main" }}>
              <Delete />
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight="600">
                Delete Product
              </Typography>
              <Typography variant="body2" color="text.secondary">
                This action cannot be undone
              </Typography>
            </Box>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            You are about to permanently delete this product from your
            inventory.
          </Alert>
          <DialogContentText>
            Are you sure you want to delete "{deleteDialog.product?.name}"? This
            will remove the product and all its associated data.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button
            onClick={() => setDeleteDialog({ open: false, product: null })}
            sx={{ borderRadius: 2, textTransform: "none", px: 3 }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            color="error"
            variant="contained"
            sx={{
              borderRadius: 2,
              textTransform: "none",
              px: 3,
              fontWeight: 600,
            }}
          >
            Delete Product
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{
            width: "100%",
            borderRadius: 2,
            fontWeight: 600,
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Products;
