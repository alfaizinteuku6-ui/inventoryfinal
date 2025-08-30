# Django Protection and Deployment Script
# Usage: .\deploy-protected.ps1 -ProjectName "myproject" -DeployPath "C:\deployed_apps"

param(
    [Parameter(Mandatory=$true)]
    [string]$ProjectName,
    
    [Parameter(Mandatory=$false)]
    [string]$DeployPath = "./backend",
    
    [Parameter(Mandatory=$false)]
    [switch]$RemoveSource = $false
)

$ErrorActionPreference = "Stop"

Write-Host "Starting Django Source Protection and Deployment..." -ForegroundColor Green
Write-Host "Project: $ProjectName" -ForegroundColor Yellow
Write-Host "Deploy Path: $DeployPath" -ForegroundColor Yellow

$FullDeployPath = Join-Path $DeployPath $ProjectName
$VenvPath = Join-Path $FullDeployPath "venv"
$ProtectedSrcPath = Join-Path $FullDeployPath "protected_src"

try {
    # Create deployment directory
    if (-not (Test-Path $FullDeployPath)) {
        New-Item -ItemType Directory -Path $FullDeployPath -Force | Out-Null
        Write-Host "✓ Created deployment directory" -ForegroundColor Green
    }

    # Install PyArmor
    $pyarmorInstalled = pip show pyarmor 2>$null
    if (-not $pyarmorInstalled) {
        Write-Host "Installing PyArmor..." -ForegroundColor Yellow
        pip install pyarmor
        Write-Host "✓ PyArmor installed" -ForegroundColor Green
    }

    # Create virtual environment
    Write-Host "Creating virtual environment..." -ForegroundColor Yellow
    python -m venv $VenvPath
    
    # Activate virtual environment and install requirements
    $activateScript = Join-Path $VenvPath "Scripts\Activate.ps1"
    & $activateScript
    
    if (Test-Path "requirements.txt") {
        Write-Host "Installing requirements..." -ForegroundColor Yellow
        pip install -r requirements.txt
        Write-Host "✓ Requirements installed" -ForegroundColor Green
    }

    # Obfuscate source code
    Write-Host "Obfuscating source code..." -ForegroundColor Yellow
    pyarmor gen --output $ProtectedSrcPath --recursive $ProjectName
    Write-Host "✓ Source code obfuscated" -ForegroundColor Green

    # Copy non-Python files
    $directories = @("static", "templates", "media")
    foreach ($dir in $directories) {
        $srcDir = Join-Path $ProjectName $dir
        if (Test-Path $srcDir) {
            $destDir = Join-Path $FullDeployPath $dir
            Copy-Item -Path $srcDir -Destination $destDir -Recurse -Force
            Write-Host "✓ Copied $dir directory" -ForegroundColor Green
        }
    }

    # Copy important files
    $files = @("manage.py", "requirements.txt", "*.txt", "*.md")
    foreach ($file in $files) {
        if (Test-Path $file) {
            Copy-Item -Path $file -Destination $FullDeployPath -Force
        }
    }

    # Create production settings
    $prodSettingsContent = @"
import os
from .$ProjectName.settings import *

DEBUG = False
ALLOWED_HOSTS = ['*']
SECRET_KEY = os.environ.get('DJANGO_SECRET_KEY', 'change-this-in-production')

# Security settings
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = 'DENY'
"@
    
    $settingsPath = Join-Path $ProtectedSrcPath "$ProjectName\settings_prod.py"
    $prodSettingsContent | Out-File -FilePath $settingsPath -Encoding UTF8
    Write-Host "✓ Created production settings" -ForegroundColor Green

    # Set file permissions (restrict access)
    Write-Host "Setting restrictive permissions..." -ForegroundColor Yellow
    icacls $FullDeployPath /grant "Administrators:F" /T | Out-Null
    icacls $FullDeployPath /remove "Users" /T | Out-Null
    Write-Host "✓ Permissions set" -ForegroundColor Green

    # Create startup script
    $startupScript = @"
@echo off
set DJANGO_SECRET_KEY=your-secret-key-here
set DJANGO_SETTINGS_MODULE=$ProjectName.settings_prod
cd /d "$FullDeployPath"
call venv\Scripts\activate.bat
python manage.py collectstatic --noinput --clear
python manage.py migrate
echo Server starting on http://localhost:8000
python manage.py runserver 0.0.0.0:8000
pause
"@
    
    $startupScriptPath = Join-Path $FullDeployPath "start_server.bat"
    $startupScript | Out-File -FilePath $startupScriptPath -Encoding ASCII
    Write-Host "✓ Created startup script" -ForegroundColor Green

    # Compile to bytecode
    Write-Host "Compiling to bytecode..." -ForegroundColor Yellow
    python -m compileall $ProtectedSrcPath -f
    Write-Host "✓ Compiled to bytecode" -ForegroundColor Green

    # Remove source files if requested
    if ($RemoveSource) {
        Write-Host "Removing source .py files..." -ForegroundColor Yellow
        Get-ChildItem -Path $ProtectedSrcPath -Filter "*.py" -Recurse | Remove-Item -Force
        Write-Host "✓ Source files removed" -ForegroundColor Green
    }

    # Create environment file template
    $envTemplate = @"
# Copy this to .env and fill in your values
DJANGO_SECRET_KEY=your-super-secret-key-here
DATABASE_URL=your-database-url
DEBUG=False
"@
    
    $envPath = Join-Path $FullDeployPath ".env.template"
    $envTemplate | Out-File -FilePath $envPath -Encoding UTF8

    Write-Host "`n" -NoNewline
    Write-Host "🎉 Deployment completed successfully!" -ForegroundColor Green
    Write-Host "📁 Protected code location: $FullDeployPath" -ForegroundColor Cyan
    Write-Host "🚀 To run server: $startupScriptPath" -ForegroundColor Cyan
    Write-Host "⚙️  Don't forget to:" -ForegroundColor Yellow
    Write-Host "   1. Set your SECRET_KEY in the environment" -ForegroundColor White
    Write-Host "   2. Configure your database settings" -ForegroundColor White
    Write-Host "   3. Update ALLOWED_HOSTS for production" -ForegroundColor White

} catch {
    Write-Host "❌ Error during deployment: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}