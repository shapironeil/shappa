# 🤖 BotAgent - Guida Completa

## 📋 Panoramica

**BotAgent** gestisce tutte le interazioni con il bot Discord, inclusi comandi, interazioni (bottoni, select menus) e conferme da Discord.

## 🎯 Funzionalità Principali

### 1. Gestione Comandi Discord

BotAgent supporta comandi testuali e slash commands:

- `/complete_workout` - Conferma completamento workout
- `/workout_stats` - Mostra statistiche workout
- `/monitor_status` - Mostra stato monitor attivi
- `/stop_monitor` - Ferma un monitor
- `/profile` - Mostra profilo utente
- `/diet_today` - Mostra dieta di oggi
- `/analyze_image` - Analizza immagine caricata

### 2. Gestione Interazioni

**Buttons:**
- `complete_workout:workoutId:date` - Conferma workout
- `stop_monitor:interestId` - Ferma monitor
- `view_product:productId` - Vedi prodotto

**Select Menus:**
- `select_workout` - Seleziona workout
- `select_diet` - Seleziona dieta

**Modals:**
- `update_profile` - Aggiorna profilo

## 🔧 API Endpoints

### POST /api/bot/command
Gestisce comando bot Discord.

**Request:**
```json
{
    "command": "complete_workout",
    "userId": "shappa",
    "discordUserId": "123456789",
    "options": {
        "workoutId": "1",
        "date": "2024-11-10"
    }
}
```

**Response:**
```json
{
    "success": true,
    "result": { ... },
    "response": "✅ Workout confermato con successo!"
}
```

### POST /api/bot/interaction
Gestisce interazione Discord (button, select, modal).

**Request:**
```json
{
    "interactionType": "button",
    "customId": "complete_workout:1:2024-11-10",
    "userId": "shappa",
    "discordUserId": "123456789"
}
```

### POST /api/bot/workout-confirm
Conferma workout da Discord.

**Request:**
```json
{
    "userId": "shappa",
    "workoutId": "1",
    "workoutDate": "2024-11-10",
    "confirmed": true
}
```

### POST /api/bot/product-alert-response
Gestisce risposta a alert prodotto.

**Request:**
```json
{
    "userId": "shappa",
    "productId": "product123",
    "action": "stop_monitor",
    "interestId": "interest123"
}
```

### POST /api/bot/send-response
Invia risposta bot a Discord.

**Request:**
```json
{
    "userId": "shappa",
    "message": "Messaggio",
    "embeds": [ ... ],
    "components": [ ... ]
}
```

## 🎨 Notifiche con Bottoni

### Esempio: Notifica Workout con Bottoni

```javascript
const embed = {
    title: '💪 Workout Programmat',
    color: 0x3b82f6,
    fields: [
        { name: 'Programma', value: 'Forza di Base', inline: true },
        { name: 'Frequenza', value: '3x/settimana', inline: true }
    ]
};

const components = [{
    type: 1, // ACTION_ROW
    components: [
        {
            type: 2, // BUTTON
            style: 3, // SUCCESS (green)
            label: 'Conferma Workout',
            custom_id: 'complete_workout:1:2024-11-10',
            emoji: { name: '✅' }
        },
        {
            type: 2, // BUTTON
            style: 1, // PRIMARY (blue)
            label: 'Vedi Statistiche',
            custom_id: 'workout_stats:shappa',
            emoji: { name: '📊' }
        }
    ]
}];

await coordinator.assignTask({
    type: 'send_bot_response',
    userId: 'shappa',
    embeds: [embed],
    components
});
```

### Esempio: Alert Prodotto con Bottoni

```javascript
const embed = {
    title: '🚨 Prodotto Disponibile!',
    url: productUrl,
    color: 0x10b981,
    fields: [
        { name: 'Prodotto', value: productName },
        { name: 'Prezzo', value: price }
    ]
};

const components = [{
    type: 1,
    components: [
        {
            type: 2,
            style: 3, // SUCCESS
            label: 'Vedi Prodotto',
            custom_id: `view_product:${productId}`,
            emoji: { name: '🔗' }
        },
        {
            type: 2,
            style: 4, // DANGER
            label: 'Ferma Monitor',
            custom_id: `stop_monitor:${interestId}`,
            emoji: { name: '🛑' }
        }
    ]
}];
```

## 🔄 Integrazione con Altri Agenti

BotAgent coordina con altri agenti:

- **SportAgent**: Per confermare workout e ottenere statistiche
- **MonitorAgent**: Per gestire monitor prodotti
- **UserProfileAgent**: Per ottenere profilo utente
- **AIAgent**: Per analizzare immagini
- **NotificationAgent**: Per inviare notifiche

## 📝 Esempi d'Uso

### Conferma Workout da Discord

```javascript
// Quando l'utente clicca il bottone "Conferma Workout"
POST /api/bot/interaction
{
    "interactionType": "button",
    "customId": "complete_workout:1:2024-11-10",
    "userId": "shappa"
}

// BotAgent:
// 1. Chiama SportAgent per completare workout
// 2. Notifica UserProfileAgent del cambiamento
// 3. Risponde a Discord con conferma
```

### Ferma Monitor da Discord

```javascript
// Quando l'utente clicca "Ferma Monitor" su alert prodotto
POST /api/bot/interaction
{
    "interactionType": "button",
    "customId": "stop_monitor:interest123",
    "userId": "shappa"
}

// BotAgent:
// 1. Chiama MonitorAgent per fermare monitor
// 2. Notifica UserProfileAgent
// 3. Risponde a Discord con conferma
```

## 🎯 Best Practices

1. **Sempre includere userId** per autenticazione
2. **Usare custom_id univoci** per bottoni/interazioni
3. **Gestire errori gracefully** e rispondere sempre a Discord
4. **Notificare UserProfileAgent** di tutti i cambiamenti
5. **Usare embeds** per notifiche formattate
6. **Aggiungere bottoni** per interazioni rapide

---

**BotAgent è il ponte tra Discord e il sistema di agenti!** 🚀

