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
            <Box sx={{ position: "absolute", top: 8, right: 8, display: "flex", gap: 0.5 }}>
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
                  backgroundColor: profitMargin > 20 ? "success.main" : "warning.main",
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
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.75rem" }}>
                  {product.category_name || "No Category"}
                </Typography>
              </Stack>
  
              {/* Price and Stock in row */}
              <Stack direction="row" justifyContent="space-between" alignItems="center">
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
                    Cost: ₹{parseFloat(product.cost_price).toLocaleString("en-IN")}
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
                    Value: ₹{(product.selling_price * product.stock_quantity).toLocaleString("en-IN")}
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
    </Box>
  );
};

export default Products;
