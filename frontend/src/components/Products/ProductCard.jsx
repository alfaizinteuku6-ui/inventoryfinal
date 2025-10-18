import React, { useMemo, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  IconButton,
  Typography,
  Chip,
  Stack,
  Fade,
  Tooltip,
  LinearProgress,
  Alert,
} from "@mui/material";
import {
  Edit,
  Inventory2,
  Visibility,
  Delete,
  Warning,
  CheckCircle,
  TrendingUp,
  ContentCopy,
  ChevronLeft,
  ChevronRight,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

const ProductCard = ({ product, index, onDelete }) => {
  const navigate = useNavigate();
  const [showActions, setShowActions] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageErrors, setImageErrors] = useState({});

  // Get all available images
  const getImages = () => {
    const images = [];

    // Add images from the images array if it exists
    if (product.images && Array.isArray(product.images)) {
      images.push(...product.images.map((img) => img.image || img));
    }

    // Add single image if it exists and not already in array
    if (product.image && !images.some((img) => img === product.image)) {
      images.push(product.image);
    }

    return images.filter(Boolean); // Remove any null/undefined values
  };

  const images = getImages();
  const hasMultipleImages = images.length > 1;
  const currentImage = images[currentImageIndex];
  const hasImages = images.length > 0;

  const handleNext = (e) => {
    e.stopPropagation();
    e.preventDefault();
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrev = (e) => {
    e.stopPropagation();
    e.preventDefault();
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleImageError = (index) => {
    setImageErrors((prev) => ({ ...prev, [index]: true }));
  };
  const handleCopySKU = async () => {
    try {
      await navigator.clipboard.writeText(product.sku);
      // Optional: Add toast notification here
      console.log("SKU copied to clipboard");
    } catch (err) {
      console.error("Failed to copy SKU:", err);
    }
  };

  // Memoized calculations
  const stockStatus = useMemo(() => {
    if (product.stock_quantity === 0) {
      return {
        label: "Out of Stock",
        color: "error",
        severity: "critical",
        icon: <Warning />,
      };
    }
    if (product.is_low_stock) {
      return {
        label: "Low Stock",
        color: "warning",
        severity: "warning",
        icon: <Warning />,
      };
    }
    if (product.stock_quantity >= product.max_stock_level * 0.8) {
      return {
        label: "Optimal Stock",
        color: "success",
        severity: "info",
        icon: <CheckCircle />,
      };
    }
    return {
      label: "In Stock",
      color: "success",
      severity: "low",
      icon: null,
    };
  }, [product.stock_quantity, product.is_low_stock, product.max_stock_level]);

  const profitMargin = useMemo(() => {
    if (parseFloat(product.selling_price) === 0) return 0;
    return (
      ((product.selling_price - product.cost_price) / product.selling_price) *
      100
    ).toFixed(1);
  }, [product.selling_price, product.cost_price]);

  const stockUtilization = useMemo(() => {
    if (product.max_stock_level === 0) return 0;
    return ((product.stock_quantity / product.max_stock_level) * 100).toFixed(
      0
    );
  }, [product.stock_quantity, product.max_stock_level]);

  const stockValue = useMemo(() => {
    return product.selling_price * product.stock_quantity;
  }, [product.selling_price, product.stock_quantity]);

  const profitCategory = useMemo(() => {
    const margin = parseFloat(profitMargin);
    if (margin >= 30) return { label: "High", color: "success" };
    if (margin >= 20) return { label: "Good", color: "info" };
    if (margin >= 10) return { label: "Fair", color: "warning" };
    return { label: "Low", color: "error" };
  }, [profitMargin]);

  return (
    <Fade in timeout={300 + index * 100}>
      <Card
        sx={{
          borderRadius: 3,
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          overflow: "hidden",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          border:
            stockStatus.severity === "critical"
              ? "2px solid #d32f2f"
              : "1px solid rgba(0,0,0,0.06)",
          boxShadow:
            stockStatus.severity === "critical"
              ? "0 4px 12px rgba(211, 47, 47, 0.15)"
              : "0 2px 8px rgba(0,0,0,0.08)",
          "&:hover": {
            boxShadow: "0 8px 16px rgba(0,0,0,0.12)",
            transform: "translateY(-2px)",
          },
        }}
      >
        {/* Image Container with Status Badges */}
        <Box sx={{ position: "relative", height: 160, overflow: "hidden" }}>
          {/* Product Image */}
          {hasImages && !imageErrors[currentImageIndex] ? (
            <CardMedia
              component="img"
              height="160"
              image={currentImage}
              alt={product.name}
              sx={{
                objectFit: "cover",
                transition: "transform 0.3s ease",
                "&:hover": {
                  transform: "scale(1.05)",
                },
              }}
              onError={() => handleImageError(currentImageIndex)}
            />
          ) : (
            <Box
              height="160px"
              display="flex"
              alignItems="center"
              justifyContent="center"
              sx={{ bgcolor: "#f5f5f5" }}
            >
              <Inventory2 sx={{ fontSize: 56, color: "rgba(0,0,0,0.2)" }} />
            </Box>
          )}

          {/* Navigation Arrows - Only show on hover and if multiple images */}
          {hasMultipleImages && !imageErrors[currentImageIndex] && (
            <Box
              className="image-navigation"
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                opacity: 0,
                transition: "opacity 0.2s ease",
                "&:hover": {
                  opacity: 1,
                },
                pointerEvents: "none",
              }}
            >
              <IconButton
                onClick={handlePrev}
                size="small"
                sx={{
                  pointerEvents: "auto",
                  ml: 0.5,
                  width: 32,
                  height: 32,
                }}
              >
                <ChevronLeft fontSize="small" />
              </IconButton>
              <IconButton
                onClick={handleNext}
                size="small"
                sx={{
                  pointerEvents: "auto",
                  mr: 0.5,
                  width: 32,
                  height: 32,
                }}
              >
                <ChevronRight fontSize="small" />
              </IconButton>
            </Box>
          )}

          {/* Image Count Badge */}
          {hasMultipleImages && (
            <Box
              sx={{
                position: "absolute",
                top: 8,
                left: 8,
                backgroundColor: "rgba(0, 0, 0, 0.7)",
                color: "white",
                px: 1,
                py: 0.25,
                borderRadius: 1,
                fontSize: "0.75rem",
                fontWeight: 500,
                display: "flex",
                alignItems: "center",
                gap: 0.5,
              }}
            >
              {currentImageIndex + 1}/{images.length}
            </Box>
          )}

          {/* Dot Indicators */}
          {hasMultipleImages && images.length <= 5 && (
            <Box
              sx={{
                position: "absolute",
                bottom: 8,
                left: "50%",
                transform: "translateX(-50%)",
                display: "flex",
                gap: 0.5,
              }}
            >
              {images.map((_, index) => (
                <Box
                  key={index}
                  sx={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    backgroundColor:
                      currentImageIndex === index
                        ? "white"
                        : "rgba(255, 255, 255, 0.5)",
                    boxShadow: "0 1px 2px rgba(0,0,0,0.3)",
                    transition: "all 0.2s ease",
                  }}
                />
              ))}
            </Box>
          )}

          {/* Top Left: Profit Margin Badge */}
          <Box sx={{ position: "absolute", top: 8, left: 8 }}>
            <Tooltip title={`Profit Margin: ${profitMargin}%`}>
              <Chip
                icon={<TrendingUp fontSize="small" />}
                label={`${profitMargin}%`}
                size="small"
                sx={{
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  height: 26,
                  backgroundColor: profitCategory.color + ".main",
                  color: "white",
                  "& .MuiChip-label": { px: 0.8 },
                  backdropFilter: "blur(4px)",
                }}
              />
            </Tooltip>
          </Box>

          {/* Top Right: Stock Status Badge */}
          {stockStatus.severity !== "low" && (
            <Box sx={{ position: "absolute", top: 8, right: 8 }}>
              <Chip
                icon={stockStatus.icon}
                label={stockStatus.label}
                size="small"
                color={stockStatus.color}
                sx={{
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  height: 26,
                  "& .MuiChip-label": { px: 0.8 },
                  backdropFilter: "blur(4px)",
                  backgroundColor: stockStatus.color + ".light",
                }}
              />
            </Box>
          )}

          {/* Tax Badge - Bottom Right */}
          {product.tax_rate > 0 && (
            <Box sx={{ position: "absolute", bottom: 8, right: 8 }}>
              <Chip
                label={`Tax: ${product.tax_rate}%`}
                size="small"
                sx={{
                  fontSize: "0.7rem",
                  fontWeight: 600,
                  height: 22,
                  backgroundColor: "rgba(0,0,0,0.6)",
                  color: "white",
                  "& .MuiChip-label": { px: 0.8 },
                }}
              />
            </Box>
          )}
        </Box>

        <CardContent
          sx={{ p: 2, flex: 1, display: "flex", flexDirection: "column" }}
        >
          <Stack spacing={1.5} sx={{ flex: 1 }}>
            {/* Product Name */}
            <Typography
              variant="subtitle1"
              fontWeight="700"
              sx={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                color: "text.primary",
                fontSize: "0.95rem",
              }}
              title={product.name}
            >
              {product.name}
            </Typography>

            {/* SKU and Category */}
            <Stack
              direction="row"
              spacing={0.75}
              alignItems="center"
              flexWrap="wrap"
              gap={0.5}
            >
              <Tooltip title="Product SKU">
                <Chip
                  label={product.sku}
                  size="small"
                  variant="outlined"
                  sx={{
                    fontSize: "0.7rem",
                    fontWeight: 600,
                    height: 22,
                    "& .MuiChip-label": { px: 0.8 },
                  }}
                />
              </Tooltip>
              {product.category_name && (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{
                    fontSize: "0.75rem",
                    fontWeight: 500,
                    px: 1,
                    py: 0.25,
                    borderRadius: 1,
                    bgcolor: "rgba(0,0,0,0.04)",
                  }}
                >
                  {product.category_name}
                </Typography>
              )}
            </Stack>

            {/* Pricing Section */}
            <Stack spacing={0.5}>
              <Box display="flex" alignItems="baseline" gap={0.5}>
                <Typography
                  variant="h6"
                  color="primary.main"
                  fontWeight="800"
                  sx={{ fontSize: "1.1rem" }}
                >
                  ₹
                  {parseFloat(product.selling_price).toLocaleString("en-IN", {
                    maximumFractionDigits: 0,
                  })}
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ fontSize: "0.7rem", textDecoration: "line-through" }}
                >
                  ₹
                  {parseFloat(product.cost_price).toLocaleString("en-IN", {
                    maximumFractionDigits: 0,
                  })}
                </Typography>
              </Box>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontSize: "0.7rem" }}
              >
                Profit/unit: ₹
                {(product.selling_price - product.cost_price).toLocaleString(
                  "en-IN",
                  { maximumFractionDigits: 0 }
                )}
              </Typography>
            </Stack>

            {/* Stock Level with Progress Bar */}
            <Box>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                sx={{ mb: 0.5 }}
              >
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ fontSize: "0.7rem", fontWeight: 600 }}
                >
                  Stock Level
                </Typography>
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <Typography
                    variant="caption"
                    fontWeight="700"
                    sx={{
                      fontSize: "0.75rem",
                      color: stockStatus.color + ".main",
                    }}
                  >
                    {product.stock_quantity} / {product.max_stock_level}
                  </Typography>
                </Stack>
              </Stack>
              <LinearProgress
                variant="determinate"
                value={Math.min(parseFloat(stockUtilization), 100)}
                sx={{
                  height: 6,
                  borderRadius: 3,
                  bgcolor: "rgba(0,0,0,0.08)",
                  "& .MuiLinearProgress-bar": {
                    borderRadius: 3,
                    background:
                      stockStatus.severity === "critical"
                        ? "linear-gradient(90deg, #d32f2f 0%, #f44336 100%)"
                        : stockStatus.severity === "warning"
                        ? "linear-gradient(90deg, #ff9800 0%, #fbc02d 100%)"
                        : "linear-gradient(90deg, #4caf50 0%, #45a049 100%)",
                  },
                }}
              />
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontSize: "0.65rem", mt: 0.25, display: "block" }}
              >
                Min: {product.min_stock_level} | Max: {product.max_stock_level}
              </Typography>
            </Box>

            {/* Stock Value */}
            <Box sx={{ bgcolor: "rgba(0,0,0,0.04)", p: 1, borderRadius: 1.5 }}>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontSize: "0.7rem" }}
              >
                Stock Value
              </Typography>
              <Typography
                variant="subtitle2"
                fontWeight="700"
                sx={{ fontSize: "0.85rem" }}
              >
                ₹
                {stockValue.toLocaleString("en-IN", {
                  maximumFractionDigits: 0,
                })}
              </Typography>
            </Box>

            {/* Critical Stock Alert */}
            {stockStatus.severity === "critical" && (
              <Alert
                severity="error"
                sx={{
                  py: 0.75,
                  px: 1,
                  fontSize: "0.75rem",
                  "& .MuiAlert-icon": { fontSize: "1rem", mr: 0.75 },
                }}
              >
                <strong>Out of Stock</strong> - Reorder needed
              </Alert>
            )}
          </Stack>

          {/* Action Buttons */}
          <Stack direction="row" spacing={0.75} sx={{ pt: 1.5, mt: "auto" }}>
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
                fontSize: "0.75rem",
                py: 0.6,
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
                fontSize: "0.75rem",
                py: 0.6,
              }}
            >
              Edit
            </Button>
            <Tooltip title="Copy SKU">
              <IconButton
                onClick={handleCopySKU}
                size="small"
                sx={{
                  border: "1px solid rgba(0,0,0,0.12)",
                  borderRadius: 2,
                  "&:hover": { bgcolor: "rgba(0,0,0,0.04)" },
                }}
              >
                <ContentCopy fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete Product">
              <IconButton
                onClick={(e) => onDelete(e, product)}
                size="small"
                sx={{
                  border: "1px solid #ffcdd2",
                  borderRadius: 2,
                  color: "error.main",
                  "&:hover": { bgcolor: "rgba(211, 47, 47, 0.04)" },
                }}
              >
                <Delete fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        </CardContent>
      </Card>
    </Fade>
  );
};

export default ProductCard;
