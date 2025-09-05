from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'users', views.UserProfileViewSet, basename='profile')
router.register(r'staff', views.StaffViewSet, basename='staff')

urlpatterns = router.urls