# 🚀 Strategia Cursor Pro - LifeManager

**Ultimo aggiornamento:** Gennaio 2025  
**Obiettivo:** Sfruttare al massimo Cursor Pro per mantenere coerenza, memoria e workflow ottimizzato

---

## 📋 Indice

1. [Workflow Principale](#workflow-principale)
2. [Integrazione Figma](#integrazione-figma)
3. [Sistema di Memoria e Coerenza](#sistema-di-memoria-e-coerenza)
4. [Regole Cursor](#regole-cursor)
5. [Best Practices](#best-practices)
6. [Checklist Operativa](#checklist-operativa)

---

## 🎯 Workflow Principale

### Flusso Standard per Ogni Task

```
1. DESIGN (Figma) 
   ↓
2. ANALISI (Cursor Chat)
   ↓
3. IMPLEMENTAZIONE (Cursor Composer)
   ↓
4. INTEGRAZIONE (Agenti)
   ↓
5. DOCUMENTAZIONE (Auto-generata)
```

### Dettaglio Step-by-Step

#### 1️⃣ **DESIGN in Figma**
- Crea il design della pagina/componente in Figma
- Usa naming conventions consistenti per i componenti
- Organizza in frame/pages chiari
- Aggiungi annotazioni per logica business

**Naming Convention Figma:**
```
Componenti: PascalCase (es: DashboardCard, UserProfile)
Frame: kebab-case (es: dashboard-page, settings-modal)
Varianti: descriptive (es: button-primary, button-secondary)
```

#### 2️⃣ **ANALISI con Cursor Chat**
Prima di implementare, chiedi a Cursor:

```
"Analizza il design Figma [FILE_KEY] e dimmi:
- Quali componenti servono
- Quali API endpoint servono
- Quali agenti coinvolgere
- Quali file modificare/creare
- Possibili conflitti con codice esistente"
```

**Prompt Template:**
```
Analizza il task: [DESCRIZIONE]
- Controlla CONFIGURATION_RULES.md per regole
- Controlla AGENT_SYSTEM_GUIDE.md per agenti disponibili
- Controlla WORKFLOW.md per architettura
- Suggerisci approccio e file da modificare
```

#### 3️⃣ **IMPLEMENTAZIONE con Cursor Composer**
Usa Composer per modifiche multi-file:

**Workflow Composer:**
1. Apri Composer (Ctrl+I / Cmd+I)
2. Descrivi il task completo
3. Cursor analizza e modifica tutti i file necessari
4. Verifica diff prima di applicare

**Esempio:**
```
"Creo pagina dashboard da Figma:
- File Figma: [FILE_KEY]
- Nome pagina: dashboard
- Collega a API: /api/sport/profile, /api/interests
- Usa agenti: FigmaAgent → FrontendAgent
- Path output: src/pages/dashboard.html"
```

#### 4️⃣ **INTEGRAZIONE Automatica**
Gli agenti gestiscono automaticamente:
- FigmaAgent: estrae design e genera codice
- FrontendAgent: collega a backend
- DataAgent: gestisce cache e stato
- SecurityAgent: valida autenticazione

#### 5️⃣ **DOCUMENTAZIONE Auto-generata**
Cursor aggiorna automaticamente:
- CHANGELOG.md (se presente)
- README.md (se necessario)
- Commenti nel codice

---

## 🎨 Integrazione Figma

### Setup Iniziale

1. **Ottieni Figma API Key:**
   - Vai su https://www.figma.com/developers/api#access-tokens
   - Crea Personal Access Token
   - Aggiungi a `.env.private`:
   ```env
   FIGMA_API_KEY=figd_xxxxxxxxxxxxx
   ```

2. **Organizza File Figma:**
   - Un file principale per il progetto
   - Pages separate per ogni feature
   - Componenti riutilizzabili in library

3. **Configura FigmaAgent:**
   ```javascript
   // Il FigmaAgent è già configurato in agents/figma/FigmaAgent.js
   // Basta avere FIGMA_API_KEY nel .env
   ```

### Workflow Figma → Codice

#### Opzione A: Via API (Automatico)
```bash
# Crea pagina da Figma
curl -X POST http://localhost:3000/api/figma/create-page \
  -H "Content-Type: application/json" \
  -d '{
    "fileKey": "YOUR_FIGMA_FILE_KEY",
    "pageName": "dashboard",
    "pagePath": "src/pages/dashboard.html",
    "backendConfig": {
      "apiBase": "https://shapiro.ninja",
      "endpoints": [
        { "path": "/api/sport/profile/:userId", "method": "GET" }
      ]
    }
  }'
```

#### Opzione B: Via Cursor Chat (Interattivo)
```
"Usa FigmaAgent per creare pagina dashboard:
- File Key: [YOUR_KEY]
- Nome: dashboard
- Collega a endpoint /api/sport/profile"
```

#### Opzione C: Via Coordinator (Programmatico)
```javascript
await coordinator.assignTask({
  type: 'create_page_from_figma',
  fileKey: 'YOUR_FIGMA_FILE_KEY',
  pageName: 'dashboard',
  backendConfig: {
    apiBase: 'https://shapiro.ninja',
    endpoints: [
      { path: '/api/sport/profile/:userId', method: 'GET' }
    ]
  }
});
```

### Sincronizzazione Design → Codice

Quando modifichi design in Figma:

1. **Sincronizza via Cursor:**
   ```
   "Sincronizza design Figma [FILE_KEY] con codice esistente:
   - Controlla cambiamenti
   - Aggiorna solo componenti modificati
   - Mantieni logica business esistente"
   ```

2. **O via API:**
   ```bash
   curl -X POST http://localhost:3000/api/figma/sync \
     -H "Content-Type: application/json" \
     -d '{
       "fileKey": "YOUR_FIGMA_FILE_KEY",
       "nodeId": "NODE_ID"
     }'
   ```

### Best Practices Figma

✅ **DO:**
- Usa componenti riutilizzabili
- Mantieni naming consistente
- Documenta varianti complesse
- Usa auto-layout per responsive
- Organizza in frame logici

❌ **DON'T:**
- Non creare componenti one-off
- Non usare nomi generici (es: "Rectangle", "Group")
- Non mischiare design e logica
- Non dimenticare stati (hover, active, disabled)

---

## 🧠 Sistema di Memoria e Coerenza

### File di Memoria del Progetto

Cursor Pro usa questi file per "ricordare":

1. **CONFIGURATION_RULES.md** - Regole di configurazione
2. **AGENT_SYSTEM_GUIDE.md** - Sistema agenti
3. **WORKFLOW.md** - Architettura e flussi
4. **CURSOR_PRO_STRATEGY.md** - Questo file (workflow Cursor)
5. **README.md** - Panoramica progetto
6. **CHANGELOG.md** - Storico modifiche (da creare)

### Come Cursor "Ricorda"

#### 1. Rules File (`.cursorrules`)
Crea `.cursorrules` nella root del progetto:

```markdown
# LifeManager - Cursor Rules

## Architettura
- Sistema agenti: usa Coordinator per task
- Frontend: React/TypeScript in frontend/, vanilla JS in src/
- Backend: Node.js con Express in server.js
- Database: MongoDB Atlas (online-first)

## Regole
- Mai modificare .env.private senza consenso
- Usa agenti per task complessi
- Segui WORKFLOW.md per architettura
- Documenta modifiche importanti

## Naming
- Componenti React: PascalCase
- File: kebab-case
- Funzioni: camelCase
- Costanti: UPPER_SNAKE_CASE

## Figma Integration
- Usa FigmaAgent per design → codice
- Mantieni sync tra Figma e codice
- Documenta fileKey in commenti

## Testing
- Testa agenti via API endpoints
- Verifica integrazioni prima di commit
```

#### 2. Context Files
Cursor legge automaticamente:
- File aperti nell'editor
- File referenziati nel codice
- File nella stessa directory
- File menzionati in chat

**Strategia:**
- Tieni aperti file chiave durante lavoro
- Usa `@filename` in chat per referenziare file
- Organizza file per feature

#### 3. Chat History
Cursor mantiene contesto nella sessione:
- Conversazioni precedenti
- Decisioni prese
- Errori risolti
- Pattern identificati

**Best Practice:**
- Usa chat per decisioni importanti
- Documenta decisioni in file markdown
- Riferisciti a chat precedenti con "come abbiamo fatto per X"

### Mantenere Coerenza

#### Checklist Pre-Implementazione
Prima di ogni task, verifica:

- [ ] Ho letto CONFIGURATION_RULES.md?
- [ ] Ho controllato AGENT_SYSTEM_GUIDE.md per agenti disponibili?
- [ ] Ho verificato WORKFLOW.md per architettura?
- [ ] Ho controllato codice esistente per pattern simili?
- [ ] Ho identificato file da modificare?
- [ ] Ho verificato conflitti potenziali?

#### Checklist Post-Implementazione
Dopo ogni task:

- [ ] Codice segue naming conventions?
- [ ] Ho aggiornato documentazione se necessario?
- [ ] Ho testato integrazione con agenti?
- [ ] Ho verificato che non rompa funzionalità esistenti?
- [ ] Ho committato con messaggio descrittivo?

---

## 📝 Regole Cursor

### Quando Usare Chat vs Composer

**Usa Chat per:**
- ❓ Domande e analisi
- 🔍 Ricerca nel codebase
- 💡 Suggerimenti e best practices
- 🐛 Debug e troubleshooting
- 📚 Spiegazioni di codice

**Usa Composer per:**
- ✏️ Modifiche multi-file
- 🆕 Creazione nuove feature
- 🔄 Refactoring complesso
- 🎨 Implementazione da Figma
- 🔗 Integrazione componenti

### Prompt Engineering

#### Prompt Efficaci
✅ **Buoni:**
```
"Analizza il design Figma [KEY] e crea pagina dashboard 
collegata a /api/sport/profile. Usa FigmaAgent e 
FrontendAgent. Path: src/pages/dashboard.html"
```

```
"Refactora il componente UserProfile per usare il nuovo 
sistema agenti. Mantieni compatibilità con codice esistente."
```

❌ **Cattivi:**
```
"Fai una pagina" (troppo vago)
```

```
"Cambia tutto" (troppo generico)
```

#### Template Prompt

**Per nuove feature:**
```
Crea [FEATURE] con:
- Design: Figma [KEY] o descrizione
- Backend: endpoint [PATH]
- Frontend: componente [NAME]
- Agenti: [AGENT_LIST]
- Path: [FILE_PATH]
```

**Per modifiche:**
```
Modifica [COMPONENT] per:
- Aggiungere [FUNZIONALITÀ]
- Mantenere [COMPATIBILITÀ]
- Seguire [PATTERN_ESISTENTE]
```

**Per debug:**
```
Debug [PROBLEMA]:
- Errore: [MESSAGGIO]
- File: [PATH]
- Contesto: [DESCRIZIONE]
- Cosa ho provato: [TENTATIVI]
```

---

## ✅ Best Practices

### 1. Organizzazione File

```
LifeManager/
├── agents/          # Sistema agenti
├── frontend/        # React/TypeScript
├── src/            # Vanilla JS
├── docs/           # Documentazione
├── data/           # Dati temporanei
└── *.md            # Guide e regole
```

### 2. Naming Consistency

- **Componenti React:** `DashboardCard.tsx`
- **File HTML:** `dashboard.html`
- **File JS:** `dashboard.js`
- **Agenti:** `FigmaAgent.js`
- **API Routes:** `/api/figma/create-page`

### 3. Documentazione

- **Inline:** commenti per logica complessa
- **File MD:** guide per feature principali
- **README:** panoramica e setup
- **CHANGELOG:** modifiche importanti

### 4. Testing Workflow

1. Testa in locale
2. Verifica agenti via API
3. Controlla integrazioni
4. Testa edge cases
5. Commit e push

### 5. Git Workflow

```bash
# Branch per feature
git checkout -b feature/dashboard-figma

# Commit descrittivi
git commit -m "feat: add dashboard page from Figma design
- Integrate FigmaAgent for design extraction
- Connect to /api/sport/profile endpoint
- Add responsive layout"

# Push e PR
git push origin feature/dashboard-figma
```

---

## 📋 Checklist Operativa

### Setup Iniziale (Una Volta)

- [ ] Configura `.cursorrules` nella root
- [ ] Aggiungi `FIGMA_API_KEY` a `.env.private`
- [ ] Organizza file Figma con naming consistente
- [ ] Crea struttura documentazione
- [ ] Testa connessione Figma API

### Per Ogni Nuova Feature

#### Fase 1: Design
- [ ] Crea design in Figma
- [ ] Usa naming conventions
- [ ] Organizza in frame/pages
- [ ] Documenta logica business

#### Fase 2: Analisi
- [ ] Chiedi a Cursor di analizzare design
- [ ] Identifica componenti necessari
- [ ] Identifica API endpoints
- [ ] Identifica agenti da usare
- [ ] Verifica compatibilità esistente

#### Fase 3: Implementazione
- [ ] Usa Composer per modifiche multi-file
- [ ] Segui naming conventions
- [ ] Integra con agenti esistenti
- [ ] Mantieni coerenza architettura

#### Fase 4: Integrazione
- [ ] Testa FigmaAgent
- [ ] Testa FrontendAgent
- [ ] Verifica connessioni API
- [ ] Testa responsive design

#### Fase 5: Documentazione
- [ ] Aggiorna CHANGELOG
- [ ] Aggiorna README se necessario
- [ ] Documenta fileKey Figma
- [ ] Commenta codice complesso

### Manutenzione Settimanale

- [ ] Sincronizza design Figma con codice
- [ ] Verifica che documentazione sia aggiornata
- [ ] Controlla che agenti funzionino
- [ ] Review codice per coerenza
- [ ] Backup configurazioni importanti

---

## 🔗 Link Utili

- [Figma API Docs](https://www.figma.com/developers/api)
- [Cursor Docs](https://cursor.sh/docs)
- [Agent System Guide](./AGENT_SYSTEM_GUIDE.md)
- [Workflow Guide](./WORKFLOW.md)
- [Configuration Rules](./CONFIGURATION_RULES.md)

---

## 💡 Prossimi Passi

1. **Crea `.cursorrules`** nella root del progetto
2. **Configura Figma API Key** in `.env.private`
3. **Testa workflow** con una pagina semplice
4. **Documenta pattern** che emergono
5. **Itera e migliora** il processo

---

**Ricorda:** Cursor Pro è più potente quando ha contesto. Mantieni file chiave aperti, documenta decisioni, e usa chat per analisi prima di implementare.

**Domande?** Chiedi a Cursor Chat: "Come posso migliorare questo workflow?"

