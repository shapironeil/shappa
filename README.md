# 🛒 Shappa - Automazione Listing Amazon → eBay# 🛒 Shappa - Automazione Listing Amazon → eBay# 🛒 Shappa - Automazione Listing Amazon → eBay



**Webapp professionale per automatizzare la vendita su eBay attingendo da cataloghi Amazon**



---**Webapp professionale per automatizzare la vendita su eBay attingendo da cataloghi Amazon****Webapp professionale per automatizzare la vendita su eBay attingendo da cataloghi Amazon**



## ✅ **DEPLOYMENT STATUS**



🟢 **ONLINE E FUNZIONANTE**## 🌐 Server Production## 🌐 Server Production



- **URL Live**: https://shapiro.ninja

- **Status**: 200 OK ✅

- **Server**: PM2 attivo su DigitalOcean- **URL**: https://shapiro.ninja- **URL**: https://shapiro.ninja

- **Database**: MongoDB Atlas connesso

- **Ultimo Deploy**: 7 Novembre 2025 - 14:30 UTC- **Hosting**: DigitalOcean Droplet (207.154.218.16)- **Hosting**: DigitalOcean Droplet (207.154.218.16)

- **Commit**: `820de75` - Complete environment setup and production documentation

- **Database**: MongoDB Atlas (cluster condiviso dev/prod)- **Database**: MongoDB Atlas (cluster condiviso dev/prod)

### Quick Health Check

```powershell- **Dominio**: shapiro.ninja (DNS puntato a droplet)- **Dominio**: shapiro.ninja (DNS puntato a droplet)

# Test sito

Invoke-WebRequest -Uri "https://shapiro.ninja" -UseBasicParsing- **Server**: Node.js + Express- **Server**: Node.js + Express



# Status PM2 (da server)- **Process Manager**: PM2- **Process Manager**: PM2

ssh root@207.154.218.16 "pm2 status"

- **Reverse Proxy**: Nginx + Let's Encrypt SSL- **Reverse Proxy**: Nginx + Let's Encrypt SSL

# Logs real-time

ssh root@207.154.218.16 "pm2 logs shappa --lines 50"

```

## ✨ Funzionalità Core## ✨ Funzionalità Core

---



## 🌐 Infrastruttura Production

### 1. 🔍 Ricerca Prodotti Multi-MarketplaceBackend e frontend usano uno scraper Playwright proprietario per ottenere i dati da Amazon senza servizi esterni.

### Server

- **Provider**: DigitalOcean Droplet- **Amazon**: Scraping real-time con Playwright

- **IP**: 207.154.218.16

- **OS**: Ubuntu 22.04 LTS- **eBay, Alibaba, Walmart, AliExpress**: In sviluppoFunzionalità principali:

- **Node.js**: v20.x

- **Process Manager**: PM2- Filtri avanzati: paese, categoria, prezzo, ordinamento- Scraping Playwright proprietario (server-side) — sostituisce OpenWebNinja e SerpApi

- **Reverse Proxy**: Nginx + Let's Encrypt SSL

- Modal dettagli con galleria immagini HD- Caching in-memory opzionale per dettagli prodotto

### Database

- **Provider**: MongoDB Atlas (Cloud)- Modale dettaglio con galleria immagini e tabs (Info / Automazione)

- **Cluster**: Shared (condiviso dev/prod)

- **Strategy**: Database unico per sviluppo e produzione### 2. 📦 Gestione Listing- Dati prodotto completi e aggiornati

  - Dev usa eBay Sandbox per testing sicuro

  - Prod usa eBay Production per listing reali- Import prodotti con un click- Dockerfile e suggerimenti deploy



### Dominio- Calcolo automatico margini e fee eBay

- **Domain**: shapiro.ninja

- **DNS**: Puntato a 207.154.218.16- Monitoraggio prezzi Amazon in tempo realeVariabili ambiente

- **SSL**: Let's Encrypt (auto-renew)

- Sincronizzazione multi-marketplace- AMAZON_COUNTRY - default country (IT)

---

- PORT - server port (default 3000)

## ✨ Funzionalità Core

### 3. 🔐 Autenticazione- AMAZON_CACHE_TTL - cache TTL in seconds (default 90)

