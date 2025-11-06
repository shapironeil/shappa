/*
 * Store - Single source of truth sopra AuthManager
 * Emana eventi quando cambia lo stato utente/connessioni.
 */
(function() {
  'use strict';

  // Guardia: assicura che AuthManager sia disponibile
  function ensureAuth() {
    if (typeof AuthManager === 'undefined') {
      throw new Error('AuthManager non caricato');
    }
  }

  function getCurrentUser() {
    ensureAuth();
    return AuthManager.getCurrentUser();
  }

  function saveCurrentUser(user) {
    ensureAuth();
    AuthManager.saveCurrentUser(user);
    EventBus.emit('user:updated', user);
  }

  async function updateUserProfile(updates) {
    ensureAuth();
    const current = AuthManager.getCurrentUser();
    if (!current || !current.id) {
      throw new Error('Utente corrente non trovato per updateUserProfile');
    }
    const result = AuthManager.updateUserProfile(current.id, updates);
    if (result && result.success) {
      const latest = AuthManager.getCurrentUser();
      EventBus.emit('user:updated', latest);
      return latest;
    } else {
      throw new Error(result && result.error ? result.error : 'Update profilo fallito');
    }
  }

  function setConnection(service, data) {
    const connectedKey = `${service}Connected`;
    const dataKey = `${service}Data`;
    return updateUserProfile({ [connectedKey]: !!data, [dataKey]: data });
  }

  function getConnections() {
    const user = getCurrentUser();
    const profile = (user && user.profile) || {};
    return {
      amazon: {
        connected: !!profile.amazonConnected,
        ...(profile.amazonData || {})
      },
      ebay: {
        connected: !!profile.ebayConnected,
        ...(profile.ebayData || {})
      }
    };
  }

  window.Store = {
    getCurrentUser,
    saveCurrentUser,
    updateUserProfile,
    setConnection,
    getConnections
  };
})();
