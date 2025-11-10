#!/bin/bash
# Script per ottenere chiave SSH privata per GitHub Secrets
# Esegui questo script sul server come utente deploy (o root)

set -e

echo "🔑 Estrazione Chiave SSH Privata per GitHub Secrets"
echo ""

# Determina utente corrente
CURRENT_USER=${SUDO_USER:-$USER}
if [ "$CURRENT_USER" = "root" ]; then
    DEPLOY_USER="deploy"
else
    DEPLOY_USER="$CURRENT_USER"
fi

echo "👤 Utente: $DEPLOY_USER"
echo ""

# Cerca chiave SSH
if [ "$CURRENT_USER" = "root" ]; then
    # Se siamo root, usa home di deploy
    SSH_HOME="/home/$DEPLOY_USER"
else
    SSH_HOME="$HOME"
fi

# Cerca id_ed25519 prima, poi github_deploy_key
if [ -f "$SSH_HOME/.ssh/id_ed25519" ]; then
    SSH_KEY_FILE="$SSH_HOME/.ssh/id_ed25519"
    echo "✅ Trovata chiave: id_ed25519"
elif [ -f "$SSH_HOME/.ssh/github_deploy_key" ]; then
    SSH_KEY_FILE="$SSH_HOME/.ssh/github_deploy_key"
    echo "✅ Trovata chiave: github_deploy_key"
else
    echo "❌ Nessuna chiave SSH trovata!"
    echo ""
    echo "Genera una nuova chiave:"
    echo "  ssh-keygen -t ed25519 -C 'github-actions-deploy' -f ~/.ssh/github_deploy_key -N ''"
    exit 1
fi

# Verifica permessi
if [ "$CURRENT_USER" = "root" ]; then
    chmod 600 "$SSH_KEY_FILE" 2>/dev/null || true
else
    chmod 600 "$SSH_KEY_FILE"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 CHIAVE PRIVATA SSH - COPIA QUESTO COMPLETO PER GITHUB SECRET SSH_PRIVATE_KEY:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ "$CURRENT_USER" = "root" ]; then
    su - "$DEPLOY_USER" -c "cat $SSH_KEY_FILE"
else
    cat "$SSH_KEY_FILE"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "⚠️  IMPORTANTE:"
echo "   ✅ Copia TUTTO, incluse le righe BEGIN e END"
echo "   ✅ La chiave deve essere completa (6-8 righe tra BEGIN e END)"
echo "   ✅ Non copiare spazi extra o caratteri aggiuntivi"
echo ""
echo "📝 Configura su GitHub:"
echo "   1. Vai su: https://github.com/shapironeil/shappa/settings/secrets/actions"
echo "   2. Clicca SSH_PRIVATE_KEY → Update"
echo "   3. Incolla la chiave COMPLETA mostrata sopra"
echo "   4. Salva"
echo ""

