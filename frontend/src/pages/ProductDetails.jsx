import React, { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Typography,
  Chip,
  Stack,
  Paper,
  IconButton,
  Tooltip,
  Tab,
  Tabs,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  InputAdornment,
  Fab,
  useTheme,
  useMediaQuery,
  Breadcrumbs,
  Link,
  Skeleton,
  Table,
  TableContainer,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from "@mui/material";
import {
  ArrowBack,
  Edit,
  Delete,
  Share,
  Print,
  ContentCopy,
  Inventory2,
  AttachMoney,
  TrendingUp,
  Warning,
  CheckCircle,
  Error,
  Refresh,
  Add,
  Remove,
  QrCode,
  Bookmark,
  BookmarkBorder,
  Analytics,
  History,
  LocalOffer,
  Category,
  ImageNotSupported,
} from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";
import { useProduct, useStockMovements } from "../hooks/useSWR";
import Pagination from "../components/Pagination";

// ============ UTILITY FUNCTIONS ============
const formatCurrency = (amount) => {
  return `₹${parseFloat(amount).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

// ============ PRODUCT IMAGE COMPONENT ============
const ProductImage = ({ product, imageError, setImageError, isBookmarked, setIsBookmarked }) => {
  return (
    <Box sx={{ position: "relative", height: 350 }}>
      {!imageError && product.image ? (
        <img
          src={product.image}
          alt={product.name}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            padding: "16px",
          }}
          onError={() => setImageError(true)}
        />
      ) : (
        <Box
          sx={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            gap: 1,
            color: "text.secondary",
          }}
        >
          <ImageNotSupported sx={{ fontSize: 64 }} />
          <Typography variant="body2">No image available</Typography>
        </Box>
      )}
      <Box
        sx={{
          position: "absolute",
          top: 16,
          right: 16,
          display: "flex",
          gap: 1,
        }}
      >
        <IconButton onClick={() => setIsBookmarked(!isBookmarked)}>
          {isBookmarked ? <Bookmark color="primary" /> : <BookmarkBorder />}
        </IconButton>
        <IconButton>
          <QrCode />
        </IconButton>
      </Box>
    </Box>
  );
};

// ============ QUICK ACTIONS COMPONENT ============
const QuickActions = ({ productId, navigate }) => {
  return (
    <CardContent>
      <Stack direction="row" spacing={1}>
        <Button
          variant="contained"
          startIcon={<Edit />}
          onClick={() => navigate(`/products/${productId}/edit`)}
          sx={{
            flex: 1,
            borderRadius: 2,
            textTransform: "none",
            fontWeight: 600,
          }}
        >
          Edit Product
        </Button>
        <Tooltip title="Share">
          <IconButton
            sx={{
              border: "1px solid rgba(0,0,0,0.12)",
              borderRadius: 2,
            }}
          >
            <Share />
          </IconButton>
        </Tooltip>
        <Tooltip title="Print">
          <IconButton
            sx={{
              border: "1px solid rgba(0,0,0,0.12)",
              borderRadius: 2,
            }}
          >
            <Print />
          </IconButton>
        </Tooltip>
      </Stack>
    </CardContent>
  );
};

// ============ PRODUCT HEADER COMPONENT ============
const ProductHeader = ({ product, stockStatus, isMobile, navigate, handleCopy }) => {
  return (
    <Paper elevation={0} sx={{ p: 3, borderRadius: 3 }}>
      <Stack spacing={2}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="flex-start"
        >
          <Box sx={{ flex: 1, mr: 2 }}>
            <Typography
              variant={isMobile ? "h5" : "h4"}
              fontWeight="800"
              color="primary.main"
              sx={{ mb: 1, wordBreak: "break-word" }}
            >
              {product.name}
            </Typography>
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              flexWrap="wrap"
              useFlexGap
            >
              <Chip
                label={product.sku}
                variant="outlined"
                size="small"
                onClick={() => handleCopy(product.sku, "SKU")}
                onDelete={() => handleCopy(product.sku, "SKU")}
                deleteIcon={<ContentCopy fontSize="small" />}
                sx={{ fontWeight: 600, cursor: "pointer" }}
              />
              <Chip
                label={product.category_name}
                color="primary"
                size="small"
                icon={<Category />}
                sx={{ fontWeight: 600 }}
              />
              <Chip
                label={stockStatus.label}
                color={stockStatus.color}
                size="small"
                icon={stockStatus.icon}
                sx={{ fontWeight: 600 }}
              />
            </Stack>
          </Box>
          <IconButton
            onClick={() => navigate("/products")}
            sx={{
              bgcolor: "rgba(0,0,0,0.04)",
              "&:hover": { bgcolor: "rgba(0,0,0,0.08)" },
            }}
          >
            <ArrowBack />
          </IconButton>
        </Stack>

        {product.description && (
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{
              lineHeight: 1.6,
              maxHeight: "4.8em",
              overflow: "hidden",
              textOverflow: "ellipsis",
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical",
            }}
          >
            {product.description}
          </Typography>
        )}
      </Stack>
    </Paper>
  );
};

// ============ KEY METRICS COMPONENT ============
const KeyMetrics = ({ product, profitMargin, isMobile, getStockValue }) => {
  const metrics = [
    {
      icon: <AttachMoney sx={{ fontSize: 32, color: "white", mb: 1 }} />,
      value: formatCurrency(product.selling_price),
      label: "Selling Price",
      gradient: "linear-gradient(135deg, #42a5f5 0%, #1e88e5 100%)",
    },
    {
      icon: <TrendingUp sx={{ fontSize: 32, color: "white", mb: 1 }} />,
      value: `${profitMargin}%`,
      label: "Profit Margin",
      gradient: "linear-gradient(135deg, #66bb6a 0%, #388e3c 100%)",
    },
    {
      icon: <Inventory2 sx={{ fontSize: 32, color: "white", mb: 1 }} />,
      value: product.stock_quantity,
      label: "In Stock",
      gradient: "linear-gradient(135deg, #ffb300 0%, #f57c00 100%)",
    },
    {
      icon: <LocalOffer sx={{ fontSize: 32, color: "white", mb: 1 }} />,
      value: formatCurrency(getStockValue()),
      label: "Stock Value",
      gradient: "linear-gradient(135deg, #ec407a 0%, #c2185b 100%)",
    },
  ];

  return (
    <Grid container spacing={2}>
      {metrics.map((metric, index) => (
        <Grid key={index} size={{ xs: 6, sm: 3 }}>
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: 3,
              border: "1px solid rgba(0,0,0,0.06)",
              textAlign: "center",
              background: metric.gradient,
              color: "white",
            }}
          >
            {metric.icon}
            <Typography
              variant={isMobile ? "h6" : "h5"}
              fontWeight="800"
              color="white"
            >
              {metric.value}
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: "rgba(255,255,255,0.9)" }}
            >
              {metric.label}
            </Typography>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
};

// ============ STOCK MANAGEMENT COMPONENT ============
const StockManagement = ({ product, stockStatus, setStockDialog }) => {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
      }}
    >
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 2 }}
        flexWrap="wrap"
        gap={2}
      >
        <Typography variant="h6" fontWeight="700">
          Stock Management
        </Typography>
        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            startIcon={<Add />}
            onClick={() => setStockDialog({ open: true, type: "add" })}
            size="small"
            sx={{ borderRadius: 2, textTransform: "none" }}
          >
            Add Stock
          </Button>
          <Button
            variant="outlined"
            startIcon={<Remove />}
            onClick={() => setStockDialog({ open: true, type: "remove" })}
            size="small"
            sx={{ borderRadius: 2, textTransform: "none" }}
          >
            Remove Stock
          </Button>
        </Stack>
      </Stack>
      <Grid container spacing={2}>
        <Grid size={{ xs: 6, sm: 3 }}>
          <Box>
            <Typography variant="body2" color="text.secondary">
              Min Level
            </Typography>
            <Typography variant="h6" fontWeight="600">
              {product.min_stock_level || "N/A"}
            </Typography>
          </Box>
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <Box>
            <Typography variant="body2" color="text.secondary">
              Max Level
            </Typography>
            <Typography variant="h6" fontWeight="600">
              {product.max_stock_level || "N/A"}
            </Typography>
          </Box>
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <Box>
            <Typography variant="body2" color="text.secondary">
              Current Stock
            </Typography>
            <Typography variant="h6" fontWeight="600">
              {product.stock_quantity}
            </Typography>
          </Box>
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <Box>
            <Typography variant="body2" color="text.secondary">
              Status
            </Typography>
            <Chip
              label={stockStatus.label}
              color={stockStatus.color}
              size="small"
              icon={stockStatus.icon}
            />
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
};

// ============ STOCK HISTORY TAB COMPONENT ============
const StockHistoryTab = ({ productId }) => {
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const { data: stockMovements, isLoading, error } = useStockMovements({ 
    product: productId,
    page: page,
    page_size: itemsPerPage
  });

  const movements = stockMovements?.results || [];
  const totalCount = stockMovements?.count || 0;
  const totalPages = Math.ceil(totalCount / itemsPerPage);

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setPage(1); // Reset to first page when changing items per page
  };

  if (isLoading) {
    return (
      <Box px={3}>
        <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 3 }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box px={3}>
        <Alert severity="error">Failed to load stock history</Alert>
      </Box>
    );
  }

  return (
    <Box px={3}>
      <Typography variant="h6" fontWeight="700" sx={{ mb: 2 }}>
        Stock Movements
      </Typography>
      {movements.length === 0 ? (
        <Alert severity="info">No stock movements recorded yet</Alert>
      ) : (
        <>
          <Paper>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Quantity</TableCell>
                    <TableCell>Reference</TableCell>
                    <TableCell>Notes</TableCell>
                    <TableCell>User</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {movements.map((movement) => (
                    <TableRow key={movement.id}>
                      <TableCell>{formatDate(movement.created_at)}</TableCell>
                      <TableCell>
                        <Chip
                          label={movement.movement_type}
                          size="small"
                          color={movement.movement_type !== "sale_cancellation" ? "success" : "error"}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell
                        style={{
                          padding: "12px",
                          color: movement.movement_type !== "sale_cancellation"  ? "#388e3c" : "#d32f2f",
                          fontWeight: 600,
                        }}
                      >
                        {movement.quantity}
                      </TableCell>
                      <TableCell>{movement.reference || "-"}</TableCell>
                      <TableCell>{movement.notes || "-"}</TableCell>
                      <TableCell>{movement.user_name || "-"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>

          {/* Pagination */}
          {totalCount > 0  && (
            <Box sx={{ mt: 2 }}>
              <Pagination
                currentPage={page}
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
          )}
        </>
      )}
    </Box>
  );
};

// ============ PRODUCT DETAILS TAB COMPONENT ============
const ProductDetailsTab = ({ product, profitMargin, isMobile, getProfitPerUnit, getStockValue }) => {
  return (
    <Grid container spacing={3} px={3}>
      <Grid size={{ xs: 12, md: 6 }}>
        <Typography variant="h6" fontWeight="700" sx={{ mb: 2 }}>
          Product Information
        </Typography>
        <Stack spacing={2}>
          {[
            { label: "SKU", value: product.sku },
            { label: "Category", value: product.category_name },
            { label: "Barcode", value: product.barcode || "N/A" },
            {
              label: "Weight",
              value: product.weight ? `${product.weight} kg` : "N/A",
            },
            { label: "Dimensions", value: product.dimensions || "N/A" },
            {
              label: "Tax Rate",
              value: product.tax_rate ? `${product.tax_rate}%` : "0%",
            },
            {
              label: "Status",
              value: product.is_active ? "Active" : "Inactive",
            },
          ].map((item, index) => (
            <Stack
              key={index}
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{ py: 0.5 }}
            >
              <Typography variant="body2" color="text.secondary">
                {item.label}
              </Typography>
              <Typography
                variant="body2"
                fontWeight="600"
                sx={{
                  wordBreak: "break-word",
                  textAlign: "right",
                  maxWidth: "60%",
                }}
              >
                {item.value}
              </Typography>
            </Stack>
          ))}
        </Stack>
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <Typography variant="h6" fontWeight="700" sx={{ mb: 2 }}>
          Pricing & Financial
        </Typography>
        <Stack spacing={2}>
          {[
            {
              label: "Cost Price",
              value: formatCurrency(product.cost_price),
            },
            {
              label: "Selling Price",
              value: formatCurrency(product.selling_price),
            },
            {
              label: "Profit per Unit",
              value: formatCurrency(getProfitPerUnit()),
            },
            { label: "Profit Margin", value: `${profitMargin}%` },
            {
              label: "Stock Value",
              value: formatCurrency(getStockValue()),
            },
          ].map((item, index) => (
            <Stack
              key={index}
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{ py: 0.5 }}
            >
              <Typography variant="body2" color="text.secondary">
                {item.label}
              </Typography>
              <Typography
                variant="body2"
                fontWeight="600"
                sx={{ wordBreak: "break-word", textAlign: "right" }}
              >
                {item.value}
              </Typography>
            </Stack>
          ))}
        </Stack>
      </Grid>

      <Grid size={{ xs: 12 }}>
        <Alert severity="info" sx={{ borderRadius: 2 }}>
          <Stack
            direction={isMobile ? "column" : "row"}
            justifyContent="space-between"
            alignItems="flex-start"
            spacing={1}
          >
            <Box>
              <Typography variant="body2">
                Created on {formatDate(product.created_at)}
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2">
                Last updated on {formatDate(product.updated_at)}
              </Typography>
            </Box>
          </Stack>
        </Alert>
      </Grid>
    </Grid>
  );
};

// ============ STOCK UPDATE DIALOG COMPONENT ============
const StockUpdateDialog = ({ stockDialog, setStockDialog, stockAmount, setStockAmount, product, handleStockUpdate }) => {
  return (
    <Dialog
      open={stockDialog.open}
      onClose={() => setStockDialog({ open: false, type: "add" })}
      fullWidth
      maxWidth="xs"
      PaperProps={{
        sx: { borderRadius: 3 },
      }}
    >
      <DialogTitle sx={{ fontWeight: 700 }}>
        {stockDialog.type === "add" ? "Add Stock" : "Remove Stock"}
      </DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Current stock: <strong>{product.stock_quantity}</strong>
        </Typography>
        <TextField
          autoFocus
          fullWidth
          margin="dense"
          label="Quantity"
          type="number"
          value={stockAmount}
          onChange={(e) => setStockAmount(e.target.value)}
          error={
            stockAmount &&
            (isNaN(stockAmount) || parseFloat(stockAmount) <= 0)
          }
          helperText={
            stockAmount &&
            (isNaN(stockAmount) || parseFloat(stockAmount) <= 0)
              ? "Please enter a valid quantity"
              : stockDialog.type === "remove" &&
                stockAmount &&
                parseFloat(stockAmount) > product.stock_quantity
              ? "Cannot remove more than current stock"
              : ""
          }
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                {stockDialog.type === "add" ? <Add /> : <Remove />}
              </InputAdornment>
            ),
          }}
          sx={{ mt: 1 }}
        />
      </DialogContent>
      <DialogActions sx={{ p: 2.5, pt: 0 }}>
        <Button
          onClick={() => {
            setStockDialog({ open: false, type: "add" });
            setStockAmount("");
          }}
          sx={{ borderRadius: 2 }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleStockUpdate}
          disabled={
            !stockAmount ||
            isNaN(stockAmount) ||
            parseFloat(stockAmount) <= 0 ||
            (stockDialog.type === "remove" &&
              parseFloat(stockAmount) > product.stock_quantity)
          }
          sx={{ borderRadius: 2 }}
        >
          {stockDialog.type === "add" ? "Add Stock" : "Remove Stock"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ============ MAIN PRODUCT DETAILS COMPONENT ============
const ProductDetails = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { id } = useParams();
  const { data: product, error: productError, isLoading } = useProduct(id);
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [tabValue, setTabValue] = useState(0);
  const [stockDialog, setStockDialog] = useState({ open: false, type: "add" });
  const [stockAmount, setStockAmount] = useState("");
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [imageError, setImageError] = useState(false);

  const getStockStatus = () => {
    if (!product) return { label: "N/A", color: "default", icon: <Error /> };
    if (product.stock_quantity === 0)
      return { label: "Out of Stock", color: "error", icon: <Error /> };
    if (product.is_low_stock)
      return { label: "Low Stock", color: "warning", icon: <Warning /> };
    return { label: "In Stock", color: "success", icon: <CheckCircle /> };
  };

  const getProfitMargin = () => {
    if (!product) return "0";
    const costPrice = parseFloat(product.cost_price);
    const sellingPrice = parseFloat(product.selling_price);
    if (sellingPrice === 0) return "0";
    return (((sellingPrice - costPrice) / sellingPrice) * 100).toFixed(1);
  };

  const getStockValue = () => {
    if (!product) return 0;
    return parseFloat(product.selling_price) * product.stock_quantity;
  };

  const getProfitPerUnit = () => {
    if (!product) return 0;
    return parseFloat(product.selling_price) - parseFloat(product.cost_price);
  };

  const handleStockUpdate = () => {
    if (!stockAmount || isNaN(stockAmount) || parseFloat(stockAmount) <= 0) {
      alert("Please enter a valid quantity");
      return;
    }
    console.log(`${stockDialog.type} ${stockAmount} units`);
    setStockDialog({ open: false, type: "add" });
    setStockAmount("");
  };

  const handleCopy = async (text, label) => {
    try {
      await navigator.clipboard.writeText(text);
      console.log(`${label} copied to clipboard`);
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  };

  const stockStatus = getStockStatus();
  const profitMargin = getProfitMargin();

  const TabPanel = ({ children, value, index }) => (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );

  if (productError) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        height="100vh"
        gap={2}
      >
        <Error color="error" sx={{ fontSize: 64 }} />
        <Typography variant="h5" color="error">
          Failed to load product
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {productError.message || "An error occurred while loading the product"}
        </Typography>
        <Button
          variant="contained"
          onClick={() => window.location.reload()}
          startIcon={<Refresh />}
        >
          Retry
        </Button>
      </Box>
    );
  }

  if (isLoading || !product) {
    return (
      <Box sx={{ width: "100%", minHeight: "100vh", bgcolor: "#f8fafc", p: { xs: 2, sm: 3 } }}>
        <Skeleton variant="text" width={200} height={32} sx={{ mb: 3 }} />
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 5 }}>
            <Card sx={{ borderRadius: 4 }}>
              <Skeleton variant="rectangular" height={350} />
              <CardContent>
                <Skeleton variant="rectangular" width="100%" height={40} />
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, md: 7 }}>
            <Stack spacing={3}>
              <Skeleton variant="rectangular" height={150} sx={{ borderRadius: 3 }} />
              <Grid container spacing={2}>
                {[1, 2, 3, 4].map((i) => (
                  <Grid key={i} size={{ xs: 6, sm: 3 }}>
                    <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 3 }} />
                  </Grid>
                ))}
              </Grid>
            </Stack>
          </Grid>
        </Grid>
      </Box>
    );
  }

  return (
    <Box sx={{ width: "100%", minHeight: "100vh", p: { xs: 2, sm: 3 } }}>
      {/* Breadcrumb */}
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link
          underline="hover"
          color="inherit"
          href="/products"
          onClick={(e) => {
            e.preventDefault();
            navigate("/products");
          }}
          sx={{ display: "flex", alignItems: "center", gap: 1, cursor: "pointer" }}
        >
          <Inventory2 fontSize="small" />
          Products
        </Link>
        <Typography color="text.primary" fontWeight="600">
          {product.name.length > 50 ? `${product.name.substring(0, 50)}...` : product.name}
        </Typography>
      </Breadcrumbs>

      {/* Main Content */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, md: 5 }}>
          <Card sx={{ borderRadius: 4, overflow: "hidden", height: "100%" }}>
            <ProductImage
              product={product}
              imageError={imageError}
              setImageError={setImageError}
              isBookmarked={isBookmarked}
              setIsBookmarked={setIsBookmarked}
            />
            <QuickActions productId={id} navigate={navigate} />
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 7 }}>
          <Stack spacing={3}>
            <ProductHeader
              product={product}
              stockStatus={stockStatus}
              isMobile={isMobile}
              navigate={navigate}
              handleCopy={handleCopy}
            />
            <KeyMetrics
              product={product}
              profitMargin={profitMargin}
              isMobile={isMobile}
              getStockValue={getStockValue}
            />
            <StockManagement
              product={product}
              stockStatus={stockStatus}
              setStockDialog={setStockDialog}
            />
          </Stack>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper elevation={0} sx={{ borderRadius: 4, border: "1px solid rgba(0,0,0,0.06)", overflow: "hidden" }}>
        <Tabs
          value={tabValue}
          onChange={(e, newValue) => setTabValue(newValue)}
          variant={isMobile ? "scrollable" : "standard"}
          scrollButtons="auto"
          sx={{
            borderBottom: "1px solid rgba(0,0,0,0.06)",
            "& .MuiTab-root": { textTransform: "none", fontWeight: 600, minWidth: 120 },
          }}
        >
          <Tab label="Details" icon={<Analytics />} iconPosition="start" />
          <Tab label="Stock History" icon={<History />} iconPosition="start" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <ProductDetailsTab
            product={product}
            profitMargin={profitMargin}
            isMobile={isMobile}
            getProfitPerUnit={getProfitPerUnit}
            getStockValue={getStockValue}
          />
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <StockHistoryTab productId={id} />
        </TabPanel>
      </Paper>

      <StockUpdateDialog
        stockDialog={stockDialog}
        setStockDialog={setStockDialog}
        stockAmount={stockAmount}
        setStockAmount={setStockAmount}
        product={product}
        handleStockUpdate={handleStockUpdate}
      />

      {/* Floating Action Button for Mobile */}
      {isMobile && (
        <Fab
          color="primary"
          aria-label="edit"
          onClick={() => navigate(`/products/${id}/edit`)}
          sx={{
            position: "fixed",
            bottom: 16,
            right: 16,
            zIndex: 1000,
          }}
        >
          <Edit />
        </Fab>
      )}
    </Box>
  );
};

export default ProductDetails;