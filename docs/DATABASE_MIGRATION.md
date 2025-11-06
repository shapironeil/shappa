# Piano di Migrazione Database

## Stato Attuale (Sviluppo)
Attualmente l'applicazione usa `AuthManager` che salva i dati utente in `localStorage` per simulare un database. Questo è adatto solo per sviluppo locale.

## Struttura Dati Utente

```javascript
{
  "username": "marco",
  "email": "marco@example.com",
  "profile": {
    // Connessione Amazon
    "amazonConnected": false,
    "amazonData": {
      "connected": true,
      "marketplace": "IT",
      "sellerId": "ABC123",
      "lastSync": "2025-10-09T10:30:00.000Z",
      "accessToken": "token_here"
    },
    
    // Connessione eBay
    "ebayConnected": true,
    "ebayData": {
      "connected": true,
      "userId": "ebay_user_123",
      "connectedDate": "2025-10-09T10:00:00.000Z",
      "tokenExpiry": "2025-12-09T10:00:00.000Z",
      "expiresIn": 7776000,
      "lastSync": "09/10/2025, 12:00:00",
      "accessToken": "v^1.1#i^1..."
    }
  }
}
```

## Migrazione a Produzione

### 1. Backend API (Node.js + Express)

#### Endpoint da creare:

```javascript
// User Management
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/auth/me

// User Profile & Settings
GET    /api/users/:userId/profile
PUT    /api/users/:userId/profile
PATCH  /api/users/:userId/settings

// OAuth Connections
POST   /api/users/:userId/connections/ebay
DELETE /api/users/:userId/connections/ebay
GET    /api/users/:userId/connections/ebay/status
POST   /api/users/:userId/connections/amazon
DELETE /api/users/:userId/connections/amazon
```

### 2. Schema Database (MongoDB esempio)

```javascript
// users collection
{
  _id: ObjectId,
  username: String (unique, required),
  email: String (unique, required),
  password: String (hashed),
  createdAt: Date,
  updatedAt: Date,
  profile: {
    // Amazon connection
    amazonConnected: Boolean,
    amazonData: {
      marketplace: String,
      sellerId: String,
      accessToken: String (encrypted),
      refreshToken: String (encrypted),
      tokenExpiry: Date,
      lastSync: Date
    },
    
    // eBay connection
    ebayConnected: Boolean,
    ebayData: {
      userId: String,
      connectedDate: Date,
      accessToken: String (encrypted),
      refreshToken: String (encrypted),
      tokenExpiry: Date,
      expiresIn: Number,
      lastSync: Date
    },
    
    // Settings
    automation: {
      autoListing: Boolean,
      autoPricing: Boolean,
      autoInventory: Boolean
    }
  }
}
```

### 3. Modifiche al Codice Frontend

#### File: `src/utils/settings.js`

**Sostituire:**
```javascript
// ❌ ATTUALE (localStorage)
updateUserProfile(updates) {
    const currentUser = AuthManager.getCurrentUser();
    if (currentUser) {
        const updatedProfile = {
            ...currentUser.profile,
            ...updates
        };
        AuthManager.updateUserProfile({ profile: updatedProfile });
    }
}
```

**Con:**
```javascript
// ✅ FUTURO (API call)
async updateUserProfile(updates) {
    try {
        const response = await fetch('/api/users/profile', {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.getAuthToken()}`
            },
            body: JSON.stringify(updates)
        });
        
        if (!response.ok) throw new Error('Failed to update profile');
        
        const data = await response.json();
        // Aggiorna cache locale se necessario
        return data;
    } catch (error) {
        console.error('Error updating profile:', error);
        throw error;
    }
}
```

#### File: `src/utils/auth-v2.js`

Sostituire `ShappaAuth` con chiamate API reali usando JWT tokens.

### 4. Sicurezza

#### Token Storage (Produzione)
- **Backend**: Salvare access_token e refresh_token criptati nel database
- **Frontend**: Usare httpOnly cookies per JWT session token
- **MAI** salvare token OAuth in localStorage o sessionStorage

#### Encryption
```javascript
// Criptare token sensibili prima di salvarli
const crypto = require('crypto');
const algorithm = 'aes-256-gcm';

function encryptToken(token) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(algorithm, process.env.ENCRYPTION_KEY, iv);
    let encrypted = cipher.update(token, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag();
    return { encrypted, iv: iv.toString('hex'), authTag: authTag.toString('hex') };
}
```

### 5. Checklist Migrazione

- [ ] Setup database (MongoDB/PostgreSQL)
- [ ] Creare schema/modelli database
- [ ] Implementare API backend con autenticazione JWT
- [ ] Aggiungere rate limiting e validazione input
- [ ] Implementare encryption per token sensibili
- [ ] Sostituire AuthManager con API calls
- [ ] Sostituire updateUserProfile con API calls
- [ ] Implementare token refresh automatico
- [ ] Setup HTTPS in produzione
- [ ] Configurare CORS correttamente
- [ ] Implementare logging e monitoring
- [ ] Setup backup automatico database
- [ ] Testing completo API
- [ ] Documentazione API (Swagger/OpenAPI)

### 6. Vantaggi Architettura Attuale

✅ **Facilmente migrabile**: Tutta la logica di salvataggio è centralizzata in `updateUserProfile()`
✅ **Separazione concerns**: Frontend non dipende da dettagli di storage
✅ **Testabile**: Funziona già con mock data
✅ **Pronto per multi-utente**: Ogni utente ha il proprio profilo separato

### 7. File da Modificare

1. `src/utils/settings.js` - Sostituire updateUserProfile con API call
2. `src/utils/auth-v2.js` - Sostituire con autenticazione JWT
3. `server.js` - Aggiungere endpoints API per profilo utente
4. Creare `src/api/` directory con:
   - `userController.js`
   - `authController.js`
   - `connectionController.js`
5. Creare `src/models/` con schema database
6. Aggiungere middleware per autenticazione/validazione

### 8. Configurazione Ambiente

```env
# Development
NODE_ENV=development
DATABASE_URL=mongodb://localhost:27017/shappa_dev

# Production
NODE_ENV=production
DATABASE_URL=mongodb://user:pass@host:port/shappa_prod
JWT_SECRET=your_super_secret_key_here
ENCRYPTION_KEY=32_byte_encryption_key_here
SESSION_SECRET=session_secret_here
```

## Note Finali

L'architettura attuale è **già pronta** per la migrazione. Basta:
1. Creare il backend API
2. Sostituire le chiamate a `AuthManager` e `updateUserProfile()` con fetch API
3. Il resto del codice rimane identico

**Zero refactoring** della business logic! 🚀