### 1. 🔍 Ricerca Prodotti Multi-Marketplace

- **Amazon**: Scraping real-time con Playwright proprietario- Sistema login/registrazione completo

- **Altri marketplace**: In sviluppo (eBay, Alibaba, Walmart, AliExpress)

- Filtri avanzati: paese, categoria, prezzo, ordinamento- OAuth eBay integrato (Sandbox + Production)eBay OAuth (important)

- Modal dettagli con galleria immagini HD

- Token management con auto-refresh- eBay requires a secure (https) redirect URI for OAuth callbacks in many environments. For local development, use `https://localhost:3000/auth/ebay/callback` and ensure your local certificate is trusted (e.g., with mkcert). If you use `http://localhost:3000` eBay OAuth may fail during token exchange.

### 2. 📦 Gestione Listing

- Import prodotti con un click- Pagine protette con middleware

- Calcolo automatico margini e fee eBay

- Monitoraggio prezzi Amazon in tempo realeLocal run

- Sincronizzazione multi-marketplace

### 4. 📊 Dashboard & Reports1. Install dependencies: `npm install`

### 3. 🔐 Autenticazione

- Sistema login/registrazione completo- Overview vendite e profitti2. Create a `.env` file with the variables above (do not commit the key)

- OAuth eBay integrato (Sandbox + Production)

- Token management con auto-refresh- Storico transazioni3. Start server: `node server.js`

- Pagine protette con middleware

- Analytics performance

### 4. 📊 Dashboard & Reports

- Overview vendite e profitti- Export dati CSV/ExcelDocker

- Storico transazioni

- Analytics performance1. Build: `docker build -t shappa .`

- Export dati CSV/Excel

## 🚀 Quick Start - Sviluppo Locale2. Run: `docker run -p 3000:3000 shappa`

---



## 🚀 Setup Locale - Quick Start

### PrerequisitiImportant

### Prerequisiti

- Node.js >= 18.x- Node.js >= 18.x- Il file `lib/scraper/amazonScraper.js` contiene la logica di scraping e mapping. Aggiornare la documentazione quando si modifica l’estrazione dati.

- Git

- Account MongoDB Atlas- Git# 📋 Stato Aggiornato (09/10/2025 - ore 20:45)

- (Opzionale) eBay Sandbox credentials

- Account MongoDB Atlas

### Installazione Rapida

- (Opzionale) Credenziali eBay Sandbox## 🚀 Nuove Funzionalità v2.0.1

```powershell

# 1. Clona repository

git clone https://github.com/shapironeil/shappa.git

cd shappa### Installazione### 1. Navbar Universale - Click Nickname da Qualsiasi Pagina



# 2. Installa dipendenze- ✅ **Click Universale**: Ora il click su nickname/avatar funziona da **TUTTE le pagine** (Dashboard, Settings, Admin, ecc.)

npm install

```powershell- ✅ **Smart Redirect**: 

# 3. Configura ambiente

Copy-Item .env.example .env# Clona il repository  - Se sei in Settings → switcha direttamente alla tab Account

# Modifica .env con le tue credenziali

git clone https://github.com/shapironeil/shappa.git  - Se sei in altre pagine → redirect a Settings → Account

# 4. Avvia server di sviluppo

npm run devcd shappa- ✅ **Deep Linking**: Supporto per URL diretto `settings.html#account`

```

- ✅ **Codice Centralizzato**: Nuovo file `src/utils/navbar-universal.js` per gestire tutto in modo DRY

Server disponibile su: `http://localhost:3000`

# Installa dipendenze

📖 **Per setup dettagliato vedi**: [`SETUP.md`](./SETUP.md)

npm install### 2. Gestione Errori OAuth Migliorata

---

- ✅ **Messaggio User-Friendly**: Se chiudi la finestra OAuth, ora vedi "ℹ️ Connessione annullata. Clicca su 'Connetti eBay' per riprovare." invece di un errore generico

## 📁 Struttura Progetto

# Copia e configura .env- ✅ **Notifica Info**: Colore blu (info) invece di rosso (error) per indicare che è solo un'azione annullata

