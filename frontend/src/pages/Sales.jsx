import React, { use, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  IconButton,
  Stack,
  Typography,
  TextField,
  InputAdornment,
  Fade,
  Skeleton,
  Avatar,
  Divider,
  Paper,
  Tooltip,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  Add,
  Search,
  FilterList,
  ReceiptLong,
  Download as DownloadIcon,
  Person,
  CalendarToday,
  Payment,
  TrendingUp,
  Analytics,
  GridView,
  ViewList,
  Receipt,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useSales } from "../hooks/useSWR";
import generateInvoicePDF from "../utils/invoice";
import HeaderCard from "../components/HeaderCard";
import StatsCard from "../components/StatsCard";
import { sales as SalesApi } from "../services/api";

const Sales = () => {
  const theme = useTheme();
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("grid"); // 'grid' or 'list'
  const { data: sales, isLoading: loading, mutate } = useSales();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const navigate = useNavigate();

  const handleAddPayment = async (sale) => {
    const amount = prompt("Enter payment amount:");
    if (!amount) return;
    try {
      await SalesApi.addPayment(sale.id, { amount: amount });
      alert("Payment recorded successfully!");
      mutate();
    } catch (error) {
      alert(error.response?.data?.error || "Failed to add payment");
    }
  };

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

  const companyInfo = {
    name: "Your Company Name",
    tagline: "Professional Services & Solutions",
    gstin: "29ABCDE1234F2Z5",
    address:
      "123 Business Street\nBusiness District, City 560001\nKarnataka, India",
    email: "contact@yourcompany.com",
    phone: "+91 12345 67890",
    website: "www.yourcompany.com",
  };

  const handleDownloadPDF = async (sale) => {
    generateInvoicePDF(sale, companyInfo);
  };

  const filteredSales =
    sales?.results?.filter(
      (sale) =>
        sale.customer_details?.name
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        sale.sale_number.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

  const SaleCard = ({ sale, index }) => (
    <Fade in timeout={300 + index * 100}>
      <Card
        sx={{
          borderRadius: 4,
          boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
          border: "1px solid rgba(0,0,0,0.06)",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          background: "linear-gradient(135deg, #fff 0%, #f8f9ff 100%)",
          overflow: "hidden",
          "&:hover": {
            boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
            transform: "translateY(-4px) scale(1.02)",
            "& .card-actions": {
              opacity: 1,
              transform: "translateY(0)",
            },
          },
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
                <Typography variant="body2" color="error" fontWeight="600">
                  Balance Due: ₹
                  {parseFloat(sale.balance_due).toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </Typography>
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

            {/* Action Button */}
            <Box
              className="card-actions"
              sx={{
                opacity: 0.7,
                transform: "translateY(4px)",
                transition: "all 0.2s ease",
                pt: 1,
              }}
            >
              <Button
                variant="contained"
                startIcon={<DownloadIcon />}
                onClick={() => handleDownloadPDF(sale)}
                fullWidth
                sx={{
                  borderRadius: 3,
                  textTransform: "none",
                  py: 1.2,
                  fontWeight: 600,
                  background:
                    "linear-gradient(135deg, #1976d2 0%, #1565c0 100%)",
                  boxShadow: "0 4px 12px rgba(25, 118, 210, 0.3)",
                  "&:hover": {
                    background:
                      "linear-gradient(135deg, #1565c0 0%, #0d47a1 100%)",
                    boxShadow: "0 6px 16px rgba(25, 118, 210, 0.4)",
                  },
                }}
              >
                Download Invoice
              </Button>
              <Button
                variant="outlined"
                disabled={sale.balance_due <= 0}
                startIcon={<Payment />}
                onClick={() => handleAddPayment(sale)}
                fullWidth
                sx={{
                  mt: 1,
                  borderRadius: 3,
                  textTransform: "none",
                  py: 1.2,
                  fontWeight: 600,
                }}
              >
                Record Payment
              </Button>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </Fade>
  );

  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "100vh",
        bgcolor: "#f8fafc",
        p: { xs: 2, sm: 3 },
      }}
    >
      {/* Header Section */}

      <HeaderCard
        icon={<Receipt fontSize="large" />}
        title="Sales Dashboard"
        subtitle="Manage your sales and invoices efficiently"
        actionButton={
          !isMobile && (
            <Button
              variant="contained"
              size="large"
              startIcon={<Add />}
              onClick={() => navigate("/sales/new")}
              sx={{
                bgcolor: "rgba(255,255,255,0.2)",
                "&:hover": { bgcolor: "rgba(255,255,255,0.3)" },
                borderRadius: 2,
              }}
            >
              Create New Sale
            </Button>
          )
        }
      />

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatsCard
            title="Total Sales"
            value={sales?.summary?.total_sales || 0}
            icon={<TrendingUp />}
            color="primary"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatsCard
            title="Total Revenue"
            value={`₹${sales?.summary?.total_revenue.toLocaleString("en-IN")}`}
            icon={<Analytics />}
            color="success"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatsCard
            title="Paid Amount"
            value={`₹${sales?.summary?.paid_amount.toLocaleString("en-IN")}`}
            icon={<Payment />}
            color="warning"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatsCard
            title="Pending Payments"
            value={`₹${sales?.summary?.pending_payments.toLocaleString(
              "en-IN"
            )}`}
            icon={<ReceiptLong />}
            color="error"
          />
        </Grid>
      </Grid>

      {/* Search and Filter Bar */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 4,
          borderRadius: 3,
          border: "1px solid rgba(0,0,0,0.06)",
        }}
      >
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          alignItems={{ xs: "stretch", sm: "center" }}
          justifyContent="space-between"
        >
          <TextField
            placeholder="Search by customer name or invoice number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search color="action" />
                </InputAdornment>
              ),
            }}
            sx={{
              minWidth: { xs: "100%", sm: 400 },
              "& .MuiOutlinedInput-root": {
                borderRadius: 3,
                "& fieldset": { borderColor: "rgba(0,0,0,0.1)" },
              },
            }}
          />
          <Stack direction="row" spacing={1}>
            <Tooltip title="Filter">
              <IconButton
                sx={{
                  bgcolor: "rgba(0,0,0,0.04)",
                  borderRadius: 2,
                  "&:hover": { bgcolor: "rgba(0,0,0,0.08)" },
                }}
              >
                <FilterList />
              </IconButton>
            </Tooltip>
            <Tooltip title={viewMode === "grid" ? "List View" : "Grid View"}>
              <IconButton
                onClick={() =>
                  setViewMode(viewMode === "grid" ? "list" : "grid")
                }
                sx={{
                  bgcolor: "rgba(0,0,0,0.04)",
                  borderRadius: 2,
                  "&:hover": { bgcolor: "rgba(0,0,0,0.08)" },
                }}
              >
                {viewMode === "grid" ? <ViewList /> : <GridView />}
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>
      </Paper>

      {/* Sales Grid */}
      {loading ? (
        <Grid container spacing={3}>
          {[...Array(6)].map((_, index) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
              <Skeleton
                variant="rectangular"
                height={300}
                sx={{ borderRadius: 4 }}
              />
            </Grid>
          ))}
        </Grid>
      ) : filteredSales.length ? (
        <Grid container spacing={3}>
          {filteredSales.map((sale, index) => (
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 4 }} key={sale.id}>
              <SaleCard sale={sale} index={index} />
            </Grid>
          ))}
        </Grid>
      ) : (
        <Paper
          elevation={0}
          sx={{
            p: 8,
            textAlign: "center",
            borderRadius: 4,
            border: "2px dashed rgba(0,0,0,0.1)",
            bgcolor: "rgba(0,0,0,0.02)",
          }}
        >
          <Avatar
            sx={{
              width: 80,
              height: 80,
              bgcolor: "rgba(0,0,0,0.04)",
              mx: "auto",
              mb: 3,
            }}
          >
            <ReceiptLong sx={{ fontSize: 40, color: "rgba(0,0,0,0.3)" }} />
          </Avatar>
          <Typography
            variant="h5"
            fontWeight="600"
            sx={{ mb: 1, color: "rgba(0,0,0,0.7)" }}
          >
            No Sales Found
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            {searchTerm
              ? "Try adjusting your search terms"
              : "Start by creating your first sale"}
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => navigate("/sales/new")}
            sx={{
              borderRadius: 3,
              textTransform: "none",
              px: 4,
              py: 1.5,
              fontWeight: 600,
            }}
          >
            Create First Sale
          </Button>
        </Paper>
      )}
    </Box>
  );
};

export default Sales;
