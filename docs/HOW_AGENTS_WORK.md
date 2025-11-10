# 🤖 Come Funzionano gli Agenti AI - Guida Completa

## 🎯 Concetto Base

Il sistema Agent AI Committee è come un **team di specialisti** che lavorano insieme:
- Ogni agente è un **esperto** in un dominio specifico
- Il **Coordinator** è il **manager** che distribuisce il lavoro
- Gli agenti **comunicano** tra loro per completare task complessi

## 🏗️ Architettura del Sistema

```
┌─────────────────────────────────────────┐
│         COORDINATOR (Manager)            │
│  - Distribuisce task                    │
│  - Gestisce la coda                     │
│  - Monitora gli agenti                  │
└─────────────────────────────────────────┘
                    │
        ┌───────────┼───────────┐
        │           │           │
        ▼           ▼           ▼
┌───────────┐ ┌───────────┐ ┌───────────┐
│  Monitor  │ │   Sport   │ │ Figma     │
│  Agent    │ │  Agent    │ │ Agent     │
└───────────┘ └───────────┘ └───────────┘
        │           │           │
        └───────────┼───────────┘
                    │
        ┌───────────┼───────────┐
        ▼           ▼           ▼
┌───────────┐ ┌───────────┐ ┌───────────┐
│  Data     │ │ Security  │ │Notification│
│  Agent    │ │  Agent    │ │  Agent    │
└───────────┘ └───────────┘ └───────────┘
```

## 🔄 Come si Muovono gli Agenti

### 1. Flusso Base: Task Singolo

```
Utente → Coordinator → Agente → Risultato
```

**Esempio Pratico:**
```javascript
// 1. Utente richiede di avviare un monitoraggio
const task = {
  type: 'start_monitor',
  interestData: { /* ... */ },
  userId: 'user123'
};

// 2. Coordinator riceve il task
coordinator.assignTask(task);

// 3. Coordinator trova l'agente giusto
//    - Chiede a tutti gli agenti: "Puoi gestire questo task?"
//    - MonitorAgent risponde: "Sì, posso!"
//    - Coordinator assegna il task a MonitorAgent

// 4. MonitorAgent processa il task
//    - Avvia il monitoraggio
//    - Ritorna il risultato

// 5. Coordinator ritorna il risultato all'utente
```

### 2. Flusso Complesso: Task Multi-Agente

```
Utente → Coordinator → Agente1 → Coordinator → Agente2 → Risultato
```

**Esempio Pratico:**
```javascript
// Task: Creare pagina da Figma e collegarla alle API

// 1. Coordinator riceve task
coordinator.assignTask({
  type: 'create_page_from_figma',
  fileKey: 'abc123',
  pageName: 'dashboard'
});

// 2. Coordinator assegna a FigmaAgent
//    FigmaAgent:
//    - Analizza il design Figma
//    - Genera codice HTML/CSS/JS
//    - Emette evento: "pageCreated"

// 3. Coordinator sente l'evento e assegna nuovo task
//    FrontendAgent:
//    - Riceve il codice generato
//    - Collega i componenti alle API
//    - Emette evento: "pageLinked"

// 4. Coordinator completa il task
//    Ritorna risultato completo all'utente
```

### 3. Flusso con Coda: Task Asincroni

```
Utente → Coordinator → Coda → Agente (quando disponibile) → Risultato
```

**Esempio Pratico:**
```javascript
// 1. Utente aggiunge task alla coda
coordinator.queueTask({
  type: 'send_discord_notification',
  userId: 'user123',
  message: 'Notifica!'
});

// 2. Coordinator aggiunge alla coda
//    Task ID: "task_1234567890_abc"

// 3. Quando l'agente è disponibile:
//    - Coordinator prende il task dalla coda
//    - Assegna a NotificationAgent
//    - NotificationAgent invia la notifica

// 4. Risultato salvato nella cronologia
```

## 🧠 Come gli Agenti Decidono

### Metodo `canHandle()`

Ogni agente ha un metodo `canHandle()` che decide se può gestire un task:

```javascript
class MonitorAgent extends AgentBase {
    canHandle(task) {
        // Lista di task che questo agente può gestire
        const monitorTasks = [
            'start_monitor',
            'stop_monitor',
            'check_monitor_status'
        ];
        
        // Ritorna true se il task type è nella lista
        return monitorTasks.includes(task.type);
    }
}
```

### Priorità degli Agenti

Ogni agente ha una **priorità** (1-10, 10 = massima):

```javascript
// SecurityAgent ha priorità 10 (massima)
// MonitorAgent ha priorità 8
// SportAgent ha priorità 7

// Se più agenti possono gestire lo stesso task,
// Coordinator sceglie quello con priorità più alta
```

## 💬 Come Comunicano gli Agenti

### 1. Eventi (Event-Driven)

Gli agenti emettono eventi quando succede qualcosa:

```javascript
// MonitorAgent emette evento quando prodotto diventa disponibile
this.emit('monitorChange', {
    monitorId: 'monitor-1',
    changeType: 'availability',
    data: { /* ... */ }
});

// NotificationAgent ascolta l'evento
coordinator.on('monitorChange', (data) => {
    // Invia notifica all'utente
    coordinator.assignTask({
        type: 'send_discord_notification',
        userId: data.userId,
        message: 'Prodotto disponibile!'
    });
});
```

### 2. Comunicazione Diretta

Gli agenti possono comunicare direttamente:

```javascript
// Coordinator può far comunicare due agenti
await coordinator.communicateWithAgent('FigmaAgent', {
    action: 'get_file_info',
    fileKey: 'abc123'
});

// FigmaAgent risponde con le informazioni
```

### 3. Task Coordinati

Per task complessi, più agenti lavorano insieme:

```javascript
// Coordinator coordina più agenti per un task complesso
await coordinator.coordinateTask({
    type: 'create_complete_page',
    figmaFileKey: 'abc123',
    backendConfig: { /* ... */ }
});

// Coordinator:
// 1. Assegna a FigmaAgent per analizzare design
// 2. Assegna a FrontendAgent per generare codice
// 3. Assegna a DataAgent per gestire cache
// 4. Ritorna risultato combinato
```

## 📊 Esempi Pratici di Movimento

### Esempio 1: Workflow Completo Figma → Frontend

```javascript
// STEP 1: Utente richiede creazione pagina
POST /api/figma/create-page
{
  "fileKey": "abc123",
  "pageName": "dashboard"
}

// STEP 2: Coordinator assegna a FigmaAgent
FigmaAgent.processTask({
  type: 'create_page_from_figma',
  fileKey: 'abc123',
  pageName: 'dashboard'
});

// STEP 3: FigmaAgent lavora
// - Chiama API Figma per ottenere design
// - Analizza componenti
// - Genera codice HTML/CSS/JS
// - Emette evento: "frontendCodeGenerated"

// STEP 4: Coordinator sente evento e assegna a FrontendAgent
FrontendAgent.processTask({
  type: 'link_page_to_api',
  pagePath: 'src/pages/dashboard.html',
  apiConfig: { /* ... */ }
});

// STEP 5: FrontendAgent lavora
// - Legge il codice generato
// - Aggiunge integrazione API
// - Collega a DataManager
// - Emette evento: "pageLinked"

// STEP 6: Coordinator completa task
// Ritorna risultato completo all'utente
```

### Esempio 2: Monitoraggio Prodotto con Notifica

```javascript
// STEP 1: Utente avvia monitoraggio
POST /api/agents/task
{
  "type": "start_monitor",
  "interestData": { /* ... */ },
  "userId": "user123"
}

// STEP 2: Coordinator assegna a MonitorAgent
MonitorAgent.processTask(task);

// STEP 3: MonitorAgent avvia monitoraggio
// - Crea istanza monitor
// - Inizia polling ogni 5 minuti
// - Emette evento: "monitorStarted"

// STEP 4: Quando prodotto diventa disponibile
MonitorAgent.emit('monitorChange', {
  monitorId: 'monitor-1',
  changeType: 'availability',
  available: true
});

// STEP 5: Coordinator sente evento
// Assegna task a NotificationAgent
NotificationAgent.processTask({
  type: 'send_discord_notification',
  userId: 'user123',
  message: 'Prodotto disponibile!'
});

// STEP 6: NotificationAgent invia notifica
// - Recupera webhook Discord utente
// - Invia messaggio Discord
// - Emette evento: "discordNotificationSent"
```

