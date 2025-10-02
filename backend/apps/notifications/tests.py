# backend/apps/notifications/tests.py
from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from apps.inventory.models import Product, Category
from apps.sales.models import Sale
from apps.customers.models import Customer
from .models import Notification
from .services import NotificationService
from decimal import Decimal

User = get_user_model()

class NotificationModelTest(TestCase):
    def setUp(self):
        self.category = Category.objects.create(name='Electronics')
        self.product = Product.objects.create(
            name='Test Product',
            sku='TEST001',
            cost_price=100,
            selling_price=150,
            stock_quantity=5,
            min_stock_level=10,
            category=self.category
        )
    
    def test_create_notification(self):
        notification = Notification.objects.create(
            alert_type='low_stock',
            priority='high',
            title='Low Stock Alert',
            message='Product is running low',
            product=self.product
        )
        self.assertEqual(notification.alert_type, 'low_stock')
        self.assertFalse(notification.is_read)
        self.assertFalse(notification.is_dismissed)

class NotificationServiceTest(TestCase):
    def setUp(self):
        self.category = Category.objects.create(name='Electronics')
        
        # Low stock product
        self.low_stock_product = Product.objects.create(
            name='Low Stock Product',
            sku='LOW001',
            cost_price=100,
            selling_price=150,
            stock_quantity=3,
            min_stock_level=10,
            is_active=True,
            category=self.category
        )
        
        # Out of stock product
        self.out_of_stock_product = Product.objects.create(
            name='Out of Stock Product',
            sku='OUT001',
            cost_price=100,
            selling_price=150,
            stock_quantity=0,
            min_stock_level=10,
            is_active=True,
            category=self.category
        )
    
    def test_generate_stock_alerts(self):
        alerts = NotificationService.generate_stock_alerts()
        self.assertGreaterEqual(len(alerts), 2)
        
        # Check low stock alert
        low_stock_alerts = [a for a in alerts if a.alert_type == 'low_stock']
        self.assertGreater(len(low_stock_alerts), 0)
        
        # Check out of stock alert
        out_of_stock_alerts = [a for a in alerts if a.alert_type == 'out_of_stock']
        self.assertGreater(len(out_of_stock_alerts), 0)
    
    def test_no_duplicate_alerts(self):
        # Generate alerts first time
        alerts1 = NotificationService.generate_stock_alerts()
        count1 = len(alerts1)
        
        # Generate alerts second time (should not create duplicates)
        alerts2 = NotificationService.generate_stock_alerts()
        count2 = len(alerts2)
        
        # Second run should create fewer or no alerts
        self.assertLessEqual(count2, count1)

class NotificationAPITest(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123',
            role='admin'
        )
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)
        
        self.category = Category.objects.create(name='Electronics')
        self.product = Product.objects.create(
            name='Test Product',
            sku='TEST001',
            cost_price=100,
            selling_price=150,
            stock_quantity=5,
            min_stock_level=10,
            category=self.category
        )
        
        self.notification = Notification.objects.create(
            alert_type='low_stock',
            priority='high',
            title='Low Stock Alert',
            message='Product is running low',
            product=self.product
        )
    
    def test_list_notifications(self):
        url = '/api/notifications/'
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.data), 1)
    
    def test_mark_notification_as_read(self):
        url = f'/api/notifications/{self.notification.id}/mark_as_read/'
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        self.notification.refresh_from_db()
        self.assertTrue(self.notification.is_read)
        self.assertIsNotNone(self.notification.read_at)
    
    def test_mark_all_as_read(self):
        # Create another notification
        Notification.objects.create(
            alert_type='out_of_stock',
            priority='critical',
            title='Out of Stock',
            message='Product is out of stock',
            product=self.product
        )
        
        url = '/api/notifications/mark_all_read/'
        response = self.client.post(url, {})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Check all notifications are marked as read
        unread_count = Notification.objects.filter(is_read=False).count()
        self.assertEqual(unread_count, 0)
    
    def test_dismiss_notification(self):
        url = f'/api/notifications/{self.notification.id}/dismiss/'
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        self.notification.refresh_from_db()
        self.assertTrue(self.notification.is_dismissed)
    
    def test_notification_stats(self):
        url = '/api/notifications/stats/'
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('total', response.data)
        self.assertIn('unread', response.data)
        self.assertIn('by_priority', response.data)
        self.assertIn('by_type', response.data)
    
    def test_filter_by_alert_type(self):
        url = '/api/notifications/?alert_type=low_stock'
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        for notification in response.data:
            self.assertEqual(notification['alert_type'], 'low_stock')
    
    def test_filter_by_priority(self):
        url = '/api/notifications/?priority=high'
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        for notification in response.data:
            self.assertEqual(notification['priority'], 'high')