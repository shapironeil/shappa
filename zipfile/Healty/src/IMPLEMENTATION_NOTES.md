# Note Implementazione - Dashboard Dieta & Salute

## 🚨 PROBLEMI DA FIXARE E IMPLEMENTARE

### 1. ❌ PROBLEMA: Dialog Dieta Troppo Piccolo e Scorre Male

**FILE**: `/components/DietProposals.tsx`

**LINEA**: ~320 (DialogContent)

**PROBLEMA ATTUALE**:
```tsx
<DialogContent className="max-w-[95vw] w-[1400px] max-h-[90vh]">
```

**SOLUZIONE**:
```tsx
<DialogContent className="max-w-[98vw] w-[1600px] h-[95vh] overflow-hidden flex flex-col">
  {/* Header fisso */}
  <DialogHeader className="flex-shrink-0">
    ...
  </DialogHeader>
  
  {/* Content scrollabile */}
  <div className="flex-1 overflow-y-auto">
    <Tabs>
      ...
    </Tabs>
  </div>
</DialogContent>
```

**COSA CAMBIARE**:
- Aumentare width da 1400px a 1600px
- Cambiare max-h-[90vh] in h-[95vh] (altezza fissa)
- Aggiungere overflow-hidden e flex flex-col al DialogContent
- Rendere DialogHeader flex-shrink-0 (non scorre)
- Wrappare Tabs in div con flex-1 overflow-y-auto

---

### 2. ⭐ NUOVA FEATURE: Bottone "Segui Dieta" con Salvataggio Server

**FILE DA MODIFICARE**: 
- `/components/DietProposals.tsx` (bottone + UI)
- `/App.tsx` (state per dieta selezionata)
- `/components/WeeklyCalendar.tsx` (visualizzazione pasti)

#### A. Aggiungere Bottone in DietProposals.tsx

**DOVE**: Nel DialogHeader, dopo il titolo (linea ~325)

**CODICE DA AGGIUNGERE**:
```tsx
<DialogHeader>
  <div className="flex items-center justify-between">
    <div>
      <DialogTitle className="text-2xl flex items-center gap-2">
        {selectedDiet?.name}
        <Badge className={difficultyColors[selectedDiet?.difficulty || 'Facile']}>
          {selectedDiet?.difficulty}
        </Badge>
      </DialogTitle>
      <DialogDescription className="text-base">
        {selectedDiet?.description}
      </DialogDescription>
    </div>
    
    {/* NUOVO BOTTONE */}
    <Button 
      size="lg"
      onClick={() => handleFollowDiet(selectedDiet)}
      className="bg-gradient-to-r from-orange-600 to-orange-500"
    >
      <Star className="w-4 h-4 mr-2" />
      Segui Questa Dieta
    </Button>
  </div>
</DialogHeader>
```

#### B. Implementare handleFollowDiet

**DOVE**: In DietProposals.tsx, dopo le funzioni esistenti (linea ~280)

**CODICE**:
```tsx
const handleFollowDiet = async (diet: DietPlan | null) => {
  if (!diet) return;
  
  try {
    // TODO: Connetti Supabase
    // const { data, error } = await supabase
    //   .from('user_diets')
    //   .insert({
    //     user_id: 'USER_ID', // Da auth
    //     diet_id: diet.id,
    //     diet_name: diet.name,
    //     week_plan: diet.weekPlan,
    //     started_at: new Date().toISOString()
    //   });
    
    // Per ora: salva in localStorage
    localStorage.setItem('selected_diet', JSON.stringify({
      id: diet.id,
      name: diet.name,
      weekPlan: diet.weekPlan,
      startedAt: new Date().toISOString()
    }));
    
    // Callback al parent per aggiornare calendario
    if (onDietSelected) {
      onDietSelected(diet);
    }
    
    toast.success(`Hai iniziato la ${diet.name}!`, {
      description: 'Il calendario è stato aggiornato con i pasti settimanali'
    });
    
    setSelectedDiet(null); // Chiudi dialog
  } catch (error) {
    toast.error('Errore nel salvare la dieta');
  }
};
```

#### C. Aggiungere Props onDietSelected

**DOVE**: DietProposalsProps interface (linea ~30)

**PRIMA**:
```tsx
interface DietProposalsProps {
  userProfile: UserProfile | null;
}
```

