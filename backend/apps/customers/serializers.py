from rest_framework import serializers
from .models import Customer

class CustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = [
            'id', 'name', 'customer_type', 'email', 'phone',
            'address', 'city', 'state', 'postal_code',
            'tax_number', 'credit_limit', 'created_at', 'updated_at'
        ]