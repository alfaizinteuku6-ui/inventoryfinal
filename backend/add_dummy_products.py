import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ims.settings')
django.setup()

from apps.inventory.models import Category, Product

# Kategori
categories = [
    {'name': 'Makanan & Minuman', 'description': 'Produk makanan dan minuman harian'},
    {'name': 'Elektronik & Aksesoris', 'description': 'Perangkat dan aksesoris elektronik'},
    {'name': 'Alat Tulis Kantor', 'description': 'Perlengkapan sekolah dan kantor'},
    {'name': 'Kebutuhan Rumah Tangga', 'description': 'Produk kebersihan dan kebutuhan rumah tangga'},
    {'name': 'Perawatan Diri & Kesehatan', 'description': 'Produk higienis, kosmetik, dan kesehatan'}
]

cat_map = {}
for c in categories:
    cat, _ = Category.objects.get_or_create(name=c['name'], defaults={'description': c['description']})
    cat_map[c['name']] = cat

# Daftar Produk Dummy
dummy_products = [
    # Makanan & Minuman
    {
        'name': 'Kopi Susu Gula Aren 250ml',
        'category': cat_map['Makanan & Minuman'],
        'description': 'Kopi susu kekinian segar siap minum botol 250ml',
        'cost_price': 10000,
        'selling_price': 18000,
        'stock_quantity': 40,
        'min_stock_level': 5,
        'max_stock_level': 100,
    },
    {
        'name': 'Teh Botol Sosro 450ml',
        'category': cat_map['Makanan & Minuman'],
        'description': 'Minuman teh melati dalam kemasan botol PET',
        'cost_price': 5000,
        'selling_price': 7500,
        'stock_quantity': 72,
        'min_stock_level': 12,
        'max_stock_level': 200,
    },
    {
        'name': 'Indomie Goreng Spesial 85g',
        'category': cat_map['Makanan & Minuman'],
        'description': 'Mie instan goreng rasa original legendaris',
        'cost_price': 2800,
        'selling_price': 3500,
        'stock_quantity': 240,
        'min_stock_level': 20,
        'max_stock_level': 500,
    },
    {
        'name': 'Chitato Sapi Panggang 68g',
        'category': cat_map['Makanan & Minuman'],
        'description': 'Keripik kentang renyah bergelombang rasa sapi panggang',
        'cost_price': 9500,
        'selling_price': 13500,
        'stock_quantity': 55,
        'min_stock_level': 10,
        'max_stock_level': 150,
    },
    {
        'name': 'Susu Ultra Milk Cokelat 1L',
        'category': cat_map['Makanan & Minuman'],
        'description': 'Susu sapi segar UHT rasa cokelat kemasan 1 liter',
        'cost_price': 16500,
        'selling_price': 21000,
        'stock_quantity': 30,
        'min_stock_level': 5,
        'max_stock_level': 100,
    },
    {
        'name': 'Minyak Goreng Bimoli 2L',
        'category': cat_map['Makanan & Minuman'],
        'description': 'Minyak goreng kelapa sawit murni pouch 2 liter',
        'cost_price': 32000,
        'selling_price': 38000,
        'stock_quantity': 45,
        'min_stock_level': 10,
        'max_stock_level': 120,
    },
    {
        'name': 'Beras Pandan Wangi 5kg',
        'category': cat_map['Makanan & Minuman'],
        'description': 'Beras pulen alami kualitas premium karung 5kg',
        'cost_price': 68000,
        'selling_price': 79000,
        'stock_quantity': 25,
        'min_stock_level': 5,
        'max_stock_level': 80,
    },

    # Elektronik & Aksesoris
    {
        'name': 'Keyboard Mechanical RGB TKL',
        'category': cat_map['Elektronik & Aksesoris'],
        'description': 'Keyboard mekanikal 87 tombol switch biru RGB backlight',
        'cost_price': 220000,
        'selling_price': 349000,
        'stock_quantity': 15,
        'min_stock_level': 3,
        'max_stock_level': 50,
    },
    {
        'name': 'Earphone TWS Wireless Bluetooth',
        'category': cat_map['Elektronik & Aksesoris'],
        'description': 'Headset bluetooth true wireless stereo bass boost',
        'cost_price': 85000,
        'selling_price': 145000,
        'stock_quantity': 35,
        'min_stock_level': 5,
        'max_stock_level': 100,
    },
    {
        'name': 'Powerbank 20000mAh Fast Charging',
        'category': cat_map['Elektronik & Aksesoris'],
        'description': 'Power bank kapasitas 20.000 mAh support Quick Charge 3.0 & PD',
        'cost_price': 140000,
        'selling_price': 215000,
        'stock_quantity': 20,
        'min_stock_level': 4,
        'max_stock_level': 60,
    },
    {
        'name': 'USB Flashdisk 64GB Metal',
        'category': cat_map['Elektronik & Aksesoris'],
        'description': 'Flash drive USB 3.0 bodi logam tahan benturan dan air',
        'cost_price': 40000,
        'selling_price': 65000,
        'stock_quantity': 40,
        'min_stock_level': 8,
        'max_stock_level': 100,
    },
    {
        'name': 'Charger Adapter 33W GaN',
        'category': cat_map['Elektronik & Aksesoris'],
        'description': 'Kepala charger fast charging teknologi GaN dual port USB-A + Type-C',
        'cost_price': 55000,
        'selling_price': 89000,
        'stock_quantity': 30,
        'min_stock_level': 5,
        'max_stock_level': 80,
    },
    {
        'name': 'Webcam Full HD 1080p Auto-Focus',
        'category': cat_map['Elektronik & Aksesoris'],
        'description': 'Kamera komputer 1080p 30fps dengan mikrofon peredam bising',
        'cost_price': 120000,
        'selling_price': 185000,
        'stock_quantity': 12,
        'min_stock_level': 2,
        'max_stock_level': 40,
    },

    # Alat Tulis Kantor
    {
        'name': 'Kertas HVS A4 75gsm 1 Rim',
        'category': cat_map['Alat Tulis Kantor'],
        'description': 'Kertas fotokopi & print putih cerah isi 500 lembar',
        'cost_price': 44000,
        'selling_price': 56000,
        'stock_quantity': 50,
        'min_stock_level': 10,
        'max_stock_level': 150,
    },
    {
        'name': 'Pulpen Gel Faster 0.5mm (Pak 12)',
        'category': cat_map['Alat Tulis Kantor'],
        'description': 'Pena tinta gel hitam lancar dan anti macet isi 1 lusin',
        'cost_price': 24000,
        'selling_price': 35000,
        'stock_quantity': 30,
        'min_stock_level': 5,
        'max_stock_level': 80,
    },
    {
        'name': 'Lakban Bening 2 Inch 100 Yard',
        'category': cat_map['Alat Tulis Kantor'],
        'description': 'Solasi isolasi bening tebal daya rekat tinggi untuk packing',
        'cost_price': 9000,
        'selling_price': 14000,
        'stock_quantity': 60,
        'min_stock_level': 15,
        'max_stock_level': 180,
    },
    {
        'name': 'Kalkulator Desktop 12 Digit',
        'category': cat_map['Alat Tulis Kantor'],
        'description': 'Kalkulator meja tombol empuk layar besar tenaga solar + baterai',
        'cost_price': 38000,
        'selling_price': 59000,
        'stock_quantity': 18,
        'min_stock_level': 3,
        'max_stock_level': 50,
    },

    # Kebutuhan Rumah Tangga
    {
        'name': 'Sunlight Pencuci Piring 700ml',
        'category': cat_map['Kebutuhan Rumah Tangga'],
        'description': 'Sabun cuci piring ekstrak jeruk nipis ampuh hilangkan lemak',
        'cost_price': 12000,
        'selling_price': 16000,
        'stock_quantity': 60,
        'min_stock_level': 10,
        'max_stock_level': 150,
    },
    {
        'name': 'Rinso Deterjen Cair Konsentrat 750ml',
        'category': cat_map['Kebutuhan Rumah Tangga'],
        'description': 'Deterjen pakaian cair lembut di tangan dengan keharuman tahan lama',
        'cost_price': 18000,
        'selling_price': 23500,
        'stock_quantity': 45,
        'min_stock_level': 8,
        'max_stock_level': 120,
    },
    {
        'name': 'Super Pell Pembersih Lantai 770ml',
        'category': cat_map['Kebutuhan Rumah Tangga'],
        'description': 'Cairan pembersih lantai aroma apel segar higienis mengkilap',
        'cost_price': 11500,
        'selling_price': 15500,
        'stock_quantity': 35,
        'min_stock_level': 6,
        'max_stock_level': 100,
    },
    {
        'name': 'Baygon Aerosol Nyamuk 600ml',
        'category': cat_map['Kebutuhan Rumah Tangga'],
        'description': 'Insektisida semprot anti nyamuk dan kecoa aroma lavender',
        'cost_price': 34000,
        'selling_price': 42000,
        'stock_quantity': 25,
        'min_stock_level': 5,
        'max_stock_level': 70,
    },
    {
        'name': 'Tisu Wajah Paseo 250 Sheets',
        'category': cat_map['Kebutuhan Rumah Tangga'],
        'description': 'Tisu wajah 2 ply halus dan lembut dari serat alami',
        'cost_price': 11000,
        'selling_price': 15000,
        'stock_quantity': 80,
        'min_stock_level': 15,
        'max_stock_level': 200,
    },

    # Perawatan Diri & Kesehatan
    {
        'name': 'Sabun Mandi Lifebuoy Cair 450ml',
        'category': cat_map['Perawatan Diri & Kesehatan'],
        'description': 'Sabun mandi antibakterial perlindungan dari kuman',
        'cost_price': 19000,
        'selling_price': 25000,
        'stock_quantity': 40,
        'min_stock_level': 8,
        'max_stock_level': 100,
    },
    {
        'name': 'Shampo Pantene Anti Ketombe 290ml',
        'category': cat_map['Perawatan Diri & Kesehatan'],
        'description': 'Shampo perawatan rambut sehat bebas ketombe',
        'cost_price': 28000,
        'selling_price': 36500,
        'stock_quantity': 30,
        'min_stock_level': 5,
        'max_stock_level': 80,
    },
    {
        'name': 'Pasta Gigi Pepsodent 190g',
        'category': cat_map['Perawatan Diri & Kesehatan'],
        'description': 'Pasta gigi pencegah gigi berlubang dengan mikro kalsium aktif',
        'cost_price': 12500,
        'selling_price': 16500,
        'stock_quantity': 65,
        'min_stock_level': 10,
        'max_stock_level': 150,
    },
    {
        'name': 'Minyak Kayu Putih Cap Lang 60ml',
        'category': cat_map['Perawatan Diri & Kesehatan'],
        'description': 'Minyak kayu putih murni meredakan masuk angin dan gatal gigitan serangga',
        'cost_price': 21000,
        'selling_price': 27000,
        'stock_quantity': 35,
        'min_stock_level': 5,
        'max_stock_level': 90,
    },
]

created_count = 0
for data in dummy_products:
    name = data['name']
    prod = Product.objects.filter(name=name).first()
    if not prod:
        prod = Product.objects.create(**data)
        print(f"[+] Dibuat: {prod.name} (SKU: {prod.sku}) - Rp {int(prod.selling_price):,}")
        created_count += 1
    else:
        print(f"[-] Sudah ada: {prod.name}")

print(f"\nSelesai! Berhasil menambahkan {created_count} produk baru.")
