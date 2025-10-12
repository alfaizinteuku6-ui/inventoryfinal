# backend/apps/sales/views/analytics.py
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import (
    Sum, Count, Avg, F, Q, DecimalField, Case, When, Value,
    ExpressionWrapper, FloatField, IntegerField, Prefetch
)
from django.db.models.functions import (
    TruncDate, TruncWeek, TruncMonth, TruncYear, Coalesce
)
from django.utils import timezone
from django.core.cache import cache
from datetime import timedelta, datetime
from decimal import Decimal, ROUND_HALF_UP
from collections import defaultdict
import hashlib

from ..models import Sale, SaleItem
from apps.inventory.models import Product, Category, StockMovement
from apps.customers.models import Customer


class SalesAnalyticsViewSet(viewsets.ViewSet):
    """
    Comprehensive Sales Analytics ViewSet with Caching
    Provides real-time analytics with proper decimal handling and performance optimizations
    """
    permission_classes = [IsAuthenticated]

    def _quantize(self, value):
        """Helper to properly quantize decimal values"""
        if value is None:
            return Decimal('0.00')
        return Decimal(str(value)).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)

    def _get_cache_key(self, prefix, params):
        """Generate cache key from parameters"""
        param_str = str(sorted(params.items()))
        hash_key = hashlib.md5(param_str.encode()).hexdigest()
        return f"{prefix}_{hash_key}"

    def _get_date_range(self, request):
        """Extract and validate date range from request"""
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        period = request.query_params.get('period', 'month')

        now = timezone.now()
        
        if start_date and end_date:
            try:
                start = timezone.make_aware(datetime.strptime(start_date, '%Y-%m-%d'))
                end = timezone.make_aware(datetime.strptime(end_date, '%Y-%m-%d'))
                end = end.replace(hour=23, minute=59, second=59)
            except ValueError:
                start = now - timedelta(days=30)
                end = now
        else:
            # Default periods
            if period == 'day':
                start = now.replace(hour=0, minute=0, second=0, microsecond=0)
                end = now
            elif period == 'week':
                start = now - timedelta(days=now.weekday())
                start = start.replace(hour=0, minute=0, second=0, microsecond=0)
                end = now
            elif period == 'month':
                start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
                end = now
            elif period == 'year':
                start = now.replace(month=1, day=1, hour=0, minute=0, second=0, microsecond=0)
                end = now
            else:  # all
                start = None
                end = now

        return start, end, period

    @action(detail=False, methods=['get'])
    def dashboard_summary(self, request):
        """
        GET /api/sales/analytics/dashboard_summary/
        Main dashboard overview with key metrics (cached for 5 minutes)
        """
        start_date, end_date, period = self._get_date_range(request)
        
        # Check cache
        cache_params = {
            'start': start_date.isoformat() if start_date else None,
            'end': end_date.isoformat(),
            'period': period
        }
        cache_key = self._get_cache_key('dashboard_summary', cache_params)
        cached_data = cache.get(cache_key)
        
        if cached_data:
            return Response(cached_data)
        
        # Base queryset with select_related for optimization
        sales_qs = Sale.objects.select_related('customer').exclude(
            payment_status__in=['cancelled', 'refunded']
        )
        if start_date:
            sales_qs = sales_qs.filter(sale_date__gte=start_date, sale_date__lte=end_date)

        # Single aggregation query for all totals
        totals = sales_qs.aggregate(
            total_revenue=Coalesce(Sum('total_amount'), Value(0), output_field=DecimalField()),
            total_paid=Coalesce(Sum('paid_amount'), Value(0), output_field=DecimalField()),
            total_due=Coalesce(Sum(F('total_amount') - F('paid_amount') - F('refunded_amount')), 
                             Value(0), output_field=DecimalField()),
            total_refunded=Coalesce(Sum('refunded_amount'), Value(0), output_field=DecimalField()),
            total_tax=Coalesce(Sum('tax_amount'), Value(0), output_field=DecimalField()),
            total_discount=Coalesce(Sum('discount_amount'), Value(0), output_field=DecimalField()),
            total_sales=Count('id'),
        )

        # Optimized profit calculation with prefetch
        profit_data = SaleItem.objects.filter(
            sale__in=sales_qs
        ).select_related('product').aggregate(
            total_cost=Coalesce(
                Sum(F('quantity') * F('product__cost_price')),
                Value(0),
                output_field=DecimalField()
            )
        )
        
        total_cost = self._quantize(profit_data['total_cost'])
        total_revenue = self._quantize(totals['total_revenue'])
        total_profit = total_revenue - total_cost
        profit_margin = ((total_profit / total_revenue * 100) if total_revenue > 0 else 0)

        # Parallel queries for status and payment methods
        status_breakdown = list(sales_qs.values('payment_status').annotate(
            count=Count('id'),
            amount=Coalesce(Sum('total_amount'), Value(0), output_field=DecimalField())
        ).order_by('-amount'))

        payment_methods = list(sales_qs.values('payment_method').annotate(
            count=Count('id'),
            amount=Coalesce(Sum('total_amount'), Value(0), output_field=DecimalField())
        ).order_by('-amount'))

        # Calculate averages
        avg_order_value = (self._quantize(totals['total_revenue']) / totals['total_sales'] 
                          if totals['total_sales'] > 0 else Decimal('0.00'))

        # Previous period comparison
        previous_revenue = Decimal('0.00')
        revenue_change = 0
        
        if start_date and period != 'all':
            period_length = (end_date - start_date).days
            prev_start = start_date - timedelta(days=period_length)
            prev_end = start_date
            
            prev_totals = Sale.objects.filter(
                sale_date__gte=prev_start,
                sale_date__lt=prev_end
            ).exclude(
                payment_status__in=['cancelled', 'refunded']
            ).aggregate(
                total=Coalesce(Sum('total_amount'), Value(0), output_field=DecimalField())
            )
            
            previous_revenue = self._quantize(prev_totals['total'])
            if previous_revenue > 0:
                revenue_change = float((total_revenue - previous_revenue) / previous_revenue * 100)

        result = {
            'period': period,
            'date_range': {
                'start': start_date.isoformat() if start_date else None,
                'end': end_date.isoformat(),
            },
            'summary': {
                'total_revenue': str(self._quantize(totals['total_revenue'])),
                'total_paid': str(self._quantize(totals['total_paid'])),
                'total_due': str(self._quantize(totals['total_due'])),
                'total_refunded': str(self._quantize(totals['total_refunded'])),
                'total_profit': str(total_profit),
                'profit_margin': round(float(profit_margin), 2),
                'total_tax': str(self._quantize(totals['total_tax'])),
                'total_discount': str(self._quantize(totals['total_discount'])),
                'total_sales': totals['total_sales'],
                'average_order_value': str(avg_order_value),
                'previous_revenue': str(previous_revenue),
                'revenue_change_percent': round(revenue_change, 2),
            },
            'payment_status': [
                {
                    'status': item['payment_status'],
                    'count': item['count'],
                    'amount': str(self._quantize(item['amount']))
                }
                for item in status_breakdown
            ],
            'payment_methods': [
                {
                    'method': item['payment_method'],
                    'count': item['count'],
                    'amount': str(self._quantize(item['amount']))
                }
                for item in payment_methods
            ]
        }
        
        # Cache for 5 minutes
        cache.set(cache_key, result, 300)
        return Response(result)

    @action(detail=False, methods=['get'])
    def sales_trend(self, request):
        """
        GET /api/sales/analytics/sales_trend/
        Sales trend over time with proper grouping (cached)
        """
        start_date, end_date, period = self._get_date_range(request)
        group_by = request.query_params.get('group_by', 'day')
        
        # Check cache
        cache_params = {
            'start': start_date.isoformat() if start_date else None,
            'end': end_date.isoformat(),
            'period': period,
            'group_by': group_by
        }
        cache_key = self._get_cache_key('sales_trend', cache_params)
        cached_data = cache.get(cache_key)
        
        if cached_data:
            return Response(cached_data)
        
        sales_qs = Sale.objects.exclude(payment_status__in=['cancelled', 'refunded'])
        if start_date:
            sales_qs = sales_qs.filter(sale_date__gte=start_date, sale_date__lte=end_date)

        # Group by period
        trunc_map = {
            'day': TruncDate('sale_date'),
            'week': TruncWeek('sale_date'),
            'month': TruncMonth('sale_date'),
            'year': TruncYear('sale_date')
        }
        trunc_func = trunc_map.get(group_by, TruncDate('sale_date'))

        # Optimized single query with all aggregations
        trend_data = sales_qs.annotate(
            period=trunc_func
        ).values('period').annotate(
            revenue=Coalesce(Sum('total_amount'), Value(0), output_field=DecimalField()),
            sales_count=Count('id'),
            avg_order=Coalesce(Avg('total_amount'), Value(0), output_field=DecimalField()),
            paid=Coalesce(Sum('paid_amount'), Value(0), output_field=DecimalField()),
            due=Coalesce(Sum(F('total_amount') - F('paid_amount') - F('refunded_amount')), 
                        Value(0), output_field=DecimalField())
        ).order_by('period')

        # Batch calculate costs for all periods
        period_costs = {}
        for item in trend_data:
            period_start = item['period']
            
            # Calculate period end based on grouping
            if group_by == 'day':
                period_end = period_start + timedelta(days=1)
            elif group_by == 'week':
                period_end = period_start + timedelta(days=7)
            elif group_by == 'month':
                if period_start.month == 12:
                    period_end = period_start.replace(year=period_start.year + 1, month=1)
                else:
                    period_end = period_start.replace(month=period_start.month + 1)
            else:  # year
                period_end = period_start.replace(year=period_start.year + 1)
            
            # Get cost for this period
            cost_data = SaleItem.objects.filter(
                sale__sale_date__gte=period_start,
                sale__sale_date__lt=period_end,
                sale__payment_status__in=['partial', 'paid']
            ).aggregate(
                total_cost=Coalesce(
                    Sum(F('quantity') * F('product__cost_price')),
                    Value(0),
                    output_field=DecimalField()
                )
            )
            period_costs[period_start.isoformat()] = self._quantize(cost_data['total_cost'])

        # Build results with cached costs
        results = []
        for item in trend_data:
            revenue = self._quantize(item['revenue'])
            cost = period_costs.get(item['period'].isoformat(), Decimal('0.00'))
            profit = revenue - cost
            
            results.append({
                'period': item['period'].isoformat(),
                'revenue': str(revenue),
                'sales_count': item['sales_count'],
                'average_order': str(self._quantize(item['avg_order'])),
                'paid': str(self._quantize(item['paid'])),
                'due': str(self._quantize(item['due'])),
                'profit': str(profit),
            })

        result = {
            'group_by': group_by,
            'data': results
        }
        
        # Cache for 5 minutes
        cache.set(cache_key, result, 300)
        return Response(result)

    @action(detail=False, methods=['get'])
    def top_products(self, request):
        """
        GET /api/sales/analytics/top_products/
        Top selling products by revenue and quantity (cached)
        """
        start_date, end_date, period = self._get_date_range(request)
        limit = int(request.query_params.get('limit', 10))
        
        # Check cache
        cache_params = {
            'start': start_date.isoformat() if start_date else None,
            'end': end_date.isoformat(),
            'period': period,
            'limit': limit
        }
        cache_key = self._get_cache_key('top_products', cache_params)
        cached_data = cache.get(cache_key)
        
        if cached_data:
            return Response(cached_data)
        
        sale_items_qs = SaleItem.objects.filter(
            sale__payment_status__in=['partial', 'paid']
        ).select_related('product')
        
        if start_date:
            sale_items_qs = sale_items_qs.filter(
                sale__sale_date__gte=start_date,
                sale__sale_date__lte=end_date
            )

        # Top by revenue
        top_by_revenue = sale_items_qs.values(
            'product__id',
            'product__name',
            'product__sku',
            'product__cost_price',
            'product__selling_price'
        ).annotate(
            total_quantity=Sum('quantity'),
            total_revenue=Coalesce(
                Sum(F('quantity') * F('unit_price')),
                Value(0),
                output_field=DecimalField()
            ),
            total_cost=Coalesce(
                Sum(F('quantity') * F('product__cost_price')),
                Value(0),
                output_field=DecimalField()
            ),
            times_sold=Count('sale', distinct=True)
        ).order_by('-total_revenue')[:limit]

        products_revenue = []
        for item in top_by_revenue:
            revenue = self._quantize(item['total_revenue'])
            cost = self._quantize(item['total_cost'])
            profit = revenue - cost
            profit_margin = ((profit / revenue * 100) if revenue > 0 else 0)
            
            products_revenue.append({
                'product_id': item['product__id'],
                'product_name': item['product__name'],
                'sku': item['product__sku'],
                'quantity_sold': item['total_quantity'],
                'revenue': str(revenue),
                'profit': str(profit),
                'profit_margin': round(float(profit_margin), 2),
                'times_sold': item['times_sold'],
            })

        # Top by quantity
        top_by_quantity = sale_items_qs.values(
            'product__id',
            'product__name',
            'product__sku'
        ).annotate(
            total_quantity=Sum('quantity'),
            total_revenue=Coalesce(
                Sum(F('quantity') * F('unit_price')),
                Value(0),
                output_field=DecimalField()
            )
        ).order_by('-total_quantity')[:limit]

        products_quantity = [
            {
                'product_id': item['product__id'],
                'product_name': item['product__name'],
                'sku': item['product__sku'],
                'quantity_sold': item['total_quantity'],
                'revenue': str(self._quantize(item['total_revenue'])),
            }
            for item in top_by_quantity
        ]

        result = {
            'by_revenue': products_revenue,
            'by_quantity': products_quantity
        }
        
        # Cache for 5 minutes
        cache.set(cache_key, result, 300)
        return Response(result)

    @action(detail=False, methods=['get'])
    def category_performance(self, request):
        """
        GET /api/sales/analytics/category_performance/
        Sales performance by category (cached)
        """
        start_date, end_date, period = self._get_date_range(request)
        
        # Check cache
        cache_params = {
            'start': start_date.isoformat() if start_date else None,
            'end': end_date.isoformat(),
            'period': period
        }
        cache_key = self._get_cache_key('category_performance', cache_params)
        cached_data = cache.get(cache_key)
        
        if cached_data:
            return Response(cached_data)
        
        sale_items_qs = SaleItem.objects.filter(
            sale__payment_status__in=['partial', 'paid']
        ).select_related('product__category')
        
        if start_date:
            sale_items_qs = sale_items_qs.filter(
                sale__sale_date__gte=start_date,
                sale__sale_date__lte=end_date
            )

        category_data = sale_items_qs.values(
            'product__category__id',
            'product__category__name'
        ).annotate(
            total_quantity=Sum('quantity'),
            total_revenue=Coalesce(
                Sum(F('quantity') * F('unit_price')),
                Value(0),
                output_field=DecimalField()
            ),
            total_cost=Coalesce(
                Sum(F('quantity') * F('product__cost_price')),
                Value(0),
                output_field=DecimalField()
            ),
            product_count=Count('product', distinct=True),
            sales_count=Count('sale', distinct=True)
        ).order_by('-total_revenue')

        results = []
        for item in category_data:
            revenue = self._quantize(item['total_revenue'])
            cost = self._quantize(item['total_cost'])
            profit = revenue - cost
            profit_margin = ((profit / revenue * 100) if revenue > 0 else 0)
            
            results.append({
                'category_id': item['product__category__id'],
                'category_name': item['product__category__name'] or 'Uncategorized',
                'quantity_sold': item['total_quantity'],
                'revenue': str(revenue),
                'profit': str(profit),
                'profit_margin': round(float(profit_margin), 2),
                'product_count': item['product_count'],
                'sales_count': item['sales_count'],
            })

        result = {'categories': results}
        
        # Cache for 5 minutes
        cache.set(cache_key, result, 300)
        return Response(result)

    @action(detail=False, methods=['get'])
    def customer_analytics(self, request):
        """
        GET /api/sales/analytics/customer_analytics/
        Customer purchase analytics (cached)
        """
        start_date, end_date, period = self._get_date_range(request)
        limit = int(request.query_params.get('limit', 10))
        
        # Check cache
        cache_params = {
            'start': start_date.isoformat() if start_date else None,
            'end': end_date.isoformat(),
            'period': period,
            'limit': limit
        }
        cache_key = self._get_cache_key('customer_analytics', cache_params)
        cached_data = cache.get(cache_key)
        
        if cached_data:
            return Response(cached_data)
        
        sales_qs = Sale.objects.select_related('customer').exclude(
            payment_status__in=['cancelled', 'refunded']
        )
        if start_date:
            sales_qs = sales_qs.filter(sale_date__gte=start_date, sale_date__lte=end_date)

        # Top customers by revenue
        top_customers = sales_qs.values(
            'customer__id',
            'customer__name',
            'customer__email',
            'customer__phone'
        ).annotate(
            total_purchases=Count('id'),
            total_spent=Coalesce(Sum('total_amount'), Value(0), output_field=DecimalField()),
            total_paid=Coalesce(Sum('paid_amount'), Value(0), output_field=DecimalField()),
            total_due=Coalesce(
                Sum(F('total_amount') - F('paid_amount') - F('refunded_amount')),
                Value(0),
                output_field=DecimalField()
            ),
            avg_order=Coalesce(Avg('total_amount'), Value(0), output_field=DecimalField())
        ).order_by('-total_spent')[:limit]

        customers = [
            {
                'customer_id': item['customer__id'],
                'customer_name': item['customer__name'],
                'email': item['customer__email'],
                'phone': item['customer__phone'],
                'total_purchases': item['total_purchases'],
                'total_spent': str(self._quantize(item['total_spent'])),
                'total_paid': str(self._quantize(item['total_paid'])),
                'total_due': str(self._quantize(item['total_due'])),
                'average_order': str(self._quantize(item['avg_order'])),
            }
            for item in top_customers
        ]

        # Customer segments
        all_customers = sales_qs.values('customer__id').annotate(
            total_spent=Coalesce(Sum('total_amount'), Value(0), output_field=DecimalField())
        )
        
        high_value = all_customers.filter(total_spent__gte=10000).count()
        medium_value = all_customers.filter(total_spent__gte=5000, total_spent__lt=10000).count()
        low_value = all_customers.filter(total_spent__lt=5000).count()

        result = {
            'top_customers': customers,
            'customer_segments': {
                'high_value': high_value,
                'medium_value': medium_value,
                'low_value': low_value,
                'total_customers': all_customers.count()
            }
        }
        
        # Cache for 5 minutes
        cache.set(cache_key, result, 300)
        return Response(result)

    @action(detail=False, methods=['get'])
    def inventory_insights(self, request):
        """
        GET /api/sales/analytics/inventory_insights/
        Inventory health and insights (cached)
        """
        # Check cache
        cache_key = 'inventory_insights'
        cached_data = cache.get(cache_key)
        
        if cached_data:
            return Response(cached_data)
        
        # Low stock products
        low_stock = list(Product.objects.filter(
            stock_quantity__lte=F('min_stock_level'),
            stock_quantity__gt=0
        ).values(
            'id', 'name', 'sku', 'stock_quantity', 'min_stock_level', 'selling_price'
        ).order_by('stock_quantity')[:20])

        # Out of stock
        out_of_stock = Product.objects.filter(stock_quantity=0).count()

        # Inventory value
        inventory_value = Product.objects.aggregate(
            cost_value=Coalesce(
                Sum(F('stock_quantity') * F('cost_price')),
                Value(0),
                output_field=DecimalField()
            ),
            retail_value=Coalesce(
                Sum(F('stock_quantity') * F('selling_price')),
                Value(0),
                output_field=DecimalField()
            )
        )

        # Fast moving products (sold in last 30 days)
        thirty_days_ago = timezone.now() - timedelta(days=30)
        fast_moving = list(SaleItem.objects.filter(
            sale__sale_date__gte=thirty_days_ago,
            sale__payment_status__in=['partial', 'paid']
        ).values(
            'product__id',
            'product__name',
            'product__stock_quantity'
        ).annotate(
            quantity_sold=Sum('quantity')
        ).order_by('-quantity_sold')[:10])

        # Slow moving products (not sold in last 60 days)
        sixty_days_ago = timezone.now() - timedelta(days=60)
        slow_moving_ids = SaleItem.objects.filter(
            sale__sale_date__gte=sixty_days_ago
        ).values_list('product_id', flat=True).distinct()
        
        slow_moving = list(Product.objects.exclude(
            id__in=slow_moving_ids
        ).filter(
            stock_quantity__gt=0
        ).values(
            'id', 'name', 'sku', 'stock_quantity', 'cost_price'
        )[:10])

        result = {
            'low_stock_products': low_stock,
            'out_of_stock_count': out_of_stock,
            'inventory_value': {
                'cost_value': str(self._quantize(inventory_value['cost_value'])),
                'retail_value': str(self._quantize(inventory_value['retail_value'])),
                'potential_profit': str(
                    self._quantize(inventory_value['retail_value']) - 
                    self._quantize(inventory_value['cost_value'])
                )
            },
            'fast_moving_products': [
                {
                    'product_id': item['product__id'],
                    'product_name': item['product__name'],
                    'quantity_sold': item['quantity_sold'],
                    'current_stock': item['product__stock_quantity']
                }
                for item in fast_moving
            ],
            'slow_moving_products': slow_moving
        }
        
        # Cache for 10 minutes (inventory changes less frequently)
        cache.set(cache_key, result, 600)
        return Response(result)

    @action(detail=False, methods=['get'])
    def payment_analytics(self, request):
        """
        GET /api/sales/analytics/payment_analytics/
        Payment collection and outstanding analytics (cached)
        """
        start_date, end_date, period = self._get_date_range(request)
        
        # Check cache
        cache_params = {
            'start': start_date.isoformat() if start_date else None,
            'end': end_date.isoformat(),
            'period': period
        }
        cache_key = self._get_cache_key('payment_analytics', cache_params)
        cached_data = cache.get(cache_key)
        
        if cached_data:
            return Response(cached_data)
        
        sales_qs = Sale.objects.all()
        if start_date:
            sales_qs = sales_qs.filter(sale_date__gte=start_date, sale_date__lte=end_date)

        # Outstanding amounts
        outstanding = sales_qs.filter(
            payment_status__in=['pending', 'partial']
        ).aggregate(
            total_outstanding=Coalesce(
                Sum(F('total_amount') - F('paid_amount') - F('refunded_amount')),
                Value(0),
                output_field=DecimalField()
            ),
            count=Count('id')
        )

        # Overdue payments
        overdue = sales_qs.filter(
            payment_status__in=['pending', 'partial'],
            due_date__lt=timezone.now().date()
        ).aggregate(
            total_overdue=Coalesce(
                Sum(F('total_amount') - F('paid_amount') - F('refunded_amount')),
                Value(0),
                output_field=DecimalField()
            ),
            count=Count('id')
        )

        # Collection rate
        total_billed = sales_qs.exclude(
            payment_status='cancelled'
        ).aggregate(
            total=Coalesce(Sum('total_amount'), Value(0), output_field=DecimalField())
        )['total']
        
        total_collected = sales_qs.aggregate(
            total=Coalesce(Sum('paid_amount'), Value(0), output_field=DecimalField())
        )['total']
        
        collection_rate = ((self._quantize(total_collected) / self._quantize(total_billed) * 100) 
                          if total_billed > 0 else 0)

        result = {
            'outstanding': {
                'amount': str(self._quantize(outstanding['total_outstanding'])),
                'count': outstanding['count']
            },
            'overdue': {
                'amount': str(self._quantize(overdue['total_overdue'])),
                'count': overdue['count']
            },
            'collection_rate': round(float(collection_rate), 2),
            'total_billed': str(self._quantize(total_billed)),
            'total_collected': str(self._quantize(total_collected))
        }
        
        # Cache for 5 minutes
        cache.set(cache_key, result, 300)
        return Response(result)