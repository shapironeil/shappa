# Token Persistence & Auto-Refresh System

## 🎯 Problema Risolto

Prima, quando ricaricavi la pagina o chiudevi il browser, la connessione eBay veniva persa perché:
- ❌ Il token scadeva dopo 2 ore
- ❌ Non veniva salvato il refresh_token
- ❌ Nessun meccanismo di auto-refresh

## ✅ Soluzione Implementata

### 1. **Salvataggio Refresh Token**
Ora salviamo anche il `refresh_token` (valido per ~18 mesi) insieme all'access token:

```javascript
const ebayConnection = {
    connected: true,
    userId: '...',
    username: '...',
    accessToken: 'v^1.1#i^1...',     // Valido 2 ore
    refreshToken: 'v^1.1#i^1#r^1...', // Valido 18 mesi ✅
    tokenExpiry: '2025-10-09T20:12:00.000Z',
    // ... altri dati
};
```

### 2. **Auto-Refresh Intelligente**

#### Al caricamento pagina:
```javascript
if (tokenExpiry > now) {
    // Token valido, carica connessione
    if (minutesUntilExpiry < 30) {
        // Se scade tra meno di 30 minuti, rinnova subito
        refreshEbayToken(refreshToken);
    }
} else {
    // Token scaduto, prova refresh automatico
    if (refreshToken) {
        refreshEbayToken(refreshToken);
    }
}
```

#### Controllo periodico:
- ⏰ **Ogni 30 minuti** controlla se il token sta per scadere
- 🔄 **Se manca meno di 1 ora**, rinnova automaticamente
- ✅ **Utente resta sempre connesso** senza interruzioni

### 3. **Nuovo Endpoint Backend**

```http
POST /api/ebay/refresh-token
Content-Type: application/json

{
  "refresh_token": "v^1.1#i^1#r^1..."
}
```

**Response:**
```json
{
  "success": true,
  "access_token": "v^1.1#i^1...",
  "expires_in": 7200,
  "token_type": "User Access Token"
}
```

## 🔄 Flusso Completo

### Primo Login
```
1. User clicca "Connetti eBay"
2. OAuth flow completa
3. Riceve: access_token + refresh_token
4. Salva ENTRAMBI nel profilo utente
5. ✅ Connesso per ~18 mesi
```

### Ricarica Pagina
```
1. loadSettings() carica dati dal profilo
2. Controlla se token è valido
   
   a) Token valido (< 2 ore):
      ✅ Ripristina connessione
      
   b) Token scaduto MA refresh_token valido:
      🔄 Chiama /api/ebay/refresh-token
      ✅ Ottiene nuovo access_token
      ✅ Aggiorna profilo
      ✅ User resta connesso!
      
   c) Anche refresh_token scaduto:
      ❌ Disconnetti
      ℹ️ Mostra messaggio: "Sessione scaduta, riconnetti"
```

### Durante Utilizzo
```
Timer ogni 30 minuti:
  1. Controlla scadenza token
  2. Se < 1 ora:
     🔄 Refresh automatico preventivo
     ✅ User non si accorge nemmeno!
```

## 📊 Timeline Token

```
Time      | Access Token | Refresh Token | Action
----------|--------------|---------------|---------------------------
0h        | ✅ Valid     | ✅ Valid      | Login completato
1h 30m    | ✅ Valid     | ✅ Valid      | Auto-refresh preventivo 🔄
2h        | ✅ RENEWED   | ✅ Valid      | Nuovo access token
3h 30m    | ✅ Valid     | ✅ Valid      | Auto-refresh preventivo 🔄
4h        | ✅ RENEWED   | ✅ Valid      | Nuovo access token
...       | ...          | ...           | ...
18 mesi   | ⚠️ Expired   | ⚠️ EXPIRED    | Richiede nuovo login
```

## 🛡️ Gestione Errori

### Refresh fallisce
```javascript
catch (error) {
    console.error('❌ Errore refresh token:', error);
    
    // Disconnetti automaticamente
    this.connections.ebay.connected = false;
    this.updateUserProfile({
        ebayConnected: false,
        ebayData: null
    });
    
    // Notifica utente
    this.showNotification(
        'Sessione eBay scaduta, effettua nuovamente il login', 
        'error'
    );
}
```

