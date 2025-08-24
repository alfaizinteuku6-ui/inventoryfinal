import React from "react";
import {
  Box,
  Grid,
  TextField,
  Typography,
  MenuItem,
  Paper,
  Zoom,
  Chip,
  Avatar,
  IconButton,
  useTheme,
  alpha,
} from "@mui/material";
import {
  ShoppingCart,
  Receipt,
  TrendingUp,
  LocalOffer,
  Cancel,
} from "@mui/icons-material";

const SaleItemRow = ({
  item,
  index,
  products,
  onUpdate,
  onRemove,
  disableRemove,
}) => {
  const theme = useTheme();

  const calculateLineTotal = (item) => {
    const quantity = parseInt(item.quantity) || 0;
    const unitPrice = parseFloat(item.unit_price) || 0;
    const discount = parseFloat(item.discount_percent) || 0;
    const tax = parseFloat(item.tax_rate) || 0;

    const subtotal = quantity * unitPrice;
    const discountAmount = subtotal * (discount / 100);
    const afterDiscount = subtotal - discountAmount;
    const taxAmount = afterDiscount * (tax / 100);

    return (afterDiscount + taxAmount).toFixed(2);
  };

  const getDiscountColor = (discount) => {
    if (discount > 20) return "error";
    if (discount > 10) return "warning";
    if (discount > 0) return "success";
    return "default";
  };

  return (
    <Zoom in timeout={300} style={{ transitionDelay: `${index * 100}ms` }}>
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 2,
          borderRadius: 3,
          border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
          background: `linear-gradient(135deg, ${alpha(
            theme.palette.background.paper,
            0.8
          )} 0%, ${alpha(theme.palette.primary.main, 0.02)} 100%)`,
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          position: "relative",
          overflow: "hidden",
          "&:hover": {
            transform: "translateY(-2px)",
            boxShadow: theme.shadows[8],
            borderColor: alpha(theme.palette.primary.main, 0.2),
            "& .remove-button": {
              opacity: 1,
              transform: "scale(1)",
            },
          },
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 3,
            background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            borderRadius: "12px 12px 0 0",
          },
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 2,
          }}
        >
          <Chip
            avatar={
              <Avatar sx={{ bgcolor: "transparent" }}>
                <ShoppingCart sx={{ fontSize: 16 }} />
              </Avatar>
            }
            label={`Item ${index + 1}`}
            variant="outlined"
            sx={{
              borderColor: alpha(theme.palette.primary.main, 0.3),
              color: theme.palette.primary.main,
              fontWeight: 600,
            }}
          />
          <IconButton
            className="remove-button"
            color="error"
            onClick={() => onRemove(index)}
            disabled={disableRemove}
            size="small"
            sx={{
              opacity: 0.6,
              transform: "scale(0.9)",
              transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
              "&:hover": {
                bgcolor: alpha(theme.palette.error.main, 0.1),
              },
              "&:disabled": {
                opacity: 0.3,
              },
            }}
          >
            <Cancel />
          </IconButton>
        </Box>

        <Grid container spacing={3} alignItems="center">
          <Grid size={{xs:12, md:3}}>
            <TextField
              select
              label="Product"
              fullWidth
              value={item.product}
              onChange={(e) => onUpdate(index, "product", e.target.value)}
              required
              variant="outlined"
              sx={{
                minWidth: 240, // 🔹 ensures initial minimum width
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: (theme) => theme.palette.primary.main,
                  },
                },
              }}
            >
              {products?.results?.map((product) => (
                <MenuItem key={product.id} value={product.id}>
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 0.5,
                      maxWidth: 240,
                    }}
                  >
                    <Typography
                      variant="body2"
                      fontWeight={500}
                      noWrap
                      title={product.name}
                      sx={{ textOverflow: "ellipsis", overflow: "hidden" }}
                    >
                      {product.name}
                    </Typography>
                    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                      <Chip
                        label={`₹${product.selling_price?.toLocaleString(
                          "en-IN"
                        )}`}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                      <Chip
                        label={product.sku}
                        size="small"
                        variant="outlined"
                      />
                    </Box>
                  </Box>
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid size={{xs:12, md:1.5}}>
            <TextField
              type="number"
              label="Quantity"
              value={item.quantity}
              onChange={(e) => onUpdate(index, "quantity", e.target.value)}
              inputProps={{ min: 1 }}
              fullWidth
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
            />
          </Grid>

          <Grid size={{xs:12, md:2}}>
            <TextField
              type="number"
              label="Unit Price"
              value={item.unit_price}
              onChange={(e) => onUpdate(index, "unit_price", e.target.value)}
              inputProps={{ min: 0, step: "0.01" }}
              fullWidth
              InputProps={{
                startAdornment: (
                  <TrendingUp
                    sx={{
                      color: theme.palette.success.main,
                      mr: 1,
                      fontSize: 18,
                    }}
                  />
                ),
              }}
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
            />
          </Grid>

          <Grid size={{xs:12, md:1.5}}>
            <TextField
              type="number"
              label="Discount %"
              value={item.discount_percent}
              onChange={(e) =>
                onUpdate(index, "discount_percent", e.target.value)
              }
              inputProps={{ min: 0, max: 100, step: "0.01" }}
              fullWidth
              InputProps={{
                startAdornment: (
                  <LocalOffer
                    sx={{
                      color: theme.palette.warning.main,
                      mr: 1,
                      fontSize: 18,
                    }}
                  />
                ),
              }}
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
            />
            {item.discount_percent > 0 && (
              <Box sx={{ mt: 1 }}>
                <Chip
                  label={`${item.discount_percent}% OFF`}
                  size="small"
                  color={getDiscountColor(item.discount_percent)}
                  variant="filled"
                />
              </Box>
            )}
          </Grid>

          <Grid size={{xs:12, md:1.5}}>
            <TextField
              type="number"
              label="Tax %"
              value={item.tax_rate}
              onChange={(e) => onUpdate(index, "tax_rate", e.target.value)}
              inputProps={{ min: 0, max: 100, step: "0.01" }}
              fullWidth
              InputProps={{
                startAdornment: (
                  <Receipt
                    sx={{ color: theme.palette.info.main, mr: 1, fontSize: 18 }}
                  />
                ),
              }}
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
            />
          </Grid>

          <Grid size={{xs:12, md:2.5}}>
            <Paper
              sx={{
                p: 2,
                background: `linear-gradient(135deg, ${alpha(
                  theme.palette.success.main,
                  0.1
                )} 0%, ${alpha(theme.palette.success.main, 0.05)} 100%)`,
                border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
                borderRadius: 2,
                textAlign: "center",
              }}
            >
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: "block", mb: 0.5 }}
              >
                Line Total
              </Typography>
              <Typography variant="h6" fontWeight="bold" color="success.main">
                ₹{parseInt(calculateLineTotal(item)).toLocaleString("en-IN")}
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Paper>
    </Zoom>
  );
};

export default SaleItemRow;
