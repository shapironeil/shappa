# 🚀 Quick Start Deploy Guide

## Deploy Rapido su Railway (Consigliato)

### 1. Setup Iniziale (una volta sola)

```bash
# Installa Railway CLI
npm install -g @railway/cli

# Login
railway login
```

### 2. Deploy dal Browser (Più Semplice)

1. Vai su https://railway.app
2. Clicca "New Project" → "Deploy from GitHub repo"
3. Seleziona il repository Shappa
4. Railway rileverà automaticamente Node.js
5. Vai su "Variables" e aggiungi tutte le variabili da `.env.example`
6. Railway genererà automaticamente un URL

### 3. Deploy da CLI

```bash
# Link al progetto Railway
railway link

# Deploy
npm run deploy:railway
# oppure
railway up
```

### 4. Configura Dominio

1. Nel dashboard Railway: Settings → Domains
2. Aggiungi `shapiro.ninja`
3. Configura DNS:
   - Tipo: CNAME
   - Nome: shapiro.ninja (o @)
   - Valore: your-app.up.railway.app

---

## Deploy su Vercel

```bash
# Installa Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
npm run deploy:vercel
# oppure
vercel --prod
```

⚠️ **Nota:** Vercel ha limitazioni con processi persistenti. Usa Railway per monitor e cron jobs.

---

## Variabili d'Ambiente da Configurare

Copia tutte le variabili da `.env.example` e compilale nel dashboard della piattaforma.

**Variabili essenziali:**
- `EBAY_CLIENT_ID`
- `EBAY_CLIENT_SECRET`
- `FIGMA_API_KEY`
- `PORT` (gestito automaticamente dalla piattaforma)

---

## Verifica Deploy

```bash
# Health check
curl https://shapiro.ninja/health

# Test API
curl https://shapiro.ninja/api/admin/server-data
```

---

## Supporto

Per problemi, consulta `DEPLOY.md` per la guida completa.

