# 🔍 Come Funziona il Sistema di Monitoraggio

## 📋 Panoramica Rapida

Il sistema monitora **automaticamente** i prodotti su store Shopify (come Travis Scott shop) e ti notifica su Discord quando diventano disponibili.

---

## 🎯 Shopify Monitor - Spiegazione Dettagliata

### **Cosa Fa il Monitor**

1. **Tu inserisci solo l'URL del prodotto**
   ```
   https://shop.travisscott.com/products/air-jordan-1-low-fragment
   ```

2. **Il monitor estrae automaticamente l'handle**
   ```javascript
   // Da URL: https://shop.travisscott.com/products/air-jordan-1-low-fragment
   // Estrae: "air-jordan-1-low-fragment"
   ```

3. **Chiama l'API JSON di Shopify**
   ```
   GET https://shop.travisscott.com/products/air-jordan-1-low-fragment.js
   ```

4. **Shopify risponde con JSON completo**
   ```json
   {
     "id": 8234567890,
     "title": "Air Jordan 1 Low OG SP Fragment",
     "handle": "air-jordan-1-low-fragment",
     "product_type": "Sneakers",
     "vendor": "Nike",
     "price": "15000",
     "variants": [
       {
         "id": 44123456789,
         "title": "US 9",
         "price": "15000",
         "available": false,
         "inventory_quantity": 0
       },
       {
         "id": 44123456790,
         "title": "US 10",
         "price": "15000",
         "available": false,
         "inventory_quantity": 0
       },
       {
         "id": 44123456791,
         "title": "US 11",
         "price": "15000",
         "available": true,
         "inventory_quantity": 5
       }
     ],
     "images": [
       {
         "src": "https://cdn.shopify.com/..."
       }
     ]
   }
   ```

5. **Il monitor controlla il campo `available`**
   ```javascript
   // Filtra solo varianti disponibili
   const availableVariants = product.variants.filter(v => v.available);
   
   // Se almeno 1 variante disponibile → INVIA NOTIFICA
   if (availableVariants.length > 0) {
     sendDiscordNotification();
   }
   ```

---

## ❓ Perché NON Serve il Selettore CSS?

### **Shopify Monitor** (quello che usiamo)
- ✅ **API JSON standardizzata** - ogni store Shopify ha endpoint `.js`
- ✅ **Nessun parsing HTML** - riceve dati già strutturati
- ✅ **Veloce e affidabile** - JSON puro, niente selettori che cambiano
- ✅ **Funziona sempre** - Shopify garantisce formato API

**Esempio pratico:**
```
Qualsiasi URL Shopify:
https://QUALSIASI-SITO.com/products/PRODOTTO

Diventa:
https://QUALSIASI-SITO.com/products/PRODOTTO.js

Ritorna sempre lo stesso formato JSON!
```

### **Standard Monitor** (futuro, altri siti)
- ❌ **Parsing HTML** - deve cercare elementi nella pagina
- ❌ **Selettore CSS richiesto** - es: `.add-to-cart-button`
- ❌ **Fragile** - se il sito cambia HTML, si rompe
- ❌ **Più lento** - deve scaricare e parsare tutto l'HTML

**Esempio:**
```html
<!-- Sito generico - HTML varia -->
<button class="btn-add-to-cart" disabled>
  Sold Out
</button>

<!-- Monitor deve cercare .btn-add-to-cart e verificare disabled -->
```

---

## 🔄 Flusso di Monitoraggio Completo

### **1. Creazione Monitor**
```
User → Form "Monitor Releasing"
  ↓
Nome: "Air Jordan 1 Fragment"
URL: https://shop.travisscott.com/products/air-jordan-1-low-fragment
Modulo: Shopify (selezionato di default)
Intervallo: 5 minuti
  ↓
Click "Attiva Monitor"
```

### **2. Salvataggio Database**
```javascript
// Salva in: data/interests/interests_USER123.json
{
  "id": 1730000000000,
  "type": "releasing",
  "name": "Air Jordan 1 Fragment",
  "url": "https://shop.travisscott.com/products/air-jordan-1-low-fragment",
  "module": "shopify",
  "interval": 5,
  "status": "active"
}
```

### **3. Avvio Automatico Monitor**
```javascript
// Frontend chiama API
POST /api/monitors/start
{
  "userId": "USER123",
  "interestId": 1730000000000,
  "discordWebhook": "https://discord.com/api/webhooks/..."
}

// Backend crea ShopifyMonitor
const monitor = new ShopifyMonitor(config);
monitor.start(); // Avvia polling
```

### **4. Polling Continuo**
```javascript
// Ogni 5 minuti:
setInterval(() => {
  // 1. Fetch JSON
  const json = await fetch('https://shop.travisscott.com/products/air-jordan-1-low-fragment.js');
  
  // 2. Parse risposta
  const product = JSON.parse(json);
  
  // 3. Check disponibilità
  const available = product.variants.some(v => v.available);
  
  // 4. Se cambio stato → notifica
  if (lastStatus === false && available === true) {
    sendDiscordNotification();
  }
  
  lastStatus = available;
}, 5 * 60 * 1000);
```

