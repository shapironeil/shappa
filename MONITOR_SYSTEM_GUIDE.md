# 🚀 Sistema Monitoraggio Shopify - Guida Rapida

## ✅ Sistema Installato e Attivo

Il sistema di monitoraggio modulare è ora **LIVE** su shapiro.ninja!

---

## 📋 Come Testare Travis Scott Shop

### 1. Vai su Interessi
```
https://shapiro.ninja/src/pages/interessi.html
```

### 2. Clicca "🔔 Monitor Releasing"

### 3. Compila il Form
**Esempio per Travis Scott:**
- **Nome**: Air Jordan 1 Low Fragment
- **URL**: https://shop.travisscott.com/products/air-jordan-1-low-fragment
- **Modulo**: Shopify ATC Monitor
- **Intervallo**: 5 minuti
- **Note**: (lascia vuoto)

### 4. Clicca "Attiva Monitor"
Il sistema:
- ✅ Salva il monitor nel database
- ✅ Avvia il monitoring automaticamente
- ✅ Controlla ogni 5 minuti via Shopify API
- ✅ Invia notifica Discord quando disponibile

---

## 🔍 Verifica Monitor Attivo

### Controlla Log Server
```bash
ssh root@207.154.218.16
pm2 logs shappa
```

Dovresti vedere:
```
[Shopify] 🚀 Monitor avviato: Air Jordan 1 Low Fragment
[Shopify] 🔍 Check #1 - Air Jordan 1 Low Fragment
[Shopify] Status: ❌ NON DISPONIBILE (0/3 varianti)
```

### API Monitor Stats
```bash
curl https://shapiro.ninja/api/monitors/stats
```

Risposta:
```json
{
  "success": true,
  "total": 1,
  "monitors": [
    {
      "monitorId": 1730000000000,
      "productName": "Air Jordan 1 Low Fragment",
      "productHandle": "air-jordan-1-low-fragment",
      "isRunning": true,
      "checksCount": 3,
      "lastStatus": false,
      "interval": 5
    }
  ]
}
```

---

## 🎯 Come Funziona il Monitor Shopify

### 1. Polling ogni N minuti
Il monitor fa richieste GET a:
```
https://shop.travisscott.com/products/HANDLE.js
```

### 2. Analizza JSON Response
```javascript
{
  "id": 123456,
  "title": "Air Jordan 1 Low Fragment",
  "variants": [
    {
      "id": 789,
      "title": "Size 9",
      "price": 15000,  // cents
      "available": false
    }
  ]
}
```

### 3. Detect Cambio Stato
- **Stato precedente**: NON disponibile
- **Stato nuovo**: DISPONIBILE
- **Azione**: Invia Discord webhook

### 4. Notifica Discord
```json
{
  "embeds": [{
    "title": "🚨 Air Jordan 1 Low Fragment DISPONIBILE!",
    "url": "https://shop.travisscott.com/...",
    "color": 1096577,
    "fields": [
      { "name": "💰 Prezzo", "value": "$150.00" },
      { "name": "📦 Varianti", "value": "2/3" },
      { "name": "🎨 Dettagli", "value": "• Size 9 - $150\n• Size 10 - $150" }
    ]
  }]
}
```

---

## 🔧 Configurazione Discord Webhook

### 1. Crea Webhook Discord
1. Vai su Server Settings → Integrations → Webhooks
2. Clicca "New Webhook"
3. Copia URL: `https://discord.com/api/webhooks/...`

### 2. Salva in Shappa
1. Vai su Settings → Discord Webhook
2. Incolla URL
3. Clicca "Salva"
4. Test: clicca "Test" per verificare

### 3. Il Webhook sarà Usato Automaticamente
Quando crei un nuovo monitor, il sistema:
- Carica il webhook da localStorage
- Lo passa al MonitorManager
- Lo usa per le notifiche real-time

---

## 📊 Architettura Sistema

```
Frontend (interessi.html)
    ↓ [POST /api/monitors/start]
Server (server.js)
    ↓
MonitorManager
    ↓ [createMonitor()]
ShopifyMonitor
    ↓ [setInterval()]
Shopify API (.js endpoint)
    ↓ [detect change]
Discord Webhook
    ↓ [send notification]
User 🔔
```

---

## 🧪 Test Manuale del Monitor

### Test 1: Avvio Monitor
```bash
curl -X POST https://shapiro.ninja/api/monitors/start \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "USER123",
    "interestId": 1730000000000,
    "discordWebhook": "https://discord.com/api/webhooks/YOUR_WEBHOOK"
  }'
```

### Test 2: Stop Monitor
```bash
curl -X POST https://shapiro.ninja/api/monitors/stop/1730000000000 \
  -H "Content-Type: application/json" \
  -d '{"userId": "USER123"}'
```

### Test 3: Stats
```bash
curl https://shapiro.ninja/api/monitors/stats
```

---

## 🐛 Troubleshooting

### Monitor non parte
**Check 1**: Verifica logs PM2
```bash
pm2 logs shappa --lines 50
```

**Check 2**: Verifica interesse salvato
```bash
cat /var/www/shappa/data/interests/interests_USER123.json
```

**Check 3**: Testa manualmente Shopify API
```bash
curl "https://shop.travisscott.com/products/air-jordan-1-low-fragment.js"
```

### Notifiche Discord non arrivano
**Check 1**: Webhook salvato?
```javascript
localStorage.getItem('discord_webhook_url')
```

**Check 2**: Test webhook manuale
```bash
curl -X POST "YOUR_WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d '{"content": "Test da Shappa"}'
```

---

## 🚀 Prossimi Step

### Fase 1 - Test Travis Scott (ORA)
- [x] Sistema base implementato
- [ ] Testare con prodotto reale
- [ ] Verificare notifiche Discord
- [ ] Ottimizzare intervallo polling

### Fase 2 - Moduli Aggiuntivi
- [ ] StandardMonitor (HTML parsing)
- [ ] APIMonitor (generic REST APIs)
- [ ] KeywordsMonitor (text pattern matching)

### Fase 3 - Cloudflare Bypass
- [ ] Puppeteer integration
- [ ] Cookie management
- [ ] Retry logic

### Fase 4 - Auto Checkout (futuro)
- [ ] ATC automation
- [ ] Checkout flow
- [ ] Payment integration

---

## 📝 Note Importanti

1. **Intervallo Minimo**: 5 minuti (evita rate limiting)
2. **Shopify API**: Endpoint `.js` è pubblico, no auth richiesta
3. **Discord Rate Limits**: Max 30 req/min per webhook
4. **Server Restart**: Monitor ripartono automaticamente al boot
5. **User ID**: Usa `AuthManager.getCurrentUser().id`

---

## 🎉 Sistema Pronto!

Vai su **shapiro.ninja** e crea il tuo primo monitor Travis Scott! 🔥
