// ========== GLOBAL STATE ==========
let userData = {
    name: "",
    age: "",
    weight: "",
    height: "",
    sport: "",
    goal: "muscle",
    level: "intermediate",
    frequency: "",
    duration: ""
};

let scheduledWorkouts = [];
let selectedProgramIds = []; // Array per permettere selezione multipla
let currentQuestionIndex = 0;
let currentAnswer = "";

// ========== INITIALIZATION ==========
document.addEventListener('DOMContentLoaded', async () => {
    // Auth check
    if (!AuthManager.isLoggedIn()) {
        window.location.href = '/src/pages/login.html';
        return;
    }

    // Load user info
    const user = AuthManager.getCurrentUser();
    if (user) {
        const userName = user.username || user.email || 'Utente';
        document.getElementById('userName').textContent = userName;
        const initial = userName[0].toUpperCase();
        document.getElementById('userAvatar').textContent = initial;
    }

    // Setup logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }

    // Setup tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            // IMPORTANTE: renderPrograms mantiene lo stato selectedProgramId
            renderPrograms(btn.dataset.tab);
        });
    });

    // Load data from server and then render UI
    await Promise.all([
        loadUserData(),
        loadScheduledWorkouts()
    ]);

    // Render initial UI after data is loaded
    // IMPORTANTE: renderPrograms deve essere chiamato DOPO loadScheduledWorkouts
    // per assicurarsi che selectedProgramId sia già caricato
    renderWeeklyCalendar();
    renderPrograms('recommended');
    renderProgressWidget();
    renderPersonalCard();
    
    // Se c'è un programma selezionato, assicurati che sia visibile anche nella tab "Tutti"
    if (selectedProgramId) {
        console.log('✅ Programma selezionato caricato:', selectedProgramId);
    }
});

// ========== AUTH ==========
function handleLogout() {
    AuthManager.logout();
    window.location.href = '/src/pages/login.html';
}

// ========== DATA PERSISTENCE (Server API) ==========
async function loadUserData() {
    try {
        const user = AuthManager.getCurrentUser();
        if (!user || !user.id) return;

        const response = await fetch(`/api/sport/profile/${user.id}`);
        if (response.ok) {
            const result = await response.json();
            if (result.success && result.data) {
                userData = result.data.profile || {};
                console.log('✅ Loaded user data:', Object.keys(userData).length, 'fields');
            }
        }
    } catch (error) {
        console.error('Error loading user data:', error);
    }
}

async function saveUserData() {
    try {
        const user = AuthManager.getCurrentUser();
        if (!user || !user.id) {
            console.error('No user logged in');
            return;
        }

        const response = await fetch('/api/sport/profile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: user.id,
                profileData: userData
            })
        });

        const result = await response.json();
        if (result.success) {
            console.log('✅ Profile saved to server');
        } else {
            console.error('Failed to save profile:', result.error);
        }
    } catch (error) {
        console.error('Error saving user data:', error);
    }
}

async function loadScheduledWorkouts() {
    try {
        const user = AuthManager.getCurrentUser();
        if (!user || !user.id) return;

        const response = await fetch(`/api/sport/program/${user.id}`);
        if (response.ok) {
            const result = await response.json();
            if (result.success && result.data) {
                scheduledWorkouts = result.data.weekSchedule || [];
                selectedProgramId = result.data.programId || null;
                
                // Sincronizza selectedProgramId con selectedProgramIds per la visualizzazione
                if (selectedProgramId && !selectedProgramIds.includes(selectedProgramId)) {
                    selectedProgramIds = [selectedProgramId];
                } else if (!selectedProgramId) {
                    selectedProgramIds = [];
                }
                
                console.log('✅ Loaded workouts:', scheduledWorkouts.length, 'Program ID:', selectedProgramId);
                
                // Se c'è un programma selezionato, log per debug
                if (selectedProgramId) {
                    const program = workoutPrograms.find(p => p.id === selectedProgramId);
                    console.log('✅ Programma selezionato trovato:', program?.title || 'ID: ' + selectedProgramId);
                }
            }
        }
    } catch (error) {
        console.error('Error loading workouts:', error);
    }
}

async function saveScheduledWorkouts() {
    try {
        const user = AuthManager.getCurrentUser();
        if (!user || !user.id || !selectedProgramId) return;

        const program = workoutPrograms.find(p => p.id === selectedProgramId);
        
        const response = await fetch('/api/sport/program', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: user.id,
                programId: selectedProgramId,
                programData: {
                    title: program?.title,
                    description: program?.description,
                    estimatedCalories: program?.estimatedCalories || 400,
                    weekSchedule: scheduledWorkouts
                }
            })
        });

        const result = await response.json();
        if (result.success) {
            console.log('✅ Program saved to server (webhook sent)');
        } else {
            console.error('Failed to save program:', result.error);
        }
    } catch (error) {
        console.error('Error saving workouts:', error);
    }
}

