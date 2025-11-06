# Sistema di Rinnovo Automatico Token eBay

## 📋 Cosa Significa "Token scade tra 1 ora"?

### 🔐 Spiegazione Semplice

**NO, NON devi rifare il login!** 🎉

Il sistema Shappa ha un meccanismo di **rinnovo automatico** che gestisce tutto per te in background.

---

## 🔄 Come Funziona

### 1️⃣ Due Tipi di Token

Quando ti connetti a eBay, ricevi **2 token**:

#### 🎫 Access Token (Token di Accesso)
- **Durata**: 2 ore
- **Utilizzo**: Permette di fare richieste API a eBay
- **Scadenza**: Si, scade dopo 2 ore

#### 🔑 Refresh Token (Token di Rinnovo)
- **Durata**: ~18 mesi (547 giorni)
- **Utilizzo**: Permette di rinnovare l'Access Token quando scade
- **Scadenza**: Devi rifare login solo dopo 18 mesi!

### 2️⃣ Sistema di Rinnovo Automatico

```
TIMELINE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Login iniziale
└─> Access Token valido per 2 ore
    └─> Refresh Token valido per 18 mesi

Dopo 1 ora
└─> ⚠️ Sistema rileva: "Token scade tra 1 ora"
    └─> 🔄 Rinnovo automatico inizia
        └─> Usa Refresh Token per ottenere nuovo Access Token
            └─> ✅ Nuovo Access Token valido per altre 2 ore
                └─> 🔁 Il ciclo si ripete ogni ~1 ora

Dopo 18 mesi
└─> ❌ Refresh Token scaduto
    └─> 🔐 Richiesto nuovo login
```

### 3️⃣ Controlli Automatici

Il sistema controlla **ogni 30 minuti**:
- ✅ Se il token è valido → nessuna azione
- ⚠️ Se il token scade tra < 1 ora → rinnovo automatico
- ❌ Se il token è scaduto → rinnovo immediato

---

## 🎨 Cosa Vedi nell'Interfaccia

### ✅ Token Valido (> 1 giorno)
```
Token scade tra: ✅ Tra 5 giorni
                 Rinnovo automatico attivo
```
**Significato**: Tutto OK, sei connesso e protetto per i prossimi giorni

### ⚠️ Token in Scadenza (< 24 ore)
```
Token scade tra: ⚠️ Tra 1 ora
                 Verrà rinnovato automaticamente tra poco
```
**Significato**: Il sistema sta per rinnovare il token, non preoccuparti!

### ⏱️ Rinnovo Imminente (< 1 ora)
```
Token scade tra: ⏱️ Tra 15 minuti
                 Rinnovo automatico in corso...
```
**Significato**: Il rinnovo è in corso, tutto sotto controllo

### ❌ Token Scaduto
```
Token scade tra: ❌ Token scaduto
                 Il token verrà rinnovato automaticamente
```
**Significato**: Il token è scaduto ma verrà rinnovato immediatamente al prossimo controllo

---

## ❓ Domande Frequenti (FAQ)

### Q: Devo rifare il login quando vedo "Tra 1 ora"?
**A:** NO! Il sistema rinnoverà automaticamente il token. Non devi fare nulla.

### Q: Quando devo rifare il login?
**A:** Solo dopo ~18 mesi dall'ultimo login, quando il Refresh Token scade.

### Q: Cosa succede se chiudo l'app?
**A:** Il Refresh Token è salvato in modo sicuro. Quando riapri l'app, il sistema controlla e rinnova automaticamente se necessario.

### Q: Come faccio a sapere se il rinnovo ha avuto successo?
**A:** Guarda la console del browser (F12) per vedere i log:
```javascript
🔄 Token eBay in scadenza, rinnovo in corso...
✅ Token eBay rinnovato con successo
```

### Q: Cosa succede se il rinnovo fallisce?
**A:** Il sistema riproverà al prossimo controllo (30 minuti). Se continua a fallire, vedrai un messaggio che chiede di rifare il login.

### Q: Posso forzare il rinnovo manualmente?
**A:** Si! Apri la console browser (F12) e scrivi:
```javascript
SettingsManager.refreshEbayToken(SettingsManager.connections.ebay.refreshToken)
```

---

## 🔐 Sicurezza

### Dove Sono Salvati i Token?

- **Development**: localStorage del browser (chiave: `shappa_current_user_v2`)
- **Production**: Database crittografato con encryption at rest

### I Token Sono Sicuri?

- ✅ Access Token: breve durata (2 ore) = rischio limitato
- ✅ Refresh Token: salvato in modo sicuro e usato solo per rinnovare
- ✅ HTTPS obbligatorio per tutte le comunicazioni
- ✅ Nessun token viene mai esposto pubblicamente

---

## 🛠️ Dettagli Tecnici

### Endpoint di Rinnovo
```
POST https://localhost:3000/api/ebay/refresh-token
Body: { refreshToken: "v^1.1#..." }
Response: { access_token: "...", expires_in: 7200 }
```

### Codice del Controllo Automatico
```javascript
// Controllo ogni 30 minuti
setInterval(() => {
    const expiry = new Date(tokenExpiry);
    const now = new Date();
    const hoursRemaining = (expiry - now) / (1000 * 60 * 60);
    
    if (hoursRemaining < 1) {
        // Rinnova automaticamente
        SettingsManager.refreshEbayToken(refreshToken);
    }
}, 30 * 60 * 1000); // 30 minuti
```

### Refresh Token Validity
- **eBay Sandbox**: ~18 mesi (547 giorni)
- **eBay Production**: ~18 mesi (547 giorni)
- **Documentazione**: https://developer.ebay.com/api-docs/static/oauth-tokens.html

---

## 📝 Riepilogo

| Situazione | Cosa Vedi | Azione Richiesta | Frequenza |
|-----------|-----------|------------------|-----------|
| Token valido | ✅ Tra X giorni | Nessuna | - |
| Token in scadenza | ⚠️ Tra X ore | Nessuna (auto-rinnovo) | Ogni 2 ore |
| Token scaduto | ❌ Token scaduto | Nessuna (auto-rinnovo) | Immediato |
| Refresh Token scaduto | 🔐 Login richiesto | Rifare login | Ogni 18 mesi |

---

## 🎯 Conclusione

Il sistema di **rinnovo automatico** è progettato per offrirti la **migliore esperienza utente**:

✅ **Fai il login UNA VOLTA**
✅ **Rimani connesso per 18 mesi**
✅ **Nessuna interruzione**
✅ **Tutto automatico**

**Non preoccuparti della scadenza del token!** 🚀
