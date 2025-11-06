# Shappa - WORKFLOW (online-first, no local runtime storage)

Ultimo aggiornamento: 6 novembre 2025

Obiettivo: tutto il runtime e i dati dell'app devono essere conservati online (DB, object storage, cache). Nessun secret o dati runtime salvati localmente sul client.

## Flusso utente (UI)

1. Login (autenticazione via sessione sul server)
2. Dashboard (più pagine)

Pagina: Ricerca prodotti
- L'utente inserisce una ricerca e carica la pagina del prodotto Amazon.
- L'app mostra anteprime, immagini e metadati.
- Se l'utente clicca "Salva listing":
  - L'app invia il metadata al server (title, description, attributes, price, immagini URLs remote o presigned URLs) e riceve un record ID.
  - Le immagini non vengono salvate nel browser; vengono caricate direttamente dallo scraper/worker a Object Storage (DigitalOcean Spaces o S3) dal server.

Pagina: Listings
- Mostra tutti i listing (bozze + online su eBay).
- Stato di ogni listing: `draft`, `queued`, `uploading`, `listed`, `error`.
- L'utente può modificare dati e immagini prima del publish.

Azione: List
- Quando l'utente preme "List":
  - Il server valida il listing, prepara payload e mette il job in coda (Redis/DB job queue).
  - Un worker prende il job, esegue l'upload su eBay tramite API, aggiorna lo stato nel DB (listed / error) e registra l'ID eBay.

Monitoraggio
- Ogni listing (sia draft che listed) è monitorato da un worker periodico che:
  - Controlla il prezzo/stock sui siti sorgente (es. Amazon) e su eBay
  - Se necessario, crea job per aggiornare prezzo/quantità su eBay via API
  - Salva eventi importanti nel DB (collection `events`) per audit/history

## Scelte di storage (online-first)

1) Metadati e runtime data -> MongoDB Atlas
- Collezioni consigliate:
  - `listings` (metadata, images URLs, state, ebay_id, timestamps)
  - `jobs` (queue state for retries) — opzionale se usi Redis
  - `events` (history, price changes, errors)
  - `temp_results` (dati effimeri con TTL)
- Strategie:
  - Usa un TTL index per `temp_results` (es. expireAfterSeconds = 3600 o 86400) se i risultati vanno conservati temporaneamente.
  - Non salvare immagini nel DB.

2) Images -> Object storage (DigitalOcean Spaces o AWS S3)
- Scelta obbligata per migliaia di immagini HD.
- Vantaggi:
  - Costi e scalabilità migliori
  - CDN e access control
  - Non ingombrano il DB
- Workflow immagini:
  - Lo scraper/worker scarica immagini Amazon, applica watermark/logo localmente sul server (non sul client), carica file su Spaces, salva URL nel `listings`.
  - Considera di generare thumbnails e versioni ottimizzate.

3) Coda / buffer -> Redis (consigliato a volume alto)
- Se prevedi molti job concorrenti (upload, monitor, price updates) usa Redis + BullMQ o Bee-Queue.
- Redis funge anche da cache per dati ad alta frequenza.

4) Secrets e runtime configs -> GitHub Secrets + server env
- Non salvare i segreti sul client.
- Per CI/CD: aggiungi su GitHub repo Secrets: `SSH_PRIVATE_KEY`, `SPACES_KEY`, `SPACES_SECRET`, `MONGODB_URI`, `EBAY_CLIENT_ID`, `EBAY_CLIENT_SECRET`, `TELEGRAM_TOKEN`, ecc.
- Sul server: esporta gli env vars (systemd unit, PM2 ecosystem file o `.env` sul server) ma non su repo.

## Politiche dati e lifecycle

- Immagini: mantieni in object storage; pulisci versioni vecchie con job di retention se necessario.
- Listing temporanei: usa TTL su `temp_results` per rimozione automatica.
- Eventi importanti: mantienili (no TTL) per auditing e analisi.
- Stato: usa transizioni chiare `draft -> queued -> uploading -> listed -> archived`.

## Scalabilità e costi

- Per migliaia di prodotti con immagini HD valuta: object storage + CDN. Il DB M0 va bene per iniziare, ma potresti migrare a cluster più grandi se la mole cresce.
- Redis può essere aggiunto quando la concurrency aumenta.

## Sicurezza e privacy

- Tutti i segreti SOLO su GitHub Secrets (CI) e env del server.
- HTTPS obbligatorio (Nginx + Certbot).
- Access control (autenticazione, ruoli) per la dashboard.

## Cosa devo ricevere da te per procedere (lista minima)

- Conferma: vuoi usare MongoDB Atlas M0 + DigitalOcean Spaces? (sì/no)
- MongoDB connection string (oppure l'autorizzi ad aggiungerla come GitHub Secret?)
- DigitalOcean Spaces access key + secret (meglio: aggiungi come GitHub Secret tu stesso o dammi via canale sicuro)
- Telegram token/chat id (se vuoi notifiche)

Se non vuoi condividere segreti qui, posso darti i passi e i comandi per aggiungerli tu nelle rispettive interfacce (GitHub / DigitalOcean / MongoDB).

## Comandi utili (per aggiungere secrets su GitHub via `gh` CLI)

Esempio (PowerShell):

```powershell
# Imposta MONGODB_URI come secret
gh secret set MONGODB_URI --body "mongodb+srv://username:password@cluster.mongodb.net/shappa" --repo shapironeil/shappa

# Imposta SPACES keys
gh secret set SPACES_KEY --body "AKIA..." --repo shapironeil/shappa
gh secret set SPACES_SECRET --body "..." --repo shapironeil/shappa
```

Oppure usa GitHub -> Settings -> Secrets -> Actions -> New repository secret (interfaccia web).

## Note finali

- Tutto ciò che riguarda credenziali rimane online. Non salverò mai segreti localmente senza esplicita autorizzazione.
- Se mi dai l'ok per le scelte (MongoDB Atlas + Spaces) procedo con i passaggi successivi e ti fornisco istruzioni precise per aggiungere i secrets e per eseguire lo script di setup sul droplet.

---

Sei d'accordo con questo workflow online-first? Quale delle due opzioni per il buffer temporaneo preferisci: `Redis` (migliore per performance) o `MongoDB+TTL` (più semplice e gratis per iniziare)?