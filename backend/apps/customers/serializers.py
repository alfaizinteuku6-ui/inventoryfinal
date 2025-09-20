from rest_framework import serializers
from .models import Customer

class CustomerSerializer(serializers.ModelSerializer):
    total_spent = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    orders_count = serializers.IntegerField(read_only=True)
    class Meta:
        model = Customer
        fields = [
            'id', 'name', 'customer_type', 'email', 'phone',
            'address', 'city', 'state', 'postal_code',
            'tax_number', 'credit_limit', 'created_at', 'updated_at',
            'total_spent', 'orders_count'
        ]