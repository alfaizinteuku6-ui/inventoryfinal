import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  TextField,
  Switch,
  FormControlLabel,
  RadioGroup,
  Radio,
  Divider,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Stack,
  Alert,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Print,
  Bluetooth,
  Usb,
  Computer,
  CheckCircle,
  Cancel,
  Refresh,
  PointOfSale,
  Save,
  MeetingRoom,
  Tune,
  Receipt,
  Search,
  Check,
} from '@mui/icons-material';
import {
  getPrinterConfig,
  savePrinterConfig,
  connectPrinter,
  disconnectPrinter,
  triggerTestPrint,
  AVAILABLE_DEVICES,
  isBluetoothSupported,
  isUsbSupported,
} from '../utils/printerService';
import CustomSnackbar from '../components/CustomSnackbar';

const PrinterSettings = () => {
  const theme = useTheme();

  // State
  const [config, setConfig] = useState(getPrinterConfig());
  const [deviceDialogOpen, setDeviceDialogOpen] = useState(false);
  const [deviceFilter, setDeviceFilter] = useState('all');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Form state
  const [storeName, setStoreName] = useState(config.storeName);
  const [storeAddress, setStoreAddress] = useState(config.storeAddress);
  const [storePhone, setStorePhone] = useState(config.storePhone);
  const [footerNote, setFooterNote] = useState(config.footerNote);
  const [paperSize, setPaperSize] = useState(config.paperSize);
  const [autoPrint, setAutoPrint] = useState(config.autoPrint);
  const [autoCashDrawer, setAutoCashDrawer] = useState(config.autoCashDrawer);

  useEffect(() => {
    const fresh = getPrinterConfig();
    setConfig(fresh);
    setStoreName(fresh.storeName);
    setStoreAddress(fresh.storeAddress);
    setStorePhone(fresh.storePhone);
    setFooterNote(fresh.footerNote);
    setPaperSize(fresh.paperSize);
    setAutoPrint(fresh.autoPrint);
    setAutoCashDrawer(fresh.autoCashDrawer);
  }, []);

  const handleDisconnect = () => {
    const updated = disconnectPrinter();
    setConfig(updated);
    setSnackbar({ open: true, message: 'Printer berhasil diputuskan.', severity: 'info' });
  };

  const handleReconnect = () => {
    const updated = connectPrinter();
    setConfig(updated);
    setSnackbar({ open: true, message: `Berhasil terhubung ke ${updated.deviceName}`, severity: 'success' });
  };

  const handleSelectDevice = (device) => {
    const updated = connectPrinter(device);
    setConfig(updated);
    setPaperSize(updated.paperSize);
    setDeviceDialogOpen(false);
    setSnackbar({
      open: true,
      message: `Terkoneksi dengan perangkat: ${device.name}`,
      severity: 'success',
    });
  };

  const handleSaveSettings = () => {
    const updated = {
      ...config,
      storeName: storeName.trim() || 'TOKO KASIR',
      storeAddress: storeAddress.trim(),
      storePhone: storePhone.trim(),
      footerNote: footerNote.trim(),
      paperSize,
      autoPrint,
      autoCashDrawer,
    };
    savePrinterConfig(updated);
    setConfig(updated);
    setSnackbar({ open: true, message: 'Pengaturan printer & struk berhasil disimpan!', severity: 'success' });
  };

  const handleTestPrint = () => {
    try {
      triggerTestPrint({
        ...config,
        storeName,
        storeAddress,
        storePhone,
        footerNote,
        paperSize,
      });
      setSnackbar({ open: true, message: 'Perintah cetak uji coba terkirim!', severity: 'success' });
    } catch (e) {
      setSnackbar({ open: true, message: e.message || 'Gagal cetak uji coba', severity: 'error' });
    }
  };

  const handleTestCashDrawer = () => {
    setSnackbar({
      open: true,
      message: 'Sinyal kick RJ11 berhasil dikirim ke Laci Kasir (Cash Drawer).',
      severity: 'success',
    });
  };

  // Helper for device icon
  const getDeviceIcon = (type) => {
    switch (type) {
      case 'bluetooth':
        return <Bluetooth color="primary" />;
      case 'usb':
        return <Usb color="secondary" />;
      default:
        return <Computer color="action" />;
    }
  };

  const filteredDevices = useMemo(() => {
    if (deviceFilter === 'all') return AVAILABLE_DEVICES;
    return AVAILABLE_DEVICES.filter((d) => d.type === deviceFilter);
  }, [deviceFilter]);

  return (
    <Box sx={{ width: '100%', minHeight: '100vh', p: { xs: 2, sm: 3 } }}>
      {/* Header */}
      <Box display="flex" alignItems="center" gap={1.5} mb={3}>
        <Print sx={{ fontSize: 36, color: 'primary.main' }} />
        <Box>
          <Typography variant="h5" fontWeight="bold">
            Pengaturan Printer & Struk Kasir
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Kelola koneksi printer Bluetooth / USB, format kertas thermal 58mm/80mm, dan personalisasi struk belanja
          </Typography>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* ================= LEFT COLUMN: SETTINGS & CONTROLS ================= */}
        <Grid item xs={12} lg={7}>
          <Stack spacing={3}>
            {/* 1. Device Connection Status Card */}
            <Card sx={{ borderRadius: 3, border: '1px solid rgba(0,0,0,0.08)' }}>
              <CardContent sx={{ p: 3 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6" fontWeight="bold">
                    Koneksi Perangkat Printer
                  </Typography>
                  <Chip
                    icon={config.isConnected ? <CheckCircle /> : <Cancel />}
                    label={config.isConnected ? 'TERKONEKSI (ONLINE)' : 'TERPUTUS (OFFLINE)'}
                    color={config.isConnected ? 'success' : 'error'}
                    sx={{ fontWeight: 'bold' }}
                  />
                </Box>

                <Paper
                  variant="outlined"
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    bgcolor: config.isConnected
                      ? alpha(theme.palette.success.main, 0.05)
                      : alpha(theme.palette.error.main, 0.05),
                    border: config.isConnected
                      ? `1.5px solid ${theme.palette.success.main}`
                      : `1.5px dashed ${theme.palette.error.main}`,
                    mb: 2.5,
                  }}
                >
                  <Box display="flex" alignItems="center" gap={2}>
                    <Box
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        bgcolor: 'background.paper',
                        boxShadow: theme.shadows[1],
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {getDeviceIcon(config.connectionType)}
                    </Box>
                    <Box flex={1}>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {config.deviceName}
                      </Typography>
                      <Box display="flex" gap={1} mt={0.5} flexWrap="wrap">
                        <Chip
                          label={`Tipe: ${config.connectionType.toUpperCase()}`}
                          size="small"
                          variant="outlined"
                        />
                        <Chip
                          label={`Format: ${paperSize}`}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      </Box>
                    </Box>
                  </Box>
                </Paper>

                {/* Connection Action Buttons */}
                <Grid container spacing={1.5}>
                  <Grid item xs={12} sm={6}>
                    {config.isConnected ? (
                      <Button
                        variant="outlined"
                        color="error"
                        fullWidth
                        startIcon={<Cancel />}
                        onClick={handleDisconnect}
                        sx={{ borderRadius: 2, fontWeight: 600, textTransform: 'none' }}
                      >
                        Putuskan Koneksi (Disconnect)
                      </Button>
                    ) : (
                      <Button
                        variant="contained"
                        color="success"
                        fullWidth
                        startIcon={<CheckCircle />}
                        onClick={handleReconnect}
                        sx={{ borderRadius: 2, fontWeight: 600, textTransform: 'none' }}
                      >
                        Sambungkan Ulang
                      </Button>
                    )}
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Button
                      variant="contained"
                      color="primary"
                      fullWidth
                      startIcon={<Search />}
                      onClick={() => setDeviceDialogOpen(true)}
                      sx={{ borderRadius: 2, fontWeight: 600, textTransform: 'none' }}
                    >
                      Cari / Ganti Perangkat
                    </Button>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Button
                      variant="outlined"
                      color="info"
                      fullWidth
                      startIcon={<Print />}
                      onClick={handleTestPrint}
                      disabled={!config.isConnected}
                      sx={{ borderRadius: 2, fontWeight: 600, textTransform: 'none' }}
                    >
                      Cetak Uji Coba (Test Print)
                    </Button>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Button
                      variant="outlined"
                      color="secondary"
                      fullWidth
                      startIcon={<PointOfSale />}
                      onClick={handleTestCashDrawer}
                      disabled={!config.isConnected}
                      sx={{ borderRadius: 2, fontWeight: 600, textTransform: 'none' }}
                    >
                      Uji Buka Laci Kasir (RJ11)
                    </Button>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* 2. Paper Size & Automation Settings Card */}
            <Card sx={{ borderRadius: 3, border: '1px solid rgba(0,0,0,0.08)' }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Format Kertas & Otomasi
                </Typography>

                <Box mb={2}>
                  <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                    Pilih Lebar Kertas Thermal:
                  </Typography>
                  <RadioGroup
                    row
                    value={paperSize}
                    onChange={(e) => setPaperSize(e.target.value)}
                  >
                    <Paper
                      variant="outlined"
                      sx={{
                        p: 1.5,
                        px: 2.5,
                        mr: 2,
                        borderRadius: 2,
                        border: paperSize === '58mm' ? `2px solid ${theme.palette.primary.main}` : undefined,
                        bgcolor: paperSize === '58mm' ? alpha(theme.palette.primary.main, 0.05) : undefined,
                      }}
                    >
                      <FormControlLabel
                        value="58mm"
                        control={<Radio color="primary" />}
                        label={
                          <Box>
                            <Typography variant="body2" fontWeight="bold">
                              58mm (Mini Portable)
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Printer Bluetooth HP / Tablet
                            </Typography>
                          </Box>
                        }
                      />
                    </Paper>

                    <Paper
                      variant="outlined"
                      sx={{
                        p: 1.5,
                        px: 2.5,
                        borderRadius: 2,
                        border: paperSize === '80mm' ? `2px solid ${theme.palette.primary.main}` : undefined,
                        bgcolor: paperSize === '80mm' ? alpha(theme.palette.primary.main, 0.05) : undefined,
                      }}
                    >
                      <FormControlLabel
                        value="80mm"
                        control={<Radio color="primary" />}
                        label={
                          <Box>
                            <Typography variant="body2" fontWeight="bold">
                              80mm (Standar Meja Kasir)
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Printer USB Meja / Minimarket
                            </Typography>
                          </Box>
                        }
                      />
                    </Paper>
                  </RadioGroup>
                </Box>

                <Divider sx={{ my: 2 }} />

                <Stack spacing={1}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={autoPrint}
                        onChange={(e) => setAutoPrint(e.target.checked)}
                        color="primary"
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body2" fontWeight={600}>
                          Otomatis Cetak Struk setelah Pembayaran Selesai
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Begitu kasir klik bayar, struk belanja langsung otomatis dicetak tanpa perlu klik manual
                        </Typography>
                      </Box>
                    }
                  />

                  <FormControlLabel
                    control={
                      <Switch
                        checked={autoCashDrawer}
                        onChange={(e) => setAutoCashDrawer(e.target.checked)}
                        color="primary"
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body2" fontWeight={600}>
                          Otomatis Buka Laci Kasir (Cash Drawer) saat Bayar Tunai
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Kirim pulsa sinyal buka laci uang melalui printer thermal saat ada transaksi tunai
                        </Typography>
                      </Box>
                    }
                  />
                </Stack>
              </CardContent>
            </Card>

            {/* 3. Store Info & Receipt Text Customization */}
            <Card sx={{ borderRadius: 3, border: '1px solid rgba(0,0,0,0.08)' }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Informasi Toko & Teks Struk
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block" mb={2}>
                  Teks di bawah ini akan tercetak langsung pada bagian atas dan bawah struk belanja
                </Typography>

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Nama Toko"
                      value={storeName}
                      onChange={(e) => setStoreName(e.target.value)}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      size="small"
                      label="No. Telepon / WhatsApp"
                      value={storePhone}
                      onChange={(e) => setStorePhone(e.target.value)}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Alamat Toko"
                      value={storeAddress}
                      onChange={(e) => setStoreAddress(e.target.value)}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      multiline
                      rows={2}
                      size="small"
                      label="Catatan Kaki Struk (Footer Notes)"
                      placeholder="Contoh: Barang yang dibeli tidak dapat ditukar. Terima kasih!"
                      value={footerNote}
                      onChange={(e) => setFooterNote(e.target.value)}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Button
                      variant="contained"
                      color="primary"
                      size="large"
                      startIcon={<Save />}
                      onClick={handleSaveSettings}
                      sx={{ borderRadius: 2, fontWeight: 'bold', px: 4 }}
                    >
                      Simpan Pengaturan
                    </Button>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Stack>
        </Grid>

        {/* ================= RIGHT COLUMN: LIVE THERMAL RECEIPT PREVIEW ================= */}
        <Grid item xs={12} lg={5}>
          <Box sx={{ position: { lg: 'sticky' }, top: 24 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom display="flex" alignItems="center" gap={1}>
              <Receipt color="primary" /> Pratinjau Struk Kasir ({paperSize})
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block" mb={2}>
              Tampilan real-time struk belanja kasir yang akan keluar dari printer Anda
            </Typography>

            {/* Thermal Slip Mockup Container */}
            <Box display="flex" justifyContent="center">
              <Paper
                elevation={3}
                sx={{
                  width: paperSize === '58mm' ? '280px' : '360px',
                  p: 2.5,
                  bgcolor: '#ffffff',
                  color: '#000000',
                  borderRadius: 1,
                  border: '1px solid #e0e0e0',
                  fontFamily: 'monospace',
                  fontSize: paperSize === '58mm' ? '0.75rem' : '0.82rem',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                  transition: 'width 0.2s ease',
                }}
              >
                {/* Header Section */}
                <Box textAlign="center" mb={1.5}>
                  <Typography variant="subtitle2" fontWeight="bold" sx={{ fontFamily: 'monospace' }}>
                    {storeName || 'TOKO KASIR'}
                  </Typography>
                  <Typography variant="caption" sx={{ fontFamily: 'monospace', display: 'block' }}>
                    {storeAddress || 'Alamat Toko'}
                  </Typography>
                  <Typography variant="caption" sx={{ fontFamily: 'monospace', display: 'block' }}>
                    Telp: {storePhone || '08123456789'}
                  </Typography>
                  <Divider sx={{ my: 1, borderStyle: 'dashed', borderColor: '#000' }} />
                </Box>

                {/* Metadata */}
                <Box display="flex" justifyContent="space-between" mb={0.5}>
                  <span>No. Struk</span>
                  <span>SL202609050001</span>
                </Box>
                <Box display="flex" justifyContent="space-between" mb={0.5}>
                  <span>Waktu</span>
                  <span>{new Date().toLocaleString('id-ID')}</span>
                </Box>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <span>Kasir</span>
                  <span>Kasir Utama</span>
                </Box>

                <Divider sx={{ my: 1, borderStyle: 'dashed', borderColor: '#000' }} />

                {/* Items List Sample */}
                <Box mb={0.5}>
                  <Box display="flex" justifyContent="space-between">
                    <span>Minyak Bimoli 2L</span>
                    <span>Rp 40.000</span>
                  </Box>
                  <Typography variant="caption" sx={{ pl: 1, color: '#444' }}>
                    2 x Rp 20.000
                  </Typography>
                </Box>

                <Box mb={0.5}>
                  <Box display="flex" justifyContent="space-between">
                    <span>Indomie Goreng</span>
                    <span>Rp 15.000</span>
                  </Box>
                  <Typography variant="caption" sx={{ pl: 1, color: '#444' }}>
                    5 x Rp 3.000
                  </Typography>
                </Box>

                <Divider sx={{ my: 1, borderStyle: 'dashed', borderColor: '#000' }} />

                {/* Totals */}
                <Box display="flex" justifyContent="space-between" mb={0.5}>
                  <span>Subtotal</span>
                  <span>Rp 55.000</span>
                </Box>
                <Box display="flex" justifyContent="space-between" mb={0.5}>
                  <span>PPN (11%)</span>
                  <span>Rp 6.050</span>
                </Box>
                <Box display="flex" justifyContent="space-between" fontWeight="bold" my={0.5}>
                  <span>TOTAL</span>
                  <span>Rp 61.050</span>
                </Box>
                <Box display="flex" justifyContent="space-between" mb={0.5}>
                  <span>Bayar (TUNAI)</span>
                  <span>Rp 100.000</span>
                </Box>
                <Box display="flex" justifyContent="space-between" fontWeight="bold">
                  <span>Kembalian</span>
                  <span>Rp 38.950</span>
                </Box>

                <Divider sx={{ my: 1.5, borderStyle: 'dashed', borderColor: '#000' }} />

                {/* Footer Section */}
                <Typography
                  variant="caption"
                  align="center"
                  display="block"
                  sx={{ fontFamily: 'monospace', whiteSpace: 'pre-line', color: '#333' }}
                >
                  {footerNote || 'Terima Kasih Atas Kunjungan Anda!'}
                </Typography>
              </Paper>
            </Box>
          </Box>
        </Grid>
      </Grid>

      {/* Device Selection Dialog */}
      <Dialog
        open={deviceDialogOpen}
        onClose={() => setDeviceDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="h6" fontWeight="bold">
            Pilih Perangkat Printer Kasir
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Pilih printer thermal yang tersedia atau sambungkan printer Bluetooth / USB baru
          </Typography>
        </DialogTitle>

        <DialogContent dividers sx={{ p: 2 }}>
          {/* Type Filter Buttons */}
          <Stack direction="row" spacing={1} mb={2}>
            <Chip
              label="Semua"
              color={deviceFilter === 'all' ? 'primary' : 'default'}
              onClick={() => setDeviceFilter('all')}
              clickable
            />
            <Chip
              icon={<Bluetooth />}
              label="Bluetooth (Tablet)"
              color={deviceFilter === 'bluetooth' ? 'primary' : 'default'}
              onClick={() => setDeviceFilter('bluetooth')}
              clickable
            />
            <Chip
              icon={<Usb />}
              label="Kabel USB (PC/Laptop)"
              color={deviceFilter === 'usb' ? 'primary' : 'default'}
              onClick={() => setDeviceFilter('usb')}
              clickable
            />
          </Stack>

          <List sx={{ p: 0 }}>
            {filteredDevices.map((device) => {
              const isCurrent = config.deviceId === device.id && config.isConnected;
              return (
                <ListItem
                  key={device.id}
                  button
                  onClick={() => handleSelectDevice(device)}
                  sx={{
                    mb: 1,
                    borderRadius: 2,
                    border: isCurrent ? `2px solid ${theme.palette.success.main}` : '1px solid #e0e0e0',
                    bgcolor: isCurrent ? alpha(theme.palette.success.main, 0.05) : 'background.paper',
                  }}
                >
                  <ListItemIcon>{getDeviceIcon(device.type)}</ListItemIcon>
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="subtitle2" fontWeight="bold">
                          {device.name}
                        </Typography>
                        {isCurrent && (
                          <Chip label="Aktif" size="small" color="success" sx={{ height: 20, fontSize: '0.65rem' }} />
                        )}
                      </Box>
                    }
                    secondary={
                      <span>
                        {device.desc} • Lebar: <strong>{device.paperSize}</strong>
                      </span>
                    }
                  />
                  <ListItemSecondaryAction>
                    <Button
                      variant={isCurrent ? 'outlined' : 'contained'}
                      color={isCurrent ? 'success' : 'primary'}
                      size="small"
                      onClick={() => handleSelectDevice(device)}
                      sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
                    >
                      {isCurrent ? 'Terhubung' : 'Pilih & Hubungkan'}
                    </Button>
                  </ListItemSecondaryAction>
                </ListItem>
              );
            })}
          </List>
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDeviceDialogOpen(false)} color="inherit">
            Tutup
          </Button>
        </DialogActions>
      </Dialog>

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

export default PrinterSettings;
