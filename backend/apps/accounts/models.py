# backend/apps/accounts/models.py
from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    """Extended User model"""
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=15, blank=True)
    address = models.TextField(blank=True)
    
    # Link to vendor
    vendor = models.ForeignKey('vendors.Vendor', on_delete=models.CASCADE, related_name='users', null=True, blank=True)
    
    role = models.CharField(max_length=20, choices=[
        ('owner', 'Business Owner'),
        ('admin', 'Administrator'),
        ('manager', 'Manager'),
        ('staff', 'Staff'),
    ], default='staff')
    
    # Profile settings
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)
    is_active_employee = models.BooleanField(default=True)
    hire_date = models.DateField(blank=True, null=True)
    salary = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    commission_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0, help_text="Commission percentage")
    
    # Add related_name to avoid clashes
    groups = models.ManyToManyField(
        'auth.Group',
        related_name='custom_user_set',
        blank=True,
        help_text='The groups this user belongs to.',
        verbose_name='groups',
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        related_name='custom_user_set',
        blank=True,
        help_text='Specific permissions for this user.',
        verbose_name='user permissions',
    )
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    def can_manage_vendor(self):
        """Check if user can manage vendor details"""
        return self.role in ['owner', 'admin']
    
    def can_manage_staff(self):
        """Check if user can manage staff"""
        return self.role in ['owner', 'admin', 'manager']