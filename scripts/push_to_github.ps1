<#
  scripts/push_to_github.ps1

  Script PowerShell per automatizzare i passaggi locali necessari per
  caricare il progetto su GitHub con autenticazione moderna (PAT o SSH).

  NOTE DI SICUREZZA:
  - NON condividere MAI il tuo Personal Access Token (PAT) pubblicamente.
  - Se hai esposto un token, revocalo immediatamente su GitHub Settings.
  - Esegui questo script localmente sul tuo PC.
  - Il token viene usato solo temporaneamente e non viene salvato in .git/config.

  Come usare:
    1) Apri PowerShell nella cartella del progetto:
       cd "C:\Users\marco\OneDrive\Desktop\shappa"
    
    2) Esegui lo script (bypass ExecutionPolicy per questa sessione):
       powershell.exe -NoProfile -ExecutionPolicy Bypass -File ".\scripts\push_to_github.ps1"
    
    3) Lo script ti chiederà il token GitHub (PAT) in modo sicuro.
       Genera un nuovo token su: https://github.com/settings/tokens
       Scope necessario: 'repo' (accesso completo ai repository)

  Metodi di autenticazione supportati:
    - PAT (Personal Access Token) via Git Credential Manager (consigliato)
    - SSH (se hai configurato chiavi SSH su GitHub)
    - GitHub CLI `gh` (se installato e autenticato)

#>
param()

function Confirm-YesNo($msg, $defaultYes = $true) {
    $yn = Read-Host "$msg [Y/n]"
    if ([string]::IsNullOrWhiteSpace($yn)) { return $defaultYes }
    return $yn.Trim().ToLower().StartsWith('y')
}

function Get-SecureToken {
    Write-Host "`nScegli il metodo di autenticazione:" -ForegroundColor Cyan
    Write-Host "  1) Personal Access Token (PAT) - salvataggio sicuro in Git Credential Manager"
    Write-Host "  2) GitHub CLI (gh) - autenticazione persistente consigliata"
    Write-Host "  3) SSH - autenticazione con chiavi (persistente)"
    $choice = Read-Host "Scelta (1-3)"
    
    switch ($choice) {
        "1" {
            Write-Host "`nPer generare un nuovo PAT:" -ForegroundColor Yellow
            Write-Host "  1. Vai su https://github.com/settings/tokens" -ForegroundColor Yellow
            Write-Host "  2. Clicca 'Generate new token (classic)'" -ForegroundColor Yellow
            Write-Host "  3. Seleziona scope 'repo'" -ForegroundColor Yellow
            Write-Host "  4. Copia il token generato" -ForegroundColor Yellow
            Write-Host "`nATTENZIONE: Se hai esposto un token precedentemente, revocalo prima!" -ForegroundColor Red
            
            $token = Read-Host "`nIncolla il tuo Personal Access Token (input nascosto)" -AsSecureString
            $BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($token)
            $plainToken = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)
            [System.Runtime.InteropServices.Marshal]::ZeroFreeBSTR($BSTR)
            
            if ([string]::IsNullOrWhiteSpace($plainToken)) {
                Write-Host "Token vuoto. Uscita." -ForegroundColor Red
                exit 1
            }
            
            Write-Host "`nConfigurazione Git Credential Manager per salvare il token..." -ForegroundColor Yellow
            # Configura git per usare il credential manager (già incluso in Git per Windows)
            git config --global credential.helper manager-core 2>$null
            if ($LASTEXITCODE -ne 0) {
                git config --global credential.helper manager 2>$null
            }
            Write-Host "✓ Credential Manager configurato. Il token verrà salvato al primo push." -ForegroundColor Green
            
            return @{
                Method = "PAT"
                Token = $plainToken
            }
        }
        "2" {
            if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
                Write-Host "GitHub CLI non trovata. Installa da https://cli.github.com/" -ForegroundColor Red
                exit 1
            }
            Write-Host "Verifico autenticazione gh..." -ForegroundColor Yellow
            $ghStatus = gh auth status 2>&1
            if ($LASTEXITCODE -ne 0) {
                Write-Host "Non sei autenticato. Esegui 'gh auth login' prima." -ForegroundColor Red
                exit 1
            }
            return @{ Method = "GH_CLI" }
        }
        "3" {
            Write-Host "Userò SSH. Assicurati di aver aggiunto la chiave pubblica su GitHub." -ForegroundColor Yellow
            return @{ Method = "SSH" }
        }
        "4" {
            Write-Host "Userò Git Credential Manager. Git chiederà credenziali se necessario." -ForegroundColor Yellow
            return @{ Method = "GCM" }
        }
        default {
            Write-Host "Scelta non valida. Uscita." -ForegroundColor Red
            exit 1
        }
    }
}