```

shappa/Copy-Item .env.example .env- ✅ **UX Migliorata**: L'utente capisce immediatamente che può riprovare senza problemi

├── server.js              # Express server principale

├── package.json           # Dipendenze e scripts# Modifica .env con le tue credenziali

├── .env.example           # Template variabili ambiente

├── SETUP.md              # Guida setup completa**Documentazione completa**: [`docs/CHANGELOG_NAVBAR_UNIVERSAL.md`](docs/CHANGELOG_NAVBAR_UNIVERSAL.md)

├── lib/

│   ├── scraper/          # Playwright scraper Amazon# Avvia il server di sviluppo

│   └── services/         # Business logic (monitor prezzi)

├── src/npm run dev## 🎯 Miglioramenti UX Precedenti

│   ├── pages/            # Frontend HTML (dashboard, products, listings)

│   ├── utils/            # Utilities JS (auth, API client)```

│   └── styles/           # CSS

├── public/               # Asset statici### Click sul Nickname → Redirect alla Scheda Account

├── data/                 # Dati applicazione

├── oauth/                # Token eBayIl server sarà disponibile su: `http://localhost:3000`- ✅ **Nickname e Avatar Cliccabili**: Ora cliccando sul tuo nickname o avatar nella navbar, vieni automaticamente reindirizzato alla scheda "Account" nelle impostazioni

└── docs/                 # Documentazione tecnica

```- ✅ **Hover Effects**: Effetti visivi al passaggio del mouse per indicare che sono elementi cliccabili



---**Per configurazione dettagliata, vedi** [`SETUP.md`](./SETUP.md)- ✅ **Transizioni Smooth**: Animazioni fluide per un'esperienza utente premium



## 🔑 Variabili d'Ambiente



### Server## 📁 Struttura Progetto### Formato User ID eBay Migliorato

```bash

NODE_ENV=development|production- ✅ **Display Name**: Ora mostra `nickname (Nome Cognome)` invece di "eBay User"

PORT=3000

``````- ✅ **Email Sottostante**: Visualizzazione dell'email associata sotto il nome utente



### Databaseshappa/- ✅ **Informazioni Complete**: Massima visibilità dei dati dell'account connesso

```bash

MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/shappa├── server.js              # Server Express principale

```

├── package.json           # Dipendenze### Sistema di Scadenza Token Migliorato

### eBay OAuth

```bash├── .env.example           # Template variabili ambiente- ✅ **Messaggi Chiari**: Ora il sistema spiega chiaramente cosa significa "Token scade tra X ore"

# Production (server online)

EBAY_CLIENT_ID=your_production_client_id├── SETUP.md              # Guida setup completa- ✅ **Indicatori Visivi**: 

EBAY_CLIENT_SECRET=your_production_secret

EBAY_REDIRECT_URI=https://shapiro.ninja/auth/ebay/callback├── lib/  - ✅ Verde = Token valido (> 1 giorno)



# Sandbox (sviluppo locale)│   ├── scraper/          # Playwright scraper Amazon  - ⚠️ Giallo = Token in scadenza (< 24 ore, rinnovo imminente)

EBAY_SANDBOX_CLIENT_ID=your_sandbox_client_id

EBAY_SANDBOX_CLIENT_SECRET=your_sandbox_secret│   └── services/         # Business logic (monitor prezzi, etc)  - ⏱️ Arancione = Rinnovo in corso (< 1 ora)

EBAY_SANDBOX_REDIRECT_URI=https://localhost:3000/auth/ebay/callback

```├── src/  - ❌ Rosso = Token scaduto (rinnovo automatico attivo)



### Scraping (Opzionali)│   ├── pages/            # Frontend (dashboard, products, listings, settings)- ✅ **Testo Esplicativo**: Ogni stato mostra un messaggio che spiega che il rinnovo è automatico

```bash

OPENWEBNINJA_API_KEY=your_api_key│   ├── utils/            # Utilities JS (auth, API client)- ✅ **Documentazione Completa**: Creato `docs/TOKEN_REFRESH_EXPLANATION.md` con FAQ dettagliate

SERPAPI_KEY=your_api_key

```│   └── styles/           # CSS



---├── public/               # Asset statici# Shappa - Stato Sviluppo eBay OAuth & Account Integration



## 🌍 Deploy in Produzione└── docs/                 # Documentazione tecnica



### Architettura```## Scopes OAuth eBay (Produzione)



