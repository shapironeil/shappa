/**
 * MazeEngine - Motore principale del gioco con Three.js
 */

class MazeEngine {
    constructor(canvas) {
        this.canvas = canvas;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.clock = null;
        
        // Game objects
        this.maze = null;
        this.mazeGenerator = null;
        this.playerController = null;
        this.collisionDetector = null;
        
        // Settings
        this.cellSize = 2;
        this.wallHeight = 4;
        this.mazeWidth = 15;
        this.mazeHeight = 15;
        
        // Collectibles
        this.keys = [];
        this.keysCollected = 0;
        this.totalKeys = 3;
        this.exit = null;
        this.exitOpen = false;
        
        // Game state
        this.isRunning = false;
        this.isPaused = false;
        this.gameStartTime = 0;
        this.gameTime = 0;
        this.gameCompleted = false;
        
        // Callbacks
        this.onKeyCollected = null;
        this.onGameComplete = null;
        this.onTimeUpdate = null;
        
        this.init();
    }
    
    init() {
        // Scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87CEEB); // Sky blue
        this.scene.fog = new THREE.Fog(0x87CEEB, 10, 50);
        
        // Camera
        const aspect = this.canvas.clientWidth / this.canvas.clientHeight;
        this.camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 100);
        this.camera.position.set(0, 1.6, 0);
        
