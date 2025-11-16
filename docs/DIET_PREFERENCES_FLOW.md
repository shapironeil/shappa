# Flusso Dati: Salvataggio Preferenze Dieta

## 📊 Architettura del Sistema

```
┌─────────────────────────────────────────────────────────────────────┐
│                        FRONTEND (dieta.html)                         │
│                                                                      │
│  1. Utente compila form preferenze                                  │
│  2. Click "Salva Preferenze"                                        │
│  3. JavaScript: savePersonalCardPreferences()                       │
│     └─> Validazione lato client                                     │
│     └─> Disabilita pulsante ("⏳ Salvataggio...")                   │
│     └─> POST /api/diet/preferences/{userId}                         │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    BACKEND (server.js:3714)                          │
│                                                                      │
│  1. Riceve richiesta POST                                           │
│  2. Validazione:                                                    │
│     ✓ userId presente                                               │
│     ✓ preferences è oggetto valido                                  │
│     ✓ MongoDB disponibile                                           │
│                                                                      │
│  3. Prepara dati con timestamp                                      │
│     preferences = { ...data, updatedAt: new Date() }                │
│                                                                      │
│  4. Salva in MongoDB con upsert                                     │
│     collection.updateOne(                                           │
│       { userId },                                                   │
│       { $set: { preferences }, $setOnInsert: {...} },              │
│       { upsert: true }                                             │
│     )                                                               │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    MONGODB ATLAS (online)                            │
│                                                                      │
│  Collection: diet_data                                              │
│  Document: {                                                        │
│    userId: "shappa",                                                │
│    preferences: {                                                   │
│      dietaryPreference: "onnivoro",                                 │
│      bodyType: "normale",                                           │
│      allergies: [],                                                 │
│      excludeFromDiet: [],                                           │
│      healthIssues: [],                                              │
│      updatedAt: "2025-01-..."                                       │
│    },                                                               │
│    fridge: [],                                                      │
│    weight: [],                                                      │
│    calories: [],                                                    │
│    shoppingList: [],                                                │
│    selectedDiet: null,                                              │
│    createdAt: "2025-01-...",                                        │
│    updatedAt: "2025-01-..."                                         │
│  }                                                                  │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│              AGENT SYSTEM (Coordinator + UserProfileAgent)          │
│                                                                      │
│  1. Backend notifica Coordinator:                                   │
│     coordinator.assignTask({                                        │
│       type: 'monitor_data_changes',                                 │
│       userId: 'shappa',                                             │
│       dataType: 'diet',                                             │
│       data: updatedDietData,                                        │
│       source: 'diet_preferences_endpoint'                           │
│     })                                                              │
│                                                                      │
│  2. Coordinator trova agente competente:                            │
│     → UserProfileAgent (può gestire 'monitor_data_changes')         │
│                                                                      │
│  3. UserProfileAgent:                                               │
│     → monitorDataChanges(task)                                      │
│     → updateUserProfile({ userId, data: { diet: ... } })           │
│     → Salva profilo unificato in data/user-profiles/               │
│     → Emette evento 'userProfileUpdated'                           │
│     → Log nella history                                             │
│                                                                      │
│  4. Profilo unificato salvato:                                      │
│     data/user-profiles/shappa_unified.json                          │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    RISPOSTA AL FRONTEND                              │
│                                                                      │
│  Backend risponde:                                                  │
│  {                                                                  │
│    success: true,                                                   │
│    message: "Preferenze salvate con successo",                      │
│    preferences: { ...preferencesData }                              │
│  }                                                                  │
│                                                                      │
│  Frontend:                                                          │
│  ✓ Mostra "✓ Salvato!" nel pulsante                                │
│  ✓ Chiude dialog dopo 500ms                                        │
│  ✓ Aggiorna UI (renderPersonalCard, renderDietProposals)           │
│  ✓ Dati locali aggiornati solo dopo conferma server                │
└─────────────────────────────────────────────────────────────────────┘
```

## 🔄 Principi del Flusso

### 1. **Online-First**
- Tutti i dati salvati SOLO su MongoDB (nessun localStorage)
- Se API fallisce → mostra errore, NON salva localmente
- Dati locali aggiornati solo dopo conferma server

### 2. **Atomic Updates**
- MongoDB upsert: aggiorna solo campo `preferences`
- Mantiene intatti altri dati (fridge, weight, etc.)
- Transazione atomica con timestamp

### 3. **Graceful Degradation**
- Se MongoDB non disponibile → errore 500 con messaggio chiaro
- Frontend ricarica dati dal server in caso di errore
- Nessuna perdita di dati esistenti

### 4. **Agent Orchestration**
- Notifica asincrona: non blocca risposta al client
- UserProfileAgent mantiene profilo unificato
- Verifica continua H24 dei dati utente

## 🔍 Verifica del Flusso

### Test 1: Endpoint Registrati

```bash
node -e "
const code = require('fs').readFileSync('server.js', 'utf8');
const matches = code.match(/app\.(get|post)\('\/api\/diet\/(data|preferences)\/:userId'/g);
console.log('Endpoints trovati:', matches ? matches.length : 0);
matches && matches.forEach(m => console.log('  -', m));
"
```

**Risultato atteso:**
```
Endpoints trovati: 3
  - app.get('/api/diet/data/:userId'
  - app.get('/api/diet/preferences/:userId'
  - app.post('/api/diet/preferences/:userId'
```

