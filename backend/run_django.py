from cx_Freeze import setup, Executable
import sys
import os

# Add your Django app to the path
build_exe_options = {
    "packages": [
        "django",
        "ims",  
        "apps",
        "config",
    ],
    "includes": [
        "django.contrib.admin",
        "django.contrib.auth",
        "django.contrib.contenttypes",
        "django.contrib.sessions",
        "django.contrib.messages",
        "django.contrib.staticfiles",
    ],
    "include_files": [
        ("ims", "ims"),  # Include your app folder
        ("templates", "templates") if os.path.exists("templates") else None,
        ("static", "static") if os.path.exists("static") else None,
        ("db.sqlite3", "db.sqlite3") if os.path.exists("db.sqlite3") else None,
    ],
    "excludes": ["tkinter"],
}

# Remove None values from include_files
build_exe_options["include_files"] = [f for f in build_exe_options["include_files"] if f]

setup(
    name="InventoryManagement",
    version="1.0",
    description="Django Inventory Management System",
    options={"build_exe": build_exe_options},
    executables=[Executable("manage.py", base=None, target_name="manage.exe")]
)