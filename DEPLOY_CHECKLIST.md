# ✅ Deploy Checklist - Maze Runner

## 🚀 Quick Deploy su shapiro.ninja

### Sul Server Digital Ocean:

```bash
# 1. SSH
ssh root@shapiro.ninja

# 2. Vai al progetto
cd /path/to/LifeManager

# 3. Pull
git checkout refactor-diet-prefs-clean-c9855
git pull origin refactor-diet-prefs-clean-c9855

# 4. Riavvia
pm2 restart server
# (oppure il comando che usi per riavviare Node.js)

# 5. Verifica
curl http://localhost:3000/api/maze/progress/test
```

### Test nel Browser:

```
✅ Dashboard: https://shapiro.ninja/src/pages/gaming-hub-dashboard.html
✅ Gioco:     https://shapiro.ninja/src/games/maze-runner/index.html
```

---

## 🎮 Dopo il Deploy

Il gioco sarà accessibile pubblicamente su:

### 👉 https://shapiro.ninja/src/games/maze-runner/index.html

**Features:**
- 🧩 Labirinto 3D procedurale
- 🔑 Raccogli 3 chiavi dorate
- 🚪 Trova il portale viola per vincere
- ⏱️ Timer e best time salvati
- 🏆 Leaderboard

**Controlli:**
- Click per iniziare
- WASD per muoverti
- Mouse per guardare
- ESC per uscire dai controlli

---

## 📂 Files Deployati

✅ 12 file creati:
- `src/games/maze-runner/index.html`
- `src/games/maze-runner/js/` (6 file JavaScript)
- `src/games/maze-runner/styles/game.css`
- `src/games/maze-runner/README.md`
- `server.js` (modificato - 4 nuovi API endpoints)
- `src/pages/gaming-hub-dashboard.html` (modificato - card Maze Runner)

✅ Commit: `db0bb52`
✅ Branch: `refactor-diet-prefs-clean-c9855`
✅ Pushed: ✅

---

## 🎉 Done!

Una volta completato il deploy, potrai giocare a Maze Runner direttamente da:

**https://shapiro.ninja/src/games/maze-runner/index.html**

O accedere dalla gaming hub dashboard!

