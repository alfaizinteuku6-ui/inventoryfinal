from django.contrib import admin
from .models import Customer


@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):
    list_display = (
        "name", "customer_type", "email", "phone",
        "city", "state", "credit_limit", 'is_active'
    )
    list_filter = ("customer_type", "city", "state")
    search_fields = ("name", "email", "phone", "tax_number")
    ordering = ("name",)

    fieldsets = (
        (None, {
            "fields": ("name", "customer_type", "email", "phone", "address", 'is_active')
        }),
        ("Location", {
            "fields": ("city", "state", "postal_code")
        }),
        ("Business Info", {
            "fields": ("tax_number", "credit_limit")
        }),
        ("Timestamps", {
            "fields": ("created_at", "updated_at"),
        }),
    )

    readonly_fields = ("created_at", "updated_at")
