/*
 * ApiClient - Client centralizzato per le chiamate al backend
 * Non modifica la UI, solo logica
 */
(function() {
  'use strict';

  const DEFAULT_DEV_BASE = 'https://www.localhost:3000';

  function resolveBaseUrl() {
    // Permette override via variabile globale
    if (window.SHAPPA_API_BASE) return window.SHAPPA_API_BASE;

    // Se siamo su localhost, usa il dominio senza www (per SSL self-signed)
    const origin = window.location.origin || '';
    if (origin.includes('localhost')) {
      return DEFAULT_DEV_BASE;
    }
    // Fallback: usa origin
    return origin;
  }

  const BASE_URL = resolveBaseUrl();

  async function request(method, path, body, headers = {}) {
    const url = `${BASE_URL}${path}`;
    const opts = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };
    if (body !== undefined && body !== null) {
      opts.body = JSON.stringify(body);
    }

    const res = await fetch(url, opts);
    let data;
    try {
      data = await res.json();
    } catch (e) {
      data = null;
    }

    if (!res.ok || (data && data.success === false)) {
      const msg = (data && (data.error || data.message)) || `HTTP ${res.status}`;
      throw new Error(msg);
    }
    return data;
  }

  const ApiClient = {
    getBaseUrl: () => BASE_URL,

    // eBay endpoints
    async getEbayAuthUrl() {
      return request('GET', '/api/ebay/auth-url');
    },

    async getEbayUserInfo(accessToken) {
      return request('POST', '/api/ebay/user-info', { access_token: accessToken });
    },

    async refreshEbayToken(refreshToken) {
      // Alcuni server accettano "refresh_token" come chiave
      return request('POST', '/api/ebay/refresh-token', { refresh_token: refreshToken });
    },

    async testEbayConnection(payload = {}) {
      return request('POST', '/api/ebay/test-connection', payload);
    }
  };

  window.ApiClient = ApiClient;
})();
