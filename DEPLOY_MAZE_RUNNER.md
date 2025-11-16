# 🚀 Deploy Maze Runner su Digital Ocean

## ✅ Fatto Localmente

- ✅ Tutti i file creati in `src/games/maze-runner/`
- ✅ API endpoints aggiunti a `server.js`
- ✅ Gaming Hub Dashboard aggiornato
- ✅ Commit fatto: `db0bb52`
- ✅ Push su GitHub completato

---

## 📋 Passi per il Deploy

### 1. Connetti al Server Digital Ocean

```bash
ssh root@shapiro.ninja
# oppure
ssh your-user@your-server-ip
```

### 2. Vai alla Directory del Progetto

```bash
cd /path/to/LifeManager
# o dove hai il progetto sul server
```

### 3. Pull delle Modifiche da GitHub

```bash
# Verifica branch corrente
git branch

# Se sei su un altro branch, cambia
git checkout refactor-diet-prefs-clean-c9855

# Pull delle nuove modifiche
git pull origin refactor-diet-prefs-clean-c9855
```

### 4. Verifica che i File Siano Presenti

```bash
# Controlla che maze-runner ci sia
ls -la src/games/maze-runner/

# Dovresti vedere:
# - index.html
# - js/ (con 6 file .js)
# - styles/ (con game.css)
# - README.md
# - QUICK_START.md
```

### 5. Riavvia il Server Node.js

**Opzione A: Se usi PM2** (raccomandato)
```bash
pm2 restart server
# o
pm2 restart all

# Verifica che sia attivo
pm2 status
pm2 logs server --lines 50
```

**Opzione B: Se usi systemd**
```bash
sudo systemctl restart lifemanager
# o il nome del tuo servizio

# Verifica status
sudo systemctl status lifemanager
sudo journalctl -u lifemanager -f
```

**Opzione C: Restart manuale**
```bash
# Trova processo Node.js
ps aux | grep node

# Killa processo (usa il PID)
kill -9 <PID>

# Riavvia
nohup node server.js > server.log 2>&1 &
```

### 6. Verifica che il Server Sia Attivo

```bash
# Controlla che risponda
curl http://localhost:3000/api/maze/progress/test

# Dovresti vedere:
# {"success":false,"error":"No progress found"}
# (È normale, significa che l'endpoint funziona!)
```

---

## 🌐 URL del Gioco

Una volta deployato, il gioco sarà accessibile a:

### **Gaming Hub Dashboard:**
```
https://shapiro.ninja/src/pages/gaming-hub-dashboard.html
```

### **Maze Runner (diretto):**
```
https://shapiro.ninja/src/games/maze-runner/index.html
```

---

## ✅ Test Post-Deploy

### 1. Apri la Dashboard
Vai su: https://shapiro.ninja/src/pages/gaming-hub-dashboard.html

**Verifica:**
- [ ] Card "Maze Runner 🧩" visibile (prima in alto a sinistra)
- [ ] Stats: "New!" e rating "5.0"

### 2. Clicca su Maze Runner
Vai su: https://shapiro.ninja/src/games/maze-runner/index.html

**Verifica:**
- [ ] Pagina si carica (no errori 404)
- [ ] Canvas 3D visibile
- [ ] UI overlay visibile (timer, chiavi, etc.)
- [ ] Console browser senza errori critici (F12)

### 3. Gioca
- [ ] Click attiva Pointer Lock
- [ ] WASD muove il personaggio
- [ ] Mouse guarda in giro
- [ ] Labirinto visibile con muri grigi
- [ ] 3 chiavi dorate visibili
- [ ] Portale viola visibile
- [ ] Timer funziona
- [ ] Raccogli chiavi (contatore si aggiorna)
- [ ] Completa il gioco (victory screen appare)

