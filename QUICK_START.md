# 🚀 Quick Start Guide - Shappa Deploy

## 📝 Prima di Iniziare

✅ **Hai bisogno di:**
- Account GitHub verificato come studente
- Git installato localmente
- (Opzionale) PowerShell o terminale

---

## 🎓 Step 1: Attiva GitHub Student Pack (5 minuti)

1. Vai su: **https://education.github.com/pack**
2. Clicca **"Get your pack"**
3. Verifica con email universitaria o documenti studente
4. Aspetta approvazione (solitamente 1-3 giorni)

**Cosa ottieni gratis:**
- GitHub Pro (Codespaces, Actions illimitate)
- DigitalOcean: **$200 crediti** = ~33 mesi server gratis
- Heroku: **$13/mese x 24 mesi**
- MongoDB Atlas: **$50 crediti**
- Domini gratis: `.me`, `.tech`, `.dev`
- Sentry, Datadog, Doppler, 1Password e 90+ servizi

---

## 💻 Step 2: Upload Codice su GitHub (2 minuti)

### Metodo Automatico (Consigliato)

```powershell
# Apri PowerShell nella cartella del progetto
cd "C:\Users\marco\OneDrive\Desktop\shappa"

# Esegui lo script (bypassa ExecutionPolicy solo per questa sessione)
powershell.exe -NoProfile -ExecutionPolicy Bypass -File ".\scripts\push_to_github.ps1"
```

**Lo script ti chiederà:**
1. Metodo autenticazione: scegli **opzione 1 (PAT)**
2. Incolla il tuo Personal Access Token (generato su GitHub Settings)
3. Conferma remote e branch (default: `https://github.com/shapironeil/shappa.git` e `main`)

**✨ Il token verrà salvato in Windows Credential Manager — lo inserisci UNA SOLA VOLTA!**

---

### Metodo Manuale (Alternativo)

Se preferisci git manuale:

```powershell
cd "C:\Users\marco\OneDrive\Desktop\shappa"
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/shapironeil/shappa.git
git push -u origin main
```

Git ti chiederà username e password (usa il Personal Access Token come password).

---

## 🌐 Step 3: Scegli Strategia Hosting

### 🔵 Opzione A: Heroku (Più Facile — 10 minuti)

**Pro:** Zero configurazione, SSL gratis, deploy automatico  
**Contro:** Dyno dorme dopo 30 min inattività (tier Eco)

```powershell
# 1. Crea account Heroku
# https://signup.heroku.com/

# 2. Installa Heroku CLI
# https://devcenter.heroku.com/articles/heroku-cli

# 3. Login e crea app
heroku login
heroku create shappa-prod

# 4. Aggiungi MongoDB
heroku addons:create mongolab:sandbox

# 5. Deploy (push su Heroku git remote)
git push heroku main

# 6. Apri app
heroku open
```

**Configurazione dominio custom:**
```powershell
heroku domains:add shappa.me
# Segui istruzioni DNS fornite da Heroku
```

---

### 🟢 Opzione B: DigitalOcean (Più Controllo — 30 minuti)

**Pro:** $200 crediti = 33 mesi gratis, performance migliore  
**Contro:** Devi configurare server manualmente

**Setup rapido:**
1. Crea Droplet su https://cloud.digitalocean.com/droplets/new
   - Ubuntu 22.04, 1GB RAM ($6/mese)
2. Connetti via SSH: `ssh root@<IP_DROPLET>`
3. Segui la guida dettagliata in **`DEPLOYMENT_ROADMAP.md`** (sezione "Fase 3")

**One-liner setup automatico:**
```bash
# Sul server DigitalOcean (dopo SSH)
curl -fsSL https://raw.githubusercontent.com/shapironeil/shappa/main/scripts/server-setup.sh | bash
```
*(Nota: script da creare se vuoi automazione completa)*

---

### 🟣 Opzione C: GitHub Pages + Backend API (Hybrid — 15 minuti)

**Pro:** Frontend gratis permanente, veloce (CDN)  
**Contro:** Solo per siti statici (no PHP server-side)

```powershell
# 1. Abilita GitHub Pages
# Vai su: https://github.com/shapironeil/shappa/settings/pages
# Source: Deploy from branch "main" → folder "/docs" o "/ (root)"

# 2. Sposta file statici in /docs se necessario
mkdir docs
cp -r src/pages/*.html docs/
cp -r src/css docs/
cp -r src/js docs/

git add docs/
git commit -m "Add GitHub Pages"
git push

# 3. Sito live su: https://shapironeil.github.io/shappa/
```

Per backend API separato, usa Heroku o DigitalOcean.

---

## 🗄️ Step 4: Setup Database MongoDB (5 minuti)

```powershell
# 1. Vai su https://www.mongodb.com/cloud/atlas/register
# 2. Crea account (usa email GitHub Education per $50 crediti)
# 3. Create cluster → Free tier (M0, 512MB)
#    - Provider: AWS/Google Cloud
#    - Region: Frankfurt/Amsterdam (vicino Italia)
# 4. Database Access → Add user (username: shappa_app)
# 5. Network Access → Add IP (IP del server o 0.0.0.0/0 per test)
# 6. Connect → Get connection string
```

**Connection string:**
```
mongodb+srv://shappa_app:<password>@shappa-cluster.xxxxx.mongodb.net/shappa
```

**Aggiungi al progetto:**
- **Heroku:** `heroku config:set MONGODB_URI="mongodb+srv://..."`
- **DigitalOcean:** Aggiungi a `/var/www/shappa/.env`
- **Locale:** Aggiungi a `.env` (non committare!)

---

## 🌍 Step 5: Dominio Custom (5 minuti)

