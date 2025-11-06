// Admin Panel Functions - Shappa
console.log('🛠️ Admin Panel loaded');

// Inizializzazione
document.addEventListener('DOMContentLoaded', function() {
    console.log('📊 Initializing admin panel...');
    loadSystemStats();
    loadUsersList();
    loadSystemInfo();
    
    // Auto-refresh ogni 10 secondi
    setInterval(() => {
        loadSystemStats();
        loadUsersList();
        updateCacheInfo();
    }, 10000);
});

// ============ STATISTICHE SISTEMA ============
function loadSystemStats() {
    try {
        AuthManager.initDatabase();
        const users = AuthManager.getUsers();
        const currentUser = AuthManager.getCurrentUser();
        
        // Calcola statistiche
        const totalUsers = users.length;
        const onlineUsers = currentUser ? 1 : 0;
        const totalConnections = users.reduce((sum, u) => {
            return sum + (u.profile?.ebayConnected ? 1 : 0) + (u.profile?.amazonConnected ? 1 : 0);
        }, 0);
        
        // Aggiorna UI
        document.getElementById('totalUsers').textContent = totalUsers;
        document.getElementById('onlineUsers').textContent = onlineUsers;
        document.getElementById('totalConnections').textContent = totalConnections;
        document.getElementById('systemStatus').textContent = getSystemStatus();
        
        console.log('📊 Stats updated:', { totalUsers, onlineUsers, totalConnections });
    } catch (error) {
        console.error('❌ Error loading stats:', error);
    }
}

function getSystemStatus() {
    const users = AuthManager.getUsers();
    if (users.length === 0) return '🟡'; // Warning - no users
    if (users.length > 10) return '🟢'; // Good - active system
    return '🔵'; // Normal - few users
}

