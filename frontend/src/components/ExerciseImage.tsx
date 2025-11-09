import { useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "./ui/dialog";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Image as ImageIcon } from "lucide-react";

interface ExerciseImageProps {
  exerciseName: string;
}

export function ExerciseImage({ exerciseName }: ExerciseImageProps) {
  const [imageOpen, setImageOpen] = useState(false);
  
  // Mappa esercizi a query di ricerca su Unsplash
  const getImageQuery = (name: string): string => {
    const queries: Record<string, string> = {
      // Squat variations
      "Squat": "barbell squat gym",
      "Squat con bilanciere": "barbell squat gym",
      "Front squat": "front squat gym",
      "Goblet squat": "goblet squat kettlebell",
      "Jump squat": "jump squat exercise",
      
      // Bench press
      "Panca piana": "bench press gym",
      "Panca piana con bilanciere": "barbell bench press",
      "Panca piana con manubri": "dumbbell bench press",
      "Panca piana manubri": "dumbbell bench press",
      "Panca inclinata": "incline bench press",
      "Panca inclinata con manubri": "incline dumbbell press",
      "Panca inclinata manubri": "incline dumbbell press",
      "Panca stretta": "close grip bench press",
      "Panca piana con pausa": "paused bench press",
      
      // Deadlift
      "Stacco": "deadlift gym",
      "Stacco da terra": "conventional deadlift",
      "Stacco rumeno": "romanian deadlift",
      "Stacco deficit": "deficit deadlift",
      
      // Rows
      "Rematore": "barbell row gym",
      "Rematore con bilanciere": "barbell bent over row",
      "Rematore bilanciere": "barbell bent over row",
      "Rematore manubrio": "dumbbell row gym",
      "Rematore T-bar": "t-bar row gym",
      "Pulley basso": "seated cable row",
      
      // Pull exercises
      "Trazioni": "pull up gym",
      "Trazioni zavorrare": "weighted pull up",
      "Lat machine": "lat pulldown machine",
      
      // Press variations
      "Military press": "military press gym",
      "Military press con manubri": "dumbbell shoulder press",
      "Shoulder press": "shoulder press gym",
      "Shoulder press manubri": "dumbbell shoulder press",
      "Floor press": "floor press exercise",
      
      // Leg exercises
      "Leg press": "leg press machine",
      "Leg curl": "leg curl machine",
      "Leg extension": "leg extension machine",
      "Affondi": "lunges exercise",
      "Affondi bulgari": "bulgarian split squat",
      "Squat bulgaro": "bulgarian split squat",
      "Good morning": "good morning exercise",
      "Calf raise": "calf raise machine",
      
      // Shoulder exercises
      "Alzate laterali": "lateral raise dumbbells",
      "Face pull": "face pull cable",
      "Shrug bilanciere": "barbell shrug",
      
      // Arms
      "Curl bilanciere": "barbell curl biceps",
      "Curl": "bicep curl",
      "Hammer curl": "hammer curl dumbbells",
      "Curl concentrato": "concentration curl",
      "French press": "overhead tricep extension",
      "Dip tricipiti": "tricep dips",
      "Dip": "tricep dips",
      "Dip alle parallele": "parallel bar dips",
      "Dip zavorrati": "weighted dips",
      "Pushdown corda": "rope tricep pushdown",
      "Pushdown pesante": "tricep pushdown cable",
      
      // Dumbbell exercises
      "Croci manubri": "dumbbell flyes",
      
      // Core
      "Plank": "plank exercise",
      "Plank laterale": "side plank exercise",
      "Crunch": "crunch abs exercise",
      "Crunch pesato": "weighted crunch",
      "Abs wheel": "ab wheel rollout",
      
      // Cardio/Functional
      "Burpees": "burpee exercise",
      "Burpee": "burpee exercise",
      "Mountain Climbers": "mountain climbers exercise",
      "Mountain climber": "mountain climbers exercise",
      "High Knees": "high knees exercise",
      "Sprint": "sprint running",
      "Corsa leggera": "jogging running",
      "Cyclette": "stationary bike",
      "Ellittica": "elliptical machine",
      "Camminata veloce": "power walking",
      "Nuoto": "swimming pool",
      "Bike/rower intervalli": "rowing machine",
      
      // Stretching
      "Stretching gambe": "leg stretching",
      "Stretching": "stretching exercise",
      "Mobilità spalle": "shoulder mobility",
      "Yoga flow": "yoga flow",
      "Foam rolling": "foam roller exercise",
      "Respirazione": "breathing exercise yoga",
      
      // Kettlebell
      "Kettlebell swing": "kettlebell swing",
      
      // Bodyweight
      "Push-up": "push up exercise",
      "Box jump": "box jump exercise",
      "Jump rope": "jump rope exercise",
      
      // Strongman
      "Farmer walk": "farmers walk exercise"
    };
    
    return queries[name] || `${name} exercise gym`;
  };

  const imageUrl = `https://source.unsplash.com/400x300/?${encodeURIComponent(getImageQuery(exerciseName))}`;

  return (
    <>
      <button
        onClick={() => setImageOpen(true)}
        className="ml-2 p-1 hover:bg-blue-50 rounded transition-colors"
        title="Visualizza esercizio"
      >
        <ImageIcon size={16} className="text-blue-600" />
      </button>

      <Dialog open={imageOpen} onOpenChange={setImageOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogTitle>{exerciseName}</DialogTitle>
          <DialogDescription>Visualizzazione esercizio</DialogDescription>
          <div className="mt-4">
            <ImageWithFallback
              src={imageUrl}
              alt={exerciseName}
              className="w-full h-auto rounded-lg"
            />
            <p className="text-sm text-gray-500 mt-4 text-center">
              Immagine di riferimento - consulta un trainer per la tecnica corretta
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
