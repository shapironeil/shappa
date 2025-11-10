// Database ricette con ingredienti e istruzioni

export interface Recipe {
  id: string;
  name: string;
  description: string;
  difficulty: 'Facile' | 'Media' | 'Difficile';
  prepTime: number; // minuti
  cookTime: number; // minuti
  servings: number;
  category: 'primo' | 'secondo' | 'contorno' | 'dolce' | 'colazione';
  cuisine: 'italiana' | 'mediterranea' | 'asiatica' | 'internazionale';
  ingredients: {
    foodId: string;
    quantity: number;
    unit: string;
  }[];
  instructions: string[];
  tags: string[];
  imageUrl?: string;
}

export const recipesDatabase: Recipe[] = [
  {
    id: 'risotto-zafferano',
    name: 'Risotto allo Zafferano',
    description: 'Il classico risotto milanese cremoso e profumato',
    difficulty: 'Media',
    prepTime: 10,
    cookTime: 25,
    servings: 4,
    category: 'primo',
    cuisine: 'italiana',
    ingredients: [
      { foodId: 'riso-basmati', quantity: 320, unit: 'g' },
      { foodId: 'burro', quantity: 40, unit: 'g' },
      { foodId: 'parmigiano', quantity: 60, unit: 'g' },
      { foodId: 'zafferano', quantity: 0.2, unit: 'g' },
      { foodId: 'olio-oliva', quantity: 20, unit: 'ml' },
    ],
    instructions: [
      'Tostare il riso in una padella con un filo d\'olio',
      'Aggiungere il brodo vegetale poco alla volta',
      'Sciogliere lo zafferano in un po\' di brodo caldo',
      'A metà cottura aggiungere lo zafferano',
      'Mantecare con burro e parmigiano a fuoco spento',
      'Servire subito ben caldo'
    ],
    tags: ['cremoso', 'tradizionale', 'vegetariano']
  },
  {
    id: 'spaghetti-pomodoro',
    name: 'Spaghetti al Pomodoro',
    description: 'Un classico intramontabile della cucina italiana',
    difficulty: 'Facile',
    prepTime: 5,
    cookTime: 15,
    servings: 4,
    category: 'primo',
    cuisine: 'italiana',
    ingredients: [
      { foodId: 'pasta', quantity: 320, unit: 'g' },
      { foodId: 'pomodori', quantity: 500, unit: 'g' },
      { foodId: 'olio-oliva', quantity: 30, unit: 'ml' },
      { foodId: 'basilico', quantity: 20, unit: 'g' },
      { foodId: 'sale', quantity: 5, unit: 'g' },
    ],
    instructions: [
      'Portare a ebollizione l\'acqua salata per la pasta',
      'In una padella, scaldare l\'olio e aggiungere i pomodori',
      'Cuocere il sugo per 10 minuti',
      'Cuocere gli spaghetti al dente',
      'Saltare la pasta nel sugo',
      'Guarnire con basilico fresco'
    ],
    tags: ['veloce', 'economico', 'vegano']
  },
  {
    id: 'pasta-pesto',
    name: 'Pasta al Pesto Genovese',
    description: 'Pasta con il tradizionale pesto alla genovese',
    difficulty: 'Facile',
    prepTime: 15,
    cookTime: 12,
    servings: 4,
    category: 'primo',
    cuisine: 'italiana',
    ingredients: [
      { foodId: 'pasta', quantity: 320, unit: 'g' },
      { foodId: 'basilico', quantity: 50, unit: 'g' },
      { foodId: 'parmigiano', quantity: 40, unit: 'g' },
      { foodId: 'noci', quantity: 30, unit: 'g' },
      { foodId: 'olio-oliva', quantity: 80, unit: 'ml' },
    ],
    instructions: [
      'Frullare basilico, noci, parmigiano e olio fino a ottenere una crema',
      'Cuocere la pasta al dente',
      'Scolare e mantecare con il pesto',
      'Servire con una spolverata di parmigiano'
    ],
    tags: ['aromatico', 'estivo', 'vegetariano']
  },
  {
    id: 'pollo-limone',
    name: 'Pollo al Limone',
    description: 'Petto di pollo marinato al limone e erbe aromatiche',
    difficulty: 'Facile',
    prepTime: 20,
    cookTime: 20,
    servings: 4,
    category: 'secondo',
    cuisine: 'mediterranea',
    ingredients: [
      { foodId: 'pollo', quantity: 600, unit: 'g' },
      { foodId: 'limone', quantity: 80, unit: 'ml' },
      { foodId: 'olio-oliva', quantity: 30, unit: 'ml' },
      { foodId: 'sale', quantity: 5, unit: 'g' },
      { foodId: 'pepe', quantity: 2, unit: 'g' },
    ],
    instructions: [
      'Marinare il pollo con succo di limone, olio, sale e pepe per 15 minuti',
      'Scaldare una padella antiaderente',
      'Cuocere il pollo 7-8 minuti per lato',
      'Servire con il fondo di cottura'
    ],
    tags: ['proteico', 'leggero', 'gluten-free']
  },
  {
    id: 'salmone-forno',
    name: 'Salmone al Forno con Verdure',
    description: 'Trancio di salmone con verdure miste al forno',
    difficulty: 'Facile',
    prepTime: 15,
    cookTime: 25,
    servings: 4,
    category: 'secondo',
    cuisine: 'mediterranea',
    ingredients: [
      { foodId: 'salmone', quantity: 600, unit: 'g' },
      { foodId: 'zucchine', quantity: 300, unit: 'g' },
      { foodId: 'pomodori', quantity: 200, unit: 'g' },
      { foodId: 'olio-oliva', quantity: 30, unit: 'ml' },
      { foodId: 'limone', quantity: 40, unit: 'ml' },
    ],
    instructions: [
      'Preriscaldare il forno a 180°C',
      'Disporre il salmone e le verdure in una teglia',
      'Condire con olio, limone, sale e pepe',
      'Infornare per 20-25 minuti',
      'Servire caldo'
    ],
    tags: ['omega-3', 'salutare', 'completo']
  },
  {
    id: 'frittata-verdure',
    name: 'Frittata di Verdure',
    description: 'Frittata leggera con verdure di stagione',
    difficulty: 'Facile',
    prepTime: 10,
    cookTime: 15,
    servings: 4,
    category: 'secondo',
    cuisine: 'italiana',
    ingredients: [
      { foodId: 'uova', quantity: 6, unit: 'pz' },
      { foodId: 'zucchine', quantity: 200, unit: 'g' },
      { foodId: 'peperoni', quantity: 150, unit: 'g' },
      { foodId: 'olio-oliva', quantity: 20, unit: 'ml' },
      { foodId: 'parmigiano', quantity: 30, unit: 'g' },
    ],
    instructions: [
      'Tagliare le verdure a cubetti e saltarle in padella',
      'Sbattere le uova con sale, pepe e parmigiano',
      'Versare le uova sulle verdure',
      'Cuocere a fuoco medio coperto per 10 minuti',
      'Girare e cuocere l\'altro lato'
    ],
    tags: ['vegetariano', 'economico', 'versatile']
  },
  {
    id: 'insalata-quinoa',
    name: 'Insalata di Quinoa e Ceci',
    description: 'Piatto completo ricco di proteine vegetali',
    difficulty: 'Facile',
    prepTime: 15,
    cookTime: 20,
    servings: 4,
    category: 'primo',
    cuisine: 'internazionale',
    ingredients: [
      { foodId: 'quinoa', quantity: 240, unit: 'g' },
      { foodId: 'ceci', quantity: 200, unit: 'g' },
      { foodId: 'pomodori', quantity: 200, unit: 'g' },
      { foodId: 'avocado', quantity: 160, unit: 'g' },
      { foodId: 'olio-oliva', quantity: 40, unit: 'ml' },
      { foodId: 'limone', quantity: 30, unit: 'ml' },
    ],
    instructions: [
      'Cuocere la quinoa secondo le istruzioni',
      'Far raffreddare completamente',
      'Mescolare con ceci, pomodori a cubetti e avocado',
      'Condire con olio, limone, sale e pepe',
      'Servire fredda'
    ],
    tags: ['vegano', 'proteico', 'fresco']
  },
  {
    id: 'bowl-yogurt',
    name: 'Bowl di Yogurt Greco',
    description: 'Colazione proteica con yogurt, frutta e semi',
    difficulty: 'Facile',
    prepTime: 5,
    cookTime: 0,
    servings: 1,
    category: 'colazione',
    cuisine: 'internazionale',
    ingredients: [
      { foodId: 'yogurt-greco', quantity: 200, unit: 'g' },
      { foodId: 'avena', quantity: 40, unit: 'g' },
      { foodId: 'mirtilli', quantity: 80, unit: 'g' },
      { foodId: 'noci', quantity: 20, unit: 'g' },
      { foodId: 'semi-chia', quantity: 10, unit: 'g' },
    ],
    instructions: [
      'Versare lo yogurt in una bowl',
      'Aggiungere l\'avena',
      'Guarnire con mirtilli, noci e semi di chia',
      'Mescolare e gustare'
    ],
    tags: ['proteico', 'energetico', 'veloce']
  },
  {
    id: 'orata-cartoccio',
    name: 'Orata al Cartoccio',
    description: 'Orata cotta al cartoccio con aromi mediterranei',
    difficulty: 'Media',
    prepTime: 15,
    cookTime: 30,
    servings: 2,
    category: 'secondo',
    cuisine: 'mediterranea',
    ingredients: [
      { foodId: 'orata', quantity: 600, unit: 'g' },
      { foodId: 'pomodori', quantity: 150, unit: 'g' },
      { foodId: 'olio-oliva', quantity: 30, unit: 'ml' },
      { foodId: 'limone', quantity: 40, unit: 'ml' },
      { foodId: 'basilico', quantity: 10, unit: 'g' },
    ],
    instructions: [
      'Pulire l\'orata e asciugarla',
      'Farcirla con limone e basilico',
      'Avvolgere in carta forno con pomodori e olio',
      'Infornare a 200°C per 25-30 minuti',
      'Servire nel cartoccio'
    ],
    tags: ['leggero', 'raffinato', 'omega-3']
  },
  {
    id: 'pasta-broccoli',
    name: 'Pasta con Broccoli',
    description: 'Pasta integrale con broccoli e aglio',
    difficulty: 'Facile',
    prepTime: 10,
    cookTime: 20,
    servings: 4,
    category: 'primo',
    cuisine: 'italiana',
    ingredients: [
      { foodId: 'pasta', quantity: 320, unit: 'g' },
      { foodId: 'broccoli', quantity: 400, unit: 'g' },
      { foodId: 'olio-oliva', quantity: 40, unit: 'ml' },
      { foodId: 'pepe', quantity: 2, unit: 'g' },
      { foodId: 'parmigiano', quantity: 40, unit: 'g' },
    ],
    instructions: [
      'Lessare i broccoli in acqua salata',
      'Cuocere la pasta nella stessa acqua',
      'Saltare i broccoli in padella con olio e pepe',
      'Unire la pasta ai broccoli',
      'Servire con parmigiano grattugiato'
    ],
    tags: ['salutare', 'economico', 'vegetariano']
  },
  {
    id: 'tacchino-spinaci',
    name: 'Tacchino con Spinaci',
    description: 'Fesa di tacchino con contorno di spinaci saltati',
    difficulty: 'Facile',
    prepTime: 10,
    cookTime: 15,
    servings: 4,
    category: 'secondo',
    cuisine: 'mediterranea',
    ingredients: [
      { foodId: 'tacchino', quantity: 600, unit: 'g' },
      { foodId: 'spinaci', quantity: 400, unit: 'g' },
      { foodId: 'olio-oliva', quantity: 30, unit: 'ml' },
      { foodId: 'limone', quantity: 30, unit: 'ml' },
      { foodId: 'sale', quantity: 5, unit: 'g' },
    ],
    instructions: [
      'Cuocere le fette di tacchino in padella 5 minuti per lato',
      'In altra padella saltare gli spinaci con olio',
      'Servire il tacchino con gli spinaci',
      'Condire con limone'
    ],
    tags: ['proteico', 'low-carb', 'ferro']
  },
  {
    id: 'zuppa-lenticchie',
    name: 'Zuppa di Lenticchie',
    description: 'Zuppa calda e nutriente di lenticchie',
    difficulty: 'Facile',
    prepTime: 15,
    cookTime: 40,
    servings: 6,
    category: 'primo',
    cuisine: 'mediterranea',
    ingredients: [
      { foodId: 'lenticchie', quantity: 300, unit: 'g' },
      { foodId: 'carote', quantity: 150, unit: 'g' },
      { foodId: 'pomodori', quantity: 200, unit: 'g' },
      { foodId: 'olio-oliva', quantity: 40, unit: 'ml' },
      { foodId: 'sale', quantity: 8, unit: 'g' },
    ],
    instructions: [
      'Soffriggere carote tritate in olio',
      'Aggiungere lenticchie e pomodori',
      'Coprire con acqua e cuocere 35 minuti',
      'Aggiustare di sale',
      'Servire calda con un filo d\'olio a crudo'
    ],
    tags: ['proteico', 'vegano', 'comfort-food']
  }
];

export function getRecipeById(id: string): Recipe | undefined {
  return recipesDatabase.find(recipe => recipe.id === id);
}

export function searchRecipes(query: string): Recipe[] {
  const lowerQuery = query.toLowerCase();
  return recipesDatabase.filter(recipe => 
    recipe.name.toLowerCase().includes(lowerQuery) ||
    recipe.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
  );
}

export function getRecipesByCategory(category: Recipe['category']): Recipe[] {
  return recipesDatabase.filter(recipe => recipe.category === category);
}

export function getRecipesByCuisine(cuisine: Recipe['cuisine']): Recipe[] {
  return recipesDatabase.filter(recipe => recipe.cuisine === cuisine);
}

export function filterRecipesByAvailableIngredients(availableIngredientIds: string[]): Recipe[] {
  return recipesDatabase.filter(recipe => {
    const recipeIngredients = recipe.ingredients.map(i => i.foodId);
    const missingIngredients = recipeIngredients.filter(id => !availableIngredientIds.includes(id));
    return missingIngredients.length === 0;
  });
}
