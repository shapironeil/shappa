#!/bin/bash
# Script Completo: Setup Deploy GitHub Actions
# Esegui questo script sul server come root: bash setup-deploy-complete.sh

set -e

echo "🚀 Setup Completo Deploy GitHub Actions"
echo "========================================"
echo ""

# Valori configurazione
DEPLOY_HOST="207.154.218.16"
DEPLOY_USER="deploy"
DEPLOY_PATH="/var/www/shappa"
REPO="shapironeil/shappa"

# Verifica che siamo root
if [ "$EUID" -ne 0 ]; then 
    echo "❌ Questo script deve essere eseguito come root"
    echo "Esegui: sudo bash setup-deploy-complete.sh"
    exit 1
fi

echo "📋 Configurazione:"
echo "   Host: $DEPLOY_HOST"
echo "   User: $DEPLOY_USER"
echo "   Path: $DEPLOY_PATH"
echo ""

# 1. Verifica/Crea utente deploy
if ! id "$DEPLOY_USER" &>/dev/null; then
    echo "📝 Creazione utente $DEPLOY_USER..."
    adduser "$DEPLOY_USER" --disabled-password --gecos "" --quiet
    usermod -aG sudo "$DEPLOY_USER"
    echo "✅ Utente $DEPLOY_USER creato"
else
    echo "✅ Utente $DEPLOY_USER già esistente"
fi

# 2. Crea directory deploy se non esiste
if [ ! -d "$DEPLOY_PATH" ]; then
    echo "📁 Creazione directory $DEPLOY_PATH..."
    mkdir -p "$DEPLOY_PATH"
    chown "$DEPLOY_USER:$DEPLOY_USER" "$DEPLOY_PATH"
    echo "✅ Directory creata"
else
    echo "✅ Directory $DEPLOY_PATH già esistente"
    chown "$DEPLOY_USER:$DEPLOY_USER" "$DEPLOY_PATH"
fi

# 3. Genera chiave SSH per deploy
echo ""
echo "🔑 Generazione chiave SSH..."
su - "$DEPLOY_USER" << DEPLOY_SCRIPT
    mkdir -p ~/.ssh
    chmod 700 ~/.ssh
    
    if [ -f ~/.ssh/github_deploy_key ]; then
        echo "⚠️  Chiave SSH già esistente. Sovrascrivo..."
        rm -f ~/.ssh/github_deploy_key ~/.ssh/github_deploy_key.pub
    fi
    
    ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/github_deploy_key -N "" -q
    
    # Aggiungi a authorized_keys se non presente
    if ! grep -q "\$(cat ~/.ssh/github_deploy_key.pub)" ~/.ssh/authorized_keys 2>/dev/null; then
        cat ~/.ssh/github_deploy_key.pub >> ~/.ssh/authorized_keys
    fi
    
    chmod 600 ~/.ssh/github_deploy_key
    chmod 600 ~/.ssh/authorized_keys
    chmod 700 ~/.ssh
    
    echo "✅ Chiave SSH generata"
DEPLOY_SCRIPT

# 4. Mostra chiave privata
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 CHIAVE PRIVATA SSH - COPIA QUESTO PER GITHUB SECRET SSH_PRIVATE_KEY:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
su - "$DEPLOY_USER" -c "cat ~/.ssh/github_deploy_key"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 5. Mostra istruzioni per GitHub
echo "✅ Setup Server Completato!"
echo ""
echo "📝 PROSSIMI PASSI - Configura Secrets su GitHub:"
echo ""
echo "1. Vai su: https://github.com/$REPO/settings/secrets/actions"
echo ""
echo "2. Aggiungi questi 4 secrets (clicca 'New repository secret' per ognuno):"
echo ""
echo "   Secret 1: SSH_PRIVATE_KEY"
echo "   ──────────────────────────────────────────────────────────────"
echo "   Nome: SSH_PRIVATE_KEY"
echo "   Valore: (copia la chiave privata mostrata sopra)"
echo ""
echo "   Secret 2: DEPLOY_HOST"
echo "   ──────────────────────────────────────────────────────────────"
echo "   Nome: DEPLOY_HOST"
echo "   Valore: $DEPLOY_HOST"
echo ""
echo "   Secret 3: DEPLOY_USER"
echo "   ──────────────────────────────────────────────────────────────"
echo "   Nome: DEPLOY_USER"
echo "   Valore: $DEPLOY_USER"
echo ""
echo "   Secret 4: DEPLOY_PATH"
echo "   ──────────────────────────────────────────────────────────────"
echo "   Nome: DEPLOY_PATH"
echo "   Valore: $DEPLOY_PATH"
echo ""
echo "3. Dopo aver configurato i secrets, testa il deploy:"
echo "   https://github.com/$REPO/actions"
echo "   → Seleziona 'Deploy to DigitalOcean via SSH'"
echo "   → Clicca 'Run workflow'"
echo ""
echo "✅ Fine setup!"

