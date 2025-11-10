# Script PowerShell per setup automatico deploy completo
# Questo script verifica e configura tutto il possibile automaticamente

Write-Host "🚀 Setup Automatico Deploy GitHub Actions" -ForegroundColor Cyan
Write-Host ""

$DEPLOY_HOST = "207.154.218.16"
$DEPLOY_USER = "deploy"
$DEPLOY_PATH = "/var/www/shappa"
$REPO = "shapironeil/shappa"

Write-Host "📋 Configurazione:" -ForegroundColor Yellow
Write-Host "   Host: $DEPLOY_HOST"
Write-Host "   User: $DEPLOY_USER"
Write-Host "   Path: $DEPLOY_PATH"
Write-Host ""

# Verifica GitHub CLI
$hasGh = Get-Command gh -ErrorAction SilentlyContinue
if (-not $hasGh) {
    Write-Host "⚠️  GitHub CLI non trovato" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Per configurare i secrets automaticamente:" -ForegroundColor White
    Write-Host "  1. Installa: winget install --id GitHub.cli" -ForegroundColor Gray
    Write-Host "  2. Autenticati: gh auth login" -ForegroundColor Gray
    Write-Host "  3. Riesegui questo script" -ForegroundColor Gray
    Write-Host ""
    Write-Host "OPPURE configura manualmente su:" -ForegroundColor White
    Write-Host "  https://github.com/$REPO/settings/secrets/actions" -ForegroundColor Cyan
    Write-Host ""
} else {
    Write-Host "✅ GitHub CLI trovato" -ForegroundColor Green
    
    # Verifica autenticazione
    try {
        $null = gh auth status 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ GitHub CLI autenticato" -ForegroundColor Green
            $isAuthenticated = $true
        } else {
            $isAuthenticated = $false
        }
    } catch {
        $isAuthenticated = $false
    }
    
    if ($isAuthenticated) {
        Write-Host ""
        Write-Host "🔍 Verifica secrets esistenti..." -ForegroundColor Yellow
        $secrets = gh secret list --repo $REPO 2>&1
        Write-Host $secrets
        Write-Host ""
        
        # Configura secrets se non esistono
        Write-Host "📝 Configurazione secrets..." -ForegroundColor Yellow
        
        # DEPLOY_HOST
        Write-Host "   Configurando DEPLOY_HOST..." -ForegroundColor Gray
        gh secret set DEPLOY_HOST --repo $REPO --body $DEPLOY_HOST 2>&1 | Out-Null
        
        # DEPLOY_USER
        Write-Host "   Configurando DEPLOY_USER..." -ForegroundColor Gray
        gh secret set DEPLOY_USER --repo $REPO --body $DEPLOY_USER 2>&1 | Out-Null
        
        # DEPLOY_PATH
        Write-Host "   Configurando DEPLOY_PATH..." -ForegroundColor Gray
        gh secret set DEPLOY_PATH --repo $REPO --body $DEPLOY_PATH 2>&1 | Out-Null
        
        Write-Host "   ✅ Secrets DEPLOY_HOST, DEPLOY_USER, DEPLOY_PATH configurati" -ForegroundColor Green
        Write-Host ""
        Write-Host "   ⚠️  SSH_PRIVATE_KEY deve essere configurato manualmente:" -ForegroundColor Yellow
        Write-Host "      1. Esegui sul server: bash scripts/get-ssh-key-for-github.sh" -ForegroundColor White
        Write-Host "      2. Copia la chiave privata mostrata" -ForegroundColor White
        Write-Host "      3. Configura su: https://github.com/$REPO/settings/secrets/actions" -ForegroundColor White
        Write-Host ""
    } else {
        Write-Host "⚠️  GitHub CLI non autenticato" -ForegroundColor Yellow
        Write-Host "Esegui: gh auth login" -ForegroundColor White
    }
}

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
Write-Host "📋 PROSSIMI PASSI MANUALI (necessari):" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
Write-Host ""
Write-Host "1️⃣  Setup Server (esegui sul server):" -ForegroundColor Yellow
Write-Host "   ssh root@$DEPLOY_HOST" -ForegroundColor White
Write-Host "   bash scripts/verify-server-setup.sh" -ForegroundColor White
Write-Host "   # Copia la chiave PRIVATA mostrata" -ForegroundColor Gray
Write-Host ""
Write-Host "2️⃣  Configura SSH_PRIVATE_KEY su GitHub:" -ForegroundColor Yellow
Write-Host "   https://github.com/$REPO/settings/secrets/actions" -ForegroundColor Cyan
Write-Host "   → Clicca SSH_PRIVATE_KEY → Update" -ForegroundColor White
Write-Host "   → Incolla la chiave PRIVATA completa (inclusi BEGIN/END)" -ForegroundColor White
Write-Host ""
Write-Host "3️⃣  Test Deploy:" -ForegroundColor Yellow
Write-Host "   https://github.com/$REPO/actions" -ForegroundColor Cyan
Write-Host "   → 'Deploy to DigitalOcean via SSH' → 'Run workflow'" -ForegroundColor White
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
Write-Host ""

