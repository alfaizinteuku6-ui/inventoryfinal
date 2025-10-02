# backend/apps/notifications/serializers.py
from rest_framework import serializers
from .models import Notification
from apps.inventory.models import Product
from apps.sales.models import Sale
from apps.customers.models import Customer

class ProductMiniSerializer(serializers.ModelSerializer):
    """Minimal product info for notifications"""
    class Meta:
        model = Product
        fields = ['id', 'name', 'sku', 'stock_quantity', 'min_stock_level']

class SaleMiniSerializer(serializers.ModelSerializer):
    """Minimal sale info for notifications"""
    class Meta:
        model = Sale
        fields = ['id', 'sale_number', 'total_amount', 'payment_status']

class CustomerMiniSerializer(serializers.ModelSerializer):
    """Minimal customer info for notifications"""
    class Meta:
        model = Customer
        fields = ['id', 'name', 'phone', 'email']

class NotificationSerializer(serializers.ModelSerializer):
    """Main notification serializer with nested relations"""
    product = ProductMiniSerializer(read_only=True)
    sale = SaleMiniSerializer(read_only=True)
    customer = CustomerMiniSerializer(read_only=True)
    alert_type_display = serializers.CharField(source='get_alert_type_display', read_only=True)
    priority_display = serializers.CharField(source='get_priority_display', read_only=True)
    time_ago = serializers.SerializerMethodField()
    
    class Meta:
        model = Notification
        fields = [
            'id', 'alert_type', 'alert_type_display', 'priority', 'priority_display',
            'title', 'message', 'product', 'sale', 'customer', 'metadata',
            'is_read', 'is_dismissed', 'read_at', 'created_at', 'time_ago'
        ]
    
    def get_time_ago(self, obj):
        """Human-readable time difference"""
        from django.utils import timezone
        from datetime import timedelta
        
        now = timezone.now()
        diff = now - obj.created_at
        
        if diff < timedelta(minutes=1):
            return "Just now"
        elif diff < timedelta(hours=1):
            minutes = int(diff.total_seconds() / 60)
            return f"{minutes} minute{'s' if minutes != 1 else ''} ago"
        elif diff < timedelta(days=1):
            hours = int(diff.total_seconds() / 3600)
            return f"{hours} hour{'s' if hours != 1 else ''} ago"
        elif diff < timedelta(days=7):
            days = diff.days
            return f"{days} day{'s' if days != 1 else ''} ago"
        else:
            return obj.created_at.strftime("%b %d, %Y")

class NotificationMarkReadSerializer(serializers.Serializer):
    """Serializer for marking notifications as read"""
    notification_ids = serializers.ListField(
        child=serializers.UUIDField(),
        required=False,
        help_text="List of notification IDs to mark as read. If empty, marks all as read."
    )