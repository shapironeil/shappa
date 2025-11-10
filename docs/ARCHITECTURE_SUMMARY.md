# 🏗️ LifeManager - Architettura Completa

**Data Analisi**: Gennaio 2025  
**Versione**: 2.0.0

---

## 📋 Panoramica Generale

**LifeManager** (precedentemente "Shappa") è una piattaforma web full-stack che integra:
- **E-commerce management** (eBay, Amazon)
- **Health & Fitness tracking** (workout, dieta, ricette)
- **Product monitoring** (prezzi, disponibilità)
- **Design-to-code workflow** (Figma → Frontend)
- **AI Agent System** (sistema modulare di agenti coordinati)

---

## 🎯 Principi Architetturali Fondamentali

### 1. **Online-First Architecture**
- **Nessun dato runtime locale** sul client
- Tutti i dati persistenti in **MongoDB Atlas** (cloud)
- Immagini e file in **Object Storage** (DigitalOcean Spaces/S3)
- Cache opzionale in **Redis** (per alta concorrenza)

### 2. **Agent-Based System**
- **Coordinator Pattern**: Un coordinatore distribuisce task agli agenti specializzati
- **Modularità**: Ogni agente gestisce un dominio specifico
- **Event-Driven**: Comunicazione tra agenti via EventEmitter
- **Task Queue**: Sistema di code per task asincroni

### 3. **Dual Frontend Architecture**
- **Frontend Moderno**: React + TypeScript in `frontend/` (Vite)
- **Frontend Legacy**: Vanilla JS in `src/` (pagine HTML)
- **Coesistenza**: Entrambi serviti dallo stesso Express server

---

## 📁 Struttura Directory

```
LifeManager/
├── agents/              # Sistema agenti AI coordinati
│   ├── base/           # AgentBase - classe base
│   ├── coordinator/    # Coordinator - orchestrazione
│   ├── monitor/        # MonitorAgent - monitoraggio prodotti
│   ├── sport/          # SportAgent - workout e fitness
│   ├── automation/     # AutomationAgent - automazioni
│   ├── integration/    # IntegrationAgent - integrazioni esterne
│   ├── figma/          # FigmaAgent - design → codice
│   ├── frontend/       # FrontendAgent - integrazione UI
│   ├── data/           # DataAgent - cache e storage
│   ├── security/       # SecurityAgent - autenticazione
│   ├── notification/   # NotificationAgent - notifiche
│   └── recipe/         # RecipeAgent - ricette GialloZafferano
│
├── frontend/            # React/TypeScript app (Vite)
│   ├── src/            # Componenti React
│   └── build/           # Build output
│
├── src/                 # Frontend legacy (Vanilla JS)
│   ├── pages/          # Pagine HTML
│   ├── components/      # Componenti JS
│   ├── core/            # Core utilities
│   ├── utils/           # Utility functions
│   └── styles/          # CSS
│
├── lib/                 # Librerie condivise
│   ├── db/              # MongoDB helper (singleton)
│   ├── scraper/         # Scraper (Amazon, etc.)
│   └── services/        # Servizi (priceMonitor, etc.)
│
├── monitors/            # Sistema monitoraggio prodotti
│   ├── base/            # BaseMonitor
│   ├── modules/         # Moduli monitoraggio
│   └── MonitorManager.js
│
├── server.js            # Express server principale
├── package.json         # Dipendenze Node.js
└── docs/                # Documentazione
```

---

## 🔄 Flusso Dati Principale

### 1. **Request Flow (API)**
```
Client Request
    ↓
Express Server (server.js)
    ↓
API Endpoint Handler
    ↓
Coordinator.assignTask()
    ↓
Agent.processTask()
    ↓
MongoDB Helper (lib/db/mongodb.js)
    ↓
MongoDB Atlas
```

### 2. **Agent Task Flow**
```
Task Request
    ↓
Coordinator.findAgentsForTask()
    ↓
Agent.canHandle() check
    ↓
Agent.execute() → Agent.processTask()
    ↓
Result → Coordinator
    ↓
Response to Client
```

### 3. **Data Storage Flow**
```
Application Data
    ↓
MongoDBHelper (singleton)
    ↓
MongoDB Atlas Collections:
    - users
    - recipes
    - sport_profiles
    - workouts
    - listings
    - events
    - ...
```

---

## 🤖 Sistema Agenti

### Architettura Agenti

