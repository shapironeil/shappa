/**
 * Loader - Utility per caricare modelli 3D e assets
 */

class Loader {
    constructor() {
        this.gltfLoader = null;
        this.textureLoader = null;
        this.cache = new Map();
        
        if (typeof THREE !== 'undefined') {
            // Initialize loaders when Three.js is available
            if (THREE.GLTFLoader) {
                this.gltfLoader = new THREE.GLTFLoader();
            }
            this.textureLoader = new THREE.TextureLoader();
        }
    }
    
    async loadModel(path) {
        if (this.cache.has(path)) {
            return this.cache.get(path);
        }
        
        return new Promise((resolve, reject) => {
            if (!this.gltfLoader) {
                reject(new Error('GLTFLoader not available'));
                return;
            }
            
            this.gltfLoader.load(
                path,
                (gltf) => {
                    this.cache.set(path, gltf);
                    resolve(gltf);
                },
                undefined,
                (error) => {
                    console.error('Error loading model:', path, error);
                    reject(error);
                }
            );
        });
    }
    
    async loadTexture(path) {
        if (this.cache.has(path)) {
            return this.cache.get(path);
        }
        
        return new Promise((resolve, reject) => {
            this.textureLoader.load(
                path,
                (texture) => {
                    this.cache.set(path, texture);
                    resolve(texture);
                },
                undefined,
                (error) => {
                    console.error('Error loading texture:', path, error);
                    reject(error);
                }
            );
        });
    }
}

