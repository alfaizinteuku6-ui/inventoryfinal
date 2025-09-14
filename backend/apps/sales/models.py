from django.db import models
from django.core.validators import MinValueValidator
from django.db.models import Sum, F
from apps.core.models import TimestampedModel
from decimal import Decimal
import uuid

class Sale(TimestampedModel):
    PAYMENT_STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('partial', 'Partially Paid'),
        ('paid', 'Fully Paid'),
        ('refunded', 'Refunded'),
        ('cancelled', 'Cancelled'),
    ]
    
    PAYMENT_METHOD_CHOICES = [
        ('cash', 'Cash'),
        ('card', 'Card'),
        ('upi', 'UPI'),
        ('bank_transfer', 'Bank Transfer'),
        ('credit', 'Credit'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    sale_number = models.CharField(max_length=50, unique=True, editable=False)
    customer = models.ForeignKey('customers.Customer', on_delete=models.PROTECT)
    sale_date = models.DateTimeField(auto_now_add=True)
    due_date = models.DateField(null=True, blank=True)
    
    # Amounts will be calculated from items
    subtotal = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    tax_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    discount_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    total_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    paid_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    
    payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUS_CHOICES, default='pending')
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHOD_CHOICES, default='cash')
    
    notes = models.TextField(blank=True)
    salesperson = models.ForeignKey('accounts.User', on_delete=models.SET_NULL, null=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['sale_number']),
            models.Index(fields=['customer']),
            models.Index(fields=['sale_date']),
            models.Index(fields=['payment_status']),
        ]

    def save(self, *args, **kwargs):
        if not self.sale_number:
            self.sale_number = self.generate_sale_number()
        
        # Calculate totals from items if this is not a new instance
        if self.pk:
            self.update_totals()
        
        # Update payment status based on paid amount
        self.update_payment_status()
        
        super().save(*args, **kwargs)

    def update_totals(self):
        """Calculate all totals from sale items"""
        items = self.items.all()
        
        # Calculate subtotal (before tax and discount)
        self.subtotal = items.aggregate(
            total=Sum(F('quantity') * F('unit_price'))
        )['total'] or Decimal('0')
        
        # Calculate discount amount
        self.discount_amount = items.aggregate(
            total=Sum(
                (F('quantity') * F('unit_price') * F('discount_percent')) / 100
            )
        )['total'] or Decimal('0')
        
        # Calculate tax amount (after discount)
        self.tax_amount = items.aggregate(
            total=Sum(
                ((F('quantity') * F('unit_price') - 
                  (F('quantity') * F('unit_price') * F('discount_percent')) / 100) * 
                 F('tax_rate')) / 100
            )
        )['total'] or Decimal('0')
        
        # Calculate total amount
        self.total_amount = self.subtotal - self.discount_amount + self.tax_amount

    def update_payment_status(self):
        """Update payment status based on paid amount"""
        if self.total_amount == 0:
            self.payment_status = 'pending'
        elif self.paid_amount >= self.total_amount:
            self.payment_status = 'paid'
        elif self.paid_amount > 0:
            self.payment_status = 'partial'
        else:
            self.payment_status = 'pending'

    def generate_sale_number(self):
        from datetime import date
        today = date.today()
        prefix = f"SL{today.strftime('%Y%m%d')}"
        
        last_sale = Sale.objects.filter(
            sale_number__startswith=prefix
        ).order_by('sale_number').last()
        
        if last_sale:
            last_number = int(last_sale.sale_number[-4:])
            new_number = last_number + 1
        else:
            new_number = 1
        
        return f"{prefix}{new_number:04d}"
    
    def cancel_sale(self):
        """Cancel the sale and restore stock"""
        if self.payment_status == 'cancelled':
            return False, "Sale is already cancelled"
        
        # Only allow cancellation if not fully paid or refunded
        if self.payment_status in ['paid', 'refunded']:
            return False, "Cannot cancel a paid or refunded sale"
        
        # Restore stock for all items
        for item in self.items.all():
            product = item.product
            product.stock_quantity += item.quantity
            product.save()
            
            # Create reverse stock movement
            from apps.inventory.models import StockMovement
            StockMovement.objects.create(
                product=product,
                movement_type='sale_cancellation',
                quantity=item.quantity,
                reference=f"Cancel-{self.sale_number}",
                user=None  # System action
            )
        
        # Update sale status
        self.payment_status = 'cancelled'
        self.save()
        
        return True, "Sale cancelled successfully"

    @property
    def balance_due(self):
        return max(self.total_amount - self.paid_amount, Decimal('0'))

    def __str__(self):
        return f"Sale #{self.sale_number}"

class SaleItem(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    sale = models.ForeignKey(Sale, related_name='items', on_delete=models.CASCADE)
    product = models.ForeignKey('inventory.Product', on_delete=models.PROTECT)
    product_name = models.CharField(max_length=255)  # Store name at time of sale
    product_sku = models.CharField(max_length=50, blank=True)  # Store SKU at time of sale
    quantity = models.PositiveIntegerField(validators=[MinValueValidator(1)])
    unit_price = models.DecimalField(max_digits=12, decimal_places=2)
    discount_percent = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    tax_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    line_total = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    def save(self, *args, **kwargs):
        # Store product details at time of sale
        if not self.product_name:
            self.product_name = self.product.name
            self.product_sku = self.product.sku

        # Calculate line total
        subtotal = Decimal(str(self.quantity)) * self.unit_price
        discount = subtotal * (self.discount_percent / Decimal('100'))
        after_discount = subtotal - discount
        tax = after_discount * (self.tax_rate / Decimal('100'))
        self.line_total = after_discount + tax

        super().save(*args, **kwargs)
        
        # Update sale totals
        self.sale.update_totals()
        self.sale.save()

    def __str__(self):
        return f"{self.product_name} x {self.quantity}"

    class Meta:
        indexes = [
            models.Index(fields=['sale', 'product']),
        ]