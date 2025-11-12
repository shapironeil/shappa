# 📚 Project Knowledge Base - LifeManager

**Ultimo aggiornamento:** Gennaio 2025  
**Scopo:** Fornire a Cursor una visione completa e strutturata del progetto LifeManager

---

## 🎯 Panoramica Progetto

**LifeManager** (Shappa) è un sistema completo di gestione della vita personale che include:
- Monitoraggio prodotti e interessi
- Gestione sport e fitness
- Pianificazione dieta e ricette
- Calendario e obiettivi
- Integrazione eBay per vendite
- Sistema di automazioni e notifiche Discord
- Sistema di agenti AI coordinati

**URL Production:** https://shapiro.ninja  
**Server:** DigitalOcean Droplet (207.154.218.16)  
**Stack:** Node.js + Express, Vanilla JS frontend, MongoDB Atlas, DigitalOcean Spaces

---

## 📁 Struttura Directory

### Root Directory
```
LifeManager/
├── agents/              # Sistema agenti AI coordinati
├── frontend/            # React/TypeScript app (moderno)
├── src/                 # Vanilla JS pages (legacy)
├── lib/                 # Utility e servizi
├── monitors/            # Sistema monitoraggio prodotti
├── docs/                # Documentazione completa
├── scripts/             # Script di utilità
├── data/                # Dati temporanei (non committare)
└── server.js            # Server Express principale
```

### Directory Principali

#### `agents/` - Sistema Agenti AI
- `coordinator/Coordinator.js` - Coordinatore centrale
- `base/AgentBase.js` - Classe base per tutti gli agenti
- `figma/FigmaAgent.js` - Generazione codice da Figma
- `frontend/FrontendAgent.js` - Integrazione frontend-backend
- `data/DataAgent.js` - Gestione cache e storage
- `security/SecurityAgent.js` - Autenticazione e validazione
- `monitor/MonitorAgent.js` - Monitoraggio prodotti
- `sport/SportAgent.js` - Gestione workout
- `automation/AutomationAgent.js` - Automazioni
- `integration/IntegrationAgent.js` - Integrazioni esterne
- `notification/NotificationAgent.js` - Notifiche
- `recipe/RecipeAgent.js` - Ricette

#### `src/pages/` - Pagine Frontend
- `dashboard.html` - Dashboard principale
- `sport.html` + `sport-app.js` - Sport e fitness
- `dieta.html` - Dieta e ricette
- `calendario.html` - Calendario eventi
- `interessi.html` - Interessi e monitor prodotti
- `settings.html` - Impostazioni e automazioni
- `admin-*.html` - Pannelli amministrativi
- Altri: `products.html`, `listings.html`, `ricerca.html`, etc.

#### `lib/` - Utility e Servizi
- `utils/` - Utility modules (fileUtils, pathUtils, responseUtils, validationUtils)
- `services/` - Servizi esterni
- `scraper/` - Scraping Amazon/Shopify
- `db/` - Database utilities

#### `monitors/` - Sistema Monitoraggio
- `MonitorManager.js` - Gestore principale
- `UniversalMonitor.js` - Monitor universale
- `ShopifyMonitor.js` - Monitor specifico Shopify

---

## 🔗 Relazioni tra Componenti

### Flusso Dati Utente
```
User → Frontend (src/pages/*.html)
  ↓
API Calls (server.js)
  ↓
Agents (agents/*)
  ↓
Data Storage (data/ + MongoDB)
  ↓
Notifications (Discord Webhooks)
```

### Flusso Figma → Codice
```
Figma Design
  ↓
FigmaAgent (analisi design)
  ↓
FrontendAgent (generazione codice)
  ↓
src/pages/[page].html
  ↓
Backend Integration (server.js)
```

### Sistema Agenti
```
Coordinator (orchestrazione)
  ↓
Agents (specializzati)
  ↓
Task Execution
  ↓
Result Storage
```

---

## 🎨 Pattern e Convenzioni

### Naming Conventions

**File e Directory:**
- Componenti React: `PascalCase.tsx` (es: `DashboardCard.tsx`)
- File HTML: `kebab-case.html` (es: `dashboard.html`)
- File JS: `camelCase.js` (es: `dashboard.js`)
- Directory: `kebab-case` (es: `user-profile/`)

