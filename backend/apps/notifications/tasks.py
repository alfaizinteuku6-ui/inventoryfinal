# backend/apps/notifications/tasks.py
"""
Celery tasks for automatic notification generation
Run these periodically using Celery Beat
"""
from celery import shared_task
from .services import NotificationService
import logging

logger = logging.getLogger(__name__)

@shared_task
def generate_stock_alerts():
    """Generate stock-related alerts - Run every 2 hours"""
    try:
        alerts = NotificationService.generate_stock_alerts()
        logger.info(f"Generated {len(alerts)} stock alerts")
        return {
            'success': True,
            'count': len(alerts),
            'type': 'stock_alerts'
        }
    except Exception as e:
        logger.error(f"Error generating stock alerts: {str(e)}")
        return {'success': False, 'error': str(e)}

@shared_task
def generate_sales_alerts():
    """Generate sales-related alerts - Run every 4 hours"""
    try:
        alerts = NotificationService.generate_sales_alerts()
        logger.info(f"Generated {len(alerts)} sales alerts")
        return {
            'success': True,
            'count': len(alerts),
            'type': 'sales_alerts'
        }
    except Exception as e:
        logger.error(f"Error generating sales alerts: {str(e)}")
        return {'success': False, 'error': str(e)}

@shared_task
def generate_refund_alerts():
    """Generate refund-related alerts - Run daily"""
    try:
        alerts = NotificationService.generate_refund_alerts()
        logger.info(f"Generated {len(alerts)} refund alerts")
        return {
            'success': True,
            'count': len(alerts),
            'type': 'refund_alerts'
        }
    except Exception as e:
        logger.error(f"Error generating refund alerts: {str(e)}")
        return {'success': False, 'error': str(e)}

@shared_task
def generate_customer_alerts():
    """Generate customer-related alerts - Run every 6 hours"""
    try:
        alerts = NotificationService.generate_customer_alerts()
        logger.info(f"Generated {len(alerts)} customer alerts")
        return {
            'success': True,
            'count': len(alerts),
            'type': 'customer_alerts'
        }
    except Exception as e:
        logger.error(f"Error generating customer alerts: {str(e)}")
        return {'success': False, 'error': str(e)}

@shared_task
def generate_product_performance_alerts():
    """Generate product performance alerts - Run daily"""
    try:
        alerts = NotificationService.generate_product_performance_alerts()
        logger.info(f"Generated {len(alerts)} product performance alerts")
        return {
            'success': True,
            'count': len(alerts),
            'type': 'product_performance_alerts'
        }
    except Exception as e:
        logger.error(f"Error generating product performance alerts: {str(e)}")
        return {'success': False, 'error': str(e)}

@shared_task
def generate_all_alerts():
    """Generate all types of alerts - Run every hour"""
    try:
        alerts = NotificationService.generate_all_alerts()
        logger.info(f"Generated {len(alerts)} total alerts")
        return {
            'success': True,
            'count': len(alerts),
            'type': 'all_alerts'
        }
    except Exception as e:
        logger.error(f"Error generating all alerts: {str(e)}")
        return {'success': False, 'error': str(e)}

@shared_task
def cleanup_old_notifications():
    """Cleanup old read/dismissed notifications - Run weekly"""
    try:
        deleted = NotificationService.cleanup_old_notifications(days=30)
        logger.info(f"Cleaned up {deleted} old notifications")
        return {
            'success': True,
            'deleted_count': deleted
        }
    except Exception as e:
        logger.error(f"Error cleaning up notifications: {str(e)}")
        return {'success': False, 'error': str(e)}