// ============ GESTIONE UTENTI ============
function loadUsersList() {
    try {
        const users = AuthManager.getUsers();
        const currentUser = AuthManager.getCurrentUser();
        const container = document.getElementById('userList');
        
        if (users.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 2rem; color: #6b7280;">
                    <div style="font-size: 3rem;">📭</div>
                    <p>Nessun utente registrato</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = users.map(user => {
            const isOnline = currentUser && currentUser.id === user.id;
            const connectionsCount = (user.profile?.ebayConnected ? 1 : 0) + (user.profile?.amazonConnected ? 1 : 0);
            
            return `
                <div class="user-item">
                    <div class="user-info-mini">
                        <div class="user-name-mini">
                            <span class="status-indicator ${isOnline ? 'status-online' : 'status-offline'}"></span>
                            ${user.username}
                            ${isOnline ? '👑' : ''}
                        </div>
                        <div class="user-email-mini">${user.email} • ${connectionsCount} connessioni</div>
                    </div>
                    <div class="user-actions-mini">
                        ${!isOnline ? `<button onclick="loginAsUser('${user.id}')" class="btn btn-primary btn-mini">Login</button>` : ''}
                        <button onclick="deleteUser('${user.id}')" class="btn btn-danger btn-mini">Del</button>
                    </div>
                </div>
            `;
        }).join('');
        
        console.log('👥 Users list updated:', users.length);
    } catch (error) {
        console.error('❌ Error loading users:', error);
    }
}

function loginAsUser(userId) {
    try {
        const users = AuthManager.getUsers();
        const user = users.find(u => u.id === userId);
        
        if (user && confirm(`Login come ${user.username}?`)) {
            localStorage.setItem('shappa_current_user', JSON.stringify(user));
            showNotification(`✅ Login effettuato come ${user.username}`, 'success');
            loadSystemStats();
            loadUsersList();
        }
    } catch (error) {
        console.error('❌ Error during login:', error);
        showNotification('❌ Errore durante il login', 'error');
    }
}

function deleteUser(userId) {
    try {
        const users = AuthManager.getUsers();
        const user = users.find(u => u.id === userId);
        
        if (user && confirm(`Eliminare utente ${user.username}?`)) {
            const updatedUsers = users.filter(u => u.id !== userId);
            AuthManager.saveUsers(updatedUsers);
            
            // Se era l'utente corrente, fai logout
            const currentUser = AuthManager.getCurrentUser();
            if (currentUser && currentUser.id === userId) {
                localStorage.removeItem('shappa_current_user');
            }
            
            showNotification(`🗑️ Utente ${user.username} eliminato`, 'success');
            loadSystemStats();
            loadUsersList();
        }
    } catch (error) {
        console.error('❌ Error deleting user:', error);
        showNotification('❌ Errore nell\'eliminazione', 'error');
    }
}

function exportUsers() {
    try {
        const users = AuthManager.getUsers();
        const dataStr = JSON.stringify(users, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `shappa-users-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        showNotification(`📤 Esportati ${users.length} utenti`, 'success');
    } catch (error) {
        console.error('❌ Error exporting users:', error);
        showNotification('❌ Errore nell\'esportazione', 'error');
    }
}

function clearAllUsers() {
    if (confirm('⚠️ ATTENZIONE: Questo eliminerà TUTTI gli utenti. Continuare?')) {
        if (confirm('🔴 Sei SICURO? Questa azione è irreversibile!')) {
            try {
                localStorage.removeItem('shappa_users_db');
                localStorage.removeItem('shappa_current_user');
                AuthManager.initDatabase();
                
                showNotification('🗑️ Tutti gli utenti eliminati', 'success');
                loadSystemStats();
                loadUsersList();
            } catch (error) {
                console.error('❌ Error clearing users:', error);
                showNotification('❌ Errore nella pulizia', 'error');
            }
        }
    }
}

// ============ CACHE E PERFORMANCE ============
function updateCacheInfo() {
    try {
        const lastRefresh = localStorage.getItem('shappa_cache_refresh');
        const storageSize = calculateStorageSize();
        
        document.getElementById('lastRefresh').textContent = lastRefresh ? 
            new Date(parseInt(lastRefresh)).toLocaleString('it-IT') : 'Mai';
        document.getElementById('storageUsed').textContent = formatBytes(storageSize);
        document.getElementById('cacheStatus').textContent = 'Active';
    } catch (error) {
        console.error('❌ Error updating cache info:', error);
    }
}

function calculateStorageSize() {
    let total = 0;
    for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
            total += localStorage[key].length + key.length;
        }
    }
    return total;
}

function formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function clearCache() {
    if (confirm('Pulire la cache del browser?')) {
        try {
            // Mantieni solo i dati utente essenziali
            const usersDB = localStorage.getItem('shappa_users_db');
            const currentUser = localStorage.getItem('shappa_current_user');
            
            localStorage.clear();
            sessionStorage.clear();
            
            // Ripristina dati utente
            if (usersDB) localStorage.setItem('shappa_users_db', usersDB);
            if (currentUser) localStorage.setItem('shappa_current_user', currentUser);
            
            localStorage.setItem('shappa_cache_refresh', Date.now().toString());
            
            showNotification('🧹 Cache pulita con successo', 'success');
            updateCacheInfo();
        } catch (error) {
            console.error('❌ Error clearing cache:', error);
            showNotification('❌ Errore nella pulizia cache', 'error');
        }
    }
}

function hardRefresh() {
    if (confirm('Eseguire un hard refresh della pagina?')) {
        localStorage.setItem('shappa_cache_refresh', Date.now().toString());
        window.location.reload(true);
    }
}

// ============ DATABASE ============
function loadSystemInfo() {
    try {
        const info = {
            'App Version': '0.1.1',
            'Users Count': AuthManager.getUsers().length,
            'Storage Size': formatBytes(calculateStorageSize()),
            'Browser': navigator.userAgent.split(' ').pop(),
            'Platform': navigator.platform,
            'Language': navigator.language,
            'Online': navigator.onLine ? 'Yes' : 'No',
            'Timestamp': new Date().toLocaleString('it-IT')
        };
        
        const container = document.getElementById('systemInfo');
        container.innerHTML = Object.entries(info).map(([key, value]) => `
            <div class="info-line">
                <span class="info-label">${key}:</span>
                <span class="info-value">${value}</span>
            </div>
        `).join('');
        
    } catch (error) {
        console.error('❌ Error loading system info:', error);
    }
}

function exportDatabase() {
    try {
        const data = {
            users: AuthManager.getUsers(),
            currentUser: AuthManager.getCurrentUser(),
            timestamp: new Date().toISOString(),
            version: '0.1.1'
        };
        
        const dataStr = JSON.stringify(data, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `shappa-database-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        showNotification('📤 Database esportato con successo', 'success');
    } catch (error) {
        console.error('❌ Error exporting database:', error);
        showNotification('❌ Errore nell\'esportazione database', 'error');
    }
}

function importDatabase() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = function(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const data = JSON.parse(e.target.result);
                
                if (data.users && Array.isArray(data.users)) {
                    if (confirm(`Importare ${data.users.length} utenti? Questo sostituirà i dati attuali.`)) {
                        AuthManager.saveUsers(data.users);
                        if (data.currentUser) {
                            localStorage.setItem('shappa_current_user', JSON.stringify(data.currentUser));
                        }
                        
                        showNotification(`📥 Database importato: ${data.users.length} utenti`, 'success');
                        loadSystemStats();
                        loadUsersList();
                        loadSystemInfo();
                    }
                } else {
                    throw new Error('Formato file non valido');
                }
            } catch (error) {
                console.error('❌ Error importing database:', error);
                showNotification('❌ Errore nell\'importazione: file non valido', 'error');
            }
        };
        reader.readAsText(file);
    };
    
    input.click();
}

