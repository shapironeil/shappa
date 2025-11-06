// ==========================================
// 📝 SHAPPA REGISTER v2.0 - OTTIMIZZATO
// Gestione registrazione con UX migliorata e error handling robusto
// ==========================================

console.log('📝 Register System v2.0 loaded');

class ShappaRegister {
    constructor() {
        this.form = null;
        this.submitBtn = null;
        this.isSubmitting = false;
        this.init();
    }

    init() {
        console.log('🔄 Initializing register form...');

        // Verifica AuthManager
        if (typeof AuthManager === 'undefined') {
            console.error('❌ AuthManager not available');
            this.showFatalError('Sistema di autenticazione non disponibile. Ricarica la pagina.');
            return;
        }

        // Trova elementi DOM
        this.form = document.getElementById('registerForm');
        if (!this.form) {
            console.error('❌ Register form not found');
            this.showFatalError('Form di registrazione non trovato.');
            return;
        }

        this.submitBtn = this.form.querySelector('button[type="submit"]');
        if (!this.submitBtn) {
            console.error('❌ Submit button not found');
            return;
        }

        // Setup event listeners
        this.setupEventListeners();

        // Cache busting
        this.setupCacheBusting();

        console.log('✅ Register form initialized');
    }

    setupEventListeners() {
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSubmit();
        });

        // Validazione real-time
        const inputs = this.form.querySelectorAll('input');
        inputs.forEach(input => {
            input.addEventListener('blur', () => this.validateField(input));
            input.addEventListener('input', () => this.clearFieldError(input));
        });
    }

    setupCacheBusting() {
        // Forza refresh cache per evitare problemi
        if (performance.navigation.type === 1) {
            console.log('🔄 Page reloaded - cache refresh applied');
        }

        // Aggiungi meta tag
        const meta = document.createElement('meta');
        meta.httpEquiv = 'Cache-Control';
        meta.content = 'no-cache, no-store, must-revalidate';
        document.getElementsByTagName('head')[0].appendChild(meta);
    }

    async handleSubmit() {
        if (this.isSubmitting) {
            console.log('⚠️ Already submitting, ignoring...');
            return;
        }

        try {
            this.isSubmitting = true;
            this.setLoadingState(true);

            console.log('🔄 Starting registration process...');

            // Raccogli dati
            const formData = this.getFormData();
            if (!formData) {
                return; // Error already shown
            }

            // Verifica termini
            if (!formData.terms) {
                this.showError('Devi accettare i termini di servizio');
                return;
            }

            // Tenta registrazione
            const result = AuthManager.register(
                formData.username,
                formData.email,
                formData.password,
                formData.confirmPassword
            );

            console.log('📊 Registration result:', result);

            if (result.success) {
                await this.handleSuccess(result.user);
            } else {
                this.handleError(result.error);
            }

        } catch (error) {
            console.error('❌ Unexpected registration error:', error);
            this.handleError(`Errore interno: ${error.message}`);
        } finally {
            this.isSubmitting = false;
            this.setLoadingState(false);
        }
    }

    getFormData() {
        const username = document.getElementById('username')?.value?.trim();
        const email = document.getElementById('email')?.value?.trim();
        const password = document.getElementById('password')?.value;
        const confirmPassword = document.getElementById('confirmPassword')?.value;
        const terms = document.getElementById('terms')?.checked;

        // Validazione base
        if (!username || !email || !password || !confirmPassword) {
            this.showError('Tutti i campi sono obbligatori');
            return null;
        }

        return {
            username,
            email,
            password,
            confirmPassword,
            terms
        };
    }

    async handleSuccess(user) {
        console.log('🎉 Registration successful!', user);

        // Mostra popup di successo
        this.showSuccessPopup(user);

        // Pulisci form
        this.form.reset();

        // Reindirizza dopo delay
        setTimeout(() => {
            const redirectUrl = 'login.html?registered=1&t=' + Date.now();
            console.log('🔄 Redirecting to:', redirectUrl);
            window.location.href = redirectUrl;
        }, 2500);
    }

    handleError(error) {
        console.error('❌ Registration failed:', error);
        this.showError(error || 'Errore sconosciuto durante la registrazione');
    }

    showSuccessPopup(user) {
        // Rimuovi popup esistenti
        const existing = document.querySelector('.success-popup');
        if (existing) existing.remove();

        // Crea overlay
        const overlay = document.createElement('div');
        overlay.className = 'success-popup';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            backdrop-filter: blur(5px);
            z-index: 10000;
            display: flex;
            align-items: center;
            justify-content: center;
            animation: fadeIn 0.3s ease;
        `;

        // Crea popup
        const popup = document.createElement('div');
        popup.style.cssText = `
            background: linear-gradient(135deg, #10b981, #059669);
            color: white;
            padding: 2.5rem;
            border-radius: 20px;
            text-align: center;
            max-width: 450px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
            animation: slideUp 0.4s ease;
            position: relative;
        `;

        popup.innerHTML = `
            <div style="font-size: 4rem; margin-bottom: 1rem;">🎉</div>
            <h2 style="font-size: 1.8rem; margin-bottom: 1rem; font-weight: 700;">
                Registrazione Completata!
            </h2>
            <p style="margin-bottom: 1.5rem; opacity: 0.9; line-height: 1.6;">
                Benvenuto <strong>${user.username}</strong>!<br>
                Il tuo account è stato creato con successo.
            </p>
            <div style="background: rgba(255, 255, 255, 0.1); padding: 1rem; border-radius: 10px; margin-bottom: 1.5rem;">
                <div style="font-size: 0.9rem; opacity: 0.8;">📧 ${user.email}</div>
                <div style="font-size: 0.8rem; opacity: 0.6; margin-top: 0.5rem;">ID: ${user.id}</div>
            </div>
            <p style="font-size: 0.9rem; opacity: 0.8;">
                Reindirizzamento al login...
            </p>
            <div style="position: absolute; bottom: -20px; left: 50%; transform: translateX(-50%);">
                <div class="loading-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        `;

        // Aggiungi animazioni CSS
        if (!document.getElementById('popup-styles')) {
            const styles = document.createElement('style');
            styles.id = 'popup-styles';
            styles.textContent = `
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes slideUp {
                    from { transform: translateY(30px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                .loading-dots {
                    display: inline-block;
                }
                .loading-dots span {
                    display: inline-block;
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    background: rgba(255, 255, 255, 0.6);
                    animation: loading 1.4s infinite ease-in-out both;
                    margin: 0 2px;
                }
                .loading-dots span:nth-child(1) { animation-delay: -0.32s; }
                .loading-dots span:nth-child(2) { animation-delay: -0.16s; }
                @keyframes loading {
                    0%, 80%, 100% { transform: scale(0); opacity: 0.5; }
                    40% { transform: scale(1); opacity: 1; }
                }
            `;
            document.head.appendChild(styles);
        }

        overlay.appendChild(popup);
        document.body.appendChild(overlay);

        // Rimuovi automaticamente dopo 2.5 secondi
        setTimeout(() => {
            if (overlay.parentNode) {
                overlay.style.animation = 'fadeIn 0.3s ease reverse';
                setTimeout(() => overlay.remove(), 300);
            }
        }, 2500);
    }

    showError(message) {
        // Rimuovi errori precedenti
        this.clearErrors();

        // Crea messaggio errore
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.style.cssText = `
            background: linear-gradient(135deg, #ef4444, #dc2626);
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 10px;
            margin: 1rem 0;
            font-size: 0.95rem;
            font-weight: 500;
            box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
            animation: shake 0.5s ease;
        `;

        // Icona e messaggio
        errorDiv.innerHTML = `
            <div style="display: flex; align-items: center; gap: 0.75rem;">
                <span style="font-size: 1.2rem;">⚠️</span>
                <span>${message}</span>
            </div>
        `;

        // Aggiungi animazione shake
        if (!document.getElementById('error-styles')) {
            const styles = document.createElement('style');
            styles.id = 'error-styles';
            styles.textContent = `
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-5px); }
                    75% { transform: translateX(5px); }
                }
            `;
            document.head.appendChild(styles);
        }

        // Inserisci dopo header
        const header = document.querySelector('.auth-header');
        if (header) {
            header.parentNode.insertBefore(errorDiv, header.nextSibling);
        }

        // Rimuovi dopo 6 secondi
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.style.animation = 'fadeOut 0.3s ease';
                setTimeout(() => errorDiv.remove(), 300);
            }
        }, 6000);
    }

    showFatalError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: #1f2937;
            color: #ef4444;
            padding: 2rem;
            border-radius: 12px;
            border: 2px solid #ef4444;
            text-align: center;
            z-index: 10000;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
        `;

        errorDiv.innerHTML = `
            <div style="font-size: 3rem; margin-bottom: 1rem;">❌</div>
            <h3 style="margin-bottom: 1rem;">Errore Critico</h3>
            <p>${message}</p>
            <button onclick="location.reload()" style="
                margin-top: 1rem;
                padding: 0.5rem 1rem;
                background: #ef4444;
                color: white;
                border: none;
                border-radius: 6px;
                cursor: pointer;
            ">Ricarica Pagina</button>
        `;

        document.body.appendChild(errorDiv);
    }

    clearErrors() {
        const errors = document.querySelectorAll('.error-message');
        errors.forEach(error => error.remove());
    }

    validateField(input) {
        const value = input.value.trim();
        let error = null;

        switch (input.name) {
            case 'username':
                if (!value) error = 'Username obbligatorio';
                else if (value.length < 3) error = 'Username minimo 3 caratteri';
                else if (!/^[a-zA-Z0-9_]+$/.test(value)) error = 'Solo lettere, numeri e underscore';
                break;

            case 'email':
                if (!value) error = 'Email obbligatoria';
                else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) error = 'Email non valida';
                break;

            case 'password':
                if (!value) error = 'Password obbligatoria';
                else if (value.length < 8) error = 'Password minimo 8 caratteri';
                else if (!/[A-Za-z]/.test(value) || !/[0-9]/.test(value)) error = 'Password deve contenere lettere e numeri';
                break;

            case 'confirmPassword':
                const password = document.getElementById('password')?.value;
                if (!value) error = 'Conferma password obbligatoria';
                else if (value !== password) error = 'Le password non coincidono';
                break;
        }

        if (error) {
            this.showFieldError(input, error);
        }
    }

    showFieldError(input, message) {
        // Rimuovi errori precedenti per questo campo
        this.clearFieldError(input);

        const errorDiv = document.createElement('div');
        errorDiv.className = 'field-error';
        errorDiv.style.cssText = `
            color: #ef4444;
            font-size: 0.8rem;
            margin-top: 0.25rem;
            animation: fadeIn 0.3s ease;
        `;
        errorDiv.textContent = message;

        input.style.borderColor = '#ef4444';
        input.parentNode.appendChild(errorDiv);
    }

    clearFieldError(input) {
        input.style.borderColor = '';
        const error = input.parentNode.querySelector('.field-error');
        if (error) error.remove();
    }

    setLoadingState(loading) {
        if (!this.submitBtn) return;

        if (loading) {
            this.submitBtn.disabled = true;
            this.submitBtn.textContent = '⏳ Creando account...';
            this.submitBtn.style.background = 'linear-gradient(135deg, #6b7280, #4b5563)';
        } else {
            this.submitBtn.disabled = false;
            this.submitBtn.textContent = '🚀 Crea Account';
            this.submitBtn.style.background = '';
        }
    }
}

// ==========================================
// 🚀 INIZIALIZZAZIONE
// ==========================================

// Inizializza quando DOM è pronto
document.addEventListener('DOMContentLoaded', () => {
    console.log('📄 DOM ready, initializing register system...');
    new ShappaRegister();
});

// Fallback per vecchi browser
if (typeof document.addEventListener === 'undefined') {
    window.onload = () => new ShappaRegister();
}

console.log('🎉 Register System v2.0 ready!');
