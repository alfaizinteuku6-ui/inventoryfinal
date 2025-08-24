from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from .models import Vendor
from .serializers import VendorSerializer

class VendorViewSet(viewsets.ModelViewSet):
    queryset = Vendor.objects.all()
    serializer_class = VendorSerializer
    
    # Add filtering and searching capabilities
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['city', 'state', 'country']
    search_fields = ['name', 'email', 'contact_person', 'tax_number']
    ordering_fields = ['name', 'created_at']