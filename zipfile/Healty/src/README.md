# Dashboard Dieta & Salute - Guida per Agenti AI

## 📋 Panoramica

Questa dashboard è progettata per aiutare gli utenti a gestire la loro dieta settimanale, monitorare peso e calorie, e seguire piani alimentari personalizzati basati su preferenze individuali, allergie e obiettivi specifici.

## ✨ Caratteristiche Principali

### 🎯 Personalizzazione Intelligente
- **Nessun dato fittizio**: L'utente parte da zero e costruisce il suo profilo
- **Preferenze alimentari dettagliate**: Checkbox per allergie, esclusioni (frutta, verdura, carni, ecc.)
- **3 Diete personalizzate**: Algoritmo intelligente suggerisce le migliori diete in base al profilo
- **Supporto per alternative**: Chi non mangia frutta/verdura riceve suggerimenti con legumi frullati, dadi vegetali, integratori

### 🍽️ Sistema Ricette e Ingredienti
- **Database 50+ alimenti**: Valori nutrizionali completi per 100g
- **12+ ricette italiane**: Con istruzioni passo-passo e analisi nutrizionale
- **Checkbox ingredienti**: Spunta cosa hai per verificare fattibilità ricette
- **Auto-aggiunta lista spesa**: Ingredienti mancanti vanno automaticamente in lista

### 🥘 Widget Intelligenti NUOVI

#### Ingredienti Urgenti (Nuovo!)
- **Solo urgenze**: Mostra SOLO ingredienti che scadono entro 3 giorni
- **Suggerimenti congelamento**: Indica cosa congelare (scadenza 4-7 giorni)
- **Priorità visiva**: Rosso per urgenti, blu per "da congelare"
- **Pulsante Frigorifero**: Apre dialog completo tipo "esplora file"

#### Frigorifero Completo (Dialog)
- **3 Tabs**: Inventario / Check Rapido / Lista Spesa
- **Esplora File**: Categorie (proteine, carbs, verdure, ecc.) con contatori
- **Check Totale Rapido**: Sistema checkbox per categoria - seleziona cosa hai e aggiungi tutto insieme
- **Lista Spesa Integrata**: Generata automaticamente da ricette mancanti

#### Alternative per Stasera
- **Evidenziazione intelligente**: Ricette preparabili in primo piano
- **Ricette grigie**: Ingredienti mancanti evidenziati
- **Checkbox ingredienti**: Verifica cosa hai mentre esplori ricetta
- **Calcolo calorie**: Valori nutrizionali per porzione in tempo reale

## 🏗️ Architettura

### Componenti Principali

- **App.tsx** - Orchestratore principale con stato condiviso
- **PersonalCard.tsx** - Preferenze alimentari (no nome/età/altezza, recuperati da Sport)
- **DietProposals.tsx** - 3 diete personalizzate con piano settimanale completo (NUOVO: Dialog largo con 7 giorni + calorie)
- **DinnerAlternatives.tsx** - Ricette con checkbox ingredienti e integrazione spesa
- **UrgentItems.tsx** - Widget urgenze + dialog frigorifero completo con check rapido (SOSTITUISCE Fridge.tsx)
- **WeeklyCalendar.tsx** - Pianificazione settimanale pasti
- **WeightCaloriesTracker.tsx** - Grafici peso e calorie
- **~~TodayMeals.tsx~~** - RIMOSSO (funzionalità integrata in calendario)

### Database

- **foodDatabase.ts** - 50+ alimenti con macro/micronutrienti completi
- **recipesDatabase.ts** - 12+ ricette italiane tradizionali con ingredienti e istruzioni
- **DIET_RESEARCH.md** - Ricerca scientifica ESTESA:
  - 10+ fonti autorevoli analizzate
  - Timing nutrienti e crononutrizione (2024)
  - Integratori avanzati e nootropici
  - Hack pratici da community
  - Errori comuni da evitare
  - Apps e tools raccomandati
  - Tendenze future nutrizione personalizzata

## 🔗 Integrazione Discord Webhook

### Quando Inviare Webhook Discord

I webhook Discord dovrebbero essere inviati nei seguenti momenti:

1. **Completamento Profilo Utente** (PersonalCard.tsx)
   - Quando l'utente completa il questionario iniziale
   - Quando aggiorna informazioni importanti (allergie, obiettivi)

2. **Inizio Nuova Dieta** (DietProposals.tsx)
   - Quando l'utente inizia un nuovo piano alimentare
   - Notifica con dettagli della dieta selezionata

3. **Milestone di Progresso**
   - Ogni volta che l'utente completa una settimana di dieta
   - Quando raggiunge obiettivi di peso
   - Quando completa tutti i pasti per 7 giorni consecutivi

4. **Alerti Importanti**
   - Peso fuori dal range target
   - Troppe calorie consumate consecutivamente
   - Mancato aggiornamento dati per più di 3 giorni

### Implementazione Webhook Discord

```typescript
// Funzione helper per inviare webhook Discord
async function sendDiscordWebhook(
  webhookUrl: string,
  message: {
    title: string;
    description: string;
    color?: number;
    fields?: Array<{ name: string; value: string; inline?: boolean }>;
  }
) {
  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        embeds: [
          {
            title: message.title,
            description: message.description,
            color: message.color || 5763719, // Verde di default
            fields: message.fields || [],
            timestamp: new Date().toISOString(),
          },
        ],
      }),
    });

    if (!response.ok) {
      console.error('Errore invio webhook Discord:', response.statusText);
    }
  } catch (error) {
    console.error('Errore invio webhook Discord:', error);
  }
}
```

### Esempi di Uso

#### 1. Notifica Completamento Profilo (PersonalCard.tsx)

```typescript
// Nel metodo handleSubmit dopo onProfileUpdate
const DISCORD_WEBHOOK_URL = 'YOUR_DISCORD_WEBHOOK_URL_HERE';

await sendDiscordWebhook(DISCORD_WEBHOOK_URL, {
  title: '✅ Nuovo Profilo Completato',
  description: `${formData.name} ha completato il profilo!`,
  color: 3066993, // Verde
  fields: [
    { name: 'Età', value: formData.age, inline: true },
    { name: 'Peso', value: `${formData.weight} kg`, inline: true },
    { name: 'Obiettivo', value: formData.goal, inline: true },
    { name: 'Corporatura', value: formData.bodyType, inline: true },
    { name: 'Attività', value: formData.activityLevel, inline: true },
    { name: 'Allergie', value: formData.allergies || 'Nessuna', inline: false },
  ],
});
```

#### 2. Notifica Inizio Dieta (DietProposals.tsx)

```typescript
// Nel metodo startDiet dopo setDietPlans
const DISCORD_WEBHOOK_URL = 'YOUR_DISCORD_WEBHOOK_URL_HERE';

const selectedPlan = dietPlans.find(p => p.id === id);
await sendDiscordWebhook(DISCORD_WEBHOOK_URL, {
  title: '🚀 Nuova Dieta Iniziata',
  description: `Dieta "${selectedPlan.name}" iniziata!`,
  color: 15844367, // Giallo/Oro
  fields: [
    { name: 'Durata', value: selectedPlan.duration, inline: true },
    { name: 'Difficoltà', value: selectedPlan.difficulty, inline: true },
    { name: 'Calorie Target', value: `${selectedPlan.targetCalories} cal/giorno`, inline: true },
    { name: 'Benefici', value: selectedPlan.benefits.join(', '), inline: false },
  ],
});
```

#### 3. Notifica Progresso Peso (WeightCaloriesTracker.tsx)

```typescript
// Nel metodo handleAddWeight dopo setWeightData
const DISCORD_WEBHOOK_URL = 'YOUR_DISCORD_WEBHOOK_URL_HERE';

const weightLoss = previousWeight - parseFloat(newWeight);
const isPositiveProgress = weightLoss > 0;

await sendDiscordWebhook(DISCORD_WEBHOOK_URL, {
  title: isPositiveProgress ? '📉 Ottimo Progresso!' : '📊 Peso Aggiornato',
  description: `Nuovo peso registrato: ${newWeight} kg`,
  color: isPositiveProgress ? 3066993 : 15844367,
  fields: [
    { name: 'Peso Precedente', value: `${previousWeight} kg`, inline: true },
    { name: 'Peso Attuale', value: `${newWeight} kg`, inline: true },
    { name: 'Variazione', value: `${weightLoss > 0 ? '-' : '+'}${Math.abs(weightLoss).toFixed(1)} kg`, inline: true },
  ],
});
```

