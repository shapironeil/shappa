# ⚡ TEST RAPIDO - 2 Minuti

## 🎯 COSA TESTARE

### 1. Salvataggio ✅ (30 secondi)
```
1. Click su una dieta
2. Click "Segui Questa Dieta"
3. Toast appare ✅
4. Calendario mostra pasti ✅
```

### 2. Visualizzazione ✅ (30 secondi)
```
1. Guarda calendario
2. Giorno OGGI in BLU ✅
3. Sotto calendario: 3 card (Colazione|Pranzo|Cena) ✅
4. Testo completo pasti visibile ✅
```

### 3. Interazione ✅ (30 secondi)
```
1. Click su giorno diverso
2. Giorno diventa ARANCIONE ✅
3. Pasti sotto cambiano immediatamente ✅
```

### 4. Persistenza ✅ (30 secondi)
```
1. Ricarica pagina (F5)
2. Calendario ancora popolato ✅
3. Pasti ancora visibili ✅
```

---

## 🐛 SE NON FUNZIONA

### Reset Rapido
```javascript
// Console browser (F12)
localStorage.removeItem('selected_diet');
location.reload();
```

Poi riprova dal punto 1.

---

## 🔍 Debug Panel

**Bottone viola in basso a destra**

- Click "Debug" per aprire
- Verifica che vedi:
  - ✅ Dieta Salvata: Sì
  - ✅ WeekPlan: 7 giorni
  - ✅ Description: ✅
  - ✅ Benefits: ✅ [numero]

**Se vedi ❌** = Problema salvataggio → Click "Reset" e riprova

---

## 📊 Console Log OK

Apri F12 → Console, dovresti vedere:

```
📊 Dieta caricata da localStorage: [Nome Dieta]
📅 WeeklyCalendar ricevuto dieta: [Nome Dieta]
📅 WeekPlan keys: [7 giorni]
📅 Giorno selezionato: [Oggi]
```

**Nessun errore rosso** ✅

---

## ✅ TUTTO OK SE...

- ✅ Toast appare quando segui dieta
- ✅ Calendario mostra pasti dopo salvataggio
- ✅ Click giorno cambia pasti sotto
- ✅ F5 mantiene tutto
- ✅ Debug Panel mostra tutti ✅

---

**Test completo: < 2 minuti**  
**Se OK**: 🎉 Tutto funziona!  
**Se KO**: 📋 Screenshot console + Debug Panel e mandami