**DOPO**:
```tsx
interface DietProposalsProps {
  userProfile: UserProfile | null;
  onDietSelected?: (diet: DietPlan) => void;
}
```

#### D. Modificare App.tsx per Ricevere Dieta

**DOVE**: `/App.tsx` - State e props (linea ~20)

**AGGIUNGERE STATE**:
```tsx
const [selectedDiet, setSelectedDiet] = useState<DietPlan | null>(null);

// Carica dieta salvata al mount
useEffect(() => {
  const savedDiet = localStorage.getItem('selected_diet');
  if (savedDiet) {
    setSelectedDiet(JSON.parse(savedDiet));
  }
}, []);
```

**MODIFICARE PROPS**:
```tsx
<DietProposals 
  userProfile={userProfile}
  onDietSelected={(diet) => setSelectedDiet(diet)}
/>
```

#### E. Aggiornare WeeklyCalendar con Pasti

**FILE**: `/components/WeeklyCalendar.tsx`

**AGGIUNGERE PROPS**:
```tsx
interface WeeklyCalendarProps {
  selectedDiet?: DietPlan | null;
}

export function WeeklyCalendar({ selectedDiet }: WeeklyCalendarProps) {
```

**MODIFICARE RENDERING GIORNI**:
```tsx
// Dentro il map dei giorni (linea ~50)
{selectedDiet && selectedDiet.weekPlan[day.name] && (
  <div className="mt-2 space-y-1">
    <div className="text-xs text-orange-600">
      🌅 {selectedDiet.weekPlan[day.name].breakfast.substring(0, 30)}...
    </div>
    <div className="text-xs text-blue-600">
      ☀️ {selectedDiet.weekPlan[day.name].lunch.substring(0, 30)}...
    </div>
    <div className="text-xs text-indigo-600">
      🌙 {selectedDiet.weekPlan[day.name].dinner.substring(0, 30)}...
    </div>
    <Badge variant="outline" className="text-xs">
      {selectedDiet.weekPlan[day.name].calories} cal
    </Badge>
  </div>
)}
```

**AGGIUNGERE CLICK PER DETTAGLI**:
```tsx
// Aggiungere state per dialog dettaglio giorno
const [selectedDay, setSelectedDay] = useState<string | null>(null);

// Nel rendering del giorno
<div 
  onClick={() => setSelectedDay(day.name)}
  className="cursor-pointer hover:bg-gray-50"
>
  ...
</div>

// Dialog per mostrare tutti pasti del giorno
<Dialog open={!!selectedDay} onOpenChange={(open) => !open && setSelectedDay(null)}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>{selectedDay} - Pasti Completi</DialogTitle>
    </DialogHeader>
    {selectedDay && selectedDiet?.weekPlan[selectedDay] && (
      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-medium mb-1">🌅 Colazione</h4>
          <p className="text-sm">{selectedDiet.weekPlan[selectedDay].breakfast}</p>
        </div>
        <div>
          <h4 className="text-sm font-medium mb-1">🍎 Spuntino Mattina</h4>
          <p className="text-sm">{selectedDiet.weekPlan[selectedDay].snack1}</p>
        </div>
        <div>
          <h4 className="text-sm font-medium mb-1">☀️ Pranzo</h4>
          <p className="text-sm">{selectedDiet.weekPlan[selectedDay].lunch}</p>
        </div>
        <div>
          <h4 className="text-sm font-medium mb-1">🍪 Spuntino Pomeriggio</h4>
          <p className="text-sm">{selectedDiet.weekPlan[selectedDay].snack2}</p>
        </div>
        <div>
          <h4 className="text-sm font-medium mb-1">🌙 Cena</h4>
          <p className="text-sm">{selectedDiet.weekPlan[selectedDay].dinner}</p>
        </div>
        <Badge variant="outline">
          Totale: {selectedDiet.weekPlan[selectedDay].calories} calorie
        </Badge>
      </div>
    )}
  </DialogContent>
</Dialog>
```

**PASSARE PROPS DA APP.TSX**:
```tsx
<WeeklyCalendar selectedDiet={selectedDiet} />
```

---

### 3. 🔧 SEMPLIFICARE: Bottone Unico Aggiungi Ingredienti

**FILE**: `/components/UrgentItems.tsx`

**PROBLEMA**: Tab "Check Rapido" è troppo complessa

**SOLUZIONE**: Un solo bottone in basso che apre modal semplice

