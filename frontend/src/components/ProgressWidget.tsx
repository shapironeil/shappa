import { Card } from "./ui/card";
import { Progress } from "./ui/progress";
import { Trophy, Target, Flame, Info } from "lucide-react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Bell, Calendar } from "lucide-react";

export function ProgressWidget() {
  const [infoOpen, setInfoOpen] = useState(false);
  
  const progressData = [
    {
      label: "Obiettivo Settimanale",
      current: 0,
      target: 5,
      unit: "allenamenti",
      icon: Target,
      color: "text-blue-500"
    },
    {
      label: "Calorie Bruciate",
      current: 0,
      target: 2500,
      unit: "kcal",
      icon: Flame,
      color: "text-orange-500"
    }
  ];

  const calculatePercentage = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  return (
    <>
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Trophy className="text-yellow-500" size={24} />
            <h2>I Tuoi Progressi</h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setInfoOpen(true)}
            className="h-8 w-8 p-0"
          >
            <Info size={18} className="text-gray-500" />
          </Button>
        </div>
        <div className="space-y-6">
          {progressData.map((item, index) => {
            const Icon = item.icon;
            const percentage = calculatePercentage(item.current, item.target);
            
            return (
              <div key={index}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Icon className={item.color} size={18} />
                    <span className="text-sm">{item.label}</span>
                  </div>
                  <span className="text-sm">
                    {item.current} / {item.target} {item.unit}
                  </span>
                </div>
                <Progress value={percentage} className="h-2" />
                <div className="text-xs text-gray-500 mt-1">
                  {percentage.toFixed(0)}% completato
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Info Dialog */}
      <Dialog open={infoOpen} onOpenChange={setInfoOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Come Funziona il Tracciamento</DialogTitle>
            <DialogDescription>
              Sistema automatico di monitoraggio allenamenti
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-5">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Calendar className="text-blue-600" size={24} />
                </div>
                <div>
                  <h4 className="mb-2 text-blue-900">Monitoriamo i tuoi allenamenti</h4>
                  <p className="text-sm text-blue-700">
                    I risultati e le statistiche si calcolano automaticamente ad ogni allenamento completato.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-5">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Bell className="text-purple-600" size={24} />
                </div>
                <div>
                  <h4 className="mb-2 text-purple-900">Sistema Webhook Discord</h4>
                  <p className="text-sm text-purple-700 mb-3">
                    Dopo ogni sessione programmata riceverai una notifica Discord per confermare il completamento dell'allenamento.
                  </p>
                  <ul className="text-sm text-purple-700 space-y-1">
                    <li className="flex items-start gap-2">
                      <span className="text-purple-500 mt-0.5">•</span>
                      <span>Il sistema legge il calendario e invia notifiche nei giorni programmati</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-500 mt-0.5">•</span>
                      <span>Confermi il completamento direttamente da Discord</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-500 mt-0.5">•</span>
                      <span>I progressi si aggiornano automaticamente</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-5">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Trophy className="text-green-600" size={24} />
                </div>
                <div>
                  <h4 className="mb-2 text-green-900">Tracciamento Intelligente</h4>
                  <p className="text-sm text-green-700">
                    Il sistema calcola automaticamente allenamenti completati, calorie bruciate, progressione settimanale e streak di costanza.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t">
            <Button onClick={() => setInfoOpen(false)}>
              Ho Capito
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
