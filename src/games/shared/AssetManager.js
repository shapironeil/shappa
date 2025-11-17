/**
 * AssetManager - Sistema centralizzato per gestione modelli 3D
 * Carica e gestisce tutti i modelli GLB per tutti i giochi
 */

class AssetManager {
    constructor() {
        this.assets = new Map();
        this.loader = new THREE.GLTFLoader();
        this.basePath = '/api/models/'; // Path unico per tutti i modelli 3D
        
        // Catalogo asset organizzato per categoria
        this.catalog = {
            environment: {
                warehouse: 'warehouse_fbx_model_free.glb',
                interior: 'interior_free.glb',
                road: 'road_free.glb',
                barricade: 'free_barricade.glb',
                grass: 'grass_free_download.glb',
                rocks: 'free_pack_-_rocks_stylized.glb',
                trees: 'low_poly_tree_scene_free.glb'
            },
            furniture: {
                bookshelf: 'chocolate_beech_bookshelf_free.glb',
                bookshelfOld: 'dusty_old_bookshelf_free.glb',
                sofa: 'old_sofa_free.glb',
                bench: 'bench_model_free.glb',
                tv: 'vintage_tv_free.glb',
                laptop: 'laptop_free.glb'
            },
            collectibles: {
                eyeball: 'blue_eyeball_free.glb',
                hat: 'cowboy_hat_free.glb',
                tools: 'tools_pack._free.glb'
            },
            weapons: {
                beretta: 'beretta_92fs_-_game_ready_-_free.glb',
                pistol: 'pistol_43_tactical__free_lowpoly.glb',
                sword: 'paladin_longsword_free_download.glb'
            },
            characters: {
                male: 'realistic_male_character.glb',
                repo: 'r.e.p.o_realistic_character_free_download.glb',
                deer: 'deer_demo_free_download.glb'
            }
        };
        
        console.log('✅ AssetManager initialized');
    }
    
    /**
     * Carica un singolo asset
     * @param {string} category - Categoria (environment, furniture, etc.)
     * @param {string} name - Nome asset nel catalogo
     * @param {Function} onProgress - Callback progresso (opzionale)
     * @returns {Promise<THREE.Group>} Modello caricato
     */
    async loadAsset(category, name, onProgress = null) {
        const key = `${category}.${name}`;
        
        // Check se già caricato
        if (this.assets.has(key)) {
            console.log(`📦 Asset già in cache: ${key}`);
            return this.assets.get(key).scene.clone();
        }
        
        // Verifica che esista nel catalogo
        if (!this.catalog[category] || !this.catalog[category][name]) {
            throw new Error(`Asset non trovato nel catalogo: ${key}`);
        }
        
        const filename = this.catalog[category][name];
        const path = this.basePath + filename;
        
        console.log(`📥 Caricamento asset: ${key} da ${filename}`);
        
        return new Promise((resolve, reject) => {
            this.loader.load(
                path,
                (gltf) => {
                    // Salva in cache
                    this.assets.set(key, gltf);
                    console.log(`✅ Asset caricato: ${key}`);
                    
                    // Ritorna un clone per permettere istanze multiple
                    resolve(gltf.scene.clone());
                },
                (progress) => {
                    if (onProgress) {
                        const percent = (progress.loaded / progress.total) * 100;
                        onProgress(percent, key);
                    }
                },
                (error) => {
                    console.error(`❌ Errore caricamento asset ${key}:`, error);
                    reject(error);
                }
            );
        });
    }
    
    /**
     * Carica asset multipli in parallelo
     * @param {Array} assetList - Array di {category, name}
     * @param {Function} onProgress - Callback progresso totale
     * @returns {Promise<Map>} Map con tutti i modelli caricati
     */
    async loadMultiple(assetList, onProgress = null) {
        const results = new Map();
        let loaded = 0;
        const total = assetList.length;
        
        const promises = assetList.map(async ({category, name, key}) => {
            const assetKey = key || `${category}.${name}`;
            try {
                const model = await this.loadAsset(category, name);
                results.set(assetKey, model);
                loaded++;
                
                if (onProgress) {
                    onProgress(loaded, total, assetKey);
                }
            } catch (error) {
                console.error(`Failed to load ${assetKey}:`, error);
            }
        });
        
        await Promise.all(promises);
        console.log(`✅ Caricati ${loaded}/${total} asset`);
        
        return results;
    }
    
    /**
     * Ottieni lista asset per categoria
     */
    getAssetsByCategory(category) {
        if (!this.catalog[category]) {
            return [];
        }
        return Object.keys(this.catalog[category]);
    }
    
    /**
     * Ottieni tutte le categorie
     */
    getCategories() {
        return Object.keys(this.catalog);
    }
    
    /**
     * Pre-carica asset essenziali per un gioco
     */
    async preloadForGame(gameType) {
        console.log(`🎮 Pre-caricamento asset per: ${gameType}`);
        
        const preloadLists = {
            'maze-runner': [
                { category: 'collectibles', name: 'eyeball' },
                { category: 'weapons', name: 'sword' },
                { category: 'environment', name: 'rocks' },
                { category: 'environment', name: 'barricade' }
            ],
            'fighting-simulation': [
                { category: 'characters', name: 'male' },
                { category: 'characters', name: 'repo' },
                { category: 'weapons', name: 'sword' },
                { category: 'weapons', name: 'beretta' }
            ],
            'warehouse-explorer': [
                { category: 'environment', name: 'warehouse' },
                { category: 'furniture', name: 'bookshelf' },
                { category: 'furniture', name: 'sofa' },
                { category: 'furniture', name: 'laptop' },
                { category: 'collectibles', name: 'tools' }
            ]
        };
        
        const assetList = preloadLists[gameType] || [];
        return await this.loadMultiple(assetList);
    }
    
    /**
     * Libera memoria degli asset non più usati
     */
    dispose(key = null) {
        if (key) {
            // Dispone asset specifico
            if (this.assets.has(key)) {
                const asset = this.assets.get(key);
                asset.scene.traverse((object) => {
                    if (object.geometry) object.geometry.dispose();
                    if (object.material) {
                        if (Array.isArray(object.material)) {
                            object.material.forEach(m => m.dispose());
                        } else {
                            object.material.dispose();
                        }
                    }
                });
                this.assets.delete(key);
                console.log(`🗑️ Asset disposed: ${key}`);
            }
        } else {
            // Dispone tutti gli asset
            this.assets.forEach((asset, key) => {
                this.dispose(key);
            });
            this.assets.clear();
            console.log('🗑️ Tutti gli asset disposed');
        }
    }
}

