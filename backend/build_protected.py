import os
import shutil
from pathlib import Path
import sys

BASE_DIR = Path(".")
DIST_DIR = BASE_DIR / "dist_protected"
BUILD_DIR = BASE_DIR / "build"

print("=" * 60)
print("Creating Protected Distribution")
print("=" * 60)

if DIST_DIR.exists():
    print("Removing existing dist_protected...")
    shutil.rmtree(DIST_DIR)

DIST_DIR.mkdir(parents=True, exist_ok=True)
print("Created dist_protected folder")

# Copy compiled .pyd files
pyd_files = list(BUILD_DIR.rglob("*.pyd"))
if not pyd_files:
    print("No .pyd files found in build directory.")
else:
    for pyd in pyd_files:
        rel_path = pyd.relative_to(BUILD_DIR)
        dest_path = DIST_DIR / rel_path
        dest_path.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(pyd, dest_path)
    print(f"Copied {len(pyd_files)} compiled .pyd files")

# Copy essential Django files
files_to_copy = ["manage.py", "requirements.txt"]
for f in files_to_copy:
    src = BASE_DIR / f
    if src.exists():
        shutil.copy2(src, DIST_DIR / f)
        print(f"Copied {f}")

# Copy templates, static, etc.
for folder in ["static", "templates", "media"]:
    src_folder = BASE_DIR / folder
    if src_folder.exists():
        dest_folder = DIST_DIR / folder
        shutil.copytree(src_folder, dest_folder, dirs_exist_ok=True)
        print(f"Copied {folder}/")

# Copy migrations
for path in BASE_DIR.rglob("migrations"):
    if ".venv" not in str(path) and "venv" not in str(path):
        rel = path.relative_to(BASE_DIR)
        dest = DIST_DIR / rel
        shutil.copytree(path, dest, dirs_exist_ok=True)
print("Copied migrations")

# Copy __init__.py files
for init in BASE_DIR.rglob("__init__.py"):
    rel = init.relative_to(BASE_DIR)
    dest = DIST_DIR / rel
    dest.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(init, dest)
print("Copied __init__.py files")

# Build summary
total_files = len(list(DIST_DIR.rglob("*")))
pyd_count = len(list(DIST_DIR.rglob("*.pyd")))

print("\n" + "=" * 60)
print(f"Protected Distribution Complete")
print(f"Total Files: {total_files}")
print(f".pyd Files: {pyd_count}")
print(f"Output: {DIST_DIR}")
print("=" * 60)

if pyd_count == 0:
    sys.exit("No compiled files found! Build may have failed.")
