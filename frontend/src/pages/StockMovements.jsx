import React, { useState, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  Tabs,
  Tab,
  CircularProgress,
  Stack,
  useTheme,
  alpha,
} from '@mui/material';
import {
  SwapVert,
  LocalShipping,
  Tune,
  Search,
  ShoppingCart,
  SettingsBackupRestore,
  TrendingDown,
  TrendingUp,
  Refresh,
  Person,
  Description,
  HistoryEdu,
} from '@mui/icons-material';
import { useStockMovements } from '../hooks/useSWR';
import { stockMovements as stockMovementsApi } from '../services/api';
import useSWR from 'swr';
import StockInModal from '../components/Products/StockInModal';
import StockAdjustModal from '../components/Products/StockAdjustModal';
import CustomSnackbar from '../components/CustomSnackbar';
import PaginationComponent from '../components/Pagination';

const StockMovements = () => {
  const theme = useTheme();

  // State
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');

  // Modals state
  const [stockInOpen, setStockInOpen] = useState(false);
  const [stockAdjustOpen, setStockAdjustOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Query params
  const queryParams = useMemo(() => {
    const params = {
      page,
      page_size: pageSize,
      search: searchTerm.trim() || undefined,
    };
    if (selectedType !== 'all') {
      params.movement_type = selectedType;
    }
    return params;
  }, [page, pageSize, searchTerm, selectedType]);

  // Fetch movements list
  const { data: movementsData, mutate: refreshMovements, isLoading } = useStockMovements(queryParams);

  // Fetch summary stats
  const { data: summaryData, mutate: refreshSummary } = useSWR('stock-movements-summary', () =>
    stockMovementsApi.getSummary().then((res) => res.data)
  );

  const movements = movementsData?.results || [];
  const totalCount = movementsData?.count || 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  const handleRefreshAll = () => {
    refreshMovements();
    refreshSummary();
  };

  const handleModalSuccess = (msg) => {
    setSnackbar({ open: true, message: msg, severity: 'success' });
    handleRefreshAll();
  };

  // Helper for badge appearance
  const getMovementConfig = (type, qty) => {
    switch (type) {
      case 'in':
        return {
          label: 'Stok Masuk',
          color: 'success',
          icon: <LocalShipping fontSize="small" />,
        };
      case 'sale':
        return {
          label: 'Penjualan Kasir',
          color: 'primary',
          icon: <ShoppingCart fontSize="small" />,
        };
      case 'sale_cancellation':
        return {
          label: 'Retur Penjualan',
          color: 'secondary',
          icon: <SettingsBackupRestore fontSize="small" />,
        };
      case 'adjustment':
        return {
          label: qty < 0 ? 'Penyesuaian (-)' : 'Penyesuaian (+)',
          color: qty < 0 ? 'warning' : 'info',
          icon: <Tune fontSize="small" />,
        };
      case 'return':
        return {
          label: 'Return',
          color: 'info',
          icon: <SettingsBackupRestore fontSize="small" />,
        };
      default:
        return {
          label: type,
          color: 'default',
          icon: <SwapVert fontSize="small" />,
        };
    }
  };

  return (
    <Box sx={{ width: '100%', minHeight: '100vh', p: { xs: 2, sm: 3 } }}>
      {/* Header Section */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Box display="flex" alignItems="center" gap={1.5}>
          <HistoryEdu sx={{ fontSize: 36, color: 'primary.main' }} />
          <Box>
            <Typography variant="h5" fontWeight="bold">
              Riwayat Mutasi Stok
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Pantau seluruh arus barang masuk dari supplier, penjualan kasir, retur, dan penyesuaian barang
            </Typography>
          </Box>
        </Box>

        <Stack direction="row" spacing={1.5}>
          <Tooltip title="Muat Ulang Data">
            <IconButton onClick={handleRefreshAll} color="primary" sx={{ border: '1px solid', borderColor: 'divider' }}>
              <Refresh />
            </IconButton>
          </Tooltip>

          <Button
            variant="contained"
            color="primary"
            startIcon={<LocalShipping />}
            onClick={() => setStockInOpen(true)}
            sx={{ borderRadius: 2, fontWeight: 'bold', textTransform: 'none' }}
          >
            + Terima Barang Supplier
          </Button>

          <Button
            variant="outlined"
            color="warning"
            startIcon={<Tune />}
            onClick={() => setStockAdjustOpen(true)}
            sx={{ borderRadius: 2, fontWeight: 'bold', textTransform: 'none' }}
          >
            ± Sesuaikan Stok
          </Button>
        </Stack>
      </Box>

      {/* Summary KPI Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, border: '1px solid rgba(0,0,0,0.06)' }}>
            <CardContent sx={{ p: 2 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight="bold">
                    TOTAL BARANG MASUK
                  </Typography>
                  <Typography variant="h5" fontWeight="bold" color="success.main" sx={{ mt: 0.5 }}>
                    +{summaryData?.total_in?.toLocaleString('id-ID') || 0} unit
                  </Typography>
                </Box>
                <LocalShipping sx={{ fontSize: 36, color: 'success.main', opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, border: '1px solid rgba(0,0,0,0.06)' }}>
            <CardContent sx={{ p: 2 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight="bold">
                    TOTAL KELUAR / TERJUAL
                  </Typography>
                  <Typography variant="h5" fontWeight="bold" color="primary.main" sx={{ mt: 0.5 }}>
                    -{summaryData?.total_out?.toLocaleString('id-ID') || 0} unit
                  </Typography>
                </Box>
                <ShoppingCart sx={{ fontSize: 36, color: 'primary.main', opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, border: '1px solid rgba(0,0,0,0.06)' }}>
            <CardContent sx={{ p: 2 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight="bold">
                    INSIDEN PENYESUAIAN
                  </Typography>
                  <Typography variant="h5" fontWeight="bold" color="warning.main" sx={{ mt: 0.5 }}>
                    {summaryData?.total_adjustments?.toLocaleString('id-ID') || 0} kali
                  </Typography>
                </Box>
                <Tune sx={{ fontSize: 36, color: 'warning.main', opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, border: '1px solid rgba(0,0,0,0.06)' }}>
            <CardContent sx={{ p: 2 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight="bold">
                    TOTAL LOG MUTASI
                  </Typography>
                  <Typography variant="h5" fontWeight="bold" sx={{ mt: 0.5 }}>
                    {summaryData?.total_movements?.toLocaleString('id-ID') || totalCount} entri
                  </Typography>
                </Box>
                <SwapVert sx={{ fontSize: 36, color: 'text.secondary', opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filter Tabs & Search Bar */}
      <Card sx={{ mb: 3, borderRadius: 3, border: '1px solid rgba(0,0,0,0.06)' }}>
        <CardContent sx={{ p: 2 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
            <Tabs
              value={selectedType}
              onChange={(_, val) => {
                setSelectedType(val);
                setPage(1);
              }}
              variant="scrollable"
              scrollButtons="auto"
              sx={{ minHeight: 40 }}
            >
              <Tab label="Semua Mutasi" value="all" sx={{ textTransform: 'none', fontWeight: 600 }} />
              <Tab label="Stok Masuk (Supplier)" value="in" sx={{ textTransform: 'none', fontWeight: 600 }} />
              <Tab label="Penjualan Kasir" value="sale" sx={{ textTransform: 'none', fontWeight: 600 }} />
              <Tab label="Retur Penjualan" value="sale_cancellation" sx={{ textTransform: 'none', fontWeight: 600 }} />
              <Tab label="Penyesuaian (Adjustment)" value="adjustment" sx={{ textTransform: 'none', fontWeight: 600 }} />
            </Tabs>

            <TextField
              size="small"
              placeholder="Cari produk, SKU, no. faktur, catatan..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search fontSize="small" color="action" />
                  </InputAdornment>
                ),
              }}
              sx={{ width: { xs: '100%', sm: 300 } }}
            />
          </Box>
        </CardContent>
      </Card>

      {/* Movements Table */}
      <TableContainer component={Paper} sx={{ borderRadius: 3, border: '1px solid rgba(0,0,0,0.06)', mb: 3 }}>
        <Table>
          <TableHead sx={{ bgcolor: alpha(theme.palette.primary.main, 0.04) }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Waktu & Tanggal</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Produk & SKU</TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                Jenis Mutasi
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                Kuantitas
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>No. Referensi</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Petugas</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Catatan / Keterangan</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                  <CircularProgress size={32} />
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Memuat data mutasi stok...
                  </Typography>
                </TableCell>
              </TableRow>
            ) : movements.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                  <Typography variant="body1" color="text.secondary" fontWeight="bold">
                    Tidak ada riwayat mutasi stok
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Pergerakan stok dari kasir, penerimaan supplier, dan penyesuaian akan muncul di sini.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              movements.map((item) => {
                const config = getMovementConfig(item.movement_type, item.quantity);
                const isPositive = item.quantity > 0;
                return (
                  <TableRow key={item.id} hover>
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>
                      <Typography variant="body2" fontWeight={600}>
                        {new Date(item.created_at).toLocaleDateString('id-ID', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(item.created_at).toLocaleTimeString('id-ID', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2" fontWeight="bold">
                        {item.product_name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        SKU: {item.product_sku || '-'}
                      </Typography>
                    </TableCell>

                    <TableCell align="center">
                      <Chip
                        icon={config.icon}
                        label={config.label}
                        size="small"
                        color={config.color}
                        variant="outlined"
                        sx={{ fontWeight: 'bold' }}
                      />
                    </TableCell>

                    <TableCell align="center">
                      <Typography
                        variant="body2"
                        fontWeight="bold"
                        color={isPositive ? 'success.main' : 'error.main'}
                      >
                        {isPositive ? `+${item.quantity}` : item.quantity} unit
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2" fontFamily="monospace">
                        {item.reference || '-'}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Box display="flex" alignItems="center" gap={0.5}>
                        <Person fontSize="small" color="action" />
                        <Typography variant="body2">{item.user_name || 'Sistem'}</Typography>
                      </Box>
                    </TableCell>

                    <TableCell sx={{ maxWidth: 280 }}>
                      <Typography variant="body2" noWrap title={item.notes || '-'}>
                        {item.notes || '-'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      {movements.length > 0 && (
        <PaginationComponent
          currentPage={page}
          totalPages={totalPages}
          totalCount={totalCount}
          itemsPerPage={pageSize}
          onPageChange={(p) => setPage(p)}
          onItemsPerPageChange={(ps) => {
            setPageSize(ps);
            setPage(1);
          }}
          itemsPerPageOptions={[10, 15, 25, 50]}
        />
      )}

      {/* Modals */}
      <StockInModal
        open={stockInOpen}
        onClose={() => setStockInOpen(false)}
        onSuccess={handleModalSuccess}
      />

      <StockAdjustModal
        open={stockAdjustOpen}
        onClose={() => setStockAdjustOpen(false)}
        onSuccess={handleModalSuccess}
      />

      {/* Notification Snackbar */}
      <CustomSnackbar
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      />
    </Box>
  );
};

export default StockMovements;
