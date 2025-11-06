// ==========================================
// 🚀 SHAPPA AUTH SYSTEM v2.0 - OTTIMIZZATO
// Sistema di autenticazione avanzato con gestione errori robusta
// ==========================================

console.log('🔐 Shappa Auth System v2.0 initialized');

// Classe principale per la gestione dell'autenticazione
class ShappaAuth {
    constructor() {
        this.currentUser = null;
        this.dbKey = 'shappa_users_db_v2';
        this.currentUserKey = 'shappa_current_user_v2';
        this.initialized = false;

        // Inizializza automaticamente
        this.init();
    }

    // ==========================================
    // 🔧 INIZIALIZZAZIONE E SETUP
    // ==========================================

    init() {
        try {
            console.log('🔄 Initializing ShappaAuth...');

            // Verifica supporto localStorage
            if (!this.checkStorageSupport()) {
                throw new Error('localStorage non supportato dal browser');
            }

            // Inizializza database
            this.initDatabase();

            // Carica utente corrente se presente
            this.loadCurrentUser();

            this.initialized = true;
            console.log('✅ ShappaAuth initialized successfully');

        } catch (error) {
            console.error('❌ ShappaAuth initialization failed:', error);
            throw error;
        }
    }

    checkStorageSupport() {
        try {
            const test = '__storage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            return false;
        }
    }

    initDatabase() {
        if (!localStorage.getItem(this.dbKey)) {
            const defaultData = {
                version: '2.0',
                users: [],
                created: new Date().toISOString(),
                lastModified: new Date().toISOString()
            };
            localStorage.setItem(this.dbKey, JSON.stringify(defaultData));
            console.log('🗄️ Database v2.0 initialized');
        }
    }

    // ==========================================
    // 💾 GESTIONE DATABASE
    // ==========================================

    getDatabase() {
        try {
            const data = localStorage.getItem(this.dbKey);
            if (!data) {
                this.initDatabase();
                return this.getDatabase();
            }
            return JSON.parse(data);
        } catch (error) {
            console.error('❌ Error reading database:', error);
            // Reset database in caso di corruzione
            this.resetDatabase();
            return this.getDatabase();
        }
    }

    saveDatabase(data) {
        try {
            data.lastModified = new Date().toISOString();
            localStorage.setItem(this.dbKey, JSON.stringify(data));
            console.log('💾 Database saved successfully');
        } catch (error) {
            console.error('❌ Error saving database:', error);
            throw new Error('Impossibile salvare i dati. Spazio di archiviazione pieno?');
        }
    }

    resetDatabase() {
        console.warn('🔄 Resetting database...');
        localStorage.removeItem(this.dbKey);
        localStorage.removeItem(this.currentUserKey);
        this.currentUser = null;
        this.initDatabase();
    }

    // ==========================================
    // 👤 GESTIONE UTENTI
    // ==========================================

    getUsers() {
        const db = this.getDatabase();
        return db.users || [];
    }

    // Alias per compatibilità con admin panel
    getAllUsers() {
        return this.getUsers();
    }

    saveUsers(users) {
        const db = this.getDatabase();
        db.users = users;
        this.saveDatabase(db);
    }

    generateUserId() {
        return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // ==========================================
    // ✅ VALIDAZIONI
    // ==========================================

    // Detailed validation (for UI)
    validateEmail(email) {
        const isValid = this._isValidEmail(email);
        return {
            isValid,
            error: isValid ? undefined : 'Email non valida'
        };
    }

    validatePassword(password) {
        const isValid = this._isValidPassword(password);
        return {
            isValid,
            error: isValid ? undefined : 'Password deve essere almeno 8 caratteri con lettere e numeri'
        };
    }

    validateUsername(username) {
        const isValid = this._isValidUsername(username);
        return {
            isValid,
            error: isValid ? undefined : 'Username deve essere 3-50 caratteri, solo lettere, numeri e underscore'
        };
    }

    // Internal boolean validators (used by registration/login flows)
    _isValidEmail(email) {
        if (!email || typeof email !== 'string') return false;
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email.trim());
    }

    _isValidPassword(password) {
        if (!password || typeof password !== 'string') return false;
        return password.length >= 8 && /[A-Za-z]/.test(password) && /[0-9]/.test(password);
    }

    _isValidUsername(username) {
        if (!username || typeof username !== 'string') return false;
        const trimmed = username.trim();
        return trimmed.length >= 3 && trimmed.length <= 50 && /^[a-zA-Z0-9_]+$/.test(trimmed);
    }

    // ==========================================
    // 📝 REGISTRAZIONE
    // ==========================================

