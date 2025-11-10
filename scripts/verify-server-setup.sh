#!/bin/bash
# Script per verificare setup server e generare chiave SSH corretta
# Esegui questo script sul server come root

set -e

echo "🔍 Verifica Setup Server"
echo ""

HOST="207.154.218.16"
DEPLOY_USER="deploy"  # Usa 'root' se preferisci, ma 'deploy' è più sicuro
DEPLOY_PATH="/var/www/shappa"
PM2_APP="shappa"

# Verifica che siamo root
if [ "$EUID" -ne 0 ]; then 
    echo "❌ Questo script deve essere eseguito come root"
    exit 1
fi

echo "📋 Configurazione:"
echo "   Host: $HOST"
echo "   User: $DEPLOY_USER"
echo "   Path: $DEPLOY_PATH"
echo "   PM2 App: $PM2_APP"
echo ""

# 1. Verifica/Crea utente deploy
if ! id "$DEPLOY_USER" &>/dev/null; then
    echo "📝 Creazione utente $DEPLOY_USER..."
    adduser "$DEPLOY_USER" --disabled-password --gecos "" --quiet
    usermod -aG sudo "$DEPLOY_USER"
    echo "✅ Utente $DEPLOY_USER creato"
else
    echo "✅ Utente $DEPLOY_USER esistente"
fi

# 2. Crea directory deploy
if [ ! -d "$DEPLOY_PATH" ]; then
    echo "📁 Creazione directory $DEPLOY_PATH..."
    mkdir -p "$DEPLOY_PATH"
    chown "$DEPLOY_USER:$DEPLOY_USER" "$DEPLOY_PATH"
    echo "✅ Directory creata"
else
    echo "✅ Directory $DEPLOY_PATH esistente"
    chown "$DEPLOY_USER:$DEPLOY_USER" "$DEPLOY_PATH"
fi

# 3. Genera chiave SSH per deploy
echo ""
echo "🔑 Generazione chiave SSH..."
su - "$DEPLOY_USER" << 'DEPLOY_SCRIPT'
    mkdir -p ~/.ssh
    chmod 700 ~/.ssh
    
    # Usa id_ed25519 se esiste, altrimenti genera github_deploy_key
    if [ -f ~/.ssh/id_ed25519 ]; then
        echo "✅ Chiave id_ed25519 già esistente"
        SSH_KEY_FILE=~/.ssh/id_ed25519
    else
        echo "📝 Generazione nuova chiave..."
        ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/github_deploy_key -N "" -q
        SSH_KEY_FILE=~/.ssh/github_deploy_key
    fi
    
    # Aggiungi a authorized_keys
    if ! grep -q "$(cat ${SSH_KEY_FILE}.pub)" ~/.ssh/authorized_keys 2>/dev/null; then
        cat ${SSH_KEY_FILE}.pub >> ~/.ssh/authorized_keys
        echo "✅ Chiave pubblica aggiunta ad authorized_keys"
    fi
    
    # Permessi corretti
    chmod 600 "$SSH_KEY_FILE"
    chmod 600 ~/.ssh/authorized_keys
    chmod 700 ~/.ssh
    
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "📋 CHIAVE PRIVATA SSH - COPIA QUESTO COMPLETO (INCLUSI BEGIN E END):"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    cat "$SSH_KEY_FILE"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "📝 File chiave: $SSH_KEY_FILE"
DEPLOY_SCRIPT

# 4. Verifica PM2
echo ""
echo "🔍 Verifica PM2..."
if command -v pm2 &> /dev/null; then
    echo "✅ PM2 installato"
    pm2 status
else
    echo "⚠️  PM2 non installato"
    echo "Installa con: npm install -g pm2"
fi

# 5. Verifica Nginx
echo ""
echo "🔍 Verifica Nginx..."
if command -v nginx &> /dev/null; then
    echo "✅ Nginx installato"
    nginx -t 2>&1 | head -2
else
    echo "⚠️  Nginx non installato"
fi

echo ""
echo "✅ Verifica completata!"
echo ""
echo "📝 PROSSIMI PASSI:"
echo "1. Copia la chiave PRIVATA mostrata sopra"
echo "2. Vai su: https://github.com/shapironeil/shappa/settings/secrets/actions"
echo "3. Configura questi secrets:"
echo "   - SSH_PRIVATE_KEY = (chiave privata copiata)"
echo "   - DEPLOY_HOST = $HOST"
echo "   - DEPLOY_USER = $DEPLOY_USER"
echo "   - DEPLOY_PATH = $DEPLOY_PATH"
echo ""