**Codice:**
- Funzioni: `camelCase` (es: `getUserProfile()`)
- Classi: `PascalCase` (es: `FigmaAgent`)
- Costanti: `UPPER_SNAKE_CASE` (es: `API_BASE_URL`)
- Variabili: `camelCase` (es: `userData`)

**Figma:**
- Componenti: `PascalCase` (es: `DashboardCard`)
- Frame: `kebab-case` (es: `dashboard-page`)
- Varianti: `descriptive` (es: `button-primary`)

### Architettura

**Online-First:**
- Tutti i dati runtime online (MongoDB, Object Storage)
- Nessun storage locale runtime
- Secrets solo su server/GitHub Secrets

**Modularità:**
- Agenti specializzati per dominio
- Utility modules riutilizzabili
- Separazione logica/presentazione

**Backward Compatibility:**
- Mantenere compatibilità con codice esistente
- Non rompere funzionalità esistenti
- Versioning per breaking changes

---

## 🔧 Tecnologie e Dipendenze

### Backend
- **Node.js** + **Express** - Server principale
- **MongoDB Atlas** - Database (online)
- **DigitalOcean Spaces** - Object Storage
- **Playwright** - Web scraping
- **Axios** - HTTP client
- **node-cron** - Task scheduling

### Frontend
- **Vanilla JS** - Pagine legacy (src/pages/)
- **React + TypeScript** - App moderna (frontend/)
- **Venus Design System** - Sistema design UI

### Integrazioni
- **Figma API** - Design → Codice
- **eBay OAuth** - Autenticazione vendite
- **Discord Webhooks** - Notifiche
- **OpenWebNinja** - Dati Amazon

---

## 📊 API Endpoints Principali

### Autenticazione
- `POST /api/auth/register` - Registrazione
- `POST /api/auth/login` - Login
- `GET /api/auth/user/:userId` - Profilo utente

### Sport & Fitness
- `GET /api/sport/profile/:userId` - Profilo sportivo
- `POST /api/sport/profile` - Salva profilo
- `GET /api/sport/program/:userId` - Programma allenamento
- `POST /api/sport/program` - Salva programma
- `GET /api/sport/stats/:userId` - Statistiche

### Interessi & Monitor
- `GET /api/interests/:userId` - Interessi utente
- `POST /api/interests/save` - Salva interessi
- `POST /api/monitor/start` - Avvia monitor
- `POST /api/monitor/stop` - Ferma monitor

### Webhooks & Automazioni
- `POST /api/webhooks/:userId` - Salva webhook (multi-pagina)
- `GET /api/webhooks/:userId` - Get webhook
- `POST /api/automations/sport` - Automazioni sport
- `POST /api/automations/habits` - Automazioni abitudini

### Agenti AI
- `POST /api/agents/task` - Assegna task
- `POST /api/agents/queue` - Accoda task
- `GET /api/agents/stats` - Statistiche agenti
- `GET /api/agents/agent/:agentName` - Info agente
- `POST /api/agents/communicate` - Comunica con agente

### eBay
- `GET /api/ebay/auth-url` - URL autorizzazione
- `GET /auth/ebay/callback` - Callback OAuth
- `GET /api/ebay/status` - Status connessione
- `POST /api/ebay/list` - Crea listing

### Admin
- `GET /api/admin/user-data/:userId` - Dati utente
- `GET /api/admin/server-data` - Dati server

---

## 🗄️ Struttura Dati

### File System (data/)
- `users/` - Dati utenti (JSON)
- `interests/` - Interessi utenti
- `webhooks/` - Configurazioni webhook
- `automations/` - Automazioni utenti
- `sport/` - Dati sport e fitness
- `monitors/` - Configurazioni monitor

### MongoDB Atlas (futuro)
- `users` - Profili utenti
- `listings` - Listing eBay
- `events` - Eventi e audit
- `jobs` - Job queue

### Object Storage
- Immagini prodotti
- Assets generati
- File temporanei

---

## 🔐 Sicurezza e Configurazione

