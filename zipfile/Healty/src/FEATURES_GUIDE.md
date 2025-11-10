# Guida Funzionalità Dashboard Dieta & Salute

## 🎯 Workflow Utente Completo

### 1️⃣ Setup Iniziale (Prima Volta)

**Step 1: Configurazione Preferenze**
```
Utente → PersonalCard → Click "Configura"
↓
Dialog Preferenze:
- Preferenza dietetica: Onnivoro/Vegetariano/Vegano/etc.
- Corporatura: Ectomorfo/Mesomorfo/Endomorfo
- Allergie: [Checkbox multipli]
- Cibi da escludere: [Checkbox unificati] ← NUOVO!
  ✓ Frutta
  ✓ Verdura  
  ✓ Funghi
  ✓ Cipolle
  etc.
- Condizioni salute: [Checkbox]
↓
Salva → Toast "Preferenze salvate!"
```

**Step 2: Ricezione Diete Personalizzate**
```
Sistema analizza preferenze
↓
Algoritmo scoring:
- Match esclusioni × 40%
- Match corporatura × 20%
- Match obiettivi × 30%
- Facilità aderenza × 10%
↓
TOP 3 Diete mostrate in DietProposals:
🌟 PRIMA (Badge "Consigliata") ← Punteggio più alto
   SECONDA
   TERZA
```

**Esempio Reale:**
```
Utente esclude: Frutta + Verdura
Corporatura: Mesomorfo
↓
Sistema suggerisce:
1. 🌟 Dieta Iperproteica (Score: 95/100)
2. Dieta Chetogenica Adattata (Score: 85/100)  
3. Dieta Bilanciata Macro (Score: 70/100)
```

### 2️⃣ Esplorazione Dieta (Dialog Grande)

**Click su Dieta → Dialog Max Width 1400px**

```
┌─────────────────────────────────────────────────────────────┐
│  Dieta Iperproteica              [Difficoltà: Media]        │
│  Alta in proteine, ideale per chi non mangia frutta/verdura │
├─────────────────────────────────────────────────────────────┤
│  [Piano Settimanale] [Benefici & Scienza] [Integratori] [Tips] │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  LUNEDÌ      MARTEDÌ    MERCOLEDÌ   GIOVEDÌ   ...          │
│  ┌────────┐  ┌────────┐ ┌────────┐  ┌────────┐            │
│  │2050 cal│  │2100 cal│ │1980 cal│  │2020 cal│            │
│  ├────────┤  ├────────┤ ├────────┤  ├────────┤            │
│  │🌅 Cola-│  │🌅 Cola-│ │🌅 Cola-│  │🌅 Cola-│            │
│  │zione:  │  │zione:  │ │zione:  │  │zione:  │            │
│  │4 uova..│  │Fritta..│ │Yogurt..│  │3 uova..│            │
│  │        │  │        │ │        │  │        │            │
│  │🍎 Spun-│  │🍎 Spun-│ │🍎 Spun-│  │🍎 Spun-│            │
│  │tino:   │  │tino:   │ │tino:   │  │tino:   │            │
│  │Frullato│  │Barret..│ │Prosci..│  │Yogurt..│            │
│  │        │  │        │ │        │  │        │            │
│  │☀️ Pranzo│  │☀️ Pranzo│ │☀️ Pranzo│ │☀️ Pranzo│            │
│  │...     │  │...     │ │...     │  │...     │            │
│  └────────┘  └────────┘ └────────┘  └────────┘            │
│                                                             │
│  📊 MEDIA: 2015 cal/giorno  ⏱️ 4-8 settimane  ⚡ Media    │
└─────────────────────────────────────────────────────────────┘
```

**Tab Integratori:**
```
💊 Integratori Consigliati          🔬 Focus Micronutrienti
✓ Multivitaminico completo          Focus: [Vit C] [Vit K] [Folati]
✓ Vitamina C 1000mg/giorno          Rischio carenze:
✓ Fibre solubili 10-15g             • Vitamine liposolubili
✓ Omega-3 2-3g/giorno               • Fibre insufficienti
✓ Probiotici 20+ miliardi           Soluzioni:
✓ Magnesio 400mg                    ✓ Green powder (spirulina)
                                    ✓ Polvere barbabietola
```

### 3️⃣ Gestione Ingredienti (Nuovo Sistema)

**Widget "Ingredienti Urgenti" (Sempre Visibile)**

