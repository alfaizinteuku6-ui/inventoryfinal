# backend/setup.py
"""
Cython build configuration for Django backend
Place this file in the backend/ directory
"""

import os
import sys
from setuptools import setup, Extension
from Cython.Build import cythonize
from Cython.Distutils import build_ext
import glob

# ===== CONFIGURATION =====
PROJECT_NAME = "ims"  # Change to your Django project name
APPS_TO_PROTECT = [
    "apps",
    "config",
    # Add your Django apps here
]

# Files and patterns to exclude from compilation
EXCLUDE_PATTERNS = [
    "*/migrations/*",
    "*/tests/*",
    "*/test_*.py",
    "*/__init__.py",
    "manage.py",
    "wsgi.py",
    "asgi.py",
    "*/admin.py",  # Optional: keep admin readable
    "*/apps.py",   # Keep app config as .py
]

# ===== HELPER FUNCTIONS =====

def should_compile(filepath):
    """Check if a file should be compiled to .so"""
    # Exclude patterns
    for pattern in EXCLUDE_PATTERNS:
        if pattern.startswith("*/"):
            if pattern[2:] in filepath:
                return False
        elif pattern.startswith("*"):
            if filepath.endswith(pattern[1:]):
                return False
        elif pattern in filepath:
            return False
    
    # Only compile .py files
    return filepath.endswith(".py")

def get_extensions():
    """Collect all Python files to compile"""
    extensions = []
    
    print("\n🔍 Scanning for files to compile...")
    
    # Compile project-level files
    project_dir = PROJECT_NAME
    if os.path.exists(project_dir):
        for py_file in glob.glob(f"{project_dir}/*.py"):
            if should_compile(py_file):
                module_name = py_file.replace("/", ".").replace("\\", ".").replace(".py", "")
                extensions.append(Extension(module_name, [py_file]))
                print(f"   ✓ {py_file}")
    
    # Compile Django apps
    for app in APPS_TO_PROTECT:
        if os.path.exists(app):
            for root, dirs, files in os.walk(app):
                # Skip these directories
                dirs[:] = [d for d in dirs if d not in ['__pycache__', 'migrations', 'tests', '.git']]
                
                for file in files:
                    if file.endswith(".py"):
                        filepath = os.path.join(root, file)
                        if should_compile(filepath):
                            # Convert path to module name
                            module_name = filepath.replace("/", ".").replace("\\", ".").replace(".py", "")
                            extensions.append(Extension(module_name, [filepath]))
                            print(f"   ✓ {filepath}")
    
    print(f"\n📊 Total files to compile: {len(extensions)}\n")
    return extensions

# ===== SETUP CONFIGURATION =====

if __name__ == "__main__":
    extensions = get_extensions()
    
    if not extensions:
        print("⚠️  No files found to compile. Check your configuration.")
        sys.exit(1)
    
    setup(
        name=PROJECT_NAME,
        version="1.0.0",
        description="Protected Django application",
        ext_modules=cythonize(
            extensions,
            compiler_directives={
                'language_level': "3",
                'embedsignature': True,
                'always_allow_keywords': True,
                'boundscheck': False,  # Disable bounds checking for speed
                'wraparound': False,   # Disable negative indexing
                'cdivision': True,     # Use C division
            },
            # Number of parallel jobs
            nthreads=4,
        ),
        cmdclass={'build_ext': build_ext},
        zip_safe=False,
    )