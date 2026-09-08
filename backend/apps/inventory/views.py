from django.db import transaction
from decimal import Decimal
from rest_framework import viewsets, filters, status
from django.db.models import Sum, Count, F, Q, DecimalField, Value
from django.db.models.functions import Coalesce, Cast
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import Category, Product, StockMovement, ProductImage, Supplier
from .serializers import (
    CategorySerializer, ProductSerializer, ProductListSerializer, 
    StockMovementSerializer, ProductImageSerializer, SupplierSerializer
)
from rest_framework.filters import OrderingFilter
from django_filters import rest_framework as fieldfilters
from django_filters.rest_framework import DjangoFilterBackend
from config.pagination import StandardResultsSetPagination
from rest_framework.permissions import IsAuthenticated

class CategoryViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = Category.objects.filter(is_active=True)
    serializer_class = CategorySerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'description']
    pagination_class = StandardResultsSetPagination

    def perform_destroy(self, instance):
        """Soft delete instead of hard delete"""
        instance.is_active = False
        instance.save()

class SupplierViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = SupplierSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, OrderingFilter]
    filterset_fields = ['payment_terms', 'city', 'is_active']
    search_fields = ['name', 'contact_person', 'phone', 'email', 'address', 'city']
    ordering_fields = ['name', 'created_at']
    ordering = ['name']
    pagination_class = StandardResultsSetPagination

    def get_queryset(self):
        return (
            Supplier.objects.filter(is_active=True)
            .annotate(
                deliveries_count=Count('stock_movements', distinct=True),
                products_count=Count('products', distinct=True)
            )
            .order_by(*self.ordering)
        )

    def perform_destroy(self, instance):
        """Soft delete instead of hard delete"""
        instance.is_active = False
        instance.save()

class ProductViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
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
    start_date = fieldfilters.DateTimeFilter(field_name='created_at', lookup_expr='gte')
    end_date = fieldfilters.DateTimeFilter(field_name='created_at', lookup_expr='lte')
    product = fieldfilters.UUIDFilter(field_name='product__id')

    class Meta:
        model = StockMovement
        fields = ['product', 'movement_type']

class StockMovementViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = StockMovement.objects.select_related('product', 'user')
    serializer_class = StockMovementSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, OrderingFilter]
    filterset_class = StockMovementFilter
    search_fields = ['product__name', 'product__sku', 'reference', 'notes', 'user__email', 'user__first_name', 'user__last_name']
    ordering_fields = ['created_at', 'quantity']
    ordering = ['-created_at']
    pagination_class = StandardResultsSetPagination

    @action(detail=False, methods=['post'], url_path='stock-in')
    @transaction.atomic
    def stock_in(self, request):
        """
        Record incoming stock from a supplier (Penerimaan Barang / Stock In).
        Payload:
        {
            "vendor": "uuid" (optional),
            "reference": "SJ-2026/09/001",
            "notes": "Kiriman rutin",
            "items": [
                {
                    "product": "uuid",
                    "quantity": 20,
                    "cost_price": 15000 (optional)
                }
            ]
        }
        """
        data = request.data
        items = data.get('items', [])
        reference = data.get('reference', '').strip() or f"IN-{request.user.id}"
        notes = data.get('notes', '').strip()
        supplier_id = data.get('supplier') or data.get('vendor')

        if not items or not isinstance(items, list):
            return Response({'error': 'Daftar barang (items) harus disertakan minimal 1 produk'},
                            status=status.HTTP_400_BAD_REQUEST)

        created_movements = []
        supplier_name = ""
        supplier_obj = None
        if supplier_id:
            try:
                supplier_obj = Supplier.objects.filter(id=supplier_id).first()
                if supplier_obj:
                    supplier_name = f"Supplier: {supplier_obj.name}. "
                else:
                    from apps.vendors.models import Vendor
                    v = Vendor.objects.filter(id=supplier_id).first()
                    if v:
                        supplier_name = f"Supplier: {v.name}. "
            except Exception:
                pass

        full_notes = f"{supplier_name}{notes}".strip()

        for idx, item in enumerate(items):
            product_id = item.get('product')
            quantity = int(item.get('quantity', 0))
            cost_price = item.get('cost_price')

            if not product_id or quantity <= 0:
                return Response({'error': f'Item ke-{idx + 1} tidak valid (kuantitas harus lebih besar dari 0)'},
                                status=status.HTTP_400_BAD_REQUEST)

            try:
                product = Product.objects.select_for_update().get(id=product_id)
            except Product.DoesNotExist:
                return Response({'error': f'Produk dengan ID {product_id} tidak ditemukan'},
                                status=status.HTTP_404_NOT_FOUND)

            # Update product stock
            product.stock_quantity += quantity

            # Update cost price if provided and valid
            if cost_price is not None and str(cost_price).strip() != '':
                try:
                    cp_val = Decimal(str(cost_price))
                    if cp_val > 0:
                        product.cost_price = cp_val
                except Exception:
                    pass

            if supplier_obj and not product.supplier:
                product.supplier = supplier_obj
                product.save(update_fields=['stock_quantity', 'cost_price', 'supplier', 'updated_at'])
            else:
                product.save(update_fields=['stock_quantity', 'cost_price', 'updated_at'])

            # Record stock movement
            mv = StockMovement.objects.create(
                product=product,
                supplier=supplier_obj,
                movement_type='in',
                quantity=quantity,
                reference=reference,
                notes=full_notes,
                user=request.user
            )
            created_movements.append(mv.id)

        return Response({
            'message': f'Berhasil menerima stok untuk {len(items)} produk.',
            'reference': reference,
            'movements_count': len(created_movements)
        }, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['post'], url_path='adjust')
    @transaction.atomic
    def adjust_stock(self, request):
        """
        Adjust stock for damaged, expired, lost, sample, or correction reasons.
        Payload:
        {
            "product": "uuid",
            "adjustment_type": "decrease" | "increase",
            "reason": "damaged" | "expired" | "lost" | "sample" | "internal_use" | "correction",
            "quantity": 2,
            "notes": "Pecah saat bongkar rak"
        }
        """
        data = request.data
        product_id = data.get('product')
        adjustment_type = data.get('adjustment_type', 'decrease')
        reason = data.get('reason', 'correction')
        notes = data.get('notes', '').strip()

        try:
            quantity = int(data.get('quantity', 0))
        except (ValueError, TypeError):
            return Response({'error': 'Jumlah kuantitas tidak valid'},
                            status=status.HTTP_400_BAD_REQUEST)

        if not product_id:
            return Response({'error': 'ID Produk wajib diisi'}, status=status.HTTP_400_BAD_REQUEST)

        if quantity <= 0:
            return Response({'error': 'Kuantitas penyesuaian harus lebih dari 0'},
                            status=status.HTTP_400_BAD_REQUEST)

        try:
            product = Product.objects.select_for_update().get(id=product_id)
        except Product.DoesNotExist:
            return Response({'error': 'Produk tidak ditemukan'}, status=status.HTTP_404_NOT_FOUND)

        reason_labels = {
            'damaged': 'Barang Rusak / Pecah',
            'expired': 'Kadaluwarsa (Expired)',
            'lost': 'Barang Hilang / Selisih Rak',
            'sample': 'Sampel / Tester Promosi',
            'internal_use': 'Pemakaian Toko / Operasional',
            'correction': 'Koreksi Stok / Salah Hitung'
        }
        reason_text = reason_labels.get(reason, reason.capitalize())

        if adjustment_type == 'decrease':
            if product.stock_quantity < quantity:
                return Response(
                    {'error': f'Stok saat ini ({product.stock_quantity}) tidak cukup untuk dikurangi {quantity} unit.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            product.stock_quantity -= quantity
            signed_qty = -quantity
        else:
            product.stock_quantity += quantity
            signed_qty = quantity

        product.save(update_fields=['stock_quantity', 'updated_at'])

        adj_notes = f"[{reason_text}] {notes}".strip() if notes else f"[{reason_text}]"

        movement = StockMovement.objects.create(
            product=product,
            movement_type='adjustment',
            quantity=signed_qty,
            reference=f"ADJ-{reason.upper()}",
            notes=adj_notes,
            user=request.user
        )

        return Response({
            'message': f'Penyesuaian stok {product.name} berhasil ({"+" if signed_qty > 0 else ""}{signed_qty}).',
            'product_id': str(product.id),
            'new_stock_quantity': product.stock_quantity,
            'movement_id': str(movement.id)
        }, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'], url_path='summary')
    def summary(self, request):
        """Get summary statistics for stock movements."""
        qs = self.get_queryset()
        total_in = qs.filter(movement_type='in').aggregate(total=Sum('quantity'))['total'] or 0
        total_out = qs.filter(movement_type__in=['out', 'sale']).aggregate(total=Sum('quantity'))['total'] or 0
        total_adjustments = qs.filter(movement_type='adjustment').count()

        return Response({
            'total_in': total_in,
            'total_out': abs(total_out),
            'total_adjustments': total_adjustments,
            'total_movements': qs.count()
        })