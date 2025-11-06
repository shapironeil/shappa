## Scraper Amazon & Monitor Prezzi (Playwright Only)

- `lib/scraper/amazonScraper.js`: utilizza Playwright (headless Chromium) per aprire la pagina prodotto Amazon ed estrarre dati completi (titolo, prezzo, immagini, dettagli, badge Prime, delivery, varianti) in modo proprietario, senza API esterne.
- `lib/services/priceMonitor.js`: servizio con node-cron che controlla periodicamente il prezzo usando lo scraper Playwright e notifica i cambi; predisposto per automazione eBay.

### Endpoint
- `GET /api/amazon/scrape?asin=<ASIN>&country=IT` oppure `GET /api/amazon/scrape?url=<URL>`: ritorna `product` con campi ricchi.
- `POST /api/monitor/add` body `{ asin, country }`: aggiunge monitoraggio per un ASIN.
- `POST /api/monitor/remove` body `{ asin }`: rimuove monitoraggio.
- `GET /api/monitor/list`: elenca monitor attivi.

### Requisiti
- Dipendenze: `playwright`, `node-cron`.
- Variabili: Nessuna chiave API esterna richiesta per lo scraping; configurare solo parametri interni (es. country).

### Note
- Il monitor gira ogni 30 minuti (configurabile) e può essere portato lato server per un comportamento umano (futuro).
- Lo scraper è on-demand e usa un profilo/stile che emula la navigazione umana su Amazon per evitare di essere identificati come bot.
# Shappa - Product Search (Playwright Proprietario)

Backend e frontend usano uno scraper Playwright proprietario per ottenere i dati da Amazon senza servizi esterni.

Funzionalità principali:
- Scraping Playwright proprietario (server-side) — sostituisce OpenWebNinja e SerpApi
- Caching in-memory opzionale per dettagli prodotto
- Modale dettaglio con galleria immagini e tabs (Info / Automazione)
- Dati prodotto completi e aggiornati
- Dockerfile e suggerimenti deploy

Variabili ambiente
- AMAZON_COUNTRY - default country (IT)
- PORT - server port (default 3000)
- AMAZON_CACHE_TTL - cache TTL in seconds (default 90)

eBay OAuth (important)
- eBay requires a secure (https) redirect URI for OAuth callbacks in many environments. For local development, use `https://localhost:3000/auth/ebay/callback` and ensure your local certificate is trusted (e.g., with mkcert). If you use `http://localhost:3000` eBay OAuth may fail during token exchange.

Local run
1. Install dependencies: `npm install`
2. Create a `.env` file with the variables above (do not commit the key)
3. Start server: `node server.js`

Docker
1. Build: `docker build -t shappa .`
2. Run: `docker run -p 3000:3000 shappa`

Important
- Il file `lib/scraper/amazonScraper.js` contiene la logica di scraping e mapping. Aggiornare la documentazione quando si modifica l’estrazione dati.
# 📋 Stato Aggiornato (09/10/2025 - ore 20:45)

## 🚀 Nuove Funzionalità v2.0.1

### 1. Navbar Universale - Click Nickname da Qualsiasi Pagina
- ✅ **Click Universale**: Ora il click su nickname/avatar funziona da **TUTTE le pagine** (Dashboard, Settings, Admin, ecc.)
- ✅ **Smart Redirect**: 
  - Se sei in Settings → switcha direttamente alla tab Account
  - Se sei in altre pagine → redirect a Settings → Account
- ✅ **Deep Linking**: Supporto per URL diretto `settings.html#account`
- ✅ **Codice Centralizzato**: Nuovo file `src/utils/navbar-universal.js` per gestire tutto in modo DRY

### 2. Gestione Errori OAuth Migliorata
- ✅ **Messaggio User-Friendly**: Se chiudi la finestra OAuth, ora vedi "ℹ️ Connessione annullata. Clicca su 'Connetti eBay' per riprovare." invece di un errore generico
- ✅ **Notifica Info**: Colore blu (info) invece di rosso (error) per indicare che è solo un'azione annullata
- ✅ **UX Migliorata**: L'utente capisce immediatamente che può riprovare senza problemi

**Documentazione completa**: [`docs/CHANGELOG_NAVBAR_UNIVERSAL.md`](docs/CHANGELOG_NAVBAR_UNIVERSAL.md)

## 🎯 Miglioramenti UX Precedenti

