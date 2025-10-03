from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from .models import Customer
from django.db.models import Sum, Count, Q, Case, When, DecimalField
from .serializers import CustomerSerializer
from config.pagination import StandardResultsSetPagination

class CustomerViewSet(viewsets.ModelViewSet):
    serializer_class = CustomerSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['customer_type', 'city', 'state']
    search_fields = ['name', 'email', 'phone']
    ordering_fields = ['name', 'created_at', 'total_spent', 'orders_count']
    pagination_class = StandardResultsSetPagination
    def get_queryset(self):
        """Annotate with sales data considering refunds"""
        return Customer.objects.filter(is_active=True).annotate(
            # Net amount spent (paid - refunded)
            total_spent=Sum(
                Case(
                    When(
                        sale__payment_status__in=['paid', 'partial', 'refunded'],
                        then='sale__paid_amount'
                    ),
                    default=0,
                    output_field=DecimalField(max_digits=12, decimal_places=2)
                )
            ) - Sum(
                Case(
                    When(
                        sale__payment_status__in=['paid', 'partial', 'refunded'],
                        then='sale__refunded_amount'
                    ),
                    default=0,
                    output_field=DecimalField(max_digits=12, decimal_places=2)
                )
            ),
            # Count all sales except cancelled
            orders_count=Count(
                'sale',
                filter=~Q(sale__payment_status='cancelled')
            )
        ).distinct()

    def perform_destroy(self, instance):
        instance.is_active = False
        instance.save()