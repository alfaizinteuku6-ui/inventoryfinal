# backend/apps/notifications/admin.py
from django.contrib import admin
from django.utils.html import format_html
from .models import Notification

@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = [
        'id', 'alert_type_badge', 'priority_badge', 'title', 
        'related_objects', 'is_read', 'is_dismissed', 'created_at'
    ]
    list_filter = [
        'alert_type', 'priority', 'is_read', 'is_dismissed', 'created_at'
    ]
    search_fields = ['title', 'message', 'product__name', 'customer__name', 'sale__sale_number']
    readonly_fields = ['id', 'created_at', 'updated_at', 'read_at']
    list_per_page = 50
    date_hierarchy = 'created_at'
    
    fieldsets = (
        ('Alert Information', {
            'fields': ('id', 'alert_type', 'priority', 'title', 'message')
        }),
        ('Related Objects', {
            'fields': ('product', 'sale', 'customer')
        }),
        ('Status', {
            'fields': ('is_read', 'is_dismissed', 'read_at')
        }),
        ('Metadata', {
            'fields': ('metadata',),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def alert_type_badge(self, obj):
        colors = {
            'low_stock': '#ff9800',
            'out_of_stock': '#f44336',
            'overstocked': '#2196f3',
            'high_refund_rate': '#e91e63',
            'overdue_payment': '#f44336',
            'large_sale': '#4caf50',
            'new_customer': '#00bcd4',
            'high_value_customer': '#9c27b0',
            'daily_sales_milestone': '#4caf50',
            'low_profit_margin': '#ff5722',
        }
        color = colors.get(obj.alert_type, '#757575')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 10px; '
            'border-radius: 3px; font-size: 11px;">{}</span>',
            color,
            obj.get_alert_type_display()
        )
    alert_type_badge.short_description = 'Type'
    
    def priority_badge(self, obj):
        colors = {
            'low': '#4caf50',
            'medium': '#ff9800',
            'high': '#ff5722',
            'critical': '#f44336',
        }
        color = colors.get(obj.priority, '#757575')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 8px; '
            'border-radius: 3px; font-size: 11px; font-weight: bold;">{}</span>',
            color,
            obj.get_priority_display().upper()
        )
    priority_badge.short_description = 'Priority'
    
    def related_objects(self, obj):
        parts = []
        if obj.product:
            parts.append(f'Product: {obj.product.name}')
        if obj.sale:
            parts.append(f'Sale: {obj.sale.sale_number}')
        if obj.customer:
            parts.append(f'Customer: {obj.customer.name}')
        return ', '.join(parts) if parts else '-'
    related_objects.short_description = 'Related To'
    
    actions = ['mark_as_read', 'mark_as_unread', 'dismiss_notifications']
    
    def mark_as_read(self, request, queryset):
        from django.utils import timezone
        updated = queryset.update(is_read=True, read_at=timezone.now())
        self.message_user(request, f'{updated} notification(s) marked as read.')
    mark_as_read.short_description = 'Mark selected as read'
    
    def mark_as_unread(self, request, queryset):
        updated = queryset.update(is_read=False, read_at=None)
        self.message_user(request, f'{updated} notification(s) marked as unread.')
    mark_as_unread.short_description = 'Mark selected as unread'
    
    def dismiss_notifications(self, request, queryset):
        updated = queryset.update(is_dismissed=True)
        self.message_user(request, f'{updated} notification(s) dismissed.')
    dismiss_notifications.short_description = 'Dismiss selected notifications'