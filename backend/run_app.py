# run_app.py
import os
import sys

# ensure project root is on path if needed
here = os.path.dirname(__file__)
if here not in sys.path:
    sys.path.insert(0, here)

# set settings module for Django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "ims.settings")

# optional: apply migrations programmatically (only if you want installer to run them)
def apply_migrations():
    from django.core.management import call_command
    call_command("migrate", interactive=False)

def main():
    # Uncomment if you want to auto-run migrations at first run:
    # apply_migrations()

    # For ASGI app served by uvicorn (recommended)
    import uvicorn
    # DJANGO_ASGI_APPLICATION should be set in settings.py (default if you created project with asgi)
    uvicorn.run("ims.asgi:application", host="0.0.0.0", port=8000, log_level="info")

if __name__ == "__main__":
    main()
