import React, { useState, useEffect } from "react";
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
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import {
  ArrowBack,
  Edit,
  Delete,
  Download,
  Payment,
  MoreVert,
  Person,
  CalendarToday,
  Receipt,
  Store,
  AttachMoney,
} from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";
import { sales } from "../services/api";
import generateInvoicePDF from "../utils/invoice";
import { useSale } from "../hooks/useSWR";

const SaleDetails = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { id } = useParams();
  const {data: sale, isLoading: loading, error } = useSale(id);
  const [menuAnchor, setMenuAnchor] = useState(null);

  const handleMenuClick = (event) => {
    setMenuAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  const handleEdit = () => {
    navigate(`/sales/${id}/edit`);
    handleMenuClose();
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this sale? This action cannot be undone.")) {
      try {
        await sales.delete(id);
        navigate("/sales");
      } catch (error) {
        alert(error.response?.data?.error || "Failed to delete sale");
      }
    }
    handleMenuClose();
  };

  const handleAddPayment = async () => {
    const amount = prompt("Enter payment amount:");
    if (!amount) return;
    try {
      await sales.addPayment(id, { amount });
      // Refresh sale data
      const response = await sales.get(id);
      
      alert("Payment recorded successfully!");
    } catch (error) {
      alert(error.response?.data?.error || "Failed to add payment");
    }
  };

  const companyInfo = {
    name: "Your Company Name",
    tagline: "Professional Services & Solutions",
    gstin: "29ABCDE1234F2Z5",
    address: "123 Business Street\nBusiness District, City 560001\nKarnataka, India",
    email: "contact@yourcompany.com",
    phone: "+91 12345 67890",
    website: "www.yourcompany.com",
  };

  const handleDownloadPDF = () => {
    generateInvoicePDF(sale, companyInfo);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "paid": return "success";
      case "pending": return "warning";
      case "overdue": return "error";
      default: return "default";
    }
  };

  const getPaymentMethodColor = (method) => {
    switch (method?.toLowerCase()) {
      case "upi": return "#00C853";
      case "cash": return "#FF6F00";
      case "credit card": return "#1976D2";
      case "bank transfer": return "#7B1FA2";
      default: return "#424242";
    }
  };

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Skeleton variant="text" width={200} height={40} sx={{ mb: 2 }} />
        <Skeleton variant="text" width="60%" height={60} sx={{ mb: 4 }} />
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 3 }} />
          </Grid>
          <Grid item xs={12} md={4}>
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
          <Typography variant="h6" color="error" gutterBottom>
            Error Loading Sale
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {typeof error === 'string' ? error : JSON.stringify(error)}
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
            
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Box>
                <Typography variant="h4" fontWeight="bold" gutterBottom>
                  Sale #{sale?.sale_number}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Created on {new Date(sale?.sale_date).toLocaleDateString("en-IN", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Typography>
              </Box>
              
              <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                <Chip
                  label={sale?.payment_status?.charAt(0).toUpperCase() + sale?.payment_status?.slice(1)}
                  color={getStatusColor(sale?.payment_status)}
                  sx={{ fontWeight: 600 }}
                />
                <IconButton
                  onClick={handleMenuClick}
                  sx={{
                    bgcolor: "rgba(0,0,0,0.04)",
                    "&:hover": { bgcolor: "rgba(0,0,0,0.08)" },
                  }}
                >
                  <MoreVert />
                </IconButton>
              </Box>
            </Box>
          </Box>

          <Grid container spacing={4}>
            {/* Main Content */}
            <Grid item xs={12} md={8}>
              {/* Customer Information */}
              <Card sx={{ mb: 3, borderRadius: 3 }}>
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
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Customer Name
                      </Typography>
                      <Typography variant="body1" fontWeight={600}>
                        {sale?.customer_name || "N/A"}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Salesperson
                      </Typography>
                      <Typography variant="body1" fontWeight={600}>
                        {sale?.salesperson_name || "N/A"}
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {/* Sale Items */}
              <Card sx={{ borderRadius: 3 }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <Avatar sx={{ bgcolor: theme.palette.secondary.main, mr: 2 }}>
                      <Store />
                    </Avatar>
                    <Typography variant="h6" fontWeight="bold">
                      Sale Items
                    </Typography>
                  </Box>
                  <Divider sx={{ mb: 3 }} />
                  
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
                        {sale?.items?.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell>
                              <Box>
                                <Typography variant="body2" fontWeight={600}>
                                  {item.product_name}
                                </Typography>
                                {item.product_sku && (
                                  <Typography variant="caption" color="text.secondary">
                                    SKU: {item.product_sku}
                                  </Typography>
                                )}
                              </Box>
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
                    <Typography variant="body2" color="text.secondary">
                      {sale.notes}
                    </Typography>
                  </CardContent>
                </Card>
              )}
            </Grid>

            {/* Sidebar */}
            <Grid item xs={12} md={4}>
              {/* Payment Summary */}
              <Card sx={{ mb: 3, borderRadius: 3 }}>
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
                        ₹{parseFloat(sale?.total_amount || 0).toLocaleString("en-IN")}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                      <Typography variant="body2" color="text.secondary">
                        Paid Amount
                      </Typography>
                      <Typography variant="body1" fontWeight={600} color="success.main">
                        ₹{parseFloat(sale?.paid_amount || 0).toLocaleString("en-IN")}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                      <Typography variant="body2" color="text.secondary">
                        Balance Due
                      </Typography>
                      <Typography 
                        variant="body1" 
                        fontWeight={600}
                        color={sale?.balance_due > 0 ? "error.main" : "success.main"}
                      >
                        ₹{parseFloat(sale?.balance_due || 0).toLocaleString("en-IN")}
                      </Typography>
                    </Box>
                    
                    <Divider />
                    
                    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                      <Typography variant="body2" color="text.secondary">
                        Payment Method
                      </Typography>
                      <Chip
                        label={sale?.payment_method || "N/A"}
                        size="small"
                        sx={{
                          bgcolor: alpha(getPaymentMethodColor(sale?.payment_method), 0.1),
                          color: getPaymentMethodColor(sale?.payment_method),
                          fontWeight: 600,
                        }}
                      />
                    </Box>
                  </Stack>
                </CardContent>
              </Card>

              {/* Actions */}
              <Card sx={{ borderRadius: 3 }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Quick Actions
                  </Typography>
                  <Divider sx={{ mb: 3 }} />
                  
                  <Stack spacing={2}>
                    <Button
                      variant="contained"
                      startIcon={<Download />}
                      onClick={handleDownloadPDF}
                      fullWidth
                      sx={{
                        borderRadius: 2,
                        textTransform: "none",
                        fontWeight: 600,
                      }}
                    >
                      Download Invoice
                    </Button>
                    
                    {sale?.balance_due > 0 && (
                      <Button
                        variant="outlined"
                        startIcon={<Payment />}
                        onClick={handleAddPayment}
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
                    
                    <Button
                      variant="outlined"
                      startIcon={<Edit />}
                      onClick={handleEdit}
                      fullWidth
                      sx={{
                        borderRadius: 2,
                        textTransform: "none",
                        fontWeight: 600,
                      }}
                    >
                      Edit Sale
                    </Button>
                  </Stack>
                </CardContent>
              </Card>

              {/* Sale Metadata */}
              <Card sx={{ mt: 3, borderRadius: 3 }}>
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
                        {sale?.items?.length || 0} item{sale?.items?.length !== 1 ? 's' : ''}
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
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </Fade>

      {/* Context Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        PaperProps={{
          sx: {
            borderRadius: 2,
            minWidth: 180,
            boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
          },
        }}
      >
        <MenuItem onClick={handleEdit}>
          <ListItemIcon>
            <Edit fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit Sale</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleDownloadPDF}>
          <ListItemIcon>
            <Download fontSize="small" />
          </ListItemIcon>
          <ListItemText>Download Invoice</ListItemText>
        </MenuItem>
        {sale?.balance_due > 0 && (
          <MenuItem onClick={handleAddPayment}>
            <ListItemIcon>
              <Payment fontSize="small" />
            </ListItemIcon>
            <ListItemText>Record Payment</ListItemText>
          </MenuItem>
        )}
        <Divider />
        <MenuItem onClick={handleDelete} sx={{ color: "error.main" }}>
          <ListItemIcon>
            <Delete fontSize="small" sx={{ color: "error.main" }} />
          </ListItemIcon>
          <ListItemText>Delete Sale</ListItemText>
        </MenuItem>
      </Menu>
    </Container>
  );
};

export default SaleDetails;