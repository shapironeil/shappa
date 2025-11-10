# 🔍 DEBUG DIETA - Guida Risoluzione Problemi

## ✅ PROBLEMI RISOLTI

### 1. ❌ PROBLEMA: Salvataggio dieta incompleto
**SINTOMO**: Dieta salvata ma calendario vuoto al ricaricamento  
**CAUSA**: `handleFollowDiet` salvava solo `id`, `name`, `weekPlan` - mancavano altri campi  
**SOLUZIONE**: ✅ Ora salva TUTTA la dieta con spread operator `{...diet, startedAt: ...}`

### 2. ❌ PROBLEMA: getTodayName() dipendenza useEffect
**SINTOMO**: Warning React, comportamento imprevedibile  
**CAUSA**: Funzione definita dentro componente ma usata in useEffect  
**SOLUZIONE**: ✅ Spostata fuori dal componente (prima di `export function`)

### 3. ❌ PROBLEMA: useEffect loop infinito
**SINTOMO**: Re-render continui  
**CAUSA**: `selectedDiet` nelle dipendenze useEffect causava loop  
**SOLUZIONE**: ✅ Rimosso `selectedDiet` da dipendenze, usa solo `weekOffset` e `isCurrentWeek`

---

## 🧪 COME TESTARE

### Test 1: Salvataggio Dieta

1. **Apri Console Browser** (F12)
2. **Click su una dieta** in DietProposals
3. **Click "Segui Questa Dieta"**
4. **Verifica Console**:
   ```
   ✅ Toast: "Hai iniziato la [Nome Dieta]!"
   ✅ Dialog si chiude
   ```
5. **Apri Console e controlla localStorage**:
   ```javascript
   JSON.parse(localStorage.getItem('selected_diet'))
   ```
   **DEVE contenere**:
   ```javascript
   {
     id: "...",
     name: "...",
     description: "...",
     duration: "...",
     difficulty: "...",
     weekPlan: {
       "Lunedì": { breakfast: "...", lunch: "...", dinner: "...", calories: ... },
       "Martedì": { ... },
       // ... tutti i 7 giorni
     },
     benefits: [...],
     supplements: [...],
     tips: [...],
     // ... tutti gli altri campi
     startedAt: "2024-11-09T..."
   }
   ```

### Test 2: Visualizzazione Calendario

1. **Dopo aver seguito una dieta**
2. **Guarda il Calendario Settimanale**
3. **Verifica**:
   ```
   ✅ 7 giorni visibili (Lun-Dom)
   ✅ Giorno OGGI evidenziato in BLU
   ✅ Ogni giorno mostra:
      - 🌅 Preview colazione
      - ☀️ Preview pranzo
      - 🌙 Preview cena
      - Badge calorie
   ✅ Sotto calendario:
      - Titolo "🍽️ Pasti di [Giorno]"
      - 3 card: Colazione | Pranzo | Cena
      - Testo completo pasti visibile
   ```

### Test 3: Cambio Giorno

1. **Click su un giorno diverso nel calendario**
2. **Verifica**:
   ```
   ✅ Giorno diventa ARANCIONE
   ✅ Pasti sotto calendario cambiano immediatamente
   ✅ Titolo si aggiorna: "Pasti di [Nuovo Giorno]"
   ✅ Calorie aggiornate
   ```

### Test 4: Ricaricamento Pagina

1. **Dopo aver seguito una dieta**
2. **Ricarica pagina (F5)**
3. **Verifica Console**:
   ```
   📊 Dieta caricata da localStorage: [Nome Dieta]
   📅 WeeklyCalendar ricevuto dieta: [Nome Dieta]
   📅 WeekPlan keys: ["Lunedì", "Martedì", ...]
   📅 Giorno selezionato: [Giorno Oggi]
   📅 Dati giorno: { breakfast: "...", ... }
   ```
4. **Verifica UI**:
   ```
   ✅ Calendario mostra pasti
   ✅ Giorno oggi selezionato di default
   ✅ Pasti sotto calendario visibili
   ```

---

## 🐛 TROUBLESHOOTING

### PROBLEMA: Calendario vuoto dopo ricaricamento

**VERIFICA**:
```javascript
// Console browser
localStorage.getItem('selected_diet')
```

