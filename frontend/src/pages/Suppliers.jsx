import React, { useState, useMemo } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  TextField,
  InputAdornment,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Avatar,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  CircularProgress,
  Snackbar,
  Alert,
  useTheme,
  alpha,
  Link,
} from "@mui/material";
import {
  LocalShipping as LocalShippingIcon,
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Phone as PhoneIcon,
  WhatsApp as WhatsAppIcon,
  Email as EmailIcon,
  Business as BusinessIcon,
  AccountBalance as BankIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Inventory2 as Inventory2Icon,
  ReceiptLong as ReceiptLongIcon,
} from "@mui/icons-material";
import HeaderCard from "../components/HeaderCard";
import SupplierDialog from "../components/Suppliers/SupplierDialog";
import { useSuppliers } from "../hooks/useSWR";
import { suppliers as suppliersApi } from "../services/api";

const Suppliers = () => {
  const theme = useTheme();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTerms, setFilterTerms] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);

  // Delete state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [supplierToDelete, setSupplierToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Toast snackbar
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const { data, isLoading, mutate } = useSuppliers({ page_size: 100 });
  const rawSuppliers = data?.results || (Array.isArray(data) ? data : []);

  // Filter & search logic
  const filteredSuppliers = useMemo(() => {
    return rawSuppliers.filter((s) => {
      const q = searchTerm.toLowerCase();
      const matchSearch =
        !q ||
        s.name?.toLowerCase().includes(q) ||
        s.contact_person?.toLowerCase().includes(q) ||
        s.phone?.toLowerCase().includes(q) ||
        s.city?.toLowerCase().includes(q) ||
        s.email?.toLowerCase().includes(q);

      const matchTerms =
        filterTerms === "all" ||
        (filterTerms === "cash" && s.payment_terms?.toLowerCase().includes("cash")) ||
        (filterTerms === "tempo" && s.payment_terms?.toLowerCase().includes("tempo"));

      return matchSearch && matchTerms;
    });
  }, [rawSuppliers, searchTerm, filterTerms]);

  // KPI Metrics
  const metrics = useMemo(() => {
    const total = rawSuppliers.length;
    const tempoCount = rawSuppliers.filter((s) =>
      s.payment_terms?.toLowerCase().includes("tempo")
    ).length;
    const cashCount = rawSuppliers.filter((s) =>
      s.payment_terms?.toLowerCase().includes("cash")
    ).length;
    const totalDeliveries = rawSuppliers.reduce(
      (acc, s) => acc + (s.deliveries_count || 0),
      0
    );
    return { total, tempoCount, cashCount, totalDeliveries };
  }, [rawSuppliers]);

  const handleOpenAdd = () => {
    setEditingSupplier(null);
    setDialogOpen(true);
  };

  const handleOpenEdit = (supplier) => {
    setEditingSupplier(supplier);
    setDialogOpen(true);
  };

  const handleOpenDelete = (supplier) => {
    setSupplierToDelete(supplier);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!supplierToDelete) return;
    setIsDeleting(true);
    try {
      await suppliersApi.delete(supplierToDelete.id);
      setSnackbar({
        open: true,
        message: `Supplier "${supplierToDelete.name}" berhasil dihapus`,
        severity: "success",
      });
      mutate();
      setDeleteDialogOpen(false);
    } catch (err) {
      console.error("Error deleting supplier:", err);
      setSnackbar({
        open: true,
        message:
          err.response?.data?.error ||
          err.response?.data?.detail ||
          "Gagal menghapus supplier.",
        severity: "error",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDialogSuccess = (savedItem, msg) => {
    mutate();
    setSnackbar({
      open: true,
      message: msg,
      severity: "success",
    });
  };

  // Helper formatting WhatsApp URL
  const getWhatsAppUrl = (phone) => {
    if (!phone) return null;
    let clean = phone.replace(/[^\d]/g, "");
    if (clean.startsWith("0")) {
      clean = "62" + clean.slice(1);
    }
    return `https://wa.me/${clean}`;
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Header */}
      <HeaderCard
        icon={<LocalShippingIcon fontSize="large" />}
        title="Manajemen Pemasok / Supplier"
        subtitle="Kelola database distributor barang, kontak sales, syarat pembayaran, dan riwayat pasokan barang"
        actionButton={
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleOpenAdd}
            sx={{
              fontWeight: 600,
              boxShadow: 2,
              px: 2.5,
              py: 1,
              borderRadius: 2,
            }}
          >
            + Tambah Supplier
          </Button>
        }
      />

      {/* KPI Cards */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            elevation={1}
            sx={{
              p: 2,
              borderRadius: 3,
              display: "flex",
              alignItems: "center",
              gap: 2,
              bgcolor: alpha(theme.palette.primary.main, 0.05),
              border: `1px solid ${alpha(theme.palette.primary.main, 0.15)}`,
            }}
          >
            <Avatar
              sx={{
                bgcolor: "primary.main",
                width: 50,
                height: 50,
                borderRadius: 2.5,
              }}
            >
              <BusinessIcon fontSize="medium" />
            </Avatar>
            <Box>
              <Typography variant="body2" color="text.secondary" fontWeight={500}>
                Total Supplier
              </Typography>
              <Typography variant="h5" fontWeight="bold" color="primary.main">
                {metrics.total}
              </Typography>
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            elevation={1}
            sx={{
              p: 2,
              borderRadius: 3,
              display: "flex",
              alignItems: "center",
              gap: 2,
              bgcolor: alpha(theme.palette.warning.main, 0.05),
              border: `1px solid ${alpha(theme.palette.warning.main, 0.15)}`,
            }}
          >
            <Avatar
              sx={{
                bgcolor: "warning.main",
                width: 50,
                height: 50,
                borderRadius: 2.5,
              }}
            >
              <ScheduleIcon fontSize="medium" />
            </Avatar>
            <Box>
              <Typography variant="body2" color="text.secondary" fontWeight={500}>
                Pembayaran Tempo
              </Typography>
              <Typography variant="h5" fontWeight="bold" color="warning.main">
                {metrics.tempoCount}{" "}
                <Typography component="span" variant="caption" color="text.secondary">
                  rekanan
                </Typography>
              </Typography>
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            elevation={1}
            sx={{
              p: 2,
              borderRadius: 3,
              display: "flex",
              alignItems: "center",
              gap: 2,
              bgcolor: alpha(theme.palette.success.main, 0.05),
              border: `1px solid ${alpha(theme.palette.success.main, 0.15)}`,
            }}
          >
            <Avatar
              sx={{
                bgcolor: "success.main",
                width: 50,
                height: 50,
                borderRadius: 2.5,
              }}
            >
              <CheckCircleIcon fontSize="medium" />
            </Avatar>
            <Box>
              <Typography variant="body2" color="text.secondary" fontWeight={500}>
                Pembayaran Cash
              </Typography>
              <Typography variant="h5" fontWeight="bold" color="success.main">
                {metrics.cashCount}{" "}
                <Typography component="span" variant="caption" color="text.secondary">
                  rekanan
                </Typography>
              </Typography>
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            elevation={1}
            sx={{
              p: 2,
              borderRadius: 3,
              display: "flex",
              alignItems: "center",
              gap: 2,
              bgcolor: alpha(theme.palette.info.main, 0.05),
              border: `1px solid ${alpha(theme.palette.info.main, 0.15)}`,
            }}
          >
            <Avatar
              sx={{
                bgcolor: "info.main",
                width: 50,
                height: 50,
                borderRadius: 2.5,
              }}
            >
              <ReceiptLongIcon fontSize="medium" />
            </Avatar>
            <Box>
              <Typography variant="body2" color="text.secondary" fontWeight={500}>
                Total Pasokan Masuk
              </Typography>
              <Typography variant="h5" fontWeight="bold" color="info.main">
                {metrics.totalDeliveries}{" "}
                <Typography component="span" variant="caption" color="text.secondary">
                  kali
                </Typography>
              </Typography>
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* Filter & Search Bar */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 3,
          borderRadius: 3,
          border: "1px solid",
          borderColor: "divider",
          display: "flex",
          flexWrap: "wrap",
          gap: 2,
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box sx={{ display: "flex", gap: 2, flex: 1, minWidth: { xs: "100%", md: 400 } }}>
          <TextField
            size="small"
            fullWidth
            placeholder="Cari nama supplier, sales PIC, no. HP, atau kota..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" color="action" />
                </InputAdornment>
              ),
            }}
          />

          <TextField
            select
            size="small"
            sx={{ minWidth: 180 }}
            value={filterTerms}
            onChange={(e) => setFilterTerms(e.target.value)}
          >
            <MenuItem value="all">Semua Syarat Bayar</MenuItem>
            <MenuItem value="tempo">Jatuh Tempo (Hutang)</MenuItem>
            <MenuItem value="cash">Tunai / Cash</MenuItem>
          </TextField>
        </Box>

        <Typography variant="body2" color="text.secondary">
          Menampilkan <strong>{filteredSuppliers.length}</strong> supplier
        </Typography>
      </Paper>

      {/* Suppliers Table */}
      <TableContainer
        component={Paper}
        elevation={0}
        sx={{
          borderRadius: 3,
          border: "1px solid",
          borderColor: "divider",
          overflow: "hidden",
        }}
      >
        <Table>
          <TableHead sx={{ bgcolor: alpha(theme.palette.primary.main, 0.04) }}>
            <TableRow>
              <TableCell sx={{ fontWeight: "bold" }}>Nama Supplier & Alamat</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Kontak Sales / PIC</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Syarat Pembayaran</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Rekening Bank</TableCell>
              <TableCell sx={{ fontWeight: "bold", textAlign: "center" }}>
                Katalog Produk
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", textAlign: "center" }}>
                Pengiriman
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", textAlign: "right" }}>Aksi</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} sx={{ textAlign: "center", py: 6 }}>
                  <CircularProgress size={36} />
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Memuat data supplier...
                  </Typography>
                </TableCell>
              </TableRow>
            ) : filteredSuppliers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} sx={{ textAlign: "center", py: 6 }}>
                  <LocalShippingIcon sx={{ fontSize: 48, color: "text.disabled", mb: 1 }} />
                  <Typography variant="subtitle1" fontWeight="bold">
                    Tidak ada supplier ditemukan
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {searchTerm
                      ? "Coba kata kunci pencarian yang lain."
                      : "Belum ada data supplier. Klik tombol + Tambah Supplier untuk mendaftarkan."}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredSuppliers.map((supplier) => {
                const waUrl = getWhatsAppUrl(supplier.phone);
                const isTempo = supplier.payment_terms?.toLowerCase().includes("tempo");

                return (
                  <TableRow
                    key={supplier.id}
                    hover
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    {/* Supplier Info */}
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                        <Avatar
                          sx={{
                            bgcolor: alpha(theme.palette.primary.main, 0.15),
                            color: "primary.main",
                            fontWeight: "bold",
                            width: 42,
                            height: 42,
                          }}
                        >
                          {supplier.name?.charAt(0) || "S"}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2" fontWeight="bold">
                            {supplier.name}
                          </Typography>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ display: "block", maxWidth: 260 }}
                            noWrap
                          >
                            {supplier.city ? `📍 ${supplier.city}` : ""}
                            {supplier.city && supplier.address ? " — " : ""}
                            {supplier.address || ""}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>

                    {/* Contact Person & WA */}
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight={500}>
                          {supplier.contact_person || "-"}
                        </Typography>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5 }}>
                          <Typography variant="caption" color="text.secondary">
                            {supplier.phone}
                          </Typography>
                          {waUrl && (
                            <Tooltip title="Chat via WhatsApp">
                              <IconButton
                                size="small"
                                component="a"
                                href={waUrl}
                                target="_blank"
                                rel="noreferrer"
                                sx={{
                                  p: 0.3,
                                  color: "#25D366",
                                  bgcolor: alpha("#25D366", 0.1),
                                  "&:hover": { bgcolor: alpha("#25D366", 0.2) },
                                }}
                              >
                                <WhatsAppIcon fontSize="inherit" />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Box>
                      </Box>
                    </TableCell>

                    {/* Payment Terms */}
                    <TableCell>
                      <Chip
                        label={supplier.payment_terms || "Cash"}
                        size="small"
                        color={isTempo ? "warning" : "success"}
                        variant={isTempo ? "filled" : "outlined"}
                        sx={{ fontWeight: 600, fontSize: "0.75rem" }}
                      />
                    </TableCell>

                    {/* Bank Info */}
                    <TableCell>
                      <Typography variant="body2" sx={{ maxWidth: 220 }} noWrap>
                        {supplier.bank_account || "-"}
                      </Typography>
                    </TableCell>

                    {/* Products count */}
                    <TableCell sx={{ textAlign: "center" }}>
                      <Chip
                        label={`${supplier.products_count || 0} produk`}
                        size="small"
                        variant="outlined"
                        color="primary"
                        sx={{ fontWeight: 500 }}
                      />
                    </TableCell>

                    {/* Deliveries count */}
                    <TableCell sx={{ textAlign: "center" }}>
                      <Typography variant="body2" fontWeight="bold">
                        {supplier.deliveries_count || 0}
                      </Typography>
                    </TableCell>

                    {/* Actions */}
                    <TableCell sx={{ textAlign: "right" }}>
                      <Tooltip title="Edit Data Supplier">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleOpenEdit(supplier)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Hapus Supplier">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleOpenDelete(supplier)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Supplier Dialog (Create / Edit) */}
      <SupplierDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        editingSupplier={editingSupplier}
        onSuccess={handleDialogSuccess}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        PaperProps={{ sx: { borderRadius: 3, p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: "bold" }}>Konfirmasi Hapus Supplier</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Apakah Anda yakin ingin menghapus supplier{" "}
            <strong>"{supplierToDelete?.name}"</strong>? Data riwayat pengiriman stok lama
            akan tetap tersimpan di riwayat mutasi stok.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteDialogOpen(false)} disabled={isDeleting} color="inherit">
            Batal
          </Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
            disabled={isDeleting}
            startIcon={isDeleting ? <CircularProgress size={18} color="inherit" /> : <DeleteIcon />}
          >
            {isDeleting ? "Menghapus..." : "Hapus Supplier"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar feedback */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: "100%", borderRadius: 2, boxShadow: 3 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Suppliers;
