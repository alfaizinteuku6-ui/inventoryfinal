# backend/apps/notifications/services.py
from django.db.models import Sum, Count, F, Q, Avg
from django.utils import timezone
from datetime import timedelta, date
from decimal import Decimal
from .models import Notification
from apps.inventory.models import Product
from apps.sales.models import Sale, SaleItem
from apps.customers.models import Customer

class NotificationService:
    """Service to generate and manage notifications"""
    
    @staticmethod
    def generate_stock_alerts():
        """Generate alerts for low stock, out of stock, and overstocked items"""
        alerts_created = []
        
        # Low stock alerts
        low_stock_products = Product.objects.filter(
            is_active=True,
            stock_quantity__gt=0,
            stock_quantity__lte=F('min_stock_level')
        )
        
        for product in low_stock_products:
            # Check if alert already exists for this product (within last 24 hours)
            recent_alert = Notification.objects.filter(
                alert_type='low_stock',
                product=product,
                created_at__gte=timezone.now() - timedelta(hours=24)
            ).exists()
            
            if not recent_alert:
                alert = Notification.objects.create(
                    alert_type='low_stock',
                    priority='high',
                    title=f'Low Stock: {product.name}',
                    message=f'{product.name} (SKU: {product.sku}) has only {product.stock_quantity} units left. Minimum stock level is {product.min_stock_level}.',
                    product=product,
                    metadata={
                        'current_stock': product.stock_quantity,
                        'min_stock': product.min_stock_level,
                        'sku': product.sku,
                        'category': product.category.name if product.category else None
                    }
                )
                alerts_created.append(alert)
        
        # Out of stock alerts
        out_of_stock_products = Product.objects.filter(
            is_active=True,
            stock_quantity=0
        )
        
        for product in out_of_stock_products:
            recent_alert = Notification.objects.filter(
                alert_type='out_of_stock',
                product=product,
                created_at__gte=timezone.now() - timedelta(hours=24)
            ).exists()
            
            if not recent_alert:
                alert = Notification.objects.create(
                    alert_type='out_of_stock',
                    priority='critical',
                    title=f'Out of Stock: {product.name}',
                    message=f'{product.name} (SKU: {product.sku}) is out of stock!',
                    product=product,
                    metadata={
                        'sku': product.sku,
                        'category': product.category.name if product.category else None,
                        'selling_price': str(product.selling_price)
                    }
                )
                alerts_created.append(alert)
        
        # Overstocked alerts
        overstocked_products = Product.objects.filter(
            is_active=True,
            stock_quantity__gte=F('max_stock_level')
        )
        
        for product in overstocked_products:
            recent_alert = Notification.objects.filter(
                alert_type='overstocked',
                product=product,
                created_at__gte=timezone.now() - timedelta(days=7)
            ).exists()
            
            if not recent_alert:
                alert = Notification.objects.create(
                    alert_type='overstocked',
                    priority='low',
                    title=f'Overstocked: {product.name}',
                    message=f'{product.name} has {product.stock_quantity} units, exceeding maximum stock level of {product.max_stock_level}.',
                    product=product,
                    metadata={
                        'current_stock': product.stock_quantity,
                        'max_stock': product.max_stock_level,
                        'sku': product.sku
                    }
                )
                alerts_created.append(alert)
        
        return alerts_created
    
    @staticmethod
    def generate_sales_alerts():
        """Generate alerts based on sales data"""
        alerts_created = []
        today = timezone.now().date()
        
        # Check for overdue payments
        overdue_sales = Sale.objects.filter(
            payment_status__in=['pending', 'partial'],
            due_date__lt=today
        ).exclude(
            payment_status__in=['cancelled', 'refunded']
        )
        
        for sale in overdue_sales:
            recent_alert = Notification.objects.filter(
                alert_type='overdue_payment',
                sale=sale,
                created_at__gte=timezone.now() - timedelta(days=3)
            ).exists()
            
            if not recent_alert:
                days_overdue = (today - sale.due_date).days
                alert = Notification.objects.create(
                    alert_type='overdue_payment',
                    priority='high',
                    title=f'Overdue Payment: {sale.sale_number}',
                    message=f'Sale {sale.sale_number} for {sale.customer.name} is {days_overdue} days overdue. Balance due: ₹{sale.balance_due}',
                    sale=sale,
                    customer=sale.customer,
                    metadata={
                        'balance_due': str(sale.balance_due),
                        'days_overdue': days_overdue,
                        'customer_name': sale.customer.name,
                        'customer_phone': sale.customer.phone
                    }
                )
                alerts_created.append(alert)
        
        # Check for large sales (above threshold)
        large_sale_threshold = Decimal('50000.00')  # Customize this
        recent_large_sales = Sale.objects.filter(
            sale_date__gte=timezone.now() - timedelta(hours=24),
            total_amount__gte=large_sale_threshold
        ).exclude(
            payment_status__in=['cancelled', 'refunded']
        )
        
        for sale in recent_large_sales:
            recent_alert = Notification.objects.filter(
                alert_type='large_sale',
                sale=sale
            ).exists()
            
            if not recent_alert:
                alert = Notification.objects.create(
                    alert_type='large_sale',
                    priority='medium',
                    title=f'Large Sale: ₹{sale.total_amount}',
                    message=f'High-value sale {sale.sale_number} worth ₹{sale.total_amount} to {sale.customer.name}',
                    sale=sale,
                    customer=sale.customer,
                    metadata={
                        'total_amount': str(sale.total_amount),
                        'customer_name': sale.customer.name,
                        'items_count': sale.items.count()
                    }
                )
                alerts_created.append(alert)
        
        # Daily sales milestone
        daily_sales = Sale.objects.filter(
            sale_date__date=today
        ).exclude(
            payment_status__in=['cancelled', 'refunded']
        ).aggregate(
            total=Sum('total_amount'),
            count=Count('id')
        )
        
        milestone_threshold = Decimal('100000.00')  # Customize this
        if daily_sales['total'] and daily_sales['total'] >= milestone_threshold:
            recent_alert = Notification.objects.filter(
                alert_type='daily_sales_milestone',
                created_at__date=today
            ).exists()
            
            if not recent_alert:
                alert = Notification.objects.create(
                    alert_type='daily_sales_milestone',
                    priority='low',
                    title='Daily Sales Milestone Reached!',
                    message=f'Today\'s sales have reached ₹{daily_sales["total"]} with {daily_sales["count"]} transactions!',
                    metadata={
                        'total_sales': str(daily_sales['total']),
                        'transaction_count': daily_sales['count'],
                        'date': str(today)
                    }
                )
                alerts_created.append(alert)
        
        return alerts_created
    
    @staticmethod
    def generate_refund_alerts():
        """Generate alerts for high refund rates"""
        alerts_created = []
        
        # Calculate refund rate for last 7 days
        seven_days_ago = timezone.now() - timedelta(days=7)
        
        sales_stats = Sale.objects.filter(
            sale_date__gte=seven_days_ago
        ).aggregate(
            total_sales=Count('id'),
            refunded_sales=Count('id', filter=Q(payment_status='refunded')),
            total_refunded_amount=Sum('refunded_amount')
        )
        
        if sales_stats['total_sales'] and sales_stats['total_sales'] > 10:
            refund_rate = (sales_stats['refunded_sales'] / sales_stats['total_sales']) * 100
            
            if refund_rate > 15:  # Alert if refund rate > 15%
                recent_alert = Notification.objects.filter(
                    alert_type='high_refund_rate',
                    created_at__gte=timezone.now() - timedelta(days=3)
                ).exists()
                
                if not recent_alert:
                    alert = Notification.objects.create(
                        alert_type='high_refund_rate',
                        priority='high',
                        title='High Refund Rate Detected',
                        message=f'Refund rate is {refund_rate:.1f}% over the last 7 days. Total refunded: ₹{sales_stats["total_refunded_amount"] or 0}',
                        metadata={
                            'refund_rate': round(refund_rate, 2),
                            'total_sales': sales_stats['total_sales'],
                            'refunded_sales': sales_stats['refunded_sales'],
                            'total_refunded_amount': str(sales_stats['total_refunded_amount'] or 0),
                            'period_days': 7
                        }
                    )
                    alerts_created.append(alert)
        
        return alerts_created
    
    @staticmethod
    def generate_customer_alerts():
        """Generate alerts based on customer data"""
        alerts_created = []
        
        # New customers (last 24 hours)
        new_customers = Customer.objects.filter(
            created_at__gte=timezone.now() - timedelta(hours=24)
        )
        
        for customer in new_customers:
            recent_alert = Notification.objects.filter(
                alert_type='new_customer',
                customer=customer
            ).exists()
            
            if not recent_alert:
                alert = Notification.objects.create(
                    alert_type='new_customer',
                    priority='low',
                    title=f'New Customer: {customer.name}',
                    message=f'Welcome new customer {customer.name} ({customer.phone})',
                    customer=customer,
                    metadata={
                        'customer_type': customer.customer_type,
                        'phone': customer.phone,
                        'email': customer.email
                    }
                )
                alerts_created.append(alert)
        
        # High-value customers (total purchases > threshold)
        high_value_threshold = Decimal('100000.00')  # Customize
        thirty_days_ago = timezone.now() - timedelta(days=30)
        
        high_value_customers = Customer.objects.annotate(
            total_purchases=Sum(
                'sale__total_amount',
                filter=Q(sale__sale_date__gte=thirty_days_ago) & 
                       ~Q(sale__payment_status__in=['cancelled', 'refunded'])
            )
        ).filter(
            total_purchases__gte=high_value_threshold
        )
        
        for customer in high_value_customers:
            recent_alert = Notification.objects.filter(
                alert_type='high_value_customer',
                customer=customer,
                created_at__gte=timezone.now() - timedelta(days=7)
            ).exists()
            
            if not recent_alert:
                alert = Notification.objects.create(
                    alert_type='high_value_customer',
                    priority='medium',
                    title=f'High-Value Customer: {customer.name}',
                    message=f'{customer.name} has made purchases worth ₹{customer.total_purchases} in the last 30 days',
                    customer=customer,
                    metadata={
                        'total_purchases': str(customer.total_purchases),
                        'period_days': 30,
                        'customer_phone': customer.phone
                    }
                )
                alerts_created.append(alert)
        
        return alerts_created
    
    @staticmethod
    def generate_product_performance_alerts():
        """Generate alerts for low profit margin products"""
        alerts_created = []
        
        low_margin_threshold = 10  # 10% profit margin
        
        low_margin_products = Product.objects.filter(
            is_active=True,
            cost_price__gt=0,
            selling_price__gt=0
        )
        
        for product in low_margin_products:
            if product.profit_margin < low_margin_threshold:
                recent_alert = Notification.objects.filter(
                    alert_type='low_profit_margin',
                    product=product,
                    created_at__gte=timezone.now() - timedelta(days=7)
                ).exists()
                
                if not recent_alert:
                    alert = Notification.objects.create(
                        alert_type='low_profit_margin',
                        priority='medium',
                        title=f'Low Profit Margin: {product.name}',
                        message=f'{product.name} has a profit margin of only {product.profit_margin:.1f}%. Consider adjusting pricing.',
                        product=product,
                        metadata={
                            'profit_margin': round(product.profit_margin, 2),
                            'cost_price': str(product.cost_price),
                            'selling_price': str(product.selling_price),
                            'sku': product.sku
                        }
                    )
                    alerts_created.append(alert)
        
        return alerts_created
    
    @classmethod
    def generate_all_alerts(cls):
        """Generate all types of alerts"""
        all_alerts = []
        
        all_alerts.extend(cls.generate_stock_alerts())
        all_alerts.extend(cls.generate_sales_alerts())
        all_alerts.extend(cls.generate_refund_alerts())
        all_alerts.extend(cls.generate_customer_alerts())
        all_alerts.extend(cls.generate_product_performance_alerts())
        
        return all_alerts
    
    @staticmethod
    def cleanup_old_notifications(days=30):
        """Delete old read/dismissed notifications"""
        cutoff_date = timezone.now() - timedelta(days=days)
        deleted_count = Notification.objects.filter(
            Q(is_read=True) | Q(is_dismissed=True),
            created_at__lt=cutoff_date
        ).delete()[0]
        
        return deleted_count