// ========== WEEKLY CALENDAR (WeeklyCalendar.tsx) ==========
function renderWeeklyCalendar() {
    const container = document.getElementById('weeklyCalendar');
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay()); // Domenica

    const dayNames = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'];
    let html = '';

    for (let i = 0; i < 7; i++) {
        const day = new Date(startOfWeek);
        day.setDate(startOfWeek.getDate() + i);
        
        const dayIndex = i;
        const dayNum = day.getDate();
        const isToday = day.toDateString() === today.toDateString();
        
        // Find workout for this day
        const workout = scheduledWorkouts.find(w => w.dayIndex === dayIndex);
        const hasWorkout = !!workout;

        let classes = 'day-card';
        if (isToday) classes += ' today';
        if (hasWorkout) classes += ' has-workout';

        html += `
            <div class="${classes}" ${hasWorkout ? `onclick="openWorkoutDetail(${dayIndex})" style="cursor: pointer;"` : ''}>
                <div class="day-name">${dayNames[i]}</div>
                <div class="day-number">${dayNum}</div>
                ${hasWorkout ? `
                    <div class="workout-badge strength">
                        <i class="fas fa-dumbbell"></i>
                        ${workout.workoutTitle}
                    </div>
                    <div class="workout-duration">
                        <i class="fas fa-clock"></i>
                        ${workout.duration}min
                    </div>
                ` : '<div class="day-dot"></div>'}
            </div>
        `;
    }

    container.innerHTML = html;
}

// Apri dettagli workout
function openWorkoutDetail(dayIndex) {
    const currentProgram = workoutPrograms.find(p => p.id === selectedProgramId);
    
    if (!currentProgram || !currentProgram.sessions) {
        showNotification('Nessun programma attivo', 'warning');
        return;
    }

    // Trova il workout per questo giorno
    const dayNames = ['domenica', 'lunedì', 'martedì', 'mercoledì', 'giovedì', 'venerdì', 'sabato'];
    const dayNamesShort = ['dom', 'lun', 'mar', 'mer', 'gio', 'ven', 'sab'];
    const dayName = dayNames[dayIndex];
    const dayShort = dayNamesShort[dayIndex];
    
    const workout = currentProgram.sessions.find(s => {
        const sessionDay = s.day.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const targetDay = dayName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        return sessionDay.includes(targetDay.substring(0, 3)) || sessionDay === targetDay;
    });

    if (!workout) {
        showNotification('Nessun allenamento programmato per questo giorno', 'info');
        return;
    }

    // Crea e mostra modal con dettagli - stile migliorato
    const modal = document.createElement('div');
    modal.className = 'workout-modal';
    modal.style.cssText = `
        display: flex;
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.7);
        z-index: 10000;
        align-items: center;
        justify-content: center;
        padding: 20px;
        backdrop-filter: blur(4px);
        animation: fadeIn 0.2s ease-in-out;
    `;
    
    const exercisesList = workout.exercises.map((ex, idx) => `
        <div style="padding: 16px; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; margin-bottom: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px;">
                <strong style="color: #1f2937; font-size: 15px;">${idx + 1}. ${ex.name}</strong>
                <span style="font-size: 13px; font-weight: 600; color: #3b82f6; background: #eff6ff; padding: 4px 10px; border-radius: 6px;">${ex.sets} × ${ex.reps}</span>
            </div>
            ${ex.muscleGroup ? `<div style="font-size: 13px; color: #6b7280; margin-bottom: 6px;"><i class="fas fa-bullseye"></i> <strong>Target:</strong> ${ex.muscleGroup}</div>` : ''}
            ${ex.rest ? `<div style="font-size: 13px; color: #6b7280; margin-bottom: 6px;"><i class="fas fa-stopwatch"></i> <strong>Riposo:</strong> ${ex.rest}</div>` : ''}
            ${ex.execution ? `<div style="font-size: 13px; color: #4b5563; margin-top: 8px; padding-top: 8px; border-top: 1px solid #e5e7eb; line-height: 1.5;">${ex.execution}</div>` : ''}
            ${ex.notes ? `<div style="font-size: 12px; color: #9ca3af; margin-top: 6px; font-style: italic; background: #f9fafb; padding: 6px 10px; border-radius: 6px;">${ex.notes}</div>` : ''}
        </div>
    `).join('');

    modal.innerHTML = `
        <div style="background: white; border-radius: 20px; max-width: 700px; width: 100%; max-height: 90vh; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); display: flex; flex-direction: column;">
            <div style="padding: 24px; border-bottom: 1px solid #e5e7eb; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <h2 style="margin: 0 0 8px 0; color: white; font-size: 22px;">${workout.focus || workout.workoutTitle || 'Allenamento'}</h2>
                        <p style="margin: 0; color: rgba(255,255,255,0.9); font-size: 14px;">${dayName.charAt(0).toUpperCase() + dayName.slice(1)}</p>
                    </div>
                    <button onclick="this.closest('.workout-modal').remove()" style="background: rgba(255,255,255,0.2); border: none; width: 36px; height: 36px; border-radius: 50%; cursor: pointer; font-size: 24px; color: white; display: flex; align-items: center; justify-content: center; transition: all 0.2s;">×</button>
                </div>
            </div>
            
            <div style="padding: 20px 24px; background: #f9fafb; display: flex; gap: 12px; flex-wrap: wrap; border-bottom: 1px solid #e5e7eb;">
                <div style="padding: 10px 14px; background: white; border-radius: 10px; display: flex; align-items: center; gap: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                    <i class="fas fa-dumbbell" style="color: #667eea;"></i>
                    <span style="font-size: 13px; font-weight: 600; color: #1f2937;">${workout.muscleGroup || 'Forza'}</span>
                </div>
                <div style="padding: 10px 14px; background: white; border-radius: 10px; display: flex; align-items: center; gap: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                    <i class="fas fa-clock" style="color: #f59e0b;"></i>
                    <span style="font-size: 13px; font-weight: 600; color: #1f2937;">${workout.duration || '60-75 min'}</span>
                </div>
                <div style="padding: 10px 14px; background: white; border-radius: 10px; display: flex; align-items: center; gap: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                    <i class="fas fa-fire" style="color: #ef4444;"></i>
                    <span style="font-size: 13px; font-weight: 600; color: #1f2937;">${workout.estimatedCalories || '400'} kcal</span>
                </div>
            </div>

            <div style="flex: 1; overflow-y: auto; padding: 24px;">
                <h3 style="margin: 0 0 16px 0; color: #1f2937; font-size: 17px; display: flex; align-items: center; gap: 8px;">
                    <i class="fas fa-list-check" style="color: #667eea;"></i>
                    Esercizi da svolgere (${workout.exercises.length})
                </h3>
                ${exercisesList}
            </div>
            
            <div style="padding: 20px 24px; border-top: 1px solid #e5e7eb; background: #f9fafb; display: flex; gap: 12px; flex-direction: column;">
                <div style="display: flex; gap: 12px;">
                    <button onclick="completeWorkout(${dayIndex})" style="flex: 1; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; border: none; padding: 14px 24px; border-radius: 12px; cursor: pointer; font-weight: 600; font-size: 15px; box-shadow: 0 4px 6px rgba(16, 185, 129, 0.3); transition: all 0.2s;">
                        <i class="fas fa-check-circle"></i> Segna Completato
                    </button>
                    <button onclick="markWorkoutSkipped(${dayIndex})" style="flex: 1; background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; border: none; padding: 14px 24px; border-radius: 12px; cursor: pointer; font-weight: 600; font-size: 15px; box-shadow: 0 4px 6px rgba(239, 68, 68, 0.3); transition: all 0.2s;">
                        <i class="fas fa-times-circle"></i> Non ci sono andato
                    </button>
                </div>
                <button onclick="this.closest('.workout-modal').remove()" style="width: 100%; background: white; color: #374151; border: 1px solid #d1d5db; padding: 12px 24px; border-radius: 12px; cursor: pointer; font-weight: 600; font-size: 14px; transition: all 0.2s;">
                    Chiudi
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Chiudi cliccando fuori
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
    });
    
    // Aggiungi animazione CSS
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        .workout-modal button:hover {
            transform: translateY(-1px);
            filter: brightness(1.1);
        }
    `;
    document.head.appendChild(style);
}

