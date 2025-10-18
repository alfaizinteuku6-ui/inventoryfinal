# apps/core/management/commands/restore_database.py
import subprocess
from django.core.management.base import BaseCommand
from django.conf import settings
from pathlib import Path
import os


class Command(BaseCommand):
    help = 'Restores the database from a backup file'

    def add_arguments(self, parser):
        parser.add_argument(
            'backup_file',
            type=str,
            help='Path to the backup file to restore'
        )
        parser.add_argument(
            '--force',
            action='store_true',
            help='Skip confirmation prompt'
        )

    def handle(self, *args, **options):
        backup_file = Path(options['backup_file'])
        
        if not backup_file.exists():
            self.stdout.write(self.style.ERROR(f'✗ Backup file not found: {backup_file}'))
            return

        # Confirmation
        if not options['force']:
            confirm = input(f'⚠️  This will restore the database from {backup_file.name}. Continue? (yes/no): ')
            if confirm.lower() != 'yes':
                self.stdout.write(self.style.WARNING('Restore cancelled'))
                return

        try:
            db_settings = settings.DATABASES['default']
            db_engine = db_settings['ENGINE']

            if 'postgresql' in db_engine:
                self._restore_postgresql(db_settings, backup_file)
            elif 'mysql' in db_engine:
                self._restore_mysql(db_settings, backup_file)
            elif 'sqlite3' in db_engine:
                self._restore_sqlite(db_settings, backup_file)
            else:
                self.stdout.write(self.style.ERROR(f'Unsupported database engine: {db_engine}'))
                return

            self.stdout.write(self.style.SUCCESS(f'✓ Database restored successfully from: {backup_file}'))

        except Exception as e:
            self.stdout.write(self.style.ERROR(f'✗ Restore failed: {str(e)}'))

    def _restore_postgresql(self, db_settings, backup_file):
        """Restore PostgreSQL database"""
        env = os.environ.copy()
        env['PGPASSWORD'] = db_settings['PASSWORD']
        
        # Drop and recreate database
        self.stdout.write('Dropping existing database...')
        subprocess.run([
            'dropdb',
            '-h', db_settings['HOST'],
            '-p', str(db_settings['PORT']) if db_settings['PORT'] else '5432',
            '-U', db_settings['USER'],
            '--if-exists',
            db_settings['NAME']
        ], env=env)
        
        self.stdout.write('Creating new database...')
        subprocess.run([
            'createdb',
            '-h', db_settings['HOST'],
            '-p', str(db_settings['PORT']) if db_settings['PORT'] else '5432',
            '-U', db_settings['USER'],
            db_settings['NAME']
        ], env=env, check=True)
        
        self.stdout.write('Restoring from backup...')
        subprocess.run([
            'pg_restore',
            '-h', db_settings['HOST'],
            '-p', str(db_settings['PORT']) if db_settings['PORT'] else '5432',
            '-U', db_settings['USER'],
            '-d', db_settings['NAME'],
            str(backup_file)
        ], env=env, check=True)

    def _restore_mysql(self, db_settings, backup_file):
        """Restore MySQL database"""
        cmd = [
            'mysql',
            '-h', db_settings['HOST'],
            '-P', str(db_settings['PORT']) if db_settings['PORT'] else '3306',
            '-u', db_settings['USER'],
            f'-p{db_settings["PASSWORD"]}',
            db_settings['NAME']
        ]
        
        with open(backup_file, 'r') as f:
            subprocess.run(cmd, stdin=f, check=True)

    def _restore_sqlite(self, db_settings, backup_file):
        """Restore SQLite database"""
        import shutil
        db_path = db_settings['NAME']
        
        # Backup current database before restoring
        if Path(db_path).exists():
            backup_timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            shutil.copy2(db_path, f'{db_path}.pre_restore_{backup_timestamp}')
            self.stdout.write(f'Current database backed up to: {db_path}.pre_restore_{backup_timestamp}')
        
        shutil.copy2(backup_file, db_path)