### Refresh token scaduto
- ⚠️ Succede solo dopo ~18 mesi
- ℹ️ User deve rifare OAuth flow completo
- ✅ Processo trasparente e guidato

## 🔐 Sicurezza

### Development (Attuale)
```javascript
// Salvato in localStorage via AuthManager
{
  ebayData: {
    accessToken: "plaintext",     // ⚠️ Non ideale
    refreshToken: "plaintext"     // ⚠️ Non ideale
  }
}
```

### Production (Futuro)
```javascript
// Database con encryption
{
  ebayData: {
    accessToken: {
      encrypted: "...",
      iv: "...",
      authTag: "..."
    },
    refreshToken: {
      encrypted: "...",  // ✅ AES-256-GCM
      iv: "...",
      authTag: "..."
    }
  }
}
```

## 📝 File Modificati

### 1. `src/utils/settings.js`
- ✅ `loadSettings()`: Controllo scadenza + auto-refresh
- ✅ `refreshEbayToken()`: Nuovo metodo per rinnovare token
- ✅ `startTokenRefreshCheck()`: Timer periodico ogni 30 min
- ✅ `connectEbayReal()`: Salva anche refresh_token

### 2. `server.js`
- ✅ `POST /api/ebay/refresh-token`: Nuovo endpoint
- ✅ Gestione errori refresh
- ✅ Logging dettagliato

## 🧪 Testing

### Test 1: Primo Login
1. Connetti eBay
2. Verifica che salva `refreshToken`
3. ✅ Controlla console: `refreshToken: "v^1.1#..."`

### Test 2: Ricarica Pagina
1. Fai login eBay
2. Ricarica pagina (F5)
3. ✅ Deve rimanere connesso
4. ✅ Console: "Connessione eBay valida ripristinata"

### Test 3: Token Scaduto
1. Modifica manualmente `tokenExpiry` nel profilo (passato)
2. Ricarica pagina
3. ✅ Console: "Token eBay scaduto"
4. ✅ Console: "Tentativo di refresh token automatico..."
5. ✅ Deve rinnovarsi automaticamente

### Test 4: Refresh Periodico
1. Fai login
2. Aspetta 30 minuti
3. ✅ Console: "Token check: scade tra X minuti"
4. ✅ Se < 60 min: auto-refresh

## 📈 Miglioramenti Futuri

### Short Term
- [ ] Mostrare countdown scadenza token in UI
- [ ] Notifica toast quando viene rinnovato
- [ ] Indicatore "ultimo refresh" nella card

### Long Term
- [ ] Encryption token in database
- [ ] Webhook eBay per invalidazione token
- [ ] Multi-account eBay per stesso utente
- [ ] Gestione token revocati

## 🎓 Come Funziona OAuth Refresh

```
┌─────────────┐              ┌──────────┐              ┌─────────┐
│   Browser   │              │  Server  │              │  eBay   │
└──────┬──────┘              └────┬─────┘              └────┬────┘
       │                          │                         │
       │  1. Login OAuth          │                         │
       │─────────────────────────>│────────────────────────>│
       │                          │                         │
       │  2. access_token +       │                         │
       │     refresh_token        │                         │
       │<─────────────────────────│<────────────────────────│
       │                          │                         │
       │  [Salva entrambi]        │                         │
       │                          │                         │
       │  ... 2 ore dopo ...      │                         │
       │                          │                         │
       │  3. POST refresh-token   │                         │
       │─────────────────────────>│                         │
       │                          │                         │
       │                          │  4. Richiedi nuovo      │
       │                          │─────────────────────────>│
       │                          │                         │
       │                          │  5. nuovo access_token  │
       │  6. Nuovo token          │<────────────────────────│
       │<─────────────────────────│                         │
       │                          │                         │
       │  [Aggiorna profilo]      │                         │
       │  ✅ Resta connesso!      │                         │
```

## ✅ Risultato Finale

- ✅ **Token persiste per ~18 mesi** (durata refresh token)
- ✅ **Ricarica pagina** → Rimani connesso
- ✅ **Chiudi e riapri browser** → Rimani connesso
- ✅ **Rinnovo automatico** ogni ~2 ore
- ✅ **Zero interruzioni** per l'utente
- ✅ **Notifica solo** se refresh token scaduto (dopo 18 mesi)

---

**Last Updated**: 9 Ottobre 2025
**Version**: 2.1.0
**Author**: Shappa Development Team