### File Protetti (NON MODIFICARE)
- `.env.private` - Credenziali e configurazioni
- File con credenziali in `docs/`
- Configurazioni funzionanti

### Variabili Ambiente
- `FIGMA_API_KEY` - API key Figma
- `MONGODB_URI` - Connection string MongoDB
- `EBAY_CLIENT_ID` / `EBAY_CLIENT_SECRET` - Credenziali eBay
- `SPACES_KEY` / `SPACES_SECRET` - DigitalOcean Spaces
- `DISCORD_WEBHOOK_URL` - Webhook Discord (per utente)

### GitHub Secrets
- `SSH_PRIVATE_KEY` - Deploy SSH
- Tutte le credenziali per CI/CD

---

## 🚀 Workflow Standard

### Per Ogni Task
1. **Analisi** - Leggi documentazione rilevante
2. **Implementazione** - Modifica file necessari
3. **Integrazione** - Usa agenti se necessario
4. **Documentazione** - Aggiorna se necessario
5. **Test** - Verifica funzionalità

### Workflow Figma → Codice
1. Design in Figma
2. Analisi con Cursor Chat
3. Implementazione con Composer
4. Integrazione automatica via agenti
5. Documentazione auto-generata

---

## 📝 Decisioni Architetturali

### Online-First
- **Decisione:** Tutti i dati runtime online
- **Motivo:** Scalabilità, backup, accesso multi-device
- **Implementazione:** MongoDB Atlas + Object Storage

### Sistema Agenti
- **Decisione:** Coordinator pattern con agenti specializzati
- **Motivo:** Modularità, manutenibilità, estensibilità
- **Implementazione:** EventEmitter per comunicazione

### Dual Frontend
- **Decisione:** Vanilla JS (legacy) + React (moderno)
- **Motivo:** Migrazione graduale, compatibilità
- **Implementazione:** Coesistenza in `src/` e `frontend/`

### Utility Modules
- **Decisione:** Centralizzazione operazioni comuni
- **Motivo:** DRY, manutenibilità, testabilità
- **Implementazione:** `lib/utils/` modules

---

## 🔄 Stato Progetto

### Funzionalità Complete
- ✅ Sistema autenticazione
- ✅ Dashboard multi-pagina
- ✅ Sport & Fitness
- ✅ Monitor prodotti
- ✅ Webhooks Discord (multi-pagina)
- ✅ Sistema agenti base
- ✅ Integrazione eBay OAuth
- ✅ Admin panel

### In Sviluppo
- 🔄 Comunicazione inter-agente avanzata
- 🔄 Task system complesso
- 🔄 Workflow presets
- 🔄 Documentazione automatica

### Pianificato
- 📋 Integrazione MongoDB completa
- 📋 Sistema notifiche avanzato
- 📋 Dashboard comunicazioni agenti
- 📋 Code analysis automatico

---

## 📚 File di Riferimento

### Documentazione Principale
- `README.md` - Panoramica progetto
- `AGENT_SYSTEM_GUIDE.md` - Guida sistema agenti
- `WORKFLOW.md` - Architettura e flussi
- `CONFIGURATION_RULES.md` - Regole configurazione
- `CURSOR_PRO_STRATEGY.md` - Strategia Cursor
- `CURSOR_MEMORY.md` - Memoria persistente
- `PAGES_REGISTRY.md` - Registry pagine e API

### Guide Specifiche
- `docs/FIGMA_API_SETUP.md` - Setup Figma
- `docs/GITHUB_SECRETS_SETUP.md` - Setup GitHub Secrets
- `docs/ONLINE_FIRST_WORKFLOW.md` - Workflow online-first
- `docs/REFACTORING_SUMMARY.md` - Refactoring eseguito

---

## ⚠️ Note Importanti

1. **Mai modificare `.env.private`** senza consenso esplicito
2. **Sempre verificare compatibilità** prima di modifiche grandi
3. **Testare integrazioni** dopo modifiche agenti
4. **Mantenere coerenza** con architettura esistente
5. **Documentare decisioni** importanti
6. **Evitare duplicazioni** - usare utility modules
7. **Comunicare sempre** lo stato delle operazioni

---

**Questa knowledge base deve essere consultata PRIMA di ogni modifica importante al progetto.**