### Opzione A: Namecheap (dominio `.me`)

```powershell
# 1. Vai su https://nc.me/ (offerta GitHub Student Pack)
# 2. Registra shappa.me (gratis 1 anno + SSL)
# 3. DNS Management → Add Record:
#    - Type: A, Host: @, Value: <IP_SERVER>
#    - Type: A, Host: www, Value: <IP_SERVER>
```

### Opzione B: Name.com (dominio `.tech` / `.dev`)

```powershell
# 1. Vai su https://www.name.com/partner/github-students
# 2. Registra shappa.tech
# 3. DNS: come sopra
```

**Propagazione DNS:** 15 minuti - 24 ore

---

## 🔄 Step 6: Deploy Automatico (GitHub Actions)

Lo script è già configurato in `.github/workflows/deploy-ssh.yml`.

**Setup secrets (solo per DigitalOcean/VPS):**

```powershell
# 1. Sul server, genera chiave SSH:
ssh-keygen -t ed25519 -C "deploy@shappa" -f ~/.ssh/deploy_key
cat ~/.ssh/deploy_key.pub >> ~/.ssh/authorized_keys
cat ~/.ssh/deploy_key  # Copia output

# 2. Su GitHub, vai a:
# https://github.com/shapironeil/shappa/settings/secrets/actions

# 3. Aggiungi secrets:
# - SSH_PRIVATE_KEY = <chiave privata copiata>
# - DEPLOY_HOST = <IP server>
# - DEPLOY_USER = deploy
# - DEPLOY_PATH = /var/www/shappa

# 4. Ora ogni push su main → deploy automatico! 🎉
```

**Per Heroku:** Deploy automatico già configurato (push su `heroku` remote).

---

## 🔐 Step 7: Gestione Secrets

### Opzione A: Doppler (Consigliato)

```powershell
# 1. Vai su https://doppler.com/ (offerta Student Pack: Team gratis)
# 2. Crea progetto "shappa"
# 3. Aggiungi secrets (MONGODB_URI, API_KEYS, ecc.)
# 4. Sul server:
curl -Ls https://cli.doppler.com/install.sh | sh
doppler login
doppler setup
```

### Opzione B: File `.env` locale

```bash
# Sul server
nano /var/www/shappa/.env
```

Contenuto:
```env
MONGODB_URI=mongodb+srv://...
AMAZON_API_KEY=...
EBAY_API_KEY=...
SESSION_SECRET=genera-stringa-casuale-lunga
NODE_ENV=production
```

Proteggi file:
```bash
chmod 600 .env
```

**⚠️ NON committare `.env` su GitHub!** (già escluso in `.gitignore`)

---

## 📊 Step 8: Monitoring (Opzionale ma Consigliato)

### Sentry (Error Tracking)

```powershell
# 1. Vai su https://sentry.io/signup/ (offerta Student: 50K errori/mese)
# 2. Crea progetto "shappa"
# 3. Installa SDK:
npm install @sentry/node
# 4. Aggiungi al codice (vedi DEPLOYMENT_ROADMAP.md)
```

### Datadog (Server Monitoring)

```bash
# Sul server (offerta Student: free 2 anni)
DD_API_KEY=xxx DD_SITE="datadoghq.eu" bash -c "$(curl -L https://s3.amazonaws.com/dd-agent/scripts/install_script.sh)"
```

---

## ✅ Checklist Pre-Launch

- [ ] Codice pushato su GitHub
- [ ] Server/Heroku configurato e funzionante
- [ ] Database MongoDB connesso
- [ ] Dominio custom configurato
- [ ] SSL attivo (HTTPS)
- [ ] Deploy automatico testato
- [ ] Secrets configurati (non hardcoded!)
- [ ] Monitoring attivo (opzionale)
- [ ] Backup database automatico (MongoDB Atlas lo fa gratis)

---

## 🎯 TL;DR — Percorso Più Rapido (15 minuti)

```powershell
# 1. Attiva GitHub Student Pack
# https://education.github.com/pack

# 2. Push codice
cd "C:\Users\marco\OneDrive\Desktop\shappa"
powershell.exe -NoProfile -ExecutionPolicy Bypass -File ".\scripts\push_to_github.ps1"

# 3. Deploy su Heroku
heroku create shappa-prod
heroku addons:create mongolab:sandbox
git push heroku main

# 4. Dominio
# Registra shappa.me su https://nc.me/
# Configura DNS A record → Heroku IP

# 🚀 Done! App live
```

---

## 🆘 Troubleshooting

**Script push fallisce?**
- Verifica di avere git installato: `git --version`
- Rigenera Personal Access Token su GitHub con scope `repo`
- Usa PowerShell (non cmd)

**Heroku deploy fallisce?**
- Verifica che esista `package.json` o `composer.json` nella root
- Controlla logs: `heroku logs --tail`

**Database non si connette?**
- Verifica IP del server sia whitelisted su MongoDB Atlas
- Testa connection string localmente prima di deployare

**DNS non propaga?**
- Aspetta 24 ore
- Verifica con: `dig shappa.me` o https://dnschecker.org/

---

## 📚 Documentazione Completa

- **DEPLOYMENT_ROADMAP.md** — Guida dettagliata setup completo
- **SECURITY.md** — Best practices sicurezza e gestione token
- **README_GITHUB_UPLOAD.md** — Guida rapida push GitHub

---

## 💬 Hai Bisogno di Aiuto?

- GitHub Education Community: https://github.com/orgs/github-community/discussions
- Discord Shappa: *(crea un Discord se vuoi community)*
- Stack Overflow: tag `[github-pages]` `[heroku]` `[digitalocean]`

Buon deploy! 🚀✨
