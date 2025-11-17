#!/bin/bash

# Script automatico per setup Digital Ocean Spaces
# Questo script verifica e configura tutto per il caricamento file GLB

set -e

echo "🚀 Setup Automatico Digital Ocean Spaces per File GLB"
echo ""

# Verifica se le credenziali sono già configurate
if [ -f .env.private ]; then
    source .env.private 2>/dev/null || true
fi

if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

if [ -n "$DO_SPACES_KEY" ] && [ -n "$DO_SPACES_SECRET" ]; then
    echo "✅ Credenziali Digital Ocean Spaces trovate!"
    echo "   Endpoint: ${DO_SPACES_ENDPOINT:-https://nyc3.digitaloceanspaces.com}"
    echo "   Bucket: ${DO_SPACES_BUCKET:-shappa-assets}"
    echo ""
    
    # Verifica AWS SDK
    if [ ! -d "node_modules/@aws-sdk" ]; then
        echo "📦 Installazione AWS SDK..."
        npm install @aws-sdk/client-s3
    fi
    
    # Carica file GLB
    echo "📤 Caricamento file GLB..."
    node scripts/upload-glb-direct.js
    
else
    echo "⚠️ Credenziali Digital Ocean Spaces non configurate"
    echo ""
    echo "Per configurare:"
    echo "1. Vai su https://cloud.digitalocean.com/spaces"
    echo "2. Crea un nuovo Space (es: shappa-assets)"
    echo "3. Vai su API → Spaces Keys e genera una key pair"
    echo "4. Aggiungi al file .env.private:"
    echo ""
    echo "   DO_SPACES_ENDPOINT=https://nyc3.digitaloceanspaces.com"
    echo "   DO_SPACES_BUCKET=shappa-assets"
    echo "   DO_SPACES_KEY=your_access_key"
    echo "   DO_SPACES_SECRET=your_secret_key"
    echo ""
    echo "Poi esegui di nuovo: bash scripts/setup-spaces-auto.sh"
    exit 1
fi