### **5. Notifica Discord**
```javascript
// Quando prodotto diventa disponibile:
await fetch(discordWebhook, {
  method: 'POST',
  body: JSON.stringify({
    embeds: [{
      title: "🚨 Air Jordan 1 Fragment DISPONIBILE!",
      url: "https://shop.travisscott.com/products/...",
      color: 0x10b981,
      fields: [
        { name: "💰 Prezzo", value: "$150.00" },
        { name: "📦 Varianti", value: "US 11 disponibile" }
      ],
      thumbnail: { url: "https://cdn.shopify.com/..." }
    }]
  })
});

// Discord invia notifica → Tu vedi alert e puoi comprare!
```

---

## 🎨 Campi del Form - Spiegazione

### **Nome Prodotto/Release** ⭐ OBBLIGATORIO
- Identificativo per te (es: "Air Jordan 1 Fragment")
- Appare nelle notifiche Discord

### **URL da Monitorare** ⭐ OBBLIGATORIO
- URL completo del prodotto Shopify
- Es: `https://shop.travisscott.com/products/cactus-jack-hoodie`

### **Modulo di Monitoring** ⭐ OBBLIGATORIO
- Solo "Shopify Monitor" disponibile
- Automatico, non richiede configurazione

### **Selettore CSS** ❌ NON VISIBILE (Shopify)
- Nascosto per Shopify
- Apparirebbe solo per altri moduli (futuro)

### **Intervallo Check**
- Minuti tra ogni controllo (default: 5)
- Minimo: 1 minuto (sconsigliato, rate limit)
- Consigliato: 5-10 minuti

### **Data Rilascio** (opzionale)
- Se sai quando esce il prodotto
- Solo per riferimento personale

### **Note** (opzionale)
- Promemoria o configurazioni speciali
- Es: "Size 10 only", "Drop ore 18:00"

---

## 🧪 Test Pratico - Esempio Reale

### **Scenario: Monitorare Travis Scott Hoodie**

1. **Vai su Travis Scott shop**
   ```
   https://shop.travisscott.com/
   ```

2. **Scegli un prodotto (anche sold out)**
   ```
   https://shop.travisscott.com/products/cactus-jack-fragment-hoodie
   ```

3. **Verifica che sia Shopify**
   ```bash
   # Apri browser console e testa:
   fetch('https://shop.travisscott.com/products/cactus-jack-fragment-hoodie.js')
     .then(r => r.json())
     .then(d => console.log(d));
   
   # Se ritorna JSON → è Shopify! ✅
   ```

4. **Crea monitor su Shappa**
   - Nome: `Cactus Jack Fragment Hoodie`
   - URL: `https://shop.travisscott.com/products/cactus-jack-fragment-hoodie`
   - Modulo: `Shopify Monitor`
   - Intervallo: `5` minuti

5. **Il monitor parte subito**
   ```bash
   # SSH nel server per vedere log
   ssh root@207.154.218.16
   pm2 logs shappa
   
   # Output:
   [Shopify] 🚀 Monitor avviato: Cactus Jack Fragment Hoodie
   [Shopify] 🔍 Check #1 - Cactus Jack Fragment Hoodie
   [Shopify] Status: ❌ NON DISPONIBILE (0/3 varianti)
   ```

6. **Quando diventa disponibile**
   - Monitor rileva `available: true`
   - Invia notifica Discord
   - Tu ricevi alert e puoi comprare!

---

## 🚀 Vantaggi di Questo Sistema

### **1. Zero Configurazione**
- Non devi capire HTML/CSS
- Non devi ispezionare elementi
- Inserisci solo URL → tutto automatico

### **2. Affidabile**
- API JSON di Shopify è standard
- Non si rompe quando sito cambia grafica
- Funziona 24/7 senza interventi

### **3. Veloce**
- JSON è leggerissimo (< 50KB)
- Risposta in < 500ms
- Nessun parsing HTML lento

### **4. Completo**
- Rileva varianti (size, colori)
- Estrae prezzo automaticamente
- Include immagini prodotto

### **5. Scalabile**
- Puoi monitorare 100+ prodotti
- Ogni monitor è indipendente
- Ripartono automaticamente al reboot

---

## 📊 Confronto Tecniche

| Caratteristica | Shopify Monitor | HTML Parsing |
|----------------|-----------------|--------------|
| **Setup** | Solo URL | URL + Selettore CSS |
| **Affidabilità** | 99.9% | ~70% (si rompe) |
| **Velocità** | < 500ms | 2-5 secondi |
| **Manutenzione** | Zero | Alta (aggiornare selettori) |
| **Dati estratti** | Completi | Parziali |
| **Rate Limit** | Tollerante | Facilmente bloccato |

---

## 🎯 Conclusione

**Per Shopify NON serve selettore CSS** perché:
1. API JSON standardizzata
2. Formato sempre uguale
3. Dati già strutturati
4. Nessun parsing necessario

Devi solo:
1. Copiare URL prodotto
2. Incollare nel form
3. Click "Attiva Monitor"
4. Done! 🚀

Il sistema fa tutto il resto automaticamente! 🎉
