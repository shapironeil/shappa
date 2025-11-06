// Dashboard utilities e logica grafici
console.log('📊 Dashboard system initialized');

const DashboardManager = {
    currentUser: null,
    
    // Inizializzazione dashboard
    init() {
        this.currentUser = AuthManager.getCurrentUser();
        if (!this.currentUser) {
            console.error('❌ No user logged in');
            return;
        }
        
        this.updateUserStats();
        this.updateConnectionStatus();
        this.loadUserActivity();
        this.setupRealTimeUpdates();
        console.log('✅ Dashboard initialized for user:', this.currentUser.username);
    },
    
    // Inizializza i grafici
    initializeCharts() {
        this.createSalesChart();
        this.createCategoriesChart();
    },
    
    // Grafico delle vendite
    createSalesChart() {
        const ctx = document.getElementById('salesChart');
        if (!ctx) return;
        
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: this.generateDateLabels(15),
                datasets: [{
                    label: 'Vendite €',
                    data: this.mockData.sales,
                    borderColor: 'rgb(79, 70, 229)',
                    backgroundColor: 'rgba(79, 70, 229, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    },
    
    // Grafico delle categorie
    createCategoriesChart() {
        const ctx = document.getElementById('categoriesChart');
        if (!ctx) return;
        
        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: this.mockData.categories,
                datasets: [{
                    data: this.mockData.categorySales,
                    backgroundColor: [
                        'rgb(79, 70, 229)',
                        'rgb(6, 182, 212)',
                        'rgb(16, 185, 129)',
                        'rgb(245, 158, 11)',
                        'rgb(239, 68, 68)'
                    ],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    },
    
    // Genera etichette date
    generateDateLabels(days) {
        const labels = [];
        for (let i = days - 1; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            labels.push(date.toLocaleDateString('it-IT', { 
                month: 'short', 
                day: 'numeric' 
            }));
        }
        return labels;
    },
    
    // Aggiorna statistiche utente reali
    updateUserStats() {
        if (!this.currentUser || !this.currentUser.profile) {
            this.showEmptyStats();
            return;
        }
        
        const profile = this.currentUser.profile;
        
        // Aggiorna profitti (solo se ci sono dati reali)
        const profitsEl = document.getElementById('totalProfits');
        if (profitsEl) {
            if (profile.amazonConnected || profile.ebayConnected) {
                profitsEl.textContent = `€${(profile.totalProfits || 0).toFixed(2)}`;
            } else {
                profitsEl.textContent = '€0.00';
            }
        }
        
        // Aggiorna listing attivi (solo se collegato)
        const listingsEl = document.getElementById('activeListings');
        if (listingsEl) {
            if (profile.ebayConnected) {
                listingsEl.textContent = (profile.totalListings || 0).toString();
            } else {
                listingsEl.textContent = '0';
            }
        }
        
        // Aggiorna vendite totali (solo se collegato)
        const salesEl = document.getElementById('totalSales');
        if (salesEl) {
            if (profile.amazonConnected || profile.ebayConnected) {
                salesEl.textContent = (profile.totalSales || 0).toString();
            } else {
                salesEl.textContent = '0';
            }
        }
        
        // Aggiorna messaggi di stato
        this.updateStatusMessages(profile);
    },
    
    // Mostra stats vuote per utenti senza connessioni
    showEmptyStats() {
        const profitsEl = document.getElementById('totalProfits');
        const listingsEl = document.getElementById('activeListings');
        const salesEl = document.getElementById('totalSales');
        
        if (profitsEl) profitsEl.textContent = '€0.00';
        if (listingsEl) listingsEl.textContent = '0';
        if (salesEl) salesEl.textContent = '0';
        
        const profitsChangeEl = document.getElementById('profitsChange');
        const listingsChangeEl = document.getElementById('listingsChange');
        const salesChangeEl = document.getElementById('salesChange');
        
        if (profitsChangeEl) profitsChangeEl.textContent = 'Collega i tuoi account per iniziare';
        if (listingsChangeEl) listingsChangeEl.textContent = 'Nessun account collegato';
        if (salesChangeEl) salesChangeEl.textContent = 'Collega Amazon ed eBay per vedere le vendite';
    },
    
    // Aggiorna messaggi di stato
    updateStatusMessages(profile) {
        const profitsChangeEl = document.getElementById('profitsChange');
        const listingsChangeEl = document.getElementById('listingsChange');
        const salesChangeEl = document.getElementById('salesChange');
        
        if (profile.amazonConnected || profile.ebayConnected) {
            if (profitsChangeEl) profitsChangeEl.textContent = 'Dati aggiornati in tempo reale';
            if (listingsChangeEl) listingsChangeEl.textContent = 'Sincronizzato con i tuoi store';
            if (salesChangeEl) salesChangeEl.textContent = 'Basato sui dati ufficiali';
        } else {
            if (profitsChangeEl) profitsChangeEl.textContent = 'Collega i tuoi account per vedere i dati';
            if (listingsChangeEl) listingsChangeEl.textContent = 'Nessun listing attivo';
            if (salesChangeEl) salesChangeEl.textContent = 'Nessuna vendita registrata';
        }
    },
    
    // Aggiorna stato delle connessioni
    updateConnectionStatus() {
        if (!this.currentUser || !this.currentUser.profile) return;
        
        const profile = this.currentUser.profile;
        let connectionsCount = 0;
        
        // Controlla connessione Amazon
        const amazonItem = document.getElementById('amazonConnectionItem');
        if (amazonItem) {
            const status = amazonItem.querySelector('.status');
            if (profile.amazonConnected) {
                status.textContent = 'Collegato';
                status.className = 'status connected';
                connectionsCount++;
            } else {
                status.textContent = 'Non collegato';
                status.className = 'status disconnected';
            }
        }
        
        // Controlla connessione eBay
        const ebayItem = document.getElementById('ebayConnectionItem');
        if (ebayItem) {
            const status = ebayItem.querySelector('.status');
            if (profile.ebayConnected) {
                status.textContent = 'Collegato';
                status.className = 'status connected';
                connectionsCount++;
            } else {
                status.textContent = 'Non collegato';
                status.className = 'status disconnected';
            }
        }
        
        // Aggiorna contatore connessioni
        const connectionsCountEl = document.getElementById('connectionsCount');
        const connectionsStatusEl = document.getElementById('connectionsStatus');
        
        if (connectionsCountEl) {
            connectionsCountEl.textContent = `${connectionsCount}/2`;
        }
        
        if (connectionsStatusEl) {
            if (connectionsCount === 2) {
                connectionsStatusEl.textContent = 'Tutti gli account collegati';
                connectionsStatusEl.className = 'stat-change positive';
            } else if (connectionsCount === 1) {
                connectionsStatusEl.textContent = 'Collega il secondo account';
                connectionsStatusEl.className = 'stat-change neutral';
            } else {
                connectionsStatusEl.textContent = 'Collega Amazon ed eBay';
                connectionsStatusEl.className = 'stat-change';
            }
        }
    },
    
    // Carica attività utente reali
    loadUserActivity() {
        const container = document.querySelector('.activity-list');
        if (!container) return;
        
        container.innerHTML = '';
        
        if (!this.currentUser || !this.currentUser.profile) {
            this.showEmptyActivity(container);
            return;
        }
        
        const profile = this.currentUser.profile;
        const activities = [];
        
        // Aggiungi attività di connessione
        if (profile.amazonConnected) {
            activities.push({
                type: 'success',
                icon: '🔗',
                title: 'Amazon collegato',
                description: 'Account Amazon Seller connesso con successo',
                time: 'Recente'
            });
        }
        
        if (profile.ebayConnected) {
            activities.push({
                type: 'success',
                icon: '🔗',
                title: 'eBay collegato',
                description: 'Account eBay Store connesso con successo',
                time: 'Recente'
            });
        }
        
        // Se nessuna attività, mostra messaggio vuoto
        if (activities.length === 0) {
            this.showEmptyActivity(container);
            return;
        }
        
        // Mostra attività reali
        activities.forEach(activity => {
            const activityEl = document.createElement('div');
            activityEl.className = 'activity-item';
            activityEl.innerHTML = `
                <div class="activity-icon ${activity.type}">${activity.icon}</div>
                <div class="activity-content">
                    <p><strong>${activity.title}</strong></p>
                    <span>${activity.description}</span>
                    <time>${activity.time}</time>
                </div>
            `;
            container.appendChild(activityEl);
        });
    },
    
    // Mostra stato vuoto per attività
    showEmptyActivity(container) {
        container.innerHTML = `
            <div class="empty-activity">
                <div style="font-size: 2rem; margin-bottom: 1rem;">📋</div>
                <h4>Nessuna attività</h4>
                <p>Le tue attività appariranno qui quando colleghi i tuoi account</p>
                <button onclick="window.location.href='settings.html'" style="
                    margin-top: 1rem;
                    padding: 0.5rem 1rem;
                    background: var(--primary-color);
                    color: white;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                ">Collega Account</button>
            </div>
        `;
    },
    
    // Setup aggiornamenti in tempo reale
    setupRealTimeUpdates() {
        // Controlla aggiornamenti del profilo utente ogni 5 secondi
        setInterval(() => {
            const updatedUser = AuthManager.getCurrentUser();
            if (updatedUser && JSON.stringify(updatedUser) !== JSON.stringify(this.currentUser)) {
                console.log('🔄 Profilo utente aggiornato, ricarico dashboard...');
                this.currentUser = updatedUser;
                this.updateUserStats();
                this.updateConnectionStatus();
                this.loadUserActivity();
            }
        }, 5000);
    },
    
    // Simula nuova attività
    simulateNewActivity() {
        const newActivities = [
            { type: 'success', icon: '✅', title: 'Listing aggiornato', description: 'Prezzo ottimizzato automaticamente', time: 'ora' },
            { type: 'info', icon: '🔄', title: 'Sincronizzazione completata', description: 'Inventario Amazon → eBay', time: 'ora' },
            { type: 'success', icon: '💰', title: 'Vendita registrata', description: 'Nuovo ordine ricevuto', time: 'ora' }
        ];
        
        const randomActivity = newActivities[Math.floor(Math.random() * newActivities.length)];
        this.addActivity(randomActivity);
    },
    
    // Aggiungi nuova attività
    addActivity(activity) {
        const container = document.querySelector('.activity-list');
        if (!container) return;
        
        const activityEl = document.createElement('div');
        activityEl.className = 'activity-item';
        activityEl.innerHTML = `
            <div class="activity-icon ${activity.type}">${activity.icon}</div>
            <div class="activity-content">
                <p><strong>${activity.title}</strong></p>
                <span>${activity.description}</span>
                <time>${activity.time}</time>
            </div>
        `;
        
        // Aggiungi in cima alla lista
        container.insertBefore(activityEl, container.firstChild);
        
        // Mantieni solo le ultime 4 attività
        while (container.children.length > 4) {
            container.removeChild(container.lastChild);
        }
        
        // Animazione di entrata
        activityEl.style.opacity = '0';
        activityEl.style.transform = 'translateY(-20px)';
        setTimeout(() => {
            activityEl.style.transition = 'all 0.3s ease';
            activityEl.style.opacity = '1';
            activityEl.style.transform = 'translateY(0)';
        }, 100);
    }
};

// Setup action buttons
function setupActionButtons() {
    const actionButtons = document.querySelectorAll('.action-btn');
    actionButtons.forEach((btn, index) => {
        btn.addEventListener('click', () => {
            const actions = [
                () => console.log('🔍 Avviata ricerca prodotti Amazon'),
                () => console.log('📝 Apertura form creazione listing'),
                () => window.location.href = 'settings.html',
                () => console.log('📊 Generazione report in corso')
            ];
            
            if (actions[index]) {
                actions[index]();
                DashboardManager.addActivity({
                    type: 'info',
                    icon: '🔄',
                    title: 'Azione eseguita',
                    description: btn.textContent.trim(),
                    time: 'ora'
                });
            }
        });
    });
}

// Inizializzazione quando DOM è pronto
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('dashboard.html')) {
        // Aspetta che Chart.js si carichi
        if (typeof Chart !== 'undefined') {
            DashboardManager.init();
            setupActionButtons();
        } else {
            // Fallback se Chart.js non si carica
            setTimeout(() => {
                if (typeof Chart !== 'undefined') {
                    DashboardManager.init();
                    setupActionButtons();
                }
            }, 1000);
        }
    }
});

// Esporta per uso globale
window.DashboardManager = DashboardManager;
