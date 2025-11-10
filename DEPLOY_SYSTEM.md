# 🚀 Sistema Deploy Esistente - Documentazione

## 📋 Panoramica

Il progetto Shappa usa un sistema di deploy automatico basato su:
- **GitHub Actions** per CI/CD
- **DigitalOcean** come server hosting
- **MongoDB Atlas** come database (da configurare)
- **SSH** per il deploy automatico

---

## 🔧 Architettura Deploy

```
GitHub Repository (main/master)
    ↓ (push trigger)
GitHub Actions Workflow
    ↓ (SSH connection)
DigitalOcean Droplet
    ↓ (rsync files)
/var/www/shappa/
    ↓ (npm install + restart)
PM2 Process Manager
    ↓ (serve app)
Nginx Reverse Proxy
    ↓ (SSL/HTTPS)
shapiro.ninja
```

---

## 📁 File di Configurazione

### 1. GitHub Actions Workflow
**File:** `.github/workflows/deploy-ssh.yml`

Questo workflow si attiva automaticamente ad ogni push su `main` o `master`:
- Si connette al server DigitalOcean via SSH
- Sincronizza i file con `rsync` (escludendo node_modules, .git, etc.)
- Esegue `npm ci --production` per installare dipendenze
- Esegue `restart.sh` per riavviare l'applicazione

### 2. Script di Restart
**File:** `restart.sh`

Script eseguito sul server dopo ogni deploy:
- Installa dipendenze se necessario
- Riavvia l'applicazione con PM2
- Gestisce fallback se PM2 non è disponibile

---

## 🔐 Configurazione Secrets GitHub

Nel repository GitHub, vai su **Settings → Secrets and variables → Actions** e configura:

| Secret | Descrizione | Esempio |
|--------|-------------|---------|
| `SSH_PRIVATE_KEY` | Chiave privata SSH per il deploy user | Contenuto di `~/.ssh/deploy_key` |
| `DEPLOY_HOST` | IP o hostname del server DigitalOcean | `164.90.x.x` o `shapiro.ninja` |
| `DEPLOY_USER` | Username SSH sul server | `deploy` o `root` |
| `DEPLOY_PATH` | Directory di destinazione sul server | `/var/www/shappa` |

### Come generare SSH_PRIVATE_KEY:

Sul server DigitalOcean:
```bash
# Genera chiave SSH per deploy
ssh-keygen -t ed25519 -C "deploy@shappa" -f ~/.ssh/deploy_key

# Aggiungi chiave pubblica ad authorized_keys
cat ~/.ssh/deploy_key.pub >> ~/.ssh/authorized_keys

# Mostra chiave privata (COPIA QUESTO)
cat ~/.ssh/deploy_key
```

Copia il contenuto della chiave privata e incollalo nel secret `SSH_PRIVATE_KEY` su GitHub.

---

## 🗄️ Configurazione MongoDB Atlas

### 1. Crea Cluster MongoDB Atlas

1. Vai su https://www.mongodb.com/cloud/atlas
2. Crea un account (o usa GitHub Student Pack per crediti)
3. Crea un cluster gratuito (M0 - 512MB)
4. Scegli regione vicina (Frankfurt/Amsterdam)

### 2. Configura Accesso Database

1. **Database Access** → Add New Database User
   - Username: `shappa_app`
   - Password: genera password sicura
   - Role: `Atlas admin` o `Read and write to any database`

2. **Network Access** → Add IP Address
   - Aggiungi IP del Droplet DigitalOcean
   - Oppure `0.0.0.0/0` (solo per sviluppo, non production!)

### 3. Ottieni Connection String

1. **Connect** → Connect your application
2. Copia la connection string:
   ```
   mongodb+srv://shappa_app:<password>@shappa-cluster.xxxxx.mongodb.net/shappa?retryWrites=true&w=majority
   ```

### 4. Aggiungi al Server

Sul server DigitalOcean, aggiungi al file `.env`:
```bash
nano /var/www/shappa/.env
```

Aggiungi:
```env
MONGODB_URI=mongodb+srv://shappa_app:PASSWORD@shappa-cluster.xxxxx.mongodb.net/shappa
NODE_ENV=production
PORT=3000
```

---

## 🚀 Workflow Deploy

### Deploy Automatico

1. **Fai modifiche localmente**
2. **Commit e push:**
   ```bash
   git add .
   git commit -m "Descrizione modifiche"
   git push origin main
   ```