    register(username, email, password, confirmPassword) {
        try {
            console.log('🔄 Starting registration process...');

            // Validazioni input
            const validation = this.validateRegistrationInput(username, email, password, confirmPassword);
            if (!validation.valid) {
                return { success: false, error: validation.error };
            }

            // Verifica unicità
            const users = this.getUsers();
            if (this.userExists(users, email, username)) {
                return { success: false, error: 'Email o username già in uso' };
            }

            // Crea nuovo utente
            const newUser = this.createUser(username.trim(), email.trim().toLowerCase(), password);
            console.log('👤 Created new user:', newUser.username);

            // Salva utente
            users.push(newUser);
            this.saveUsers(users);

            console.log('✅ Registration successful for:', username);
            return { success: true, user: newUser };

        } catch (error) {
            console.error('❌ Registration error:', error);
            return { success: false, error: 'Errore interno durante la registrazione' };
        }
    }

    validateRegistrationInput(username, email, password, confirmPassword) {
        if (!this._isValidUsername(username)) {
            return { valid: false, error: 'Username deve essere 3-50 caratteri, solo lettere, numeri e underscore' };
        }

        if (!this._isValidEmail(email)) {
            return { valid: false, error: 'Email non valida' };
        }

        if (!this._isValidPassword(password)) {
            return { valid: false, error: 'Password deve essere almeno 8 caratteri con lettere e numeri' };
        }

        if (password !== confirmPassword) {
            return { valid: false, error: 'Le password non coincidono' };
        }

        return { valid: true };
    }

    userExists(users, email, username) {
        const normalizedEmail = email.trim().toLowerCase();
        const normalizedUsername = username.trim().toLowerCase();

        return users.some(user =>
            user.email.toLowerCase() === normalizedEmail ||
            user.username.toLowerCase() === normalizedUsername
        );
    }

    createUser(username, email, password) {
        return {
            id: this.generateUserId(),
            username: username.trim(),
            email: email.trim().toLowerCase(),
            password: password, // In produzione usare hash
            createdAt: new Date().toISOString(),
            lastLogin: null,
            profile: {
                amazonConnected: false,
                ebayConnected: false,
                amazonData: null,
                ebayData: null,
                totalListings: 0,
                totalSales: 0,
                totalProfits: 0,
                salesHistory: [],
                activeListings: [],
                preferences: {
                    theme: 'light',
                    notifications: true,
                    language: 'it'
                }
            }
        };
    }

    // ==========================================
    // 🔐 LOGIN
    // ==========================================

    login(emailOrUsername, password) {
        try {
            console.log('🔄 Starting login process...');

            if (!emailOrUsername || !password) {
                return { success: false, error: 'Email/username e password richiesti' };
            }

            const users = this.getUsers();
            const user = this.findUserForLogin(users, emailOrUsername.trim(), password);

            if (!user) {
                return { success: false, error: 'Credenziali non valide' };
            }

            // Aggiorna last login
            user.lastLogin = new Date().toISOString();
            this.saveUsers(users);

            // Imposta utente corrente
            this.currentUser = user;
            this.saveCurrentUser(user);

            console.log('✅ Login successful for:', user.username);
            return { success: true, user };

        } catch (error) {
            console.error('❌ Login error:', error);
            return { success: false, error: 'Errore interno durante il login' };
        }
    }

    findUserForLogin(users, emailOrUsername, password) {
        const normalizedInput = emailOrUsername.toLowerCase();

        return users.find(user => {
            const emailMatch = user.email.toLowerCase() === normalizedInput;
            const usernameMatch = user.username.toLowerCase() === normalizedInput;
            const passwordMatch = user.password === password;

            return (emailMatch || usernameMatch) && passwordMatch;
        });
    }

    // ==========================================
    // 🚪 LOGOUT E SESSIONE
    // ==========================================

    logout() {
        try {
            console.log('👋 Logout for:', this.currentUser?.username);
            this.currentUser = null;
            localStorage.removeItem(this.currentUserKey);

            // Redirect intelligente
            // Torna alla home e mostra la modale di login
            const currentPath = window.location.pathname;
            // Se siamo dentro /src/pages, salta alla root index
            if (currentPath.includes('/src/pages/')) {
                window.location.href = '../../index.html#login';
            } else {
                window.location.href = 'index.html#login';
            }

        } catch (error) {
            console.error('❌ Logout error:', error);
        }
    }

    isLoggedIn() {
        return this.currentUser !== null;
    }

    getCurrentUser() {
        return this.currentUser;
    }

