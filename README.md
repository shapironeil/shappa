# 🛒 Shappa - Automazione Listing Amazon → eBay# 🛒 Shappa - Automazione Listing Amazon → eBay# 🛒 Shappa - Automazione Listing Amazon → eBay# 🛒 Shappa - Automazione Listing Amazon → eBay



**Webapp professionale per automatizzare la vendita su eBay attingendo da cataloghi Amazon**



---**Webapp professionale per automatizzare la vendita su eBay attingendo da cataloghi Amazon**



## ✅ **DEPLOYMENT STATUS**



🟢 **ONLINE E FUNZIONANTE**---**Webapp professionale per automatizzare la vendita su eBay attingendo da cataloghi Amazon****Webapp professionale per automatizzare la vendita su eBay attingendo da cataloghi Amazon**



- **URL Live**: https://shapiro.ninja

- **Status**: 200 OK ✅

- **Server**: PM2 attivo su DigitalOcean## ✅ **DEPLOYMENT STATUS**

- **Database**: MongoDB Atlas connesso

- **Ultimo Deploy**: 7 Novembre 2025 - 15:00 UTC

- **Commit**: `87ad50a` - Production documentation + fixes

- **Code Audit**: ✅ Completato - Vedi [`docs/CODE_AUDIT.md`](./docs/CODE_AUDIT.md)🟢 **ONLINE E FUNZIONANTE**## 🌐 Server Production## 🌐 Server Production



### Quick Health Check

```powershell

# Test sito- **URL Live**: https://shapiro.ninja

Invoke-WebRequest -Uri "https://shapiro.ninja" -UseBasicParsing

- **Status**: 200 OK ✅

# Status PM2 (da server)

ssh root@207.154.218.16 "pm2 status"- **Server**: PM2 attivo su DigitalOcean- **URL**: https://shapiro.ninja- **URL**: https://shapiro.ninja



# Logs real-time- **Database**: MongoDB Atlas connesso

ssh root@207.154.218.16 "pm2 logs shappa --lines 50"

```- **Ultimo Deploy**: 7 Novembre 2025 - 14:30 UTC- **Hosting**: DigitalOcean Droplet (207.154.218.16)- **Hosting**: DigitalOcean Droplet (207.154.218.16)



---- **Commit**: `820de75` - Complete environment setup and production documentation



## 🌐 Infrastruttura Production- **Database**: MongoDB Atlas (cluster condiviso dev/prod)- **Database**: MongoDB Atlas (cluster condiviso dev/prod)



### Server### Quick Health Check

- **Provider**: DigitalOcean Droplet

- **IP**: 207.154.218.16```powershell- **Dominio**: shapiro.ninja (DNS puntato a droplet)- **Dominio**: shapiro.ninja (DNS puntato a droplet)

- **OS**: Ubuntu 22.04 LTS

- **Node.js**: v20.x# Test sito

- **Process Manager**: PM2

- **Reverse Proxy**: Nginx + Let's Encrypt SSLInvoke-WebRequest -Uri "https://shapiro.ninja" -UseBasicParsing- **Server**: Node.js + Express- **Server**: Node.js + Express



### Database

- **Provider**: MongoDB Atlas (Cloud)

- **Cluster**: Shared (condiviso dev/prod)# Status PM2 (da server)- **Process Manager**: PM2- **Process Manager**: PM2

- **Strategy**: Database unico per sviluppo e produzione

  - Dev usa eBay Sandbox per testing sicurossh root@207.154.218.16 "pm2 status"

  - Prod usa eBay Production per listing reali

- **Reverse Proxy**: Nginx + Let's Encrypt SSL- **Reverse Proxy**: Nginx + Let's Encrypt SSL

### Dominio

- **Domain**: shapiro.ninja# Logs real-time

- **DNS**: Puntato a 207.154.218.16

- **SSL**: Let's Encrypt (auto-renew)ssh root@207.154.218.16 "pm2 logs shappa --lines 50"



---```



## ✨ Funzionalità Core## ✨ Funzionalità Core## ✨ Funzionalità Core



### 1. 🔍 Ricerca Prodotti Multi-Marketplace---

- **Amazon**: Scraping real-time con Playwright proprietario (stealth mode)

- **Altri marketplace**: In sviluppo (eBay, Alibaba, Walmart, AliExpress)

- Filtri avanzati: paese, categoria, prezzo, ordinamento

- Modal dettagli con galleria immagini HD## 🌐 Infrastruttura Production



### 2. 📦 Gestione Listing### 1. 🔍 Ricerca Prodotti Multi-MarketplaceBackend e frontend usano uno scraper Playwright proprietario per ottenere i dati da Amazon senza servizi esterni.

- Import prodotti con un click

- Calcolo automatico margini e fee eBay### Server

- Monitoraggio prezzi Amazon in tempo reale (ogni 30 minuti)

- Sincronizzazione multi-marketplace- **Provider**: DigitalOcean Droplet- **Amazon**: Scraping real-time con Playwright

- Download automatico immagini prodotto

- **IP**: 207.154.218.16

### 3. 🔐 Autenticazione

- Sistema login/registrazione completo- **OS**: Ubuntu 22.04 LTS- **eBay, Alibaba, Walmart, AliExpress**: In sviluppoFunzionalità principali:

- OAuth eBay integrato (Sandbox + Production)

- Token management con auto-refresh- **Node.js**: v20.x

- Full scopes eBay per accesso completo API

- **Process Manager**: PM2- Filtri avanzati: paese, categoria, prezzo, ordinamento- Scraping Playwright proprietario (server-side) — sostituisce OpenWebNinja e SerpApi

### 4. 📊 Dashboard & Reports

- Overview vendite e profitti- **Reverse Proxy**: Nginx + Let's Encrypt SSL

- Storico transazioni

- Analytics performance- Modal dettagli con galleria immagini HD- Caching in-memory opzionale per dettagli prodotto

- Export dati CSV/Excel

### Database

---

- **Provider**: MongoDB Atlas (Cloud)- Modale dettaglio con galleria immagini e tabs (Info / Automazione)

## 🚀 Setup Locale - Quick Start

- **Cluster**: Shared (condiviso dev/prod)

### Prerequisiti

- Node.js >= 18.x- **Strategy**: Database unico per sviluppo e produzione### 2. 📦 Gestione Listing- Dati prodotto completi e aggiornati

- Git

- Account MongoDB Atlas  - Dev usa eBay Sandbox per testing sicuro

- (Opzionale) eBay Sandbox credentials

  - Prod usa eBay Production per listing reali- Import prodotti con un click- Dockerfile e suggerimenti deploy

### Installazione Rapida



