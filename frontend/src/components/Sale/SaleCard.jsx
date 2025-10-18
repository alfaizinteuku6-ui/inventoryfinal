// Sales/components/SaleCard.js
import React, { useMemo, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  IconButton,
  Stack,
  Typography,
  Avatar,
  Divider,
  Fade,
  Tooltip,
  LinearProgress,
  Alert,
  Collapse,
} from "@mui/material";
import {
  ReceiptLong,
  Download as DownloadIcon,
  Person,
  CalendarToday,
  Payment,
  Visibility,
  Cancel,
  Delete,
  AccessTime,
  CheckCircle,
  Error,
  AttachMoney,
  TrendingDown,
  MoreTime,
  Block,
  ExpandMore,
  ExpandLess,
  StickyNote2,
} from "@mui/icons-material";
import generateInvoicePDF from "../../utils/invoice";

const SaleCard = ({
  sale,
  index,
  companyInfo,
  navigate,
  onAddPayment,
  onCancelSale,
  onDeleteSale,
}) => {
  // Collapsible state
  const [showAmountBreakdown, setShowAmountBreakdown] = useState(false);
  const [showNotes, setShowNotes] = useState(false);

  // Calculate balance due
  const balanceDue = useMemo(() => {
    return parseFloat(sale.total_amount) - parseFloat(sale.paid_amount);
  }, [sale.total_amount, sale.paid_amount]);

  // Calculate payment percentage
  const paymentPercentage = useMemo(() => {
    return (parseFloat(sale.paid_amount) / parseFloat(sale.total_amount)) * 100;
  }, [sale.paid_amount, sale.total_amount]);

  // Check if sale is overdue
  const isOverdue = useMemo(() => {
    if (!sale.due_date || sale.payment_status === "paid" || sale.payment_status === "cancelled") {
      return false;
    }
    return new Date(sale.due_date) < new Date();
  }, [sale.due_date, sale.payment_status]);

  // Check if there are additional details to show
  const hasAmountBreakdown = useMemo(() => {
    return sale.discount_amount > 0 || sale.tax_amount > 0;
  }, [sale.discount_amount, sale.tax_amount]);

  const getStatusConfig = (status) => {
    const configs = {
      pending: {
        color: "warning",
        icon: <AccessTime fontSize="small" />,
        label: "Pending",
        description: "Awaiting payment",
        bgColor: "#fff3e0",
        textColor: "#f57c00",
      },
      partial: {
        color: "info",
        icon: <MoreTime fontSize="small" />,
        label: "Partial",
        description: "Partially paid",
        bgColor: "#e3f2fd",
        textColor: "#1976d2",
      },
      paid: {
        color: "success",
        icon: <CheckCircle fontSize="small" />,
        label: "Paid",
        description: "Payment complete",
        bgColor: "#e8f5e9",
        textColor: "#388e3c",
      },
      refunded: {
        color: "error",
        icon: <TrendingDown fontSize="small" />,
        label: "Refunded",
        description: "Amount refunded",
        bgColor: "#ffebee",
        textColor: "#d32f2f",
      },
      cancelled: {
        color: "error",
        icon: <Block fontSize="small" />,
        label: "Cancelled",
        description: "Sale cancelled",
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
      bank_transfer: "🏦 Bank Transfer",
      credit: "📋 Credit",
    };
    return labels[method.toLowerCase()] || method;
  };

  const handleDownloadPDF = async () => {
    generateInvoicePDF(sale, companyInfo);
  };

  const statusConfig = getStatusConfig(sale.payment_status);
  const showPaymentSection = sale.payment_status !== "cancelled";
  const canAddPayment = balanceDue > 0 && ["pending", "partial"].includes(sale.payment_status);
  const canCancel = !["paid", "refunded", "cancelled"].includes(sale.payment_status);

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
        }}
      >
        {/* Status Color Bar */}
        <Box
          sx={{
            height: 5,
            background: `linear-gradient(90deg, ${getPaymentMethodColor(
              sale.payment_method
            )} 0%, ${getPaymentMethodColor(sale.payment_method)}60 100%)`,
          }}
        />

        <CardContent sx={{ p: 2.5, flex: 1, display: "flex", flexDirection: "column" }}>
          <Stack spacing={2}>
            {/* Overdue Alert */}
            {isOverdue && sale.payment_status !== "paid" && (
              <Alert severity="error" icon={<Error fontSize="small" />} sx={{ borderRadius: 2 }}>
                <Typography variant="body2" fontWeight="600">
                  Overdue by {Math.floor((new Date() - new Date(sale.due_date)) / (1000 * 60 * 60 * 24))} days
                </Typography>
              </Alert>
            )}
            {/* Header Section */}
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
              <Stack direction="row" alignItems="center" spacing={1.5} flex={1}>
                <Avatar
                  sx={{
                    width: 40,
                    height: 40,
                    bgcolor: statusConfig.textColor,
                    fontSize: "1rem",
                  }}
                >
                  {statusConfig.icon}
                </Avatar>
                <Box flex={1}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Typography variant="subtitle1" fontWeight="700" color="primary">
                      {sale.sale_number}
                    </Typography>
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
                  </Stack>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                  >
                    <CalendarToday sx={{ fontSize: 12 }} />
                    {new Date(sale.sale_date).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Typography>
                </Box>
              </Stack>
              <Tooltip title="Delete Sale">
                  <IconButton
                    onClick={() => onDeleteSale(sale?.id)}
                    size="small"
                    sx={{
                      borderRadius: 2,
                      border: "1px solid rgba(0,0,0,0.12)",
                      color: "error.main",
                      "&:hover": {
                        bgcolor: "rgba(211, 47, 47, 0.04)",
                        borderColor: "error.main",
                      },
                    }}
                  >
                    <Delete fontSize="small" />
                  </IconButton>
                </Tooltip>
            </Stack>

            {/* Customer & Salesperson */}
            <Box sx={{ p: 1.5, borderRadius: 2 }}>
              <Typography variant="h6" fontWeight="600" sx={{ mb: 0.5 }}>
                {sale.customer_name}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <Person sx={{ fontSize: 14 }} />
                Sales by: {sale.salesperson_name}
              </Typography>
              {sale.due_date && (
                <Typography variant="body2" color="text.secondary" sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.5 }}>
                  <CalendarToday sx={{ fontSize: 14 }} />
                  Due: {new Date(sale.due_date).toLocaleDateString("en-IN")}
                </Typography>
              )}
            </Box>

            <Divider sx={{ my: 0.5 }} />

            {/* Amount Summary - Collapsible */}
            <Box>
              <Stack 
                direction="row" 
                justifyContent="space-between" 
                alignItems="center"
                sx={{ cursor: hasAmountBreakdown ? "pointer" : "default" }}
                onClick={() => hasAmountBreakdown && setShowAmountBreakdown(!showAmountBreakdown)}
              >
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Typography variant="h6" fontWeight="700">
                    Total
                  </Typography>
                  {hasAmountBreakdown && (
                    <IconButton size="small" sx={{ p: 0 }}>
                      {showAmountBreakdown ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />}
                    </IconButton>
                  )}
                </Stack>
                <Typography variant="h5" fontWeight="700" color="primary.main">
                  ₹{parseFloat(sale.total_amount).toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                </Typography>
              </Stack>

              <Collapse in={showAmountBreakdown} timeout="auto">
                <Stack spacing={1.5} sx={{ mt: 2, pt: 2, borderTop: "1px dashed rgba(0,0,0,0.12)" }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2" color="text.secondary">
                      Subtotal
                    </Typography>
                    <Typography variant="body2" fontWeight="600">
                      ₹{parseFloat(sale.subtotal).toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                    </Typography>
                  </Stack>

                  {sale.discount_amount > 0 && (
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2" color="text.secondary">
                        Discount
                      </Typography>
                      <Typography variant="body2" fontWeight="600" color="success.main">
                        -₹{parseFloat(sale.discount_amount).toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                      </Typography>
                    </Stack>
                  )}

                  {sale.tax_amount > 0 && (
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2" color="text.secondary">
                        Tax
                      </Typography>
                      <Typography variant="body2" fontWeight="600">
                        ₹{parseFloat(sale.tax_amount).toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                      </Typography>
                    </Stack>
                  )}
                </Stack>
              </Collapse>
            </Box>

            {/* Payment Status Section */}
            {showPaymentSection && sale.payment_status !== "cancelled" && (
              <Box sx={{ p: 1.5, borderRadius: 2 }}>
                <Stack spacing={1}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Stack>
                      <Typography variant="caption" color="text.secondary" fontWeight="600">
                        PAID AMOUNT
                      </Typography>
                      <Typography variant="h6" fontWeight="700" color="success.main">
                        ₹{parseFloat(sale.paid_amount).toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                      </Typography>
                    </Stack>
                    {balanceDue > 0 && (
                      <Stack align="flex-end">
                        <Typography variant="caption" color="text.secondary" fontWeight="600">
                          BALANCE DUE
                        </Typography>
                        <Typography variant="h6" fontWeight="700" color="error.main">
                          ₹{balanceDue.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                        </Typography>
                      </Stack>
                    )}
                  </Stack>

                  {/* Payment Progress Bar */}
                  {balanceDue > 0 && (
                    <>
                      <LinearProgress
                        variant="determinate"
                        value={paymentPercentage}
                        sx={{
                          height: 6,
                          borderRadius: 3,
                          bgcolor: "#e0e0e0",
                          "& .MuiLinearProgress-bar": {
                            borderRadius: 3,
                            background: "linear-gradient(90deg, #4caf50 0%, #45a049 100%)",
                          },
                        }}
                      />
                      <Typography variant="caption" color="text.secondary" align="center">
                        {paymentPercentage.toFixed(0)}% paid
                      </Typography>
                    </>
                  )}
                </Stack>
              </Box>
            )}

            {/* Refund Info */}
            {sale.refunded_amount > 0 && (
              <Box sx={{ p: 1.5, borderRadius: 2, border: "1px solid #ffcdd2" }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" color="error.main" fontWeight="600">
                    Refunded Amount
                  </Typography>
                  <Typography variant="body2" fontWeight="700" color="error.main">
                    ₹{parseFloat(sale.refunded_amount).toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                  </Typography>
                </Stack>
              </Box>
            )}

            {/* Payment Method & Notes */}
            <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
              <Chip
                label={getPaymentMethodLabel(sale.payment_method)}
                size="small"
                sx={{
                  bgcolor: getPaymentMethodColor(sale.payment_method),
                  color: "white",
                  fontWeight: 600,
                  borderRadius: 2,
                }}
              />
              {sale.credit_issued && (
                <Chip
                  label="📋 Credit Issued"
                  size="small"
                  color="primary"
                  variant="outlined"
                  sx={{ fontWeight: 600, borderRadius: 2 }}
                />
              )}
              {sale.notes && (
                <Tooltip title={showNotes ? "Hide notes" : "Show notes"}>
                  <IconButton
                    size="small"
                    onClick={() => setShowNotes(!showNotes)}
                    sx={{
                      border: "1px solid rgba(0,0,0,0.12)",
                      borderRadius: 2,
                    }}
                  >
                    <StickyNote2 fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
            </Stack>

            {/* Collapsible Notes */}
            {sale.notes && (
              <Collapse in={showNotes} timeout="auto">
                <Box sx={{ p: 1.5, borderRadius: 2, border: "1px solid #f8bbd0" }}>
                  <Typography variant="caption" color="text.secondary" fontWeight="600">
                    Notes
                  </Typography>
                  <Typography variant="body2" color="text.primary" sx={{ mt: 0.5 }}>
                    {sale.notes}
                  </Typography>
                </Box>
              </Collapse>
            )}

            <Box sx={{ flexGrow: 1 }} />

            <Divider sx={{ my: 0.5 }} />

            {/* Action Buttons */}
            <Stack spacing={1}>
              {/* Primary Actions */}
              <Stack direction="row" spacing={1}>
                <Button
                  variant="contained"
                  startIcon={<DownloadIcon />}
                  onClick={handleDownloadPDF}
                  size="small"
                  fullWidth
                  sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600 }}
                >
                  Invoice
                </Button>
                <Button
                  variant="outlined"
                  color="success"
                  startIcon={<Visibility />}
                  onClick={() => navigate(`/sales/${sale.id}`)}
                  size="small"
                  fullWidth
                  sx={{ borderRadius: 2, fontWeight: 600 }}
                >
                  Details
                </Button>
              </Stack>

              {/* Secondary Actions */}
              {(canAddPayment || canCancel) && (
                <Stack direction="row" spacing={1}>
                  {canAddPayment && (
                    <Button
                      variant="contained"
                      color="success"
                      startIcon={<Payment />}
                      onClick={() => onAddPayment(sale)}
                      size="small"
                      sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600, width: canCancel ? '70%' : '100%' }}
                    >
                      Add Payment
                    </Button>
                  )}

                  {canCancel && (
                    <Button
                      variant="outlined"
                      color="warning"
                      startIcon={<Cancel />}
                      onClick={() => onCancelSale(sale)}
                      size="small"
                      sx={{ borderRadius: 2, fontWeight: 600, width: canAddPayment ? '30%' : '100%' }}
                    >
                      Cancel
                    </Button>
                  )}
                </Stack>
              )}
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </Fade>
  );
};

export default SaleCard;