# apps/core/management/commands/list_backups.py
from django.core.management.base import BaseCommand
from django.conf import settings
from pathlib import Path
from datetime import datetime


class Command(BaseCommand):
    help = 'Lists all available database backups'

    def handle(self, *args, **options):
        backup_dir = Path(settings.BASE_DIR) / 'backups'
        
        if not backup_dir.exists():
            self.stdout.write(self.style.WARNING('No backups directory found'))
            return

        backup_files = sorted(backup_dir.glob('db_backup_*.sql'), reverse=True)
        
        if not backup_files:
            self.stdout.write(self.style.WARNING('No backup files found'))
            return

        self.stdout.write(self.style.SUCCESS('\n📦 Available Backups:\n'))
        
        for backup_file in backup_files:
            size = backup_file.stat().st_size / (1024 * 1024)  # Size in MB
            mtime = datetime.fromtimestamp(backup_file.stat().st_mtime)
            
            self.stdout.write(
                f'  • {backup_file.name}\n'
                f'    Size: {size:.2f} MB | Created: {mtime.strftime("%Y-%m-%d %H:%M:%S")}\n'
            )