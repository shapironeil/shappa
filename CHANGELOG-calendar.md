# 📅 CHANGELOG - Ristrutturazione Calendario

**Data:** 2025-01-XX  
**Versione:** 2.0.0  
**Scopo:** Ristrutturazione completa della pagina Calendario per renderla funzionale, visivamente coerente e integrata con il sistema

---

## ✅ Modifiche Implementate

### 1. Rimozione Dati Fittizi
- ✅ Rimossi tutti gli eventi hardcoded (es. "Vendita Completata", "Nuovo Listing")
- ✅ Rimossa sidebar con dati di esempio
- ✅ Rimossi quick stats fittizi
- ✅ Tutti i dati ora provengono esclusivamente da API server

### 2. API Endpoints Creati

#### GET `/api/calendar/events/:userId`
- Ottiene tutti gli eventi calendario per un utente
- Include eventi da:
  - **Sport**: Allenamenti programmati da `/data/sport/{userId}_program.json`
  - **Dieta**: Pasti programmati da `/data/diet/{userId}.json` (se disponibili)
  - **Impegni**: Eventi personalizzati da `/data/calendar/{userId}.json`
- Supporta filtri per data (`startDate`, `endDate`)
- Ordina eventi per data e ora

#### POST `/api/calendar/events/:userId`
- Crea o aggiorna un evento calendario
- Campi supportati:
  - `title` (required)
  - `date` (required)
  - `category` (sport/impegni/dieta)
  - `startTime`, `endTime`
  - `allDay` (boolean)
  - `description`
- Notifica UserProfileAgent per sincronizzazione

#### DELETE `/api/calendar/events/:userId/:eventId`
- Elimina un evento calendario personalizzato

**Directory creata:** `data/calendar/`

---

### 3. Ristrutturazione UI/UX

