# backend/apps/inventory/serializers.py
from rest_framework import serializers
from .models import Category, Product, StockMovement

class CategorySerializer(serializers.ModelSerializer):
    children = serializers.SerializerMethodField()
    
    class Meta:
        model = Category
        fields = '__all__'
    
    def get_children(self, obj):
        if obj.category_set.exists():
            return CategorySerializer(obj.category_set.all(), many=True).data
        return []

class ProductSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    is_low_stock = serializers.ReadOnlyField()
    profit_margin = serializers.ReadOnlyField()
    
    class Meta:
        model = Product
        fields = '__all__'

class ProductListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for product lists"""
    category_name = serializers.CharField(source='category.name', read_only=True)
    is_low_stock = serializers.ReadOnlyField()
    image = serializers.ImageField(read_only=True)

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'sku', 'selling_price', 'stock_quantity',
            'category_name', 'is_low_stock', 'image'
        ]

class StockMovementSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    
    class Meta:
        model = StockMovement
        fields = '__all__'

