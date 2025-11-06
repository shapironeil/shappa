# eBay OAuth 2.0 Scopes Configuration

## 📋 Scopes Configurati

L'applicazione Shappa richiede i seguenti scope eBay per funzionare completamente:

### 🔐 Identity & Account
```
https://api.ebay.com/oauth/api_scope                           - Accesso base API eBay
https://api.ebay.com/oauth/api_scope/commerce.identity.readonly - Info account utente
https://api.ebay.com/oauth/api_scope/commerce.identity.name.readonly - Nome e cognome
https://api.ebay.com/oauth/api_scope/commerce.identity.email.readonly - Email utente
```

### 📦 Inventory Management
```
https://api.ebay.com/oauth/api_scope/sell.inventory.readonly   - Visualizza inventario
https://api.ebay.com/oauth/api_scope/sell.inventory            - Gestisci inventario e offerte
```

### 🏪 Account & Settings
```
https://api.ebay.com/oauth/api_scope/sell.account.readonly     - Visualizza impostazioni account
https://api.ebay.com/oauth/api_scope/sell.account              - Gestisci impostazioni account
```

### 📦 Order Fulfillment
```
https://api.ebay.com/oauth/api_scope/sell.fulfillment.readonly - Visualizza ordini
https://api.ebay.com/oauth/api_scope/sell.fulfillment          - Gestisci spedizioni ordini
```

### 📊 Analytics & Marketing
```
https://api.ebay.com/oauth/api_scope/sell.analytics.readonly   - Visualizza analytics vendite
https://api.ebay.com/oauth/api_scope/sell.marketing.readonly   - Visualizza campagne marketing
https://api.ebay.com/oauth/api_scope/sell.marketing            - Gestisci marketing e promozioni
```

### 💰 Financial
```
https://api.ebay.com/oauth/api_scope/sell.finances             - Visualizza pagamenti e transazioni
```

### 📝 Listing Management
```
https://api.ebay.com/oauth/api_scope/sell.item                 - Crea e gestisci listing
https://api.ebay.com/oauth/api_scope/sell.item.draft           - Gestisci bozze listing
```

### ⭐ Reputation
```
https://api.ebay.com/oauth/api_scope/sell.reputation.readonly  - Visualizza feedback e reputazione
```

## 🎯 Funzionalità Abilitate

Con questi scope, Shappa può:

- ✅ **Autenticare utenti** e recuperare informazioni profilo
- ✅ **Importare prodotti** da Amazon
- ✅ **Creare listing automatici** su eBay
- ✅ **Gestire inventario** in tempo reale
- ✅ **Monitorare ordini** e spedizioni
- ✅ **Ottimizzare prezzi** dinamicamente
- ✅ **Analizzare performance** vendite
- ✅ **Gestire campagne marketing**
- ✅ **Tracciare finanze** e pagamenti
- ✅ **Monitorare feedback** e reputazione

## 📝 Configurazione eBay Developer Portal

### 1. Accedi al Developer Portal
- URL: https://developer.ebay.com/my/keys
- Seleziona la tua applicazione: **Shappa**

### 2. Configura OAuth Settings
- **OAuth 2.0**: ✅ Enabled
- **Grant Type**: Authorization Code Grant
- **Redirect URIs**: 
  - Sandbox: `https://www.localhost:3000/auth/ebay/callback`
  - Production: `https://yourdomain.com/auth/ebay/callback`

### 3. Scope Configuration
Nella sezione **OAuth Scopes**, seleziona tutti gli scope sopra elencati.

⚠️ **IMPORTANTE**: Ogni volta che modifichi gli scope, gli utenti dovranno riautorizzare l'applicazione!

## 🔄 Token Management

### Token Lifecycle
- **Access Token**: Valido per ~2 ore (7200 secondi)
- **Refresh Token**: Valido per ~18 mesi
- **Auto-refresh**: Implementare prima della scadenza

### Storage (Attuale - Development)
```javascript
// Salvato nel profilo utente via AuthManager
{
  ebayConnected: true,
  ebayData: {
    userId: "ebay_user_123",
    username: "Marco Pietraforcola",
    email: "user@example.com",
    accessToken: "v^1.1#i^1...",
    refreshToken: "v^1.1#i^1...",
    tokenExpiry: "2025-10-09T12:00:00.000Z",
    expiresIn: 7200
  }
}
```