**Base Class**: `AgentBase` (`agents/base/AgentBase.js`)
- Estende `EventEmitter`
- Gestisce stato, statistiche, errori
- Metodi astratti: `processTask()`, `canHandle()`

**Coordinator**: `Coordinator` (`agents/coordinator/Coordinator.js`)
- Singleton pattern
- Gestisce registrazione agenti
- Distribuisce task agli agenti appropriati
- Gestisce code e priorità
- Monitora stato agenti

### Agenti Disponibili

| Agente | Dominio | Priorità | Capabilities |
|--------|---------|----------|--------------|
| **SecurityAgent** | Autenticazione, validazione | 10 | `authenticate_user`, `validate_session`, `check_permissions` |
| **MonitorAgent** | Monitoraggio prodotti | 8 | `start_monitor`, `stop_monitor`, `check_monitor_status` |
| **SportAgent** | Workout e fitness | 7 | `save_sport_profile`, `complete_workout`, `get_sport_stats` |
| **IntegrationAgent** | Integrazioni esterne | 7 | `ebay_get_status`, `amazon_search`, `discord_send_webhook` |
| **FrontendAgent** | Integrazione UI | 7 | `link_page_to_api`, `generate_component` |
| **NotificationAgent** | Notifiche | 7 | `send_discord_notification`, `schedule_notification` |
| **RecipeAgent** | Ricette | 7 | `fetch_recipe_from_giallozafferano`, `search_recipes` |
| **FigmaAgent** | Design → Codice | 6 | `create_page_from_figma`, `sync_figma_design` |
| **DataAgent** | Cache e storage | 6 | `cache_data`, `get_cached_data`, `export_data` |
| **AutomationAgent** | Automazioni | 6 | `save_sport_automations`, `schedule_reminder` |

### Pattern di Utilizzo

```javascript
// In server.js o altri file
const { coordinator } = initializeAgents(config);

// Assegna task
const result = await coordinator.assignTask({
    type: 'fetch_recipe_from_giallozafferano',
    url: 'https://...',
    saveToDatabase: true
});
```

---

## 🗄️ Database Architecture

### MongoDB Helper Pattern

**File**: `lib/db/mongodb.js`

**Pattern**: Singleton con connection pooling
```javascript
const { getMongoDB } = require('./lib/db/mongodb');
const mongoDB = getMongoDB(); // Singleton instance
```

**Metodi Disponibili**:
- `connect()` - Connessione con pooling
- `getCollection(name)` - Ottiene collection
- `insertOne(collection, doc)` - Inserisce documento
- `findOne(collection, query)` - Trova documento
- `findMany(collection, query, options)` - Trova multipli
- `updateOne(collection, query, update)` - Aggiorna
- `upsertOne(collection, query, doc)` - Upsert
- `deleteOne(collection, query)` - Elimina
- `count(collection, query)` - Conta
- `createIndex(collection, index, options)` - Crea indice

**Configurazione**:
- `MONGODB_URI` - Connection string (env)
- `MONGODB_DB_NAME` - Nome database (default: 'shappa')

### Collections Principali

| Collection | Scopo | Indici Consigliati |
|------------|-------|-------------------|
| `users` | Utenti e profili | `userId`, `email` |
| `recipes` | Ricette GialloZafferano | `id`, `name`, `category` |
| `sport_profiles` | Profili sport utenti | `userId` |
| `workouts` | Workout completati | `userId`, `date` |
| `listings` | Listing eBay/Amazon | `userId`, `status` |
| `events` | Eventi e audit log | `timestamp`, `userId` |
| `temp_results` | Dati temporanei (TTL) | `expiresAt` (TTL index) |

---

## 🌐 API Architecture

### Server Express (`server.js`)

**Middleware**:
- `cors()` - CORS abilitato
- `express.json()` - JSON parsing
- `express.urlencoded()` - URL encoding
- `express.static(__dirname)` - Static files

**Pattern Endpoint**:
```javascript
app.METHOD('/api/resource/action', async (req, res) => {
    try {
        // Validazione input
        // Assegnazione task a coordinator (se necessario)
        // Risposta JSON
        res.json({ success: true, data: ... });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});
```

### Categorie Endpoint

1. **Agent System** (`/api/agents/*`)
   - Task assignment, queue, stats, communication

2. **Figma** (`/api/figma/*`)
   - Create page, sync design