// Segna workout come saltato
async function markWorkoutSkipped(dayIndex) {
    try {
        const user = AuthManager.getCurrentUser();
        if (!user || !user.id) {
            showNotification('Errore: utente non autenticato', 'error');
            return;
        }

        const response = await fetch('/api/sport/stats', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: user.id,
                workoutSkipped: true,
                date: new Date().toISOString(),
                dayIndex: dayIndex
            })
        });
        
        if (response.ok) {
            showNotification('⚠️ Workout segnato come saltato', 'warning');
            document.querySelector('.workout-modal')?.remove();
            await renderProgressWidget();
            renderWeeklyCalendar();
        } else {
            showNotification('Errore nel salvare il dato', 'error');
        }
    } catch (error) {
        console.error('Error marking workout as skipped:', error);
        showNotification('Errore nel salvare il dato', 'error');
    }
}

// Completa workout
async function completeWorkout(dayIndex) {
    try {
        const user = AuthManager.getCurrentUser();
        if (!user || !user.id) {
            showNotification('Errore: utente non autenticato', 'error');
            return;
        }

        // Trova il workout completato per calcolare calorie reali
        const currentProgram = workoutPrograms.find(p => p.id === selectedProgramId);
        if (!currentProgram) {
            showNotification('Errore: programma non trovato', 'error');
            return;
        }

        const dayNames = ['domenica', 'lunedì', 'martedì', 'mercoledì', 'giovedì', 'venerdì', 'sabato'];
        const dayName = dayNames[dayIndex];
        const workout = currentProgram.sessions.find(s => {
            const sessionDay = s.day.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            const targetDay = dayName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            return sessionDay.includes(targetDay.substring(0, 3)) || sessionDay === targetDay;
        });

        const caloriesBurned = workout?.estimatedCalories || 400;

        const response = await fetch('/api/sport/stats', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: user.id,
                workoutCompleted: true,
                caloriesBurned: caloriesBurned,
                date: new Date().toISOString()
            })
        });
        
        if (response.ok) {
            showNotification('🎉 Workout completato! +' + caloriesBurned + ' kcal', 'success');
            document.querySelector('.workout-modal')?.remove();
            await renderProgressWidget();
            renderWeeklyCalendar();
        } else {
            showNotification('Errore nel salvare il workout', 'error');
        }
    } catch (error) {
        console.error('Error completing workout:', error);
        showNotification('Errore nel salvare il workout', 'error');
    }
}

