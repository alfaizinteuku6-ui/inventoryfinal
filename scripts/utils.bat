@echo off

:refresh_env
:: Refresh PATH without restarting
for /f "tokens=2*" %%a in ('reg query "HKLM\System\CurrentControlSet\Control\Session Manager\Environment" /v Path 2^>nul') do set "SysPath=%%b"
for /f "tokens=2*" %%a in ('reg query "HKCU\Environment" /v Path 2^>nul') do set "UserPath=%%b"
set "PATH=%SysPath%;%UserPath%"
goto :eof

:create_user_script
:: Create Python script for user creation
if not exist create_users.py (
    (
        echo from django.contrib.auth import get_user_model
        echo.
        echo User = get_user_model^(^)
        echo.
        echo users = [
        echo     {'username': 'admin', 'email': 'admin@test.com', 'password': 'admin123', 'is_staff': True, 'is_superuser': True},
        echo     {'username': 'testuser1', 'email': 'user1@test.com', 'password': 'test123', 'is_staff': False, 'is_superuser': False},
        echo     {'username': 'testuser2', 'email': 'user2@test.com', 'password': 'test123', 'is_staff': False, 'is_superuser': False}
        echo ]
        echo.
        echo for user_data in users:
        echo     username = user_data['username']
        echo     if not User.objects.filter^(username=username^).exists^(^):
        echo         User.objects.create_user^(**user_data^)
        echo         print^(f"Created user: {username}"^)
        echo     else:
        echo         print^(f"User {username} already exists"^)
    ) > create_users.py
)
goto :eof