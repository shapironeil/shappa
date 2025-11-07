# 🛒 Shappa - Automazione Listing Amazon → eBay# 🛒 Shappa - Automazione Listing Amazon → eBay



**Webapp professionale per automatizzare la vendita su eBay attingendo da cataloghi Amazon****Webapp professionale per automatizzare la vendita su eBay attingendo da cataloghi Amazon**



## 🌐 Server Production## 🌐 Server Production



- **URL**: https://shapiro.ninja- **URL**: https://shapiro.ninja

- **Hosting**: DigitalOcean Droplet (207.154.218.16)- **Hosting**: DigitalOcean Droplet (207.154.218.16)

- **Database**: MongoDB Atlas (cluster condiviso dev/prod)- **Database**: MongoDB Atlas (cluster condiviso dev/prod)

- **Dominio**: shapiro.ninja (DNS puntato a droplet)- **Dominio**: shapiro.ninja (DNS puntato a droplet)

- **Server**: Node.js + Express- **Server**: Node.js + Express

- **Process Manager**: PM2- **Process Manager**: PM2

- **Reverse Proxy**: Nginx + Let's Encrypt SSL- **Reverse Proxy**: Nginx + Let's Encrypt SSL



## ✨ Funzionalità Core## ✨ Funzionalità Core



### 1. 🔍 Ricerca Prodotti Multi-MarketplaceBackend e frontend usano uno scraper Playwright proprietario per ottenere i dati da Amazon senza servizi esterni.

- **Amazon**: Scraping real-time con Playwright

- **eBay, Alibaba, Walmart, AliExpress**: In sviluppoFunzionalità principali:

- Filtri avanzati: paese, categoria, prezzo, ordinamento- Scraping Playwright proprietario (server-side) — sostituisce OpenWebNinja e SerpApi

- Modal dettagli con galleria immagini HD- Caching in-memory opzionale per dettagli prodotto

- Modale dettaglio con galleria immagini e tabs (Info / Automazione)

### 2. 📦 Gestione Listing- Dati prodotto completi e aggiornati

- Import prodotti con un click- Dockerfile e suggerimenti deploy

- Calcolo automatico margini e fee eBay

- Monitoraggio prezzi Amazon in tempo realeVariabili ambiente

- Sincronizzazione multi-marketplace- AMAZON_COUNTRY - default country (IT)

- PORT - server port (default 3000)

### 3. 🔐 Autenticazione- AMAZON_CACHE_TTL - cache TTL in seconds (default 90)

- Sistema login/registrazione completo

- OAuth eBay integrato (Sandbox + Production)eBay OAuth (important)

- Token management con auto-refresh- eBay requires a secure (https) redirect URI for OAuth callbacks in many environments. For local development, use `https://localhost:3000/auth/ebay/callback` and ensure your local certificate is trusted (e.g., with mkcert). If you use `http://localhost:3000` eBay OAuth may fail during token exchange.

- Pagine protette con middleware

Local run

### 4. 📊 Dashboard & Reports1. Install dependencies: `npm install`

- Overview vendite e profitti2. Create a `.env` file with the variables above (do not commit the key)

- Storico transazioni3. Start server: `node server.js`

- Analytics performance

- Export dati CSV/ExcelDocker

1. Build: `docker build -t shappa .`

## 🚀 Quick Start - Sviluppo Locale2. Run: `docker run -p 3000:3000 shappa`



### PrerequisitiImportant

- Node.js >= 18.x- Il file `lib/scraper/amazonScraper.js` contiene la logica di scraping e mapping. Aggiornare la documentazione quando si modifica l’estrazione dati.

- Git# 📋 Stato Aggiornato (09/10/2025 - ore 20:45)

- Account MongoDB Atlas

- (Opzionale) Credenziali eBay Sandbox## 🚀 Nuove Funzionalità v2.0.1



### Installazione### 1. Navbar Universale - Click Nickname da Qualsiasi Pagina

- ✅ **Click Universale**: Ora il click su nickname/avatar funziona da **TUTTE le pagine** (Dashboard, Settings, Admin, ecc.)

