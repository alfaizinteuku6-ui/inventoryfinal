from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User


class CustomUserAdmin(UserAdmin):
    model = User
    list_display = ("email", "username", "first_name", "last_name", "role", "vendor", "is_staff", "is_active")
    list_filter = ("role", "vendor", "is_staff", "is_active")
    search_fields = ("email", "username", "first_name", "last_name")
    ordering = ("email",)

    fieldsets = (
        (None, {"fields": ("email", "password")}),
        ("Personal Info", {"fields": ("username", "first_name", "last_name", "phone", "address", "avatar")}),
        ("Employment Info", {"fields": ("vendor", "is_active_employee", "hire_date", "salary", "commission_rate")}),
        ("Roles & Permissions", {"fields": ("role", "is_staff", "is_active", "groups", "user_permissions")}),
        ("Important Dates", {"fields": ("last_login", "date_joined")}),
    )

    add_fieldsets = (
        (None, {
            "classes": ("wide",),
            "fields": (
                "email", "username", "first_name", "last_name", "phone", "address",
                "vendor", "role", "password1", "password2", "is_staff", "is_active"
            ),
        }),
    )


admin.site.register(User, CustomUserAdmin)