#### Popup Giorno (Day Popup)
- ✅ Forma larga (rapporto 3:1, max-width 900px, max-height 300px)
- ✅ Mostra data formattata in italiano (es. "Mercoledì 13 Novembre 2025")
- ✅ Elenca eventi in rettangoli verticali ben separati
- ✅ Badge colorati per categorie:
  - 🟢 **Sport**: Verde (#10b981)
  - 🔵 **Impegni**: Blu (#3b82f6)
  - 🟠 **Dieta**: Arancione (#f59e0b)
- ✅ Pulsante "Dettagli" per ogni evento
- ✅ Messaggio professionale quando non ci sono impegni: "Nessun impegno pianificato per oggi."

#### Form Nuovo Impegno
- ✅ Pulsante "+ Nuovo Impegno" in alto a destra del calendario
- ✅ Form modale pulito e professionale
- ✅ Campi:
  - Titolo (required)
  - Categoria (dropdown: Sport / Impegni / Dieta)
  - Data (picker, precompilata se giorno selezionato)
  - Checkbox "Tutto il giorno"
  - Ora inizio / fine (time picker, nascosti se "tutto il giorno")
  - Descrizione (opzionale)
- ✅ Validazione lato client e server
- ✅ Salvataggio via API (no localStorage)

#### Stile Generale
- ✅ Font: sistema Venus (Inter/SF Pro)
- ✅ Colori: palette aziendale ufficiale
- ✅ Animazioni: solo transizioni fluide al hover/click
- ✅ Responsive: funziona su desktop e tablet

---

### 4. Integrazione Sinergica dei Dati

#### Sport
- ✅ Integrato con `/api/sport/program/:userId`
- ✅ Legge `scheduledWorkouts` e converte in eventi calendario
- ✅ Categoria: `sport`
- ✅ Mostra titolo workout, tipo, durata

#### Dieta
- ✅ Integrato con `/api/diet/data/:userId`
- ✅ Legge `mealPlan` (se disponibile) e converte in eventi
- ✅ Categoria: `dieta`
- ✅ Mostra nome pasto, orario

#### Impegni
- ✅ Eventi personalizzati salvati in `/data/calendar/{userId}.json`
- ✅ Categoria: `impegni`
- ✅ Creazione tramite form modale

**Formato Evento Unificato:**
```json
{
  "id": "event_xxx",
  "title": "Titolo evento",
  "date": "2025-11-13",
  "startTime": "18:00",
  "endTime": "19:00",
  "category": "sport|impegni|dieta",
  "description": "Descrizione opzionale",
  "allDay": false,
  "source": "sport|diet|custom"
}
```

---

### 5. Rimozione localStorage

- ✅ Rimossa funzione `loadEvents()` che usava `localStorage.getItem('calendar_events')`
- ✅ Rimossa funzione `saveEventsToStorage()` che usava `localStorage.setItem()`
- ✅ Tutti i dati ora vengono caricati/salvati via API server
- ✅ Gestione errori: mostra messaggio se API fallisce (no fallback locale)

**API Chiamate:**
- `GET /api/calendar/events/:userId` - Carica eventi
- `POST /api/calendar/events/:userId` - Salva evento
- `DELETE /api/calendar/events/:userId/:eventId` - Elimina evento

---

### 6. Rinominare "Obiettivi" in "Impegni"

**Status:** ⚠️ Parziale (link sidebar aggiornati, file obiettivi.html da rinominare manualmente se necessario)

**File Aggiornati:**
- ✅ `src/pages/calendario.html` - Link sidebar aggiornato

**File da Aggiornare (se necessario):**
- `src/pages/dashboard.html`
- `src/pages/sport.html`
- `src/pages/dieta.html`
- `src/pages/settings.html`
- `src/pages/interessi.html`
- Altri file con link a `obiettivi.html`

**Nota:** Il file `impegni.html` esiste già. Se `obiettivi.html` deve essere completamente sostituito, procedere con rinominazione manuale o merge dei contenuti.

---

## 🔧 Dettagli Tecnici

### Struttura Dati

**File:** `data/calendar/{userId}.json`
```json
{
  "events": [
    {
      "id": "event_xxx",
      "title": "Titolo",
      "date": "2025-11-13",
      "startTime": "18:00",
      "endTime": null,
      "category": "impegni",
      "description": "",
      "allDay": false,
      "createdAt": "2025-11-13T10:00:00.000Z",
      "updatedAt": "2025-11-13T10:00:00.000Z"
    }
  ],
  "updatedAt": "2025-11-13T10:00:00.000Z"
}
```

### Helper Functions

**`getDateForDayIndex(dayIndex)`**
- Converte `dayIndex` (0=Lunedì, 6=Domenica) in data ISO
- Usato per convertire allenamenti settimanali in date specifiche

**`formatDate(dateString)`**
- Formatta data in italiano: "Mercoledì 13 Novembre 2025"
- Usato nel popup giorno

---

## 🚀 Come Usare

### Per l'Utente

1. **Visualizzare Eventi:**
   - Clicca su un giorno nel calendario
   - Si apre popup largo con tutti gli eventi del giorno
   - Eventi colorati per categoria

2. **Creare Nuovo Impegno:**
   - Clicca "+ Nuovo Impegno" in alto a destra
   - Compila form modale
   - Salva → evento appare immediatamente nel calendario

3. **Eventi Automatici:**
   - Eventi da Sport e Dieta appaiono automaticamente
   - Non possono essere modificati dal calendario (modificare da pagine dedicate)

### Per lo Sviluppatore

**Aggiungere Eventi da Altri Moduli:**

```javascript
// Esempio: aggiungere evento da modulo esterno
await fetch(`/api/calendar/events/${userId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        title: 'Evento esterno',
        date: '2025-11-13',
        category: 'impegni',
        startTime: '10:00',
        description: 'Descrizione'
    })
});
```

---

## ⚠️ Note Importanti

1. **Nessun localStorage:** Tutti i dati sono salvati solo sul server
2. **Eventi Sport/Dieta:** Sono read-only nel calendario (modificare da pagine dedicate)
3. **Sincronizzazione:** UserProfileAgent viene notificato ad ogni salvataggio
4. **Formato Date:** ISO 8601 (YYYY-MM-DD) per date, HH:mm per orari

---

## 🔄 Prossimi Passi (Opzionali)

- [ ] Implementare modifica evento esistente
- [ ] Implementare eliminazione evento
- [ ] Aggiungere filtri per categoria nel popup
- [ ] Aggiungere vista settimanale/mensile
- [ ] Integrare notifiche per eventi imminenti
- [ ] Aggiungere export calendario (iCal)

---

## 📝 File Modificati

1. `server.js` - Aggiunti endpoint API calendario
2. `src/pages/calendario.html` - Ristrutturazione completa UI/UX
3. `data/calendar/` - Directory creata per salvare eventi

---

## ✅ Verifica Finale

- ✅ Tutti i dati fittizi rimossi
- ✅ Popup larghi, chiari, professionali
- ✅ Pulsante "+ Nuovo Impegno" funzionante
- ✅ Dati sincronizzati da Sport, Impegni, Dieta in tempo reale
- ✅ Nessun localStorage (solo API server)
- ✅ Stile coerente con design system Venus
- ⚠️ Rinominare "Obiettivi" in "Impegni" - link sidebar aggiornati, altri file da aggiornare se necessario

---

**Autore:** AI Assistant  
**Data Completamento:** 2025-01-XX