```powershell

# 1. Clona repository### Dominio- Calcolo automatico margini e fee eBay

git clone https://github.com/shapironeil/shappa.git

cd shappa- **Domain**: shapiro.ninja



# 2. Installa dipendenze- **DNS**: Puntato a 207.154.218.16- Monitoraggio prezzi Amazon in tempo realeVariabili ambiente

npm install

- **SSL**: Let's Encrypt (auto-renew)

# 3. Configura ambiente

Copy-Item .env.example .env- Sincronizzazione multi-marketplace- AMAZON_COUNTRY - default country (IT)

# Modifica .env con le tue credenziali

---

# 4. Avvia server di sviluppo

npm run dev- PORT - server port (default 3000)

```

## ✨ Funzionalità Core

Server disponibile su: `http://localhost:3000`

### 3. 🔐 Autenticazione- AMAZON_CACHE_TTL - cache TTL in seconds (default 90)

📖 **Per setup dettagliato vedi**: [`SETUP.md`](./SETUP.md)

### 1. 🔍 Ricerca Prodotti Multi-Marketplace

---

- **Amazon**: Scraping real-time con Playwright proprietario- Sistema login/registrazione completo

## 📁 Struttura Progetto

- **Altri marketplace**: In sviluppo (eBay, Alibaba, Walmart, AliExpress)

```

shappa/- Filtri avanzati: paese, categoria, prezzo, ordinamento- OAuth eBay integrato (Sandbox + Production)eBay OAuth (important)

├── server.js              # Express server principale (1,437 LOC)

├── package.json           # Dipendenze e scripts- Modal dettagli con galleria immagini HD

├── .env.example           # Template variabili ambiente

├── SETUP.md              # Guida setup completa- Token management con auto-refresh- eBay requires a secure (https) redirect URI for OAuth callbacks in many environments. For local development, use `https://localhost:3000/auth/ebay/callback` and ensure your local certificate is trusted (e.g., with mkcert). If you use `http://localhost:3000` eBay OAuth may fail during token exchange.

├── lib/

│   ├── scraper/          # Playwright scraper Amazon### 2. 📦 Gestione Listing

│   │   ├── amazonScraper.js          # Scraper base

│   │   └── stealthAmazonScraper.js   # Scraper stealth (anti-detection)- Import prodotti con un click- Pagine protette con middleware

│   ├── services/         # Business logic

│   │   ├── priceMonitor.js           # Cron job monitoraggio prezzi- Calcolo automatico margini e fee eBay

│   │   ├── amazonService.js          # Service layer Amazon

│   │   └── amazonSerpApiService.js   # Alternative con SerpApi- Monitoraggio prezzi Amazon in tempo realeLocal run

│   ├── openwebninjaClient.js  # Client API OpenWebNinja

│   └── serpapiClient.js       # Client API SerpApi- Sincronizzazione multi-marketplace

├── src/

│   ├── pages/            # Frontend HTML (dashboard, products, listings, reports)### 4. 📊 Dashboard & Reports1. Install dependencies: `npm install`

│   ├── utils/            # Utilities JS (auth, ebay-oauth, API client)

│   └── styles/           # CSS### 3. 🔐 Autenticazione

├── public/               # Asset statici

├── data/                 # Dati applicazione (prodotti salvati)- Sistema login/registrazione completo- Overview vendite e profitti2. Create a `.env` file with the variables above (do not commit the key)

├── oauth/                # Token eBay persistenti

└── docs/                 # Documentazione tecnica- OAuth eBay integrato (Sandbox + Production)

    ├── CODE_AUDIT.md     # Audit codebase completo

    └── ...               # Altre guide- Token management con auto-refresh- Storico transazioni3. Start server: `node server.js`

```

- Pagine protette con middleware

---

- Analytics performance

## 🔑 Variabili d'Ambiente

### 4. 📊 Dashboard & Reports

### Essenziali (Richieste)

```bash- Overview vendite e profitti- Export dati CSV/ExcelDocker

# Server

NODE_ENV=production- Storico transazioni

PORT=3000

- Analytics performance1. Build: `docker build -t shappa .`

# Database

MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/shappa- Export dati CSV/Excel



# eBay OAuth (Production)## 🚀 Quick Start - Sviluppo Locale2. Run: `docker run -p 3000:3000 shappa`

EBAY_CLIENT_ID=your_production_client_id

EBAY_CLIENT_SECRET=your_production_client_secret---

EBAY_REDIRECT_URI=https://shapiro.ninja/auth/ebay/callback

```



### Opzionali## 🚀 Setup Locale - Quick Start

```bash

# eBay (avanzate)### PrerequisitiImportant

EBAY_DEV_ID=your_dev_id

EBAY_RUNAME=your_ru_name### Prerequisiti

EBAY_AUTH_URL=https://auth.ebay.com/oauth2/authorize

EBAY_TOKEN_URL=https://api.ebay.com/identity/v1/oauth2/token- Node.js >= 18.x- Node.js >= 18.x- Il file `lib/scraper/amazonScraper.js` contiene la logica di scraping e mapping. Aggiornare la documentazione quando si modifica l’estrazione dati.

EBAY_API_URL=https://api.ebay.com

EBAY_SCOPES=https://api.ebay.com/oauth/api_scope...- Git

EBAY_MARKETPLACE_ID=EBAY_IT

- Account MongoDB Atlas- Git# 📋 Stato Aggiornato (09/10/2025 - ore 20:45)

# eBay Sandbox (development)

EBAY_SANDBOX_CLIENT_ID=your_sandbox_id- (Opzionale) eBay Sandbox credentials

EBAY_SANDBOX_CLIENT_SECRET=your_sandbox_secret

EBAY_SANDBOX_REDIRECT_URI=https://localhost:3000/auth/ebay/callback- Account MongoDB Atlas



# Amazon Scraping### Installazione Rapida

USE_AMAZON_DEMO=1  # Usa dati demo per testing

OPENWEBNINJA_API_KEY=your_api_key  # Opzionale- (Opzionale) Credenziali eBay Sandbox## 🚀 Nuove Funzionalità v2.0.1

SERPAPI_KEY=your_api_key  # Opzionale

```powershell

# Development

DISABLE_HTTPS=true  # Disabilita HTTPS locale# 1. Clona repository

DEV_PFX_PASSPHRASE=shappa-dev  # Passphrase cert SSL

git clone https://github.com/shapironeil/shappa.git

# Admin

ADMIN_TOKEN=your_secure_token  # Per endpoint /api/admin/*cd shappa### Installazione### 1. Navbar Universale - Click Nickname da Qualsiasi Pagina

```



**Vedi**: [`.env.example`](./.env.example) per template completo

# 2. Installa dipendenze- ✅ **Click Universale**: Ora il click su nickname/avatar funziona da **TUTTE le pagine** (Dashboard, Settings, Admin, ecc.)

---

npm install

## 🌐 API Endpoints (36 totali)

