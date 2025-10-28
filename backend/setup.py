from setuptools import setup, Extension
from Cython.Build import cythonize
import os

# Collect all Python files to compile (excluding venvs, migrations, etc.)
python_files = []
for root, _, files in os.walk('.'):
    if any(skip in root for skip in ['migrations', '__pycache__', 'tests', 'venv', '.venv', 'build', 'dist_protected']):
        continue
    for f in files:
        if f.endswith('.py') and f not in ['setup.py', 'manage.py', 'build_protected.py']:
            python_files.append(os.path.join(root, f))

print(f"Found {len(python_files)} Python files to compile")

extensions = [
    Extension(
        name="*",
        sources=python_files,
        extra_compile_args=["/O2"] if os.name == 'nt' else ["-O3"],
    )
]

setup(
    name="django_protected",
    ext_modules=cythonize(
        extensions,
        compiler_directives={"language_level": "3", "embedsignature": True},
        build_dir="build",
    ),
)