3. **Frontend** (`/api/frontend/*`)
   - Link page to API

4. **Sport** (`/api/sport/*`)
   - Profile, workouts, stats

5. **Recipes** (`/api/recipes/*`)
   - Search, fetch, batch import, database operations

6. **eBay** (`/api/ebay/*`)
   - OAuth, listings, account info

7. **Amazon** (`/api/amazon/*`)
   - Search, scrape, product details

8. **Monitor** (`/api/monitor/*`)
   - Start/stop, status, stats

9. **Webhooks** (`/api/webhooks/*`)
   - Discord webhook management

10. **Auth** (`/api/auth/*`)
    - Register, login, user management

---

## 🎨 Frontend Architecture

### Dual Frontend System

#### 1. React/TypeScript Frontend (`frontend/`)

**Stack**:
- **Vite** - Build tool
- **React** - UI framework
- **TypeScript** - Type safety
- **Componenti modulari** - Reusable components

**Struttura**:
```
frontend/src/
├── components/     # Componenti React
├── pages/         # Pagine/views
├── api/           # API clients
├── hooks/         # Custom hooks
└── utils/         # Utility functions
```

#### 2. Vanilla JS Frontend (`src/`)

**Stack**:
- **Vanilla JavaScript** - No framework
- **HTML/CSS** - Markup e styling
- **Moduli ES6** - Organizzazione codice

**Pattern**:
- Componenti in `src/components/`
- Utilities in `src/utils/`
- Core logic in `src/core/`
- Stili in `src/styles/`

**Esempio Pattern**:
```javascript
// src/utils/apiClient.js
class ApiClient {
    async get(endpoint) { ... }
    async post(endpoint, data) { ... }
}
```

---

## 🔧 Pattern e Convenzioni

### 1. **Naming Conventions**

**File e Directory**:
- Componenti React: `PascalCase.tsx` (es: `DashboardCard.tsx`)
- File HTML: `kebab-case.html` (es: `dashboard.html`)
- File JS: `camelCase.js` (es: `dashboard.js`)
- Directory: `kebab-case` (es: `user-profile/`)

**Codice**:
- Funzioni: `camelCase` (es: `getUserProfile()`)
- Classi: `PascalCase` (es: `FigmaAgent`)
- Costanti: `UPPER_SNAKE_CASE` (es: `API_BASE_URL`)
- Variabili: `camelCase` (es: `userData`)

### 2. **Error Handling Pattern**

```javascript
try {
    const result = await someAsyncOperation();
    return { success: true, data: result };
} catch (error) {
    console.error('Operation failed:', error);
    throw new Error(`Operation failed: ${error.message}`);
}
```

### 3. **Database Access Pattern**

**SEMPRE usare MongoDB Helper**:
```javascript
const { getMongoDB } = require('./lib/db/mongodb');
const mongoDB = getMongoDB();

// ✅ CORRETTO
const user = await mongoDB.findOne('users', { userId: '123' });

// ❌ SBAGLIATO - Non creare nuove connessioni
const client = new MongoClient(uri);
```

### 4. **Agent Task Pattern**

**SEMPRE usare Coordinator**:
```javascript
// ✅ CORRETTO
const result = await coordinator.assignTask({
    type: 'fetch_recipe_from_giallozafferano',
    url: 'https://...'
});

// ❌ SBAGLIATO - Non chiamare agenti direttamente
const agent = new RecipeAgent();
await agent.processTask(...);
```

---

## ⚠️ Aree di Attenzione (Consistency)

### 1. **Database Access**
- ✅ **Usare sempre** `lib/db/mongodb.js` (singleton)
- ❌ **Non creare** nuove connessioni MongoDB direttamente
- ❌ **Non duplicare** logica di connessione

### 2. **Agent System**
- ✅ **Sempre usare** `coordinator.assignTask()` per task
- ✅ **Sempre estendere** `AgentBase` per nuovi agenti
- ❌ **Non chiamare** agenti direttamente

### 3. **API Endpoints**
- ✅ **Pattern consistente**: try/catch, JSON response, error handling
- ✅ **Validazione input** sempre presente
- ❌ **Non duplicare** logica di validazione

### 4. **File System**
- ✅ **Usare** `path.join(__dirname, ...)` per path relativi
- ✅ **Usare** `fs.promises` per operazioni async
- ❌ **Non usare** path assoluti hardcoded