```powershell- ✅ **Smart Redirect**: 

### Health & Status

- `GET /health` - Health check semplice# 3. Configura ambiente

- `GET /api/health` - Health check API

Copy-Item .env.example .env# Clona il repository  - Se sei in Settings → switcha direttamente alla tab Account

### eBay OAuth & Account (10)

- `GET /api/ebay/auth-url` - URL autorizzazione# Modifica .env con le tue credenziali

- `GET /auth/ebay/callback` - Callback OAuth

- `GET /api/ebay/status` - Status autenticazionegit clone https://github.com/shapironeil/shappa.git  - Se sei in altre pagine → redirect a Settings → Account

- `POST /api/ebay/refresh` - Refresh token

- `GET /api/ebay/profile` - Profilo utente# 4. Avvia server di sviluppo

- `GET /api/ebay/account-info` - Info account

- `GET /api/ebay/token-info` - Info tokennpm run devcd shappa- ✅ **Deep Linking**: Supporto per URL diretto `settings.html#account`

- `POST /api/ebay/disconnect` - Disconnetti

- `POST /api/ebay/user-info` - User info via token```

- `POST /api/ebay/test-connection` - Test connessione

- ✅ **Codice Centralizzato**: Nuovo file `src/utils/navbar-universal.js` per gestire tutto in modo DRY

### eBay Listings (7)

- `POST /api/ebay/list` - Crea listing (mock)Server disponibile su: `http://localhost:3000`

- `POST /api/ebay/create-listing` - Crea listing completo

- `GET /api/ebay/listings` - Lista tutti# Installa dipendenze

- `POST /api/ebay/sync-listings` - Sincronizza da eBay

- `POST /api/ebay/publish` - Pubblica listing📖 **Per setup dettagliato vedi**: [`SETUP.md`](./SETUP.md)

- `POST /api/ebay/listings/:id/end` - Termina

- `POST /api/ebay/listings/:id/relist` - Ri-listanpm install### 2. Gestione Errori OAuth Migliorata



### Amazon Scraping (3)---

- `GET /api/amazon/search` - Cerca prodotti

- `GET /api/amazon/product/:asin` - Dettagli prodotto- ✅ **Messaggio User-Friendly**: Se chiudi la finestra OAuth, ora vedi "ℹ️ Connessione annullata. Clicca su 'Connetti eBay' per riprovare." invece di un errore generico

- `GET /api/amazon/scrape` - Scraping Playwright

## 📁 Struttura Progetto

### Altri Marketplace (2)

- `GET /api/aliexpress/search` - AliExpress (placeholder)# Copia e configura .env- ✅ **Notifica Info**: Colore blu (info) invece di rosso (error) per indicare che è solo un'azione annullata

- `GET /api/alibaba/search` - Alibaba (placeholder)

```

### Gestione Prodotti (4)

- `POST /api/products/save` - Salva prodottoshappa/Copy-Item .env.example .env- ✅ **UX Migliorata**: L'utente capisce immediatamente che può riprovare senza problemi

- `GET /api/products/saved` - Lista salvati

- `DELETE /api/products/saved/:asin` - Elimina├── server.js              # Express server principale

- `POST /api/products/download-images` - Download immagini

├── package.json           # Dipendenze e scripts# Modifica .env con le tue credenziali

### Gestione Immagini (5)

- `GET /api/products/:asin/images` - Info immagini├── .env.example           # Template variabili ambiente

- `GET /api/images/status/:asin` - Status download

- `POST /api/images/download` - Avvia download├── SETUP.md              # Guida setup completa**Documentazione completa**: [`docs/CHANGELOG_NAVBAR_UNIVERSAL.md`](docs/CHANGELOG_NAVBAR_UNIVERSAL.md)

- `GET /api/images/downloaded/:asin` - Lista scaricate

- `GET /api/images/serve/:asin/:filename` - Serve immagine├── lib/



### Price Monitoring (3)│   ├── scraper/          # Playwright scraper Amazon# Avvia il server di sviluppo

- `POST /api/monitor/add` - Aggiungi monitor

- `POST /api/monitor/remove` - Rimuovi monitor│   └── services/         # Business logic (monitor prezzi)

- `GET /api/monitor/list` - Lista monitor

├── src/npm run dev## 🎯 Miglioramenti UX Precedenti

### Admin (1)

- `POST /api/admin/clear-cache` - Pulisci cache (protetto)│   ├── pages/            # Frontend HTML (dashboard, products, listings)



---│   ├── utils/            # Utilities JS (auth, API client)```



## 🌍 Deploy in Produzione│   └── styles/           # CSS



### Architettura├── public/               # Asset statici### Click sul Nickname → Redirect alla Scheda Account



```├── data/                 # Dati applicazione

Internet → DNS → Nginx (shapiro.ninja:443) → PM2 → Node.js App (port 3000)

                                                          ↓├── oauth/                # Token eBayIl server sarà disponibile su: `http://localhost:3000`- ✅ **Nickname e Avatar Cliccabili**: Ora cliccando sul tuo nickname o avatar nella navbar, vieni automaticamente reindirizzato alla scheda "Account" nelle impostazioni

                                                    MongoDB Atlas

```└── docs/                 # Documentazione tecnica



### Deploy Steps```- ✅ **Hover Effects**: Effetti visivi al passaggio del mouse per indicare che sono elementi cliccabili



1. **Commit e Push modifiche**:

```powershell

git add .---**Per configurazione dettagliata, vedi** [`SETUP.md`](./SETUP.md)- ✅ **Transizioni Smooth**: Animazioni fluide per un'esperienza utente premium

git commit -m "feat: descrizione modifiche"

git push origin main

```

## 🔑 Variabili d'Ambiente

2. **SSH nel server**:

```powershell

ssh root@207.154.218.16

```### Server## 📁 Struttura Progetto### Formato User ID eBay Migliorato



3. **Pull e deploy**:```bash

```bash

cd /var/www/shappaNODE_ENV=development|production- ✅ **Display Name**: Ora mostra `nickname (Nome Cognome)` invece di "eBay User"

git pull origin main

npm ci --only=productionPORT=3000

pm2 restart shappa

pm2 save``````- ✅ **Email Sottostante**: Visualizzazione dell'email associata sotto il nome utente

```



4. **Verifica deployment**:

```bash### Databaseshappa/- ✅ **Informazioni Complete**: Massima visibilità dei dati dell'account connesso

pm2 logs shappa --lines 50

curl https://shapiro.ninja/api/health```bash

```

MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/shappa├── server.js              # Server Express principale

### Nginx Configuration

```

**File**: `/etc/nginx/sites-available/shappa`

├── package.json           # Dipendenze### Sistema di Scadenza Token Migliorato