### Click sul Nickname → Redirect alla Scheda Account
- ✅ **Nickname e Avatar Cliccabili**: Ora cliccando sul tuo nickname o avatar nella navbar, vieni automaticamente reindirizzato alla scheda "Account" nelle impostazioni
- ✅ **Hover Effects**: Effetti visivi al passaggio del mouse per indicare che sono elementi cliccabili
- ✅ **Transizioni Smooth**: Animazioni fluide per un'esperienza utente premium

### Formato User ID eBay Migliorato
- ✅ **Display Name**: Ora mostra `nickname (Nome Cognome)` invece di "eBay User"
- ✅ **Email Sottostante**: Visualizzazione dell'email associata sotto il nome utente
- ✅ **Informazioni Complete**: Massima visibilità dei dati dell'account connesso

### Sistema di Scadenza Token Migliorato
- ✅ **Messaggi Chiari**: Ora il sistema spiega chiaramente cosa significa "Token scade tra X ore"
- ✅ **Indicatori Visivi**: 
  - ✅ Verde = Token valido (> 1 giorno)
  - ⚠️ Giallo = Token in scadenza (< 24 ore, rinnovo imminente)
  - ⏱️ Arancione = Rinnovo in corso (< 1 ora)
  - ❌ Rosso = Token scaduto (rinnovo automatico attivo)
- ✅ **Testo Esplicativo**: Ogni stato mostra un messaggio che spiega che il rinnovo è automatico
- ✅ **Documentazione Completa**: Creato `docs/TOKEN_REFRESH_EXPLANATION.md` con FAQ dettagliate

# Shappa - Stato Sviluppo eBay OAuth & Account Integration

## Scopes OAuth eBay (Produzione)

Per garantire massima flessibilità futura, il backend richiede ora per default un set esteso di scopes eBay al momento del login (FULL_SCOPES), che include:

- https://api.ebay.com/oauth/api_scope
- https://api.ebay.com/oauth/api_scope/commerce.identity.readonly
- https://api.ebay.com/oauth/api_scope/commerce.catalog.readonly
- https://api.ebay.com/oauth/api_scope/commerce.notification.subscription
- https://api.ebay.com/oauth/api_scope/sell.inventory (+ readonly)
- https://api.ebay.com/oauth/api_scope/sell.account (+ readonly)
- https://api.ebay.com/oauth/api_scope/sell.fulfillment (+ readonly)
- https://api.ebay.com/oauth/api_scope/sell.marketing (+ readonly)
- https://api.ebay.com/oauth/api_scope/sell.analytics.readonly
- https://api.ebay.com/oauth/api_scope/sell.finances
- https://api.ebay.com/oauth/api_scope/sell.payment.dispute
- https://api.ebay.com/oauth/api_scope/buy.shopping.cart
- https://api.ebay.com/oauth/api_scope/buy.deal.readonly
- https://api.ebay.com/oauth/api_scope/buy.marketing.readonly
- https://api.ebay.com/oauth/api_scope/buy.browse
- https://api.ebay.com/oauth/api_scope/buy.offer.auction
- https://api.ebay.com/oauth/api_scope/buy.order.readonly
- https://api.ebay.com/oauth/api_scope/buy.product.summary
- https://api.ebay.com/oauth/api_scope/buy.product.conclusion

Nota: puoi ridurre gli scopes impostando la variabile d'ambiente `EBAY_SCOPES` (spazio-separati); il sistema unirà comunque i tuoi scopes con quelli di default evitando duplicati.

### Re-consent necessario

Se hai effettuato la connessione eBay in precedenza con scopes più limitati, per ottenere accesso ai nuovi permessi (es. Identity) devi:

