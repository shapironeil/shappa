import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Refrigerator, Plus, Minus, ShoppingCart, AlertCircle, Trash2 } from 'lucide-react';
import { foodDatabase, FoodItem } from '../data/foodDatabase';
import { toast } from 'sonner@2.0.3';

interface FridgeItem {
  foodId: string;
  quantity: number;
  unit: string;
  expiryDays?: number;
}

interface FridgeProps {
  onIngredientsChange?: (ingredientIds: string[]) => void;
  onShoppingListChange?: (addItems: (foodIds: string[]) => void) => void;
}

export function Fridge({ onIngredientsChange, onShoppingListChange }: FridgeProps) {
  const [fridgeItems, setFridgeItems] = useState<FridgeItem[]>([]);

  const [shoppingList, setShoppingList] = useState<FridgeItem[]>([]);
  const [openAdd, setOpenAdd] = useState(false);
  const [selectedFood, setSelectedFood] = useState<string>('');
  const [quantity, setQuantity] = useState<string>('');

  // Notifica cambiamenti ingredienti
  const updateIngredientsCallback = (items: FridgeItem[]) => {
    if (onIngredientsChange) {
      onIngredientsChange(items.map(i => i.foodId));
    }
  };

  const addToFridge = () => {
    if (!selectedFood || !quantity) return;

    const food = foodDatabase.find(f => f.id === selectedFood);
    if (!food) return;

    const newItem: FridgeItem = {
      foodId: selectedFood,
      quantity: parseFloat(quantity),
      unit: food.unit,
      expiryDays: 7
    };

    const updatedItems = [...fridgeItems, newItem];
    setFridgeItems(updatedItems);
    updateIngredientsCallback(updatedItems);
    
    setSelectedFood('');
    setQuantity('');
    setOpenAdd(false);
    toast.success(`${food.name} aggiunto al frigorifero!`);
  };

  const removeFromFridge = (foodId: string) => {
    const updatedItems = fridgeItems.filter(item => item.foodId !== foodId);
    setFridgeItems(updatedItems);
    updateIngredientsCallback(updatedItems);
    toast.success('Ingrediente rimosso');
  };

  const updateQuantity = (foodId: string, delta: number) => {
    const updatedItems = fridgeItems.map(item => {
      if (item.foodId === foodId) {
        const newQty = Math.max(0, item.quantity + delta);
        if (newQty === 0) return null;
        return { ...item, quantity: newQty };
      }
      return item;
    }).filter(Boolean) as FridgeItem[];
    
    setFridgeItems(updatedItems);
    updateIngredientsCallback(updatedItems);
  };

  const consumeIngredients = (ingredients: { foodId: string; quantity: number }[]) => {
    const updatedItems = fridgeItems.map(item => {
      const consumed = ingredients.find(i => i.foodId === item.foodId);
      if (consumed) {
        const newQty = Math.max(0, item.quantity - consumed.quantity);
        if (newQty === 0) return null;
        return { ...item, quantity: newQty };
      }
      return item;
    }).filter(Boolean) as FridgeItem[];
    
    setFridgeItems(updatedItems);
    updateIngredientsCallback(updatedItems);
    toast.success('Ingredienti consumati aggiornati!');
  };

  const addToShoppingList = (foodId: string) => {
    const food = foodDatabase.find(f => f.id === foodId);
    if (!food) return;

    const existing = shoppingList.find(i => i.foodId === foodId);
    if (existing) {
      toast.info('Già nella lista della spesa');
      return;
    }

    setShoppingList([...shoppingList, {
      foodId,
      quantity: food.typicalServing,
      unit: food.unit
    }]);
    toast.success('Aggiunto alla lista della spesa!');
  };

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

  // Esponi la funzione al parent
  if (onShoppingListChange) {
    onShoppingListChange(addMultipleToShoppingList);
  }

  const removeFromShoppingList = (foodId: string) => {
    setShoppingList(shoppingList.filter(i => i.foodId !== foodId));
  };

  const generateShoppingList = () => {
    // Suggerisce ingredienti comuni che stanno finendo
    const lowStock = fridgeItems.filter(item => {
      const food = foodDatabase.find(f => f.id === item.foodId);
      if (!food) return false;
      return item.quantity < food.typicalServing * 0.5;
    });

    const newItems = lowStock.filter(item => 
      !shoppingList.find(s => s.foodId === item.foodId)
    );

    setShoppingList([...shoppingList, ...newItems]);
    toast.success(`${newItems.length} ingredienti aggiunti alla lista!`);
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

  const categorizedFridge = categorizeItems(fridgeItems);

  const categoryIcons = {
    proteina: '🍗',
    carboidrato: '🍝',
    verdura: '🥬',
    frutta: '🍎',
    latticino: '🧀',
    grasso: '🥑',
    condimento: '🧂',
    bevanda: '🥤'
  };

  return (
    <Card className="px-[10px] py-[-533px]">
      <Tabs defaultValue="fridge" className="w-full">
        <div className="flex items-center justify-between mb-4">
          
          <TabsList className="grid w-[280px] grid-cols-2">
            <TabsTrigger value="fridge">
              <Refrigerator className="w-4 h-4 mr-2" />
              Inventario
            </TabsTrigger>
            <TabsTrigger value="shopping">
              <ShoppingCart className="w-4 h-4 mr-2" />
              Spesa
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Tab Inventario */}
        <TabsContent value="fridge" className="space-y-4">
          <div className="flex gap-2">
            <Dialog open={openAdd} onOpenChange={setOpenAdd}>
              <DialogTrigger asChild>
                <Button size="sm" className="flex-1">
                  <Plus className="w-4 h-4 mr-2" />
                  Aggiungi Ingrediente
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Aggiungi Ingrediente</DialogTitle>
                  <DialogDescription>
                    Seleziona un ingrediente e indica la quantità
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label>Ingrediente</Label>
                    <Select value={selectedFood} onValueChange={setSelectedFood}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleziona..." />
                      </SelectTrigger>
                      <SelectContent>
                        {foodDatabase.map(food => (
                          <SelectItem key={food.id} value={food.id}>
                            {food.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {selectedFood && (
                    <div className="space-y-2">
                      <Label>Quantità ({foodDatabase.find(f => f.id === selectedFood)?.unit})</Label>
                      <Input
                        type="number"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        placeholder="100"
                      />
                    </div>
                  )}
                  <Button onClick={addToFridge} className="w-full" disabled={!selectedFood || !quantity}>
                    Aggiungi
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            <Button size="sm" variant="outline" onClick={generateShoppingList}>
              <ShoppingCart className="w-4 h-4 mr-2" />
              Genera Lista
            </Button>
          </div>

          <ScrollArea className="h-[450px] pr-4">
            <div className="space-y-4">
              {Object.entries(categorizedFridge).map(([category, items]) => {
                if (items.length === 0) return null;
                
                return (
                  <div key={category}>
                    <h3 className="text-sm mb-2 flex items-center gap-2">
                      <span>{categoryIcons[category as keyof typeof categoryIcons]}</span>
                      <span className="capitalize">{category}</span>
                      <Badge variant="secondary" className="text-xs">{items.length}</Badge>
                    </h3>
                    <div className="space-y-2">
                      {items.map((item) => {
                        const food = foodDatabase.find(f => f.id === item.foodId);
                        if (!food) return null;

                        const isExpiringSoon = (item.expiryDays || 0) <= 3;
                        const isLowStock = item.quantity < food.typicalServing * 0.5;

                        return (
                          <div
                            key={item.foodId}
                            className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 transition-all"
                          >
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-sm">{food.name}</span>
                                {isExpiringSoon && (
                                  <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 text-xs">
                                    <AlertCircle className="w-3 h-3 mr-1" />
                                    Scade tra {item.expiryDays}g
                                  </Badge>
                                )}
                                {isLowStock && (
                                  <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 text-xs">
                                    Scorte basse
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-600">
                                  {item.quantity} {item.unit}
                                </span>
                                <span className="text-xs text-gray-400">•</span>
                                <span className="text-xs text-gray-600">
                                  {food.calories} cal/100{food.unit}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateQuantity(item.foodId, -food.typicalServing / 2)}
                              >
                                <Minus className="w-3 h-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateQuantity(item.foodId, food.typicalServing / 2)}
                              >
                                <Plus className="w-3 h-3" />
                              </Button>
                              {isLowStock && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => addToShoppingList(item.foodId)}
                                >
                                  <ShoppingCart className="w-3 h-3" />
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => removeFromFridge(item.foodId)}
                              >
                                <Trash2 className="w-3 h-3 text-red-600" />
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Tab Lista Spesa */}
        <TabsContent value="shopping" className="space-y-4">
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800">
              💡 La lista della spesa viene generata automaticamente in base agli ingredienti in esaurimento e alle ricette che vuoi preparare.
            </p>
          </div>

          {shoppingList.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <ShoppingCart className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p>Nessun elemento nella lista della spesa</p>
              <p className="text-sm mt-1">Clicca su "Genera Lista" per suggerimenti</p>
            </div>
          ) : (
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-2">
                {shoppingList.map((item) => {
                  const food = foodDatabase.find(f => f.id === item.foodId);
                  if (!food) return null;

                  return (
                    <div
                      key={item.foodId}
                      className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200"
                    >
                      <div className="flex-1">
                        <span className="text-sm">{food.name}</span>
                        <p className="text-xs text-gray-600 mt-1">
                          Quantità suggerita: {item.quantity} {item.unit}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeFromShoppingList(item.foodId)}
                      >
                        <Trash2 className="w-3 h-3 text-red-600" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          )}

          {shoppingList.length > 0 && (
            <div className="flex gap-2">
              <Button className="flex-1" onClick={() => toast.success('Lista copiata negli appunti!')}>
                Copia Lista
              </Button>
              <Button variant="outline" onClick={() => setShoppingList([])}>
                Svuota
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </Card>
  );
}
