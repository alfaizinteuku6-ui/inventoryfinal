# backend/apps/vendors/models.py
from django.db import models
from apps.core.models import TimestampedModel

class Vendor(TimestampedModel):
    name = models.CharField(max_length=200)
    business_type = models.CharField(max_length=100, blank=True, choices=[
        ('retail', 'Retail Store'),
        ('restaurant', 'Restaurant'),
        ('service', 'Service Provider'),
        ('wholesale', 'Wholesale'),
        ('other', 'Other'),
    ])
    contact_person = models.CharField(max_length=100, blank=True)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20)
    address = models.TextField()
    city = models.CharField(max_length=100, blank=True)
    state = models.CharField(max_length=100, blank=True)
    postal_code = models.CharField(max_length=20, blank=True)
    country = models.CharField(max_length=100, default='India')
    
    # Business details
    tax_number = models.CharField(max_length=50, blank=True)  # GST number
    pan_number = models.CharField(max_length=20, blank=True)
    payment_terms = models.CharField(max_length=100, default='Net 30')
    credit_limit = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    
    # Business settings
    currency = models.CharField(max_length=10, default='INR')
    tax_rate = models.DecimalField(max_digits=5, decimal_places=2, default=18.0, help_text="Default tax rate %")
    logo = models.ImageField(upload_to='vendor_logos/', blank=True, null=True)
    
    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name
    