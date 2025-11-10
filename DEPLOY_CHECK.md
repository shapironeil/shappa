# 🔍 Guida Verifica Deploy

## Problema: Le modifiche non sono visibili online

### Step 1: Verifica che il codice sia stato pushato

```bash
# Controlla ultimi commit
git log --oneline -5

# Verifica che tutto sia pushato
git status
```

Se ci sono modifiche non committate, committale:
```bash
git add .
git commit -m "Descrizione modifiche"
git push origin main
```

---

### Step 2: Verifica GitHub Actions

1. Vai su: https://github.com/shapironeil/shappa/actions
2. Controlla l'ultimo workflow "Deploy to DigitalOcean via SSH"
3. Verifica lo stato:
   - ✅ **Verde** = Deploy completato con successo
   - ⏳ **Giallo** = Deploy in corso
   - ❌ **Rosso** = Deploy fallito

**Se il workflow è fallito:**
- Clicca sul workflow fallito
- Apri lo step che ha fallito
- Leggi l'errore nei log
- Risolvi il problema e riprova

**Se il workflow non parte:**
- Verifica che i secrets siano configurati (vedi Step 3)

---

### Step 3: Verifica Secrets GitHub

I secrets devono essere configurati in:
**Settings → Secrets and variables → Actions**

Secrets richiesti:
- `SSH_PRIVATE_KEY` - Chiave SSH privata per accedere al server
- `DEPLOY_HOST` - IP o hostname del server (es: `shapiro.ninja` o `164.90.x.x`)
- `DEPLOY_USER` - Username SSH (es: `deploy` o `root`)
- `DEPLOY_PATH` - Directory sul server (es: `/var/www/shappa`)

**Come verificare se i secrets sono configurati:**
1. Vai su: https://github.com/shapironeil/shappa/settings/secrets/actions
2. Dovresti vedere tutti e 4 i secrets elencati sopra
3. Se mancano, aggiungili

---

### Step 4: Deploy Manuale (se GitHub Actions non funziona)

#### Opzione A: Via GitHub Actions UI
1. Vai su: https://github.com/shapironeil/shappa/actions
2. Seleziona "Deploy to DigitalOcean via SSH"
3. Clicca "Run workflow" → "Run workflow"

#### Opzione B: Via SSH diretto (se hai accesso al server)

```bash
# Connettiti al server
ssh deploy@shapiro.ninja  # o l'IP del server

# Vai nella directory del progetto
cd /var/www/shappa  # o la directory configurata

# Pull dal repository
git pull origin main

# Installa dipendenze
npm ci --production

# Riavvia l'applicazione
pm2 restart shappa
# oppure
./restart.sh
```

---

### Step 5: Verifica che il server sia aggiornato

SSH sul server e verifica:

```bash
# Connettiti al server
ssh deploy@shapiro.ninja

# Vai nella directory
cd /var/www/shappa

# Verifica ultimo commit
git log --oneline -1

# Verifica che DATA_DIR sia definito in server.js
grep -n "const DATA_DIR" server.js

# Dovresti vedere: 2670:const DATA_DIR = path.join(__dirname, 'data');
```

Se il file non è aggiornato, esegui:
```bash
git pull origin main
npm ci --production
pm2 restart shappa
```

---

### Step 6: Verifica che PM2 sia attivo

```bash
# Controlla status PM2
pm2 status

# Dovresti vedere "shappa" con status "online"

# Se non è online:
pm2 restart shappa

# Controlla i log per errori
pm2 logs shappa --lines 50
```

---

### Step 7: Test endpoint dopo deploy

Dopo il deploy, testa l'endpoint che dava errore:

```bash
# Test locale (se hai accesso SSH)
curl https://shapiro.ninja/api/automations/sport/user_1762637577613_ynxsce4ye

# Dovresti vedere una risposta JSON, non errore 500
```

---

## 🐛 Troubleshooting Comune

### Errore: "SSH connection failed"
- Verifica che `SSH_PRIVATE_KEY` sia corretto
- Verifica che `DEPLOY_HOST` e `DEPLOY_USER` siano corretti
- Testa la connessione SSH manualmente

### Errore: "Permission denied"
- Verifica che l'utente SSH abbia permessi sulla directory `DEPLOY_PATH`
- Verifica che la directory esista sul server

### Errore: "PM2 not found"
- Installa PM2 sul server: `npm install -g pm2`
- Oppure usa il metodo di restart alternativo

### Modifiche non visibili dopo deploy
- Svuota cache browser: `Ctrl + F5` o `Cmd + Shift + R`
- Verifica che il server sia stato riavviato: `pm2 restart shappa`
- Controlla i log del server per errori: `pm2 logs shappa`

---

## 📋 Checklist Rapida

- [ ] Codice committato e pushato su GitHub
- [ ] GitHub Actions workflow completato con successo
- [ ] Tutti i secrets GitHub configurati correttamente
- [ ] Server aggiornato con `git pull`
- [ ] PM2 riavviato dopo aggiornamento
- [ ] Cache browser svuotata
- [ ] Endpoint testato e funzionante

---

## 🔗 Link Utili

- GitHub Actions: https://github.com/shapironeil/shappa/actions
- GitHub Secrets: https://github.com/shapironeil/shappa/settings/secrets/actions
- Health Check: https://shapiro.ninja/health

