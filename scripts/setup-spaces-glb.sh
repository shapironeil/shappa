#!/bin/bash

# Script per configurare Digital Ocean Spaces per file GLB
# Esegui: bash scripts/setup-spaces-glb.sh

echo "🚀 Setup Digital Ocean Spaces per file GLB"
echo ""

# Verifica variabili ambiente
if [ -z "$DO_SPACES_KEY" ] || [ -z "$DO_SPACES_SECRET" ]; then
    echo "❌ ERRORE: DO_SPACES_KEY e DO_SPACES_SECRET non configurate"
    echo ""
    echo "Aggiungi al tuo .env.private:"
    echo "  DO_SPACES_ENDPOINT=https://nyc3.digitaloceanspaces.com"
    echo "  DO_SPACES_BUCKET=shappa-assets"
    echo "  DO_SPACES_KEY=your_access_key"
    echo "  DO_SPACES_SECRET=your_secret_key"
    exit 1
fi

echo "✅ Variabili ambiente configurate"
echo ""

# Installa dipendenze se necessario
if [ ! -d "node_modules/@aws-sdk" ]; then
    echo "📦 Installazione AWS SDK..."
    npm install @aws-sdk/client-s3
fi

echo "✅ Setup completato!"
echo ""
echo "Per caricare i file GLB:"
echo "  node scripts/upload-glb-to-spaces.js"
echo ""
echo "Oppure per un singolo file:"
echo "  node scripts/upload-glb-to-spaces.js path/to/file.glb"

