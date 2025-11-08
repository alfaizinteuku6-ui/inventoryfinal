# SSL Certificate Generation Script for Nginx
param(
    [string]$CertPath,
    [string]$KeyPath
)

$ErrorActionPreference = 'Stop'

try {
    Write-Host "  Generating self-signed SSL certificate..." -ForegroundColor Cyan
    
    # Certificate parameters
    $certSubject = 'CN=localhost'
    $dnsNames = @('localhost', '127.0.0.1', 'localhost.localdomain')
    
    # Create the certificate
    $cert = New-SelfSignedCertificate `
        -Subject $certSubject `
        -DnsName $dnsNames `
        -CertStoreLocation 'Cert:\CurrentUser\My' `
        -KeyExportPolicy Exportable `
        -KeySpec Signature `
        -KeyLength 2048 `
        -KeyAlgorithm RSA `
        -HashAlgorithm SHA256 `
        -NotBefore (Get-Date) `
        -NotAfter (Get-Date).AddYears(5) `
        -KeyUsage DigitalSignature,KeyEncipherment `
        -TextExtension @('2.5.29.37={text}1.3.6.1.5.5.7.3.1')
    
    $thumbprint = $cert.Thumbprint
    Write-Host "  ✓ Certificate created with thumbprint: $thumbprint" -ForegroundColor Green
    
    # Export to PFX (temporary)
    $certStorePath = "Cert:\CurrentUser\My\$thumbprint"
    $pfxPassword = ConvertTo-SecureString -String 'TempPassword123!' -Force -AsPlainText
    $pfxPath = Join-Path $env:TEMP 'nginx_cert.pfx'
    
    Export-PfxCertificate -Cert $certStorePath -FilePath $pfxPath -Password $pfxPassword | Out-Null
    Write-Host '  ✓ Exported to PFX' -ForegroundColor Green
    
    # Remove from certificate store
    Remove-Item $certStorePath -Force
    
    # Load PFX
    $pfxCert = New-Object System.Security.Cryptography.X509Certificates.X509Certificate2(
        $pfxPath, 
        'TempPassword123!', 
        [System.Security.Cryptography.X509Certificates.X509KeyStorageFlags]::Exportable
    )
    
    # Export certificate to PEM format
    $certBytes = $pfxCert.Export([System.Security.Cryptography.X509Certificates.X509ContentType]::Cert)
    $certPem = "-----BEGIN CERTIFICATE-----`n"
    $certPem += [Convert]::ToBase64String($certBytes, [System.Base64FormattingOptions]::InsertLineBreaks)
    $certPem += "`n-----END CERTIFICATE-----`n"
    [System.IO.File]::WriteAllText($CertPath, $certPem, [System.Text.Encoding]::ASCII)
    Write-Host '  ✓ Certificate file created' -ForegroundColor Green
    
    # Export private key to PEM format
    $rsa = [System.Security.Cryptography.X509Certificates.RSACertificateExtensions]::GetRSAPrivateKey($pfxCert)
    if ($null -eq $rsa) {
        throw 'Failed to extract private key from certificate'
    }
    
    $keyBytes = $rsa.ExportRSAPrivateKey()
    $keyPem = "-----BEGIN RSA PRIVATE KEY-----`n"
    $keyPem += [Convert]::ToBase64String($keyBytes, [System.Base64FormattingOptions]::InsertLineBreaks)
    $keyPem += "`n-----END RSA PRIVATE KEY-----`n"
    [System.IO.File]::WriteAllText($KeyPath, $keyPem, [System.Text.Encoding]::ASCII)
    Write-Host '  ✓ Private key file created' -ForegroundColor Green
    
    # Cleanup
    if (Test-Path $pfxPath) {
        Remove-Item $pfxPath -Force -ErrorAction SilentlyContinue
    }
    $pfxCert.Dispose()
    
    Write-Host '  ✓ SSL certificate generated successfully' -ForegroundColor Green
    exit 0
    
} catch {
    Write-Host "  ✗ SSL generation failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "  Details: $($_.Exception.GetType().FullName)" -ForegroundColor Yellow
    if ($_.ScriptStackTrace) {
        Write-Host "  Stack trace:" -ForegroundColor Yellow
        $_.ScriptStackTrace -split "`r?`n" | ForEach-Object {
            Write-Host "    $_" -ForegroundColor DarkYellow
        }
    }
    exit 1
}