**DOVE**: Rimuovere tab Check Rapido e aggiungere bottone fisso

**CODICE DA CAMBIARE** (linea ~250):

**PRIMA**:
```tsx
<Tabs defaultValue="inventory">
  <TabsList className="grid w-full grid-cols-3">
    <TabsTrigger value="inventory">Inventario</TabsTrigger>
    <TabsTrigger value="quick-check">Check Rapido</TabsTrigger>
    <TabsTrigger value="shopping">Lista Spesa</TabsTrigger>
  </TabsList>
```

**DOPO**:
```tsx
<Tabs defaultValue="inventory">
  <TabsList className="grid w-full grid-cols-2">
    <TabsTrigger value="inventory">Inventario</TabsTrigger>
    <TabsTrigger value="shopping">Lista Spesa</TabsTrigger>
  </TabsList>
  
  {/* Content tabs */}
  <ScrollArea className="h-[calc(90vh-250px)] mt-4">
    <TabsContent value="inventory">
      ...
    </TabsContent>
    <TabsContent value="shopping">
      ...
    </TabsContent>
  </ScrollArea>
  
  {/* BOTTONE FISSO IN BASSO */}
  <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t">
    <Button 
      size="lg" 
      className="w-full"
      onClick={() => setQuickAddOpen(true)}
    >
      <Plus className="w-4 h-4 mr-2" />
      Aggiungi Ingredienti Rapidamente
    </Button>
  </div>
</Tabs>
```

**AGGIUNGERE DIALOG SEMPLICE**:
```tsx
const [quickAddOpen, setQuickAddOpen] = useState(false);
const [selectedCategory, setSelectedCategory] = useState('');
const [tempSelected, setTempSelected] = useState<string[]>([]);

// Dopo il Dialog principale
<Dialog open={quickAddOpen} onOpenChange={setQuickAddOpen}>
  <DialogContent className="max-w-4xl">
    <DialogHeader>
      <DialogTitle>Aggiungi Ingredienti</DialogTitle>
      <DialogDescription>
        Seleziona una categoria e spunta cosa hai
      </DialogDescription>
    </DialogHeader>
    
    {/* Step 1: Seleziona Categoria */}
    {!selectedCategory && (
      <div className="grid grid-cols-4 gap-4">
        {Object.entries(categoryLabels).map(([cat, label]) => (
          <Button
            key={cat}
            variant="outline"
            className="h-24 flex flex-col"
            onClick={() => setSelectedCategory(cat)}
          >
            <span className="text-3xl mb-2">
              {categoryIcons[cat as keyof typeof categoryIcons]}
            </span>
            <span className="text-sm">{label}</span>
          </Button>
        ))}
      </div>
    )}
    
    {/* Step 2: Seleziona Ingredienti */}
    {selectedCategory && (
      <div>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => {
            setSelectedCategory('');
            setTempSelected([]);
          }}
        >
          ← Torna alle categorie
        </Button>
        
        <div className="grid grid-cols-3 gap-3 mt-4">
          {foodDatabase
            .filter(f => f.category === selectedCategory)
            .map(food => (
              <div 
                key={food.id}
                className={`p-3 border rounded cursor-pointer ${
                  tempSelected.includes(food.id) 
                    ? 'bg-green-50 border-green-500' 
                    : 'hover:bg-gray-50'
                }`}
                onClick={() => {
                  setTempSelected(prev => 
                    prev.includes(food.id)
                      ? prev.filter(id => id !== food.id)
                      : [...prev, food.id]
                  );
                }}
              >
                <Checkbox 
                  checked={tempSelected.includes(food.id)}
                  className="mr-2"
                />
                {food.name}
              </div>
            ))}
        </div>
        
        <Button
          size="lg"
          className="w-full mt-4"
          disabled={tempSelected.length === 0}
          onClick={() => {
            handleBulkAdd(tempSelected);
            setQuickAddOpen(false);
            setSelectedCategory('');
            setTempSelected([]);
          }}
        >
          Aggiungi {tempSelected.length} ingredienti
        </Button>
      </div>
    )}
  </DialogContent>
</Dialog>
```

---

### 4. 📚 RICERCA: Cosa Congelare Realmente

**FONTE**: Ricerca da siti autorevoli (USDA, FDA, Consumer Reports)

