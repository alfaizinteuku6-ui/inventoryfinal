import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  TextField,
  Typography,
  MenuItem,
  Alert,
  Divider,
  Paper,
  Fade,
  Chip,
  Avatar,
  useTheme,
  alpha,
  Container,
  Stepper,
  Step,
  StepLabel,
  Backdrop,
  CircularProgress,
  Tooltip,
} from "@mui/material";
import {
  Add,
  Person,
  Payment,
  AttachMoney,
  Save,
  Cancel,
  Store,
} from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";
import { useProducts, useCustomers, useSale } from "../hooks/useSWR";
import { sales } from "../services/api";
import SaleItemRow from "../components/Sale/SaleItemRow ";
import CustomerDialog from "../components/CustomerDailog";

const CreateSale = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { id: saleId } = useParams();
  const { data: products } = useProducts();
  const { data: customers, mutate } = useCustomers();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const steps = ["Customer Info", "Items & Pricing", "Payment & Summary"];
  const [customerDialogOpen, setCustomerDialogOpen] = useState(false);
  const initialData = {
    customer: "",
    payment_method: "cash",
    notes: "",
    due_date: null,
    items: [
      {
        product: "",
        product_name: "",
        product_sku: "",
        quantity: 1,
        unit_price: "",
        discount_percent: 0,
        tax_rate: 0,
        line_total: "",
      },
    ],
  };
  const [saleData, setSaleData] = useState(initialData);
  const [isEditMode, setIsEditMode] = useState(false);
  const { data: saleDateById, isLoading, isError } = useSale(saleId);

 useEffect(() => {
    if (saleId && saleDateById) {
      setIsEditMode(true);
      setSaleData({...saleDateById, customer: saleDateById.customer_details?.id || ""});
    }
  },[saleId, saleDateById]);

  const updateItem = (index, field, value) => {
    const newItems = [...saleData.items];
    newItems[index] = { ...newItems[index], [field]: value };

    // If product is updated, auto-fill price
    if (field === "product") {
      const selectedProduct = products?.results?.find((p) => p.id === value);
      if (selectedProduct) {
        newItems[index].product_name = selectedProduct.name;
        newItems[index].product_sku = selectedProduct.sku || "";
        newItems[index].unit_price =
          selectedProduct.selling_price?.toString() || "0.00";
      }
    }

    setSaleData({ ...saleData, items: newItems });
  };

  const handleAddItem = () => {
    setSaleData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          product: "",
          product_name: "",
          product_sku: "",
          quantity: 1,
          unit_price: "",
          discount_percent: 0,
          tax_rate: 0,
          line_total: "",
        },
      ],
    }));
  };

  const handleRemoveItem = (index) => {
    const newItems = saleData.items.filter((_, i) => i !== index);
    setSaleData({ ...saleData, items: newItems });
  };

  const resetSaleForm = () => {
    setSaleData(initialData);
    setActiveStep(0);
    setError(null);
    setLoading(false);
  };

  const calculateTotals = () => {
    const totals = saleData.items.reduce(
      (acc, item) => {
        const quantity = parseInt(item.quantity) || 0;
        const unitPrice = parseFloat(item.unit_price) || 0;
        const discount = parseFloat(item.discount_percent) || 0;
        const tax = parseFloat(item.tax_rate) || 0;

        const subtotal = quantity * unitPrice;
        const discountAmount = subtotal * (discount / 100);
        const afterDiscount = subtotal - discountAmount;
        const taxAmount = afterDiscount * (tax / 100);

        return {
          subtotal: acc.subtotal + subtotal,
          discount: acc.discount + discountAmount,
          tax: acc.tax + taxAmount,
          total: acc.total + afterDiscount + taxAmount,
        };
      },
      { subtotal: 0, discount: 0, tax: 0, total: 0 }
    );

    return {
      subtotal: totals.subtotal.toFixed(2),
      discount: totals.discount.toFixed(2),
      tax: totals.tax.toFixed(2),
      total: totals.total.toFixed(2),
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const formattedData = {
        ...saleData,
        items: saleData.items.map((item) => ({
          ...item,
          quantity: parseInt(item.quantity),
          unit_price: parseFloat(item.unit_price),
          discount_percent: parseFloat(item.discount_percent),
          tax_rate: parseFloat(item.tax_rate),
          line_total: parseFloat(item.line_total),
        })),
      };
      if(isEditMode){
        await sales.update(saleId, formattedData);
      }else{
        await sales.create(formattedData);
      }
      resetSaleForm();
      navigate("/sales");
    } catch (error) {
      setError(error.response?.data || "Error creating sale");
      setLoading(false);
    }
  };

  const totals = calculateTotals();

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Backdrop open={loading} sx={{ zIndex: theme.zIndex.drawer + 1 }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
          }}
        >
          <CircularProgress color="primary" />
          <Typography color="white">Creating sale...</Typography>
        </Box>
      </Backdrop>

      <Fade in timeout={500}>
        <Box>
          {/* Header */}
          <Box sx={{ mb: 4, textAlign: "center" }}>
            <Typography
              variant="h3"
              fontWeight="bold"
              sx={{
                background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                mb: 1,
              }}
            >
             { isEditMode ? "Edit" : "Create New"} Sale
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Build your sales transaction with our modern interface
            </Typography>
          </Box>

          {/* Stepper */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              mb: 4,
              borderRadius: 3,
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            }}
          >
            <Stepper activeStep={activeStep} alternativeLabel>
              {steps.map((label, index) => (
                <Step key={label}>
                  <StepLabel
                    sx={{
                      "& .MuiStepLabel-label": {
                        fontWeight: 600,
                        fontSize: "0.9rem",
                      },
                    }}
                  >
                    {label}
                  </StepLabel>
                </Step>
              ))}
            </Stepper>
          </Paper>

          {error && (
            <Fade in>
              <Alert
                severity="error"
                sx={{
                  mb: 3,
                  borderRadius: 2,
                  "& .MuiAlert-message": { fontWeight: 500 },
                }}
              >
                {error}
              </Alert>
            </Fade>
          )}

          <Card
            elevation={0}
            sx={{
              borderRadius: 4,
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              background: `linear-gradient(135deg, ${alpha(
                theme.palette.background.paper,
                0.8
              )} 0%, ${alpha(theme.palette.primary.main, 0.02)} 100%)`,
              overflow: "visible",
            }}
          >
            <CardContent sx={{ p: 4 }}>
              <form onSubmit={handleSubmit}>
                {/* Customer Section */}
                <Box sx={{ mb: 4 }}>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <Avatar sx={{ bgcolor: theme.palette.primary.main, mr: 2 }}>
                      <Person />
                    </Avatar>
                    <Typography variant="h5" fontWeight="bold">
                      Customer Information
                    </Typography>
                  </Box>
                  <Divider sx={{ mb: 3, opacity: 0.3 }} />
                  <Grid container spacing={3}>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Box display="flex" gap={1}>
                        <TextField
                          select
                          label="Select Customer"
                          fullWidth
                          value={saleData.customer}
                          onChange={(e) =>
                            setSaleData({
                              ...saleData,
                              customer: e.target.value,
                            })
                          }
                          required
                          variant="outlined"
                          sx={{
                            minWidth: 240, // 🔹 ensures initial minimum width
                            "& .MuiOutlinedInput-root": {
                              borderRadius: 2,
                              "&:hover .MuiOutlinedInput-notchedOutline": {
                                borderColor: (theme) =>
                                  theme.palette.primary.main,
                              },
                            },
                          }}
                        >
                          {customers?.results?.map((customer) => (
                            <MenuItem key={customer.id} value={customer.id}>
                              <Box
                                sx={{
                                  display: "flex",
                                  flexDirection: "column",
                                }}
                              >
                                <Typography variant="body2" fontWeight={500}>
                                  {customer.name}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  {customer.email}
                                </Typography>
                              </Box>
                            </MenuItem>
                          ))}
                        </TextField>
                        <Tooltip title="Add New Customer">
                          <Button
                            variant="outlined"
                            onClick={() => setCustomerDialogOpen(true)}
                            sx={{
                              minWidth: 56,
                              height: 56,
                              borderRadius: 2,
                            }}
                          >
                            <Add />
                          </Button>
                        </Tooltip>
                      </Box>
                    </Grid>
                  </Grid>
                </Box>

                {/* Items Section */}
                <Box sx={{ mb: 4 }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      mb: 2,
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Avatar
                        sx={{ bgcolor: theme.palette.secondary.main, mr: 2 }}
                      >
                        <Store />
                      </Avatar>
                      <Typography variant="h5" fontWeight="bold">
                        Sale Items
                      </Typography>
                    </Box>
                    <Chip
                      label={`${saleData.items.length} item${
                        saleData.items.length !== 1 ? "s" : ""
                      }`}
                      color="secondary"
                    />
                  </Box>
                  <Divider sx={{ mb: 3, opacity: 0.3 }} />

                  {saleData.items.map((item, index) => (
                    <SaleItemRow
                      key={index}
                      item={item}
                      index={index}
                      products={products}
                      onUpdate={updateItem}
                      onRemove={handleRemoveItem}
                      disableRemove={saleData.items.length === 1}
                    />
                  ))}

                  <Button
                    startIcon={<Add />}
                    onClick={handleAddItem}
                    variant="outlined"
                    sx={{
                      borderRadius: 3,
                      py: 1.5,
                      px: 3,
                      fontWeight: 600,
                      textTransform: "none",
                      borderStyle: "dashed",
                      "&:hover": {
                        borderStyle: "solid",
                        transform: "scale(1.02)",
                      },
                    }}
                  >
                    Add Another Item
                  </Button>
                </Box>

                {/* Payment & Notes Section */}
                <Box sx={{ mb: 4 }}>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <Avatar sx={{ bgcolor: theme.palette.info.main, mr: 2 }}>
                      <Payment />
                    </Avatar>
                    <Typography variant="h5" fontWeight="bold">
                      Payment & Notes
                    </Typography>
                  </Box>
                  <Divider sx={{ mb: 3, opacity: 0.3 }} />
                  <Grid container spacing={3}>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        select
                        label="Payment Method"
                        fullWidth
                        value={saleData.payment_method}
                        onChange={(e) =>
                          setSaleData({
                            ...saleData,
                            payment_method: e.target.value,
                          })
                        }
                        required
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: 2,
                          },
                        }}
                      >
                        <MenuItem value="cash">💵 Cash</MenuItem>
                        <MenuItem value="card">💳 Card</MenuItem>
                        <MenuItem value="upi">📱 UPI</MenuItem>
                        <MenuItem value="bank_transfer">
                          🏦 Bank Transfer
                        </MenuItem>
                        <MenuItem value="credit">📄 Credit</MenuItem>
                      </TextField>
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                      <TextField
                        label="Additional Notes"
                        multiline
                        rows={3}
                        fullWidth
                        value={saleData.notes}
                        onChange={(e) =>
                          setSaleData({ ...saleData, notes: e.target.value })
                        }
                        placeholder="Add any special instructions or notes for this sale..."
                        sx={{
                          width: "100%", // 🔹 ensures initial minimum width
                          "& .MuiOutlinedInput-root": {
                            borderRadius: 2,
                          },
                        }}
                      />
                    </Grid>
                  </Grid>
                </Box>

                {/* Summary Section */}
                <Box sx={{ mb: 4 }}>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <Avatar sx={{ bgcolor: theme.palette.success.main, mr: 2 }}>
                      <AttachMoney />
                    </Avatar>
                    <Typography variant="h5" fontWeight="bold">
                      Sale Summary
                    </Typography>
                  </Box>
                  <Divider sx={{ mb: 3, opacity: 0.3 }} />
                  <Paper
                    sx={{
                      p: 4,
                      borderRadius: 3,
                      background: `linear-gradient(135deg, ${alpha(
                        theme.palette.success.main,
                        0.1
                      )} 0%, ${alpha(theme.palette.success.main, 0.05)} 100%)`,
                      border: `1px solid ${alpha(
                        theme.palette.success.main,
                        0.2
                      )}`,
                    }}
                  >
                    <Grid container spacing={3}>
                      <Grid size={{ xs: 12, md: 3 }}>
                        <Box sx={{ textAlign: "center" }}>
                          <Typography
                            variant="h4"
                            fontWeight="bold"
                            color="text.primary"
                          >
                            ₹{parseInt(totals.subtotal).toLocaleString("en-IN")}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Subtotal
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid size={{ xs: 12, md: 3 }}>
                        <Box sx={{ textAlign: "center" }}>
                          <Typography
                            variant="h4"
                            fontWeight="bold"
                            color="warning.main"
                          >
                            ₹{parseInt(totals.discount).toLocaleString("en-IN")}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Discount
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid size={{ xs: 12, md: 3 }}>
                        <Box sx={{ textAlign: "center" }}>
                          <Typography
                            variant="h4"
                            fontWeight="bold"
                            color="info.main"
                          >
                            ₹{parseInt(totals.tax).toLocaleString("en-IN")}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Tax
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid size={{ xs: 12, md: 3 }}>
                        <Box
                          sx={{
                            textAlign: "center",
                            p: 2,
                            borderRadius: 2,
                            bgcolor: alpha(theme.palette.success.main, 0.1),
                            border: `2px solid ${theme.palette.success.main}`,
                          }}
                        >
                          <Typography
                            variant="h3"
                            fontWeight="bold"
                            color="success.main"
                          >
                            ₹{parseInt(totals.total).toLocaleString("en-IN")}
                          </Typography>
                          <Typography
                            variant="body1"
                            fontWeight={600}
                            color="success.main"
                          >
                            Total Amount
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </Paper>
                </Box>

                {/* Action Buttons */}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    gap: 3,
                    pt: 2,
                  }}
                >
                  <Button
                    variant="outlined"
                    size="large"
                    startIcon={<Cancel />}
                    onClick={resetSaleForm}
                    sx={{
                      borderRadius: 3,
                      px: 4,
                      py: 1.5,
                      fontWeight: 600,
                      textTransform: "none",
                    }}
                  >
                    Cancel Sale
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    startIcon={<Save />}
                    disabled={loading}
                    sx={{
                      borderRadius: 3,
                      px: 4,
                      py: 1.5,
                      fontWeight: 600,
                      textTransform: "none",
                      background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                      "&:hover": {
                        background: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
                        transform: "scale(1.05)",
                      },
                    }}
                  >
                    {loading ? isEditMode ? "Updating Sale..." : "Creating Sale..." : isEditMode ? "Update Sale" : "Create Sale"}
                  </Button>
                </Box>
              </form>
            </CardContent>
          </Card>
        </Box>
      </Fade>
      <CustomerDialog
        open={customerDialogOpen}
        onClose={() => setCustomerDialogOpen(false)}
        editingCustomer={null}
        mutate={mutate}
      />
    </Container>
  );
};

export default CreateSale;
