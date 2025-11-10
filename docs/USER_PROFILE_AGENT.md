# 👤 UserProfileAgent - Sistema H24 Memorizzazione e Unione Dati Utente

## 🎯 Scopo

**UserProfileAgent** è l'agente più importante del sistema. Unifica **tutti i dati utente** da diverse fonti in un **profilo unico** che può essere sempre ripreso per altre funzioni.

## ✨ Caratteristiche Principali

### 1. **Memorizzazione e Unione Automatica**
- Monitora **tutti i salvataggi dati** da tutte le pagine
- Unifica automaticamente in un profilo unico
- Mantiene coerenza tra dati sparsi

### 2. **Verifica Continua H24**
- Verifica ogni minuto la coerenza dei dati
- Rileva problemi e inconsistenze
- Notifica altri agenti di cambiamenti

### 3. **Comunicazione Inter-Agente**
- Comunica con tutti gli altri agenti
- Notifica cambiamenti dati in tempo reale
- Coordina aggiornamenti tra agenti

## 📋 Dati Unificati

Il profilo unificato include:

- **Account**: Dati account utente
- **Sport**: Profilo sport, workout, programmi
- **Interests**: Interessi e monitor prodotti
- **Automations**: Automazioni sport, abitudini, notifiche
- **Webhooks**: Webhook Discord configurati
- **eBay**: Token e connessioni eBay
- **Diet**: Dati dieta e ricette
- **Monitors**: Monitor prodotti attivi

## 🔄 Come Funziona

### Monitoraggio Automatico

Quando un endpoint salva dati, **UserProfileAgent** viene notificato automaticamente:

```javascript
// Esempio: quando si salva profilo sport
await coordinator.assignTask({
    type: 'monitor_data_changes',
    userId,
    dataType: 'sport',
    data: profileData,
    source: 'sport_profile_endpoint'
});
```

### Unificazione

UserProfileAgent:
1. Carica dati da tutte le fonti
2. Unifica in un profilo unico
3. Salva in `data/user-profiles/{userId}_unified.json`
4. Aggiorna cache in memoria
5. Notifica altri agenti

### Verifica Continua H24

Ogni minuto:
1. Verifica tutti i profili salvati
2. Controlla coerenza dati
3. Rileva problemi
4. Sincronizza se necessario
5. Notifica altri agenti di problemi

## 🔌 API Endpoints

### GET `/api/user-profile/:userId`
Ottiene profilo unificato utente

```javascript
GET /api/user-profile/shappa?forceRefresh=true
```

**Response:**
```json
{
  "success": true,
  "userId": "shappa",
  "data": {
    "account": {...},
    "sport": {...},
    "interests": [...],
    "automations": {...},
    "webhooks": {...},
    "ebay": {...},
    "diet": {...},
    "monitors": [...],
    "metadata": {
      "lastUnified": "2025-11-10T16:00:00.000Z",
      "version": "2.0"
    }
  },
  "fromCache": false
}
```

### POST `/api/user-profile/:userId/unify`
Forza unificazione dati utente

```javascript
POST /api/user-profile/shappa/unify
```

### POST `/api/user-profile/:userId/verify`
Verifica coerenza dati utente

```javascript
POST /api/user-profile/shappa/verify
```

**Response:**
```json
{
  "success": true,
  "userId": "shappa",
  "verified": true,
  "issues": [],
  "warnings": [],
  "data": {...}
}
```

### GET `/api/user-profile/:userId/history`
Ottiene history cambiamenti dati

```javascript
GET /api/user-profile/shappa/history?limit=50
```

## 🔗 Integrazione con Endpoint Esistenti

UserProfileAgent è integrato automaticamente con:

- ✅ `/api/sport/profile` - Salvataggio profilo sport
- ✅ `/api/interests/:userId` - Salvataggio interessi
- ✅ `/api/webhooks/:userId` - Salvataggio webhook
- ✅ `/api/automations/sport` - Salvataggio automazioni sport
- ✅ `/api/automations/habits` - Salvataggio automazioni abitudini
- ✅ `/api/automations/notifications` - Salvataggio notifiche

## 💬 Comunicazione Inter-Agente

UserProfileAgent comunica con altri agenti attraverso:

### Eventi Emessi:
- `userProfileUnified` - Profilo unificato
- `userProfileUpdated` - Profilo aggiornato
- `userDataIssues` - Problemi rilevati nei dati

### Notifiche Inviate:
- `userProfileUnified` - Notifica quando unifica dati
- `userProfileUpdated` - Notifica quando aggiorna dati
- `userDataIssues` - Notifica quando rileva problemi

## 🚀 Configurazione

### Variabili d'Ambiente

Aggiungi in `.env.private`:

```bash
FIGMA_API_KEY=your_figma_api_key_here
```

**Nota:** La chiave Figma deve essere configurata come variabile d'ambiente, non hardcodata nel codice.

### Configurazione Agente

In `server.js`:

```javascript
userProfile: {
    priority: 10, // Priorità massima
    verificationIntervalMs: 60000 // Verifica ogni minuto
}
```

## 📊 Monitoraggio

### Log Console

UserProfileAgent logga:
- ✅ Unificazioni profili
- ✅ Aggiornamenti dati
- ✅ Problemi rilevati
- ✅ Verifiche H24

### Statistiche

Usa endpoint `/api/agents/communication-stats` per vedere:
- Comunicazioni tra agenti
- Statistiche UserProfileAgent
- Heartbeat status

## 🔍 Troubleshooting

### Profilo non si aggiorna

1. Verifica che UserProfileAgent sia registrato:
   ```bash
   # Controlla log server
   grep "UserProfileAgent" server.log
   ```

2. Forza unificazione:
   ```bash
   curl -X POST http://localhost:3000/api/user-profile/shappa/unify
   ```

3. Verifica dati:
   ```bash
   curl -X POST http://localhost:3000/api/user-profile/shappa/verify
   ```

### Dati mancanti nel profilo

1. Verifica che i file sorgente esistano:
   - `data/sport/{userId}_profile.json`
   - `data/interests/{userId}.json`
   - `data/automations/{userId}.json`
   - etc.

2. Controlla history cambiamenti:
   ```bash
   curl http://localhost:3000/api/user-profile/shappa/history
   ```

## 🎯 Best Practices

1. **Usa sempre il profilo unificato** per altre funzioni
2. **Non salvare dati direttamente** - usa gli endpoint che notificano UserProfileAgent
3. **Verifica periodicamente** la coerenza dati
4. **Monitora i log** per problemi

## 📝 Esempio Uso

```javascript
// Ottieni profilo unificato
const response = await fetch('/api/user-profile/shappa');
const { data } = await response.json();

// Usa dati unificati
const sportProfile = data.sport;
const interests = data.interests;
const automations = data.automations;

// Tutti i dati utente in un unico oggetto!
```

---

**UserProfileAgent è il cuore del sistema H24 - mantiene tutti i dati utente unificati e sempre aggiornati!** 🚀