**DA AGGIUNGERE IN**: `/data/freezingGuide.ts` (NUOVO FILE)

**CONTENUTO**:
```typescript
export interface FreezingInfo {
  category: string;
  item: string;
  freezable: boolean;
  shelfLife: number; // giorni in frigo
  freezerLife: number; // mesi in freezer
  quality: 'Ottima' | 'Buona' | 'Discreta' | 'Sconsigliato';
  notes: string;
}

export const freezingGuide: FreezingInfo[] = [
  // PROTEINE - Carne
  {
    category: 'proteina',
    item: 'Pollo crudo',
    freezable: true,
    shelfLife: 2,
    freezerLife: 9,
    quality: 'Ottima',
    notes: 'Congelare in porzioni singole. Mantiene qualità perfetta.'
  },
  {
    category: 'proteina',
    item: 'Pollo cotto',
    freezable: true,
    shelfLife: 4,
    freezerLife: 4,
    quality: 'Buona',
    notes: 'Perde un po\' di texture ma ottimo per ricette.'
  },
  {
    category: 'proteina',
    item: 'Manzo crudo',
    freezable: true,
    shelfLife: 3,
    freezerLife: 12,
    quality: 'Ottima',
    notes: 'Sottovuoto dura 2-3 anni. Ottima qualità post-scongelamento.'
  },
  {
    category: 'proteina',
    item: 'Macinato',
    freezable: true,
    shelfLife: 1,
    freezerLife: 4,
    quality: 'Buona',
    notes: 'Congelare piatto (scongela più veloce). Max 4 mesi.'
  },
  {
    category: 'proteina',
    item: 'Pesce grasso (salmone)',
    freezable: true,
    shelfLife: 2,
    freezerLife: 3,
    quality: 'Buona',
    notes: 'Grassi si ossidano. Meglio consumare entro 3 mesi.'
  },
  {
    category: 'proteina',
    item: 'Pesce bianco',
    freezable: true,
    shelfLife: 2,
    freezerLife: 6,
    quality: 'Ottima',
    notes: 'Mantiene qualità meglio del pesce grasso.'
  },
  {
    category: 'proteina',
    item: 'Prosciutto crudo',
    freezable: false,
    shelfLife: 7,
    freezerLife: 0,
    quality: 'Sconsigliato',
    notes: 'Perde texture e diventa molliccio. MAI congelare.'
  },
  {
    category: 'proteina',
    item: 'Prosciutto cotto aperto',
    freezable: true,
    shelfLife: 3,
    freezerLife: 2,
    quality: 'Discreta',
    notes: 'Solo se necessario. Perde texture. Congelare in porzioni.'
  },
  {
    category: 'proteina',
    item: 'Uova crude (sgusciate)',
    freezable: true,
    shelfLife: 35,
    freezerLife: 12,
    quality: 'Buona',
    notes: 'Sbattere prima. Mai congelare con guscio (esplodono).'
  },
  
  // CARBOIDRATI
  {
    category: 'carboidrato',
    item: 'Pane fresco',
    freezable: true,
    shelfLife: 3,
    freezerLife: 6,
    quality: 'Ottima',
    notes: 'Congelare freschissimo. Tostare direttamente da congelato.'
  },
  {
    category: 'carboidrato',
    item: 'Pane raffermo',
    freezable: false,
    shelfLife: 1,
    freezerLife: 0,
    quality: 'Sconsigliato',
    notes: 'Se già secco, congelare è inutile. Fare pangrattato.'
  },
  {
    category: 'carboidrato',
    item: 'Pasta cotta',
    freezable: true,
    shelfLife: 3,
    freezerLife: 2,
    quality: 'Discreta',
    notes: 'Scolare al dente. Aggiungere olio. Texture un po\' molliccia.'
  },
  {
    category: 'carboidrato',
    item: 'Riso cotto',
    freezable: true,
    shelfLife: 4,
    freezerLife: 6,
    quality: 'Buona',
    notes: 'Ottimo per meal prep. Riscaldare con vapore.'
  },
  {
    category: 'carboidrato',
    item: 'Patate crude',
    freezable: false,
    shelfLife: 14,
    freezerLife: 0,
    quality: 'Sconsigliato',
    notes: 'Diventano mollicci e granulosi. Solo patate cotte/fritte OK.'
  },
  
  // LATTICINI
  {
    category: 'latticino',
    item: 'Latte',
    freezable: true,
    shelfLife: 7,
    freezerLife: 3,
    quality: 'Discreta',
    notes: 'Si separa un po\'. Agitare bene dopo scongelamento. OK per cucinare.'
  },
  {
    category: 'latticino',
    item: 'Yogurt',
    freezable: false,
    shelfLife: 7,
    freezerLife: 0,
    quality: 'Sconsigliato',
    notes: 'Si separa completamente. Texture orribile. Solo per smoothie congelati.'
  },
  {
    category: 'latticino',
    item: 'Formaggio duro (Parmigiano)',
    freezable: true,
    shelfLife: 21,
    freezerLife: 6,
    quality: 'Buona',
    notes: 'Grattugiare prima. Perde un po\' di texture ma sapore OK.'
  },
  {
    category: 'latticino',
    item: 'Formaggio fresco (Mozzarella)',
    freezable: false,
    shelfLife: 7,
    freezerLife: 0,
    quality: 'Sconsigliato',
    notes: 'Diventa gommoso. Solo se per cucinare (pizza).'
  },
  {
    category: 'latticino',
    item: 'Burro',
    freezable: true,
    shelfLife: 30,
    freezerLife: 12,
    quality: 'Ottima',
    notes: 'Perfetto. Mantiene qualità. Sempre utile averlo congelato.'
  },
  
  // VERDURE
  {
    category: 'verdura',
    item: 'Spinaci',
    freezable: true,
    shelfLife: 3,
    freezerLife: 12,
    quality: 'Buona',
    notes: 'Sbollentare 2 min prima. Ottimi per cotture.'
  },
  {
    category: 'verdura',
    item: 'Broccoli',
    freezable: true,
    shelfLife: 5,
    freezerLife: 12,
    quality: 'Buona',
    notes: 'Sbollentare 3 min. Mantenere croccantezza.'
  },
  {
    category: 'verdura',
    item: 'Insalata',
    freezable: false,
    shelfLife: 3,
    freezerLife: 0,
    quality: 'Sconsigliato',
    notes: 'Diventa melmosa. MAI congelare verdure ad alto contenuto acqua crude.'
  },
  {
    category: 'verdura',
    item: 'Pomodori',
    freezable: true,
    shelfLife: 5,
    freezerLife: 8,
    quality: 'Buona',
    notes: 'Solo per sughi. Sbollentare e pelare prima.'
  },
  
  // FRUTTA
  {
    category: 'frutta',
    item: 'Banane mature',
    freezable: true,
    shelfLife: 2,
    freezerLife: 6,
    quality: 'Ottima',
    notes: 'Perfette per smoothie. Sbucciare prima. Diventano nere ma dolcissime.'
  },
  {
    category: 'frutta',
    item: 'Frutti di bosco',
    freezable: true,
    shelfLife: 3,
    freezerLife: 12,
    quality: 'Ottima',
    notes: 'Congelare su teglia singolarmente. Ottima qualità.'
  },
  {
    category: 'frutta',
    item: 'Mele',
    freezable: true,
    shelfLife: 14,
    freezerLife: 12,
    quality: 'Buona',
    notes: 'Sbucciare, tagliare, limone. Solo per cotture/dolci.'
  },
  
  // GRASSI
  {
    category: 'grasso',
    item: 'Avocado',
    freezable: true,
    shelfLife: 3,
    freezerLife: 6,
    quality: 'Discreta',
    notes: 'Schiacciare con limone. Solo per guacamole/smoothie.'
  },
  {
    category: 'grasso',
    item: 'Noci e semi',
    freezable: true,
    shelfLife: 30,
    freezerLife: 12,
    quality: 'Ottima',
    notes: 'Previene irrancidimento. Sempre congelare se grandi quantità.'
  },
  
  // PIATTI PRONTI
  {
    category: 'piatto_pronto',
    item: 'Sughi e ragù',
    freezable: true,
    shelfLife: 3,
    freezerLife: 4,
    quality: 'Ottima',
    notes: 'Perfetti. Congelare in porzioni. Sapore migliora.'
  },
  {
    category: 'piatto_pronto',
    item: 'Zuppe e minestre',
    freezable: true,
    shelfLife: 3,
    freezerLife: 3,
    quality: 'Ottima',
    notes: 'Ottimi. Lasciare spazio per espansione.'
  },
  {
    category: 'piatto_pronto',
    item: 'Pizza',
    freezable: true,
    shelfLife: 3,
    freezerLife: 2,
    quality: 'Buona',
    notes: 'Riscaldare in forno. Microonde = molliccia.'
  }
];

// Helper functions
export const getFreezingInfo = (itemName: string): FreezingInfo | undefined => {
  return freezingGuide.find(
    item => item.item.toLowerCase().includes(itemName.toLowerCase())
  );
};

export const shouldFreeze = (itemName: string, daysUntilExpiry: number): {
  shouldFreeze: boolean;
  reason: string;
  urgency: 'high' | 'medium' | 'low';
} => {
  const info = getFreezingInfo(itemName);
  
  if (!info || !info.freezable) {
    return {
      shouldFreeze: false,
      reason: info ? info.notes : 'Non congelare - perde qualità',
      urgency: 'low'
    };
  }
  
  if (daysUntilExpiry <= 1) {
    return {
      shouldFreeze: true,
      reason: `Scade domani! ${info.notes}`,
      urgency: 'high'
    };
  }
  
  if (daysUntilExpiry <= 3) {
    return {
      shouldFreeze: true,
      reason: `Consigliato congelare. Durata freezer: ${info.freezerLife} mesi`,
      urgency: 'medium'
    };
  }
  
  if (daysUntilExpiry <= info.shelfLife / 2) {
    return {
      shouldFreeze: true,
      reason: `Opzionale. Qualità: ${info.quality}`,
      urgency: 'low'
    };
  }
  
  return {
    shouldFreeze: false,
    reason: 'Non necessario per ora',
    urgency: 'low'
  };
};
```

