# 🤖 Agent AI Committee System - Guida Completa

## Panoramica

Il sistema Agent AI Committee è un sistema modulare di agenti AI coordinati che gestisce tutte le funzionalità del LifeManager. Ogni agente è specializzato in un dominio specifico e collabora con gli altri attraverso il Coordinator.

## 🔄 Comunicazione Inter-Agente

### Sistema di Comunicazione Continua

Il sistema supporta comunicazione continua tra agenti attraverso:
- **Broadcast**: Messaggi globali a tutti gli agenti
- **Comunicazione Diretta**: Messaggi tra agenti specifici
- **Event Subscriptions**: Iscrizione a tipi di eventi specifici
- **Heartbeat System**: Verifica continua dello stato degli agenti
- **Data Verification**: Verifica dati condivisi tra agenti

### API Endpoints Comunicazione

- `POST /api/agents/broadcast` - Broadcast messaggio a tutti gli agenti
- `POST /api/agents/subscribe` - Iscrivi agente a tipo di evento
- `GET /api/agents/communications` - Ottieni log comunicazioni
- `POST /api/agents/verify-data` - Verifica dati condivisi
- `GET /api/agents/heartbeat` - Stato heartbeat agenti
- `GET /api/agents/communication-stats` - Statistiche comunicazioni

## 🎯 Workflow Figma -> Frontend

### Come Funziona

1. **Design in Figma**: Crei il design della pagina in Figma
2. **Analisi Design**: Il FigmaAgent analizza automaticamente i componenti del design
3. **Generazione Codice**: Il FigmaAgent genera codice HTML/CSS/JS basato sul design
4. **Integrazione Backend**: Il FrontendAgent collega automaticamente i componenti alle API backend
5. **Pagina Completa**: La pagina è pronta con tutte le funzionalità collegate

### Passi Pratici

#### 1. Ottieni Figma File Key

1. Apri il tuo file Figma
2. Copia l'URL del file (es: `https://www.figma.com/file/ABC123/MyDesign`)
3. Il File Key è la parte dopo `/file/` (es: `ABC123`)

#### 2. Configura Figma API Key

Aggiungi la tua Figma API key al file `.env`:

```env
FIGMA_API_KEY=your-figma-api-key
```

Per ottenere la API key:
1. Vai su https://www.figma.com/developers/api#access-tokens
2. Crea un nuovo personal access token
3. Copia il token e aggiungilo al `.env`

#### 3. Crea Pagina da Figma

Usa l'endpoint API per creare una pagina:

```bash
curl -X POST https://shapiro.ninja/api/figma/create-page \
  -H "Content-Type: application/json" \
  -d '{
    "fileKey": "your-figma-file-key",
    "pageName": "dashboard",
    "pagePath": "src/pages/dashboard.html",
    "backendConfig": {
      "apiBase": "https://shapiro.ninja",
      "endpoints": [
        {
          "path": "/api/sport/profile/:userId",
          "method": "GET"
        }
      ]
    },
    "exportAssets": true
  }'
```

Oppure usa JavaScript:

```javascript
const response = await fetch('https://shapiro.ninja/api/figma/create-page', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    fileKey: 'your-figma-file-key',
    pageName: 'dashboard',
    backendConfig: {
      apiBase: 'https://shapiro.ninja',
      endpoints: [
        { path: '/api/sport/profile/:userId', method: 'GET' }
      ]
    }
  })
});

const result = await response.json();
console.log('Pagina creata:', result.pagePath);
```

#### 4. Collega Pagina alle API

Se hai già una pagina e vuoi collegarla alle API:

```javascript
const response = await fetch('https://shapiro.ninja/api/frontend/link-page', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    pagePath: 'src/pages/dashboard.html',
    apiConfig: {
      endpoints: [
        { path: '/api/sport/profile/:userId', method: 'GET' },
        { path: '/api/interests/:userId', method: 'GET' }
      ],
      dataRequirements: [
        { type: 'sport', componentName: 'SportProfile' },
        { type: 'interests', componentName: 'InterestsList' }
      ]
    }
  })
});
```

## 📚 Agenti Disponibili

### FigmaAgent

Gestisce l'integrazione con Figma:

**Task disponibili:**
- `create_page_from_figma`: Crea una pagina da design Figma
- `sync_figma_design`: Sincronizza design Figma
- `analyze_figma_components`: Analizza componenti Figma
- `export_figma_assets`: Esporta assets da Figma
- `link_figma_to_backend`: Collega design a backend

**Esempio:**
```javascript
await coordinator.assignTask({
  type: 'create_page_from_figma',
  fileKey: 'figma-file-key',
  pageName: 'dashboard',
  backendConfig: { /* ... */ }
});
```

### FrontendAgent

Gestisce generazione e integrazione frontend:

**Task disponibili:**
- `link_page_to_api`: Collega pagina alle API
- `generate_component`: Genera componente frontend
- `integrate_with_backend`: Integra con backend
- `generate_api_client`: Genera client API
- `create_data_manager_integration`: Crea integrazione DataManager

**Esempio:**
```javascript
await coordinator.assignTask({
  type: 'link_page_to_api',
  pagePath: 'src/pages/dashboard.html',
  apiConfig: { endpoints: [/* ... */] }
});
```

### MonitorAgent

Gestisce monitoraggi prodotti:

**Task disponibili:**
- `start_monitor`: Avvia monitoraggio
- `stop_monitor`: Ferma monitoraggio
- `check_monitor_status`: Controlla stato monitoraggio
- `get_monitor_stats`: Ottiene statistiche monitoraggi

