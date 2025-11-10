# 🎯 Criteri e Metriche Utente - LifeManager

**Ultimo aggiornamento:** 2025-01-10

## 📋 Principi Fondamentali

### 1. ⚠️ Server-First Workflow (CRITICO)

**REGOLA D'ORO:** Tutti i dati runtime devono essere salvati SOLO sul server via API.

#### ❌ MAI FARE:
- ❌ `localStorage.setItem()` - NON salvare dati sul client
- ❌ `localStorage.getItem()` - NON caricare dati dal client  
- ❌ `sessionStorage` - NON usare storage lato client
- ❌ Fallback a storage client-side quando API fallisce
- ❌ Salvare dati in memoria locale del browser come backup
- ❌ Usare cache lato client per dati persistenti

#### ✅ SEMPRE FARE:
- ✅ Usare API endpoints (`/api/*`) per salvare/caricare dati
- ✅ Database (MongoDB Atlas) per persistenza
- ✅ File system sul server per dati temporanei (se necessario)
- ✅ Mostrare messaggio di errore se API fallisce
- ✅ Loggare errori per debug
- ✅ Inizializzare con dati vuoti se API non disponibile

### 2. 🎨 Design e UI

#### Estetica:
- **Figma come fonte di verità** - Design deve essere identico a Figma
- **Nessun emoji nelle UI** (tranne casi specifici approvati)
- **Spaziatura corretta** - Padding/margin devono rispettare il design
- **Font size appropriati** - Leggibili ma non eccessivi
- **Colori consistenti** - Usare palette del design system

#### Widget e Componenti:
- **Dimensioni appropriate** - Non troppo grandi, non troppo piccoli
- **Scroll solo quando necessario** - Rimuovere scroll inutili
- **Stati visivi chiari** - Selected, hover, disabled devono essere evidenti
- **Badge e tag consistenti** - Stesso stile per stesse funzionalità

### 3. 🔄 Funzionalità e Logica

#### Selezione e Stato:
- **Selezione singola o multipla** - Decidere in base al contesto (diete: singola, schede allenamento: multipla)
- **Stato persistente** - Selezione deve essere salvata sul server
- **Caricamento stato** - Al reload, stato deve essere ripristinato dal server
- **Feedback visivo** - Stato selezionato deve essere chiaramente visibile

#### Filtri e Raccomandazioni:
- **Raccomandazioni solo con dati** - Non mostrare raccomandazioni se non ci sono dati di base
- **Filtri intelligenti** - Filtrare in base a preferenze utente
- **Fallback appropriati** - Se nessun risultato, mostrare messaggio utile

### 4. 📊 Dati e Persistenza

#### Salvataggio:
- **Sempre sul server** - Tutti i salvataggi via API
- **Timestamps** - Aggiungere `updatedAt` per tracciare modifiche
- **Validazione** - Validare dati prima di salvare
- **Error handling** - Gestire errori in modo user-friendly

#### Caricamento:
- **Solo da server** - Caricare dati solo via API
- **Inizializzazione vuota** - Se API fallisce, iniziare con dati vuoti
- **Logging** - Loggare da dove vengono caricati i dati
- **Sincronizzazione** - Aggiornare UI dopo caricamento

### 5. 🐛 Gestione Errori

#### Quando API Fallisce:
- ✅ Mostrare messaggio di errore chiaro all'utente
- ✅ Loggare errore per debug
- ❌ NON salvare in localStorage come fallback
- ❌ NON usare dati locali come backup
- ❌ NON nascondere l'errore

#### Messaggi Utente:
- **Chiaro e diretto** - Spiegare cosa è successo
- **Azione suggerita** - Dire all'utente cosa fare (es: "Riprova più tardi")
- **Non tecnico** - Evitare messaggi tecnici per utente finale

### 6. 🎯 Metriche di Qualità

#### Codice:
- **Nessun localStorage** - Zero riferimenti a localStorage per dati runtime
- **Tutti i dati via API** - Ogni dato deve passare per API
- **Error handling completo** - Ogni chiamata API deve gestire errori
- **Logging appropriato** - Log per debug ma non eccessivo

