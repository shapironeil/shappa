# 🚀 Guida al Deploy Online - Shappa

Questa guida ti aiuterà a deployare l'applicazione Shappa online su diverse piattaforme.

## 📋 Prerequisiti

1. **Account GitHub** con il repository del progetto
2. **Variabili d'ambiente** pronte (vedi sezione Variabili d'Ambiente)
3. **Node.js** installato localmente per test

## 🔐 Variabili d'Ambiente Necessarie

Prima di deployare, assicurati di avere queste variabili d'ambiente configurate:

```bash
# Server
PORT=3000
NODE_ENV=production

# eBay API
EBAY_CLIENT_ID=your_client_id
EBAY_CLIENT_SECRET=your_client_secret
EBAY_DEV_ID=your_dev_id
EBAY_RUNAME=your_ru_name
EBAY_REDIRECT_URI=https://your-domain.com/auth/ebay/callback
EBAY_AUTH_URL=https://auth.ebay.com/oauth2/authorize
EBAY_TOKEN_URL=https://api.ebay.com/identity/v1/oauth2/token
EBAY_API_URL=https://api.ebay.com
EBAY_SCOPES=https://api.ebay.com/oauth/api_scope
EBAY_MARKETPLACE_ID=EBAY_IT

# Figma API
FIGMA_API_KEY=your_figma_api_key

# Admin (opzionale)
ADMIN_TOKEN=your_admin_token

# Amazon Demo (opzionale)
USE_AMAZON_DEMO=0
```

---

## 🚂 Opzione 1: Railway (Consigliato)

Railway è perfetto per applicazioni Node.js con processi persistenti (monitor, cron jobs).

### Setup Railway

1. **Vai su [Railway.app](https://railway.app)** e crea un account
2. **Clicca "New Project"** → **"Deploy from GitHub repo"**
3. **Seleziona il repository** Shappa
4. **Railway rileverà automaticamente** il progetto Node.js

### Configurazione Variabili d'Ambiente

1. Nel dashboard Railway, vai su **"Variables"**
2. Aggiungi tutte le variabili d'ambiente necessarie (vedi sopra)
3. Railway genererà automaticamente un URL (es: `https://shappa-production.up.railway.app`)

### Dominio Personalizzato

1. Vai su **"Settings"** → **"Domains"**
2. Clicca **"Custom Domain"**
3. Aggiungi il tuo dominio `shapiro.ninja`
4. Segui le istruzioni per configurare i DNS:
   - Aggiungi un record CNAME: `shapiro.ninja` → `your-app.up.railway.app`

### Deploy Automatico

Railway deploya automaticamente ad ogni push su `main` o `master`.

**Comandi utili:**
```bash
# Verifica lo stato del deploy
railway status

# Visualizza i log
railway logs

# Apri il progetto nel browser
railway open
```

---

## 🎨 Opzione 2: Render

Render è un'alternativa valida a Railway, con un piano gratuito generoso.

### Setup Render

1. **Vai su [Render.com](https://render.com)** e crea un account
2. **Clicca "New +"** → **"Web Service"**
3. **Connetti il repository GitHub**
4. **Configurazione:**
   - **Name:** `shappa-backend`
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
   - **Plan:** Free o Starter

### Configurazione Variabili d'Ambiente

1. Nel dashboard Render, vai su **"Environment"**
2. Aggiungi tutte le variabili d'ambiente necessarie
3. Render genererà un URL (es: `https://shappa-backend.onrender.com`)

### Dominio Personalizzato

1. Vai su **"Settings"** → **"Custom Domains"**
2. Aggiungi `shapiro.ninja`
3. Configura i DNS:
   - Aggiungi un record CNAME: `shapiro.ninja` → `your-app.onrender.com`

---

## ▲ Opzione 3: Vercel

Vercel è ottimo per applicazioni serverless, ma ha limitazioni con processi persistenti.

### Setup Vercel

1. **Installa Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Login:**
   ```bash
   vercel login
   ```

3. **Deploy:**
   ```bash
   vercel
   ```

4. **Deploy in produzione:**
   ```bash
   vercel --prod
   ```

### Configurazione Variabili d'Ambiente

1. Vai su [vercel.com/dashboard](https://vercel.com/dashboard)
2. Seleziona il progetto
3. Vai su **"Settings"** → **"Environment Variables"**
4. Aggiungi tutte le variabili necessarie

### Dominio Personalizzato

1. Vai su **"Settings"** → **"Domains"**
2. Aggiungi `shapiro.ninja`
3. Configura i DNS seguendo le istruzioni

**⚠️ Nota:** Vercel ha limitazioni con processi persistenti (monitor, cron). Considera Railway o Render se hai bisogno di questi.

---

## 🐳 Opzione 4: Docker + Cloud Provider

Se preferisci più controllo, puoi usare Docker con AWS, Google Cloud, o DigitalOcean.

### Build Docker Image

```bash
docker build -t shappa:latest .
```

### Run Locally

```bash
docker run -p 3000:3000 --env-file .env shappa:latest
```

### Deploy su Cloud Provider

Ogni provider ha le sue istruzioni specifiche. Il Dockerfile è già configurato.

---

## 📝 Checklist Pre-Deploy

- [ ] Tutte le variabili d'ambiente sono configurate
- [ ] Il file `.env` NON è committato (è già nel `.gitignore`)
- [ ] Il database/archiviazione dati è configurato (se necessario)
- [ ] I certificati SSL sono gestiti dalla piattaforma
- [ ] Il dominio è configurato correttamente
- [ ] I test locali passano

---

## 🔍 Verifica Deploy

Dopo il deploy, verifica che tutto funzioni:

1. **Health Check:**
   ```bash
   curl https://shapiro.ninja/health
   ```

2. **Test API:**
   ```bash
   curl https://shapiro.ninja/api/admin/server-data
   ```

3. **Verifica Frontend:**
   - Apri `https://shapiro.ninja` nel browser
   - Verifica che tutte le pagine carichino correttamente

---

## 🐛 Troubleshooting

### Problema: "Cannot find module"
**Soluzione:** Assicurati che `package.json` contenga tutte le dipendenze necessarie.

### Problema: "Port already in use"
**Soluzione:** La piattaforma gestisce automaticamente la porta tramite `process.env.PORT`.

### Problema: "Environment variables not found"
**Soluzione:** Verifica che tutte le variabili siano configurate nel dashboard della piattaforma.

### Problema: "Process persistenti non funzionano"
**Soluzione:** Usa Railway o Render invece di Vercel per processi persistenti.

---

## 📚 Risorse Utili

- [Railway Docs](https://docs.railway.app)
- [Render Docs](https://render.com/docs)
- [Vercel Docs](https://vercel.com/docs)
- [Docker Docs](https://docs.docker.com)

---

## 🎯 Raccomandazione

Per questa applicazione con processi persistenti (monitor, cron jobs), **Railway è la scelta migliore**.

**Prossimi passi:**
1. Crea account Railway
2. Connetti repository GitHub
3. Configura variabili d'ambiente
4. Aggiungi dominio personalizzato
5. Deploy automatico ad ogni push! 🚀