```
┌─────────────────────────────────────┐
│ ⚠️ Ingredienti Urgenti    [🗄️ Frigorifero] │
├─────────────────────────────────────┤
│ Frigorifero vuoto                   │
│ [+ Aggiungi ingredienti]            │
└─────────────────────────────────────┘

DOPO aver aggiunto ingredienti:

┌─────────────────────────────────────┐
│ ⚠️ Ingredienti Urgenti    [🗄️ Frigorifero] │
├─────────────────────────────────────┤
│ 🔴 SCADONO PRESTO! [3]              │
│ ┌─────────────────────────────────┐ │
│ │ 🍗 Pollo         OGGI!  300g [🗑️]│ │
│ │ 🥛 Latte         1g     250ml [🗑️]│ │
│ │ 🥬 Spinaci       2g     200g [🗑️] │ │
│ └─────────────────────────────────┘ │
│                                     │
│ 🔵 CONSIDERA DI CONGELARE [2]       │
│ ┌─────────────────────────────────┐ │
│ │ 🍞 Pane          5g     500g    │ │
│ │ 🧀 Formaggio     6g     200g    │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

**Click [Frigorifero] → Dialog Completo**

```
┌──────────────────────────────────────────────────────────┐
│  🗄️ Inventario Completo Frigorifero                      │
├──────────────────────────────────────────────────────────┤
│  [Inventario] [Check Rapido] [Lista Spesa]              │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  TAB: Check Rapido ← FUNZIONE CHIAVE!                   │
│                                                          │
│  ✅ Check Totale Rapido                                 │
│  Seleziona cosa hai per categoria - aggiungi tutto      │
│                                                          │
│  🍗 Proteine                                            │
│  [✓] Pollo  [✓] Manzo  [ ] Salmone  [✓] Uova           │
│  [ ] Tonno  [✓] Tacchino  [ ] Maiale                    │
│  → [Aggiungi 4 selezionati]                             │
│                                                          │
│  🍞 Carboidrati                                          │
│  [✓] Pasta  [✓] Riso  [ ] Pane  [✓] Patate             │
│  [ ] Quinoa  [ ] Avena  [✓] Riso basmati               │
│  → [Aggiungi 4 selezionati]                             │
│                                                          │
│  🥬 Verdure                                              │
│  [ ] Spinaci  [ ] Broccoli  [ ] Pomodori                │
│  (Utente ha escluso verdure → Mostra comunque)          │
│                                                          │
│  ... altre categorie ...                                │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

**Workflow Check Rapido:**
```
1. Utente apre frigorifero completo
2. Va su tab "Check Rapido"
3. Per ogni categoria, spunta cosa ha:
   ✓ Pollo
   ✓ Manzo
   ✓ Uova
   ✓ Tacchino
4. Click "Aggiungi 4 selezionati"
5. Sistema crea voci inventario:
   - Pollo: 300g, scadenza 3 giorni
   - Manzo: 250g, scadenza 5 giorni
   - Uova: 6pz, scadenza 10 giorni
   - Tacchino: 200g, scadenza 4 giorni
6. Toast: "4 ingredienti aggiunti!"
7. Ingredienti ora visibili in:
   - Widget Urgenti (se scadenza ≤ 3g)
   - Tab Inventario (tutto)
   - Disponibili per ricette
```

### 4️⃣ Ricette Intelligenti

**Alternative per Stasera - Con Ingredienti**

```
Caso A: HAI tutti ingredienti
┌─────────────────────────────────────┐
│ 🍝 Spaghetti Aglio Olio             │
│ ✅ Puoi prepararlo      [Media]     │
│                                     │
│ Click per espandere:                │
│ ↓                                   │
│ ✨ Ingredienti                      │
│ [✓] Pasta 100g         ← HAI        │
│ [✓] Aglio 2 spicchi    ← HAI        │
│ [✓] Olio EVO 50ml      ← HAI        │
│ [✓] Peperoncino 1      ← HAI        │
│                                     │
│ 💡 Spunta cosa hai                  │
│ 4/4 ingredienti disponibili         │
└─────────────────────────────────────┘

Caso B: MANCANO ingredienti
┌─────────────────────────────────────┐
│ 🥘 Risotto allo Zafferano           │
│ ⛔ 2 ingredienti mancanti [Difficile]│
│                     (RICETTA GRIGIA)│
│ Click per espandere:                │
│ ↓                                   │
│ ✨ Ingredienti    [🛒 Aggiungi mancanti]│
│ [✓] Riso arborio      ← HAI         │
│ [✓] Brodo vegetale    ← HAI         │
│ [ ] Zafferano         ← MANCA (rosso)│
│ [ ] Parmigiano        ← MANCA (rosso)│
│ [✓] Burro             ← HAI         │
│                                     │
│ Click [Aggiungi mancanti]:          │
│ → Zafferano + Parmigiano in lista spesa│
│ Toast: "2 ingredienti aggiunti!"    │
└─────────────────────────────────────┘
```

### 5️⃣ Integrazione Completa

**Flow Completo Esempio:**

```
1. SETUP
   Utente: Esclude frutta + verdura
   ↓
2. DIETE
   Sistema: Suggerisce Iperproteica (1°), Keto (2°), Bilanciata (3°)
   Utente: Esplora Iperproteica → Vede piano 7 giorni
   Vede integratori essenziali: Vit C, Fibre, Multivitaminico
   ↓
3. INGREDIENTI
   Utente: Click [Frigorifero] → Check Rapido
   Spunta: ✓ Pollo ✓ Uova ✓ Yogurt ✓ Mandorle ✓ Riso
   Click: "Aggiungi 5 selezionati"
   ↓
4. RICETTE
   Sistema: Mostra ricette fattibili in primo piano
   - ✅ Pollo con riso (hai tutti ingredienti)
   - ⛔ Risotto zafferano (mancano 2)
   
   Utente: Click su Risotto → Vede ingredienti mancanti
   Click: [Aggiungi mancanti] → Zafferano + Parmigiano in lista
   ↓
5. SPESA
   Utente: Va su tab "Lista Spesa" nel frigorifero
   Vede: Zafferano, Parmigiano (da Alternative)
         + Latte (scorte basse - auto-aggiunto)
   ↓
6. URGENZE
   Dopo 2 giorni:
   Widget Urgenti mostra: Pollo (scade domani!)
   Suggerimento: Prepara ricetta o congela
```