## 💾 Salvataggio Dati Utente con Supabase

### Struttura Database Consigliata

#### Tabella: `user_profiles`
```sql
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  age INTEGER,
  weight DECIMAL(5,2),
  height DECIMAL(5,2),
  body_type TEXT,
  allergies TEXT,
  dislikes TEXT,
  exclude_from_diet TEXT,
  health_issues TEXT,
  activity_level TEXT,
  goal TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);
```

#### Tabella: `weight_entries`
```sql
CREATE TABLE weight_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  weight DECIMAL(5,2) NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_weight_entries_user_date ON weight_entries(user_id, date DESC);
```

#### Tabella: `calorie_entries`
```sql
CREATE TABLE calorie_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  consumed INTEGER NOT NULL,
  burned INTEGER DEFAULT 0,
  target INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_calorie_entries_user_date ON calorie_entries(user_id, date DESC);
```

#### Tabella: `diet_plans`
```sql
CREATE TABLE diet_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  plan_name TEXT NOT NULL,
  plan_description TEXT,
  duration TEXT,
  difficulty TEXT,
  target_calories INTEGER,
  benefits TEXT[],
  is_active BOOLEAN DEFAULT false,
  progress INTEGER DEFAULT 0,
  started_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Tabella: `meal_plans`
```sql
CREATE TABLE meal_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  date DATE NOT NULL,
  meal_type TEXT NOT NULL, -- 'breakfast', 'lunch', 'dinner', 'snack'
  meal_name TEXT NOT NULL,
  calories INTEGER,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_meal_plans_user_date ON meal_plans(user_id, date DESC);
