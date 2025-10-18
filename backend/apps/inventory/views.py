# backend/apps/inventory/views.py
from rest_framework import viewsets, filters, status
from django.db.models import Sum, Count, F, Q, DecimalField, Value
from django.db.models.functions import Coalesce, Cast
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import Category, Product, StockMovement, ProductImage
from .serializers import (
    CategorySerializer, ProductSerializer, ProductListSerializer, 
    StockMovementSerializer, ProductImageSerializer
)
from rest_framework.filters import OrderingFilter
from django_filters import rest_framework as fieldfilters
from django_filters.rest_framework import DjangoFilterBackend
from config.pagination import StandardResultsSetPagination

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.filter(is_active=True)
    serializer_class = CategorySerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'description']
    pagination_class = StandardResultsSetPagination

    def perform_destroy(self, instance):
        """Soft delete instead of hard delete"""
        instance.is_active = False
        instance.save()

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.select_related('category').filter(is_active=True)
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category']
    search_fields = ['name', 'description', 'sku', 'barcode']
    ordering_fields = ['name', 'created_at', 'selling_price', 'stock_quantity']
    ordering = ['-created_at']
    pagination_class = StandardResultsSetPagination

    def get_serializer_class(self):
        if self.action == 'list':
            return ProductListSerializer
        return ProductSerializer

    def create(self, request, *args, **kwargs):
        """Override create to handle multiple images on product creation."""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        product = serializer.save()
        
        # Handle multiple images
        images = request.FILES.getlist('images')
        if images:
            for image in images:
                ProductImage.objects.create(product=product, image=image)
        
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def update(self, request, *args, **kwargs):
        """Override update to handle multiple images on product update."""
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        # Handle multiple images
        images = request.FILES.getlist('images')
        if images:
            for image in images:
                ProductImage.objects.create(product=instance, image=image)

        if getattr(instance, '_prefetched_objects_cache', None):
            instance._prefetched_objects_cache = {}

        return Response(serializer.data)

    def perform_destroy(self, instance):
        """Soft delete instead of hard delete."""
        instance.is_active = False
        instance.save()

    @action(detail=False, methods=['get'])
    def low_stock(self, request):
        """Get products with low stock."""
        low_stock_products = self.get_queryset().filter(
            stock_quantity__lte=F('min_stock_level')
        )
        serializer = ProductListSerializer(low_stock_products, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def out_of_stock(self, request):
        """Get products that are out of stock."""
        out_of_stock_products = self.get_queryset().filter(stock_quantity=0)
        serializer = ProductListSerializer(out_of_stock_products, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def search_by_barcode(self, request):
        """Search product by barcode."""
        barcode = request.query_params.get('barcode')
        if not barcode:
            return Response({'error': 'Barcode parameter required'},
                            status=status.HTTP_400_BAD_REQUEST)
        try:
            product = self.get_queryset().get(barcode=barcode)
            serializer = ProductSerializer(product)
            return Response(serializer.data)
        except Product.DoesNotExist:
            return Response({'error': 'Product not found'},
                            status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=['get'])
    def images(self, request, pk=None):
        """Get all images for a specific product."""
        product = self.get_object()
        images = product.images.all()
        serializer = ProductImageSerializer(images, many=True, context={'request': request})
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def upload_images(self, request, pk=None):
        """
        Upload one or more images for the product.
        Example:
        POST /api/products/{id}/upload_images/
        Body: { images: [file1, file2, file3] }
        """
        product = self.get_object()
        images = request.FILES.getlist('images')

        if not images:
            return Response({'error': 'No images provided.'}, status=status.HTTP_400_BAD_REQUEST)

        uploaded = []
        for image in images:
            img_obj = ProductImage.objects.create(product=product, image=image)
            uploaded.append(ProductImageSerializer(img_obj, context={'request': request}).data)

        return Response(
            {'message': f'{len(uploaded)} image(s) uploaded successfully.', 'images': uploaded},
            status=status.HTTP_201_CREATED
        )

    @action(detail=True, methods=['delete'], url_path='images/(?P<image_id>[^/.]+)')
    def delete_image(self, request, pk=None, image_id=None):
        """
        Delete a specific image from a product.
        Example:
        DELETE /api/products/{id}/images/{image_id}/
        """
        product = self.get_object()
        try:
            image = product.images.get(id=image_id)
            image.delete()
            return Response({'message': 'Image deleted successfully.'}, status=status.HTTP_204_NO_CONTENT)
        except ProductImage.DoesNotExist:
            return Response({'error': 'Image not found for this product.'},
                            status=status.HTTP_404_NOT_FOUND)
        

class StockMovementFilter(fieldfilters.FilterSet):
    class Meta:
        model = StockMovement
        fields = ['product', 'movement_type']

# Then in views.py:
class StockMovementViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = StockMovement.objects.select_related('product', 'user')
    serializer_class = StockMovementSerializer
    filter_backends = [DjangoFilterBackend, OrderingFilter]  # mix of django-filter + DRF ordering
    filterset_class = StockMovementFilter
    ordering = ['-created_at']
    pagination_class = StandardResultsSetPagination