### 4. Test API
```bash
# Test completamento
curl -X POST https://shapiro.ninja/api/maze/complete/testuser \
  -H "Content-Type: application/json" \
  -d '{"level": 1, "time": 125.5, "keysCollected": 3}'

# Verifica risposta:
# {"success":true,"data":{...},"isNewBest":true}

# Test caricamento progressi
curl https://shapiro.ninja/api/maze/progress/testuser

# Test leaderboard
curl https://shapiro.ninja/api/maze/leaderboard/1?limit=10
```

---

## 🐛 Troubleshooting

### Problema: 404 Not Found

**Causa:** File non presenti sul server

**Soluzione:**
```bash
# Ricontrolla che il git pull sia andato a buon fine
git log -1
# Dovresti vedere il commit "feat: Add Maze Runner 3D game"

# Verifica file
ls -R src/games/maze-runner/
```

### Problema: 500 Internal Server Error

**Causa:** Server non riavviato o crash

**Soluzione:**
```bash
# Controlla log del server
pm2 logs server --lines 100
# o
tail -f server.log

# Cerca errori tipo:
# - "Cannot find module"
# - "SyntaxError"
# - "Port already in use"
```

### Problema: API non risponde

**Causa:** Endpoint non caricati

**Soluzione:**
```bash
# Verifica che server.js contenga gli endpoint
grep -n "MAZE RUNNER API" server.js
# Dovresti vedere: "4234: * ========== MAZE RUNNER API ENDPOINTS =========="

# Riavvia server
pm2 restart server
```

### Problema: Three.js non si carica

**Causa:** CDN bloccato o script non caricato

**Soluzione:**
- Verifica connessione internet del server
- Controlla console browser (F12)
- Three.js si carica da CDN: https://cdnjs.cloudflare.com/ajax/libs/three.js/r150/three.min.js

### Problema: Schermo nero

**Causa:** Canvas non inizializzato

**Soluzione:**
- Controlla console browser (F12)
- Verifica che tutti gli script .js si carichino
- Prova hard refresh: Ctrl+Shift+R

---

## 📊 Verifica Directory Data

Il gioco crea automaticamente la directory per i dati:

```bash
# Sul server
ls -la data/gaming/maze/

# Dopo aver giocato, dovresti vedere:
# - testuser_progress.json
# - leaderboard_level1.json
```

Se la directory non esiste, verrà creata automaticamente al primo completamento del gioco.

---

## 🔒 Permessi File

Assicurati che il server Node.js abbia permessi di scrittura:

```bash
# Verifica owner
ls -la data/gaming/

# Se necessario, correggi permessi
chown -R www-data:www-data data/gaming/
# o
chown -R node:node data/gaming/
# (usa l'user con cui gira Node.js)

chmod -R 755 data/gaming/
```

---

## 🎉 Deploy Completato!

Se tutti i test passano, il gioco è **LIVE** e accessibile a:

**🎮 Gaming Hub:**
👉 https://shapiro.ninja/src/pages/gaming-hub-dashboard.html

**🧩 Maze Runner (diretto):**
👉 https://shapiro.ninja/src/games/maze-runner/index.html

---

## 📱 Condividi

Puoi condividere questi link:

```
🎮 Gaming Hub Dashboard
https://shapiro.ninja/src/pages/gaming-hub-dashboard.html

🧩 Maze Runner - Labirinto 3D FPS
https://shapiro.ninja/src/games/maze-runner/index.html

Raccogli 3 chiavi dorate e trova il portale per vincere!
Controlli: WASD + Mouse
```

---

## 🔄 Future Updates

Per aggiornare il gioco in futuro:

1. Modifica file localmente
2. `git add` + `git commit` + `git push`
3. SSH sul server
4. `git pull`
5. `pm2 restart server` (se hai modificato server.js)
6. Hard refresh browser (Ctrl+Shift+R)

---

## 📞 Support

Se hai problemi:
1. Controlla log server: `pm2 logs` o `tail -f server.log`
2. Controlla console browser (F12)
3. Verifica che porta 3000 sia aperta
4. Testa API endpoints con curl

**Buon Deploy! 🚀**

