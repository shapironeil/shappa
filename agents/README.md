# Agent AI Committee System

Sistema di agenti AI coordinati per gestire tutte le funzionalità del LifeManager.

## Architettura

Il sistema è composto da:
- **Coordinator**: Coordina tutti gli agenti e distribuisce i task
- **Agenti Specializzati**: Ogni agente gestisce un dominio specifico

## Agenti Disponibili

### 1. MonitorAgent
Gestisce monitoraggi prodotti:
- Avvia/ferma monitoraggi
- Monitora cambiamenti prezzi/disponibilità
- Gestisce notifiche per prodotti disponibili

### 2. SportAgent
Gestisce workout e fitness:
- Gestisce profili sport utenti
- Gestisce programmi di allenamento
- Traccia workout completati
- Calcola statistiche

### 3. AutomationAgent
Gestisce automazioni:
- Automazioni sport
- Automazioni abitudini
- Programma reminder
- Gestisce trigger e azioni

### 4. IntegrationAgent
Gestisce integrazioni esterne:
- Integrazione eBay (OAuth, API)
- Integrazione Amazon (scraping, API)
- Webhook Discord
- Gestione token e autenticazioni esterne

### 5. FigmaAgent
Gestisce integrazione con Figma:
- Connessione all'API Figma
- Lettura design e componenti
- Analisi strutture UI
- Generazione codice frontend da design
- Collegamento design a funzionalità backend

### 6. FrontendAgent
Gestisce generazione e integrazione frontend:
- Genera codice frontend da design
- Collega componenti UI alle API backend
- Gestisce stato e gestione dati
- Integra con DataManager
- Gestisce routing e navigazione

### 7. DataAgent
Gestisce dati e cache:
- Gestisce cache dati
- Sincronizza dati tra frontend e backend
- Gestisce persistenza dati
- Ottimizza accesso ai dati
- Gestisce export/import dati

### 8. SecurityAgent
Gestisce sicurezza e autenticazione:
- Gestisce autenticazione utenti
- Gestisce autorizzazioni
- Valida input
- Gestisce sessioni
- Protegge endpoint

### 9. NotificationAgent
Gestisce notifiche:
- Invia notifiche Discord
- Invia notifiche email
- Gestisce notifiche in-app
- Programma notifiche
- Gestisce template notifiche

## Utilizzo

### Inizializzazione

```javascript
const { initializeAgents } = require('./agents');

// Inizializza il sistema
const { coordinator } = initializeAgents({
    figma: {
        figmaApiKey: process.env.FIGMA_API_KEY
    },
    // altre configurazioni...
});
```

### Utilizzo Base

```javascript
// Assegna un task
const result = await coordinator.assignTask({
    type: 'start_monitor',
    interestData: { /* ... */ },
    userId: 'user123'
});

// Oppure aggiungi alla coda
const taskId = await coordinator.queueTask({
    type: 'create_page_from_figma',
    fileKey: 'figma-file-key',
    pageName: 'new-page',
    backendConfig: { /* ... */ }
});
```

### Esempio: Creare Pagina da Figma

```javascript
// Task per creare una pagina da design Figma
const result = await coordinator.assignTask({
    type: 'create_page_from_figma',
    fileKey: 'your-figma-file-key',
    nodeId: 'node-id-optional',
    pageName: 'dashboard',
    pagePath: 'src/pages/dashboard.html',
    backendConfig: {
        apiBase: 'https://shapiro.ninja',
        endpoints: [
            { path: '/api/sport/profile/:userId', method: 'GET' },
            { path: '/api/interests/:userId', method: 'GET' }
        ]
    },
    exportAssets: true,
    assetNodeIds: ['node1', 'node2']
});
```

### Esempio: Monitoraggio Prodotto

```javascript
// Avvia monitoraggio prodotto
const result = await coordinator.assignTask({
    type: 'start_monitor',
    interestData: {
        id: 'monitor-1',
        name: 'Prodotto Amazon',
        url: 'https://amazon.it/product',
        type: 'releasing',
        status: 'active',
        interval: 5,
        module: 'universal'
    },
    userId: 'user123'
});
```

### Esempio: Workout Completato

