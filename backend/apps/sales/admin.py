from django.contrib import admin
from .models import Sale, SaleItem


class SaleItemInline(admin.TabularInline):
    model = SaleItem
    extra = 1
    fields = (
        "product", "product_name", "product_sku",
        "quantity", "unit_price", "discount_percent", "tax_rate", "line_total"
    )
    readonly_fields = ("line_total",)
    autocomplete_fields = ("product",)


@admin.register(Sale)
class SaleAdmin(admin.ModelAdmin):
    list_display = (
        "sale_number", "customer", "sale_date", "due_date", "is_active",
        "subtotal", "discount_amount", "tax_amount", "total_amount",
        "paid_amount", "balance_due", "payment_status", "payment_method",
        "salesperson", "refunded_amount"
    )
    list_filter = ("payment_status", "payment_method", "sale_date")
    search_fields = ("sale_number", "customer__name", "salesperson__username")
    ordering = ("-sale_date",)

    fieldsets = (
        (None, {
            "fields": ("sale_number", "customer", "salesperson", "sale_date", "due_date")
        }),
        ("Amounts", {
            "fields": ("subtotal", "discount_amount", "tax_amount", "total_amount", "paid_amount", "balance_due")
        }),
        ("Payment", {
            "fields": ("payment_status", "payment_method")
        }),
        ("Other", {
            "fields": ("notes",)
        }),
        ("Timestamps", {
            "fields": ("created_at", "updated_at"),
        }),
    )

    readonly_fields = (
        "sale_number", "sale_date",  # 👈 add sale_date here
        "subtotal", "discount_amount", "tax_amount",
        "total_amount", "balance_due",
        "created_at", "updated_at"
    )

    inlines = [SaleItemInline]