#### UI/UX:
- **Design identico a Figma** - Zero differenze visive
- **Feedback immediato** - Utente deve sapere cosa sta succedendo
- **Stati chiari** - Selected, loading, error devono essere evidenti
- **Performance** - Caricamento veloce, nessun lag

#### Funzionalità:
- **Tutto funziona** - Nessuna feature rotta
- **Stato persistente** - Dati non si perdono al reload
- **Sincronizzazione** - UI aggiornata dopo ogni operazione
- **Validazione** - Dati validati prima di salvare

## 📝 Checklist Pre-Deploy

Prima di fare deploy, verificare:

- [ ] Nessun `localStorage.setItem()` nel codice
- [ ] Nessun `localStorage.getItem()` nel codice
- [ ] Tutti i dati salvati via API
- [ ] Tutti i dati caricati via API
- [ ] Error handling completo per ogni API call
- [ ] Messaggi di errore user-friendly
- [ ] Design identico a Figma
- [ ] Nessun emoji nelle UI (tranne approvati)
- [ ] Spaziatura corretta
- [ ] Scroll rimossi dove non necessari
- [ ] Stati visivi chiari (selected, hover, etc.)
- [ ] Logging appropriato (non eccessivo)
- [ ] Commenti nel codice per logica complessa

## 🚨 Segnali di Allarme

Se vedi questi pattern, FERMATI e correggi:

- 🔴 `localStorage.setItem()` - RIMUOVERE IMMEDIATAMENTE
- 🔴 `localStorage.getItem()` - RIMUOVERE IMMEDIATAMENTE
- 🔴 Fallback a localStorage - RIMUOVERE IMMEDIATAMENTE
- 🔴 Salvataggio in memoria locale - RIMUOVERE IMMEDIATAMENTE
- 🟡 Design diverso da Figma - VERIFICARE E CORREGGERE
- 🟡 Emoji nelle UI - RIMUOVERE (tranne approvati)
- 🟡 Scroll inutili - RIMUOVERE
- 🟡 Messaggi di errore tecnici - SOSTITUIRE CON MESSAGGI USER-FRIENDLY

## 💡 Best Practices

### Salvataggio Dati:
```javascript
// ✅ CORRETTO
try {
    const response = await fetch(`/api/diet/preferences/${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    
    const result = await response.json();
    if (result.success) {
        // Aggiorna UI
        alert('✅ Salvato con successo!');
    }
} catch (error) {
    console.error('❌ Error:', error);
    alert('❌ Errore nel salvare. Riprova più tardi.');
    // NON salvare localmente
}
```

### Caricamento Dati:
```javascript
// ✅ CORRETTO
try {
    const response = await fetch(`/api/diet/data/${userId}`);
    
    if (!response.ok) {
        // Inizializza con dati vuoti
        return { fridge: [], preferences: null, ... };
    }
    
    const result = await response.json();
    if (result.success && result.data) {
        return result.data;
    }
} catch (error) {
    console.error('❌ Error loading data:', error);
    // Ritorna dati vuoti, NON caricare da localStorage
    return { fridge: [], preferences: null, ... };
}
```

### Gestione Errori API:
```javascript
// ✅ CORRETTO - Se API fallisce, ricarica dati dal server
try {
    const response = await fetch(`/api/diet/save/${userId}`, {
        method: 'POST',
        body: JSON.stringify(data)
    });
    
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    
    const result = await response.json();
    if (result.success) {
        // Aggiorna solo DOPO conferma dal server
        localData = data;
        updateUI();
    }
} catch (error) {
    console.error('❌ Error:', error);
    // Ricarica dati dal server per evitare inconsistenze
    await loadDataFromServer();
    alert('❌ Errore. I dati sono stati ripristinati. Riprova.');
}
```

## 📚 Riferimenti

- `WORKFLOW.md` - Workflow online-first completo
- `.cursorrules` - Regole repository
- `AGENT_SYSTEM_GUIDE.md` - Sistema agenti
- `CONFIGURATION_RULES.md` - Regole configurazione

---

**Ricorda:** Ogni volta che modifichi codice, verifica che rispetti questi criteri. Se non sei sicuro, chiedi o consulta questa guida.

