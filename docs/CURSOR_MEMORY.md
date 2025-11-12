# 🧠 Cursor Memory - Memoria Persistente

**Ultimo aggiornamento:** Gennaio 2025  
**Scopo:** Catturare e preservare le preferenze, i criteri e i pattern dell'utente per uso futuro

---

## 👤 Preferenze Utente

### Workflow Preferito
- **Approccio:** L'utente descrive cosa fare e come collegare le pagine con funzioni e memorizzazione
- **Comunicazione:** Diretta e specifica, senza ambiguità
- **Feedback:** L'utente si aspetta che Cursor capisca già come lavora e con quali criteri

### Criteri di Lavoro

#### 1. Visione Completa del Progetto
- **Richiesta:** Massima visione del progetto per evitare cose inutili e doppie
- **Implementazione:** Consultare sempre PROJECT_KNOWLEDGE_BASE.md prima di modifiche
- **Verifica:** Controllare duplicazioni e conflitti prima di implementare

#### 2. Comunicazione Continua tra Agenti
- **Richiesta:** Agenti devono comunicare costantemente tra loro
- **Implementazione:** Sistema event-driven con verifica continua dati
- **Verifica:** Agenti devono riportare sempre "ok" e verificare dati per visione completa

#### 3. Comprensione del Workflow
- **Richiesta:** Cursor deve già sapere come l'utente lavora e con quali criteri
- **Implementazione:** Documentare workflow in USER_WORKFLOW.md
- **Verifica:** Consultare memoria prima di ogni task

#### 4. Task Complesse con Sincronizzazione
- **Richiesta:** Task complesse con sincronizzazione tra componenti
- **Implementazione:** Sistema di task con dipendenze e pipeline
- **Verifica:** Sincronizzazione automatica quando si capisce cosa fare

---

## 🎯 Pattern Comuni Utilizzati

### Pattern Creazione Pagina
1. Design in Figma con naming consistente
2. Analisi con Cursor Chat per identificare componenti/API
3. Implementazione con Composer per modifiche multi-file
4. Integrazione automatica via agenti
5. Collegamento a API backend esistenti
6. Memorizzazione dati in `data/` con struttura JSON

### Pattern Integrazione API
1. Identificare endpoint necessari
2. Verificare esistenza in `server.js`
3. Se mancante, creare endpoint seguendo pattern esistenti
4. Collegare frontend con `fetch()` o `axios`
5. Gestire errori e loading states
6. Validare input con `validationUtils`

### Pattern Gestione Dati
1. Usare `fileUtils` per operazioni file
2. Usare `pathUtils` per path construction
3. Usare `responseUtils` per risposte API standardizzate
4. Salvare in `data/[category]/[userId].json`
5. Struttura dati consistente e versionata

### Pattern Sistema Agenti
1. Usare Coordinator per task complesse
2. Agenti specializzati per dominio
3. Comunicazione via event bus
4. Verifica continua dello stato
5. Log centralizzato delle operazioni

---

## 🚫 Errori Comuni da Evitare

### 1. Duplicazioni di Codice
- **Errore:** Creare funzioni duplicate invece di usare utility modules
- **Soluzione:** Sempre controllare `lib/utils/` prima di creare nuove funzioni
- **Verifica:** Cercare pattern simili nel codebase

### 2. Modifiche a File Protetti
- **Errore:** Modificare `.env.private` o file con credenziali
- **Soluzione:** Solo leggere, mai modificare senza consenso esplicito
- **Verifica:** Controllare CONFIGURATION_RULES.md

### 3. Breaking Changes
- **Errore:** Modifiche che rompono funzionalità esistenti
- **Soluzione:** Mantenere backward compatibility
- **Verifica:** Testare funzionalità esistenti dopo modifiche

### 4. Mancanza di Documentazione
- **Errore:** Non documentare decisioni importanti
- **Soluzione:** Aggiornare documentazione rilevante
- **Verifica:** Consultare file di riferimento prima di modifiche

### 5. Ignorare Workflow Utente
- **Errore:** Non seguire i criteri e preferenze dell'utente
- **Soluzione:** Consultare questa memoria prima di ogni task
- **Verifica:** Verificare che implementazione segua workflow preferito

---

## 📋 Standard di Codice