```powershell- ✅ **Smart Redirect**: 

# Clona il repository  - Se sei in Settings → switcha direttamente alla tab Account

git clone https://github.com/shapironeil/shappa.git  - Se sei in altre pagine → redirect a Settings → Account

cd shappa- ✅ **Deep Linking**: Supporto per URL diretto `settings.html#account`

- ✅ **Codice Centralizzato**: Nuovo file `src/utils/navbar-universal.js` per gestire tutto in modo DRY

# Installa dipendenze

npm install### 2. Gestione Errori OAuth Migliorata

- ✅ **Messaggio User-Friendly**: Se chiudi la finestra OAuth, ora vedi "ℹ️ Connessione annullata. Clicca su 'Connetti eBay' per riprovare." invece di un errore generico

# Copia e configura .env- ✅ **Notifica Info**: Colore blu (info) invece di rosso (error) per indicare che è solo un'azione annullata

Copy-Item .env.example .env- ✅ **UX Migliorata**: L'utente capisce immediatamente che può riprovare senza problemi

# Modifica .env con le tue credenziali

**Documentazione completa**: [`docs/CHANGELOG_NAVBAR_UNIVERSAL.md`](docs/CHANGELOG_NAVBAR_UNIVERSAL.md)

# Avvia il server di sviluppo

npm run dev## 🎯 Miglioramenti UX Precedenti

```

### Click sul Nickname → Redirect alla Scheda Account

Il server sarà disponibile su: `http://localhost:3000`- ✅ **Nickname e Avatar Cliccabili**: Ora cliccando sul tuo nickname o avatar nella navbar, vieni automaticamente reindirizzato alla scheda "Account" nelle impostazioni

- ✅ **Hover Effects**: Effetti visivi al passaggio del mouse per indicare che sono elementi cliccabili

**Per configurazione dettagliata, vedi** [`SETUP.md`](./SETUP.md)- ✅ **Transizioni Smooth**: Animazioni fluide per un'esperienza utente premium



## 📁 Struttura Progetto### Formato User ID eBay Migliorato

- ✅ **Display Name**: Ora mostra `nickname (Nome Cognome)` invece di "eBay User"

```- ✅ **Email Sottostante**: Visualizzazione dell'email associata sotto il nome utente

shappa/- ✅ **Informazioni Complete**: Massima visibilità dei dati dell'account connesso

├── server.js              # Server Express principale

├── package.json           # Dipendenze### Sistema di Scadenza Token Migliorato

├── .env.example           # Template variabili ambiente- ✅ **Messaggi Chiari**: Ora il sistema spiega chiaramente cosa significa "Token scade tra X ore"

├── SETUP.md              # Guida setup completa- ✅ **Indicatori Visivi**: 

├── lib/  - ✅ Verde = Token valido (> 1 giorno)

│   ├── scraper/          # Playwright scraper Amazon  - ⚠️ Giallo = Token in scadenza (< 24 ore, rinnovo imminente)

│   └── services/         # Business logic (monitor prezzi, etc)  - ⏱️ Arancione = Rinnovo in corso (< 1 ora)

├── src/  - ❌ Rosso = Token scaduto (rinnovo automatico attivo)

│   ├── pages/            # Frontend (dashboard, products, listings, settings)- ✅ **Testo Esplicativo**: Ogni stato mostra un messaggio che spiega che il rinnovo è automatico

│   ├── utils/            # Utilities JS (auth, API client)- ✅ **Documentazione Completa**: Creato `docs/TOKEN_REFRESH_EXPLANATION.md` con FAQ dettagliate

│   └── styles/           # CSS

├── public/               # Asset statici# Shappa - Stato Sviluppo eBay OAuth & Account Integration

└── docs/                 # Documentazione tecnica

```## Scopes OAuth eBay (Produzione)



## 🔑 Variabili d'Ambiente PrincipaliPer garantire massima flessibilità futura, il backend richiede ora per default un set esteso di scopes eBay al momento del login (FULL_SCOPES), che include:



