import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Checkbox } from './ui/checkbox';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, Flame, ShoppingCart, ChefHat, Info } from 'lucide-react';
import { recipesDatabase } from '../data/recipesDatabase';
import { foodDatabase } from '../data/foodDatabase';

interface DayMeal {
  breakfast: string;
  snack1: string;
  lunch: string;
  snack2: string;
  dinner: string;
  calories: number;
}

interface DietPlan {
  id: string;
  name: string;
  weekPlan: {
    [key: string]: DayMeal;
  };
}

interface WeeklyCalendarProps {
  selectedDiet?: DietPlan | null;
}

const weekDays = ['Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato', 'Domenica'];

// Helper function fuori dal componente per evitare problemi di dipendenze
const getTodayName = () => {
  const today = new Date().getDay();
  const dayIndex = today === 0 ? 6 : today - 1; // Convert Sunday=0 to 6, Monday=1 to 0, etc.
  return weekDays[dayIndex];
};

export function WeeklyCalendar({ selectedDiet }: WeeklyCalendarProps) {
  const [weekOffset, setWeekOffset] = useState(0);
  const [calendarSelectedDay, setCalendarSelectedDay] = useState<string>(getTodayName());
  const [selectedMeal, setSelectedMeal] = useState<{
    type: 'breakfast' | 'lunch' | 'dinner';
    name: string;
    content: string;
  } | null>(null);

  const getCurrentWeekDates = () => {
    const today = new Date();
    const currentDay = today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() - (currentDay === 0 ? 6 : currentDay - 1) + (weekOffset * 7));
    
    return weekDays.map((_, index) => {
      const date = new Date(monday);
      date.setDate(monday.getDate() + index);
      return date;
    });
  };

  const dates = getCurrentWeekDates();
  const isCurrentWeek = weekOffset === 0;

  // Quando cambia settimana, resetta al giorno appropriato
  useEffect(() => {
    if (isCurrentWeek) {
      setCalendarSelectedDay(getTodayName());
    } else {
      setCalendarSelectedDay('Lunedì');
    }
  }, [weekOffset, isCurrentWeek]);

  // Debug: verifica che selectedDiet sia valido
  useEffect(() => {
    if (selectedDiet) {
      console.log('📅 WeeklyCalendar ricevuto dieta:', selectedDiet.name);
      console.log('📅 WeekPlan keys:', Object.keys(selectedDiet.weekPlan || {}));
      console.log('📅 Giorno selezionato:', calendarSelectedDay);
      console.log('📅 Dati giorno:', selectedDiet.weekPlan?.[calendarSelectedDay]);
    }
  }, [selectedDiet, calendarSelectedDay]);

  return (
    <>
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-blue-600" />
            <div>
              <h2>Calendario Settimanale</h2>
              {selectedDiet && (
                <p className="text-xs text-gray-600">Dieta: {selectedDiet.name}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setWeekOffset(prev => prev - 1)}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm px-2">
              {dates[0].toLocaleDateString('it-IT', { day: 'numeric', month: 'short' })} - {dates[6].toLocaleDateString('it-IT', { day: 'numeric', month: 'short' })}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setWeekOffset(prev => prev + 1)}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {!selectedDiet && (
          <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
            <CalendarIcon className="w-12 h-12 mx-auto text-gray-400 mb-3" />
            <p className="text-sm text-gray-600 mb-1">Nessuna dieta selezionata</p>
            <p className="text-xs text-gray-500">
              Scegli una dieta personalizzata per vedere i pasti della settimana
            </p>
          </div>
        )}

        {/* Days Grid con preview pasti */}
        {selectedDiet && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {weekDays.map((day, index) => {
              const date = dates[index];
              const isToday = isCurrentWeek && new Date().getDay() === (index + 1) % 7;
              const dayPlan = selectedDiet.weekPlan[day];
              
              return (
                <div
                  key={day}
                  onClick={() => {
                    setCalendarSelectedDay(day);
                  }}
                  className={`p-3 rounded-lg border-2 transition-all cursor-pointer hover:border-blue-400 ${
                    calendarSelectedDay === day
                      ? 'bg-orange-50 border-orange-400 shadow-md'
                      : isToday
                      ? 'bg-blue-50 border-blue-400 shadow-md'
                      : 'bg-white border-gray-200 hover:shadow-sm'
                  }`}
                >
                  <div className="text-center mb-2">
                    <div className="text-xs text-gray-600">{day.substring(0, 3)}</div>
                    <div className={`text-lg ${isToday ? '' : ''}`}>
                      {date.getDate()}
                    </div>
                    {isToday && (
                      <Badge variant="default" className="text-xs mt-1 bg-blue-600">
                        Oggi
                      </Badge>
                    )}
                  </div>

                  {dayPlan && (
                    <div className="space-y-1.5 mt-3">
                      
                      
                      
                      
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Pasti del giorno selezionato */}
        {selectedDiet && selectedDiet.weekPlan[calendarSelectedDay] && (
          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="flex items-center gap-2">
                <span className="text-orange-600">🍽️</span>
                Pasti di {calendarSelectedDay}
              </h3>
              <Badge variant="outline" className="text-sm">
                {selectedDiet.weekPlan[calendarSelectedDay].calories} cal
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Colazione */}
              <div 
                onClick={() => setSelectedMeal({
                  type: 'breakfast',
                  name: 'Colazione',
                  content: selectedDiet.weekPlan[calendarSelectedDay].breakfast
                })}
                className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl border-2 border-orange-200 px-[11px] py-[16px] m-[0px] cursor-pointer transition-all hover:shadow-lg hover:border-orange-400 hover:scale-[1.02]"
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">🌅</span>
                  <h4 className="font-medium text-orange-900">Colazione</h4>
                </div>
                <p className="text-sm text-gray-800 leading-relaxed">
                  {selectedDiet.weekPlan[calendarSelectedDay].breakfast}
                </p>
              </div>

              {/* Pranzo */}
              <div 
                onClick={() => setSelectedMeal({
                  type: 'lunch',
                  name: 'Pranzo',
                  content: selectedDiet.weekPlan[calendarSelectedDay].lunch
                })}
                className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border-2 border-blue-200 cursor-pointer transition-all hover:shadow-lg hover:border-blue-400 hover:scale-[1.02]"
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">☀️</span>
                  <h4 className="font-medium text-blue-900">Pranzo</h4>
                </div>
                <p className="text-sm text-gray-800 leading-relaxed">
                  {selectedDiet.weekPlan[calendarSelectedDay].lunch}
                </p>
              </div>

              {/* Cena */}
              <div 
                onClick={() => setSelectedMeal({
                  type: 'dinner',
                  name: 'Cena',
                  content: selectedDiet.weekPlan[calendarSelectedDay].dinner
                })}
                className="p-4 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl border-2 border-indigo-200 cursor-pointer transition-all hover:shadow-lg hover:border-indigo-400 hover:scale-[1.02]"
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">🌙</span>
                  <h4 className="font-medium text-indigo-900">Cena</h4>
                </div>
                <p className="text-sm text-gray-800 leading-relaxed">
                  {selectedDiet.weekPlan[calendarSelectedDay].dinner}
                </p>
              </div>
            </div>

            <div className="p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
              <p className="text-xs text-blue-800">
                💡 Clicca su un giorno nel calendario per vedere i pasti, oppure clicca su una card pasto per dettagli completi
              </p>
            </div>
          </div>
        )}
      </Card>

      {/* Dialog Dettagli Pasto - FORMATO LANDSCAPE */}
      <Dialog open={!!selectedMeal} onOpenChange={(open) => !open && setSelectedMeal(null)}>
        <DialogContent className="!max-w-[95vw] !w-[1800px] !h-[85vh] !min-h-[700px] overflow-hidden flex flex-col p-6">
          <DialogHeader className="pb-4">
            <DialogTitle className="flex items-center gap-3">
              <span className="text-3xl">
                {selectedMeal?.type === 'breakfast' && '🌅'}
                {selectedMeal?.type === 'lunch' && '☀️'}
                {selectedMeal?.type === 'dinner' && '🌙'}
              </span>
              <div>
                <div className="text-xl">{selectedMeal?.name} - {calendarSelectedDay}</div>
                <div className="text-xs text-gray-600 mt-1">{selectedDiet?.name} - Piano dettagliato del pasto</div>
              </div>
            </DialogTitle>
          </DialogHeader>

          {selectedMeal && (
            <ScrollArea className="flex-1 pr-4">
              {/* LAYOUT A 3 COLONNE - FORMATO LANDSCAPE */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-4">
                
                {/* COLONNA SINISTRA - Descrizione e Info Pasto */}
                <div className="space-y-4">
                  {/* Descrizione */}
                  <div className={`p-5 rounded-xl border-2 ${
                    selectedMeal.type === 'breakfast' ? 'bg-orange-50 border-orange-200' :
                    selectedMeal.type === 'lunch' ? 'bg-blue-50 border-blue-200' :
                    'bg-indigo-50 border-indigo-200'
                  }`}>
                    <div className="flex items-center gap-2 mb-3">
                      <Info className="w-4 h-4" />
                      <h4 className="text-sm">Descrizione</h4>
                    </div>
                    <p className="text-xs leading-relaxed text-gray-800 whitespace-pre-line">
                      {selectedMeal.content}
                    </p>
                  </div>

                  {/* Info Rapide */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
                      <div className="flex items-center gap-2 mb-1">
                        <Clock className="w-3 h-3" />
                        <h5 className="text-xs">Orario</h5>
                      </div>
                      <p className="text-xs text-gray-700">
                        {selectedMeal.type === 'breakfast' && '7:00 - 9:00'}
                        {selectedMeal.type === 'lunch' && '12:00 - 14:00'}
                        {selectedMeal.type === 'dinner' && '19:00 - 21:00'}
                      </p>
                    </div>

                    <div className="p-3 bg-gradient-to-br from-red-50 to-red-100 rounded-lg border border-red-200">
                      <div className="flex items-center gap-2 mb-1">
                        <Flame className="w-3 h-3" />
                        <h5 className="text-xs">Calorie</h5>
                      </div>
                      <p className="text-xs text-gray-700">
                        {selectedMeal.type === 'breakfast' && '300-450 kcal'}
                        {selectedMeal.type === 'lunch' && '500-700 kcal'}
                        {selectedMeal.type === 'dinner' && '400-600 kcal'}
                      </p>
                    </div>
                  </div>

                  {/* Valori Nutrizionali Stimati */}
                  <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                    <h4 className="text-sm mb-3 flex items-center gap-2">
                      📊 Valori Nutrizionali Medi
                    </h4>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex justify-between p-2 bg-white rounded">
                        <span>Proteine:</span>
                        <span className="font-medium">
                          {selectedMeal.type === 'breakfast' && '15-20g'}
                          {selectedMeal.type === 'lunch' && '30-40g'}
                          {selectedMeal.type === 'dinner' && '25-35g'}
                        </span>
                      </div>
                      <div className="flex justify-between p-2 bg-white rounded">
                        <span>Carboidrati:</span>
                        <span className="font-medium">
                          {selectedMeal.type === 'breakfast' && '45-60g'}
                          {selectedMeal.type === 'lunch' && '60-80g'}
                          {selectedMeal.type === 'dinner' && '40-55g'}
                        </span>
                      </div>
                      <div className="flex justify-between p-2 bg-white rounded">
                        <span>Grassi:</span>
                        <span className="font-medium">
                          {selectedMeal.type === 'breakfast' && '8-12g'}
                          {selectedMeal.type === 'lunch' && '15-20g'}
                          {selectedMeal.type === 'dinner' && '12-18g'}
                        </span>
                      </div>
                      <div className="flex justify-between p-2 bg-white rounded">
                        <span>Fibre:</span>
                        <span className="font-medium">
                          {selectedMeal.type === 'breakfast' && '5-8g'}
                          {selectedMeal.type === 'lunch' && '8-12g'}
                          {selectedMeal.type === 'dinner' && '6-10g'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Consigli */}
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">💡</span>
                      <h4 className="text-sm">Consigli</h4>
                    </div>
                    <ul className="text-xs text-gray-700 space-y-1.5">
                      {selectedMeal.type === 'breakfast' && (
                        <>
                          <li>• Bevi acqua prima di mangiare</li>
                          <li>• Pasto più importante del giorno</li>
                          <li>• Prenditi 15-20 minuti</li>
                        </>
                      )}
                      {selectedMeal.type === 'lunch' && (
                        <>
                          <li>• Mastica lentamente</li>
                          <li>• Non bere troppo durante</li>
                          <li>• Passeggiata dopo pranzo</li>
                        </>
                      )}
                      {selectedMeal.type === 'dinner' && (
                        <>
                          <li>• 2-3 ore prima di dormire</li>
                          <li>• Preferisci piatti leggeri</li>
                          <li>• Limita il sale</li>
                        </>
                      )}
                    </ul>
                  </div>

                  {/* Badge */}
                  <div className="flex gap-2 flex-wrap">
                    
                    
                  </div>
                </div>

                {/* COLONNA CENTRALE - Ingredienti con Checkbox */}
                <div className="space-y-4">
                  <div className="p-5 bg-gradient-to-br from-yellow-50 to-amber-50 rounded-xl border-2 border-yellow-200">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-sm flex items-center gap-2">
                        🛒 Ingredienti Necessari
                      </h4>
                      <Button size="sm" variant="outline" className="text-xs h-7">
                        <ShoppingCart className="w-3 h-3 mr-1" />
                        Aggiungi Tutti
                      </Button>
                    </div>

                    <ScrollArea className="h-[calc(85vh-260px)]">
                      <div className="space-y-3 pr-3">
                        {/* Esempio ingredienti generici - in futuro collegati al DB */}
                        {selectedMeal.type === 'breakfast' && [
                          { name: 'Latte', qty: '200ml', category: 'Latticini' },
                          { name: 'Cereali integrali', qty: '40g', category: 'Cereali' },
                          { name: 'Frutta fresca', qty: '150g', category: 'Frutta' },
                          { name: 'Miele', qty: '1 cucchiaino', category: 'Dolcificanti' },
                          { name: 'Yogurt greco', qty: '100g', category: 'Latticini' },
                          { name: 'Noci', qty: '20g', category: 'Frutta Secca' },
                        ].map((ing, i) => (
                          <div key={i} className="flex items-start gap-3 p-3 bg-white rounded-lg border border-yellow-200 hover:shadow-sm transition-all">
                            <Checkbox id={`ing-${i}`} className="mt-1" />
                            <div className="flex-1">
                              <label htmlFor={`ing-${i}`} className="text-xs cursor-pointer block">
                                <span className="font-medium text-gray-800">{ing.name}</span>
                                <span className="text-gray-600 ml-2">({ing.qty})</span>
                              </label>
                              <Badge variant="secondary" className="text-[10px] mt-1">
                                {ing.category}
                              </Badge>
                            </div>
                          </div>
                        ))}

                        {selectedMeal.type === 'lunch' && [
                          { name: 'Pasta integrale', qty: '80g', category: 'Pasta' },
                          { name: 'Pomodori pelati', qty: '200g', category: 'Verdure' },
                          { name: 'Basilico fresco', qty: '10 foglie', category: 'Erbe' },
                          { name: 'Olio EVO', qty: '2 cucchiai', category: 'Condimenti' },
                          { name: 'Parmigiano', qty: '30g', category: 'Formaggi' },
                          { name: 'Aglio', qty: '2 spicchi', category: 'Aromi' },
                          { name: 'Zucchine', qty: '150g', category: 'Verdure' },
                          { name: 'Peperoni', qty: '100g', category: 'Verdure' },
                        ].map((ing, i) => (
                          <div key={i} className="flex items-start gap-3 p-3 bg-white rounded-lg border border-blue-200 hover:shadow-sm transition-all">
                            <Checkbox id={`ing-${i}`} className="mt-1" />
                            <div className="flex-1">
                              <label htmlFor={`ing-${i}`} className="text-xs cursor-pointer block">
                                <span className="font-medium text-gray-800">{ing.name}</span>
                                <span className="text-gray-600 ml-2">({ing.qty})</span>
                              </label>
                              <Badge variant="secondary" className="text-[10px] mt-1">
                                {ing.category}
                              </Badge>
                            </div>
                          </div>
                        ))}

                        {selectedMeal.type === 'dinner' && [
                          { name: 'Petto di pollo', qty: '150g', category: 'Proteine' },
                          { name: 'Insalata mista', qty: '100g', category: 'Verdure' },
                          { name: 'Patate', qty: '200g', category: 'Tuberi' },
                          { name: 'Carote', qty: '80g', category: 'Verdure' },
                          { name: 'Limone', qty: '1', category: 'Agrumi' },
                          { name: 'Rosmarino', qty: '2 rametti', category: 'Erbe' },
                          { name: 'Sale rosa', qty: 'q.b.', category: 'Condimenti' },
                          { name: 'Pepe nero', qty: 'q.b.', category: 'Spezie' },
                        ].map((ing, i) => (
                          <div key={i} className="flex items-start gap-3 p-3 bg-white rounded-lg border border-indigo-200 hover:shadow-sm transition-all">
                            <Checkbox id={`ing-${i}`} className="mt-1" />
                            <div className="flex-1">
                              <label htmlFor={`ing-${i}`} className="text-xs cursor-pointer block">
                                <span className="font-medium text-gray-800">{ing.name}</span>
                                <span className="text-gray-600 ml-2">({ing.qty})</span>
                              </label>
                              <Badge variant="secondary" className="text-[10px] mt-1">
                                {ing.category}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>

                    <Separator className="my-3" />
                    
                    <Button variant="default" className="w-full text-xs" size="sm">
                      <ShoppingCart className="w-3 h-3 mr-2" />
                      Aggiungi Selezionati alla Lista Spesa
                    </Button>
                  </div>
                </div>

                {/* COLONNA DESTRA - Ricette Correlate */}
                <div className="space-y-4">
                  <div className="p-5 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border-2 border-green-200">
                    <div className="flex items-center gap-2 mb-4">
                      <ChefHat className="w-4 h-4" />
                      <h4 className="text-sm">Ricette Consigliate</h4>
                    </div>

                    <ScrollArea className="h-[calc(85vh-200px)]">
                      <div className="space-y-3 pr-3">
                        {/* Filtra ricette dal database in base al tipo di pasto */}
                        {recipesDatabase
                          .filter(recipe => {
                            if (selectedMeal.type === 'breakfast') return recipe.category === 'colazione';
                            if (selectedMeal.type === 'lunch') return ['primo', 'secondo'].includes(recipe.category);
                            if (selectedMeal.type === 'dinner') return ['primo', 'secondo', 'contorno'].includes(recipe.category);
                            return false;
                          })
                          .slice(0, 6)
                          .map((recipe) => (
                            <div key={recipe.id} className="p-4 bg-white rounded-lg border border-green-200 hover:shadow-md transition-all cursor-pointer">
                              <div className="flex items-start gap-3">
                                <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-yellow-100 rounded-lg flex items-center justify-center text-2xl">
                                  {recipe.category === 'primo' && '🍝'}
                                  {recipe.category === 'secondo' && '🍗'}
                                  {recipe.category === 'contorno' && '🥗'}
                                  {recipe.category === 'colazione' && '🥐'}
                                  {recipe.category === 'dolce' && '🍰'}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h5 className="text-xs font-medium text-gray-900 mb-1 truncate">
                                    {recipe.name}
                                  </h5>
                                  <p className="text-[11px] text-gray-600 line-clamp-2 mb-2">
                                    {recipe.description}
                                  </p>
                                  <div className="flex gap-1.5 flex-wrap">
                                    <Badge variant="outline" className="text-[10px]">
                                      {recipe.difficulty}
                                    </Badge>
                                    <Badge variant="outline" className="text-[10px]">
                                      ⏱️ {recipe.prepTime + recipe.cookTime} min
                                    </Badge>
                                    <Badge variant="outline" className="text-[10px]">
                                      👥 {recipe.servings}
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                              
                              <Separator className="my-3" />
                              
                              {/* Istruzioni mini */}
                              <div className="space-y-1">
                                <h6 className="text-[11px] font-medium text-gray-700 mb-1.5">📝 Procedimento:</h6>
                                <ol className="text-[10px] text-gray-600 space-y-1 pl-3">
                                  {recipe.instructions.slice(0, 3).map((step, idx) => (
                                    <li key={idx} className="list-decimal">{step}</li>
                                  ))}
                                  {recipe.instructions.length > 3 && (
                                    <li className="text-blue-600">+ altre {recipe.instructions.length - 3} operazioni...</li>
                                  )}
                                </ol>
                              </div>

                              <Button variant="ghost" size="sm" className="w-full mt-3 h-7 text-xs">
                                Vedi Ricetta Completa →
                              </Button>
                            </div>
                          ))}

                        {/* Se non ci sono ricette */}
                        {recipesDatabase.filter(recipe => {
                          if (selectedMeal.type === 'breakfast') return recipe.category === 'colazione';
                          if (selectedMeal.type === 'lunch') return ['primo', 'secondo'].includes(recipe.category);
                          if (selectedMeal.type === 'dinner') return ['primo', 'secondo', 'contorno'].includes(recipe.category);
                          return false;
                        }).length === 0 && (
                          <div className="text-center py-8">
                            <p className="text-xs text-gray-500">Nessuna ricetta disponibile per questo pasto</p>
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                  </div>
                </div>

              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
