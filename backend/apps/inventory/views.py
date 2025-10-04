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

    def list(self, request, *args, **kwargs):
        """Enhanced list method with dashboard statistics"""
        # Get the filtered queryset (respects filters, search, etc.)
        queryset = self.filter_queryset(self.get_queryset())
        
        # Paginate the products
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            paginated_response = self.get_paginated_response(serializer.data)
            
            # Add dashboard statistics to paginated response
            paginated_response.data['dashboard_stats'] = self._get_dashboard_stats()
            return paginated_response

        # If no pagination, return all products with stats
        serializer = self.get_serializer(queryset, many=True)
        return Response({
            'results': serializer.data,
            'dashboard_stats': self._get_dashboard_stats()
        })

    def _get_dashboard_stats(self):
        """Calculate dashboard statistics"""
        base_queryset = Product.objects.filter(is_active=True)
        
        # Calculate metrics using aggregation for better performance
        stats = base_queryset.aggregate(
            total_products=Count('id'),
            total_inventory_value=Coalesce(
                Sum(
                    Cast(F('stock_quantity'), DecimalField(max_digits=10, decimal_places=2)) * F('cost_price'),
                    output_field=DecimalField(max_digits=15, decimal_places=2)
                ),
                Value(0, output_field=DecimalField(max_digits=15, decimal_places=2)),
                output_field=DecimalField(max_digits=15, decimal_places=2)
            ),
            low_stock_count=Count('id', filter=Q(stock_quantity__lte=F('min_stock_level'))),
            out_of_stock_count=Count('id', filter=Q(stock_quantity=0))
        )
        
        return {
            'total_products': stats['total_products'],
            'total_inventory_value': float(stats['total_inventory_value']),
            'low_stock_alert': stats['low_stock_count'],
            'out_of_stock': stats['out_of_stock_count']
        }

    @action(detail=False, methods=['get'])
    def dashboard_stats(self, request):
        """Get only dashboard statistics without products"""
        return Response(self._get_dashboard_stats())

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