```nginx

server {### eBay OAuth

    server_name shapiro.ninja;

    ```bash├── .env.example           # Template variabili ambiente- ✅ **Messaggi Chiari**: Ora il sistema spiega chiaramente cosa significa "Token scade tra X ore"

    location / {

        proxy_pass http://localhost:3000;# Production (server online)

        proxy_http_version 1.1;

        proxy_set_header Upgrade $http_upgrade;EBAY_CLIENT_ID=your_production_client_id├── SETUP.md              # Guida setup completa- ✅ **Indicatori Visivi**: 

        proxy_set_header Connection 'upgrade';

        proxy_set_header Host $host;EBAY_CLIENT_SECRET=your_production_secret

        proxy_set_header X-Real-IP $remote_addr;

        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;EBAY_REDIRECT_URI=https://shapiro.ninja/auth/ebay/callback├── lib/  - ✅ Verde = Token valido (> 1 giorno)

        proxy_set_header X-Forwarded-Proto $scheme;

        proxy_cache_bypass $http_upgrade;

    }

# Sandbox (sviluppo locale)│   ├── scraper/          # Playwright scraper Amazon  - ⚠️ Giallo = Token in scadenza (< 24 ore, rinnovo imminente)

    listen 443 ssl http2;

    ssl_certificate /etc/letsencrypt/live/shapiro.ninja/fullchain.pem;EBAY_SANDBOX_CLIENT_ID=your_sandbox_client_id

    ssl_certificate_key /etc/letsencrypt/live/shapiro.ninja/privkey.pem;

    include /etc/letsencrypt/options-ssl-nginx.conf;EBAY_SANDBOX_CLIENT_SECRET=your_sandbox_secret│   └── services/         # Business logic (monitor prezzi, etc)  - ⏱️ Arancione = Rinnovo in corso (< 1 ora)

    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

}EBAY_SANDBOX_REDIRECT_URI=https://localhost:3000/auth/ebay/callback



server {```├── src/  - ❌ Rosso = Token scaduto (rinnovo automatico attivo)

    listen 80;

    server_name shapiro.ninja;

    return 301 https://$server_name$request_uri;

}### Scraping (Opzionali)│   ├── pages/            # Frontend (dashboard, products, listings, settings)- ✅ **Testo Esplicativo**: Ogni stato mostra un messaggio che spiega che il rinnovo è automatico

```

```bash

---

OPENWEBNINJA_API_KEY=your_api_key│   ├── utils/            # Utilities JS (auth, API client)- ✅ **Documentazione Completa**: Creato `docs/TOKEN_REFRESH_EXPLANATION.md` con FAQ dettagliate

## 🛠️ Workflow Sviluppo

SERPAPI_KEY=your_api_key

### Git Flow

```│   └── styles/           # CSS

```powershell

# 1. Crea feature branch

git checkout -b feature/nome-feature

---├── public/               # Asset statici# Shappa - Stato Sviluppo eBay OAuth & Account Integration

# 2. Sviluppa e testa locale

npm run dev



# 3. Commit modifiche## 🌍 Deploy in Produzione└── docs/                 # Documentazione tecnica

git add .

git commit -m "feat: descrizione chiara"



# 4. Push e crea PR### Architettura```## Scopes OAuth eBay (Produzione)

git push origin feature/nome-feature



# 5. Dopo merge, deploy in produzione (vedi sopra)

``````



### TestingInternet → DNS → Nginx (shapiro.ninja:443) → PM2 → Node.js App (port 3000)



**Locale**:                                                          ↓## 🔑 Variabili d'Ambiente PrincipaliPer garantire massima flessibilità futura, il backend richiede ora per default un set esteso di scopes eBay al momento del login (FULL_SCOPES), che include:

```powershell

npm run dev                                                    MongoDB Atlas

# Apri http://localhost:3000

``````



**Production**:

```powershell

Invoke-WebRequest -Uri "https://shapiro.ninja" -UseBasicParsing### Deploy Steps```bash- https://api.ebay.com/oauth/api_scope

```



---

1. **Commit e Push modifiche**:# Server- https://api.ebay.com/oauth/api_scope/commerce.identity.readonly

## 🐛 Troubleshooting

```powershell

### Server locale non si avvia

git add .NODE_ENV=development|production- https://api.ebay.com/oauth/api_scope/commerce.catalog.readonly

```powershell

# Check porta occupatagit commit -m "feat: descrizione modifiche"

netstat -ano | findstr :3000

git push origin mainPORT=3000- https://api.ebay.com/oauth/api_scope/commerce.notification.subscription

# Reinstalla dipendenze

Remove-Item node_modules -Recurse -Force```

npm install

- https://api.ebay.com/oauth/api_scope/sell.inventory (+ readonly)

# Verifica .env

cat .env2. **SSH nel server**:

```

```powershell# Database (MongoDB Atlas)- https://api.ebay.com/oauth/api_scope/sell.account (+ readonly)

### MongoDB connection failed

ssh root@207.154.218.16

- ✅ Verifica `MONGODB_URI` in `.env`

- ✅ Whitelist IP in MongoDB Atlas: **Network Access** → **Add IP Address**```MONGODB_URI=mongodb+srv://...- https://api.ebay.com/oauth/api_scope/sell.fulfillment (+ readonly)

- ✅ Controlla username/password corretti

- ✅ Verifica nome database in connection string



### eBay OAuth non funziona3. **Pull e deploy**:- https://api.ebay.com/oauth/api_scope/sell.marketing (+ readonly)



**Locale**:```bash

- Usa **HTTPS**: `https://localhost:3000` (eBay richiede SSL)

- Verifica redirect URI in eBay Developer Portalcd /var/www/shappa# eBay OAuth- https://api.ebay.com/oauth/api_scope/sell.analytics.readonly

- Usa credenziali **Sandbox** per sviluppo

git pull origin main

**Produzione**:

- Verifica credenziali **Production** in `.env`npm ci --only=productionEBAY_CLIENT_ID=...- https://api.ebay.com/oauth/api_scope/sell.finances

- Controlla redirect URI: `https://shapiro.ninja/auth/ebay/callback`

- Verifica scopes richiesti vs concessipm2 restart shappa



### PM2 non parte su serverpm2 saveEBAY_CLIENT_SECRET=...- https://api.ebay.com/oauth/api_scope/sell.payment.dispute



```bash```

# Check PM2 status

pm2 statusEBAY_REDIRECT_URI=https://shapiro.ninja/auth/ebay/callback- https://api.ebay.com/oauth/api_scope/buy.shopping.cart



# Restart da zero4. **Verifica deployment**:

pm2 delete shappa

pm2 start server.js --name shappa```bash- https://api.ebay.com/oauth/api_scope/buy.deal.readonly



# Salva configurazionepm2 logs shappa --lines 50

pm2 save

pm2 startup  # Configura autostart al bootcurl https://shapiro.ninja/api/health# Amazon Scraping (opzionale)- https://api.ebay.com/oauth/api_scope/buy.marketing.readonly

```

```

---

OPENWEBNINJA_API_KEY=...- https://api.ebay.com/oauth/api_scope/buy.browse

## 📚 Documentazione

### Nginx Configuration

- 📖 **Setup Completo**: [`SETUP.md`](./SETUP.md)

- 🔍 **Code Audit**: [`docs/CODE_AUDIT.md`](./docs/CODE_AUDIT.md)SERPAPI_KEY=...- https://api.ebay.com/oauth/api_scope/buy.offer.auction

- 🔐 **OAuth eBay**: `docs/EBAY_OAUTH_SETUP.md`

- 🚀 **Deployment**: `DEPLOYMENT_ROADMAP.md`**File**: `/etc/nginx/sites-available/shappa`

- 🔧 **API Docs**: `docs/API.md`

```- https://api.ebay.com/oauth/api_scope/buy.order.readonly

---

```nginx

## 📊 Roadmap & Status

server {- https://api.ebay.com/oauth/api_scope/buy.product.summary

### ✅ Completato (v2.1.0)

- [x] Sistema autenticazione (login/register)    server_name shapiro.ninja;

- [x] Scraper Amazon proprietario (Playwright stealth)

- [x] OAuth eBay (Sandbox + Production)    ## 🌍 Deploy in Produzione- https://api.ebay.com/oauth/api_scope/buy.product.conclusion

- [x] Gestione listing con calcolo margini

- [x] Monitoraggio prezzi real-time (cron 30 min)    location / {

- [x] Deploy production su DigitalOcean

- [x] Dashboard responsive        proxy_pass http://localhost:3000;

- [x] MongoDB Atlas integration

- [x] PM2 process management        proxy_http_version 1.1;

- [x] Nginx reverse proxy + SSL

- [x] Download automatico immagini prodotto        proxy_set_header Upgrade $http_upgrade;### Architettura ProductionNota: puoi ridurre gli scopes impostando la variabile d'ambiente `EBAY_SCOPES` (spazio-separati); il sistema unirà comunque i tuoi scopes con quelli di default evitando duplicati.

- [x] Code audit completo e cleanup

- [x] Documentazione completa        proxy_set_header Connection 'upgrade';



### 🔄 In Progress        proxy_set_header Host $host;

- [ ] API integrazione altri marketplace (Alibaba, Walmart, AliExpress)

- [ ] Bulk listing automation        proxy_set_header X-Real-IP $remote_addr;

- [ ] Advanced analytics e reports

- [ ] Performance optimization        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;```### Re-consent necessario

- [ ] Test automatici (unit + integration)

        proxy_set_header X-Forwarded-Proto $scheme;

### 📈 Futuro

- [ ] AI-powered pricing suggestions        proxy_cache_bypass $http_upgrade;Internet → Cloudflare/DNS → Nginx (shapiro.ninja) → PM2 → Node.js App

- [ ] Multi-account management eBay

- [ ] Inventory sync cross-platform    }