```bash- https://api.ebay.com/oauth/api_scope

# Server- https://api.ebay.com/oauth/api_scope/commerce.identity.readonly

NODE_ENV=development|production- https://api.ebay.com/oauth/api_scope/commerce.catalog.readonly

PORT=3000- https://api.ebay.com/oauth/api_scope/commerce.notification.subscription

- https://api.ebay.com/oauth/api_scope/sell.inventory (+ readonly)

# Database (MongoDB Atlas)- https://api.ebay.com/oauth/api_scope/sell.account (+ readonly)

MONGODB_URI=mongodb+srv://...- https://api.ebay.com/oauth/api_scope/sell.fulfillment (+ readonly)

- https://api.ebay.com/oauth/api_scope/sell.marketing (+ readonly)

# eBay OAuth- https://api.ebay.com/oauth/api_scope/sell.analytics.readonly

EBAY_CLIENT_ID=...- https://api.ebay.com/oauth/api_scope/sell.finances

EBAY_CLIENT_SECRET=...- https://api.ebay.com/oauth/api_scope/sell.payment.dispute

EBAY_REDIRECT_URI=https://shapiro.ninja/auth/ebay/callback- https://api.ebay.com/oauth/api_scope/buy.shopping.cart

- https://api.ebay.com/oauth/api_scope/buy.deal.readonly

# Amazon Scraping (opzionale)- https://api.ebay.com/oauth/api_scope/buy.marketing.readonly

OPENWEBNINJA_API_KEY=...- https://api.ebay.com/oauth/api_scope/buy.browse

SERPAPI_KEY=...- https://api.ebay.com/oauth/api_scope/buy.offer.auction

```- https://api.ebay.com/oauth/api_scope/buy.order.readonly

- https://api.ebay.com/oauth/api_scope/buy.product.summary

## 🌍 Deploy in Produzione- https://api.ebay.com/oauth/api_scope/buy.product.conclusion



### Architettura ProductionNota: puoi ridurre gli scopes impostando la variabile d'ambiente `EBAY_SCOPES` (spazio-separati); il sistema unirà comunque i tuoi scopes con quelli di default evitando duplicati.



