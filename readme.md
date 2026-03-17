# POS Inventory — Modern Point of Sale & Inventory Management System

A full-stack, production-ready **Point of Sale (POS)** and **Inventory Management System** built with **Django REST Framework** and **React (Vite)**. Designed for small-to-medium retail businesses, it covers everything from product cataloging and stock tracking to sales processing, customer management, invoice generation, and real-time analytics — all wrapped in a responsive Material UI interface with PWA support.

---

## Features

**Sales & POS**
- Create and manage sales with line items, discounts, and tax calculations
- Support for multiple payment methods (cash, card, UPI, bank transfer, etc.)
- Payment status tracking (pending, partial, paid, overdue)
- Sale cancellation and refund management
- Auto-generated sale numbers and invoice generation (PDF export via jsPDF)

**Inventory Management**
- Product catalog with SKU auto-generation, barcode support, and category hierarchy
- Stock quantity tracking with configurable min/max stock levels
- Stock movement history (purchases, sales, returns, adjustments, damages)
- Low-stock and overstock alerts via the notifications system
- Product image uploads with multi-image support

**Customer Management**
- Customer profiles with individual and business types
- Credit limit tracking per customer
- Contact details, tax numbers, and address management

**Vendor / Business Profiles**
- Multi-vendor support with GSTIN, PAN, and tax configuration
- Business type classification (retail, wholesale, restaurant, electronics, etc.)
- Per-vendor currency, tax rate, and payment terms

**Dashboard & Analytics**
- Sales trend charts (Recharts + MUI X Charts)
- Top products, top customers, and category performance breakdowns
- Payment method and payment status distribution
- Inventory alerts at a glance

**User Management & Auth**
- Role-based access (admin, manager, salesperson, inventory_clerk, viewer)
- JWT authentication with token refresh (SimpleJWT)
- Staff profiles with hire date, salary, and commission rate tracking
- CSRF protection for cookie-based sessions

**Notifications**
- Real-time alerts for low stock, overdue payments, expiring products, and more
- Priority levels (low, medium, high, critical)
- Read/dismiss tracking

**Infrastructure**
- Celery + Redis for background task processing (stock checks, report generation)
- Swagger/OpenAPI documentation (drf-yasg)
- Database backup and restore management commands
- GitHub Actions CI/CD with PyArmor code protection
- PWA support — installable on mobile and desktop with offline caching
- Windows service setup via NSSM (Nginx, Redis, Django, Celery as services)

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, Vite 7, Material UI 7 (MUI), Recharts, React Hook Form + Yup, React Router 7, SWR, Axios |
| **Backend** | Python 3.12, Django 5.2, Django REST Framework 3.16, Celery 5.5, Redis |
| **Database** | PostgreSQL (production) / SQLite (development) |
| **Auth** | JWT via SimpleJWT, CSRF cookie-based protection |
| **API Docs** | Swagger UI & ReDoc via drf-yasg |
| **Deployment** | Uvicorn / Gunicorn, Nginx, WhiteNoise for static files |
| **CI/CD** | GitHub Actions with PyArmor obfuscation |
| **PWA** | Vite PWA plugin with Workbox service worker |

---

## Project Structure

```
POS-Inventory/
├── backend/
│   ├── apps/
│   │   ├── accounts/        # User auth, roles, staff profiles
│   │   ├── core/            # Base models, backup/restore commands, Celery tasks
│   │   ├── customers/       # Customer CRUD and profiles
│   │   ├── inventory/       # Products, categories, stock movements
│   │   ├── invoices/        # Invoice generation
│   │   ├── notifications/   # Alert system (low stock, overdue, etc.)
│   │   ├── sales/           # Sales, sale items, analytics viewsets
│   │   └── vendors/         # Business/vendor profiles
│   ├── config/              # Celery config, pagination
│   ├── ims/                 # Django project settings, URLs, WSGI/ASGI
│   ├── service_scripts/     # Windows service install/start/stop scripts
│   ├── setup_functions/     # Environment, Nginx, Redis, SSL setup
│   ├── manage.py
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable UI (Dashboard, Products, Sales, etc.)
│   │   ├── contexts/        # Auth, Theme, Notification providers
│   │   ├── hooks/           # useAuth, useSWR, useSalesState, etc.
│   │   ├── pages/           # Dashboard, Products, Sales, Customers, Login, etc.
│   │   ├── services/        # Axios API client with CSRF handling
│   │   └── utils/           # Constants, invoice helpers, utilities
│   ├── package.json
│   └── vite.config.js
├── .github/workflows/       # CI/CD pipeline
└── manage.bat               # One-click Windows dev launcher
```

