import { Dumbbell, Zap, TrendingDown, Activity, Sparkles, Target, Heart } from "lucide-react";

export interface Exercise {
  name: string;
  sets: string;
  reps: string;
  rest: string;
  notes?: string;
}

export interface WorkoutSession {
  day: string;
  focus: string;
  exercises: Exercise[];
  warmup?: string;
  cooldown?: string;
}

export interface WorkoutProgram {
  id: number;
  title: string;
  subtitle: string;
  goal: string[]; // IDs degli obiettivi compatibili
  level: string[]; // beginner, intermediate, advanced
  duration: number; // settimane
  frequency: number; // giorni/settimana
  description: string;
  benefits: string[];
  sessions: WorkoutSession[];
  icon: any;
  color: string;
  type: string;
  method: string; // Nome del metodo di allenamento
}

export const workoutPrograms: WorkoutProgram[] = [
  // ========== OBIETTIVO 1: FORZA ==========
  
  // FORZA - Metodo 5x5
  {
    id: 1,
    title: "Forza di Base",
    subtitle: "Metodo 5×5 - Carichi Elevati",
    goal: ["strength"],
    level: ["beginner", "intermediate"],
    duration: 12,
    frequency: 3,
    description: "Programma basato sul metodo 5×5 per sviluppare forza massimale. Poche ripetizioni, carichi elevati, focus su esercizi base.",
    benefits: [
      "Aumento forza massimale",
      "Sviluppo sistema nervoso",
      "Coordinazione muscolare migliorata",
      "Base solida per massa muscolare"
    ],
    icon: Sparkles,
    color: "bg-orange-600",
    type: "Forza Massimale",
    method: "5×5",
    sessions: [
      {
        day: "Lunedì",
        focus: "Workout A - Squat Focus",
        warmup: "5 min cardio + mobilità articolare + serie di riscaldamento con il 40-60% del carico",
        exercises: [
          { name: "Squat", sets: "5", reps: "5", rest: "3-5 min", notes: "80-85% 1RM" },
          { name: "Panca piana", sets: "5", reps: "5", rest: "3-4 min", notes: "80-85% 1RM" },
          { name: "Rematore bilanciere", sets: "5", reps: "5", rest: "3 min", notes: "Tecnica rigorosa" },
          { name: "Plank", sets: "3", reps: "45-60 sec", rest: "60 sec" }
        ],
        cooldown: "Stretching leggero 5 min"
      },
      {
        day: "Mercoledì",
        focus: "Workout B - Deadlift Focus",
        warmup: "5 min cardio + mobilità articolare + serie di riscaldamento",
        exercises: [
          { name: "Stacco da terra", sets: "5", reps: "5", rest: "4-5 min", notes: "80-85% 1RM" },
          { name: "Military press", sets: "5", reps: "5", rest: "3 min", notes: "In piedi, bilanciere" },
          { name: "Trazioni", sets: "5", reps: "5", rest: "2-3 min", notes: "Zavorrate se possibile" },
          { name: "Abs wheel", sets: "3", reps: "10", rest: "90 sec" }
        ],
        cooldown: "Stretching leggero 5 min"
      },
      {
        day: "Venerdì",
        focus: "Workout A - Progressione",
        warmup: "5 min cardio + mobilità articolare + serie di riscaldamento",
        exercises: [
          { name: "Squat", sets: "5", reps: "5", rest: "3-5 min", notes: "Incrementa carico di 2.5kg" },
          { name: "Panca piana", sets: "5", reps: "5", rest: "3-4 min", notes: "Incrementa carico di 2.5kg" },
          { name: "Rematore bilanciere", sets: "5", reps: "5", rest: "3 min" },
          { name: "Plank", sets: "3", reps: "45-60 sec", rest: "60 sec" }
        ],
        cooldown: "Stretching leggero 5 min"
      }
    ]
  },

  // FORZA - Rest Pause
  {
    id: 2,
    title: "Forza Speciale",
    subtitle: "Rest Pause - Intensità Massima",
    goal: ["strength"],
    level: ["intermediate", "advanced"],
    duration: 8,
    frequency: 4,
    description: "Metodo Rest Pause per superare i plateau di forza. Pause brevi tra mini-serie ad altissima intensità.",
    benefits: [
      "Supera plateau di forza",
      "Intensità massimale",
      "Progressione rapida",
      "Reclutamento fibre tipo II"
    ],
    icon: Sparkles,
    color: "bg-red-600",
    type: "Forza Speciale",
    method: "Rest Pause",
    sessions: [
      {
        day: "Lunedì",
        focus: "Squat - Rest Pause",
        exercises: [
          { name: "Squat", sets: "3", reps: "3 + 2 + 2", rest: "20 sec pause / 5 min tra serie", notes: "90% 1RM - 3 reps, pausa 20s, 2 reps, pausa 20s, 2 reps" },
          { name: "Front squat", sets: "4", reps: "6", rest: "3 min", notes: "Carico medio-alto" },
          { name: "Leg curl", sets: "3", reps: "8", rest: "2 min" },
          { name: "Calf raise", sets: "4", reps: "12", rest: "90 sec" }
        ]
      },
      {
        day: "Martedì",
        focus: "Panca - Rest Pause",
        exercises: [
          { name: "Panca piana", sets: "3", reps: "3 + 2 + 2", rest: "20 sec pause / 5 min tra serie", notes: "90% 1RM - metodo rest pause" },
          { name: "Panca inclinata", sets: "4", reps: "6", rest: "3 min" },
          { name: "Dip zavorrati", sets: "3", reps: "8", rest: "2 min" },
          { name: "French press", sets: "3", reps: "10", rest: "90 sec" }
        ]
      },
      {
        day: "Giovedì",
        focus: "Stacco - Rest Pause",
        exercises: [
          { name: "Stacco da terra", sets: "3", reps: "3 + 2 + 1", rest: "25 sec pause / 5 min tra serie", notes: "92% 1RM - metodo rest pause" },
          { name: "Rematore T-bar", sets: "4", reps: "6", rest: "3 min" },
          { name: "Trazioni zavorrare", sets: "4", reps: "6", rest: "2-3 min" },
          { name: "Shrug bilanciere", sets: "3", reps: "10", rest: "2 min" }
        ]
      },
      {
        day: "Sabato",
        focus: "Spalle - Forza",
        exercises: [
          { name: "Military press", sets: "3", reps: "4 + 2 + 2", rest: "20 sec pause / 4 min tra serie", notes: "88% 1RM - metodo rest pause" },
          { name: "Shoulder press manubri", sets: "4", reps: "6", rest: "3 min" },
          { name: "Alzate laterali", sets: "4", reps: "10", rest: "90 sec" },
          { name: "Face pull pesante", sets: "3", reps: "12", rest: "90 sec" }
        ]
      }
    ]
  },

  // ========== OBIETTIVO 2: MASSA MUSCOLARE ==========

  // MASSA - Drop Set
  {
    id: 3,
    title: "Crescita Preliminare",
    subtitle: "Drop Set - Volume Crescente",
    goal: ["muscle"],
    level: ["intermediate"],
    duration: 8,
    frequency: 4,
    description: "Metodo Drop Set per massimizzare la crescita muscolare. Aumento ripetizioni mentre il carico diminuisce, senza pausa.",
    benefits: [
      "Massima ipertrofia",
      "Pompaggio estremo",
      "Stress metabolico alto",
      "Rottura plateau"
    ],
    icon: Dumbbell,
    color: "bg-blue-600",
    type: "Ipertrofia",
    method: "Drop Set",
    sessions: [
      {
        day: "Lunedì",
        focus: "Petto - Drop Set",
        exercises: [
          { name: "Panca piana manubri", sets: "3", reps: "8 + 8 + 8", rest: "3 min", notes: "Drop set: 8 reps peso X, scali 20%, 8 reps, scali 20%, 8 reps" },
          { name: "Panca inclinata", sets: "4", reps: "10", rest: "2 min" },
          { name: "Croci manubri", sets: "3", reps: "12 + 12", rest: "2 min", notes: "Drop set finale" },
          { name: "Pushdown corda", sets: "3", reps: "12", rest: "90 sec" }
        ]
      },
      {
        day: "Martedì",
        focus: "Dorso - Drop Set",
        exercises: [
          { name: "Lat machine", sets: "3", reps: "8 + 8 + 8", rest: "3 min", notes: "Triple drop set" },
          { name: "Rematore bilanciere", sets: "4", reps: "10", rest: "2 min" },
          { name: "Pulley basso", sets: "3", reps: "12 + 12", rest: "2 min", notes: "Drop set finale" },
          { name: "Curl bilanciere", sets: "3", reps: "10", rest: "90 sec" }
        ]
      },
      {
        day: "Giovedì",
        focus: "Gambe - Drop Set",
        exercises: [
          { name: "Leg press", sets: "3", reps: "10 + 10 + 10", rest: "3 min", notes: "Triple drop set" },
          { name: "Squat", sets: "4", reps: "8", rest: "3 min" },
          { name: "Leg extension", sets: "3", reps: "15 + 15", rest: "2 min", notes: "Double drop set" },
          { name: "Leg curl", sets: "3", reps: "12 + 12", rest: "2 min", notes: "Double drop set" }
        ]
      },
      {
        day: "Sabato",
        focus: "Spalle/Braccia - Drop Set",
        exercises: [
          { name: "Shoulder press manubri", sets: "3", reps: "8 + 8 + 8", rest: "3 min", notes: "Triple drop set" },
          { name: "Alzate laterali", sets: "3", reps: "12 + 12 + 12", rest: "2 min", notes: "Triple drop set" },
          { name: "Curl manubri", sets: "3", reps: "10 + 10", rest: "90 sec", notes: "Drop set" },
          { name: "French press", sets: "3", reps: "10 + 10", rest: "90 sec", notes: "Drop set" }
        ]
      }
    ]
  },

  // MASSA - Superset
  {
    id: 4,
    title: "Crescita Avanzata",
    subtitle: "Superset - Intensità Estrema",
    goal: ["muscle"],
    level: ["advanced"],
    duration: 8,
    frequency: 4,
    description: "Superset antagonisti e agonisti per massimizzare la crescita. Due esercizi consecutivi senza pausa.",
    benefits: [
      "Massima crescita muscolare",
      "Densità allenamento elevata",
      "Risparmio tempo",
      "Pompaggio intenso"
    ],
    icon: Dumbbell,
    color: "bg-blue-700",
    type: "Ipertrofia Avanzata",
    method: "Superset",
    sessions: [
      {
        day: "Lunedì",
        focus: "Petto/Dorso - Superset Antagonisti",
        exercises: [
          { name: "Superset: Panca piana + Rematore bilanciere", sets: "4", reps: "10 + 10", rest: "2 min", notes: "Nessuna pausa tra esercizi" },
          { name: "Superset: Panca inclinata + Trazioni", sets: "4", reps: "10 + 8", rest: "2 min" },
          { name: "Superset: Croci + Pulley", sets: "3", reps: "12 + 12", rest: "90 sec" },
          { name: "Plank", sets: "3", reps: "60 sec", rest: "60 sec" }
        ]
      },
      {
        day: "Martedì",
        focus: "Quadricipiti/Femorali - Superset Antagonisti",
        exercises: [
          { name: "Superset: Squat + Leg curl", sets: "4", reps: "10 + 12", rest: "2-3 min" },
          { name: "Superset: Leg extension + Stacco rumeno", sets: "4", reps: "12 + 10", rest: "2 min" },
          { name: "Superset: Affondi + Good morning", sets: "3", reps: "12 + 12", rest: "90 sec" },
          { name: "Calf raise", sets: "4", reps: "15", rest: "60 sec" }
        ]
      },
      {
        day: "Giovedì",
        focus: "Spalle - Superset Pre-Affaticamento",
        exercises: [
          { name: "Superset: Alzate laterali + Military press", sets: "4", reps: "15 + 8", rest: "2 min", notes: "Pre-affaticamento" },
          { name: "Superset: Alzate frontali + Shoulder press", sets: "4", reps: "12 + 10", rest: "2 min" },
          { name: "Superset: Face pull + Alzate 90°", sets: "3", reps: "15 + 12", rest: "90 sec" },
          { name: "Shrug", sets: "3", reps: "12", rest: "90 sec" }
        ]
      },
      {
        day: "Sabato",
        focus: "Bicipiti/Tricipiti - Superset Antagonisti",
        exercises: [
          { name: "Superset: Curl bilanciere + Panca stretta", sets: "4", reps: "10 + 10", rest: "2 min" },
          { name: "Superset: Hammer curl + Dip tricipiti", sets: "4", reps: "12 + 10", rest: "2 min" },
          { name: "Superset: Curl cavo + Pushdown", sets: "3", reps: "15 + 15", rest: "90 sec" },
          { name: "Crunch", sets: "3", reps: "20", rest: "60 sec" }
        ]
      }
    ]
  },

  // ========== OBIETTIVO 3: VOLUME E SHAPE ==========

  // VOLUME - POF (Position of Flexion)
  {
    id: 5,
    title: "Stimolazione Totale",
    subtitle: "POF - Angolazioni Multiple",
    goal: ["shape"],
    level: ["intermediate", "advanced"],
    duration: 10,
    frequency: 4,
    description: "Position of Flexion: allena ogni muscolo da 3 angolazioni (stiramento, contrazione media, contrazione picco) per massimo sviluppo.",
    benefits: [
      "Forma muscolare completa",
      "Sviluppo da tutte le angolazioni",
      "Volume muscolare visibile",
      "Simmetria migliorata"
    ],
    icon: Target,
    color: "bg-purple-600",
    type: "Volume e Forma",
    method: "POF",
    sessions: [
      {
        day: "Lunedì",
        focus: "Petto - POF",
        exercises: [
          { name: "Panca inclinata", sets: "4", reps: "10", rest: "2 min", notes: "Stiramento" },
          { name: "Panca piana", sets: "4", reps: "10", rest: "2 min", notes: "Range medio" },
          { name: "Croci cavi alti", sets: "3", reps: "12", rest: "90 sec", notes: "Contrazione picco" },
          { name: "Push-up", sets: "3", reps: "15", rest: "60 sec", notes: "Pump finale" }
        ]
      },
      {
        day: "Martedì",
        focus: "Dorso - POF",
        exercises: [
          { name: "Stacco rumeno", sets: "4", reps: "10", rest: "2 min", notes: "Stiramento" },
          { name: "Rematore bilanciere", sets: "4", reps: "10", rest: "2 min", notes: "Range medio" },
          { name: "Pulley basso presa stretta", sets: "3", reps: "12", rest: "90 sec", notes: "Contrazione picco" },
          { name: "Lat machine", sets: "3", reps: "15", rest: "90 sec" }
        ]
      },
      {
        day: "Giovedì",
        focus: "Gambe - POF",
        exercises: [
          { name: "Sissy squat", sets: "3", reps: "12", rest: "2 min", notes: "Stiramento quadricipiti" },
          { name: "Squat", sets: "4", reps: "10", rest: "2-3 min", notes: "Range medio" },
          { name: "Leg extension", sets: "3", reps: "15", rest: "90 sec", notes: "Contrazione picco" },
          { name: "Leg curl", sets: "4", reps: "12", rest: "2 min", notes: "Femorali stiramento-contrazione" },
          { name: "Stacco gambe tese", sets: "3", reps: "12", rest: "2 min" }
        ]
      },
      {
        day: "Sabato",
        focus: "Spalle - POF",
        exercises: [
          { name: "Alzate laterali busto inclinato", sets: "3", reps: "12", rest: "90 sec", notes: "Stiramento" },
          { name: "Military press", sets: "4", reps: "10", rest: "2 min", notes: "Range medio" },
          { name: "Alzate laterali cavi", sets: "3", reps: "15", rest: "90 sec", notes: "Contrazione picco" },
          { name: "Face pull", sets: "3", reps: "15", rest: "60 sec" }
        ]
      }
    ]
  },

  // VOLUME - Metodo 21
  {
    id: 6,
    title: "Stimolazione Parziale",
    subtitle: "Metodo 21 - Parziali + Complete",
    goal: ["shape"],
    level: ["intermediate"],
    duration: 8,
    frequency: 4,
    description: "Metodo 21: 7 reps parziali basse + 7 parziali alte + 7 complete. Massima congestione e pompaggio.",
    benefits: [
      "Pompaggio estremo",
      "Controllo muscolare",
      "Time under tension elevato",
      "Dettaglio muscolare"
    ],
    icon: Target,
    color: "bg-purple-500",
    type: "Volume Dettagliato",
    method: "Metodo 21",
    sessions: [
      {
        day: "Lunedì",
        focus: "Braccia - Metodo 21",
        exercises: [
          { name: "Curl bilanciere", sets: "3", reps: "21", rest: "2 min", notes: "7 parziali basse + 7 parziali alte + 7 complete" },
          { name: "French press", sets: "3", reps: "21", rest: "2 min", notes: "Metodo 21" },
          { name: "Hammer curl", sets: "3", reps: "12", rest: "90 sec" },
          { name: "Pushdown", sets: "3", reps: "15", rest: "90 sec" }
        ]
      },
      {
        day: "Martedì",
        focus: "Petto - Metodo 21",
        exercises: [
          { name: "Panca piana", sets: "4", reps: "10", rest: "2 min" },
          { name: "Croci manubri", sets: "3", reps: "21", rest: "2 min", notes: "Metodo 21: 7 parziali basse + 7 alte + 7 complete" },
          { name: "Panca inclinata manubri", sets: "3", reps: "12", rest: "90 sec" },
          { name: "Push-up", sets: "3", reps: "max", rest: "60 sec" }
        ]
      },
      {
        day: "Giovedì",
        focus: "Gambe - Metodo 21",
        exercises: [
          { name: "Squat", sets: "4", reps: "10", rest: "2-3 min" },
          { name: "Leg extension", sets: "3", reps: "21", rest: "2 min", notes: "Metodo 21" },
          { name: "Leg curl", sets: "3", reps: "21", rest: "2 min", notes: "Metodo 21" },
          { name: "Calf raise", sets: "4", reps: "21", rest: "90 sec", notes: "Metodo 21" }
        ]
      },
      {
        day: "Sabato",
        focus: "Dorso/Spalle - Metodo 21",
        exercises: [
          { name: "Lat machine", sets: "3", reps: "21", rest: "2 min", notes: "Metodo 21" },
          { name: "Rematore", sets: "4", reps: "10", rest: "2 min" },
          { name: "Alzate laterali", sets: "3", reps: "21", rest: "90 sec", notes: "Metodo 21" },
          { name: "Face pull", sets: "3", reps: "15", rest: "60 sec" }
        ]
      }
    ]
  },

  // ========== OBIETTIVO 4: DETTAGLI ESTETICI (PUMP) ==========

  // PUMP - Stripping
  {
    id: 7,
    title: "Pompaggio Variabile",
    subtitle: "Stripping - Carico Decrescente",
    goal: ["pump"],
    level: ["intermediate", "advanced"],
    duration: 6,
    frequency: 5,
    description: "Metodo Stripping: diminuzione progressiva del peso senza pausa per pompaggio massimo e qualità estetica.",
    benefits: [
      "Pompaggio estremo",
      "Vascolarizzazione",
      "Qualità estetica",
      "Endurance muscolare"
    ],
    icon: Zap,
    color: "bg-pink-600",
    type: "Pump Estetico",
    method: "Stripping",
    sessions: [
      {
        day: "Lunedì",
        focus: "Petto - Stripping",
        exercises: [
          { name: "Panca piana manubri", sets: "4", reps: "10-12-15-20", rest: "2 min", notes: "Strip set: cala peso ogni serie senza pausa" },
          { name: "Croci cavi", sets: "3", reps: "12-15-20", rest: "90 sec", notes: "Strip set" },
          { name: "Push-up", sets: "3", reps: "max", rest: "60 sec" }
        ]
      },
      {
        day: "Martedì",
        focus: "Dorso - Stripping",
        exercises: [
          { name: "Lat machine", sets: "4", reps: "10-12-15-20", rest: "2 min", notes: "Strip set progressivo" },
          { name: "Pulley basso", sets: "3", reps: "12-15-20", rest: "90 sec", notes: "Strip set" },
          { name: "Pull-up", sets: "3", reps: "max", rest: "90 sec" }
        ]
      },
      {
        day: "Mercoledì",
        focus: "Spalle - Stripping",
        exercises: [
          { name: "Shoulder press macchina", sets: "4", reps: "10-12-15-20", rest: "2 min", notes: "Strip set" },
          { name: "Alzate laterali", sets: "3", reps: "12-15-20-25", rest: "90 sec", notes: "Quad strip" },
          { name: "Face pull", sets: "3", reps: "20", rest: "60 sec" }
        ]
      },
      {
        day: "Giovedì",
        focus: "Gambe - Stripping",
        exercises: [
          { name: "Leg press", sets: "4", reps: "12-15-20-25", rest: "2 min", notes: "Strip set" },
          { name: "Leg extension", sets: "3", reps: "15-20-25", rest: "90 sec", notes: "Strip set" },
          { name: "Leg curl", sets: "3", reps: "15-20-25", rest: "90 sec", notes: "Strip set" }
        ]
      },
      {
        day: "Sabato",
        focus: "Braccia - Stripping",
        exercises: [
          { name: "Curl cavo", sets: "4", reps: "12-15-20-25", rest: "90 sec", notes: "Strip set" },
          { name: "Pushdown cavo", sets: "4", reps: "12-15-20-25", rest: "90 sec", notes: "Strip set" },
          { name: "Hammer curl", sets: "3", reps: "15-20", rest: "60 sec" }
        ]
      }
    ]
  },

  // PUMP - Gironda 8x8
  {
    id: 8,
    title: "Pompaggio Costante",
    subtitle: "Gironda 8×8 - Densità Massima",
    goal: ["pump"],
    level: ["advanced"],
    duration: 6,
    frequency: 6,
    description: "Metodo Vince Gironda 8×8: 8 serie da 8 ripetizioni con solo 30 secondi di recupero. Pompaggio e definizione estremi.",
    benefits: [
      "Pompaggio record",
      "Look estetico estremo",
      "Densità capillare",
      "Conditioning muscolare"
    ],
    icon: Zap,
    color: "bg-pink-700",
    type: "Pump Estremo",
    method: "Gironda 8×8",
    sessions: [
      {
        day: "Lunedì",
        focus: "Petto - 8×8",
        exercises: [
          { name: "Panca piana", sets: "8", reps: "8", rest: "30 sec", notes: "Carico 60-70% 1RM" },
          { name: "Croci manubri", sets: "8", reps: "8", rest: "30 sec" },
          { name: "Dip", sets: "8", reps: "8", rest: "30 sec" }
        ]
      },
      {
        day: "Martedì",
        focus: "Dorso - 8×8",
        exercises: [
          { name: "Trazioni", sets: "8", reps: "8", rest: "30 sec", notes: "Assistite se necessario" },
          { name: "Rematore manubrio", sets: "8", reps: "8", rest: "30 sec" },
          { name: "Pulley", sets: "8", reps: "8", rest: "30 sec" }
        ]
      },
      {
        day: "Mercoledì",
        focus: "Spalle - 8×8",
        exercises: [
          { name: "Military press", sets: "8", reps: "8", rest: "30 sec" },
          { name: "Alzate laterali", sets: "8", reps: "8", rest: "30 sec" },
          { name: "Alzate posteriori", sets: "8", reps: "8", rest: "30 sec" }
        ]
      },
      {
        day: "Giovedì",
        focus: "Quadricipiti - 8×8",
        exercises: [
          { name: "Squat", sets: "8", reps: "8", rest: "30 sec", notes: "Carico controllato" },
          { name: "Leg extension", sets: "8", reps: "8", rest: "30 sec" },
          { name: "Affondi", sets: "8", reps: "8", rest: "30 sec" }
        ]
      },
      {
        day: "Venerdì",
        focus: "Femorali - 8×8",
        exercises: [
          { name: "Stacco rumeno", sets: "8", reps: "8", rest: "30 sec" },
          { name: "Leg curl", sets: "8", reps: "8", rest: "30 sec" },
          { name: "Good morning", sets: "8", reps: "8", rest: "30 sec" }
        ]
      },
      {
        day: "Sabato",
        focus: "Braccia - 8×8",
        exercises: [
          { name: "Curl bilanciere", sets: "8", reps: "8", rest: "30 sec" },
          { name: "Pushdown", sets: "8", reps: "8", rest: "30 sec" },
          { name: "Hammer curl", sets: "8", reps: "8", rest: "30 sec" }
        ]
      }
    ]
  },

  // ========== PROGRAMMI UNIVERSALI ==========

  // UNIVERSALE - Resistenza e Benessere
  {
    id: 9,
    title: "Forma Cardiovascolare",
    subtitle: "Resistenza e Condizionamento",
    goal: ["endurance", "wellness"],
    level: ["beginner", "intermediate"],
    duration: 999,
    frequency: 4,
    description: "Programma universale per migliorare resistenza cardiovascolare e benessere generale. Adatto a tutti gli sport.",
    benefits: [
      "Migliora resistenza",
      "Salute cardiovascolare",
      "Energia quotidiana",
      "Adatto a tutti gli sport"
    ],
    icon: Activity,
    color: "bg-green-500",
    type: "Cardio",
    method: "Universale",
    sessions: [
      {
        day: "Lunedì",
        focus: "LISS Cardio",
        exercises: [
          { name: "Corsa/cyclette steady state", sets: "1", reps: "35-45 min", rest: "-", notes: "Zone 2 - ritmo conversazionale" },
          { name: "Core circuit", sets: "3", reps: "Plank 45s, Side plank 30s, Bird dog 15", rest: "60 sec" }
        ]
      },
      {
        day: "Mercoledì",
        focus: "HIIT Intervals",
        exercises: [
          { name: "Sprint intervalli", sets: "8", reps: "30 sec sprint / 90 sec recupero", rest: "-" },
          { name: "Burpee", sets: "5", reps: "10", rest: "60 sec" },
          { name: "Mountain climbers", sets: "5", reps: "20", rest: "60 sec" }
        ]
      },
      {
        day: "Venerdì",
        focus: "Tempo Run + Forza",
        exercises: [
          { name: "Tempo run", sets: "1", reps: "25 min", rest: "-", notes: "Ritmo sostenuto controllato" },
          { name: "Push-up", sets: "3", reps: "15", rest: "60 sec" },
          { name: "Squat corpo libero", sets: "3", reps: "20", rest: "60 sec" }
        ]
      },
      {
        day: "Domenica",
        focus: "Active Recovery",
        exercises: [
          { name: "Camminata veloce o bici", sets: "1", reps: "45-60 min", rest: "-", notes: "Bassa intensità" },
          { name: "Stretching completo", sets: "1", reps: "15 min", rest: "-" }
        ]
      }
    ]
  },

  // UNIVERSALE - Mantenimento Generale
  {
    id: 10,
    title: "Equilibrio e Benessere",
    subtitle: "Mantenimento Generale",
    goal: ["wellness"],
    level: ["beginner", "intermediate"],
    duration: 999,
    frequency: 3,
    description: "Programma universale per mantenere forma fisica generale. Bilanciato e sostenibile per tutti.",
    benefits: [
      "Mantiene la forma",
      "Sostenibile lungo termine",
      "Previene infortuni",
      "Adatto a tutti"
    ],
    icon: Heart,
    color: "bg-teal-500",
    type: "Generale",
    method: "Universale",
    sessions: [
      {
        day: "Lunedì",
        focus: "Total Body Strength",
        exercises: [
          { name: "Squat", sets: "3", reps: "12", rest: "90 sec" },
          { name: "Push-up", sets: "3", reps: "12-15", rest: "60 sec" },
          { name: "Rematore", sets: "3", reps: "12", rest: "90 sec" },
          { name: "Plank", sets: "3", reps: "45 sec", rest: "60 sec" }
        ]
      },
      {
        day: "Mercoledì",
        focus: "Cardio Moderato + Core",
        exercises: [
          { name: "Cardio a scelta", sets: "1", reps: "30 min", rest: "-", notes: "Corsa, bici, nuoto, ecc." },
          { name: "Crunch", sets: "3", reps: "20", rest: "60 sec" },
          { name: "Russian twist", sets: "3", reps: "20", rest: "60 sec" },
          { name: "Leg raise", sets: "3", reps: "15", rest: "60 sec" }
        ]
      },
      {
        day: "Venerdì",
        focus: "Functional Training",
        exercises: [
          { name: "Affondi alternati", sets: "3", reps: "12/lato", rest: "60 sec" },
          { name: "Dip o Push-up", sets: "3", reps: "12", rest: "60 sec" },
          { name: "Pull-up o Lat machine", sets: "3", reps: "10", rest: "90 sec" },
          { name: "Farmer walk", sets: "3", reps: "30m", rest: "90 sec" },
          { name: "Stretching", sets: "1", reps: "10 min", rest: "-" }
        ]
      }
    ]
  }
];

// Funzione helper per filtrare i programmi
export function getRecommendedPrograms(goal: string, level: string): WorkoutProgram[] {
  const programs = workoutPrograms.filter(program => 
    program.goal.includes(goal) && program.level.includes(level)
  );
  
  // Ritorna massimo 2 programmi consigliati
  return programs.slice(0, 2);
}

// Funzione per ottenere tutti i programmi compatibili
export function getAllCompatiblePrograms(goal: string): WorkoutProgram[] {
  return workoutPrograms.filter(program => program.goal.includes(goal));
}