### Esempio 3: Workout Completato con Statistiche

```javascript
// STEP 1: Utente completa workout
POST /api/agents/task
{
  "type": "complete_workout",
  "userId": "user123",
  "workoutData": { /* ... */ }
}

// STEP 2: Coordinator assegna a SportAgent
SportAgent.processTask(task);

// STEP 3: SportAgent salva workout
// - Salva nel file system
// - Aggiorna statistiche
// - Emette evento: "workoutCompleted"

// STEP 4: Coordinator sente evento
// Assegna task a DataAgent per cache
DataAgent.processTask({
  type: 'cache_data',
  key: 'sport-stats-user123',
  data: { /* statistiche aggiornate */ }
});

// STEP 5: Coordinator assegna a AutomationAgent
// Controlla se ci sono automazioni da triggerare
AutomationAgent.processTask({
  type: 'check_reminders',
  userId: 'user123'
});

// STEP 6: Se ci sono automazioni attive
// AutomationAgent può triggerare notifiche, etc.
```

## 🔍 Monitoring e Debug

### Vedere Cosa Sta Succedendo

```javascript
// 1. Statistiche generali
GET /api/agents/stats
// Ritorna:
// - Numero agenti attivi
// - Task in coda
// - Task in elaborazione
// - Cronologia task recenti

// 2. Stato agente specifico
GET /api/agents/agent/MonitorAgent
// Ritorna:
// - Status (idle/processing/error)
// - Task processati
// - Errori recenti
// - Capabilities

// 3. Eventi in tempo reale
// Gli agenti emettono eventi che puoi ascoltare:
coordinator.on('agentTaskCompleted', (data) => {
    console.log('Task completato:', data);
});

coordinator.on('agentTaskFailed', (data) => {
    console.error('Task fallito:', data);
});
```

## 🎯 Regole di Movimento

### 1. Un Task → Un Agente (di solito)

La maggior parte dei task viene gestita da un singolo agente:

```javascript
// Task semplice: solo MonitorAgent
{ type: 'start_monitor', ... }

// Task semplice: solo SportAgent
{ type: 'complete_workout', ... }
```

### 2. Task Complessi → Più Agenti

Per task complessi, più agenti collaborano:

```javascript
// Task complesso: FigmaAgent + FrontendAgent
{ type: 'create_page_from_figma', ... }
// → FigmaAgent genera codice
// → FrontendAgent integra con backend
```

### 3. Eventi → Nuovi Task

Gli eventi possono triggerare nuovi task:

```javascript
// MonitorAgent emette evento
// → Coordinator crea nuovo task
// → NotificationAgent invia notifica
```

### 4. Priorità e Coda

- Task ad alta priorità vengono processati prima
- Task nella coda vengono processati quando c'è spazio
- Massimo 10 task concorrenti (configurabile)

## 🚀 Best Practices

1. **Usa task types specifici**: Ogni agente gestisce task types specifici
2. **Eventi per comunicazione**: Usa eventi per comunicazione asincrona
3. **Coda per task pesanti**: Usa la coda per task che non richiedono risposta immediata
4. **Monitoring**: Monitora sempre gli agenti per performance
5. **Error handling**: Ogni agente gestisce i propri errori

## 📚 Riepilogo

- **Coordinator**: Distribuisce task, gestisce coda, monitora agenti
- **Agenti**: Processano task specifici, emettono eventi, comunicano tra loro
- **Eventi**: Meccanismo di comunicazione asincrona
- **Coda**: Per task asincroni che non richiedono risposta immediata
- **Priorità**: Determina quale agente gestisce un task quando più agenti possono farlo

Il sistema è **modulare**, **scalabile** e **facile da estendere**!

