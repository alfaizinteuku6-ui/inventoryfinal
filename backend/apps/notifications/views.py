# backend/apps/notifications/views.py
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from django.db.models import Q
from .models import Notification
from .serializers import NotificationSerializer, NotificationMarkReadSerializer
from .services import NotificationService

class NotificationViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for notifications
    
    list: Get all notifications
    retrieve: Get specific notification
    mark_as_read: Mark notification(s) as read
    mark_all_read: Mark all notifications as read
    dismiss: Dismiss notification
    generate: Manually trigger notification generation
    stats: Get notification statistics
    """
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Filter notifications with optional query parameters"""
        queryset = Notification.objects.select_related(
            'product', 'sale', 'customer'
        ).all()
        
        # Filter by read status
        is_read = self.request.query_params.get('is_read', None)
        if is_read is not None:
            is_read_bool = is_read.lower() == 'true'
            queryset = queryset.filter(is_read=is_read_bool)
        
        # Filter by dismissed status
        is_dismissed = self.request.query_params.get('is_dismissed', None)
        if is_dismissed is not None:
            is_dismissed_bool = is_dismissed.lower() == 'true'
            queryset = queryset.filter(is_dismissed=is_dismissed_bool)
        
        # Filter by alert type
        alert_type = self.request.query_params.get('alert_type', None)
        if alert_type:
            queryset = queryset.filter(alert_type=alert_type)
        
        # Filter by priority
        priority = self.request.query_params.get('priority', None)
        if priority:
            queryset = queryset.filter(priority=priority)
        
        # Exclude dismissed by default
        exclude_dismissed = self.request.query_params.get('exclude_dismissed', 'true')
        if exclude_dismissed.lower() == 'true':
            queryset = queryset.filter(is_dismissed=False)
        
        return queryset.order_by('-created_at')
    
    @action(detail=True, methods=['post'])
    def mark_as_read(self, request, pk=None):
        """Mark a specific notification as read"""
        notification = self.get_object()
        notification.is_read = True
        notification.read_at = timezone.now()
        notification.save(update_fields=['is_read', 'read_at'])
        
        serializer = self.get_serializer(notification)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def mark_all_read(self, request):
        """Mark all unread notifications as read"""
        serializer = NotificationMarkReadSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        notification_ids = serializer.validated_data.get('notification_ids', [])
        
        if notification_ids:
            # Mark specific notifications
            updated = Notification.objects.filter(
                id__in=notification_ids,
                is_read=False
            ).update(
                is_read=True,
                read_at=timezone.now()
            )
        else:
            # Mark all unread notifications
            updated = Notification.objects.filter(
                is_read=False
            ).update(
                is_read=True,
                read_at=timezone.now()
            )
        
        return Response({
            'success': True,
            'message': f'{updated} notification(s) marked as read'
        })
    
    @action(detail=True, methods=['post'])
    def dismiss(self, request, pk=None):
        """Dismiss a notification"""
        notification = self.get_object()
        notification.is_dismissed = True
        notification.save(update_fields=['is_dismissed'])
        
        return Response({
            'success': True,
            'message': 'Notification dismissed'
        })
    
    @action(detail=False, methods=['post'])
    def generate(self, request):
        """
        Manually trigger notification generation
        Admin/Manager only action
        """
        if not request.user.role in ['owner', 'admin', 'manager']:
            return Response(
                {'error': 'Permission denied'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        alerts = NotificationService.generate_all_alerts()
        
        return Response({
            'success': True,
            'message': f'Generated {len(alerts)} new notification(s)',
            'count': len(alerts)
        })
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get notification statistics"""
        total = Notification.objects.count()
        unread = Notification.objects.filter(is_read=False, is_dismissed=False).count()
        by_priority = {}
        by_type = {}
        
        for priority, _ in Notification.PRIORITY_LEVELS:
            count = Notification.objects.filter(
                priority=priority,
                is_read=False,
                is_dismissed=False
            ).count()
            by_priority[priority] = count
        
        for alert_type, _ in Notification.ALERT_TYPES:
            count = Notification.objects.filter(
                alert_type=alert_type,
                is_read=False,
                is_dismissed=False
            ).count()
            if count > 0:
                by_type[alert_type] = count
        
        return Response({
            'total': total,
            'unread': unread,
            'by_priority': by_priority,
            'by_type': by_type
        })
    
    @action(detail=False, methods=['get'])
    def recent(self, request):
        """Get recent notifications (last 24 hours)"""
        twenty_four_hours_ago = timezone.now() - timezone.timedelta(hours=24)
        
        recent_notifications = Notification.objects.filter(
            created_at__gte=twenty_four_hours_ago,
            is_dismissed=False
        ).select_related('product', 'sale', 'customer')[:20]
        
        serializer = self.get_serializer(recent_notifications, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['delete'])
    def cleanup(self, request):
        """
        Cleanup old read/dismissed notifications
        Admin only action
        """
        if not request.user.role in ['owner', 'admin']:
            return Response(
                {'error': 'Permission denied'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        days = int(request.query_params.get('days', 30))
        deleted = NotificationService.cleanup_old_notifications(days)
        
        return Response({
            'success': True,
            'message': f'Deleted {deleted} old notification(s)',
            'deleted_count': deleted
        })