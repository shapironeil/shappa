import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Bug, Trash2, Eye, EyeOff } from 'lucide-react';

export function DebugPanel() {
  const [isVisible, setIsVisible] = useState(false);
  const [dietData, setDietData] = useState<any>(null);
  const [autoRefresh, setAutoRefresh] = useState(false);

  const loadDietData = () => {
    try {
      const saved = localStorage.getItem('selected_diet');
      if (saved) {
        setDietData(JSON.parse(saved));
      } else {
        setDietData(null);
      }
    } catch (e) {
      setDietData({ error: String(e) });
    }
  };

  useEffect(() => {
    loadDietData();
  }, []);

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(loadDietData, 1000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const clearDiet = () => {
    if (confirm('Vuoi cancellare la dieta salvata?')) {
      localStorage.removeItem('selected_diet');
      loadDietData();
      window.location.reload();
    }
  };

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsVisible(true)}
          variant="outline"
          size="sm"
          className="bg-purple-100 border-purple-300 hover:bg-purple-200"
        >
          <Bug className="w-4 h-4 mr-2" />
          Debug
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96">
      <Card className="p-4 bg-purple-50 border-2 border-purple-300 shadow-lg">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Bug className="w-5 h-5 text-purple-600" />
            <h3 className="text-purple-900">Debug Panel</h3>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => setAutoRefresh(!autoRefresh)}
              variant="outline"
              size="sm"
              className={autoRefresh ? 'bg-green-100' : ''}
            >
              {autoRefresh ? '🔄 Auto' : '⏸️ Manual'}
            </Button>
            <Button
              onClick={() => setIsVisible(false)}
              variant="ghost"
              size="sm"
            >
              <EyeOff className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-3">
          {/* Diet Status */}
          <div className="p-3 bg-white rounded-lg border border-purple-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Dieta Salvata</span>
              <Badge variant={dietData ? 'default' : 'secondary'}>
                {dietData ? '✅ Sì' : '❌ No'}
              </Badge>
            </div>

            {dietData && !dietData.error && (
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-600">Nome:</span>
                  <span className="font-medium">{dietData.name || '❌'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">ID:</span>
                  <span className="font-mono text-xs">{dietData.id || '❌'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">WeekPlan:</span>
                  <span className="font-medium">
                    {dietData.weekPlan ? Object.keys(dietData.weekPlan).length : '0'} giorni
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Description:</span>
                  <Badge variant={dietData.description ? 'default' : 'destructive'} className="text-xs">
                    {dietData.description ? '✅' : '❌ Manca'}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Benefits:</span>
                  <Badge variant={dietData.benefits ? 'default' : 'destructive'} className="text-xs">
                    {dietData.benefits ? `✅ ${dietData.benefits.length}` : '❌'}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Supplements:</span>
                  <Badge variant={dietData.supplements ? 'default' : 'destructive'} className="text-xs">
                    {dietData.supplements ? `✅ ${dietData.supplements.length}` : '❌'}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Iniziata:</span>
                  <span className="font-mono text-xs">
                    {dietData.startedAt ? new Date(dietData.startedAt).toLocaleDateString('it-IT') : '❌'}
                  </span>
                </div>
              </div>
            )}

            {dietData?.error && (
              <div className="p-2 bg-red-50 border border-red-200 rounded text-xs text-red-800">
                ❌ Errore: {dietData.error}
              </div>
            )}
          </div>

          {/* Week Plan Details */}
          {dietData?.weekPlan && (
            <div className="p-3 bg-white rounded-lg border border-purple-200">
              <div className="font-medium text-sm mb-2">Giorni WeekPlan</div>
              <div className="flex flex-wrap gap-1">
                {Object.keys(dietData.weekPlan).map(day => (
                  <Badge key={day} variant="outline" className="text-xs">
                    {day.substring(0, 3)}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Current Day Info */}
          <div className="p-3 bg-white rounded-lg border border-purple-200">
            <div className="font-medium text-sm mb-2">Info Giorno Corrente</div>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-600">Data:</span>
                <span className="font-medium">
                  {new Date().toLocaleDateString('it-IT', { 
                    weekday: 'long', 
                    day: 'numeric', 
                    month: 'long' 
                  })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Day index:</span>
                <span className="font-mono">{new Date().getDay()}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              onClick={loadDietData}
              variant="outline"
              size="sm"
              className="flex-1"
            >
              🔄 Refresh
            </Button>
            <Button
              onClick={clearDiet}
              variant="destructive"
              size="sm"
              className="flex-1"
            >
              <Trash2 className="w-3 h-3 mr-1" />
              Reset
            </Button>
          </div>

          {/* Size Info */}
          <div className="text-xs text-gray-500 text-center">
            {dietData && !dietData.error && (
              <span>
                Dimensione: {new Blob([JSON.stringify(dietData)]).size} bytes
              </span>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
