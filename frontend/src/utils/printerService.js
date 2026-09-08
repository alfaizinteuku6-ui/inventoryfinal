// frontend/src/utils/printerService.js

export const DEFAULT_PRINTER_CONFIG = {
  connectionType: 'bluetooth', // 'bluetooth' | 'usb' | 'system'
  deviceName: 'RPP02N Mini Thermal Bluetooth',
  deviceId: 'bt-rpp02n',
  isConnected: true,
  paperSize: '58mm', // '58mm' | '80mm'
  autoPrint: false,
  autoCashDrawer: true,
  storeName: 'TOKO SUKSES SEJAHTERA',
  storeAddress: 'Jl. Jenderal Sudirman No. 123, Jakarta',
  storePhone: '081234567890',
  footerNote: 'Barang yang sudah dibeli tidak dapat ditukar/dikembalikan.\nTerima kasih atas kunjungan Anda!',
};

export const AVAILABLE_DEVICES = [
  {
    id: 'bt-rpp02n',
    name: 'RPP02N Mini Thermal Bluetooth',
    type: 'bluetooth',
    paperSize: '58mm',
    desc: 'Printer portable baterai, cocok untuk tablet',
  },
  {
    id: 'bt-panda58',
    name: 'Panda PRJ-58D Bluetooth',
    type: 'bluetooth',
    paperSize: '58mm',
    desc: 'Printer bluetooth 58mm hemat daya',
  },
  {
    id: 'bt-epson-m30',
    name: 'Epson TM-M30II Bluetooth',
    type: 'bluetooth',
    paperSize: '80mm',
    desc: 'Printer meja bluetooth 80mm kecepatan tinggi',
  },
  {
    id: 'usb-xprinter58',
    name: 'Xprinter XP-58IIH USB',
    type: 'usb',
    paperSize: '58mm',
    desc: 'Printer kabel USB langsung ke PC/Laptop',
  },
  {
    id: 'usb-epsont82',
    name: 'Epson TM-T82 Thermal USB',
    type: 'usb',
    paperSize: '80mm',
    desc: 'Printer kasir meja USB standar minimarket',
  },
  {
    id: 'usb-pos80',
    name: 'POS-80 Series Thermal USB',
    type: 'usb',
    paperSize: '80mm',
    desc: 'Printer kasir USB 80mm dengan auto-cutter',
  },
  {
    id: 'sys-default',
    name: 'Driver Bawaan Sistem (OS Default Printer)',
    type: 'system',
    paperSize: '80mm',
    desc: 'Menggunakan driver printer Windows/Linux/Mac',
  },
];

const STORAGE_KEY = 'pos_printer_config';

export const getPrinterConfig = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return { ...DEFAULT_PRINTER_CONFIG, ...JSON.parse(saved) };
    }
  } catch (e) {
    console.warn('Failed to parse printer config from localStorage:', e);
  }
  return { ...DEFAULT_PRINTER_CONFIG };
};

export const savePrinterConfig = (config) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    // Trigger custom window event so other components (like POS) update in real-time
    window.dispatchEvent(new Event('printer_config_changed'));
  } catch (e) {
    console.error('Failed to save printer config:', e);
  }
};

export const disconnectPrinter = () => {
  const current = getPrinterConfig();
  const updated = {
    ...current,
    isConnected: false,
  };
  savePrinterConfig(updated);
  return updated;
};

export const connectPrinter = (device = null) => {
  const current = getPrinterConfig();
  const updated = {
    ...current,
    isConnected: true,
    ...(device && {
      deviceId: device.id,
      deviceName: device.name,
      connectionType: device.type,
      paperSize: device.paperSize || current.paperSize,
    }),
  };
  savePrinterConfig(updated);
  return updated;
};

// Test print slip simulation
export const triggerTestPrint = (config = null) => {
  const cfg = config || getPrinterConfig();
  if (!cfg.isConnected) {
    throw new Error('Printer sedang terputus. Silakan sambungkan printer terlebih dahulu.');
  }

  // Create temporary printable element for test slip
  const printId = 'printable-test-receipt';
  let oldElem = document.getElementById(printId);
  if (oldElem) oldElem.remove();

  const container = document.createElement('div');
  container.id = 'printable-receipt'; // Re-use the existing print CSS
  container.style.fontFamily = 'monospace';
  container.style.fontSize = '0.8rem';
  container.style.padding = '12px';
  container.style.width = cfg.paperSize === '58mm' ? '58mm' : '80mm';

  container.innerHTML = `
    <div style="text-align: center; margin-bottom: 8px;">
      <h3 style="margin: 0; font-size: 1rem;">${cfg.storeName}</h3>
      <p style="margin: 2px 0; font-size: 0.75rem;">${cfg.storeAddress}</p>
      <p style="margin: 2px 0; font-size: 0.75rem;">Telp: ${cfg.storePhone}</p>
      <hr style="border: none; border-top: 1px dashed #000; margin: 8px 0;" />
      <h4 style="margin: 4px 0; font-size: 0.85rem;">*** TEST PRINT BERHASIL ***</h4>
      <p style="margin: 2px 0;">Device: ${cfg.deviceName}</p>
      <p style="margin: 2px 0;">Tipe: ${cfg.connectionType.toUpperCase()} | Kertas: ${cfg.paperSize}</p>
      <p style="margin: 2px 0;">Waktu: ${new Date().toLocaleString('id-ID')}</p>
      <hr style="border: none; border-top: 1px dashed #000; margin: 8px 0;" />
      <p style="margin: 2px 0; font-size: 0.75rem;">Koneksi Printer Thermal Siap!</p>
      <p style="margin: 2px 0; font-size: 0.75rem;">Laci Kasir & Auto-Cutter: NORMAL</p>
      <hr style="border: none; border-top: 1px dashed #000; margin: 8px 0;" />
      <p style="margin: 4px 0; font-size: 0.75rem; white-space: pre-line;">${cfg.footerNote}</p>
    </div>
  `;

  document.body.appendChild(container);
  window.print();
  setTimeout(() => {
    container.remove();
  }, 1000);
};

// Check if Web Bluetooth is supported in this browser
export const isBluetoothSupported = () => {
  return typeof navigator !== 'undefined' && 'bluetooth' in navigator;
};

// Check if Web USB is supported in this browser
export const isUsbSupported = () => {
  return typeof navigator !== 'undefined' && 'usb' in navigator;
};
