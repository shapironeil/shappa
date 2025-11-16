# 🔍 Verifica Server - Troubleshooting

## ✅ Configurazione Attuale

### File Esistenti
- ✅ `index.html` - Esiste
- ✅ `src/pages/dieta.html` - Esiste  
- ✅ `src/styles/main.css` - Esiste

### Middleware Configurato
- ✅ Route handler `/` → serve `index.html`
- ✅ `express.static(__dirname)` → serve file dalla root
- ✅ `/src/pages` → serve file da `src/pages/`
- ✅ `/src/styles` → serve file da `src/styles/`
- ✅ `/src/utils` → serve file da `src/utils/`
- ✅ `/assets` → serve file da `assets/`
- ✅ Endpoint test `/test` → verifica che il server risponda

## 🚀 Come Testare

### 1. Avvia il Server
```bash
node server.js
```

### 2. Verifica che il Server si Avvii
Dovresti vedere:
```
🔧 Configuring static files middleware...
✅ Static files middleware configured (after API routes)
   - Root: / (serves index.html)
   - Pages: /src/pages
   - Styles: /src/styles
   - Utils: /src/utils
   - Assets: /assets
   - Test endpoint: /test
```

### 3. Testa gli Endpoint

**Nel browser:**
- `http://localhost:3000/` → Home page
- `http://localhost:3000/test` → Dovrebbe restituire JSON
- `http://localhost:3000/src/pages/dieta.html` → Pagina dieta

**Con curl (se disponibile):**
```bash
curl http://localhost:3000/test
curl http://localhost:3000/
```

**Con lo script di test:**
```bash
# In un altro terminale, dopo aver avviato il server
node test-server.js
```

## 🐛 Problemi Comuni

### Server non si avvia
- Controlla errori nella console
- Verifica che la porta 3000 non sia già in uso
- Controlla che tutte le dipendenze siano installate: `npm install`

### 404 Not Found
- Verifica che i file esistano nei percorsi corretti
- Controlla che il middleware sia configurato (dovresti vedere i log)
- Prova l'endpoint `/test` per verificare che il server risponda

### Pagina bianca
- Apri la console del browser (F12)
- Controlla errori JavaScript
- Verifica che i CSS vengano caricati: `http://localhost:3000/src/styles/main.css`

### BOM (Byte Order Mark)
Se vedi errori di sintassi all'inizio del file, potrebbe esserci un BOM. 
Il file `server.js` potrebbe avere caratteri invisibili all'inizio.

## 📝 Checklist

- [ ] Server si avvia senza errori
- [ ] Vedi i log del middleware nella console
- [ ] `/test` restituisce JSON
- [ ] `/` mostra la home page
- [ ] `/src/pages/dieta.html` mostra la pagina dieta
- [ ] CSS viene caricato correttamente
- [ ] Nessun errore nella console del browser

