from rest_framework import serializers
from .models import Vendor

class VendorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vendor
        fields = [
            'id', 'name', 'contact_person', 'email', 'phone',
            'address', 'city', 'state', 'postal_code', 'country',
            'tax_number', 'payment_terms', 'credit_limit',
            'created_at', 'updated_at'
        ]