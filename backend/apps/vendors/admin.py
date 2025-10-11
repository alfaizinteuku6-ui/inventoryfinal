from django.contrib import admin
from .models import Vendor
from apps.accounts.models import User  # To show related users inline


class UserInline(admin.TabularInline):
    model = User
    fields = ("email", "first_name", "last_name", "role", "is_active")
    extra = 1
    show_change_link = True
    autocomplete_fields = ["groups"]
    verbose_name = "User"
    verbose_name_plural = "Users"


@admin.register(Vendor)
class VendorAdmin(admin.ModelAdmin):
    list_display = ("name", "business_type", "email", "phone", "city", "state", "tax_rate")
    list_filter = ("business_type", "city", "state", "country")
    search_fields = ("name", "email", "phone", "contact_person", "gstin", "pan_number")
    ordering = ("name",)
    readonly_fields = ("created_at", "updated_at")
    inlines = [UserInline]

    fieldsets = (
        ("Basic Information", {
            "fields": ("name", "tagline", "business_type", "logo", "website"),
        }),
        ("Contact Details", {
            "fields": ("contact_person", "email", "phone", "address", "city", "state", "postal_code", "country"),
        }),
        ("Business Details", {
            "fields": ("gstin", "pan_number", "payment_terms", "credit_limit"),
        }),
        ("Settings", {
            "fields": ("currency", "tax_rate"),
        }),
        ("Timestamps", {
            "fields": ("created_at", "updated_at"),
        }),
    )
