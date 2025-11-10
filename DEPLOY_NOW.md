# 🚀 Deploy Immediato - Istruzioni Step-by-Step

## Opzione 1: Railway (Consigliato - 5 minuti)

### Step 1: Crea Account Railway
1. Vai su https://railway.app
2. Clicca "Start a New Project"
3. Login con GitHub

### Step 2: Connetti Repository
1. Clicca "Deploy from GitHub repo"
2. Autorizza Railway ad accedere ai tuoi repository
3. Seleziona il repository `LifeManager` (o il nome del tuo repo)

### Step 3: Configura Variabili d'Ambiente
Nel dashboard Railway:
1. Clicca sul progetto appena creato
2. Vai su "Variables" (tab in alto)
3. Aggiungi queste variabili (clicca "New Variable" per ognuna):

```
NODE_ENV = production
EBAY_CLIENT_ID = [il tuo client ID eBay]
EBAY_CLIENT_SECRET = [il tuo client secret eBay]
EBAY_DEV_ID = [il tuo dev ID eBay]
EBAY_RUNAME = [il tuo RU name eBay]
EBAY_REDIRECT_URI = https://shapiro.ninja/auth/ebay/callback
EBAY_AUTH_URL = https://auth.ebay.com/oauth2/authorize
EBAY_TOKEN_URL = https://api.ebay.com/identity/v1/oauth2/token
EBAY_API_URL = https://api.ebay.com
EBAY_SCOPES = https://api.ebay.com/oauth/api_scope
EBAY_MARKETPLACE_ID = EBAY_IT
FIGMA_API_KEY = [il tuo token Figma]
```

### Step 4: Deploy Automatico
Railway deploya automaticamente! Vai su "Deployments" per vedere lo stato.

### Step 5: Ottieni URL
1. Vai su "Settings" → "Domains"
2. Railway ti ha già dato un URL tipo: `shappa-production.up.railway.app`
3. Puoi usare questo URL temporaneamente

### Step 6: Configura Dominio Personalizzato (Opzionale)
1. Sempre in "Settings" → "Domains"
2. Clicca "Custom Domain"
3. Inserisci: `shapiro.ninja`
4. Railway ti darà un record CNAME da aggiungere al tuo DNS:
   - Tipo: CNAME
   - Nome: @ (o shapiro.ninja)
   - Valore: [il CNAME che Railway ti fornisce]

### Step 7: Verifica
Apri il browser e vai su:
- URL Railway: `https://shappa-production.up.railway.app/health`
- O il tuo dominio: `https://shapiro.ninja/health`

Dovresti vedere: `{"status":"ok","port":...}`

---

## Opzione 2: Render (Alternativa)

### Step 1: Crea Account
1. Vai su https://render.com
2. Sign up con GitHub

### Step 2: Crea Web Service
1. Clicca "New +" → "Web Service"
2. Connetti repository GitHub
3. Seleziona repository `LifeManager`

### Step 3: Configurazione
- **Name:** `shappa-backend`
- **Environment:** `Node`
- **Build Command:** `npm install`
- **Start Command:** `node server.js`
- **Plan:** Free (per iniziare)

### Step 4: Variabili d'Ambiente
Nella sezione "Environment Variables", aggiungi tutte le variabili come sopra.

### Step 5: Deploy
Clicca "Create Web Service" - Render deployerà automaticamente.

---

## Opzione 3: Vercel (Solo se non hai processi persistenti)

⚠️ **Attenzione:** Vercel non supporta bene processi persistenti (monitor, cron). Usa Railway o Render.

```bash
# Installa Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

---

## ✅ Verifica Deploy Riuscito

Dopo il deploy, testa questi endpoint:

```bash
# Health check
curl https://your-domain.com/health

# Dovresti vedere: {"status":"ok","port":...}

# Test API admin
curl https://your-domain.com/api/admin/server-data

# Dovresti vedere dati JSON
```

---

## 🐛 Problemi Comuni

### "Cannot find module"
**Soluzione:** Assicurati che `package.json` contenga tutte le dipendenze. Railway/Render installano automaticamente da `package.json`.

### "Environment variable not found"
**Soluzione:** Verifica che tutte le variabili siano configurate nel dashboard della piattaforma.

### "Port already in use"
**Soluzione:** Non è un problema! La piattaforma gestisce automaticamente la porta tramite `process.env.PORT`.

### Deploy fallisce
**Soluzione:** Controlla i log:
- Railway: Dashboard → Deployments → Clicca sul deploy → Logs
- Render: Dashboard → Logs

---

## 📞 Supporto

Se hai problemi:
1. Controlla i log della piattaforma
2. Verifica che tutte le variabili d'ambiente siano configurate
3. Assicurati che il repository sia pubblico o che la piattaforma abbia accesso

---

## 🎯 Prossimi Passi

Dopo il deploy riuscito:
1. ✅ Configura il dominio personalizzato
2. ✅ Testa tutte le funzionalità
3. ✅ Configura monitor e automazioni
4. ✅ Imposta backup automatici (se necessario)

**Buon deploy! 🚀**

