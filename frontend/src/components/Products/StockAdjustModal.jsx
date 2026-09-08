import React, { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Grid,
  Box,
  MenuItem,
  Alert,
  CircularProgress,
  RadioGroup,
  FormControlLabel,
  Radio,
  Paper,
  Stack,
  Chip,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Tune,
  RemoveCircle,
  AddCircle,
  WarningAmber,
  CheckCircle,
  ReportProblem,
} from '@mui/icons-material';
import { useProducts } from '../../hooks/useSWR';
import { stockMovements } from '../../services/api';

const REASONS = [
  { value: 'damaged', label: '💥 Barang Rusak / Pecah / Cacat', defaultType: 'decrease' },
  { value: 'expired', label: '⌛ Kadaluwarsa (Expired / Basi)', defaultType: 'decrease' },
  { value: 'lost', label: '🔍 Barang Hilang / Selisih Rak Toko', defaultType: 'decrease' },
  { value: 'internal_use', label: '☕ Pemakaian Internal / Operasional Toko', defaultType: 'decrease' },
  { value: 'sample', label: '🎁 Sampel / Tester Promosi', defaultType: 'decrease' },
  { value: 'correction', label: '✏️ Koreksi Hitung / Selisih Fisik', defaultType: 'both' },
];

const StockAdjustModal = ({ open, onClose, onSuccess, initialProduct = null }) => {
  const theme = useTheme();
  const { data: productsData } = useProducts({ page_size: 150 });
  const products = productsData?.results || (Array.isArray(productsData) ? productsData : []);

  const [selectedProductId, setSelectedProductId] = useState('');
  const [adjustmentType, setAdjustmentType] = useState('decrease');
  const [reason, setReason] = useState('damaged');
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Set initial product if passed
  useEffect(() => {
    if (initialProduct?.id) {
      setSelectedProductId(initialProduct.id);
    } else if (!selectedProductId && products.length > 0) {
      setSelectedProductId(products[0].id);
    }
  }, [initialProduct, products]);

  const currentProduct = useMemo(() => {
    return products.find((p) => p.id === selectedProductId) || initialProduct;
  }, [products, selectedProductId, initialProduct]);

  const currentStock = currentProduct ? currentProduct.stock_quantity : 0;
  const qtyNum = parseInt(quantity) || 0;

  const resultingStock = useMemo(() => {
    if (adjustmentType === 'decrease') {
      return currentStock - qtyNum;
    } else {
      return currentStock + qtyNum;
    }
  }, [currentStock, adjustmentType, qtyNum]);

  const isInsufficient = adjustmentType === 'decrease' && resultingStock < 0;

  const handleSubmit = async () => {
    setErrorMessage('');

    if (!selectedProductId) {
      setErrorMessage('Pilih produk yang ingin disesuaikan stoknya.');
      return;
    }

    if (qtyNum <= 0) {
      setErrorMessage('Kuantitas penyesuaian harus lebih dari 0.');
      return;
    }

    if (isInsufficient) {
      setErrorMessage(`Stok saat ini hanya ${currentStock} unit. Tidak dapat dikurangi ${qtyNum} unit.`);
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        product: selectedProductId,
        adjustment_type: adjustmentType,
        reason: reason,
        quantity: qtyNum,
        notes: notes.trim(),
      };

      const res = await stockMovements.adjust(payload);

      // Reset
      setQuantity(1);
      setNotes('');

      if (onSuccess) onSuccess(res.data?.message || 'Penyesuaian stok berhasil disimpan!');
      onClose();
    } catch (err) {
      console.error('Stock adjust error:', err);
      setErrorMessage(
        err.response?.data?.error || err.response?.data?.detail || 'Gagal menyimpan penyesuaian stok.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle sx={{ pb: 1, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Tune color="warning" sx={{ fontSize: 32 }} />
        <Box>
          <Typography variant="h6" fontWeight="bold">
            Penyesuaian Stok (Stock Adjustment)
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Catat barang rusak, kadaluwarsa, hilang, atau selisih hitung toko
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 3 }}>
        {errorMessage && (
          <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2 }} onClose={() => setErrorMessage('')}>
            {errorMessage}
          </Alert>
        )}

        <Grid container spacing={2.5}>
          {/* Product Selector */}
          <Grid item xs={12}>
            <TextField
              select
              fullWidth
              size="small"
              label="Pilih Produk"
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              disabled={Boolean(initialProduct?.id)}
            >
              {products.map((p) => (
                <MenuItem key={p.id} value={p.id}>
                  {p.name} (Stok: {p.stock_quantity}) - SKU: {p.sku}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* Current Stock Banner */}
          {currentProduct && (
            <Grid item xs={12}>
              <Paper
                variant="outlined"
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  bgcolor: alpha(theme.palette.info.main, 0.04),
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Box>
                  <Typography variant="subtitle2" fontWeight="bold">
                    {currentProduct.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Kategori: {currentProduct.category_name || 'Umum'} | SKU: {currentProduct.sku}
                  </Typography>
                </Box>
                <Box textAlign="right">
                  <Typography variant="caption" color="text.secondary" display="block">
                    Stok Saat Ini
                  </Typography>
                  <Typography variant="h6" fontWeight="bold" color="primary.main">
                    {currentStock} unit
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          )}

          {/* Adjustment Direction: Kurang vs Tambah */}
          <Grid item xs={12}>
            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
              Arah Penyesuaian
            </Typography>
            <RadioGroup
              row
              value={adjustmentType}
              onChange={(e) => setAdjustmentType(e.target.value)}
            >
              <Paper
                variant="outlined"
                sx={{
                  p: 1,
                  px: 2,
                  mr: 2,
                  borderRadius: 2,
                  border: adjustmentType === 'decrease' ? `2px solid ${theme.palette.error.main}` : undefined,
                  bgcolor: adjustmentType === 'decrease' ? alpha(theme.palette.error.main, 0.05) : undefined,
                }}
              >
                <FormControlLabel
                  value="decrease"
                  control={<Radio color="error" />}
                  label={
                    <Box display="flex" alignItems="center" gap={0.5}>
                      <RemoveCircle color="error" fontSize="small" />
                      <Typography variant="body2" fontWeight={600} color="error.main">
                        Kurangi Stok (-)
                      </Typography>
                    </Box>
                  }
                />
              </Paper>

              <Paper
                variant="outlined"
                sx={{
                  p: 1,
                  px: 2,
                  borderRadius: 2,
                  border: adjustmentType === 'increase' ? `2px solid ${theme.palette.success.main}` : undefined,
                  bgcolor: adjustmentType === 'increase' ? alpha(theme.palette.success.main, 0.05) : undefined,
                }}
              >
                <FormControlLabel
                  value="increase"
                  control={<Radio color="success" />}
                  label={
                    <Box display="flex" alignItems="center" gap={0.5}>
                      <AddCircle color="success" fontSize="small" />
                      <Typography variant="body2" fontWeight={600} color="success.main">
                        Tambah Stok (+)
                      </Typography>
                    </Box>
                  }
                />
              </Paper>
            </RadioGroup>
          </Grid>

          {/* Reason Category */}
          <Grid item xs={12} sm={6}>
            <TextField
              select
              fullWidth
              size="small"
              label="Alasan Penyesuaian"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            >
              {REASONS.map((r) => (
                <MenuItem key={r.value} value={r.value}>
                  {r.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* Quantity */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              type="number"
              size="small"
              label="Jumlah Unit yang Disesuaikan"
              inputProps={{ min: 1 }}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
          </Grid>

          {/* Stock Preview Result */}
          <Grid item xs={12}>
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: isInsufficient
                  ? alpha(theme.palette.error.main, 0.08)
                  : alpha(theme.palette.success.main, 0.05),
                border: isInsufficient ? `1px solid ${theme.palette.error.main}` : undefined,
              }}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Simulasi Sisa Stok Setelah Disimpan:
                  </Typography>
                  <Typography
                    variant="h5"
                    fontWeight="bold"
                    color={isInsufficient ? 'error.main' : 'success.main'}
                  >
                    {resultingStock} unit
                  </Typography>
                </Box>
                <Box textAlign="right">
                  <Chip
                    label={`${adjustmentType === 'decrease' ? '-' : '+'}${qtyNum} unit`}
                    color={adjustmentType === 'decrease' ? 'error' : 'success'}
                    size="small"
                    sx={{ fontWeight: 'bold' }}
                  />
                  {isInsufficient && (
                    <Typography variant="caption" color="error" display="block" sx={{ mt: 0.5 }}>
                      Stok tidak mencukupi!
                    </Typography>
                  )}
                </Box>
              </Stack>
            </Paper>
          </Grid>

          {/* Detailed Notes */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={2}
              size="small"
              label="Keterangan / Catatan Kejadian"
              placeholder="Contoh: 2 botol sirup pecah terjatuh saat penataan rak display"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 2.5 }}>
        <Button onClick={onClose} disabled={isSubmitting} color="inherit">
          Batal
        </Button>
        <Button
          variant="contained"
          color="warning"
          onClick={handleSubmit}
          disabled={isSubmitting || isInsufficient}
          startIcon={isSubmitting ? <CircularProgress size={18} color="inherit" /> : <CheckCircle />}
          sx={{ borderRadius: 2, fontWeight: 'bold', px: 3 }}
        >
          {isSubmitting ? 'Memproses...' : 'Terapkan Penyesuaian'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default StockAdjustModal;
