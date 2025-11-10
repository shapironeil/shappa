# ⚠️ IMPORTANTE: Sicurezza Token

Hai condiviso il tuo token Figma pubblicamente. Per sicurezza:

1. **Aggiungi il token al .env** (vedi sotto)
2. **Rigenera il token su Figma** dopo averlo aggiunto
3. **Non condividere mai più token pubblicamente**

## 🔒 Come Rigenerare il Token (Dopo averlo aggiunto)

1. Vai su https://www.figma.com/settings/security
2. Trova il token "LifeManager" nella lista
3. Clicca su "Revoke" o "Rimuovi"
4. Genera un nuovo token
5. Aggiorna il .env con il nuovo token

## ✅ Aggiungi il Token al .env

Apri il file `.env` nella root del progetto e aggiungi:

```env
FIGMA_API_KEY=your_figma_api_key_here
```

Se il file `.env` non esiste, crealo nella root del progetto.

## 🧪 Test del Token

Dopo aver aggiunto il token, possiamo testarlo con questo script:

```javascript
// test-figma-token.js
require('dotenv').config();
const axios = require('axios');

async function testFigmaToken() {
    const token = process.env.FIGMA_API_KEY;
    
    if (!token) {
        console.error('❌ FIGMA_API_KEY non trovato nel .env');
        return;
    }
    
    console.log('🔑 Token trovato:', token.substring(0, 10) + '...');
    
    try {
        // Test chiamata API Figma (usa un file key valido)
        const response = await axios.get('https://api.figma.com/v1/me', {
            headers: {
                'X-Figma-Token': token
            }
        });
        
        console.log('✅ Token valido!');
        console.log('👤 Utente:', response.data.email);
    } catch (error) {
        if (error.response?.status === 403) {
            console.error('❌ Token non valido o scaduto');
        } else {
            console.error('❌ Errore:', error.message);
        }
    }
}

testFigmaToken();
```

Esegui: `node test-figma-token.js`

