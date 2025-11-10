import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Badge } from './ui/badge';
import { Checkbox } from './ui/checkbox';
import { ScrollArea } from './ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { AlertTriangle, Snowflake, Clock, Refrigerator, CheckSquare, Plus, Trash2, ShoppingCart } from 'lucide-react';
import { foodDatabase, FoodItem } from '../data/foodDatabase';
import { toast } from 'sonner@2.0.3';

interface FridgeItem {
  foodId: string;
  quantity: number;
  unit: string;
  expiryDays?: number;
  addedDate?: string;
}

interface UrgentItemsProps {
  onIngredientsChange?: (ingredientIds: string[]) => void;
  onShoppingListChange?: (addItems: (foodIds: string[]) => void) => void;
}

export function UrgentItems({ onIngredientsChange, onShoppingListChange }: UrgentItemsProps) {
  const [fridgeItems, setFridgeItems] = useState<FridgeItem[]>([]);
  const [shoppingList, setShoppingList] = useState<FridgeItem[]>([]);
  const [openFridge, setOpenFridge] = useState(false);
  const [categoryCheck, setCategoryCheck] = useState<{ [key: string]: string[] }>({});

  // Notifica cambiamenti ingredienti
  const updateIngredientsCallback = (items: FridgeItem[]) => {
    if (onIngredientsChange) {
      onIngredientsChange(items.map(i => i.foodId));
    }
  };

  // Esponi funzione shopping list al parent
  useEffect(() => {
    if (onShoppingListChange) {
      onShoppingListChange(addMultipleToShoppingList);
    }
  }, [shoppingList]);

  const addMultipleToShoppingList = (foodIds: string[]) => {
    const newItems: FridgeItem[] = [];
    foodIds.forEach(foodId => {
      const food = foodDatabase.find(f => f.id === foodId);
      if (!food) return;

      const existing = shoppingList.find(i => i.foodId === foodId);
      if (!existing) {
        newItems.push({
          foodId,
          quantity: food.typicalServing,
          unit: food.unit
        });
      }
    });

    if (newItems.length > 0) {
      setShoppingList([...shoppingList, ...newItems]);
    }
  };

  // Filtra solo ingredienti urgenti (scadenza <= 3 giorni)
  const getUrgentItems = () => {
    return fridgeItems.filter(item => 
      item.expiryDays !== undefined && item.expiryDays <= 3
    ).sort((a, b) => (a.expiryDays || 0) - (b.expiryDays || 0));
  };

  // Suggerimenti cosa congelare (scadenza 4-7 giorni)
  const getSuggestedToFreeze = () => {
    return fridgeItems.filter(item => 
      item.expiryDays !== undefined && item.expiryDays > 3 && item.expiryDays <= 7
    );
  };

  const categorizeItems = (items: FridgeItem[]) => {
    const categories: { [key: string]: FridgeItem[] } = {
      proteina: [],
      carboidrato: [],
      verdura: [],
      frutta: [],
      latticino: [],
      grasso: [],
      condimento: [],
      bevanda: []
    };

    items.forEach(item => {
      const food = foodDatabase.find(f => f.id === item.foodId);
      if (food) {
        categories[food.category].push(item);
      }
    });

    return categories;
  };

  const categoryIcons = {
    proteina: '🍗',
    carboidrato: '🍞',
    verdura: '🥬',
    frutta: '🍎',
    latticino: '🥛',
    grasso: '🥑',
    condimento: '🧂',
    bevanda: '☕'
  };

  const categoryLabels = {
    proteina: 'Proteine',
    carboidrato: 'Carboidrati',
    verdura: 'Verdure',
    frutta: 'Frutta',
    latticino: 'Latticini',
    grasso: 'Grassi',
    condimento: 'Condimenti',
    bevanda: 'Bevande'
  };

  const urgentItems = getUrgentItems();
  const freezeSuggestions = getSuggestedToFreeze();
  const categorizedFridge = categorizeItems(fridgeItems);

  const removeFromFridge = (foodId: string) => {
    const updatedItems = fridgeItems.filter(item => item.foodId !== foodId);
    setFridgeItems(updatedItems);
    updateIngredientsCallback(updatedItems);
    toast.success('Ingrediente rimosso');
  };

  const removeFromShoppingList = (foodId: string) => {
    setShoppingList(shoppingList.filter(i => i.foodId !== foodId));
    toast.success('Rimosso dalla lista');
  };

  // Quick check per categoria
  const handleCategoryCheck = (category: string, items: string[]) => {
    setCategoryCheck(prev => ({ ...prev, [category]: items }));
    
    // Aggiungi al frigo
    const newItems: FridgeItem[] = items.map(foodId => {
      const food = foodDatabase.find(f => f.id === foodId);
      return {
        foodId,
        quantity: food?.typicalServing || 100,
        unit: food?.unit || 'g',
        expiryDays: 7,
        addedDate: new Date().toISOString()
      };
    });

    const updatedFridge = [...fridgeItems, ...newItems];
    setFridgeItems(updatedFridge);
    updateIngredientsCallback(updatedFridge);
    toast.success(`${items.length} ingredienti aggiunti!`);
  };

  return (
    <>
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <div>
              <h2>Ingredienti Urgenti</h2>
              <p className="text-xs text-gray-600">Da consumare o congelare</p>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setOpenFridge(true)}
          >
            <Refrigerator className="w-4 h-4 mr-2" />
            Frigorifero
          </Button>
        </div>

        {fridgeItems.length === 0 ? (
          <div className="text-center py-8">
            <Refrigerator className="w-12 h-12 mx-auto text-gray-400 mb-3" />
            <p className="text-sm text-gray-600 mb-3">Frigorifero vuoto</p>
            <Button onClick={() => setOpenFridge(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Aggiungi ingredienti
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Urgenti (0-3 giorni) */}
            {urgentItems.length > 0 && (
              <div className="p-4 bg-red-50 rounded-lg border-2 border-red-200">
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="w-4 h-4 text-red-600" />
                  <h3 className="text-sm">Scadono presto!</h3>
                  <Badge variant="destructive" className="text-xs">
                    {urgentItems.length}
                  </Badge>
                </div>
                <div className="space-y-2">
                  {urgentItems.map((item, idx) => {
                    const food = foodDatabase.find(f => f.id === item.foodId);
                    return (
                      <div key={idx} className="flex items-center justify-between p-2 bg-white rounded">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{food && categoryIcons[food.category]}</span>
                          <div>
                            <p className="text-sm">{food?.name || item.foodId}</p>
                            <p className="text-xs text-red-600">
                              {item.expiryDays === 0 ? 'Oggi!' : `${item.expiryDays} giorni`}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-600">
                            {item.quantity} {item.unit}
                          </span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeFromFridge(item.foodId)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Da congelare (4-7 giorni) */}
            {freezeSuggestions.length > 0 && (
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 mb-3">
                  <Snowflake className="w-4 h-4 text-blue-600" />
                  <h3 className="text-sm">Considera di congelare</h3>
                </div>
                <div className="space-y-2">
                  {freezeSuggestions.map((item, idx) => {
                    const food = foodDatabase.find(f => f.id === item.foodId);
                    return (
                      <div key={idx} className="flex items-center justify-between p-2 bg-white rounded">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{food && categoryIcons[food.category]}</span>
                          <div>
                            <p className="text-sm">{food?.name || item.foodId}</p>
                            <p className="text-xs text-gray-600">{item.expiryDays} giorni</p>
                          </div>
                        </div>
                        <span className="text-xs text-gray-600">
                          {item.quantity} {item.unit}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {urgentItems.length === 0 && freezeSuggestions.length === 0 && (
              <div className="text-center py-4">
                <p className="text-sm text-gray-600">✓ Nessun ingrediente urgente</p>
                <p className="text-xs text-gray-500 mt-1">Tutto sotto controllo!</p>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* DIALOG FRIGORIFERO COMPLETO */}
      <Dialog open={openFridge} onOpenChange={setOpenFridge}>
        <DialogContent className="max-w-6xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Refrigerator className="w-5 h-5" />
              Inventario Completo Frigorifero
            </DialogTitle>
            <DialogDescription>
              Gestisci tutti gli ingredienti e la lista della spesa
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="inventory" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="inventory">Inventario</TabsTrigger>
              <TabsTrigger value="quick-check">Check Rapido</TabsTrigger>
              <TabsTrigger value="shopping">Lista Spesa</TabsTrigger>
            </TabsList>

            <ScrollArea className="h-[calc(90vh-200px)] mt-4">
              {/* TAB INVENTARIO */}
              <TabsContent value="inventory">
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(categorizedFridge).map(([category, items]) => (
                    <div key={category} className="p-4 bg-gray-50 rounded-lg border">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-2xl">{categoryIcons[category as keyof typeof categoryIcons]}</span>
                        <h3 className="text-sm">{categoryLabels[category as keyof typeof categoryLabels]}</h3>
                        <Badge variant="outline" className="text-xs">{items.length}</Badge>
                      </div>
                      
                      {items.length === 0 ? (
                        <p className="text-xs text-gray-500">Nessun elemento</p>
                      ) : (
                        <div className="space-y-2">
                          {items.map((item, idx) => {
                            const food = foodDatabase.find(f => f.id === item.foodId);
                            return (
                              <div key={idx} className="flex items-center justify-between p-2 bg-white rounded text-xs">
                                <span>{food?.name || item.foodId}</span>
                                <div className="flex items-center gap-2">
                                  <span className="text-gray-600">
                                    {item.quantity} {item.unit}
                                  </span>
                                  {item.expiryDays !== undefined && (
                                    <Badge 
                                      variant="outline" 
                                      className={`text-xs ${
                                        item.expiryDays <= 3 
                                          ? 'bg-red-50 text-red-700 border-red-200' 
                                          : 'bg-gray-50'
                                      }`}
                                    >
                                      {item.expiryDays}g
                                    </Badge>
                                  )}
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => removeFromFridge(item.foodId)}
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </TabsContent>

              {/* TAB CHECK RAPIDO */}
              <TabsContent value="quick-check" className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 mb-4">
                  <div className="flex items-center gap-2">
                    <CheckSquare className="w-5 h-5 text-blue-600" />
                    <div>
                      <h4 className="text-sm">Check Totale Rapido</h4>
                      <p className="text-xs text-gray-600">
                        Seleziona cosa hai per categoria - tutti gli elementi selezionati verranno aggiunti
                      </p>
                    </div>
                  </div>
                </div>

                {Object.entries(categoryLabels).map(([category, label]) => {
                  const categoryFoods = foodDatabase.filter(f => f.category === category);
                  const topItems = categoryFoods.slice(0, 10); // Mostra solo i più comuni
                  
                  return (
                    <div key={category} className="p-4 bg-gray-50 rounded-lg border">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-xl">{categoryIcons[category as keyof typeof categoryIcons]}</span>
                        <h4 className="text-sm">{label}</h4>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-2 mb-3">
                        {topItems.map((food) => (
                          <div key={food.id} className="flex items-center gap-2 p-2 bg-white rounded">
                            <Checkbox
                              id={`check-${food.id}`}
                              checked={categoryCheck[category]?.includes(food.id)}
                              onCheckedChange={(checked) => {
                                const current = categoryCheck[category] || [];
                                const updated = checked
                                  ? [...current, food.id]
                                  : current.filter(id => id !== food.id);
                                setCategoryCheck(prev => ({ ...prev, [category]: updated }));
                              }}
                            />
                            <label htmlFor={`check-${food.id}`} className="text-xs cursor-pointer">
                              {food.name}
                            </label>
                          </div>
                        ))}
                      </div>
                      
                      {(categoryCheck[category]?.length || 0) > 0 && (
                        <Button
                          size="sm"
                          onClick={() => handleCategoryCheck(category, categoryCheck[category] || [])}
                          className="w-full"
                        >
                          Aggiungi {categoryCheck[category]?.length} selezionati
                        </Button>
                      )}
                    </div>
                  );
                })}
              </TabsContent>

              {/* TAB LISTA SPESA */}
              <TabsContent value="shopping">
                <div className="space-y-3">
                  {shoppingList.length === 0 ? (
                    <div className="text-center py-12">
                      <ShoppingCart className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                      <p className="text-sm text-gray-600">Lista della spesa vuota</p>
                    </div>
                  ) : (
                    <>
                      {Object.entries(categorizeItems(shoppingList)).map(([category, items]) => {
                        if (items.length === 0) return null;
                        return (
                          <div key={category} className="p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-xl">{categoryIcons[category as keyof typeof categoryIcons]}</span>
                              <h4 className="text-sm">{categoryLabels[category as keyof typeof categoryLabels]}</h4>
                            </div>
                            <div className="space-y-2">
                              {items.map((item, idx) => {
                                const food = foodDatabase.find(f => f.id === item.foodId);
                                return (
                                  <div key={idx} className="flex items-center justify-between p-2 bg-white rounded">
                                    <span className="text-sm">{food?.name || item.foodId}</span>
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs text-gray-600">
                                        {item.quantity} {item.unit}
                                      </span>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => removeFromShoppingList(item.foodId)}
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </Button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </>
                  )}
                </div>
              </TabsContent>
            </ScrollArea>
          </Tabs>
        </DialogContent>
      </Dialog>
    </>
  );
}
