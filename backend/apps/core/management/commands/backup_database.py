# apps/core/management/commands/backup_database.py
import os
import subprocess
from datetime import datetime
from django.core.management.base import BaseCommand
from django.conf import settings
from pathlib import Path
import logging

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = 'Creates a backup of the database'

    def add_arguments(self, parser):
        parser.add_argument(
            '--keep',
            type=int,
            default=50,
            help='Number of backup files to keep (default: 50)'
        )

    def handle(self, *args, **options):
        try:
            # Create backup directory if it doesn't exist
            backup_dir = Path(settings.BASE_DIR) / 'backups'
            backup_dir.mkdir(exist_ok=True)

            # Generate backup filename with timestamp
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            backup_file = backup_dir / f'db_backup_{timestamp}.sql'

            # Get database settings
            db_settings = settings.DATABASES['default']
            db_engine = db_settings['ENGINE']

            if 'postgresql' in db_engine:
                self._backup_postgresql(db_settings, backup_file)
            elif 'mysql' in db_engine:
                self._backup_mysql(db_settings, backup_file)
            elif 'sqlite3' in db_engine:
                self._backup_sqlite(db_settings, backup_file)
            else:
                self.stdout.write(self.style.ERROR(f'Unsupported database engine: {db_engine}'))
                return

            self.stdout.write(self.style.SUCCESS(f'✓ Backup created successfully: {backup_file}'))
            
            # Clean up old backups
            self._cleanup_old_backups(backup_dir, options['keep'])
            
            logger.info(f'Database backup created: {backup_file}')

        except Exception as e:
            self.stdout.write(self.style.ERROR(f'✗ Backup failed: {str(e)}'))
            logger.error(f'Database backup failed: {str(e)}')
            raise  # Re-raise for Celery to mark task as failed

    def _backup_postgresql(self, db_settings, backup_file):
        """Backup PostgreSQL database"""
        env = os.environ.copy()
        env['PGPASSWORD'] = db_settings['PASSWORD']
        
        cmd = [
            'pg_dump',
            '-h', db_settings['HOST'],
            '-p', str(db_settings['PORT']) if db_settings['PORT'] else '5432',
            '-U', db_settings['USER'],
            '-F', 'c',  # Custom format (compressed)
            '-f', str(backup_file),
            db_settings['NAME']
        ]
        
        subprocess.run(cmd, env=env, check=True)

    def _backup_mysql(self, db_settings, backup_file):
        """Backup MySQL database"""
        cmd = [
            'mysqldump',
            '-h', db_settings['HOST'],
            '-P', str(db_settings['PORT']) if db_settings['PORT'] else '3306',
            '-u', db_settings['USER'],
            f'-p{db_settings["PASSWORD"]}',
            '--result-file', str(backup_file),
            db_settings['NAME']
        ]
        
        subprocess.run(cmd, check=True)

    def _backup_sqlite(self, db_settings, backup_file):
        """Backup SQLite database"""
        import shutil
        db_path = db_settings['NAME']
        shutil.copy2(db_path, backup_file)

    def _cleanup_old_backups(self, backup_dir, keep_count):
        """Remove old backup files, keeping only the specified number of recent backups"""
        backup_files = sorted(backup_dir.glob('db_backup_*.sql'), reverse=True)
        
        for old_backup in backup_files[keep_count:]:
            old_backup.unlink()
            self.stdout.write(self.style.WARNING(f'Removed old backup: {old_backup.name}'))