1. Disconnettere in Settings (o revocare l'app da eBay → Account → Security → Third-party apps)
2. Cliccare “Connetti eBay” e completare nuovamente il consenso

### Gestione errori profilo

La chiamata `/api/ebay/profile` risponde con `403 insufficient_scope` se l'account non ha concesso i permessi necessari (es. manca `commerce.identity.readonly`). In tal caso la UI mostra una CTA per aggiornare i permessi rifacendo il login eBay.

## Stato attuale

- **eBay OAuth 2.0 Sandbox** integrato con tutti gli scope necessari (identity, account, analytics, reputation, finances, ecc.).
- **Flusso di login**: popup OAuth, ricezione token, salvataggio access/refresh token, auto-refresh ogni 30 minuti.
- **Recupero dati utente**: chiamata a `/api/ebay/user-info` backend che interroga l'Identity API. In sandbox, i dati sono limitati (nickname, nome, cognome, email spesso nulli).
- **Card eBay Seller Hub**: mostra stato connessione, userId, data connessione, scadenza token, bottone info ⓘ con popup dettagli.
- **Visualizzazione intelligente**: se nickname/nome/cognome non disponibili, mostra almeno userId. Nel popup info, nota "sandbox: dati limitati" se i dati sono null.
- **Architettura frontend**: ApiClient centralizzato, SettingsManager, EventBus, Store. Tutte le chiamate eBay passano da ApiClient.
- **Gestione errori**: fallback automatico su dati minimi, notifiche user-friendly, log dettagliati per debug.
- **UI**: nessuna modifica estetica, solo miglioramenti funzionali e informativi.

## Limitazioni attuali

- In **sandbox** non è possibile ottenere dati utente reali (nickname, nome, cognome, email) tramite Identity API. In produzione, con account reale e scope corretti, i dati saranno disponibili.
- La card e il popup info mostrano sempre almeno userId. Se i dati sono null, viene visualizzato un messaggio di avviso.
- Il backend logga ogni chiamata eBay e fallback.

## Prossimi step (priorità per domani)

1. **Testare in produzione** (quando pronto): verificare che nickname, nome, cognome, email siano valorizzati e visualizzati correttamente.
2. **Estendere la raccolta dati**:
   - Integrare chiamate alle API eBay Sell Account (privilegi, business policies, limiti, seller standards, reputation, finances) e mostrare nel popup info.
   - Mostrare anche metriche di venditore, limiti, stato account, eventuali warning.
3. **Gestione multi-marketplace**:
   - Supportare account eBay su più marketplace (IT, DE, FR, UK, US) e visualizzare le policy per ciascuno.
4. **Persistenza e sicurezza**:
   - Migliorare la persistenza dei token e dati utente (migrazione da localStorage a backend/DB sicuro).
   - Gestire logout, revoca token, sessioni attive.
5. **Esperienza utente**:
   - Migliorare le notifiche e i messaggi di stato (es. "sandbox: dati limitati", "token scaduto, login richiesto", ecc.).
   - Aggiungere loader e feedback visivi per tutte le azioni.
6. **Compliance e aggiornamenti 2025**:
   - Gestire la transizione da username a userId per utenti US (dal 26 settembre 2025).
   - Documentare nel codice e nel README le differenze tra sandbox e produzione.
7. **Documentazione e onboarding**:
   - Aggiornare README e commenti in codice per facilitare la ripresa lavori.
   - Elencare tutti gli endpoint, scope OAuth, flussi e fallback implementati.

## Bisogni chiave per la web app

- **Automazione listing**: connessione eBay/Amazon, creazione automatica listing, sincronizzazione prezzi e inventario.
- **Gestione account**: visualizzazione dettagli utente, stato connessione, token, limiti, metriche venditore.
- **Sicurezza**: gestione token sicura, refresh automatico, logout, sessioni, compliance OAuth.
- **Scalabilità**: architettura modulare (ApiClient, EventBus, Store), facile estensione per nuovi marketplace e API.
- **User experience**: feedback chiari, notifiche, errori gestiti, UI pulita e informativa.
- **Documentazione**: README sempre aggiornato, commenti chiari, flussi ben descritti.

## 🆕 Nuove Funzionalità v2.1.0 (12/10/2025)

### 1. Fee eBay Integrate
- ✅ **Calcolo Automatico**: Fee eBay calcolate automaticamente nella modale prodotto (FVF 5% fino a €2000 + 2% sopra, fee fissa €0.35, normativa 0.43%)
- ✅ **Configurabile**: Fee % e fissa modificabili nella sezione Automazione della modale
- ✅ **Profitto Live**: Ricalcolo automatico del profitto al cambio di prezzi o fee

### 2. Pagina Listing Completa
- ✅ **Struttura**: Sidebar con cartelle (Non listato, eBay), tabella a destra con colonne Titolo/Prezzo Listing/Resell/Profitto/% Sponsor/Spedizione/Amazon/eBay/Azioni
- ✅ **Persistenza**: IndexedDB per salvare listings, import da Amazon con automazioni estratte
- ✅ **Aggiornamento Prezzi**: Pulsante "Aggiorna prezzi" per sincronizzare da Amazon, con indicatori ↑/↓ per variazioni
- ✅ **Monitoraggio**: Pulsante "Avvia monitoraggio" per refresh automatico ogni 5 minuti
- ✅ **Selezione Multipla**: Checkbox per selezionare più righe, azioni bulk (elimina selezionati)
- ✅ **Listing eBay**: Pulsante "Lista" per creare listing su eBay (mock endpoint), aggiorna record con URL eBay

### 3. Miglioramenti UX
- ✅ **Uniformità Estetica**: Stili dashboard applicati a tutte le pagine, navbar consistente
- ✅ **Tabella Avanzata**: Sorting, paginazione, ricerca, accessibilità WAI-ARIA
- ✅ **E2E Validazione**: Test end-to-end per flussi completi (search → modal → import → table → refresh → list)

### 4. Backend e Sicurezza
- ✅ **Mock eBay API**: Endpoint POST /api/ebay/list per simulare listing in sandbox
- ✅ **Caching Ottimizzato**: TTL configurabile, mapping robusto per tutti campi prodotto
- ✅ **Backup Sicurezza**: amazonService.bak.js per protezione logica

### 5. Integrazione Ricerca Prodotti Unificata
- ✅ **Unificazione Interfacce**: Ricerca prodotti integrata direttamente in `listings.html`
- ✅ **Eliminazione Pagina Separata**: Rimosso `products.html` ridondante
- ✅ **Flusso Unificato**: Ricerca → Selezione → Import → Listing in un'unica pagina
- ✅ **Funzionalità Complete**: Filtri avanzati (paese, categoria, prezzo, ordinamento)
- ✅ **Modal Dettagli**: Popup completo con tabs Info/Automazione/Manuale
- ✅ **Responsive Design**: Layout adattivo per desktop e mobile

---

## 🔄 Aggiornamento del 12/10/2025

### ✅ Modifiche completate oggi:

#### 1. **Ristrutturazione Ricerca Prodotti**
- ✅ **Spostata ricerca** da `listings.html` a `products.html` (come richiesto)
- ✅ **Multi-marketplace UI**: Supporto visuale per Amazon, Alibaba, eBay, Walmart, AliExpress
- ✅ **Filtri avanzati**: Paese, categoria, prezzo min/max, ordinamento
- ✅ **Badge dinamico**: Mostra marketplace e paese selezionati

#### 2. **eBay OAuth Verificato**
- ✅ **Sistema OAuth funzionante**: Testato su `https://localhost:3000/test-oauth.html`
- ✅ **Settings integrati**: Login eBay disponibile in `https://localhost:3000/src/pages/settings.html`
- ✅ **Documentazione completa**: Vedi `EBAY_OAUTH_SETUP.md` e `test-oauth.html`

#### 3. **Dettagli Prodotti OpenWebNinja**
- ✅ **API Integration**: Usa `/api/amazon/product/{asin}` per dettagli completi
- ✅ **Modal ricco**: Galleria immagini, badge, rating, recensioni, link Amazon
- ✅ **Fallback robusto**: Gestisce errori API con dati di ricerca base

#### 4. **Separazione Funzionalità**
- ✅ **products.html**: Motore ricerca multi-marketplace dedicato
- ✅ **listings.html**: Gestione listing pulita, senza ricerca integrata
- ✅ **Navigation fix**: Link corretti tra le pagine

### 🎯 Funzionalità Disponibili:

1. **Ricerca Multi-Marketplace** (`/src/pages/products.html`)
   - 🛒 Amazon (attivo), 🏭 Alibaba, 📦 eBay, 🏪 Walmart, 📱 AliExpress (Coming Soon)
   - Filtri: Paese, categoria, prezzo, ordinamento
   - Dettagli completi via OpenWebNinja API

2. **eBay OAuth** (`/src/pages/settings.html`)
   - Sistema OAuth 2.0 completo e testato
   - Gestione token e refresh automatico
   - Test page dedicata: `/test-oauth.html`

3. **Listing Management** (`/src/pages/listings.html`)
   - Focalizzato solo su gestione prodotti importati
   - Import da localStorage dei risultati ricerca
   - Calcolo profitti e monitoraggio prezzi

### 🚀 Next Steps:
- Implementazione API per Alibaba/eBay/Walmart quando disponibili
- Ottimizzazione performance ricerca
- Dashboard analytics migliorata

---

## ⚠️ eBay OAuth Sandbox: Configurazione Critica

Questa configurazione è validata e funzionante per lo sviluppo locale con eBay Sandbox.

**NON MODIFICARE** i parametri eBay in `.env.local` e `.env` (Client ID, RuName, redirect, scopes, ecc.) salvo passaggio a produzione.

Per dettagli e backup, vedi `docs/ebay-oauth-checkpoint.md`.

Se devi andare online/produzione, crea una nuova configurazione e aggiorna solo dopo test e backup.

---

## 🔐 Protezione Pagine Private (Login Obbligatorio)

Le pagine applicative core ora richiedono obbligatoriamente che l'utente sia autenticato. Protezione attiva su:
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
