from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from django.db.models import Sum, Count, F, Q, Avg, Case, When, DecimalField, IntegerField, FloatField, Value
from django.db.models.functions import TruncDay, Coalesce, Cast
from .models import Sale, SaleItem
from .serializers import SaleSerializer, CreateSaleSerializer
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

    def list(self, request, *args, **kwargs):
        """Override list to include comprehensive summary statistics"""
        queryset = self.filter_queryset(self.get_queryset())
        summary_stats = self.get_comprehensive_period_stats(queryset)
        
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            response = self.get_paginated_response(serializer.data)
            response.data['summary'] = summary_stats
            return response

        serializer = self.get_serializer(queryset, many=True)
        return Response({
            'results': serializer.data,
            'summary': summary_stats
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
            refund_flag = str(request.query_params.get('refund', 'false')).lower() == 'true'
            credit_flag = str(request.query_params.get('credit', 'false')).lower() == 'true'

            success, message = instance.cancel_sale(refund=refund_flag, credit=credit_flag)
            if not success:
                return Response({"error": message}, status=status.HTTP_400_BAD_REQUEST)

        # Then soft delete
        instance.is_active = False
        instance.save(update_fields=["is_active"])

        return Response({"detail": "Sale cancelled and soft-deleted successfully."}, status=status.HTTP_200_OK)
    
    def get_comparison_period_dates(self, start_date, end_date):
        """Calculate comparison period dates based on the selected period length"""
        period_length = (end_date - start_date).days + 1
        comparison_end = start_date - timedelta(days=1)
        comparison_start = comparison_end - timedelta(days=period_length - 1)
        return comparison_start, comparison_end

    def get_revenue_queryset(self, queryset):
        """
        Enhanced revenue calculation with proper handling of refunds and cancellations.
        
        Key changes:
        - Effective revenue properly handles refunded status
        - Pre-tax amount calculation is more accurate
        - Outstanding amount calculation considers refunded_amount
        """
        return queryset.annotate(
            # Effective revenue after considering cancellations and refunds
            effective_revenue=Case(
                When(payment_status='cancelled', then=Value(0, output_field=DecimalField())),
                When(payment_status='refunded', then=Value(0, output_field=DecimalField())),
                default=F('total_amount'),
                output_field=DecimalField(max_digits=12, decimal_places=2)
            ),
            
            # Pre-tax amount (total minus tax) - only for non-cancelled/refunded sales
            pretax_amount=Case(
                When(payment_status__in=['cancelled', 'refunded'], then=Value(0, output_field=DecimalField())),
                default=F('total_amount') - Coalesce(F('tax_amount'), Value(0, output_field=DecimalField())),
                output_field=DecimalField(max_digits=12, decimal_places=2)
            ),
            
            # Net revenue (after discounts, before tax) - only for active sales
            net_revenue=Case(
                When(payment_status__in=['cancelled', 'refunded'], then=Value(0, output_field=DecimalField())),
                default=F('subtotal') - Coalesce(F('discount_amount'), Value(0, output_field=DecimalField())),
                output_field=DecimalField(max_digits=12, decimal_places=2)
            ),
            
            # Outstanding amount (what's still owed)
            outstanding_amount=Case(
                When(payment_status__in=['cancelled', 'refunded', 'paid'], 
                    then=Value(0, output_field=DecimalField())),
                default=F('total_amount') - F('paid_amount') + Coalesce(F('refunded_amount'), Value(0, output_field=DecimalField())),
                output_field=DecimalField(max_digits=12, decimal_places=2)
            ),
            
            # Collection efficiency (percentage of total amount that's been paid)
            collection_rate=Case(
                When(total_amount=0, then=Value(0, output_field=FloatField())),
                default=Cast(
                    ((F('paid_amount') - Coalesce(F('refunded_amount'), Value(0))) * Value(100.0)) / F('total_amount'), 
                    FloatField()
                ),
                output_field=FloatField()
            )
        )

    def get_comprehensive_period_stats(self, queryset):
        """Get comprehensive stats for a queryset with proper revenue calculations"""
        # Use enhanced revenue calculation
        queryset = self.get_revenue_queryset(queryset)
        
        # Filter only non-deleted/active sales if you have soft delete
        # If you don't have is_active field, remove this line
        try:
            active_queryset = queryset.filter(is_active=True)
        except:
            active_queryset = queryset
        
        # Overall statistics - exclude cancelled and refunded from counts
        stats_queryset = active_queryset.exclude(payment_status__in=['cancelled', 'refunded'])
        
        overall_stats = stats_queryset.aggregate(
            total_sales_count=Count('id'),
            
            # Revenue metrics (these already exclude cancelled/refunded via effective_revenue calculation)
            gross_revenue=Sum('total_amount'),
            effective_revenue=Sum('effective_revenue'),
            pretax_revenue=Sum('pretax_amount'),
            net_revenue=Sum('net_revenue'),
            
            # Payment metrics
            total_paid=Sum('paid_amount'),
            total_outstanding=Sum('outstanding_amount'),
            
            # Item metrics
            total_items=Coalesce(Sum('items__quantity'), Value(0, output_field=IntegerField())),
            
            # Average metrics
            avg_sale_value=Avg('total_amount'),
        )
        
        # Calculate average items per sale separately to handle potential None
        avg_items_per_sale = 0.0
        if overall_stats['total_sales_count'] and overall_stats['total_sales_count'] > 0:
            items_per_sale_queryset = stats_queryset.exclude(items__isnull=True)
            if items_per_sale_queryset.exists():
                avg_items_data = items_per_sale_queryset.aggregate(
                    avg_items=Avg('items__quantity')
                )
                avg_items_per_sale = float(avg_items_data['avg_items'] or 0)
        
        # Payment status breakdown - use ALL sales including cancelled/refunded
        payment_status_stats = active_queryset.values('payment_status').annotate(
            count=Count('id'),
            revenue=Sum('effective_revenue'),  # This will be 0 for cancelled/refunded
            paid_amount=Sum('paid_amount'),
            outstanding=Sum('outstanding_amount')
        )
        
        # Convert to dictionary for easier access
        status_breakdown = {}
        for stat in payment_status_stats:
            status = stat['payment_status']
            status_breakdown[status] = {
                'count': stat['count'],
                'revenue': float(stat['revenue']) if stat['revenue'] else 0.0,
                'paid_amount': float(stat['paid_amount']) if stat['paid_amount'] else 0.0,
                'outstanding': float(stat['outstanding']) if stat['outstanding'] else 0.0
            }
        
        # Ensure all status types are represented
        for status_type in ['pending', 'partial', 'paid', 'refunded', 'cancelled']:
            if status_type not in status_breakdown:
                status_breakdown[status_type] = {
                    'count': 0, 'revenue': 0.0, 'paid_amount': 0.0, 'outstanding': 0.0
                }
        
        # Helper function to safely convert to float
        def safe_float(value):
            return float(value) if value is not None else 0.0
        
        # Extract and convert main stats
        gross_revenue = safe_float(overall_stats['gross_revenue'])
        effective_revenue = safe_float(overall_stats['effective_revenue'])
        pretax_revenue = safe_float(overall_stats['pretax_revenue'])
        net_revenue = safe_float(overall_stats['net_revenue'])
        total_paid = safe_float(overall_stats['total_paid'])
        total_outstanding = safe_float(overall_stats['total_outstanding'])
        
        count = overall_stats['total_sales_count'] or 0
        items_count = overall_stats['total_items'] or 0
        avg_sale = safe_float(overall_stats['avg_sale_value'])
        
        # Get additional metrics with error handling - from ALL active sales
        try:
            additional_stats = active_queryset.aggregate(
                # Only sum discount and tax from non-cancelled/refunded sales
                total_discount=Coalesce(
                    Sum(Case(
                        When(payment_status__in=['cancelled', 'refunded'], then=Value(0)),
                        default=F('discount_amount'),
                        output_field=DecimalField()
                    )),
                    Value(Decimal('0.00'), output_field=DecimalField())
                ),
                total_tax=Coalesce(
                    Sum(Case(
                        When(payment_status__in=['cancelled', 'refunded'], then=Value(0)),
                        default=F('tax_amount'),
                        output_field=DecimalField()
                    )),
                    Value(Decimal('0.00'), output_field=DecimalField())
                ),
                # Total refunded amount from both refunded and cancelled sales
                total_refunded=Coalesce(
                    Sum(Case(
                        When(
                            Q(payment_status__in=['refunded', 'cancelled']) & Q(refunded_amount__gt=0),
                            then=F('refunded_amount')
                        ),
                        default=Value(0, output_field=DecimalField()),
                        output_field=DecimalField()
                    )), 
                    Value(Decimal('0.00'), output_field=DecimalField())
                )
            )
            
            total_discount = safe_float(additional_stats['total_discount'])
            total_tax = safe_float(additional_stats['total_tax'])
            total_refunded = safe_float(additional_stats['total_refunded'])
        except Exception as e:
            logger.warning(f"Error calculating additional stats: {e}")
            total_discount = total_tax = total_refunded = 0.0

        # Calculate proper tax rate: tax / pre-tax amount
        tax_rate = 0.0
        if pretax_revenue > 0:
            tax_rate = round((total_tax / pretax_revenue) * 100, 2)

        # Total count of ALL sales (including cancelled/refunded)
        total_count_all = active_queryset.count()
        
        # Count of pending sales (pending + partial)
        pending_count = status_breakdown['pending']['count'] + status_breakdown['partial']['count']
        
        # Completion rate based on non-cancelled/refunded sales only
        completion_rate = 0.0
        if count > 0:
            completion_rate = round((status_breakdown['paid']['count'] / count) * 100, 2)

        return {
            # Basic metrics (excluding cancelled/refunded)
            'total_sales_count': count,
            'total_items_sold': items_count,
            'average_sale_value': round(avg_sale, 2),
            'average_items_per_sale': round(avg_items_per_sale, 2),
            
            # All sales count (including cancelled/refunded)
            'total_all_sales': total_count_all,
            'cancelled_sales_count': status_breakdown['cancelled']['count'],
            'refunded_sales_count': status_breakdown['refunded']['count'],
            
            # Revenue breakdown (from non-cancelled/refunded sales)
            'revenue_metrics': {
                'gross_revenue': round(gross_revenue, 2),
                'effective_revenue': round(effective_revenue, 2),
                'pretax_revenue': round(pretax_revenue, 2),
                'net_revenue': round(net_revenue, 2),
                'total_tax_collected': round(total_tax, 2),
                'total_discount_given': round(total_discount, 2),
                'total_refunded': round(total_refunded, 2)
            },
            
            # Payment metrics
            'payment_metrics': {
                'total_paid': round(total_paid, 2),
                'total_outstanding': round(total_outstanding, 2),
                'collection_rate': round((total_paid / gross_revenue) * 100, 2) if gross_revenue else 0.0,
                'payment_status_breakdown': status_breakdown
            },
            
            # Performance indicators
            'performance_indicators': {
                'refund_rate': round((total_refunded / gross_revenue) * 100, 2) if gross_revenue else 0.0,
                'discount_rate': round((total_discount / gross_revenue) * 100, 2) if gross_revenue else 0.0,
                'tax_rate': tax_rate,
                'pending_sales_count': pending_count,
                'completion_rate': completion_rate,
                'cancellation_rate': round((status_breakdown['cancelled']['count'] / total_count_all) * 100, 2) if total_count_all else 0.0
            }
        }
        
    def get_time_range_analytics(self, queryset, period_name="period"):
        """Get detailed time-range analytics with trends"""
        queryset = self.get_revenue_queryset(queryset)
        active_queryset = queryset.filter(is_active=True)
        
        # Daily breakdown
        daily_breakdown = list(active_queryset.annotate(
            day=TruncDay('sale_date')
        ).values('day').annotate(
            sales_count=Count('id'),
            gross_revenue=Sum('total_amount'),
            effective_revenue=Sum('effective_revenue'),
            paid_amount=Sum('paid_amount'),
            outstanding=Sum('outstanding_amount'),
            items_sold=Coalesce(Sum('items__quantity'), Value(0, output_field=IntegerField())),
            
            # Status counts
            pending_count=Count('id', filter=Q(payment_status='pending')),
            partial_count=Count('id', filter=Q(payment_status='partial')),
            paid_count=Count('id', filter=Q(payment_status='paid')),
            refunded_count=Count('id', filter=Q(payment_status='refunded')),
            cancelled_count=Count('id', filter=Q(payment_status='cancelled'))
        ).order_by('day'))
        
        # Convert decimals to floats for JSON serialization
        for day_data in daily_breakdown:
            for key, value in day_data.items():
                if isinstance(value, Decimal):
                    day_data[key] = float(value)
                elif value is None:
                    day_data[key] = 0.0 if any(x in key for x in ['revenue', 'amount', 'sold']) else 0
        
        # Payment method breakdown
        payment_method_breakdown = list(active_queryset.exclude(
            payment_status='cancelled'
        ).values('payment_method').annotate(
            count=Count('id'),
            revenue=Sum('effective_revenue'),
            paid_amount=Sum('paid_amount'),
            outstanding=Sum('outstanding_amount'),
            avg_transaction_value=Avg('total_amount')
        ).order_by('-revenue'))
        
        # Convert decimals to floats
        for pm_data in payment_method_breakdown:
            for key, value in pm_data.items():
                if isinstance(value, Decimal):
                    pm_data[key] = float(value)
                elif value is None and key != 'payment_method':
                    pm_data[key] = 0.0
        
        return {
            f'{period_name}_daily_breakdown': daily_breakdown,
            f'{period_name}_payment_methods': payment_method_breakdown
        }

    def get_monthly_stats(self, reference_date=None):
        """Get last 30 days stats from reference date (default: today)"""
        if reference_date is None:
            reference_date = timezone.now().date()
        
        start_date = reference_date - timedelta(days=29)  # 30 days including today
        end_date = reference_date
        
        monthly_queryset = Sale.objects.filter(
            is_active=True,
            sale_date__date__gte=start_date,
            sale_date__date__lte=end_date
        ).select_related('customer', 'salesperson').prefetch_related('items__product')
        
        stats = self.get_comprehensive_period_stats(monthly_queryset)
        analytics = self.get_time_range_analytics(monthly_queryset, "monthly")
        
        return {**stats, **analytics}, start_date, end_date
    
    @action(detail=False, methods=['get'])
    def dashboard(self, request):
        """Get enhanced sales dashboard data with comprehensive analytics"""
        # Get date parameters from request
        start_date_str = request.query_params.get('start_date')
        end_date_str = request.query_params.get('end_date')
        
        # Parse dates or use defaults for selected period
        if start_date_str and end_date_str:
            start_date = self.parse_date(start_date_str)
            end_date = self.parse_date(end_date_str)
        else:
            # Default to last 7 days if no dates provided
            end_date = timezone.now().date()
            start_date = end_date - timedelta(days=6)  # 7 days including today
        
        if not start_date or not end_date:
            return Response(
                {'error': 'Invalid date format. Use YYYY-MM-DD'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        # Get current datetime info
        now = timezone.now()
        today = now.date()
        yesterday = today - timedelta(days=1)

        # Base queryset with optimized joins
        base_queryset = Sale.objects.filter(
            is_active=True
        ).select_related('customer', 'salesperson').prefetch_related('items__product')

        # Today's comprehensive stats
        today_sales = base_queryset.filter(sale_date__date=today)
        today_stats = self.get_comprehensive_period_stats(today_sales)
        today_analytics = self.get_time_range_analytics(today_sales, "today")

        # Yesterday's stats for comparison
        yesterday_sales = base_queryset.filter(sale_date__date=yesterday)
        yesterday_stats = self.get_comprehensive_period_stats(yesterday_sales)

        # Selected period comprehensive stats
        period_sales = base_queryset.filter(
            sale_date__date__gte=start_date,
            sale_date__date__lte=end_date
        )
        period_stats = self.get_comprehensive_period_stats(period_sales)
        period_analytics = self.get_time_range_analytics(period_sales, "period")

        # Comparison period stats (same length as selected period, immediately before)
        comparison_start, comparison_end = self.get_comparison_period_dates(start_date, end_date)
        comparison_sales = base_queryset.filter(
            sale_date__date__gte=comparison_start,
            sale_date__date__lte=comparison_end
        )
        comparison_stats = self.get_comprehensive_period_stats(comparison_sales)

        # Monthly stats (last 30 days from today)
        monthly_data, monthly_start, monthly_end = self.get_monthly_stats()
        
        # Previous month stats for comparison (30 days before the monthly period)
        prev_monthly_data, prev_monthly_start, prev_monthly_end = self.get_monthly_stats(
            reference_date=monthly_start - timedelta(days=1)
        )

        # Calculate percentage changes for key metrics
        def calculate_changes(current, previous):
            changes = {}
            if previous:
                changes['revenue_change'] = self.calculate_percentage_change(
                    current['revenue_metrics']['effective_revenue'], 
                    previous['revenue_metrics']['effective_revenue']
                )
                changes['sales_count_change'] = self.calculate_percentage_change(
                    current['total_sales_count'], 
                    previous['total_sales_count']
                )
                changes['collection_rate_change'] = self.calculate_percentage_change(
                    current['payment_metrics']['collection_rate'], 
                    previous['payment_metrics']['collection_rate']
                )
                changes['avg_sale_change'] = self.calculate_percentage_change(
                    current['average_sale_value'], 
                    previous['average_sale_value']
                )
            return changes

        today_comparisons = calculate_changes(today_stats, yesterday_stats)
        period_comparisons = calculate_changes(period_stats, comparison_stats)
        monthly_comparisons = calculate_changes(monthly_data, prev_monthly_data)

        # Top performers analysis
        top_customers = list(
            self.get_revenue_queryset(period_sales).exclude(
                payment_status='cancelled'
            ).values('customer__name', 'customer__id').annotate(
                total_purchases=Sum('effective_revenue'),
                order_count=Count('id'),
                items_purchased=Sum('items__quantity'),
                avg_order_value=Avg('total_amount'),
                outstanding_amount=Sum('outstanding_amount')
            ).filter(
                customer__name__isnull=False
            ).order_by('-total_purchases')[:10]
        )

        # Convert decimals to floats
        for customer in top_customers:
            for key, value in customer.items():
                if isinstance(value, Decimal):
                    customer[key] = float(value)

        # Best selling products analysis
        top_products = list(
            SaleItem.objects.filter(
                sale__is_active=True,
                sale__sale_date__date__gte=start_date,
                sale__sale_date__date__lte=end_date
            ).exclude(
                sale__payment_status='cancelled'
            ).select_related('product').values(
                'product__name', 'product__id'
            ).annotate(
                total_quantity=Sum('quantity'),
                total_revenue=Sum(
                    F('quantity') * F('unit_price'),
                    output_field=DecimalField(max_digits=12, decimal_places=2)
                ),
                avg_unit_price=Avg('unit_price'),
                total_orders=Count('sale', distinct=True)
            ).order_by('-total_quantity')[:10]
        )

        # Convert decimals to floats
        for product in top_products:
            for key, value in product.items():
                if isinstance(value, Decimal):
                    product[key] = float(value)

        return Response({
            'metadata': {
                'generated_at': now.isoformat(),
                'timezone': str(now.tzinfo),
                'period_days': (end_date - start_date).days + 1,
                'data_freshness': 'real_time'
            },
            
            'period': {
                'start_date': start_date,
                'end_date': end_date,
                **period_stats,
                'analytics': period_analytics,
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
                'analytics': today_analytics,
                'vs_yesterday': {
                    'previous_date': yesterday,
                    **yesterday_stats,
                    'changes': today_comparisons
                }
            },
            
            'monthly': {  # Last 30 days from today
                'start_date': monthly_start,
                'end_date': monthly_end,
                **monthly_data,
                'vs_previous_month': {
                    'previous_start': prev_monthly_start,
                    'previous_end': prev_monthly_end,
                    **prev_monthly_data,
                    'changes': monthly_comparisons
                }
            },
            
            'insights': {
                'top_customers': top_customers,
                'top_products': top_products,
                'alerts': self.generate_business_alerts(period_stats, comparison_stats, today_stats)
            }
        })

    def generate_business_alerts(self, current_period, previous_period, today_stats):
        """Generate business intelligence alerts"""
        alerts = []
        
        # High refund rate alert
        if current_period['performance_indicators']['refund_rate'] > 5:
            alerts.append({
                'type': 'warning',
                'category': 'refunds',
                'message': f"High refund rate: {current_period['performance_indicators']['refund_rate']:.1f}%",
                'recommendation': 'Review product quality and customer satisfaction'
            })
        
        # Low collection rate alert
        if current_period['payment_metrics']['collection_rate'] < 85:
            alerts.append({
                'type': 'warning',
                'category': 'collections',
                'message': f"Low collection rate: {current_period['payment_metrics']['collection_rate']:.1f}%",
                'recommendation': 'Follow up on outstanding payments'
            })
        
        # High pending orders
        pending_count = current_period['performance_indicators']['pending_sales_count']
        if pending_count > 10:
            alerts.append({
                'type': 'info',
                'category': 'operations',
                'message': f"{pending_count} orders need attention",
                'recommendation': 'Process pending and partial payments'
            })
        
        # Revenue decline alert
        if previous_period and current_period['revenue_metrics']['effective_revenue'] < previous_period['revenue_metrics']['effective_revenue'] * 0.9:
            decline = ((previous_period['revenue_metrics']['effective_revenue'] - current_period['revenue_metrics']['effective_revenue']) / previous_period['revenue_metrics']['effective_revenue']) * 100
            alerts.append({
                'type': 'alert',
                'category': 'revenue',
                'message': f"Revenue declined by {decline:.1f}% compared to previous period",
                'recommendation': 'Analyze sales trends and customer behavior'
            })
        
        # Today's performance
        if today_stats['total_sales_count'] == 0:
            alerts.append({
                'type': 'info',
                'category': 'daily',
                'message': 'No sales recorded today',
                'recommendation': 'Check system status and promote daily offers'
            })
        
        return alerts

    @action(detail=False, methods=['get'])
    def sales_report(self, request):
        """Get detailed sales report with comprehensive breakdown"""
        start_date_str = request.query_params.get('start_date')
        end_date_str = request.query_params.get('end_date')
        include_analytics = request.query_params.get('include_analytics', 'true').lower() == 'true'

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

        # Build queryset with date filtering
        base_queryset = Sale.objects.filter(
            is_active=True
        ).select_related('customer', 'salesperson').prefetch_related('items__product')
        
        if start_date:
            base_queryset = base_queryset.filter(sale_date__date__gte=start_date)
        if end_date:
            base_queryset = base_queryset.filter(sale_date__date__lte=end_date)

        # Get comprehensive stats
        period_stats = self.get_comprehensive_period_stats(base_queryset)
        
        response_data = {
            'period': {
                'start': start_date.isoformat() if start_date else None,
                'end': end_date.isoformat() if end_date else None
            },
            'summary': period_stats
        }
        
        if include_analytics:
            analytics = self.get_time_range_analytics(base_queryset, "report")
            response_data['detailed_analytics'] = analytics
        
        return Response(response_data)
    
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
