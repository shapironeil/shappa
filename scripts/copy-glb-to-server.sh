#!/bin/bash

# Script per copiare file GLB sul server (GRATIS - usa spazio droplet)
# Esegui: bash scripts/copy-glb-to-server.sh

set -e

echo "🚀 Copia file GLB sul server (GRATIS - usa spazio droplet)"
echo ""

# Verifica che i file esistano localmente
if [ ! -d "frontend/public/models" ]; then
    echo "❌ Cartella frontend/public/models non trovata"
    exit 1
fi

GLB_COUNT=$(find frontend/public/models -name "*.glb" -type f | wc -l)

if [ "$GLB_COUNT" -eq 0 ]; then
    echo "⚠️ Nessun file GLB trovato in frontend/public/models"
    exit 0
fi

echo "📦 Trovati $GLB_COUNT file GLB da copiare"
echo ""

# Copia file sul server
echo "📤 Copia file sul server..."
scp frontend/public/models/*.glb deploy@shapiro.ninja:/tmp/models-temp/ 2>/dev/null || {
    echo "⚠️ Errore copia, provo con sudo..."
    ssh deploy@shapiro.ninja "sudo mkdir -p /var/www/shappa/frontend/public/models && sudo chown -R deploy:deploy /var/www/shappa/frontend/public/models"
    scp frontend/public/models/*.glb deploy@shapiro.ninja:/tmp/models-temp/
}

# Sposta file nella posizione corretta sul server
ssh deploy@shapiro.ninja "sudo mv /tmp/models-temp/*.glb /var/www/shappa/frontend/public/models/ 2>/dev/null && sudo chown -R deploy:deploy /var/www/shappa/frontend/public/models && echo '✅ File copiati'"

echo ""
echo "✅ File GLB copiati sul server!"
echo ""
echo "I file sono ora disponibili a:"
echo "  https://shapiro.ninja/models/[nome_file].glb"
echo "  https://shapiro.ninja/api/models/[nome_file].glb"
echo "  https://shapiro.ninja/3d/[nome_file].glb"

