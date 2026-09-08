from rest_framework import serializers
from decimal import Decimal
from django.db import transaction
from .models import Sale, SaleItem
from apps.inventory.models import StockMovement
from apps.inventory.serializers import ProductListSerializer
from apps.customers.serializers import CustomerSerializer

class SaleItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(read_only=True)
    product_sku = serializers.CharField(read_only=True)
    id = serializers.UUIDField(required=False)  # Make id explicitly writable
    
    class Meta:
        model = SaleItem
        fields = [
            'id', 'product', 'product_name', 'product_sku', 
            'quantity', 'unit_price', 'discount_percent', 
            'tax_rate', 'line_total'
        ]
        read_only_fields = ['line_total', 'product_name', 'product_sku']
        extra_kwargs = {
            'id': {'read_only': False, 'required': False}
        }

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
    paid_amount = serializers.DecimalField(max_digits=12, decimal_places=2, required=False)
    
    class Meta:
        model = Sale
        fields = ['customer', 'payment_method', 'notes', 'items', 'due_date', 'paid_amount']
    
    @transaction.atomic
    def create(self, validated_data):
        items_data = validated_data.pop('items')
        paid_amount_input = validated_data.pop('paid_amount', None)
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
            SaleItem.objects.create(sale=sale, **item_data)
            
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
        
        sale.update_totals()
        if paid_amount_input is not None:
            sale.paid_amount = Decimal(str(paid_amount_input))
        elif sale.payment_method != 'credit':
            sale.paid_amount = sale.total_amount
        
        sale.update_payment_status()
        sale.save()
        return sale

    @transaction.atomic
    def update(self, instance, validated_data):
        """Handle sale updates with proper stock management"""
        # Prevent update if sale is cancelled or refunded
        if instance.payment_status in ['cancelled', 'refunded']:
            raise serializers.ValidationError(
                f"Cannot update a {instance.payment_status} sale"
            )
        
        items_data = validated_data.pop('items', None)
        
        # Update sale basic fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        if items_data is not None:
            self._update_sale_items(instance, items_data)
        
        instance.save()
        return instance
    
    def _update_sale_items(self, sale, items_data):
        """Update sale items with stock restoration and adjustment"""
        # Get existing item IDs from the request
        incoming_item_ids = {item.get('id') for item in items_data if item.get('id')}
        existing_items = {item.id: item for item in sale.items.all()}
        
        # Delete items not in the incoming data (restore their stock)
        for item_id, existing_item in existing_items.items():
            if item_id not in incoming_item_ids:
                # Restore stock for deleted item
                product = existing_item.product
                product.stock_quantity += existing_item.quantity
                product.save()
                
                # Create stock movement record
                StockMovement.objects.create(
                    product=product,
                    movement_type='sale_update',
                    quantity=existing_item.quantity,
                    reference=f"Update-{sale.sale_number}",
                    user=self.context['request'].user,
                    notes=f"Item removed from sale"
                )
                
                existing_item.delete()
        
        # Process incoming items
        for item_data in items_data:
            item_id = item_data.get('id')
            product = item_data['product']
            new_quantity = item_data['quantity']
            
            if item_id and item_id in existing_items:
                # Update existing item
                existing_item = existing_items[item_id]
                old_quantity = existing_item.quantity
                old_product = existing_item.product
                
                # Handle product change
                if old_product.id != product.id:
                    # Restore stock for old product
                    old_product.stock_quantity += old_quantity
                    old_product.save()
                    
                    StockMovement.objects.create(
                        product=old_product,
                        movement_type='sale_update',
                        quantity=old_quantity,
                        reference=f"Update-{sale.sale_number}",
                        user=self.context['request'].user,
                        notes="Product changed in sale"
                    )
                    
                    # Check stock for new product (only the new quantity needed)
                    if product.stock_quantity < new_quantity:
                        raise serializers.ValidationError(
                            f"Insufficient stock for {product.name}. Available: {product.stock_quantity}"
                        )
                    
                    # Deduct stock for new product
                    product.stock_quantity -= new_quantity
                    product.save()
                    
                    StockMovement.objects.create(
                        product=product,
                        movement_type='sale_update',
                        quantity=-new_quantity,
                        reference=f"Update-{sale.sale_number}",
                        user=self.context['request'].user,
                        notes="Product changed in sale"
                    )
                    
                elif new_quantity != old_quantity:
                    # Same product, but quantity changed
                    quantity_diff = new_quantity - old_quantity
                    
                    # Only check stock availability if quantity is INCREASING
                    if quantity_diff > 0:
                        if product.stock_quantity < quantity_diff:
                            raise serializers.ValidationError(
                                f"Insufficient stock for {product.name}. "
                                f"Available: {product.stock_quantity}, Need additional: {quantity_diff}"
                            )
                    
                    # Update stock by the difference (positive or negative)
                    product.stock_quantity -= quantity_diff
                    product.save()
                    
                    # Create stock movement
                    StockMovement.objects.create(
                        product=product,
                        movement_type='sale_update',
                        quantity=-quantity_diff,
                        reference=f"Update-{sale.sale_number}",
                        user=self.context['request'].user,
                        notes=f"Quantity changed from {old_quantity} to {new_quantity}"
                    )
                
                # Update item fields
                for attr, value in item_data.items():
                    if attr != 'id':
                        setattr(existing_item, attr, value)
                existing_item.save()
                
            else:
                # New item being added
                if product.stock_quantity < new_quantity:
                    raise serializers.ValidationError(
                        f"Insufficient stock for {product.name}. Available: {product.stock_quantity}"
                    )
                
                # Create new item
                SaleItem.objects.create(sale=sale, **item_data)
                
                # Update stock
                product.stock_quantity -= new_quantity
                product.save()
                
                # Create stock movement
                StockMovement.objects.create(
                    product=product,
                    movement_type='sale_update',
                    quantity=-new_quantity,
                    reference=f"Update-{sale.sale_number}",
                    user=self.context['request'].user,
                    notes="New item added to sale"
                )

    def validate_items(self, items):
        if not items:
            raise serializers.ValidationError("At least one item is required")
        
        # Check for duplicate products in the same sale
        product_ids = []
        seen_products = {}
        
        for idx, item in enumerate(items):
            product_id = item['product'].id
            
            if product_id in seen_products:
                raise serializers.ValidationError({
                    'items': f"Product '{item['product'].name}' appears multiple times in the sale. "
                    f"Please update the quantity of the existing item (item #{seen_products[product_id] + 1}) "
                    f"instead of adding it again."
                })
            
            seen_products[product_id] = idx
            product_ids.append(product_id)
        
        return items