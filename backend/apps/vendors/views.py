from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from apps.vendors.models import Vendor
from .serializers import VendorSerializer

class VendorViewSet(viewsets.ViewSet):
    """ViewSet for vendor details management"""
    permission_classes = [IsAuthenticated]
    
    def create(self, request):
        """Create a new vendor and associate with the current user"""
        user = request.user
        
        # Check if user already has a vendor
        if hasattr(user, 'vendor') and user.vendor:
            return Response(
                {'error': 'User already has an associated vendor'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = VendorSerializer(data=request.data)
        if serializer.is_valid():
            # Create vendor
            vendor = serializer.save()
            
            # Associate vendor with user (User has ForeignKey to Vendor)
            user.vendor = vendor
            user.save()
            
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def list(self, request):
        """Get vendor details"""
        if not hasattr(request.user, 'vendor') or not request.user.vendor:
            return Response(
                {'error': 'No vendor associated with this user'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        serializer = VendorSerializer(request.user.vendor)
        return Response(serializer.data)
    
    def partial_update(self, request, pk=None):
        """Update vendor details (only for admin/manager)"""
        user = request.user
        
        if user.role not in ['admin', 'manager', 'owner']:
            return Response(
                {'error': 'Permission denied. Only admins and managers can update vendor details.'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        if not hasattr(user, 'vendor') or not user.vendor:
            return Response(
                {'error': 'No vendor associated with this user'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        if pk != str(user.vendor.id):
            return Response(
                {'error': 'You can only update your own vendor details'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = VendorSerializer(user.vendor, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)