```

Internet → DNS → Nginx (shapiro.ninja:443) → PM2 → Node.js App (port 3000)

                                                          ↓## 🔑 Variabili d'Ambiente PrincipaliPer garantire massima flessibilità futura, il backend richiede ora per default un set esteso di scopes eBay al momento del login (FULL_SCOPES), che include:

                                                    MongoDB Atlas

```



### Deploy Steps```bash- https://api.ebay.com/oauth/api_scope



1. **Commit e Push modifiche**:# Server- https://api.ebay.com/oauth/api_scope/commerce.identity.readonly

```powershell

git add .NODE_ENV=development|production- https://api.ebay.com/oauth/api_scope/commerce.catalog.readonly

git commit -m "feat: descrizione modifiche"

git push origin mainPORT=3000- https://api.ebay.com/oauth/api_scope/commerce.notification.subscription

```

- https://api.ebay.com/oauth/api_scope/sell.inventory (+ readonly)

2. **SSH nel server**:

```powershell# Database (MongoDB Atlas)- https://api.ebay.com/oauth/api_scope/sell.account (+ readonly)

ssh root@207.154.218.16

```MONGODB_URI=mongodb+srv://...- https://api.ebay.com/oauth/api_scope/sell.fulfillment (+ readonly)



3. **Pull e deploy**:- https://api.ebay.com/oauth/api_scope/sell.marketing (+ readonly)

```bash

cd /var/www/shappa# eBay OAuth- https://api.ebay.com/oauth/api_scope/sell.analytics.readonly

git pull origin main

npm ci --only=productionEBAY_CLIENT_ID=...- https://api.ebay.com/oauth/api_scope/sell.finances

pm2 restart shappa

pm2 saveEBAY_CLIENT_SECRET=...- https://api.ebay.com/oauth/api_scope/sell.payment.dispute

```

EBAY_REDIRECT_URI=https://shapiro.ninja/auth/ebay/callback- https://api.ebay.com/oauth/api_scope/buy.shopping.cart

4. **Verifica deployment**:

```bash- https://api.ebay.com/oauth/api_scope/buy.deal.readonly

pm2 logs shappa --lines 50

curl https://shapiro.ninja/api/health# Amazon Scraping (opzionale)- https://api.ebay.com/oauth/api_scope/buy.marketing.readonly

```

OPENWEBNINJA_API_KEY=...- https://api.ebay.com/oauth/api_scope/buy.browse

### Nginx Configuration

SERPAPI_KEY=...- https://api.ebay.com/oauth/api_scope/buy.offer.auction

**File**: `/etc/nginx/sites-available/shappa`

```- https://api.ebay.com/oauth/api_scope/buy.order.readonly

```nginx

