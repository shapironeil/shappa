import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Scale, TrendingDown, TrendingUp, Plus, Activity } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface WeightEntry {
  date: string;
  weight: number;
}

interface CalorieEntry {
  date: string;
  consumed: number;
  burned: number;
  target: number;
}

export function WeightCaloriesTracker() {
  const [openWeight, setOpenWeight] = useState(false);
  const [openCalories, setOpenCalories] = useState(false);
  const [newWeight, setNewWeight] = useState('');
  const [newCalories, setNewCalories] = useState('');
  const [newBurned, setNewBurned] = useState('');

  const [weightData, setWeightData] = useState<WeightEntry[]>([]);

  const [caloriesData, setCaloriesData] = useState<CalorieEntry[]>([]);

  const handleAddWeight = () => {
    if (!newWeight) return;
    
    const today = new Date();
    const dateStr = `${today.getDate().toString().padStart(2, '0')}/${(today.getMonth() + 1).toString().padStart(2, '0')}`;
    
    setWeightData(prev => [...prev.slice(-6), { date: dateStr, weight: parseFloat(newWeight) }]);
    setNewWeight('');
    setOpenWeight(false);
    toast.success('Peso registrato con successo!');
    
    // TODO: Salvare nel database Supabase. Vedere README.md
  };

  const handleAddCalories = () => {
    if (!newCalories) return;
    
    const today = new Date();
    const days = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'];
    const dayStr = days[today.getDay()];
    
    const updatedData = [...caloriesData.slice(0, -1), {
      date: dayStr,
      consumed: parseInt(newCalories),
      burned: parseInt(newBurned) || 0,
      target: 1800
    }];
    
    setCaloriesData(updatedData);
    setNewCalories('');
    setNewBurned('');
    setOpenCalories(false);
    toast.success('Calorie registrate con successo!');
    
    // TODO: Salvare nel database Supabase. Vedere README.md
  };

  const currentWeight = weightData[weightData.length - 1]?.weight || 0;
  const previousWeight = weightData[weightData.length - 2]?.weight || 0;
  const weightChange = currentWeight - previousWeight;
  const weightTrend = weightChange < 0 ? 'down' : weightChange > 0 ? 'up' : 'stable';

  const todayCalories = caloriesData[caloriesData.length - 1];
  const calorieBalance = todayCalories ? todayCalories.consumed - todayCalories.burned : 0;

  return (
    <Card className="p-6">
      <Tabs defaultValue="weight" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="weight">
            <Scale className="w-4 h-4 mr-2" />
            Peso
          </TabsTrigger>
          <TabsTrigger value="calories">
            <Activity className="w-4 h-4 mr-2" />
            Calorie
          </TabsTrigger>
        </TabsList>

        {/* Weight Tab */}
        <TabsContent value="weight" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3>Tracker Peso</h3>
              <p className="text-sm text-gray-600">Monitora i tuoi progressi</p>
            </div>
            <Dialog open={openWeight} onOpenChange={setOpenWeight}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Aggiungi
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Registra il tuo peso</DialogTitle>
                  <DialogDescription>
                    Inserisci il peso di oggi per aggiornare il grafico
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="weight">Peso (kg)</Label>
                    <Input
                      id="weight"
                      type="number"
                      step="0.1"
                      value={newWeight}
                      onChange={(e) => setNewWeight(e.target.value)}
                      placeholder="74.5"
                    />
                  </div>
                  <Button onClick={handleAddWeight} className="w-full">
                    Salva
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Current Weight Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
              <p className="text-sm text-gray-600 mb-1">Peso Attuale</p>
              <p className="text-2xl">{currentWeight} kg</p>
            </div>
            <div className={`p-4 rounded-lg border ${
              weightTrend === 'down' 
                ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200'
                : 'bg-gradient-to-br from-orange-50 to-red-50 border-orange-200'
            }`}>
              <p className="text-sm text-gray-600 mb-1">Variazione</p>
              <div className="flex items-center gap-1">
                {weightTrend === 'down' ? (
                  <TrendingDown className="w-5 h-5 text-green-600" />
                ) : (
                  <TrendingUp className="w-5 h-5 text-orange-600" />
                )}
                <p className="text-2xl">
                  {Math.abs(weightChange).toFixed(1)} kg
                </p>
              </div>
            </div>
          </div>

          {/* Weight Chart */}
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weightData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis domain={['dataMin - 1', 'dataMax + 1']} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="weight" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  dot={{ fill: '#3b82f6', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </TabsContent>

        {/* Calories Tab */}
        <TabsContent value="calories" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3>Tracker Calorie</h3>
              <p className="text-sm text-gray-600">Bilancio energetico</p>
            </div>
            <Dialog open={openCalories} onOpenChange={setOpenCalories}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Aggiungi
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Registra le calorie</DialogTitle>
                  <DialogDescription>
                    Inserisci le calorie consumate e bruciate oggi
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="calories">Calorie Consumate</Label>
                    <Input
                      id="calories"
                      type="number"
                      value={newCalories}
                      onChange={(e) => setNewCalories(e.target.value)}
                      placeholder="1800"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="burned">Calorie Bruciate (esercizio)</Label>
                    <Input
                      id="burned"
                      type="number"
                      value={newBurned}
                      onChange={(e) => setNewBurned(e.target.value)}
                      placeholder="450"
                    />
                  </div>
                  <Button onClick={handleAddCalories} className="w-full">
                    Salva
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Calorie Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200">
              <p className="text-xs text-gray-600 mb-1">Consumate</p>
              <p className="text-lg">{todayCalories?.consumed}</p>
            </div>
            <div className="p-3 bg-gradient-to-br from-orange-50 to-red-50 rounded-lg border border-orange-200">
              <p className="text-xs text-gray-600 mb-1">Bruciate</p>
              <p className="text-lg">{todayCalories?.burned}</p>
            </div>
            <div className={`p-3 rounded-lg border ${
              calorieBalance <= todayCalories?.target
                ? 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200'
                : 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200'
            }`}>
              <p className="text-xs text-gray-600 mb-1">Nette</p>
              <p className="text-lg">{calorieBalance}</p>
            </div>
          </div>

          {/* Calories Chart */}
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={caloriesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="consumed" fill="#10b981" name="Consumate" radius={[4, 4, 0, 0]} />
                <Bar dataKey="burned" fill="#f59e0b" name="Bruciate" radius={[4, 4, 0, 0]} />
                <Bar dataKey="target" fill="#3b82f6" name="Target" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
}
