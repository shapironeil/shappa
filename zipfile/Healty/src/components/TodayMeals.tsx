import { useState } from 'react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import { UtensilsCrossed, Coffee, Sun, Moon, Apple } from 'lucide-react';

interface Meal {
  id: string;
  name: string;
  calories: number;
  time: string;
  completed: boolean;
  icon: any;
  color: string;
}

export function TodayMeals() {
  const [meals, setMeals] = useState<Meal[]>([]);

  const toggleMealCompleted = (id: string) => {
    setMeals(prev => 
      prev.map(meal => 
        meal.id === id ? { ...meal, completed: !meal.completed } : meal
      )
    );
  };

  const totalCalories = meals.reduce((sum, meal) => sum + meal.calories, 0);
  const completedCalories = meals.filter(m => m.completed).reduce((sum, meal) => sum + meal.calories, 0);
  const progressPercentage = meals.length > 0 ? (completedCalories / totalCalories) * 100 : 0;

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <UtensilsCrossed className="w-5 h-5 text-green-600" />
          <h2>Cosa Mangi Oggi</h2>
        </div>
        {meals.length > 0 && (
          <Badge variant="secondary">
            {completedCalories} / {totalCalories} cal
          </Badge>
        )}
      </div>

      {meals.length === 0 ? (
        <div className="text-center py-12">
          <UtensilsCrossed className="w-12 h-12 mx-auto text-gray-400 mb-3" />
          <p className="text-sm text-gray-600 mb-1">Nessun pasto pianificato per oggi</p>
          <p className="text-xs text-gray-500">Aggiungi pasti dal calendario settimanale</p>
        </div>
      ) : (
        <>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-600">Progressione giornaliera</span>
          <span>{Math.round(progressPercentage)}%</span>
        </div>
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-green-400 to-green-600 transition-all duration-500 rounded-full"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Meals List */}
      <div className="space-y-3">
        {meals.map((meal) => {
          const Icon = meal.icon;
          const colorClasses = {
            yellow: 'bg-yellow-100 text-yellow-600',
            green: 'bg-green-100 text-green-600',
            orange: 'bg-orange-100 text-orange-600',
            purple: 'bg-purple-100 text-purple-600',
            blue: 'bg-blue-100 text-blue-600'
          };

          return (
            <div
              key={meal.id}
              className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${
                meal.completed 
                  ? 'bg-gray-50 border-gray-200 opacity-60' 
                  : 'bg-white border-gray-200 hover:border-green-300'
              }`}
            >
              <Checkbox
                checked={meal.completed}
                onCheckedChange={() => toggleMealCompleted(meal.id)}
                className="data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
              />
              
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${colorClasses[meal.color as keyof typeof colorClasses]}`}>
                <Icon className="w-5 h-5" />
              </div>

              <div className="flex-1">
                <p className={meal.completed ? 'line-through text-gray-500' : ''}>
                  {meal.name}
                </p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs text-gray-500">{meal.time}</span>
                  <span className="text-xs text-gray-500">•</span>
                  <span className="text-xs text-gray-500">{meal.calories} cal</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800">
              💡 <span>Ricordati di bere almeno 2 litri d'acqua oggi!</span>
            </p>
          </div>
        </>
      )}
    </Card>
  );
}
