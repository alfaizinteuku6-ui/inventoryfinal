import os
import django
from decimal import Decimal

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ims.settings')
django.setup()

from django.contrib.auth import get_user_model
from apps.customers.models import Customer
from apps.inventory.models import Product
from apps.sales.models import Sale, SaleItem

User = get_user_model()
admin_user = User.objects.filter(email='admin@test.com').first()
cust1 = Customer.objects.filter(name='Budi Santoso').first()
cust2 = Customer.objects.filter(name='PT Sinar Harapan').first()

p_kopi = Product.objects.filter(name__icontains='Kopi Susu').first()
p_indomie = Product.objects.filter(name__icontains='Indomie').first()
p_teh = Product.objects.filter(name__icontains='Teh Botol').first()
p_mouse = Product.objects.filter(name__icontains='Mouse').first()
p_kertas = Product.objects.filter(name__icontains='Kertas HVS').first()

if not Sale.objects.exists():
    # Penjualan 1: Tunai Selesai
    sale1 = Sale.objects.create(
        customer=cust1,
        salesperson=admin_user,
        payment_method='cash',
        payment_status='paid',
        notes='Transaksi tunai kasir toko'
    )
    item1 = SaleItem.objects.create(
        sale=sale1,
        product=p_kopi,
        product_name=p_kopi.name,
        product_sku=p_kopi.sku,
        quantity=2,
        unit_price=p_kopi.selling_price,
        discount_percent=Decimal('0'),
        tax_rate=Decimal('11')
    )
    item2 = SaleItem.objects.create(
        sale=sale1,
        product=p_indomie,
        product_name=p_indomie.name,
        product_sku=p_indomie.sku,
        quantity=5,
        unit_price=p_indomie.selling_price,
        discount_percent=Decimal('0'),
        tax_rate=Decimal('11')
    )
    sale1.update_totals()
    sale1.paid_amount = sale1.total_amount
    sale1.save()
    print(f"Dibuat Transaksi 1: {sale1.sale_number} - Total: Rp {int(sale1.total_amount):,} (Lunas)")

    # Penjualan 2: Perusahaan / Bank Transfer
    sale2 = Sale.objects.create(
        customer=cust2,
        salesperson=admin_user,
        payment_method='bank_transfer',
        payment_status='paid',
        notes='Pengadaan perlengkapan kantor'
    )
    item3 = SaleItem.objects.create(
        sale=sale2,
        product=p_kertas,
        product_name=p_kertas.name,
        product_sku=p_kertas.sku,
        quantity=5,
        unit_price=p_kertas.selling_price,
        discount_percent=Decimal('5'),
        tax_rate=Decimal('11')
    )
    item4 = SaleItem.objects.create(
        sale=sale2,
        product=p_mouse,
        product_name=p_mouse.name,
        product_sku=p_mouse.sku,
        quantity=2,
        unit_price=p_mouse.selling_price,
        discount_percent=Decimal('0'),
        tax_rate=Decimal('11')
    )
    sale2.update_totals()
    sale2.paid_amount = sale2.total_amount
    sale2.save()
    print(f"Dibuat Transaksi 2: {sale2.sale_number} - Total: Rp {int(sale2.total_amount):,} (Lunas)")

else:
    print("Data transaksi penjualan sudah ada.")
