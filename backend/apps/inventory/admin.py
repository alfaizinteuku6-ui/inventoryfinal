from django.contrib import admin
from .models import Category, Product, StockMovement, ProductImage
from django.utils.html import format_html

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "parent", "created_at", "updated_at", 'is_active')
    search_fields = ("name",)
    ordering = ("name",)

class LowStockFilter(admin.SimpleListFilter):
    """Custom filter to show only low-stock or sufficient-stock products."""
    title = "Stock Level"
    parameter_name = "stock_level"

    def lookups(self, request, model_admin):
        return [
            ("low", "Low Stock"),
            ("ok", "Sufficient Stock"),
        ]

    def queryset(self, request, queryset):
        if self.value() == "low":
            return queryset.filter(stock_quantity__lte=models.F("min_stock_level"))
        elif self.value() == "ok":
            return queryset.filter(stock_quantity__gt=models.F("min_stock_level"))
        return queryset


class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1
    readonly_fields = ["image_preview"]

    def image_preview(self, obj):
        if obj.image:
            return format_html(
                '<img src="{}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 5px;" />',
                obj.image.url,
            )
        return "No Image"

    image_preview.short_description = "Preview"


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "sku",
        "category",
        "cost_price",
        "selling_price",
        "stock_quantity",
        "min_stock_level",
        "max_stock_level",
        "is_low_stock",
        "profit_margin_display",
    )
    list_filter = ("category", LowStockFilter)
    search_fields = ("name", "sku", "barcode", "category__name")
    ordering = ("name",)
    inlines = [ProductImageInline]

    fieldsets = (
        ("Basic Info", {
            "fields": ("name", "description", "category", "sku", "barcode")
        }),
        ("Pricing", {
            "fields": ("cost_price", "selling_price", "tax_rate")
        }),
        ("Inventory", {
            "fields": ("stock_quantity", "min_stock_level", "max_stock_level")
        }),
        ("Additional Details", {
            "fields": ("weight", "dimensions")
        }),
    )

    readonly_fields = ("sku", "barcode")

    def profit_margin_display(self, obj):
        return f"{obj.profit_margin:.2f}%"
    profit_margin_display.short_description = "Profit Margin"

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        return qs.select_related("category")


@admin.register(ProductImage)
class ProductImageAdmin(admin.ModelAdmin):
    list_display = ("product", "image_preview")
    readonly_fields = ["image_preview"]
    search_fields = ("product__name",)

    def image_preview(self, obj):
        if obj.image:
            return format_html(
                '<img src="{}" style="width: 100px; height: 100px; object-fit: cover; border-radius: 5px;" />',
                obj.image.url,
            )
        return "No Image"

    image_preview.short_description = "Preview"


@admin.register(StockMovement)
class StockMovementAdmin(admin.ModelAdmin):
    list_display = (
        "product", "movement_type", "quantity", "reference", "user", "created_at"
    )
    list_filter = ("movement_type", "created_at")
    search_fields = ("product__name", "reference", "notes")
    ordering = ("-created_at",)
    autocomplete_fields = ("product", "user")