    loadCurrentUser() {
        try {
            const stored = localStorage.getItem(this.currentUserKey);
            if (stored) {
                this.currentUser = JSON.parse(stored);
                console.log('👤 Loaded current user:', this.currentUser.username);
            }
        } catch (error) {
            console.error('❌ Error loading current user:', error);
            localStorage.removeItem(this.currentUserKey);
        }
    }

    saveCurrentUser(user) {
        try {
            console.log('💾 Saving current user to localStorage:', user.username);
            console.log('📦 Profile data being saved:', user.profile);
            localStorage.setItem(this.currentUserKey, JSON.stringify(user));
            console.log('✅ Current user saved successfully');
        } catch (error) {
            console.error('❌ Error saving current user:', error);
        }
    }

    // ==========================================
    // 👤 GESTIONE PROFILO
    // ==========================================

    updateUserProfile(userId, updates) {
        try {
            console.log('🔄 updateUserProfile called with userId:', userId);
            console.log('📝 Updates to apply:', updates);
            
            const users = this.getUsers();
            const userIndex = users.findIndex(u => u.id === userId);

            if (userIndex === -1) {
                console.error('❌ User not found with ID:', userId);
                return { success: false, error: 'Utente non trovato' };
            }

            console.log('👤 Found user:', users[userIndex].username);
            console.log('📋 Current profile:', users[userIndex].profile);
            
            // Aggiorna profilo
            Object.assign(users[userIndex].profile, updates);
            
            console.log('📋 Updated profile:', users[userIndex].profile);
            
            this.saveUsers(users);

            // Aggiorna utente corrente se necessario
            if (this.currentUser && this.currentUser.id === userId) {
                this.currentUser = users[userIndex];
                this.saveCurrentUser(this.currentUser);
            }

            console.log('✅ Profile updated for:', users[userIndex].username);
            return { success: true, user: users[userIndex] };

        } catch (error) {
            console.error('❌ Profile update error:', error);
            return { success: false, error: 'Errore nell\'aggiornamento del profilo' };
        }
    }

    // ==========================================
    // 🛠️ UTILITIES
    // ==========================================

    getStats() {
        const users = this.getUsers();
        const db = this.getDatabase();

        return {
            totalUsers: users.length,
            activeUsers: users.filter(u => u.lastLogin).length,
            connectedToEbay: users.filter(u => u.profile?.ebayConnected).length,
            connectedToAmazon: users.filter(u => u.profile?.amazonConnected).length,
            totalListings: users.reduce((sum, u) => sum + (u.profile?.totalListings || 0), 0),
            totalSales: users.reduce((sum, u) => sum + (u.profile?.totalSales || 0), 0),
            dbVersion: db.version,
            dbCreated: db.created,
            dbLastModified: db.lastModified
        };
    }

    // Migrazione da versione precedente
    migrateFromV1() {
        try {
            const oldData = localStorage.getItem('shappa_users_db');
            if (oldData) {
                const oldUsers = JSON.parse(oldData);
                if (Array.isArray(oldUsers) && oldUsers.length > 0) {
                    console.log('🔄 Migrating from v1 database...');

                    // Converte vecchi utenti al nuovo formato
                    const migratedUsers = oldUsers.map(user => ({
                        ...user,
                        profile: {
                            amazonConnected: user.profile?.amazonConnected || false,
                            ebayConnected: user.profile?.ebayConnected || false,
                            amazonData: user.profile?.amazonData || null,
                            ebayData: user.profile?.ebayData || null,
                            totalListings: user.profile?.totalListings || 0,
                            totalSales: user.profile?.totalSales || 0,
                            totalProfits: user.profile?.totalProfits || 0,
                            salesHistory: user.profile?.salesHistory || [],
                            activeListings: user.profile?.activeListings || [],
                            preferences: {
                                theme: 'light',
                                notifications: true,
                                language: 'it'
                            }
                        }
                    }));

                    // Salva nel nuovo formato
                    const newDb = {
                        version: '2.0',
                        users: migratedUsers,
                        created: new Date().toISOString(),
                        lastModified: new Date().toISOString()
                    };

                    localStorage.setItem(this.dbKey, JSON.stringify(newDb));
                    localStorage.removeItem('shappa_users_db'); // Rimuovi vecchio

                    console.log('✅ Migration completed:', migratedUsers.length, 'users migrated');
                }
            }
        } catch (error) {
            console.error('❌ Migration error:', error);
        }
    }
}

// ==========================================
// 🚀 INIZIALIZZAZIONE GLOBALE
// ==========================================

// Istanza globale ottimizzata
const AuthManager = new ShappaAuth();

// Migrazione automatica se necessario
AuthManager.migrateFromV1();

// Export per compatibilità
window.AuthManager = AuthManager;

console.log('🎉 Shappa Auth System v2.0 ready!');