server {- https://api.ebay.com/oauth/api_scope/buy.product.summary

    server_name shapiro.ninja;

    ## 🌍 Deploy in Produzione- https://api.ebay.com/oauth/api_scope/buy.product.conclusion

    location / {

        proxy_pass http://localhost:3000;

        proxy_http_version 1.1;

        proxy_set_header Upgrade $http_upgrade;### Architettura ProductionNota: puoi ridurre gli scopes impostando la variabile d'ambiente `EBAY_SCOPES` (spazio-separati); il sistema unirà comunque i tuoi scopes con quelli di default evitando duplicati.

        proxy_set_header Connection 'upgrade';

        proxy_set_header Host $host;

        proxy_set_header X-Real-IP $remote_addr;

        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;```### Re-consent necessario

        proxy_set_header X-Forwarded-Proto $scheme;

        proxy_cache_bypass $http_upgrade;Internet → Cloudflare/DNS → Nginx (shapiro.ninja) → PM2 → Node.js App

    }

                                                           ↓Se hai effettuato la connessione eBay in precedenza con scopes più limitati, per ottenere accesso ai nuovi permessi (es. Identity) devi:

    listen 443 ssl http2;

    ssl_certificate /etc/letsencrypt/live/shapiro.ninja/fullchain.pem;                                                     MongoDB Atlas

    ssl_certificate_key /etc/letsencrypt/live/shapiro.ninja/privkey.pem;

    include /etc/letsencrypt/options-ssl-nginx.conf;```1. Disconnettere in Settings (o revocare l'app da eBay → Account → Security → Third-party apps)

    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

}2. Cliccare “Connetti eBay” e completare nuovamente il consenso



server {### Server DigitalOcean

    listen 80;

    server_name shapiro.ninja;### Gestione errori profilo

    return 301 https://$server_name$request_uri;

}**Specs**:

```

- Ubuntu 22.04 LTSLa chiamata `/api/ebay/profile` risponde con `403 insufficient_scope` se l'account non ha concesso i permessi necessari (es. manca `commerce.identity.readonly`). In tal caso la UI mostra una CTA per aggiornare i permessi rifacendo il login eBay.

---

- Node.js 20.x

## 🛠️ Workflow Sviluppo

- Nginx + Let's Encrypt## Stato attuale

### Git Flow

- PM2 process manager

```powershell

# 1. Crea feature branch- IP: 207.154.218.16- **eBay OAuth 2.0 Sandbox** integrato con tutti gli scope necessari (identity, account, analytics, reputation, finances, ecc.).

git checkout -b feature/nome-feature

- **Flusso di login**: popup OAuth, ricezione token, salvataggio access/refresh token, auto-refresh ogni 30 minuti.

# 2. Sviluppa e testa locale

npm run dev### Deploy Steps- **Recupero dati utente**: chiamata a `/api/ebay/user-info` backend che interroga l'Identity API. In sandbox, i dati sono limitati (nickname, nome, cognome, email spesso nulli).



# 3. Commit modifiche- **Card eBay Seller Hub**: mostra stato connessione, userId, data connessione, scadenza token, bottone info ⓘ con popup dettagli.

git add .

git commit -m "feat: descrizione chiara"1. **SSH nel droplet**:- **Visualizzazione intelligente**: se nickname/nome/cognome non disponibili, mostra almeno userId. Nel popup info, nota "sandbox: dati limitati" se i dati sono null.



# 4. Push e crea PR```bash- **Architettura frontend**: ApiClient centralizzato, SettingsManager, EventBus, Store. Tutte le chiamate eBay passano da ApiClient.

git push origin feature/nome-feature

ssh root@207.154.218.16- **Gestione errori**: fallback automatico su dati minimi, notifiche user-friendly, log dettagliati per debug.

# 5. Dopo merge, deploy in produzione (vedi sopra)

``````- **UI**: nessuna modifica estetica, solo miglioramenti funzionali e informativi.



### Testing



**Locale**:2. **Pull modifiche**:## Limitazioni attuali

```powershell

npm run dev```bash

# Apri http://localhost:3000

```cd /var/www/shappa- In **sandbox** non è possibile ottenere dati utente reali (nickname, nome, cognome, email) tramite Identity API. In produzione, con account reale e scope corretti, i dati saranno disponibili.



**Production**:git pull origin main- La card e il popup info mostrano sempre almeno userId. Se i dati sono null, viene visualizzato un messaggio di avviso.

```powershell

Invoke-WebRequest -Uri "https://shapiro.ninja" -UseBasicParsingnpm ci --only=production- Il backend logga ogni chiamata eBay e fallback.

```

```

---

## Prossimi step (priorità per domani)

## 🐛 Troubleshooting

3. **Riavvia app**:

### Server locale non si avvia

```bash1. **Testare in produzione** (quando pronto): verificare che nickname, nome, cognome, email siano valorizzati e visualizzati correttamente.

```powershell

# Check porta occupatapm2 restart shappa2. **Estendere la raccolta dati**:

netstat -ano | findstr :3000

pm2 save   - Integrare chiamate alle API eBay Sell Account (privilegi, business policies, limiti, seller standards, reputation, finances) e mostrare nel popup info.

# Reinstalla dipendenze

Remove-Item node_modules -Recurse -Force```   - Mostrare anche metriche di venditore, limiti, stato account, eventuali warning.

npm install

3. **Gestione multi-marketplace**:

# Verifica .env

cat .env4. **Verifica**:   - Supportare account eBay su più marketplace (IT, DE, FR, UK, US) e visualizzare le policy per ciascuno.

```

```bash4. **Persistenza e sicurezza**:

### MongoDB connection failed

pm2 logs shappa   - Migliorare la persistenza dei token e dati utente (migrazione da localStorage a backend/DB sicuro).

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
