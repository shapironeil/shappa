// Authentication utilities e logica
console.log('🔐 Auth system initialized');

const AuthManager = {
    // Database locale per utenti registrati
    currentUser: null,
    
    // Inizializza database utenti se non esiste
    initDatabase() {
        if (!localStorage.getItem('shappa_users_db')) {
            const defaultUsers = [];
            localStorage.setItem('shappa_users_db', JSON.stringify(defaultUsers));
            console.log('🗄️ Database utenti inizializzato vuoto');
        }
    },
    
    // Ottiene tutti gli utenti
    getUsers() {
        return JSON.parse(localStorage.getItem('shappa_users_db') || '[]');
    },
    
    // Salva utenti nel database
    saveUsers(users) {
        localStorage.setItem('shappa_users_db', JSON.stringify(users));
    },
    
    // Genera ID utente unico
    generateUserId() {
        return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    },
    
    // Validazione email
    validateEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    },
    
    // Validazione password
    validatePassword(password) {
        return password.length >= 8 && /[A-Za-z]/.test(password) && /[0-9]/.test(password);
    },
    
    // Login
    login(emailOrUsername, password) {
        this.initDatabase();
        const users = this.getUsers();
        
        const user = users.find(u => 
            (u.email === emailOrUsername || u.username === emailOrUsername) && 
            u.password === password
        );
        
        if (user) {
            this.currentUser = user;
            localStorage.setItem('shappa_current_user', JSON.stringify(user));
            console.log('✅ Login successful:', user.username);
            return { success: true, user };
        }
        
        console.log('❌ Login failed');
        return { success: false, error: 'Credenziali non valide' };
    },
    
    // Registrazione
    register(username, email, password, confirmPassword) {
        this.initDatabase();
        
        // Validazioni
        if (!username || username.length < 3) {
            return { success: false, error: 'Username deve essere almeno 3 caratteri' };
        }
        
        if (!this.validateEmail(email)) {
            return { success: false, error: 'Email non valida' };
        }
        
        if (!this.validatePassword(password)) {
            return { success: false, error: 'Password deve essere almeno 8 caratteri con lettere e numeri' };
        }
        
        if (password !== confirmPassword) {
            return { success: false, error: 'Le password non coincidono' };
        }
        
        const users = this.getUsers();
        
        // Controlla se utente esiste già
        if (users.find(u => u.email === email || u.username === username)) {
            return { success: false, error: 'Utente già registrato' };
        }
        
        // Crea nuovo utente con profilo personalizzato
        const newUser = { 
            id: this.generateUserId(),
            username, 
            email, 
            password,
            createdAt: new Date().toISOString(),
            profile: {
                amazonConnected: false,
                ebayConnected: false,
                amazonData: null,
                ebayData: null,
                totalListings: 0,
                totalSales: 0,
                totalProfits: 0,
                salesHistory: [],
                activeListings: []
            }
        };
        
        users.push(newUser);
        this.saveUsers(users);
        
        console.log('✅ Registration successful:', username);
        return { success: true, user: newUser };
    },
    
    // Logout
    logout() {
        this.currentUser = null;
        localStorage.removeItem('shappa_current_user');
        console.log('👋 Logout successful');
        
        // Redirect intelligente basato su dove si trova l'utente
        const currentPath = window.location.pathname;
        if (currentPath.includes('/pages/')) {
            window.location.href = '../pages/login.html';
        } else {
            window.location.href = 'src/pages/login.html';
        }
    },
    
    // Controlla se utente è loggato
    isLoggedIn() {
        if (this.currentUser) return true;
        
        const stored = localStorage.getItem('shappa_current_user');
        if (stored) {
            this.currentUser = JSON.parse(stored);
            return true;
        }
        
        return false;
    },
    
    // Recupera utente corrente
    getCurrentUser() {
        if (!this.currentUser) {
            const stored = localStorage.getItem('shappa_current_user');
            if (stored) {
                this.currentUser = JSON.parse(stored);
            }
        }
        return this.currentUser;
    },
    
    // Aggiorna profilo utente
    updateUserProfile(updates) {
        if (!this.currentUser) return false;
        
        const users = this.getUsers();
        const userIndex = users.findIndex(u => u.id === this.currentUser.id);
        
        if (userIndex !== -1) {
            users[userIndex] = { ...users[userIndex], ...updates };
            this.saveUsers(users);
            this.currentUser = users[userIndex];
            localStorage.setItem('shappa_current_user', JSON.stringify(this.currentUser));
            return true;
        }
        return false;
    },
    
    // Password reset (simulato)
    resetPassword(email) {
        this.initDatabase();
        const users = this.getUsers();
        const user = users.find(u => u.email === email);
        if (user) {
            console.log('📧 Password reset email sent to:', email);
            return { success: true, message: 'Email di reset inviata' };
        }
        return { success: false, error: 'Email non trovata' };
    }
};

// Event listeners per form di login
if (document.getElementById('loginForm')) {
    document.getElementById('loginForm').addEventListener('submit', (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        const result = AuthManager.login(email, password);
        
        if (result.success) {
            // Redirect alla dashboard
            window.location.href = 'dashboard.html';
        } else {
            alert(result.error);
        }
    });
}

// Event listeners per form di registrazione
if (document.getElementById('registerForm')) {
    document.getElementById('registerForm').addEventListener('submit', (e) => {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        const result = AuthManager.register(username, email, password, confirmPassword);
        
        if (result.success) {
            alert('Registrazione completata! Ora puoi effettuare il login.');
            window.location.href = 'login.html';
        } else {
            alert(result.error);
        }
    });
}

// Protezione pagine autenticate
function requireAuth() {
    if (!AuthManager.isLoggedIn()) {
        console.log('🔒 Access denied - redirecting to login');
        window.location.href = '../pages/login.html';
        return false;
    }
    return true;
}

// Auto-redirect se già loggato nelle pagine di auth
function redirectIfLoggedIn() {
    if (AuthManager.isLoggedIn()) {
        console.log('👤 User already logged in - redirecting to dashboard');
        window.location.href = 'dashboard.html';
    }
}

// Inizializzazione componenti auth nelle pagine appropriate
document.addEventListener('DOMContentLoaded', () => {
    // Inizializza il database utenti
    AuthManager.initDatabase();
    // Se siamo in una pagina di login/register, redirect se già loggato
    if (window.location.pathname.includes('login.html') || 
        window.location.pathname.includes('register.html')) {
        redirectIfLoggedIn();
    }
    
    // Se siamo in una pagina protetta, richiedi auth
    if (window.location.pathname.includes('dashboard.html') ||
        window.location.pathname.includes('settings.html')) {
        requireAuth();
        
        // Mostra username nella navbar
        const user = AuthManager.getCurrentUser();
        if (user) {
            const userElements = document.querySelectorAll('.nav-user span');
            userElements.forEach(el => {
                if (el.textContent.includes('Username')) {
                    el.textContent = `👤 ${user.username}`;
                }
            });
        }
    }
    
    // Event listener per logout buttons
    document.querySelectorAll('.btn-logout').forEach(btn => {
        btn.addEventListener('click', () => {
            AuthManager.logout();
        });
    });
});

// Esporta per uso globale
window.AuthManager = AuthManager;
