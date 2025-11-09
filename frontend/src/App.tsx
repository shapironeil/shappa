import { WeeklyCalendar } from "./components/WeeklyCalendar";
import { WorkoutCards } from "./components/WorkoutCards";
import { ProgressWidget } from "./components/ProgressWidget";
import { PersonalCard } from "./components/PersonalCard";
import { Toaster } from "./components/ui/sonner";
import { Dumbbell } from "lucide-react";
import { useState, useEffect } from "react";

export interface ScheduledWorkout {
  dayIndex: number;
  workoutId: number;
  workoutTitle: string;
  workoutType: string;
  duration: number;
}

export default function App() {
  const [scheduledWorkouts, setScheduledWorkouts] = useState<ScheduledWorkout[]>([]);
  const [selectedWorkoutId, setSelectedWorkoutId] = useState<number | null>(null);

  // Carica allenamenti salvati
  useEffect(() => {
    const saved = localStorage.getItem('scheduledWorkouts');
    if (saved) {
      setScheduledWorkouts(JSON.parse(saved));
    }
  }, []);

  const handleWorkoutSchedule = (workoutId: number, workoutTitle: string, workoutType: string, duration: number, days: number[]) => {
    const newScheduled = days.map(dayIndex => ({
      dayIndex,
      workoutId,
      workoutTitle,
      workoutType,
      duration
    }));

    setScheduledWorkouts(newScheduled);
    setSelectedWorkoutId(workoutId);
    localStorage.setItem('scheduledWorkouts', JSON.stringify(newScheduled));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster />
      
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="bg-blue-500 p-2 rounded-lg">
              <Dumbbell className="text-white" size={28} />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Calendar and Workouts */}
          <div className="lg:col-span-2 space-y-6">
            <WeeklyCalendar scheduledWorkouts={scheduledWorkouts} />
            <WorkoutCards 
              onWorkoutSchedule={handleWorkoutSchedule}
              selectedWorkoutId={selectedWorkoutId}
            />
          </div>

          {/* Right Column - Progress and Personal Card */}
          <div className="lg:col-span-1 space-y-6">
            <ProgressWidget />
            <PersonalCard />
          </div>
        </div>
      </main>
    </div>
  );
}