**SE NULL**:
- ❌ Dieta non salvata → Controlla che `handleFollowDiet` venga chiamato
- ❌ Verifica toast "Hai iniziato la dieta" appaia

**SE ESISTE MA INCOMPLETO** (solo `id`, `name`, `weekPlan`):
- ❌ Codice vecchio ancora attivo
- ✅ Soluzione: Cancella cache e riprova
  ```javascript
  localStorage.removeItem('selected_diet')
  ```

**SE ESISTE E COMPLETO**:
- ✅ Salvataggio OK
- ❌ Problema caricamento → Controlla console per errori

---

### PROBLEMA: Pasti sotto calendario non appaiono

**VERIFICA Console**:
```
📅 WeeklyCalendar ricevuto dieta: [Nome]
📅 WeekPlan keys: [...]
📅 Giorno selezionato: [Giorno]
📅 Dati giorno: {...}
```

**SE "Dati giorno: undefined"**:
- ❌ `calendarSelectedDay` non corrisponde a chiave in `weekPlan`
- ❌ Possibile problema: nome giorno con caratteri strani
- ✅ Verifica che `weekPlan` abbia chiavi: "Lunedì", "Martedì", ... (con accenti)

**SE tutti i log sono OK ma UI vuota**:
- ❌ Rendering condizionale fallisce
- ✅ Controlla che `selectedDiet.weekPlan[calendarSelectedDay]` esista
- ✅ Verifica condizione: `{selectedDiet && selectedDiet.weekPlan[calendarSelectedDay] && (...)}`

---

### PROBLEMA: Click giorno non cambia pasti

**VERIFICA**:
1. **Click su giorno**
2. **Console deve mostrare**:
   ```
   📅 Giorno selezionato: [Nuovo Giorno]
   📅 Dati giorno: { breakfast: "...", ... }
   ```

**SE console non mostra nulla**:
- ❌ onClick non funziona
- ✅ Verifica che `onClick={() => { setCalendarSelectedDay(day); setSelectedDay(day); }}` sia presente

**SE console mostra ma UI non cambia**:
- ❌ State non triggera re-render
- ✅ Verifica che `calendarSelectedDay` sia nello state con useState
- ✅ Verifica che non ci sia memoization o React.memo che blocca update

---

### PROBLEMA: Errore "Cannot read property 'breakfast' of undefined"

**CAUSA**: `selectedDiet.weekPlan[calendarSelectedDay]` è undefined

**VERIFICA**:
```javascript
// Console
const diet = JSON.parse(localStorage.getItem('selected_diet'));
console.log(diet.weekPlan);
console.log(Object.keys(diet.weekPlan));
```

**POSSIBILI CAUSE**:
1. ❌ Nome giorno sbagliato (es. "Lunedi" vs "Lunedì")
2. ❌ weekPlan manca alcuni giorni
3. ❌ weekPlan è null/undefined

**SOLUZIONE**:
```javascript
// Cancella e risalva dieta
localStorage.removeItem('selected_diet');
// Poi segui di nuovo la dieta dall'UI
```

---

### PROBLEMA: Giorno oggi non evidenziato

**VERIFICA**:
```javascript
// Console
const today = new Date().getDay();
console.log('Day of week (0=Sun):', today);
// Dovrebbe essere: 1=Lun, 2=Mar, ..., 6=Sab, 0=Dom

const dayIndex = today === 0 ? 6 : today - 1;
console.log('Array index:', dayIndex);
// Dovrebbe essere: 0=Lun, 1=Mar, ..., 6=Dom

const weekDays = ['Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato', 'Domenica'];
console.log('Today name:', weekDays[dayIndex]);
```

**SE nome giorno non corrisponde**:
- ❌ Bug in `getTodayName()`
- ✅ Verifica formula conversione

**SE nome corretto ma non evidenziato**:
- ❌ Classe CSS non applicata
- ✅ Verifica che `isToday` sia true per giorno corrente

---

## 🔧 COMANDI UTILITY

### Reset Completo Dieta
```javascript
// Cancella dieta salvata
localStorage.removeItem('selected_diet');

// Ricarica pagina
location.reload();
```

