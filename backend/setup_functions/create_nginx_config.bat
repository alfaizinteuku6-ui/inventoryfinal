@echo off
setlocal enabledelayedexpansion

set "NGINX_CONF=%NGINX_DIR%\conf\nginx.conf"

:: Backup existing config if it exists
if exist "%NGINX_CONF%" (
    copy "%NGINX_CONF%" "%NGINX_CONF%.backup" >nul 2>&1
    powershell -Command Write-Host "  ✓ Backed up existing nginx.conf" -ForegroundColor Yellow
)

:: Convert paths to use forward slashes for Nginx
set "STATIC_PATH=%PROJECT_ROOT%\static"
set "STATIC_PATH=%STATIC_PATH:\=/%"
set "MEDIA_PATH=%PROJECT_ROOT%\media"
set "MEDIA_PATH=%MEDIA_PATH:\=/%"
set "SSL_CERT_PATH=%NGINX_DIR%\ssl\server.crt"
set "SSL_CERT_PATH=%SSL_CERT_PATH:\=/%"
set "SSL_KEY_PATH=%NGINX_DIR%\ssl\server.key"
set "SSL_KEY_PATH=%SSL_KEY_PATH:\=/%"

:: Check if SSL files exist
set "USE_SSL=0"
if exist "%NGINX_DIR%\ssl\server.crt" (
    if exist "%NGINX_DIR%\ssl\server.key" (
        set "USE_SSL=1"
    )
)

:: Create temporary file to build config
set "TEMP_CONF=%TEMP%\nginx_temp.conf"
if exist "%TEMP_CONF%" del "%TEMP_CONF%"

:: Write basic config
(
echo worker_processes 1;
echo.
echo events {
echo     worker_connections 1024;
echo }
echo.
echo http {
echo     include mime.types;
echo     default_type application/octet-stream;
echo     sendfile on;
echo     keepalive_timeout 65;
echo.
) > "%TEMP_CONF%"

:: Add SSL or non-SSL server block
if "!USE_SSL!"=="1" (
    (
    echo     # HTTP server - redirect to HTTPS
    echo     server {
    echo         listen 80;
    echo         server_name localhost;
    echo         return 301 https://$server_name$request_uri;
    echo     }
    echo.
    echo     # HTTPS server
    echo     server {
    echo         listen 443 ssl;
    echo         server_name localhost;
    echo.
    echo         ssl_certificate %SSL_CERT_PATH%;
    echo         ssl_certificate_key %SSL_KEY_PATH%;
    echo         ssl_protocols TLSv1.2 TLSv1.3;
    echo         ssl_ciphers HIGH:!aNULL:!MD5;
    echo         ssl_prefer_server_ciphers on;
    echo.
    ) >> "%TEMP_CONF%"
) else (
    (
    echo     # HTTP server only ^(SSL not available^)
    echo     server {
    echo         listen 80;
    echo         server_name localhost;
    echo.
    ) >> "%TEMP_CONF%"
)

:: Add common server configuration
(
echo         # Increase timeouts for long-running requests
echo         proxy_connect_timeout 600;
echo         proxy_send_timeout 600;
echo         proxy_read_timeout 600;
echo         send_timeout 600;
echo.
echo         # Client body size limit
echo         client_max_body_size 100M;
echo.
echo         # Static files
echo         location /static/ {
echo             alias %STATIC_PATH%/;
echo             expires 30d;
echo             add_header Cache-Control "public, immutable";
echo         }
echo.
echo         # Media files
echo         location /media/ {
echo             alias %MEDIA_PATH%/;
echo             expires 30d;
echo             add_header Cache-Control "public";
echo         }
echo.
echo         # Proxy all other requests to Django/Uvicorn
echo         location / {
echo             proxy_pass http://127.0.0.1:8000;
echo             proxy_set_header Host $host;
echo             proxy_set_header X-Real-IP $remote_addr;
echo             proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
echo             proxy_set_header X-Forwarded-Proto $scheme;
echo             proxy_redirect off;
echo.
echo             # WebSocket support
echo             proxy_http_version 1.1;
echo             proxy_set_header Upgrade $http_upgrade;
echo             proxy_set_header Connection "upgrade";
echo.
echo             # Buffering settings
echo             proxy_buffering off;
echo         }
echo     }
echo }
) >> "%TEMP_CONF%"

:: Move temp file to actual location
move /y "%TEMP_CONF%" "%NGINX_CONF%" >nul 2>&1

if exist "%NGINX_CONF%" (
    powershell -Command Write-Host "  ✓ Nginx configuration created at: %NGINX_CONF%" -ForegroundColor Green
    if "!USE_SSL!"=="0" (
        powershell -Command Write-Host "  ! SSL certificates not found - HTTP only mode" -ForegroundColor Yellow
    ) else (
        powershell -Command Write-Host "  ✓ SSL enabled - HTTPS mode" -ForegroundColor Green
    )
) else (
    powershell -Command Write-Host "  ✗ Failed to create nginx configuration" -ForegroundColor Red
    exit /b 1
)

echo.
echo Nginx config file: %NGINX_CONF%
echo.

exit /b 0