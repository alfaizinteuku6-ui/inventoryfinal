// Sales/components/SalesTable.js
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
  Chip,
  Stack,
  Typography,
  Avatar,
  Tooltip,
  LinearProgress,
  Box,
  Skeleton,
  Button,
} from "@mui/material";
import {
  Download as DownloadIcon,
  Visibility,
  Payment,
  Cancel,
  Delete,
  AccessTime,
  CheckCircle,
  MoreTime,
  TrendingDown,
  Block,
  Person,
  CalendarToday,
} from "@mui/icons-material";
import generateInvoicePDF from "../../utils/invoice";

const SalesTable = ({
  sales,
  loading,
  itemsPerPage,
  companyInfo,
  navigate,
  onAddPayment,
  onCancelSale,
  onDeleteSale,
}) => {
  const getStatusConfig = (status) => {
    const configs = {
      pending: {
        color: "warning",
        icon: <AccessTime fontSize="small" />,
        label: "Pending",
        bgColor: "#fff3e0",
        textColor: "#f57c00",
      },
      partial: {
        color: "info",
        icon: <MoreTime fontSize="small" />,
        label: "Partial",
        bgColor: "#e3f2fd",
        textColor: "#1976d2",
      },
      paid: {
        color: "success",
        icon: <CheckCircle fontSize="small" />,
        label: "Paid",
        bgColor: "#e8f5e9",
        textColor: "#388e3c",
      },
      refunded: {
        color: "error",
        icon: <TrendingDown fontSize="small" />,
        label: "Refunded",
        bgColor: "#ffebee",
        textColor: "#d32f2f",
      },
      cancelled: {
        color: "error",
        icon: <Block fontSize="small" />,
        label: "Cancelled",
        bgColor: "#f3e5f5",
        textColor: "#c2185b",
      },
    };
    return configs[status] || configs.pending;
  };

  const getPaymentMethodColor = (method) => {
    const colors = {
      upi: "#00C853",
      cash: "#FF6F00",
      card: "#1976D2",
      bank_transfer: "#7B1FA2",
      credit: "#E64A19",
    };
    return colors[method.toLowerCase()] || "#424242";
  };

  const getPaymentMethodLabel = (method) => {
    const labels = {
      cash: "💵 Cash",
      card: "💳 Card",
      upi: "📱 UPI",
      bank_transfer: "🏦 Bank",
      credit: "📋 Credit",
    };
    return labels[method.toLowerCase()] || method;
  };

  const handleDownloadPDF = async (sale) => {
    generateInvoicePDF(sale, companyInfo);
  };

  const isOverdue = (sale) => {
    if (!sale.due_date || sale.payment_status === "paid" || sale.payment_status === "cancelled") {
      return false;
    }
    return new Date(sale.due_date) < new Date();
  };

  if (loading) {
    return (
      <TableContainer component={Paper} sx={{ borderRadius: 3, mb: 4 }}>
        <Table>
          <TableHead>
            <TableRow>
              {[...Array(8)].map((_, index) => (
                <TableCell key={index}>
                  <Skeleton variant="text" />
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {[...Array(itemsPerPage)].map((_, index) => (
              <TableRow key={index}>
                {[...Array(8)].map((_, cellIndex) => (
                  <TableCell key={cellIndex}>
                    <Skeleton variant="text" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  }

  return (
    <TableContainer
      component={Paper}
      sx={{
        borderRadius: 3,
        mb: 4,
        boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
      }}
    >
      <Table sx={{ minWidth: 1200 }}>
        <TableHead>
          <TableRow sx={{ bgcolor: "rgba(0,0,0,0.02)" }}>
            <TableCell sx={{ fontWeight: 700, fontSize: "0.875rem" }}>
              Invoice
            </TableCell>
            <TableCell sx={{ fontWeight: 700, fontSize: "0.875rem" }}>
              Customer
            </TableCell>
            <TableCell sx={{ fontWeight: 700, fontSize: "0.875rem" }}>
              Date
            </TableCell>
            <TableCell sx={{ fontWeight: 700, fontSize: "0.875rem" }}>
              Status
            </TableCell>
            <TableCell sx={{ fontWeight: 700, fontSize: "0.875rem" }} align="right">
              Total Amount
            </TableCell>
            <TableCell sx={{ fontWeight: 700, fontSize: "0.875rem" }} align="right">
              Payment
            </TableCell>
            <TableCell sx={{ fontWeight: 700, fontSize: "0.875rem" }}>
              Method
            </TableCell>
            <TableCell sx={{ fontWeight: 700, fontSize: "0.875rem" }} align="center">
              Actions
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {sales.map((sale) => {
            const statusConfig = getStatusConfig(sale.payment_status);
            const balanceDue = parseFloat(sale.total_amount) - parseFloat(sale.paid_amount);
            const paymentPercentage = (parseFloat(sale.paid_amount) / parseFloat(sale.total_amount)) * 100;
            const canAddPayment = balanceDue > 0 && ["pending", "partial"].includes(sale.payment_status);
            const canCancel = !["paid", "refunded", "cancelled"].includes(sale.payment_status);
            const overdueStatus = isOverdue(sale);

            return (
              <TableRow
                key={sale.id}
                sx={{
                  "&:hover": {
                    bgcolor: "rgba(0,0,0,0.02)",
                  },
                  transition: "all 0.2s",
                  borderLeft: overdueStatus ? "4px solid #d32f2f" : "4px solid transparent",
                }}
              >
                <TableCell>
                  <Stack direction="row" alignItems="center" spacing={1.5}>
                    <Avatar
                      sx={{
                        width: 36,
                        height: 36,
                        bgcolor: statusConfig.textColor,
                        fontSize: "0.875rem",
                      }}
                    >
                      {statusConfig.icon}
                    </Avatar>
                    <Box>
                      <Typography variant="body2" fontWeight="600" color="primary">
                        {sale.sale_number}
                      </Typography>
                      {overdueStatus && (
                        <Typography variant="caption" color="error" fontWeight="600">
                          Overdue
                        </Typography>
                      )}
                    </Box>
                  </Stack>
                </TableCell>

                <TableCell>
                  <Box>
                    <Typography variant="body2" fontWeight="600">
                      {sale.customer_name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                      <Person sx={{ fontSize: 12 }} />
                      {sale.salesperson_name}
                    </Typography>
                  </Box>
                </TableCell>

                <TableCell>
                  <Box>
                    <Typography variant="body2">
                      {new Date(sale.sale_date).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </Typography>
                    {sale.due_date && (
                      <Typography variant="caption" color="text.secondary" sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        <CalendarToday sx={{ fontSize: 12 }} />
                        Due: {new Date(sale.due_date).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                      </Typography>
                    )}
                  </Box>
                </TableCell>

                <TableCell>
                  <Chip
                    label={statusConfig.label}
                    size="small"
                    icon={statusConfig.icon}
                    color={statusConfig.color}
                    sx={{
                      fontWeight: 600,
                      borderRadius: 1.5,
                      height: 24,
                    }}
                  />
                </TableCell>

                <TableCell align="right">
                  <Typography variant="body2" fontWeight="700" color="primary">
                    ₹{parseFloat(sale.total_amount).toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                  </Typography>
                  {sale.refunded_amount > 0 && (
                    <Typography variant="caption" color="error" fontWeight="600">
                      Refunded: ₹{parseFloat(sale.refunded_amount).toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                    </Typography>
                  )}
                </TableCell>

                <TableCell align="right">
                  {sale.payment_status !== "cancelled" ? (
                    <Box sx={{ minWidth: 120 }}>
                      <Stack direction="row" justifyContent="flex-end" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                        <Typography variant="caption" color="text.secondary">
                          Paid:
                        </Typography>
                        <Typography variant="body2" fontWeight="600" color="success.main">
                          ₹{parseFloat(sale.paid_amount).toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                        </Typography>
                      </Stack>
                      {balanceDue > 0 && (
                        <>
                          <Stack direction="row" justifyContent="flex-end" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                            <Typography variant="caption" color="text.secondary">
                              Due:
                            </Typography>
                            <Typography variant="body2" fontWeight="600" color="error.main">
                              ₹{balanceDue.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                            </Typography>
                          </Stack>
                          <LinearProgress
                            variant="determinate"
                            value={paymentPercentage}
                            sx={{
                              height: 4,
                              borderRadius: 2,
                              bgcolor: "#e0e0e0",
                              "& .MuiLinearProgress-bar": {
                                borderRadius: 2,
                                background: "linear-gradient(90deg, #4caf50 0%, #45a049 100%)",
                              },
                            }}
                          />
                        </>
                      )}
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      -
                    </Typography>
                  )}
                </TableCell>

                <TableCell>
                  <Stack spacing={0.5}>
                    <Chip
                      label={getPaymentMethodLabel(sale.payment_method)}
                      size="small"
                      sx={{
                        bgcolor: getPaymentMethodColor(sale.payment_method),
                        color: "white",
                        fontWeight: 600,
                        borderRadius: 1.5,
                        height: 22,
                        fontSize: "0.75rem",
                      }}
                    />
                    {sale.credit_issued && (
                      <Chip
                        label="Credit"
                        size="small"
                        color="primary"
                        variant="outlined"
                        sx={{ fontWeight: 600, borderRadius: 1.5, height: 22, fontSize: "0.7rem" }}
                      />
                    )}
                  </Stack>
                </TableCell>

                <TableCell>
                  <Stack direction="row" spacing={0.5} justifyContent="center">
                    <Tooltip title="Download Invoice">
                      <IconButton
                        size="small"
                        onClick={() => handleDownloadPDF(sale)}
                        sx={{
                          borderRadius: 1.5,
                          border: "1px solid rgba(0,0,0,0.12)",
                          "&:hover": {
                            bgcolor: "rgba(0,0,0,0.04)",
                          },
                        }}
                      >
                        <DownloadIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="View Details">
                      <IconButton
                        size="small"
                        onClick={() => navigate(`/sales/${sale.id}`)}
                        sx={{
                          borderRadius: 1.5,
                          border: "1px solid rgba(0,0,0,0.12)",
                          color: "success.main",
                          "&:hover": {
                            bgcolor: "rgba(76, 175, 80, 0.04)",
                          },
                        }}
                      >
                        <Visibility fontSize="small" />
                      </IconButton>
                    </Tooltip>

                    {canAddPayment && (
                      <Tooltip title="Add Payment">
                        <IconButton
                          size="small"
                          onClick={() => onAddPayment(sale)}
                          sx={{
                            borderRadius: 1.5,
                            border: "1px solid rgba(0,0,0,0.12)",
                            color: "success.main",
                            "&:hover": {
                              bgcolor: "rgba(76, 175, 80, 0.04)",
                            },
                          }}
                        >
                          <Payment fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}

                    {canCancel && (
                      <Tooltip title="Cancel Sale">
                        <IconButton
                          size="small"
                          onClick={() => onCancelSale(sale)}
                          sx={{
                            borderRadius: 1.5,
                            border: "1px solid rgba(0,0,0,0.12)",
                            color: "warning.main",
                            "&:hover": {
                              bgcolor: "rgba(237, 108, 2, 0.04)",
                            },
                          }}
                        >
                          <Cancel fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}

                    <Tooltip title="Delete Sale">
                      <IconButton
                        size="small"
                        onClick={() => onDeleteSale(sale.id)}
                        sx={{
                          borderRadius: 1.5,
                          border: "1px solid rgba(0,0,0,0.12)",
                          color: "error.main",
                          "&:hover": {
                            bgcolor: "rgba(211, 47, 47, 0.04)",
                          },
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

export default SalesTable;
