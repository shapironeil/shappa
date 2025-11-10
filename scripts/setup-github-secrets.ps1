# Script PowerShell per configurare GitHub Secrets
# Requisiti: GitHub CLI (gh) installato e autenticato

Write-Host "🔐 Configurazione GitHub Secrets per Deploy" -ForegroundColor Cyan
Write-Host ""

# Verifica GitHub CLI
if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
    Write-Host "❌ GitHub CLI (gh) non trovato!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Installa GitHub CLI:" -ForegroundColor Yellow
    Write-Host "  winget install --id GitHub.cli" -ForegroundColor White
    Write-Host "  oppure: https://cli.github.com/" -ForegroundColor White
    Write-Host ""
    Write-Host "Poi autenticati:" -ForegroundColor Yellow
    Write-Host "  gh auth login" -ForegroundColor White
    exit 1
}

# Verifica autenticazione
$authStatus = gh auth status 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Non autenticato con GitHub CLI!" -ForegroundColor Red
    Write-Host "Esegui: gh auth login" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ GitHub CLI trovato e autenticato" -ForegroundColor Green
Write-Host ""

# Repository
$repo = "shapironeil/shappa"
Write-Host "Repository: $repo" -ForegroundColor Cyan
Write-Host ""

# Valori di default (confermati dall'utente)
$defaultHost = "207.154.218.16"
$defaultUser = "deploy"
$defaultPath = "/var/www/shappa"

Write-Host "📋 Configurazione Secrets" -ForegroundColor Cyan
Write-Host ""

# Secret 1: SSH_PRIVATE_KEY
Write-Host "1️⃣ SSH_PRIVATE_KEY" -ForegroundColor Yellow
Write-Host "   Questo è il più importante!" -ForegroundColor White
Write-Host ""
Write-Host "   Opzioni:" -ForegroundColor White
Write-Host "   A) Se hai già una chiave SSH sul server:" -ForegroundColor White
Write-Host "      ssh deploy@shapiro.ninja 'cat ~/.ssh/id_ed25519'" -ForegroundColor Gray
Write-Host ""
Write-Host "   B) Genera una nuova chiave SSH:" -ForegroundColor White
Write-Host "      ssh deploy@shapiro.ninja" -ForegroundColor Gray
Write-Host "      ssh-keygen -t ed25519 -C 'github-actions-deploy' -f ~/.ssh/github_deploy_key -N ''" -ForegroundColor Gray
Write-Host "      cat ~/.ssh/github_deploy_key.pub >> ~/.ssh/authorized_keys" -ForegroundColor Gray
Write-Host "      cat ~/.ssh/github_deploy_key" -ForegroundColor Gray
Write-Host ""
$sshKeyPath = Read-Host "   Path alla chiave privata SSH (o incolla il contenuto, premi Invio per saltare)"
if ($sshKeyPath) {
    if (Test-Path $sshKeyPath) {
        $sshKeyContent = Get-Content $sshKeyPath -Raw
        gh secret set SSH_PRIVATE_KEY --repo $repo --body $sshKeyContent
        if ($LASTEXITCODE -eq 0) {
            Write-Host "   ✅ SSH_PRIVATE_KEY configurato" -ForegroundColor Green
        } else {
            Write-Host "   ❌ Errore configurazione SSH_PRIVATE_KEY" -ForegroundColor Red
        }
    } else {
        # Assume che sia il contenuto diretto
        gh secret set SSH_PRIVATE_KEY --repo $repo --body $sshKeyPath
        if ($LASTEXITCODE -eq 0) {
            Write-Host "   ✅ SSH_PRIVATE_KEY configurato" -ForegroundColor Green
        } else {
            Write-Host "   ❌ Errore configurazione SSH_PRIVATE_KEY" -ForegroundColor Red
        }
    }
} else {
    Write-Host "   ⏭️  Saltato (configura manualmente su GitHub)" -ForegroundColor Yellow
}
Write-Host ""

# Secret 2: DEPLOY_HOST
Write-Host "2️⃣ DEPLOY_HOST" -ForegroundColor Yellow
$deployHost = Read-Host "   Hostname o IP del server [$defaultHost]"
if ([string]::IsNullOrWhiteSpace($deployHost)) {
    $deployHost = $defaultHost
}
gh secret set DEPLOY_HOST --repo $repo --body $deployHost
if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ DEPLOY_HOST configurato: $deployHost" -ForegroundColor Green
} else {
    Write-Host "   ❌ Errore configurazione DEPLOY_HOST" -ForegroundColor Red
}
Write-Host ""

# Secret 3: DEPLOY_USER
Write-Host "3️⃣ DEPLOY_USER" -ForegroundColor Yellow
$deployUser = Read-Host "   Username SSH [$defaultUser]"
if ([string]::IsNullOrWhiteSpace($deployUser)) {
    $deployUser = $defaultUser
}
gh secret set DEPLOY_USER --repo $repo --body $deployUser
if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ DEPLOY_USER configurato: $deployUser" -ForegroundColor Green
} else {
    Write-Host "   ❌ Errore configurazione DEPLOY_USER" -ForegroundColor Red
}
Write-Host ""

# Secret 4: DEPLOY_PATH
Write-Host "4️⃣ DEPLOY_PATH" -ForegroundColor Yellow
$deployPath = Read-Host "   Directory sul server [$defaultPath]"
if ([string]::IsNullOrWhiteSpace($deployPath)) {
    $deployPath = $defaultPath
}
gh secret set DEPLOY_PATH --repo $repo --body $deployPath
if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ DEPLOY_PATH configurato: $deployPath" -ForegroundColor Green
} else {
    Write-Host "   ❌ Errore configurazione DEPLOY_PATH" -ForegroundColor Red
}
Write-Host ""

# Verifica finale
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