Write-Host "=== Shappa: GitHub Upload Helper ===" -ForegroundColor Cyan
Write-Host "Questo script ti aiuterà a caricare il progetto su GitHub in modo sicuro.`n" -ForegroundColor Cyan

if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Host "Errore: git non è installato o non è nel PATH." -ForegroundColor Red
    exit 1
}

$cwd = Resolve-Path .
Write-Host "Cartella corrente: $cwd"

if (-not (Test-Path .git)) {
    if (Confirm-YesNo "Nessun repository git trovato. Vuoi inizializzare git qui?") {
        git init
        Write-Host "Repository inizializzato." -ForegroundColor Green
    } else {
        Write-Host "Operazione annullata dall'utente." -ForegroundColor Yellow
        exit 0
    }
} else {
    Write-Host "Repository git già presente." -ForegroundColor Green
}

Write-Host "Aggiungo tutti i file e creo il commit..."
git add .
try {
    git commit -m "Initial commit - upload local Shappa workspace" -q
    Write-Host "Commit creato." -ForegroundColor Green
} catch {
    Write-Host "Nessun cambiamento da committare o commit fallito (forse esiste già)." -ForegroundColor Yellow
}

$defaultRemote = 'https://github.com/shapironeil/shappa.git'
$remoteUrl = Read-Host "Remote GitHub URL (Enter per usare $defaultRemote)"
if ([string]::IsNullOrWhiteSpace($remoteUrl)) { $remoteUrl = $defaultRemote }

# Ottieni metodo di autenticazione
$authConfig = Get-SecureToken

# Adatta URL remote in base al metodo scelto
if ($authConfig.Method -eq "SSH") {
    # Converti HTTPS in SSH se necessario
    if ($remoteUrl -match "https://github.com/(.+)/(.+)\.git") {
        $remoteUrl = "git@github.com:$($matches[1])/$($matches[2]).git"
        Write-Host "URL convertito in SSH: $remoteUrl" -ForegroundColor Green
    }
} elseif ($authConfig.Method -eq "PAT") {
    # Per PAT useremo un helper temporaneo
    Write-Host "Configurerò un credential helper temporaneo per il push..." -ForegroundColor Yellow
}

$branch = Read-Host "Nome del branch principale da usare (Enter per 'main')"
if ([string]::IsNullOrWhiteSpace($branch)) { $branch = 'main' }

try {
    git branch -M $branch
} catch {
    # ignore
}

$existingRemote = (git remote -v | Select-String "origin" -SimpleMatch) -ne $null
if ($existingRemote) {
    Write-Host "Remote 'origin' già definito. Rimuoverlo e sostituirlo con $remoteUrl?" -ForegroundColor Yellow
    if (Confirm-YesNo "Sostituire origin?") {
        git remote remove origin
        git remote add origin $remoteUrl
    } else {
        Write-Host "Lasciando remote esistente." -ForegroundColor Yellow
    }
} else {
    git remote add origin $remoteUrl
}

Write-Host "Push verso origin/$branch..."

# Gestisci autenticazione PAT in modo sicuro
if ($authConfig.Method -eq "PAT") {
    # Estrai owner/repo dall'URL per creare URL autenticato temporaneo
    if ($remoteUrl -match "https://github.com/(.+)") {
        $repoPath = $matches[1]
        $authenticatedUrl = "https://$($authConfig.Token)@github.com/$repoPath"
        
        # Usa URL autenticato solo per questo push
        Write-Host "Eseguo push con PAT (il token non verrà salvato)..." -ForegroundColor Yellow
        
        # Salva remote originale
        $originalRemote = git remote get-url origin 2>$null
        
        # Imposta temporaneamente remote con token
        git remote set-url origin $authenticatedUrl
        
        try {
            git push -u origin $branch 2>&1 | Write-Host
            if ($LASTEXITCODE -eq 0) {
                Write-Host "Push completato con successo!" -ForegroundColor Green
            } else {
                Write-Host "Errore durante il push. Verifica il token e i permessi." -ForegroundColor Red
            }
        } finally {
            # Ripristina remote senza token
            if ($originalRemote) {
                git remote set-url origin $originalRemote
            } else {
                git remote set-url origin $remoteUrl
            }
            Write-Host "Token rimosso dalla configurazione git." -ForegroundColor Green
        }
    } else {
        Write-Host "Formato URL non riconosciuto." -ForegroundColor Red
        exit 1
    }
} else {
    # Per SSH, GH CLI, o GCM usa push standard
    try {
        git push -u origin $branch 2>&1 | Write-Host
        if ($LASTEXITCODE -eq 0) {
            Write-Host "Push completato con successo!" -ForegroundColor Green
        } else {
            Write-Host "Errore durante il push." -ForegroundColor Red
            if ($authConfig.Method -eq "SSH") {
                Write-Host "Verifica che la chiave SSH sia aggiunta su GitHub." -ForegroundColor Yellow
            }
        }
    } catch {
        Write-Host "Errore durante il push: $_" -ForegroundColor Red
    }
}

