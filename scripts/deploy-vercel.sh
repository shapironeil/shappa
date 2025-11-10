#!/bin/bash

# Script di deploy per Vercel
# Uso: ./scripts/deploy-vercel.sh

echo "🚀 Deploy Shappa su Vercel"
echo "=========================="

# Verifica che Vercel CLI sia installato
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI non trovato"
    echo "📦 Installazione Vercel CLI..."
    npm install -g vercel
fi

# Login su Vercel
echo "🔐 Login su Vercel..."
vercel login

# Deploy preview
echo "🚀 Deploy preview..."
vercel

# Chiedi conferma per produzione
read -p "Deploy in produzione? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🚀 Deploy in produzione..."
    vercel --prod
fi

echo "✅ Deploy completato!"

