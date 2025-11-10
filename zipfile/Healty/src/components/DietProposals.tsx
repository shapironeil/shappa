import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Lightbulb, Sparkles, Star, Info, TrendingUp, Heart, Zap, Brain, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface DayMeal {
  breakfast: string;
  snack1: string;
  lunch: string;
  snack2: string;
  dinner: string;
  calories: number;
}

interface WeekPlan {
  [key: string]: DayMeal;
}

interface DietPlan {
  id: string;
  name: string;
  description: string;
  duration: string;
  difficulty: 'Facile' | 'Media' | 'Difficile';
  targetCalories: number;
  benefits: string[];
  weekPlan: WeekPlan;
  supplements: string[];
  warnings: string[];
  tips: string[];
  scientificBasis: string[];
  micronutrients: {
    focus: string[];
    deficiencyRisk: string[];
    solutions: string[];
  };
  suitableFor: {
    excludes?: string[];
    includes?: string[];
    bodyTypes?: string[];
    goals?: string[];
  };
}

interface UserProfile {
  bodyType: string;
  allergies: string[];
  excludeFromDiet: string[];
  healthIssues: string[];
  dietaryPreference: string;
}

interface DietProposalsProps {
  userProfile: UserProfile | null;
  onDietSelected?: (diet: DietPlan) => void;
}

const weekDays = ['Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato', 'Domenica'];

