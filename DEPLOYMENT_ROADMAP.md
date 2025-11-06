# 🚀 Deployment Roadmap - Shappa

## Panoramica
Questa guida ti mostra come configurare l'intero stack di deployment per Shappa utilizzando i servizi gratuiti del GitHub Student Developer Pack e hosting moderno.

---

## 📋 Fase 1: Attivare GitHub Student Developer Pack

### 1.1 Registrazione
1. Vai su: https://education.github.com/pack
2. Clicca **"Get your pack"** / **"Sign up for Student Developer Pack"**
3. Verifica con:
   - Email universitaria (`.edu`, `.ac.uk`, ecc.)
   - Oppure documenti studente (carta studente, iscrizione)

### 1.2 Benefici principali per Shappa

**Servizi gratuiti consigliati dal pack:**

#### 🌐 **Hosting & Deploy**
- **DigitalOcean** — $200 crediti per 1 anno
  - Droplet (VPS) Linux con 1GB RAM = $6/mese (33 mesi gratis)
  - Oppure App Platform (PaaS) per deploy automatico
- **Heroku** — $13/mese per 24 mesi
  - Deploy automatico da GitHub
  - Supporta Node.js/PHP/Python
- **Microsoft Azure** — $100 crediti + servizi gratuiti
  - App Service, Functions, Database MySQL/PostgreSQL
- **GitHub Pages** — Hosting statico gratuito (illimitato)
  - Perfetto per frontend se usi API separate

#### 🗄️ **Database**
- **MongoDB Atlas** — $50 crediti + certificazione gratis
  - 512MB storage gratis permanente
- **Microsoft Azure** — MySQL/PostgreSQL incluso nei crediti
- **Heroku Postgres** — Database gestito incluso

#### 🌍 **Domini**
- **Namecheap** — 1 dominio `.me` gratis per 1 anno + SSL gratis
- **Name.com** — 1 dominio gratis (`.live`, `.dev`, `.app`, `.studio`)
- **.TECH** — 1 dominio `.tech` gratis per 1 anno

#### 🔧 **DevOps & CI/CD**
- **GitHub Actions** — 2000 minuti/mese gratis (già incluso in GitHub Pro studenti)
- **Travis CI** — Build privati gratis
- **Sentry** — Error tracking (50K errori/mese)
- **Datadog** — Monitoring (10 server, free per 2 anni)

#### 🔐 **Sicurezza & Credenziali**
- **1Password** — Gratis per 1 anno (gestione password/segreti team)
- **Doppler** — Gestione secrets/env variables (Team plan gratis)

---

## 🏗️ Fase 2: Architettura Consigliata per Shappa

### Opzione A — Full Stack su DigitalOcean (Consigliata)

**Setup:**
```
┌─────────────────────────────────────┐
│  Dominio: shappa.tech               │
│  (Name.com / Namecheap gratis)      │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│  DigitalOcean Droplet Ubuntu 22.04  │
│  1GB RAM, 25GB SSD ($6/mese)        │
├─────────────────────────────────────┤
│  - Nginx (reverse proxy & SSL)      │
│  - Node.js / PHP (backend API)      │
│  - File statici (HTML/CSS/JS)       │
│  - PM2 (process manager)            │
│  - Certbot (Let's Encrypt SSL)      │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│  MongoDB Atlas (database remoto)    │
│  512MB free tier permanente         │
└─────────────────────────────────────┘
```

**Pro:**
- Controllo totale
- Configurabile al 100%
- $200 crediti = ~33 mesi gratis
- Performance ottima

**Contro:**
- Richiede configurazione server manuale
- Devi gestire aggiornamenti sistema

---

### Opzione B — Serverless Heroku (Più semplice)

**Setup:**
```
┌─────────────────────────────────────┐
│  Dominio: shappa.me                 │
│  (Namecheap gratis)                 │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│  Heroku App (deploy automatico)     │
│  Dyno Eco ($5/mese, gratis con pack)│
├─────────────────────────────────────┤
│  - Git push = deploy automatico     │
│  - SSL gratis incluso               │
│  - Scalabile automaticamente        │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│  Heroku Postgres / MongoDB Atlas    │
│  Database gestito automaticamente   │
└─────────────────────────────────────┘
```

**Pro:**
- Zero configurazione server
- Deploy automatico da GitHub
- SSL e dominio custom inclusi
- Backup automatici

