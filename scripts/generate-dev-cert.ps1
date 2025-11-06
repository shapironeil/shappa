<#
Genera un certificato self-signed con SAN per localhost e www.localhost
Esegui come amministratore
#>

$certPath = Join-Path $PSScriptRoot '..\\ssl'
if (-not (Test-Path $certPath)) { New-Item -ItemType Directory -Path $certPath -Force }

$dnsNames = @('localhost','www.localhost')
# Create certificate in CurrentUser store (no admin needed)
$cert = New-SelfSignedCertificate -DnsName $dnsNames -CertStoreLocation Cert:\CurrentUser\My -NotAfter (Get-Date).AddYears(5) -KeyLength 2048 -FriendlyName 'Shappa Local Dev'

# Export to PFX (includes private key)
$pwdPlain = 'shappa-dev'
$pwd = ConvertTo-SecureString -String $pwdPlain -Force -AsPlainText
$pvkPath = Join-Path $certPath 'key.pfx'
Export-PfxCertificate -Cert $cert -FilePath $pvkPath -Password $pwd -Force

# Export cert to DER then convert to PEM using certutil (available on Windows)
$derPath = Join-Path $certPath 'cert.cer'
$pemPath = Join-Path $certPath 'cert.pem'
Export-Certificate -Cert $cert -FilePath $derPath -Force

$certutil = Get-Command certutil -ErrorAction SilentlyContinue
if ($certutil) {
    & certutil -encode $derPath $pemPath > $null
    # certutil adds header/trailer, but encoding may include extra lines; ensure BEGIN/END present
    Write-Host "cert.pem created at $pemPath"
} else {
    Write-Host "certutil not found: exported DER to $derPath. Use certutil or OpenSSL to convert to PEM if needed."
}

Write-Host "PFX exported to $pvkPath. Certificate created in CurrentUser store. Password for PFX: $pwdPlain"
Write-Host "Import the PFX into Trusted Root or CurrentUser\Personal if needed, or copy files in $certPath to the server ssl folder."