```javascript
// Completa workout
const result = await coordinator.assignTask({
    type: 'complete_workout',
    userId: 'user123',
    workoutData: {
        workoutId: 'workout-1',
        exercises: [/* ... */],
        duration: 60,
        calories: 400
    }
});
```

### Esempio: Notifica Discord

```javascript
// Invia notifica Discord
const result = await coordinator.assignTask({
    type: 'send_discord_notification',
    userId: 'user123',
    message: 'Prodotto disponibile!',
    embeds: [{
        title: 'Prodotto Disponibile',
        description: 'Il prodotto che stavi monitorando è ora disponibile',
        color: 0x10b981
    }]
});
```

## API Endpoints

Il sistema può essere integrato nel server Express aggiungendo endpoint API:

```javascript
// Esempio endpoint per creare pagina da Figma
app.post('/api/figma/create-page', async (req, res) => {
    try {
        const { fileKey, nodeId, pageName, backendConfig } = req.body;
        const coordinator = getAgentCoordinator();
        
        const result = await coordinator.assignTask({
            type: 'create_page_from_figma',
            fileKey,
            nodeId,
            pageName,
            backendConfig
        });
        
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
```

## Configurazione

### Variabili d'Ambiente

```env
FIGMA_API_KEY=your-figma-api-key
API_BASE=https://shapiro.ninja
ENCRYPTION_KEY=your-encryption-key
```

### Configurazione Agenti

```javascript
const config = {
    monitor: {
        priority: 8
    },
    sport: {
        priority: 7
    },
    figma: {
        figmaApiKey: process.env.FIGMA_API_KEY,
        priority: 8
    },
    security: {
        sessionTTL: 3600000, // 1 hour
        priority: 10
    }
};

const { coordinator } = initializeAgents(config);
```

## Workflow Figma -> Frontend

1. **Design in Figma**: Crea il design della pagina in Figma
2. **Analisi Design**: Il FigmaAgent analizza i componenti del design
3. **Generazione Codice**: Il FigmaAgent genera codice HTML/CSS/JS
4. **Integrazione Backend**: Il FrontendAgent collega i componenti alle API
5. **Pagina Completa**: La pagina è pronta con tutte le funzionalità collegate

## Statistiche e Monitoring

```javascript
// Ottieni statistiche del coordinatore
const stats = coordinator.getStats();
console.log('Agents:', stats.agents);
console.log('Queue size:', stats.queueSize);
console.log('Processing tasks:', stats.processingTasks);

// Ottieni statistiche di un agente specifico
const agentStats = coordinator.getAgentStatus('MonitorAgent');
console.log('MonitorAgent stats:', agentStats);
```

## Estendere il Sistema

Per aggiungere un nuovo agente:

1. Crea una classe che estende `AgentBase`
2. Implementa `canHandle()` e `processTask()`
3. Registra l'agente nel Coordinator

```javascript
const AgentBase = require('./base/AgentBase');

class MyAgent extends AgentBase {
    constructor(config) {
        super('MyAgent', config);
        this.capabilities = ['my_task'];
    }

    canHandle(task) {
        return task.type === 'my_task';
    }

    async processTask(task) {
        // Implementa logica
        return { success: true };
    }
}

// Registra nel coordinator
coordinator.registerAgent(new MyAgent());
```

## Best Practices

1. **Usa task types specifici**: Ogni agente dovrebbe gestire task types specifici
2. **Gestisci errori**: Ogni agente deve gestire errori appropriatamente
3. **Logging**: Usa eventi per logging e monitoring
4. **Cache**: Usa DataAgent per cache quando appropriato
5. **Sicurezza**: Usa SecurityAgent per validazione e autenticazione

## Troubleshooting

### Agente non risponde
- Verifica che l'agente sia registrato
- Controlla i log per errori
- Verifica che `canHandle()` ritorni true per il task

### Task fallisce
- Controlla i log dell'agente
- Verifica che tutti i parametri richiesti siano forniti
- Controlla le dipendenze (API keys, file system, etc.)

### Performance
- Usa cache quando possibile
- Ottimizza task pesanti
- Considera di usare la coda per task asincroni

