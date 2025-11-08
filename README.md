# 🎯 Shappa - Shopify Drop Monitor & Discord Notifier# 🎯 Shappa - Shopify Drop Monitor & Discord Notifier



> Sistema intelligente di monitoraggio prodotti Shopify con notifiche Discord in tempo reale> Sistema intelligente di monitoraggio prodotti Shopify con notifiche Discord in tempo reale



------



## 📋 Indice## � Indice



- [Overview](#-overview)- [Overview](#-overview)

- [Architettura Sistema](#-architettura-sistema)- [Architettura Sistema](#-architettura-sistema)

- [Setup Ambiente](#-setup-ambiente)- [Setup Ambiente](#-setup-ambiente)

- [Sistema Autenticazione](#-sistema-autenticazione)- [Sistema Autenticazione](#-sistema-autenticazione)

- [Monitor Shopify](#-monitor-shopify)- [Monitor Shopify](#-monitor-shopify)

- [Sistema Notifiche Discord](#-sistema-notifiche-discord)- [Sistema Notifiche Discord](#-sistema-notifiche-discord)

- [API Endpoints](#-api-endpoints)- [API Endpoints](#-api-endpoints)

- [Database](#-database)- [Database](#-database)

- [Deploy Production](#-deploy-production)- [Deploy Production](#-deploy-production)

- [Troubleshooting](#-troubleshooting)- [Troubleshooting](#-troubleshooting)



------



## 🎯 Overview## 🎯 Overview



### Cosa fa Shappa



**Shappa** è un sistema di monitoraggio automatizzato per store Shopify che:- **URL Live**: https://shapiro.ninja



- 🔍 **Monitora prodotti** in tempo reale con Puppeteer Stealth- **Status**: 200 OK ✅

- 🚨 **Rileva drop e restock** di prodotti limitati

- 📱 **Invia notifiche Discord** con embed ricchi e immagini- **Server**: PM2 attivo su DigitalOcean## ✅ **DEPLOYMENT STATUS**

- 👤 **Gestisce utenti** con autenticazione server-side

- ⚙️ **Personalizza interessi** per filtrare notifiche- **Database**: MongoDB Atlas connesso

- ⏱️ **Timing intelligente** con check intensivi ogni mezz'ora

- **Ultimo Deploy**: 7 Novembre 2025 - 16:00 UTC

### Stato Production

- **Commit**: `ed7835d` - Added Obiettivi and Calendario pages

- **🟢 ONLINE**: https://shapiro.ninja

- **Server**: DigitalOcean @ 207.154.218.16- **Code Audit**: ✅ Completato - Vedi [`docs/CODE_AUDIT.md`](./docs/CODE_AUDIT.md)🟢 **ONLINE E FUNZIONANTE**---**Webapp professionale per automatizzare la vendita su eBay attingendo da cataloghi Amazon****Webapp professionale per automatizzare la vendita su eBay attingendo da cataloghi Amazon**

- **Process**: PM2 (PID 166829, restart #7300)

- **SSL**: Nginx + Let's Encrypt

- **Versione**: v2.3.0 (Gennaio 2025)

---

---



## 🏗️ Architettura Sistema

## 🌐 Infrastruttura Production- **URL Live**: https://shapiro.ninja

### Stack Tecnologico



**Backend:**

- Node.js 20.x + Express.js### Server- **Status**: 200 OK ✅

- Puppeteer Stealth (bypass Cloudflare)

- PM2 Process Manager- **Provider**: DigitalOcean Droplet

- JSON File Database (ready for MySQL)

- **IP**: 207.154.218.16- **Server**: PM2 attivo su DigitalOcean## ✅ **DEPLOYMENT STATUS**

**Frontend:**

- Vanilla JavaScript (async/await)- **OS**: Ubuntu 22.04 LTS

- Venus Design System (CSS Variables)

- Responsive Layout- **Node.js**: v20.x- **Database**: MongoDB Atlas connesso



**Infrastructure:**- **Process Manager**: PM2

- DigitalOcean Ubuntu 22.04 LTS

- Nginx Reverse Proxy (port 3000 → 443)- **Reverse Proxy**: Nginx + Let's Encrypt SSL- **Ultimo Deploy**: 7 Novembre 2025 - 15:00 UTC

- Let's Encrypt SSL

- Git + GitHub CI/CD



### Flusso Dati### Database- **Commit**: `87ad50a` - Production documentation + fixes



```- **Provider**: MongoDB Atlas (Cloud)

User Browser → Nginx (443) → Node.js (3000) → Monitor → Shopify Store

                                              ↓- **Cluster**: Shared (condiviso dev/prod)- **Code Audit**: ✅ Completato - Vedi [`docs/CODE_AUDIT.md`](./docs/CODE_AUDIT.md)🟢 **ONLINE E FUNZIONANTE**## 🌐 Server Production## 🌐 Server Production

                                         Discord Webhooks

                                              ↓- **Strategy**: Database unico per sviluppo e produzione

                                    JSON Database (users, interests, webhooks)

```  - Dev usa eBay Sandbox per testing sicuro



### Struttura Cartelle  - Prod usa eBay Production per listing reali



```### Quick Health Check

shappa/

├── server.js                  # Express API server (1765 LOC)### Dominio

├── package.json               # Dependencies

├── .env                       # Environment variables (NOT COMMITTED)- **Domain**: shapiro.ninja```powershell

├── data/                      # JSON databases

│   ├── users/- **DNS**: Puntato a 207.154.218.16

│   │   └── users_db.json     # User accounts

│   ├── interests/- **SSL**: Let's Encrypt (auto-renew)# Test sito- **URL Live**: https://shapiro.ninja

│   │   └── interests_{userId}.json

│   └── webhooks/

│       └── webhook_{userId}.json

├── monitors/---Invoke-WebRequest -Uri "https://shapiro.ninja" -UseBasicParsing

│   └── ShopifyMonitor.js     # Puppeteer monitor (896 LOC)

├── src/

│   ├── pages/

│   │   ├── index.html        # Landing page## ✨ Funzionalità Core- **Status**: 200 OK ✅

│   │   ├── dashboard.html    # Dashboard utente

│   │   └── settings.html     # Impostazioni

│   ├── utils/

│   │   ├── auth-v2.js        # Auth client (async)### 1. 📊 Dashboard & Gestione# Status PM2 (da server)

│   │   ├── login.js          # Login handler

│   │   └── register.js       # Register handler- **Dashboard Principale**: Overview vendite, profitti, statistiche

│   └── styles/               # CSS

└── public/                    # Static assets- **🎯 Obiettivi**: Sistema di tracking obiettivi di business (vendite, profitti, listing)ssh root@207.154.218.16 "pm2 status"- **Server**: PM2 attivo su DigitalOcean- **URL**: https://shapiro.ninja- **URL**: https://shapiro.ninja

```

- **📅 Calendario**: Pianificazione eventi, scadenze listing, promemoria

---

- **📈 Reports**: Analytics dettagliati e export dati

## ⚙️ Setup Ambiente



### Prerequisiti

### 2. 🔍 Ricerca Prodotti Multi-Marketplace# Logs real-time- **Database**: MongoDB Atlas connesso

- **Node.js**: >= 18.x

- **Git**: Ultima versione- **Amazon**: Scraping real-time con Playwright proprietario (stealth mode)

- **PowerShell**: Windows 10/11

- **Account Discord**: Per creare webhook- **Altri marketplace**: In sviluppo (eBay, Alibaba, Walmart, AliExpress)ssh root@207.154.218.16 "pm2 logs shappa --lines 50"



### Installazione Locale- Filtri avanzati: paese, categoria, prezzo, ordinamento



```powershell- Modal dettagli con galleria immagini HD```- **Ultimo Deploy**: 7 Novembre 2025 - 14:30 UTC- **Hosting**: DigitalOcean Droplet (207.154.218.16)- **Hosting**: DigitalOcean Droplet (207.154.218.16)

# 1. Clona repository

git clone https://github.com/shapironeil/shappa.git

cd shappa

### 3. 📦 Gestione Listing

# 2. Installa dipendenze

npm install- Import prodotti con un click



# 3. Crea file .env- Calcolo automatico margini e fee eBay---- **Commit**: `820de75` - Complete environment setup and production documentation

Copy-Item .env.example .env

# Modifica .env con le tue configurazioni- Monitoraggio prezzi Amazon in tempo reale (ogni 30 minuti)



# 4. Avvia in sviluppo- Sincronizzazione multi-marketplace

npm run dev

```- Download automatico immagini prodotto



Server disponibile su: **http://localhost:3000**## 🌐 Infrastruttura Production- **Database**: MongoDB Atlas (cluster condiviso dev/prod)- **Database**: MongoDB Atlas (cluster condiviso dev/prod)



### Variabili d'Ambiente### 4. 🔐 Autenticazione



```bash- Sistema login/registrazione completo

# Server

NODE_ENV=production- OAuth eBay integrato (Sandbox + Production)

PORT=3000

API_BASE=https://shapiro.ninja- Token management con auto-refresh### Server### Quick Health Check



# Monitor Shopify- Full scopes eBay per accesso completo API

SHOPIFY_STORE_URL=https://shop.example.com

CHECK_INTERVAL=5                    # Minuti tra check normali- Pagine protette con middleware- **Provider**: DigitalOcean Droplet

INTENSIVE_INTERVAL=25               # Secondi tra check intensivi

INTENSIVE_DURATION=5                # Durata modalità intensiva (minuti)



# Security---- **IP**: 207.154.218.16```powershell- **Dominio**: shapiro.ninja (DNS puntato a droplet)- **Dominio**: shapiro.ninja (DNS puntato a droplet)

SESSION_SECRET=your_session_secret_here

ADMIN_TOKEN=your_admin_token_here



# Optional## 🚀 Setup Locale - Quick Start- **OS**: Ubuntu 22.04 LTS

DISABLE_MONITOR=false               # true per disabilitare monitor

LOG_LEVEL=info                      # debug|info|warn|error

```

### Prerequisiti- **Node.js**: v20.x# Test sito

---

- Node.js >= 18.x

## 🔐 Sistema Autenticazione

- Git- **Process Manager**: PM2

### Architettura Auth

- Account MongoDB Atlas

**Tipo**: Server-side REST API con JSON database  

**Storage**: `/data/users/users_db.json`  - (Opzionale) eBay Sandbox credentials- **Reverse Proxy**: Nginx + Let's Encrypt SSLInvoke-WebRequest -Uri "https://shapiro.ninja" -UseBasicParsing- **Server**: Node.js + Express- **Server**: Node.js + Express

**Session**: localStorage per UX caching (non critico)



### API Auth Endpoints

### Installazione Rapida

#### 1. POST `/api/auth/register`



**Registra nuovo utente**

```powershell### Database

```javascript

// Request# 1. Clona repository

{

  "username": "marco",      // 3-20 caratteri, alfanumericogit clone https://github.com/shapironeil/shappa.git- **Provider**: MongoDB Atlas (Cloud)

  "email": "marco@example.com",

  "password": "MyP@ssw0rd!" // Min 8 carattericd shappa

}

- **Cluster**: Shared (condiviso dev/prod)# Status PM2 (da server)- **Process Manager**: PM2- **Process Manager**: PM2

// Response (201 Created)

{# 2. Installa dipendenze

  "success": true,

  "user": {npm install- **Strategy**: Database unico per sviluppo e produzione

    "id": "user_1704067200000_abc123",

    "username": "marco",

    "email": "marco@example.com",

    "createdAt": "2025-01-01T00:00:00.000Z",# 3. Configura ambiente  - Dev usa eBay Sandbox per testing sicurossh root@207.154.218.16 "pm2 status"

    "profile": {

      "avatar": null,Copy-Item .env.example .env

      "bio": null,

      "settings": {}# Modifica .env con le tue credenziali  - Prod usa eBay Production per listing reali

    }

  },

  "message": "Registrazione completata con successo"

}# 4. Avvia server di sviluppo- **Reverse Proxy**: Nginx + Let's Encrypt SSL- **Reverse Proxy**: Nginx + Let's Encrypt SSL



// Error (400 Bad Request)npm run dev

{

  "success": false,```### Dominio

  "error": "Username già in uso"

}

```

Server disponibile su: `http://localhost:3000`- **Domain**: shapiro.ninja# Logs real-time

**Validazioni:**

- Username: 3-20 caratteri, lettere/numeri/underscore

- Email: formato valido (regex)

- Password: minimo 8 caratteri📖 **Per setup dettagliato vedi**: [`SETUP.md`](./SETUP.md)- **DNS**: Puntato a 207.154.218.16

- Username/Email unici nel database



#### 2. POST `/api/auth/login`

---- **SSL**: Let's Encrypt (auto-renew)ssh root@207.154.218.16 "pm2 logs shappa --lines 50"

**Autentica utente esistente**



```javascript

// Request## 📁 Struttura Progetto

{

  "emailOrUsername": "marco",  // Accetta email o username

  "password": "MyP@ssw0rd!"

}```---```



// Response (200 OK)shappa/

{

  "success": true,├── server.js              # Express server principale (1,437 LOC)

  "user": {

    "id": "user_1704067200000_abc123",├── package.json           # Dipendenze e scripts

    "username": "marco",

    "email": "marco@example.com",├── .env.example           # Template variabili ambiente## ✨ Funzionalità Core## ✨ Funzionalità Core## ✨ Funzionalità Core

    "lastLogin": "2025-01-01T10:30:00.000Z",

    "profile": { ... }├── SETUP.md              # Guida setup completa

  },

  "message": "Login effettuato con successo"├── lib/

}

│   ├── scraper/          # Playwright scraper Amazon

// Error (401 Unauthorized)

{│   │   ├── amazonScraper.js          # Scraper base### 1. 🔍 Ricerca Prodotti Multi-Marketplace---

  "success": false,

  "error": "Credenziali non valide"│   │   └── stealthAmazonScraper.js   # Scraper stealth (anti-detection)

}

```│   ├── services/         # Business logic- **Amazon**: Scraping real-time con Playwright proprietario (stealth mode)



**Comportamento:**│   │   ├── priceMonitor.js           # Cron job monitoraggio prezzi

- Aggiorna `lastLogin` timestamp

- Password memorizzate in **PLAINTEXT** (⚠️ TODO: bcrypt in produzione)│   │   ├── amazonService.js          # Service layer Amazon- **Altri marketplace**: In sviluppo (eBay, Alibaba, Walmart, AliExpress)

- Supporta login con email O username

│   │   └── amazonSerpApiService.js   # Alternative con SerpApi

#### 3. GET `/api/auth/user/:userId`

│   ├── openwebninjaClient.js  # Client API OpenWebNinja- Filtri avanzati: paese, categoria, prezzo, ordinamento

**Recupera profilo utente**

│   └── serpapiClient.js       # Client API SerpApi

```javascript

// Response (200 OK)├── src/- Modal dettagli con galleria immagini HD## 🌐 Infrastruttura Production

{

  "success": true,│   ├── pages/            # Frontend HTML

  "user": {

    "id": "user_1704067200000_abc123",│   │   ├── dashboard.html     # Dashboard principale

    "username": "marco",

    "email": "marco@example.com",│   │   ├── obiettivi.html     # 🆕 Gestione obiettivi

    // password NON inclusa

    "createdAt": "2025-01-01T00:00:00.000Z",│   │   ├── calendario.html    # 🆕 Calendario eventi### 2. 📦 Gestione Listing### 1. 🔍 Ricerca Prodotti Multi-MarketplaceBackend e frontend usano uno scraper Playwright proprietario per ottenere i dati da Amazon senza servizi esterni.

    "lastLogin": "2025-01-01T10:30:00.000Z",

    "profile": {│   │   ├── products.html      # Ricerca prodotti

      "avatar": null,

      "bio": "Shopify enthusiast",│   │   ├── listings.html      # Gestione listing- Import prodotti con un click

      "settings": {

        "theme": "dark",│   │   ├── reports.html       # Reports e analytics

        "notifications": true

      }│   │   └── settings.html      # Impostazioni- Calcolo automatico margini e fee eBay### Server

    }

  }│   ├── utils/            # Utilities JS (auth, ebay-oauth, API client)

}

│   └── styles/           # CSS- Monitoraggio prezzi Amazon in tempo reale (ogni 30 minuti)

// Error (404 Not Found)

{├── public/               # Asset statici

  "success": false,

  "error": "Utente non trovato"├── data/                 # Dati applicazione (prodotti salvati)- Sincronizzazione multi-marketplace- **Provider**: DigitalOcean Droplet- **Amazon**: Scraping real-time con Playwright

}

```├── oauth/                # Token eBay persistenti



#### 4. PUT `/api/auth/user/:userId`└── docs/                 # Documentazione tecnica- Download automatico immagini prodotto



**Aggiorna profilo utente**    ├── CODE_AUDIT.md     # Audit codebase completo



```javascript    └── AUDIT_SUMMARY.md  # Summary report- **IP**: 207.154.218.16

// Request (tutti i campi opzionali)

{```

  "username": "new_username",

  "email": "newemail@example.com",### 3. 🔐 Autenticazione

  "profile": {

    "avatar": "https://example.com/avatar.jpg",---

    "bio": "Updated bio",

    "settings": {- Sistema login/registrazione completo- **OS**: Ubuntu 22.04 LTS- **eBay, Alibaba, Walmart, AliExpress**: In sviluppoFunzionalità principali:

      "theme": "light"

    }## 🔑 Variabili d'Ambiente

  }

}- OAuth eBay integrato (Sandbox + Production)



// Response (200 OK)### Essenziali (Richieste)

{

  "success": true,```bash- Token management con auto-refresh- **Node.js**: v20.x

  "user": { ... },  // Utente aggiornato completo

  "message": "Profilo aggiornato con successo"# Server

}

NODE_ENV=production- Full scopes eBay per accesso completo API

// Error (400 Bad Request)

{PORT=3000

  "success": false,

  "error": "Username già in uso da un altro utente"- **Process Manager**: PM2- Filtri avanzati: paese, categoria, prezzo, ordinamento- Scraping Playwright proprietario (server-side) — sostituisce OpenWebNinja e SerpApi

}

```# Database



**Restrizioni:**MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/shappa### 4. 📊 Dashboard & Reports

- NON puoi modificare `id` (immutabile)

- NON puoi modificare `password` (usa endpoint dedicato - TODO)

- Username e email devono rimanere unici

# eBay OAuth (Production)- Overview vendite e profitti- **Reverse Proxy**: Nginx + Let's Encrypt SSL

### Database Users Schema

EBAY_CLIENT_ID=your_production_client_id

**File:** `/data/users/users_db.json`

EBAY_CLIENT_SECRET=your_production_client_secret- Storico transazioni

```json

{EBAY_REDIRECT_URI=https://shapiro.ninja/auth/ebay/callback

  "version": "1.0",

  "created": "2025-01-01T00:00:00.000Z",```- Analytics performance- Modal dettagli con galleria immagini HD- Caching in-memory opzionale per dettagli prodotto

  "lastModified": "2025-01-01T10:30:00.000Z",

  "users": [

    {

      "id": "user_1704067200000_abc123",### Opzionali- Export dati CSV/Excel

      "username": "marco",

      "email": "marco@example.com",```bash

      "password": "MyP@ssw0rd!",

      "createdAt": "2025-01-01T00:00:00.000Z",# eBay (avanzate)### Database

      "lastLogin": "2025-01-01T10:30:00.000Z",

      "profile": {EBAY_DEV_ID=your_dev_id

        "avatar": null,

        "bio": null,EBAY_RUNAME=your_ru_name---

        "settings": {}

      }EBAY_MARKETPLACE_ID=EBAY_IT

    }

  ]- **Provider**: MongoDB Atlas (Cloud)- Modale dettaglio con galleria immagini e tabs (Info / Automazione)

}

```# eBay Sandbox (development)



**Note:**EBAY_SANDBOX_CLIENT_ID=your_sandbox_id## 🚀 Setup Locale - Quick Start

- `password`: ⚠️ In plaintext - DEVE essere hashato con bcrypt prima di andare in produzione

- `id`: Generato come `user_{timestamp}_{random8chars}`EBAY_SANDBOX_CLIENT_SECRET=your_sandbox_secret

- `lastLogin`: Aggiornato automaticamente ad ogni login

- `profile.settings`: Oggetto libero per personalizzazioni futureEBAY_SANDBOX_REDIRECT_URI=https://localhost:3000/auth/ebay/callback- **Cluster**: Shared (condiviso dev/prod)



### Frontend Integration



**File:** `src/utils/auth-v2.js`# Amazon Scraping### Prerequisiti



```javascriptUSE_AMAZON_DEMO=1  # Usa dati demo per testing

// Esempio: Register

const authSystem = new AuthManager('https://shapiro.ninja');OPENWEBNINJA_API_KEY=your_api_key  # Opzionale- Node.js >= 18.x- **Strategy**: Database unico per sviluppo e produzione### 2. 📦 Gestione Listing- Dati prodotto completi e aggiornati



const result = await authSystem.register(SERPAPI_KEY=your_api_key  # Opzionale

  'marco',

  'marco@example.com',- Git

  'MyP@ssw0rd!',

  'MyP@ssw0rd!'# Development

);

DISABLE_HTTPS=true  # Disabilita HTTPS locale- Account MongoDB Atlas  - Dev usa eBay Sandbox per testing sicuro

if (result.success) {

  console.log('User ID:', result.user.id);DEV_PFX_PASSPHRASE=shappa-dev  # Passphrase cert SSL

  // Auto-login dopo registrazione

  await authSystem.login('marco', 'MyP@ssw0rd!');- (Opzionale) eBay Sandbox credentials

}

# Admin

// Esempio: Login

const loginResult = await authSystem.login('marco', 'MyP@ssw0rd!');ADMIN_TOKEN=your_secure_token  # Per endpoint /api/admin/*  - Prod usa eBay Production per listing reali- Import prodotti con un click- Dockerfile e suggerimenti deploy

if (loginResult.success) {

  // User data disponibile```

  console.log('Logged in as:', loginResult.user.username);

  ### Installazione Rapida

  // Session cached in localStorage (solo UX, non critico)

  localStorage.setItem('currentUser', JSON.stringify(loginResult.user));**Vedi**: [`.env.example`](./.env.example) per template completo

}



// Esempio: Get Profile

const userId = 'user_1704067200000_abc123';---

const response = await fetch(`https://shapiro.ninja/api/auth/user/${userId}`);

const data = await response.json();```powershell



// Esempio: Update Profile## 🌐 API Endpoints (36 totali)

await fetch(`https://shapiro.ninja/api/auth/user/${userId}`, {

  method: 'PUT',# 1. Clona repository### Dominio- Calcolo automatico margini e fee eBay

  headers: { 'Content-Type': 'application/json' },

  body: JSON.stringify({### Health & Status (2)

    profile: {

      bio: 'New bio',- `GET /health` - Health check semplicegit clone https://github.com/shapironeil/shappa.git

      settings: { theme: 'dark' }

    }- `GET /api/health` - Health check API

  })

});cd shappa- **Domain**: shapiro.ninja

```

### eBay OAuth & Account (10)

**Note Implementazione:**

- Tutti i metodi sono `async` (ritornano Promise)- `GET /api/ebay/auth-url` - URL autorizzazione

- localStorage usato SOLO per caching UX (non affidabile)

- Autenticazione vera risiede sul server- `GET /auth/ebay/callback` - Callback OAuth

- Cross-device funzionante (register su mobile, login su desktop)

- `GET /api/ebay/status` - Status autenticazione# 2. Installa dipendenze- **DNS**: Puntato a 207.154.218.16- Monitoraggio prezzi Amazon in tempo realeVariabili ambiente

---

- `POST /api/ebay/refresh` - Refresh token

## 📡 Monitor Shopify

- `GET /api/ebay/profile` - Profilo utentenpm install

### Architettura Monitor

- `GET /api/ebay/account-info` - Info account

**File:** `monitors/ShopifyMonitor.js`  

**Tecnologia:** Puppeteer Stealth + Page Stealth Plugin  - `GET /api/ebay/token-info` - Info token- **SSL**: Let's Encrypt (auto-renew)

**Bypass:** Cloudflare, bot detection, canvas fingerprint

- `POST /api/ebay/disconnect` - Disconnetti

### Timing Intelligente

- `POST /api/ebay/user-info` - User info via token# 3. Configura ambiente

Il monitor usa due modalità di check:

- `POST /api/ebay/test-connection` - Test connessione

#### 1. **Modalità Normale** (Check ogni 5 minuti)

Copy-Item .env.example .env- Sincronizzazione multi-marketplace- AMAZON_COUNTRY - default country (IT)

Attiva per tutto il giorno, controlla lo store ogni 5 minuti

### eBay Listings (7)

#### 2. **Modalità Intensiva** (Check ogni 25 secondi per 5 minuti)

- `POST /api/ebay/list` - Crea listing (mock)# Modifica .env con le tue credenziali

Attiva quando l'orologio segna **X:00** o **X:30** di OGNI ora (24/7)

- `POST /api/ebay/create-listing` - Crea listing completo

**Finestre Intensive:**

- `00:00-00:05`, `00:30-00:35`- `GET /api/ebay/listings` - Lista tutti---

- `01:00-01:05`, `01:30-01:35`

- ... (per tutte le 24 ore)- `POST /api/ebay/sync-listings` - Sincronizza da eBay

- `23:00-23:05`, `23:30-23:35`

- `POST /api/ebay/publish` - Pubblica listing# 4. Avvia server di sviluppo

**Totale:** 48 finestre intensive al giorno × 5 minuti × check ogni 25s = ~576 check intensivi/giorno

- `POST /api/ebay/listings/:id/end` - Termina

### Codice Timing Logic

- `POST /api/ebay/listings/:id/relist` - Ri-listanpm run dev- PORT - server port (default 3000)

```javascript

// monitors/ShopifyMonitor.js - Lines 65-85



getCurrentCheckInterval() {### Amazon Scraping (3)```

  const now = new Date();

  const currentMinute = now.getMinutes();- `GET /api/amazon/search` - Cerca prodotti

  

  // Check se siamo in finestra intensiva- `GET /api/amazon/product/:asin` - Dettagli prodotto## ✨ Funzionalità Core

  const isIntensiveWindow = 

    (currentMinute >= 0 && currentMinute < 5) ||    // X:00-X:05- `GET /api/amazon/scrape` - Scraping Playwright

    (currentMinute >= 30 && currentMinute < 35);    // X:30-X:35

  Server disponibile su: `http://localhost:3000`

  if (isIntensiveWindow) {

    console.log(`[${now.toLocaleTimeString('it-IT')}] ⚡ MODALITÀ INTENSIVA ATTIVATA`);### Gestione Prodotti (4)

    return this.intensiveCheckInterval; // 25000ms = 25 secondi

  }- `POST /api/products/save` - Salva prodotto### 3. 🔐 Autenticazione- AMAZON_CACHE_TTL - cache TTL in seconds (default 90)

  

  // Modalità normale- `GET /api/products/saved` - Lista salvati

  return this.interval * 60 * 1000; // 5min = 300000ms

}- `DELETE /api/products/saved/:asin` - Elimina📖 **Per setup dettagliato vedi**: [`SETUP.md`](./SETUP.md)

```

- `POST /api/products/download-images` - Download immagini

### Configurazione Monitor

### 1. 🔍 Ricerca Prodotti Multi-Marketplace

```javascript

// Configurazione timing### Gestione Immagini (5)

const TIMING_CONFIG = {

  normalInterval: 5,           // Minuti (check normale)- `GET /api/products/:asin/images` - Info immagini---

  intensiveInterval: 25,       // Secondi (check intensivo)

  intensiveDuration: 5         // Minuti di durata intensiva- `GET /api/images/status/:asin` - Status download

};

- `POST /api/images/download` - Avvia download- **Amazon**: Scraping real-time con Playwright proprietario- Sistema login/registrazione completo

// Avvio monitor

const monitor = new ShopifyMonitor({- `GET /api/images/downloaded/:asin` - Lista scaricate

  storeUrl: 'https://shop.example.com/products/product-handle',

  interval: TIMING_CONFIG.normalInterval,- `GET /api/images/serve/:asin/:filename` - Serve immagine## 📁 Struttura Progetto

  intensiveCheckInterval: TIMING_CONFIG.intensiveInterval * 1000,

  intensiveCheckDuration: TIMING_CONFIG.intensiveDuration,

  userId: 'user_1704067200000_abc123',

  discordWebhook: 'https://discord.com/api/webhooks/...'### Price Monitoring (3)- **Altri marketplace**: In sviluppo (eBay, Alibaba, Walmart, AliExpress)

});

- `POST /api/monitor/add` - Aggiungi monitor

monitor.start();

```- `POST /api/monitor/remove` - Rimuovi monitor```



### Rilevamento Status Prodotto- `GET /api/monitor/list` - Lista monitor



Il monitor analizza il DOM della pagina Shopify per rilevare lo status:shappa/- Filtri avanzati: paese, categoria, prezzo, ordinamento- OAuth eBay integrato (Sandbox + Production)eBay OAuth (important)



```javascript### Admin (1)

// Logica rilevamento (intelligente)

const status = await page.evaluate(() => {- `POST /api/admin/clear-cache` - Pulisci cache (protetto)├── server.js              # Express server principale (1,437 LOC)

  // 1. Cerca bottone "Add to Cart" / "Aggiungi al carrello"

  const addButton = document.querySelector('[name="add"]') ||

                   document.querySelector('.product-form__submit') ||

                   document.querySelector('[data-action="add-to-cart"]');---├── package.json           # Dipendenze e scripts- Modal dettagli con galleria immagini HD

  

  if (addButton && !addButton.disabled && 

      !addButton.classList.contains('disabled')) {

    return 'IN_STOCK';## 🌍 Deploy in Produzione├── .env.example           # Template variabili ambiente

  }

  

  // 2. Cerca testo "Sold Out" / "Esaurito"

  const bodyText = document.body.innerText.toLowerCase();### Architettura├── SETUP.md              # Guida setup completa- Token management con auto-refresh- eBay requires a secure (https) redirect URI for OAuth callbacks in many environments. For local development, use `https://localhost:3000/auth/ebay/callback` and ensure your local certificate is trusted (e.g., with mkcert). If you use `http://localhost:3000` eBay OAuth may fail during token exchange.

  if (bodyText.includes('sold out') || 

      bodyText.includes('esaurito') ||

      bodyText.includes('out of stock')) {

    return 'OUT_OF_STOCK';```├── lib/

  }

  Internet → DNS → Nginx (shapiro.ninja:443) → PM2 → Node.js App (port 3000)

  // 3. Fallback: bottone disabilitato

  if (addButton && addButton.disabled) {                                                          ↓│   ├── scraper/          # Playwright scraper Amazon### 2. 📦 Gestione Listing

    return 'OUT_OF_STOCK';

  }                                                    MongoDB Atlas

  

  return 'UNKNOWN';```│   │   ├── amazonScraper.js          # Scraper base

});

```



**Stati Possibili:**### Deploy Steps│   │   └── stealthAmazonScraper.js   # Scraper stealth (anti-detection)- Import prodotti con un click- Pagine protette con middleware

- `IN_STOCK`: Prodotto disponibile (bottone attivo)

- `OUT_OF_STOCK`: Esaurito (bottone disabilitato o testo "sold out")

- `PRICE_CHANGE`: Prezzo cambiato rispetto al check precedente

- `RESTOCK`: Tornato disponibile dopo essere stato esaurito1. **Commit e Push modifiche**:│   ├── services/         # Business logic

- `UNKNOWN`: Impossibile determinare (errore parsing)

```powershell

### Estrazione Dati Prodotto

git add .│   │   ├── priceMonitor.js           # Cron job monitoraggio prezzi- Calcolo automatico margini e fee eBay

```javascript

const productData = await page.evaluate(() => {git commit -m "feat: descrizione modifiche"

  // Titolo

  const title = document.querySelector('h1.product-title')?.innerText ||git push origin main│   │   ├── amazonService.js          # Service layer Amazon

                document.querySelector('.product__title')?.innerText ||

                'Titolo non trovato';```

  

  // Prezzo│   │   └── amazonSerpApiService.js   # Alternative con SerpApi- Monitoraggio prezzi Amazon in tempo realeLocal run

  const price = document.querySelector('.price__current')?.innerText ||

                document.querySelector('[data-product-price]')?.innerText ||2. **SSH nel server**:

                document.querySelector('.product-price')?.innerText ||

                'N/A';```powershell│   ├── openwebninjaClient.js  # Client API OpenWebNinja

  

  // Immagine principalessh root@207.154.218.16

  const image = document.querySelector('.product__main-image img')?.src ||

                document.querySelector('.product-featured-img')?.src ||```│   └── serpapiClient.js       # Client API SerpApi- Sincronizzazione multi-marketplace

                document.querySelector('[data-product-image]')?.src ||

                null;

  

  // Varianti/Taglie3. **Pull e deploy**:├── src/

  const variants = [];

  document.querySelectorAll('.product-form__input option').forEach(opt => {```bash

    if (opt.value && opt.value !== '') {

      variants.push({cd /var/www/shappa│   ├── pages/            # Frontend HTML (dashboard, products, listings, reports)### 4. 📊 Dashboard & Reports1. Install dependencies: `npm install`

        name: opt.innerText.trim(),

        available: !opt.disabledgit pull origin main

      });

    }npm ci --only=production│   ├── utils/            # Utilities JS (auth, ebay-oauth, API client)

  });

  pm2 restart shappa

  return { title, price, image, variants };

});pm2 save│   └── styles/           # CSS### 3. 🔐 Autenticazione

```

```

### Puppeteer Stealth Configuration

├── public/               # Asset statici

```javascript

const puppeteer = require('puppeteer-extra');4. **Verifica deployment**:

const StealthPlugin = require('puppeteer-extra-plugin-stealth');

```bash├── data/                 # Dati applicazione (prodotti salvati)- Sistema login/registrazione completo- Overview vendite e profitti2. Create a `.env` file with the variables above (do not commit the key)

// Attiva tutte le evasioni anti-bot

puppeteer.use(StealthPlugin());pm2 logs shappa --lines 50



const browser = await puppeteer.launch({curl https://shapiro.ninja/api/health├── oauth/                # Token eBay persistenti

  headless: 'new',           // Modalità headless moderna

  args: [```

    '--no-sandbox',

    '--disable-setuid-sandbox',└── docs/                 # Documentazione tecnica- OAuth eBay integrato (Sandbox + Production)

    '--disable-dev-shm-usage',

    '--disable-blink-features=AutomationControlled',---

    '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'

  ]    ├── CODE_AUDIT.md     # Audit codebase completo

});

## 📊 Roadmap & Status

const page = await browser.newPage();

    └── ...               # Altre guide- Token management con auto-refresh- Storico transazioni3. Start server: `node server.js`

// Override Navigator properties

await page.evaluateOnNewDocument(() => {### ✅ Completato (v2.2.0)

  Object.defineProperty(navigator, 'webdriver', { get: () => false });

  Object.defineProperty(navigator, 'languages', { get: () => ['en-US', 'en'] });- [x] Sistema autenticazione (login/register)```

  Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3] });

});- [x] Scraper Amazon proprietario (Playwright stealth)

```

- [x] OAuth eBay (Sandbox + Production)- Pagine protette con middleware

**Bypass Implementati:**

- ✅ Cloudflare Turnstile- [x] Gestione listing con calcolo margini

- ✅ Canvas Fingerprinting

- ✅ WebGL Fingerprinting- [x] Monitoraggio prezzi real-time (cron 30 min)---

- ✅ Audio Context Fingerprinting

- ✅ User-Agent spoofing- [x] Deploy production su DigitalOcean

- ✅ Navigator.webdriver = false

- ✅ Chrome CDP Runtime detection- [x] Dashboard responsive- Analytics performance



---- [x] MongoDB Atlas integration



## 📬 Sistema Notifiche Discord- [x] PM2 process management## 🔑 Variabili d'Ambiente



### Tipi di Notifica- [x] Nginx reverse proxy + SSL



Il sistema invia **4 tipi** di notifiche Discord con embed ricchi:- [x] Download automatico immagini prodotto### 4. 📊 Dashboard & Reports



#### 1. **Heartbeat** (Ogni 2 ore)- [x] Code audit completo e cleanup



Conferma che il monitor è attivo e funzionante- [x] Documentazione completa### Essenziali (Richieste)



```javascript- [x] **🆕 Pagina Obiettivi** - Tracking obiettivi business

{

  "embeds": [{- [x] **🆕 Pagina Calendario** - Gestione eventi e scadenze```bash- Overview vendite e profitti- Export dati CSV/ExcelDocker

    "title": "💚 Monitor Attivo",

    "description": "Il sistema di monitoraggio è operativo",

    "color": 3066993,  // Verde

    "fields": [### 🔄 In Progress# Server

      {

        "name": "🕐 Ultimo Check",- [ ] Integrazione database MongoDB per obiettivi e calendario

        "value": "01/01/2025 - 10:30:15",

        "inline": true- [ ] API CRUD per obiettivi personalizzatiNODE_ENV=production- Storico transazioni

      },

      {- [ ] Notifiche scadenze e promemoria

        "name": "⏱️ Intervallo",

        "value": "5 minuti (normale)",- [ ] Sincronizzazione calendario con listing eBayPORT=3000

        "inline": true

      }- [ ] Dashboard widgets per obiettivi

    ],

    "timestamp": "2025-01-01T10:30:15.000Z",- [ ] Export calendario (iCal, Google Calendar)- Analytics performance1. Build: `docker build -t shappa .`

    "footer": {

      "text": "Shappa Monitor • Next check in 5 min"

    }

  }]### 📈 Futuro# Database

}

```- [ ] AI-powered pricing suggestions



#### 2. **Drop** (Prodotto disponibile)- [ ] Multi-account management eBayMONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/shappa- Export dati CSV/Excel



Quando il prodotto diventa disponibile per l'acquisto- [ ] Inventory sync cross-platform



```javascript- [ ] Chrome extension per quick listing

{

  "content": "@everyone 🔥 **DROP RILEVATO!**",- [ ] Mobile app (React Native)

  "embeds": [{

    "title": "🚨 PRODOTTO DISPONIBILE",- [ ] Notifiche email/push# eBay OAuth (Production)## 🚀 Quick Start - Sviluppo Locale2. Run: `docker run -p 3000:3000 shappa`

    "description": "Air Jordan 1 Retro High OG 'Chicago'",

    "url": "https://shop.example.com/products/air-jordan-1-chicago",- [ ] Supporto multi-lingua

    "color": 15158332,  // Rosso brillante

    "thumbnail": {- [ ] API pubblica per integrazioniEBAY_CLIENT_ID=your_production_client_id

      "url": "https://shop.example.com/cdn/.../product-image.jpg"

    },- [ ] Dashboard analytics avanzata

    "fields": [

      {- [ ] Sistema di alerting automaticoEBAY_CLIENT_SECRET=your_production_client_secret---

        "name": "💰 Prezzo",

        "value": "€179.99",

        "inline": true

      },---EBAY_REDIRECT_URI=https://shapiro.ninja/auth/ebay/callback

      {

        "name": "📊 Status",

        "value": "✅ IN STOCK",

        "inline": true## 🔧 Tech Stack```

      },

      {

        "name": "👟 Taglie Disponibili",

        "value": "EU 42, EU 43, EU 44, EU 45",**Backend**:

        "inline": false

      },- Node.js 20.x

      {

        "name": "🛒 Quick Add",- Express.js 5.x### Opzionali## 🚀 Setup Locale - Quick Start

        "value": "[EU 42](https://shop.../cart/12345:1) • [EU 43](https://shop.../cart/12346:1) • [EU 44](https://shop.../cart/12347:1)",

        "inline": false- MongoDB Atlas (cloud database)

      }

    ],- Playwright 1.56 (web scraping)```bash

    "timestamp": "2025-01-01T10:30:15.000Z",

    "footer": {- node-cron 4.2 (scheduled tasks)

      "text": "Shappa Monitor • Agisci velocemente!"

    }- axios 1.12 (HTTP client)# eBay (avanzate)### PrerequisitiImportant

  }]

}

```

**Frontend**:EBAY_DEV_ID=your_dev_id

**Note:**

- `@everyone` mention per allertare tutti- HTML5 / CSS3 / Vanilla JavaScript

- Link diretti **Add to Cart** per ogni variant

- Immagine prodotto in thumbnail- Responsive designEBAY_RUNAME=your_ru_name### Prerequisiti

- Colore rosso brillante per massima visibilità

- Venus Design System

#### 3. **Restock** (Prodotto ritornato disponibile)

- Font Awesome iconsEBAY_AUTH_URL=https://auth.ebay.com/oauth2/authorize

Quando un prodotto esaurito torna disponibile

- No frameworks (performance-first)

```javascript

{EBAY_TOKEN_URL=https://api.ebay.com/identity/v1/oauth2/token- Node.js >= 18.x- Node.js >= 18.x- Il file `lib/scraper/amazonScraper.js` contiene la logica di scraping e mapping. Aggiornare la documentazione quando si modifica l’estrazione dati.

  "content": "@everyone ♻️ **RESTOCK RILEVATO!**",

  "embeds": [{**Infrastructure**:

    "title": "♻️ PRODOTTO RESTOCKATO",

    "description": "Air Jordan 1 Retro High OG 'Chicago'",- DigitalOcean (hosting VPS)EBAY_API_URL=https://api.ebay.com

    "url": "https://shop.example.com/products/air-jordan-1-chicago",

    "color": 3447003,  // Blu brillante- MongoDB Atlas (database cloud)

    "thumbnail": {

      "url": "https://shop.example.com/cdn/.../product-image.jpg"- Nginx (reverse proxy)EBAY_SCOPES=https://api.ebay.com/oauth/api_scope...- Git

    },

    "fields": [- PM2 (process manager)

      {

        "name": "💰 Prezzo",- Let's Encrypt (SSL/TLS)EBAY_MARKETPLACE_ID=EBAY_IT

        "value": "€179.99",

        "inline": true- GitHub (version control + CI/CD)

      },

      {- Account MongoDB Atlas- Git# 📋 Stato Aggiornato (09/10/2025 - ore 20:45)

        "name": "📊 Status",

        "value": "♻️ RESTOCKED",**APIs & Services**:

        "inline": true

      },- eBay API (OAuth + Inventory + Sell APIs)# eBay Sandbox (development)

      {

        "name": "⏰ Era Esaurito Dal",- Amazon (Playwright scraping proprietario)

        "value": "01/01/2025 - 08:15:00",

        "inline": false- MongoDB Atlas CloudEBAY_SANDBOX_CLIENT_ID=your_sandbox_id- (Opzionale) eBay Sandbox credentials

      },

      {- (Optional) OpenWebNinja / SerpApi

        "name": "👟 Taglie Disponibili",

        "value": "EU 42, EU 43, EU 44",EBAY_SANDBOX_CLIENT_SECRET=your_sandbox_secret

        "inline": false

      },---

      {

        "name": "🛒 Quick Add",EBAY_SANDBOX_REDIRECT_URI=https://localhost:3000/auth/ebay/callback- Account MongoDB Atlas

        "value": "[EU 42](link) • [EU 43](link) • [EU 44](link)",

        "inline": false## 📈 Metriche Progetto

      }

    ],

    "timestamp": "2025-01-01T10:30:15.000Z",

    "footer": {| Metrica | Valore |

      "text": "Shappa Monitor • Seconda chance!"

    }|---------|--------|# Amazon Scraping### Installazione Rapida

  }]

}| **Lines of Code (server.js)** | 1,437 |

```

| **API Endpoints** | 36 |USE_AMAZON_DEMO=1  # Usa dati demo per testing

#### 4. **Price Change** (Cambio prezzo)

| **Moduli lib/** | 8 files |

Quando il prezzo del prodotto cambia

| **Frontend pages** | 8 pages |OPENWEBNINJA_API_KEY=your_api_key  # Opzionale- (Opzionale) Credenziali eBay Sandbox## 🚀 Nuove Funzionalità v2.0.1

```javascript

{| **Dependencies** | 7 packages |

  "embeds": [{

    "title": "💸 CAMBIO PREZZO RILEVATO",| **Variabili ENV** | 17 core + 11 optional |SERPAPI_KEY=your_api_key  # Opzionale

    "description": "Air Jordan 1 Retro High OG 'Chicago'",

    "url": "https://shop.example.com/products/air-jordan-1-chicago",| **Commit totali** | 105+ |

    "color": 15105570,  // Arancione

    "thumbnail": {| **Uptime produzione** | 99.9% |```powershell

      "url": "https://shop.example.com/cdn/.../product-image.jpg"

    },

    "fields": [

      {---# Development

        "name": "💰 Prezzo Vecchio",

        "value": "€179.99",

        "inline": true

      },## 🎉 ChangelogDISABLE_HTTPS=true  # Disabilita HTTPS locale# 1. Clona repository

      {

        "name": "💰 Prezzo Nuovo",

        "value": "€149.99 (-17%)",

        "inline": true### v2.2.0 (7 Novembre 2025)DEV_PFX_PASSPHRASE=shappa-dev  # Passphrase cert SSL

      },

      {- ✅ **Nuova pagina Obiettivi** (`obiettivi.html`)

        "name": "📊 Status",

        "value": "✅ IN STOCK",  - Sistema tracking obiettivi businessgit clone https://github.com/shapironeil/shappa.git

        "inline": true

      },  - Cards con progress bar

      {

        "name": "💾 Risparmio",  - Obiettivi vendite, profitti, listing# Admin

        "value": "€30.00",

        "inline": true  - Stats summary e scadenze

      }

    ],- ✅ **Nuova pagina Calendario** (`calendario.html`)ADMIN_TOKEN=your_secure_token  # Per endpoint /api/admin/*cd shappa### Installazione### 1. Navbar Universale - Click Nickname da Qualsiasi Pagina

    "timestamp": "2025-01-01T10:30:15.000Z",

    "footer": {  - Calendario interattivo mese corrente

      "text": "Shappa Monitor • Prezzo aggiornato"

    }  - Eventi giornalieri categorizzati```

  }]

}  - Sidebar con eventi oggi e prossimi

```

  - Quick stats mensili

### Configurazione Webhook

- ✅ Aggiornati menu sidebar di tutte le pagine

**File:** `/data/webhooks/webhook_{userId}.json`

- ✅ Integrazione auth check e user profile**Vedi**: [`.env.example`](./.env.example) per template completo

```json

{

  "userId": "user_1704067200000_abc123",

  "webhookUrl": "https://discord.com/api/webhooks/123456789/abcdefghijklmnop",### v2.1.0 (7 Novembre 2025)# 2. Installa dipendenze- ✅ **Click Universale**: Ora il click su nickname/avatar funziona da **TUTTE le pagine** (Dashboard, Settings, Admin, ecc.)

  "createdAt": "2025-01-01T00:00:00.000Z",

  "lastModified": "2025-01-01T10:30:00.000Z",- ✅ Code audit completo e cleanup

  "settings": {

    "enableHeartbeat": true,- ✅ Rimosso endpoint duplicato `/api/amazon/product/:asin`---

    "heartbeatInterval": 7200000,

    "enableMentions": true,- ✅ Fixato URL hardcoded in `settings.js`

    "enableThumbnails": true

  }- ✅ Rimossi file backup obsoletinpm install

}

```- ✅ Aggiornato `.env.example` con variabili corrette



### API Webhook Endpoints- ✅ Documentazione completa (`CODE_AUDIT.md`)## 🌐 API Endpoints (36 totali)



#### POST `/api/webhooks/save`- ✅ README completamente riscritto



Salva o aggiorna webhook Discord per l'utente- ✅ Deploy production verificato e funzionante```powershell- ✅ **Smart Redirect**: 



```javascript

// Request

{### v2.0.0 (6 Novembre 2025)### Health & Status

  "userId": "user_1704067200000_abc123",

  "webhookUrl": "https://discord.com/api/webhooks/123456789/abcdef"- ✅ OAuth eBay full scopes implementation

}

- ✅ Stealth Amazon scraper con anti-detection- `GET /health` - Health check semplice# 3. Configura ambiente

// Response (200 OK)

{- ✅ Price monitoring automatico (cron)

  "success": true,

  "message": "Webhook salvato con successo"- ✅ Download automatico immagini prodotto- `GET /api/health` - Health check API

}

```- ✅ Dashboard completa con reports



#### GET `/api/webhooks/:userId`Copy-Item .env.example .env# Clona il repository  - Se sei in Settings → switcha direttamente alla tab Account



Recupera webhook configurato---



```javascript### eBay OAuth & Account (10)

// Response (200 OK)

{## 📚 Documentazione

  "success": true,

  "webhook": {- `GET /api/ebay/auth-url` - URL autorizzazione# Modifica .env con le tue credenziali

    "userId": "user_...",

    "webhookUrl": "https://discord.com/api/webhooks/...",- 📖 **Setup Completo**: [`SETUP.md`](./SETUP.md)

    "settings": { ... }

  }- 🔍 **Code Audit**: [`docs/CODE_AUDIT.md`](./docs/CODE_AUDIT.md)- `GET /auth/ebay/callback` - Callback OAuth

}

- 📋 **Audit Summary**: [`docs/AUDIT_SUMMARY.md`](./docs/AUDIT_SUMMARY.md)

// Response (404 Not Found)

{- 🔐 **OAuth eBay**: `docs/EBAY_OAUTH_SETUP.md`- `GET /api/ebay/status` - Status autenticazionegit clone https://github.com/shapironeil/shappa.git  - Se sei in altre pagine → redirect a Settings → Account

  "success": false,

  "error": "Webhook non configurato"- 🚀 **Deployment**: `DEPLOYMENT_ROADMAP.md`

}

```- `POST /api/ebay/refresh` - Refresh token



#### DELETE `/api/webhooks/:userId`---



Elimina webhook configurato- `GET /api/ebay/profile` - Profilo utente# 4. Avvia server di sviluppo



```javascript## 📄 License

// Response (200 OK)

{- `GET /api/ebay/account-info` - Info account

  "success": true,

  "message": "Webhook eliminato con successo"**Proprietario** - Tutti i diritti riservati  

}

```Copyright © 2025 Marco (@shapironeil)- `GET /api/ebay/token-info` - Info tokennpm run devcd shappa- ✅ **Deep Linking**: Supporto per URL diretto `settings.html#account`



---



## 🗂️ API Endpoints---- `POST /api/ebay/disconnect` - Disconnetti



### Riepilogo Completo



| Metodo | Endpoint | Descrizione | Auth |## 📞 Contatti & Support- `POST /api/ebay/user-info` - User info via token```

|--------|----------|-------------|------|

| **Auth** ||||

| POST | `/api/auth/register` | Registra nuovo utente | ❌ |

| POST | `/api/auth/login` | Login utente | ❌ |**Maintainer**: Marco  - `POST /api/ebay/test-connection` - Test connessione

| GET | `/api/auth/user/:userId` | Get profilo utente | ❌ |

| PUT | `/api/auth/user/:userId` | Update profilo | ❌ |**GitHub**: [@shapironeil](https://github.com/shapironeil)  

| **Webhooks** ||||

| POST | `/api/webhooks/save` | Salva webhook Discord | ❌ |**Repository**: [shapironeil/shappa](https://github.com/shapironeil/shappa)  - ✅ **Codice Centralizzato**: Nuovo file `src/utils/navbar-universal.js` per gestire tutto in modo DRY

| GET | `/api/webhooks/:userId` | Get webhook configurato | ❌ |

| DELETE | `/api/webhooks/:userId` | Elimina webhook | ❌ |**Website**: https://shapiro.ninja

| **Interests** ||||

| POST | `/api/interests/save` | Salva interessi prodotti | ❌ |### eBay Listings (7)

| GET | `/api/interests/:userId` | Get interessi utente | ❌ |

| DELETE | `/api/interests/:userId` | Elimina interessi | ❌ |### Supporto

| **Monitor** ||||

| POST | `/api/monitor/start` | Avvia monitor per utente | ❌ |- 🐛 **Bug Reports**: Apri issue su GitHub- `POST /api/ebay/list` - Crea listing (mock)Server disponibile su: `http://localhost:3000`

| POST | `/api/monitor/stop` | Ferma monitor utente | ❌ |

| GET | `/api/monitor/status` | Status monitor globale | ❌ |- 💡 **Feature Requests**: Discussioni GitHub

| GET | `/health` | Health check API | ❌ |

- 📧 **Email**: Disponibile su richiesta- `POST /api/ebay/create-listing` - Crea listing completo

### Note Sicurezza



⚠️ **IMPORTANTE:** Attualmente NON c'è autenticazione sugli endpoint (eccetto `/health`)

---- `GET /api/ebay/listings` - Lista tutti# Installa dipendenze

**TODO per Production:**

1. Implementare JWT tokens per auth

2. Middleware auth su tutti gli endpoint user-specific

3. Rate limiting per prevenire abuse**Ultimo aggiornamento**: 7 Novembre 2025, 16:00 UTC  - `POST /api/ebay/sync-listings` - Sincronizza da eBay

4. CORS restrittivo (solo domain autorizzati)

5. HTTPS obbligatorio (già attivo)**Versione**: 2.2.0  



---**Status**: 🟢 Production Online - New Pages Added (Obiettivi + Calendario)- `POST /api/ebay/publish` - Pubblica listing📖 **Per setup dettagliato vedi**: [`SETUP.md`](./SETUP.md)



## 💾 Database

- `POST /api/ebay/listings/:id/end` - Termina

### Architettura Storage

- `POST /api/ebay/listings/:id/relist` - Ri-listanpm install### 2. Gestione Errori OAuth Migliorata

**Tipo:** JSON File-based  

**Location:** `/data/` directory  

**Ready for:** MySQL/PostgreSQL migration

### Amazon Scraping (3)---

### Schema Database

- `GET /api/amazon/search` - Cerca prodotti

#### 1. Users Database

- `GET /api/amazon/product/:asin` - Dettagli prodotto- ✅ **Messaggio User-Friendly**: Se chiudi la finestra OAuth, ora vedi "ℹ️ Connessione annullata. Clicca su 'Connetti eBay' per riprovare." invece di un errore generico

**File:** `/data/users/users_db.json`

- `GET /api/amazon/scrape` - Scraping Playwright

```json

{## 📁 Struttura Progetto

  "version": "1.0",

  "created": "2025-01-01T00:00:00.000Z",### Altri Marketplace (2)

  "lastModified": "2025-01-01T10:30:00.000Z",

  "users": [- `GET /api/aliexpress/search` - AliExpress (placeholder)# Copia e configura .env- ✅ **Notifica Info**: Colore blu (info) invece di rosso (error) per indicare che è solo un'azione annullata

    {

      "id": "user_1704067200000_abc123",- `GET /api/alibaba/search` - Alibaba (placeholder)

      "username": "marco",

      "email": "marco@example.com",```

      "password": "plaintext_password",

      "createdAt": "2025-01-01T00:00:00.000Z",### Gestione Prodotti (4)

      "lastLogin": "2025-01-01T10:30:00.000Z",

      "profile": {- `POST /api/products/save` - Salva prodottoshappa/Copy-Item .env.example .env- ✅ **UX Migliorata**: L'utente capisce immediatamente che può riprovare senza problemi

        "avatar": null,

        "bio": null,- `GET /api/products/saved` - Lista salvati

        "settings": {}

      }- `DELETE /api/products/saved/:asin` - Elimina├── server.js              # Express server principale

    }

  ]- `POST /api/products/download-images` - Download immagini

}

```├── package.json           # Dipendenze e scripts# Modifica .env con le tue credenziali



**Indici suggeriti (per MySQL):**### Gestione Immagini (5)

- PRIMARY KEY: `id`

- UNIQUE INDEX: `username`- `GET /api/products/:asin/images` - Info immagini├── .env.example           # Template variabili ambiente

- UNIQUE INDEX: `email`

- INDEX: `lastLogin` (per query attività recente)- `GET /api/images/status/:asin` - Status download



#### 2. Webhooks Database- `POST /api/images/download` - Avvia download├── SETUP.md              # Guida setup completa**Documentazione completa**: [`docs/CHANGELOG_NAVBAR_UNIVERSAL.md`](docs/CHANGELOG_NAVBAR_UNIVERSAL.md)



**File per utente:** `/data/webhooks/webhook_{userId}.json`- `GET /api/images/downloaded/:asin` - Lista scaricate



```json- `GET /api/images/serve/:asin/:filename` - Serve immagine├── lib/

{

  "userId": "user_1704067200000_abc123",

  "webhookUrl": "https://discord.com/api/webhooks/123456789/abcdef",

  "createdAt": "2025-01-01T00:00:00.000Z",### Price Monitoring (3)│   ├── scraper/          # Playwright scraper Amazon# Avvia il server di sviluppo

  "lastModified": "2025-01-01T10:30:00.000Z",

  "settings": {- `POST /api/monitor/add` - Aggiungi monitor

    "enableHeartbeat": true,

    "heartbeatInterval": 7200000,- `POST /api/monitor/remove` - Rimuovi monitor│   └── services/         # Business logic (monitor prezzi)

    "enableMentions": true,

    "enableThumbnails": true- `GET /api/monitor/list` - Lista monitor

  }

}├── src/npm run dev## 🎯 Miglioramenti UX Precedenti

```

### Admin (1)

**Migrazione MySQL:**

```sql- `POST /api/admin/clear-cache` - Pulisci cache (protetto)│   ├── pages/            # Frontend HTML (dashboard, products, listings)

CREATE TABLE webhooks (

  id INT PRIMARY KEY AUTO_INCREMENT,

  user_id VARCHAR(255) NOT NULL,

  webhook_url TEXT NOT NULL,---│   ├── utils/            # Utilities JS (auth, API client)```

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  last_modified TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  settings JSON,

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,## 🌍 Deploy in Produzione│   └── styles/           # CSS

  UNIQUE KEY (user_id)

);

```

### Architettura├── public/               # Asset statici### Click sul Nickname → Redirect alla Scheda Account

#### 3. Interests Database



**File per utente:** `/data/interests/interests_{userId}.json`

```├── data/                 # Dati applicazione

```json

{Internet → DNS → Nginx (shapiro.ninja:443) → PM2 → Node.js App (port 3000)

  "userId": "user_1704067200000_abc123",

  "interests": [                                                          ↓├── oauth/                # Token eBayIl server sarà disponibile su: `http://localhost:3000`- ✅ **Nickname e Avatar Cliccabili**: Ora cliccando sul tuo nickname o avatar nella navbar, vieni automaticamente reindirizzato alla scheda "Account" nelle impostazioni

    {

      "productUrl": "https://shop.example.com/products/air-jordan-1",                                                    MongoDB Atlas

      "productName": "Air Jordan 1 Retro High OG 'Chicago'",

      "addedAt": "2025-01-01T00:00:00.000Z",```└── docs/                 # Documentazione tecnica

      "notify": true,

      "filters": {

        "minPrice": null,

        "maxPrice": 200,### Deploy Steps```- ✅ **Hover Effects**: Effetti visivi al passaggio del mouse per indicare che sono elementi cliccabili

        "sizes": ["EU 42", "EU 43", "EU 44"]

      }

    }

  ],1. **Commit e Push modifiche**:

  "createdAt": "2025-01-01T00:00:00.000Z",

  "lastModified": "2025-01-01T10:30:00.000Z"```powershell

}

```git add .---**Per configurazione dettagliata, vedi** [`SETUP.md`](./SETUP.md)- ✅ **Transizioni Smooth**: Animazioni fluide per un'esperienza utente premium



**Migrazione MySQL:**git commit -m "feat: descrizione modifiche"

```sql

CREATE TABLE interests (git push origin main

  id INT PRIMARY KEY AUTO_INCREMENT,

  user_id VARCHAR(255) NOT NULL,```

  product_url TEXT NOT NULL,

  product_name VARCHAR(500),## 🔑 Variabili d'Ambiente

  added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  notify BOOLEAN DEFAULT TRUE,2. **SSH nel server**:

  filters JSON,

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,```powershell

  INDEX (user_id, added_at)

);ssh root@207.154.218.16

```

```### Server## 📁 Struttura Progetto### Formato User ID eBay Migliorato

### Operazioni Database



**Codice di esempio (server.js):**

3. **Pull e deploy**:```bash

```javascript

const fs = require('fs').promises;```bash

const path = require('path');

cd /var/www/shappaNODE_ENV=development|production- ✅ **Display Name**: Ora mostra `nickname (Nome Cognome)` invece di "eBay User"

// Directory

const DATA_DIR = path.join(__dirname, 'data');git pull origin main

const USERS_DIR = path.join(DATA_DIR, 'users');

const WEBHOOKS_DIR = path.join(DATA_DIR, 'webhooks');npm ci --only=productionPORT=3000

const INTERESTS_DIR = path.join(DATA_DIR, 'interests');

pm2 restart shappa

// Inizializza database users

async function initUsersDatabase() {pm2 save``````- ✅ **Email Sottostante**: Visualizzazione dell'email associata sotto il nome utente

  await fs.mkdir(USERS_DIR, { recursive: true });

  const dbPath = path.join(USERS_DIR, 'users_db.json');```

  

  try {

    await fs.access(dbPath);

  } catch {4. **Verifica deployment**:

    const initialDb = {

      version: '1.0',```bash### Databaseshappa/- ✅ **Informazioni Complete**: Massima visibilità dei dati dell'account connesso

      created: new Date().toISOString(),

      lastModified: new Date().toISOString(),pm2 logs shappa --lines 50

      users: []

    };curl https://shapiro.ninja/api/health```bash

    await fs.writeFile(dbPath, JSON.stringify(initialDb, null, 2));

  }```

}

MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/shappa├── server.js              # Server Express principale

// Read users

async function getUsers() {### Nginx Configuration

  const dbPath = path.join(USERS_DIR, 'users_db.json');

  const data = await fs.readFile(dbPath, 'utf8');```

  return JSON.parse(data);

}**File**: `/etc/nginx/sites-available/shappa`



// Write users├── package.json           # Dipendenze### Sistema di Scadenza Token Migliorato

async function saveUsers(db) {

  const dbPath = path.join(USERS_DIR, 'users_db.json');```nginx

  db.lastModified = new Date().toISOString();

  await fs.writeFile(dbPath, JSON.stringify(db, null, 2));server {### eBay OAuth

}

    server_name shapiro.ninja;

// Genera ID utente

function generateUserId() {    ```bash├── .env.example           # Template variabili ambiente- ✅ **Messaggi Chiari**: Ora il sistema spiega chiaramente cosa significa "Token scade tra X ore"

  const timestamp = Date.now();

  const random = Math.random().toString(36).substring(2, 10);    location / {

  return `user_${timestamp}_${random}`;

}        proxy_pass http://localhost:3000;# Production (server online)

```

        proxy_http_version 1.1;

### Backup Strategy

        proxy_set_header Upgrade $http_upgrade;EBAY_CLIENT_ID=your_production_client_id├── SETUP.md              # Guida setup completa- ✅ **Indicatori Visivi**: 

```powershell

# Backup manuale        proxy_set_header Connection 'upgrade';

$backupDir = ".\backups\$(Get-Date -Format 'yyyy-MM-dd_HH-mm-ss')"

New-Item -ItemType Directory -Path $backupDir        proxy_set_header Host $host;EBAY_CLIENT_SECRET=your_production_secret

Copy-Item -Path ".\data\*" -Destination $backupDir -Recurse

        proxy_set_header X-Real-IP $remote_addr;

# Backup automatico (cron job)

# TODO: Implementare script backup giornaliero        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;EBAY_REDIRECT_URI=https://shapiro.ninja/auth/ebay/callback├── lib/  - ✅ Verde = Token valido (> 1 giorno)

```

        proxy_set_header X-Forwarded-Proto $scheme;

---

        proxy_cache_bypass $http_upgrade;

## 🚀 Deploy Production

    }

### Server DigitalOcean

# Sandbox (sviluppo locale)│   ├── scraper/          # Playwright scraper Amazon  - ⚠️ Giallo = Token in scadenza (< 24 ore, rinnovo imminente)

**Specs:**

- **OS:** Ubuntu 22.04 LTS    listen 443 ssl http2;

- **IP:** 207.154.218.16

- **Domain:** shapiro.ninja    ssl_certificate /etc/letsencrypt/live/shapiro.ninja/fullchain.pem;EBAY_SANDBOX_CLIENT_ID=your_sandbox_client_id

- **CPU:** 1 vCPU

- **RAM:** 1GB    ssl_certificate_key /etc/letsencrypt/live/shapiro.ninja/privkey.pem;

- **Storage:** 25GB SSD

    include /etc/letsencrypt/options-ssl-nginx.conf;EBAY_SANDBOX_CLIENT_SECRET=your_sandbox_secret│   └── services/         # Business logic (monitor prezzi, etc)  - ⏱️ Arancione = Rinnovo in corso (< 1 ora)

### Processo Deploy

    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

#### 1. Commit Locale

}EBAY_SANDBOX_REDIRECT_URI=https://localhost:3000/auth/ebay/callback

```powershell

# 1. Stage modifiche

git add .

server {```├── src/  - ❌ Rosso = Token scaduto (rinnovo automatico attivo)

# 2. Commit con messaggio chiaro

git commit -m "FEAT: Descrizione modifiche"    listen 80;



# 3. Push a GitHub    server_name shapiro.ninja;

git push origin main

```    return 301 https://$server_name$request_uri;



#### 2. Deploy su Server}### Scraping (Opzionali)│   ├── pages/            # Frontend (dashboard, products, listings, settings)- ✅ **Testo Esplicativo**: Ogni stato mostra un messaggio che spiega che il rinnovo è automatico



```powershell```

# SSH nel server

ssh root@207.154.218.16```bash



# Naviga nella directory app---

cd /var/www/shappa

OPENWEBNINJA_API_KEY=your_api_key│   ├── utils/            # Utilities JS (auth, API client)- ✅ **Documentazione Completa**: Creato `docs/TOKEN_REFRESH_EXPLANATION.md` con FAQ dettagliate

# Pull ultima versione

git pull origin main## 🛠️ Workflow Sviluppo



# Installa dipendenze (se package.json modificato)SERPAPI_KEY=your_api_key

npm ci --only=production

### Git Flow

# Restart PM2

pm2 restart shappa```│   └── styles/           # CSS



# Salva configurazione PM2```powershell

pm2 save

# 1. Crea feature branch

# Verifica status

pm2 statusgit checkout -b feature/nome-feature

pm2 logs shappa --lines 50

```---├── public/               # Asset statici# Shappa - Stato Sviluppo eBay OAuth & Account Integration



#### 3. Verifica Deploy# 2. Sviluppa e testa locale



```powershellnpm run dev

# Test locale (da Windows)

Invoke-WebRequest -Uri "https://shapiro.ninja" -UseBasicParsing



# Test API health# 3. Commit modifiche## 🌍 Deploy in Produzione└── docs/                 # Documentazione tecnica

Invoke-WebRequest -Uri "https://shapiro.ninja/health" -UseBasicParsing

```git add .



### PM2 Configurationgit commit -m "feat: descrizione chiara"



**File:** `ecosystem.config.js` (opzionale, può essere creato)



```javascript# 4. Push e crea PR### Architettura```## Scopes OAuth eBay (Produzione)

module.exports = {

  apps: [{git push origin feature/nome-feature

    name: 'shappa',

    script: './server.js',

    instances: 1,

    autorestart: true,# 5. Dopo merge, deploy in produzione (vedi sopra)

    watch: false,

    max_memory_restart: '500M',``````

    env: {

      NODE_ENV: 'production',

      PORT: 3000

    },### TestingInternet → DNS → Nginx (shapiro.ninja:443) → PM2 → Node.js App (port 3000)

    error_file: './logs/err.log',

    out_file: './logs/out.log',

    log_file: './logs/combined.log',

    time: true**Locale**:                                                          ↓## 🔑 Variabili d'Ambiente PrincipaliPer garantire massima flessibilità futura, il backend richiede ora per default un set esteso di scopes eBay al momento del login (FULL_SCOPES), che include:

  }]

};```powershell

```

npm run dev                                                    MongoDB Atlas

**Comandi PM2 Utili:**

# Apri http://localhost:3000

```bash

# Status applicazione``````

pm2 status



# Logs real-time

pm2 logs shappa**Production**:



# Logs ultimi 100 righe```powershell

pm2 logs shappa --lines 100

Invoke-WebRequest -Uri "https://shapiro.ninja" -UseBasicParsing### Deploy Steps```bash- https://api.ebay.com/oauth/api_scope

# Restart app

pm2 restart shappa```



# Stop app

pm2 stop shappa

---

# Delete app

pm2 delete shappa1. **Commit e Push modifiche**:# Server- https://api.ebay.com/oauth/api_scope/commerce.identity.readonly



# Ricrea app## 🐛 Troubleshooting

pm2 start server.js --name shappa

```powershell

# Salva configurazione (autostart al boot)

pm2 save### Server locale non si avvia

pm2 startup

```git add .NODE_ENV=development|production- https://api.ebay.com/oauth/api_scope/commerce.catalog.readonly



### Nginx Configuration```powershell



**File:** `/etc/nginx/sites-available/shappa`# Check porta occupatagit commit -m "feat: descrizione modifiche"



```nginxnetstat -ano | findstr :3000

server {

    server_name shapiro.ninja;git push origin mainPORT=3000- https://api.ebay.com/oauth/api_scope/commerce.notification.subscription

    

    location / {# Reinstalla dipendenze

        proxy_pass http://localhost:3000;

        proxy_http_version 1.1;Remove-Item node_modules -Recurse -Force```

        proxy_set_header Upgrade $http_upgrade;

        proxy_set_header Connection 'upgrade';npm install

        proxy_set_header Host $host;

        proxy_set_header X-Real-IP $remote_addr;- https://api.ebay.com/oauth/api_scope/sell.inventory (+ readonly)

        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;

        proxy_set_header X-Forwarded-Proto $scheme;# Verifica .env

        proxy_cache_bypass $http_upgrade;

    }cat .env2. **SSH nel server**:



    listen 443 ssl http2;```

    ssl_certificate /etc/letsencrypt/live/shapiro.ninja/fullchain.pem;

    ssl_certificate_key /etc/letsencrypt/live/shapiro.ninja/privkey.pem;```powershell# Database (MongoDB Atlas)- https://api.ebay.com/oauth/api_scope/sell.account (+ readonly)

    include /etc/letsencrypt/options-ssl-nginx.conf;

    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;### MongoDB connection failed

}

ssh root@207.154.218.16

server {

    listen 80;- ✅ Verifica `MONGODB_URI` in `.env`

    server_name shapiro.ninja;

    return 301 https://$server_name$request_uri;- ✅ Whitelist IP in MongoDB Atlas: **Network Access** → **Add IP Address**```MONGODB_URI=mongodb+srv://...- https://api.ebay.com/oauth/api_scope/sell.fulfillment (+ readonly)

}

```- ✅ Controlla username/password corretti



**Reload Nginx:**- ✅ Verifica nome database in connection string

```bash

# Test configurazione

sudo nginx -t

### eBay OAuth non funziona3. **Pull e deploy**:- https://api.ebay.com/oauth/api_scope/sell.marketing (+ readonly)

# Reload

sudo systemctl reload nginx

```

**Locale**:```bash

### SSL Certificate (Let's Encrypt)

- Usa **HTTPS**: `https://localhost:3000` (eBay richiede SSL)

```bash

# Rinnovo automatico configurato- Verifica redirect URI in eBay Developer Portalcd /var/www/shappa# eBay OAuth- https://api.ebay.com/oauth/api_scope/sell.analytics.readonly

# Verifica auto-renewal

sudo certbot renew --dry-run- Usa credenziali **Sandbox** per sviluppo



# Forza rinnovo manuale (se necessario)git pull origin main

sudo certbot renew --force-renewal

**Produzione**:

# Check scadenza

sudo certbot certificates- Verifica credenziali **Production** in `.env`npm ci --only=productionEBAY_CLIENT_ID=...- https://api.ebay.com/oauth/api_scope/sell.finances

```

- Controlla redirect URI: `https://shapiro.ninja/auth/ebay/callback`

### Monitoring Production

- Verifica scopes richiesti vs concessipm2 restart shappa

```bash

# Check uptime server

uptime

### PM2 non parte su serverpm2 saveEBAY_CLIENT_SECRET=...- https://api.ebay.com/oauth/api_scope/sell.payment.dispute

# Check memoria

free -h



# Check disco```bash```

df -h

# Check PM2 status

# Check processi Node

ps aux | grep nodepm2 statusEBAY_REDIRECT_URI=https://shapiro.ninja/auth/ebay/callback- https://api.ebay.com/oauth/api_scope/buy.shopping.cart



# Check porte aperte

sudo netstat -tulpn | grep LISTEN

# Restart da zero4. **Verifica deployment**:

# Check logs Nginx

sudo tail -f /var/log/nginx/access.logpm2 delete shappa

sudo tail -f /var/log/nginx/error.log

```pm2 start server.js --name shappa```bash- https://api.ebay.com/oauth/api_scope/buy.deal.readonly



---



## 🔧 Troubleshooting# Salva configurazionepm2 logs shappa --lines 50



### Problemi Comunipm2 save



#### 1. Server Non Rispondepm2 startup  # Configura autostart al bootcurl https://shapiro.ninja/api/health# Amazon Scraping (opzionale)- https://api.ebay.com/oauth/api_scope/buy.marketing.readonly



```bash```

# Check se PM2 è attivo

pm2 status```



# Se app è "errored" o "stopped"---

pm2 restart shappa

OPENWEBNINJA_API_KEY=...- https://api.ebay.com/oauth/api_scope/buy.browse

# Se non risolve, check logs

pm2 logs shappa --lines 100 --err## 📚 Documentazione



# Restart da zero### Nginx Configuration

pm2 delete shappa

pm2 start server.js --name shappa- 📖 **Setup Completo**: [`SETUP.md`](./SETUP.md)

pm2 save

```- 🔍 **Code Audit**: [`docs/CODE_AUDIT.md`](./docs/CODE_AUDIT.md)SERPAPI_KEY=...- https://api.ebay.com/oauth/api_scope/buy.offer.auction



#### 2. Monitor Non Invia Notifiche- 🔐 **OAuth eBay**: `docs/EBAY_OAUTH_SETUP.md`



**Check Webhook:**- 🚀 **Deployment**: `DEPLOYMENT_ROADMAP.md`**File**: `/etc/nginx/sites-available/shappa`

```bash

# Test webhook manualmente- 🔧 **API Docs**: `docs/API.md`

curl -X POST https://discord.com/api/webhooks/YOUR_WEBHOOK_URL \

  -H "Content-Type: application/json" \```- https://api.ebay.com/oauth/api_scope/buy.order.readonly

  -d '{"content": "Test notifica"}'

```---



**Check File Webhook:**```nginx

```bash

cd /var/www/shappa/data/webhooks## 📊 Roadmap & Status

ls -la

cat webhook_USER_ID.jsonserver {- https://api.ebay.com/oauth/api_scope/buy.product.summary

```

### ✅ Completato (v2.1.0)

**Check Logs Monitor:**

```bash- [x] Sistema autenticazione (login/register)    server_name shapiro.ninja;

pm2 logs shappa --lines 200 | grep -i "discord\|webhook\|notif"

```- [x] Scraper Amazon proprietario (Playwright stealth)



#### 3. Auth Non Funziona (Cross-Device)- [x] OAuth eBay (Sandbox + Production)    ## 🌍 Deploy in Produzione- https://api.ebay.com/oauth/api_scope/buy.product.conclusion



**Verifica Database Users:**- [x] Gestione listing con calcolo margini

```bash

cd /var/www/shappa/data/users- [x] Monitoraggio prezzi real-time (cron 30 min)    location / {

cat users_db.json | jq .

```- [x] Deploy production su DigitalOcean



**Test API Register:**- [x] Dashboard responsive        proxy_pass http://localhost:3000;

```powershell

$body = @{- [x] MongoDB Atlas integration

  username = "testuser"

  email = "test@example.com"- [x] PM2 process management        proxy_http_version 1.1;

  password = "TestPass123!"

} | ConvertTo-Json- [x] Nginx reverse proxy + SSL



Invoke-RestMethod -Uri "https://shapiro.ninja/api/auth/register" `- [x] Download automatico immagini prodotto        proxy_set_header Upgrade $http_upgrade;### Architettura ProductionNota: puoi ridurre gli scopes impostando la variabile d'ambiente `EBAY_SCOPES` (spazio-separati); il sistema unirà comunque i tuoi scopes con quelli di default evitando duplicati.

  -Method POST `

  -Body $body `- [x] Code audit completo e cleanup

  -ContentType "application/json"

```- [x] Documentazione completa        proxy_set_header Connection 'upgrade';



**Test API Login:**

```powershell

$body = @{### 🔄 In Progress        proxy_set_header Host $host;

  emailOrUsername = "testuser"

  password = "TestPass123!"- [ ] API integrazione altri marketplace (Alibaba, Walmart, AliExpress)

} | ConvertTo-Json

- [ ] Bulk listing automation        proxy_set_header X-Real-IP $remote_addr;

Invoke-RestMethod -Uri "https://shapiro.ninja/api/auth/login" `

  -Method POST `- [ ] Advanced analytics e reports

  -Body $body `

  -ContentType "application/json"- [ ] Performance optimization        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;```### Re-consent necessario

```

- [ ] Test automatici (unit + integration)

#### 4. Puppeteer Bloccato da Cloudflare

        proxy_set_header X-Forwarded-Proto $scheme;

**Verifica User-Agent:**

```javascript### 📈 Futuro

// In monitors/ShopifyMonitor.js

console.log('User-Agent:', await page.evaluate(() => navigator.userAgent));- [ ] AI-powered pricing suggestions        proxy_cache_bypass $http_upgrade;Internet → Cloudflare/DNS → Nginx (shapiro.ninja) → PM2 → Node.js App

```

- [ ] Multi-account management eBay

**Aggiorna Stealth Plugin:**

```bash- [ ] Inventory sync cross-platform    }

npm update puppeteer-extra puppeteer-extra-plugin-stealth

pm2 restart shappa- [ ] Chrome extension per quick listing

```

- [ ] Mobile app (React Native)                                                           ↓Se hai effettuato la connessione eBay in precedenza con scopes più limitati, per ottenere accesso ai nuovi permessi (es. Identity) devi:

**Aumenta Timeout:**

```javascript- [ ] Notifiche email/push

// In ShopifyMonitor.js

await page.goto(this.storeUrl, { - [ ] Supporto multi-lingua    listen 443 ssl http2;

  waitUntil: 'networkidle2',

  timeout: 60000  // 60 secondi invece di 30- [ ] API pubblica per integrazioni

});

```- [ ] Dashboard analytics avanzata    ssl_certificate /etc/letsencrypt/live/shapiro.ninja/fullchain.pem;                                                     MongoDB Atlas



#### 5. High Memory Usage- [ ] Sistema di alerting automatico



```bash    ssl_certificate_key /etc/letsencrypt/live/shapiro.ninja/privkey.pem;

# Check memoria PM2

pm2 monit---



# Se > 500MB, restart    include /etc/letsencrypt/options-ssl-nginx.conf;```1. Disconnettere in Settings (o revocare l'app da eBay → Account → Security → Third-party apps)

pm2 restart shappa

## 🔧 Tech Stack

# Configurare max memory restart

pm2 restart shappa --max-memory-restart 500M    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

pm2 save

```**Backend**:



#### 6. Git Pull Fails- Node.js 20.x}2. Cliccare “Connetti eBay” e completare nuovamente il consenso



```bash- Express.js 5.x

# Stash modifiche locali

git stash- MongoDB Atlas (cloud database)



# Pull- Playwright 1.56 (web scraping)

git pull origin main

- node-cron 4.2 (scheduled tasks)server {### Server DigitalOcean

# Riapplica stash (se necessario)

git stash pop- axios 1.12 (HTTP client)



# Se conflitti, reset hard (ATTENZIONE: perde modifiche locali)    listen 80;

git fetch origin

git reset --hard origin/main**Frontend**:

```

- HTML5 / CSS3 / Vanilla JavaScript    server_name shapiro.ninja;### Gestione errori profilo

### Logs Utili

- Responsive design

```bash

# PM2 logs- Font Awesome icons    return 301 https://$server_name$request_uri;

pm2 logs shappa --lines 500

- No frameworks (performance-first)

# Nginx access logs

sudo tail -f /var/log/nginx/access.log}**Specs**:



# Nginx error logs**Infrastructure**:

sudo tail -f /var/log/nginx/error.log

- DigitalOcean (hosting VPS)```

# System logs

sudo journalctl -u nginx -f- MongoDB Atlas (database cloud)



# Disk usage- Nginx (reverse proxy)- Ubuntu 22.04 LTSLa chiamata `/api/ebay/profile` risponde con `403 insufficient_scope` se l'account non ha concesso i permessi necessari (es. manca `commerce.identity.readonly`). In tal caso la UI mostra una CTA per aggiornare i permessi rifacendo il login eBay.

du -sh /var/www/shappa/*

```- PM2 (process manager)



---- Let's Encrypt (SSL/TLS)---



## 📚 Documentazione Aggiuntiva- GitHub (version control + CI/CD)



### File di Riferimento- Node.js 20.x



- **Setup Dettagliato:** `SETUP.md` (TODO: da creare)**APIs & Services**:

- **Changelog:** Vedi commit history su GitHub

- **API Documentation:** Questo README (sezione API Endpoints)- eBay API (OAuth + Inventory + Sell APIs)## 🛠️ Workflow Sviluppo



### Contatti- Amazon (Playwright scraping proprietario)



- **Maintainer:** Marco- MongoDB Atlas Cloud- Nginx + Let's Encrypt## Stato attuale

- **GitHub:** [@shapironeil](https://github.com/shapironeil)

- **Repository:** [shapironeil/shappa](https://github.com/shapironeil/shappa)- (Optional) OpenWebNinja / SerpApi

- **Website:** https://shapiro.ninja

### Git Flow

### Licenza

---

**Proprietario** - Tutti i diritti riservati  

Copyright © 2025 Marco Shapiro- PM2 process manager



---## 📈 Metriche Progetto



## 🎯 Roadmap Future```powershell



### Priorità Alta (Q1 2025)| Metrica | Valore |



- [ ] **Sicurezza Auth:** Implementare bcrypt per password hashing|---------|--------|# 1. Crea feature branch- IP: 207.154.218.16- **eBay OAuth 2.0 Sandbox** integrato con tutti gli scope necessari (identity, account, analytics, reputation, finances, ecc.).

- [ ] **JWT Tokens:** Sistema token-based per API auth

- [ ] **Rate Limiting:** Protezione abuse API endpoints| **Lines of Code (server.js)** | 1,437 |

- [ ] **Database Migration:** Passaggio da JSON a MySQL/PostgreSQL

| **API Endpoints** | 36 |git checkout -b feature/nome-feature

### Priorità Media (Q2 2025)

| **Moduli lib/** | 8 files |

- [ ] **Multi-Store Support:** Monitoraggio multipli store Shopify per utente

- [ ] **Email Notifications:** Alert via email oltre Discord| **Frontend pages** | 6 pages |- **Flusso di login**: popup OAuth, ricezione token, salvataggio access/refresh token, auto-refresh ogni 30 minuti.

- [ ] **Dashboard Analytics:** Grafici drop/restock nel tempo

- [ ] **Mobile App:** React Native per notifiche push native| **Dependencies** | 7 packages |



### Priorità Bassa (Q3+ 2025)| **Variabili ENV** | 17 core + 11 optional |# 2. Sviluppa e testa locale



- [ ] **AI Price Prediction:** ML per prevedere drop basato su pattern storici| **Commit totali** | 100+ |

- [ ] **Proxy Rotation:** Pool proxy per evitare IP ban

- [ ] **Chrome Extension:** Quick setup monitor da browser| **Uptime produzione** | 99.9% |npm run dev### Deploy Steps- **Recupero dati utente**: chiamata a `/api/ebay/user-info` backend che interroga l'Identity API. In sandbox, i dati sono limitati (nickname, nome, cognome, email spesso nulli).

- [ ] **Multi-Language:** Supporto IT/EN/ES



---

---

## 🆕 Changelog Recente



### v2.3.0 (Gennaio 2025) - CURRENT

## 🔐 Security# 3. Commit modifiche- **Card eBay Seller Hub**: mostra stato connessione, userId, data connessione, scadenza token, bottone info ⓘ con popup dettagli.

**✅ Completato:**

- Auth system server-side con REST API

- Async form handlers (login/register)

- Modal UI compact e scrollable### Best Practices Implementategit add .

- Monitor timing ogni mezz'ora (X:00, X:30)

- Discord notifications con immagini prodotto- ✅ Variabili sensibili in `.env` (non commitato)

- Heartbeat 2 ore

- Direct-to-cart links per variant- ✅ HTTPS obbligatorio in produzionegit commit -m "feat: descrizione chiara"1. **SSH nel droplet**:- **Visualizzazione intelligente**: se nickname/nome/cognome non disponibili, mostra almeno userId. Nel popup info, nota "sandbox: dati limitati" se i dati sono null.



**🔧 Fixed:**- ✅ OAuth 2.0 per autenticazione eBay

- Cross-device auth funzionante

- Modal overflow issues- ✅ Token refresh automatico

- API_BASE URLs corretti (shapiro.ninja)

- Webhook localStorage → server storage- ✅ Admin endpoints protetti da token



**📝 Documentazione:**- ✅ CORS configurato correttamente# 4. Push e crea PR```bash- **Architettura frontend**: ApiClient centralizzato, SettingsManager, EventBus, Store. Tutte le chiamate eBay passano da ApiClient.

- README completo per AI agents

- API documentation- ✅ Let's Encrypt SSL/TLS

- Database schemas

- Deploy workflowgit push origin feature/nome-feature



---### To-Do Security



**Ultimo Aggiornamento:** 15 Gennaio 2025  - [ ] Rate limiting API endpointsssh root@207.154.218.16- **Gestione errori**: fallback automatico su dati minimi, notifiche user-friendly, log dettagliati per debug.

**Versione:** 2.3.0  

**Status:** 🟢 Production Online  - [ ] Input validation e sanitization

**Next Deploy:** TBD

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