### 5. **Environment Variables**
- ✅ **Tutte le configurazioni** in `.env.private` (non committare)
- ✅ **Documentare** variabili necessarie in `CONFIGURATION_RULES.md`
- ❌ **Non hardcodare** secrets nel codice

---

## 🔐 Sicurezza

### Pattern di Sicurezza

1. **Secrets Management**
   - Tutti i secrets in `.env.private` (non committato)
   - GitHub Secrets per CI/CD
   - Nessun secret nel codice

2. **Autenticazione**
   - Session-based (server-side)
   - SecurityAgent per validazione
   - HTTPS obbligatorio in produzione

3. **Input Validation**
   - SecurityAgent per validazione
   - Validazione sempre presente negli endpoint
   - Sanitizzazione input utente

---

## 📊 Monitoring e Logging

### Logging Pattern

```javascript
// ✅ CORRETTO - Log strutturato
console.log(`[AgentName] Operation: ${operation}`, data);
console.error(`[AgentName] Error: ${error.message}`, error);

// ❌ SBAGLIATO - Log generici
console.log('Something happened');
```

### Statistiche Agenti

Ogni agente mantiene:
- `tasksProcessed` - Numero task processati
- `errors` - Array errori (ultimi 50)
- `status` - Stato corrente (idle, processing, error)

Accesso via: `coordinator.getStats()` o `agent.getStats()`

---

## 🚀 Deployment

### Environment

**Sviluppo**:
- `PORT=3000`
- `NODE_ENV=development`
- MongoDB Atlas (M0 free tier)
- Local HTTPS con self-signed certs

**Produzione**:
- `PORT=3000` (Nginx reverse proxy)
- `NODE_ENV=production`
- MongoDB Atlas (cluster dedicato)
- HTTPS con Let's Encrypt
- PM2 per process management

### Deployment Flow

1. **GitHub Actions** → Deploy automatico su push
2. **SSH Deploy** → Pull, npm install, PM2 restart
3. **Health Check** → Verifica server attivo

---

## 📝 Documentazione Chiave

| File | Scopo |
|------|-------|
| `AGENT_SYSTEM_GUIDE.md` | Guida sistema agenti |
| `WORKFLOW.md` | Workflow online-first |
| `CONFIGURATION_RULES.md` | Regole configurazione |
| `CURSOR_PRO_STRATEGY.md` | Workflow Cursor |
| `.cursorrules` | Regole repository |

---

## 🔄 Flussi Principali

### 1. **Figma → Frontend Flow**
```
Figma Design
    ↓
FigmaAgent.analyze_figma_components()
    ↓
FigmaAgent.create_page_from_figma()
    ↓
FrontendAgent.link_page_to_api()
    ↓
Pagina HTML completa con API integrate
```

### 2. **Recipe Import Flow**
```
GialloZafferano URL
    ↓
RecipeAgent.fetch_recipe_from_giallozafferano()
    ↓
RecipeAgent.scrape_recipe_details()
    ↓
RecipeAgent.convert_recipe_format()
    ↓
RecipeAgent.save_recipe_to_database()
    ↓
MongoDB 'recipes' collection
```

### 3. **Product Monitor Flow**
```
User adds product
    ↓
MonitorAgent.start_monitor()
    ↓
MonitorManager.register()
    ↓
Periodic check (cron)
    ↓
Price change detected
    ↓
NotificationAgent.send_discord_notification()
```

---

## ✅ Checklist Consistency

Prima di modificare codice, verificare:

- [ ] Uso `lib/db/mongodb.js` per database access?
- [ ] Uso `coordinator.assignTask()` per agenti?
- [ ] Seguo naming conventions?
- [ ] Gestisco errori con try/catch?
- [ ] Validazione input presente?
- [ ] Log strutturati con `[AgentName]`?
- [ ] Path relativi con `path.join(__dirname, ...)`?
- [ ] Environment variables in `.env.private`?
- [ ] Documentazione aggiornata?

---

## 🎯 Prossimi Passi Architetturali

1. **Centralizzare** logica di validazione (SecurityAgent)
2. **Standardizzare** formati di risposta API
3. **Implementare** rate limiting
4. **Aggiungere** monitoring/metrics (Prometheus?)
5. **Migliorare** error handling centralizzato
6. **Documentare** tutti gli endpoint in formato OpenAPI

---

**Mantieni questa architettura consistente. Evita duplicazioni. Usa i pattern esistenti.**


