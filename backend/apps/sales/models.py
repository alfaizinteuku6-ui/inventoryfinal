from django.db import models, transaction
from django.core.validators import MinValueValidator
from django.db.models import Sum, F, Q
from django.utils import timezone
from apps.core.models import TimestampedModel
from decimal import Decimal, ROUND_HALF_UP
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

    subtotal = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    tax_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    discount_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    total_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    paid_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUS_CHOICES, default='pending')
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHOD_CHOICES, default='cash')

    refunded_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    credit_issued = models.BooleanField(default=False)

    notes = models.TextField(blank=True)
    salesperson = models.ForeignKey('accounts.User', on_delete=models.SET_NULL, null=True, related_name='sales')

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['sale_number']),
            models.Index(fields=['customer']),
            models.Index(fields=['sale_date']),
            models.Index(fields=['payment_status']),
            models.Index(fields=['payment_status', 'due_date']),
        ]

    def save(self, *args, **kwargs):
        # Generate sale number if new record
        if not self.sale_number:
            self.sale_number = self.generate_sale_number()

        # For existing records, update totals and status
        if self.pk:
            self.update_totals()
            self.update_payment_status()

        super().save(*args, **kwargs)

    def update_totals(self):
        """Calculate totals from sale items."""
        items = self.items.all()

        if not items.exists():
            self.subtotal = Decimal('0')
            self.discount_amount = Decimal('0')
            self.tax_amount = Decimal('0')
            self.total_amount = Decimal('0')
            return

        # Calculate subtotal (quantity * unit_price)
        subtotal_result = items.aggregate(
            total=Sum(F('quantity') * F('unit_price'), output_field=models.DecimalField())
        )
        self.subtotal = (subtotal_result['total'] or Decimal('0')).quantize(
            Decimal('0.01'), rounding=ROUND_HALF_UP
        )

        # Calculate total discount amount
        discount_result = items.aggregate(
            total=Sum(
                (F('quantity') * F('unit_price') * F('discount_percent')) / 100,
                output_field=models.DecimalField()
            )
        )
        self.discount_amount = (discount_result['total'] or Decimal('0')).quantize(
            Decimal('0.01'), rounding=ROUND_HALF_UP
        )

        # Calculate tax on discounted amount
        tax_result = items.aggregate(
            total=Sum(
                ((F('quantity') * F('unit_price') -
                  (F('quantity') * F('unit_price') * F('discount_percent')) / 100) *
                 F('tax_rate')) / 100,
                output_field=models.DecimalField()
            )
        )
        self.tax_amount = (tax_result['total'] or Decimal('0')).quantize(
            Decimal('0.01'), rounding=ROUND_HALF_UP
        )

        # Calculate final total
        self.total_amount = (self.subtotal - self.discount_amount + self.tax_amount).quantize(
            Decimal('0.01'), rounding=ROUND_HALF_UP
        )

    def update_payment_status(self):
        """Update payment status based on paid and refunded amount - in real-time."""
        # Normalize all decimal values
        total_amount = Decimal(str(self.total_amount)).quantize(
            Decimal('0.01'), rounding=ROUND_HALF_UP
        )
        paid_amount = Decimal(str(self.paid_amount)).quantize(
            Decimal('0.01'), rounding=ROUND_HALF_UP
        )
        refunded_amount = Decimal(str(self.refunded_amount)).quantize(
            Decimal('0.01'), rounding=ROUND_HALF_UP
        )

        net_paid = paid_amount - refunded_amount

        # Small tolerance for floating point comparison (1 cent)
        tolerance = Decimal('0.01')

        # Don't override manually set cancelled/refunded status
        if self.payment_status in ['cancelled', 'refunded']:
            return

        # Handle edge cases
        if total_amount == 0:
            self.payment_status = 'paid' if net_paid > 0 else 'pending'
        elif net_paid <= tolerance:  # Essentially zero or negative
            self.payment_status = 'pending'
        elif net_paid >= total_amount - tolerance:  # Fully paid (within tolerance)
            self.payment_status = 'paid'
        else:
            self.payment_status = 'partial'

    def generate_sale_number(self):
        """Generate unique sale number with date prefix."""
        from datetime import date
        today = date.today()
        prefix = f"SL{today.strftime('%Y%m%d')}"

        # Get the last sale number for today
        last_sale = Sale.objects.filter(
            sale_number__startswith=prefix
        ).order_by('-sale_number').first()

        if last_sale and len(last_sale.sale_number) >= len(prefix) + 4:
            try:
                last_number = int(last_sale.sale_number[-4:])
                new_number = last_number + 1
            except ValueError:
                new_number = 1
        else:
            new_number = 1

        return f"{prefix}{new_number:04d}"

    @transaction.atomic
    def cancel_sale(self, refund=False, credit=False):
        """
        Cancel the sale.
        - refund=True: refund paid amount back
        - credit=True: convert paid amount to customer credit
        """
        if self.payment_status == 'cancelled':
            return False, "Sale is already cancelled"

        # Refresh from database to get current state
        self.refresh_from_db()

        # For fully paid sales, require explicit refund/credit choice
        if self.payment_status == 'paid':
            if not refund and not credit:
                return False, "Fully paid sale requires refund=True or credit=True to cancel"

        # For pending sales, no need for refund/credit
        if self.payment_status == 'pending':
            refund = False
            credit = False

        # Restore stock for all items
        for item in self.items.all():
            product = item.product
            product.stock_quantity += item.quantity
            product.save(update_fields=['stock_quantity', 'updated_at'])

            # Create stock movement record
            try:
                from apps.inventory.models import StockMovement
                StockMovement.objects.create(
                    product=product,
                    movement_type='sale_cancellation',
                    quantity=item.quantity,
                    reference=f"Cancel-{self.sale_number}",
                    notes=f"Cancelled Sale: {self.sale_number}"
                )
            except ImportError:
                pass

        # Normalize amounts for precise comparison
        current_paid = Decimal(str(self.paid_amount)).quantize(
            Decimal('0.01'), rounding=ROUND_HALF_UP
        )
        current_refunded = Decimal(str(self.refunded_amount)).quantize(
            Decimal('0.01'), rounding=ROUND_HALF_UP
        )

        # Handle refund: update refunded_amount to match paid_amount
        if refund:
            # Calculate how much still needs to be refunded
            amount_to_refund = current_paid - current_refunded
            
            if amount_to_refund > 0:
                self.refunded_amount = Decimal(str(self.refunded_amount + amount_to_refund)).quantize(
                    Decimal('0.01'), rounding=ROUND_HALF_UP
                )
                # When fully refunded, set status to refunded
                self.payment_status = 'refunded'
            else:
                # Already fully refunded, just mark as cancelled
                self.payment_status = 'cancelled'
        else:
            # Handle credit: mark credit as issued and set to cancelled
            if credit:
                self.credit_issued = True
            
            # Set status to cancelled
            self.payment_status = 'cancelled'
        
        # Save all changes atomically
        self.save()

        return True, "Sale cancelled successfully"

    @property
    def balance_due(self):
        """Calculate remaining balance due."""
        if self.payment_status in ['cancelled', 'refunded']:
            return Decimal('0')
        
        total = Decimal(str(self.total_amount)).quantize(
            Decimal('0.01'), rounding=ROUND_HALF_UP
        )
        paid = Decimal(str(self.paid_amount)).quantize(
            Decimal('0.01'), rounding=ROUND_HALF_UP
        )
        refunded = Decimal(str(self.refunded_amount)).quantize(
            Decimal('0.01'), rounding=ROUND_HALF_UP
        )
        
        net_paid = paid - refunded
        due = total - net_paid
        
        return max(due, Decimal('0')).quantize(
            Decimal('0.01'), rounding=ROUND_HALF_UP
        )

    @property
    def is_overdue(self):
        """Check if payment is overdue."""
        if not self.due_date or self.payment_status in ['paid', 'cancelled', 'refunded']:
            return False

        return timezone.now().date() > self.due_date

    def __str__(self):
        return f"Sale #{self.sale_number}"