const allDietPlans: DietPlan[] = [
  {
    id: 'high-protein',
    name: 'Dieta Iperproteica',
    description: 'Alta in proteine, ideale per chi non mangia frutta e verdura',
    duration: '4-8 settimane',
    difficulty: 'Media',
    targetCalories: 2000,
    benefits: ['Aumento massa muscolare', 'Maggiore sazietà', 'Metabolismo accelerato', 'Recupero muscolare'],
    weekPlan: {
      'Lunedì': {
        breakfast: '4 uova strapazzate + 2 fette pancetta + caffè',
        snack1: 'Frullato proteico 30g + latte intero',
        lunch: 'Petto pollo 200g + riso basmati 80g + brodo vegetale',
        snack2: 'Yogurt greco 200g + mandorle 30g',
        dinner: 'Salmone 180g + patate 150g + dado vegetale',
        calories: 2050
      },
      'Martedì': {
        breakfast: 'Frittata 3 uova + formaggio + pane proteico',
        snack1: 'Barretta proteica + noci 20g',
        lunch: 'Tacchino 200g + quinoa 80g + ceci frullati',
        snack2: 'Frullato ceci 100g + banana',
        dinner: 'Bistecca 180g + patate dolci + brodo',
        calories: 2100
      },
      'Mercoledì': {
        breakfast: 'Yogurt greco 250g + burro arachidi + avena 50g',
        snack1: 'Prosciutto crudo 80g + formaggio',
        lunch: 'Pollo curry 200g + riso 80g + dado vegetale',
        snack2: 'Frullato proteico + semi chia',
        dinner: 'Tonno 200g + pasta 80g + olio oliva',
        calories: 1980
      },
      'Giovedì': {
        breakfast: '3 uova + avocado + pancetta',
        snack1: 'Yogurt + proteine in polvere',
        lunch: 'Manzo 200g + legumi frullati + riso',
        snack2: 'Mandorle 40g + cioccolato fondente',
        dinner: 'Salmone 200g + brodo + patate',
        calories: 2020
      },
      'Venerdì': {
        breakfast: 'Pancake proteici + sciroppo senza zucchero',
        snack1: 'Frullato proteico + latte',
        lunch: 'Pollo 200g + pasta integrale 80g',
        snack2: 'Yogurt greco + noci',
        dinner: 'Pesce spada 180g + verdure frullate',
        calories: 1950
      },
      'Sabato': {
        breakfast: 'Uova in camicia + salmone affumicato',
        snack1: 'Barretta proteica',
        lunch: 'Tacchino 250g + riso + brodo',
        snack2: 'Frullato ceci + banana',
        dinner: 'Bistecca 200g + patate + dado',
        calories: 2150
      },
      'Domenica': {
        breakfast: 'French toast proteico + mirtilli',
        snack1: 'Yogurt + semi',
        lunch: 'Pollo arrosto 250g + legumi frullati',
        snack2: 'Frutta secca mix 40g',
        dinner: 'Salmone 200g + patate dolci + brodo',
        calories: 2080
      }
    },
    supplements: [
      'Multivitaminico completo (per compensare mancanza vegetali)',
      'Vitamina C 1000mg/giorno',
      'Fibre solubili 10-15g/giorno (psyllium)',
      'Omega-3 da olio pesce 2-3g/giorno',
      'Probiotici 20+ miliardi CFU',
      'Magnesio 400mg (citrato o glicinato)',
      'Vitamina D3 2000-4000 UI'
    ],
    warnings: [
      'Bere MINIMO 3L acqua al giorno (fondamentale con proteine alte)',
      'Monitorare funzione renale con esami ogni 2-3 mesi',
      'Assumere fibre quotidianamente per compensare mancanza vegetali',
      'Se creatinina alta, ridurre proteine e consultare medico'
    ],
    tips: [
      'Varia fonti proteiche: pollo, tacchino, manzo, pesce, uova',
      'Usa legumi frullati per texture cremosa e fibre',
      'Brodo vegetale fatto con dado di qualità fornisce minerali',
      'Prepara meal prep domenica per tutta settimana',
      'Integra SEMPRE con multivitaminico di qualità'
    ],
    scientificBasis: [
      'Effetto termogenico proteine: +20-30% metabolismo (fonte: ISSN)',
      'Sazietà aumentata: riduzione fame del 60% rispetto high-carb',
      'Sintesi proteica muscolare ottimale: 0.4g/kg ogni 3-4h',
      'Compensazione frutta/verdura possibile con integratori mirati'
    ],
    micronutrients: {
      focus: ['Vitamina C', 'Vitamina K', 'Folati', 'Potassio', 'Fibre'],
      deficiencyRisk: ['Possibile carenza vitamine liposolubili', 'Fibre insufficienti', 'Antiossidanti ridotti'],
      solutions: ['Green powder (spirulina, clorella)', 'Polvere barbabietola per nitrati', 'Estratto bacche per antiossidanti']
    },
    suitableFor: {
      excludes: ['Frutta', 'Verdura'],
      bodyTypes: ['ectomorfo', 'mesomorfo'],
      goals: ['Aumento massa muscolare', 'Definizione']
    }
  },
  {
    id: 'keto-adapted',
    name: 'Dieta Chetogenica Adattata',
    description: 'Basso contenuto di carboidrati, alto in grassi sani',
    duration: '4-12 settimane',
    difficulty: 'Difficile',
    targetCalories: 1800,
    benefits: ['Perdita peso rapida', 'Energia stabile', 'Riduzione infiammazione', 'Controllo glicemia'],
    weekPlan: {
      'Lunedì': {
        breakfast: 'Uova 3 + bacon 3 fette + avocado 1/2 + burro',
        snack1: 'Noci macadamia 30g + formaggio',
        lunch: 'Salmone 200g + burro + spinaci saltati',
        snack2: 'Olive 50g + salame',
        dinner: 'Bistecca 180g + broccoli burro + olio',
        calories: 1850
      },
      'Martedì': {
        breakfast: 'Frittata 4 uova + formaggio + funghi',
        snack1: 'Cioccolato 90% + mandorle',
        lunch: 'Pollo coscia 200g + insalata + olio abbondante',
        snack2: 'Avocado + sale',
        dinner: 'Tonno 200g + maionese + brodo grasso',
        calories: 1780
      },
      'Mercoledì': {
        breakfast: 'Yogurt greco intero + noci + burro arachidi',
        snack1: 'Formaggio stagionato 60g',
        lunch: 'Maiale 200g + cavolfiore + burro ghee',
        snack2: 'MCT oil coffee',
        dinner: 'Salmone 180g + asparagi + olio oliva',
        calories: 1820
      },
      'Giovedì': {
        breakfast: 'Uova 4 + salmone affumicato + burro',
        snack1: 'Noci pecan + cioccolato fondente',
        lunch: 'Bistecca 200g + verdure grigliate + olio',
        snack2: 'Brodo ossa salato',
        dinner: 'Pollo 180g + pesto + zucchine',
        calories: 1800
      },
      'Venerdì': {
        breakfast: 'Pancake keto (uova + cream cheese)',
        snack1: 'Avocado + sale rosa',
        lunch: 'Tonno grasso 200g + maionese + cetrioli',
        snack2: 'Formaggio + olive',
        dinner: 'Salmone 200g + burro limone + broccoli',
        calories: 1830
      },
      'Sabato': {
        breakfast: 'Uova Benedict + bacon + hollandaise',
        snack1: 'Noci + cioccolato 90%',
        lunch: 'Manzo 200g + funghi panna + burro',
        snack2: 'Bulletproof coffee (caffè + burro + MCT)',
        dinner: 'Pollo 180g + insalata + olio EVO abbondante',
        calories: 1900
      },
      'Domenica': {
        breakfast: 'Frittata grande + formaggio + avocado',
        snack1: 'Salame + formaggi vari',
        lunch: 'Salmone 250g + burro + verdure',
        snack2: 'Brodo + sale',
        dinner: 'Bistecca 200g + cavolfiore + panna',
        calories: 1850
      }
    },
    supplements: [
      'Elettroliti CRITICI: Sodio 5-7g, Potassio 3-4g, Magnesio 400-600mg',
      'Multivitaminico completo',
      'MCT Oil 15-30ml/giorno per chetoni',
      'Omega-3 EPA/DHA 3g',
      'Vitamina D3 4000 UI',
      'Probiotici per digestione grassi',
      'Fibre psyllium 5-10g (opzionale)'
    ],
    warnings: [
      'KETO FLU primi 3-7 giorni: mal testa, stanchezza, crampi',
      'Aumenta MOLTO il sale nella prima settimana (brodo salato)',
      'Monitora chetoni urine/sangue per confermare chetosi',
      'NON fare "cheat days" - riparti da zero adattamento',
      'Controindicata con problemi renali o epatici gravi'
    ],
    tips: [
      'Bevi brodo salato 2-3 volte al giorno per elettroliti',
      'Aggiungi sale rosa himalaya a tutto',
      'MCT oil nel caffè mattina per energia immediata',
      'Grassi saturi OK: burro, ghee, olio cocco',
      'Mantieni proteine moderate (1.6g/kg max)'
    ],
    scientificBasis: [
      'Chetosi: corpo usa grassi invece glucosio (fonte: AJCN)',
      'Riduzione insulina: migliora sensibilità insulinica 70%',
      'Neuroprotezione: chetoni nutrono cervello meglio glucosio',
      'Anti-infiammazione: riduce markers infiammatori 50%'
    ],
    micronutrients: {
      focus: ['Elettroliti', 'Vitamine B', 'Magnesio', 'Potassio'],
      deficiencyRisk: ['Elettroliti critici prima settimana', 'Fibre se zero vegetali'],
      solutions: ['Brodo ossa quotidiano', 'Sale abbondante', 'Integratori mirati']
    },
    suitableFor: {
      excludes: ['Frutta', 'Carboidrati', 'Zuccheri raffinati'],
      bodyTypes: ['endomorfo', 'normale'],
      goals: ['Perdita peso', 'Definizione', 'Controllo glicemia']
    }
  },
  {
    id: 'balanced-macro',
    name: 'Dieta Bilanciata Macro',
    description: 'Equilibrio perfetto tra proteine, carboidrati e grassi',
    duration: '8-12 settimane',
    difficulty: 'Facile',
    targetCalories: 1900,
    benefits: ['Sostenibile a lungo termine', 'Energia costante', 'Versatile', 'Nutrienti completi'],
    weekPlan: {
      'Lunedì': {
        breakfast: 'Avena 60g + yogurt 150g + noci 20g + miele',
        snack1: 'Mela + mandorle 20g',
        lunch: 'Pollo 150g + riso 80g + verdure miste',
        snack2: 'Yogurt greco + frutti bosco',
        dinner: 'Salmone 150g + patate 100g + insalata',
        calories: 1920
      },
      'Martedì': {
        breakfast: 'Uova 2 + pane integrale + avocado',
        snack1: 'Frutta + yogurt',
        lunch: 'Tacchino 150g + pasta 80g + pomodoro',
        snack2: 'Frutta secca 30g',
        dinner: 'Pesce 150g + quinoa 60g + verdure',
        calories: 1880
      },
      'Mercoledì': {
        breakfast: 'Pancake avena + banana + burro arachidi',
        snack1: 'Smoothie frutta + proteine',
        lunch: 'Manzo 150g + patate dolci + broccoli',
        snack2: 'Barretta proteica',
        dinner: 'Pollo 150g + riso + verdure saltate',
        calories: 1910
      },
      'Giovedì': {
        breakfast: 'Yogurt + granola + frutti bosco',
        snack1: 'Toast integrale + hummus',
        lunch: 'Salmone 150g + insalata quinoa',
        snack2: 'Frutta fresca + noci',
        dinner: 'Tacchino 150g + pasta 70g + verdure',
        calories: 1890
      },
      'Venerdì': {
        breakfast: 'Uova strapazzate + toast + pomodori',
        snack1: 'Frullato banana + latte',
        lunch: 'Pollo 150g + riso basmati + legumi',
        snack2: 'Yogurt + miele',
        dinner: 'Pesce 150g + patate + insalata',
        calories: 1900
      },
      'Sabato': {
        breakfast: 'Porridge + mirtilli + noci',
        snack1: 'Frutta + formaggio light',
        lunch: 'Pizza integrale + insalata',
        snack2: 'Smoothie proteico',
        dinner: 'Bistecca 150g + patate dolci + verdure',
        calories: 1950
      },
      'Domenica': {
        breakfast: 'French toast + sciroppo acero + frutti',
        snack1: 'Frutta secca mix',
        lunch: 'Pasta 100g + tonno + verdure',
        snack2: 'Yogurt greco + granola',
        dinner: 'Pollo arrosto 150g + riso + insalata',
        calories: 1920
      }
    },
    supplements: [
      'Multivitaminico base (opzionale)',
      'Omega-3 1-2g/giorno',
      'Vitamina D3 2000 UI',
      'Magnesio 200-400mg se carente'
    ],
    warnings: [
      'Personalizza porzioni in base al tuo TDEE',
      'Monitora progressi settimanalmente',
      'Adatta macro se non vedi risultati dopo 3 settimane'
    ],
    tips: [
      'Meal prep domenica per tutta settimana',
      'Varia fonti proteiche ogni giorno',
      'Carboidrati complessi sempre (no raffinati)',
      'Verdure ad ogni pasto per volume e fibre',
      'Grassi sani: olio oliva, noci, avocado, pesce'
    ],
    scientificBasis: [
      'Distribuzione macro ottimale per aderenza (studio Stanford)',
      'Energia stabile: evita picchi insulinici',
      'Sostenibilità 95% vs 60% diete estreme',
      'Adatta a tutti i livelli attività fisica'
    ],
    micronutrients: {
      focus: ['Completo se include varietà alimenti'],
      deficiencyRisk: ['Bassissimo rischio se dieta varia'],
      solutions: ['Ruotare alimenti ogni settimana']
    },
    suitableFor: {
      bodyTypes: ['tutti'],
      goals: ['Mantenimento', 'Ricomposizione corporea', 'Salute generale']
    }
  }
];

