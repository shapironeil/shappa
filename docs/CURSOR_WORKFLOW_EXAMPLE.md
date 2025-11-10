# 📚 Esempio Pratico: Workflow Cursor Pro + Figma

Questo documento mostra un esempio completo di come usare Cursor Pro con Figma per creare una nuova feature.

---

## 🎯 Scenario: Creare Pagina Dashboard Sport

### Step 1: Design in Figma

1. **Apri Figma** e crea nuovo frame chiamato `dashboard-sport`
2. **Crea componenti:**
   - `SportProfileCard` - Card profilo utente
   - `WorkoutList` - Lista workout
   - `StatsWidget` - Widget statistiche
3. **Organizza layout:**
   - Usa auto-layout per responsive
   - Aggiungi spacing consistente
   - Usa colori dal design system

4. **Ottieni File Key:**
   - Copia URL: `https://www.figma.com/file/ABC123XYZ/Dashboard`
   - File Key: `ABC123XYZ`

---

### Step 2: Analisi con Cursor Chat

Apri Cursor Chat e chiedi:

```
Analizza il design Figma ABC123XYZ per la pagina dashboard-sport:
- Quali componenti React servono?
- Quali API endpoint servono?
- Quali agenti coinvolgere?
- Quali file modificare/creare?
- Possibili conflitti con codice esistente?

Controlla:
- AGENT_SYSTEM_GUIDE.md per agenti disponibili
- WORKFLOW.md per architettura
- frontend/src/components/ per pattern esistenti
```

**Risposta attesa da Cursor:**
- Lista componenti da creare
- Endpoint API necessari
- Agenti da usare (FigmaAgent, FrontendAgent)
- File da modificare/creare
- Pattern da seguire

---

### Step 3: Preparazione

Prima di implementare, verifica:

```bash
# Controlla che FIGMA_API_KEY sia configurata
cat .env.private | grep FIGMA_API_KEY

# Verifica che server sia in esecuzione
curl http://localhost:3000/api/agents/stats
```

---

### Step 4: Implementazione con Cursor Composer

Apri Cursor Composer (Ctrl+I / Cmd+I) e inserisci:

```
Crea pagina dashboard sport da design Figma:
- File Figma: ABC123XYZ
- Frame: dashboard-sport
- Nome pagina: SportDashboard
- Path: frontend/src/pages/SportDashboard.tsx

Componenti necessari:
- SportProfileCard (da Figma component)
- WorkoutList (da Figma component)
- StatsWidget (da Figma component)

Collega a API:
- GET /api/sport/profile/:userId
- GET /api/sport/workouts/:userId
- GET /api/sport/stats/:userId

Usa agenti:
- FigmaAgent per estrarre design
- FrontendAgent per integrazione API

Segui pattern esistenti in frontend/src/components/
```

**Cursor farà:**
1. Analizza design Figma
2. Genera componenti React
3. Collega a API endpoints
4. Integra con agenti
5. Segue pattern esistenti

---

### Step 5: Verifica e Test

Dopo che Cursor ha generato il codice:

```bash
# Testa FigmaAgent
curl -X POST http://localhost:3000/api/figma/create-page \
  -H "Content-Type: application/json" \
  -d '{
    "fileKey": "ABC123XYZ",
    "pageName": "SportDashboard",
    "pagePath": "frontend/src/pages/SportDashboard.tsx",
    "backendConfig": {
      "apiBase": "http://localhost:3000",
      "endpoints": [
        {"path": "/api/sport/profile/:userId", "method": "GET"},
        {"path": "/api/sport/workouts/:userId", "method": "GET"},
        {"path": "/api/sport/stats/:userId", "method": "GET"}
      ]
    }
  }'

# Verifica che componenti siano stati creati
ls frontend/src/components/ | grep -i sport

# Testa frontend
cd frontend && npm run dev
```

---

### Step 6: Integrazione Manuale (se necessario)

Se Cursor non ha collegato tutto automaticamente:

**Apri Cursor Chat:**
```
Il componente SportProfileCard non carica i dati.
Collega il componente all'endpoint /api/sport/profile/:userId.
Usa il pattern esistente in frontend/src/components/UserProfile.tsx
```

**O modifica manualmente:**
```typescript
// frontend/src/components/SportProfileCard.tsx
import { useEffect, useState } from 'react';
import { apiClient } from '../api/sport';

export function SportProfileCard({ userId }: { userId: string }) {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    apiClient.getProfile(userId).then(setProfile);
  }, [userId]);

  // ... resto del componente
}
```

---

### Step 7: Documentazione

Aggiorna documentazione:

**CHANGELOG.md:**
```markdown
## [Unreleased]

### Added
- SportDashboard page con componenti da Figma
- SportProfileCard, WorkoutList, StatsWidget components
- Integrazione con /api/sport/* endpoints
- Figma design: ABC123XYZ (dashboard-sport frame)
```

**README.md (se necessario):**
```markdown
## Sport Dashboard

Pagina dashboard per gestione workout e statistiche sportive.

- Design: Figma file ABC123XYZ, frame "dashboard-sport"
- Componenti: SportProfileCard, WorkoutList, StatsWidget
- API: /api/sport/profile, /api/sport/workouts, /api/sport/stats
```

---

### Step 8: Sincronizzazione Futura

Quando modifichi design in Figma:

**Apri Cursor Chat:**
```
Sincronizza design Figma ABC123XYZ con codice esistente:
- Frame: dashboard-sport
- Controlla cambiamenti nei componenti
- Aggiorna solo componenti modificati
- Mantieni logica business esistente
```

**O via API:**
```bash
curl -X POST http://localhost:3000/api/figma/sync \
  -H "Content-Type: application/json" \
  -d '{
    "fileKey": "ABC123XYZ",
    "nodeId": "NODE_ID_DEL_FRAME"
  }'
```

---

## 🎨 Esempio Completo: Prompt per Cursor

### Prompt Completo per Nuova Feature

```
Crea feature completa [NOME_FEATURE]:

DESIGN:
- File Figma: [FILE_KEY]
- Frame/Page: [NOME_FRAME]
- Componenti: [LISTA_COMPONENTI]

FRONTEND:
- Nome pagina: [NOME_PAGINA]
- Path: [PATH_FILE]
- Componenti React: [LISTA_COMPONENTI]
- Styling: [TAILWIND/CSS_MODULES/STYLED]

BACKEND:
- Endpoint: [ENDPOINT_PATH]
- Metodo: [GET/POST/PUT/DELETE]
- Parametri: [PARAMS]
- Response: [SCHEMA]

AGENTI:
- [AGENT1] per [TASK1]
- [AGENT2] per [TASK2]

INTEGRAZIONE:
- Collega a [SISTEMA_ESISTENTE]
- Usa pattern da [FILE_ESEMPIO]
- Mantieni compatibilità con [FEATURE_ESISTENTE]

TEST:
- Testa [SCENARIO1]
- Verifica [SCENARIO2]
```

---

## 🔄 Workflow Iterativo

### Quando Modifichi Design

1. **Modifica in Figma**
2. **Sincronizza con Cursor:**
   ```
   Sincronizza design Figma [KEY] - frame [FRAME]:
   - Identifica cambiamenti
   - Aggiorna solo componenti modificati
   - Mantieni logica esistente
   ```
3. **Verifica diff** prima di applicare
4. **Testa** che tutto funzioni

### Quando Aggiungi Funzionalità

1. **Analizza con Chat:**
   ```
   Aggiungo funzionalità [DESCRIZIONE] a [COMPONENTE]:
   - Quali file modificare?
   - Quali API servono?
   - Quali agenti coinvolgere?
   ```
2. **Implementa con Composer**
3. **Testa integrazione**
4. **Documenta modifiche**

---

## 💡 Tips e Tricks

### Prompt Efficaci

✅ **Buono:**
```
Crea componente UserCard da Figma component "UserCard" 
nel file ABC123XYZ. Collega a /api/users/:id. 
Usa pattern da frontend/src/components/ProductCard.tsx
```

❌ **Cattivo:**
```
Fai una card utente
```

### Debug con Cursor

```
Debug problema: [DESCRIZIONE]
- Errore: [MESSAGGIO_ERRORE]
- File: [PATH_FILE]
- Linea: [NUMERO]
- Cosa ho provato: [TENTATIVI]
- Contesto: [DESCRIZIONE_CONTESTO]
```

### Refactoring

```
Refactora [COMPONENTE] per:
- Migliorare [ASPETTO]
- Aggiungere [FUNZIONALITÀ]
- Mantenere [COMPATIBILITÀ]
- Seguire [PATTERN]
```

---

## 📊 Checklist Completa

### Setup Iniziale
- [ ] Figma API Key configurata
- [ ] File Figma organizzato
- [ ] `.cursorrules` presente
- [ ] Documentazione aggiornata

### Per Ogni Feature
- [ ] Design in Figma completato
- [ ] Analisi con Cursor Chat fatta
- [ ] Implementazione con Composer completata
- [ ] Test integrazione passati
- [ ] Documentazione aggiornata
- [ ] CHANGELOG aggiornato

### Manutenzione
- [ ] Design sincronizzato con codice
- [ ] Pattern documentati
- [ ] Best practices seguite
- [ ] Coerenza mantenuta

---

**Prossimo Step:** Prova questo workflow con una feature semplice per familiarizzare!