// ========== WORKOUT PROGRAMS (WorkoutCards.tsx) ==========
function renderPrograms(tab) {
    const container = document.getElementById('programsContainer');
    let programs = [];

    if (tab === 'recommended') {
        if (userData.goal && userData.level) {
            programs = getRecommendedPrograms(userData.goal, userData.level);
        } else {
            container.innerHTML = `
                <div style="text-align: center; padding: 40px 20px; color: #6b7280;">
                    <p>Completa il tuo profilo per vedere i programmi consigliati</p>
                </div>
            `;
            return;
        }
    } else {
        programs = workoutPrograms;
    }

    if (programs.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 40px 20px; color: #6b7280;">
                <p>Nessun programma disponibile</p>
            </div>
        `;
        return;
    }

    container.innerHTML = programs.map(program => {
        const isSelected = selectedProgramIds.includes(program.id);
        const icon = getIconHTML(program.icon);
        const diffColor = getDifficultyColor(program.level);
        const diffLabel = getDifficultyLabel(program.level);

        return `
            <div class="program-card${isSelected ? ' selected' : ''}" data-program-id="${program.id}">
                <div class="program-card-top">
                    <div class="program-icon ${program.icon}">
                        ${icon}
                    </div>
                    <div class="program-details">
                        <div class="program-header">
                            <div style="flex: 1; min-width: 0;">
                                <h3 class="program-title">${isSelected ? '✓ ' : ''}${program.title}</h3>
                                <p class="program-subtitle">${program.subtitle}</p>
                            </div>
                            <span class="program-badge ${diffColor}">${diffLabel}</span>
                        </div>
                    </div>
                </div>
                <div class="program-meta">
                    <span><i class="fas fa-calendar"></i> ${program.frequency}x/sett</span>
                    <span><i class="fas fa-clock"></i> ${program.sessions[0]?.exercises.length * 8 || 60}min</span>
                </div>
                <div class="program-actions">
                    ${isSelected ? `
                        <button class="btn btn-sm btn-outline" onclick="cancelProgram(${program.id})">
                            <i class="fas fa-times"></i> Annulla
                        </button>
                    ` : `
                        <button class="btn btn-sm btn-primary" onclick="startProgram(${program.id})">
                            Inizia
                        </button>
                    `}
                    <button class="btn btn-sm btn-icon btn-outline" onclick="showProgramInfo(${program.id})">
                        <i class="fas fa-info-circle"></i>
                    </button>
                </div>
            </div>
        `;
    }).join('');
    
    // Scroll automatico alla prima card selezionata se presente
    if (selectedProgramIds.length > 0) {
        setTimeout(() => {
            const selectedCard = container.querySelector(`[data-program-id="${selectedProgramIds[0]}"]`);
            if (selectedCard) {
                selectedCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                console.log('✅ Scroll automatico alla card selezionata');
            }
        }, 100);
    }
}

function showProgramInfo(programId) {
    const program = workoutPrograms.find(p => p.id === programId);
    if (!program) return;

    const modal = document.getElementById('programInfoModal');
    document.getElementById('programInfoTitle').textContent = program.title;
    document.getElementById('programInfoSubtitle').textContent = program.subtitle;

    const body = document.getElementById('programInfoBody');
    body.innerHTML = `
        <div style="margin-bottom: 24px;">
            <p style="color: #6b7280; line-height: 1.6;">${program.description}</p>
        </div>

        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 24px;">
            <div style="text-align: center; padding: 12px; background: #f9fafb; border-radius: 8px;">
                <div style="font-size: 12px; color: #9ca3af; margin-bottom: 4px;">Durata</div>
                <div style="font-weight: 600;">${program.duration === 999 ? 'Indefinito' : `${program.duration} sett`}</div>
            </div>
            <div style="text-align: center; padding: 12px; background: #f9fafb; border-radius: 8px;">
                <div style="font-size: 12px; color: #9ca3af; margin-bottom: 4px;">Frequenza</div>
                <div style="font-weight: 600;">${program.frequency} gg/sett</div>
            </div>
            <div style="text-align: center; padding: 12px; background: #f9fafb; border-radius: 8px;">
                <div style="font-size: 12px; color: #9ca3af; margin-bottom: 4px;">Livello</div>
                <div style="font-weight: 600;">${getDifficultyLabel(program.level)}</div>
            </div>
            <div style="text-align: center; padding: 12px; background: #f9fafb; border-radius: 8px;">
                <div style="font-size: 12px; color: #9ca3af; margin-bottom: 4px;">Tipo</div>
                <div style="font-weight: 600;">${program.type}</div>
            </div>
        </div>

        <div style="margin-bottom: 24px;">
            <h4 style="margin-bottom: 12px; font-size: 16px; font-weight: 600;">Benefici del Programma</h4>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
                ${program.benefits.map(benefit => `
                    <div style="display: flex; align-items: center; gap: 8px; padding: 8px; background: #f0fdf4; border-radius: 6px; font-size: 14px; color: #166534;">
                        <i class="fas fa-check" style="color: #16a34a;"></i>
                        ${benefit}
                    </div>
                `).join('')}
            </div>
        </div>

        ${program.sessions.length > 0 ? `
            <div>
                <h4 style="margin-bottom: 12px; font-size: 16px; font-weight: 600;">Struttura Allenamenti</h4>
                <div style="display: flex; flex-direction: column; gap: 16px;">
                    ${program.sessions.map((session, idx) => `
                        <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; background: #f9fafb;">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                                <div>
                                    <h5 style="margin: 0; font-size: 14px; font-weight: 600;">
                                        <i class="fas fa-calendar" style="color: #3b82f6;"></i>
                                        ${session.day}
                                    </h5>
                                    <p style="margin: 4px 0 0 0; font-size: 13px; color: #6b7280;">${session.focus}</p>
                                </div>
                                <span style="padding: 4px 8px; background: white; border-radius: 4px; font-size: 12px; font-weight: 600;">
                                    ${session.exercises.length} esercizi
                                </span>
                            </div>
                            ${session.warmup ? `
                                <div style="background: #eff6ff; padding: 8px 12px; border-radius: 4px; font-size: 12px; color: #1e3a8a; margin-bottom: 12px;">
                                    <strong>Riscaldamento:</strong> ${session.warmup}
                                </div>
                            ` : ''}
                            <div style="display: flex; flex-direction: column; gap: 8px;">
                                ${session.exercises.map((ex, exIdx) => `
                                    <div style="display: flex; gap: 12px; padding: 8px; border-bottom: 1px solid #e5e7eb;">
                                        ${ex.image ? `
                                            <img src="${ex.image}" 
                                                 alt="${ex.name}" 
                                                 style="width: 60px; height: 60px; object-fit: cover; border-radius: 6px; flex-shrink: 0;"
                                                 onerror="this.style.display='none'">
                                        ` : ''}
                                        <div style="flex: 1; min-width: 0;">
                                            <div style="font-size: 14px; font-weight: 500;">${exIdx + 1}. ${ex.name}</div>
                                            ${ex.muscleGroup ? `<div style="font-size: 11px; color: #3b82f6; margin-top: 2px;"><i class="fas fa-dumbbell"></i> ${ex.muscleGroup}</div>` : ''}
                                            ${ex.notes ? `<div style="font-size: 12px; color: #6b7280; margin-top: 4px;">${ex.notes}</div>` : ''}
                                            ${ex.execution ? `<div style="font-size: 11px; color: #8b5cf6; margin-top: 4px; font-style: italic;"><i class="fas fa-info-circle"></i> ${ex.execution}</div>` : ''}
                                        </div>
                                        <div style="display: flex; flex-direction: column; gap: 4px; font-size: 12px; color: #6b7280; white-space: nowrap; text-align: right;">
                                            <span><strong>${ex.sets}</strong> serie</span>
                                            <span><strong>${ex.reps}</strong> rip</span>
                                            <span>${ex.rest} rec</span>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                            ${session.cooldown ? `
                                <div style="background: #faf5ff; padding: 8px 12px; border-radius: 4px; font-size: 12px; color: #581c87; margin-top: 12px;">
                                    <strong>Defaticamento:</strong> ${session.cooldown}
                                </div>
                            ` : ''}
                        </div>
                    `).join('')}
                </div>
            </div>
        ` : ''}
    `;

    // Non selezionare automaticamente il programma quando si apre l'info
    // selectedProgramId = programId; <- RIMOSSO
    modal.classList.add('active');
}

function closeProgramInfo() {
    document.getElementById('programInfoModal').classList.remove('active');
}

function startProgramFromInfo() {
    closeProgramInfo();
    if (selectedProgramId) {
        startProgram(selectedProgramId);
    }
}

function startProgram(programId) {
    const program = workoutPrograms.find(p => p.id === programId);
    if (!program) return;

    // Aggiungi alla lista selezionati (non sostituire)
    if (!selectedProgramIds.includes(programId)) {
        selectedProgramIds.push(programId);
    }
    
    // Sincronizza selectedProgramId
    selectedProgramId = programId;

    // Open schedule modal
    const modal = document.getElementById('scheduleModal');
    document.getElementById('scheduleTitle').textContent = `Programma ${program.title}`;
    document.getElementById('scheduleSubtitle').textContent = `Frequenza consigliata: ${program.frequency} giorni/settimana. Seleziona i giorni della settimana in cui vuoi allenarti.`;

    const dayNames = ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato'];
    const suggestedDays = getSuggestedDays(program.frequency);

    const body = document.getElementById('scheduleBody');
    body.innerHTML = `
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 24px;">
            ${dayNames.map((day, index) => {
                const isSelected = suggestedDays.includes(index);
                return `
                    <div class="quiz-option ${isSelected ? 'selected' : ''}" data-day="${index}" onclick="toggleDay(${index})">
                        <div class="quiz-option-letter">
                            <i class="fas fa-check" style="opacity: ${isSelected ? 1 : 0};"></i>
                        </div>
                        <div class="quiz-option-text">${day}</div>
                    </div>
                `;
            }).join('')}
        </div>
    `;

    modal.classList.add('active');
}

function getSuggestedDays(frequency) {
    const dayMap = {
        2: [1, 4], // Lun, Gio
        3: [1, 3, 5], // Lun, Mer, Ven
        4: [1, 2, 4, 6], // Lun, Mar, Gio, Sab
        5: [1, 2, 3, 5, 6], // Lun-Ven
        6: [1, 2, 3, 4, 5, 6] // Lun-Sab
    };
    return dayMap[frequency] || [];
}

function toggleDay(dayIndex) {
    const option = event.target.closest('.quiz-option');
    option.classList.toggle('selected');
}

function confirmSchedule() {
    const selectedDayElements = document.querySelectorAll('#scheduleBody .quiz-option.selected');
    const selectedDays = Array.from(selectedDayElements).map(el => parseInt(el.dataset.day));

    if (selectedDays.length === 0) {
        return;
    }

    const program = workoutPrograms.find(p => p.id === selectedProgramIds[selectedProgramIds.length - 1]);
    if (!program) return;

    // Clear existing workouts for this program
    scheduledWorkouts = scheduledWorkouts.filter(w => w.workoutId !== program.id);

    // Add new scheduled workouts
    const avgDuration = program.sessions[0]?.exercises.length * 8 || 60;
    selectedDays.forEach(dayIndex => {
        scheduledWorkouts.push({
            dayIndex,
            workoutId: program.id,
            workoutTitle: program.title,
            workoutType: program.type,
            duration: avgDuration
        });
    });

    saveScheduledWorkouts();
    renderWeeklyCalendar();
    renderPrograms(document.querySelector('.tab-btn.active').dataset.tab);
    renderProgressWidget();
    closeSchedule();
}

function closeSchedule() {
    document.getElementById('scheduleModal').classList.remove('active');
}

function cancelProgram(programId) {
    // Rimuovi dalle selezioni
    selectedProgramIds = selectedProgramIds.filter(id => id !== programId);
    
    // Sincronizza selectedProgramId
    if (selectedProgramId === programId) {
        selectedProgramId = null;
    }
    
    // Rimuovi workout schedulati per questo programma
    scheduledWorkouts = scheduledWorkouts.filter(w => w.workoutId !== programId);
    saveScheduledWorkouts();
    
    renderWeeklyCalendar();
    renderPrograms(document.querySelector('.tab-btn.active').dataset.tab);
    renderProgressWidget();
}

// ========== PROGRESS WIDGET (ProgressWidget.tsx) ==========
async function renderProgressWidget() {
    const container = document.getElementById('progressWidget');
    
    try {
        const user = AuthManager.getCurrentUser();
        if (!user || !user.id) {
            container.innerHTML = '<p>Effettua il login per vedere i progressi</p>';
            return;
        }

        // Get real stats from server
        const response = await fetch(`/api/sport/stats/${user.id}`);
        let stats = { totalWorkouts: 0, skippedWorkouts: 0, currentStreak: 0, estimatedCalories: 0 };
        
        if (response.ok) {
            const result = await response.json();
            if (result.success) {
                stats = result.stats;
            }
        }

        // Verifica se l'utente ha scelto un programma
        const programResponse = await fetch(`/api/sport/program/${user.id}`);
        let hasProgram = false;
        let weeklyGoal = 0;
        let caloriesGoalPerWeek = 0;
        
        if (programResponse.ok) {
            const programResult = await programResponse.json();
            if (programResult.success && programResult.data && programResult.data.programId) {
                hasProgram = true;
                const program = workoutPrograms.find(p => p.id === programResult.data.programId);
                if (program) {
                    // Usa il numero di giorni selezionati dall'utente, o la frequenza del programma
                    weeklyGoal = programResult.data.weekSchedule?.length || program.frequency;
                    // Calcola calorie settimanali in base ai giorni selezionati
                    const avgCaloriesPerSession = programResult.data.programData?.estimatedCalories || 400;
                    caloriesGoalPerWeek = avgCaloriesPerSession * weeklyGoal;
                }
            }
        }

        // Calculate from scheduled workouts
        const weeklyCompleted = stats.totalWorkouts || 0;
        const weeklySkipped = stats.skippedWorkouts || 0;
        
        // Se non ha scelto un programma, mostra /0
        if (!hasProgram) {
            weeklyGoal = 0;
            caloriesGoalPerWeek = 0;
        }
        
        // Calcola progressi: completati / (programmati - saltati)
        // Esempio: programmati 3, saltati 1, completati 1 → 1 / (3 - 1) = 50%
        const effectiveGoal = Math.max(0, weeklyGoal - weeklySkipped);
        const weeklyPercentage = effectiveGoal > 0 ? Math.min((weeklyCompleted / effectiveGoal) * 100, 100) : (weeklyGoal > 0 ? 0 : 0);

        // Calories calculation
        const caloriesBurned = stats.estimatedCalories || 0;
        const caloriesPercentage = caloriesGoalPerWeek > 0 ? Math.min((caloriesBurned / caloriesGoalPerWeek) * 100, 100) : 0;

        container.innerHTML = `
            <div class="progress-item">
                <div class="progress-header">
                    <div class="progress-label">
                        <i class="fas fa-target" style="color: #3b82f6;"></i>
                        Obiettivo Settimanale
                    </div>
                    <div class="progress-value">${weeklyCompleted} / ${weeklyGoal} allenamenti${weeklySkipped > 0 ? ` (${weeklySkipped} saltati)` : ''}</div>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${weeklyPercentage}%;"></div>
                </div>
                <div class="progress-percent">${weeklyGoal > 0 ? `${Math.round(weeklyPercentage)}% completato${weeklySkipped > 0 ? ` • ${weeklySkipped} saltati` : ''}` : 'Scegli un programma per iniziare'}</div>
            </div>

            <div class="progress-item">
                <div class="progress-header">
                    <div class="progress-label">
                        <i class="fas fa-fire" style="color: #f97316;"></i>
                        Calorie Bruciate
                    </div>
                    <div class="progress-value">${caloriesBurned} / ${caloriesGoalPerWeek} kcal</div>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${caloriesPercentage}%;"></div>
                </div>
                <div class="progress-percent">${caloriesGoalPerWeek > 0 ? Math.round(caloriesPercentage) + '% completato' : 'Scegli un programma per iniziare'}</div>
            </div>

            ${stats.currentStreak > 0 ? `
            <div class="progress-streak">
                <i class="fas fa-fire-alt"></i>
                <span>${stats.currentStreak} giorni consecutivi!</span>
            </div>
            ` : ''}
        `;
    } catch (error) {
        console.error('Error rendering progress:', error);
        container.innerHTML = '<p>Errore nel caricamento dei progressi</p>';
    }
}

function showProgressInfo() {
    // Removed alert - info shown in widget
}

// ========== PERSONAL CARD (PersonalCard.tsx) ==========
function renderPersonalCard() {
    const container = document.getElementById('profileContent');

    if (!userData.age) {
        container.innerHTML = `
            <div class="profile-empty">
                <p class="profile-empty-text">Completa il tuo profilo per iniziare</p>
                <button class="btn-quiz" onclick="openQuiz()">Inizia Quiz</button>
            </div>
        `;
        return;
    }

    const currentGoal = goalOptions.find(g => g.id === userData.goal);

    container.innerHTML = `
        <div class="profile-info">
            <div class="profile-stats">
                <div class="profile-stat">
                    <div class="profile-stat-icon">⚖️</div>
                    <div>
                        <div class="profile-stat-label">Peso</div>
                        <div class="profile-stat-value">${userData.weight} kg</div>
                    </div>
                </div>
                <div class="profile-stat">
                    <div class="profile-stat-icon">📏</div>
                    <div>
                        <div class="profile-stat-label">Altezza</div>
                        <div class="profile-stat-value">${userData.height} cm</div>
                    </div>
                </div>
            </div>
            ${userData.sport ? `
                <div class="profile-row">
                    <span class="profile-label">Sport</span>
                    <span class="profile-value">${getSportLabel(userData.sport)}</span>
                </div>
            ` : ''}
            <div class="profile-goal" onclick="openGoalSelection()">
                <div class="profile-goal-icon">🎯</div>
                <div style="flex: 1;">
                    <div class="profile-goal-label">Obiettivo</div>
                    <div class="profile-goal-value">${currentGoal?.title || 'Seleziona obiettivo'}</div>
                </div>
                <i class="fas fa-chevron-right" style="color: #1e40af;"></i>
            </div>
        </div>
    `;
}

function getSportLabel(sport) {
    const labels = {
        "palestra": "Palestra",
        "corsa": "Corsa",
        "ciclismo": "Ciclismo",
        "nuoto": "Nuoto",
        "calcio": "Calcio",
        "basket": "Basket",
        "tennis": "Tennis",
        "altro": "Altro"
    };
    return labels[sport] || sport;
}

function openGoalSelection() {
    const modal = document.getElementById('goalModal');
    const body = document.getElementById('goalBody');

    body.innerHTML = `
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;">
            ${goalOptions.map(goal => {
                const icon = getIconHTML(goal.icon);
                const isSelected = userData.goal === goal.id;
                return `
                    <div class="quiz-option ${isSelected ? 'selected' : ''}" onclick="selectGoal('${goal.id}')" style="flex-direction: column; align-items: center; padding: 12px; text-align: center;">
                        <div style="font-size: 24px; margin-bottom: 6px;">${icon}</div>
                        <div style="font-weight: 600; margin-bottom: 3px; font-size: 13px;">${goal.title}</div>
                        <div style="font-size: 10px; color: #6b7280; line-height: 1.3;">${goal.description}</div>
                        ${isSelected ? `
                            <div style="margin-top: 6px; padding-top: 6px; border-top: 1px solid #dbeafe; width: 100%; display: flex; align-items: center; justify-content: center; gap: 4px; font-size: 10px; color: #3b82f6;">
                                <i class="fas fa-check"></i>
                                Selezionato
                            </div>
                        ` : ''}
                    </div>
                `;
            }).join('')}
        </div>
    `;

    modal.classList.add('active');
}

function selectGoal(goalId) {
    userData.goal = goalId;
    saveUserData();
    renderPersonalCard();
    renderPrograms(document.querySelector('.tab-btn.active').dataset.tab);
    closeGoal();
}

function closeGoal() {
    document.getElementById('goalModal').classList.remove('active');
}

// ========== QUIZ (PersonalCard.tsx wizard) ==========
function openQuiz() {
    currentQuestionIndex = 0;
    currentAnswer = "";
    const modal = document.getElementById('quizModal');
    modal.classList.add('active');
    renderQuizQuestion();
}

function closeQuiz() {
    document.getElementById('quizModal').classList.remove('active');
}

function renderQuizQuestion() {
    const question = quizQuestions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / quizQuestions.length) * 100;

    document.getElementById('quizProgress').textContent = `Domanda ${currentQuestionIndex + 1} di ${quizQuestions.length}`;
    document.getElementById('quizPercent').textContent = `${Math.round(progress)}%`;
    document.getElementById('quizProgressFill').style.width = `${progress}%`;

    const body = document.getElementById('quizBody');
    const nextBtn = document.getElementById('quizNextBtn');
    
    nextBtn.textContent = currentQuestionIndex < quizQuestions.length - 1 ? 'Continua' : 'Completa';

    if (question.type === 'text' || question.type === 'number') {
        body.innerHTML = `
            <h3 class="quiz-question">${question.question}</h3>
            <div style="display: flex; align-items: center; justify-content: center; gap: 12px; margin-bottom: 24px;">
                <input 
                    type="${question.type}" 
                    class="form-input" 
                    id="quizInput" 
                    placeholder="${question.placeholder}"
                    value="${userData[question.id] || ''}"
                    style="max-width: 300px; text-align: center; font-size: 16px;"
                />
                ${question.unit ? `<span style="color: #6b7280;">${question.unit}</span>` : ''}
            </div>
        `;

        const input = document.getElementById('quizInput');
        input.focus();
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') nextQuestion();
        });
    } else if (question.type === 'select') {
        body.innerHTML = `
            <h3 class="quiz-question">${question.question}</h3>
            <div class="quiz-options" style="max-height: none; overflow: visible;">
                ${question.options.map((option, index) => {
                    const isSelected = userData[question.id] === option.value;
                    return `
                        <div class="quiz-option ${isSelected ? 'selected' : ''}" onclick="selectOption('${option.value}')" style="padding: 12px 16px; min-height: auto;">
                            <div class="quiz-option-letter" style="width: 32px; height: 32px; font-size: 14px;">${String.fromCharCode(65 + index)}</div>
                            <div class="quiz-option-text" style="font-size: 14px;">${option.label}</div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }
}