### Storage (Futuro - Production)
```javascript
// Database con encryption
{
  userId: ObjectId("..."),
  ebayConnection: {
    userId: "ebay_user_123",
    username: "Marco Pietraforcola",
    email: "user@example.com",
    // Token criptati con AES-256-GCM
    accessToken: { encrypted: "...", iv: "...", authTag: "..." },
    refreshToken: { encrypted: "...", iv: "...", authTag: "..." },
    tokenExpiry: Date("2025-10-09T12:00:00.000Z"),
    lastRefreshed: Date("2025-10-09T10:00:00.000Z")
  }
}
```

## 🔐 Security Best Practices

### 1. Never Store Tokens in Frontend
❌ **MAI FARE**:
```javascript
localStorage.setItem('ebay_token', token);  // INSICURO!
```

✅ **SEMPRE FARE**:
```javascript
// Backend API con session management
POST /api/users/profile
Authorization: Bearer <session_jwt>
Body: { ebayData: { /* encrypted tokens */ } }
```

### 2. Implement Token Refresh
```javascript
// Auto-refresh 5 minuti prima della scadenza
if (tokenExpiresIn < 300) {
  await refreshEbayToken(refreshToken);
}
```

### 3. Encrypt Sensitive Data
```javascript
// Prima di salvare nel database
const encryptedToken = encryptAES256(accessToken, ENCRYPTION_KEY);
```

### 4. Use HTTPS Only
```javascript
// Redirect HTTP to HTTPS in produzione
if (req.protocol === 'http') {
  res.redirect(`https://${req.hostname}${req.url}`);
}
```

## 📊 API Endpoints Created

### User Info
```http
POST /api/ebay/user-info
Content-Type: application/json

{
  "access_token": "v^1.1#i^1..."
}
```

**Response**:
```json
{
  "success": true,
  "userData": {
    "userId": "ebay_user_123",
    "username": "marco_seller",
    "email": "marco@example.com",
    "firstName": "Marco",
    "lastName": "Pietraforcola",
    "fullName": "Marco Pietraforcola",
    "accountType": "INDIVIDUAL",
    "status": "CONFIRMED"
  }
}
```

### Test Connection
```http
POST /api/ebay/test-connection
Content-Type: application/json

{
  "access_token": "v^1.1#i^1..."
}
```

## 🚀 Next Steps

### Immediate (Development)
1. ✅ Configurare scope nel Developer Portal
2. ✅ Testare OAuth flow con nuovi scope
3. ✅ Verificare recupero dati utente
4. ⏳ Implementare auto-refresh token
5. ⏳ Aggiungere error handling robusto

### Short Term (Pre-Production)
1. ⏳ Implementare token encryption
2. ⏳ Setup database per multi-utente
3. ⏳ Migrare da AuthManager a API backend
4. ⏳ Implementare rate limiting
5. ⏳ Setup monitoring e logging

### Long Term (Production)
1. ⏳ Deploy su server HTTPS pubblico
2. ⏳ Passare a eBay Production environment
3. ⏳ Implementare webhook per eventi eBay
4. ⏳ Setup backup automatico database
5. ⏳ Compliance GDPR per dati utente

## 📚 Resources

- [eBay OAuth 2.0 Documentation](https://developer.ebay.com/api-docs/static/oauth-authorization-code-grant.html)
- [eBay API Scopes Reference](https://developer.ebay.com/api-docs/static/oauth-scopes.html)
- [Commerce Identity API](https://developer.ebay.com/api-docs/commerce/identity/overview.html)
- [Sell Inventory API](https://developer.ebay.com/api-docs/sell/inventory/overview.html)

## 🛠️ Troubleshooting

### "Invalid Scope" Error
**Problema**: eBay rifiuta la richiesta OAuth

**Soluzione**:
1. Verifica che tutti gli scope siano configurati nel Developer Portal
2. Assicurati che OAuth 2.0 sia abilitato (non Auth'n'auth)
3. Controlla che il RuName corrisponda

### Token Expired
**Problema**: `401 Unauthorized` nelle chiamate API

**Soluzione**:
```javascript
// Check token expiry before API call
if (Date.now() > tokenExpiry) {
  await refreshToken();
}
```

### User Info Not Retrieved
**Problema**: `getUserInfo()` fallisce

**Soluzione**:
1. Verifica scope `commerce.identity.readonly`
2. Controlla che l'access token sia valido
3. Verifica URL API (sandbox vs production)

---

**Last Updated**: 9 Ottobre 2025
**Version**: 2.0.0
**Author**: Shappa Development Team
