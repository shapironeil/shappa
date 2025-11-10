# 🎬 Esempio Pratico: Come gli Agenti si Muovono

## Scenario: Creare una Pagina Dashboard da Figma

Immaginiamo di voler creare una pagina dashboard partendo da un design Figma.

### 📋 Passo per Passo

```javascript
// ============================================
// PASSO 1: Utente fa richiesta
// ============================================
POST /api/figma/create-page
{
  "fileKey": "abc123xyz",
  "pageName": "dashboard",
  "backendConfig": {
    "endpoints": [
      { "path": "/api/sport/profile/:userId", "method": "GET" }
    ]
  }
}

// ============================================
// PASSO 2: Coordinator riceve il task
// ============================================
Coordinator.assignTask({
  type: 'create_page_from_figma',
  fileKey: 'abc123xyz',
  pageName: 'dashboard',
  backendConfig: { /* ... */ }
})

// Coordinator pensa:
// "Chi può gestire 'create_page_from_figma'?"
// 
// Chiede a tutti gli agenti:
// - MonitorAgent.canHandle() → false ❌
// - SportAgent.canHandle() → false ❌
// - FigmaAgent.canHandle() → true ✅
// - FrontendAgent.canHandle() → false ❌
// - ...
//
// "FigmaAgent può gestirlo! Priorità: 8"

// ============================================
// PASSO 3: FigmaAgent lavora
// ============================================
FigmaAgent.processTask(task) {
  // 3.1: Chiama API Figma
  const fileData = await fetchFigmaFile('abc123xyz');
  // ✅ File recuperato
  
  // 3.2: Analizza componenti
  const components = extractComponents(fileData);
  // ✅ Trovati 15 componenti:
  //    - Button (3x)
  //    - Card (5x)
  //    - Input (2x)
  //    - List (1x)
  //    - etc.
  
  // 3.3: Genera codice
  const code = generateCodeFromComponents(components);
  // ✅ Generato:
  //    - dashboard.html
  //    - dashboard.css
  //    - dashboard.js
  
  // 3.4: Emette evento
  this.emit('frontendCodeGenerated', {
    pagePath: 'src/pages/dashboard.html',
    code: code
  });
  
  return {
    success: true,
    pagePath: 'src/pages/dashboard.html',
    components: 15
  };
}

// ============================================
// PASSO 4: Coordinator sente l'evento
// ============================================
Coordinator.on('frontendCodeGenerated', (data) => {
  // "Il codice è stato generato! Ora devo collegarlo al backend"
  
  // Crea nuovo task per FrontendAgent
  coordinator.assignTask({
    type: 'link_page_to_api',
    pagePath: data.pagePath,
    apiConfig: task.backendConfig
  });
});

// ============================================
// PASSO 5: FrontendAgent lavora
// ============================================
FrontendAgent.processTask({
  type: 'link_page_to_api',
  pagePath: 'src/pages/dashboard.html',
  apiConfig: { /* ... */ }
}) {
  // 5.1: Legge il file HTML generato
  const htmlContent = fs.readFileSync('src/pages/dashboard.html');
  
  // 5.2: Genera codice integrazione API
  const integrationCode = generateBackendIntegration([
    { path: '/api/sport/profile/:userId', method: 'GET' }
  ]);
  // ✅ Generato codice JavaScript per chiamare API
  
  // 5.3: Aggiunge integrazione al file HTML
  const updatedHtml = addIntegrationToPage(htmlContent, integrationCode);
  
  // 5.4: Salva file aggiornato
  fs.writeFileSync('src/pages/dashboard.html', updatedHtml);
  
  // 5.5: Emette evento
  this.emit('pageLinked', {
    pagePath: 'src/pages/dashboard.html',
    endpoints: 1
  });
  
  return {
    success: true,
    pagePath: 'src/pages/dashboard.html',
    endpoints: 1
  };
}

// ============================================
// PASSO 6: Coordinator completa task
// ============================================
// Coordinator combina i risultati:
return {
  success: true,
  pagePath: 'src/pages/dashboard.html',
  components: 15,
  endpoints: 1,
  code: { html, css, js },
  integrationCode: integrationCode
};

// ============================================
// RISULTATO FINALE
// ============================================
// ✅ Pagina creata: src/pages/dashboard.html
// ✅ 15 componenti generati
// ✅ Collegata a 1 endpoint API
// ✅ Pronta per l'uso!
```

## 🔄 Diagramma di Flusso Visivo

```
┌─────────────┐
│   UTENTE    │
│  Richiede   │
│  creazione  │
│   pagina    │
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│   COORDINATOR   │
│                 │
│ 1. Riceve task  │
│ 2. Trova agente │
│    appropriato  │
└──────┬──────────┘
       │
       │ "create_page_from_figma"
       │
       ▼
┌─────────────────┐
│  FIGMA AGENT    │
│                 │
│ 1. Chiama API   │
│    Figma        │
│ 2. Analizza     │
│    componenti   │
│ 3. Genera       │
│    codice       │
└──────┬──────────┘
       │
       │ Emette evento:
       │ "frontendCodeGenerated"
       │
       ▼
┌─────────────────┐
│   COORDINATOR   │
│                 │
│ Sente evento e  │
│ crea nuovo task │
└──────┬──────────┘
       │
       │ "link_page_to_api"
       │
       ▼
┌─────────────────┐
│ FRONTEND AGENT  │
│                 │
│ 1. Legge file   │
│ 2. Genera       │
│    integrazione │
│ 3. Collega API  │
└──────┬──────────┘
       │
       │ Emette evento:
       │ "pageLinked"
       │
       ▼
┌─────────────────┐
│   COORDINATOR   │
│                 │
│ Combina         │
│ risultati e     │
│ ritorna a       │
│ utente          │
└──────┬──────────┘
       │
       ▼
┌─────────────┐
│   UTENTE    │
│ Riceve      │
│ pagina      │
│ completa!   │
└─────────────┘
```