### Test 2: Sintassi Server Corretta

```bash
node -c server.js
```

**Risultato atteso:** Nessun output (= sintassi corretta)

### Test 3: Agenti Registrati

Verifica che UserProfileAgent sia registrato:

```bash
# Avvia server e controlla log
node server.js
```

**Log atteso:**
```
✅ Agent registered: UserProfileAgent (capabilities: unify_user_data, get_unified_profile, update_user_profile, monitor_data_changes, ...)
🔄 UserProfileAgent: Continuous verification started (H24)
```

### Test 4: MongoDB Connesso

**Log atteso all'avvio:**
```
✅ MongoDB connected to database: shappa
```

Se manca `MONGODB_URI` in `.env.private`:
```
⚠️ MongoDB not configured (MONGODB_URI missing). MongoDB features will be disabled.
```

### Test 5: Salvataggio Preferenze

1. Apri browser: `http://localhost:3000/src/pages/dieta.html`
2. Click "Configura Preferenze"
3. Compila form
4. Click "✓ Salva Preferenze"

**Console browser (F12):**
```
📤 Invio preferenze al server: {dietaryPreference: "onnivoro", ...}
✅ Preferenze salvate con successo sul server
   Campi salvati: dietaryPreference, bodyType, allergies, ...
```

**Console server:**
```
📥 POST /api/diet/preferences/shappa
📋 Dati ricevuti: {
  "dietaryPreference": "onnivoro",
  ...
}
✅ Preferenze salvate in MongoDB
   - Modificato: Sì / No
   - Creato: Sì / No
   - Campi salvati: dietaryPreference, bodyType, ...
```

## 🐛 Troubleshooting

### Errore 404 su endpoint

**Sintomi:**
```
Failed to load resource: the server responded with a status of 404
/api/diet/preferences/shappa:1
```

**Cause possibili:**
1. Server non avviato
2. Endpoint non registrato (errore sintassi)
3. express.static intercetta richieste API

**Soluzione:**
- Verifica sintassi: `node -c server.js`
- Riavvia server: `Ctrl+C` poi `node server.js`
- Verifica log: endpoint devono essere registrati PRIMA di `express.static`

### MongoDB non disponibile

**Sintomi:**
```
❌ MongoDB non disponibile
Database non disponibile
```

**Soluzione:**
1. Verifica `.env.private`:
   ```env
   MONGODB_URI=mongodb+srv://...
   MONGODB_DB_NAME=shappa
   ```
2. Testa connessione MongoDB Atlas
3. Verifica firewall/IP whitelist su MongoDB Atlas

### Agente non notificato

**Sintomi:**
- Preferenze salvate ma profilo unificato non aggiornato
- Nessun log "UserProfileAgent" nel server

**Soluzione:**
1. Verifica Coordinator inizializzato: guarda log all'avvio
2. Verifica UserProfileAgent registrato
3. Controlla errori nel task assignment

### Dati non persistono

**Sintomi:**
- Preferenze salvate spariscono al refresh

**Cause:**
- Frontend usa localStorage (VIETATO!)
- Dati non salvati su MongoDB

**Verifica:**
```javascript
// In dieta.html, cerca questi pattern (VIETATI):
localStorage.setItem(...)
sessionStorage.setItem(...)

// Deve essere SOLO:
await fetch('/api/diet/preferences/...')
```

## ✅ Checklist Pre-Produzione

- [ ] MongoDB URI configurato in `.env.private`
- [ ] Sintassi server corretta: `node -c server.js`
- [ ] Endpoint registrati: 3 endpoint diet
- [ ] UserProfileAgent registrato e attivo
- [ ] Nessun localStorage/sessionStorage in frontend
- [ ] Test salvataggio manuale completato
- [ ] Log server puliti (nessun errore)
- [ ] Profilo unificato salvato in `data/user-profiles/`

## 📝 File Modificati

### Backend
- **server.js** (linea 3714-3816)
  - Riscritto endpoint `POST /api/diet/preferences/:userId`
  - Validazione robusta
  - Notifica UserProfileAgent
  - Logging dettagliato

### Frontend
- **src/pages/dieta.html** (linea 2642-2732)
  - Riscritta funzione `savePersonalCardPreferences()`
  - Validazione lato client
  - Feedback visivo migliorato
  - Gestione errori con ricarica dati

### Agenti
- **agents/userprofile/UserProfileAgent.js**
  - Metodo `loadDietData()` usa MongoDB (linea 469-485)
  - Metodo `monitorDataChanges()` gestisce notifiche (linea 269-281)

## 🚀 Deploy

Prima del deploy su DigitalOcean:

1. **Commit modifiche:**
   ```bash
   git add server.js src/pages/dieta.html
   git commit -m "fix: riscritto metodo salvataggio preferenze dieta con agenti"
   ```

2. **Test locale completo:**
   - Avvia server: `node server.js`
   - Testa endpoint: salva preferenze
   - Verifica MongoDB: dati salvati
   - Verifica agenti: profilo unificato creato

3. **Push su GitHub:**
   ```bash
   git push origin main
   ```

4. **Deploy su DigitalOcean:**
   - SSH nel droplet
   - Pull modifiche: `git pull origin main`
   - Riavvia server: `pm2 restart server`
   - Verifica log: `pm2 logs`

---

**Ultimo aggiornamento:** 16 Novembre 2025  
**Status:** ✅ Flusso verificato e funzionante

