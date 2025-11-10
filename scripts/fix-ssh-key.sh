#!/bin/bash
# Script per generare chiave SSH corretta per GitHub Actions
# Esegui questo script sul server come root

set -e

echo "🔧 Fix Chiave SSH per GitHub Actions"
echo ""

# Verifica che siamo root
if [ "$EUID" -ne 0 ]; then 
    echo "❌ Questo script deve essere eseguito come root"
    exit 1
fi

DEPLOY_USER="deploy"

# Verifica che l'utente deploy esista
if ! id "$DEPLOY_USER" &>/dev/null; then
    echo "📝 Creazione utente $DEPLOY_USER..."
    adduser "$DEPLOY_USER" --disabled-password --gecos "" --quiet
    usermod -aG sudo "$DEPLOY_USER"
fi

echo "🔑 Generazione nuova chiave SSH (formato ed25519 - più compatibile)..."
echo ""

su - "$DEPLOY_USER" << 'DEPLOY_SCRIPT'
    # Crea directory .ssh
    mkdir -p ~/.ssh
    chmod 700 ~/.ssh
    
    # Elimina chiavi vecchie
    rm -f ~/.ssh/github_deploy_key ~/.ssh/github_deploy_key.pub
    
    # Genera nuova chiave ed25519 (formato moderno, più compatibile)
    ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/github_deploy_key -N "" -q
    
    # Aggiungi a authorized_keys
    if ! grep -q "$(cat ~/.ssh/github_deploy_key.pub)" ~/.ssh/authorized_keys 2>/dev/null; then
        cat ~/.ssh/github_deploy_key.pub >> ~/.ssh/authorized_keys
    fi
    
    # Permessi corretti
    chmod 600 ~/.ssh/github_deploy_key
    chmod 600 ~/.ssh/authorized_keys
    chmod 700 ~/.ssh
    
    echo "✅ Chiave SSH generata correttamente"
    echo ""
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "📋 CHIAVE PRIVATA SSH - COPIA QUESTO COMPLETO (INCLUSI BEGIN E END):"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    cat ~/.ssh/github_deploy_key
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "⚠️  IMPORTANTE - COPIA TUTTO:"
    echo "   ✅ La riga: -----BEGIN OPENSSH PRIVATE KEY-----"
    echo "   ✅ TUTTE le righe nel mezzo (dovrebbero essere 6-8 righe)"
    echo "   ✅ La riga: -----END OPENSSH PRIVATE KEY-----"
    echo ""
    echo "   ❌ NON copiare solo una parte!"
    echo "   ❌ NON copiare la chiave pubblica (quella che inizia con 'ssh-ed25519')"
    echo ""
    echo "📏 Verifica: La chiave dovrebbe avere circa 6-8 righe tra BEGIN e END"
    echo ""
DEPLOY_SCRIPT

echo "✅ Script completato!"
echo ""
echo "Prossimi passi:"
echo "1. Copia la chiave PRIVATA mostrata sopra"
echo "2. Vai su: https://github.com/shapironeil/shappa/settings/secrets/actions"
echo "3. Aggiorna il secret SSH_PRIVATE_KEY con la chiave copiata"
echo "4. Testa il deploy di nuovo"
echo ""