- [ ] Chrome extension per quick listing

- [ ] Mobile app (React Native)                                                           ↓Se hai effettuato la connessione eBay in precedenza con scopes più limitati, per ottenere accesso ai nuovi permessi (es. Identity) devi:

- [ ] Notifiche email/push

- [ ] Supporto multi-lingua    listen 443 ssl http2;

- [ ] API pubblica per integrazioni

- [ ] Dashboard analytics avanzata    ssl_certificate /etc/letsencrypt/live/shapiro.ninja/fullchain.pem;                                                     MongoDB Atlas

- [ ] Sistema di alerting automatico

    ssl_certificate_key /etc/letsencrypt/live/shapiro.ninja/privkey.pem;

---

    include /etc/letsencrypt/options-ssl-nginx.conf;```1. Disconnettere in Settings (o revocare l'app da eBay → Account → Security → Third-party apps)

## 🔧 Tech Stack

    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

**Backend**:

- Node.js 20.x}2. Cliccare “Connetti eBay” e completare nuovamente il consenso

- Express.js 5.x

- MongoDB Atlas (cloud database)

- Playwright 1.56 (web scraping)

- node-cron 4.2 (scheduled tasks)server {### Server DigitalOcean

- axios 1.12 (HTTP client)

    listen 80;

**Frontend**:

- HTML5 / CSS3 / Vanilla JavaScript    server_name shapiro.ninja;### Gestione errori profilo

- Responsive design

- Font Awesome icons    return 301 https://$server_name$request_uri;

- No frameworks (performance-first)

}**Specs**:

**Infrastructure**:

- DigitalOcean (hosting VPS)```

- MongoDB Atlas (database cloud)

- Nginx (reverse proxy)- Ubuntu 22.04 LTSLa chiamata `/api/ebay/profile` risponde con `403 insufficient_scope` se l'account non ha concesso i permessi necessari (es. manca `commerce.identity.readonly`). In tal caso la UI mostra una CTA per aggiornare i permessi rifacendo il login eBay.

- PM2 (process manager)

- Let's Encrypt (SSL/TLS)---

- GitHub (version control + CI/CD)

- Node.js 20.x

**APIs & Services**:

- eBay API (OAuth + Inventory + Sell APIs)## 🛠️ Workflow Sviluppo

- Amazon (Playwright scraping proprietario)

- MongoDB Atlas Cloud- Nginx + Let's Encrypt## Stato attuale

- (Optional) OpenWebNinja / SerpApi

### Git Flow

---

- PM2 process manager

## 📈 Metriche Progetto

```powershell

| Metrica | Valore |

|---------|--------|# 1. Crea feature branch- IP: 207.154.218.16- **eBay OAuth 2.0 Sandbox** integrato con tutti gli scope necessari (identity, account, analytics, reputation, finances, ecc.).

| **Lines of Code (server.js)** | 1,437 |

| **API Endpoints** | 36 |git checkout -b feature/nome-feature

| **Moduli lib/** | 8 files |

| **Frontend pages** | 6 pages |- **Flusso di login**: popup OAuth, ricezione token, salvataggio access/refresh token, auto-refresh ogni 30 minuti.

| **Dependencies** | 7 packages |

| **Variabili ENV** | 17 core + 11 optional |# 2. Sviluppa e testa locale

| **Commit totali** | 100+ |

| **Uptime produzione** | 99.9% |npm run dev### Deploy Steps- **Recupero dati utente**: chiamata a `/api/ebay/user-info` backend che interroga l'Identity API. In sandbox, i dati sono limitati (nickname, nome, cognome, email spesso nulli).



---



## 🔐 Security# 3. Commit modifiche- **Card eBay Seller Hub**: mostra stato connessione, userId, data connessione, scadenza token, bottone info ⓘ con popup dettagli.



### Best Practices Implementategit add .

- ✅ Variabili sensibili in `.env` (non commitato)

- ✅ HTTPS obbligatorio in produzionegit commit -m "feat: descrizione chiara"1. **SSH nel droplet**:- **Visualizzazione intelligente**: se nickname/nome/cognome non disponibili, mostra almeno userId. Nel popup info, nota "sandbox: dati limitati" se i dati sono null.

- ✅ OAuth 2.0 per autenticazione eBay

- ✅ Token refresh automatico

- ✅ Admin endpoints protetti da token

- ✅ CORS configurato correttamente# 4. Push e crea PR```bash- **Architettura frontend**: ApiClient centralizzato, SettingsManager, EventBus, Store. Tutte le chiamate eBay passano da ApiClient.

