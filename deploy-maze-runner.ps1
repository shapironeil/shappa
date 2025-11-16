# Deploy Maze Runner su shapiro.ninja
# Esegui con: .\deploy-maze-runner.ps1

Write-Host "🚀 Deploy Maze Runner su shapiro.ninja" -ForegroundColor Cyan
Write-Host ""

# Configurazione (MODIFICA QUESTI VALORI)
$SERVER = "deploy@shapiro.ninja"
$PROJECT_PATH = "/var/www/shappa"
$BRANCH = "refactor-diet-prefs-clean-c9855"

Write-Host "📡 Connessione al server..." -ForegroundColor Yellow
Write-Host "Server: $SERVER" -ForegroundColor Gray
Write-Host "Path: $PROJECT_PATH" -ForegroundColor Gray
Write-Host "Branch: $BRANCH" -ForegroundColor Gray
Write-Host ""

# Script da eseguire sul server
$REMOTE_SCRIPT = @"
cd $PROJECT_PATH && \
echo '📂 Directory corrente:' && pwd && \
echo '' && \
echo '🔄 Git pull...' && \
git checkout $BRANCH && \
git pull origin $BRANCH && \
echo '' && \
echo '✅ Verifico file maze-runner...' && \
ls -la src/games/maze-runner/ && \
echo '' && \
echo '🔄 Riavvio server...' && \
pm2 restart server && \
echo '' && \
echo '✅ Status server:' && \
pm2 status && \
echo '' && \
echo '🧪 Test API endpoint...' && \
curl -s http://localhost:3000/api/maze/progress/test && \
echo '' && \
echo '' && \
echo '🎉 Deploy completato!' && \
echo '' && \
echo '🌐 URL:' && \
echo '   Dashboard: https://shapiro.ninja/src/pages/gaming-hub-dashboard.html' && \
echo '   Maze Runner: https://shapiro.ninja/src/games/maze-runner/index.html'
"@

# Esegui comando remoto
Write-Host "⚙️  Esecuzione comandi sul server..." -ForegroundColor Yellow
Write-Host ""

ssh $SERVER $REMOTE_SCRIPT

Write-Host ""
Write-Host "✅ Deploy completato!" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 Apri nel browser:" -ForegroundColor Cyan
Write-Host "   https://shapiro.ninja/src/pages/gaming-hub-dashboard.html" -ForegroundColor White
Write-Host ""
Write-Host "💡 Premi Ctrl+Shift+R per hard refresh se non vedi Maze Runner" -ForegroundColor Yellow


