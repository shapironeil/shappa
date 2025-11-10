# 🤖 Sistema Agenti H24 - Gran Consiglio di Verifica

## 🎯 Visione Generale

Il sistema di agenti è stato trasformato in un **Gran Consiglio di Verifica H24** dove gli agenti:
- ✅ Comunicano continuamente tra loro
- ✅ Verificano e aggiornano dati in tempo reale
- ✅ Mantengono coerenza del sistema
- ✅ Funzionano 24/7 senza interruzioni

## 👥 Agenti del Consiglio

### 1. **UserProfileAgent** (Priorità 10) ⭐
**Il più importante** - Unifica tutti i dati utente

- Memorizza e unisce dati da tutte le pagine
- Verifica continua H24 ogni minuto
- Mantiene profilo unificato sempre aggiornato
- Notifica altri agenti di cambiamenti

### 2. **SecurityAgent** (Priorità 9)
- Verifica sicurezza e autenticazione
- Monitora accessi
- Gestisce sessioni

### 3. **MonitorAgent** (Priorità 8)
- Monitora prodotti e disponibilità
- Verifica prezzi
- Notifica disponibilità

### 4. **SportAgent** (Priorità 7)
- Gestisce workout e allenamenti
- Sincronizza con UserProfileAgent
- Notifica workout

### 5. **IntegrationAgent** (Priorità 7)
- Gestisce integrazioni esterne
- eBay, Discord, etc.
- Sincronizza con UserProfileAgent

### 6. **FrontendAgent** (Priorità 7)
- Gestisce integrazione UI
- Sincronizza con FigmaAgent
- Aggiorna pagine

### 7. **NotificationAgent** (Priorità 7)
- Gestisce notifiche
- Discord, email, etc.
- Coordina con altri agenti

### 8. **DataAgent** (Priorità 6)
- Gestisce cache e storage
- Ottimizza accesso dati
- Sincronizza con UserProfileAgent

### 9. **AutomationAgent** (Priorità 6)
- Gestisce automazioni
- Sincronizza con UserProfileAgent
- Coordina automazioni

### 10. **FigmaAgent** (Priorità 8)
- Gestisce design Figma
- Sincronizza design con codice
- Esporta assets

### 11. **RecipeAgent** (Priorità 5)
- Gestisce ricette
- Integrazione GialloZafferano
- Sincronizza con database

## 🔄 Comunicazione Inter-Agente

### Sistema di Broadcast

Gli agenti comunicano attraverso:

1. **Broadcast Globale**
   ```javascript
   coordinator.broadcast('dataChanged', { userId, dataType });
   ```

2. **Comunicazione Diretta**
   ```javascript
   agent.communicate('UserProfileAgent', { message: 'update needed' });
   ```

3. **Event Subscriptions**
   ```javascript
   coordinator.subscribe('SportAgent', 'userProfileUpdated');
   ```

4. **Heartbeat System**
   - Verifica ogni 30 secondi che tutti gli agenti siano attivi
   - Rileva agenti non rispondenti
   - Notifica problemi

### Flusso di Comunicazione

```
Utente salva dati
    ↓
Endpoint API salva file
    ↓
Notifica UserProfileAgent
    ↓
UserProfileAgent unifica dati
    ↓
Broadcast a tutti gli agenti
    ↓
Altri agenti aggiornano se necessario
    ↓
Sistema sempre sincronizzato
```

## 🔍 Verifica Continua H24

### UserProfileAgent
- **Frequenza**: Ogni minuto
- **Azione**: Verifica tutti i profili utente
- **Risultato**: Unifica e sincronizza dati

### Coordinator Heartbeat
- **Frequenza**: Ogni 30 secondi
- **Azione**: Verifica che tutti gli agenti siano attivi
- **Risultato**: Rileva problemi e notifica

### Altri Agenti
- Monitorano cambiamenti in tempo reale
- Reagiscono a eventi broadcast
- Aggiornano dati quando necessario

## 📊 Monitoraggio Sistema

