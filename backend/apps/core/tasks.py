# apps/core/tasks.py
from celery import shared_task
from django.core.management import call_command
import logging

logger = logging.getLogger(__name__)


@shared_task(bind=True, max_retries=3)
def backup_database_task(self, keep_count=50):
    """
    Celery task to create database backup
    Retries up to 3 times if it fails
    """
    try:
        logger.info('Starting scheduled database backup...')
        call_command('backup_database', keep=keep_count)
        logger.info('Database backup completed successfully')
        return {'status': 'success', 'message': 'Backup created successfully'}
    except Exception as e:
        logger.error(f'Database backup failed: {str(e)}')
        # Retry after 5 minutes if failed
        raise self.retry(exc=e, countdown=300)


@shared_task
def cleanup_old_backups_task(keep_count=50):
    """
    Task to cleanup old backups
    Can be run separately if needed
    """
    try:
        from pathlib import Path
        from django.conf import settings
        
        backup_dir = Path(settings.BASE_DIR) / 'backups'
        backup_files = sorted(backup_dir.glob('db_backup_*.sql'), reverse=True)
        
        deleted_count = 0
        for old_backup in backup_files[keep_count:]:
            old_backup.unlink()
            deleted_count += 1
            logger.info(f'Removed old backup: {old_backup.name}')
        
        return {'status': 'success', 'deleted': deleted_count}
    except Exception as e:
        logger.error(f'Cleanup failed: {str(e)}')
        return {'status': 'error', 'message': str(e)}
