# 📄 Pages Registry - Registry Completo Pagine e API

**Ultimo aggiornamento:** Gennaio 2025  
**Scopo:** Mappare tutte le pagine, le loro API endpoint, i dati memorizzati e le relazioni

---

## 📋 Indice Pagine

### Pagine Principali
1. [Dashboard](#dashboard)
2. [Sport & Fitness](#sport--fitness)
3. [Dieta](#dieta)
4. [Calendario](#calendario)
5. [Interessi](#interessi)
6. [Settings](#settings)
7. [Admin](#admin)

### Pagine Secondarie
8. [Products](#products)
9. [Listings](#listings)
10. [Ricerca](#ricerca)
11. [Monitored](#monitored)
12. [Obiettivi](#obiettivi)
13. [Progetti](#progetti)
14. [Reports](#reports)
15. [User Profile](#user-profile)

---

## 🏠 Dashboard

**File:** `src/pages/dashboard.html`  
**Path URL:** `/src/pages/dashboard.html`  
**Descrizione:** Dashboard principale con overview di tutte le sezioni

### API Endpoints Utilizzati
- `GET /api/auth/user/:userId` - Profilo utente
- `GET /api/sport/profile/:userId` - Profilo sportivo (se disponibile)
- `GET /api/interests/:userId` - Interessi utente (se disponibili)

### Dati Memorizzati
- Nessun dato diretto (usa dati da altre pagine)

### Relazioni
- Collegata a tutte le altre pagine tramite sidebar
- Mostra dati aggregati da altre sezioni

### Stato Integrazione
- ✅ Completa
- ✅ Design System Venus applicato
- ✅ Navbar universale integrata

---

## 💪 Sport & Fitness

**File:** `src/pages/sport.html` + `src/pages/sport-app.js`  
**Path URL:** `/src/pages/sport.html`  
**Descrizione:** Gestione workout, programmi allenamento, statistiche fitness

### API Endpoints Utilizzati
- `GET /api/sport/profile/:userId` - Ottieni profilo sportivo
- `POST /api/sport/profile` - Salva profilo sportivo
- `GET /api/sport/program/:userId` - Ottieni programma allenamento
- `POST /api/sport/program` - Salva programma allenamento
- `GET /api/sport/stats/:userId` - Statistiche workout
- `GET /api/sport/stats` - Statistiche globali

### Dati Memorizzati
**File:** `data/sport/profiles/[userId].json`
```json
{
  "userId": "user_xxx",
  "birthdate": "1995-03-15",
  "height": 175,
  "weight": 70,
  "frequency": 3,
  "sports": ["palestra", "cardio"],
  "updatedAt": "2025-01-XX"
}
```

**File:** `data/sport/programs/[userId].json`
```json
{
  "userId": "user_xxx",
  "selectedProgramId": "program_xxx",
  "programs": [...],
  "updatedAt": "2025-01-XX"
}
```

**File:** `data/sport/stats/[userId].json`
```json
{
  "userId": "user_xxx",
  "workouts": [...],
  "stats": {...},
  "updatedAt": "2025-01-XX"
}
```

### Relazioni
- Collegata a Settings per automazioni sport
- Dati utilizzati da Dashboard per overview

### Stato Integrazione
- ✅ Completa
- ✅ Programmi workout integrati
- ✅ Statistiche funzionanti
- ✅ Visual feedback per programma selezionato

---

## 🥗 Dieta

**File:** `src/pages/dieta.html`  
**Path URL:** `/src/pages/dieta.html`  
**Descrizione:** Gestione dieta, ricette, obiettivi nutrizionali

### API Endpoints Utilizzati
- `POST /api/recipes/search` - Cerca ricette
- `POST /api/recipes/fetch` - Ottieni ricetta completa
- (Altri endpoint dieta da verificare)

### Dati Memorizzati
- Ricette salvate (struttura da verificare)
- Obiettivi nutrizionali (struttura da verificare)

### Relazioni
- Collegata a Settings per automazioni dieta
- Potenzialmente collegata a Calendario per pasti programmati

### Stato Integrazione
- 🔄 Parziale (da completare)
- ✅ Ricerca ricette funzionante
- ⚠️ Memorizzazione dati da verificare

---

## 📅 Calendario

**File:** `src/pages/calendario.html`  
**Path URL:** `/src/pages/calendario.html`  
**Descrizione:** Calendario eventi, promemoria, appuntamenti

### API Endpoints Utilizzati
- (Endpoint calendario da verificare)

### Dati Memorizzati
- Eventi utente (struttura da verificare)

### Relazioni
- Potenzialmente collegata a Sport per workout programmati
- Potenzialmente collegata a Dieta per pasti programmati

### Stato Integrazione
- 🔄 Parziale (da verificare)

---

## 🔍 Interessi

**File:** `src/pages/interessi.html`  
**Path URL:** `/src/pages/interessi.html`  
**Descrizione:** Gestione interessi prodotti, monitoraggio disponibilità

### API Endpoints Utilizzati
- `GET /api/interests/:userId` - Ottieni interessi utente
- `POST /api/interests/save` - Salva interessi
- `DELETE /api/interests/:userId` - Elimina interessi
- `POST /api/monitor/start` - Avvia monitor
- `POST /api/monitor/stop` - Ferma monitor

### Dati Memorizzati
**File:** `data/interests/[userId].json`
```json
{
  "userId": "user_xxx",
  "interests": [
    {
      "id": "interest_xxx",
      "name": "Prodotto X",
      "url": "https://...",
      "monitored": true,
      "createdAt": "2025-01-XX"
    }
  ],
  "updatedAt": "2025-01-XX"
}
```

### Relazioni
- Collegata a Monitor per tracking prodotti
- Collegata a Settings per notifiche Discord
- Collegata a Monitored per visualizzazione prodotti monitorati

### Stato Integrazione
- ✅ Completa
- ✅ Monitoraggio funzionante
- ✅ Notifiche Discord integrate

---

## ⚙️ Settings

**File:** `src/pages/settings.html`  
**Path URL:** `/src/pages/settings.html`  
**Descrizione:** Impostazioni utente, webhooks Discord, automazioni, integrazioni

### API Endpoints Utilizzati
- `GET /api/webhooks/:userId` - Ottieni webhook (multi-pagina)
- `POST /api/webhooks/:userId` - Salva webhook (con parametro `page`)
- `POST /api/automations/sport` - Salva automazioni sport
- `GET /api/automations/sport/:userId` - Ottieni automazioni sport
- `POST /api/automations/habits` - Salva automazioni abitudini
- `GET /api/automations/habits/:userId` - Ottieni automazioni abitudini
- `GET /api/ebay/auth-url` - URL autorizzazione eBay
- `GET /api/ebay/status` - Status connessione eBay
- `POST /api/ebay/disconnect` - Disconnetti eBay
- `GET /api/ebay/token-info` - Info token eBay
- `GET /api/ebay/profile` - Profilo eBay
- `POST /api/automations/notifications/:userId` - Salva impostazioni notifiche
- `GET /api/automations/notifications/:userId` - Ottieni impostazioni notifiche

### Dati Memorizzati
**File:** `data/webhooks/[userId].json`
```json
{
  "userId": "user_xxx",
  "webhooks": {
    "sport": {
      "url": "https://discord.com/api/webhooks/...",
      "updatedAt": "2025-01-XX"
    },
    "dieta": {...},
    "calendario": {...},
    "interessi": {...},
    "generale": {...}
  },
  "default": "https://discord.com/api/webhooks/...",
  "updatedAt": "2025-01-XX"
}
```

**File:** `data/automations/[userId].json`
```json
{
  "userId": "user_xxx",
  "sport": {...},
  "habits": {...},
  "notifications": {
    "notifyMonitorProducts": true,
    "notifyWorkouts": true,
    "notifyHabits": true,
    "notifyEbay": false,
    "frequency": "realtime"
  },
  "updatedAt": "2025-01-XX"
}
```

### Relazioni
- Collegata a tutte le pagine per configurazione webhook
- Collegata a Sport per automazioni
- Collegata a Interessi per notifiche monitor
- Collegata a eBay per integrazione vendite

### Stato Integrazione
- ✅ Completa
- ✅ Webhook multi-pagina funzionante
- ✅ Automazioni integrate
- ✅ Integrazione eBay OAuth funzionante

---

## 👨‍💼 Admin

### Admin Users
**File:** `src/pages/admin-users.html`  
**Path URL:** `/src/pages/admin-users.html`  
**Descrizione:** Pannello amministrativo per gestione utenti

### API Endpoints Utilizzati
- `GET /api/admin/server-data` - Dati server
- `GET /api/admin/user-data/:userId` - Dati utente completo

### Dati Memorizzati
- Nessun dato diretto (visualizza dati utenti)

### Stato Integrazione
- ✅ Completa

### Admin Server
**File:** `src/pages/admin-server.html`  
**Path URL:** `/src/pages/admin-server.html`  
**Descrizione:** Pannello amministrativo per gestione server e agenti

### API Endpoints Utilizzati
- `GET /api/admin/user-data/:userId` - Dati utente
- `GET /api/admin/server-data` - Dati server
- `GET /api/sport/profiles/all` - Tutti i profili sport
- `GET /api/agents/stats` - Statistiche agenti
- `GET /api/agents/agent/:agentName` - Info agente specifico
- `POST /api/admin/user/:userId` - Aggiorna utente
- `POST /api/monitors/stop/:interestId` - Ferma monitor specifico
- `POST /api/monitors/stop-all` - Ferma tutti i monitor

### Dati Memorizzati
- Nessun dato diretto (gestisce dati server)

### Stato Integrazione
- ✅ Completa
- ✅ Visualizzazione dati utenti completa
- ✅ Gestione agenti integrata

---

## 📦 Products

**File:** `src/pages/products.html`  
**Path URL:** `/src/pages/products.html`  
**Descrizione:** Gestione prodotti salvati, ricerca Amazon

### API Endpoints Utilizzati
- `GET /api/amazon/search` - Cerca prodotti Amazon
- `GET /api/products/saved` - Prodotti salvati
- `POST /api/products/save` - Salva prodotto
- `DELETE /api/products/saved/:asin` - Elimina prodotto

### Dati Memorizzati
- Prodotti salvati (struttura da verificare)

### Relazioni
- Collegata a Ricerca per ricerca prodotti
- Collegata a Listings per creazione listing eBay

### Stato Integrazione
- ✅ Completa

---

## 📋 Listings

**File:** `src/pages/listings.html`  
**Path URL:** `/src/pages/listings.html`  
**Descrizione:** Gestione listing eBay, bozze, pubblicazioni

### API Endpoints Utilizzati
- `GET /api/ebay/listings` - Lista tutti i listing
- `POST /api/ebay/create-listing` - Crea listing
- `POST /api/ebay/publish` - Pubblica listing
- `POST /api/ebay/listings/:id/end` - Termina listing

### Dati Memorizzati
- Listing eBay (struttura da verificare)

### Relazioni
- Collegata a Products per creazione listing da prodotti
- Collegata a eBay per pubblicazione

### Stato Integrazione
- ✅ Completa

---

## 🔎 Ricerca

**File:** `src/pages/ricerca.html`  
**Path URL:** `/src/pages/ricerca.html`  
**Descrizione:** Ricerca prodotti Amazon, scraping, anteprime

### API Endpoints Utilizzati
- `GET /api/amazon/search` - Cerca prodotti
- `GET /api/amazon/scrape` - Scraping Playwright
- `GET /api/amazon/product/:asin` - Dettagli prodotto

### Dati Memorizzati
- Risultati ricerca temporanei (non persistiti)

### Relazioni
- Collegata a Products per salvataggio prodotti
- Collegata a Listings per creazione listing

### Stato Integrazione
- ✅ Completa

---

## 👁️ Monitored

**File:** `src/pages/monitored.html`  
**Path URL:** `/src/pages/monitored.html`  
**Descrizione:** Visualizzazione prodotti monitorati, stato disponibilità

### API Endpoints Utilizzati
- `GET /api/monitor/list` - Lista monitor attivi
- `GET /api/monitor/status` - Status monitor globale

### Dati Memorizzati
- Dati monitor (gestiti da MonitorManager)

### Relazioni
- Collegata a Interessi per prodotti monitorati
- Collegata a Settings per notifiche

### Stato Integrazione
- ✅ Completa

---

## 🎯 Obiettivi

**File:** `src/pages/obiettivi.html`  
**Path URL:** `/src/pages/obiettivi.html`  
**Descrizione:** Gestione obiettivi personali, tracking progresso

### API Endpoints Utilizzati
- (Endpoint obiettivi da verificare)

### Dati Memorizzati
- Obiettivi utente (struttura da verificare)

### Relazioni
- Potenzialmente collegata a Sport per obiettivi fitness
- Potenzialmente collegata a Dieta per obiettivi nutrizionali

### Stato Integrazione
- 🔄 Parziale (da verificare)

---

## 📊 Progetti

**File:** `src/pages/progetti.html`  
**Path URL:** `/src/pages/progetti.html`  
**Descrizione:** Gestione progetti personali

### API Endpoints Utilizzati
- (Endpoint progetti da verificare)

### Dati Memorizzati
- Progetti utente (struttura da verificare)

### Relazioni
- (Relazioni da verificare)

### Stato Integrazione
- 🔄 Parziale (da verificare)

---

## 📈 Reports

**File:** `src/pages/reports.html`  
**Path URL:** `/src/pages/reports.html`  
**Descrizione:** Report e analisi dati

### API Endpoints Utilizzati
- (Endpoint reports da verificare)

### Dati Memorizzati
- Report generati (struttura da verificare)

### Relazioni
- Potenzialmente collegata a tutte le sezioni per dati aggregati

### Stato Integrazione
- 🔄 Parziale (da verificare)

---

## 👤 User Profile

**File:** `src/pages/user-profile.html`  
**Path URL:** `/src/pages/user-profile.html`  
**Descrizione:** Profilo utente, informazioni personali

### API Endpoints Utilizzati
- `GET /api/admin/user-data/:userId` - Dati utente completo
- `PUT /api/auth/user/:userId` - Aggiorna profilo

### Dati Memorizzati
- Profilo utente (gestito da sistema autenticazione)

### Relazioni
- Collegata a tutte le sezioni per dati utente

### Stato Integrazione
- ✅ Completa

---

## 🔗 Mappa Relazioni Pagine

```
Dashboard (hub centrale)
├── Sport & Fitness
│   └── Settings (automazioni)
├── Dieta
│   └── Settings (automazioni)
├── Calendario
│   ├── Sport (workout programmati)
│   └── Dieta (pasti programmati)
├── Interessi
│   ├── Monitored (prodotti monitorati)
│   └── Settings (notifiche)
├── Products
│   ├── Ricerca (ricerca prodotti)
│   └── Listings (creazione listing)
├── Listings
│   └── eBay (pubblicazione)
└── Settings
    ├── Webhooks (tutte le pagine)
    ├── Automazioni (Sport, Dieta)
    └── eBay (integrazione)
```

---

## 📊 Stato Integrazione Completo

### ✅ Completamente Integrate
- Dashboard
- Sport & Fitness
- Interessi
- Settings
- Admin (Users, Server)
- Products
- Listings
- Ricerca
- Monitored
- User Profile

### 🔄 Parzialmente Integrate
- Dieta (ricette funzionanti, memorizzazione da completare)
- Calendario (struttura base, integrazione da completare)
- Obiettivi (da verificare)
- Progetti (da verificare)
- Reports (da verificare)

---

## 🔄 Aggiornamenti Registry

Questo registry deve essere aggiornato quando:
- Viene creata una nuova pagina
- Vengono aggiunti nuovi endpoint API
- Cambia la struttura dati memorizzata
- Vengono stabilite nuove relazioni tra pagine
- Cambia lo stato di integrazione

**Ultimo aggiornamento:** Gennaio 2025