**Esempio:**
```javascript
await coordinator.assignTask({
  type: 'start_monitor',
  interestData: { /* ... */ },
  userId: 'user123'
});
```

### SportAgent

Gestisce workout e fitness:

**Task disponibili:**
- `save_sport_profile`: Salva profilo sport
- `get_sport_profile`: Ottiene profilo sport
- `complete_workout`: Completa workout
- `get_sport_stats`: Ottiene statistiche sport

**Esempio:**
```javascript
await coordinator.assignTask({
  type: 'complete_workout',
  userId: 'user123',
  workoutData: { /* ... */ }
});
```

### AutomationAgent

Gestisce automazioni:

**Task disponibili:**
- `save_sport_automations`: Salva automazioni sport
- `save_habit_settings`: Salva impostazioni abitudini
- `schedule_reminder`: Programma reminder
- `trigger_automation`: Triggera automazione

**Esempio:**
```javascript
await coordinator.assignTask({
  type: 'schedule_reminder',
  userId: 'user123',
  notificationType: 'workout_reminder',
  schedule: { hour: 18, minute: 0 }
});
```

### IntegrationAgent

Gestisce integrazioni esterne:

**Task disponibili:**
- `ebay_get_status`: Ottiene stato eBay
- `amazon_search`: Cerca prodotti Amazon
- `discord_send_webhook`: Invia webhook Discord
- `manage_webhooks`: Gestisce webhook

**Esempio:**
```javascript
await coordinator.assignTask({
  type: 'discord_send_webhook',
  userId: 'user123',
  message: 'Notifica!',
  embeds: [/* ... */]
});
```

### DataAgent

Gestisce dati e cache:

**Task disponibili:**
- `cache_data`: Salva dati in cache
- `get_cached_data`: Ottiene dati dalla cache
- `export_data`: Esporta dati
- `backup_data`: Crea backup dati

**Esempio:**
```javascript
await coordinator.assignTask({
  type: 'cache_data',
  key: 'sport-profile-user123',
  data: { /* ... */ },
  ttl: 3600000
});
```

### SecurityAgent

Gestisce sicurezza e autenticazione:

**Task disponibili:**
- `authenticate_user`: Autentica utente
- `validate_session`: Valida sessione
- `check_permissions`: Controlla permessi
- `validate_input`: Valida input

**Esempio:**
```javascript
await coordinator.assignTask({
  type: 'validate_session',
  sessionId: 'session-id'
});
```

### NotificationAgent

Gestisce notifiche:

**Task disponibili:**
- `send_discord_notification`: Invia notifica Discord
- `send_email_notification`: Invia notifica email
- `send_in_app_notification`: Invia notifica in-app
- `schedule_notification`: Programma notifica

**Esempio:**
```javascript
await coordinator.assignTask({
  type: 'send_discord_notification',
  userId: 'user123',
  message: 'Notifica!',
  embeds: [/* ... */]
});
```

## 🔧 API Endpoints

### Generici

- `POST /api/agents/task`: Assegna un task al sistema
- `POST /api/agents/queue`: Aggiunge un task alla coda
- `GET /api/agents/stats`: Ottiene statistiche del sistema
- `GET /api/agents/agent/:agentName`: Ottiene stato di un agente specifico
- `POST /api/agents/communicate`: Comunica con un agente specifico

### Figma

- `POST /api/figma/create-page`: Crea una pagina da design Figma
- `POST /api/figma/sync`: Sincronizza design Figma

### Frontend

- `POST /api/frontend/link-page`: Collega una pagina alle API backend

## 📊 Monitoring

### Statistiche Sistema

```javascript
const response = await fetch('https://shapiro.ninja/api/agents/stats');
const stats = await response.json();

console.log('Agenti:', stats.stats.agents);
console.log('Task in coda:', stats.stats.queueSize);
console.log('Task in elaborazione:', stats.stats.processingTasks);
```

### Stato Agente Specifico

```javascript
const response = await fetch('https://shapiro.ninja/api/agents/agent/FigmaAgent');
const agentStats = await response.json();

console.log('Stato agente:', agentStats.agent.status);
console.log('Task processati:', agentStats.agent.tasksProcessed);
console.log('Errori:', agentStats.agent.errors);
```

## 🎨 Best Practices

1. **Usa task types specifici**: Ogni agente gestisce task types specifici
2. **Gestisci errori**: Controlla sempre il campo `success` nella risposta
3. **Usa la coda per task asincroni**: Usa `queueTask` per task che non richiedono risposta immediata
4. **Cache quando possibile**: Usa DataAgent per cache quando appropriato
5. **Valida input**: Usa SecurityAgent per validare input utente

## 🐛 Troubleshooting

### Figma API Key non configurata

**Errore**: `Figma API key not configured`

**Soluzione**: Aggiungi `FIGMA_API_KEY` al file `.env`

### Agente non trova task

**Errore**: `No agent can handle task`

**Soluzione**: Verifica che il `type` del task sia supportato dall'agente

### Task fallisce

**Errore**: `Task failed`

**Soluzione**: 
1. Controlla i log del server
2. Verifica che tutti i parametri richiesti siano forniti
3. Controlla le dipendenze (API keys, file system, etc.)

## 📝 Esempi Completi

Vedi il file `agents/examples/figma-workflow-example.js` per esempi completi di utilizzo del sistema.

## 🔗 Link Utili

- [Figma API Documentation](https://www.figma.com/developers/api)
- [Agent System README](./agents/README.md)
- [Agent Examples](./agents/examples/figma-workflow-example.js)