- ✅ Let's Encrypt SSL/TLS

git push origin feature/nome-feature

### To-Do Security

- [ ] Rate limiting API endpointsssh root@207.154.218.16- **Gestione errori**: fallback automatico su dati minimi, notifiche user-friendly, log dettagliati per debug.

- [ ] Input validation e sanitization

- [ ] SQL injection protection (parametrized queries)# 5. Dopo merge, deploy in produzione (vedi sopra)

- [ ] XSS protection headers

- [ ] CSRF tokens``````- **UI**: nessuna modifica estetica, solo miglioramenti funzionali e informativi.

- [ ] Security audit professionale



---

### Testing

## 🤝 Contributing



Questo è un progetto privato. Per contribuire o per maggiori informazioni, contatta il maintainer.

**Locale**:2. **Pull modifiche**:## Limitazioni attuali

### Workflow Contributori

1. Fork del repository```powershell

2. Crea feature branch (`git checkout -b feature/AmazingFeature`)

3. Commit modifiche (`git commit -m 'Add AmazingFeature'`)npm run dev```bash

4. Push al branch (`git push origin feature/AmazingFeature`)

5. Apri Pull Request# Apri http://localhost:3000



---```cd /var/www/shappa- In **sandbox** non è possibile ottenere dati utente reali (nickname, nome, cognome, email) tramite Identity API. In produzione, con account reale e scope corretti, i dati saranno disponibili.



## 📄 License



**Proprietario** - Tutti i diritti riservati  **Production**:git pull origin main- La card e il popup info mostrano sempre almeno userId. Se i dati sono null, viene visualizzato un messaggio di avviso.

Copyright © 2025 Marco (@shapironeil)

```powershell

---

Invoke-WebRequest -Uri "https://shapiro.ninja" -UseBasicParsingnpm ci --only=production- Il backend logga ogni chiamata eBay e fallback.

## 📞 Contatti & Support

```

**Maintainer**: Marco  

**GitHub**: [@shapironeil](https://github.com/shapironeil)  ```

