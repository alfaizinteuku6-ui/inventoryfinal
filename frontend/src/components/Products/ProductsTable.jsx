import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  Avatar,
  Typography,
  Chip,
  Box,
  Stack,
  LinearProgress,
} from "@mui/material";
import {
  Inventory2,
  Visibility,
  Edit,
  Delete,
  ContentCopy,
  TrendingUp,
  Warning,
  CheckCircle,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import EllipsisTooltipTypography from "../EllipsisTooltipTypography";

const ProductsTable = ({ products, handleDeleteClick }) => {
  const navigate = useNavigate();

  // Helper functions
  const getStockStatus = (product) => {
    if (product.stock_quantity === 0) {
      return {
        label: "Out of Stock",
        color: "error",
        severity: "critical",
      };
    }
    if (product.is_low_stock) {
      return {
        label: "Low Stock",
        color: "warning",
        severity: "warning",
      };
    }
    if (product.stock_quantity >= product.max_stock_level * 0.8) {
      return {
        label: "Optimal",
        color: "success",
        severity: "info",
      };
    }
    return {
      label: "In Stock",
      color: "success",
      severity: "low",
    };
  };

  const getProfitMargin = (product) => {
    if (parseFloat(product.selling_price) === 0) return 0;
    return (
      ((product.selling_price - product.cost_price) / product.selling_price) *
      100
    ).toFixed(1);
  };

  const getStockUtilization = (product) => {
    if (product.max_stock_level === 0) return 0;
    return ((product.stock_quantity / product.max_stock_level) * 100).toFixed(
      0
    );
  };

  const handleCopySKU = async (sku) => {
    try {
      await navigator.clipboard.writeText(sku);
      console.log("SKU copied to clipboard");
    } catch (err) {
      console.error("Failed to copy SKU:", err);
    }
  };

  const getFirstImage = (product) => {
    if (
      product.images &&
      Array.isArray(product.images) &&
      product.images.length > 0
    ) {
      return product.images[0].image || product.images[0];
    }
    return product.image;
  };

  return (
    <TableContainer
      component={Paper}
      sx={{
        borderRadius: 3,
        border: "1px solid rgba(0,0,0,0.06)",
        overflow: "auto",
        maxWidth: "100%",
      }}
    >
      <Table sx={{ minWidth: 1200 }}>
        <TableHead>
          <TableRow>
            <TableCell
              sx={{
                fontWeight: 700,
                fontSize: "0.875rem",
                minWidth: 280,
                left: 0,
                zIndex: 2,
                borderRight: "1px solid rgba(0,0,0,0.06)",
              }}
            >
              Product
            </TableCell>
            <TableCell
              sx={{ fontWeight: 700, fontSize: "0.875rem", minWidth: 140 }}
            >
              SKU
            </TableCell>
            <TableCell
              sx={{ fontWeight: 700, fontSize: "0.875rem", minWidth: 120 }}
            >
              Category
            </TableCell>
            <TableCell
              align="right"
              sx={{ fontWeight: 700, fontSize: "0.875rem", minWidth: 120 }}
            >
              Price
            </TableCell>
            <TableCell
              align="center"
              sx={{ fontWeight: 700, fontSize: "0.875rem", minWidth: 100 }}
            >
              Margin
            </TableCell>
            <TableCell
              align="center"
              sx={{ fontWeight: 700, fontSize: "0.875rem", minWidth: 150 }}
            >
              Stock Level
            </TableCell>
            <TableCell
              align="center"
              sx={{ fontWeight: 700, fontSize: "0.875rem", minWidth: 120 }}
            >
              Status
            </TableCell>
            <TableCell
              align="center"
              sx={{
                fontWeight: 700,
                fontSize: "0.875rem",
                minWidth: 140,
                position: "sticky",
                right: 0,
                zIndex: 2,
                borderLeft: "1px solid rgba(0,0,0,0.06)",
                bgcolor: "background.paper",
              }}
            >
              Actions
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {products.map((product) => {
            const stockStatus = getStockStatus(product);
            const profitMargin = getProfitMargin(product);
            const stockUtilization = getStockUtilization(product);
            const firstImage = getFirstImage(product);

            return (
              <TableRow
                key={product.id}
                sx={{
                  borderLeft:
                    stockStatus.severity === "critical"
                      ? "4px solid #d32f2f"
                      : "none",
                  transition: "all 0.2s ease",
                }}
              >
                {/* Product Info - Sticky */}
                <TableCell
                  sx={{
                    left: 0,
                    zIndex: 1,
                    borderRight: "1px solid rgba(0,0,0,0.06)",
                  }}
                >
                  <Box display="flex" alignItems="center" gap={2}>
                    <Avatar
                      src={firstImage}
                      alt={product.name}
                      variant="rounded"
                      sx={{ width: 56, height: 56 }}
                    >
                      <Inventory2 />
                    </Avatar>
                    <Box>
                      <EllipsisTooltipTypography
                        variant="body2"
                        fontWeight={600}
                        sx={{ maxWidth: 180 }}
                      >
                        {product.name}
                      </EllipsisTooltipTypography>
                      {product.tax_rate > 0 && (
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ fontSize: "0.7rem" }}
                        >
                          Tax: {product.tax_rate}%
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </TableCell>

                {/* SKU */}
                <TableCell>
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <Chip
                      label={product.sku}
                      size="small"
                      variant="outlined"
                      sx={{
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        height: 24,
                      }}
                    />
                    <Tooltip title="Copy SKU">
                      <IconButton
                        size="small"
                        onClick={() => handleCopySKU(product.sku)}
                      >
                        <ContentCopy sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </TableCell>

                {/* Category */}
                <TableCell>
                  <Typography variant="body2" sx={{ fontSize: "0.875rem" }}>
                    {product.category_name || "-"}
                  </Typography>
                </TableCell>

                {/* Price */}
                <TableCell align="right">
                  <Typography
                    variant="body2"
                    fontWeight={700}
                    color="primary"
                    sx={{ fontSize: "0.9rem" }}
                  >
                    ₹
                    {product.selling_price.toLocaleString("en-IN", {
                      maximumFractionDigits: 0,
                    })}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{
                      textDecoration: "line-through",
                      fontSize: "0.7rem",
                    }}
                  >
                    ₹
                    {product.cost_price.toLocaleString("en-IN", {
                      maximumFractionDigits: 0,
                    })}
                  </Typography>
                </TableCell>

                {/* Profit Margin */}
                <TableCell align="center">
                  <Chip
                    label={`${profitMargin}%`}
                    size="small"
                    icon={<TrendingUp sx={{ fontSize: 14 }} />}
                    color={
                      profitMargin >= 30
                        ? "success"
                        : profitMargin >= 20
                        ? "info"
                        : profitMargin >= 10
                        ? "warning"
                        : "error"
                    }
                    sx={{
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      height: 26,
                    }}
                  />
                </TableCell>

                {/* Stock Level */}
                <TableCell align="center">
                  <Box sx={{ minWidth: 120 }}>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                      sx={{ mb: 0.5 }}
                    >
                      <Typography
                        variant="caption"
                        fontWeight={700}
                        sx={{
                          fontSize: "0.75rem",
                          color: stockStatus.color + ".main",
                        }}
                      >
                        {product.stock_quantity}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ fontSize: "0.7rem" }}
                      >
                        / {product.max_stock_level}
                      </Typography>
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
                  </Box>
                </TableCell>

                {/* Status */}
                <TableCell align="center">
                  <Chip
                    label={stockStatus.label}
                    size="small"
                    color={stockStatus.color}
                    icon={
                      stockStatus.severity === "critical" ? (
                        <Warning sx={{ fontSize: 14 }} />
                      ) : stockStatus.severity === "info" ? (
                        <CheckCircle sx={{ fontSize: 14 }} />
                      ) : undefined
                    }
                    sx={{
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      height: 26,
                    }}
                  />
                </TableCell>

                {/* Actions - Sticky */}
                <TableCell
                  align="center"
                  className="sticky-cell"
                  sx={{
                    position: "sticky",
                    right: 0,
                    bgcolor: "background.paper",
                    zIndex: 1,
                    borderLeft: "1px solid rgba(0,0,0,0.06)",
                  }}
                >
                  <Stack direction="row" spacing={0.5} justifyContent="center">
                    <Tooltip title="View Details">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => navigate(`/products/${product.id}`)}
                        sx={{
                          "&:hover": { bgcolor: "primary.light" },
                        }}
                      >
                        <Visibility fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit Product">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => navigate(`/products/${product.id}/edit`)}
                        sx={{
                          "&:hover": { bgcolor: "primary.light" },
                        }}
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Product">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={(e) => handleDeleteClick(e, product)}
                        sx={{
                          "&:hover": { bgcolor: "error.light" },
                        }}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ProductsTable;
