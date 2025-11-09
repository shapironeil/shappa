// ========== WORKOUT PROGRAMS DATA (da workoutPrograms.ts) ==========

const workoutPrograms = [
    // OBIETTIVO 1: FORZA
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
        icon: "sparkles",
        color: "bg-orange-600",
        type: "Forza Massimale",
        method: "5×5",
        sessions: [
            {
                day: "Lunedì",
                focus: "Workout A - Squat Focus",
                warmup: "10 min cardio + mobilità articolare dinamica",
                exercises: [
                    { 
                        name: "Crunch", 
                        sets: "3", 
                        reps: "10-15", 
                        rest: "30 sec", 
                        notes: "Riscaldamento addominali",
                        image: "https://i.ibb.co/ZMq4wJh/crunch.jpg",
                        muscleGroup: "Addominali",
                        execution: "Fletti il tronco sul bacino mantenendo la tensione continua"
                    },
                    { 
                        name: "Squat con bilanciere", 
                        sets: "5", 
                        reps: "5", 
                        rest: "3-5 min", 
                        notes: "80-85% 1RM - Esercizio base fondamentale",
                        image: "https://i.ibb.co/9GBPLFT/squat.jpg",
                        muscleGroup: "Quadricipiti, Glutei, Femorali",
                        execution: "Leva di 3° tipo. Scendi controllato fino a coscie parallele, spinta esplosiva verso l'alto"
                    },
                    { 
                        name: "Distensione bilanciere panca piana", 
                        sets: "5", 
                        reps: "5", 
                        rest: "3-4 min", 
                        notes: "80-85% 1RM - Esercizio base per pettorali",
                        image: "https://i.ibb.co/7KcPwbq/bench-press.jpg",
                        muscleGroup: "Pettorale, Deltoide anteriore, Tricipiti",
                        execution: "Movimento pluriarticolare. Abbassa il bilanciere al petto, premi verso l'alto contraendo il pettorale"
                    },
                    { 
                        name: "Rematore con bilanciere", 
                        sets: "5", 
                        reps: "5", 
                        rest: "3 min", 
                        notes: "Esercizio base - Tecnica rigorosa, gomiti stretti",
                        image: "https://i.ibb.co/YcRkjqF/barbell-row.jpg",
                        muscleGroup: "Gran dorsale, Trapezio, Romboidi",
                        execution: "Busto inclinato 45°, tira il bilanciere verso l'ombelico contraendo dorsale e trapezio"
                    }
                ],
                cooldown: "Stretching leggero 5-10 min per tutti i gruppi muscolari allenati"
            },
            {
                day: "Mercoledì",
                focus: "Workout B - Stacco Focus",
                warmup: "10 min cardio + mobilità articolare dinamica",
                exercises: [
                    { 
                        name: "Crunch inverso", 
                        sets: "3", 
                        reps: "10-15", 
                        rest: "30 sec", 
                        notes: "Focus sulla parte bassa dell'addome",
                        image: "https://i.ibb.co/ZMq4wJh/crunch.jpg",
                        muscleGroup: "Addominali",
                        execution: "Solleva il bacino verso il petto mantenendo gambe piegate"
                    },
                    { 
                        name: "Stacco da terra", 
                        sets: "5", 
                        reps: "5", 
                        rest: "4-5 min", 
                        notes: "75-80% 1RM - Re degli esercizi per catena posteriore",
                        image: "https://i.ibb.co/VqGhJdq/deadlift.jpg",
                        muscleGroup: "Glutei, Femorali, Erettori spinali, Trapezio",
                        execution: "Schiena dritta, afferra bilanciere, estendi gambe e schiena simultaneamente"
                    },
                    { 
                        name: "Lento avanti con bilanciere", 
                        sets: "5", 
                        reps: "5", 
                        rest: "3 min", 
                        notes: "Esercizio base per deltoidi",
                        image: "https://i.ibb.co/qNjvBnY/overhead-press.jpg",
                        muscleGroup: "Deltoide, Trapezio superiore, Tricipiti",
                        execution: "Premi il bilanciere dal petto verso l'alto mantenendo core stabile"
                    },
                    { 
                        name: "Trazioni alla sbarra", 
                        sets: "5", 
                        reps: "max", 
                        rest: "3 min", 
                        notes: "Se non raggiungi 5 reps, usa elastico o lat machine",
                        image: "https://i.ibb.co/GVwBfxG/pull-ups.jpg",
                        muscleGroup: "Gran dorsale, Bicipiti, Trapezio",
                        execution: "Presa prona leggermente più larga delle spalle, tira fino al mento alla sbarra"
                    }
                ],
                cooldown: "Stretching 5-10 min con focus su catena posteriore"
            },
            {
                day: "Venerdì",
                focus: "Workout A - Ripetizione",
                warmup: "10 min cardio + mobilità articolare dinamica",
                exercises: [
                    { 
                        name: "Plank", 
                        sets: "3", 
                        reps: "45-60 sec", 
                        rest: "60 sec", 
                        notes: "Stabilizzazione core",
                        image: "https://i.ibb.co/ZMq4wJh/crunch.jpg",
                        muscleGroup: "Addominali, Core",
                        execution: "Mantieni corpo rigido come una tavola, non inarcare la schiena"
                    },
                    { 
                        name: "Squat con bilanciere", 
                        sets: "5", 
                        reps: "5", 
                        rest: "3-5 min", 
                        notes: "80-85% 1RM",
                        image: "https://i.ibb.co/9GBPLFT/squat.jpg",
                        muscleGroup: "Quadricipiti, Glutei, Femorali",
                        execution: "Ripeti con la stessa tecnica impeccabile del Lunedì"
                    },
                    { 
                        name: "Distensione bilanciere panca piana", 
                        sets: "5", 
                        reps: "5", 
                        rest: "3-4 min", 
                        notes: "80-85% 1RM",
                        image: "https://i.ibb.co/7KcPwbq/bench-press.jpg",
                        muscleGroup: "Pettorale, Deltoide anteriore, Tricipiti",
                        execution: "Focus sulla contrazione del pettorale"
                    },
                    { 
                        name: "Rematore con bilanciere", 
                        sets: "5", 
                        reps: "5", 
                        rest: "3 min", 
                        notes: "Tecnica impeccabile",
                        image: "https://i.ibb.co/YcRkjqF/barbell-row.jpg",
                        muscleGroup: "Gran dorsale, Trapezio",
                        execution: "Tira con il dorsale, non con le braccia"
                    }
                ],
                cooldown: "Stretching completo 10 min"
            }
        ]
    },
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
        icon: "sparkles",
        color: "bg-red-600",
        type: "Forza Speciale",
        method: "Rest Pause",
        sessions: [
            {
                day: "Lunedì",
                focus: "Petto + Spalle + Tricipiti",
                warmup: "10 min cardio + mobilità articolare",
                exercises: [
                    { 
                        name: "Crunch", 
                        sets: "3", 
                        reps: "15", 
                        rest: "30 sec", 
                        notes: "Addominali attivati",
                        image: "https://i.ibb.co/ZMq4wJh/crunch.jpg"
                    },
                    { 
                        name: "Distensione bilanciere panca piana (Rest Pause)", 
                        sets: "4", 
                        reps: "4+2+1", 
                        rest: "20 sec intra-serie, 2-3 min tra serie", 
                        notes: "4 reps + pausa 20sec + 2 reps + pausa 20sec + 1 rep. Carico per 4RM",
                        image: "https://i.ibb.co/7KcPwbq/bench-press.jpg",
                        muscleGroup: "Pettorale, Deltoidi, Tricipiti",
                        execution: "Metodo Rest Pause: prolunga l'intensità massimale con micro-pause"
                    },
                    { 
                        name: "Lento avanti (Rest Pause)", 
                        sets: "4", 
                        reps: "4+2+1", 
                        rest: "20 sec intra-serie, 2 min tra serie", 
                        notes: "Stessa logica Rest Pause",
                        image: "https://i.ibb.co/qNjvBnY/overhead-press.jpg",
                        muscleGroup: "Deltoidi, Trapezio, Tricipiti"
                    },
                    { 
                        name: "Panca stretta (Rest Pause)", 
                        sets: "4", 
                        reps: "4+2+1", 
                        rest: "20 sec intra-serie, 2 min tra serie", 
                        notes: "Focus tricipiti",
                        image: "https://i.ibb.co/7KcPwbq/bench-press.jpg",
                        muscleGroup: "Tricipiti, Pettorale interno",
                        execution: "Presa stretta, gomiti vicini al corpo"
                    }
                ],
                cooldown: "Stretching petto, spalle, tricipiti 5-10 min"
            },
            {
                day: "Martedì",
                focus: "Dorsali + Bicipiti",
                warmup: "10 min cardio + mobilità articolare",
                exercises: [
                    { 
                        name: "Crunch inverso", 
                        sets: "3", 
                        reps: "15", 
                        rest: "30 sec",
                        image: "https://i.ibb.co/ZMq4wJh/crunch.jpg"
                    },
                    { 
                        name: "Trazioni alla sbarra (Rest Pause)", 
                        sets: "4", 
                        reps: "max+max+max", 
                        rest: "20 sec intra-serie, 3 min tra serie", 
                        notes: "Vai al massimo, pausa 20 sec, ancora max reps per 3 volte",
                        image: "https://i.ibb.co/GVwBfxG/pull-ups.jpg",
                        muscleGroup: "Dorsale, Bicipiti, Trapezio"
                    },
                    { 
                        name: "Rematore bilanciere (Rest Pause)", 
                        sets: "4", 
                        reps: "4+2+1", 
                        rest: "20 sec intra-serie, 2 min tra serie",
                        image: "https://i.ibb.co/YcRkjqF/barbell-row.jpg",
                        muscleGroup: "Dorsale, Trapezio"
                    },
                    { 
                        name: "Curl bilanciere (Rest Pause)", 
                        sets: "4", 
                        reps: "4+2+1", 
                        rest: "20 sec intra-serie, 90 sec tra serie", 
                        notes: "Movimento biarticolare per bicipite completo",
                        image: "https://i.ibb.co/k8vQNJK/barbell-curl.jpg",
                        muscleGroup: "Bicipiti",
                        execution: "Movimento completo da massimo allungamento a massima contrazione"
                    }
                ],
                cooldown: "Stretching dorsali e braccia 5-10 min"
            },
            {
                day: "Giovedì",
                focus: "Gambe Completo",
                warmup: "10 min cardio + mobilità anche e ginocchia",
                exercises: [
                    { 
                        name: "Plank", 
                        sets: "3", 
                        reps: "60 sec", 
                        rest: "60 sec",
                        image: "https://i.ibb.co/ZMq4wJh/crunch.jpg"
                    },
                    { 
                        name: "Squat (Rest Pause)", 
                        sets: "4", 
                        reps: "4+2+1", 
                        rest: "20 sec intra-serie, 4 min tra serie", 
                        notes: "Il Rest Pause più duro del programma",
                        image: "https://i.ibb.co/9GBPLFT/squat.jpg",
                        muscleGroup: "Quadricipiti, Glutei, Femorali"
                    },
                    { 
                        name: "Stacco gambe tese", 
                        sets: "4", 
                        reps: "4+2+1", 
                        rest: "20 sec intra-serie, 3 min tra serie", 
                        notes: "Focus femorali",
                        image: "https://i.ibb.co/VqGhJdq/deadlift.jpg",
                        muscleGroup: "Femorali, Glutei, Erettori spinali"
                    },
                    { 
                        name: "Leg Extension", 
                        sets: "3", 
                        reps: "12-15", 
                        rest: "90 sec", 
                        notes: "Esercizio complementare per quadricipiti",
                        image: "https://i.ibb.co/SrYf0Bx/leg-extension.jpg",
                        muscleGroup: "Quadricipiti",
                        execution: "Monoarticolare, estensione completa contraendo il vasto"
                    }
                ],
                cooldown: "Stretching gambe completo 10 min"
            },
            {
                day: "Sabato",
                focus: "Upper Body Completo",
                warmup: "10 min cardio + mobilità",
                exercises: [
                    { 
                        name: "Crunch", 
                        sets: "3", 
                        reps: "15", 
                        rest: "30 sec",
                        image: "https://i.ibb.co/ZMq4wJh/crunch.jpg"
                    },
                    { 
                        name: "Panca piana (Rest Pause)", 
                        sets: "3", 
                        reps: "4+2+1", 
                        rest: "20 sec intra, 3 min tra serie",
                        image: "https://i.ibb.co/7KcPwbq/bench-press.jpg"
                    },
                    { 
                        name: "Lat Machine (Rest Pause)", 
                        sets: "3", 
                        reps: "4+2+1", 
                        rest: "20 sec intra, 2 min tra serie",
                        image: "https://i.ibb.co/GVwBfxG/pull-ups.jpg",
                        muscleGroup: "Dorsale, Bicipiti"
                    },
                    { 
                        name: "Alzate laterali manubri", 
                        sets: "3", 
                        reps: "12-15", 
                        rest: "90 sec", 
                        notes: "Esercizio complementare deltoidi",
                        image: "https://i.ibb.co/qNjvBnY/overhead-press.jpg",
                        muscleGroup: "Deltoide laterale",
                        execution: "Abduce la spalla sollevando il braccio lateralmente"
                    }
                ],
                cooldown: "Stretching completo 10 min"
            }
        ]
    },

    // OBIETTIVO 2: MASSA MUSCOLARE
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
        icon: "dumbbell",
        color: "bg-blue-600",
        type: "Ipertrofia",
        method: "Drop Set",
        sessions: [
            {
                day: "Lunedì",
                focus: "Petto + Tricipiti",
                warmup: "10 min cardio + 2 serie riscaldamento leggere",
                exercises: [
                    { 
                        name: "Crunch", 
                        sets: "3", 
                        reps: "15", 
                        rest: "30 sec",
                        image: "https://i.ibb.co/ZMq4wJh/crunch.jpg"
                    },
                    { 
                        name: "Distensione panca piana (Drop Set)", 
                        sets: "4", 
                        reps: "5 → 7 → 9 → 11", 
                        rest: "90 sec", 
                        notes: "Serie 1: 5 reps peso massimale. Serie 2: -10%, 7 reps. Serie 3: -10%, 9 reps. Serie 4: -10%, 11 reps",
                        image: "https://i.ibb.co/7KcPwbq/bench-press.jpg",
                        muscleGroup: "Pettorale, Deltoidi, Tricipiti",
                        execution: "Drop set: riduci carico e aumenta reps ad ogni serie senza pausa"
                    },
                    { 
                        name: "Croci manubri 30° (Drop Set)", 
                        sets: "4", 
                        reps: "8-12 drop", 
                        rest: "60 sec", 
                        notes: "Arriva al cedimento, togli 20-30%, continua senza pausa",
                        image: "https://i.ibb.co/7KcPwbq/bench-press.jpg",
                        muscleGroup: "Pettorale",
                        execution: "Esercizio complementare con grande stretch del pettorale"
                    },
                    { 
                        name: "Panca stretta (Drop Set)", 
                        sets: "4", 
                        reps: "5 → 7 → 9", 
                        rest: "90 sec",
                        image: "https://i.ibb.co/7KcPwbq/bench-press.jpg",
                        muscleGroup: "Tricipiti"
                    },
                    { 
                        name: "Push Down", 
                        sets: "3", 
                        reps: "12-15", 
                        rest: "60 sec", 
                        notes: "Complementare tricipiti",
                        image: "https://i.ibb.co/7KcPwbq/bench-press.jpg",
                        muscleGroup: "Tricipiti",
                        execution: "Esercizio monoarticolare di isolamento"
                    }
                ],
                cooldown: "Stretching petto e tricipiti 5 min"
            },
            {
                day: "Martedì",
                focus: "Dorsali + Bicipiti",
                warmup: "10 min cardio + mobilità spalle",
                exercises: [
                    { 
                        name: "Crunch inverso", 
                        sets: "3", 
                        reps: "15", 
                        rest: "30 sec",
                        image: "https://i.ibb.co/ZMq4wJh/crunch.jpg"
                    },
                    { 
                        name: "Trazioni alla sbarra (Drop Set)", 
                        sets: "4", 
                        reps: "max → max → max", 
                        rest: "90 sec", 
                        notes: "Inizia zavorrato, poi bodyweight, poi con elastico assistenza",
                        image: "https://i.ibb.co/GVwBfxG/pull-ups.jpg",
                        muscleGroup: "Dorsale, Bicipiti"
                    },
                    { 
                        name: "Rematore bilanciere (Drop Set)", 
                        sets: "4", 
                        reps: "5 → 7 → 9", 
                        rest: "90 sec",
                        image: "https://i.ibb.co/YcRkjqF/barbell-row.jpg",
                        muscleGroup: "Dorsale, Trapezio"
                    },
                    { 
                        name: "Pulley basso", 
                        sets: "3", 
                        reps: "10-12", 
                        rest: "60 sec", 
                        notes: "Complementare dorsale",
                        image: "https://i.ibb.co/YcRkjqF/barbell-row.jpg",
                        muscleGroup: "Dorsale"
                    },
                    { 
                        name: "Curl bilanciere (Drop Set)", 
                        sets: "4", 
                        reps: "5 → 7 → 9", 
                        rest: "60 sec",
                        image: "https://i.ibb.co/k8vQNJK/barbell-curl.jpg",
                        muscleGroup: "Bicipiti"
                    }
                ],
                cooldown: "Stretching dorsali e bicipiti 5 min"
            },
            {
                day: "Giovedì",
                focus: "Spalle + Trapezi",
                warmup: "10 min cardio + mobilità spalle e scapole",
                exercises: [
                    { 
                        name: "Plank", 
                        sets: "3", 
                        reps: "60 sec", 
                        rest: "60 sec",
                        image: "https://i.ibb.co/ZMq4wJh/crunch.jpg"
                    },
                    { 
                        name: "Lento avanti (Drop Set)", 
                        sets: "4", 
                        reps: "5 → 7 → 9", 
                        rest: "90 sec",
                        image: "https://i.ibb.co/qNjvBnY/overhead-press.jpg",
                        muscleGroup: "Deltoidi, Trapezio"
                    },
                    { 
                        name: "Alzate laterali (Drop Set)", 
                        sets: "4", 
                        reps: "10-15 drop", 
                        rest: "60 sec", 
                        notes: "Drop rapido -30% e continua",
                        image: "https://i.ibb.co/qNjvBnY/overhead-press.jpg",
                        muscleGroup: "Deltoide laterale"
                    },
                    { 
                        name: "Tirate al petto bilanciere", 
                        sets: "4", 
                        reps: "8-10", 
                        rest: "90 sec", 
                        notes: "Base per trapezi",
                        image: "https://i.ibb.co/qNjvBnY/overhead-press.jpg",
                        muscleGroup: "Trapezio, Deltoidi"
                    }
                ],
                cooldown: "Stretching spalle 5 min"
            },
            {
                day: "Sabato",
                focus: "Gambe Completo",
                warmup: "10 min cardio + mobilità anche",
                exercises: [
                    { 
                        name: "Crunch", 
                        sets: "3", 
                        reps: "15", 
                        rest: "30 sec",
                        image: "https://i.ibb.co/ZMq4wJh/crunch.jpg"
                    },
                    { 
                        name: "Squat (Drop Set)", 
                        sets: "4", 
                        reps: "5 → 7 → 9 → 11", 
                        rest: "2 min", 
                        notes: "Drop set progressivo, massima intensità",
                        image: "https://i.ibb.co/9GBPLFT/squat.jpg",
                        muscleGroup: "Quadricipiti, Glutei"
                    },
                    { 
                        name: "Leg Extension (Drop Set)", 
                        sets: "3", 
                        reps: "12-20 drop", 
                        rest: "60 sec",
                        image: "https://i.ibb.co/SrYf0Bx/leg-extension.jpg",
                        muscleGroup: "Quadricipiti"
                    },
                    { 
                        name: "Leg Curl (Drop Set)", 
                        sets: "3", 
                        reps: "12-20 drop", 
                        rest: "60 sec",
                        image: "https://i.ibb.co/VqGhJdq/deadlift.jpg",
                        muscleGroup: "Femorali"
                    },
                    { 
                        name: "Calf in piedi", 
                        sets: "4", 
                        reps: "15-20", 
                        rest: "60 sec", 
                        notes: "Leva di 2° tipo - vantaggiosa",
                        image: "https://i.ibb.co/9GBPLFT/squat.jpg",
                        muscleGroup: "Gastrocnemio"
                    }
                ],
                cooldown: "Stretching gambe completo 10 min"
            }
        ]
    },
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
        icon: "dumbbell",
        color: "bg-blue-700",
        type: "Ipertrofia Avanzata",
        method: "Superset",
        sessions: [
            {
                day: "Lunedì",
                focus: "Petto + Tricipiti",
                warmup: "10 min cardio leggero",
                exercises: [
                    { 
                        name: "Crunch", 
                        sets: "3", 
                        reps: "15", 
                        rest: "30 sec",
                        image: "https://i.ibb.co/ZMq4wJh/crunch.jpg"
                    },
                    { 
                        name: "SUPERSET: Croci manubri + Panca piana", 
                        sets: "4", 
                        reps: "8-10 + 6-8", 
                        rest: "no pausa tra esercizi, 2 min tra superset", 
                        notes: "Esaurisci con complementare, poi passa a base senza fermarti",
                        image: "https://i.ibb.co/7KcPwbq/bench-press.jpg",
                        muscleGroup: "Pettorale",
                        execution: "Superset: complementare + base, massimizza pompaggio e reclutamento"
                    },
                    { 
                        name: "SUPERSET: Push down + Panca stretta", 
                        sets: "4", 
                        reps: "10-12 + 6-8", 
                        rest: "no pausa, 90 sec tra superset",
                        image: "https://i.ibb.co/7KcPwbq/bench-press.jpg",
                        muscleGroup: "Tricipiti"
                    }
                ],
                cooldown: "Stretching 5 min"
            },
            {
                day: "Martedì",
                focus: "Dorsali + Bicipiti",
                warmup: "10 min cardio",
                exercises: [
                    { 
                        name: "Crunch inverso", 
                        sets: "3", 
                        reps: "15", 
                        rest: "30 sec",
                        image: "https://i.ibb.co/ZMq4wJh/crunch.jpg"
                    },
                    { 
                        name: "SUPERSET: Pulley + Trazioni sbarra", 
                        sets: "4", 
                        reps: "8-10 + max", 
                        rest: "no pausa, 2 min tra superset",
                        image: "https://i.ibb.co/GVwBfxG/pull-ups.jpg",
                        muscleGroup: "Dorsale"
                    },
                    { 
                        name: "SUPERSET: Curl concentrato + Curl bilanciere", 
                        sets: "4", 
                        reps: "10 + 6-8", 
                        rest: "no pausa, 90 sec tra superset",
                        image: "https://i.ibb.co/k8vQNJK/barbell-curl.jpg",
                        muscleGroup: "Bicipiti",
                        execution: "Pre-esaurisci con monoarticolare, completa con base"
                    }
                ],
                cooldown: "Stretching 5 min"
            },
            {
                day: "Giovedì",
                focus: "Spalle",
                warmup: "10 min cardio",
                exercises: [
                    { 
                        name: "Plank", 
                        sets: "3", 
                        reps: "60 sec", 
                        rest: "60 sec",
                        image: "https://i.ibb.co/ZMq4wJh/crunch.jpg"
                    },
                    { 
                        name: "SUPERSET: Alzate laterali + Lento avanti", 
                        sets: "4", 
                        reps: "12-15 + 8-10", 
                        rest: "no pausa, 2 min tra superset",
                        image: "https://i.ibb.co/qNjvBnY/overhead-press.jpg",
                        muscleGroup: "Deltoidi"
                    },
                    { 
                        name: "SUPERSET: Alzate posteriori + Tirate al petto", 
                        sets: "3", 
                        reps: "12 + 10", 
                        rest: "no pausa, 90 sec tra superset",
                        image: "https://i.ibb.co/qNjvBnY/overhead-press.jpg",
                        muscleGroup: "Deltoide posteriore, Trapezio"
                    }
                ],
                cooldown: "Stretching 5 min"
            },
            {
                day: "Sabato",
                focus: "Gambe",
                warmup: "10 min cardio + mobilità",
                exercises: [
                    { 
                        name: "Crunch", 
                        sets: "3", 
                        reps: "15", 
                        rest: "30 sec",
                        image: "https://i.ibb.co/ZMq4wJh/crunch.jpg"
                    },
                    { 
                        name: "SUPERSET: Leg Extension + Squat", 
                        sets: "4", 
                        reps: "12 + 8-10", 
                        rest: "no pausa, 3 min tra superset", 
                        notes: "Pre-affatica quadricipiti poi squat pesante",
                        image: "https://i.ibb.co/9GBPLFT/squat.jpg",
                        muscleGroup: "Quadricipiti, Glutei"
                    },
                    { 
                        name: "SUPERSET: Leg Curl + Stacco gambe tese", 
                        sets: "4", 
                        reps: "12 + 8-10", 
                        rest: "no pausa, 2 min tra superset",
                        image: "https://i.ibb.co/VqGhJdq/deadlift.jpg",
                        muscleGroup: "Femorali, Glutei"
                    }
                ],
                cooldown: "Stretching gambe 10 min"
            }
        ]
    },

    // OBIETTIVO 3: VOLUME E SHAPE
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
        icon: "target",
        color: "bg-purple-600",
        type: "Volume e Forma",
        method: "POF",
        sessions: [
            {
                day: "Lunedì",
                focus: "Petto - 3 Angolazioni POF",
                warmup: "10 min cardio",
                exercises: [
                    { 
                        name: "Crunch", 
                        sets: "3", 
                        reps: "15", 
                        rest: "30 sec",
                        image: "https://i.ibb.co/ZMq4wJh/crunch.jpg"
                    },
                    { 
                        name: "Panca piana (Contrazione Media)", 
                        sets: "4", 
                        reps: "8-10", 
                        rest: "90 sec", 
                        notes: "POF 1/3: contrazione nella posizione media del movimento",
                        image: "https://i.ibb.co/7KcPwbq/bench-press.jpg",
                        muscleGroup: "Pettorale",
                        execution: "Movimento completo che coinvolge il pettorale in tutta la sua escursione"
                    },
                    { 
                        name: "Croci manubri (Massimo Stiramento)", 
                        sets: "4", 
                        reps: "10-12", 
                        rest: "90 sec", 
                        notes: "POF 2/3: massimo allungamento del pettorale",
                        image: "https://i.ibb.co/7KcPwbq/bench-press.jpg",
                        muscleGroup: "Pettorale",
                        execution: "Focus sullo stretch massimo del pettorale nella fase eccentrica"
                    },
                    { 
                        name: "Pectoral Machine (Picco Contrazione)", 
                        sets: "4", 
                        reps: "12-15", 
                        rest: "60 sec", 
                        notes: "POF 3/3: contrazione massima quando le mani si incontrano",
                        image: "https://i.ibb.co/7KcPwbq/bench-press.jpg",
                        muscleGroup: "Pettorale",
                        execution: "Contrai al massimo al termine del movimento, picco di contrazione"
                    }
                ],
                cooldown: "Stretching pettorale 5 min"
            },
            {
                day: "Martedì",
                focus: "Dorsali - 3 Angolazioni POF",
                warmup: "10 min cardio",
                exercises: [
                    { 
                        name: "Crunch inverso", 
                        sets: "3", 
                        reps: "15", 
                        rest: "30 sec",
                        image: "https://i.ibb.co/ZMq4wJh/crunch.jpg"
                    },
                    { 
                        name: "Rematore bilanciere (Contrazione Media)", 
                        sets: "4", 
                        reps: "8-10", 
                        rest: "90 sec",
                        image: "https://i.ibb.co/YcRkjqF/barbell-row.jpg",
                        muscleGroup: "Dorsale"
                    },
                    { 
                        name: "Pull over manubri (Massimo Stiramento)", 
                        sets: "4", 
                        reps: "10-12", 
                        rest: "90 sec", 
                        notes: "Allungamento massimo del gran dorsale",
                        image: "https://i.ibb.co/GVwBfxG/pull-ups.jpg",
                        muscleGroup: "Dorsale, Grande rotondo",
                        execution: "Abbassa manubrio dietro la testa per massimo stretch del dorsale"
                    },
                    { 
                        name: "Pulldown braccia tese (Picco Contrazione)", 
                        sets: "4", 
                        reps: "12-15", 
                        rest: "60 sec",
                        image: "https://i.ibb.co/GVwBfxG/pull-ups.jpg",
                        muscleGroup: "Dorsale",
                        execution: "Massima contrazione del dorsale a braccia tese"
                    }
                ],
                cooldown: "Stretching dorsale 5 min"
            },
            {
                day: "Giovedì",
                focus: "Spalle - 3 Angolazioni POF",
                warmup: "10 min cardio + mobilità spalle",
                exercises: [
                    { 
                        name: "Plank", 
                        sets: "3", 
                        reps: "60 sec", 
                        rest: "60 sec",
                        image: "https://i.ibb.co/ZMq4wJh/crunch.jpg"
                    },
                    { 
                        name: "Lento avanti (Contrazione Media)", 
                        sets: "4", 
                        reps: "8-10", 
                        rest: "90 sec",
                        image: "https://i.ibb.co/qNjvBnY/overhead-press.jpg",
                        muscleGroup: "Deltoidi"
                    },
                    { 
                        name: "Alzate laterali inclinate (Massimo Stiramento)", 
                        sets: "4", 
                        reps: "12-15", 
                        rest: "60 sec", 
                        notes: "Decubito laterale per massimo stretch",
                        image: "https://i.ibb.co/qNjvBnY/overhead-press.jpg",
                        muscleGroup: "Deltoide laterale"
                    },
                    { 
                        name: "Alzate laterali cavi (Picco Contrazione)", 
                        sets: "4", 
                        reps: "15", 
                        rest: "60 sec",
                        image: "https://i.ibb.co/qNjvBnY/overhead-press.jpg",
                        muscleGroup: "Deltoide laterale"
                    }
                ],
                cooldown: "Stretching spalle 5 min"
            },
            {
                day: "Sabato",
                focus: "Gambe - 3 Angolazioni POF",
                warmup: "10 min cardio + mobilità",
                exercises: [
                    { 
                        name: "Crunch", 
                        sets: "3", 
                        reps: "15", 
                        rest: "30 sec",
                        image: "https://i.ibb.co/ZMq4wJh/crunch.jpg"
                    },
                    { 
                        name: "Squat (Contrazione Media)", 
                        sets: "4", 
                        reps: "10-12", 
                        rest: "2 min",
                        image: "https://i.ibb.co/9GBPLFT/squat.jpg",
                        muscleGroup: "Quadricipiti, Glutei"
                    },
                    { 
                        name: "Sissy Squat (Massimo Stiramento)", 
                        sets: "3", 
                        reps: "12-15", 
                        rest: "90 sec", 
                        notes: "Allungamento estremo quadricipiti",
                        image: "https://i.ibb.co/9GBPLFT/squat.jpg",
                        muscleGroup: "Quadricipiti"
                    },
                    { 
                        name: "Leg Extension (Picco Contrazione)", 
                        sets: "4", 
                        reps: "15-20", 
                        rest: "60 sec",
                        image: "https://i.ibb.co/SrYf0Bx/leg-extension.jpg",
                        muscleGroup: "Quadricipiti"
                    },
                    { 
                        name: "Leg Curl", 
                        sets: "4", 
                        reps: "12-15", 
                        rest: "60 sec",
                        image: "https://i.ibb.co/VqGhJdq/deadlift.jpg",
                        muscleGroup: "Femorali"
                    }
                ],
                cooldown: "Stretching gambe 10 min"
            }
        ]
    },
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
        icon: "target",
        color: "bg-purple-500",
        type: "Volume Dettagliato",
        method: "Metodo 21",
        sessions: [
            {
                day: "Lunedì",
                focus: "Petto + Tricipiti - Metodo 21",
                warmup: "10 min cardio",
                exercises: [
                    { 
                        name: "Crunch", 
                        sets: "3", 
                        reps: "15", 
                        rest: "30 sec",
                        image: "https://i.ibb.co/ZMq4wJh/crunch.jpg"
                    },
                    { 
                        name: "Panca piana (Metodo 21)", 
                        sets: "4", 
                        reps: "7+7+7", 
                        rest: "90 sec", 
                        notes: "7 reps parte bassa + 7 reps parte alta + 7 reps complete = 21 totali",
                        image: "https://i.ibb.co/7KcPwbq/bench-press.jpg",
                        muscleGroup: "Pettorale",
                        execution: "Prima metà movimento (7), seconda metà (7), complete (7)"
                    },
                    { 
                        name: "Croci manubri (Standard)", 
                        sets: "3", 
                        reps: "12-15", 
                        rest: "60 sec",
                        image: "https://i.ibb.co/7KcPwbq/bench-press.jpg"
                    },
                    { 
                        name: "French Press (Metodo 21)", 
                        sets: "4", 
                        reps: "7+7+7", 
                        rest: "60 sec",
                        image: "https://i.ibb.co/7KcPwbq/bench-press.jpg",
                        muscleGroup: "Tricipiti"
                    }
                ],
                cooldown: "Stretching 5 min"
            },
            {
                day: "Martedì",
                focus: "Dorsali + Bicipiti - Metodo 21",
                warmup: "10 min cardio",
                exercises: [
                    { 
                        name: "Crunch inverso", 
                        sets: "3", 
                        reps: "15", 
                        rest: "30 sec",
                        image: "https://i.ibb.co/ZMq4wJh/crunch.jpg"
                    },
                    { 
                        name: "Lat Machine (Metodo 21)", 
                        sets: "4", 
                        reps: "7+7+7", 
                        rest: "90 sec",
                        image: "https://i.ibb.co/GVwBfxG/pull-ups.jpg",
                        muscleGroup: "Dorsale"
                    },
                    { 
                        name: "Pulley (Standard)", 
                        sets: "3", 
                        reps: "12-15", 
                        rest: "60 sec",
                        image: "https://i.ibb.co/YcRkjqF/barbell-row.jpg"
                    },
                    { 
                        name: "Curl bilanciere (Metodo 21)", 
                        sets: "4", 
                        reps: "7+7+7", 
                        rest: "60 sec", 
                        notes: "Il metodo 21 più famoso! Perfetto per bicipiti",
                        image: "https://i.ibb.co/k8vQNJK/barbell-curl.jpg",
                        muscleGroup: "Bicipiti",
                        execution: "7 bottom, 7 top, 7 full range"
                    }
                ],
                cooldown: "Stretching 5 min"
            },
            {
                day: "Giovedì",
                focus: "Spalle - Metodo 21",
                warmup: "10 min cardio",
                exercises: [
                    { 
                        name: "Plank", 
                        sets: "3", 
                        reps: "60 sec", 
                        rest: "60 sec",
                        image: "https://i.ibb.co/ZMq4wJh/crunch.jpg"
                    },
                    { 
                        name: "Lento manubri (Metodo 21)", 
                        sets: "4", 
                        reps: "7+7+7", 
                        rest: "90 sec",
                        image: "https://i.ibb.co/qNjvBnY/overhead-press.jpg",
                        muscleGroup: "Deltoidi"
                    },
                    { 
                        name: "Alzate laterali (Metodo 21)", 
                        sets: "4", 
                        reps: "7+7+7", 
                        rest: "60 sec",
                        image: "https://i.ibb.co/qNjvBnY/overhead-press.jpg"
                    }
                ],
                cooldown: "Stretching 5 min"
            },
            {
                day: "Sabato",
                focus: "Gambe - Metodo 21",
                warmup: "10 min cardio",
                exercises: [
                    { 
                        name: "Crunch", 
                        sets: "3", 
                        reps: "15", 
                        rest: "30 sec",
                        image: "https://i.ibb.co/ZMq4wJh/crunch.jpg"
                    },
                    { 
                        name: "Leg Press (Metodo 21)", 
                        sets: "4", 
                        reps: "7+7+7", 
                        rest: "2 min",
                        image: "https://i.ibb.co/9GBPLFT/squat.jpg",
                        muscleGroup: "Quadricipiti, Glutei"
                    },
                    { 
                        name: "Leg Extension (Metodo 21)", 
                        sets: "3", 
                        reps: "7+7+7", 
                        rest: "60 sec",
                        image: "https://i.ibb.co/SrYf0Bx/leg-extension.jpg"
                    },
                    { 
                        name: "Leg Curl (Metodo 21)", 
                        sets: "3", 
                        reps: "7+7+7", 
                        rest: "60 sec",
                        image: "https://i.ibb.co/VqGhJdq/deadlift.jpg"
                    }
                ],
                cooldown: "Stretching 10 min"
            }
        ]
    },

    // OBIETTIVO 4: DETTAGLI ESTETICI (PUMP)
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
        icon: "zap",
        color: "bg-pink-600",
        type: "Pump Estetico",
        method: "Stripping",
        sessions: [
            {
                day: "Lunedì",
                focus: "Petto + Spalle + Tricipiti",
                warmup: "10 min cardio",
                exercises: [
                    { 
                        name: "Crunch", 
                        sets: "3", 
                        reps: "15", 
                        rest: "30 sec",
                        image: "https://i.ibb.co/ZMq4wJh/crunch.jpg"
                    },
                    { 
                        name: "Panca piana (Stripping)", 
                        sets: "5", 
                        reps: "6-4-4", 
                        rest: "90 sec", 
                        notes: "6 reps peso X, togli 20% NO PAUSA, 4 reps, togli altro 20% NO PAUSA, 4 reps. Totale 14 reps continuit",
                        image: "https://i.ibb.co/7KcPwbq/bench-press.jpg",
                        muscleGroup: "Pettorale",
                        execution: "Stripping: 3 drop consecutivi senza pausa per ultra-pompaggio"
                    },
                    { 
                        name: "Croci manubri (Rifinitura)", 
                        sets: "3", 
                        reps: "12-15", 
                        rest: "60 sec",
                        image: "https://i.ibb.co/7KcPwbq/bench-press.jpg"
                    },
                    { 
                        name: "Alzate laterali (Stripping)", 
                        sets: "5", 
                        reps: "6-4-4", 
                        rest: "60 sec",
                        image: "https://i.ibb.co/qNjvBnY/overhead-press.jpg",
                        muscleGroup: "Deltoidi"
                    },
                    { 
                        name: "Push down (Stripping)", 
                        sets: "5", 
                        reps: "6-4-4", 
                        rest: "60 sec",
                        image: "https://i.ibb.co/7KcPwbq/bench-press.jpg",
                        muscleGroup: "Tricipiti"
                    }
                ],
                cooldown: "Stretching 5 min"
            },
            {
                day: "Martedì",
                focus: "Dorsali + Bicipiti",
                warmup: "10 min cardio",
                exercises: [
                    { 
                        name: "Crunch inverso", 
                        sets: "3", 
                        reps: "15", 
                        rest: "30 sec",
                        image: "https://i.ibb.co/ZMq4wJh/crunch.jpg"
                    },
                    { 
                        name: "Lat Machine (Stripping)", 
                        sets: "5", 
                        reps: "6-4-4", 
                        rest: "90 sec",
                        image: "https://i.ibb.co/GVwBfxG/pull-ups.jpg",
                        muscleGroup: "Dorsale"
                    },
                    { 
                        name: "Pulley (Rifinitura)", 
                        sets: "3", 
                        reps: "12-15", 
                        rest: "60 sec",
                        image: "https://i.ibb.co/YcRkjqF/barbell-row.jpg"
                    },
                    { 
                        name: "Curl bilanciere (Stripping)", 
                        sets: "5", 
                        reps: "6-4-4", 
                        rest: "60 sec",
                        image: "https://i.ibb.co/k8vQNJK/barbell-curl.jpg",
                        muscleGroup: "Bicipiti"
                    }
                ],
                cooldown: "Stretching 5 min"
            },
            {
                day: "Mercoledì",
                focus: "Gambe",
                warmup: "10 min cardio",
                exercises: [
                    { 
                        name: "Plank", 
                        sets: "3", 
                        reps: "60 sec", 
                        rest: "60 sec",
                        image: "https://i.ibb.co/ZMq4wJh/crunch.jpg"
                    },
                    { 
                        name: "Leg Press (Stripping)", 
                        sets: "5", 
                        reps: "6-4-4", 
                        rest: "2 min",
                        image: "https://i.ibb.co/9GBPLFT/squat.jpg",
                        muscleGroup: "Quadricipiti, Glutei"
                    },
                    { 
                        name: "Leg Extension (Stripping)", 
                        sets: "5", 
                        reps: "6-4-4", 
                        rest: "60 sec",
                        image: "https://i.ibb.co/SrYf0Bx/leg-extension.jpg"
                    },
                    { 
                        name: "Leg Curl (Stripping)", 
                        sets: "5", 
                        reps: "6-4-4", 
                        rest: "60 sec",
                        image: "https://i.ibb.co/VqGhJdq/deadlift.jpg"
                    }
                ],
                cooldown: "Stretching 10 min"
            },
            {
                day: "Venerdì",
                focus: "Upper Body",
                warmup: "10 min cardio",
                exercises: [
                    { 
                        name: "Crunch", 
                        sets: "3", 
                        reps: "15", 
                        rest: "30 sec",
                        image: "https://i.ibb.co/ZMq4wJh/crunch.jpg"
                    },
                    { 
                        name: "Panca 30° (Stripping)", 
                        sets: "4", 
                        reps: "6-4-4", 
                        rest: "90 sec",
                        image: "https://i.ibb.co/7KcPwbq/bench-press.jpg"
                    },
                    { 
                        name: "Rematore (Stripping)", 
                        sets: "4", 
                        reps: "6-4-4", 
                        rest: "90 sec",
                        image: "https://i.ibb.co/YcRkjqF/barbell-row.jpg"
                    },
                    { 
                        name: "Lento manubri (Stripping)", 
                        sets: "4", 
                        reps: "6-4-4", 
                        rest: "60 sec",
                        image: "https://i.ibb.co/qNjvBnY/overhead-press.jpg"
                    }
                ],
                cooldown: "Stretching 5 min"
            },
            {
                day: "Sabato",
                focus: "Pump Day - Braccia",
                warmup: "10 min cardio",
                exercises: [
                    { 
                        name: "Plank", 
                        sets: "3", 
                        reps: "60 sec", 
                        rest: "60 sec",
                        image: "https://i.ibb.co/ZMq4wJh/crunch.jpg"
                    },
                    { 
                        name: "Curl bilanciere (Stripping)", 
                        sets: "6", 
                        reps: "6-4-4", 
                        rest: "60 sec",
                        image: "https://i.ibb.co/k8vQNJK/barbell-curl.jpg",
                        muscleGroup: "Bicipiti"
                    },
                    { 
                        name: "Panca stretta (Stripping)", 
                        sets: "6", 
                        reps: "6-4-4", 
                        rest: "60 sec",
                        image: "https://i.ibb.co/7KcPwbq/bench-press.jpg",
                        muscleGroup: "Tricipiti"
                    }
                ],
                cooldown: "Stretching braccia 10 min"
            }
        ]
    },
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
        icon: "zap",
        color: "bg-pink-700",
        type: "Pump Estremo",
        method: "Gironda 8×8",
        sessions: [
            {
                day: "Lunedì",
                focus: "Petto + Tricipiti",
                warmup: "10 min cardio",
                exercises: [
                    { name: "Crunch", sets: "5", reps: "15", rest: "20 sec", image: "https://i.ibb.co/ZMq4wJh/crunch.jpg" },
                    { name: "Panca piana (Gironda 8x8)", sets: "8", reps: "8", rest: "30 sec", notes: "8 serie x 8 reps con SOLO 30 sec recupero! Pompa estrema", image: "https://i.ibb.co/7KcPwbq/bench-press.jpg", muscleGroup: "Pettorale", execution: "Metodo Gironda: 64 reps totali con recupero minimo" },
                    { name: "Pectoral machine (rifinitura)", sets: "2", reps: "10", rest: "60 sec", image: "https://i.ibb.co/7KcPwbq/bench-press.jpg" },
                    { name: "Push down (Gironda 8x8)", sets: "8", reps: "8", rest: "30 sec", image: "https://i.ibb.co/7KcPwbq/bench-press.jpg", muscleGroup: "Tricipiti" }
                ],
                cooldown: "Stretching 5 min"
            },
            {
                day: "Martedì",
                focus: "Dorsali + Bicipiti",
                warmup: "10 min cardio",
                exercises: [
                    { name: "Crunch inverso", sets: "5", reps: "15", rest: "20 sec", image: "https://i.ibb.co/ZMq4wJh/crunch.jpg" },
                    { name: "Lat Machine (Gironda 8x8)", sets: "8", reps: "8", rest: "30 sec", image: "https://i.ibb.co/GVwBfxG/pull-ups.jpg", muscleGroup: "Dorsale" },
                    { name: "Pulley (rifinitura)", sets: "2", reps: "10", rest: "60 sec", image: "https://i.ibb.co/YcRkjqF/barbell-row.jpg" },
                    { name: "Curl bil AZ (Gironda 8x8)", sets: "8", reps: "8", rest: "30 sec", image: "https://i.ibb.co/k8vQNJK/barbell-curl.jpg", muscleGroup: "Bicipiti" }
                ],
                cooldown: "Stretching 5 min"
            },
            {
                day: "Mercoledì",
                focus: "Gambe",
                warmup: "10 min cardio",
                exercises: [
                    { name: "Plank", sets: "3", reps: "60 sec", rest: "60 sec", image: "https://i.ibb.co/ZMq4wJh/crunch.jpg" },
                    { name: "Leg Press (Gironda 8x8)", sets: "8", reps: "8", rest: "30 sec", image: "https://i.ibb.co/9GBPLFT/squat.jpg", muscleGroup: "Quadricipiti, Glutei" },
                    { name: "Leg Curl (Gironda 8x8)", sets: "8", reps: "8", rest: "30 sec", image: "https://i.ibb.co/VqGhJdq/deadlift.jpg" }
                ],
                cooldown: "Stretching 10 min"
            },
            {
                day: "Giovedì",
                focus: "Spalle",
                warmup: "10 min cardio",
                exercises: [
                    { name: "Crunch", sets: "5", reps: "15", rest: "20 sec", image: "https://i.ibb.co/ZMq4wJh/crunch.jpg" },
                    { name: "Alzate laterali (Gironda 8x8)", sets: "8", reps: "8", rest: "30 sec", image: "https://i.ibb.co/qNjvBnY/overhead-press.jpg", muscleGroup: "Deltoidi" },
                    { name: "Alzate posteriori (rifinitura)", sets: "2", reps: "10", rest: "60 sec", image: "https://i.ibb.co/qNjvBnY/overhead-press.jpg" }
                ],
                cooldown: "Stretching 5 min"
            },
            {
                day: "Venerdì",
                focus: "Upper Body",
                warmup: "10 min cardio",
                exercises: [
                    { name: "Crunch inverso", sets: "5", reps: "15", rest: "20 sec", image: "https://i.ibb.co/ZMq4wJh/crunch.jpg" },
                    { name: "Panca 30° (Gironda 8x8)", sets: "8", reps: "8", rest: "30 sec", image: "https://i.ibb.co/7KcPwbq/bench-press.jpg" },
                    { name: "Rematore (Gironda 8x8)", sets: "8", reps: "8", rest: "30 sec", image: "https://i.ibb.co/YcRkjqF/barbell-row.jpg" }
                ],
                cooldown: "Stretching 5 min"
            },
            {
                day: "Sabato",
                focus: "Braccia Pump",
                warmup: "10 min cardio",
                exercises: [
                    { name: "Plank", sets: "3", reps: "60 sec", rest: "60 sec", image: "https://i.ibb.co/ZMq4wJh/crunch.jpg" },
                    { name: "Curl manubri (Gironda 8x8)", sets: "8", reps: "8", rest: "30 sec", image: "https://i.ibb.co/k8vQNJK/barbell-curl.jpg", muscleGroup: "Bicipiti" },
                    { name: "French press (Gironda 8x8)", sets: "8", reps: "8", rest: "30 sec", image: "https://i.ibb.co/7KcPwbq/bench-press.jpg", muscleGroup: "Tricipiti" }
                ],
                cooldown: "Stretching 10 min"
            }
        ]
    },

    // PROGRAMMI UNIVERSALI
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
        icon: "activity",
        color: "bg-green-500",
        type: "Cardio",
        method: "Universale",
        sessions: [
            {
                day: "Lunedì",
                focus: "Cardio + Gambe",
                warmup: "5 min mobilità articolare",
                exercises: [
                    { name: "Cyclette/Tapis", sets: "1", reps: "20 min", rest: "-", notes: "Zona aerobica 65-75% FCMax", image: "https://i.ibb.co/9GBPLFT/squat.jpg", muscleGroup: "Sistema cardiovascolare", execution: "Mantieni ritmo costante, respiro regolare" },
                    { name: "Squat bodyweight", sets: "3", reps: "15-20", rest: "60 sec", image: "https://i.ibb.co/9GBPLFT/squat.jpg" },
                    { name: "Affondi alternati", sets: "3", reps: "12+12", rest: "60 sec", image: "https://i.ibb.co/9GBPLFT/squat.jpg" },
                    { name: "Burpees", sets: "3", reps: "10", rest: "60 sec", notes: "Esercizio funzionale completo", image: "https://i.ibb.co/9GBPLFT/squat.jpg" }
                ],
                cooldown: "10 min cardio leggero + stretching"
            },
            {
                day: "Mercoledì",
                focus: "Circuito Upper Body",
                warmup: "5 min cardio + mobilità",
                exercises: [
                    { name: "Circuit Training", sets: "3 giri", reps: "vedi note", rest: "2 min tra giri", notes: "Piegamenti x15, Trazioni assistite x10, Alzate lat x12, Crunch x20, Plank 45sec. NO PAUSA tra esercizi", image: "https://i.ibb.co/7KcPwbq/bench-press.jpg", muscleGroup: "Upper Body completo", execution: "Esegui tutti gli esercizi in sequenza senza fermarti" }
                ],
                cooldown: "Stretching upper body 10 min"
            },
            {
                day: "Venerdì",
                focus: "Cardio HIIT",
                warmup: "5 min mobilità",
                exercises: [
                    { name: "HIIT Intervals", sets: "10", reps: "30 sec sprint / 30 sec recupero", rest: "-", notes: "Alternanza alta-bassa intensità", image: "https://i.ibb.co/9GBPLFT/squat.jpg", muscleGroup: "Sistema cardiovascolare", execution: "30 sec massima intensità, 30 sec recupero attivo. Ripeti 10 volte" },
                    { name: "Mountain Climbers", sets: "3", reps: "20+20", rest: "45 sec", image: "https://i.ibb.co/9GBPLFT/squat.jpg" },
                    { name: "Jump Squats", sets: "3", reps: "12", rest: "60 sec", image: "https://i.ibb.co/9GBPLFT/squat.jpg" }
                ],
                cooldown: "10 min defaticamento + stretching"
            },
            {
                day: "Domenica",
                focus: "Active Recovery",
                warmup: "5 min camminata",
                exercises: [
                    { name: "Camminata veloce/Jogging leggero", sets: "1", reps: "30 min", rest: "-", notes: "Recupero attivo, bassa intensità", image: "https://i.ibb.co/9GBPLFT/squat.jpg" },
                    { name: "Yoga/Stretching", sets: "1", reps: "15 min", rest: "-", image: "https://i.ibb.co/ZMq4wJh/crunch.jpg" }
                ],
                cooldown: "Rilassamento 5 min"
            }
        ]
    },
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
        icon: "heart",
        color: "bg-teal-500",
        type: "Generale",
        method: "Universale",
        sessions: [
            {
                day: "Lunedì",
                focus: "Full Body Leggero",
                warmup: "10 min cardio leggero",
                exercises: [
                    { name: "Crunch", sets: "3", reps: "15", rest: "45 sec", image: "https://i.ibb.co/ZMq4wJh/crunch.jpg" },
                    { name: "Panca piana", sets: "3", reps: "12-15", rest: "90 sec", notes: "Carico moderato, tecnica perfetta", image: "https://i.ibb.co/7KcPwbq/bench-press.jpg", muscleGroup: "Pettorale" },
                    { name: "Lat Machine", sets: "3", reps: "12-15", rest: "90 sec", image: "https://i.ibb.co/GVwBfxG/pull-ups.jpg", muscleGroup: "Dorsale" },
                    { name: "Alzate laterali", sets: "3", reps: "12-15", rest: "60 sec", image: "https://i.ibb.co/qNjvBnY/overhead-press.jpg", muscleGroup: "Deltoidi" },
                    { name: "Leg Press", sets: "3", reps: "15", rest: "90 sec", image: "https://i.ibb.co/9GBPLFT/squat.jpg", muscleGroup: "Gambe" }
                ],
                cooldown: "Stretching completo 10 min"
            },
            {
                day: "Mercoledì",
                focus: "Cardio + Core",
                warmup: "5 min mobilità articolare",
                exercises: [
                    { name: "Cyclette", sets: "1", reps: "20 min", rest: "-", notes: "Ritmo confortevole 60-70% FCMax", image: "https://i.ibb.co/9GBPLFT/squat.jpg" },
                    { name: "Plank", sets: "3", reps: "45-60 sec", rest: "60 sec", image: "https://i.ibb.co/ZMq4wJh/crunch.jpg", muscleGroup: "Core" },
                    { name: "Crunch completi", sets: "3", reps: "20", rest: "45 sec", image: "https://i.ibb.co/ZMq4wJh/crunch.jpg" },
                    { name: "Obliqui alternati", sets: "3", reps: "15+15", rest: "45 sec", image: "https://i.ibb.co/ZMq4wJh/crunch.jpg", muscleGroup: "Obliqui", execution: "Torsioni alternate del tronco" }
                ],
                cooldown: "Stretching addominali 5 min"
            },
            {
                day: "Venerdì",
                focus: "Tonificazione Generale",
                warmup: "10 min cardio leggero",
                exercises: [
                    { name: "Circuit Training Total Body", sets: "3 giri", reps: "vedi note", rest: "2 min tra giri", notes: "Piegamenti x12, Squat x15, Rematore x12, Affondi x10+10, Alzate lat x12, Plank 45sec. NO PAUSA tra esercizi", image: "https://i.ibb.co/7KcPwbq/bench-press.jpg", muscleGroup: "Total Body", execution: "Circuito completo per tonificazione generale" }
                ],
                cooldown: "Stretching completo 15 min"
            }
        ]
    }
];