**Repository**: [shapironeil/shappa](https://github.com/shapironeil/shappa)  

**Website**: https://shapiro.ninja---



### Supporto## Prossimi step (priorità per domani)

- 🐛 **Bug Reports**: Apri issue su GitHub

- 💡 **Feature Requests**: Discussioni GitHub## 🐛 Troubleshooting

- 📧 **Email**: Disponibile su richiesta

3. **Riavvia app**:

---

### Server locale non si avvia

## 🎉 Changelog

```bash1. **Testare in produzione** (quando pronto): verificare che nickname, nome, cognome, email siano valorizzati e visualizzati correttamente.

### v2.1.0 (7 Novembre 2025)

- ✅ Code audit completo e cleanup```powershell

- ✅ Rimosso endpoint duplicato `/api/amazon/product/:asin`

- ✅ Fixato URL hardcoded in `settings.js`# Check porta occupatapm2 restart shappa2. **Estendere la raccolta dati**:

- ✅ Rimossi file backup obsoleti

- ✅ Aggiornato `.env.example` con variabili correttenetstat -ano | findstr :3000

- ✅ Documentazione completa (`CODE_AUDIT.md`)

- ✅ README completamente riscrittopm2 save   - Integrare chiamate alle API eBay Sell Account (privilegi, business policies, limiti, seller standards, reputation, finances) e mostrare nel popup info.

- ✅ Deploy production verificato e funzionante

# Reinstalla dipendenze

### v2.0.0 (6 Novembre 2025)

- ✅ OAuth eBay full scopes implementationRemove-Item node_modules -Recurse -Force```   - Mostrare anche metriche di venditore, limiti, stato account, eventuali warning.

- ✅ Stealth Amazon scraper con anti-detection

- ✅ Price monitoring automatico (cron)npm install

- ✅ Download automatico immagini prodotto

- ✅ Dashboard completa con reports3. **Gestione multi-marketplace**:



### v1.0.0 (Ottobre 2025)# Verifica .env

- ✅ Prima release production

- ✅ Deploy su DigitalOceancat .env4. **Verifica**:   - Supportare account eBay su più marketplace (IT, DE, FR, UK, US) e visualizzare le policy per ciascuno.

- ✅ MongoDB Atlas integration

- ✅ PM2 + Nginx setup```



---```bash4. **Persistenza e sicurezza**:



**Ultimo aggiornamento**: 7 Novembre 2025, 15:30 UTC  ### MongoDB connection failed

**Versione**: 2.1.0  

**Status**: 🟢 Production Online & Code Audit Completedpm2 logs shappa   - Migliorare la persistenza dei token e dati utente (migrazione da localStorage a backend/DB sicuro).


- ✅ Verifica `MONGODB_URI` in `.env`

- ✅ Whitelist IP in MongoDB Atlas: **Network Access** → **Add IP Address**curl https://shapiro.ninja/api/health   - Gestire logout, revoca token, sessioni attive.

- ✅ Controlla username/password corretti

- ✅ Verifica nome database in connection string```5. **Esperienza utente**:



### eBay OAuth non funziona   - Migliorare le notifiche e i messaggi di stato (es. "sandbox: dati limitati", "token scaduto, login richiesto", ecc.).



**Locale**:### Nginx Configuration   - Aggiungere loader e feedback visivi per tutte le azioni.

- Usa **HTTPS**: `https://localhost:3000` (eBay richiede SSL)

- Verifica redirect URI in eBay Developer Portal6. **Compliance e aggiornamenti 2025**:

- Usa credenziali **Sandbox** per sviluppo

File: `/etc/nginx/sites-available/shappa`   - Gestire la transizione da username a userId per utenti US (dal 26 settembre 2025).

**Produzione**:

- Verifica credenziali **Production** in `.env`   - Documentare nel codice e nel README le differenze tra sandbox e produzione.

- Controlla redirect URI: `https://shapiro.ninja/auth/ebay/callback`

- Verifica scopes richiesti vs concessi```nginx7. **Documentazione e onboarding**:



### PM2 non parte su serverserver {   - Aggiornare README e commenti in codice per facilitare la ripresa lavori.



```bash    server_name shapiro.ninja;   - Elencare tutti gli endpoint, scope OAuth, flussi e fallback implementati.

# Check PM2 status

pm2 status    



# Restart da zero    location / {## Bisogni chiave per la web app

pm2 delete shappa

pm2 start server.js --name shappa        proxy_pass http://localhost:3000;



# Salva configurazione        proxy_http_version 1.1;- **Automazione listing**: connessione eBay/Amazon, creazione automatica listing, sincronizzazione prezzi e inventario.

pm2 save

pm2 startup  # Configura autostart al boot        proxy_set_header Upgrade $http_upgrade;- **Gestione account**: visualizzazione dettagli utente, stato connessione, token, limiti, metriche venditore.

```

        proxy_set_header Connection 'upgrade';- **Sicurezza**: gestione token sicura, refresh automatico, logout, sessioni, compliance OAuth.

---

        proxy_set_header Host $host;- **Scalabilità**: architettura modulare (ApiClient, EventBus, Store), facile estensione per nuovi marketplace e API.

## 📚 Documentazione

        proxy_set_header X-Real-IP $remote_addr;- **User experience**: feedback chiari, notifiche, errori gestiti, UI pulita e informativa.

- 📖 **Setup Completo**: [`SETUP.md`](./SETUP.md)

- 🔐 **OAuth eBay**: `docs/EBAY_OAUTH_SETUP.md`        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;- **Documentazione**: README sempre aggiornato, commenti chiari, flussi ben descritti.

- 🚀 **Deployment**: `DEPLOYMENT_ROADMAP.md`

- 🔧 **API Docs**: `docs/API.md`        proxy_set_header X-Forwarded-Proto $scheme;



---    }## 🆕 Nuove Funzionalità v2.1.0 (12/10/2025)



## 📊 Roadmap & Status



### ✅ Completato    listen 443 ssl; # managed by Certbot### 1. Fee eBay Integrate

- [x] Sistema autenticazione (login/register)

- [x] Scraper Amazon proprietario (Playwright)    ssl_certificate /etc/letsencrypt/live/shapiro.ninja/fullchain.pem;- ✅ **Calcolo Automatico**: Fee eBay calcolate automaticamente nella modale prodotto (FVF 5% fino a €2000 + 2% sopra, fee fissa €0.35, normativa 0.43%)

- [x] OAuth eBay (Sandbox + Production)

- [x] Gestione listing con calcolo margini    ssl_certificate_key /etc/letsencrypt/live/shapiro.ninja/privkey.pem;- ✅ **Configurabile**: Fee % e fissa modificabili nella sezione Automazione della modale

- [x] Monitoraggio prezzi real-time

- [x] Deploy production su DigitalOcean}- ✅ **Profitto Live**: Ricalcolo automatico del profitto al cambio di prezzi o fee

- [x] Dashboard responsive

- [x] MongoDB Atlas integration```

- [x] PM2 process management

- [x] Nginx reverse proxy + SSL### 2. Pagina Listing Completa



### 🔄 In Progress## 🛠️ Sviluppo- ✅ **Struttura**: Sidebar con cartelle (Non listato, eBay), tabella a destra con colonne Titolo/Prezzo Listing/Resell/Profitto/% Sponsor/Spedizione/Amazon/eBay/Azioni

- [ ] API integrazione altri marketplace (Alibaba, Walmart, AliExpress)

- [ ] Bulk listing automation- ✅ **Persistenza**: IndexedDB per salvare listings, import da Amazon con automazioni estratte

- [ ] Advanced analytics e reports

- [ ] Performance optimization### Workflow Git- ✅ **Aggiornamento Prezzi**: Pulsante "Aggiorna prezzi" per sincronizzare da Amazon, con indicatori ↑/↓ per variazioni



### 📈 Futuro- ✅ **Monitoraggio**: Pulsante "Avvia monitoraggio" per refresh automatico ogni 5 minuti

- [ ] AI-powered pricing suggestions

- [ ] Multi-account management eBay```powershell- ✅ **Selezione Multipla**: Checkbox per selezionare più righe, azioni bulk (elimina selezionati)

- [ ] Inventory sync cross-platform

- [ ] Chrome extension per quick listing# Crea feature branch- ✅ **Listing eBay**: Pulsante "Lista" per creare listing su eBay (mock endpoint), aggiorna record con URL eBay

- [ ] Mobile app (React Native)

- [ ] Notifiche email/pushgit checkout -b feature/nome-feature

- [ ] Supporto multi-lingua

- [ ] API pubblica per integrazioni### 3. Miglioramenti UX



---# Sviluppa e committa- ✅ **Uniformità Estetica**: Stili dashboard applicati a tutte le pagine, navbar consistente



## 🔧 Tech Stackgit add .- ✅ **Tabella Avanzata**: Sorting, paginazione, ricerca, accessibilità WAI-ARIA



**Backend**:git commit -m "feat: descrizione modifiche"- ✅ **E2E Validazione**: Test end-to-end per flussi completi (search → modal → import → table → refresh → list)

- Node.js 20.x

- Express.js 5.x

- MongoDB + Mongoose

- Playwright (scraping)# Push e PR### 4. Backend e Sicurezza

- node-cron (scheduled tasks)

git push origin feature/nome-feature- ✅ **Mock eBay API**: Endpoint POST /api/ebay/list per simulare listing in sandbox

**Frontend**:

- HTML5 / CSS3 / Vanilla JavaScript```- ✅ **Caching Ottimizzato**: TTL configurabile, mapping robusto per tutti campi prodotto

- Responsive design

- Font Awesome icons- ✅ **Backup Sicurezza**: amazonService.bak.js per protezione logica



**Infrastructure**:### Testing

- DigitalOcean (hosting)

- MongoDB Atlas (database)### 5. Integrazione Ricerca Prodotti Unificata

- Nginx (reverse proxy)

- PM2 (process manager)```powershell- ✅ **Unificazione Interfacce**: Ricerca prodotti integrata direttamente in `listings.html`

- Let's Encrypt (SSL)

- GitHub (version control)# Test locale- ✅ **Eliminazione Pagina Separata**: Rimosso `products.html` ridondante



**APIs & Services**:npm run dev- ✅ **Flusso Unificato**: Ricerca → Selezione → Import → Listing in un'unica pagina

- eBay API (OAuth + Inventory)

- Amazon (Playwright scraping)- ✅ **Funzionalità Complete**: Filtri avanzati (paese, categoria, prezzo, ordinamento)

- MongoDB Atlas

- (Optional) OpenWebNinja / SerpApi# Test produzione (dopo deploy)- ✅ **Modal Dettagli**: Popup completo con tabs Info/Automazione/Manuale



---curl https://shapiro.ninja/api/health- ✅ **Responsive Design**: Layout adattivo per desktop e mobile



## 🤝 Contributing```



Questo è un progetto privato. Per contribuire o per maggiori informazioni, contatta il maintainer.---



---## 📚 Documentazione



## 📄 License## 🔄 Aggiornamento del 12/10/2025



**Proprietario** - Tutti i diritti riservati- **Setup Ambiente**: [`SETUP.md`](./SETUP.md)



---- **OAuth eBay**: `docs/EBAY_OAUTH_SETUP.md`### ✅ Modifiche completate oggi:



## 📞 Contatti & Support- **Deployment**: `DEPLOYMENT_ROADMAP.md`



**Maintainer**: Marco  #### 1. **Ristrutturazione Ricerca Prodotti**

**GitHub**: [@shapironeil](https://github.com/shapironeil)  

**Repository**: [shapironeil/shappa](https://github.com/shapironeil/shappa)## 🐛 Troubleshooting- ✅ **Spostata ricerca** da `listings.html` a `products.html` (come richiesto)



---- ✅ **Multi-marketplace UI**: Supporto visuale per Amazon, Alibaba, eBay, Walmart, AliExpress



**Ultimo aggiornamento**: 7 Novembre 2025  ### Server non si avvia- ✅ **Filtri avanzati**: Paese, categoria, prezzo min/max, ordinamento

**Versione**: 2.1.0  

**Status**: 🟢 Production Online```powershell- ✅ **Badge dinamico**: Mostra marketplace e paese selezionati


# Verifica porta libera

netstat -ano | findstr :3000#### 2. **eBay OAuth Verificato**

- ✅ **Sistema OAuth funzionante**: Testato su `https://localhost:3000/test-oauth.html`

# Check dipendenze- ✅ **Settings integrati**: Login eBay disponibile in `https://localhost:3000/src/pages/settings.html`

npm install- ✅ **Documentazione completa**: Vedi `EBAY_OAUTH_SETUP.md` e `test-oauth.html`



# Verifica .env#### 3. **Dettagli Prodotti OpenWebNinja**

cat .env- ✅ **API Integration**: Usa `/api/amazon/product/{asin}` per dettagli completi

```- ✅ **Modal ricco**: Galleria immagini, badge, rating, recensioni, link Amazon

- ✅ **Fallback robusto**: Gestisce errori API con dati di ricerca base

### MongoDB connection failed

- Verifica `MONGODB_URI` in `.env`#### 4. **Separazione Funzionalità**

- Whitelist IP in MongoDB Atlas: Network Access → Add IP- ✅ **products.html**: Motore ricerca multi-marketplace dedicato

- ✅ **listings.html**: Gestione listing pulita, senza ricerca integrata

### eBay OAuth non funziona- ✅ **Navigation fix**: Link corretti tra le pagine

- Usa HTTPS in locale: `https://localhost:3000`

- Verifica redirect URI in eBay Developer Portal### 🎯 Funzionalità Disponibili:

- Controlla scopes richiesti vs concessi

1. **Ricerca Multi-Marketplace** (`/src/pages/products.html`)

## 📊 Status & Roadmap   - 🛒 Amazon (attivo), 🏭 Alibaba, 📦 eBay, 🏪 Walmart, 📱 AliExpress (Coming Soon)

   - Filtri: Paese, categoria, prezzo, ordinamento

### ✅ Completato   - Dettagli completi via OpenWebNinja API

- [x] Sistema autenticazione completo

- [x] Scraper Amazon proprietario (Playwright)2. **eBay OAuth** (`/src/pages/settings.html`)

- [x] OAuth eBay (Sandbox + Production)   - Sistema OAuth 2.0 completo e testato

- [x] Gestione listing con calcolo margini   - Gestione token e refresh automatico

- [x] Monitoraggio prezzi real-time   - Test page dedicata: `/test-oauth.html`

- [x] Deploy production su DigitalOcean

- [x] Dashboard responsive3. **Listing Management** (`/src/pages/listings.html`)

   - Focalizzato solo su gestione prodotti importati

### 🔄 In Progress   - Import da localStorage dei risultati ricerca

- [ ] API Alibaba/Walmart/AliExpress   - Calcolo profitti e monitoraggio prezzi

- [ ] Bulk listing automation

- [ ] Advanced analytics### 🚀 Next Steps:

- [ ] Mobile app- Implementazione API per Alibaba/eBay/Walmart quando disponibili

- Ottimizzazione performance ricerca

### 📈 Futuro- Dashboard analytics migliorata

- [ ] AI-powered pricing suggestions

- [ ] Multi-account management---

- [ ] Inventory sync cross-platform

- [ ] Chrome extension## ⚠️ eBay OAuth Sandbox: Configurazione Critica



## 🤝 ContributingQuesta configurazione è validata e funzionante per lo sviluppo locale con eBay Sandbox.



Questo è un progetto privato. Per contribuire contattare il maintainer.**NON MODIFICARE** i parametri eBay in `.env.local` e `.env` (Client ID, RuName, redirect, scopes, ecc.) salvo passaggio a produzione.



## 📄 LicensePer dettagli e backup, vedi `docs/ebay-oauth-checkpoint.md`.



Proprietario - Tutti i diritti riservatiSe devi andare online/produzione, crea una nuova configurazione e aggiorna solo dopo test e backup.



------



**Ultimo aggiornamento**: 7 Novembre 2025  ## 🔐 Protezione Pagine Private (Login Obbligatorio)

**Versione**: 2.1.0  

**Maintainer**: Marco (@shapironeil)Le pagine applicative core ora richiedono obbligatoriamente che l'utente sia autenticato. Protezione attiva su:

`src/pages/dashboard.html`, `src/pages/products.html`, `src/pages/listings.html`, `src/pages/reports.html`, `src/pages/settings.html`.

Meccanismo:
- Lista `enforcedPages` e funzione `enforceProtection()` in `src/utils/auth-v2.js`.
- Fallback inline su ciascuna pagina che reindirizza a `index.html#login` se la sessione non è valida.
- In caso di localStorage corrotto o svuotato l'accesso viene negato e si forza il logout silenzioso.

Verifica rapida post-deploy:
1. Apri una finestra anonima e visita direttamente `/src/pages/dashboard.html` → redirect a `index.html#login`.
2. Effettua login → riapri `/src/pages/dashboard.html` → accesso consentito.
3. Esegui logout → qualsiasi URL protetto torna al login.

Nota: aggiunta pagina placeholder `src/pages/reports.html` per evitare link rotti nel menu e già coperta da protezione.

---

## ℹ️ Endpoint eBay: Account Info Aggregato

Endpoint: `GET /api/ebay/account-info?userId=<username>`

Restituisce in un'unica risposta:
- `identity`: dati da `/commerce/identity/v1/user/` (scope richiesto: `commerce.identity.readonly`)
- `privilege`: dati da `/sell/account/v1/privilege` (scope richiesto: `sell.account.readonly`)
- `scope`: stringa degli scope concessi e salvati per l'utente
- `errors`: mappa con eventuali errori per sezione (`insufficient_scope`, `profile_not_found`, ecc.)

Header marketplace: il server invia `X-EBAY-C-MARKETPLACE-ID` con valore `EBAY_IT` (sovrascrivibile via env `EBAY_MARKETPLACE_ID`).

Note:
- Il refresh token ora non invia più lo scope (conforme alla guida OAuth eBay) e mantiene gli scope già concessi.
- Se in passato hai concesso permessi limitati, usa la UI in `settings.html` per eseguire l'upgrade a permessi avanzati (profilo `full`).
