/**
 * InteractionSystem - Sistema per interagire con oggetti 3D nel gioco
 * Gestisce raccolta, uso, inventario
 */

class InteractionSystem {
    constructor(camera, scene) {
        this.camera = camera;
        this.scene = scene;
        this.raycaster = new THREE.Raycaster();
        this.interactableObjects = new Map(); // Map<mesh, data>
        this.inventory = [];
        this.maxInventorySize = 10;
        this.interactionDistance = 3.0; // metri
        
        // UI callbacks
        this.onItemCollected = null;
        this.onItemUsed = null;
        this.onInteractionAvailable = null;
        
        this.setupControls();
        
        console.log('✅ InteractionSystem initialized');
    }
    
    setupControls() {
        // E key per interagire
        document.addEventListener('keydown', (e) => {
            if (e.code === 'KeyE') {
                this.interact();
            }
        });
    }
    
    /**
     * Registra un oggetto come interattivo
     * @param {THREE.Object3D} mesh - Il mesh dell'oggetto
     * @param {Object} data - Dati dell'oggetto
     */
    registerInteractable(mesh, data) {
        const itemData = {
            type: data.type || 'generic', // collectible, usable, trigger
            name: data.name || 'Item',
            description: data.description || '',
            canCollect: data.canCollect !== false,
            onInteract: data.onInteract || null,
            metadata: data.metadata || {}
        };
        
        this.interactableObjects.set(mesh, itemData);
        
        // Aggiungi userData per il raycast
        mesh.userData.interactable = true;
        
        console.log(`📍 Registered interactable: ${itemData.name}`);
    }
    
    /**
     * Rimuovi oggetto dagli interattivi
     */
    unregisterInteractable(mesh) {
        this.interactableObjects.delete(mesh);
        if (mesh.userData) {
            mesh.userData.interactable = false;
        }
    }
    
    /**
     * Update del sistema (chiamato ogni frame)
     */
    update() {
        // Raycast dal centro dello schermo per trovare oggetti interattivi
        this.raycaster.setFromCamera(new THREE.Vector2(0, 0), this.camera);
        
        // Trova oggetti interattivi nel raggio d'azione
        const interactables = Array.from(this.interactableObjects.keys());
        const intersects = this.raycaster.intersectObjects(interactables, true);
        
        if (intersects.length > 0) {
            const nearest = intersects[0];
            const distance = nearest.distance;
            
            if (distance <= this.interactionDistance) {
                // Trova il mesh root interattivo
                let interactableMesh = nearest.object;
                while (interactableMesh && !this.interactableObjects.has(interactableMesh)) {
                    interactableMesh = interactableMesh.parent;
                }
                
                if (interactableMesh) {
                    const data = this.interactableObjects.get(interactableMesh);
                    
                    // Notifica UI che c'è un oggetto interattivo
                    if (this.onInteractionAvailable) {
                        this.onInteractionAvailable(data, distance);
                    }
                    
                    return { mesh: interactableMesh, data, distance };
                }
            }
        }
        
        // Nessun oggetto nel range
        if (this.onInteractionAvailable) {
            this.onInteractionAvailable(null);
        }
        
        return null;
    }
    
    /**
     * Interagisci con l'oggetto più vicino
     */
    interact() {
        const target = this.update();
        
        if (!target) {
            console.log('⚠️ Nessun oggetto interattivo nel range');
            return false;
        }
        
        const { mesh, data } = target;
        
        // Esegui callback custom se presente
        if (data.onInteract) {
            data.onInteract(data, this);
        }
        
        // Raccogli se collezionabile
        if (data.canCollect && data.type === 'collectible') {
            return this.collectItem(mesh, data);
        }
        
        // Usa se usabile
        if (data.type === 'usable') {
            return this.useItem(data);
        }
        
        return false;
    }
    
    /**
     * Raccogli un oggetto
     */
    collectItem(mesh, data) {
        // Check inventario pieno
        if (this.inventory.length >= this.maxInventorySize) {
            console.log('⚠️ Inventario pieno!');
            return false;
        }
        
        // Aggiungi all'inventario
        this.inventory.push({
            name: data.name,
            type: data.type,
            description: data.description,
            metadata: data.metadata,
            collectedAt: Date.now()
        });
        
        // Rimuovi dalla scena
        this.scene.remove(mesh);
        this.unregisterInteractable(mesh);
        
        console.log(`✅ Raccolto: ${data.name}`);
        
        // Notifica UI
        if (this.onItemCollected) {
            this.onItemCollected(data, this.inventory.length);
        }
        
        return true;
    }
    
    /**
     * Usa un oggetto dall'inventario
     */
    useItem(itemData) {
        console.log(`🔧 Usando: ${itemData.name}`);
        
        if (this.onItemUsed) {
            this.onItemUsed(itemData);
        }
        
        return true;
    }
    
    /**
     * Ottieni inventario
     */
    getInventory() {
        return [...this.inventory];
    }
    
    /**
     * Conta oggetti di un tipo specifico
     */
    countItemsByType(type) {
        return this.inventory.filter(item => item.type === type).length;
    }
    
    /**
     * Check se un oggetto specifico è nell'inventario
     */
    hasItem(name) {
        return this.inventory.some(item => item.name === name);
    }
    
    /**
     * Rimuovi oggetto dall'inventario
     */
    removeItem(name) {
        const index = this.inventory.findIndex(item => item.name === name);
        if (index !== -1) {
            this.inventory.splice(index, 1);
            return true;
        }
        return false;
    }
    
    /**
     * Pulisci tutto
     */
    dispose() {
        this.interactableObjects.clear();
        this.inventory = [];
    }
}

