# 🌐 Workflow Online-First - Guida Completa

## 📋 Principi Fondamentali

**Questa webapp è completamente online.** Il server è l'ambiente principale di lavoro.

### ✅ Regole d'Oro

1. **Server = Ambiente Principale**
   - Il server è sempre la fonte di verità
   - Le modifiche locali devono essere sincronizzate con il server
   - Non fare modifiche direttamente sul server (usa Git)

2. **Deploy Automatico**
   - Ogni push su `main` triggera automaticamente il deploy
   - Il workflow GitHub Actions gestisce tutto
   - Non serve deploy manuale (a meno di emergenze)

3. **Git come Sincronizzazione**
   - Modifiche locali → Commit → Push → Deploy automatico
   - Il server riceve sempre l'ultima versione da GitHub

---

## 🔄 Workflow Standard

### 1. Sviluppo Locale

```bash
# 1. Fai le modifiche ai file
# 2. Testa localmente (se possibile)
# 3. Commit
git add .
git commit -m "Descrizione modifiche"

# 4. Push (triggera deploy automatico)
git push origin main
```

### 2. Deploy Automatico

Dopo il push:
1. ✅ GitHub Actions si attiva automaticamente
2. ✅ Connessione SSH al server
3. ✅ Sincronizzazione file (rsync)
4. ✅ Installazione dipendenze (`npm ci --production`)
5. ✅ Restart PM2
6. ✅ Verifica deploy

**Tempo totale:** ~2-3 minuti

### 3. Verifica

Dopo il deploy, verifica:
- ✅ Workflow completato su GitHub Actions
- ✅ Server aggiornato
- ✅ App online e funzionante

---

## 🚨 Gestione Conflitti

### Se il Server ha Modifiche Locali

**Problema:** Il server ha file modificati che non sono su Git (es. `package.json`, `package-lock.json`)

**Soluzione:**
```bash
# Sul server
cd /var/www/shappa
git stash  # Salva modifiche locali
git pull origin main  # Aggiorna da GitHub
npm install  # Reinstalla dipendenze se necessario
pm2 restart shappa  # Riavvia app
```

### Se ci sono Conflitti Git

**Problema:** Conflitti tra modifiche locali e server

**Soluzione:**
```bash
# Sul server
cd /var/www/shappa
git stash  # Salva modifiche locali
git pull --rebase origin main  # Aggiorna con rebase
# Risolvi conflitti se necessario
npm install
pm2 restart shappa
```

---

## 📁 File da NON Committare

Questi file NON devono essere committati (già in `.gitignore`):
- `.env` / `.env.private` - Credenziali
- `node_modules/` - Dipendenze
- `data/` - Dati runtime
- `*.log` - Log files
- `.DS_Store` - File sistema

**Nota:** Le credenziali devono essere configurate come GitHub Secrets o sul server come variabili d'ambiente.

---

## 🔧 Configurazione Server

### Variabili d'Ambiente sul Server

Le variabili d'ambiente devono essere configurate sul server (non in Git):

```bash
# Sul server
cd /var/www/shappa
nano .env  # O usa PM2 ecosystem file

# Aggiungi variabili necessarie:
MONGODB_URI=...
FIGMA_API_KEY=...
EBAY_CLIENT_ID=...
# etc.
```

### PM2 Configuration

PM2 gestisce l'applicazione sul server:

```bash
# Controlla stato
pm2 status

# Vedi logs
pm2 logs shappa

# Restart manuale (se necessario)
pm2 restart shappa

# Riavvio completo
pm2 stop shappa
cd /var/www/shappa
git pull origin main
npm install
pm2 start server.js --name shappa
pm2 save
```

---

## 🐛 Troubleshooting

### Deploy Fallisce

1. **Controlla GitHub Actions**
   - Vai su: https://github.com/shapironeil/shappa/actions
   - Clicca sull'ultimo workflow fallito
   - Leggi il messaggio di errore

2. **Verifica Secrets**
   - Vai su: https://github.com/shapironeil/shappa/settings/secrets/actions
   - Verifica che tutti i secrets siano configurati:
     - `SSH_PRIVATE_KEY`
     - `DEPLOY_HOST` = `207.154.218.16`
     - `DEPLOY_USER` = `deploy`
     - `DEPLOY_PATH` = `/var/www/shappa`

3. **Verifica Server**
   ```bash
   ssh deploy@207.154.218.16
   cd /var/www/shappa
   pm2 status
   pm2 logs shappa
   ```

### App Non Si Aggiorna

1. **Verifica Deploy**
   - Controlla che il workflow sia completato
   - Verifica che i file siano stati sincronizzati

2. **Forza Restart**
   ```bash
   ssh deploy@207.154.218.16
   cd /var/www/shappa
   pm2 restart shappa
   ```

### Dipendenze Mancanti

Se dopo il deploy mancano dipendenze:

```bash
# Sul server
cd /var/www/shappa
npm install --production
pm2 restart shappa
```

---

## 📊 Monitoraggio

### GitHub Actions

- **URL:** https://github.com/shapironeil/shappa/actions
- **Workflow:** "Deploy to DigitalOcean via SSH"
- **Trigger:** Automatico su push a `main`

### Server Status

```bash
# Controlla stato PM2
ssh deploy@207.154.218.16 "pm2 status"

# Vedi logs in tempo reale
ssh deploy@207.154.218.16 "pm2 logs shappa"

# Verifica app
curl http://207.154.218.16:3000
```

---

## ✅ Checklist Pre-Deploy

Prima di fare push, verifica:

- [ ] Modifiche testate localmente (se possibile)
- [ ] File sensibili non committati (`.env`, credenziali)
- [ ] Commit message descrittivo
- [ ] Branch corretto (`main`)

---

## 🚀 Best Practices

1. **Commit Frequenti**
   - Fai commit piccoli e frequenti
   - Ogni commit triggera un deploy
   - Più facile rollback se necessario

2. **Test Locale**
   - Testa le modifiche localmente prima del push
   - Usa `npm test` se disponibile

3. **Monitora Deploy**
   - Controlla sempre che il deploy sia completato
   - Verifica che l'app funzioni dopo il deploy

4. **Documenta Modifiche**
   - Usa commit message chiari
   - Aggiorna documentazione se necessario

---

## 📝 Esempi

### Esempio 1: Modifica File Frontend

```bash
# 1. Modifica file
nano src/pages/dieta.html

# 2. Commit
git add src/pages/dieta.html
git commit -m "Aggiornato design pagina dieta"

# 3. Push (deploy automatico)
git push origin main

# 4. Attendi 2-3 minuti
# 5. Verifica su server
```

### Esempio 2: Aggiunta Dipendenza

```bash
# 1. Aggiungi dipendenza
npm install nuova-dipendenza --save

# 2. Commit (package.json e package-lock.json)
git add package.json package-lock.json
git commit -m "Aggiunta dipendenza nuova-dipendenza"

# 3. Push (deploy automatico installa dipendenze)
git push origin main
```

### Esempio 3: Fix Urgente sul Server

```bash
# Solo in emergenza! Normalmente usa Git
ssh deploy@207.154.218.16
cd /var/www/shappa
nano server.js  # Fix urgente
pm2 restart shappa

# POI sincronizza con Git
git add server.js
git commit -m "Fix urgente: [descrizione]"
git push origin main
```

---

**Ricorda: Il server è sempre online. Ogni modifica deve passare per Git e deploy automatico!** 🚀

