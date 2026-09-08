# backend/ims/urls.py
from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

# API Router
from apps.inventory.views import CategoryViewSet, ProductViewSet, StockMovementViewSet, SupplierViewSet
from apps.sales.views.views import SaleViewSet
from apps.sales.views.analytics import SalesAnalyticsViewSet
from apps.customers.views import CustomerViewSet
from apps.vendors.views import VendorViewSet
from apps.notifications.views import NotificationViewSet
from apps.accounts.views import get_csrf_token

from drf_yasg.views import get_schema_view
from drf_yasg import openapi
from rest_framework import permissions

from django.views.generic import TemplateView
from apps.core.views import IndexView

# Schema view configuration
schema_view = get_schema_view(
    openapi.Info(
        title="Inventory Management System API",
        default_version='v1',
        description="API documentation for Inventory Management System",
        terms_of_service="https://www.example.com/terms/",
        contact=openapi.Contact(email="contact@example.com"),
        license=openapi.License(name="BSD License"),
    ),
    public=True,
    permission_classes=[permissions.AllowAny],
)

router = DefaultRouter()
router.register('categories', CategoryViewSet)
router.register('products', ProductViewSet)
router.register('stock-movements', StockMovementViewSet)
router.register('suppliers', SupplierViewSet, basename='supplier')
router.register('sales', SaleViewSet)
router.register(r'customers', CustomerViewSet, basename='customer')
router.register(r'vendors', VendorViewSet, basename='vendor')
router.register(r'notifications', NotificationViewSet, basename='notification')
router.register(r'analytics', SalesAnalyticsViewSet, basename='analytics')

urlpatterns = [
    path('admin/', admin.site.urls),
    # Swagger URLs
    path('swagger<format>/', schema_view.without_ui(cache_timeout=0), name='schema-json'),
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
    
    # Authentication
    path('api/csrf/', get_csrf_token, name='get_csrf_token'),

    path('api/auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # API endpoints
    path('api/', include(router.urls)),
    
    # App-specific URLs
    path('api/accounts/', include('apps.accounts.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    
urlpatterns += [
    re_path(r'^.*$', TemplateView.as_view(template_name='index.html')),
]