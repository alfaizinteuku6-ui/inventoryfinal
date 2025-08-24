from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from django.db.models import Sum, Count, F
from django.db.models.functions import TruncDay
from .models import Sale, SaleItem
from .serializers import SaleSerializer, CreateSaleSerializer
from datetime import timedelta
from calendar import monthrange
from decimal import Decimal 

class SaleViewSet(viewsets.ModelViewSet):
    queryset = Sale.objects.select_related('customer', 'salesperson').prefetch_related('items')
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

    def get_serializer_class(self):
        if self.action == 'create':
            return CreateSaleSerializer
        return SaleSerializer

    def perform_create(self, serializer):
        serializer.save(salesperson=self.request.user)

    def list(self, request, *args, **kwargs):
        """Override list to include summary statistics"""
        queryset = self.filter_queryset(self.get_queryset())

        # Get summary statistics for the filtered queryset
        summary_stats = queryset.aggregate(
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

    def calculate_percentage_change(self, current, previous):
        """Calculate percentage change between current and previous values"""
        if previous == 0:
            return 100.0 if current > 0 else 0.0
        return round(((current - previous) / previous) * 100, 2)

    def get_period_stats(self, queryset):
        """Get comprehensive stats for a queryset including items count"""
        stats = queryset.aggregate(
            total_amount=Sum('total_amount'),
            count=Count('id'),
            total_items=Sum('items__quantity')
        )

        total = stats['total_amount'] or 0
        count = stats['count'] or 0
        items_count = stats['total_items'] or 0

        return {
            'total_revenue': total,
            'sales_count': count,
            'items_sold': items_count,
            'average_sale': round(total / count, 2) if count else 0,
            'average_items_per_sale': round(items_count / count, 2) if count else 0
        }

    def get_previous_month_dates(self, current_date):
        """Calculate previous month start and end dates without dateutil"""
        start_of_current_month = current_date.replace(day=1)

        if start_of_current_month.month == 1:
            prev_year = start_of_current_month.year - 1
            prev_month = 12
        else:
            prev_year = start_of_current_month.year
            prev_month = start_of_current_month.month - 1

        start_of_prev_month = start_of_current_month.replace(year=prev_year, month=prev_month)
        _, last_day = monthrange(prev_year, prev_month)
        end_of_prev_month = start_of_prev_month.replace(day=last_day)

        return start_of_prev_month, end_of_prev_month, start_of_current_month

    @action(detail=False, methods=['get'])
    def dashboard(self, request):
        """Get enhanced sales dashboard data with period comparisons"""
        today = timezone.now().date()
        yesterday = today - timedelta(days=1)

        start_of_month = today.replace(day=1)
        start_of_prev_month, end_of_prev_month, start_of_current_month = self.get_previous_month_dates(today)

        # Today's stats
        today_sales = self.get_queryset().filter(sale_date__date=today)
        today_stats = self.get_period_stats(today_sales)

        # Yesterday's stats
        yesterday_sales = self.get_queryset().filter(sale_date__date=yesterday)
        yesterday_stats = self.get_period_stats(yesterday_sales)

        # Current month stats (use datetime range for accuracy)
        month_sales = self.get_queryset().filter(
            sale_date__gte=start_of_month,
            sale_date__lt=today + timedelta(days=1)  # include today
        )
        month_stats = self.get_period_stats(month_sales)

        # Previous month stats (safe range)
        prev_month_sales = self.get_queryset().filter(
            sale_date__gte=start_of_prev_month,
            sale_date__lt=start_of_current_month
        )
        prev_month_stats = self.get_period_stats(prev_month_sales)

        # Today vs Yesterday
        today_comparisons = {
            'revenue_change': self.calculate_percentage_change(today_stats['total_revenue'], yesterday_stats['total_revenue']),
            'sales_count_change': self.calculate_percentage_change(today_stats['sales_count'], yesterday_stats['sales_count']),
            'items_sold_change': self.calculate_percentage_change(today_stats['items_sold'], yesterday_stats['items_sold']),
            'avg_sale_change': self.calculate_percentage_change(today_stats['average_sale'], yesterday_stats['average_sale'])
        }

        # Current Month vs Previous Month
        month_comparisons = {
            'revenue_change': self.calculate_percentage_change(month_stats['total_revenue'], prev_month_stats['total_revenue']),
            'sales_count_change': self.calculate_percentage_change(month_stats['sales_count'], prev_month_stats['sales_count']),
            'items_sold_change': self.calculate_percentage_change(month_stats['items_sold'], prev_month_stats['items_sold']),
            'avg_sale_change': self.calculate_percentage_change(month_stats['average_sale'], prev_month_stats['average_sale'])
        }

        # Payment breakdown
        payment_breakdown = month_sales.values('payment_method').annotate(
            count=Count('id'),
            total=Sum('total_amount')
        )

        # Top customers
        top_customers = month_sales.values('customer__name').annotate(
            total_purchases=Sum('total_amount'),
            order_count=Count('id'),
            items_purchased=Sum('items__quantity')
        ).order_by('-total_purchases')[:5]

        # Daily sales trend (using TruncDay)
        daily_sales = month_sales.annotate(
            day=TruncDay('sale_date')
        ).values('day').annotate(
            daily_revenue=Sum('total_amount'),
            daily_count=Count('id'),
            daily_items=Sum('items__quantity')
        ).order_by('day')

        # Best selling items
        top_items = SaleItem.objects.filter(
            sale__sale_date__gte=start_of_month
        ).values(
            'product__name'
        ).annotate(
            total_quantity=Sum('quantity'),
            total_revenue=Sum(F('quantity') * F('unit_price'))
        ).order_by('-total_quantity')[:5]

        return Response({
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
                'start_date': start_of_month,
                'end_date': today,
                **month_stats,
                'vs_previous_month': {
                    'previous_start': start_of_prev_month,
                    'previous_end': end_of_prev_month,
                    **prev_month_stats,
                    'changes': month_comparisons
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
        """Get detailed sales report"""
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')

        queryset = self.get_queryset()
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
            total = row['total_sales'] or 0
            row['avg_order_value'] = (total / count) if count else 0
            sales_by_date.append(row)

        # Payment methods breakdown
        payment_methods = queryset.values('payment_method').annotate(
            count=Count('id'),
            total=Sum('total_amount')
        )

        # Top selling products
        top_products = SaleItem.objects.filter(sale__in=queryset).values(
            'product__name'
        ).annotate(
            quantity_sold=Sum('quantity'),
            total_amount=Sum('line_total')
        ).order_by('-quantity_sold')[:10]

        summary = queryset.aggregate(
            total_sales=Sum('total_amount'),
            total_items=Sum('items__quantity'),
            count=Count('id')
        )
        summary['average_order_value'] = (
            summary['total_sales'] / summary['count']
            if summary['count'] else 0
        )

        return Response({
            'period': {'start': start_date, 'end': end_date},
            'summary': summary,
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
