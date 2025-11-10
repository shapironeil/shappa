#!/bin/bash
# Script per generare chiave SSH per GitHub Actions deploy
# Esegui questo script sul server come root

set -e

echo "🔐 Generazione Chiave SSH per GitHub Actions Deploy"
echo ""

# Verifica che siamo root
if [ "$EUID" -ne 0 ]; then 
    echo "❌ Questo script deve essere eseguito come root"
    echo "Esegui: sudo bash generate-ssh-key.sh"
    exit 1
fi

# Verifica che l'utente deploy esista
if ! id "deploy" &>/dev/null; then
    echo "📝 Creazione utente deploy..."
    adduser deploy --disabled-password --gecos ""
    usermod -aG sudo deploy
    echo "✅ Utente deploy creato"
else
    echo "✅ Utente deploy già esistente"
fi

# Passa all'utente deploy
echo ""
echo "🔑 Generazione chiave SSH per utente deploy..."
su - deploy << 'DEPLOY_USER_SCRIPT'
    # Crea directory .ssh se non esiste
    mkdir -p ~/.ssh
    chmod 700 ~/.ssh
    
    # Genera chiave SSH (senza passphrase)
    if [ ! -f ~/.ssh/github_deploy_key ]; then
        ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/github_deploy_key -N ""
        echo "✅ Chiave SSH generata"
    else
        echo "⚠️  Chiave SSH già esistente (~/.ssh/github_deploy_key)"
        read -p "Vuoi sovrascriverla? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            rm ~/.ssh/github_deploy_key ~/.ssh/github_deploy_key.pub
            ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/github_deploy_key -N ""
            echo "✅ Chiave SSH rigenerata"
        fi
    fi
    
    # Aggiungi chiave pubblica ad authorized_keys
    if ! grep -q "$(cat ~/.ssh/github_deploy_key.pub)" ~/.ssh/authorized_keys 2>/dev/null; then
        cat ~/.ssh/github_deploy_key.pub >> ~/.ssh/authorized_keys
        echo "✅ Chiave pubblica aggiunta ad authorized_keys"
    else
        echo "✅ Chiave pubblica già in authorized_keys"
    fi
    
    # Imposta permessi corretti
    chmod 600 ~/.ssh/github_deploy_key
    chmod 600 ~/.ssh/authorized_keys
    chmod 700 ~/.ssh
    
    echo ""
    echo "📋 CHIAVE PRIVATA SSH (copia questo per GitHub Secret SSH_PRIVATE_KEY):"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    cat ~/.ssh/github_deploy_key
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "✅ Configurazione completata!"
    echo ""
    echo "Prossimi passi:"
    echo "1. Copia la chiave privata sopra"
    echo "2. Vai su: https://github.com/shapironeil/shappa/settings/secrets/actions"
    echo "3. Aggiungi i secrets:"
    echo "   - SSH_PRIVATE_KEY = (chiave copiata sopra)"
    echo "   - DEPLOY_HOST = 207.154.218.16"
    echo "   - DEPLOY_USER = deploy"
    echo "   - DEPLOY_PATH = /var/www/shappa"
DEPLOY_USER_SCRIPT

echo ""
echo "✅ Script completato!"

