#!/bin/bash

# Script di deploy per Railway
# Uso: ./scripts/deploy-railway.sh

echo "🚀 Deploy Shappa su Railway"
echo "=========================="

# Verifica che Railway CLI sia installato
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI non trovato"
    echo "📦 Installazione Railway CLI..."
    npm install -g @railway/cli
fi

# Login su Railway
echo "🔐 Login su Railway..."
railway login

# Link al progetto (se non già linkato)
echo "🔗 Collegamento al progetto..."
railway link

# Verifica variabili d'ambiente
echo "🔍 Verifica variabili d'ambiente..."
railway variables

# Deploy
echo "🚀 Avvio deploy..."
railway up

echo "✅ Deploy completato!"
echo "🌐 URL: https://$(railway domain)"

