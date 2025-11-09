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
                warmup: "5 min cardio + mobilità articolare + serie di riscaldamento con il 40-60% del carico",
                exercises: [
                    { name: "Squat", sets: "5", reps: "5", rest: "3-5 min", notes: "80-85% 1RM" },
                    { name: "Panca piana", sets: "5", reps: "5", rest: "3-4 min", notes: "80-85% 1RM" },
                    { name: "Rematore bilanciere", sets: "5", reps: "5", rest: "3 min", notes: "Tecnica rigorosa" },
                    { name: "Plank", sets: "3", reps: "45-60 sec", rest: "60 sec" }
                ],
                cooldown: "Stretching leggero 5 min"
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
        sessions: []
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
        sessions: []
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
        sessions: []
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
        sessions: []
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
        sessions: []
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
        sessions: []
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
        sessions: []
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
        sessions: []
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
        sessions: []
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
