// Gestione login con cache busting e feedback migliorato
console.log('🔐 Login page loaded');

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('loginForm');
    
    // Cache busting per evitare problemi con cache browser
    if (performance.navigation.type === 1) {
        console.log('🔄 Cache refresh applied');
    }
    
    // Aggiungi meta tag per evitare cache
    const meta = document.createElement('meta');
    meta.httpEquiv = 'Cache-Control';
    meta.content = 'no-cache, no-store, must-revalidate';
    document.getElementsByTagName('head')[0].appendChild(meta);
    
    // Controlla se l'utente si è appena registrato
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('registered') === '1') {
        showWelcomeMessage();
    }
    
    // Controlla se utente è già loggato
    if (AuthManager.isLoggedIn()) {
        showInfo('Sei già loggato! Reindirizzamento...');
        setTimeout(() => {
            window.location.href = 'dashboard.html?t=' + Date.now();
        }, 1000);
        return;
    }
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const emailOrUsername = document.getElementById('emailOrUsername').value.trim();
        const password = document.getElementById('password').value;
        
        if (!emailOrUsername || !password) {
            showError('Inserisci email/username e password');
            return;
        }
        
        // Disabilita il form durante il login
        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Accedendo...';
        
        try {
            const result = await AuthManager.login(emailOrUsername, password);
            
            if (result.success) {
                showSuccess(`Bentornato ${result.user.username}!`);
                
                // Reindirizza dopo 1 secondo
                setTimeout(() => {
                    window.location.href = 'dashboard.html?login=success&t=' + Date.now();
                }, 1000);
            } else {
                showError(result.error);
                submitBtn.disabled = false;
                submitBtn.textContent = 'Accedi';
            }
        } catch (error) {
            console.error('❌ Errore login:', error);
            showError('Errore interno. Riprova più tardi.');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Accedi';
        }
    });
});

// Mostra messaggio di benvenuto per nuovi utenti
function showWelcomeMessage() {
    const welcomeDiv = document.createElement('div');
    welcomeDiv.style.cssText = `
        background: #f0f9ff;
        border: 1px solid #7dd3fc;
        color: #0369a1;
        padding: 1rem;
        border-radius: 6px;
        margin: 1rem 0;
        font-size: 0.9rem;
        text-align: center;
    `;
    welcomeDiv.innerHTML = `
        <strong>🎉 Account creato con successo!</strong><br>
        Ora puoi accedere con le tue credenziali.
    `;
    
    const header = document.querySelector('.auth-header');
    header.parentNode.insertBefore(welcomeDiv, header.nextSibling);
    
    // Rimuovi dopo 5 secondi
    setTimeout(() => {
        welcomeDiv.remove();
    }, 5000);
}

// Mostra messaggio di successo
function showSuccess(message) {
    const successDiv = document.createElement('div');
    successDiv.style.cssText = `
        background: #f0fdf4;
        border: 1px solid #86efac;
        color: #16a34a;
        padding: 1rem;
        border-radius: 6px;
        margin: 1rem 0;
        font-size: 0.9rem;
        text-align: center;
    `;
    successDiv.innerHTML = `<strong>✅ ${message}</strong>`;
    
    const header = document.querySelector('.auth-header');
    header.parentNode.insertBefore(successDiv, header.nextSibling);
}

// Mostra messaggio di info
function showInfo(message) {
    const infoDiv = document.createElement('div');
    infoDiv.style.cssText = `
        background: #fffbeb;
        border: 1px solid #fed7aa;
        color: #ea580c;
        padding: 1rem;
        border-radius: 6px;
        margin: 1rem 0;
        font-size: 0.9rem;
        text-align: center;
    `;
    infoDiv.innerHTML = `<strong>ℹ️ ${message}</strong>`;
    
    const header = document.querySelector('.auth-header');
    header.parentNode.insertBefore(infoDiv, header.nextSibling);
}

// Mostra messaggio di errore
function showError(message) {
    const existingError = document.querySelector('.error-message');
    if (existingError) existingError.remove();
    
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
    
    const header = document.querySelector('.auth-header');
    header.parentNode.insertBefore(errorDiv, header.nextSibling);
    
    setTimeout(() => {
        errorDiv.remove();
    }, 5000);
}

// Debug info
console.log('📊 Current users in DB:', AuthManager.getUsers().length);
console.log('🔐 User logged in:', AuthManager.isLoggedIn());
