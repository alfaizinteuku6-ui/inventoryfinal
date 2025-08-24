from django.contrib import admin
from django.utils.html import format_html
from .models import Product


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "sku",
        "barcode",
        "category",
        "is_active",
        "selling_price",
        "stock_quantity",
        "is_low_stock",
        "profit_margin",
        "image_preview",
        "is_active"
    )
    list_filter = ("category", "tax_rate")
    search_fields = ("name", "sku", "barcode", "description")
    readonly_fields = ("profit_margin", "is_low_stock", "image_preview")
    ordering = ("name",)

    def image_preview(self, obj):
        if obj.image:
            return format_html(
                '<img src="{}" width="80" height="80" style="object-fit:cover;" />',
                obj.image.url,
            )
        return "-"
    image_preview.short_description = "Image Preview"

    fieldsets = (
        ("Basic Info", {
            "fields": ("name", "description", "sku", "barcode", "category", "image", "image_preview", "is_active")
        }),
        ("Pricing", {
            "fields": ("cost_price", "selling_price", "tax_rate", "profit_margin")
        }),
        ("Inventory", {
            "fields": ("stock_quantity", "min_stock_level", "max_stock_level", "is_low_stock")
        }),
        ("Additional", {
            "fields": ("weight", "dimensions")
        }),
    )
