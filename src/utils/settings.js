// Settings page utilities e API management
console.log('⚙️ Settings system initialized');

const SettingsManager = {
    // Stato delle connessioni API
    connections: {
        amazon: {
            connected: false,
            marketplace: null,
            sellerId: null,
            lastSync: null
        },
        ebay: {
            connected: false,
            store: null,
            userId: null,
            lastSync: null
        }
    },
    
    // Impostazioni automazione
    automation: {
        autoListing: false,
        autoPricing: false,
        autoInventory: false
    },
    
    // Inizializzazione
    init() {
        console.log('🚀 SettingsManager.init() chiamato');
        try {
            this.loadSettings();
            this.setupEventListeners();
            this.updateUI();
            
            // Avvia controllo periodico token (ogni 30 minuti)
            this.startTokenRefreshCheck();
            
            console.log('✅ Settings initialized successfully');
        } catch (error) {
            console.error('❌ Errore durante init():', error);
            console.error('Stack trace:', error.stack);
        }
    },
    
    // Controllo periodico per refresh token
    startTokenRefreshCheck() {
        // Controlla ogni 30 minuti se il token sta per scadere
        setInterval(() => {
            if (this.connections.ebay.connected && this.connections.ebay.tokenExpiry) {
                const tokenExpiry = new Date(this.connections.ebay.tokenExpiry);
                const now = new Date();
                const minutesUntilExpiry = Math.floor((tokenExpiry - now) / 1000 / 60);
                
                console.log(`⏰ Token check: scade tra ${minutesUntilExpiry} minuti`);
                
                // Se manca meno di 1 ora, rinnova
                if (minutesUntilExpiry < 60 && minutesUntilExpiry > 0 && this.connections.ebay.refreshToken) {
                    console.log('🔄 Token sta per scadere, avvio refresh preventivo');
                    this.refreshEbayToken(this.connections.ebay.refreshToken);
                }
            }
        }, 30 * 60 * 1000); // 30 minuti
        
        console.log('✅ Token refresh check avviato (ogni 30 minuti)');
    },
    
    // Carica impostazioni dal profilo utente (DB-ready)
    loadSettings() {
        console.log('🔍 loadSettings() chiamato');
        const currentUser = AuthManager.getCurrentUser();
        console.log('👤 Current user:', currentUser);
        
        if (currentUser && currentUser.profile) {
            console.log('📋 Profilo utente:', currentUser.profile);
            
            // Carica connessioni Amazon
            this.connections.amazon.connected = currentUser.profile.amazonConnected || false;
            if (currentUser.profile.amazonData) {
                this.connections.amazon = {
                    ...this.connections.amazon,
                    ...currentUser.profile.amazonData
                };
            }
            
            // Carica connessioni eBay
            this.connections.ebay.connected = currentUser.profile.ebayConnected || false;
            console.log('🔌 eBay connected dal profilo:', currentUser.profile.ebayConnected);
            console.log('📦 eBay data dal profilo:', currentUser.profile.ebayData);
            
            if (currentUser.profile.ebayData) {
                // Verifica se il token è ancora valido
                const tokenExpiry = new Date(currentUser.profile.ebayData.tokenExpiry);
                const now = new Date();
                const timeUntilExpiry = tokenExpiry - now;
                const minutesUntilExpiry = Math.floor(timeUntilExpiry / 1000 / 60);
                
                console.log('⏰ Token expiry:', tokenExpiry);
                console.log('⏰ Now:', now);
                console.log('⏰ Minutes until expiry:', minutesUntilExpiry);
                
                if (tokenExpiry > now) {
                    // Token ancora valido
                    this.connections.ebay = {
                        ...this.connections.ebay,
                        ...currentUser.profile.ebayData
                    };
                    console.log('✅ Connessione eBay valida ripristinata:', this.connections.ebay);
                    
                    // Se il token scade tra meno di 30 minuti, fai refresh automatico
                    if (minutesUntilExpiry < 30 && currentUser.profile.ebayData.refreshToken) {
                        console.log('🔄 Token sta per scadere, avvio refresh automatico...');
                        this.refreshEbayToken(currentUser.profile.ebayData.refreshToken);
                    }
                } else {
                    // Token scaduto, prova a fare refresh se disponibile
                    console.log('⚠️ Token eBay scaduto');
                    
                    if (currentUser.profile.ebayData.refreshToken) {
                        console.log('🔄 Tentativo di refresh token automatico...');
                        this.refreshEbayToken(currentUser.profile.ebayData.refreshToken);
                    } else {
                        console.log('❌ Nessun refresh token disponibile, richiede riconnessione');
                        this.connections.ebay.connected = false;
                        this.updateUserProfile({
                            ebayConnected: false,
                            ebayData: null
                        });
                    }
                }
            }
            
            console.log('📥 Impostazioni caricate dal profilo utente');
            console.log('🔌 Stato finale connessioni:', this.connections);
        } else {
            console.log('❌ Nessun utente loggato - impostazioni predefinite');
        }
    },
    
    // Helper per aggiornare il profilo utente (facilitare migrazione futura a API)
    updateUserProfile(updates) {
        const currentUser = AuthManager.getCurrentUser();
        if (currentUser) {
            console.log('💾 Updating user profile with:', updates);
            console.log('👤 Current user ID:', currentUser.id);
            
            // AuthManager.updateUserProfile richiede userId come primo parametro
            const result = AuthManager.updateUserProfile(currentUser.id, updates);
            
            if (result.success) {
                console.log('✅ Profilo salvato con successo in AuthManager');
                // Verifica che sia stato salvato
                const verificaUser = AuthManager.getCurrentUser();
                console.log('🔍 Verifica profilo dopo salvataggio:', verificaUser.profile);
            } else {
                console.error('❌ Errore salvataggio profilo:', result.error);
            }
        } else {
            console.error('❌ Nessun utente corrente trovato!');
        }
    },
    
    // Salva impostazioni
    saveSettings() {
        const settings = {
            connections: this.connections,
            automation: this.automation
        };
        localStorage.setItem('shappa_settings', JSON.stringify(settings));
        console.log('💾 Settings saved');
    },
    
    // Setup event listeners
    setupEventListeners() {
        // Amazon connection (entrambi i bottoni)
        const amazonBtn = document.getElementById('amazonLoginBtn');
        const amazonBtn2 = document.getElementById('amazonLoginBtn2');
        if (amazonBtn) {
            amazonBtn.addEventListener('click', () => this.connectAmazon());
        }
        if (amazonBtn2) {
            amazonBtn2.addEventListener('click', () => this.connectAmazon());
        }
        
        // eBay connection (entrambi i bottoni)
        const ebayBtn = document.getElementById('ebayLoginBtn');
        const ebayBtn2 = document.getElementById('ebayLoginBtn2');
        if (ebayBtn) {
            ebayBtn.addEventListener('click', () => this.connectEbayReal());
        }
        if (ebayBtn2) {
            ebayBtn2.addEventListener('click', () => this.connectEbayReal());
        }
        
        // Disconnect buttons (entrambi)
        document.getElementById('amazonDisconnectBtn')?.addEventListener('click', () => this.disconnectAmazon());
        document.getElementById('amazonDisconnectBtn2')?.addEventListener('click', () => this.disconnectAmazon());
        document.getElementById('ebayDisconnectBtn')?.addEventListener('click', () => this.disconnectEbay());
        document.getElementById('ebayDisconnectBtn2')?.addEventListener('click', () => this.disconnectEbay());
        
        // Automation toggles
        document.getElementById('autoListing')?.addEventListener('change', (e) => {
            this.automation.autoListing = e.target.checked;
            this.saveSettings();
        });
        
        document.getElementById('autoPricing')?.addEventListener('change', (e) => {
            this.automation.autoPricing = e.target.checked;
            this.saveSettings();
        });
        
        document.getElementById('autoInventory')?.addEventListener('change', (e) => {
            this.automation.autoInventory = e.target.checked;
            this.saveSettings();
        });
    },
    
    // Connessione Amazon (simulata)
    connectAmazon() {
        console.log('🔗 Avvio connessione Amazon...');
        
        // Simula processo OAuth
        this.showLoadingState('amazon', true);
        
        setTimeout(() => {
            // Simula successo
            this.connections.amazon = {
                connected: true,
                marketplace: 'Amazon.it',
                sellerId: 'A1234567890',
                lastSync: new Date().toLocaleString('it-IT')
            };
            
            this.saveSettings();
            this.updateUI();
            this.showLoadingState('amazon', false);
            
            console.log('✅ Amazon connesso con successo!');
            this.showNotification('Amazon collegato con successo!', 'success');
        }, 2000);
    },
    
    // Connessione eBay reale
    async connectEbayReal() {
        console.log('🔗 Avvio connessione eBay reale...');
        
        this.showLoadingState('ebay', true);
        
        try {
            // Controlla se EbayOAuth è disponibile
            if (typeof EbayOAuth === 'undefined') {
                throw new Error('Modulo eBay OAuth non caricato');
            }
            
            // Usa il sistema OAuth eBay reale
            await EbayOAuth.connect(
                // Success callback
                (tokenData) => {
                    console.log('✅ eBay OAuth success:', tokenData);
                    
                    const now = new Date();
                    const expiryDate = new Date(now.getTime() + (tokenData.expires_in * 1000));
                    
                    // Estrai dati utente se disponibili
                    let userName = 'eBay User';
                    let userEmail = null;
                    
                    if (tokenData.userInfo) {
                        userName = tokenData.userInfo.fullName || 
                                  tokenData.userInfo.username || 
                                  tokenData.userInfo.userId ||
                                  'eBay User';
                        userEmail = tokenData.userInfo.email;
                    }
                    
                    // Prepara i dati della connessione eBay
                    const ebayConnection = {
                        connected: true,
                        userId: tokenData.userInfo?.userId || tokenData.user_id || 'Unknown',
                        username: userName,
                        email: userEmail,
                        firstName: tokenData.userInfo?.firstName || null,
                        lastName: tokenData.userInfo?.lastName || null,
                        fullName: tokenData.userInfo?.fullName || null,
                        connectedDate: now.toISOString(),
                        tokenExpiry: expiryDate.toISOString(),
                        expiresIn: tokenData.expires_in,
                        lastSync: now.toLocaleString('it-IT'),
                        accessToken: tokenData.access_token,
                        refreshToken: tokenData.refresh_token || null,  // IMPORTANTE: salva refresh token
                        accountType: tokenData.userInfo?.accountType || 'INDIVIDUAL',
                        status: tokenData.userInfo?.status || 'CONFIRMED'
                    };
                    
                    console.log('📦 eBay connection data:', ebayConnection);
                    
                    // Aggiorna stato locale
                    this.connections.ebay = ebayConnection;
                    console.log('✅ Stato locale aggiornato:', this.connections.ebay);
                    
                    // Salva nel profilo utente (DB-ready: in futuro sarà una chiamata API)
                    this.updateUserProfile({
                        ebayConnected: true,
                        ebayData: ebayConnection
                    });
                    console.log('✅ Profilo utente aggiornato');
                    
                    this.saveSettings();
                    console.log('✅ Settings salvati');
                    
                    this.updateUI();
                    console.log('✅ UI aggiornata - chiamato updateUI()');
                    
                    this.showLoadingState('ebay', false);
                    this.showNotification(`✅ eBay collegato con successo! Benvenuto ${userName}`, 'success');
                    
                    console.log('✅ eBay connesso e salvato nel profilo utente!');
                    console.log('🔍 Verifica stato finale:', {
                        connected: this.connections.ebay.connected,
                        username: this.connections.ebay.username,
                        email: this.connections.ebay.email
                    });
                },
                // Error callback
                (error, description) => {
                    console.error('❌ eBay OAuth error:', error, description);
                    this.showLoadingState('ebay', false);
                    
                    // Gestisci errore finestra chiusa
                    if (error === 'popup_closed' || description === 'Authorization window was closed') {
                        this.showNotification('ℹ️ Connessione annullata. Clicca su "Connetti eBay" per riprovare.', 'info');
                    } else {
                        this.showNotification('❌ Errore connessione eBay: ' + (description || error), 'error');
                    }
                }
            );
            
        } catch (error) {
            console.error('❌ Errore connessione eBay:', error);
            this.showLoadingState('ebay', false);
            this.showNotification('Errore: ' + error.message, 'error');
        }
    },
    
    // Refresh eBay Access Token
    async refreshEbayToken(refreshToken) {
        console.log('🔄 Refreshing eBay token...');
        
        try {
            const response = await fetch('/api/ebay/refresh', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    refresh_token: refreshToken
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                console.log('✅ Token refreshed successfully');
                
                // Calcola nuova scadenza
                const now = new Date();
                const expiryDate = new Date(now.getTime() + (data.expires_in * 1000));
                
                // Aggiorna i dati della connessione mantenendo tutto il resto
                const updatedConnection = {
                    ...this.connections.ebay,
                    accessToken: data.access_token,
                    tokenExpiry: expiryDate.toISOString(),
                    expiresIn: data.expires_in,
                    lastSync: now.toLocaleString('it-IT')
                };
                
                // Aggiorna stato locale
                this.connections.ebay = updatedConnection;
                
                // Salva nel profilo
                this.updateUserProfile({
                    ebayConnected: true,
                    ebayData: updatedConnection
                });
                
                console.log('✅ Token aggiornato e salvato');
                this.showNotification('Token eBay rinnovato automaticamente', 'success');
                
                return true;
            } else {
                console.error('❌ Token refresh failed:', data.error);
                throw new Error(data.error);
            }
        } catch (error) {
            console.error('❌ Errore refresh token:', error);
            // Se il refresh fallisce, disconnetti
            this.connections.ebay.connected = false;
            this.updateUserProfile({
                ebayConnected: false,
                ebayData: null
            });
            this.updateUI();
            this.showNotification('Sessione eBay scaduta, effettua nuovamente il login', 'error');
            return false;
        }
    },
    
    // Disconnessione Amazon
    disconnectAmazon() {
        this.connections.amazon = {
            connected: false,
            marketplace: null,
            sellerId: null,
            lastSync: null
        };
        
        this.saveSettings();
        this.updateUI();
        console.log('❌ Amazon disconnesso');
        this.showNotification('Amazon disconnesso', 'info');
    },
    
    // Disconnessione eBay
    disconnectEbay() {
        // Reset stato locale
        this.connections.ebay = {
            connected: false,
            store: null,
            userId: null,
            lastSync: null,
            connectedDate: null,
            tokenExpiry: null,
            accessToken: null
        };
        
        // Aggiorna profilo utente (DB-ready: in futuro sarà una chiamata API)
        this.updateUserProfile({
            ebayConnected: false,
            ebayData: null
        });
        
        this.saveSettings();
        this.updateUI();
        console.log('❌ eBay disconnesso dal profilo utente');
        this.showNotification('eBay disconnesso con successo', 'info');
    },
    
    // Test connessione eBay (simula successo per testing)
    testEbayConnection() {
        console.log('🧪 Testing eBay connection...');
        this.showLoadingState('ebay', true);
        
        setTimeout(() => {
            // Simula connessione di test
            const currentUser = AuthManager.getCurrentUser();
            if (currentUser) {
                const testData = {
                    store: 'Test eBay Store',
                    userId: 'test_user_' + Date.now(),
                    lastSync: new Date().toISOString(),
                    accessToken: 'test_token_' + Date.now()
                };
                
                AuthManager.updateUserProfile({
                    profile: {
                        ...currentUser.profile,
                        ebayConnected: true,
                        ebayData: testData,
                        totalListings: 5,
                        totalSales: 12,
                        totalProfits: 458.67
                    }
                });
                
                this.connections.ebay = {
                    connected: true,
                    ...testData
                };
                
                this.updateUI();
                this.showNotification('✅ Test eBay collegato con dati simulati!', 'success');
                console.log('✅ Test connection successful');
            }
            
            this.showLoadingState('ebay', false);
        }, 1500);
    },
    
    // Aggiorna UI in base allo stato
    updateUI() {
        console.log('🎨 updateUI() chiamato');
        try {
            this.updateAmazonUI();
            this.updateEbayUI();
            this.updateAutomationUI();
            console.log('✅ UI aggiornata con successo');
        } catch (error) {
            console.error('❌ Errore durante updateUI():', error);
            console.error('Stack trace:', error.stack);
        }
    },
    
    // Aggiorna UI Amazon
    updateAmazonUI() {
        const status = document.getElementById('amazonStatus');
        const loginBtn = document.getElementById('amazonLoginBtn');
        const disconnectBtn = document.getElementById('amazonDisconnectBtn');
        const details = document.getElementById('amazonDetails');
        
        // Se gli elementi non esistono, skip (siamo nella tab Account che usa elementi con suffisso "2")
        if (!status) {
            console.log('ℹ️ updateAmazonUI: elementi base non trovati (probabilmente in tab Account)');
            return;
        }
        
        if (this.connections.amazon.connected) {
            status.innerHTML = '<span class="status-badge connected">Connesso</span>';
            loginBtn?.classList.add('hidden');
            disconnectBtn?.classList.remove('hidden');
            details?.classList.remove('hidden');
            
            // Aggiorna dettagli con controllo null
            const marketplaceEl = document.getElementById('amazonMarketplace');
            const sellerIdEl = document.getElementById('amazonSellerId');
            const lastSyncEl = document.getElementById('amazonLastSync');
            
            if (marketplaceEl) marketplaceEl.textContent = this.connections.amazon.marketplace;
            if (sellerIdEl) sellerIdEl.textContent = this.connections.amazon.sellerId;
            if (lastSyncEl) lastSyncEl.textContent = this.connections.amazon.lastSync;
        } else {
            status.innerHTML = '<span class="status-badge disconnected">Non connesso</span>';
            loginBtn?.classList.remove('hidden');
            disconnectBtn?.classList.add('hidden');
            details?.classList.add('hidden');
        }
    },
    
    // Aggiorna UI eBay
    updateEbayUI() {
        console.log('🎨 ════════════════════════════════════════');
        console.log('🎨 updateEbayUI() INIZIATO');
        console.log('🔌 Stato connessione eBay:', this.connections.ebay);
        console.log('✅ Connected?', this.connections.ebay.connected);
        console.log('🎨 ════════════════════════════════════════');
        
        // Elementi della scheda Account (con suffisso "2")
        const status2 = document.getElementById('ebayStatus2');
        const loginBtn2 = document.getElementById('ebayLoginBtn2');
        const actions2 = document.getElementById('ebayActions2');
        const details2 = document.getElementById('ebayDetails2');
        
        console.log('🔍 Elementi trovati:', { 
            status2: !!status2, 
            loginBtn2: !!loginBtn2, 
            actions2: !!actions2, 
            details2: !!details2 
        });
        
        if (!status2 || !loginBtn2 || !actions2 || !details2) {
            console.error('❌ ATTENZIONE: Alcuni elementi HTML non trovati!');
            console.error('Controlla che gli ID esistano nell\'HTML');
        }
        
        // Elementi della vecchia scheda (per retrocompatibilità)
        const status = document.getElementById('ebayStatus');
        const loginBtn = document.getElementById('ebayLoginBtn');
        const disconnectBtn = document.getElementById('ebayDisconnectBtn');
        const details = document.getElementById('ebayDetails');
        
        console.log('🔌 Controllo stato connessione:', this.connections.ebay.connected);
        
        if (this.connections.ebay.connected) {
            console.log('✅ eBay è connesso - mostro dettagli');
            console.log('👤 Username:', this.connections.ebay.username);
            console.log('📧 Email:', this.connections.ebay.email);
            
            // Aggiorna scheda Account (nuova)
            if (status2) {
                status2.innerHTML = '<span class="status-badge connected">Connesso</span>';
                console.log('✅ Status badge aggiornato a CONNESSO');
            }
            if (loginBtn2) {
                loginBtn2.style.display = 'none';
            }
            if (actions2) {
                actions2.style.display = 'none'; // Nascondi il div delle azioni quando connesso
            }
            if (details2) {
                details2.style.display = 'block';
                details2.classList.remove('hidden');
                
                // Formatta e popola i dettagli
                const userIdEl = document.getElementById('ebayUserId2');
                const connectedDateEl = document.getElementById('ebayConnectedDate2');
                const tokenExpiryEl = document.getElementById('ebayTokenExpiry2');
                
                if (userIdEl) {
                    // Mostra nickname (nome cognome) come richiesto
                    const ebayData = this.connections.ebay;
                    let displayName = ebayData.username || ebayData.userId || 'eBay User';
                    if (ebayData.firstName && ebayData.lastName) {
                        displayName = `${ebayData.username || ebayData.userId} (${ebayData.firstName} ${ebayData.lastName})`;
                    } else if (ebayData.fullName) {
                        displayName = `${ebayData.username || ebayData.userId} (${ebayData.fullName})`;
                    }
                    userIdEl.textContent = displayName;
                    // Email sotto
                    if (ebayData.email) {
                        userIdEl.innerHTML = `${displayName}<br><small style='color: var(--text-secondary); font-weight: normal;'>${ebayData.email}</small>`;
                    }
                }
                
                if (connectedDateEl && this.connections.ebay.connectedDate) {
                    const date = new Date(this.connections.ebay.connectedDate);
                    connectedDateEl.textContent = date.toLocaleString('it-IT', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    });
                }
                
                if (tokenExpiryEl && this.connections.ebay.tokenExpiry) {
                    const expiry = new Date(this.connections.ebay.tokenExpiry);
                    const now = new Date();
                    const remainingMs = expiry - now;
                    const remainingMinutes = Math.floor(remainingMs / 1000 / 60);
                    const remainingHours = Math.floor(remainingMinutes / 60);
                    const remainingDays = Math.floor(remainingHours / 24);
                    
                    if (remainingMs < 0) {
                        tokenExpiryEl.innerHTML = '❌ Token scaduto<br><small style="color: var(--text-secondary); font-weight: normal;">Il token verrà rinnovato automaticamente</small>';
                        tokenExpiryEl.style.color = '#ef4444';
                    } else if (remainingDays > 0) {
                        tokenExpiryEl.innerHTML = `✅ Tra ${remainingDays} giorn${remainingDays > 1 ? 'i' : 'o'}<br><small style="color: var(--text-secondary); font-weight: normal;">Rinnovo automatico attivo</small>`;
                        tokenExpiryEl.style.color = '#10b981';
                    } else if (remainingHours > 0) {
                        tokenExpiryEl.innerHTML = `⚠️ Tra ${remainingHours} or${remainingHours > 1 ? 'e' : 'a'}<br><small style="color: var(--text-secondary); font-weight: normal;">Verrà rinnovato automaticamente tra poco</small>`;
                        if (remainingHours < 24) {
                            tokenExpiryEl.style.color = '#f59e0b'; // Warning giallo
                        }
                    } else {
                        tokenExpiryEl.innerHTML = `⏱️ Tra ${remainingMinutes} minut${remainingMinutes > 1 ? 'i' : 'o'}<br><small style="color: var(--text-secondary); font-weight: normal;">Rinnovo automatico in corso...</small>`;
                        tokenExpiryEl.style.color = '#f59e0b';
                    }
                }
            }
            
            // Aggiorna scheda vecchia (per retrocompatibilità)
            if (status) {
                status.innerHTML = '<span class="status-badge connected">Connesso</span>';
            }
            loginBtn?.classList.add('hidden');
            disconnectBtn?.classList.remove('hidden');
            if (details) {
                details.classList.remove('hidden');
                const storeEl = document.getElementById('ebayStore');
                const userIdEl = document.getElementById('ebayUserId');
                const lastSyncEl = document.getElementById('ebayLastSync');
                
                if (storeEl) storeEl.textContent = this.connections.ebay.store || 'N/A';
                if (userIdEl) userIdEl.textContent = this.connections.ebay.userId || 'N/A';
                if (lastSyncEl) lastSyncEl.textContent = this.connections.ebay.lastSync || 'Mai';
            }
        } else {
            console.log('❌ eBay NON connesso - mostro bottoni di connessione');
            // Stato disconnesso - Scheda Account
            if (status2) {
                status2.innerHTML = '<span class="status-badge disconnected">Non connesso</span>';
                console.log('✅ Status badge aggiornato');
            }
            if (loginBtn2) {
                loginBtn2.style.display = 'block';
                console.log('✅ Login button mostrato');
            }
            if (actions2) {
                actions2.style.display = 'flex'; // Mostra il div delle azioni quando disconnesso
                console.log('✅ Actions div mostrato');
            }
            if (details2) {
                details2.style.display = 'none';
                console.log('✅ Details nascosti');
            }
            
            // Stato disconnesso - Scheda vecchia
            if (status) {
                status.innerHTML = '<span class="status-badge disconnected">Non connesso</span>';
            }
            loginBtn?.classList.remove('hidden');
            disconnectBtn?.classList.add('hidden');
            details?.classList.add('hidden');
            
            console.log('✅ UI aggiornata per stato disconnesso');
        }
    },
    
    // Aggiorna UI automazione
    updateAutomationUI() {
        document.getElementById('autoListing').checked = this.automation.autoListing;
        document.getElementById('autoPricing').checked = this.automation.autoPricing;
        document.getElementById('autoInventory').checked = this.automation.autoInventory;
    },
    
    // Mostra stato di caricamento
    showLoadingState(platform, loading) {
        const btn = document.getElementById(`${platform}LoginBtn`);
        if (!btn) return;
        
        if (loading) {
            btn.innerHTML = '🔄 Connettendo...';
            btn.disabled = true;
        } else {
            btn.innerHTML = `🔑 Connetti ${platform === 'amazon' ? 'Amazon' : 'eBay'}`;
            btn.disabled = false;
        }
    },
    
    // Mostra notifica
    showNotification(message, type = 'info') {
        // Crea elemento notifica
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <span>${message}</span>
            <button class="notification-close">×</button>
        `;
        
        // Stili inline per la notifica
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#6b7280'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            z-index: 10000;
            display: flex;
            align-items: center;
            gap: 1rem;
            animation: slideIn 0.3s ease;
        `;
        
        // Aggiungi al DOM
        document.body.appendChild(notification);
        
        // Auto-remove dopo 5 secondi
        setTimeout(() => {
            notification.remove();
        }, 5000);
        
        // Close button
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.remove();
        });
    },
    
    // Esporta impostazioni
    exportSettings() {
        const settings = {
            connections: this.connections,
            automation: this.automation,
            exportDate: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = 'shappa-settings.json';
        a.click();
        
        URL.revokeObjectURL(url);
        console.log('📤 Settings exported');
    }
};

// Aggiungi stili CSS per le notifiche
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    .notification-close {
        background: none;
        border: none;
        color: white;
        font-size: 1.2rem;
        cursor: pointer;
        padding: 0;
        line-height: 1;
    }
`;
document.head.appendChild(style);

// Inizializzazione quando DOM è pronto
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('settings.html')) {
        SettingsManager.init();
    }
});

// Esporta per uso globale
window.SettingsManager = SettingsManager;