### Endpoint API

#### `/api/agents/stats`
Statistiche generali sistema agenti

#### `/api/agents/heartbeat`
Stato heartbeat di tutti gli agenti

#### `/api/agents/communications`
Log comunicazioni tra agenti

#### `/api/agents/communication-stats`
Statistiche comunicazioni

#### `/api/agents/broadcast`
Invia broadcast a tutti gli agenti

#### `/api/agents/subscribe`
Iscrivi agente a tipo di evento

## 🎯 Workflow H24

### 1. **All'avvio Server**
- Tutti gli agenti vengono registrati
- UserProfileAgent avvia verifica continua
- Coordinator avvia heartbeat
- Sistema pronto H24

### 2. **Durante Operazione**
- Utente salva dati → UserProfileAgent notificato
- UserProfileAgent unifica → Broadcast a tutti
- Altri agenti reagiscono → Sistema aggiornato
- Verifica continua → Problemi rilevati

### 3. **Verifica Periodica**
- Ogni minuto: UserProfileAgent verifica profili
- Ogni 30 secondi: Coordinator verifica agenti
- Continuo: Agenti monitorano cambiamenti

## 🔧 Configurazione

### Avvio Sistema

Il sistema si avvia automaticamente quando il server parte:

```javascript
// server.js
const { coordinator } = initializeAgents({
    userProfile: {
        priority: 10,
        verificationIntervalMs: 60000 // 1 minuto
    },
    // ... altri agenti
});
```

### Configurazione Agenti

Ogni agente può essere configurato:

```javascript
{
    priority: 10, // 1-10, 10 = massima priorità
    // ... altre configurazioni specifiche
}
```

## 📝 Esempi

### Esempio 1: Salvataggio Dati

```javascript
// Endpoint salva dati
app.post('/api/sport/profile', async (req, res) => {
    // Salva file
    fs.writeFileSync(path, data);
    
    // Notifica UserProfileAgent
    await coordinator.assignTask({
        type: 'monitor_data_changes',
        userId,
        dataType: 'sport',
        data: profileData,
        source: 'sport_profile_endpoint'
    });
    
    // UserProfileAgent unifica automaticamente
    // Altri agenti vengono notificati
});
```

### Esempio 2: Broadcast Evento

```javascript
// Qualsiasi agente può broadcastare
coordinator.broadcast('productAvailable', {
    productId: '123',
    userId: 'shappa'
});

// Altri agenti reagiscono
NotificationAgent.on('productAvailable', (data) => {
    // Invia notifica
});
```

### Esempio 3: Comunicazione Diretta

```javascript
// Agente A comunica con Agente B
sportAgent.communicate('UserProfileAgent', {
    message: 'Workout completed',
    data: workoutData
});
```

## 🚨 Troubleshooting

### Agente non risponde

1. Controlla heartbeat:
   ```bash
   curl http://localhost:3000/api/agents/heartbeat
   ```

2. Verifica log:
   ```bash
   grep "Agent" server.log
   ```

3. Riavvia agente (riavvia server)

### Dati non sincronizzati

1. Forza unificazione:
   ```bash
   curl -X POST http://localhost:3000/api/user-profile/shappa/unify
   ```

2. Verifica comunicazioni:
   ```bash
   curl http://localhost:3000/api/agents/communications
   ```

### Sistema lento

1. Controlla statistiche:
   ```bash
   curl http://localhost:3000/api/agents/stats
   ```

2. Verifica cache:
   ```bash
   curl http://localhost:3000/api/agents/communication-stats
   ```

## 🎯 Best Practices

1. **Usa sempre UserProfileAgent** per dati utente
2. **Notifica sempre UserProfileAgent** quando salvi dati
3. **Usa broadcast** per eventi globali
4. **Monitora heartbeat** per rilevare problemi
5. **Verifica periodicamente** la coerenza dati

---

**Il sistema di agenti funziona H24 come un Gran Consiglio che verifica e mantiene tutto sincronizzato!** 🚀