```

### Quando Salvare i Dati

#### 1. Profilo Utente
**Salvare quando:**
- L'utente completa il questionario iniziale
- L'utente aggiorna qualsiasi informazione nel profilo

```typescript
// Esempio in PersonalCard.tsx
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'YOUR_SUPABASE_URL',
  'YOUR_SUPABASE_ANON_KEY'
);

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  // Salvare nel database
  const { data, error } = await supabase
    .from('user_profiles')
    .upsert({
      user_id: supabase.auth.user()?.id,
      name: formData.name,
      age: parseInt(formData.age),
      weight: parseFloat(formData.weight),
      height: parseFloat(formData.height),
      body_type: formData.bodyType,
      allergies: formData.allergies,
      dislikes: formData.dislikes,
      exclude_from_diet: formData.excludeFromDiet,
      health_issues: formData.healthIssues,
      activity_level: formData.activityLevel,
      goal: formData.goal,
      updated_at: new Date().toISOString(),
    });

  if (error) {
    console.error('Errore salvataggio profilo:', error);
    toast.error('Errore durante il salvataggio');
    return;
  }

  onProfileUpdate(formData);
  setOpen(false);
  toast.success('Profilo salvato con successo!');
  
  // Opzionale: inviare webhook Discord
  await sendDiscordWebhook(...);
};
```

#### 2. Peso
**Salvare quando:**
- L'utente registra un nuovo peso

```typescript
// Esempio in WeightCaloriesTracker.tsx
const handleAddWeight = async () => {
  if (!newWeight) return;
  
  const { data, error } = await supabase
    .from('weight_entries')
    .insert({
      user_id: supabase.auth.user()?.id,
      weight: parseFloat(newWeight),
      date: new Date().toISOString().split('T')[0],
    });

  if (error) {
    console.error('Errore salvataggio peso:', error);
    toast.error('Errore durante il salvataggio');
    return;
  }

  // Aggiornare lo stato locale
  const dateStr = new Date().toLocaleDateString('it-IT', { 
    day: '2-digit', 
    month: '2-digit' 
  });
  setWeightData(prev => [...prev.slice(-6), { 
    date: dateStr, 
    weight: parseFloat(newWeight) 
  }]);
  
  setNewWeight('');
  setOpenWeight(false);
  toast.success('Peso registrato con successo!');
};
```

#### 3. Calorie
**Salvare quando:**
- L'utente registra calorie consumate/bruciate
- L'utente completa un pasto

```typescript
// Esempio in WeightCaloriesTracker.tsx
const handleAddCalories = async () => {
  if (!newCalories) return;
  
  const { data, error } = await supabase
    .from('calorie_entries')
    .upsert({
      user_id: supabase.auth.user()?.id,
      date: new Date().toISOString().split('T')[0],
      consumed: parseInt(newCalories),
      burned: parseInt(newBurned) || 0,
      target: 1800,
    }, {
      onConflict: 'user_id,date'
    });

  if (error) {
    console.error('Errore salvataggio calorie:', error);
    toast.error('Errore durante il salvataggio');
    return;
  }

  // Aggiornare lo stato locale
  // ...
};
```

#### 4. Completamento Pasti
**Salvare quando:**
- L'utente segna un pasto come completato

```typescript
// Esempio in TodayMeals.tsx
const toggleMealCompleted = async (id: string) => {
  const meal = meals.find(m => m.id === id);
  if (!meal) return;

  const newCompletedState = !meal.completed;

  // Aggiornare nel database
  const { error } = await supabase
    .from('meal_plans')
    .update({
      completed: newCompletedState,
      completed_at: newCompletedState ? new Date().toISOString() : null,
    })
    .eq('id', id);

  if (error) {
    console.error('Errore aggiornamento pasto:', error);
    return;
  }

  // Aggiornare lo stato locale
  setMeals(prev => 
    prev.map(m => 
      m.id === id ? { ...m, completed: newCompletedState } : m
    )
  );
};
```

#### 5. Selezione Dieta
**Salvare quando:**
- L'utente inizia una nuova dieta
- L'utente aggiorna il progresso di una dieta

```typescript
// Esempio in DietProposals.tsx
const startDiet = async (id: string) => {
  const selectedPlan = dietPlans.find(p => p.id === id);
  if (!selectedPlan) return;

  // Disattivare tutte le altre diete
  await supabase
    .from('diet_plans')
    .update({ is_active: false })
    .eq('user_id', supabase.auth.user()?.id);

  // Attivare la nuova dieta
  const { error } = await supabase
    .from('diet_plans')
    .upsert({
      user_id: supabase.auth.user()?.id,
      plan_name: selectedPlan.name,
      plan_description: selectedPlan.description,
      duration: selectedPlan.duration,
      difficulty: selectedPlan.difficulty,
      target_calories: selectedPlan.targetCalories,
      benefits: selectedPlan.benefits,
      is_active: true,
      progress: 0,
      started_at: new Date().toISOString(),
    });

  if (error) {
    console.error('Errore salvataggio dieta:', error);
    toast.error('Errore durante il salvataggio');
    return;
  }

  // Aggiornare lo stato locale
  setDietPlans(prev =>
    prev.map(plan => ({
      ...plan,
      isActive: plan.id === id,
      progress: plan.id === id ? 0 : plan.progress
    }))
  );
  
  toast.success('Dieta iniziata! Buona fortuna! 🎉');
  
  // Opzionale: inviare webhook Discord
  await sendDiscordWebhook(...);
};
```

### Caricamento Dati all'Avvio

```typescript
// In App.tsx o nei singoli componenti
useEffect(() => {
  const loadUserData = async () => {
    const user = supabase.auth.user();
    if (!user) return;

    // Caricare profilo
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (profile) {
      setUserProfile(profile);
    }

    // Caricare dati peso ultimi 7 giorni
    const { data: weights } = await supabase
      .from('weight_entries')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false })
      .limit(7);

    if (weights) {
      setWeightData(weights.reverse().map(w => ({
        date: new Date(w.date).toLocaleDateString('it-IT', { 
          day: '2-digit', 
          month: '2-digit' 
        }),
        weight: w.weight
      })));
    }

    // Caricare altre informazioni...
  };

  loadUserData();
}, []);
```

## 🔐 Row Level Security (RLS)

È importante implementare le policy RLS in Supabase per proteggere i dati degli utenti:

```sql
-- Abilitare RLS per tutte le tabelle
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE weight_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE calorie_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE diet_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_plans ENABLE ROW LEVEL SECURITY;