        // Renderer
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true
        });
        this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);
        
        const sunLight = new THREE.DirectionalLight(0xffffff, 0.8);
        sunLight.position.set(10, 20, 10);
        sunLight.castShadow = true;
        sunLight.shadow.camera.left = -30;
        sunLight.shadow.camera.right = 30;
        sunLight.shadow.camera.top = 30;
        sunLight.shadow.camera.bottom = -30;
        sunLight.shadow.mapSize.width = 2048;
        sunLight.shadow.mapSize.height = 2048;
        this.scene.add(sunLight);
        
        // Clock
        this.clock = new THREE.Clock();
        
        // Player controller
        this.playerController = new PlayerController(this.camera, this.canvas);
        this.playerController.onLock = () => {
            if (!this.isRunning && !this.gameCompleted) {
                this.start();
            }
        };
        
        console.log('✅ MazeEngine initialized');
    }
    
    /**
     * Genera e costruisce il labirinto
     */
    buildMaze() {
        // Genera labirinto
        this.mazeGenerator = new MazeGenerator(this.mazeWidth, this.mazeHeight);
        const grid = this.mazeGenerator.generate();
        
        // Crea mesh del labirinto
        this.createMazeMesh(grid);
        
        // Setup collision detector
        this.collisionDetector = new CollisionDetector(grid, this.cellSize);
        
        // Crea pavimento
        this.createFloor();
        
        // Posiziona oggetti collezionabili
        this.placeCollectibles();
        
        // Posiziona giocatore
        const startPos = this.mazeGenerator.getStartPosition(this.exit.position);
        this.playerController.setPosition(
            startPos.x * this.cellSize + this.cellSize / 2,
            1.6,
            startPos.z * this.cellSize + this.cellSize / 2
        );
        
        console.log('✅ Labirinto costruito');
    }
    
    createMazeMesh(grid) {
        const wallMaterial = new THREE.MeshStandardMaterial({
            color: 0x3a3a3a,
            roughness: 0.8,
            metalness: 0.2
        });
        
        const wallGeometry = new THREE.BoxGeometry(this.cellSize, this.wallHeight, 0.1);
        
        for (let y = 0; y < grid.length; y++) {
            for (let x = 0; x < grid[y].length; x++) {
                const cell = grid[y][x];
                const cellX = x * this.cellSize;
                const cellZ = y * this.cellSize;
                
                // North wall
                if (cell.walls[0]) {
                    const wall = new THREE.Mesh(wallGeometry, wallMaterial);
                    wall.position.set(
                        cellX + this.cellSize / 2,
                        this.wallHeight / 2,
                        cellZ
                    );
                    wall.castShadow = true;
                    wall.receiveShadow = true;
                    this.scene.add(wall);
                }
                
                // East wall
                if (cell.walls[1]) {
                    const wall = new THREE.Mesh(wallGeometry, wallMaterial);
                    wall.position.set(
                        cellX + this.cellSize,
                        this.wallHeight / 2,
                        cellZ + this.cellSize / 2
                    );
                    wall.rotation.y = Math.PI / 2;
                    wall.castShadow = true;
                    wall.receiveShadow = true;
                    this.scene.add(wall);
                }
                
                // South wall
                if (cell.walls[2]) {
                    const wall = new THREE.Mesh(wallGeometry, wallMaterial);
                    wall.position.set(
                        cellX + this.cellSize / 2,
                        this.wallHeight / 2,
                        cellZ + this.cellSize
                    );
                    wall.castShadow = true;
                    wall.receiveShadow = true;
                    this.scene.add(wall);
                }
                
                // West wall
                if (cell.walls[3]) {
                    const wall = new THREE.Mesh(wallGeometry, wallMaterial);
                    wall.position.set(
                        cellX,
                        this.wallHeight / 2,
                        cellZ + this.cellSize / 2
                    );
                    wall.rotation.y = Math.PI / 2;
                    wall.castShadow = true;
                    wall.receiveShadow = true;
                    this.scene.add(wall);
                }
            }
        }
    }
    
    createFloor() {
        const floorGeometry = new THREE.PlaneGeometry(
            this.mazeWidth * this.cellSize,
            this.mazeHeight * this.cellSize
        );
        const floorMaterial = new THREE.MeshStandardMaterial({
            color: 0x2a2a2a,
            roughness: 0.9
        });
        
        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.rotation.x = -Math.PI / 2;
        floor.position.set(
            (this.mazeWidth * this.cellSize) / 2,
            0,
            (this.mazeHeight * this.cellSize) / 2
        );
        floor.receiveShadow = true;
        this.scene.add(floor);
    }
    
    placeCollectibles() {
        // Posiziona chiavi
        const positions = this.mazeGenerator.getRandomPositions(this.totalKeys + 1);
        
        // Le prime N posizioni sono per le chiavi
        for (let i = 0; i < this.totalKeys; i++) {
            const pos = positions[i];
            const key = this.createKey(
                pos.x * this.cellSize + this.cellSize / 2,
                pos.y,
                pos.z * this.cellSize + this.cellSize / 2
            );
            this.keys.push(key);
            this.scene.add(key);
        }
        
        // L'ultima posizione è per l'uscita
        const exitPos = positions[this.totalKeys];
        this.exit = this.createExit(
            exitPos.x * this.cellSize + this.cellSize / 2,
            0,
            exitPos.z * this.cellSize + this.cellSize / 2
        );
        this.scene.add(this.exit);
        
        console.log('✅ Oggetti posizionati:', this.totalKeys, 'chiavi + uscita');
    }
    
    createKey(x, y, z) {
        // Chiave come sfera dorata
        const geometry = new THREE.SphereGeometry(0.2, 16, 16);
        const material = new THREE.MeshStandardMaterial({
            color: 0xffd700,
            emissive: 0xffaa00,
            emissiveIntensity: 0.5,
            metalness: 0.8,
            roughness: 0.2
        });
        
        const key = new THREE.Mesh(geometry, material);
        key.position.set(x, y, z);
        key.castShadow = true;
        key.userData.collected = false;
        key.userData.type = 'key';
        
        // Aggiungi punto luce
        const light = new THREE.PointLight(0xffd700, 0.5, 3);
        light.position.set(0, 0, 0);
        key.add(light);
        
        return key;
    }
    
    createExit(x, y, z) {
        // Uscita come portale viola
        const geometry = new THREE.CylinderGeometry(0.8, 0.8, 3, 32);
        const material = new THREE.MeshStandardMaterial({
            color: 0x8b5cf6,
            emissive: 0x6b21a8,
            emissiveIntensity: 0.3,
            transparent: true,
            opacity: 0.6,
            metalness: 0.5,
            roughness: 0.3
        });
        
        const exit = new THREE.Mesh(geometry, material);
        exit.position.set(x, y + 1.5, z);
        exit.userData.type = 'exit';
        
        // Aggiungi punto luce
        const light = new THREE.PointLight(0x8b5cf6, 1, 5);
        light.position.set(0, 0, 0);
        exit.add(light);
        
        return exit;
    }
    
    start() {
        if (this.isRunning || this.gameCompleted) return;
        
        this.isRunning = true;
        this.isPaused = false;
        this.gameStartTime = Date.now();
        this.gameLoop();
        
        console.log('🎮 Gioco iniziato');
    }
    
    pause() {
        this.isPaused = true;
    }
    
    resume() {
        this.isPaused = false;
    }
    
    gameLoop() {
        if (!this.isRunning) return;
        
        requestAnimationFrame(() => this.gameLoop());
        
        if (this.isPaused || this.gameCompleted) return;
        
        const deltaTime = this.clock.getDelta();
        
        // Update timer
        this.gameTime = (Date.now() - this.gameStartTime) / 1000;
        if (this.onTimeUpdate) {
            this.onTimeUpdate(this.gameTime);
        }
        
        // Update player
        this.playerController.update(deltaTime, (pos) => {
            return this.collisionDetector.checkCollision(pos);
        });
        
        // Animate keys
        this.keys.forEach(key => {
            if (!key.userData.collected) {
                key.rotation.y += deltaTime * 2;
                key.position.y = 0.5 + Math.sin(Date.now() * 0.002) * 0.1;
            }
        });
        
        // Animate exit
        if (this.exit) {
            this.exit.rotation.y += deltaTime * 0.5;
            
            // Se tutte le chiavi sono raccolte, fai brillare l'uscita
            if (this.keysCollected >= this.totalKeys && !this.exitOpen) {
                this.exitOpen = true;
                this.exit.material.emissiveIntensity = 0.8;
                this.exit.material.opacity = 1.0;
            }
        }
        
        // Check collectibles
        this.checkCollectibles();
        
        // Render
        this.renderer.render(this.scene, this.camera);
    }
    
    checkCollectibles() {
        const playerPos = this.camera.position;
        
        // Check keys
        this.keys.forEach(key => {
            if (!key.userData.collected) {
                if (this.collisionDetector.isNearObject(playerPos, key.position, 0.5)) {
                    this.collectKey(key);
                }
            }
        });
        
        // Check exit (solo se tutte le chiavi sono raccolte)
        if (this.exitOpen && !this.gameCompleted) {
            if (this.collisionDetector.isNearObject(playerPos, this.exit.position, 1.0)) {
                this.completeGame();
            }
        }
    }
    
    collectKey(key) {
        key.userData.collected = true;
        this.scene.remove(key);
        this.keysCollected++;
        
        console.log('🔑 Chiave raccolta!', this.keysCollected, '/', this.totalKeys);
        
        if (this.onKeyCollected) {
            this.onKeyCollected(this.keysCollected, this.totalKeys);
        }
    }
    
    completeGame() {
        this.gameCompleted = true;
        this.isRunning = false;
        
        console.log('🏆 Gioco completato! Tempo:', this.gameTime.toFixed(2), 's');
        
        if (this.onGameComplete) {
            this.onGameComplete(this.gameTime, this.keysCollected);
        }
    }
    
    handleResize() {
        const width = this.canvas.clientWidth;
        const height = this.canvas.clientHeight;
        
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        
        this.renderer.setSize(width, height);
    }
    
    destroy() {
        this.isRunning = false;
        
        if (this.playerController) {
            this.playerController.dispose();
        }
        
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
        
        console.log('✅ MazeEngine destroyed');
    }
}