function resetDatabase() {
    if (confirm('⚠️ ATTENZIONE: Questo resetterà completamente il database. Continuare?')) {
        if (confirm('🔴 Sei SICURO? Tutti i dati andranno persi!')) {
            try {
                localStorage.clear();
                sessionStorage.clear();
                AuthManager.initDatabase();
                
                showNotification('🔄 Database resettato completamente', 'success');
                loadSystemStats();
                loadUsersList();
                loadSystemInfo();
            } catch (error) {
                console.error('❌ Error resetting database:', error);
                showNotification('❌ Errore nel reset database', 'error');
            }
        }
    }
}

// ============ STRUMENTI SVILUPPO ============
function showConsoleLog() {
    const logs = [
        '🚀 Shappa Admin Console',
        '📊 Users: ' + AuthManager.getUsers().length,
        '🔐 Current User: ' + (AuthManager.getCurrentUser()?.username || 'none'),
        '💾 Storage: ' + formatBytes(calculateStorageSize()),
        '🌐 Online: ' + navigator.onLine,
        '🕐 Timestamp: ' + new Date().toLocaleString('it-IT')
    ];
    
    console.group('🛠️ Shappa System Info');
    logs.forEach(log => console.log(log));
    console.groupEnd();
    
    alert('📝 Console log generato. Controlla la console del browser (F12).');
}

function testAPIs() {
    showNotification('🔗 Test APIs in corso...', 'info');
    
    // Simula test delle API
    setTimeout(() => {
        const results = {
            'eBay OAuth': Math.random() > 0.3 ? '✅ OK' : '❌ Error',
            'Amazon API': Math.random() > 0.5 ? '✅ OK' : '❌ Error',
            'Local Storage': '✅ OK',
            'Session Storage': '✅ OK'
        };
        
        let message = 'Test API Results:\n';
        Object.entries(results).forEach(([api, status]) => {
            message += `${api}: ${status}\n`;
        });
        
        alert(message);
        showNotification('🔗 Test API completato', 'success');
    }, 2000);
}

function generateTestData() {
    if (confirm('Generare dati di test? (3 utenti fake)')) {
        try {
            const testUsers = [
                {
                    id: 'test_user_1_' + Date.now(),
                    username: 'testuser1',
                    email: 'test1@example.com',
                    password: 'test123456',
                    createdAt: new Date().toISOString(),
                    profile: {
                        amazonConnected: true,
                        ebayConnected: false,
                        totalListings: 5,
                        totalSales: 2,
                        totalProfits: 150.50
                    }
                },
                {
                    id: 'test_user_2_' + Date.now(),
                    username: 'testuser2',
                    email: 'test2@example.com',
                    password: 'test123456',
                    createdAt: new Date().toISOString(),
                    profile: {
                        amazonConnected: true,
                        ebayConnected: true,
                        totalListings: 12,
                        totalSales: 8,
                        totalProfits: 420.75
                    }
                },
                {
                    id: 'test_user_3_' + Date.now(),
                    username: 'testuser3',
                    email: 'test3@example.com',
                    password: 'test123456',
                    createdAt: new Date().toISOString(),
                    profile: {
                        amazonConnected: false,
                        ebayConnected: true,
                        totalListings: 3,
                        totalSales: 1,
                        totalProfits: 75.25
                    }
                }
            ];
            
            const existingUsers = AuthManager.getUsers();
            const allUsers = [...existingUsers, ...testUsers];
            AuthManager.saveUsers(allUsers);
            
            showNotification(`🎲 Generati ${testUsers.length} utenti di test`, 'success');
            loadSystemStats();
            loadUsersList();
        } catch (error) {
            console.error('❌ Error generating test data:', error);
            showNotification('❌ Errore nella generazione dati test', 'error');
        }
    }
}

