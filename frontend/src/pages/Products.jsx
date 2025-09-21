import React, { useState, useMemo, useEffect } from "react";
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
  Backdrop,
  CircularProgress,
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
  Clear,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useCategories, useProducts } from "../hooks/useSWR";
import HeaderCard from "../components/HeaderCard";
import StatsCard from "../components/StatsCard";
import PaginationComponent from "../components/Pagination";
import { products as productsApi } from "../services/api";

const Products = () => {
  // State management
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // Pagination and search state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");

  // Menu state
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      setCurrentPage(1); // Reset to first page when search changes
    }, 300);
    console.log("Search Query:", searchQuery);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Build API params
  const apiParams = useMemo(() => {
    const params = {
      page: currentPage,
      page_size: itemsPerPage,
    };

    // Search
    if (debouncedSearchQuery) {
      params.search = debouncedSearchQuery;
    }

    // Category filter
    if (categoryFilter !== "all") {
      params.category = categoryFilter;
    }

    // Ordering
    const orderField = sortOrder === "desc" ? `-${sortBy}` : sortBy;
    params.ordering = orderField;

    return params;
  }, [
    currentPage,
    itemsPerPage,
    debouncedSearchQuery,
    categoryFilter,
    sortBy,
    sortOrder,
  ]);

  const { data: CategoriesData, mutate: CategoriesMutate } = useCategories();
  const {
    data: productsData,
    mutate,
    isLoading,
    error,
  } = useProducts(apiParams);
  // Extract data from API response
  const products = productsData?.results || [];
  const totalCount = productsData?.count || 0;
  const totalPages = Math.ceil(totalCount / itemsPerPage);
  const dashboardStats = productsData?.dashboard_stats || {};
  const hasNextPage = Boolean(productsData?.next);
  const hasPreviousPage = Boolean(productsData?.previous);

  // Handle pagination
  const handlePageChange = (page) => {
    setCurrentPage(page);
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page
  };

  // Handle search
  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setDebouncedSearchQuery("");
    setCurrentPage(1);
  };

  // Handle filters
  const handleCategoryChange = (event) => {
    setCategoryFilter(event.target.value);
    setCurrentPage(1);
  };

  const handleSortChange = (event) => {
    setSortBy(event.target.value);
    setCurrentPage(1);
  };

  const handleSortOrderToggle = () => {
    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    setCurrentPage(1);
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

  // Delete handlers
  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  const handleDeleteConfirm = async () => {
    try {
      // Implement delete API call here
      await productsApi.delete(selectedProduct.id);
      mutate(); // Refresh data
      setSnackbar({
        open: true,
        message: "Product deleted successfully",
        severity: "success",
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Failed to delete product",
        severity: "error",
      });
    } finally {
      setDeleteDialogOpen(false);
      setSelectedProduct(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setSelectedProduct(null);
  };

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
      onClick: () => mutate(),
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
            borderRadius: 3,
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            overflow: "hidden",
            height: "auto",
          }}
        >
          {/* Compact Header with Image and Key Info */}
          <Box sx={{ position: "relative", height: 140 }}>
            {/* Product Image */}
            {product.image ? (
              <CardMedia
                component="img"
                height="140"
                image={product.image}
                alt={product.name}
                sx={{
                  objectFit: "cover",
                  transition: "transform 0.3s ease",
                }}
              />
            ) : (
              <Box
                height="140px"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <Inventory2 sx={{ fontSize: 48, color: "rgba(0,0,0,0.3)" }} />
              </Box>
            )}

            {/* Status Badges */}
            <Box
              sx={{
                position: "absolute",
                top: 8,
                right: 8,
                display: "flex",
                gap: 0.5,
              }}
            >
              {stockStatus.severity !== "low" && (
                <Chip
                  label={stockStatus.label}
                  color={stockStatus.color}
                  size="small"
                  sx={{
                    fontSize: "0.7rem",
                    fontWeight: 600,
                    height: 22,
                    "& .MuiChip-label": { px: 1 },
                  }}
                />
              )}
            </Box>

            {/* Profit Badge */}
            <Box sx={{ position: "absolute", top: 8, left: 8 }}>
              <Chip
                label={`${profitMargin}%`}
                size="small"
                sx={{
                  fontSize: "0.7rem",
                  fontWeight: 600,
                  height: 22,
                  backgroundColor:
                    profitMargin > 20 ? "success.main" : "warning.main",
                  color: "white",
                  "& .MuiChip-label": { px: 1 },
                }}
              />
            </Box>
          </Box>

          <CardContent sx={{ p: 2.5 }}>
            <Stack spacing={1.5}>
              {/* Product Name */}
              <Typography
                variant="subtitle1"
                fontWeight="700"
                sx={{
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  color: "text.primary",
                  fontSize: "1rem",
                }}
                title={product.name}
              >
                {product.name}
              </Typography>

              {/* SKU and Category in compact row */}
              <Stack direction="row" spacing={1} alignItems="center">
                <Chip
                  label={product.sku}
                  size="small"
                  variant="outlined"
                  sx={{
                    fontSize: "0.7rem",
                    fontWeight: 500,
                    height: 20,
                    "& .MuiChip-label": { px: 1 },
                  }}
                />
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ fontSize: "0.75rem" }}
                >
                  {product.category_name || "No Category"}
                </Typography>
              </Stack>

              {/* Price and Stock in row */}
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <Box>
                  <Typography
                    variant="h6"
                    color="primary.main"
                    fontWeight="800"
                    sx={{ fontSize: "1.25rem" }}
                  >
                    ₹{parseFloat(product.selling_price).toLocaleString("en-IN")}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ fontSize: "0.7rem" }}
                  >
                    Cost: ₹
                    {parseFloat(product.cost_price).toLocaleString("en-IN")}
                  </Typography>
                </Box>
                <Box sx={{ textAlign: "right" }}>
                  <Typography
                    variant="subtitle2"
                    fontWeight="700"
                    color={
                      product.stock_quantity === 0
                        ? "error.main"
                        : product.is_low_stock
                        ? "warning.main"
                        : "success.main"
                    }
                    sx={{ fontSize: "0.9rem" }}
                  >
                    {product.stock_quantity} units
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ fontSize: "0.7rem" }}
                  >
                    Value: ₹
                    {(
                      product.selling_price * product.stock_quantity
                    ).toLocaleString("en-IN")}
                  </Typography>
                </Box>
              </Stack>

              {/* Action Buttons */}
              <Stack direction="row" spacing={1} sx={{ pt: 0.5 }}>
                <Button
                  variant="outlined"
                  startIcon={<Visibility />}
                  onClick={() => navigate(`/products/${product.id}`)}
                  size="small"
                  sx={{
                    flex: 1,
                    borderRadius: 2,
                    textTransform: "none",
                    fontWeight: 600,
                    fontSize: "0.8rem",
                    py: 0.5,
                  }}
                >
                  View
                </Button>
                <Button
                  variant="contained"
                  startIcon={<Edit />}
                  onClick={() => navigate(`/products/${product.id}/edit`)}
                  size="small"
                  sx={{
                    flex: 1,
                    borderRadius: 2,
                    textTransform: "none",
                    fontWeight: 600,
                    fontSize: "0.8rem",
                    py: 0.5,
                  }}
                >
                  Edit
                </Button>
                <Tooltip title="More Actions">
                  <IconButton
                    onClick={(e) => handleMenuOpen(e, product)}
                    size="small"
                    sx={{
                      border: "1px solid rgba(0,0,0,0.12)",
                      borderRadius: 2,
                    }}
                  >
                    <MoreVert fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      </Fade>
    );
  };

  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "100vh",
        p: { xs: 2, sm: 3 },
      }}
    >
      {/* Loading Backdrop */}
      <Backdrop
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={isLoading && currentPage === 1}
      >
        <CircularProgress color="inherit" />
      </Backdrop>

      {/* Header Section */}
      <HeaderCard
        icon={<Inventory fontSize="large" />}
        title="Products Management"
        subtitle={`Manage your Products (${totalCount.toLocaleString()} total)`}
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
            value={dashboardStats.total_products || 0}
            icon={<Inventory2 />}
            color="primary"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
          <StatsCard
            title="Inventory Value"
            value={`₹${
              dashboardStats.total_inventory_value?.toLocaleString("en-IN") || 0
            }`}
            icon={<AttachMoney />}
            color="success"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
          <StatsCard
            title="Low Stock Alert"
            value={dashboardStats.low_stock_alert || 0}
            icon={<Warning />}
            color="warning"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
          <StatsCard
            title="Out of Stock"
            value={dashboardStats.out_of_stock || 0}
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
        <Grid
          container
          spacing={2}
          alignItems="center"
          justifyContent="space-between"
        >
          {/* Search Field */}
          <Grid size={{ xs: 12, md: 5 }}>
            <TextField
              fullWidth
              placeholder="Search products by name, SKU, or description..."
              value={searchQuery}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search color="action" />
                  </InputAdornment>
                ),
                endAdornment: searchQuery && (
                  <InputAdornment position="end">
                    <IconButton onClick={handleClearSearch} size="small">
                      <Clear />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 3,
                  "& fieldset": { borderColor: "rgba(0,0,0,0.1)" },
                },
              }}
            />
          </Grid>

          {/* Category Filter */}
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              select
              label="Category"
              value={categoryFilter}
              onChange={handleCategoryChange}
              fullWidth
              size="small"
              SelectProps={{ native: true }}
            >
              <option value="all">All Categories</option>
              {CategoriesData?.results.map((category) => (
                <option key={category?.id} value={category?.id}>
                  {category?.name}
                </option>
              ))}
            </TextField>
          </Grid>

          {/* Sort By */}
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <TextField
              select
              label="Sort By"
              value={sortBy}
              onChange={handleSortChange}
              fullWidth
              size="small"
              SelectProps={{ native: true }}
            >
              <option value="name">Name</option>
              <option value="selling_price">Price</option>
              <option value="stock_quantity">Stock</option>
              <option value="created_at">Date Created</option>
            </TextField>
          </Grid>

          {/* Sort Order Toggle */}
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <Button
              variant="outlined"
              onClick={handleSortOrderToggle}
              fullWidth
              sx={{
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 600,
              }}
            >
              {sortOrder === "asc" ? "A-Z" : "Z-A"}
            </Button>
          </Grid>
        </Grid>

        {/* Results Info */}
        <Box mt={2}>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ whiteSpace: "nowrap" }}
          >
            {isLoading && currentPage > 1 ? (
              <CircularProgress size={16} sx={{ mr: 1 }} />
            ) : null}
            {totalCount > 0 && `${totalCount.toLocaleString()} results`}
            {debouncedSearchQuery && ` for "${debouncedSearchQuery}"`}
          </Typography>
        </Box>

        {/* Active Filters */}
        {(debouncedSearchQuery || categoryFilter !== "all") && (
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            flexWrap="wrap"
            mt={2}
          >
            <Typography variant="body2" color="text.secondary">
              Active filters:
            </Typography>
            {debouncedSearchQuery && (
              <Chip
                label={`Search: ${debouncedSearchQuery}`}
                onDelete={handleClearSearch}
                size="small"
                color="primary"
                variant="outlined"
              />
            )}
            {categoryFilter !== "all" && (
              <Chip
                label={`Category: ${categoryFilter}`}
                onDelete={() => setCategoryFilter("all")}
                size="small"
                color="primary"
                variant="outlined"
              />
            )}
            <Button
              size="small"
              onClick={() => {
                setSearchQuery("");
                setDebouncedSearchQuery("");
                setCategoryFilter("all");
                setCurrentPage(1);
              }}
              sx={{ ml: 1, textTransform: "none" }}
            >
              Clear all
            </Button>
          </Stack>
        )}
      </Paper>

      {/* Products Grid/List */}
      {isLoading && currentPage === 1 ? (
        <LoadingSkeleton />
      ) : products.length > 0 ? (
        <>
          <Grid container spacing={3}>
            {products.map((product, index) => (
              <Grid size={{ xs: 12, md: 6, lg: 4 }} key={product.id}>
                <ProductCard product={product} index={index} />
              </Grid>
            ))}
          </Grid>

          {/* Pagination */}
          <Box sx={{ mt: 4, mb: 2 }}>
            <PaginationComponent
              currentPage={currentPage}
              totalPages={totalPages}
              totalCount={totalCount}
              itemsPerPage={itemsPerPage}
              onPageChange={handlePageChange}
              onItemsPerPageChange={handleItemsPerPageChange}
              showItemsPerPage={true}
              showInfo={true}
              itemsPerPageOptions={[10, 20, 50, 100]}
            />
          </Box>
        </>
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
            {debouncedSearchQuery || categoryFilter !== "all"
              ? "No products match your criteria"
              : "No products found"}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            {debouncedSearchQuery || categoryFilter !== "all"
              ? "Try adjusting your search terms or filters"
              : "Start by adding your first product to inventory"}
          </Typography>
          {debouncedSearchQuery || categoryFilter !== "all" ? (
            <Button
              variant="outlined"
              onClick={() => {
                setSearchQuery("");
                setDebouncedSearchQuery("");
                setCategoryFilter("all");
                setCurrentPage(1);
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
            {debouncedSearchQuery || categoryFilter !== "all"
              ? "Add Product"
              : "Add First Product"}
          </Button>
        </Paper>
      )}

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
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
        <MenuItem
          onClick={() => navigator.clipboard.writeText(selectedProduct?.sku)}
        >
          <ListItemIcon>
            <ContentCopy fontSize="small" />
          </ListItemIcon>
          <ListItemText>Copy SKU</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleDeleteClick} sx={{ color: "error.main" }}>
          <ListItemIcon>
            <Delete fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
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
          <Button onClick={handleDeleteCancel} sx={{ borderRadius: 2 }}>
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            variant="contained"
            color="error"
            sx={{ borderRadius: 2 }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
      >
        <Alert
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{ borderRadius: 2 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

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
    </Box>
  );
};

export default Products;
