# backend/apps/inventory/views.py
from rest_framework import viewsets, filters, status
from django.db.models import Sum, Count, F, Q, DecimalField, Value
from django.db.models.functions import Coalesce, Cast
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import Category, Product, StockMovement
from .serializers import (
    CategorySerializer, ProductSerializer, ProductListSerializer, 
    StockMovementSerializer
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
    
    def perform_destroy(self, instance):
        """Soft delete instead of hard delete"""
        instance.is_active = False
        instance.save()

    @action(detail=False, methods=['get'])
    def low_stock(self, request):
        """Get products with low stock"""
        low_stock_products = self.get_queryset().filter(
            stock_quantity__lte=F('min_stock_level')
        )
        serializer = ProductListSerializer(low_stock_products, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def out_of_stock(self, request):
        """Get products that are out of stock"""
        out_of_stock_products = self.get_queryset().filter(stock_quantity=0)
        serializer = ProductListSerializer(out_of_stock_products, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def search_by_barcode(self, request):
        """Search product by barcode"""
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