// Gestione registrazione con feedback e cache busting
console.log('📝 Register page loaded');

document.addEventListener('DOMContentLoaded', function() {
    // Verifica che AuthManager sia caricato
    if (typeof AuthManager === 'undefined') {
        console.error('❌ AuthManager not loaded!');
        showError('Sistema di autenticazione non caricato. Ricarica la pagina.');
        return;
    }
    
    console.log('✅ AuthManager loaded, initializing form...');
    
    const form = document.getElementById('registerForm');
    if (!form) {
        console.error('❌ Register form not found!');
        return;
    }
    
    // Cache busting per evitare problemi con cache browser
    if (performance.navigation.type === 1) {
        // Page was reloaded
        console.log('🔄 Cache refresh applied');
    }
    
    // Aggiungi meta tag per evitare cache
    const meta = document.createElement('meta');
    meta.httpEquiv = 'Cache-Control';
    meta.content = 'no-cache, no-store, must-revalidate';
    document.getElementsByTagName('head')[0].appendChild(meta);
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Ottieni i dati del form
        const username = document.getElementById('username').value.trim();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const terms = document.getElementById('terms').checked;
        
        // Validazione termini
        if (!terms) {
            showError('Devi accettare i termini di servizio');
            return;
        }
        
        // Disabilita il form durante la registrazione
        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Creando account...';
        
        // Prova la registrazione
        try {
            console.log('🔄 Tentativo registrazione:', { username, email });
            
            // Verifica AuthManager
            if (typeof AuthManager === 'undefined') {
                throw new Error('AuthManager non disponibile');
            }
            
            if (typeof AuthManager.register !== 'function') {
                throw new Error('Funzione register non disponibile');
            }
            
            console.log('✅ AuthManager OK, eseguendo registrazione...');
            const result = await AuthManager.register(username, email, password, confirmPassword);
            console.log('📊 Risultato registrazione:', result);
            
            if (result && result.success) {
                // Successo! Mostra popup e reindirizza
                console.log('🎉 Registrazione riuscita!', result.user);
                showSuccessPopup(result.user);
                
                // Pulisci il form
                form.reset();
                
                // Reindirizza dopo 2 secondi
                setTimeout(() => {
                    // Cache busting per il redirect
                    window.location.href = 'login.html?registered=1&t=' + Date.now();
                }, 2000);
                
            } else {
                // Errore nella registrazione
                console.log('❌ Registrazione fallita:', result);
                const errorMessage = result && result.error ? result.error : 'Errore sconosciuto nella registrazione';
                showError(errorMessage);
                submitBtn.disabled = false;
                submitBtn.textContent = 'Crea Account';
            }
        } catch (error) {
            console.error('❌ Errore registrazione (catch):', error);
            showError(`Errore interno: ${error.message}. Controlla la console per dettagli.`);
            submitBtn.disabled = false;
            submitBtn.textContent = 'Crea Account';
        }
    });
});

// Mostra popup di successo
function showSuccessPopup(user) {
    // Crea overlay
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.7);
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
    `;
    
    // Crea popup
    const popup = document.createElement('div');
    popup.style.cssText = `
        background: white;
        padding: 2rem;
        border-radius: 12px;
        text-align: center;
        max-width: 400px;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        animation: popupSlideIn 0.3s ease-out;
    `;
    
    popup.innerHTML = `
        <div style="font-size: 3rem; margin-bottom: 1rem;">✅</div>
        <h2 style="color: #10b981; margin-bottom: 1rem;">Registrazione Avvenuta con Successo!</h2>
        <p style="margin-bottom: 1.5rem; color: #6b7280;">
            Benvenuto <strong>${user.username}</strong>!<br>
            Il tuo account è stato creato correttamente.
        </p>
        <div style="font-size: 0.9rem; color: #9ca3af; margin-bottom: 1rem;">
            📧 ${user.email}<br>
            🆔 ID: ${user.id}
        </div>
        <p style="font-size: 0.85rem; color: #6b7280;">
            Verrai reindirizzato alla pagina di login...
        </p>
    `;
    
    // Aggiungi CSS per animazione
    if (!document.getElementById('popup-styles')) {
        const styles = document.createElement('style');
        styles.id = 'popup-styles';
        styles.textContent = `
            @keyframes popupSlideIn {
                from {
                    opacity: 0;
                    transform: scale(0.8) translateY(-20px);
                }
                to {
                    opacity: 1;
                    transform: scale(1) translateY(0);
                }
            }
        `;
        document.head.appendChild(styles);
    }
    
    overlay.appendChild(popup);
    document.body.appendChild(overlay);
    
    // Log del successo
    console.log('🎉 Utente registrato con successo:', user);
    
    // Rimuovi popup dopo 2 secondi
    setTimeout(() => {
        overlay.remove();
    }, 2000);
}

// Mostra messaggio di errore
function showError(message) {
    // Rimuovi errori precedenti
    const existingError = document.querySelector('.error-message');
    if (existingError) existingError.remove();
    
    // Crea nuovo messaggio errore
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.style.cssText = `
        background: #fef2f2;
        border: 1px solid #fecaca;
        color: #dc2626;
        padding: 1rem;
        border-radius: 6px;
        margin: 1rem 0;
        font-size: 0.9rem;
    `;
    errorDiv.textContent = message;
    
    // Inserisci dopo l'header
    const header = document.querySelector('.auth-header');
    header.parentNode.insertBefore(errorDiv, header.nextSibling);
    
    // Rimuovi dopo 5 secondi
    setTimeout(() => {
        errorDiv.remove();
    }, 5000);
}

// Debug info
console.log('📊 AuthManager status:', typeof AuthManager);
console.log('🗄️ LocalStorage users:', localStorage.getItem('shappa_users_db'));

// Test AuthManager availability
if (typeof AuthManager !== 'undefined') {
    console.log('✅ AuthManager methods:', Object.keys(AuthManager));
    try {
        AuthManager.initDatabase();
        console.log('✅ Database initialized successfully');
        console.log('👥 Current users count:', AuthManager.getUsers().length);
    } catch (e) {
        console.error('❌ Error initializing database:', e);
    }
} else {
    console.error('❌ AuthManager is undefined! Check if auth.js is loaded correctly.');
}