**USARE IN UrgentItems.tsx**:
```tsx
import { getFreezingInfo, shouldFreeze } from '../data/freezingGuide';

// Nelle card degli ingredienti
const freezeInfo = shouldFreeze(food.name, item.expiryDays);
if (freezeInfo.shouldFreeze) {
  // Mostra badge e suggerimenti
}
```

---

### 5. 🛒 AUTO-GENERA Lista Spesa da Dieta

**FILE**: `/components/UrgentItems.tsx` o nuovo `/components/ShoppingListGenerator.tsx`

**LOGICA**:
```typescript
// Quando utente clicca "Segui Dieta"
const generateShoppingListFromDiet = (diet: DietPlan, currentInventory: FridgeItem[]) => {
  const neededIngredients: string[] = [];
  const weekPlan = diet.weekPlan;
  
  // Estrai tutti ingredienti dalla dieta
  Object.values(weekPlan).forEach(day => {
    const allMeals = [
      day.breakfast,
      day.snack1,
      day.lunch,
      day.snack2,
      day.dinner
    ];
    
    // Parse ingredienti (semplificato - in produzione usare parser più robusto)
    allMeals.forEach(meal => {
      // Cerca nel foodDatabase
      foodDatabase.forEach(food => {
        if (meal.toLowerCase().includes(food.name.toLowerCase())) {
          neededIngredients.push(food.id);
        }
      });
    });
  });
  
  // Rimuovi duplicati
  const unique = [...new Set(neededIngredients)];
  
  // Filtra quelli che NON hai già
  const inventoryIds = currentInventory.map(i => i.foodId);
  const missing = unique.filter(id => !inventoryIds.includes(id));
  
  // Calcola quantità per settimana
  const shoppingList = missing.map(foodId => {
    const food = foodDatabase.find(f => f.id === foodId);
    const occurrences = neededIngredients.filter(id => id === foodId).length;
    
    return {
      foodId,
      quantity: (food?.typicalServing || 100) * occurrences,
      unit: food?.unit || 'g',
      forWeek: true
    };
  });
  
  return shoppingList;
};
```

