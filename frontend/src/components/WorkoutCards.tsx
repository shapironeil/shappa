import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Dumbbell, Clock, Flame, Info, Check, ChevronRight, Calendar, X } from "lucide-react";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import { Checkbox } from "./ui/checkbox";
import { toast } from "sonner@2.0.3";
import { workoutPrograms, WorkoutProgram, getRecommendedPrograms } from "../data/workoutPrograms";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { ScrollArea } from "./ui/scroll-area";
import { ExerciseImage } from "./ExerciseImage";

interface WorkoutCardsProps {
  onWorkoutSchedule: (workoutId: number, workoutTitle: string, workoutType: string, duration: number, days: number[]) => void;
  selectedWorkoutId: number | null;
}

export function WorkoutCards({ onWorkoutSchedule, selectedWorkoutId }: WorkoutCardsProps) {
  const [selectedProgram, setSelectedProgram] = useState<WorkoutProgram | null>(null);
  const [infoOpen, setInfoOpen] = useState(false);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [programToCancel, setProgramToCancel] = useState<WorkoutProgram | null>(null);
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [recommendedPrograms, setRecommendedPrograms] = useState<WorkoutProgram[]>([]);
  const [allPrograms, setAllPrograms] = useState<WorkoutProgram[]>(workoutPrograms);

  // Carica dati utente e filtra programmi
  useEffect(() => {
    const userData = localStorage.getItem('userData');
    if (userData) {
      const user = JSON.parse(userData);
      const recommended = getRecommendedPrograms(user.goal || 'muscle', user.level || 'beginner');
      setRecommendedPrograms(recommended);
    } else {
      setRecommendedPrograms(workoutPrograms.slice(0, 2));
    }
  }, []);

  // Aggiorna raccomandazioni quando cambia userData
  useEffect(() => {
    const handleStorageChange = () => {
      const userData = localStorage.getItem('userData');
      if (userData) {
        const user = JSON.parse(userData);
        const recommended = getRecommendedPrograms(user.goal || 'muscle', user.level || 'beginner');
        setRecommendedPrograms(recommended);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    // Verifica anche periodicamente
    const interval = setInterval(handleStorageChange, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  const dayNames = ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato'];

  const handleInfoClick = (program: WorkoutProgram, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedProgram(program);
    setInfoOpen(true);
  };

  const handleStartProgram = (program: WorkoutProgram) => {
    setSelectedProgram(program);
    // Pre-seleziona i giorni suggeriti in base alla frequenza
    const suggestedDays = getSuggestedDays(program.frequency);
    setSelectedDays(suggestedDays);
    setScheduleOpen(true);
  };

  const handleCancelClick = (program: WorkoutProgram) => {
    setProgramToCancel(program);
    setCancelOpen(true);
  };

  const handleConfirmCancel = () => {
    if (programToCancel) {
      // Annulla l'allenamento programmato
      onWorkoutSchedule(programToCancel.id, '', '', 0, []);
      toast.success("Allenamento annullato");
      setCancelOpen(false);
      setProgramToCancel(null);
    }
  };

  const getSuggestedDays = (frequency: number): number[] => {
    // Suggerisce giorni distribuiti nella settimana
    const dayMap: Record<number, number[]> = {
      2: [1, 4], // Lun, Gio
      3: [1, 3, 5], // Lun, Mer, Ven
      4: [1, 2, 4, 6], // Lun, Mar, Gio, Sab
      5: [1, 2, 3, 5, 6], // Lun-Ven
      6: [1, 2, 3, 4, 5, 6] // Lun-Sab
    };
    return dayMap[frequency] || [];
  };

  const toggleDay = (dayIndex: number) => {
    setSelectedDays(prev => 
      prev.includes(dayIndex) 
        ? prev.filter(d => d !== dayIndex)
        : [...prev, dayIndex]
    );
  };

  const handleConfirmSchedule = () => {
    if (selectedDays.length === 0) {
      toast.error("Seleziona almeno un giorno");
      return;
    }

    if (selectedProgram) {
      // Calcola durata media delle sessioni
      const avgDuration = selectedProgram.sessions[0]?.exercises.length * 3 || 45;
      
      onWorkoutSchedule(
        selectedProgram.id,
        selectedProgram.title,
        selectedProgram.type,
        avgDuration,
        selectedDays
      );
      toast.success(`${selectedProgram.title} programmato per ${selectedDays.length} giorni`);
      setScheduleOpen(false);
    }
  };

  const getDifficultyColor = (level: string[]) => {
    if (level.includes('advanced')) return 'destructive';
    if (level.includes('intermediate')) return 'default';
    return 'secondary';
  };

  const getDifficultyLabel = (level: string[]) => {
    if (level.includes('advanced')) return 'Avanzato';
    if (level.includes('intermediate')) return 'Intermedio';
    return 'Principiante';
  };

  return (
    <>
      <Card className="p-6">
        <h2 className="mb-4">Programmi di Allenamento</h2>
        
        <Tabs defaultValue="recommended" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="recommended">Consigliati per te</TabsTrigger>
            <TabsTrigger value="all">Tutti i Programmi</TabsTrigger>
          </TabsList>
          
          <TabsContent value="recommended" className="mt-0">
            {recommendedPrograms.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recommendedPrograms.map((program) => {
                  const Icon = program.icon;
                  const isSelected = selectedWorkoutId === program.id;
                  return (
                    <ProgramCard
                      key={program.id}
                      program={program}
                      isSelected={isSelected}
                      Icon={Icon}
                      onInfo={handleInfoClick}
                      onStart={handleStartProgram}
                      onCancel={handleCancelClick}
                      getDifficultyColor={getDifficultyColor}
                      getDifficultyLabel={getDifficultyLabel}
                    />
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>Completa il tuo profilo per vedere i programmi consigliati</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="all" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {allPrograms.map((program) => {
                const Icon = program.icon;
                const isSelected = selectedWorkoutId === program.id;
                return (
                  <ProgramCard
                    key={program.id}
                    program={program}
                    isSelected={isSelected}
                    Icon={Icon}
                    onInfo={handleInfoClick}
                    onStart={handleStartProgram}
                    onCancel={handleCancelClick}
                    getDifficultyColor={getDifficultyColor}
                    getDifficultyLabel={getDifficultyLabel}
                  />
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </Card>

      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Annullare l'allenamento?</AlertDialogTitle>
            <AlertDialogDescription>
              Sei sicuro di voler annullare "{programToCancel?.title}"? Tutti i giorni programmati verranno rimossi dal calendario.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No, mantienilo</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmCancel}>Sì, annulla</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Schedule Days Dialog */}
      <Dialog open={scheduleOpen} onOpenChange={setScheduleOpen}>
        <DialogContent className="sm:max-w-3xl">
          {selectedProgram && (
            <>
              <DialogHeader>
                <DialogTitle>Programma {selectedProgram.title}</DialogTitle>
                <DialogDescription>
                  Frequenza consigliata: {selectedProgram.frequency} giorni/settimana. Seleziona i giorni della settimana in cui vuoi allenarti.
                </DialogDescription>
              </DialogHeader>
              <div className="py-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                  {dayNames.map((day, index) => {
                    const isSelected = selectedDays.includes(index);
                    return (
                      <div
                        key={index}
                        onClick={() => toggleDay(index)}
                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                          isSelected 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-gray-200 hover:border-blue-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Checkbox 
                            checked={isSelected}
                            onCheckedChange={() => toggleDay(index)}
                          />
                          <span className={isSelected ? 'text-blue-600' : ''}>{day}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1" onClick={() => setScheduleOpen(false)}>
                    Annulla
                  </Button>
                  <Button className="flex-1" onClick={handleConfirmSchedule}>
                    Conferma Programma
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Program Info Dialog */}
      <Dialog open={infoOpen} onOpenChange={setInfoOpen}>
        <DialogContent className="sm:max-w-5xl max-h-[90vh]">
          {selectedProgram && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedProgram.title}</DialogTitle>
                <DialogDescription>{selectedProgram.subtitle}</DialogDescription>
                <div className="flex items-center gap-3 pt-3">
                  <div className={`${selectedProgram.color} p-3 rounded-lg text-white`}>
                    {(() => {
                      const Icon = selectedProgram.icon;
                      return <Icon size={24} />;
                    })()}
                  </div>
                </div>
              </DialogHeader>
              <ScrollArea className="max-h-[60vh]">
                <div className="space-y-6 pr-4">
                  <div>
                    <p className="text-sm text-gray-600">{selectedProgram.description}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-500">Durata</div>
                      <div>{selectedProgram.duration === 999 ? 'Indefinito' : `${selectedProgram.duration} settimane`}</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-500">Frequenza</div>
                      <div>{selectedProgram.frequency} giorni/sett</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-500">Livello</div>
                      <div>{getDifficultyLabel(selectedProgram.level)}</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-500">Tipo</div>
                      <div>{selectedProgram.type}</div>
                    </div>
                  </div>

                  <div>
                    <h4 className="mb-3">Benefici del Programma</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {selectedProgram.benefits.map((benefit, idx) => (
                        <div key={idx} className="text-sm text-gray-600 flex items-center gap-2 p-2 bg-green-50 rounded">
                          <Check size={14} className="text-green-600" />
                          {benefit}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="mb-3">Struttura Allenamenti</h4>
                    <div className="space-y-4">
                      {selectedProgram.sessions.map((session, idx) => (
                        <div key={idx} className="border rounded-lg p-4 bg-gray-50">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <h5 className="flex items-center gap-2">
                                <Calendar size={16} className="text-blue-600" />
                                {session.day}
                              </h5>
                              <p className="text-sm text-gray-600">{session.focus}</p>
                            </div>
                            <Badge>{session.exercises.length} esercizi</Badge>
                          </div>
                          
                          {session.warmup && (
                            <div className="mb-2 text-xs text-gray-500 bg-blue-50 p-2 rounded">
                              <strong>Riscaldamento:</strong> {session.warmup}
                            </div>
                          )}
                          
                          <div className="space-y-2">
                            {session.exercises.map((exercise, exIdx) => (
                              <div key={exIdx} className="flex items-start justify-between text-sm border-b pb-2 last:border-0">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <span className="text-gray-400">{exIdx + 1}.</span>
                                    <span>{exercise.name}</span>
                                    <ExerciseImage exerciseName={exercise.name} />
                                  </div>
                                  {exercise.notes && (
                                    <p className="text-xs text-gray-500 ml-6 mt-1">{exercise.notes}</p>
                                  )}
                                </div>
                                <div className="flex gap-4 text-xs text-gray-600 ml-4 flex-shrink-0">
                                  <span>{exercise.sets} serie</span>
                                  <span>{exercise.reps} rip</span>
                                  <span>{exercise.rest} rec</span>
                                </div>
                              </div>
                            ))}
                          </div>
                          
                          {session.cooldown && (
                            <div className="mt-2 text-xs text-gray-500 bg-purple-50 p-2 rounded">
                              <strong>Defaticamento:</strong> {session.cooldown}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </ScrollArea>
              
              <div className="flex gap-3 pt-4 border-t mt-4">
                <Button variant="outline" onClick={() => setInfoOpen(false)}>
                  Chiudi
                </Button>
                <Button className="flex-1" onClick={() => {
                  setInfoOpen(false);
                  handleStartProgram(selectedProgram);
                }}>
                  Inizia Questo Programma
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

// Componente card separato per evitare ripetizioni
function ProgramCard({ 
  program, 
  isSelected, 
  Icon, 
  onInfo, 
  onStart,
  onCancel,
  getDifficultyColor,
  getDifficultyLabel
}: any) {
  return (
    <div
      className={`border-2 rounded-lg p-4 hover:shadow-lg transition-all ${
        isSelected 
          ? 'border-blue-500 bg-blue-50' 
          : 'border-gray-200 hover:border-blue-300'
      }`}
    >
      <div className="flex items-start gap-4">
        <div className={`${program.color} p-3 rounded-lg text-white relative flex-shrink-0`}>
          <Icon size={24} />
          {isSelected && (
            <div className="absolute -top-1 -right-1 bg-green-500 rounded-full p-0.5">
              <Check size={12} className="text-white" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1 min-w-0">
              <h3 className="text-lg mb-1">{program.title}</h3>
              <p className="text-xs text-gray-600">{program.subtitle}</p>
            </div>
            <Badge variant={getDifficultyColor(program.level)} className="ml-2 flex-shrink-0">
              {getDifficultyLabel(program.level)}
            </Badge>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-600 mb-3">
            <div className="flex items-center gap-1">
              <Calendar size={14} />
              <span>{program.frequency}x/sett</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock size={14} />
              <span>{program.sessions[0]?.exercises.length * 3 || 45}min</span>
            </div>
          </div>
          <div className="flex gap-2">
            {isSelected ? (
              <Button 
                size="sm" 
                className="flex-1"
                onClick={() => onCancel(program)}
                variant="destructive"
              >
                <X size={16} className="mr-1" />
                Annulla
              </Button>
            ) : (
              <Button 
                size="sm" 
                className="flex-1"
                onClick={() => onStart(program)}
                variant="outline"
              >
                Inizia
              </Button>
            )}
            <Button 
              size="sm" 
              variant="outline"
              onClick={(e) => onInfo(program, e)}
            >
              <Info size={16} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