3. **GitHub Actions si attiva automaticamente**
4. **Il deploy avviene in ~2-3 minuti**
5. **Verifica su:** https://shapiro.ninja

### Deploy Manuale

Puoi anche triggerare il deploy manualmente:
1. Vai su GitHub → **Actions**
2. Seleziona workflow **"Deploy to DigitalOcean via SSH"**
3. Clicca **"Run workflow"** → **"Run workflow"**

---

## 🔍 Verifica Deploy

### Controlla Status GitHub Actions

1. Vai su https://github.com/tuo-username/LifeManager/actions
2. Clicca sull'ultimo workflow
3. Verifica che tutti gli step siano verdi ✅

### Controlla Server

SSH sul server:
```bash
ssh deploy@shapiro.ninja
cd /var/www/shappa

# Verifica PM2
pm2 status
pm2 logs shappa

# Verifica file
ls -la

# Verifica variabili d'ambiente
cat .env
```

### Test Applicazione

```bash
# Health check
curl https://shapiro.ninja/health

# Dovresti vedere: {"status":"ok","port":3000}
```

---

## 🛠️ Setup Iniziale Server (Una volta sola)

Se il server non è ancora configurato:

### 1. Setup Base

```bash
# Connetti al server
ssh root@<IP_DROPLET>

# Aggiorna sistema
apt update && apt upgrade -y

# Installa Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Installa PM2
npm install -g pm2

# Installa Nginx
apt install -y nginx certbot python3-certbot-nginx

# Crea utente deploy
adduser deploy
usermod -aG sudo deploy
su - deploy
```

### 2. Configura Nginx

```bash
sudo nano /etc/nginx/sites-available/shappa
```

Aggiungi:
```nginx
server {
    listen 80;
    server_name shapiro.ninja www.shapiro.ninja;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Abilita:
```bash
sudo ln -s /etc/nginx/sites-available/shappa /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 3. SSL con Let's Encrypt

```bash
sudo certbot --nginx -d shapiro.ninja -d www.shapiro.ninja
```

### 4. Setup PM2 Auto-Start

```bash
pm2 start server.js --name shappa
pm2 save
pm2 startup
# Esegui il comando che PM2 ti mostra
```

---

## 📝 File Esclusi dal Deploy

Il workflow esclude automaticamente:
- `.git/` - Repository git
- `node_modules/` - Dipendenze (reinstallate sul server)
- `.env` - Variabili d'ambiente (non committate)
- `data/` - Dati locali
- `ssl/` - Certificati SSL
- `*.log` - File di log

---

## 🐛 Troubleshooting

### Deploy fallisce

1. **Verifica SSH connection:**
   ```bash
   ssh -i ~/.ssh/deploy_key deploy@shapiro.ninja
   ```

2. **Verifica secrets GitHub:**
   - Settings → Secrets → Verifica che tutti i secrets siano configurati

3. **Controlla log GitHub Actions:**
   - Actions → Ultimo workflow → Clicca su step fallito

### App non si avvia

1. **SSH sul server:**
   ```bash
   ssh deploy@shapiro.ninja
   cd /var/www/shappa
   ```

2. **Verifica PM2:**
   ```bash
   pm2 status
   pm2 logs shappa
   ```

3. **Riavvia manualmente:**
   ```bash
   pm2 restart shappa
   ```

### MongoDB non si connette

1. **Verifica connection string nel .env**
2. **Verifica Network Access su MongoDB Atlas** (IP del server deve essere whitelisted)
3. **Testa connessione:**
   ```bash
   node -e "require('mongodb').MongoClient.connect('YOUR_CONNECTION_STRING', (err, client) => { console.log(err || 'Connected!'); client.close(); })"
   ```

---

## 📚 Risorse Utili

- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [DigitalOcean Tutorials](https://www.digitalocean.com/community/tutorials)
- [MongoDB Atlas Docs](https://www.mongodb.com/docs/atlas/)
- [PM2 Docs](https://pm2.keymetrics.io/docs/)

---

## ✅ Checklist Setup Completo

- [ ] Server DigitalOcean configurato
- [ ] Nginx configurato con SSL
- [ ] PM2 installato e configurato
- [ ] MongoDB Atlas cluster creato
- [ ] Connection string MongoDB aggiunta al .env
- [ ] Secrets GitHub configurati
- [ ] SSH key generata e aggiunta a GitHub
- [ ] Test deploy riuscito
- [ ] Health check funzionante

---

**Il sistema è già configurato e funzionante!** 🎉

Ogni push su `main` o `master` triggera automaticamente il deploy su DigitalOcean.

