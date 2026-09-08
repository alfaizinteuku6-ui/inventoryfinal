import React from "react";
import {
  Box,
  Paper,
  Typography,
  Chip,
  Skeleton,
  useTheme,
  alpha,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Fade,
  Tooltip,
} from "@mui/material";
import { Star } from "@mui/icons-material";
import { formatCurrency, formatNumber } from "../../utils/utilitys";
import { COLORS } from "../../utils/constants";

// ==================== TOP PRODUCTS TABLE ====================
const TopProductsTable = ({ products, loading }) => {
  const theme = useTheme();

  if (loading) {
    return (
      <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 2 }} />
    );
  }

  return (
    <Fade in timeout={500}>
      <Paper
        elevation={0}
        sx={{
          p: 3,
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 2,
        }}
      >
        <Box display="flex" alignItems="center" gap={1} mb={3}>
          <Star sx={{ color: theme.palette.warning.main }} />
          <Box>
            <Typography variant="h6" fontWeight="bold">
              Top Products
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Best performers by revenue
            </Typography>
          </Box>
        </Box>

        <TableContainer sx={{ maxHeight: 340, overflowX: "auto" }}>
          <Table stickyHeader sx={{ minWidth: 460 }}>
            <TableHead>
              <TableRow>
                <TableCell
                  sx={{
                    fontWeight: 700,
                    bgcolor: alpha(theme.palette.primary.main, 0.05),
                  }}
                >
                  Product
                </TableCell>
                <TableCell
                  align="right"
                  sx={{
                    fontWeight: 700,
                    bgcolor: alpha(theme.palette.primary.main, 0.05),
                  }}
                >
                  Sold
                </TableCell>
                <TableCell
                  align="right"
                  sx={{
                    fontWeight: 700,
                    bgcolor: alpha(theme.palette.primary.main, 0.05),
                  }}
                >
                  Revenue
                </TableCell>
                <TableCell
                  align="right"
                  sx={{
                    fontWeight: 700,
                    bgcolor: alpha(theme.palette.primary.main, 0.05),
                  }}
                >
                  Profit
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(products?.by_revenue || [])
                .slice(0, 8)
                .map((product, index) => (
                  <TableRow
                    key={product.product_id}
                    hover
                    sx={{
                      "&:hover": {
                        bgcolor: alpha(theme.palette.primary.main, 0.02),
                      },
                    }}
                  >
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Avatar
                          sx={{
                            width: 22,
                            height: 22,
                            bgcolor: alpha(COLORS[index % COLORS.length], 0.2),
                            color: COLORS[index % COLORS.length],
                            fontSize: 10,
                            fontWeight: 700,
                          }}
                        >
                          {index + 1}
                        </Avatar>
                        <Box>
                          <Tooltip
                            title={product.product_name}
                            placement="top"
                            arrow
                          >
                            <Typography
                              variant="body2"
                              fontWeight={600}
                              sx={{
                                display: "-webkit-box",
                                WebkitLineClamp: 2, // 👈 limit to 2 lines
                                WebkitBoxOrient: "vertical",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "normal", // allow wrapping for 2 lines
                                cursor: "pointer",
                              }}
                            >
                              {product.product_name}
                            </Typography>
                          </Tooltip>
                          <Typography variant="caption" color="text.secondary">
                            {product.sku}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <Chip
                        label={formatNumber(product.quantity_sold)}
                        size="small"
                        sx={{
                          fontWeight: 600,
                          bgcolor: alpha(theme.palette.info.main, 0.1),
                          color: theme.palette.info.main,
                        }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" fontWeight={700} noWrap>
                        {formatCurrency(product.revenue)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Box>
                        <Typography
                          variant="body2"
                          fontWeight={700}
                          color="success.main"
                          noWrap
                        >
                          {formatCurrency(product.profit)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" noWrap display="block">
                          {product.profit_margin}% margin
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Fade>
  );
};
export default TopProductsTable;