-- Policy per user_profiles
CREATE POLICY "Users can view their own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Ripetere policy simili per le altre tabelle
```

## 🍽️ Sistema di Gestione Ricette e Ingredienti

### Database Alimenti (foodDatabase.ts)

Il sistema include un database completo di oltre 50 alimenti con:
- **Valori nutrizionali** per 100g (calorie, proteine, carboidrati, grassi, fibre)
- **Categorie** (proteine, carboidrati, verdure, frutta, latticini, grassi, condimenti, bevande)
- **Allergeni** associati
- **Porzioni tipiche** consigliate

#### Categorie Disponibili:
- 🍗 Proteine (carni, pesci, uova, legumi)
- 🍝 Carboidrati (pasta, riso, cereali, pane)
- 🥬 Verdure (spinaci, broccoli, zucchine, ecc.)
- 🍎 Frutta (mele, banane, fragole, ecc.)
- 🧀 Latticini (yogurt, formaggi, latte)
- 🥑 Grassi sani (olio d'oliva, frutta secca, semi)
- 🧂 Condimenti (sale, spezie, erbe aromatiche)
- 🥤 Bevande (acqua, tè, latte)

### Database Ricette (recipesDatabase.ts)

Il sistema include 12+ ricette complete con:
- **Ingredienti** con quantità precise
- **Istruzioni** passo-passo
- **Valori nutrizionali** calcolati automaticamente
- **Tag** per facilitare la ricerca
- **Difficoltà e tempi** di preparazione

#### Ricette Incluse:
- **Primi piatti**: Risotto allo Zafferano, Spaghetti al Pomodoro, Pasta al Pesto, Pasta con Broccoli, Insalata di Quinoa, Zuppa di Lenticchie
- **Secondi piatti**: Pollo al Limone, Salmone al Forno, Orata al Cartoccio, Tacchino con Spinaci, Frittata di Verdure
- **Colazione**: Bowl di Yogurt Greco

### Widget "Alternative per Stasera"

Caratteristiche:
- **Suggerimenti intelligenti** basati su ingredienti disponibili nel frigorifero
- **Visualizzazione ricette** con ingredienti evidenziati (disponibili vs mancanti)
- **Ricette oscurate** (grigie) quando mancano ingredienti
- **Dettagli completi**: ingredienti, preparazione, valori nutrizionali per porzione
- **Filtri** per difficoltà e cucina
- **Espansione dettagli** al click sulla ricetta

### Widget Frigorifero

Funzionalità:
- **Inventario ingredienti** organizzato per categorie
- **Gestione quantità** con pulsanti +/-
- **Indicatori visivi**:
  - 🔴 Ingredienti in scadenza (≤3 giorni)
  - 🟠 Scorte basse (< 50% porzione tipica)
- **Rimozione automatica** quando la quantità arriva a 0
- **Integrazione con ricette**: consumo automatico ingredienti quando si prepara un piatto
- **Lista della spesa**:
  - Generazione automatica per ingredienti in esaurimento
  - Aggiunta manuale ingredienti
  - Suggerimenti quantità basati su porzioni tipiche
- **Categorie visive** con emoji per facile identificazione

#### Flusso di Utilizzo:

1. **Aggiungere ingredienti**: Dialog con selezione ingrediente e quantità
2. **Monitorare inventario**: Vista organizzata per categorie con badge informativi
3. **Scegliere ricetta**: Le ricette disponibili sono evidenziate, quelle impossibili sono grigie
4. **Preparare piatto**: Il sistema riduce automaticamente gli ingredienti usati
5. **Lista spesa**: Genera automaticamente la lista in base alle scorte basse

### Integrazione tra Componenti

```typescript
// App.tsx gestisce lo stato condiviso
const [availableIngredients, setAvailableIngredients] = useState<string[]>([]);

