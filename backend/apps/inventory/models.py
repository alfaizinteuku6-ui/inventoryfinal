# backend/apps/inventory/models.py
import os
import random
from django.db import models, transaction
from django.core.validators import MinValueValidator
from apps.core.models import TimestampedModel
import uuid
from django.utils.timezone import now
from django.core.exceptions import ValidationError

def generate_barcode():
    return str(uuid.uuid4())[:12]

class Category(TimestampedModel):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True)

    class Meta:
        verbose_name_plural = "Categories"
        ordering = ['name']

    def __str__(self):
        return self.name

def product_image_upload_path(instance, filename):
    """
    Generate path like:
    products/<product_id>/<index>_<timestamp>_<filename>
    Example: products/42/1_20251018_193512_flower.jpg
    """
    base, ext = os.path.splitext(filename)
    timestamp = now().strftime("%Y%m%d_%H%M%S")

    # handle case when product not yet saved
    product_id = instance.product.id if instance.product and instance.product.id else "temp"

    # get count or index for product's existing images
    index = (
        instance.product.images.count() + 1
        if instance.product and instance.product.id
        else random.randint(1, 999)
    )

    safe_name = base.replace(" ", "_")[:40]
    unique_filename = f"{index}_{timestamp}_{safe_name}{ext.lower()}"
    return os.path.join("products", str(product_id), unique_filename)

class Product(TimestampedModel):
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    sku = models.CharField(max_length=50, unique=True, blank=True)  # auto-generated if blank
    barcode = models.CharField(max_length=50, unique=True, null=True, blank=True)
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True)
    
    # Pricing
    cost_price = models.DecimalField(max_digits=12, decimal_places=2, validators=[MinValueValidator(0)])
    selling_price = models.DecimalField(max_digits=12, decimal_places=2, validators=[MinValueValidator(0)])
    
    # Inventory
    stock_quantity = models.IntegerField(default=0, validators=[MinValueValidator(0)])
    min_stock_level = models.IntegerField(default=5, validators=[MinValueValidator(0)])
    max_stock_level = models.IntegerField(default=1000, validators=[MinValueValidator(1)])
    
    # Additional fields
    weight = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True)
    dimensions = models.CharField(max_length=100, blank=True)  # L x W x H

    tax_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0)

    class Meta:
        ordering = ['name']
        indexes = [
            models.Index(fields=['sku']),
            models.Index(fields=['category']),
            models.Index(fields=['stock_quantity']),
        ]

    def __str__(self):
        return self.name

    @property
    def is_low_stock(self):
        return self.stock_quantity <= self.min_stock_level
    
    @property
    def profit_margin(self):
        if self.cost_price and self.selling_price and self.cost_price > 0:
            return ((self.selling_price - self.cost_price) / self.cost_price) * 100
        return 0
    
    def generate_sku(self):
        """
        Generate a unique SKU with format: CAT-XXX-YYYY
        Example: ELE-005-2025
        
        Uses transaction to ensure thread-safety and handles race conditions.
        """
        if not self.category:
            prefix = "GEN"  # Generic if no category
        else:
            # Get first 3 letters of category name, remove spaces
            prefix = self.category.name.replace(" ", "")[:3].upper()

        year = now().year
        
        # Start with the count of products in this category + 1
        counter = Product.objects.filter(
            sku__startswith=f"{prefix}-",
            sku__contains=f"-{year}"
        ).count() + 1
        
        # Keep trying until we find a unique SKU
        max_attempts = 10000  # Prevent infinite loop
        for attempt in range(max_attempts):
            sku = f"{prefix}-{counter:03d}-{year}"
            
            # Check if this SKU already exists
            if not Product.objects.filter(sku=sku).exists():
                return sku
            
            counter += 1
        
        # Fallback: add random component if we somehow exhaust attempts
        import random
        random_suffix = random.randint(1000, 9999)
        return f"{prefix}-{counter:03d}-{year}-{random_suffix}"
    
    def clean(self):
        """Validate that min_stock_level < max_stock_level."""
        if self.min_stock_level >= self.max_stock_level:
            raise ValidationError({
                "min_stock_level": "Minimum stock level must be less than maximum stock level."
            })

    def save(self, *args, **kwargs):
        
        self.full_clean()
        
        if not self.sku:
            with transaction.atomic():
                # Generate SKU within transaction for thread-safety
                self.sku = self.generate_sku()
                
                # Double-check uniqueness before saving
                retry_count = 0
                while Product.objects.filter(sku=self.sku).exists() and retry_count < 5:
                    self.sku = self.generate_sku()
                    retry_count += 1
                    
        if not self.barcode:
            self.barcode = generate_barcode()
        print(self.is_active)
        super().save(*args, **kwargs)
        
class ProductImage(TimestampedModel):
    """Stores multiple images per product."""
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name="images"
    )
    image = models.ImageField(upload_to=product_image_upload_path)

    def __str__(self):
        return f"Image for {self.product.name} - {self.id}"

    def delete(self, *args, **kwargs):
        # Optionally delete the file from storage
        storage = self.image.storage
        if storage.exists(self.image.name):
            storage.delete(self.image.name)
        super().delete(*args, **kwargs)

class StockMovement(TimestampedModel):
    MOVEMENT_TYPES = [
        ('in', 'Stock In'),
        ('out', 'Stock Out'),
        ('adjustment', 'Adjustment'),
        ('sale_cancellation', 'Sale Cancellation'),
        ('sale', 'Sale'),
        ('return', 'Return'),
    ]
    
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='stock_movements')
    movement_type = models.CharField(max_length=20, choices=MOVEMENT_TYPES)
    quantity = models.IntegerField()
    reference = models.CharField(max_length=100, blank=True)  # Invoice number, etc.
    notes = models.TextField(blank=True)
    user = models.ForeignKey('accounts.User', on_delete=models.SET_NULL, null=True)

    class Meta:
        ordering = ['-created_at']

