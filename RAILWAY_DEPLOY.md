# Railway Deploy Checklist

## ✅ Pre-Deploy Checklist

- [ ] Account Railway creato
- [ ] Repository GitHub connesso
- [ ] Tutte le variabili d'ambiente configurate nel dashboard Railway
- [ ] Dominio `shapiro.ninja` configurato (se necessario)
- [ ] DNS configurato correttamente
- [ ] Test locale passati

## 🔐 Variabili d'Ambiente da Configurare

Nel dashboard Railway → Variables, aggiungi:

### Server
- `NODE_ENV=production`
- `PORT` (gestito automaticamente da Railway)

### eBay API
- `EBAY_CLIENT_ID`
- `EBAY_CLIENT_SECRET`
- `EBAY_DEV_ID`
- `EBAY_RUNAME`
- `EBAY_REDIRECT_URI=https://shapiro.ninja/auth/ebay/callback`
- `EBAY_AUTH_URL=https://auth.ebay.com/oauth2/authorize`
- `EBAY_TOKEN_URL=https://api.ebay.com/identity/v1/oauth2/token`
- `EBAY_API_URL=https://api.ebay.com`
- `EBAY_SCOPES=https://api.ebay.com/oauth/api_scope`
- `EBAY_MARKETPLACE_ID=EBAY_IT`

### Figma API
- `FIGMA_API_KEY`

### Opzionali
- `ADMIN_TOKEN` (per accesso admin)
- `USE_AMAZON_DEMO=0`

## 🚀 Passi per Deploy

1. **Crea progetto Railway:**
   - Vai su https://railway.app
   - New Project → Deploy from GitHub repo
   - Seleziona repository Shappa

2. **Configura variabili:**
   - Settings → Variables
   - Aggiungi tutte le variabili sopra

3. **Deploy automatico:**
   - Railway deploya automaticamente ad ogni push su main/master
   - Oppure usa: `railway up`

4. **Configura dominio:**
   - Settings → Domains
   - Aggiungi `shapiro.ninja`
   - Configura DNS CNAME

5. **Verifica:**
   - Controlla i log: `railway logs`
   - Test health: `curl https://shapiro.ninja/health`

## 📝 Note

- Railway gestisce automaticamente SSL/HTTPS
- Il deploy è automatico ad ogni push su main/master
- I log sono disponibili nel dashboard Railway
- Railway supporta processi persistenti (perfetto per monitor e cron)

