// Script per aggiornare tutti i workout con almeno 7 esercizi e 60+ min

const additionalExercises = {
    legs: [
        {
            name: "Leg Press",
            sets: "3-4",
            reps: "12-15",
            rest: "90s",
            notes: "Posiziona i piedi larghi",
            image: "https://images.unsplash.com/photo-1434682772747-f16d3ea162c3?w=400&h=300&fit=crop",
            muscleGroup: "Gambe",
            execution: "Spingi con i talloni, mantieni la schiena aderente"
        },
        {
            name: "Affondi",
            sets: "3",
            reps: "12 per gamba",
            rest: "60s",
            notes: "Mantieni il busto eretto",
            image: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&h=300&fit=crop",
            muscleGroup: "Gambe",
            execution: "Scendi fino a 90° con entrambe le ginocchia"
        },
        {
            name: "Leg Curl",
            sets: "3",
            reps: "12-15",
            rest: "60s",
            notes: "Controlla la discesa",
            image: "https://images.unsplash.com/photo-1434682881908-b43d0467b798?w=400&h=300&fit=crop",
            muscleGroup: "Bicipiti femorali",
            execution: "Contrai i femorali in alto, discesa controllata"
        },
        {
            name: "Calf Raise",
            sets: "4",
            reps: "15-20",
            rest: "45s",
            notes: "Massima estensione in alto",
            image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop",
            muscleGroup: "Polpacci",
            execution: "Sali sulle punte, pausa in alto, discesa lenta"
        }
    ],
    chest: [
        {
            name: "Panca Inclinata",
            sets: "3-4",
            reps: "8-12",
            rest: "90s",
            notes: "Focus sul petto alto",
            image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop",
            muscleGroup: "Petto alto",
            execution: "Gomiti a 45°, barra all'altezza delle clavicole"
        },
        {
            name: "Croci con Manubri",
            sets: "3",
            reps: "12-15",
            rest: "60s",
            notes: "Stretch completo",
            image: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=400&h=300&fit=crop",
            muscleGroup: "Petto",
            execution: "Apri le braccia fino a sentire lo stretch, gomiti leggermente piegati"
        },
        {
            name: "Dip alle Parallele",
            sets: "3",
            reps: "8-12",
            rest: "90s",
            notes: "Inclina il busto avanti",
            image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop",
            muscleGroup: "Petto/Tricipiti",
            execution: "Scendi fino a 90°, risali spingendo forte"
        }
    ],
    back: [
        {
            name: "Lat Machine",
            sets: "3-4",
            reps: "10-12",
            rest: "90s",
            notes: "Tira con i gomiti",
            image: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&h=300&fit=crop",
            muscleGroup: "Dorsali",
            execution: "Petto in fuori, porta la sbarra sotto il mento"
        },
        {
            name: "Pulley",
            sets: "3",
            reps: "12-15",
            rest: "60s",
            notes: "Mantieni la schiena dritta",
            image: "https://images.unsplash.com/photo-1434682881908-b43d0467b798?w=400&h=300&fit=crop",
            muscleGroup: "Dorsali",
            execution: "Tira verso l'addome, gomiti indietro"
        },
        {
            name: "Face Pull",
            sets: "3",
            reps: "15-20",
            rest: "45s",
            notes: "Focus sui deltoidi posteriori",
            image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop",
            muscleGroup: "Deltoidi posteriori",
            execution: "Tira la corda verso il viso, gomiti alti"
        }
    ],
    shoulders: [
        {
            name: "Military Press",
            sets: "4",
            reps: "8-10",
            rest: "90s",
            notes: "Spingi verticalmente",
            image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop",
            muscleGroup: "Spalle",
            execution: "Spingi sopra la testa, gomiti davanti"
        },
        {
            name: "Alzate Laterali",
            sets: "3",
            reps: "12-15",
            rest: "60s",
            notes: "Gomiti leggermente piegati",
            image: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=400&h=300&fit=crop",
            muscleGroup: "Deltoidi laterali",
            execution: "Alza i manubri lateralmente fino all'altezza delle spalle"
        },
        {
            name: "Tirate al Mento",
            sets: "3",
            reps: "10-12",
            rest: "60s",
            notes: "Gomiti sempre alti",
            image: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&h=300&fit=crop",
            muscleGroup: "Trapezi/Deltoidi",
            execution: "Tira la sbarra verso il mento, gomiti sopra le mani"
        }
    ],
    arms: [
        {
            name: "Curl con Bilanciere",
            sets: "3",
            reps: "10-12",
            rest: "60s",
            notes: "Gomiti fermi",
            image: "https://images.unsplash.com/photo-1434682881908-b43d0467b798?w=400&h=300&fit=crop",
            muscleGroup: "Bicipiti",
            execution: "Solleva la sbarra contraendo i bicipiti, gomiti fissi"
        },
        {
            name: "French Press",
            sets: "3",
            reps: "10-12",
            rest: "60s",
            notes: "Solo avambracci si muovono",
            image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop",
            muscleGroup: "Tricipiti",
            execution: "Abbassa il peso dietro la testa, gomiti fermi"
        },
        {
            name: "Hammer Curl",
            sets: "3",
            reps: "12-15",
            rest: "45s",
            notes: "Presa neutra",
            image: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=400&h=300&fit=crop",
            muscleGroup: "Bicipiti/Brachiale",
            execution: "Solleva i manubri con presa a martello"
        }
    ],
    core: [
        {
            name: "Plank",
            sets: "3",
            reps: "60s",
            rest: "45s",
            notes: "Corpo allineato",
            image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop",
            muscleGroup: "Core",
            execution: "Mantieni la posizione, corpo dritto, addome contratto"
        },
        {
            name: "Russian Twist",
            sets: "3",
            reps: "20 per lato",
            rest: "45s",
            notes: "Ruota il busto",
            image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop",
            muscleGroup: "Obliqui",
            execution: "Siediti, piedi sollevati, ruota il busto da lato a lato"
        },
        {
            name: "Mountain Climbers",
            sets: "3",
            reps: "30s",
            rest: "45s",
            notes: "Ritmo veloce",
            image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop",
            muscleGroup: "Core/Cardio",
            execution: "Posizione plank, porta le ginocchia al petto alternando"
        }
    ]
};

