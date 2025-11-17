#!/bin/bash

# Script per verificare credenziali e caricare file GLB su Digital Ocean Spaces
# Esegui sul server: bash scripts/check-and-upload-glb.sh

set -e

echo "🔍 Verifica configurazione Digital Ocean Spaces..."
echo ""

# Carica variabili ambiente
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# Verifica credenziali
if [ -z "$DO_SPACES_KEY" ] || [ -z "$DO_SPACES_SECRET" ]; then
    echo "❌ ERRORE: Credenziali Digital Ocean Spaces non configurate"
    echo ""
    echo "Per configurare:"
    echo "1. Vai su https://cloud.digitalocean.com/spaces"
    echo "2. Crea un nuovo Space (es: shappa-assets)"
    echo "3. Vai su API → Spaces Keys e genera una key pair"
    echo "4. Aggiungi al file .env sul server:"
    echo ""
    echo "   DO_SPACES_ENDPOINT=https://nyc3.digitaloceanspaces.com"
    echo "   DO_SPACES_BUCKET=shappa-assets"
    echo "   DO_SPACES_KEY=your_access_key"
    echo "   DO_SPACES_SECRET=your_secret_key"
    echo ""
    exit 1
fi

echo "✅ Credenziali configurate"
echo "   Endpoint: $DO_SPACES_ENDPOINT"
echo "   Bucket: $DO_SPACES_BUCKET"
echo ""

# Verifica AWS SDK
if [ ! -d "node_modules/@aws-sdk" ]; then
    echo "📦 Installazione AWS SDK..."
    npm install @aws-sdk/client-s3
fi

# Conta file GLB
GLB_COUNT=$(find 3d -name "*.glb" -type f 2>/dev/null | wc -l)

if [ "$GLB_COUNT" -eq 0 ]; then
    echo "⚠️ Nessun file GLB trovato in 3d/"
    exit 0
fi

echo "📦 Trovati $GLB_COUNT file GLB da caricare"
echo ""

# Carica file
node scripts/upload-glb-to-spaces.js

echo ""
echo "✅ Upload completato!"
echo ""
echo "I file sono ora disponibili su:"
echo "  https://$DO_SPACES_BUCKET.nyc3.cdn.digitaloceanspaces.com/models/[nome_file].glb"
echo ""
echo "Oppure tramite endpoint API:"
echo "  /api/models/[nome_file].glb"

