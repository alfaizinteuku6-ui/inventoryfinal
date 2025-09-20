from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from django.db.models import Sum, Count, F, Q, Avg
from django.db.models.functions import TruncDay
from .models import Sale, SaleItem
from .serializers import SaleSerializer, CreateSaleSerializer
from datetime import timedelta, datetime
from calendar import monthrange
from decimal import Decimal
import logging

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

    def get_queryset(self):
        """
        Override to exclude cancelled sales by default,
        but always include cancelled for retrieve (by id).
        """
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
        if self.action == 'create':
            return CreateSaleSerializer
        return SaleSerializer

    def perform_create(self, serializer):
        serializer.save(salesperson=self.request.user)

    def list(self, request, *args, **kwargs):
        """Override list to include summary statistics and exclude cancelled sales from calculations"""
        queryset = self.filter_queryset(self.get_queryset())

        # For summary stats, always exclude cancelled sales regardless of include_cancelled parameter
        summary_queryset = queryset.exclude(payment_status='cancelled') if hasattr(queryset.model, 'payment_status') else queryset

        # Get summary statistics for the filtered queryset (excluding cancelled)
        summary_stats = summary_queryset.aggregate(
            total_sales_count=Count('id'),
            total_revenue=Sum('total_amount'),
            total_paid_amount=Sum('paid_amount'),
        )

        total_revenue = summary_stats['total_revenue'] or 0
        total_paid = summary_stats['total_paid_amount'] or 0

        summary = {
            'total_sales': summary_stats['total_sales_count'] or 0,
            'total_revenue': total_revenue,
            'paid_amount': total_paid,
            'pending_payments': total_revenue - total_paid
        }

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            response = self.get_paginated_response(serializer.data)
            response.data['summary'] = summary
            return response

        serializer = self.get_serializer(queryset, many=True)
        return Response({
            'results': serializer.data,
            'summary': summary
        })

    def parse_date(self, date_str):
        """Parse date string to date object"""
        if not date_str:
            return None
        try:
            return datetime.strptime(date_str, '%Y-%m-%d').date()
        except ValueError:
            logger.warning(f"Invalid date format: {date_str}")
            return None

    def calculate_percentage_change(self, current, previous):
        """Calculate percentage change between current and previous values"""
        if previous in (None, 0):
            return None if not current else 100.0
        if current is None:
            current = 0
        return round(((current - previous) / previous) * 100, 2)

    def destroy(self, request, *args, **kwargs):
        """Soft delete and restore stock (calls cancel_sale first if needed)"""
        instance = self.get_object()

        # If sale is not already cancelled, cancel it first
        if instance.payment_status != 'cancelled':
            # allow optional refund/credit flags here as well
            refund_flag = str(request.query_params.get('refund', 'false')).lower() == 'true'
            credit_flag = str(request.query_params.get('credit', 'false')).lower() == 'true'

            success, message = instance.cancel_sale(refund=refund_flag, credit=credit_flag)
            if not success:
                return Response({"error": message}, status=status.HTTP_400_BAD_REQUEST)

        # Then soft delete
        instance.is_active = False
        instance.save(update_fields=["is_active"])

        return Response({"detail": "Sale cancelled and soft-deleted successfully."}, status=status.HTTP_200_OK)

    def get_period_stats(self, queryset):
        """Get comprehensive stats for a queryset excluding cancelled sales"""
        # Ensure cancelled sales are excluded
        queryset = queryset.exclude(payment_status='cancelled')
        
        stats = queryset.aggregate(
            total_amount=Sum('total_amount'),
            count=Count('id'),
            total_items=Sum('items__quantity')
        )

        total = stats['total_amount'] or 0
        count = stats['count'] or 0
        items_count = stats['total_items'] or 0
        avg_sale = (total / count) if count else 0

        return {
            'total_revenue': float(total),
            'sales_count': count,
            'items_sold': items_count,
            'average_sale': float(avg_sale),
            'average_items_per_sale': round(items_count / count, 2) if count else 0
        }

    def get_comparison_period_dates(self, start_date, end_date):
        """Calculate comparison period dates based on the selected period length"""
        period_length = (end_date - start_date).days + 1
        comparison_end = start_date - timedelta(days=1)
        comparison_start = comparison_end - timedelta(days=period_length - 1)
        return comparison_start, comparison_end

    @action(detail=False, methods=['get'])
    def dashboard(self, request):
        """Get enhanced sales dashboard data excluding cancelled sales"""
        # Get date parameters from request
        start_date_str = request.query_params.get('start_date')
        end_date_str = request.query_params.get('end_date')
        
        # Parse dates or use defaults
        if start_date_str and end_date_str:
            start_date = self.parse_date(start_date_str)
            end_date = self.parse_date(end_date_str)
        else:
            # Default to last 30 days if no dates provided
            end_date = timezone.now().date()
            start_date = end_date - timedelta(days=30)
        
        if not start_date or not end_date:
            return Response(
                {'error': 'Invalid date format. Use YYYY-MM-DD'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        # Get today's date for today's metrics
        today = timezone.now().date()
        yesterday = today - timedelta(days=1)

        # Base queryset with optimized joins - EXCLUDE cancelled and inactive sales
        base_queryset = Sale.objects.filter(
            is_active=True
        ).exclude(
            payment_status='cancelled'
        ).select_related('customer').prefetch_related('items__product')

        # Today's stats (always show current day stats)
        today_sales = base_queryset.filter(sale_date__date=today)
        today_stats = self.get_period_stats(today_sales)

        # Yesterday's stats for comparison
        yesterday_sales = base_queryset.filter(sale_date__date=yesterday)
        yesterday_stats = self.get_period_stats(yesterday_sales)

        # Selected period stats
        period_sales = base_queryset.filter(
            sale_date__date__gte=start_date,
            sale_date__date__lte=end_date
        )
        period_stats = self.get_period_stats(period_sales)

        # Comparison period stats (same length as selected period, immediately before)
        comparison_start, comparison_end = self.get_comparison_period_dates(start_date, end_date)
        comparison_sales = base_queryset.filter(
            sale_date__date__gte=comparison_start,
            sale_date__date__lte=comparison_end
        )
        comparison_stats = self.get_period_stats(comparison_sales)

        # Calculate changes
        today_comparisons = {
            'revenue_change': self.calculate_percentage_change(today_stats['total_revenue'], yesterday_stats['total_revenue']),
            'sales_count_change': self.calculate_percentage_change(today_stats['sales_count'], yesterday_stats['sales_count']),
            'items_sold_change': self.calculate_percentage_change(today_stats['items_sold'], yesterday_stats['items_sold']),
            'avg_sale_change': self.calculate_percentage_change(today_stats['average_sale'], yesterday_stats['average_sale'])
        }

        period_comparisons = {
            'revenue_change': self.calculate_percentage_change(period_stats['total_revenue'], comparison_stats['total_revenue']),
            'sales_count_change': self.calculate_percentage_change(period_stats['sales_count'], comparison_stats['sales_count']),
            'items_sold_change': self.calculate_percentage_change(period_stats['items_sold'], comparison_stats['items_sold']),
            'avg_sale_change': self.calculate_percentage_change(period_stats['average_sale'], comparison_stats['average_sale'])
        }

        # Payment breakdown for selected period
        payment_breakdown = list(period_sales.values('payment_method').annotate(
            count=Count('id'),
            total=Sum('total_amount')
        ).order_by('-total'))

        # Top customers for selected period
        top_customers = list(period_sales.values('customer__name').annotate(
            total_purchases=Sum('total_amount'),
            order_count=Count('id'),
            items_purchased=Sum('items__quantity')
        ).filter(customer__name__isnull=False).order_by('-total_purchases')[:5])

        # Daily sales trend for selected period
        daily_sales = list(period_sales.annotate(
            day=TruncDay('sale_date')
        ).values('day').annotate(
            daily_revenue=Sum('total_amount'),
            daily_count=Count('id'),
            daily_items=Sum('items__quantity')
        ).order_by('day'))

        # Convert daily_revenue to float for JSON serialization
        for day_data in daily_sales:
            if day_data['daily_revenue']:
                day_data['daily_revenue'] = float(day_data['daily_revenue'])

        # Best selling items for selected period - exclude cancelled sales
        top_items = list(
            SaleItem.objects.filter(
                sale__is_active=True,
                sale__sale_date__date__gte=start_date,
                sale__sale_date__date__lte=end_date
            ).exclude(
                sale__payment_status='cancelled'
            ).select_related('product').values(
                'product__name'
            ).annotate(
                total_quantity=Sum('quantity'),
                total_revenue=Sum(F('quantity') * F('unit_price'))
            ).order_by('-total_quantity')[:5]
        )

        # Convert Decimal to float for JSON serialization
        for item in top_items:
            if item['total_revenue']:
                item['total_revenue'] = float(item['total_revenue'])

        return Response({
            'period': {
                'start_date': start_date,
                'end_date': end_date,
                **period_stats,
                'vs_previous_period': {
                    'previous_start': comparison_start,
                    'previous_end': comparison_end,
                    **comparison_stats,
                    'changes': period_comparisons
                }
            },
            'today': {
                'date': today,
                **today_stats,
                'vs_yesterday': {
                    'previous_date': yesterday,
                    **yesterday_stats,
                    'changes': today_comparisons
                }
            },
            'month': {
                'start_date': start_date,
                'end_date': end_date,
                **period_stats,
                'vs_previous_month': {
                    'previous_start': comparison_start,
                    'previous_end': comparison_end,
                    **comparison_stats,
                    'changes': period_comparisons
                }
            },
            'analytics': {
                'payment_methods': payment_breakdown,
                'top_customers': top_customers,
                'daily_trend': daily_sales,
                'top_items': top_items
            }
        })

    @action(detail=False, methods=['get'])
    def sales_report(self, request):
        """Get detailed sales report excluding cancelled sales"""
        start_date_str = request.query_params.get('start_date')
        end_date_str = request.query_params.get('end_date')

        # Parse dates
        start_date = self.parse_date(start_date_str) if start_date_str else None
        end_date = self.parse_date(end_date_str) if end_date_str else None

        if start_date_str and not start_date:
            return Response(
                {'error': 'Invalid start_date format. Use YYYY-MM-DD'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if end_date_str and not end_date:
            return Response(
                {'error': 'Invalid end_date format. Use YYYY-MM-DD'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        # Build queryset with date filtering - EXCLUDE cancelled and inactive sales
        queryset = Sale.objects.filter(
            is_active=True
        ).exclude(
            payment_status='cancelled'
        ).select_related('customer').prefetch_related('items__product')
        
        if start_date:
            queryset = queryset.filter(sale_date__date__gte=start_date)
        if end_date:
            queryset = queryset.filter(sale_date__date__lte=end_date)

        # Sales by date
        sales_by_date = []
        raw_sales_by_date = queryset.values('sale_date__date').annotate(
            total_sales=Sum('total_amount'),
            orders_count=Count('id'),
            items_sold=Sum('items__quantity'),
        ).order_by('sale_date__date')

        for row in raw_sales_by_date:
            count = row['orders_count'] or 0
            total = float(row['total_sales']) if row['total_sales'] else 0
            row['total_sales'] = total
            row['avg_order_value'] = round(total / count, 2) if count else 0
            sales_by_date.append(row)

        # Payment methods breakdown
        payment_methods = list(queryset.values('payment_method').annotate(
            count=Count('id'),
            total=Sum('total_amount')
        ).order_by('-total'))

        # Convert Decimal to float
        for pm in payment_methods:
            if pm['total']:
                pm['total'] = float(pm['total'])

        # Top selling products - exclude cancelled sales
        sale_items_queryset = SaleItem.objects.filter(
            sale__is_active=True, 
            sale__in=queryset
        ).exclude(
            sale__payment_status='cancelled'
        ).select_related('product')
        
        top_products = list(sale_items_queryset.values(
            'product__name'
        ).annotate(
            quantity_sold=Sum('quantity'),
            total_amount=Sum('line_total')
        ).order_by('-quantity_sold')[:10])

        # Convert Decimal to float
        for product in top_products:
            if product['total_amount']:
                product['total_amount'] = float(product['total_amount'])

        # Summary statistics
        summary = queryset.aggregate(
            total_sales=Sum('total_amount'),
            total_items=Sum('items__quantity'),
            count=Count('id')
        )
        
        # Convert and calculate
        total_sales = float(summary['total_sales']) if summary['total_sales'] else 0
        count = summary['count'] or 0
        
        summary_response = {
            'total_sales': total_sales,
            'total_items': summary['total_items'] or 0,
            'count': count,
            'average_order_value': round(total_sales / count, 2) if count else 0
        }

        return Response({
            'period': {
                'start': start_date.isoformat() if start_date else None,
                'end': end_date.isoformat() if end_date else None
            },
            'summary': summary_response,
            'sales_by_date': sales_by_date,
            'payment_methods': payment_methods,
            'top_products': top_products
        })

    @action(detail=True, methods=['post'])
    def add_payment(self, request, pk=None):
        """Add payment to sale"""
        sale = self.get_object()
        amount = request.data.get('amount')

        if not amount:
            return Response({'error': 'Amount is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            amount = Decimal(amount)
            if amount <= 0:
                raise ValueError
        except ValueError:
            return Response({'error': 'Invalid amount'}, status=status.HTTP_400_BAD_REQUEST)

        if amount > sale.balance_due:
            return Response({'error': 'Amount exceeds balance due'}, status=status.HTTP_400_BAD_REQUEST)

        sale.paid_amount += amount
        sale.save()

        return Response(self.get_serializer(sale).data)
    
    @action(detail=True, methods=['post'])
    def cancel_sale(self, request, pk=None):
        """
        Cancel a sale and restore stock.
        For partially paid sales you must pass either ?refund=true or ?credit=true.
        """
        sale = self.get_object()

        # check flags from query params
        refund_flag = str(request.query_params.get('refund', 'false')).lower() == 'true'
        credit_flag = str(request.query_params.get('credit', 'false')).lower() == 'true'
        success, message = sale.cancel_sale(refund=refund_flag, credit=credit_flag)
       
        if not success:
            return Response({'error': message}, status=status.HTTP_400_BAD_REQUEST)

        return Response({
            'message': message,
            'sale': self.get_serializer(sale).data
        })
