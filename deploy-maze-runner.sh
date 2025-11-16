#!/bin/bash
# Deploy Maze Runner su shapiro.ninja
# Esegui con: ./deploy-maze-runner.sh

echo "🚀 Deploy Maze Runner su shapiro.ninja"
echo ""

# Configurazione (MODIFICA QUESTI VALORI)
SERVER="deploy@shapiro.ninja"
PROJECT_PATH="/var/www/shappa"
BRANCH="refactor-diet-prefs-clean-c9855"

echo "📡 Connessione al server..."
echo "Server: $SERVER"
echo "Path: $PROJECT_PATH"
echo "Branch: $BRANCH"
echo ""

# Esegui comandi sul server
ssh $SERVER << EOF
cd $PROJECT_PATH
echo "📂 Directory corrente:"
pwd
echo ""

echo "🔄 Git pull..."
git checkout $BRANCH
git pull origin $BRANCH
echo ""

echo "✅ Verifico file maze-runner..."
ls -la src/games/maze-runner/
echo ""

echo "🔄 Riavvio server..."
pm2 restart server
echo ""

echo "✅ Status server:"
pm2 status
echo ""

echo "🧪 Test API endpoint..."
curl -s http://localhost:3000/api/maze/progress/test
echo ""
echo ""

echo "🎉 Deploy completato!"
echo ""
echo "🌐 URL:"
echo "   Dashboard: https://shapiro.ninja/src/pages/gaming-hub-dashboard.html"
echo "   Maze Runner: https://shapiro.ninja/src/games/maze-runner/index.html"
EOF

echo ""
echo "✅ Deploy completato!"
echo ""
echo "🌐 Apri nel browser:"
echo "   https://shapiro.ninja/src/pages/gaming-hub-dashboard.html"
echo ""
echo "💡 Premi Ctrl+Shift+R per hard refresh se non vedi Maze Runner"