**Contro:**
- Meno controllo
- Dyno dorme dopo 30 min inattività (Eco tier)

---

### Opzione C — Hybrid (Frontend statico + Backend API)

**Setup:**
```
┌─────────────────────────────────────┐
│  Frontend: shappa.github.io         │
│  (GitHub Pages - gratis permanente) │
│  HTML/CSS/JS statici                │
└──────────────┬──────────────────────┘
               │ API calls
┌──────────────▼──────────────────────┐
│  Backend API: api.shappa.tech       │
│  DigitalOcean / Heroku              │
│  Node.js Express / PHP Laravel      │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│  MongoDB Atlas                       │
└─────────────────────────────────────┘
```

**Pro:**
- Frontend sempre veloce (CDN GitHub)
- Backend separato = più sicuro
- Frontend gratis permanente

**Contro:**
- CORS da configurare
- Due repo separati

---

## 🔧 Fase 3: Setup Iniziale (Opzione A - DigitalOcean)

### 3.1 Crea Droplet DigitalOcean

1. Vai su https://cloud.digitalocean.com/droplets/new
2. Scegli:
   - **Image:** Ubuntu 22.04 LTS
   - **Plan:** Basic $6/mese (1GB RAM, 25GB SSD, 1TB transfer)
   - **Datacenter:** Amsterdam / Frankfurt (più vicino all'Italia)
   - **Authentication:** SSH keys (genera se non ce l'hai)
3. Hostname: `shappa-prod`
4. Clicca **Create Droplet**

### 3.2 Connetti al Server via SSH

```powershell
# Dalla tua macchina locale
ssh root@<DROPLET_IP>
```

### 3.3 Setup Iniziale Server

```bash
# Aggiorna sistema
apt update && apt upgrade -y

# Installa dipendenze base
apt install -y nginx git curl wget certbot python3-certbot-nginx

# Installa Node.js (se usi Node)
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Oppure installa PHP (se usi PHP)
apt install -y php8.1-fpm php8.1-mysql php8.1-curl php8.1-xml php8.1-zip

# Installa PM2 (process manager Node.js)
npm install -g pm2

# Crea utente deploy (non root)
adduser deploy
usermod -aG sudo deploy
su - deploy
```

### 3.4 Configura Nginx

```bash
sudo nano /etc/nginx/sites-available/shappa
```

**Configurazione base:**
```nginx
server {
    listen 80;
    server_name shappa.tech www.shappa.tech;
    root /var/www/shappa;
    index index.html index.php;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Se usi PHP
    location ~ \.php$ {
        include snippets/fastcgi-php.conf;
        fastcgi_pass unix:/var/run/php/php8.1-fpm.sock;
    }

    # Se usi Node.js API (reverse proxy)
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Abilita il sito:
```bash
sudo ln -s /etc/nginx/sites-available/shappa /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 3.5 Ottieni SSL Gratis (Let's Encrypt)

```bash
sudo certbot --nginx -d shappa.tech -d www.shappa.tech
# Segui wizard, accetta redirect HTTPS
```

### 3.6 Deploy dal Repository GitHub

```bash
# Come utente deploy
cd /var/www
sudo mkdir shappa
sudo chown deploy:deploy shappa
cd shappa

# Clona il repository
git clone https://github.com/shapironeil/shappa.git .

# Se usi Node.js
npm ci --production
pm2 start src/server.js --name shappa
pm2 save
pm2 startup

# Se usi PHP
# I file sono già serviti da Nginx
```

---

## 🔄 Fase 4: CI/CD Automatico con GitHub Actions

### 4.1 Genera Chiave SSH Deploy

Sul server:
```bash
ssh-keygen -t ed25519 -C "deploy@shappa" -f ~/.ssh/deploy_key
cat ~/.ssh/deploy_key.pub >> ~/.ssh/authorized_keys
cat ~/.ssh/deploy_key  # Copia la chiave PRIVATA
```

### 4.2 Aggiungi Secrets su GitHub

1. Vai su https://github.com/shapironeil/shappa/settings/secrets/actions
2. Clicca **New repository secret**
3. Aggiungi:
   - `SSH_PRIVATE_KEY` = chiave privata copiata sopra
   - `DEPLOY_HOST` = IP del droplet (es: `164.90.x.x`)
   - `DEPLOY_USER` = `deploy`
   - `DEPLOY_PATH` = `/var/www/shappa`

### 4.3 Il workflow GitHub Actions è già presente

Il file `.github/workflows/deploy-ssh.yml` è già configurato. Quando fai push su `main`:
1. GitHub Actions esegue il workflow
2. Si connette al server via SSH
3. Esegue `git pull` e riavvia l'app
4. Deploy completato automaticamente!

---

## 🗄️ Fase 5: Database MongoDB Atlas

### 5.1 Crea Account MongoDB Atlas

1. Vai su https://www.mongodb.com/cloud/atlas/register
2. Registrati con email GitHub Education
3. Riscatta $50 crediti dal Student Pack

### 5.2 Crea Cluster Gratis

1. **Create a cluster** → Free tier (M0, 512MB)
2. Provider: **AWS** o **Google Cloud**
3. Region: **Frankfurt** o **Amsterdam** (vicino all'Italia)
4. Cluster Name: `shappa-cluster`

### 5.3 Configura Accesso

1. **Database Access** → Add New Database User
   - Username: `shappa_app`
   - Password: genera password sicura (salvala in 1Password / Doppler)
2. **Network Access** → Add IP Address
   - Aggiungi IP del tuo Droplet DigitalOcean
   - Oppure `0.0.0.0/0` (SOLO per sviluppo, non production)

### 5.4 Ottieni Connection String

1. **Connect** → Connect your application
2. Copia la stringa: `mongodb+srv://shappa_app:<password>@shappa-cluster.xxxxx.mongodb.net/shappa?retryWrites=true&w=majority`
3. Sostituisci `<password>` con la password reale

### 5.5 Aggiungi al Server

Sul server DigitalOcean:
```bash
nano ~/.env
```

Aggiungi:
```env
MONGODB_URI=mongodb+srv://shappa_app:PASSWORD@shappa-cluster.xxxxx.mongodb.net/shappa
PORT=3000
NODE_ENV=production
```

Riavvia app:
```bash
pm2 restart shappa
```

---

## 🌐 Fase 6: Dominio Custom

### 6.1 Ottieni Dominio Gratis

**Opzione 1 — Namecheap (dominio `.me`)**
1. Vai su https://nc.me/ (attiva offer dal Student Pack)
2. Registra `shappa.me`
3. Nel DNS Manager aggiungi:
   - **A Record**: `@` → `<IP_DROPLET>`
   - **A Record**: `www` → `<IP_DROPLET>`

**Opzione 2 — Name.com (dominio `.tech`, `.dev`, `.app`)**
1. Vai su https://www.name.com/partner/github-students
2. Registra `shappa.tech`
3. DNS: come sopra

### 6.2 Aggiorna Nginx e SSL

```bash
# Aggiorna nginx con il nuovo dominio (già fatto sopra)
sudo certbot --nginx -d shappa.me -d www.shappa.me
sudo systemctl restart nginx
```

---

## 🔐 Fase 7: Gestione Secrets & Variabili d'Ambiente

### Opzione A — Doppler (Consigliato)

1. Vai su https://doppler.com/
2. Attiva offer Student Pack (Team plan gratis)
3. Crea progetto `shappa`
4. Aggiungi secrets:
   ```
   MONGODB_URI=mongodb+srv://...
   AMAZON_API_KEY=...
   EBAY_API_KEY=...
   SESSION_SECRET=...
   ```
5. Installa Doppler CLI sul server:
   ```bash
   curl -Ls https://cli.doppler.com/install.sh | sh
   doppler login
   doppler setup
   pm2 restart shappa
   ```

### Opzione B — File .env locale (Meno sicuro)

```bash
nano /var/www/shappa/.env
# Aggiungi secrets
chmod 600 .env  # Solo deploy user può leggere
```

---

## 📊 Fase 8: Monitoring & Error Tracking

### 8.1 Sentry (Error Tracking)

1. Vai su https://sentry.io/signup/
2. Attiva offer Student Pack (50K errori/mese)
3. Crea progetto `shappa`
4. Aggiungi SDK al codice:
   ```javascript
   // src/index.js
   const Sentry = require("@sentry/node");
   Sentry.init({ dsn: "https://...@sentry.io/..." });
   ```

### 8.2 Datadog (Monitoring Server)

1. Vai su https://www.datadoghq.com/
2. Attiva offer Student Pack (free per 2 anni)
3. Installa agent sul server:
   ```bash
   DD_API_KEY=xxx DD_SITE="datadoghq.eu" bash -c "$(curl -L https://s3.amazonaws.com/dd-agent/scripts/install_script.sh)"
   ```

---

## 📝 Fase 9: Workflow Sviluppo Online

### Opzione 1 — GitHub Codespaces (Consigliato)

Con GitHub Pro (incluso Student Pack) hai:
- **120 ore/mese gratis** di Codespaces
- Ambiente dev completo nel browser
- Sincronizzazione automatica

**Come usare:**
1. Vai su https://github.com/shapironeil/shappa
2. Clicca **Code** → **Codespaces** → **Create codespace on main**
3. Aspetta che carichi VS Code nel browser
4. Modifica file, commit, push
5. GitHub Actions deploierà automaticamente sul server!

### Opzione 2 — GitHub Web Editor

1. Premi `.` (punto) su qualsiasi pagina del repository
2. Si apre VS Code web
3. Modifica, commit, push
4. Deploy automatico via Actions

### Opzione 3 — Modifica Direttamente sul Server (Sconsigliato per production)

```bash
ssh deploy@<IP_DROPLET>
cd /var/www/shappa
nano src/pages/listings.html
git add .
git commit -m "Fix: ..."
git push origin main
pm2 restart shappa
```

**⚠️ Attenzione:** questo bypassa il CI/CD e può causare conflitti.

---

## 🎯 Fase 10: Checklist Pre-Launch

Prima di andare live, verifica:

- [ ] SSL attivo e certificato valido
- [ ] Database MongoDB connesso e funzionante
- [ ] Secrets configurati (Doppler o .env)
- [ ] GitHub Actions funzionante (prova un push)
- [ ] Monitoring attivo (Sentry + Datadog)
- [ ] Backup database configurato (MongoDB Atlas auto-backup)
- [ ] Firewall configurato (UFW su Ubuntu)
- [ ] PM2 configurato per auto-restart on reboot
- [ ] Dominio DNS propagato (verifica con `dig shappa.tech`)
- [ ] Nginx logs configurati (`/var/log/nginx/`)

---

## 🚦 Quick Start — TL;DR

Per iniziare subito (opzione più rapida):

```powershell
# 1. Attiva GitHub Student Pack
# https://education.github.com/pack

# 2. Esegui script push locale
cd "C:\Users\marco\OneDrive\Desktop\shappa"
powershell.exe -NoProfile -ExecutionPolicy Bypass -File ".\scripts\push_to_github.ps1"

# 3. Crea account Heroku e collega GitHub
# https://dashboard.heroku.com/new-app
# Deploy automatico da repository

# 4. Aggiungi MongoDB Atlas
# heroku addons:create mongolab:sandbox

# 5. Configura dominio Namecheap
# https://nc.me/

# Done! App live in 30 minuti
```

---

## 📚 Risorse Utili

- **GitHub Student Pack**: https://education.github.com/pack
- **DigitalOcean Tutorials**: https://www.digitalocean.com/community/tutorials
- **MongoDB Atlas Docs**: https://www.mongodb.com/docs/atlas/
- **Nginx Config Generator**: https://www.digitalocean.com/community/tools/nginx
- **Certbot Guide**: https://certbot.eff.org/instructions
- **PM2 Docs**: https://pm2.keymetrics.io/docs/usage/quick-start/
- **GitHub Actions Docs**: https://docs.github.com/en/actions

---

## 💡 Consigli per Studenti

1. **Inizia con Heroku** se non hai esperienza server
2. **Passa a DigitalOcean** quando vuoi più controllo
3. **Usa sempre Git** per ogni modifica
4. **Setta monitoring subito** (Sentry/Datadog)
5. **Backup regolari** del database
6. **Documenta tutto** che fai (anche per esame/tesi!)
7. **Chiedi aiuto** su Discord/Forum GitHub Education

---

## 🤝 Supporto

- **GitHub Education Community**: https://github.com/orgs/github-community/discussions/categories/github-education
- **DigitalOcean Community**: https://www.digitalocean.com/community
- **MongoDB Forums**: https://www.mongodb.com/community/forums

Buon deployment! 🚀
