from django.contrib.auth import get_user_model
User = get_user_model()
users = [
    {'username': 'admin', 'email': 'admin@test.com', 'password': 'admin123', 'is_staff': True, 'is_superuser': True},
    {'username': 'testuser1', 'email': 'user1@test.com', 'password': 'test123', 'is_staff': False, 'is_superuser': False},
    {'username': 'testuser2', 'email': 'user2@test.com', 'password': 'test123', 'is_staff': False, 'is_superuser': False}
]
for user_data in users:
    if not User.objects.filter(username=user_data['username']).exists():
        User.objects.create_user(**user_data)
        print(f"Created user: {user_data['username']}")
    else:
        print(f"User {user_data['username']} already exists")
