import React, { useState, useMemo } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Typography,
  Divider,
  Paper,
  Fade,
  Chip,
  Avatar,
  useTheme,
  alpha,
  Container,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Alert,
  LinearProgress,
  Tooltip,
} from "@mui/material";
import {
  ArrowBack,
  Edit,
  Delete,
  Download,
  Payment,
  Person,
  Receipt,
  Store,
  AttachMoney,
  Warning,
  CheckCircle,
  Error,
  AccessTime,
  MoreTime,
  TrendingDown,
  Block,
  Today,
  Phone,
  Email,
} from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";
import { useSale } from "../hooks/useSWR";
import PaymentModal from "../components/Sale/PaymentModal";
import { useSalesState } from "../hooks/useSalesState";

const SaleDetails = () => {
  const theme = useTheme();
  const salesState = useSalesState();
  const navigate = useNavigate();
  const { id } = useParams();
  const { data: sale, isLoading: loading, error } = useSale(id);

  // Calculate derived values
  const balanceDue = useMemo(() => {
    if (!sale) return 0;
    return parseFloat(sale.total_amount || 0) - parseFloat(sale.paid_amount || 0);
  }, [sale]);

  const paymentPercentage = useMemo(() => {
    if (!sale || parseFloat(sale.total_amount) === 0) return 0;
    return (parseFloat(sale.paid_amount || 0) / parseFloat(sale.total_amount)) * 100;
  }, [sale]);

  const isOverdue = useMemo(() => {
    if (!sale || !sale.due_date) return false;
    if (["paid", "cancelled"].includes(sale.payment_status)) return false;
    return new Date(sale.due_date) < new Date();
  }, [sale]);

  const daysOverdue = useMemo(() => {
    if (!isOverdue) return 0;
    return Math.floor((new Date() - new Date(sale.due_date)) / (1000 * 60 * 60 * 24));
  }, [isOverdue, sale]);

  const getStatusConfig = (status) => {
    const configs = {
      pending: {
        color: "warning",
        icon: <AccessTime fontSize="small" />,
        label: "Pending",
      },
      partial: {
        color: "info",
        icon: <MoreTime fontSize="small" />,
        label: "Partially Paid",
      },
      paid: {
        color: "success",
        icon: <CheckCircle fontSize="small" />,
        label: "Fully Paid",
      },
      refunded: {
        color: "error",
        icon: <TrendingDown fontSize="small" />,
        label: "Refunded",
      },
      cancelled: {
        color: "error",
        icon: <Block fontSize="small" />,
        label: "Cancelled",
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
    return colors[method?.toLowerCase()] || "#424242";
  };

  const getPaymentMethodLabel = (method) => {
    const labels = {
      cash: "💵 Cash",
      card: "💳 Card",
      upi: "📱 UPI",
      bank_transfer: "🏦 Bank Transfer",
      credit: "📋 Credit",
    };
    return labels[method?.toLowerCase()] || method;
  };

  const statusConfig = sale ? getStatusConfig(sale.payment_status) : null;
  const canAddPayment = sale && balanceDue > 0 && ["pending", "partial"].includes(sale.payment_status);
  const canEdit = sale && !["paid", "refunded", "cancelled"].includes(sale.payment_status);

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Skeleton variant="text" width={200} height={40} sx={{ mb: 2 }} />
        <Skeleton variant="text" width="60%" height={60} sx={{ mb: 4 }} />
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 8 }}>
            <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 3 }} />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 3 }} />
          </Grid>
        </Grid>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate("/sales")}
          sx={{ mb: 2 }}
        >
          Back to Sales
        </Button>
        <Paper sx={{ p: 4, textAlign: "center" }}>
          <Error color="error" sx={{ fontSize: 48, mb: 2 }} />
          <Typography variant="h6" color="error" gutterBottom>
            Error Loading Sale
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {typeof error === "string" ? error : JSON.stringify(error)}
          </Typography>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Fade in timeout={500}>
        <Box>
          {/* Header */}
          <Box sx={{ mb: 4 }}>
            <Button
              startIcon={<ArrowBack />}
              onClick={() => navigate("/sales")}
              sx={{ mb: 2, textTransform: "none", fontWeight: 600 }}
            >
              Back to Sales
            </Button>

            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 2 }}>
              <Box>
                <Typography variant="h4" fontWeight="bold" gutterBottom>
                  {sale?.sale_number}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {new Date(sale?.sale_date).toLocaleDateString("en-IN", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Typography>
              </Box>
              <Chip
                label={statusConfig?.label}
                color={statusConfig?.color}
                icon={statusConfig?.icon}
                sx={{ fontWeight: 600, height: 32 }}
              />
            </Box>
          </Box>

          {/* Overdue Alert */}
          {isOverdue && (
            <Alert severity="error" icon={<Warning />} sx={{ mb: 3, borderRadius: 2 }}>
              <Typography variant="body2" fontWeight="600">
                ⚠️ Overdue by {daysOverdue} day{daysOverdue !== 1 ? "s" : ""} - Action Required
              </Typography>
            </Alert>
          )}

          <Grid container spacing={4}>
            {/* Main Content */}
            <Grid size={{ xs: 12, md: 8 }}>
              {/* Customer Information */}
              <Card sx={{ mb: 3, borderRadius: 3, border: "1px solid rgba(0,0,0,0.06)" }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <Avatar sx={{ bgcolor: theme.palette.primary.main, mr: 2 }}>
                      <Person />
                    </Avatar>
                    <Typography variant="h6" fontWeight="bold">
                      Customer Information
                    </Typography>
                  </Box>
                  <Divider sx={{ mb: 3 }} />

                  <Grid container spacing={3}>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Stack>
                        <Typography variant="caption" color="text.secondary" fontWeight="600">
                          CUSTOMER NAME
                        </Typography>
                        <Typography variant="body1" fontWeight={600} sx={{ mt: 0.5 }}>
                          {sale?.customer_details?.name || "N/A"}
                        </Typography>
                      </Stack>
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Stack>
                        <Typography variant="caption" color="text.secondary" fontWeight="600">
                          SALESPERSON
                        </Typography>
                        <Typography variant="body1" fontWeight={600} sx={{ mt: 0.5 }}>
                          {sale?.salesperson_name || "N/A"}
                        </Typography>
                      </Stack>
                    </Grid>
                    {sale?.customer_details?.phone && (
                      <Grid size={{ xs: 12, md: 6 }}>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Phone sx={{ fontSize: 18, color: "primary.main" }} />
                          <Box>
                            <Typography variant="caption" color="text.secondary" fontWeight="600">
                              PHONE
                            </Typography>
                            <Typography variant="body2" fontWeight={600}>
                              {sale.customer_details.phone}
                            </Typography>
                          </Box>
                        </Stack>
                      </Grid>
                    )}
                    {sale?.customer_details?.email && (
                      <Grid size={{ xs: 12, md: 6 }}>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Email sx={{ fontSize: 18, color: "primary.main" }} />
                          <Box>
                            <Typography variant="caption" color="text.secondary" fontWeight="600">
                              EMAIL
                            </Typography>
                            <Typography variant="body2" fontWeight={600}>
                              {sale.customer_details.email}
                            </Typography>
                          </Box>
                        </Stack>
                      </Grid>
                    )}
                  </Grid>
                </CardContent>
              </Card>

              {/* Sale Items */}
              <Card sx={{ borderRadius: 3, border: "1px solid rgba(0,0,0,0.06)", overflow: "hidden" }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <Avatar sx={{ bgcolor: theme.palette.secondary.main, mr: 2 }}>
                      <Store />
                    </Avatar>
                    <Typography variant="h6" fontWeight="bold">
                      Sale Items ({sale?.items?.length || 0})
                    </Typography>
                  </Box>
                  <Divider sx={{ mb: 3 }} />

                  {sale?.items?.length ? (
                    <TableContainer>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 600 }}>Product</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 600 }}>Qty</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 600 }}>Unit Price</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 600 }}>Discount</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 600 }}>Tax</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 600 }}>Total</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {sale.items.map((item, index) => (
                            <TableRow key={index}>
                              <TableCell>
                                <Stack>
                                  <Typography variant="body2" fontWeight={600}>
                                    {item.product_name}
                                  </Typography>
                                  {item.product_sku && (
                                    <Typography variant="caption" color="text.secondary">
                                      SKU: {item.product_sku}
                                    </Typography>
                                  )}
                                </Stack>
                              </TableCell>
                              <TableCell align="center">{item.quantity}</TableCell>
                              <TableCell align="right">
                                ₹{parseFloat(item.unit_price).toFixed(2)}
                              </TableCell>
                              <TableCell align="right">
                                {item.discount_percent ? `${item.discount_percent}%` : "-"}
                              </TableCell>
                              <TableCell align="right">
                                {item.tax_rate ? `${item.tax_rate}%` : "-"}
                              </TableCell>
                              <TableCell align="right" sx={{ fontWeight: 600 }}>
                                ₹{parseFloat(item.line_total).toFixed(2)}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  ) : (
                    <Typography color="text.secondary" sx={{ textAlign: "center", py: 2 }}>
                      No items in this sale
                    </Typography>
                  )}
                </CardContent>
              </Card>

              {/* Additional Notes */}
              {sale?.notes && (
                <Card sx={{ mt: 3, borderRadius: 3 }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                      Notes
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Typography variant="body2">{sale.notes}</Typography>
                  </CardContent>
                </Card>
              )}
            </Grid>

            {/* Sidebar */}
            <Grid size={{ xs: 12, md: 4 }}>
              {/* Payment Summary */}
              <Card sx={{ mb: 3, borderRadius: 3, border: "1px solid rgba(0,0,0,0.06)" }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <Avatar sx={{ bgcolor: theme.palette.success.main, mr: 2 }}>
                      <AttachMoney />
                    </Avatar>
                    <Typography variant="h6" fontWeight="bold">
                      Payment Summary
                    </Typography>
                  </Box>
                  <Divider sx={{ mb: 3 }} />

                  <Stack spacing={2}>
                    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                      <Typography variant="body2" color="text.secondary">
                        Total Amount
                      </Typography>
                      <Typography variant="body1" fontWeight={600}>
                        ₹{parseFloat(sale?.total_amount || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                      </Typography>
                    </Box>

                    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                      <Typography variant="body2" color="text.secondary">
                        Paid Amount
                      </Typography>
                      <Typography variant="body1" fontWeight={600} color="success.main">
                        ₹{parseFloat(sale?.paid_amount || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                      </Typography>
                    </Box>

                    {balanceDue > 0 && (
                      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                        <Typography variant="body2" color="text.secondary">
                          Balance Due
                        </Typography>
                        <Typography variant="body1" fontWeight={600} color="error.main">
                          ₹{balanceDue.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                        </Typography>
                      </Box>
                    )}

                    {/* Payment Progress */}
                    {balanceDue > 0 && (
                      <>
                        <LinearProgress
                          variant="determinate"
                          value={paymentPercentage}
                          sx={{
                            height: 8,
                            borderRadius: 4,
                            bgcolor: "#e0e0e0",
                            "& .MuiLinearProgress-bar": {
                              borderRadius: 4,
                              background: "linear-gradient(90deg, #4caf50 0%, #45a049 100%)",
                            },
                          }}
                        />
                        <Typography variant="caption" color="text.secondary" align="center">
                          {paymentPercentage.toFixed(0)}% paid
                        </Typography>
                      </>
                    )}

                    <Divider />

                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <Typography variant="body2" color="text.secondary">
                        Payment Method
                      </Typography>
                      <Chip
                        label={getPaymentMethodLabel(sale?.payment_method)}
                        size="small"
                        sx={{
                          bgcolor: alpha(getPaymentMethodColor(sale?.payment_method), 0.1),
                          color: getPaymentMethodColor(sale?.payment_method),
                          fontWeight: 600,
                        }}
                      />
                    </Box>

                    {sale?.due_date && (
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Stack direction="row" alignItems="center" spacing={0.5}>
                          <Today sx={{ fontSize: 16 }} />
                          <Typography variant="body2" color="text.secondary">
                            Due Date
                          </Typography>
                        </Stack>
                        <Typography variant="body2" fontWeight={600}>
                          {new Date(sale.due_date).toLocaleDateString("en-IN")}
                        </Typography>
                      </Box>
                    )}
                  </Stack>
                </CardContent>
              </Card>

              {/* Refund Info - Show when applicable */}
              {sale?.refunded_amount > 0 && (
                <Card sx={{ mb: 3, borderRadius: 3, border: "2px solid #ffcdd2", bgcolor: "#ffebee" }}>
                  <CardContent sx={{ p: 3 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Stack>
                        <Typography variant="caption" color="text.secondary" fontWeight="600">
                          REFUNDED AMOUNT
                        </Typography>
                        <Typography variant="h6" fontWeight={700} color="error.main" sx={{ mt: 0.5 }}>
                          ₹{parseFloat(sale.refunded_amount).toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                        </Typography>
                      </Stack>
                    </Stack>
                  </CardContent>
                </Card>
              )}

              {/* Actions */}
              <Card sx={{ mb: 3, borderRadius: 3, border: "1px solid rgba(0,0,0,0.06)" }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Quick Actions
                  </Typography>
                  <Divider sx={{ mb: 3 }} />

                  <Stack spacing={2}>
                    <Button
                      variant="contained"
                      startIcon={<Download />}
                      onClick={() => salesState.handleDownloadPDF(sale)}
                      fullWidth
                      sx={{
                        borderRadius: 2,
                        textTransform: "none",
                        fontWeight: 600,
                      }}
                    >
                      Download Invoice
                    </Button>

                    {canAddPayment && (
                      <Button
                        variant="contained"
                        color="success"
                        startIcon={<Payment />}
                        onClick={salesState.handleAddPayment}
                        fullWidth
                        sx={{
                          borderRadius: 2,
                          textTransform: "none",
                          fontWeight: 600,
                        }}
                      >
                        Record Payment
                      </Button>
                    )}

                    {canEdit && (
                      <Button
                        variant="outlined"
                        color="primary"
                        startIcon={<Edit />}
                        onClick={salesState.handleEdit}
                        fullWidth
                        sx={{
                          borderRadius: 2,
                          textTransform: "none",
                          fontWeight: 600,
                        }}
                      >
                        Edit Sale
                      </Button>
                    )}

                    <Tooltip title="Delete this sale permanently">
                      <Button
                        variant="outlined"
                        color="error"
                        onClick={() => salesState.handleDeleteSale(sale.id)}
                        startIcon={<Delete />}
                        fullWidth
                        sx={{
                          borderRadius: 2,
                          textTransform: "none",
                          fontWeight: 600,
                        }}
                      >
                        Delete Sale
                      </Button>
                    </Tooltip>
                  </Stack>
                </CardContent>
              </Card>

              {/* Sale Metadata */}
              <Card sx={{ borderRadius: 3, border: "1px solid rgba(0,0,0,0.06)" }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <Avatar sx={{ bgcolor: theme.palette.info.main, mr: 2 }}>
                      <Receipt />
                    </Avatar>
                    <Typography variant="h6" fontWeight="bold">
                      Sale Information
                    </Typography>
                  </Box>
                  <Divider sx={{ mb: 3 }} />

                  <Stack spacing={2}>
                    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                      <Typography variant="body2" color="text.secondary">
                        Sale Date
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {new Date(sale?.sale_date).toLocaleDateString("en-IN")}
                      </Typography>
                    </Box>

                    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                      <Typography variant="body2" color="text.secondary">
                        Due Date
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {sale?.due_date ? new Date(sale.due_date).toLocaleDateString("en-IN") : "N/A"}
                      </Typography>
                    </Box>

                    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                      <Typography variant="body2" color="text.secondary">
                        Items Count
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {sale?.items?.length || 0} item{sale?.items?.length !== 1 ? "s" : ""}
                      </Typography>
                    </Box>

                    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                      <Typography variant="body2" color="text.secondary">
                        Total Quantity
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {sale?.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0}
                      </Typography>
                    </Box>

                    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                      <Typography variant="body2" color="text.secondary">
                        Status
                      </Typography>
                      <Chip
                        label={statusConfig?.label}
                        size="small"
                        color={statusConfig?.color}
                        icon={statusConfig?.icon}
                        sx={{ fontWeight: 600 }}
                      />
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </Fade>

      <PaymentModal
        open={salesState.paymentModalOpen}
        selectedSale={sale}
        paymentOption={salesState.paymentOption}
        customAmount={salesState.customAmount}
        onClose={salesState.handleClosePaymentModal}
        onPaymentOptionChange={salesState.setPaymentOption}
        onCustomAmountChange={salesState.setCustomAmount}
        onSubmit={salesState.handlePaymentSubmit}
      />
    </Container>
  );
};

export default SaleDetails;