## 🎨 Design Patterns Utilizzati

### Codice Colori Universale
```
🔴 ROSSO    → Urgente (scadenza ≤ 3 giorni, ingrediente mancante)
🔵 BLU      → Info (da congelare, suggerimento)
🟢 VERDE    → Positivo (hai ingrediente, ricetta fattibile)
🟡 GIALLO   → Attenzione (integratore necessario)
🟣 VIOLA    → Premium (dieta consigliata, features speciali)
⚫ GRIGIO   → Disabilitato (ricetta non fattibile)
```

### Badge System
```
⭐ "Consigliata"     → Prima dieta suggerita
✅ "Puoi prepararlo" → Tutti ingredienti disponibili
⛔ "X mancanti"      → Ingredienti da comprare
🔥 "Urgente"         → Scade oggi/domani
❄️ "Congela"         → Scade tra 4-7 giorni
💊 "ESSENZIALE"      → Integratore obbligatorio
```

### Dialog Sizes
```
Small:   400px  → Alert, conferme
Medium:  600px  → Form, dettagli singoli
Large:   900px  → Inventario categorie
X-Large: 1400px → Piano settimanale diete (NUOVO!)
                  Più largo che alto ← Richiesta specifica
```

## 🔧 Funzionalità Avanzate

### Auto-Scadenze Intelligenti
```javascript
// Sistema assegna scadenze in base a categoria
Proteine fresche (pollo, pesce):    2-3 giorni
Proteine conservate (salumi):       7-10 giorni
Latticini:                          5-7 giorni
Verdure fresche:                    3-5 giorni
Frutta:                             4-7 giorni
Carboidrati secchi:                 60-120 giorni
Condimenti:                         90-180 giorni
```

### Lista Spesa Smart
```
Fonti di aggiunta automatica:
1. Click [Aggiungi mancanti] da ricetta
2. Scorte basse (< 50% porzione tipica)
3. Ingredienti completamente finiti
4. Suggerimenti dieta (integratori)

Organizzazione:
- Per categoria (come supermercato)
- Quantità auto-calcolate
- Elimina duplicati
```

### Notifiche & Toast
```
✅ Successo: Verde
   "Ingredienti aggiunti!"
   "Preferenze salvate!"

ℹ️ Info: Blu  
   "Già nella lista della spesa"
   "Hai già tutti gli ingredienti"

⚠️ Warning: Giallo
   (Non usato attualmente)

❌ Errore: Rosso
   (Gestito con try-catch)
```

## 📊 Metriche & Analytics (Future)

### Dati Tracciabili
```
User Profile:
- Preferenze alimentari
- Esclusioni
- Allergie
- Obiettivi

Inventory:
- Ingredienti posseduti
- Frequenza acquisto
- Spreco (scaduti)

Recipes:
- Più preparate
- Più visualizzate
- Tempo medio preparazione

Diets:
- Aderenza %
- Giorni seguiti
- Progressi peso
```

### Webhook Discord (TODO)
```javascript
// Quando implementare
const discordEvents = {
  profileUpdated: true,      // Utente aggiorna preferenze
  dietStarted: true,         // Inizia nuova dieta
  goalReached: true,         // Obiettivo peso raggiunto
  weekCompleted: true,       // Settimana dieta completata
  shoppingListCreated: false // Lista spesa (troppo frequente)
};

// Payload esempio
{
  "event": "diet_started",
  "user_id": "user_123",
  "diet_name": "Dieta Iperproteica",
  "timestamp": "2024-11-09T10:30:00Z",
  "metadata": {
    "excluded_foods": ["Frutta", "Verdura"],
    "target_calories": 2000
  }
}
```

## 🚀 Roadmap Future Features

### Phase 2
- [ ] Export PDF piano settimanale
- [ ] Sincronizzazione calendario Google/Apple
- [ ] Barcode scanner per aggiungere prodotti
- [ ] Timer cottura ricette

### Phase 3
- [ ] Community ricette (condivisione)
- [ ] AI suggerimenti basati su storico
- [ ] Integrazione fitness tracker (Fitbit, Apple Health)
- [ ] Analisi microbioma (partnership con test DNA)

### Phase 4
- [ ] Meal delivery integration
- [ ] Personal chef booking
- [ ] Gruppo supporto online
- [ ] Gamification (achievements, streaks)

---

**Versione**: 2.0  
**Ultimo aggiornamento**: Novembre 2024  
**Compatibilità**: React 18+, Tailwind 4.0