---

## Getting Started

### Prerequisites

- **Python** 3.10+ (3.12 recommended)
- **Node.js** 18+ (22 LTS recommended)
- **Redis** (for Celery background tasks)
- **PostgreSQL** (recommended for production; SQLite works for development)

### 1. Clone the Repository

```bash
git clone https://github.com/PuneethReddyHC/POS-Inventory.git
cd POS-Inventory
```

### 2. Backend Setup

```bash
cd backend

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate        # Linux/macOS
venv\Scripts\activate           # Windows

# Install dependencies
pip install --upgrade pip
pip install -r requirements.txt
```

Create a `.env` file in the `backend/` directory:

```env
SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
DATABASE_URL=sqlite:///db.sqlite3
CELERY_BROKER_URL=redis://localhost:6379/0
```

Run migrations and create an admin user:

```bash
python manage.py migrate
python manage.py createsuperuser
```

Start the development server:

```bash
python manage.py runserver
```

The API will be available at `http://localhost:8000/api/` and Swagger docs at `http://localhost:8000/swagger/`.

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start the dev server
npm run dev
```

The frontend dev server runs at `http://localhost:5173` and proxies API requests to the Django backend.

### 4. Start Redis & Celery (for background tasks)

```bash
# Start Redis (install via your package manager if needed)
redis-server

# In a new terminal, start Celery worker
cd backend
celery -A config worker -l info --pool=solo

# In another terminal, start Celery beat (scheduled tasks)
celery -A config beat -l info
```

### Quick Start (Windows)

The included `manage.bat` in the project root automates the entire setup — it checks for Python and Node.js (installs them if missing), creates virtual environments, installs dependencies, runs migrations, and launches both servers.

```cmd
manage.bat
```

---

## API Endpoints

All API endpoints are prefixed with `/api/`. Key resources:

| Endpoint | Description |
|---|---|
| `/api/categories/` | Product categories (CRUD) |
| `/api/products/` | Products with filtering, search |
| `/api/stock-movements/` | Stock movement history |
| `/api/sales/` | Sales with line items |
| `/api/customers/` | Customer management |
| `/api/vendors/` | Vendor/business profiles |
| `/api/notifications/` | Alerts and notifications |
| `/api/analytics/` | Sales analytics and reports |
| `/api/accounts/` | User auth and profiles |
| `/swagger/` | Interactive API documentation |
| `/redoc/` | ReDoc API documentation |

---

## Production Deployment

### Build the Frontend

```bash
cd frontend
npm run build:production
```

This generates optimized static files in `frontend/dist/` which Django serves via WhiteNoise.

### Run with Uvicorn (Production)

```bash
cd backend
uvicorn ims.asgi:application --host 0.0.0.0 --port 8000 --workers 4
```

### Windows Service Setup

The repo includes scripts to install Django, Redis, Celery, and Nginx as Windows services using NSSM:

```cmd
cd backend
setup_services.bat
```

### Environment Variables (Production)

```env
SECRET_KEY=<generate-a-strong-key>
DEBUG=False
ALLOWED_HOSTS=yourdomain.com
DATABASE_URL=postgres://user:pass@localhost:5432/pos_db
CELERY_BROKER_URL=redis://localhost:6379/0
```

---

## Database Management

The system includes built-in management commands for database backup and restore:

```bash
# Create a backup
python manage.py backup_database

# List available backups
python manage.py list_backups

# Restore from a backup
python manage.py restore_database <backup_name>
```

---

## Screenshots

> Coming soon — Dashboard, POS sales screen, inventory view, and analytics charts.

---

## Contributing

Contributions are welcome! Please open an issue first to discuss proposed changes, then submit a pull request.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'Add your feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

---

## License

This project is proprietary. See the repository for license details.

---

## Author

**Puneeth Reddy HC**
GitHub: [@PuneethReddyHC](https://github.com/PuneethReddyHC)

---

<!-- GitHub Topics / Tags for discoverability:
pos, point-of-sale, inventory-management, inventory-management-system, pos-system,
django, django-rest-framework, react, vite, material-ui, mui, fullstack,
sales-management, stock-management, invoice-generator, crm, retail,
celery, redis, pwa, progressive-web-app, jwt-authentication,
python, javascript, postgresql, dashboard, analytics,
small-business, retail-software, billing-software, pos-software,
inventory-tracking, barcode, product-management, customer-management,
django-react, restful-api, swagger, openapi
-->
