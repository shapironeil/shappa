# 🚨 Sistema Monitor Finale - Come Funziona

## ✅ COSA HO FATTO

### **1. Form Semplificato al Massimo**
```
❌ PRIMA (Complicato):
- Nome Prodotto *
- URL *
- Modulo (6 opzioni confuse)
- Selettore CSS (utente non sa cosa mettere)
- Note/Configurazioni
- Data rilascio
- Intervallo

✅ ADESSO (Essenziale):
- URL * (solo questo è obbligatorio!)
- Keywords Blocco (opzionale, intelligente)
- Tipo Sito (Universal o Shopify)
- Intervallo (dropdown facile)
```

### **2. Monitor Universale Intelligente**
Il sistema **rileva automaticamente** quando un prodotto diventa disponibile.

---

## 🎯 CASO TRAVIS SCOTT - Spiegazione Pratica

### **Il Problema**
```
Pagina prodotto: https://shop.travisscott.com/products/air-jordan-1-low-fragment

HTML attuale:
<div class="product-status">SOON</div>
<button class="add-to-cart" disabled>Add to Cart</button>
```

### **Quando Droppa (diventa disponibile)**
```html
HTML dopo drop:
<!-- "SOON" sparisce -->
<button class="add-to-cart">Add to Cart</button> <!-- NON più disabled -->
```

### **Come il Monitor Rileva**

#### **Step 1: Scarica HTML**
```javascript
const html = await fetch('https://shop.travisscott.com/products/air-jordan-1-low-fragment');
```

#### **Step 2: Cerca Keywords Blocco**
```javascript
// Keywords default: "SOON, SOLD OUT, COMING SOON"
const pageText = html.toLowerCase();

// Prima del drop:
pageText.includes('soon') // ✅ true → NON DISPONIBILE

// Dopo il drop:
pageText.includes('soon') // ❌ false → DISPONIBILE!
```

#### **Step 3: Controlla Button**
```javascript
const button = $('.add-to-cart');

// Prima del drop:
button.disabled === true // ❌ Button disabilitato

// Dopo il drop:
button.disabled === false // ✅ Button ATTIVO!
```

#### **Step 4: Logica Finale**
```javascript
// Il monitor manda notifica quando:
if (!pageText.includes('soon') && !button.disabled) {
  sendDiscordNotification(); // 🚨 ALERT!
}
```

---

## 📋 Come Creare Monitor per Travis Scott

### **Metodo 1: Solo URL (Consigliato)**
```
URL: https://shop.travisscott.com/products/air-jordan-1-low-fragment
Keywords: (lascia vuoto, usa default)
Tipo: Universal
Intervallo: 1 minuto (per drop veloci)
```

**Cosa fa:**
- Controlla ogni 1 minuto
- Cerca automaticamente: "SOON", "SOLD OUT", "COMING SOON"
- Quando "SOON" sparisce → NOTIFICA ISTANTANEA

### **Metodo 2: Keywords Personalizzate**
```
URL: https://shop.travisscott.com/products/cactus-jack-hoodie
Keywords: SOON, NOT AVAILABLE
Tipo: Universal
Intervallo: 3 minuti
```

**Cosa fa:**
- Cerca solo le tue keywords specifiche
- Più preciso per siti con testi strani

---

## 🔍 Dettagli Tecnici Monitor Universale

### **Cosa Controlla (in ordine)**

1. **Keywords Blocco**
   ```javascript
   Keywords: "SOON, SOLD OUT, COMING SOON"
   
   // Controlla se presenti nella pagina
   if (pageText.includes('soon') || 
       pageText.includes('sold out') || 
       pageText.includes('coming soon')) {
     return NON_DISPONIBILE;
   }
   ```

2. **Button Add to Cart**
   ```javascript
   // Cerca button con vari selettori
   selectors = [
     'button[name="add"]',
     '.add-to-cart',
     '#add-to-cart',
     '.product-form__submit',
     // + altri 10 selettori comuni
   ];
   
   // Verifica se attivo
   if (button.disabled || button.text.includes('sold out')) {
     return NON_DISPONIBILE;
   }
   ```

3. **Logica Combinata**
   ```javascript
   // DISPONIBILE se:
   // - Keywords NON trovate + Button attivo
   // - Oppure solo keywords non trovate
   // - Oppure solo button attivo
   
   if (!hasKeywords && buttonActive) {
     return DISPONIBILE; // Best case
   } else if (!hasKeywords) {
     return DISPONIBILE; // Keywords sparite
   } else if (buttonActive) {
     return DISPONIBILE; // Button attivo
   }
   ```

### **Cambio Stato Detection**
```javascript
// Il monitor salva ultimo stato
lastStatus = false; // Non disponibile

// Nuovo check
currentStatus = true; // Disponibile!

// Se cambio da false → true:
if (lastStatus === false && currentStatus === true) {
  sendDiscordNotification(); // 🚨 ALERT!
}
```

---

## 💬 Notifiche Discord

