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
let selectedProgramId = null;
let currentQuestionIndex = 0;
let currentAnswer = "";

// ========== INITIALIZATION ==========
document.addEventListener('DOMContentLoaded', () => {
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
            renderPrograms(btn.dataset.tab);
        });
    });

    // Load data from localStorage
    loadUserData();
    loadScheduledWorkouts();

    // Render initial UI
    renderWeeklyCalendar();
    renderPrograms('recommended');
    renderProgressWidget();
    renderPersonalCard();
});

// ========== AUTH ==========
function handleLogout() {
    if (confirm('Sei sicuro di voler uscire?')) {
        AuthManager.logout();
        window.location.href = '/src/pages/login.html';
    }
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
            <div class="${classes}">
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
        const isSelected = selectedProgramId === program.id;
        const icon = getIconHTML(program.icon);
        const diffColor = getDifficultyColor(program.level);
        const diffLabel = getDifficultyLabel(program.level);

        return `
            <div class="program-card ${isSelected ? 'selected' : ''}" data-program-id="${program.id}">
                <div class="program-card-top">
                    <div class="program-icon ${program.icon}">
                        ${icon}
                    </div>
                    <div class="program-details">
                        <div class="program-header">
                            <div style="flex: 1; min-width: 0;">
                                <h3 class="program-title">${program.title}</h3>
                                <p class="program-subtitle">${program.subtitle}</p>
                            </div>
                            <span class="program-badge ${diffColor}">${diffLabel}</span>
                        </div>
                    </div>
                </div>
                <div class="program-meta">
                    <span><i class="fas fa-calendar"></i> ${program.frequency}x/sett</span>
                    <span><i class="fas fa-clock"></i> ${program.sessions[0]?.exercises.length * 3 || 45}min</span>
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

    selectedProgramId = programId;
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
        alert('Seleziona almeno un giorno');
        return;
    }

    const program = workoutPrograms.find(p => p.id === selectedProgramId);
    if (!program) return;

    // Clear existing workouts for this program
    scheduledWorkouts = scheduledWorkouts.filter(w => w.workoutId !== program.id);

    // Add new scheduled workouts
    const avgDuration = program.sessions[0]?.exercises.length * 3 || 45;
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

    alert(`✅ ${program.title} programmato per ${selectedDays.length} giorni!`);
}

function closeSchedule() {
    document.getElementById('scheduleModal').classList.remove('active');
}

function cancelProgram(programId) {
    if (!confirm('Sei sicuro di voler annullare questo programma?')) return;

    scheduledWorkouts = scheduledWorkouts.filter(w => w.workoutId !== programId);
    saveScheduledWorkouts();
    selectedProgramId = null;
    
    renderWeeklyCalendar();
    renderPrograms(document.querySelector('.tab-btn.active').dataset.tab);
    renderProgressWidget();

    alert('✅ Programma annullato');
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
        let stats = { totalWorkouts: 0, currentStreak: 0, estimatedCalories: 0 };
        
        if (response.ok) {
            const result = await response.json();
            if (result.success) {
                stats = result.stats;
            }
        }

        // Calculate from scheduled workouts
        const today = new Date();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        const weeklyCompleted = stats.totalWorkouts || 0;
        
        // Weekly goal from user frequency
        const weeklyGoal = parseInt(userData.frequency) || 5;
        const weeklyPercentage = Math.min((weeklyCompleted / weeklyGoal) * 100, 100);

        // Calories calculation
        const caloriesGoal = 2500;
        const caloriesBurned = stats.estimatedCalories || 0;
        const caloriesPercentage = Math.min((caloriesBurned / caloriesGoal) * 100, 100);

        container.innerHTML = `
            <div class="progress-item">
                <div class="progress-header">
                    <div class="progress-label">
                        <i class="fas fa-target" style="color: #3b82f6;"></i>
                        Obiettivo Settimanale
                    </div>
                    <div class="progress-value">${weeklyCompleted} / ${weeklyGoal} allenamenti</div>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${weeklyPercentage}%;"></div>
                </div>
                <div class="progress-percent">${Math.round(weeklyPercentage)}% completato</div>
            </div>

            <div class="progress-item">
                <div class="progress-header">
                    <div class="progress-label">
                        <i class="fas fa-fire" style="color: #f97316;"></i>
                        Calorie Bruciate
                    </div>
                    <div class="progress-value">${caloriesBurned} / ${caloriesGoal} kcal</div>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${caloriesPercentage}%;"></div>
                </div>
                <div class="progress-percent">${Math.round(caloriesPercentage)}% completato</div>
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
    alert(`📊 Sistema di Tracciamento\n\n✅ Monitoriamo i tuoi allenamenti automaticamente\n\n🔔 Sistema Webhook Discord:\n• Il sistema legge il calendario e invia notifiche nei giorni programmati\n• Confermi il completamento direttamente da Discord\n• I progressi si aggiornano automaticamente\n\n🏆 Tracciamento Intelligente:\nCalcoliamo automaticamente allenamenti completati, calorie bruciate, progressione settimanale e streak di costanza.`);
}

// ========== PERSONAL CARD (PersonalCard.tsx) ==========
function renderPersonalCard() {
    const container = document.getElementById('profileContent');

    if (!userData.name) {
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
            <div class="profile-row">
                <span class="profile-label">Nome</span>
                <span class="profile-value">${userData.name}</span>
            </div>
            <div class="profile-row">
                <span class="profile-label">Età</span>
                <span class="profile-value">${userData.age} anni</span>
            </div>
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
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
            ${goalOptions.map(goal => {
                const icon = getIconHTML(goal.icon);
                const isSelected = userData.goal === goal.id;
                return `
                    <div class="quiz-option ${isSelected ? 'selected' : ''}" onclick="selectGoal('${goal.id}')" style="flex-direction: column; align-items: start; padding: 20px;">
                        <div style="font-size: 32px; margin-bottom: 12px;">${icon}</div>
                        <div style="font-weight: 600; margin-bottom: 4px;">${goal.title}</div>
                        <div style="font-size: 12px; color: #6b7280; line-height: 1.4;">${goal.description}</div>
                        ${isSelected ? `
                            <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #dbeafe; width: 100%; display: flex; align-items: center; gap: 6px; font-size: 12px; color: #3b82f6;">
                                <i class="fas fa-check"></i>
                                Obiettivo selezionato
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
    alert('✅ Obiettivo aggiornato!');
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
            <div class="quiz-options">
                ${question.options.map((option, index) => {
                    const isSelected = userData[question.id] === option.value;
                    return `
                        <div class="quiz-option ${isSelected ? 'selected' : ''}" onclick="selectOption('${option.value}')">
                            <div class="quiz-option-letter">${String.fromCharCode(65 + index)}</div>
                            <div class="quiz-option-text">${option.label}</div>
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
        alert('❌ Per favore, rispondi alla domanda');
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
        alert('✅ Profilo completato con successo! 🎉');
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
