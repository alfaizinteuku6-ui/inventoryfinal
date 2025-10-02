# backend/apps/notifications/signals.py
"""
Django signals to automatically create notifications on certain events
"""
from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from apps.inventory.models import Product
from apps.sales.models import Sale
from apps.customers.models import Customer
from .models import Notification
from decimal import Decimal

@receiver(post_save, sender=Product)
def check_product_stock_on_save(sender, instance, created, **kwargs):
    """
    Automatically create notification when product stock changes
    """
    if not created:  # Only for updates
        # Check if stock is low or out
        if instance.stock_quantity == 0 and instance.is_active:
            # Check if alert already exists recently
            recent_alert = Notification.objects.filter(
                alert_type='out_of_stock',
                product=instance,
                created_at__gte=instance.updated_at
            ).exists()
            
            if not recent_alert:
                Notification.objects.create(
                    alert_type='out_of_stock',
                    priority='critical',
                    title=f'Out of Stock: {instance.name}',
                    message=f'{instance.name} (SKU: {instance.sku}) is now out of stock!',
                    product=instance,
                    metadata={
                        'sku': instance.sku,
                        'category': instance.category.name if instance.category else None
                    }
                )
        
        elif instance.stock_quantity <= instance.min_stock_level and instance.is_active:
            recent_alert = Notification.objects.filter(
                alert_type='low_stock',
                product=instance,
                created_at__gte=instance.updated_at
            ).exists()
            
            if not recent_alert:
                Notification.objects.create(
                    alert_type='low_stock',
                    priority='high',
                    title=f'Low Stock: {instance.name}',
                    message=f'{instance.name} stock is low: {instance.stock_quantity} units remaining',
                    product=instance,
                    metadata={
                        'current_stock': instance.stock_quantity,
                        'min_stock': instance.min_stock_level,
                        'sku': instance.sku
                    }
                )

@receiver(post_save, sender=Sale)
def check_sale_alerts(sender, instance, created, **kwargs):
    """
    Create notifications for sales-related events
    """
    if created:
        # Check for large sales
        large_sale_threshold = Decimal('50000.00')
        if instance.total_amount >= large_sale_threshold:
            Notification.objects.create(
                alert_type='large_sale',
                priority='medium',
                title=f'Large Sale: ₹{instance.total_amount}',
                message=f'High-value sale {instance.sale_number} worth ₹{instance.total_amount} to {instance.customer.name}',
                sale=instance,
                customer=instance.customer,
                metadata={
                    'total_amount': str(instance.total_amount),
                    'customer_name': instance.customer.name
                }
            )
    else:
        # Check for overdue payments
        if instance.is_overdue and instance.payment_status in ['pending', 'partial']:
            from django.utils import timezone
            days_overdue = (timezone.now().date() - instance.due_date).days
            
            # Only create alert if significantly overdue (e.g., 3+ days)
            if days_overdue >= 3:
                recent_alert = Notification.objects.filter(
                    alert_type='overdue_payment',
                    sale=instance,
                    created_at__date=timezone.now().date()
                ).exists()
                
                if not recent_alert:
                    Notification.objects.create(
                        alert_type='overdue_payment',
                        priority='high',
                        title=f'Overdue Payment: {instance.sale_number}',
                        message=f'Payment is {days_overdue} days overdue. Balance: ₹{instance.balance_due}',
                        sale=instance,
                        customer=instance.customer,
                        metadata={
                            'days_overdue': days_overdue,
                            'balance_due': str(instance.balance_due)
                        }
                    )

@receiver(post_save, sender=Customer)
def check_new_customer(sender, instance, created, **kwargs):
    """
    Create notification for new customers
    """
    if created:
        Notification.objects.create(
            alert_type='new_customer',
            priority='low',
            title=f'New Customer: {instance.name}',
            message=f'Welcome new customer {instance.name} ({instance.phone})',
            customer=instance,
            metadata={
                'customer_type': instance.customer_type,
                'phone': instance.phone,
                'email': instance.email
            }
        )