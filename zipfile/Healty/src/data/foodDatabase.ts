// Database completo di alimenti con valori nutrizionali per 100g

export interface FoodItem {
  id: string;
  name: string;
  category: 'proteina' | 'carboidrato' | 'verdura' | 'frutta' | 'latticino' | 'grasso' | 'condimento' | 'bevanda';
  calories: number;
  protein: number; // grammi
  carbs: number; // grammi
  fat: number; // grammi
  fiber: number; // grammi
  allergens: string[];
  unit: 'g' | 'ml' | 'pz';
  typicalServing: number; // quantità tipica in grammi/ml
}

export const foodDatabase: FoodItem[] = [
  // PROTEINE - Carni
  { id: 'pollo', name: 'Petto di pollo', category: 'proteina', calories: 165, protein: 31, carbs: 0, fat: 3.6, fiber: 0, allergens: [], unit: 'g', typicalServing: 150 },
  { id: 'tacchino', name: 'Fesa di tacchino', category: 'proteina', calories: 135, protein: 30, carbs: 0, fat: 1, fiber: 0, allergens: [], unit: 'g', typicalServing: 150 },
  { id: 'manzo', name: 'Manzo magro', category: 'proteina', calories: 250, protein: 26, carbs: 0, fat: 15, fiber: 0, allergens: [], unit: 'g', typicalServing: 120 },
  { id: 'vitello', name: 'Vitello', category: 'proteina', calories: 172, protein: 31, carbs: 0, fat: 4.6, fiber: 0, allergens: [], unit: 'g', typicalServing: 120 },
  
  // PROTEINE - Pesce
  { id: 'salmone', name: 'Salmone', category: 'proteina', calories: 208, protein: 20, carbs: 0, fat: 13, fiber: 0, allergens: ['Pesce'], unit: 'g', typicalServing: 150 },
  { id: 'tonno', name: 'Tonno fresco', category: 'proteina', calories: 144, protein: 23, carbs: 0, fat: 5, fiber: 0, allergens: ['Pesce'], unit: 'g', typicalServing: 150 },
  { id: 'orata', name: 'Orata', category: 'proteina', calories: 121, protein: 20, carbs: 0, fat: 4, fiber: 0, allergens: ['Pesce'], unit: 'g', typicalServing: 150 },
  { id: 'branzino', name: 'Branzino', category: 'proteina', calories: 97, protein: 18, carbs: 0, fat: 2.5, fiber: 0, allergens: ['Pesce'], unit: 'g', typicalServing: 150 },
  { id: 'merluzzo', name: 'Merluzzo', category: 'proteina', calories: 82, protein: 18, carbs: 0, fat: 0.7, fiber: 0, allergens: ['Pesce'], unit: 'g', typicalServing: 150 },
  { id: 'gamberi', name: 'Gamberi', category: 'proteina', calories: 99, protein: 24, carbs: 0, fat: 0.3, fiber: 0, allergens: ['Crostacei'], unit: 'g', typicalServing: 120 },
  
  // PROTEINE - Uova e Latticini
  { id: 'uova', name: 'Uova', category: 'proteina', calories: 155, protein: 13, carbs: 1.1, fat: 11, fiber: 0, allergens: ['Uova'], unit: 'pz', typicalServing: 2 },
  { id: 'yogurt-greco', name: 'Yogurt greco 0%', category: 'latticino', calories: 59, protein: 10, carbs: 3.6, fat: 0.4, fiber: 0, allergens: ['Lattosio'], unit: 'g', typicalServing: 150 },
  { id: 'ricotta', name: 'Ricotta vaccina', category: 'latticino', calories: 146, protein: 11, carbs: 3, fat: 10, fiber: 0, allergens: ['Lattosio'], unit: 'g', typicalServing: 100 },
  { id: 'parmigiano', name: 'Parmigiano Reggiano', category: 'latticino', calories: 431, protein: 33, carbs: 3.7, fat: 30, fiber: 0, allergens: ['Lattosio'], unit: 'g', typicalServing: 30 },
  { id: 'mozzarella', name: 'Mozzarella', category: 'latticino', calories: 280, protein: 18, carbs: 2.2, fat: 23, fiber: 0, allergens: ['Lattosio'], unit: 'g', typicalServing: 100 },
  
  // CARBOIDRATI - Pasta e Riso
  { id: 'pasta', name: 'Pasta integrale', category: 'carboidrato', calories: 348, protein: 13, carbs: 71, fat: 2.5, fiber: 8, allergens: ['Glutine'], unit: 'g', typicalServing: 80 },
  { id: 'riso-basmati', name: 'Riso basmati', category: 'carboidrato', calories: 356, protein: 8, carbs: 78, fat: 1, fiber: 1.3, allergens: [], unit: 'g', typicalServing: 80 },
  { id: 'riso-integrale', name: 'Riso integrale', category: 'carboidrato', calories: 362, protein: 7.5, carbs: 77, fat: 2.7, fiber: 3.5, allergens: [], unit: 'g', typicalServing: 80 },
  { id: 'quinoa', name: 'Quinoa', category: 'carboidrato', calories: 368, protein: 14, carbs: 64, fat: 6, fiber: 7, allergens: [], unit: 'g', typicalServing: 60 },
  { id: 'farro', name: 'Farro', category: 'carboidrato', calories: 335, protein: 15, carbs: 67, fat: 2.5, fiber: 7.5, allergens: ['Glutine'], unit: 'g', typicalServing: 70 },
  
  // CARBOIDRATI - Pane e Cereali
  { id: 'pane-integrale', name: 'Pane integrale', category: 'carboidrato', calories: 247, protein: 9, carbs: 49, fat: 3.5, fiber: 6.5, allergens: ['Glutine'], unit: 'g', typicalServing: 50 },
  { id: 'avena', name: 'Fiocchi d\'avena', category: 'carboidrato', calories: 389, protein: 17, carbs: 66, fat: 7, fiber: 10, allergens: ['Glutine'], unit: 'g', typicalServing: 50 },
  
  // CARBOIDRATI - Legumi
  { id: 'ceci', name: 'Ceci', category: 'proteina', calories: 364, protein: 19, carbs: 61, fat: 6, fiber: 17, allergens: [], unit: 'g', typicalServing: 80 },
  { id: 'lenticchie', name: 'Lenticchie', category: 'proteina', calories: 353, protein: 25, carbs: 63, fat: 1.1, fiber: 11, allergens: [], unit: 'g', typicalServing: 80 },
  { id: 'fagioli', name: 'Fagioli borlotti', category: 'proteina', calories: 335, protein: 23, carbs: 60, fat: 2, fiber: 17, allergens: [], unit: 'g', typicalServing: 80 },
  
  // VERDURE
  { id: 'spinaci', name: 'Spinaci', category: 'verdura', calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4, fiber: 2.2, allergens: [], unit: 'g', typicalServing: 200 },
  { id: 'broccoli', name: 'Broccoli', category: 'verdura', calories: 34, protein: 2.8, carbs: 7, fat: 0.4, fiber: 2.6, allergens: [], unit: 'g', typicalServing: 200 },
  { id: 'zucchine', name: 'Zucchine', category: 'verdura', calories: 17, protein: 1.2, carbs: 3.1, fat: 0.3, fiber: 1, allergens: [], unit: 'g', typicalServing: 200 },
  { id: 'pomodori', name: 'Pomodori', category: 'verdura', calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2, fiber: 1.2, allergens: [], unit: 'g', typicalServing: 150 },
  { id: 'melanzane', name: 'Melanzane', category: 'verdura', calories: 25, protein: 1, carbs: 6, fat: 0.2, fiber: 3, allergens: [], unit: 'g', typicalServing: 200 },
  { id: 'peperoni', name: 'Peperoni', category: 'verdura', calories: 31, protein: 1, carbs: 6, fat: 0.3, fiber: 2.1, allergens: [], unit: 'g', typicalServing: 150 },
  { id: 'carote', name: 'Carote', category: 'verdura', calories: 41, protein: 0.9, carbs: 10, fat: 0.2, fiber: 2.8, allergens: [], unit: 'g', typicalServing: 100 },
  { id: 'insalata', name: 'Insalata mista', category: 'verdura', calories: 15, protein: 1.4, carbs: 2.4, fat: 0.2, fiber: 1.5, allergens: [], unit: 'g', typicalServing: 100 },
  { id: 'asparagi', name: 'Asparagi', category: 'verdura', calories: 20, protein: 2.2, carbs: 3.9, fat: 0.1, fiber: 2.1, allergens: [], unit: 'g', typicalServing: 200 },
  { id: 'cavolfiore', name: 'Cavolfiore', category: 'verdura', calories: 25, protein: 1.9, carbs: 5, fat: 0.3, fiber: 2, allergens: [], unit: 'g', typicalServing: 200 },
  
  // FRUTTA
  { id: 'mela', name: 'Mela', category: 'frutta', calories: 52, protein: 0.3, carbs: 14, fat: 0.2, fiber: 2.4, allergens: [], unit: 'g', typicalServing: 150 },
  { id: 'banana', name: 'Banana', category: 'frutta', calories: 89, protein: 1.1, carbs: 23, fat: 0.3, fiber: 2.6, allergens: [], unit: 'g', typicalServing: 120 },
  { id: 'arancia', name: 'Arancia', category: 'frutta', calories: 47, protein: 0.9, carbs: 12, fat: 0.1, fiber: 2.4, allergens: [], unit: 'g', typicalServing: 150 },
  { id: 'kiwi', name: 'Kiwi', category: 'frutta', calories: 61, protein: 1.1, carbs: 15, fat: 0.5, fiber: 3, allergens: [], unit: 'g', typicalServing: 100 },
  { id: 'fragole', name: 'Fragole', category: 'frutta', calories: 32, protein: 0.7, carbs: 8, fat: 0.3, fiber: 2, allergens: [], unit: 'g', typicalServing: 150 },
  { id: 'mirtilli', name: 'Mirtilli', category: 'frutta', calories: 57, protein: 0.7, carbs: 14, fat: 0.3, fiber: 2.4, allergens: [], unit: 'g', typicalServing: 100 },
  { id: 'avocado', name: 'Avocado', category: 'grasso', calories: 160, protein: 2, carbs: 9, fat: 15, fiber: 7, allergens: [], unit: 'g', typicalServing: 80 },
  
  // GRASSI SANI
  { id: 'olio-oliva', name: 'Olio d\'oliva EVO', category: 'grasso', calories: 884, protein: 0, carbs: 0, fat: 100, fiber: 0, allergens: [], unit: 'ml', typicalServing: 10 },
  { id: 'mandorle', name: 'Mandorle', category: 'grasso', calories: 579, protein: 21, carbs: 22, fat: 50, fiber: 12, allergens: ['Frutta secca'], unit: 'g', typicalServing: 30 },
  { id: 'noci', name: 'Noci', category: 'grasso', calories: 654, protein: 15, carbs: 14, fat: 65, fiber: 7, allergens: ['Frutta secca'], unit: 'g', typicalServing: 30 },
  { id: 'semi-chia', name: 'Semi di chia', category: 'grasso', calories: 486, protein: 17, carbs: 42, fat: 31, fiber: 34, allergens: [], unit: 'g', typicalServing: 15 },
  
  // CONDIMENTI
  { id: 'sale', name: 'Sale', category: 'condimento', calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, allergens: [], unit: 'g', typicalServing: 5 },
  { id: 'pepe', name: 'Pepe nero', category: 'condimento', calories: 251, protein: 10, carbs: 64, fat: 3.3, fiber: 25, allergens: [], unit: 'g', typicalServing: 2 },
  { id: 'basilico', name: 'Basilico fresco', category: 'condimento', calories: 23, protein: 3.2, carbs: 2.7, fat: 0.6, fiber: 1.6, allergens: [], unit: 'g', typicalServing: 10 },
  { id: 'limone', name: 'Limone (succo)', category: 'condimento', calories: 29, protein: 1.1, carbs: 9, fat: 0.3, fiber: 2.8, allergens: [], unit: 'ml', typicalServing: 20 },
  { id: 'zafferano', name: 'Zafferano', category: 'condimento', calories: 310, protein: 11, carbs: 65, fat: 6, fiber: 3.9, allergens: [], unit: 'g', typicalServing: 0.1 },
  { id: 'burro', name: 'Burro', category: 'grasso', calories: 717, protein: 0.9, carbs: 0.1, fat: 81, fiber: 0, allergens: ['Lattosio'], unit: 'g', typicalServing: 10 },
  
  // BEVANDE
  { id: 'acqua', name: 'Acqua', category: 'bevanda', calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, allergens: [], unit: 'ml', typicalServing: 250 },
  { id: 'te-verde', name: 'Tè verde', category: 'bevanda', calories: 1, protein: 0, carbs: 0, fat: 0, fiber: 0, allergens: [], unit: 'ml', typicalServing: 200 },
  { id: 'latte-scremato', name: 'Latte scremato', category: 'bevanda', calories: 34, protein: 3.4, carbs: 5, fat: 0.1, fiber: 0, allergens: ['Lattosio'], unit: 'ml', typicalServing: 200 },
];

export function getFoodById(id: string): FoodItem | undefined {
  return foodDatabase.find(food => food.id === id);
}

export function searchFoods(query: string): FoodItem[] {
  const lowerQuery = query.toLowerCase();
  return foodDatabase.filter(food => 
    food.name.toLowerCase().includes(lowerQuery)
  );
}

export function getFoodsByCategory(category: FoodItem['category']): FoodItem[] {
  return foodDatabase.filter(food => food.category === category);
}

export function calculateNutrition(foodId: string, quantity: number): {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
} {
  const food = getFoodById(foodId);
  if (!food) return { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 };
  
  const multiplier = quantity / 100;
  return {
    calories: Math.round(food.calories * multiplier),
    protein: Math.round(food.protein * multiplier * 10) / 10,
    carbs: Math.round(food.carbs * multiplier * 10) / 10,
    fat: Math.round(food.fat * multiplier * 10) / 10,
    fiber: Math.round(food.fiber * multiplier * 10) / 10,
  };
}
