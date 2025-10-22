# backend/config/celery.py
import os
from celery import Celery
from celery.schedules import crontab

# 👇 Tell Celery where to find Django settings
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "ims.settings")

app = Celery("pos_backend")

# Load settings from Django's settings.py (using CELERY_ namespace)
app.config_from_object("django.conf:settings", namespace="CELERY")

# Auto-discover tasks across all installed apps
app.autodiscover_tasks()

# Celery Beat Schedule for automatic notification generation
app.conf.beat_schedule = {
    "generate-all-alerts": {
        "task": "apps.notifications.tasks.generate_all_alerts",
        "schedule": crontab(minute=0),
    },
    "generate-stock-alerts": {
        "task": "apps.notifications.tasks.generate_stock_alerts",
        "schedule": crontab(minute=0, hour="*/2"),
    },
    "generate-sales-alerts": {
        "task": "apps.notifications.tasks.generate_sales_alerts",
        "schedule": crontab(minute=0, hour="*/4"),
    },
    "generate-customer-alerts": {
        "task": "apps.notifications.tasks.generate_customer_alerts",
        "schedule": crontab(minute=0, hour="*/6"),
    },
    "generate-refund-alerts": {
        "task": "apps.notifications.tasks.generate_refund_alerts",
        "schedule": crontab(hour=9, minute=0),
    },
    "generate-product-performance-alerts": {
        "task": "apps.notifications.tasks.generate_product_performance_alerts",
        "schedule": crontab(hour=10, minute=0),
    },
    "cleanup-old-notifications": {
        "task": "apps.notifications.tasks.cleanup_old_notifications",
        "schedule": crontab(hour=2, minute=0, day_of_week=0),
    },
    
    'backup-database-every-10-minutes': {
        'task': 'apps.core.tasks.backup_database_task',
        'schedule': 600.0,  # 600 seconds = 10 minutes
        'args': (30,),  # Keep 30 most recent backups
    },
    # Optional: Daily cleanup at 3 AM
    'cleanup-old-backups-daily': {
        'task': 'apps.core.tasks.cleanup_old_backups_task',
        'schedule': crontab(hour=3, minute=0),
        'args': (50,),
    },
}

app.conf.timezone = "Asia/Kolkata"

@app.task(bind=True)
def debug_task(self):
    print(f'Request: {self.request!r}')