// Funzione per determinare quali esercizi aggiungere in base al workout
function getExercisesToAdd(workoutName, currentExercises) {
    const name = workoutName.toLowerCase();
    const currentCount = currentExercises.length;
    const needed = Math.max(0, 7 - currentCount);
    
    if (needed === 0) return [];
    
    let pool = [];
    
    if (name.includes('squat') || name.includes('gambe') || name.includes('leg')) {
        pool = additionalExercises.legs;
    } else if (name.includes('petto') || name.includes('chest') || name.includes('panca')) {
        pool = [...additionalExercises.chest, ...additionalExercises.arms.slice(0, 1)];
    } else if (name.includes('schiena') || name.includes('back') || name.includes('dorsal')) {
        pool = [...additionalExercises.back, ...additionalExercises.core.slice(0, 1)];
    } else if (name.includes('spalle') || name.includes('shoulder')) {
        pool = [...additionalExercises.shoulders, ...additionalExercises.arms];
    } else if (name.includes('braccia') || name.includes('arm')) {
        pool = additionalExercises.arms;
    } else {
        // Mix generale
        pool = [
            ...additionalExercises.legs.slice(0, 2),
            ...additionalExercises.chest.slice(0, 1),
            ...additionalExercises.back.slice(0, 2),
            ...additionalExercises.core
        ];
    }
    
    // Rimuovi esercizi già presenti
    const existing = currentExercises.map(e => e.name.toLowerCase());
    pool = pool.filter(e => !existing.includes(e.name.toLowerCase()));
    
    return pool.slice(0, needed);
}

console.log('✅ Update workouts utility loaded');
console.log('Usage: getExercisesToAdd(workoutName, currentExercises)');
