// Sales/components/SaleCard.js
import React from "react";
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
  const getStatusColor = (status) => {
    switch (status) {
      case "paid":
        return "success";
      case "pending":
        return "warning";
      case "overdue":
        return "error";
      default:
        return "default";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "paid":
        return "✓";
      case "pending":
        return "⏳";
      case "overdue":
        return "⚠️";
      default:
        return "•";
    }
  };

  const getPaymentMethodColor = (method) => {
    switch (method.toLowerCase()) {
      case "upi":
        return "#00C853";
      case "cash":
        return "#FF6F00";
      case "credit card":
        return "#1976D2";
      case "bank transfer":
        return "#7B1FA2";
      default:
        return "#424242";
    }
  };

  const handleDownloadPDF = async () => {
    generateInvoicePDF(sale, companyInfo);
  };

  return (
    <Fade in timeout={300 + index * 100}>
      <Card
        sx={{
          borderRadius: 4,
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            height: 6,
            background: `linear-gradient(90deg, ${getPaymentMethodColor(
              sale.payment_method
            )} 0%, ${getPaymentMethodColor(sale.payment_method)}80 100%)`,
          }}
        />
        <CardContent sx={{ p: 3 }}>
          <Stack spacing={2.5}>
            {/* Header with Invoice Number and Status */}
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="flex-start"
            >
              <Stack direction="row" alignItems="center" spacing={1.5}>
                <Avatar
                  sx={{
                    width: 36,
                    height: 36,
                    bgcolor: "primary.main",
                    fontSize: "0.875rem",
                  }}
                >
                  <ReceiptLong fontSize="small" />
                </Avatar>
                <Box>
                  <Typography
                    variant="subtitle1"
                    fontWeight="700"
                    color="primary"
                  >
                    {sale.sale_number}
                  </Typography>
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

              <Chip
                label={`${getStatusIcon(sale.payment_status)} ${
                  sale.payment_status.charAt(0).toUpperCase() +
                  sale.payment_status.slice(1)
                }`}
                size="small"
                color={getStatusColor(sale.payment_status)}
                sx={{
                  fontWeight: 600,
                  borderRadius: 2,
                  "& .MuiChip-label": { px: 1.5 },
                }}
              />
            </Stack>

            {/* Customer Name */}
            <Box>
              <Typography
                variant="h6"
                fontWeight="600"
                sx={{ mb: 0.5, lineHeight: 1.3 }}
              >
                {sale.customer_name}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
              >
                <Person sx={{ fontSize: 14 }} />
                by {sale.salesperson_name}
              </Typography>
            </Box>

            <Divider sx={{ my: 1 }} />

            {/* Amount and Details */}
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Box>
                <Typography
                  variant="h5"
                  fontWeight="700"
                  color="primary.main"
                  sx={{ mb: 0.5 }}
                >
                  ₹
                  {parseFloat(sale.total_amount).toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {sale.items_count} item{sale.items_count !== 1 ? "s" : ""}
                </Typography>
                {sale.balance_due > 0 && (
                  <Typography variant="body2" color="error" fontWeight="600">
                    Balance Due: ₹
                    {parseFloat(sale.balance_due).toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </Typography>
                )}
              </Box>
              <Chip
                label={sale.payment_method}
                size="small"
                variant="outlined"
                sx={{
                  borderColor: getPaymentMethodColor(sale.payment_method),
                  color: getPaymentMethodColor(sale.payment_method),
                  fontWeight: 600,
                  borderRadius: 2,
                }}
              />
            </Stack>

            {/* Main Action Buttons */}
            <Box
              className="card-actions"
              sx={{
                opacity: 0.7,
                transform: "translateY(4px)",
                transition: "all 0.2s ease",
                pt: 1,
              }}
            >
              <Stack spacing={1.5}>
                {/* Primary Actions Row */}
                <Stack direction="row" spacing={1}>
                  <Button
                    variant="contained"
                    startIcon={<DownloadIcon />}
                    onClick={handleDownloadPDF}
                    size="small"
                    sx={{
                      flex: 1,
                      borderRadius: 2,
                      textTransform: "none",
                      fontWeight: 600,
                    }}
                  >
                    Download
                  </Button>
                  {sale.balance_due > 0 &&
                    sale.payment_status !== "cancelled" && (
                      <Button
                        variant="contained"
                        color="success"
                        startIcon={<Payment />}
                        onClick={() => onAddPayment(sale)}
                        size="small"
                        sx={{
                          flex: 1,
                          borderRadius: 2,
                          textTransform: "none",
                          fontWeight: 600,
                        }}
                      >
                        Pay Now
                      </Button>
                    )}
                </Stack>

                {/* Secondary Actions Row */}
                <Stack direction="row" spacing={1}>
                  <Button
                    variant="outlined"
                    color="success"
                    startIcon={<Visibility />}
                    onClick={() => navigate(`/sales/${sale.id}`)}
                    size="small"
                    sx={{
                      flex: 1,
                      borderRadius: 2,
                      fontWeight: 600,
                    }}
                  >
                    View
                  </Button>
                  {sale.payment_status !== "paid" &&
                    sale.payment_status !== "cancelled" && (
                      <Button
                        variant="outlined"
                        color="warning"
                        startIcon={<Cancel />}
                        onClick={() => onCancelSale(sale)}
                        size="small"
                        sx={{
                          flex: 1,
                          borderRadius: 2,
                          textTransform: "none",
                          fontWeight: 600,
                        }}
                      >
                        Cancel
                      </Button>
                    )}

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
              </Stack>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </Fade>
  );
};

export default SaleCard;