```### Re-consent necessario

Internet → Cloudflare/DNS → Nginx (shapiro.ninja) → PM2 → Node.js App

                                                           ↓Se hai effettuato la connessione eBay in precedenza con scopes più limitati, per ottenere accesso ai nuovi permessi (es. Identity) devi:

                                                     MongoDB Atlas

```1. Disconnettere in Settings (o revocare l'app da eBay → Account → Security → Third-party apps)

2. Cliccare “Connetti eBay” e completare nuovamente il consenso

### Server DigitalOcean

### Gestione errori profilo

**Specs**:

- Ubuntu 22.04 LTSLa chiamata `/api/ebay/profile` risponde con `403 insufficient_scope` se l'account non ha concesso i permessi necessari (es. manca `commerce.identity.readonly`). In tal caso la UI mostra una CTA per aggiornare i permessi rifacendo il login eBay.

- Node.js 20.x

- Nginx + Let's Encrypt## Stato attuale

- PM2 process manager

- IP: 207.154.218.16- **eBay OAuth 2.0 Sandbox** integrato con tutti gli scope necessari (identity, account, analytics, reputation, finances, ecc.).

- **Flusso di login**: popup OAuth, ricezione token, salvataggio access/refresh token, auto-refresh ogni 30 minuti.

### Deploy Steps- **Recupero dati utente**: chiamata a `/api/ebay/user-info` backend che interroga l'Identity API. In sandbox, i dati sono limitati (nickname, nome, cognome, email spesso nulli).

- **Card eBay Seller Hub**: mostra stato connessione, userId, data connessione, scadenza token, bottone info ⓘ con popup dettagli.

1. **SSH nel droplet**:- **Visualizzazione intelligente**: se nickname/nome/cognome non disponibili, mostra almeno userId. Nel popup info, nota "sandbox: dati limitati" se i dati sono null.

```bash- **Architettura frontend**: ApiClient centralizzato, SettingsManager, EventBus, Store. Tutte le chiamate eBay passano da ApiClient.

ssh root@207.154.218.16- **Gestione errori**: fallback automatico su dati minimi, notifiche user-friendly, log dettagliati per debug.

```- **UI**: nessuna modifica estetica, solo miglioramenti funzionali e informativi.



2. **Pull modifiche**:## Limitazioni attuali

```bash

cd /var/www/shappa- In **sandbox** non è possibile ottenere dati utente reali (nickname, nome, cognome, email) tramite Identity API. In produzione, con account reale e scope corretti, i dati saranno disponibili.

git pull origin main- La card e il popup info mostrano sempre almeno userId. Se i dati sono null, viene visualizzato un messaggio di avviso.

npm ci --only=production- Il backend logga ogni chiamata eBay e fallback.

```

## Prossimi step (priorità per domani)

3. **Riavvia app**:

```bash1. **Testare in produzione** (quando pronto): verificare che nickname, nome, cognome, email siano valorizzati e visualizzati correttamente.

pm2 restart shappa2. **Estendere la raccolta dati**:

pm2 save   - Integrare chiamate alle API eBay Sell Account (privilegi, business policies, limiti, seller standards, reputation, finances) e mostrare nel popup info.

```   - Mostrare anche metriche di venditore, limiti, stato account, eventuali warning.

3. **Gestione multi-marketplace**:

4. **Verifica**:   - Supportare account eBay su più marketplace (IT, DE, FR, UK, US) e visualizzare le policy per ciascuno.

```bash4. **Persistenza e sicurezza**:

pm2 logs shappa   - Migliorare la persistenza dei token e dati utente (migrazione da localStorage a backend/DB sicuro).

curl https://shapiro.ninja/api/health   - Gestire logout, revoca token, sessioni attive.

```5. **Esperienza utente**:

   - Migliorare le notifiche e i messaggi di stato (es. "sandbox: dati limitati", "token scaduto, login richiesto", ecc.).

### Nginx Configuration   - Aggiungere loader e feedback visivi per tutte le azioni.

6. **Compliance e aggiornamenti 2025**:

File: `/etc/nginx/sites-available/shappa`   - Gestire la transizione da username a userId per utenti US (dal 26 settembre 2025).

   - Documentare nel codice e nel README le differenze tra sandbox e produzione.

```nginx7. **Documentazione e onboarding**:

server {   - Aggiornare README e commenti in codice per facilitare la ripresa lavori.

    server_name shapiro.ninja;   - Elencare tutti gli endpoint, scope OAuth, flussi e fallback implementati.

    

    location / {## Bisogni chiave per la web app

        proxy_pass http://localhost:3000;

        proxy_http_version 1.1;- **Automazione listing**: connessione eBay/Amazon, creazione automatica listing, sincronizzazione prezzi e inventario.

        proxy_set_header Upgrade $http_upgrade;- **Gestione account**: visualizzazione dettagli utente, stato connessione, token, limiti, metriche venditore.

        proxy_set_header Connection 'upgrade';- **Sicurezza**: gestione token sicura, refresh automatico, logout, sessioni, compliance OAuth.

        proxy_set_header Host $host;- **Scalabilità**: architettura modulare (ApiClient, EventBus, Store), facile estensione per nuovi marketplace e API.

        proxy_set_header X-Real-IP $remote_addr;- **User experience**: feedback chiari, notifiche, errori gestiti, UI pulita e informativa.

        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;- **Documentazione**: README sempre aggiornato, commenti chiari, flussi ben descritti.

        proxy_set_header X-Forwarded-Proto $scheme;

    }## 🆕 Nuove Funzionalità v2.1.0 (12/10/2025)



    listen 443 ssl; # managed by Certbot### 1. Fee eBay Integrate

    ssl_certificate /etc/letsencrypt/live/shapiro.ninja/fullchain.pem;- ✅ **Calcolo Automatico**: Fee eBay calcolate automaticamente nella modale prodotto (FVF 5% fino a €2000 + 2% sopra, fee fissa €0.35, normativa 0.43%)

    ssl_certificate_key /etc/letsencrypt/live/shapiro.ninja/privkey.pem;- ✅ **Configurabile**: Fee % e fissa modificabili nella sezione Automazione della modale

}- ✅ **Profitto Live**: Ricalcolo automatico del profitto al cambio di prezzi o fee

```

### 2. Pagina Listing Completa

## 🛠️ Sviluppo- ✅ **Struttura**: Sidebar con cartelle (Non listato, eBay), tabella a destra con colonne Titolo/Prezzo Listing/Resell/Profitto/% Sponsor/Spedizione/Amazon/eBay/Azioni

- ✅ **Persistenza**: IndexedDB per salvare listings, import da Amazon con automazioni estratte

### Workflow Git- ✅ **Aggiornamento Prezzi**: Pulsante "Aggiorna prezzi" per sincronizzare da Amazon, con indicatori ↑/↓ per variazioni

- ✅ **Monitoraggio**: Pulsante "Avvia monitoraggio" per refresh automatico ogni 5 minuti

```powershell- ✅ **Selezione Multipla**: Checkbox per selezionare più righe, azioni bulk (elimina selezionati)

# Crea feature branch- ✅ **Listing eBay**: Pulsante "Lista" per creare listing su eBay (mock endpoint), aggiorna record con URL eBay

git checkout -b feature/nome-feature

### 3. Miglioramenti UX

# Sviluppa e committa- ✅ **Uniformità Estetica**: Stili dashboard applicati a tutte le pagine, navbar consistente

git add .- ✅ **Tabella Avanzata**: Sorting, paginazione, ricerca, accessibilità WAI-ARIA

git commit -m "feat: descrizione modifiche"- ✅ **E2E Validazione**: Test end-to-end per flussi completi (search → modal → import → table → refresh → list)



# Push e PR### 4. Backend e Sicurezza

git push origin feature/nome-feature- ✅ **Mock eBay API**: Endpoint POST /api/ebay/list per simulare listing in sandbox

```- ✅ **Caching Ottimizzato**: TTL configurabile, mapping robusto per tutti campi prodotto

- ✅ **Backup Sicurezza**: amazonService.bak.js per protezione logica

### Testing

### 5. Integrazione Ricerca Prodotti Unificata

```powershell- ✅ **Unificazione Interfacce**: Ricerca prodotti integrata direttamente in `listings.html`

# Test locale- ✅ **Eliminazione Pagina Separata**: Rimosso `products.html` ridondante

npm run dev- ✅ **Flusso Unificato**: Ricerca → Selezione → Import → Listing in un'unica pagina

- ✅ **Funzionalità Complete**: Filtri avanzati (paese, categoria, prezzo, ordinamento)

# Test produzione (dopo deploy)- ✅ **Modal Dettagli**: Popup completo con tabs Info/Automazione/Manuale

curl https://shapiro.ninja/api/health- ✅ **Responsive Design**: Layout adattivo per desktop e mobile

```

---

## 📚 Documentazione

## 🔄 Aggiornamento del 12/10/2025

- **Setup Ambiente**: [`SETUP.md`](./SETUP.md)

- **OAuth eBay**: `docs/EBAY_OAUTH_SETUP.md`### ✅ Modifiche completate oggi:

- **Deployment**: `DEPLOYMENT_ROADMAP.md`

#### 1. **Ristrutturazione Ricerca Prodotti**

## 🐛 Troubleshooting- ✅ **Spostata ricerca** da `listings.html` a `products.html` (come richiesto)

- ✅ **Multi-marketplace UI**: Supporto visuale per Amazon, Alibaba, eBay, Walmart, AliExpress

### Server non si avvia- ✅ **Filtri avanzati**: Paese, categoria, prezzo min/max, ordinamento

```powershell- ✅ **Badge dinamico**: Mostra marketplace e paese selezionati

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
