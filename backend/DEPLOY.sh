#!/bin/bash
set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

clear
echo -e "${BLUE}=========================================${NC}"
echo -e "${BLUE}  Django + React Deployment Script${NC}"
echo -e "${BLUE}=========================================${NC}"
echo ""

# Check Python
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}❌ Python 3 is not installed${NC}"
    echo "Please install Python 3.9 or higher"
    exit 1
fi

PYTHON_VERSION=$(python3 --version | cut -d' ' -f2)
echo -e "${GREEN}✅ Python $PYTHON_VERSION detected${NC}"
echo ""

# Navigate to backend
cd backend

echo -e "${GREEN}[1/7] Creating virtual environment...${NC}"
py -3.12 -m venv venv

echo -e "${GREEN}[2/7] Activating virtual environment...${NC}"
source venv/bin/activate

echo -e "${GREEN}[3/7] Upgrading pip...${NC}"
pip install --upgrade pip --quiet

echo -e "${GREEN}[4/7] Installing dependencies...${NC}"
pip install -r requirements.txt --quiet
echo "✅ Dependencies installed"

pyarmor gen runtime --platform windows.x86_64 --output win_runtime

cp win_runtime/pyarmor_runtime_000000/pyarmor_runtime.pyd pyarmor_runtime_000000/

rm -rf win_runtime

echo -e "${GREEN}[5/7] Setting up environment...${NC}"
if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
        cp .env.example .env
        echo -e "${YELLOW}⚠️  Created .env from .env.example${NC}"
        echo -e "${YELLOW}⚠️  Please edit .env with your settings${NC}"
    else
        echo -e "${YELLOW}⚠️  No .env file found. Please create one.${NC}"
    fi
fi

echo -e "${GREEN}[6/7] Running migrations...${NC}"
python manage.py migrate

echo -e "${GREEN}[7/7] Collecting static files...${NC}"
python manage.py collectstatic --noinput

echo ""
echo -e "${GREEN}=========================================${NC}"
echo -e "${GREEN}  ✅ Deployment Complete!${NC}"
echo -e "${GREEN}=========================================${NC}"
echo ""
echo -e "${YELLOW}To create a superuser:${NC}"
echo "  python manage.py createsuperuser"
echo ""
echo -e "${YELLOW}To start the development server:${NC}"
echo "  python manage.py runserver 0.0.0.0:8000"
echo ""
echo -e "${YELLOW}For production, use Gunicorn:${NC}"
echo "  pip install gunicorn"
echo "  gunicorn ims.wsgi:application --bind 0.0.0.0:8000 --workers 4"
echo ""