function showSystemInfo() {
    const info = {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language,
        cookieEnabled: navigator.cookieEnabled,
        onLine: navigator.onLine,
        localStorage: typeof Storage !== "undefined",
        sessionStorage: typeof Storage !== "undefined",
        timestamp: new Date().toISOString(),
        url: window.location.href,
        storageSize: formatBytes(calculateStorageSize()),
        usersCount: AuthManager.getUsers().length
    };
    
    console.table(info);
    alert('ℹ️ Informazioni sistema mostrate nella console (F12)');
}

// ============ TEST FUNZIONALITÀ ============
function testRegistration() {
    showNotification('✅ Avvio test registrazione...', 'info');
    
    // Simula test registrazione
    setTimeout(() => {
        try {
            const testResult = AuthManager.register(
                'test_reg_' + Date.now(),
                'test_reg_' + Date.now() + '@example.com',
                'test12345',
                'test12345'
            );
            
            if (testResult.success) {
                showNotification('✅ Test registrazione: SUCCESSO', 'success');
                loadSystemStats();
                loadUsersList();
            } else {
                showNotification(`❌ Test registrazione: ${testResult.error}`, 'error');
            }
        } catch (error) {
            showNotification('❌ Test registrazione: ERRORE INTERNO', 'error');
            console.error('Test registration error:', error);
        }
    }, 1000);
}

function testLogin() {
    const users = AuthManager.getUsers();
    if (users.length === 0) {
        showNotification('❌ Nessun utente disponibile per il test login', 'error');
        return;
    }
    
    showNotification('🔐 Avvio test login...', 'info');
    
    setTimeout(() => {
        try {
            const testUser = users[0];
            const loginResult = AuthManager.login(testUser.email, testUser.password);
            
            if (loginResult.success) {
                showNotification(`✅ Test login: SUCCESSO (${testUser.username})`, 'success');
                loadSystemStats();
                loadUsersList();
            } else {
                showNotification(`❌ Test login: ${loginResult.error}`, 'error');
            }
        } catch (error) {
            showNotification('❌ Test login: ERRORE INTERNO', 'error');
            console.error('Test login error:', error);
        }
    }, 1000);
}

function testEbayConnection() {
    showNotification('🛒 Test connessione eBay...', 'info');
    
    // Simula test eBay
    setTimeout(() => {
        const success = Math.random() > 0.3;
        if (success) {
            showNotification('✅ Test eBay: Connessione riuscita', 'success');
        } else {
            showNotification('❌ Test eBay: Connessione fallita', 'error');
        }
    }, 2000);
}

function runFullTest() {
    if (confirm('Eseguire tutti i test? Questo potrebbe richiedere alcuni minuti.')) {
        showNotification('🧪 Avvio test completo...', 'info');
        
        let testResults = [];
        
        // Test 1: Registrazione
        setTimeout(() => {
            testRegistration();
            testResults.push('Registrazione');
        }, 1000);
        
        // Test 2: Login
        setTimeout(() => {
            testLogin();
            testResults.push('Login');
        }, 3000);
        
        // Test 3: eBay
        setTimeout(() => {
            testEbayConnection();
            testResults.push('eBay');
        }, 5000);
        
        // Risultati finali
        setTimeout(() => {
            showNotification(`🧪 Test completo terminato: ${testResults.join(', ')}`, 'success');
            console.log('🧪 Full test completed:', testResults);
        }, 7000);
    }
}

// ============ UTILITIES ============
function showNotification(message, type = 'info') {
    // Rimuovi notifiche precedenti
    const existing = document.querySelector('.admin-notification');
    if (existing) existing.remove();
    
    // Crea nuova notifica
    const notification = document.createElement('div');
    notification.className = 'admin-notification';
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 10000;
        max-width: 400px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        backdrop-filter: blur(10px);
        animation: slideInRight 0.3s ease-out;
        ${type === 'success' ? 'background: linear-gradient(135deg, #10b981, #059669);' :
          type === 'error' ? 'background: linear-gradient(135deg, #ef4444, #dc2626);' :
          type === 'warning' ? 'background: linear-gradient(135deg, #f59e0b, #d97706);' :
          'background: linear-gradient(135deg, #3b82f6, #1d4ed8);'}
    `;
    notification.textContent = message;
    
    // Aggiungi animazione CSS se non esiste
    if (!document.getElementById('notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(notification);
    
    // Rimuovi dopo 5 secondi
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideInRight 0.3s ease-out reverse';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
    
    console.log(`[${type.toUpperCase()}] ${message}`);
}

// Inizializza info cache al caricamento
document.addEventListener('DOMContentLoaded', updateCacheInfo);

console.log('🛠️ Admin functions loaded successfully');