class SaleItem(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    sale = models.ForeignKey(Sale, related_name='items', on_delete=models.CASCADE)
    product = models.ForeignKey('inventory.Product', on_delete=models.PROTECT)
    product_name = models.CharField(max_length=255)
    product_sku = models.CharField(max_length=50, blank=True)
    quantity = models.PositiveIntegerField(validators=[MinValueValidator(1)])
    unit_price = models.DecimalField(max_digits=12, decimal_places=2)
    discount_percent = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    tax_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    line_total = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    def save(self, *args, **kwargs):
        # Store product details at time of sale
        if not self.product_name and self.product:
            self.product_name = self.product.name
            self.product_sku = getattr(self.product, 'sku', '')

        # Calculate line total with proper Decimal handling and rounding
        quantity_decimal = Decimal(str(self.quantity))
        unit_price_decimal = Decimal(str(self.unit_price))
        discount_percent_decimal = Decimal(str(self.discount_percent))
        tax_rate_decimal = Decimal(str(self.tax_rate))
        
        subtotal = quantity_decimal * unit_price_decimal
        discount = (subtotal * discount_percent_decimal / Decimal('100')).quantize(
            Decimal('0.01'), rounding=ROUND_HALF_UP
        )
        after_discount = subtotal - discount
        tax = (after_discount * tax_rate_decimal / Decimal('100')).quantize(
            Decimal('0.01'), rounding=ROUND_HALF_UP
        )
        self.line_total = (after_discount + tax).quantize(
            Decimal('0.01'), rounding=ROUND_HALF_UP
        )

        super().save(*args, **kwargs)
        
        # Update sale totals if this is not a new sale being created
        if self.sale_id:
            self.sale.update_totals()
            self.sale.save(update_fields=['subtotal', 'tax_amount', 'discount_amount', 'total_amount', 'payment_status'])

    def delete(self, *args, **kwargs):
        """Override delete to update sale totals."""
        sale = self.sale
        super().delete(*args, **kwargs)
        
        # Update sale totals after item deletion
        sale.update_totals()
        sale.save(update_fields=['subtotal', 'tax_amount', 'discount_amount', 'total_amount', 'payment_status'])

    def __str__(self):
        return f"{self.product_name} x {self.quantity}"

    class Meta:
        indexes = [
            models.Index(fields=['sale', 'product']),
        ]