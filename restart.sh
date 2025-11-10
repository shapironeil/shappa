#!/bin/bash
# restart.sh - Script di restart per Shappa su DigitalOcean
# Questo script viene eseguito automaticamente dopo il deploy via GitHub Actions

set -e

echo "🔄 Restarting Shappa application..."

# Vai alla directory dell'applicazione
cd "$(dirname "$0")"

# Carica variabili d'ambiente se esiste .env
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# Installa dipendenze se necessario
if [ -f package.json ]; then
    echo "📦 Installing dependencies..."
    npm ci --production
fi

# Restart con PM2 (se installato)
if command -v pm2 &> /dev/null; then
    echo "🚀 Restarting with PM2..."
    
    # Se l'app non è già avviata, avviala
    if ! pm2 list | grep -q "shappa"; then
        echo "Starting Shappa with PM2..."
        pm2 start server.js --name shappa --update-env
    else
        echo "Restarting existing Shappa process..."
        pm2 restart shappa --update-env
    fi
    
    # Salva la configurazione PM2
    pm2 save
    
    echo "✅ Shappa restarted successfully with PM2"
else
    # Fallback: restart con systemd o kill/start
    echo "⚠️ PM2 not found, using systemd or manual restart..."
    
    if systemctl is-active --quiet shappa.service; then
        echo "Restarting systemd service..."
        sudo systemctl restart shappa.service
    else
        echo "⚠️ No PM2 or systemd service found. Please restart manually:"
        echo "   pm2 start server.js --name shappa"
        echo "   or"
        echo "   node server.js"
    fi
fi

echo "✅ Restart completed!"

