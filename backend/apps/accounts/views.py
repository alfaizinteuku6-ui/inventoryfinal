# backend/apps/accounts/views.py
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import check_password
from apps.vendors.models import Vendor
from .serializers import UserSerializer, StaffSerializer, PasswordChangeSerializer
from django.http import JsonResponse
from django.middleware.csrf import get_token
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny

User = get_user_model()

# backend/apps/auth/views.py

@api_view(['GET'])
@permission_classes([AllowAny])
def get_csrf_token(request):
    token = get_token(request)
    return JsonResponse({'csrfToken': token})

class UserProfileViewSet(viewsets.ViewSet):
    """ViewSet for user profile management"""
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['get', 'patch', 'put'])
    def me(self, request):
        """Get or update logged-in user's profile"""
        user = request.user

        if request.method in ['PATCH', 'PUT']:
            serializer = UserSerializer(user, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        # Default: GET
        serializer = UserSerializer(user)
        return Response(serializer.data)
    
    def list(self, request):
        """Get user profile"""
        serializer = UserSerializer(request.user)
        return Response(serializer.data)
    
    def partial_update(self, request, pk=None):
        """Update user profile"""
        if pk != str(request.user.id):
            return Response(
                {'error': 'You can only update your own profile'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['post'])
    def change_password(self, request):
        """Change user password"""
        serializer = PasswordChangeSerializer(data=request.data)
        
        if serializer.is_valid():
            user = request.user
            current_password = serializer.validated_data['current_password']
            new_password = serializer.validated_data['new_password']
            
            # Check current password
            if not check_password(current_password, user.password):
                return Response(
                    {'error': 'Current password is incorrect'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Set new password
            user.set_password(new_password)
            user.save()
            
            return Response({'message': 'Password changed successfully'})
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class StaffViewSet(viewsets.ModelViewSet):
    """ViewSet for staff management"""
    permission_classes = [IsAuthenticated]
    serializer_class = StaffSerializer
    
    def get_queryset(self):
        """Return staff members for the current user's vendor"""
        user = self.request.user
        
        if not hasattr(user, 'vendor') or not user.vendor:
            return User.objects.none()
        
        # Return all users in the same vendor except current user
        return User.objects.filter(vendor=user.vendor).exclude(id=user.id).filter(is_active=True)
    
    def list(self, request):
        """List staff members"""
        if request.user.role not in ['admin', 'manager', 'owner']:
            return Response(
                {'error': 'Permission denied. Only admins and managers can view staff.'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    def create(self, request):
        """Create new staff member"""
        if request.user.role not in ['admin', 'manager', 'owner']:
            return Response(
                {'error': 'Permission denied. Only admins and managers can add staff.'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        data = request.data.copy()
        
        # Create user with default password
        try:
            staff_user = User.objects.create_user(
                username=data['username'],
                email=data['email'],
                password='temppassword123',  # They should change this on first login
                first_name=data.get('first_name', ''),
                last_name=data.get('last_name', ''),
                phone=data.get('phone', ''),
                role=data.get('role', 'staff'),
                vendor=request.user.vendor,
                address=data.get('address', '')
            )
            
            serializer = self.get_serializer(staff_user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )
    
    def retrieve(self, request, pk=None):
        """Get specific staff member details"""
        if request.user.role not in ['admin', 'manager']:
            return Response(
                {'error': 'Permission denied'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            staff_member = self.get_queryset().get(id=pk)
            serializer = self.get_serializer(staff_member)
            return Response(serializer.data)
        except User.DoesNotExist:
            return Response(
                {'error': 'Staff member not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
    
    def partial_update(self, request, pk=None):
        """Update staff member details"""
        if request.user.role not in ['admin', 'manager']:
            return Response(
                {'error': 'Permission denied'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            staff_member = self.get_queryset().get(id=pk)
            serializer = self.get_serializer(staff_member, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except User.DoesNotExist:
            return Response(
                {'error': 'Staff member not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
    
    def destroy(self, request, pk=None):
        """Deactivate staff member"""
        if request.user.role not in ['admin', 'manager']:
            return Response(
                {'error': 'Permission denied'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            staff_member = self.get_queryset().get(id=pk)
            # Deactivate instead of delete to preserve data integrity
            staff_member.is_active_employee = False
            staff_member.save()
            return Response({'message': 'Staff member deactivated successfully'})
        except User.DoesNotExist:
            return Response(
                {'error': 'Staff member not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=True, methods=['post'])
    def reactivate(self, request, pk=None):
        """Reactivate a staff member"""
        if request.user.role not in ['admin', 'manager']:
            return Response(
                {'error': 'Permission denied'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            staff_member = self.get_queryset().get(id=pk)
            staff_member.is_active_employee = True
            staff_member.save()
            return Response({'message': 'Staff member reactivated successfully'})
        except User.DoesNotExist:
            return Response(
                {'error': 'Staff member not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
