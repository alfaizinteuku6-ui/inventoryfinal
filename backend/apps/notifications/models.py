# backend/apps/notifications/models.py
from django.db import models
from apps.core.models import TimestampedModel
import uuid

class Notification(TimestampedModel):
    """Store notification alerts for the system"""
    
    ALERT_TYPES = [
        ('low_stock', 'Low Stock Alert'),
        ('out_of_stock', 'Out of Stock'),
        ('overstocked', 'Overstocked'),
        ('high_refund_rate', 'High Refund Rate'),
        ('overdue_payment', 'Overdue Payment'),
        ('large_sale', 'Large Sale'),
        ('new_customer', 'New Customer'),
        ('high_value_customer', 'High Value Customer'),
        ('daily_sales_milestone', 'Daily Sales Milestone'),
        ('low_profit_margin', 'Low Profit Margin'),
    ]
    
    PRIORITY_LEVELS = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('critical', 'Critical'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    alert_type = models.CharField(max_length=30, choices=ALERT_TYPES)
    priority = models.CharField(max_length=10, choices=PRIORITY_LEVELS, default='medium')
    title = models.CharField(max_length=200)
    message = models.TextField()
    
    # Optional relations to specific objects
    product = models.ForeignKey('inventory.Product', on_delete=models.CASCADE, null=True, blank=True)
    sale = models.ForeignKey('sales.Sale', on_delete=models.CASCADE, null=True, blank=True)
    customer = models.ForeignKey('customers.Customer', on_delete=models.CASCADE, null=True, blank=True)
    
    # Metadata
    metadata = models.JSONField(default=dict, blank=True)
    is_read = models.BooleanField(default=False)
    is_dismissed = models.BooleanField(default=False)
    read_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['alert_type', 'is_read']),
            models.Index(fields=['created_at']),
            models.Index(fields=['priority']),
        ]
    
    def __str__(self):
        return f"{self.get_alert_type_display()} - {self.title}"