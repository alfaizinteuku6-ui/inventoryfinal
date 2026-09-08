from rest_framework import serializers
from .models import Category, Product, StockMovement, ProductImage, Supplier

class SupplierSerializer(serializers.ModelSerializer):
    deliveries_count = serializers.IntegerField(read_only=True, default=0)
    products_count = serializers.IntegerField(read_only=True, default=0)

    class Meta:
        model = Supplier
        fields = [
            'id', 'name', 'contact_person', 'phone', 'email', 'address', 'city',
            'payment_terms', 'bank_account', 'notes', 'is_active',
            'deliveries_count', 'products_count', 'created_at', 'updated_at'
        ]

class CategorySerializer(serializers.ModelSerializer):
    children = serializers.SerializerMethodField()
    
    class Meta:
        model = Category
        fields = '__all__'
    
    def get_children(self, obj):
        if obj.category_set.exists():
            return CategorySerializer(obj.category_set.all(), many=True).data
        return []
    
class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = '__all__'

class ProductSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    supplier_name = serializers.CharField(source='supplier.name', read_only=True, allow_null=True)
    is_low_stock = serializers.ReadOnlyField()
    profit_margin = serializers.ReadOnlyField()
    
    # Add support for multiple images
    images = ProductImageSerializer(many=True, read_only=True)
    new_images = serializers.ListField(
        child=serializers.ImageField(),
        write_only=True,
        required=False,
        help_text="List of images to upload for this product"
    )

    def validate(self, data):
        min_level = data.get('min_stock_level', getattr(self.instance, 'min_stock_level', None))
        max_level = data.get('max_stock_level', getattr(self.instance, 'max_stock_level', None))

        if min_level is not None and max_level is not None and min_level >= max_level:
            raise serializers.ValidationError({
                "min_stock_level": "Minimum stock level must be less than maximum stock level."
            })
        return data

    def create(self, validated_data):
        # Extract images separately before creating the product
        new_images = validated_data.pop('new_images', [])
        validated_data['is_active'] = True
        product = super().create(validated_data)

        # Create ProductImage entries
        for image in new_images:
            ProductImage.objects.create(product=product, image=image)

        return product

    def update(self, instance, validated_data):
        # Handle new images upload
        new_images = validated_data.pop('new_images', [])
        instance = super().update(instance, validated_data)

        for image in new_images:
            ProductImage.objects.create(product=instance, image=image)

        return instance

    class Meta:
        model = Product
        fields = '__all__'  # includes images, category_name, etc.
        extra_fields = ['images', 'new_images']  # DRF ignores but helps readability


class ProductListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for product lists."""
    category_name = serializers.CharField(source='category.name', read_only=True)
    is_low_stock = serializers.ReadOnlyField()
    images = ProductImageSerializer(many=True, read_only=True)

    def get_thumbnail(self, obj):
        first_image = obj.images.first()
        return first_image.image.url if first_image and first_image.image else None

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'sku', 'selling_price', 'stock_quantity',
            'category_name', 'is_low_stock', 'images',
            'cost_price', 'min_stock_level', 'max_stock_level'
        ]
        
class StockMovementSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_sku = serializers.CharField(source='product.sku', read_only=True)
    supplier_name = serializers.CharField(source='supplier.name', read_only=True, allow_null=True)
    user_name = serializers.SerializerMethodField()

    def get_user_name(self, obj):
        if obj.user:
            return obj.user.get_full_name() or obj.user.email or obj.user.username
        return 'Sistem'

    class Meta:
        model = StockMovement
        fields = [
            'id', 'product', 'product_name', 'product_sku', 'supplier', 'supplier_name',
            'movement_type', 'quantity', 'reference', 'notes', 'user', 'user_name', 'created_at'
        ]

