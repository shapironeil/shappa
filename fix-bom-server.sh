#!/bin/bash
# Script per rimuovere BOM da server.js sul server

echo "🔧 Rimuovendo BOM da server.js..."

cd /var/www/shappa

# Rimuovi BOM (primi 3 byte se sono EF BB BF)
if [ -f server.js ]; then
    # Crea backup
    cp server.js server.js.backup
    
    # Rimuovi BOM usando sed
    sed -i '1s/^\xEF\xBB\xBF//' server.js
    
    # Alternativa: usa tail per rimuovere primi 3 byte se sono BOM
    # head -c 3 server.js | od -An -tx1 | grep -q "ef bb bf" && tail -c +4 server.js > server.js.tmp && mv server.js.tmp server.js
    
    echo "✅ BOM rimosso (backup salvato come server.js.backup)"
    
    # Verifica sintassi
    echo "🔍 Verifica sintassi..."
    if node -c server.js 2>&1 | grep -q "SyntaxError"; then
        echo "❌ Ancora errori di sintassi!"
        node -c server.js
        exit 1
    else
        echo "✅ Sintassi OK!"
    fi
else
    echo "❌ File server.js non trovato!"
    exit 1
fi

