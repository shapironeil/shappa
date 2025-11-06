/**
 * eBay OAuth Integration - Sandbox Mode
 * Handles OAuth 2.0 flow with popup and postMessage
 */
console.log("eBay OAuth Sandbox system initialized");

const EbayOAuth = {
    apiUrl: (typeof ApiClient !== 'undefined' ? ApiClient.getBaseUrl() : "https://localhost:3000"),
    oauthPopup: null,
    currentTokens: null,

    // Carica token salvati da localStorage
    loadTokens() {
        try {
            const stored = localStorage.getItem('ebay_tokens');
            if (stored) {
                const tokens = JSON.parse(stored);
                // Verifica se il token è ancora valido (con un margine di 5 minuti)
                const now = Date.now();
                const expiryTime = tokens.timestamp + (tokens.expires_in * 1000) - (5 * 60 * 1000);
                if (now < expiryTime) {
                    this.currentTokens = tokens;
                    console.log("Loaded valid eBay tokens from storage");
                    return true;
                } else {
                    console.log("Stored eBay tokens expired, removing");
                    localStorage.removeItem('ebay_tokens');
                }
            }
        } catch (e) {
            console.error("Error loading eBay tokens:", e);
        }
        return false;
    },

    // Salva token in localStorage
    saveTokens(tokens) {
        try {
            const toSave = {
                ...tokens,
                timestamp: Date.now()
            };
            localStorage.setItem('ebay_tokens', JSON.stringify(toSave));
            console.log("eBay tokens saved to storage");
        } catch (e) {
            console.error("Error saving eBay tokens:", e);
        }
    },

    async connect(onSuccess, onError) {
        try {
            console.log("Starting eBay OAuth flow...");
            const data = await (typeof ApiClient !== 'undefined'
                ? ApiClient.getEbayAuthUrl()
                : (await fetch(`${this.apiUrl}/api/ebay/auth-url`)).json());
            
            if (!data.success) {
                throw new Error("Failed to get authorization URL");
            }
            
            console.log("Auth URL obtained");
            
            const width = 600;
            const height = 700;
            const left = window.screenX + (window.outerWidth - width) / 2;
            const top = window.screenY + (window.outerHeight - height) / 2;
            
            this.oauthPopup = window.open(
                data.authUrl,
                "eBay OAuth",
                `width=${width},height=${height},left=${left},top=${top},popup=yes,toolbar=no,menubar=no`
            );
            
            if (!this.oauthPopup) {
                throw new Error("Popup blocked. Please allow popups for this site.");
            }
            
            console.log("OAuth popup opened");
            
            const messageHandler = (event) => {
                // Consenti sia localhost che www.localhost in sviluppo
                const normalizeOrigin = (ori) => {
                    try {
                        const url = new URL(ori);
                        const hostname = url.hostname.replace(/^www\./, '');
                        const protocol = url.protocol;
                        const port = url.port || (protocol === 'https:' ? '443' : '80');
                        return `${protocol}//${hostname}:${port}`;
                    } catch (e) {
                        return ori;
                    }
                };
                const incoming = normalizeOrigin(event.origin);
                const current = normalizeOrigin(window.location.origin);
                const isSame = incoming === current;
                const bothLocalhost = incoming.includes('localhost') && current.includes('localhost');
                if (!isSame && !bothLocalhost) {
                    console.warn("Message from unknown origin:", event.origin, "expected:", window.location.origin);
                    return;
                }
                
                const message = event.data;
                
                if (message.type === "ebay-oauth-result") {
                    console.log("Received OAuth result:", message.success ? "success" : "failed");
                    window.removeEventListener("message", messageHandler);
                    
                    if (message.success) {
                        this.currentTokens = message.tokenData;
                        console.log("eBay connected successfully");
                        console.log("Token expires in:", message.tokenData.expires_in, "seconds");
                        
                        // Recupera informazioni utente
                        this.getUserInfo(message.tokenData.access_token)
                            .then(userInfo => {
                                console.log("✅ User info retrieved:", userInfo);
                                // Aggiungi i dati utente al token
                                const enrichedData = {
                                    ...message.tokenData,
                                    userInfo: userInfo
                                };
                                
                                // Salva i token per persistenza
                                this.saveTokens(enrichedData);
                                
                                if (onSuccess) {
                                    onSuccess(enrichedData);
                                }
                            })
                            .catch(error => {
                                console.warn("⚠️ Could not retrieve user info, using token data only:", error);
                                // Anche se fallisce il recupero info, il token è valido
                                this.saveTokens(message.tokenData);
                                if (onSuccess) {
                                    onSuccess(message.tokenData);
                                }
                            });
                    } else {
                        console.error("OAuth failed:", message.error);
                        
                        if (onError) {
                            onError(message.error, message.errorDescription);
                        }
                    }
                }
            };
            
            window.addEventListener("message", messageHandler);
            
            const popupChecker = setInterval(() => {
                if (this.oauthPopup && this.oauthPopup.closed) {
                    clearInterval(popupChecker);
                    window.removeEventListener("message", messageHandler);
                    
                    if (!this.currentTokens) {
                        console.log("Popup closed without completing OAuth");
                        if (onError) {
                            onError("popup_closed", "Authorization window was closed");
                        }
                    }
                }
            }, 500);
            
        } catch (error) {
            console.error("OAuth error:", error);
            if (onError) {
                onError("oauth_error", error.message);
            }
        }
    },
    
    // Recupera informazioni utente eBay
    async getUserInfo(accessToken) {
        try {
            const data = await (typeof ApiClient !== 'undefined'
                ? ApiClient.getEbayUserInfo(accessToken)
                : (await fetch(`${this.apiUrl}/api/ebay/user-info`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ access_token: accessToken }) })).json());
            
            if (data.success && data.userData) {
                return data.userData;
            } else {
                throw new Error('Failed to retrieve user info');
            }
        } catch (error) {
            console.error('Error fetching user info:', error);
            throw error;
        }
    },

    disconnect() {
        this.currentTokens = null;
        localStorage.removeItem('ebay_tokens');
        console.log("eBay disconnected and tokens removed");
    },

    isConnected() {
        return this.currentTokens !== null;
    },

    getTokens() {
        return this.currentTokens;
    },

    async testConnection() {
        if (!this.currentTokens) {
            throw new Error("Not connected to eBay");
        }

        try {
            console.log("Testing eBay API connection...");
            
            const data = await (typeof ApiClient !== 'undefined'
                ? ApiClient.testEbayConnection({ access_token: this.currentTokens.access_token })
                : (await fetch(`${this.apiUrl}/api/ebay/test-connection`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ access_token: this.currentTokens.access_token }) })).json());
            
            if (data.success) {
                console.log("eBay API test successful");
                console.log("User data:", data.userData);
                return data;
            } else {
                throw new Error(data.error);
            }
        } catch (error) {
            console.error("API test failed:", error);
            throw error;
        }
    },

    async createInventoryItem(sku, itemData) {
        if (!this.currentTokens) {
            throw new Error("Not connected to eBay");
        }

        try {
            const response = await fetch(
                `https://api.sandbox.ebay.com/sell/inventory/v1/inventory_item/${sku}`,
                {
                    method: "PUT",
                    headers: {
                        "Authorization": `Bearer ${this.currentTokens.access_token}`,
                        "Content-Type": "application/json",
                        "Content-Language": "en-US"
                    },
                    body: JSON.stringify(itemData)
                }
            );

            if (response.status === 204) {
                console.log("Inventory item created:", sku);
                return { success: true, sku };
            } else {
                const error = await response.json();
                throw new Error(error.errors?.[0]?.message || "Failed to create item");
            }
        } catch (error) {
            console.error("Failed to create inventory item:", error);
            throw error;
        }
    },

    async createOffer(offerData) {
        if (!this.currentTokens) {
            throw new Error("Not connected to eBay");
        }

        try {
            const response = await fetch(
                "https://api.sandbox.ebay.com/sell/inventory/v1/offer",
                {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${this.currentTokens.access_token}`,
                        "Content-Type": "application/json",
                        "Content-Language": "en-US"
                    },
                    body: JSON.stringify(offerData)
                }
            );

            const data = await response.json();
            
            if (response.ok) {
                console.log("Offer created:", data.offerId);
                return data;
            } else {
                throw new Error(data.errors?.[0]?.message || "Failed to create offer");
            }
        } catch (error) {
            console.error("Failed to create offer:", error);
            throw error;
        }
    },

    async publishOffer(offerId) {
        if (!this.currentTokens) {
            throw new Error("Not connected to eBay");
        }

        try {
            const response = await fetch(
                `https://api.sandbox.ebay.com/sell/inventory/v1/offer/${offerId}/publish`,
                {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${this.currentTokens.access_token}`,
                        "Content-Type": "application/json"
                    }
                }
            );

            const data = await response.json();
            
            if (response.ok) {
                console.log("Listing published:", data.listingId);
                return data;
            } else {
                throw new Error(data.errors?.[0]?.message || "Failed to publish offer");
            }
        } catch (error) {
            console.error("Failed to publish offer:", error);
            throw error;
        }
    }
};

window.EbayOAuth = EbayOAuth;

// Carica token esistenti all'avvio
EbayOAuth.loadTokens();