## 🎯 Come Decidono Quale Agente Usare

### Metodo `canHandle()`

Ogni agente ha una lista di task che può gestire:

```javascript
// FigmaAgent
canHandle(task) {
  const figmaTasks = [
    'create_page_from_figma',  // ✅
    'sync_figma_design',        // ✅
    'analyze_figma_components', // ✅
    'start_monitor'             // ❌
  ];
  return figmaTasks.includes(task.type);
}

// MonitorAgent
canHandle(task) {
  const monitorTasks = [
    'start_monitor',            // ✅
    'stop_monitor',             // ✅
    'create_page_from_figma'    // ❌
  ];
  return monitorTasks.includes(task.type);
}
```

### Priorità

Se più agenti possono gestire lo stesso task, viene scelto quello con priorità più alta:

```javascript
// SecurityAgent: priorità 10 (massima)
// MonitorAgent: priorità 8
// SportAgent: priorità 7

// Se un task può essere gestito da più agenti,
// Coordinator sceglie quello con priorità più alta
```

## 💬 Comunicazione tra Agenti

### 1. Tramite Eventi (Asincrona)

```javascript
// MonitorAgent emette evento
this.emit('monitorChange', {
  monitorId: 'monitor-1',
  available: true
});

// NotificationAgent ascolta
coordinator.on('monitorChange', async (data) => {
  if (data.available) {
    await coordinator.assignTask({
      type: 'send_discord_notification',
      userId: data.userId,
      message: 'Prodotto disponibile!'
    });
  }
});
```

### 2. Tramite Coordinator (Sincrona)

```javascript
// Coordinator fa comunicare due agenti
const result = await coordinator.communicateWithAgent('FigmaAgent', {
  action: 'get_file_info',
  fileKey: 'abc123'
});
```

### 3. Tramite Task Coordinati

```javascript
// Coordinator coordina più agenti per un task complesso
await coordinator.coordinateTask({
  type: 'create_complete_page',
  figmaFileKey: 'abc123',
  backendConfig: { /* ... */ }
});

// Coordinator:
// 1. Assegna a FigmaAgent → genera codice
// 2. Assegna a FrontendAgent → integra API
// 3. Assegna a DataAgent → gestisce cache
// 4. Ritorna risultato combinato
```

## 📊 Esempio Reale: Monitoraggio Prodotto

```javascript
// ============================================
// SCENARIO: Monitoraggio prodotto Amazon
// ============================================

// 1. Utente avvia monitoraggio
POST /api/agents/task
{
  "type": "start_monitor",
  "interestData": {
    "id": "monitor-1",
    "name": "iPhone 15 Pro",
    "url": "https://amazon.it/iphone15pro",
    "interval": 5
  },
  "userId": "user123"
}

// 2. Coordinator trova MonitorAgent
//    MonitorAgent.canHandle('start_monitor') → true ✅

// 3. MonitorAgent avvia monitoraggio
MonitorAgent.startMonitor({
  interestData: { /* ... */ },
  userId: 'user123'
}) {
  // Crea monitor
  const monitor = new UniversalMonitor(config);
  await monitor.start();
  
  // Monitor inizia a controllare ogni 5 minuti
  setInterval(async () => {
    const result = await monitor.check();
    
    if (result.available) {
      // Prodotto disponibile!
      this.emit('monitorChange', {
        monitorId: 'monitor-1',
        changeType: 'availability',
        available: true,
        userId: 'user123'
      });
    }
  }, 5 * 60 * 1000);
}

// 4. Coordinator sente evento "monitorChange"
//    Assegna nuovo task a NotificationAgent

// 5. NotificationAgent invia notifica Discord
NotificationAgent.sendDiscordNotification({
  userId: 'user123',
  message: 'iPhone 15 Pro disponibile!',
  embeds: [{
    title: 'Prodotto Disponibile',
    description: 'Il prodotto che stavi monitorando è ora disponibile',
    url: 'https://amazon.it/iphone15pro'
  }]
}) {
  // Recupera webhook Discord utente
  const webhook = await getWebhook('user123');
  
  // Invia notifica
  await axios.post(webhook.url, {
    content: 'iPhone 15 Pro disponibile!',
    embeds: [/* ... */]
  });
  
  // Emette evento
  this.emit('discordNotificationSent', {
    userId: 'user123',
    success: true
  });
}

// 6. Utente riceve notifica Discord! 🎉
```

## 🎓 Riepilogo

1. **Coordinator** = Manager che distribuisce il lavoro
2. **Agenti** = Specialisti che sanno fare cose specifiche
3. **canHandle()** = Ogni agente dice cosa può fare
4. **Priorità** = Se più agenti possono fare qualcosa, sceglie il migliore
5. **Eventi** = Agenti comunicano tra loro tramite eventi
6. **Coda** = Per task che non richiedono risposta immediata

Il sistema è **intelligente**, **modulare** e **scalabile**! 🚀

