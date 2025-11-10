#!/bin/bash
# Script per generare chiave SSH sul server per GitHub Actions deploy
# Esegui questo script sul server: ssh deploy@207.154.218.16

echo "🔐 Generazione chiave SSH per GitHub Actions deploy"
echo ""

# Verifica che siamo sull'utente deploy
if [ "$USER" != "deploy" ]; then
    echo "⚠️  Attenzione: questo script dovrebbe essere eseguito come utente 'deploy'"
    echo "   Esegui: su - deploy"
    read -p "Continuare comunque? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Crea directory .ssh se non esiste
mkdir -p ~/.ssh
chmod 700 ~/.ssh

# Nome chiave
KEY_NAME="github_deploy_key"
KEY_PATH="$HOME/.ssh/$KEY_NAME"

# Verifica se la chiave esiste già
if [ -f "$KEY_PATH" ]; then
    echo "⚠️  Chiave $KEY_NAME esiste già!"
    read -p "Sovrascrivere? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "✅ Usando chiave esistente"
    else
        rm -f "$KEY_PATH" "$KEY_PATH.pub"
    fi
fi

# Genera nuova chiave se non esiste
if [ ! -f "$KEY_PATH" ]; then
    echo "📝 Generazione nuova chiave SSH..."
    ssh-keygen -t ed25519 -C "github-actions-deploy" -f "$KEY_PATH" -N ""
    
    if [ $? -eq 0 ]; then
        echo "✅ Chiave generata con successo"
    else
        echo "❌ Errore nella generazione della chiave"
        exit 1
    fi
fi

# Aggiungi chiave pubblica ad authorized_keys
echo ""
echo "📝 Aggiunta chiave pubblica ad authorized_keys..."
if [ ! -f ~/.ssh/authorized_keys ]; then
    touch ~/.ssh/authorized_keys
    chmod 600 ~/.ssh/authorized_keys
fi

# Verifica se la chiave è già in authorized_keys
if grep -q "$(cat $KEY_PATH.pub)" ~/.ssh/authorized_keys 2>/dev/null; then
    echo "✅ Chiave pubblica già presente in authorized_keys"
else
    cat "$KEY_PATH.pub" >> ~/.ssh/authorized_keys
    echo "✅ Chiave pubblica aggiunta ad authorized_keys"
fi

# Mostra chiave privata
echo ""
echo "═══════════════════════════════════════════════════════════"
echo "🔑 CHIAVE PRIVATA SSH (COPIA QUESTO INTERAMENTE):"
echo "═══════════════════════════════════════════════════════════"
echo ""
cat "$KEY_PATH"
echo ""
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "⚠️  IMPORTANTE:"
echo "   1. Copia TUTTO il contenuto sopra (inclusi BEGIN e END)"
echo "   2. Incollalo nel secret SSH_PRIVATE_KEY su GitHub"
echo "   3. Non condividere questa chiave con nessuno!"
echo ""
echo "📋 Prossimi passi:"
echo "   1. Vai su: https://github.com/shapironeil/shappa/settings/secrets/actions"
echo "   2. Aggiungi secret SSH_PRIVATE_KEY con il contenuto sopra"
echo "   3. Aggiungi anche:"
echo "      - DEPLOY_HOST: 207.154.218.16"
echo "      - DEPLOY_USER: deploy"
echo "      - DEPLOY_PATH: /var/www/shappa"
echo ""

