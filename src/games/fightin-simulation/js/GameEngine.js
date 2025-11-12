/**
 * GameEngine - Motore principale del gioco 3D
 * Gestisce Three.js scene, camera, renderer, e game loop
 */

class GameEngine {
    constructor(canvas) {
        this.canvas = canvas;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.clock = null;
        this.isRunning = false;
        this.animationId = null;
        
        this.init();
    }
    
    init() {
        // Scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x0a0a0a);
        this.scene.fog = new THREE.Fog(0x0a0a0a, 10, 50);
        
        // Camera
        const aspect = this.canvas.clientWidth / this.canvas.clientHeight;
        this.camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
        this.camera.position.set(0, 5, 10);
        this.camera.lookAt(0, 0, 0);
        
        // Renderer
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true,
            powerPreference: 'high-performance'
        });
        this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
        // Lighting
        const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
        this.scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 10, 5);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        this.scene.add(directionalLight);
        
        // Clock for delta time
        this.clock = new THREE.Clock();
        
        // Controls for 3D viewer
        this.controls = {
            rotationX: 0,
            rotationY: 0,
            isDragging: false,
            lastMouseX: 0,
            lastMouseY: 0
        };
        
        this.setupControls();
        
        console.log('✅ GameEngine initialized');
    }
    
    setupControls() {
        this.canvas.addEventListener('mousedown', (e) => {
            this.controls.isDragging = true;
            this.controls.lastMouseX = e.clientX;
            this.controls.lastMouseY = e.clientY;
        });
        
        this.canvas.addEventListener('mousemove', (e) => {
            if (this.controls.isDragging) {
                const deltaX = e.clientX - this.controls.lastMouseX;
                const deltaY = e.clientY - this.controls.lastMouseY;
                
                this.controls.rotationY += deltaX * 0.01;
                this.controls.rotationX += deltaY * 0.01;
                
                this.controls.lastMouseX = e.clientX;
                this.controls.lastMouseY = e.clientY;
            }
        });
        
        this.canvas.addEventListener('mouseup', () => {
            this.controls.isDragging = false;
        });
        
        this.canvas.addEventListener('wheel', (e) => {
            e.preventDefault();
            const delta = e.deltaY * 0.01;
            this.camera.position.z = Math.max(5, Math.min(20, this.camera.position.z + delta));
        });
    }
    
    loadEnemyModel(enemy) {
        // Clear previous model
        while(this.scene.children.length > 2) { // Keep lights
            this.scene.remove(this.scene.children[2]);
        }
        
        // Create placeholder model (box with enemy icon)
        const geometry = new THREE.BoxGeometry(1, 2, 1);
        const material = new THREE.MeshStandardMaterial({ 
            color: enemy.gender === 'male' ? 0x3b82f6 : 0xec4899,
            metalness: 0.3,
            roughness: 0.7
        });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(0, 1, 0);
        mesh.castShadow = true;
        this.scene.add(mesh);
        
        // Add weapon indicator
        if (enemy.weaponIcon) {
            const weaponGeometry = new THREE.SphereGeometry(0.2, 8, 8);
            const weaponMaterial = new THREE.MeshStandardMaterial({ color: 0xffd700 });
            const weaponMesh = new THREE.Mesh(weaponGeometry, weaponMaterial);
            weaponMesh.position.set(0.8, 1.5, 0);
            this.scene.add(weaponMesh);
        }
        
        // Start render loop
        if (!this.isRunning) {
            this.start();
        }
    }
    
    start() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.gameLoop();
    }
    
    stop() {
        this.isRunning = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }
    
    gameLoop() {
        if (!this.isRunning) return;
        
        const deltaTime = this.clock.getDelta();
        
        // Rotate camera around model if dragging
        if (this.controls.isDragging || this.controls.rotationY !== 0 || this.controls.rotationX !== 0) {
            const radius = this.camera.position.z;
            this.camera.position.x = Math.sin(this.controls.rotationY) * radius;
            this.camera.position.z = Math.cos(this.controls.rotationY) * radius;
            this.camera.position.y = 5 + this.controls.rotationX * 2;
            this.camera.lookAt(0, 1, 0);
        }
        
        // Update game logic (to be implemented by game modes)
        if (this.onUpdate) {
            this.onUpdate(deltaTime);
        }
        
        // Render
        this.renderer.render(this.scene, this.camera);
        
        this.animationId = requestAnimationFrame(() => this.gameLoop());
    }
    
    handleResize() {
        const width = this.canvas.clientWidth;
        const height = this.canvas.clientHeight;
        
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        
        this.renderer.setSize(width, height);
    }
    
    destroy() {
        this.stop();
        
        // Cleanup Three.js resources
        if (this.scene) {
            this.scene.traverse((object) => {
                if (object.geometry) object.geometry.dispose();
                if (object.material) {
                    if (Array.isArray(object.material)) {
                        object.material.forEach(m => m.dispose());
                    } else {
                        object.material.dispose();
                    }
                }
            });
        }
        
        if (this.renderer) {
            this.renderer.dispose();
        }
        
        console.log('✅ GameEngine destroyed');
    }
}

