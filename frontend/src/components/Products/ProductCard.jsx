import React from "react";
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
} from "@mui/material";
import {
  Edit,
  Inventory2,
  Visibility,
  MoreVert,
  Warning,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

const ProductCard = ({ product, index, onMenuOpen }) => {
  const navigate = useNavigate();

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
                  onClick={(e) => onMenuOpen(e, product)}
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

export default ProductCard;