**INTEGRARE IN DietProposals handleFollowDiet**:
```tsx
const handleFollowDiet = async (diet: DietPlan | null) => {
  if (!diet) return;
  
  // ... salva dieta ...
  
  // GENERA LISTA SPESA
  const shoppingList = generateShoppingListFromDiet(diet, fridgeItems);
  
  // Aggiorna lista spesa
  setShoppingList(shoppingList);
  
  toast.success(`${diet.name} attivata!`, {
    description: `Lista spesa generata: ${shoppingList.length} ingredienti da comprare`
  });
};
```

---

## 🔄 ORDINE IMPLEMENTAZIONE CONSIGLIATO

### Step 1: Fix UI Dialog (30 min)
1. Aprire `/components/DietProposals.tsx`
2. Modificare DialogContent (linea ~320)
3. Testare scrolling e dimensioni

### Step 2: Bottone Segui Dieta (1 ora)
1. Aggiungere bottone in DietProposals
2. Implementare handleFollowDiet con localStorage
3. Aggiungere onDietSelected callback
4. Modificare App.tsx per ricevere dieta

### Step 3: Integrare WeeklyCalendar (1 ora)
1. Passare selectedDiet a WeeklyCalendar
2. Mostrare preview pasti sui giorni
3. Aggiungere dialog dettaglio giorno
4. Testare visualizzazione

