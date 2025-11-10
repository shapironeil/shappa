# Script PowerShell per configurare automaticamente GitHub Secrets
# Requisiti: GitHub CLI (gh) installato e autenticato

param(
    [string]$SshKeyContent = "",
    [string]$DeployHost = "207.154.218.16",
    [string]$DeployUser = "deploy",
    [string]$DeployPath = "/var/www/shappa"
)

$repo = "shapironeil/shappa"

Write-Host "🔐 Configurazione Automatica GitHub Secrets" -ForegroundColor Cyan
Write-Host ""

# Verifica GitHub CLI
if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
    Write-Host "❌ GitHub CLI (gh) non trovato!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Installa GitHub CLI:" -ForegroundColor Yellow
    Write-Host "  winget install --id GitHub.cli" -ForegroundColor White
    Write-Host ""
    Write-Host "Poi autenticati e riprova:" -ForegroundColor Yellow
    Write-Host "  gh auth login" -ForegroundColor White
    Write-Host ""
    Write-Host "OPPURE configura manualmente su:" -ForegroundColor Yellow
    Write-Host "  https://github.com/$repo/settings/secrets/actions" -ForegroundColor White
    exit 1
}

# Verifica autenticazione
try {
    $null = gh auth status 2>&1
    if ($LASTEXITCODE -ne 0) {
        throw "Not authenticated"
    }
} catch {
    Write-Host "❌ Non autenticato con GitHub CLI!" -ForegroundColor Red
    Write-Host "Esegui: gh auth login" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ GitHub CLI trovato e autenticato" -ForegroundColor Green
Write-Host ""

# Configura SSH_PRIVATE_KEY
if ($SshKeyContent) {
    Write-Host "🔑 Configurazione SSH_PRIVATE_KEY..." -ForegroundColor Yellow
    $SshKeyContent | gh secret set SSH_PRIVATE_KEY --repo $repo
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ SSH_PRIVATE_KEY configurato" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Errore configurazione SSH_PRIVATE_KEY" -ForegroundColor Red
    }
} else {
    Write-Host "⚠️  SSH_PRIVATE_KEY non fornito. Configura manualmente." -ForegroundColor Yellow
    Write-Host "   Esegui sul server: bash scripts/setup-deploy-complete.sh" -ForegroundColor White
    Write-Host "   Poi copia la chiave e riprova con: -SshKeyContent '...'" -ForegroundColor White
}

# Configura DEPLOY_HOST
Write-Host "🌐 Configurazione DEPLOY_HOST..." -ForegroundColor Yellow
gh secret set DEPLOY_HOST --repo $repo --body $DeployHost
if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ DEPLOY_HOST configurato: $DeployHost" -ForegroundColor Green
} else {
    Write-Host "   ❌ Errore configurazione DEPLOY_HOST" -ForegroundColor Red
}

# Configura DEPLOY_USER
Write-Host "👤 Configurazione DEPLOY_USER..." -ForegroundColor Yellow
gh secret set DEPLOY_USER --repo $repo --body $DeployUser
if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ DEPLOY_USER configurato: $DeployUser" -ForegroundColor Green
} else {
    Write-Host "   ❌ Errore configurazione DEPLOY_USER" -ForegroundColor Red
}

# Configura DEPLOY_PATH
Write-Host "📁 Configurazione DEPLOY_PATH..." -ForegroundColor Yellow
gh secret set DEPLOY_PATH --repo $repo --body $DeployPath
if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ DEPLOY_PATH configurato: $DeployPath" -ForegroundColor Green
} else {
    Write-Host "   ❌ Errore configurazione DEPLOY_PATH" -ForegroundColor Red
}

# Verifica finale
Write-Host ""
Write-Host "🔍 Verifica Secrets Configurati" -ForegroundColor Cyan
Write-Host ""
gh secret list --repo $repo

Write-Host ""
Write-Host "✅ Configurazione completata!" -ForegroundColor Green
Write-Host ""
Write-Host "Prossimi passi:" -ForegroundColor Cyan
Write-Host "1. Verifica i secrets su: https://github.com/$repo/settings/secrets/actions" -ForegroundColor White
Write-Host "2. Triggera il deploy: https://github.com/$repo/actions" -ForegroundColor White
Write-Host ""