### Qualità Codice
- **DRY:** Non ripetere codice, usare utility modules
- **Modularità:** Separare logica in moduli riutilizzabili
- **Documentazione:** Commentare codice complesso
- **Consistenza:** Seguire naming conventions esistenti
- **Testabilità:** Codice facilmente testabile

### Struttura File
- **Organizzazione:** File logici e ben organizzati
- **Separazione:** Logica separata da presentazione
- **Coesione:** File con responsabilità chiare
- **Accoppiamento:** Basso accoppiamento tra moduli

### Gestione Errori
- **Try-Catch:** Sempre gestire errori
- **Logging:** Log strutturato per debugging
- **Messaggi:** Messaggi di errore chiari e utili
- **Fallback:** Valori di default quando possibile

### Performance
- **Lazy Loading:** Caricare dati solo quando necessario
- **Caching:** Cache dati quando appropriato
- **Ottimizzazione:** Evitare operazioni costose in loop
- **Monitoring:** Monitorare performance

---

## 🔄 Workflow Preferiti per Tipo di Task

### Creazione Nuova Pagina
1. Consultare PAGES_REGISTRY.md per vedere pagine simili
2. Identificare API endpoint necessari
3. Creare HTML seguendo pattern Venus Design System
4. Collegare a API backend
5. Aggiungere a registry pagine
6. Testare funzionalità completa

### Modifica Pagina Esistente
1. Leggere codice esistente per capire struttura
2. Identificare modifiche necessarie
3. Verificare compatibilità con codice esistente
4. Implementare modifiche mantenendo pattern
5. Testare che funzionalità esistenti funzionino ancora
6. Aggiornare documentazione se necessario

### Integrazione Nuova Funzionalità
1. Analizzare requisiti e identificare componenti
2. Verificare se agenti esistenti possono gestire
3. Se necessario, estendere agenti esistenti
4. Creare endpoint API se necessario
5. Collegare frontend e backend
6. Testare integrazione completa

### Refactoring
1. Identificare codice duplicato o migliorabile
2. Creare utility modules se necessario
3. Refactorizzare mantenendo funzionalità
4. Testare che tutto funzioni ancora
5. Aggiornare documentazione
6. Verificare che non ci siano regressioni

---

## 💡 Suggerimenti Intelligenti

### Quando Creare Nuovo File
- Funzionalità completamente nuova e isolata
- Utility riutilizzabile in più posti
- Agente specializzato per nuovo dominio
- Documentazione specifica per feature

### Quando Modificare File Esistente
- Estendere funzionalità esistente
- Fix bug o miglioramenti
- Refactoring per migliorare qualità
- Aggiornare per nuove esigenze

### Quando Usare Agenti
- Task complesse che richiedono coordinamento
- Integrazione con servizi esterni
- Generazione codice da design
- Automazioni e workflow

### Quando Consultare Documentazione
- Prima di modifiche importanti
- Quando si lavora su area nuova
- Per capire pattern esistenti
- Per verificare compatibilità

---

## 🎓 Apprendimento Continuo

### Pattern Appresi
- L'utente preferisce task complesse ben sincronizzate
- Comunicazione continua tra componenti è critica
- Visione completa del progetto evita errori
- Workflow deve essere intuitivo e automatico

### Decisioni Importanti
- Sistema online-first per scalabilità
- Coordinator pattern per agenti
- Utility modules per DRY
- Documentazione sempre aggiornata

### Miglioramenti Futuri
- Sistema di comunicazione inter-agente più robusto
- Task system con dipendenze e pipeline
- Workflow presets per task comuni
- Documentazione auto-generata

---

## ⚠️ Regole Critiche

1. **Mai modificare file protetti** senza consenso esplicito
2. **Sempre consultare knowledge base** prima di modifiche importanti
3. **Verificare duplicazioni** prima di creare nuovo codice
4. **Mantenere backward compatibility** quando possibile
5. **Documentare decisioni** importanti
6. **Testare integrazioni** dopo modifiche
7. **Comunicare stato** delle operazioni all'utente
8. **Seguire workflow preferito** dell'utente
9. **Evitare lavori inutili** verificando prima
10. **Rispettare criteri** e preferenze dell'utente

---

**Questa memoria deve essere consultata PRIMA di ogni task per assicurare coerenza con le preferenze dell'utente.**