# Opzione Git LFS
if (Confirm-YesNo "Vuoi abilitare Git LFS e tracciare le immagini (*.jpg, *.png, *.webp)?") {
    if (-not (Get-Command git-lfs -ErrorAction SilentlyContinue)) {
        Write-Host "git-lfs non trovato sul sistema. Prova ad installarlo (https://git-lfs.com/)" -ForegroundColor Yellow
    } else {
        git lfs install
        git lfs track "*.jpg"
        git lfs track "*.png"
        git lfs track "*.webp"
        git add .gitattributes
        git add .
        try { git commit -m "Add LFS tracking for images" -q } catch { }
        try { git push origin $branch } catch { }
        Write-Host "Git LFS abilitato e .gitattributes aggiornato." -ForegroundColor Green
    }
}

# Opzione: impostare secrets via gh CLI
if (Get-Command gh -ErrorAction SilentlyContinue) {
    if (Confirm-YesNo "`nVuoi impostare i secrets di deploy per GitHub Actions (SSH_PRIVATE_KEY, DEPLOY_HOST, DEPLOY_USER, DEPLOY_PATH)?") {
        Write-Host "Assicurati di essere autenticato con 'gh auth login' e di avere i permessi per il repo." -ForegroundColor Cyan
        $repo = Read-Host "Inserisci l'owner/repo (es: shapironeil/shappa) o Enter per usare 'shapironeil/shappa'"
        if ([string]::IsNullOrWhiteSpace($repo)) { $repo = 'shapironeil/shappa' }

        $secrets = @{
            'SSH_PRIVATE_KEY' = 'Chiave privata SSH per il deploy (path o contenuto)'
            'DEPLOY_HOST' = 'Indirizzo IP o hostname del server (es: 1.2.3.4)'
            'DEPLOY_USER' = 'Username per SSH sul server (es: deploy)'
            'DEPLOY_PATH' = 'Path sul server (es: /var/www/shappa)'
        }
        
        foreach ($secretName in $secrets.Keys) {
            Write-Host "`n$secretName - $($secrets[$secretName])" -ForegroundColor Cyan
            $val = Read-Host "Valore (lascia vuoto per saltare)"
            if (-not [string]::IsNullOrWhiteSpace($val)) {
                # Per SSH_PRIVATE_KEY, controlla se è un path
                if ($secretName -eq "SSH_PRIVATE_KEY" -and (Test-Path $val)) {
                    $val = Get-Content $val -Raw
                }
                
                try {
                    $val | gh secret set $secretName --repo $repo
                    Write-Host "✓ Impostato secret $secretName" -ForegroundColor Green
                } catch {
                    Write-Host "✗ Errore impostando $secretName : $_" -ForegroundColor Red
                }
            } else {
                Write-Host "→ Saltato $secretName" -ForegroundColor Yellow
            }
        }
        Write-Host "`nSecrets impostati. Puoi verificarli su GitHub -> Settings -> Secrets and variables -> Actions" -ForegroundColor Green
    }
} else {
    Write-Host "`nLa CLI 'gh' non è disponibile. Per impostare secrets:" -ForegroundColor Yellow
    Write-Host "  - Installa GitHub CLI: https://cli.github.com/" -ForegroundColor Yellow
    Write-Host "  - Oppure vai su GitHub -> repository -> Settings -> Secrets and variables -> Actions" -ForegroundColor Yellow
}

Write-Host "`n=== Operazione completata ===" -ForegroundColor Cyan
Write-Host "Il repository è stato caricato su GitHub." -ForegroundColor Green
Write-Host "`nProssimi passi:" -ForegroundColor Cyan
Write-Host "  1. Verifica il repository su: https://github.com/shapironeil/shappa" -ForegroundColor White
Write-Host "  2. Se hai configurato i secrets, il workflow di deploy si attiverà al prossimo push" -ForegroundColor White
Write-Host "  3. Per modificare file online: usa GitHub web editor o Codespaces" -ForegroundColor White
Write-Host "`nPer assistenza, consulta README_GITHUB_UPLOAD.md nel repository." -ForegroundColor Yellow