// Fridge notifica quando l'inventario cambia
<Fridge onIngredientsChange={setAvailableIngredients} />

// DinnerAlternatives usa l'inventario per evidenziare ricette
<DinnerAlternatives availableIngredients={availableIngredients} />
```

## 📊 Best Practices

1. **Salvataggio Locale Prima**: Aggiornare sempre prima lo stato locale per una UX fluida, poi salvare nel database
2. **Gestione Errori**: Sempre gestire gli errori di rete e database con toast notifications
3. **Ottimizzazione**: Usare debouncing per operazioni frequenti
4. **Privacy**: Non inviare dati sensibili tramite webhook Discord (solo notifiche generiche)
5. **Backup**: Implementare export/import dati per gli utenti
6. **Cache**: Usare React Query o SWR per caching intelligente dei dati Supabase
7. **Database Alimenti**: Espandere il database con più alimenti specifici per preferenze utente
8. **Ricette Personalizzate**: Permettere agli utenti di aggiungere le proprie ricette
9. **Calcolo Automatico**: Quando si seleziona una ricetta, calcolare automaticamente la riduzione ingredienti

## 🔮 Webhook Discord per Nuove Funzionalità

### Quando inviare notifiche per Ricette e Frigorifero:

1. **Ingredienti in Scadenza**
   - Notifica giornaliera per ingredienti che scadono entro 2 giorni
   - Suggerimenti ricette che usano quegli ingredienti

2. **Lista Spesa Generata**
   - Quando viene generata automaticamente una lista della spesa
   - Include numero di ingredienti suggeriti

3. **Ricetta Preparata**
   - Quando l'utente completa una ricetta
   - Include valori nutrizionali totali consumati

4. **Scorte Terminate**
   - Quando un ingrediente essenziale (es. olio, sale) finisce
   - Promemoria per riacquistare

```typescript
// Esempio notifica ingredienti in scadenza
await sendDiscordWebhook(WEBHOOK_URL, {
  title: '⚠️ Ingredienti in Scadenza',
  description: `Hai ${expiringItems.length} ingredienti che scadono presto!`,
  color: 16744272, // Arancione
  fields: expiringItems.map(item => ({
    name: item.name,
    value: `Scade tra ${item.expiryDays} giorni`,
    inline: true
  }))
});
```

## 🗄️ Schema Database Aggiuntivo per Ricette

```sql
-- Tabella per inventario frigorifero
CREATE TABLE fridge_inventory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  food_id TEXT NOT NULL,
  quantity DECIMAL(8,2) NOT NULL,
  unit TEXT NOT NULL,
  expiry_date DATE,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_fridge_user ON fridge_inventory(user_id);

-- Tabella per lista della spesa
CREATE TABLE shopping_list (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  food_id TEXT NOT NULL,
  quantity DECIMAL(8,2) NOT NULL,
  unit TEXT NOT NULL,
  purchased BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabella per ricette personalizzate utente
CREATE TABLE user_recipes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  difficulty TEXT,
  prep_time INTEGER,
  cook_time INTEGER,
  servings INTEGER,
  category TEXT,
  ingredients JSONB NOT NULL,
  instructions JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabella per tracciare ricette preparate
CREATE TABLE recipes_cooked (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  recipe_id TEXT NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  servings_made INTEGER,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 🚀 Prossimi Passi

- [ ] Implementare autenticazione Supabase
- [ ] Creare le tabelle database
- [ ] Configurare webhook Discord
- [ ] Aggiungere export/import dati
- [ ] Implementare notifiche push
- [ ] Aggiungere condivisione progressi social
- [ ] Espandere database alimenti con più varietà
- [ ] Aggiungere ricette regionali italiane
- [ ] Implementare sistema di rating ricette
- [ ] Creare suggerimenti ML basati su preferenze utente
- [ ] Aggiungere scanner barcode per ingredienti
- [ ] Integrazione con supermercati online per acquisti

---

**Nota Importante**: Questa è un'applicazione dimostrativa. Per un uso in produzione con dati sanitari reali, consultare sempre professionisti medici e seguire le normative sulla privacy (GDPR, HIPAA, etc.).
