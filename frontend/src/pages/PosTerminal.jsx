import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  TextField,
  InputAdornment,
  Button,
  IconButton,
  Chip,
  Badge,
  Divider,
  Paper,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Alert,
  CircularProgress,
  Tooltip,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Search,
  ShoppingCart,
  Add,
  Remove,
  Delete,
  PersonAdd,
  Payment,
  Receipt,
  CheckCircle,
  Print,
  Clear,
  LocalOffer,
  Storefront,
  QrCodeScanner,
  Inventory2,
  AttachMoney,
  CreditCard,
  AccountBalance,
  Schedule,
  PointOfSale,
  Cancel,
} from '@mui/icons-material';
import { useProducts, useCategories, useCustomers } from '../hooks/useSWR';
import { sales } from '../services/api';
import CustomerDialog from '../components/Customers/CustomerDailog';
import CustomSnackbar from '../components/CustomSnackbar';
import { getPrinterConfig } from '../utils/printerService';

const PosTerminal = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  // Printer configuration state
  const [printerConfig, setPrinterConfig] = useState(getPrinterConfig());

  useEffect(() => {
    const updateConfig = () => setPrinterConfig(getPrinterConfig());
    window.addEventListener('printer_config_changed', updateConfig);
    return () => window.removeEventListener('printer_config_changed', updateConfig);
  }, []);

  // Data fetching
  const { data: productsData, mutate: refreshProducts, isLoading: loadingProducts } = useProducts({ page_size: 100 });
  const { data: categoriesData } = useCategories();
  const { data: customersData, mutate: refreshCustomers } = useCustomers({ page_size: 100 });

  // State
  const [cart, setCart] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [customerDialogOpen, setCustomerDialogOpen] = useState(false);

  // Checkout & Payment State
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [cashReceived, setCashReceived] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [saleNotes, setSaleNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Success / Receipt State
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [completedSale, setCompletedSale] = useState(null);
  const [lastPaymentInfo, setLastPaymentInfo] = useState({ cashReceived: 0, change: 0 });

  // Snackbar Notification
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Search input ref for quick barcode scanning focus
  const searchInputRef = useRef(null);

  // Set default customer to 'Pelanggan Umum' once customersData is loaded
  useEffect(() => {
    if (!selectedCustomer && customersData?.results) {
      const walkIn = customersData.results.find(
        (c) => c.name.toLowerCase().includes('umum') || c.name.toLowerCase().includes('walk-in')
      );
      if (walkIn) {
        setSelectedCustomer(walkIn.id);
      } else if (customersData.results.length > 0) {
        setSelectedCustomer(customersData.results[0].id);
      }
    }
  }, [customersData, selectedCustomer]);

  // Auto-print effect when receipt opens
  useEffect(() => {
    if (receiptOpen && printerConfig.autoPrint && printerConfig.isConnected) {
      const timer = setTimeout(() => {
        window.print();
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [receiptOpen, printerConfig]);

  // Extract products array safely
  const productList = useMemo(() => {
    return productsData?.results || (Array.isArray(productsData) ? productsData : []);
  }, [productsData]);

  // Extract categories array safely
  const categoryList = useMemo(() => {
    return categoriesData?.results || (Array.isArray(categoriesData) ? categoriesData : []);
  }, [categoriesData]);

  // Extract customers array safely
  const customerList = useMemo(() => {
    return customersData?.results || (Array.isArray(customersData) ? customersData : []);
  }, [customersData]);

  // Filtered products based on search & category
  const filteredProducts = useMemo(() => {
    return productList.filter((product) => {
      const matchesCategory =
        selectedCategory === 'all' ||
        product.category === selectedCategory ||
        product.category_name === selectedCategory;

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        product.name.toLowerCase().includes(q) ||
        (product.sku && product.sku.toLowerCase().includes(q)) ||
        (product.barcode && product.barcode.toLowerCase().includes(q));

      return matchesCategory && matchesSearch;
    });
  }, [productList, selectedCategory, searchQuery]);

  // Handle barcode Enter key in search box
  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      const exactMatch = productList.find(
        (p) =>
          (p.barcode && p.barcode.toLowerCase() === searchQuery.toLowerCase().trim()) ||
          (p.sku && p.sku.toLowerCase() === searchQuery.toLowerCase().trim())
      );
      if (exactMatch) {
        addToCart(exactMatch);
        setSearchQuery('');
        e.preventDefault();
      }
    }
  };

  // Cart Operations
  const addToCart = (product) => {
    if (product.stock_quantity <= 0) {
      setSnackbar({ open: true, message: `Stok ${product.name} telah habis!`, severity: 'warning' });
      return;
    }

    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex((item) => item.product.id === product.id);
      if (existingIndex > -1) {
        const currentQty = prevCart[existingIndex].quantity;
        if (currentQty + 1 > product.stock_quantity) {
          setSnackbar({
            open: true,
            message: `Stok maksimum untuk ${product.name} hanya tersedia ${product.stock_quantity}`,
            severity: 'warning',
          });
          return prevCart;
        }
        const updated = [...prevCart];
        updated[existingIndex] = { ...updated[existingIndex], quantity: currentQty + 1 };
        return updated;
      } else {
        return [...prevCart, { product, quantity: 1, discount_percent: 0 }];
      }
    });
  };

  const updateQuantity = (productId, delta) => {
    setCart((prevCart) => {
      const item = prevCart.find((i) => i.product.id === productId);
      if (!item) return prevCart;

      const newQty = item.quantity + delta;
      if (newQty <= 0) {
        return prevCart.filter((i) => i.product.id !== productId);
      }
      if (newQty > item.product.stock_quantity) {
        setSnackbar({
          open: true,
          message: `Stok maksimum ${item.product.name} adalah ${item.product.stock_quantity}`,
          severity: 'warning',
        });
        return prevCart;
      }

      return prevCart.map((i) => (i.product.id === productId ? { ...i, quantity: newQty } : i));
    });
  };

  const removeFromCart = (productId) => {
    setCart((prevCart) => prevCart.filter((item) => item.product.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
  };

  // Calculations
  const calculations = useMemo(() => {
    let subtotal = 0;
    let totalDiscount = 0;

    cart.forEach((item) => {
      const price = parseFloat(item.product.selling_price) || 0;
      const itemSubtotal = item.quantity * price;
      const discountAmount = itemSubtotal * ((item.discount_percent || 0) / 100);
      subtotal += itemSubtotal;
      totalDiscount += discountAmount;
    });

    const netSubtotal = subtotal - totalDiscount;
    const taxRate = 11; // PPN 11%
    const taxAmount = Math.round(netSubtotal * (taxRate / 100));
    const grandTotal = Math.round(netSubtotal + taxAmount);

    return {
      subtotal,
      totalDiscount,
      taxAmount,
      grandTotal,
      totalItems: cart.reduce((sum, item) => sum + item.quantity, 0),
    };
  }, [cart]);

  // Cash change calculation
  const cashNum = parseFloat(cashReceived) || 0;
  const change = Math.max(0, cashNum - calculations.grandTotal);
  const isCashInsufficient = paymentMethod === 'cash' && cashNum < calculations.grandTotal;

  // Open Checkout Dialog with default cash suggestion
  const handleOpenCheckout = () => {
    if (cart.length === 0) return;
    setCashReceived(calculations.grandTotal.toString());
    setPaymentMethod('cash');
    setCheckoutOpen(true);
  };

  // Generate clean cash quick-pick options
  const cashSuggestions = useMemo(() => {
    const total = calculations.grandTotal;
    const suggestions = [total]; // Exact amount

    const roundedBases = [50000, 100000, 200000, 500000];
    roundedBases.forEach((amt) => {
      if (amt > total && !suggestions.includes(amt)) {
        suggestions.push(amt);
      }
    });

    // Also offer next round 10.000 or 50.000 if not already in list
    const nextTenK = Math.ceil(total / 10000) * 10000;
    if (nextTenK > total && !suggestions.includes(nextTenK)) {
      suggestions.push(nextTenK);
    }
    const nextFiftyK = Math.ceil(total / 50000) * 50000;
    if (nextFiftyK > total && !suggestions.includes(nextFiftyK)) {
      suggestions.push(nextFiftyK);
    }

    return suggestions.sort((a, b) => a - b).slice(0, 5);
  }, [calculations.grandTotal]);

  // Submit sale to API
  const handleCompleteSale = async () => {
    if (!selectedCustomer) {
      setSnackbar({ open: true, message: 'Silakan pilih pelanggan terlebih dahulu', severity: 'error' });
      return;
    }
    if (cart.length === 0) {
      setSnackbar({ open: true, message: 'Keranjang belanja masih kosong', severity: 'warning' });
      return;
    }
    if (paymentMethod === 'cash' && cashNum < calculations.grandTotal) {
      setSnackbar({ open: true, message: 'Jumlah uang tunai yang diterima masih kurang', severity: 'error' });
      return;
    }

    setIsProcessing(true);
    try {
      const salePayload = {
        customer: selectedCustomer,
        payment_method: paymentMethod,
        notes: saleNotes,
        due_date: paymentMethod === 'credit' && dueDate ? dueDate : null,
        paid_amount: paymentMethod === 'credit' ? 0 : calculations.grandTotal,
        items: cart.map((item) => ({
          product: item.product.id,
          product_name: item.product.name,
          product_sku: item.product.sku || '',
          quantity: item.quantity,
          unit_price: parseFloat(item.product.selling_price) || 0,
          discount_percent: parseFloat(item.discount_percent) || 0,
          tax_rate: 11,
        })),
      };

      const res = await sales.create(salePayload);
      const createdSale = res.data;

      // Save payment info for receipt
      setLastPaymentInfo({
        cashReceived: paymentMethod === 'cash' ? cashNum : calculations.grandTotal,
        change: paymentMethod === 'cash' ? change : 0,
      });

      setCompletedSale(createdSale);
      setCheckoutOpen(false);
      setReceiptOpen(true);
      clearCart();
      setSaleNotes('');

      // Refresh products cache so updated stock reflects immediately
      refreshProducts();

      setSnackbar({
        open: true,
        message: `Transaksi ${createdSale.sale_number} berhasil disimpan!`,
        severity: 'success',
      });
    } catch (err) {
      console.error('Sale error:', err);
      const msg = err.response?.data?.error || err.response?.data?.detail || 'Gagal memproses transaksi penjualan';
      setSnackbar({ open: true, message: msg, severity: 'error' });
    } finally {
      setIsProcessing(false);
    }
  };

  // Thermal Print Trigger
  const handlePrintReceipt = () => {
    window.print();
  };

  return (
    <Box sx={{ p: { xs: 1, md: 2 }, minHeight: 'calc(100vh - 80px)' }}>
      {/* Header Bar */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2,
          flexWrap: 'wrap',
          gap: 1,
        }}
      >
        <Box display="flex" alignItems="center" gap={1}>
          <Storefront sx={{ fontSize: 28, color: 'primary.main' }} />
          <Typography variant="h5" fontWeight="bold">
            POS Kasir
          </Typography>
          <Chip label="Mode Cepat Moka" size="small" color="primary" variant="outlined" sx={{ fontWeight: 600 }} />
          <Tooltip title={printerConfig.isConnected ? `Printer Siap (${printerConfig.deviceName}) - Klik untuk Pengaturan` : "Printer Terputus - Klik untuk Sambungkan"}>
            <Chip
              icon={printerConfig.isConnected ? <Print sx={{ fontSize: '1rem !important' }} /> : <Cancel sx={{ fontSize: '1rem !important' }} />}
              label={printerConfig.isConnected ? `${printerConfig.deviceName.split(' ')[0]} (${printerConfig.paperSize})` : "Printer Terputus"}
              size="small"
              color={printerConfig.isConnected ? "success" : "error"}
              variant="outlined"
              onClick={() => navigate('/settings/printer')}
              clickable
              sx={{ fontWeight: 600, cursor: 'pointer' }}
            />
          </Tooltip>
        </Box>

        <Box display="flex" alignItems="center" gap={1}>
          <Tooltip title="Tambah Produk Baru ke Database">
            <Button
              variant="outlined"
              color="primary"
              size="small"
              startIcon={<Add />}
              onClick={() => navigate('/products/new')}
              sx={{ borderRadius: 2, fontWeight: 600, textTransform: 'none' }}
            >
              + Tambah Produk
            </Button>
          </Tooltip>

          <Tooltip title="Fokus Scan Barcode">
            <IconButton
              color="primary"
              onClick={() => searchInputRef.current?.focus()}
              sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1) }}
            >
              <QrCodeScanner />
            </IconButton>
          </Tooltip>
          {cart.length > 0 && (
            <Button
              variant="outlined"
              color="error"
              size="small"
              startIcon={<Clear />}
              onClick={clearCart}
              sx={{ borderRadius: 2 }}
            >
              Kosongkan Keranjang
            </Button>
          )}
        </Box>
      </Box>

      {/* Main Content Layout */}
      <Grid container spacing={2}>
        {/* ================= LEFT PANEL: CATALOG & SEARCH ================= */}
        <Grid size={{ xs: 12, md: 7, lg: 8 }}>
          <Card sx={{ borderRadius: 3, boxShadow: 2, mb: 2, overflow: 'visible' }}>
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
              {/* Search Bar */}
              <TextField
                inputRef={searchInputRef}
                fullWidth
                placeholder="Cari nama produk, SKU, atau scan barcode lalu Enter..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: searchQuery && (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => setSearchQuery('')}>
                        <Clear fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  mb: 2,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2.5,
                    bgcolor: 'background.paper',
                  },
                }}
              />

              {/* Category Filter Pills */}
              <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                <Tabs
                  value={selectedCategory}
                  onChange={(_, val) => setSelectedCategory(val)}
                  variant="scrollable"
                  scrollButtons="auto"
                  allowScrollButtonsMobile
                  sx={{
                    minHeight: 40,
                    '& .MuiTab-root': {
                      minHeight: 38,
                      py: 0.5,
                      px: 2,
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      textTransform: 'none',
                      borderRadius: 2,
                      mr: 1,
                    },
                  }}
                >
                  <Tab label="Semua Produk" value="all" />
                  {categoryList.map((cat) => (
                    <Tab key={cat.id || cat.name} label={cat.name} value={cat.name} />
                  ))}
                </Tabs>
              </Box>

              {/* Product Grid */}
              {loadingProducts ? (
                <Box display="flex" justifyContent="center" alignItems="center" py={8}>
                  <CircularProgress />
                </Box>
              ) : filteredProducts.length === 0 ? (
                <Box textAlign="center" py={6}>
                  <Inventory2 sx={{ fontSize: 48, color: 'text.secondary', mb: 1, opacity: 0.5 }} />
                  <Typography variant="body1" color="text.secondary">
                    Tidak ada produk yang cocok dengan pencarian.
                  </Typography>
                </Box>
              ) : (
                <Grid container spacing={1.5} sx={{ maxHeight: 'calc(100vh - 270px)', overflowY: 'auto', pr: 0.5 }}>
                  {filteredProducts.map((product) => {
                    const isOutOfStock = product.stock_quantity <= 0;
                    const inCartItem = cart.find((i) => i.product.id === product.id);

                    return (
                      <Grid size={{ xs: 6, sm: 4, md: 4, lg: 3 }} key={product.id}>
                        <Card
                          onClick={() => !isOutOfStock && addToCart(product)}
                          sx={{
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            borderRadius: 2.5,
                            border: inCartItem ? `2px solid ${theme.palette.primary.main}` : '1px solid',
                            borderColor: inCartItem ? 'primary.main' : 'divider',
                            cursor: isOutOfStock ? 'not-allowed' : 'pointer',
                            opacity: isOutOfStock ? 0.6 : 1,
                            position: 'relative',
                            transition: 'all 0.15s ease-in-out',
                            '&:hover': !isOutOfStock && {
                              transform: 'translateY(-2px)',
                              boxShadow: theme.shadows[4],
                              borderColor: 'primary.main',
                            },
                          }}
                        >
                          {/* Badge in Cart Counter */}
                          {inCartItem && (
                            <Chip
                              label={`${inCartItem.quantity} di keranjang`}
                              size="small"
                              color="primary"
                              sx={{
                                position: 'absolute',
                                top: 6,
                                right: 6,
                                fontSize: '0.7rem',
                                height: 20,
                                fontWeight: 'bold',
                                zIndex: 1,
                              }}
                            />
                          )}

                          <CardContent sx={{ p: 1.5, pb: 1, '&:last-child': { pb: 1.5 } }}>
                            {/* Category Indicator */}
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{
                                display: 'block',
                                fontSize: '0.7rem',
                                textTransform: 'uppercase',
                                fontWeight: 700,
                                letterSpacing: 0.5,
                                mb: 0.5,
                              }}
                            >
                              {product.category_name || 'Umum'}
                            </Typography>

                            {/* Product Name */}
                            <Typography
                              variant="subtitle2"
                              fontWeight="bold"
                              sx={{
                                height: 40,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                lineHeight: 1.2,
                                mb: 1,
                              }}
                              title={product.name}
                            >
                              {product.name}
                            </Typography>

                            {/* Stock & SKU row */}
                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.68rem' }}>
                                {product.sku}
                              </Typography>
                              <Chip
                                label={isOutOfStock ? 'Habis' : `Stok: ${product.stock_quantity}`}
                                size="small"
                                color={isOutOfStock ? 'error' : product.stock_quantity <= 5 ? 'warning' : 'default'}
                                variant="outlined"
                                sx={{ height: 18, fontSize: '0.65rem', fontWeight: 600 }}
                              />
                            </Box>

                            {/* Price */}
                            <Typography variant="body1" fontWeight="800" color="primary.main">
                              Rp {Number(product.selling_price || 0).toLocaleString('id-ID')}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    );
                  })}
                </Grid>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* ================= RIGHT PANEL: CART & CHECKOUT ================= */}
        <Grid size={{ xs: 12, md: 5, lg: 4 }}>
          <Card
            sx={{
              borderRadius: 3,
              boxShadow: 3,
              display: 'flex',
              flexDirection: 'column',
              height: 'calc(100vh - 120px)',
              position: 'sticky',
              top: 80,
            }}
          >
            {/* Cart Header & Customer Selection */}
            <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'background.default' }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
                <Box display="flex" alignItems="center" gap={1}>
                  <Badge badgeContent={calculations.totalItems} color="primary">
                    <ShoppingCart color="action" />
                  </Badge>
                  <Typography variant="subtitle1" fontWeight="bold">
                    Keranjang Belanja
                  </Typography>
                </Box>
                <Chip
                  label={`${cart.length} item unik`}
                  size="small"
                  variant="outlined"
                  sx={{ fontWeight: 600, fontSize: '0.75rem' }}
                />
              </Box>

              {/* Customer Selector with Quick Add */}
              <Box display="flex" gap={1} alignItems="center">
                <FormControl fullWidth size="small">
                  <InputLabel id="customer-select-label">Pelanggan</InputLabel>
                  <Select
                    labelId="customer-select-label"
                    value={selectedCustomer}
                    label="Pelanggan"
                    onChange={(e) => setSelectedCustomer(e.target.value)}
                    sx={{ borderRadius: 2 }}
                  >
                    {customerList.map((c) => (
                      <MenuItem key={c.id} value={c.id}>
                        {c.name} {c.phone && c.phone !== '-' ? `(${c.phone})` : ''}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Tooltip title="Tambah Pelanggan Baru">
                  <IconButton
                    color="primary"
                    size="small"
                    onClick={() => setCustomerDialogOpen(true)}
                    sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 1 }}
                  >
                    <PersonAdd fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>

            {/* Cart Items List */}
            <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 1.5 }}>
              {cart.length === 0 ? (
                <Box
                  display="flex"
                  flexDirection="column"
                  alignItems="center"
                  justifyContent="center"
                  height="100%"
                  textAlign="center"
                  color="text.secondary"
                  py={6}
                >
                  <ShoppingCart sx={{ fontSize: 56, mb: 1, opacity: 0.3 }} />
                  <Typography variant="body1" fontWeight="600">
                    Keranjang Masih Kosong
                  </Typography>
                  <Typography variant="caption" sx={{ maxWidth: 220, mt: 0.5 }}>
                    Klik produk pada katalog di sebelah kiri untuk menambahkannya ke keranjang.
                  </Typography>
                </Box>
              ) : (
                <Stack spacing={1}>
                  {cart.map((item) => {
                    const price = parseFloat(item.product.selling_price) || 0;
                    const itemLineTotal = Math.round(
                      item.quantity * price * (1 - (item.discount_percent || 0) / 100)
                    );

                    return (
                      <Paper
                        key={item.product.id}
                        variant="outlined"
                        sx={{
                          p: 1.5,
                          borderRadius: 2,
                          bgcolor: 'background.paper',
                          '&:hover': { borderColor: 'primary.light' },
                        }}
                      >
                        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={0.5}>
                          <Box sx={{ pr: 1 }}>
                            <Typography variant="subtitle2" fontWeight="700" sx={{ lineHeight: 1.2 }}>
                              {item.product.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Rp {Number(price).toLocaleString('id-ID')}
                            </Typography>
                          </Box>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => removeFromCart(item.product.id)}
                            sx={{ p: 0.5 }}
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </Box>

                        {/* Controls Row: [-] QTY [+] & Subtotal */}
                        <Box display="flex" justifyContent="space-between" alignItems="center" mt={1}>
                          <Box display="flex" alignItems="center" gap={0.5}>
                            <IconButton
                              size="small"
                              onClick={() => updateQuantity(item.product.id, -1)}
                              sx={{
                                border: '1px solid',
                                borderColor: 'divider',
                                p: 0.5,
                                borderRadius: 1.5,
                              }}
                            >
                              <Remove fontSize="small" />
                            </IconButton>

                            <Typography
                              variant="body2"
                              fontWeight="bold"
                              sx={{
                                minWidth: 28,
                                textAlign: 'center',
                                bgcolor: alpha(theme.palette.primary.main, 0.08),
                                py: 0.5,
                                borderRadius: 1,
                              }}
                            >
                              {item.quantity}
                            </Typography>

                            <IconButton
                              size="small"
                              onClick={() => updateQuantity(item.product.id, 1)}
                              sx={{
                                border: '1px solid',
                                borderColor: 'divider',
                                p: 0.5,
                                borderRadius: 1.5,
                              }}
                            >
                              <Add fontSize="small" />
                            </IconButton>
                          </Box>

                          <Typography variant="subtitle2" fontWeight="800" color="primary.main">
                            Rp {itemLineTotal.toLocaleString('id-ID')}
                          </Typography>
                        </Box>
                      </Paper>
                    );
                  })}
                </Stack>
              )}
            </Box>

            {/* Cart Summary & Checkout Button */}
            <Box
              sx={{
                p: 2,
                borderTop: '1px solid',
                borderColor: 'divider',
                bgcolor: 'background.default',
              }}
            >
              <Stack spacing={0.5} mb={1.5}>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">
                    Subtotal ({calculations.totalItems} barang)
                  </Typography>
                  <Typography variant="body2" fontWeight="600">
                    Rp {calculations.subtotal.toLocaleString('id-ID')}
                  </Typography>
                </Box>

                {calculations.totalDiscount > 0 && (
                  <Box display="flex" justifyContent="space-between" color="success.main">
                    <Typography variant="body2">Total Diskon</Typography>
                    <Typography variant="body2" fontWeight="600">
                      -Rp {calculations.totalDiscount.toLocaleString('id-ID')}
                    </Typography>
                  </Box>
                )}

                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">
                    PPN (11%)
                  </Typography>
                  <Typography variant="body2" fontWeight="600">
                    Rp {calculations.taxAmount.toLocaleString('id-ID')}
                  </Typography>
                </Box>

                <Divider sx={{ my: 0.5 }} />

                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="subtitle1" fontWeight="bold">
                    Total Tagihan
                  </Typography>
                  <Typography variant="h5" fontWeight="900" color="success.main">
                    Rp {calculations.grandTotal.toLocaleString('id-ID')}
                  </Typography>
                </Box>
              </Stack>

              <Button
                variant="contained"
                color="primary"
                fullWidth
                size="large"
                disabled={cart.length === 0}
                onClick={handleOpenCheckout}
                startIcon={<Payment />}
                sx={{
                  py: 1.4,
                  borderRadius: 2.5,
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  boxShadow: 3,
                }}
              >
                Bayar Sekarang (Rp {calculations.grandTotal.toLocaleString('id-ID')})
              </Button>
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* ================= MODAL 1: CHECKOUT & KALKULATOR KASIR ================= */}
      <Dialog
        open={checkoutOpen}
        onClose={() => !isProcessing && setCheckoutOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="h6" fontWeight="bold">
            Penyelesaian Pembayaran
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Pilih metode pembayaran dan masukkan jumlah uang
          </Typography>
        </DialogTitle>

        <DialogContent dividers>
          {/* Total Banner */}
          <Paper
            sx={{
              p: 2,
              mb: 2.5,
              textAlign: 'center',
              borderRadius: 2.5,
              bgcolor: alpha(theme.palette.primary.main, 0.06),
              border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
            }}
          >
            <Typography variant="caption" color="text.secondary" fontWeight="bold">
              TOTAL YANG HARUS DIBAYAR
            </Typography>
            <Typography variant="h3" fontWeight="900" color="primary.main">
              Rp {calculations.grandTotal.toLocaleString('id-ID')}
            </Typography>
          </Paper>

          {/* Payment Method Selector */}
          <Typography variant="subtitle2" fontWeight="bold" mb={1}>
            Metode Pembayaran
          </Typography>
          <Grid container spacing={1} mb={2.5}>
            {[
              { id: 'cash', label: 'Tunai (Cash)', icon: <AttachMoney /> },
              { id: 'bank_transfer', label: 'Transfer / QRIS', icon: <AccountBalance /> },
              { id: 'card', label: 'Kartu Debit / EDC', icon: <CreditCard /> },
              { id: 'credit', label: 'Kasbon / Tempo', icon: <Schedule /> },
            ].map((method) => (
              <Grid size={{ xs: 6, sm: 3 }} key={method.id}>
                <Paper
                  onClick={() => setPaymentMethod(method.id)}
                  sx={{
                    p: 1.5,
                    textAlign: 'center',
                    borderRadius: 2,
                    cursor: 'pointer',
                    border: '2px solid',
                    borderColor: paymentMethod === method.id ? 'primary.main' : 'divider',
                    bgcolor: paymentMethod === method.id ? alpha(theme.palette.primary.main, 0.08) : 'background.paper',
                    transition: 'all 0.15s ease-in-out',
                  }}
                >
                  <Box color={paymentMethod === method.id ? 'primary.main' : 'text.secondary'}>
                    {method.icon}
                  </Box>
                  <Typography
                    variant="caption"
                    fontWeight={paymentMethod === method.id ? 'bold' : 'normal'}
                    display="block"
                    mt={0.5}
                  >
                    {method.label}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>

          {/* If Cash: Quick Cash Buttons + Calculator */}
          {paymentMethod === 'cash' && (
            <Box mb={2}>
              <Typography variant="subtitle2" fontWeight="bold" mb={1}>
                Pecahan Uang Cepat
              </Typography>
              <Box display="flex" gap={1} flexWrap="wrap" mb={2}>
                {cashSuggestions.map((amt) => (
                  <Button
                    key={amt}
                    variant={cashNum === amt ? 'contained' : 'outlined'}
                    size="small"
                    onClick={() => setCashReceived(amt.toString())}
                    sx={{ borderRadius: 2, fontWeight: 700 }}
                  >
                    {amt === calculations.grandTotal
                      ? 'Uang Pas'
                      : `Rp ${amt.toLocaleString('id-ID')}`}
                  </Button>
                ))}
              </Box>

              <TextField
                fullWidth
                label="Jumlah Uang Diterima"
                type="number"
                value={cashReceived}
                onChange={(e) => setCashReceived(e.target.value)}
                InputProps={{
                  startAdornment: <InputAdornment position="start">Rp</InputAdornment>,
                }}
                sx={{ mb: 1.5 }}
              />

              {/* Change / Kembalian Banner */}
              {cashNum > 0 && (
                <Paper
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: isCashInsufficient ? 'error.main' : 'success.main',
                    bgcolor: isCashInsufficient
                      ? alpha(theme.palette.error.main, 0.06)
                      : alpha(theme.palette.success.main, 0.08),
                  }}
                >
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography
                      variant="subtitle2"
                      fontWeight="bold"
                      color={isCashInsufficient ? 'error.main' : 'success.main'}
                    >
                      {isCashInsufficient ? 'Uang Masih Kurang:' : 'Uang Kembalian:'}
                    </Typography>
                    <Typography
                      variant="h5"
                      fontWeight="900"
                      color={isCashInsufficient ? 'error.main' : 'success.main'}
                    >
                      Rp {(isCashInsufficient ? calculations.grandTotal - cashNum : change).toLocaleString('id-ID')}
                    </Typography>
                  </Box>
                </Paper>
              )}
            </Box>
          )}

          {/* If Credit: Due Date */}
          {paymentMethod === 'credit' && (
            <Box mb={2}>
              <Alert severity="info" sx={{ mb: 2 }}>
                Transaksi tempo akan dicatat sebagai piutang pelanggan dan memerlukan tanggal jatuh tempo pelunasan.
              </Alert>
              <TextField
                fullWidth
                type="date"
                label="Tanggal Jatuh Tempo"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Box>
          )}

          {/* Additional Notes */}
          <TextField
            fullWidth
            size="small"
            label="Catatan Transaksi (Opsional)"
            placeholder="Contoh: No. Meja, Catatan Pesanan, dll."
            value={saleNotes}
            onChange={(e) => setSaleNotes(e.target.value)}
            sx={{ mt: 1 }}
          />
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setCheckoutOpen(false)} disabled={isProcessing} color="inherit">
            Batal
          </Button>
          <Button
            variant="contained"
            color="success"
            size="large"
            disabled={isProcessing || isCashInsufficient}
            onClick={handleCompleteSale}
            startIcon={isProcessing ? <CircularProgress size={18} color="inherit" /> : <CheckCircle />}
            sx={{ px: 3, fontWeight: 'bold', borderRadius: 2 }}
          >
            {isProcessing ? 'Memproses...' : 'Selesaikan Transaksi'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ================= MODAL 2: STRUK BELANJA (THERMAL RECEIPT READY) ================= */}
      <Dialog
        open={receiptOpen}
        onClose={() => setReceiptOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ textAlign: 'center', pb: 0 }}>
          <CheckCircle sx={{ fontSize: 48, color: 'success.main', mb: 0.5 }} />
          <Typography variant="h6" fontWeight="bold">
            Transaksi Berhasil!
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Nomor: {completedSale?.sale_number}
          </Typography>
        </DialogTitle>

        <DialogContent sx={{ p: 2 }}>
          {/* Cash drawer alert if enabled */}
          {printerConfig.autoCashDrawer && completedSale?.payment_method === 'cash' && (
            <Alert
              severity="success"
              icon={<PointOfSale fontSize="small" />}
              sx={{ py: 0.5, mb: 1.5, borderRadius: 2, fontSize: '0.78rem' }}
            >
              Laci Kasir (Cash Drawer) Otomatis Terbuka
            </Alert>
          )}

          {/* Printable Receipt Area */}
          <Box
            id="printable-receipt"
            sx={{
              p: 2,
              bgcolor: 'background.default',
              border: '1px dashed',
              borderColor: 'divider',
              borderRadius: 2,
              fontFamily: 'monospace',
              fontSize: printerConfig.paperSize === '58mm' ? '0.75rem' : '0.82rem',
              maxWidth: printerConfig.paperSize === '58mm' ? '280px' : '360px',
              margin: '0 auto',
            }}
          >
            <Box textAlign="center" mb={1.5}>
              <Typography variant="subtitle2" fontWeight="bold" sx={{ fontFamily: 'monospace' }}>
                {printerConfig.storeName || 'TOKO SUKSES SEJAHTERA'}
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ fontFamily: 'monospace' }}>
                {printerConfig.storeAddress || 'Jl. Jenderal Sudirman No. 123, Jakarta'}
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ fontFamily: 'monospace' }}>
                Telp: {printerConfig.storePhone || '081234567890'}
              </Typography>
              <Divider sx={{ my: 1, borderStyle: 'dashed' }} />
            </Box>

            <Box display="flex" justifyContent="space-between" mb={0.5}>
              <span>No. Struk</span>
              <span>{completedSale?.sale_number}</span>
            </Box>
            <Box display="flex" justifyContent="space-between" mb={0.5}>
              <span>Waktu</span>
              <span>{new Date().toLocaleString('id-ID')}</span>
            </Box>
            <Box display="flex" justifyContent="space-between" mb={1}>
              <span>Kasir / Staff</span>
              <span>{completedSale?.salesperson_name || 'Kasir'}</span>
            </Box>

            <Divider sx={{ my: 1, borderStyle: 'dashed' }} />

            {/* Items */}
            {completedSale?.items?.map((item, idx) => (
              <Box key={idx} mb={0.5}>
                <Box display="flex" justifyContent="space-between">
                  <span>{item.product_name}</span>
                  <span>Rp {Number(item.line_total || 0).toLocaleString('id-ID')}</span>
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ pl: 1 }}>
                  {item.quantity} x Rp {Number(item.unit_price || 0).toLocaleString('id-ID')}
                </Typography>
              </Box>
            ))}

            <Divider sx={{ my: 1, borderStyle: 'dashed' }} />

            <Box display="flex" justifyContent="space-between" mb={0.5}>
              <span>Subtotal</span>
              <span>Rp {Number(completedSale?.subtotal || 0).toLocaleString('id-ID')}</span>
            </Box>
            <Box display="flex" justifyContent="space-between" mb={0.5}>
              <span>PPN (11%)</span>
              <span>Rp {Number(completedSale?.tax_amount || 0).toLocaleString('id-ID')}</span>
            </Box>
            <Box display="flex" justifyContent="space-between" fontWeight="bold" my={0.5}>
              <span>TOTAL</span>
              <span>Rp {Number(completedSale?.total_amount || 0).toLocaleString('id-ID')}</span>
            </Box>
            <Box display="flex" justifyContent="space-between" mb={0.5}>
              <span>Bayar ({completedSale?.payment_method?.toUpperCase()})</span>
              <span>Rp {Number(lastPaymentInfo.cashReceived).toLocaleString('id-ID')}</span>
            </Box>
            <Box display="flex" justifyContent="space-between" fontWeight="bold" color="primary.main">
              <span>Kembalian</span>
              <span>Rp {Number(lastPaymentInfo.change).toLocaleString('id-ID')}</span>
            </Box>

            <Divider sx={{ my: 1.5, borderStyle: 'dashed' }} />
            <Typography variant="caption" align="center" display="block" color="text.secondary" sx={{ fontFamily: 'monospace', whiteSpace: 'pre-line' }}>
              {printerConfig.footerNote || 'Terima Kasih Atas Kunjungan Anda!'}
            </Typography>
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            startIcon={<Print />}
            onClick={handlePrintReceipt}
            sx={{ fontWeight: 'bold', borderRadius: 2 }}
          >
            Cetak Struk ({printerConfig.paperSize} • {printerConfig.connectionType.toUpperCase()})
          </Button>
          <Button
            variant="outlined"
            color="inherit"
            fullWidth
            onClick={() => setReceiptOpen(false)}
            sx={{ borderRadius: 2 }}
          >
            Transaksi Baru
          </Button>
        </DialogActions>
      </Dialog>

      {/* Customer Quick-Add Dialog */}
      <CustomerDialog
        open={customerDialogOpen}
        onClose={() => setCustomerDialogOpen(false)}
        onCustomerCreated={(newCust) => {
          refreshCustomers();
          if (newCust?.id) setSelectedCustomer(newCust.id);
        }}
      />

      {/* Snackbar alerts */}
      <CustomSnackbar
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      />
    </Box>
  );
};

export default PosTerminal;
