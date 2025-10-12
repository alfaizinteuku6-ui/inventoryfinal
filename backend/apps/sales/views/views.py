from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from django.db.models import Sum, Count, F, Q, Avg, Case, When, DecimalField, IntegerField, FloatField, Value
from django.db.models.functions import TruncDay, Coalesce, Cast
from ..models import Sale, SaleItem
from ..serializers import SaleSerializer, CreateSaleSerializer
from datetime import timedelta, datetime
from decimal import Decimal
import logging
from config.pagination import StandardResultsSetPagination
from decimal import Decimal, ROUND_HALF_UP
from django.db import transaction

logger = logging.getLogger(__name__)

class SaleViewSet(viewsets.ModelViewSet):
    queryset = Sale.objects.filter(
        is_active=True, 
        payment_status__in=['pending', 'partial', 'paid', 'refunded']
    ).select_related('customer', 'salesperson').prefetch_related('items__product')
    
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter, filters.SearchFilter]
    filterset_fields = {
        'customer': ['exact'],
        'payment_status': ['exact', 'in'],
        'payment_method': ['exact'],
        'sale_date': ['date', 'date__gte', 'date__lte'],
        'total_amount': ['gte', 'lte'],
    }
    search_fields = ['sale_number', 'customer__name', 'notes']
    ordering_fields = ['sale_date', 'total_amount', 'created_at']
    ordering = ['-created_at']
    pagination_class = StandardResultsSetPagination

    def get_queryset(self):
        """Override to exclude cancelled sales by default, but include for retrieve"""
        base_queryset = Sale.objects.filter(is_active=True).select_related(
            'customer', 'salesperson'
        ).prefetch_related('items__product')

        # For list view, include cancelled only if explicitly requested
        if self.action == 'list':
            include_cancelled = self.request.query_params.get('include_cancelled') == 'true'
            return base_queryset if include_cancelled else base_queryset.exclude(payment_status='cancelled')

        # For retrieve or any other detail view, always include cancelled sales
        return base_queryset
    
    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return CreateSaleSerializer
        return SaleSerializer
    
    def perform_update(self, serializer):
        """Ensure user context is available for updates"""
        serializer.save()

    def perform_create(self, serializer):
        serializer.save(salesperson=self.request.user)
    
    def parse_date(self, date_str):
        """Parse date string to date object"""
        if not date_str:
            return None
        try:
            return datetime.strptime(date_str, '%Y-%m-%d').date()
        except ValueError:
            logger.warning(f"Invalid date format: {date_str}")
            return None

    def destroy(self, request, *args, **kwargs):
        """Soft delete and restore stock (calls cancel_sale first if needed)"""
        instance = self.get_object()

        # If sale is not already cancelled, cancel it first
        if instance.payment_status != 'cancelled':
            refund_flag = str(request.query_params.get('refund', 'false')).lower() == 'true'
            credit_flag = str(request.query_params.get('credit', 'false')).lower() == 'true'

            success, message = instance.cancel_sale(refund=refund_flag, credit=credit_flag)
            if not success:
                return Response({"error": message}, status=status.HTTP_400_BAD_REQUEST)

        # Then soft delete
        instance.is_active = False
        instance.save(update_fields=["is_active"])

        return Response({"detail": "Sale cancelled and soft-deleted successfully."}, status=status.HTTP_200_OK)
    
    @action(detail=True, methods=['post'])
    @transaction.atomic
    def add_payment(self, request, pk=None):
        """Add payment to sale"""
        sale = self.get_object()
        
        # Prevent payment to cancelled or refunded sales
        if sale.payment_status in ['cancelled', 'refunded']:
            return Response(
                {'error': f'Cannot add payment to a {sale.payment_status} sale'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        amount = request.data.get('amount')
        payment_method = request.data.get('payment_method')

        if not amount:
            return Response(
                {'error': 'Amount is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            amount = Decimal(str(amount)).quantize(
                Decimal('0.01'), rounding=ROUND_HALF_UP
            )
            if amount <= 0:
                raise ValueError("Amount must be positive")
        except (ValueError, Exception) as e:
            return Response(
                {'error': f'Invalid amount: {str(e)}'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        # Calculate current balance due
        balance_due = sale.balance_due
        
        if amount > balance_due:
            return Response(
                {
                    'error': 'Amount exceeds balance due',
                    'balance_due': str(balance_due),
                    'requested_amount': str(amount)
                }, 
                status=status.HTTP_400_BAD_REQUEST
            )

        # Update paid amount
        sale.paid_amount = (
            Decimal(str(sale.paid_amount)) + amount
        ).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
        
        # Update payment method if provided
        if payment_method:
            sale.payment_method = payment_method
        
        # Save will automatically update payment_status via update_payment_status()
        sale.save()
        
        # Optional: Create payment transaction record
        try:
            from apps.payments.models import Payment
            Payment.objects.create(
                sale=sale,
                amount=amount,
                payment_method=payment_method or sale.payment_method,
                user=request.user
            )
        except ImportError:
            pass  # Payment model doesn't exist yet
        
        # Return updated sale data
        serializer = self.get_serializer(sale)
        return Response({
            'message': 'Payment added successfully',
            'payment_amount': str(amount),
            'total_paid': str(sale.paid_amount),
            'balance_due': str(sale.balance_due),
            'payment_status': sale.payment_status,
            'sale': serializer.data
        }, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'])
    def cancel_sale(self, request, pk=None):
        """
        Cancel a sale and restore stock.
        For partially paid sales you must pass either ?refund=true or ?credit=true.
        """
        sale = self.get_object()

        # Check flags from query params
        refund_flag = str(request.query_params.get('refund', 'false')).lower() == 'true'
        credit_flag = str(request.query_params.get('credit', 'false')).lower() == 'true'
        
        success, message = sale.cancel_sale(refund=refund_flag, credit=credit_flag)
    
        if not success:
            return Response({'error': message}, status=status.HTTP_400_BAD_REQUEST)

        return Response({
            'message': message,
            'sale': self.get_serializer(sale).data
        })