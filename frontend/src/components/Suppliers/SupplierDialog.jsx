import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  TextField,
  Typography,
  Grid,
  MenuItem,
  CircularProgress,
  Alert,
  InputAdornment,
} from "@mui/material";
import {
  LocalShipping as LocalShippingIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationCity as CityIcon,
  AccountBalance as BankIcon,
  Payment as PaymentIcon,
  Save as SaveIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import { suppliers } from "../../services/api";

const PAYMENT_TERMS_OPTIONS = [
  "Cash / Tunai Saat Terima",
  "Tempo 7 Hari",
  "Tempo 14 Hari",
  "Tempo 30 Hari",
  "Tempo 60 Hari",
  "Konsinyasi",
];

const SupplierDialog = ({ open, onClose, editingSupplier = null, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: "",
    contact_person: "",
    phone: "",
    email: "",
    city: "",
    address: "",
    payment_terms: "Cash / Tunai Saat Terima",
    bank_account: "",
    notes: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState("");

  useEffect(() => {
    if (editingSupplier) {
      setFormData({
        name: editingSupplier.name || "",
        contact_person: editingSupplier.contact_person || "",
        phone: editingSupplier.phone || "",
        email: editingSupplier.email || "",
        city: editingSupplier.city || "",
        address: editingSupplier.address || "",
        payment_terms: editingSupplier.payment_terms || "Cash / Tunai Saat Terima",
        bank_account: editingSupplier.bank_account || "",
        notes: editingSupplier.notes || "",
      });
    } else {
      setFormData({
        name: "",
        contact_person: "",
        phone: "",
        email: "",
        city: "",
        address: "",
        payment_terms: "Cash / Tunai Saat Terima",
        bank_account: "",
        notes: "",
      });
    }
    setErrors({});
    setApiError("");
  }, [editingSupplier, open]);

  const handleChange = (field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validate = () => {
    const err = {};
    if (!formData.name.trim()) {
      err.name = "Nama Supplier / Perusahaan wajib diisi";
    }
    if (!formData.phone.trim()) {
      err.phone = "Nomor Telepon / WhatsApp wajib diisi";
    }
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      err.email = "Format email tidak valid";
    }
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setApiError("");

    try {
      let result;
      if (editingSupplier) {
        result = await suppliers.update(editingSupplier.id, formData);
      } else {
        result = await suppliers.create(formData);
      }

      if (onSuccess) {
        onSuccess(result.data, editingSupplier ? "Data supplier berhasil diperbarui" : "Supplier baru berhasil ditambahkan");
      }
      onClose();
    } catch (err) {
      console.error("Error saving supplier:", err);
      const msg =
        err.response?.data?.error ||
        err.response?.data?.name?.[0] ||
        err.response?.data?.detail ||
        "Gagal menyimpan data supplier.";
      setApiError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
        },
      }}
    >
      <DialogTitle
        sx={{
          pb: 1.5,
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Box
          sx={{
            bgcolor: "primary.main",
            color: "white",
            p: 1,
            borderRadius: 2,
            display: "flex",
          }}
        >
          <LocalShippingIcon />
        </Box>
        <Box>
          <Typography variant="h6" fontWeight="bold">
            {editingSupplier ? "Edit Data Supplier" : "Tambah Supplier Baru"}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Lengkapi data distributor / pemasok untuk pencatatan barang masuk dan kontak sales
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 3, pt: 3 }}>
        {apiError && (
          <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2 }} onClose={() => setApiError("")}>
            {apiError}
          </Alert>
        )}

        <Grid container spacing={2.5} sx={{ mt: 0.5 }}>
          {/* Nama Supplier & PIC */}
          <Grid item xs={12} sm={7}>
            <TextField
              fullWidth
              label="Nama Supplier / Perusahaan"
              placeholder="Contoh: PT Indofood CBP Sukses Makmur"
              value={formData.name}
              onChange={handleChange("name")}
              error={Boolean(errors.name)}
              helperText={errors.name || "Nama PT, CV, atau toko distributor pemasok"}
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LocalShippingIcon fontSize="small" color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          <Grid item xs={12} sm={5}>
            <TextField
              fullWidth
              label="Nama Kontak Sales / PIC"
              placeholder="Contoh: Hendra Wijaya"
              value={formData.contact_person}
              onChange={handleChange("contact_person")}
              helperText="Orang yang bisa dihubungi"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon fontSize="small" color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          {/* Kontak Telepon / WA & Email */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="No. Telepon / WhatsApp"
              placeholder="Contoh: 081288990011"
              value={formData.phone}
              onChange={handleChange("phone")}
              error={Boolean(errors.phone)}
              helperText={errors.phone || "Dapat langsung dihubungi via WA"}
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PhoneIcon fontSize="small" color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Email Supplier"
              placeholder="sales@supplier.com"
              type="email"
              value={formData.email}
              onChange={handleChange("email")}
              error={Boolean(errors.email)}
              helperText={errors.email || "Opsional"}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon fontSize="small" color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          {/* Kota & Alamat */}
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Kota"
              placeholder="Contoh: Jakarta Timur"
              value={formData.city}
              onChange={handleChange("city")}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <CityIcon fontSize="small" color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          <Grid item xs={12} sm={8}>
            <TextField
              fullWidth
              label="Alamat Gudang / Kantor"
              placeholder="Kawasan Industri, Jl. Raya..."
              value={formData.address}
              onChange={handleChange("address")}
            />
          </Grid>

          {/* Syarat Pembayaran & Rekening Bank */}
          <Grid item xs={12} sm={5}>
            <TextField
              select
              fullWidth
              label="Syarat Pembayaran"
              value={formData.payment_terms}
              onChange={handleChange("payment_terms")}
              helperText="Ketentuan jatuh tempo pembayaran"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PaymentIcon fontSize="small" color="action" />
                  </InputAdornment>
                ),
              }}
            >
              {PAYMENT_TERMS_OPTIONS.map((opt) => (
                <MenuItem key={opt} value={opt}>
                  {opt}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} sm={7}>
            <TextField
              fullWidth
              label="Info Rekening Bank (Transfer)"
              placeholder="Contoh: BCA 5420198888 a/n PT Indofood"
              value={formData.bank_account}
              onChange={handleChange("bank_account")}
              helperText="Untuk kemudahan transfer pelunasan invoice"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <BankIcon fontSize="small" color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          {/* Catatan Khusus */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={2}
              label="Catatan Khusus / Jadwal Kirim"
              placeholder="Contoh: Jadwal pengiriman setiap Selasa & Jumat, min order 5 karton"
              value={formData.notes}
              onChange={handleChange("notes")}
            />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 2.5, px: 3, borderTop: "1px solid", borderColor: "divider" }}>
        <Button onClick={onClose} disabled={isSubmitting} color="inherit" startIcon={<CloseIcon />}>
          Batal
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="primary"
          disabled={isSubmitting}
          startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
          sx={{ minWidth: 140, fontWeight: "bold" }}
        >
          {isSubmitting ? "Menyimpan..." : editingSupplier ? "Update Supplier" : "Simpan Supplier"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SupplierDialog;
