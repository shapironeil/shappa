import { useState, useRef, useEffect } from 'react';
import { PersonalCard } from './components/PersonalCard';
import { DietProposals } from './components/DietProposals';
import { WeightCaloriesTracker } from './components/WeightCaloriesTracker';
import { WeeklyCalendar } from './components/WeeklyCalendar';
import { DinnerAlternatives } from './components/DinnerAlternatives';
import { UrgentItems } from './components/UrgentItems';
import { DebugPanel } from './components/DebugPanel';
import { Toaster } from './components/ui/sonner';
import { Apple } from 'lucide-react';

interface UserProfile {
  bodyType: string;
  allergies: string[];
  excludeFromDiet: string[];
  healthIssues: string[];
  dietaryPreference: string;
}

interface DietPlan {
  id: string;
  name: string;
  weekPlan: {
    [key: string]: {
      breakfast: string;
      snack1: string;
      lunch: string;
      snack2: string;
      dinner: string;
      calories: number;
    };
  };
}

export default function App() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [selectedDiet, setSelectedDiet] = useState<DietPlan | null>(null);
  const [availableIngredients, setAvailableIngredients] = useState<string[]>([]);
  const addToShoppingListRef = useRef<((foodIds: string[]) => void) | null>(null);

  // Carica dieta salvata al mount
  useEffect(() => {
    const savedDiet = localStorage.getItem('selected_diet');
    if (savedDiet) {
      try {
        const parsed = JSON.parse(savedDiet);
        console.log('📊 Dieta caricata da localStorage:', parsed.name);
        setSelectedDiet(parsed);
      } catch (e) {
        console.error('❌ Error loading saved diet:', e);
        localStorage.removeItem('selected_diet'); // Rimuovi dato corrotto
      }
    }
  }, []);

  const handleAddToShoppingList = (foodIds: string[]) => {
    if (addToShoppingListRef.current) {
      addToShoppingListRef.current(foodIds);
    }
  };

  const registerShoppingListFunction = (fn: (foodIds: string[]) => void) => {
    addToShoppingListRef.current = fn;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-3">
            
            <div>
              <h1 className="text-2xl">Cookin'Shappa</h1>
              <p className="text-sm text-gray-600">Pianifica la tua alimentazione settimanale</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Weekly Calendar */}
            <WeeklyCalendar selectedDiet={selectedDiet} />

            {/* Dinner Alternatives */}
            <DinnerAlternatives 
              availableIngredients={availableIngredients}
              onAddToShoppingList={handleAddToShoppingList}
            />

            {/* Weight & Calories Tracker */}
            <WeightCaloriesTracker />
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Personal Card */}
            <PersonalCard 
              userProfile={userProfile}
              onProfileUpdate={setUserProfile}
            />

            {/* Urgent Items & Fridge */}
            <UrgentItems 
              onIngredientsChange={setAvailableIngredients}
              onShoppingListChange={registerShoppingListFunction}
            />

            {/* Diet Proposals */}
            <DietProposals 
              userProfile={userProfile}
              onDietSelected={(diet) => setSelectedDiet(diet)}
            />
          </div>
        </div>
      </main>
      <Toaster />
      <DebugPanel />
    </div>
  );
}
