import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ims.settings')
django.setup()

from django.contrib.auth import get_user_model
from apps.vendors.models import Vendor
from apps.customers.models import Customer
from apps.inventory.models import Category, Product
from apps.sales.models import Sale, SaleItem

User = get_user_model()

# 1. Vendor
vendor, created = Vendor.objects.get_or_create(
    email='info@posindonesia.com',
    defaults={
        'name': 'Toko Sukses Sejahtera',
        'tagline': 'Solusi POS & Inventaris Terpadu',
        'business_type': 'retail',
        'contact_person': 'Budi Santoso',
        'phone': '081234567890',
        'address': 'Jl. Jenderal Sudirman No. 123',
        'city': 'Jakarta',
        'state': 'DKI Jakarta',
        'postal_code': '10220',
        'country': 'Indonesia',
        'currency': 'IDR',
        'tax_rate': 11.0,
    }
)
print(f"Vendor: {vendor.name} (Created: {created})")

# 2. Users
users_data = [
    {
        'username': 'admin',
        'email': 'admin@test.com',
        'password': 'admin123',
        'is_staff': True,
        'is_superuser': True,
        'role': 'owner',
        'first_name': 'Super',
        'last_name': 'Admin',
        'vendor': vendor
    },
    {
        'username': 'kasir',
        'email': 'kasir@test.com',
        'password': 'kasir123',
        'is_staff': False,
        'is_superuser': False,
        'role': 'staff',
        'first_name': 'Kasir',
        'last_name': 'Utama',
        'vendor': vendor
    }
]

for ud in users_data:
    email = ud['email']
    password = ud.pop('password')
    user = User.objects.filter(email=email).first()
    if not user:
        user = User.objects.create_user(**ud)
        user.set_password(password)
        user.save()
        print(f"Created user: {user.email}")
    else:
        print(f"User {user.email} already exists")

# 3. Categories
categories_data = [
    {'name': 'Makanan & Minuman', 'description': 'Produk makanan ringan dan minuman kemasan'},
    {'name': 'Elektronik & Aksesoris', 'description': 'Perangkat elektronik dan aksesoris gadget'},
    {'name': 'Alat Tulis Kantor', 'description': 'Kebutuhan ATK dan kantor'}
]

cats = {}
for cd in categories_data:
    cat, _ = Category.objects.get_or_create(name=cd['name'], defaults={'description': cd['description']})
    cats[cd['name']] = cat
    print(f"Category: {cat.name}")

# 4. Products
products_data = [
    {
        'name': 'Kopi Arabika 250gr',
        'category': cats['Makanan & Minuman'],
        'description': 'Biji kopi sangrai pilihan nusantara',
        'cost_price': 35000,
        'selling_price': 55000,
        'stock_quantity': 45,
        'min_stock_level': 5,
        'max_stock_level': 200,
    },
    {
        'name': 'Air Mineral 600ml',
        'category': cats['Makanan & Minuman'],
        'description': 'Air mineral pegunungan alami',
        'cost_price': 2500,
        'selling_price': 4000,
        'stock_quantity': 120,
        'min_stock_level': 10,
        'max_stock_level': 500,
    },
    {
        'name': 'Mouse Wireless Ergonomis',
        'category': cats['Elektronik & Aksesoris'],
        'description': 'Mouse 2.4Ghz dengan baterai tahan lama',
        'cost_price': 65000,
        'selling_price': 99000,
        'stock_quantity': 25,
        'min_stock_level': 3,
        'max_stock_level': 100,
    },
    {
        'name': 'Kabel Data Type-C Fast Charging',
        'category': cats['Elektronik & Aksesoris'],
        'description': 'Kabel braided kuat 65W',
        'cost_price': 20000,
        'selling_price': 35000,
        'stock_quantity': 50,
        'min_stock_level': 5,
        'max_stock_level': 150,
    },
    {
        'name': 'Buku Catatan Hardcover A5',
        'category': cats['Alat Tulis Kantor'],
        'description': 'Buku catatan isi 100 lembar bergaris',
        'cost_price': 15000,
        'selling_price': 25000,
        'stock_quantity': 60,
        'min_stock_level': 10,
        'max_stock_level': 200,
    }
]

for pd in products_data:
    prod = Product.objects.filter(name=pd['name']).first()
    if not prod:
        prod = Product.objects.create(**pd)
        print(f"Product created: {prod.name} (SKU: {prod.sku})")
    else:
        print(f"Product already exists: {prod.name}")

# 5. Customers
customers_data = [
    {
        'name': 'Budi Santoso',
        'customer_type': 'individual',
        'email': 'budi@gmail.com',
        'phone': '081234567891',
        'city': 'Jakarta',
    },
    {
        'name': 'PT Sinar Harapan',
        'customer_type': 'business',
        'email': 'contact@sinarharapan.com',
        'phone': '0215551234',
        'tax_number': '01.234.567.8-012.000',
        'credit_limit': 10000000,
        'city': 'Jakarta',
    }
]

for cd in customers_data:
    cust, created = Customer.objects.get_or_create(phone=cd['phone'], defaults=cd)
    print(f"Customer: {cust.name} (Created: {created})")

print("Seeding completed successfully!")