### Step 4: Semplificare Frigo (45 min)
1. Rimuovere tab Check Rapido
2. Aggiungere bottone fisso
3. Creare dialog 2-step (categoria → ingredienti)
4. Testare aggiunta rapida

### Step 5: Guida Congelamento (30 min)
1. Creare `/data/freezingGuide.ts`
2. Importare in UrgentItems
3. Mostrare suggerimenti intelligenti
4. Testare con vari ingredienti

### Step 6: Auto Lista Spesa (1 ora)
1. Creare funzione generateShoppingListFromDiet
2. Integrare in handleFollowDiet
3. Aggiungere badge "Da dieta" vs "Da ricetta"
4. Testare con dieta completa

### Step 7: Supabase Integration (2 ore) - DOPO test locale
1. Connettere Supabase
2. Creare tabelle: user_diets, inventory, shopping_list
3. Sostituire localStorage con Supabase
4. Aggiungere sync real-time

---

## 📋 CHECKLIST FINALE

Avant di considerare completo:
- [ ] Dialog dieta scorre bene e si vede tutta settimana
- [ ] Bottone "Segui Dieta" salva e mostra toast
- [ ] Calendario mostra preview pasti quando dieta selezionata
- [ ] Click su giorno mostra tutti 5 pasti in dialog
- [ ] Frigorifero ha bottone unico in basso
- [ ] Dialog aggiunta ingredienti è 2-step (categoria → selezione)
- [ ] Suggerimenti congelamento sono scientificamente accurati
- [ ] Lista spesa si auto-genera da dieta - inventario
- [ ] Badge "Per dieta" distingue da "Per ricetta"
- [ ] Toast informativi per ogni azione
- [ ] Tutto funziona in localStorage prima di Supabase

---

## 🚀 DOPO IMPLEMENTAZIONE

### Per deploy:
1. Testare tutto in locale
2. Rimuovere console.log
3. Aggiungere error boundaries
4. Implementare Supabase
5. Testare con dati reali
6. Deploy su Vercel/Netlify

### Supabase Schema:
```sql
-- Tabella user_diets
CREATE TABLE user_diets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  diet_id TEXT NOT NULL,
  diet_name TEXT NOT NULL,
  week_plan JSONB NOT NULL,
  started_at TIMESTAMP DEFAULT NOW(),
  ended_at TIMESTAMP,
  active BOOLEAN DEFAULT TRUE
);

-- Tabella inventory
CREATE TABLE inventory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  food_id TEXT NOT NULL,
  quantity NUMERIC NOT NULL,
  unit TEXT NOT NULL,
  expiry_days INTEGER,
  added_at TIMESTAMP DEFAULT NOW()
);

-- Tabella shopping_list
CREATE TABLE shopping_list (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  food_id TEXT NOT NULL,
  quantity NUMERIC NOT NULL,
  unit TEXT NOT NULL,
  source TEXT, -- 'diet' | 'recipe' | 'manual'
  checked BOOLEAN DEFAULT FALSE,
  added_at TIMESTAMP DEFAULT NOW()
);
```

---

**NOTA IMPORTANTE**: 
Inizia dai fix UI (Step 1) perché sono veloci e migliorano subito l'esperienza.
Poi implementa il bottone "Segui Dieta" (Step 2-3) che è la feature core.
Il resto può essere fatto gradualmente.

**TEMPO TOTALE STIMATO**: 6-7 ore per implementazione completa
**PRIORITÀ ALTA**: Step 1, 2, 3
**PRIORITÀ MEDIA**: Step 4, 6
**PRIORITÀ BASSA**: Step 5, 7 (nice to have)
