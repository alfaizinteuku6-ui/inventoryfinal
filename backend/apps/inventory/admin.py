from django.contrib import admin
from .models import Category, Product, StockMovement


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "parent", "created_at", "updated_at", 'is_active')
    search_fields = ("name",)
    ordering = ("name",)


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = (
        "name", "sku", "barcode", "category", "selling_price", "cost_price",
        "stock_quantity", "min_stock_level", "max_stock_level",
        "is_active", "is_low_stock", "profit_margin_display"
    )
    list_filter = ("category", "is_active")
    search_fields = ("name", "sku", "barcode")
    ordering = ("name",)
    readonly_fields = ("barcode", "profit_margin", "created_at", "updated_at")
    
    fieldsets = (
        (None, {
            "fields": ("name", "description", "sku", "barcode", "category", "image")
        }),
        ("Pricing", {
            "fields": ("cost_price", "selling_price", "tax_rate")
        }),
        ("Inventory", {
            "fields": ("stock_quantity", "min_stock_level", "max_stock_level", "is_active")
        }),
        ("Additional Info", {
            "fields": ("weight", "dimensions")
        }),
        ("Timestamps", {
            "fields": ("created_at", "updated_at"),
        }),
    )

    def profit_margin_display(self, obj):
        return f"{obj.profit_margin:.2f}%"
    profit_margin_display.short_description = "Profit Margin"


@admin.register(StockMovement)
class StockMovementAdmin(admin.ModelAdmin):
    list_display = (
        "product", "movement_type", "quantity", "reference", "user", "created_at"
    )
    list_filter = ("movement_type", "created_at")
    search_fields = ("product__name", "reference", "notes")
    ordering = ("-created_at",)
    autocomplete_fields = ("product", "user")
