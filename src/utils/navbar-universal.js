/**
 * Navbar Universal - Click Handler per tutte le pagine
 * Gestisce il redirect al profilo/account da qualsiasi pagina
 */

(function() {
    'use strict';
    
    console.log('📱 Navbar Universal initialized');
    
    // Aspetta che il DOM sia caricato
    function initNavbarHandlers() {
        const userName = document.getElementById('userName');
        const userAvatar = document.getElementById('userAvatar');
        
        if (userName) {
            userName.style.cursor = 'pointer';
            userName.addEventListener('click', handleProfileClick);
            console.log('✅ Username click handler attached');
        }
        
        if (userAvatar) {
            userAvatar.style.cursor = 'pointer';
            userAvatar.addEventListener('click', handleProfileClick);
            console.log('✅ Avatar click handler attached');
        }
    }
    
    // Gestisce il click sul profilo
    function handleProfileClick(e) {
        e.preventDefault();
        console.log('🔗 Profile clicked, redirecting to settings...');
        
        // Determina la pagina corrente
        const currentPath = window.location.pathname;
        console.log('📍 Current path:', currentPath);
        
        // Se siamo già in settings.html, switcha alla tab Account
        if (currentPath.includes('settings.html')) {
            const accountTab = document.querySelector('[data-tab="account"]');
            if (accountTab) {
                accountTab.click();
                console.log('✅ Switched to Account tab');
            }
        } else {
            // Altrimenti, naviga a settings.html con hash #account
            window.location.href = './settings.html#account';
            console.log('✅ Navigating to settings.html#account');
        }
    }
    
    // Gestisce l'hash #account all'apertura della pagina settings
    function handleAccountHash() {
        const currentPath = window.location.pathname;
        const hash = window.location.hash;
        
        if (currentPath.includes('settings.html') && hash === '#account') {
            console.log('🔗 Hash #account detected, switching to Account tab');
            
            // Aspetta che la pagina sia completamente caricata
            setTimeout(() => {
                const accountTab = document.querySelector('[data-tab="account"]');
                if (accountTab) {
                    accountTab.click();
                    console.log('✅ Account tab activated via hash');
                    // Rimuovi l'hash dall'URL
                    history.replaceState(null, null, ' ');
                }
            }, 100);
        }
    }
    
    // Inizializza quando il DOM è pronto
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            initNavbarHandlers();
            handleAccountHash();
        });
    } else {
        initNavbarHandlers();
        handleAccountHash();
    }
    
    // Export per uso globale
    window.NavbarUniversal = {
        init: initNavbarHandlers,
        handleProfileClick: handleProfileClick
    };
    
})();
