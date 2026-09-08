import React, { useState, useMemo } from 'react';
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
  IconButton,
  MenuItem,
  Divider,
  Paper,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  useTheme,
  alpha,
} from '@mui/material';
import {
  LocalShipping,
  Add,
  Delete,
  Inventory,
  AttachMoney,
  ReceiptLong,
  CheckCircle,
} from '@mui/icons-material';
import { useSuppliers, useProducts } from '../../hooks/useSWR';
import { stockMovements } from '../../services/api';
import SupplierDialog from '../Suppliers/SupplierDialog';

const StockInModal = ({ open, onClose, onSuccess }) => {
  const theme = useTheme();
  const { data: suppliersData, mutate: refreshSuppliers } = useSuppliers({ page_size: 100 });
  const { data: productsData } = useProducts({ page_size: 150 });

  const suppliersList = suppliersData?.results || (Array.isArray(suppliersData) ? suppliersData : []);
  const products = productsData?.results || (Array.isArray(productsData) ? productsData : []);

  const [selectedVendor, setSelectedVendor] = useState('');
  const [supplierModalOpen, setSupplierModalOpen] = useState(false);
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState([
    { product: '', quantity: 1, cost_price: '' },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Add new item row
  const handleAddItem = () => {
    setItems([...items, { product: '', quantity: 1, cost_price: '' }]);
  };

  // Remove item row
  const handleRemoveItem = (index) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, idx) => idx !== index));
  };

  // Change item field
  const handleItemChange = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;

    // If product changed, auto-fill current cost price
    if (field === 'product') {
      const p = products.find((prod) => prod.id === value);
      if (p) {
        updated[index].cost_price = p.cost_price || '';
      }
    }

    setItems(updated);
  };

  // Total summary calculations
  const totalQuantity = useMemo(() => {
    return items.reduce((sum, item) => sum + (parseInt(item.quantity) || 0), 0);
  }, [items]);

  const totalEstimatedCost = useMemo(() => {
    return items.reduce((sum, item) => {
      const q = parseInt(item.quantity) || 0;
      const cp = parseFloat(item.cost_price) || 0;
      return sum + q * cp;
    }, 0);
  }, [items]);

  const handleSubmit = async () => {
    setErrorMessage('');

    // Validations
    if (!reference.trim()) {
      setErrorMessage('Nomor Surat Jalan / Faktur Supplier wajib diisi.');
      return;
    }

    const validItems = items.filter((it) => it.product && parseInt(it.quantity) > 0);
    if (validItems.length === 0) {
      setErrorMessage('Pilih minimal 1 produk dengan jumlah lebih dari 0.');
      return;
    }

    // Check duplicate products
    const productIds = validItems.map((it) => it.product);
    if (new Set(productIds).size !== productIds.length) {
      setErrorMessage('Terdapat produk yang duplikat di daftar penerimaan. Mohon gabungkan kuantitasnya.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        supplier: selectedVendor || null,
        vendor: selectedVendor || null,
        reference: reference.trim(),
        notes: notes.trim(),
        items: validItems.map((it) => ({
          product: it.product,
          quantity: parseInt(it.quantity),
          cost_price: it.cost_price ? parseFloat(it.cost_price) : undefined,
        })),
      };

      await stockMovements.stockIn(payload);

      // Reset form
      setSelectedVendor('');
      setReference('');
      setNotes('');
      setItems([{ product: '', quantity: 1, cost_price: '' }]);

      if (onSuccess) onSuccess('Stok dari supplier berhasil ditambahkan ke inventaris!');
      onClose();
    } catch (err) {
      console.error('Stock in error:', err);
      setErrorMessage(
        err.response?.data?.error || err.response?.data?.detail || 'Gagal menyimpan penerimaan barang.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle sx={{ pb: 1, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <LocalShipping color="primary" sx={{ fontSize: 32 }} />
        <Box>
          <Typography variant="h6" fontWeight="bold">
            Penerimaan Barang dari Supplier (Stock In)
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Catat barang masuk dari pemasok untuk menambah stok toko & memperbarui harga modal
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 3 }}>
        {errorMessage && (
          <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2 }} onClose={() => setErrorMessage('')}>
            {errorMessage}
          </Alert>
        )}

        {/* Top Meta: Vendor, No. Surat Jalan, Catatan */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
              <TextField
                select
                fullWidth
                size="small"
                label="Pilih Supplier / Pemasok"
                value={selectedVendor}
                onChange={(e) => setSelectedVendor(e.target.value)}
                helperText="Pilih dari database rekanan distributor"
              >
                <MenuItem value="">
                  <em>-- Tanpa Supplier / Pembelian Langsung --</em>
                </MenuItem>
                {suppliersList.map((s) => (
                  <MenuItem key={s.id} value={s.id}>
                    {s.name} ({s.payment_terms || 'Cash'})
                  </MenuItem>
                ))}
              </TextField>
              <Button
                variant="outlined"
                size="small"
                startIcon={<Add />}
                onClick={() => setSupplierModalOpen(true)}
                sx={{
                  minWidth: 85,
                  height: 40,
                  whiteSpace: 'nowrap',
                  textTransform: 'none',
                  fontWeight: 600,
                  borderRadius: 1.5,
                }}
              >
                Baru
              </Button>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              required
              size="small"
              label="No. Surat Jalan / No. Faktur"
              placeholder="Contoh: SJ-2026/09/001"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              helperText="Wajib diisi sebagai referensi bukti mutasi"
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              size="small"
              label="Catatan Tambahan (Opsional)"
              placeholder="Contoh: Kiriman rutin mingguan, kondisi barang bagus"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </Grid>
        </Grid>

        <Divider sx={{ my: 2 }}>
          <Typography variant="caption" fontWeight="bold" color="text.secondary">
            DAFTAR BARANG YANG DITERIMA
          </Typography>
        </Divider>

        {/* Item Rows Table */}
        <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2, mb: 2 }}>
          <Table size="small">
            <TableHead sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Produk</TableCell>
                <TableCell align="center" sx={{ width: 140, fontWeight: 'bold' }}>
                  Jumlah Masuk
                </TableCell>
                <TableCell align="right" sx={{ width: 180, fontWeight: 'bold' }}>
                  Harga Beli Baru (Rp)
                </TableCell>
                <TableCell align="center" sx={{ width: 60, fontWeight: 'bold' }}>
                  Aksi
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((item, index) => {
                const selectedProd = products.find((p) => p.id === item.product);
                return (
                  <TableRow key={index}>
                    <TableCell>
                      <TextField
                        select
                        fullWidth
                        size="small"
                        value={item.product}
                        onChange={(e) => handleItemChange(index, 'product', e.target.value)}
                      >
                        <MenuItem value="" disabled>
                          -- Pilih Produk --
                        </MenuItem>
                        {products.map((p) => (
                          <MenuItem key={p.id} value={p.id}>
                            {p.name} (Stok: {p.stock_quantity})
                          </MenuItem>
                        ))}
                      </TextField>
                      {selectedProd && (
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                          SKU: {selectedProd.sku} | Stok Saat Ini: {selectedProd.stock_quantity}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align="center">
                      <TextField
                        type="number"
                        size="small"
                        inputProps={{ min: 1 }}
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                        sx={{ width: 100 }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <TextField
                        type="number"
                        size="small"
                        placeholder="Harga modal"
                        value={item.cost_price}
                        onChange={(e) => handleItemChange(index, 'cost_price', e.target.value)}
                        InputProps={{
                          startAdornment: <Typography variant="caption" sx={{ mr: 0.5 }}>Rp</Typography>,
                        }}
                        sx={{ width: 150 }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        color="error"
                        size="small"
                        disabled={items.length <= 1}
                        onClick={() => handleRemoveItem(index)}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>

        <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
          <Button
            variant="outlined"
            startIcon={<Add />}
            onClick={handleAddItem}
            size="small"
            sx={{ borderRadius: 2, fontWeight: 600 }}
          >
            Tambah Baris Produk
          </Button>

          <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2, bgcolor: 'background.default' }}>
            <Typography variant="caption" color="text.secondary" display="block">
              Total Barang Masuk: <strong>{totalQuantity} unit</strong> ({items.filter(i => i.product).length} jenis)
            </Typography>
            {totalEstimatedCost > 0 && (
              <Typography variant="caption" color="text.secondary" display="block">
                Total Estimasi Modal: <strong>Rp {totalEstimatedCost.toLocaleString('id-ID')}</strong>
              </Typography>
            )}
          </Paper>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2.5 }}>
        <Button onClick={onClose} disabled={isSubmitting} color="inherit">
          Batal
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          disabled={isSubmitting}
          startIcon={isSubmitting ? <CircularProgress size={18} color="inherit" /> : <CheckCircle />}
          sx={{ borderRadius: 2, fontWeight: 'bold', px: 3 }}
        >
          {isSubmitting ? 'Menyimpan...' : 'Simpan & Tambah ke Stok'}
        </Button>
      </DialogActions>

      {/* Quick Add Supplier Dialog */}
      <SupplierDialog
        open={supplierModalOpen}
        onClose={() => setSupplierModalOpen(false)}
        onSuccess={(newSupplier) => {
          refreshSuppliers();
          if (newSupplier?.id) {
            setSelectedVendor(newSupplier.id);
          }
        }}
      />
    </Dialog>
  );
};

export default StockInModal;
