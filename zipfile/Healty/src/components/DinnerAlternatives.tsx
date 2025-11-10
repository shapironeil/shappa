import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Checkbox } from './ui/checkbox';
import { ScrollArea } from './ui/scroll-area';
import { ChefHat, Clock, Users, Sparkles, RefreshCw, ShoppingCart } from 'lucide-react';
import { recipesDatabase, Recipe } from '../data/recipesDatabase';
import { foodDatabase } from '../data/foodDatabase';
import { toast } from 'sonner@2.0.3';

interface DinnerAlternativesProps {
  availableIngredients?: string[];
  onAddToShoppingList?: (foodIds: string[]) => void;
}

export function DinnerAlternatives({ availableIngredients = [], onAddToShoppingList }: DinnerAlternativesProps) {
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [checkedIngredients, setCheckedIngredients] = useState<{ [recipeId: string]: string[] }>({});
  
  // Filtro ricette per cena (primi e secondi)
  const dinnerRecipes = recipesDatabase.filter(r => 
    r.category === 'primo' || r.category === 'secondo'
  );

  // Ordina per popolarità/difficoltà
  const sortedRecipes = [...dinnerRecipes].sort((a, b) => {
    const difficultyOrder = { 'Facile': 1, 'Media': 2, 'Difficile': 3 };
    return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
  });

  const canMakeRecipe = (recipe: Recipe): boolean => {
    if (availableIngredients.length === 0) return false;
    const recipeIngredients = recipe.ingredients.map(i => i.foodId);
    return recipeIngredients.every(id => availableIngredients.includes(id));
  };

  const getMissingIngredients = (recipe: Recipe): string[] => {
    const recipeIngredients = recipe.ingredients.map(i => i.foodId);
    return recipeIngredients.filter(id => !availableIngredients.includes(id));
  };

  const toggleIngredient = (recipeId: string, foodId: string) => {
    setCheckedIngredients(prev => {
      const current = prev[recipeId] || [];
      const newChecked = current.includes(foodId)
        ? current.filter(id => id !== foodId)
        : [...current, foodId];
      return { ...prev, [recipeId]: newChecked };
    });
  };

  const addMissingToShoppingList = (recipe: Recipe) => {
    const missing = getMissingIngredients(recipe);
    if (missing.length === 0) {
      toast.info('Hai già tutti gli ingredienti!');
      return;
    }
    
    if (onAddToShoppingList) {
      onAddToShoppingList(missing);
      const missingNames = missing.map(id => {
        const food = foodDatabase.find(f => f.id === id);
        return food?.name || id;
      }).join(', ');
      toast.success(`Aggiunti ${missing.length} ingredienti alla lista: ${missingNames}`);
    }
  };

  const difficultyColors = {
    'Facile': 'bg-green-100 text-green-700 border-green-200',
    'Media': 'bg-yellow-100 text-yellow-700 border-yellow-200',
    'Difficile': 'bg-red-100 text-red-700 border-red-200'
  };

  const cuisineColors = {
    'italiana': 'bg-red-50 text-red-700',
    'mediterranea': 'bg-blue-50 text-blue-700',
    'asiatica': 'bg-orange-50 text-orange-700',
    'internazionale': 'bg-purple-50 text-purple-700'
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <ChefHat className="w-5 h-5 text-orange-600" />
          <div>
            <h2>Alternative per Stasera</h2>
            <p className="text-sm text-gray-600">Scopri cosa cucinare</p>
          </div>
        </div>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setSelectedRecipe(null)}
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Nuove
        </Button>
      </div>

      {availableIngredients.length === 0 && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-xs text-blue-800">
            💡 Aggiungi ingredienti nel Frigorifero per vedere quali ricette puoi preparare
          </p>
        </div>
      )}

      <ScrollArea className="h-[500px] pr-4">
        <div className="space-y-3">
          {sortedRecipes.map((recipe) => {
            const canMake = canMakeRecipe(recipe);
            const missingCount = getMissingIngredients(recipe).length;
            const checked = checkedIngredients[recipe.id] || [];
            
            return (
              <div
                key={recipe.id}
                className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                  selectedRecipe?.id === recipe.id
                    ? 'bg-gradient-to-br from-orange-50 to-yellow-50 border-orange-300'
                    : canMake
                    ? 'bg-white border-gray-200 hover:border-orange-300'
                    : 'bg-gray-50 border-gray-200 opacity-70'
                }`}
                onClick={() => setSelectedRecipe(recipe)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-sm">{recipe.name}</h3>
                      {canMake ? (
                        <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200 text-xs">
                          ✓ Puoi prepararlo
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-red-100 text-red-700 border-red-200 text-xs">
                          {missingCount} ingredienti mancanti
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-gray-600 mb-2">{recipe.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  <Badge variant="outline" className={`${difficultyColors[recipe.difficulty]} text-xs`}>
                    {recipe.difficulty}
                  </Badge>
                  <Badge variant="outline" className={`${cuisineColors[recipe.cuisine]} text-xs`}>
                    {recipe.cuisine}
                  </Badge>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Clock className="w-3 h-3" />
                    <span>{recipe.prepTime + recipe.cookTime} min</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Users className="w-3 h-3" />
                    <span>{recipe.servings} persone</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1 mb-3">
                  {recipe.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs px-2 py-0.5 bg-purple-50 text-purple-700 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {selectedRecipe?.id === recipe.id && (
                  <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
                    {/* Ingredienti con Checkbox */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-orange-600" />
                          Ingredienti
                        </h4>
                        {!canMake && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              addMissingToShoppingList(recipe);
                            }}
                          >
                            <ShoppingCart className="w-3 h-3 mr-2" />
                            Aggiungi mancanti
                          </Button>
                        )}
                      </div>
                      <div className="space-y-2">
                        {recipe.ingredients.map((ing, idx) => {
                          const food = foodDatabase.find(f => f.id === ing.foodId);
                          const hasIngredient = availableIngredients.includes(ing.foodId);
                          const isChecked = checked.includes(ing.foodId);
                          
                          return (
                            <div 
                              key={idx} 
                              className={`text-xs flex items-center gap-3 p-2 rounded ${
                                !hasIngredient
                                  ? 'bg-red-50 border border-red-200'
                                  : isChecked
                                  ? 'bg-green-50 border border-green-200'
                                  : 'bg-gray-50'
                              }`}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Checkbox
                                id={`ing-${recipe.id}-${ing.foodId}`}
                                checked={isChecked}
                                onCheckedChange={() => toggleIngredient(recipe.id, ing.foodId)}
                              />
                              <label 
                                htmlFor={`ing-${recipe.id}-${ing.foodId}`}
                                className="flex-1 flex justify-between cursor-pointer"
                              >
                                <span className={!hasIngredient ? 'text-red-700' : ''}>
                                  {food?.name || ing.foodId}
                                  {!hasIngredient && ' (manca)'}
                                </span>
                                <span className="text-gray-600">
                                  {ing.quantity} {ing.unit}
                                </span>
                              </label>
                            </div>
                          );
                        })}
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        💡 Spunta gli ingredienti che hai per aiutarti a verificare
                      </p>
                    </div>

                    {/* Preparazione */}
                    <div>
                      <h4 className="text-sm mb-2">Preparazione</h4>
                      <ol className="space-y-2">
                        {recipe.instructions.map((step, idx) => (
                          <li key={idx} className="text-xs flex gap-2">
                            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center text-xs">
                              {idx + 1}
                            </span>
                            <span className="text-gray-700">{step}</span>
                          </li>
                        ))}
                      </ol>
                    </div>

                    {/* Valori nutrizionali totali */}
                    <div className="p-3 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg">
                      <h4 className="text-sm mb-2">Valori Nutrizionali (per porzione)</h4>
                      <div className="grid grid-cols-4 gap-2 text-center">
                        {(() => {
                          let totalCal = 0, totalProt = 0, totalCarbs = 0, totalFat = 0;
                          recipe.ingredients.forEach(ing => {
                            const food = foodDatabase.find(f => f.id === ing.foodId);
                            if (food) {
                              const mult = ing.quantity / 100;
                              totalCal += food.calories * mult;
                              totalProt += food.protein * mult;
                              totalCarbs += food.carbs * mult;
                              totalFat += food.fat * mult;
                            }
                          });
                          const servings = recipe.servings;
                          return (
                            <>
                              <div>
                                <p className="text-xs text-gray-600">Cal</p>
                                <p className="text-sm">{Math.round(totalCal / servings)}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-600">Prot</p>
                                <p className="text-sm">{Math.round(totalProt / servings)}g</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-600">Carb</p>
                                <p className="text-sm">{Math.round(totalCarbs / servings)}g</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-600">Grassi</p>
                                <p className="text-sm">{Math.round(totalFat / servings)}g</p>
                              </div>
                            </>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </Card>
  );
}
