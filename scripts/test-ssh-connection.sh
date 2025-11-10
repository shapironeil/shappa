#!/bin/bash
# Script per testare connessione SSH con la chiave
# Esegui questo script sul server per verificare che la chiave funzioni

set -e

echo "🧪 Test Connessione SSH"
echo ""

DEPLOY_USER="deploy"
DEPLOY_HOST="207.154.218.16"

# Verifica che siamo sul server
if [ ! -f ~/.ssh/github_deploy_key ]; then
    echo "❌ Chiave SSH non trovata: ~/.ssh/github_deploy_key"
    echo ""
    echo "Genera la chiave prima:"
    echo "  ssh-keygen -t ed25519 -C 'github-actions-deploy' -f ~/.ssh/github_deploy_key -N ''"
    exit 1
fi

echo "📋 Informazioni Chiave SSH:"
echo "   Path: ~/.ssh/github_deploy_key"
echo "   Permessi: $(stat -c '%a' ~/.ssh/github_deploy_key)"
echo ""

# Verifica permessi
if [ "$(stat -c '%a' ~/.ssh/github_deploy_key)" != "600" ]; then
    echo "⚠️  Permessi chiave non corretti. Correggo..."
    chmod 600 ~/.ssh/github_deploy_key
    echo "✅ Permessi corretti"
fi

# Verifica che la chiave pubblica sia in authorized_keys
if ! grep -q "$(cat ~/.ssh/github_deploy_key.pub)" ~/.ssh/authorized_keys 2>/dev/null; then
    echo "⚠️  Chiave pubblica non in authorized_keys. Aggiungo..."
    cat ~/.ssh/github_deploy_key.pub >> ~/.ssh/authorized_keys
    chmod 600 ~/.ssh/authorized_keys
    echo "✅ Chiave pubblica aggiunta"
fi

echo ""
echo "🔍 Test Connessione SSH..."
echo ""

# Test connessione
if ssh -i ~/.ssh/github_deploy_key -o StrictHostKeyChecking=no -o ConnectTimeout=10 "$DEPLOY_USER@$DEPLOY_HOST" "echo '✅ SSH Connection Successful!'" 2>&1; then
    echo ""
    echo "✅ Connessione SSH funziona correttamente!"
    echo ""
    echo "La chiave è valida e configurata correttamente."
    echo "Se GitHub Actions fallisce ancora, il problema potrebbe essere:"
    echo "  1. Chiave non copiata completa su GitHub"
    echo "  2. Secret SSH_PRIVATE_KEY non aggiornato"
    echo "  3. Formato chiave non corretto su GitHub"
else
    echo ""
    echo "❌ Connessione SSH fallita!"
    echo ""
    echo "Possibili cause:"
    echo "  1. Chiave SSH non valida"
    echo "  2. Chiave pubblica non in authorized_keys"
    echo "  3. Permessi chiave errati"
    echo "  4. Server non raggiungibile"
    exit 1
fi


