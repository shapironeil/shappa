import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Dumbbell, Clock } from "lucide-react";
import { ScheduledWorkout } from "../App";

interface WorkoutDay {
  date: Date;
  dayName: string;
  hasWorkout: boolean;
  workoutType?: string;
  workoutTitle?: string;
  duration?: number;
}

interface WeeklyCalendarProps {
  scheduledWorkouts: ScheduledWorkout[];
}

export function WeeklyCalendar({ scheduledWorkouts }: WeeklyCalendarProps) {
  const getWeekDays = (): WorkoutDay[] => {
    const days: WorkoutDay[] = [];
    const today = new Date(2025, 10, 9); // Sunday, November 9, 2025
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      const dayNames = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'];
      
      // Trova se c'è un allenamento programmato per questo giorno
      const scheduledWorkout = scheduledWorkouts.find(w => w.dayIndex === i);
      
      days.push({
        date,
        dayName: dayNames[date.getDay()],
        hasWorkout: !!scheduledWorkout,
        workoutType: scheduledWorkout?.workoutType,
        workoutTitle: scheduledWorkout?.workoutTitle,
        duration: scheduledWorkout?.duration
      });
    }
    
    return days;
  };

  const weekDays = getWeekDays();
  const today = new Date(2025, 10, 9);

  return (
    <Card className="p-6">
      <h2 className="mb-4">Calendario Settimanale</h2>
      <div className="grid grid-cols-7 gap-2">
        {weekDays.map((day, index) => {
          const isToday = day.date.toDateString() === today.toDateString();
          
          return (
            <div
              key={index}
              className={`p-3 rounded-lg border-2 transition-all cursor-pointer hover:border-blue-500 ${
                isToday ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
              }`}
            >
              <div className="text-center">
                <div className={`text-xs mb-1 ${isToday ? 'text-blue-600' : 'text-gray-500'}`}>
                  {day.dayName}
                </div>
                <div className={`mb-2 ${isToday ? 'text-blue-600' : ''}`}>
                  {day.date.getDate()}
                </div>
                {day.hasWorkout ? (
                  <div className="space-y-1">
                    <Badge variant="secondary" className="w-full text-xs py-0 px-1 flex items-center justify-center gap-1">
                      <Dumbbell size={10} />
                      <span>{day.workoutType}</span>
                    </Badge>
                    <div className="flex items-center justify-center gap-1 text-xs text-gray-500">
                      <Clock size={10} />
                      <span>{day.duration}m</span>
                    </div>
                  </div>
                ) : (
                  <div className="h-12 flex items-center justify-center">
                    <div className="w-2 h-2 bg-gray-200 rounded-full"></div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