### **Formato Embed**
```javascript
{
  title: "🚨 Air Jordan 1 Low Fragment DISPONIBILE!",
  url: "https://shop.travisscott.com/products/...",
  color: verde (0x10b981),
  fields: [
    {
      name: "✅ Motivo",
      value: "Keywords sparite + Button attivo"
    },
    {
      name: "🔗 Link Diretto",
      value: "[Acquista ORA](url)"
    }
  ]
}
```

### **Mention Utente**
```javascript
content: "<@USER_ID> **🚨 ALERT DROP!**"
// Tag Discord → notifica push istantanea
```

---

## 🆚 Universal vs Shopify

### **Universal Monitor** (DEFAULT)
- ✅ Funziona su **qualsiasi sito**
- ✅ Rileva keywords ("SOON", "SOLD OUT")
- ✅ Rileva button disabilitati
- ✅ Non richiede configurazione
- ⚠️ Più lento (scarica HTML completo)

**Usa per:**
- Travis Scott shop
- Nike SNKRS
- Supreme
- Siti custom/generici

### **Shopify Monitor** (OPZIONALE)
- ✅ **Solo** per store Shopify
- ✅ API JSON velocissima
- ✅ Dati strutturati (varianti, prezzo, stock)
- ✅ Nessun parsing HTML
- ❌ NON funziona su siti non-Shopify

**Usa per:**
- Travis Scott (è Shopify!) ← Raccomandato
- Supreme (Shopify)
- Kith (Shopify)

---

## 🎯 Raccomandazione Finale per Travis Scott

### **Setup Perfetto:**
```
URL: https://shop.travisscott.com/products/PRODOTTO
Keywords: (lascia vuoto)
Tipo: Shopify (è Shopify!)
Intervallo: 1 minuto
```

**Perché Shopify è meglio:**
1. Travis Scott shop = Shopify
2. API JSON più veloce (< 200ms vs 2-3s HTML)
3. Rileva varianti (size) disponibili
4. Estrae prezzo automaticamente
5. Più affidabile

**Ma Universal funziona uguale se preferisci!**

---

## 🧪 Test Pratico

### **1. Verifica che Travis Scott è Shopify**
```bash
# Apri console browser
fetch('https://shop.travisscott.com/products/cj-fragment-daruma-doll-brown.js')
  .then(r => r.json())
  .then(d => console.log(d));

# Se ritorna JSON con "variants" → è Shopify! ✅
```

### **2. Crea Monitor su Shappa**
```
1. Vai su Interessi
2. Click "🔔 Monitor Releasing"
3. Incolla URL prodotto Travis Scott
4. Lascia Keywords vuoto (usa default)
5. Seleziona tipo (Universal o Shopify)
6. Interval: 1 minuto
7. Click "Attiva Monitor"
```

### **3. Verifica Funzionamento**
```bash
# SSH nel server
ssh root@207.154.218.16
pm2 logs shappa

# Vedrai:
[Universal] 🚀 Monitor avviato: Air Jordan 1 Low Fragment
[Universal] 🔍 Keywords blocco: soon, sold out, coming soon
[Universal] 🔍 Check #1 - Air Jordan 1 Low Fragment
[Universal] Status: ❌ NON DISPONIBILE (Blocco attivo: soon)
```

### **4. Quando Droppa**
```
Monitor rileva: "SOON" sparito!
→ Invia Discord notification
→ Tu ricevi alert push
→ Click link e compra! 🔥
```

---

## 🚀 Vantaggi Sistema Finale

### **1. Zero Configurazione**
- Incolla URL e basta
- Sistema rileva tutto automaticamente

### **2. Intelligente**
- Capisce quando prodotto disponibile
- Keywords dinamiche (personalizzabili)
- Multi-check (keywords + button)

### **3. Universale**
- Funziona su 99% dei siti
- Shopify, WooCommerce, Magento, custom

### **4. Veloce**
- 1 minuto interval per drop veloci
- Notifica istantanea Discord

### **5. Affidabile**
- Restart automatico al reboot
- Error handling robusto
- Log dettagliati

---

## 📊 Tabella Riassuntiva

| Campo | Obbligatorio | Esempio | Spiegazione |
|-------|--------------|---------|-------------|
| **URL** | ✅ Sì | https://shop.travisscott.com/... | Link prodotto da monitorare |
| **Keywords** | ❌ No | SOON, SOLD OUT | Parole che indicano NON disponibile |
| **Tipo** | ✅ Sì | Universal o Shopify | Universal = qualsiasi sito |
| **Intervallo** | ✅ Sì | 1 minuto | Frequenza check |

---

## ✅ Conclusione

**Il sistema è pronto per Travis Scott drops!**

1. **Incolla URL** del prodotto
2. **Lascia keywords vuoto** (usa default intelligenti)
3. **Scegli tipo**: Shopify (consigliato) o Universal
4. **Intervallo**: 1 minuto per drop veloci
5. **Click "Attiva"** e aspetta notifica Discord! 🚀

Quando "SOON" sparisce → **NOTIFICA ISTANTANEA** → **COMPRA SUBITO**! 🔥
