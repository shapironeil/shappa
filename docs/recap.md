# Recap Shappa — Documentazione Locale

Questa pagina riassume l'architettura locale di Shappa, gli endpoint principali, i flussi OAuth, le dipendenze esterne e i valori richiesti in `.env`.

## Panoramica progetto
- Server: `server.js` (Express)
- Frontend: `src/pages/*.html` (vanilla JS)
- Servizi esterni principali:
  - eBay OAuth (sandbox e production)
  - OpenWebNinja (dati Amazon)

## Link principali
- App locale: http://localhost:3000
- Dashboard: http://localhost:3000/src/pages/dashboard.html
- Products: http://localhost:3000/src/pages/products.html
- Listings: http://localhost:3000/src/pages/listings.html
- Settings (OAuth): http://localhost:3000/src/pages/settings.html

## API endpoints (server)
- GET /health — semplice health check
- GET /api/health — dettagli server
- GET /api/ebay/auth-url — genera l'URL di autorizzazione eBay (usa EBAY_REDIRECT_URI)
- GET /auth/ebay/callback — callback OAuth eBay che scambia il code per tokens
- POST /api/ebay/user-info — recupera info utente eBay (richiede access_token)
- POST /api/ebay/list — mock per creare un listing sandbox

- GET /api/amazon/search?q=... — cerca prodotti usando OpenWebNinja (o demo)
- GET /api/amazon/product/:asin — dettagli prodotto (OpenWebNinja)

## Flusso eBay OAuth (semplificato)
1. Frontend -> GET `/api/ebay/auth-url`
   - Server costruisce URL di autorizzazione usando `EBAY_AUTH_URL`, `EBAY_CLIENT_ID`, `EBAY_REDIRECT_URI`, `EBAY_SCOPES`.
   - Server genera uno stato casuale e lo memorizza in `sessions` Map.
2. Frontend apre la URL (popup) verso il dominio eBay sandbox/production.
3. eBay reindirizza a `/auth/ebay/callback?code=...&state=...`.
4. Server scambia `code` per `access_token` e `refresh_token` usando `EBAY_TOKEN_URL` con client credentials.
5. Server ritorna una pagina HTML che messaggia il parent window con i token ottenuti.

## OpenWebNinja (Amazon)
- Endpoint remoto: `https://app.openwebninja.com/api/real-time-amazon-data` (configurabile)
- API key: `OPENWEBNINJA_KEY`
- Parametri: query string con `q`, `country`, `page`, `limit` e opzioni (min_price, max_price, category)
- Risposta: array di prodotti con campi tipici (title, price, image, rating, asin, details, etc.)

## .env — valori fondamentali
Nei file di progetto `.env` trovi questi valori (NON committare file con segreti):

```
EBAY_CLIENT_ID=...
EBAY_CLIENT_SECRET=...
EBAY_DEV_ID=...
EBAY_RUNAME=...
EBAY_REDIRECT_URI=http://localhost:3000/auth/ebay/callback
EBAY_AUTH_URL=https://auth.sandbox.ebay.com/oauth2/authorize
EBAY_TOKEN_URL=https://api.sandbox.ebay.com/identity/v1/oauth2/token
EBAY_API_URL=https://api.sandbox.ebay.com
EBAY_SCOPES=...

OPENWEBNINJA_KEY=...
OPENWEBNINJA_COUNTRY=IT
OPENWEBNINJA_BASEURL=https://app.openwebninja.com/api/real-time-amazon-data

NODE_ENV=development
PORT=3000

ADMIN_TOKEN=...
```

- Nota: `.env` è stato aggiornato con le credenziali che mi hai fornito. Per sviluppo locale puoi creare `.env.local` con le chiavi attive.

## Consigli operativi
- Per debug locale, usiamo `http://localhost:3000` per evitare problemi con certificati self-signed.
- In produzione servire con HTTPS e assicurarsi che `EBAY_REDIRECT_URI` corrisponda esattamente alla configurazione nel portale eBay.
- Evitare di committare `.env` o `.env.local` in git.

## Script di test rapido
Vedi `scripts/api-commands.sh` per comandi utili (curl) per testare health, eBay auth url, e chiamate OpenWebNinja.

## Note su sicurezza
- Conserva i client secrets offline e usa variabili d'ambiente in hosting.
- Proteggi l'endpoint `/api/admin/clear-cache` con `ADMIN_TOKEN` solo per sviluppo.

---

Se vuoi, posso aggiungere estratti più dettagliati delle risposte OpenWebNinja o esempi di payload eBay (token exchange).