### Ispeziona Dieta Salvata
```javascript
const diet = JSON.parse(localStorage.getItem('selected_diet'));
console.table({
  Nome: diet?.name,
  'Giorni in weekPlan': Object.keys(diet?.weekPlan || {}).length,
  'Data inizio': diet?.startedAt,
  'Ha description?': !!diet?.description,
  'Ha benefits?': !!diet?.benefits,
  'Ha weekPlan?': !!diet?.weekPlan
});
```

### Verifica Giorno Corrente
```javascript
const today = new Date();
console.log({
  'Data completa': today.toString(),
  'Giorno settimana (num)': today.getDay(), // 0=Dom, 1=Lun, ...
  'Giorno settimana (IT)': today.toLocaleDateString('it-IT', { weekday: 'long' })
});
```

### Test Rendering Condizionale
```javascript
// Nel componente WeeklyCalendar, aggiungi temporaneamente:
console.log('selectedDiet exists?', !!selectedDiet);
console.log('weekPlan exists?', !!selectedDiet?.weekPlan);
console.log('calendarSelectedDay:', calendarSelectedDay);
console.log('Day data exists?', !!selectedDiet?.weekPlan?.[calendarSelectedDay]);
```

---

## 📊 LOG NORMALI (Cosa DEVE apparire)

### Al Caricamento Pagina
```
📊 Dieta caricata da localStorage: Dieta Mediterranea
📅 WeeklyCalendar ricevuto dieta: Dieta Mediterranea
📅 WeekPlan keys: ["Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì", "Sabato", "Domenica"]
📅 Giorno selezionato: Sabato
📅 Dati giorno: {breakfast: "Yogurt greco 200g + miele + noci 30g + mirtilli", snack1: "Frutta secca 40g + tè verde", lunch: "Pasta integrale 80g + pesto genovese + fagiolini", snack2: "Hummus 100g + verdure crude", dinner: "Branzino 180g + patate 150g + rucola", calories: 1950}
```

### Al Click Giorno
```
📅 Giorno selezionato: Lunedì
📅 Dati giorno: {breakfast: "...", lunch: "...", dinner: "...", ...}
```

### Al Salvataggio Dieta
```
Toast: ✅ Hai iniziato la Dieta Mediterranea!
Toast: Il calendario è stato aggiornato con i pasti settimanali
```

---

## 🎯 CHECKLIST FUNZIONAMENTO COMPLETO

### Salvataggio ✅
- [x] Click "Segui Dieta" salva in localStorage
- [x] Oggetto salvato contiene TUTTI i campi
- [x] Toast di successo appare
- [x] Dialog si chiude

### Visualizzazione Iniziale ✅
- [x] Al caricamento, dieta viene recuperata da localStorage
- [x] Calendario mostra tutti i 7 giorni
- [x] Giorno oggi evidenziato in BLU
- [x] Pasti oggi mostrati sotto calendario
- [x] Preview pasti visibile in ogni giorno

### Interazione ✅
- [x] Click giorno evidenzia in ARANCIONE
- [x] Pasti sotto calendario cambiano istantaneamente
- [x] Titolo si aggiorna con nome giorno
- [x] Calorie mostrate correttamente
- [x] Click di nuovo apre dialog dettagliato

### Persistenza ✅
- [x] Ricaricamento pagina (F5) mantiene dieta
- [x] Pasti ancora visibili dopo reload
- [x] Giorno corrente ancora selezionato

---

## 💡 MIGLIORAMENTI FUTURI

### 1. Gestione Errori
- [ ] Validazione weekPlan prima di salvare
- [ ] Fallback se giorno mancante
- [ ] Migrazione dati vecchi se formato cambia

### 2. UX
- [ ] Animazione transizione tra giorni
- [ ] Skeleton loader durante caricamento
- [ ] Messaggio "Nessuna dieta" più evidente

### 3. Performance
- [ ] Memoize getCurrentWeekDates()
- [ ] React.memo per card giorni
- [ ] Lazy load dialog dettagli

### 4. Features
- [ ] Notifica giornaliera pasti
- [ ] Esporta dieta PDF
- [ ] Condividi dieta con amici
- [ ] Modifica pasto singolo

---

**Ultimo aggiornamento**: 9 Novembre 2024  
**Status**: ✅ Problemi risolti - In testing  
**Versione**: 3.1
