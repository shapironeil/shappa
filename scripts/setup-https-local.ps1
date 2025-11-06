# Requires running PowerShell as Administrator
# Adds www.localhost to hosts, imports cert into LocalMachine Root, restarts node server

# Check for admin
$principal = New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())
if (-not $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    Write-Error "This script must be run as Administrator. Open PowerShell as Administrator and retry."
    exit 1
}

$hostsPath = "${env:SystemRoot}\System32\drivers\etc\hosts"
$entry = "127.0.0.1    www.localhost"

try {
    $exists = Select-String -Path $hostsPath -Pattern 'www.localhost' -SimpleMatch -Quiet
} catch {
    $exists = $false
}

if (-not $exists) {
    Add-Content -Path $hostsPath -Value "`n$entry"
    Write-Output "HOSTS_ADDED"
} else {
    Write-Output "HOSTS_EXISTS"
}

# Import certificate into LocalMachine Trusted Root
$certPath = Join-Path $PSScriptRoot '..\ssl\cert.cer'
if (Test-Path $certPath) {
    Write-Output "Importing certificate $certPath into LocalMachine\Root..."
    certutil -f -addstore Root "$certPath"
    Write-Output "CERT_IMPORTED"
} else {
    Write-Output "CERT_NOT_FOUND: $certPath"
}

# Restart Node server
Write-Output "Killing existing node processes (if any)..."
try { taskkill /IM node.exe /F } catch { }
Start-Process -FilePath "node" -ArgumentList "server.js" -WorkingDirectory (Resolve-Path "$PSScriptRoot\..") -NoNewWindow
Write-Output "SERVER_STARTED"