// ========== GOAL OPTIONS (da PersonalCard.tsx) ==========

const goalOptions = [
    {
        id: "strength",
        title: "Forza",
        description: "Carichi elevati, sistema nervoso, coordinazione",
        icon: "sparkles",
        color: "bg-orange-600"
    },
    {
        id: "muscle",
        title: "Massa Muscolare",
        description: "Ipertrofia, volume, spessore muscolare",
        icon: "dumbbell",
        color: "bg-blue-600"
    },
    {
        id: "shape",
        title: "Volume e Shape",
        description: "Forma muscolare, angolazioni, simmetria",
        icon: "target",
        color: "bg-purple-600"
    },
    {
        id: "pump",
        title: "Dettagli Estetici",
        description: "Pompaggio, vascolarizzazione, qualità",
        icon: "zap",
        color: "bg-pink-600"
    },
    {
        id: "endurance",
        title: "Resistenza",
        description: "Cardio, condizionamento, energia",
        icon: "activity",
        color: "bg-green-500"
    },
    {
        id: "wellness",
        title: "Benessere",
        description: "Equilibrio, salute, mantenimento",
        icon: "heart",
        color: "bg-teal-500"
    }
];

// ========== QUIZ QUESTIONS (da PersonalCard.tsx) ==========

const quizQuestions = [
    {
        id: "name",
        question: "Come ti chiami?",
        type: "text",
        placeholder: "Il tuo nome"
    },
    {
        id: "age",
        question: "Quanti anni hai?",
        type: "number",
        placeholder: "La tua età"
    },
    {
        id: "weight",
        question: "Qual è il tuo peso?",
        type: "number",
        placeholder: "Il tuo peso",
        unit: "kg"
    },
    {
        id: "height",
        question: "Qual è la tua altezza?",
        type: "number",
        placeholder: "La tua altezza",
        unit: "cm"
    },
    {
        id: "sport",
        question: "Che tipo di attività fisica pratichi?",
        type: "select",
        options: [
            { value: "palestra", label: "Palestra / Fitness" },
            { value: "corsa", label: "Corsa / Running" },
            { value: "ciclismo", label: "Ciclismo" },
            { value: "nuoto", label: "Nuoto" },
            { value: "calcio", label: "Calcio" },
            { value: "basket", label: "Basket" },
            { value: "tennis", label: "Tennis" },
            { value: "altro", label: "Altro" }
        ]
    },
    {
        id: "level",
        question: "Qual è il tuo livello di esperienza?",
        type: "select",
        options: [
            { value: "beginner", label: "Principiante - Appena iniziato" },
            { value: "intermediate", label: "Intermedio - Mi alleno da qualche mese" },
            { value: "advanced", label: "Avanzato - Mi alleno regolarmente da anni" }
        ]
    },
    {
        id: "frequency",
        question: "Quante volte a settimana ti alleni?",
        type: "select",
        options: [
            { value: "1-2", label: "1-2 volte a settimana" },
            { value: "3-4", label: "3-4 volte a settimana" },
            { value: "5+", label: "5 o più volte a settimana" }
        ]
    },
    {
        id: "duration",
        question: "Quanto dura mediamente ogni tua sessione?",
        type: "select",
        options: [
            { value: "20-30", label: "20-30 minuti" },
            { value: "30-45", label: "30-45 minuti" },
            { value: "45-60", label: "45-60 minuti" },
            { value: "60+", label: "Più di 60 minuti" }
        ]
    }
];

// ========== HELPER FUNCTIONS ==========

function getRecommendedPrograms(goal, level) {
    const programs = workoutPrograms.filter(program => 
        program.goal.includes(goal) && program.level.includes(level)
    );
    return programs.slice(0, 2);
}

function getAllCompatiblePrograms(goal) {
    return workoutPrograms.filter(program => program.goal.includes(goal));
}

function getDifficultyLabel(level) {
    if (level.includes('advanced')) return 'Avanzato';
    if (level.includes('intermediate')) return 'Intermedio';
    return 'Principiante';
}

function getDifficultyColor(level) {
    if (level.includes('advanced')) return 'advanced';
    if (level.includes('intermediate')) return 'intermediate';
    return 'beginner';
}

function getIconHTML(iconName) {
    const icons = {
        sparkles: '✨',
        dumbbell: '💪',
        target: '🎯',
        zap: '⚡',
        activity: '📊',
        heart: '❤️'
    };
    return icons[iconName] || '💪';
}