function selectOption(value) {
    const options = document.querySelectorAll('#quizBody .quiz-option');
    options.forEach(opt => opt.classList.remove('selected'));
    event.target.closest('.quiz-option').classList.add('selected');
    currentAnswer = value;
}

function nextQuestion() {
    const question = quizQuestions[currentQuestionIndex];
    
    // Get answer
    if (question.type === 'text' || question.type === 'number') {
        const input = document.getElementById('quizInput');
        currentAnswer = input.value.trim();
    } else if (question.type === 'select') {
        const selected = document.querySelector('#quizBody .quiz-option.selected');
        if (selected) {
            currentAnswer = selected.onclick.toString().match(/'([^']+)'/)[1];
        }
    }

    // Validate
    if (!currentAnswer) {
        return;
    }

    // Save answer
    userData[question.id] = currentAnswer;

    // Next question or complete
    if (currentQuestionIndex < quizQuestions.length - 1) {
        currentQuestionIndex++;
        currentAnswer = "";
        renderQuizQuestion();
    } else {
        // Quiz completed
        saveUserData();
        renderPersonalCard();
        renderPrograms('recommended');
        closeQuiz();
    }
}

// ========== MODAL CLOSE ON OVERLAY CLICK ==========
document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            overlay.classList.remove('active');
        }
    });
});
