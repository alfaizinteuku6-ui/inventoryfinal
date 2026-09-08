import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Grid,
  Paper,
  Alert,
  Box,
  useTheme,
} from "@mui/material";
import {
  CurrencyExchange,
  AccountBalanceWallet,
  WarningAmber,
} from "@mui/icons-material";

const CancelSaleModal = ({
  open,
  onClose,
  onChoose, // (choice) => void, choice = "refund" | "credit" | "cancel"
  sale = null,
}) => {
  const theme = useTheme();

  const paidAmount = parseFloat(sale?.paid_amount || 0);
  const isPaidOrPartial = paidAmount > 0 || ["paid", "partial"].includes(sale?.payment_status);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: theme.shadows[8],
        },
      }}
    >
      <DialogTitle sx={{ textAlign: "center", fontWeight: 700, pt: 3 }}>
        Retur / Pembatalan Transaksi
      </DialogTitle>

      <DialogContent>
        <Typography
          variant="body2"
          sx={{ textAlign: "center", mb: 2, color: "text.secondary" }}
        >
          {sale?.sale_number ? `Nomor Transaksi: ${sale.sale_number}` : ""}
        </Typography>

        <Alert severity="info" icon={<WarningAmber />} sx={{ mb: 2.5, borderRadius: 2 }}>
          <strong>Stok Otomatis Kembali:</strong> Semua barang dalam transaksi ini akan
          langsung dikembalikan ke stok inventaris secara otomatis.
        </Alert>

        {isPaidOrPartial ? (
          <Box>
            <Typography variant="body2" sx={{ textAlign: "center", mb: 2 }}>
              Transaksi ini memiliki pembayaran sebesar{" "}
              <strong>Rp {paidAmount.toLocaleString("id-ID")}</strong>. Pilih metode
              pengembalian dana:
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Paper
                  onClick={() => onChoose("refund")}
                  sx={{
                    p: 2.5,
                    textAlign: "center",
                    cursor: "pointer",
                    borderRadius: 2,
                    border: `1.5px solid ${theme.palette.primary.main}`,
                    transition: "all 0.2s",
                    "&:hover": {
                      backgroundColor: theme.palette.action.hover,
                      transform: "translateY(-2px)",
                      boxShadow: theme.shadows[3],
                    },
                  }}
                  elevation={0}
                >
                  <CurrencyExchange
                    sx={{ fontSize: 38, color: theme.palette.primary.main }}
                  />
                  <Typography variant="subtitle1" fontWeight={700} sx={{ mt: 1 }}>
                    Refund Dana
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Kembalikan uang tunai / transfer ke pelanggan
                  </Typography>
                </Paper>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Paper
                  onClick={() => onChoose("credit")}
                  sx={{
                    p: 2.5,
                    textAlign: "center",
                    cursor: "pointer",
                    borderRadius: 2,
                    border: `1.5px solid ${theme.palette.secondary.main}`,
                    transition: "all 0.2s",
                    "&:hover": {
                      backgroundColor: theme.palette.action.hover,
                      transform: "translateY(-2px)",
                      boxShadow: theme.shadows[3],
                    },
                  }}
                  elevation={0}
                >
                  <AccountBalanceWallet
                    sx={{ fontSize: 38, color: theme.palette.secondary.main }}
                  />
                  <Typography variant="subtitle1" fontWeight={700} sx={{ mt: 1 }}>
                    Saldo Toko (Credit)
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Simpan sebagai deposit kredit belanja pelanggan
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        ) : (
          <Typography variant="body1" sx={{ textAlign: "center", my: 2 }}>
            Apakah Anda yakin ingin membatalkan transaksi yang belum lunas ini?
          </Typography>
        )}
      </DialogContent>

      <DialogActions sx={{ justifyContent: "center", pb: 3, px: 3 }}>
        <Button variant="outlined" color="inherit" onClick={onClose} sx={{ borderRadius: 2 }}>
          Tutup / Batal
        </Button>
        {!isPaidOrPartial && (
          <Button
            variant="contained"
            color="error"
            onClick={() => onChoose("cancel")}
            sx={{ borderRadius: 2, fontWeight: "bold" }}
          >
            Ya, Batalkan Transaksi
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default CancelSaleModal;