export function DietProposals({ userProfile }: DietProposalsProps) {
  const [selectedDiet, setSelectedDiet] = useState<DietPlan | null>(null);
  const [suggestedDiets, setSuggestedDiets] = useState<DietPlan[]>([]);

  useEffect(() => {
    if (userProfile) {
      const recommended = getRecommendedDiets(userProfile);
      setSuggestedDiets(recommended);
    } else {
      setSuggestedDiets([]);
    }
  }, [userProfile]);

  const getRecommendedDiets = (profile: UserProfile): DietPlan[] => {
    const scored = allDietPlans.map(diet => {
      let score = 0;

      if (diet.suitableFor.excludes) {
        const matchingExclusions = diet.suitableFor.excludes.filter(exc =>
          profile.excludeFromDiet.includes(exc)
        );
        score += matchingExclusions.length * 10;
      }

      if (diet.suitableFor.bodyTypes) {
        if (diet.suitableFor.bodyTypes.includes('tutti') || 
            diet.suitableFor.bodyTypes.includes(profile.bodyType)) {
          score += 5;
        }
      }

      if (profile.excludeFromDiet.includes('Frutta') && 
          profile.excludeFromDiet.includes('Verdura')) {
        if (diet.id === 'high-protein' || diet.id === 'keto-adapted') {
          score += 15;
        }
      }

      return { diet, score };
    });

    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, 3).map(s => s.diet);
  };

  const handleFollowDiet = (diet: DietPlan | null) => {
    if (!diet) return;
    
    try {
      // Salva TUTTA la dieta in localStorage
      localStorage.setItem('selected_diet', JSON.stringify({
        ...diet,
        startedAt: new Date().toISOString()
      }));
      
      // Callback al parent
      if (onDietSelected) {
        onDietSelected({
          ...diet,
          startedAt: new Date().toISOString()
        } as any);
      }
      
      console.log('✅ Dieta salvata con successo:', diet.name);
      console.log('📦 Dimensione dati:', new Blob([JSON.stringify({ ...diet, startedAt: new Date().toISOString() })]).size, 'bytes');
      
      toast.success(`Hai iniziato la ${diet.name}!`, {
        description: 'Il calendario è stato aggiornato con i pasti settimanali'
      });
      
      setSelectedDiet(null); // Chiudi dialog
    } catch (error) {
      console.error('Errore salvataggio dieta:', error);
      toast.error('Errore nel salvare la dieta');
    }
  };

  const [selectedDay, setSelectedDay] = useState<string>('Lunedì');

  const difficultyColors = {
    'Facile': 'bg-green-100 text-green-700 border-green-200',
    'Media': 'bg-yellow-100 text-yellow-700 border-yellow-200',
    'Difficile': 'bg-red-100 text-red-700 border-red-200'
  };

  const getWeeklyAvgCalories = (weekPlan: WeekPlan): number => {
    const total = Object.values(weekPlan).reduce((sum, day) => sum + day.calories, 0);
    return Math.round(total / Object.keys(weekPlan).length);
  };

  if (!userProfile) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb className="w-5 h-5 text-orange-600" />
          <h2>Scheda alimentare</h2>
        </div>
        <div className="text-center py-8">
          <Info className="w-12 h-12 mx-auto text-gray-400 mb-3" />
          <p className="text-sm text-gray-600">
            Completa le tue preferenze alimentari per ricevere 3 diete personalizzate
          </p>
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb className="w-5 h-5 text-orange-600" />
          <h2>Diete Personalizzate</h2>
        </div>

        <div className="mb-4 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
          <div className="flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-purple-600 mt-0.5" />
            <p className="text-xs text-purple-800">
              Basate sulle tue preferenze: {suggestedDiets.length} diete consigliate
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {suggestedDiets.map((plan, index) => (
            <div
              key={plan.id}
              className={`p-4 rounded-lg border-2 transition-all cursor-pointer hover:border-orange-300 ${
                index === 0
                  ? 'bg-gradient-to-br from-orange-50 to-yellow-50 border-orange-300'
                  : 'bg-white border-gray-200'
              }`}
              onClick={() => setSelectedDiet(plan)}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm">{plan.name}</h3>
                    {index === 0 && (
                      <Badge variant="default" className="bg-orange-600">
                        <Star className="w-3 h-3 mr-1" />
                        Consigliata
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-gray-600">{plan.description}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className={`${difficultyColors[plan.difficulty]} text-xs`}>
                  {plan.difficulty}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {plan.duration}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  ~{getWeeklyAvgCalories(plan.weekPlan)} cal/giorno
                </Badge>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-xs text-blue-800">
            💡 Clicca su una dieta per vedere il piano settimanale completo
          </p>
        </div>
      </Card>

      {/* Dialog Dettagli Dieta - LAYOUT ORIZZONTALE CON MENU GIORNI */}
      <Dialog open={!!selectedDiet} onOpenChange={(open) => !open && setSelectedDiet(null)}>
        <DialogContent className="max-w-[98vw] w-[1600px] h-[85vh] overflow-hidden flex flex-col p-6">
          <DialogHeader className="flex-shrink-0 pb-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <DialogTitle className="flex items-center gap-2 mb-1">
                  {selectedDiet?.name}
                  <Badge className={difficultyColors[selectedDiet?.difficulty || 'Facile']}>
                    {selectedDiet?.difficulty}
                  </Badge>
                </DialogTitle>
                <DialogDescription>{selectedDiet?.description}</DialogDescription>
              </div>
              
              {/* BOTTONE SEGUI DIETA */}
              <Button 
                onClick={() => handleFollowDiet(selectedDiet)}
                className="bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 shrink-0"
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Segui Questa Dieta
              </Button>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-hidden min-h-0">
            <Tabs defaultValue="week" className="w-full h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-4 mb-3">
              <TabsTrigger value="week">Piano Settimanale</TabsTrigger>
              <TabsTrigger value="benefits">Benefici & Scienza</TabsTrigger>
              <TabsTrigger value="supplements">Integratori & Nutrienti</TabsTrigger>
              <TabsTrigger value="tips">Consigli Pratici</TabsTrigger>
            </TabsList>

            <ScrollArea className="flex-1">
              {selectedDiet && (
                <>
                  {/* TAB 1: PIANO SETTIMANALE - LAYOUT ORIZZONTALE CON MENU */}
                  <TabsContent value="week" className="h-full">
                    <div className="flex gap-4 h-full">
                      {/* MENU GIORNI - SIDEBAR SINISTRA */}
                      <div className="w-48 flex-shrink-0 space-y-2">
                        {weekDays.map((day) => {
                          const dayPlan = selectedDiet.weekPlan[day];
                          const isSelected = selectedDay === day;
                          return (
                            <button
                              key={day}
                              onClick={() => setSelectedDay(day)}
                              className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                                isSelected
                                  ? 'bg-orange-100 border-orange-500 shadow-md'
                                  : 'bg-white border-gray-200 hover:border-orange-300 hover:shadow-sm'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className={isSelected ? 'font-medium' : ''}>{day}</span>
                                {isSelected && <span className="text-orange-600">→</span>}
                              </div>
                              <div className="text-xs text-gray-600 mt-1">
                                {dayPlan.calories} cal
                              </div>
                            </button>
                          );
                        })}
                      </div>
                      
                      {/* CONTENUTO GIORNO SELEZIONATO */}
                      <div className="flex-1 bg-gradient-to-br from-white to-gray-50 rounded-xl border-2 border-gray-200 p-6">
                        {selectedDiet.weekPlan[selectedDay] && (
                          <>
                            <div className="flex items-center justify-between mb-6 pb-4 border-b-2">
                              <div>
                                <h3 className="text-xl">{selectedDay}</h3>
                                <p className="text-sm text-gray-600">Piano pasti completo</p>
                              </div>
                              <Badge variant="outline" className="text-base px-4 py-2">
                                {selectedDiet.weekPlan[selectedDay].calories} cal
                              </Badge>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                              {/* Colazione */}
                              <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 border-2 border-orange-200">
                                <div className="flex items-center gap-2 mb-3">
                                  <span className="text-2xl">🌅</span>
                                  <h4 className="font-medium text-orange-900">Colazione</h4>
                                </div>
                                <p className="text-sm text-gray-800 leading-relaxed">{selectedDiet.weekPlan[selectedDay].breakfast}</p>
                              </div>
                              
                              {/* Spuntino 1 */}
                              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border-2 border-green-200">
                                <div className="flex items-center gap-2 mb-3">
                                  <span className="text-2xl">🍎</span>
                                  <h4 className="font-medium text-green-900">Spuntino Mattina</h4>
                                </div>
                                <p className="text-sm text-gray-800 leading-relaxed">{selectedDiet.weekPlan[selectedDay].snack1}</p>
                              </div>
                              
                              {/* Pranzo */}
                              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border-2 border-blue-200">
                                <div className="flex items-center gap-2 mb-3">
                                  <span className="text-2xl">☀️</span>
                                  <h4 className="font-medium text-blue-900">Pranzo</h4>
                                </div>
                                <p className="text-sm text-gray-800 leading-relaxed">{selectedDiet.weekPlan[selectedDay].lunch}</p>
                              </div>
                              
                              {/* Spuntino 2 */}
                              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border-2 border-purple-200">
                                <div className="flex items-center gap-2 mb-3">
                                  <span className="text-2xl">🍪</span>
                                  <h4 className="font-medium text-purple-900">Spuntino Pomeriggio</h4>
                                </div>
                                <p className="text-sm text-gray-800 leading-relaxed">{selectedDiet.weekPlan[selectedDay].snack2}</p>
                              </div>
                              
                              {/* Cena */}
                              <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-4 border-2 border-indigo-200 col-span-2">
                                <div className="flex items-center gap-2 mb-3">
                                  <span className="text-2xl">🌙</span>
                                  <h4 className="font-medium text-indigo-900">Cena</h4>
                                </div>
                                <p className="text-sm text-gray-800 leading-relaxed">{selectedDiet.weekPlan[selectedDay].dinner}</p>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </TabsContent>

                  {/* TAB 2: BENEFICI & SCIENZA */}
                  <TabsContent value="benefits" className="space-y-4 h-full">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-300">
                        <h4 className="mb-3 flex items-center gap-2">
                          <Heart className="w-5 h-5 text-green-600" />
                          Benefici Principali
                        </h4>
                        <div className="space-y-2">
                          {selectedDiet.benefits.map((benefit, idx) => (
                            <div key={idx} className="flex items-start gap-2">
                              <span className="text-green-600">✓</span>
                              <p className="text-sm text-gray-800">{benefit}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-300">
                        <h4 className="mb-3 flex items-center gap-2">
                          <Brain className="w-5 h-5 text-blue-600" />
                          Base Scientifica
                        </h4>
                        <div className="space-y-2">
                          {selectedDiet.scientificBasis.map((fact, idx) => (
                            <div key={idx} className="flex items-start gap-2">
                              <span className="text-blue-600">📊</span>
                              <p className="text-sm text-gray-800">{fact}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-gradient-to-br from-red-50 to-red-100 rounded-lg border border-red-300">
                      <h4 className="mb-3">⚠️ Attenzioni Importanti</h4>
                      <div className="grid grid-cols-2 gap-3">
                        {selectedDiet.warnings.map((warn, idx) => (
                          <div key={idx} className="flex items-start gap-2">
                            <span className="text-red-600 flex-shrink-0">•</span>
                            <p className="text-sm text-red-800">{warn}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>

                  {/* TAB 3: INTEGRATORI */}
                  <TabsContent value="supplements" className="space-y-4 h-full">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg border border-yellow-300">
                        <h4 className="mb-3">💊 Integratori Consigliati</h4>
                        <div className="space-y-2">
                          {selectedDiet.supplements.map((supp, idx) => (
                            <div key={idx} className="flex items-start gap-2">
                              <span className="text-yellow-600">✓</span>
                              <p className="text-sm text-gray-800">{supp}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-300">
                        <h4 className="mb-3">🔬 Focus Micronutrienti</h4>
                        
                        <div className="space-y-3">
                          <div>
                            <p className="text-sm text-purple-700 mb-2">Focus Principali:</p>
                            <div className="flex flex-wrap gap-1">
                              {selectedDiet.micronutrients.focus.map((item, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs bg-purple-100">
                                  {item}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          <div>
                            <p className="text-sm text-red-700 mb-2">Rischio Carenze:</p>
                            <ul className="space-y-1">
                              {selectedDiet.micronutrients.deficiencyRisk.map((risk, idx) => (
                                <li key={idx} className="text-sm text-gray-800">• {risk}</li>
                              ))}
                            </ul>
                          </div>

                          <div>
                            <p className="text-sm text-green-700 mb-2">Soluzioni:</p>
                            <ul className="space-y-1">
                              {selectedDiet.micronutrients.solutions.map((sol, idx) => (
                                <li key={idx} className="text-sm text-gray-800">✓ {sol}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  {/* TAB 4: CONSIGLI */}
                  <TabsContent value="tips" className="space-y-4 h-full">
                    <div className="p-4 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg border border-indigo-300">
                      <h4 className="mb-3">💡 Consigli Pratici</h4>
                      <div className="grid grid-cols-2 gap-3">
                        {selectedDiet.tips.map((tip, idx) => (
                          <div key={idx} className="flex items-start gap-2 bg-white p-2 rounded">
                            <span className="text-indigo-600">→</span>
                            <p className="text-sm text-gray-800">{tip}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="p-4 bg-gradient-to-r from-orange-50 to-pink-100 rounded-lg border border-orange-300">
                      <h4 className="mb-3">🎯 Adatta per:</h4>
                      <div className="space-y-2">
                        {selectedDiet.suitableFor.bodyTypes && (
                          <div>
                            <span className="text-sm text-gray-600">Corporatura: </span>
                            <span className="text-sm">{selectedDiet.suitableFor.bodyTypes.join(', ')}</span>
                          </div>
                        )}
                        {selectedDiet.suitableFor.goals && (
                          <div>
                            <span className="text-sm text-gray-600">Obiettivi: </span>
                            <span className="text-sm">{selectedDiet.suitableFor.goals.join(', ')}</span>
                          </div>
                        )}
                        {selectedDiet.suitableFor.excludes && (
                          <div>
                            <span className="text-sm text-gray-600">Esclude: </span>
                            <span className="text-sm">{selectedDiet.suitableFor.excludes.join(', ')}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </TabsContent>
                </>
              )}
            </ScrollArea>
          </Tabs>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
