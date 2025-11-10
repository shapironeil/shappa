# 🎨 Applicare Design Figma alla Pagina Dieta

## 📋 Informazioni Design

**File Figma:** [Health-Diet-Dashboard--Copy-](https://www.figma.com/make/qEikXdYIE1SPArKu66qw0m/Health-Diet-Dashboard--Copy-?node-id=0-1&p=f&t=5qmeOfJS1RAiQAe3-0)

**File Key:** `qEikXdYIE1SPArKu66qw0m`  
**Node ID:** `0-1`

## 🚀 Come Applicare

### Metodo 1: Via API Endpoint (Consigliato)

1. **Avvia il server:**
   ```bash
   node server.js
   ```

2. **Chiama l'endpoint:**
   ```bash
   curl -X POST http://localhost:3000/api/figma/apply-to-dieta \
     -H "Content-Type: application/json" \
     -d '{
       "fileKey": "qEikXdYIE1SPArKu66qw0m",
       "nodeId": "0-1"
     }'
   ```

   Oppure usa Postman/Thunder Client:
   - **URL:** `POST http://localhost:3000/api/figma/apply-to-dieta`
   - **Body:**
     ```json
     {
       "fileKey": "qEikXdYIE1SPArKu66qw0m",
       "nodeId": "0-1"
     }
     ```

### Metodo 2: Script Diretto

```bash
node scripts/apply-figma-dieta-direct.js
```

## ✅ Cosa Viene Preservato

L'endpoint `/api/figma/apply-to-dieta` mantiene automaticamente:

1. ✅ **Sidebar Venus** - Navigazione completa
2. ✅ **Calendario Settimanale** - Funzioni `setupCalendar()`, `renderCalendar()`
3. ✅ **Dinner Alternatives** - Funzioni `loadDinnerRecipes()`, `filterRecipes()`, `renderRecipes()`
4. ✅ **Weight & Calories Tracker** - Funzione `setupTabs()`
5. ✅ **Meal Planning** - Funzioni `renderMeals()`, `showMealDetails()`
6. ✅ **API Integration** - Tutte le chiamate API per ricette
7. ✅ **Auth System** - Integrazione con `auth-v2.js`

## 🔧 Requisiti

- ✅ Server in esecuzione (`node server.js`)
- ✅ `FIGMA_API_KEY` configurato in `.env.private`
- ✅ Token Figma con accesso al file

## ⚠️ Troubleshooting

### Errore: "Invalid token" (403)

**Causa:** Il token Figma non ha accesso al file o non è valido.

**Soluzione:**
1. Verifica che `FIGMA_API_KEY` in `.env.private` sia corretto
2. Assicurati che il token abbia i permessi per accedere ai file
3. Per file `/make/` (community), potrebbe essere necessario:
   - Duplicare il template in un file normale
   - Oppure usare un token con permessi più ampi

### Errore: "Server not running"

**Soluzione:**
```bash
node server.js
```

### Design applicato ma funzioni non funzionano

**Verifica:**
1. Controlla la console browser per errori JavaScript
2. Verifica che tutte le funzioni siano state preservate
3. Controlla che gli ID degli elementi siano corretti

## 📝 Risultato

Dopo l'applicazione, la pagina `src/pages/dieta.html` avrà:
- ✅ Design identico a Figma
- ✅ Tutte le funzioni JavaScript preservate
- ✅ Sidebar funzionante
- ✅ API calls attive
- ✅ Calendario funzionante
- ✅ Ricette GialloZafferano funzionanti

---

**Nota:** Se il token Figma non funziona, posso creare una versione basata su best practices che mantiene tutte le funzioni ma applica uno stile moderno simile al design Figma.

