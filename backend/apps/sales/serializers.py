from rest_framework import serializers
from decimal import Decimal
from .models import Sale, SaleItem
from apps.inventory.models import StockMovement
from apps.inventory.serializers import ProductListSerializer
from apps.customers.serializers import CustomerSerializer

class SaleItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(read_only=True)
    product_sku = serializers.CharField(read_only=True)
    
    class Meta:
        model = SaleItem
        fields = [
            'id', 'product', 'product_name', 'product_sku', 
            'quantity', 'unit_price', 'discount_percent', 
            'tax_rate', 'line_total'
        ]
        read_only_fields = ['line_total', 'product_name', 'product_sku']

class SaleSerializer(serializers.ModelSerializer):
    items = SaleItemSerializer(many=True, read_only=True)
    customer_details = CustomerSerializer(source='customer', read_only=True)
    salesperson_name = serializers.CharField(source='salesperson.get_full_name', read_only=True)
    balance_due = serializers.DecimalField(
        max_digits=12, 
        decimal_places=2, 
        read_only=True
    )
    
    class Meta:
        model = Sale
        fields = [
            'id', 'sale_number', 'customer_details',
            'sale_date', 'due_date', 'items', 'subtotal',
            'tax_amount', 'discount_amount', 'total_amount',
            'paid_amount', 'balance_due', 'payment_status',
            'payment_method', 'notes', 'salesperson', 
            'salesperson_name', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'sale_number', 'subtotal', 'tax_amount', 
            'discount_amount', 'total_amount', 'balance_due'
        ]

class CreateSaleSerializer(serializers.ModelSerializer):
    items = SaleItemSerializer(many=True)
    
    class Meta:
        model = Sale
        fields = ['customer', 'payment_method', 'notes', 'items', 'due_date']
    
    def create(self, validated_data):
        items_data = validated_data.pop('items')
        # Add current user as salesperson
        validated_data['salesperson'] = self.context['request'].user
        sale = Sale.objects.create(**validated_data)
        
        for item_data in items_data:
            product = item_data['product']
            quantity = item_data['quantity']
            
            # Check stock availability
            if product.stock_quantity < quantity:
                raise serializers.ValidationError(
                    f"Insufficient stock for {product.name}. Available: {product.stock_quantity}"
                )
            
            # Create sale item
            SaleItem.objects.create(
                sale=sale,
                **item_data
            )
            
            # Update product stock
            product.stock_quantity -= quantity
            product.save()
            
            # Create stock movement record
            StockMovement.objects.create(
                product=product,
                movement_type='sale',
                quantity=-quantity,
                reference=sale.sale_number,
                user=self.context['request'].user
            )
        
        # Sale model will handle calculations in save() method
        sale.save()
        return sale

    def validate_items(self, items):
        if not items:
            raise serializers.ValidationError("At least one item is required")
        return items