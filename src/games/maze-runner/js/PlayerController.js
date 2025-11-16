/**
 * PlayerController - Gestisce movimento FPS con WASD e mouse
 */

class PlayerController {
    constructor(camera, domElement) {
        this.camera = camera;
        this.domElement = domElement;
        
        // Movimento
        this.moveSpeed = 5.0;
        this.velocity = new THREE.Vector3();
        this.direction = new THREE.Vector3();
        
        // Rotazione
        this.euler = new THREE.Euler(0, 0, 0, 'YXZ');
        this.PI_2 = Math.PI / 2;
        this.minPolarAngle = 0;
        this.maxPolarAngle = Math.PI;
        
        // Input state
        this.keys = {
            forward: false,
            backward: false,
            left: false,
            right: false
        };
        
        // Mouse sensitivity
        this.sensitivity = 0.002;
        
        // Pointer lock
        this.isLocked = false;
        
        // Camera height
        this.cameraHeight = 1.6; // Altezza occhi umani
        
        this.setupControls();
        this.setupPointerLock();
    }
    
    setupControls() {
        // Keyboard
        document.addEventListener('keydown', (e) => this.onKeyDown(e));
        document.addEventListener('keyup', (e) => this.onKeyUp(e));
        
        // Mouse movement
        document.addEventListener('mousemove', (e) => this.onMouseMove(e));
    }
    
    setupPointerLock() {
        const hasPointerLock = 'pointerLockElement' in document ||
                              'mozPointerLockElement' in document ||
                              'webkitPointerLockElement' in document;
        
        if (!hasPointerLock) {
            console.warn('⚠️ Pointer Lock API not supported');
            return;
        }
        
        // Request pointer lock on click
        this.domElement.addEventListener('click', () => {
            if (!this.isLocked) {
                this.domElement.requestPointerLock();
            }
        });
        
        // Pointer lock change events
        const lockChange = () => {
            const element = document.pointerLockElement || 
                          document.mozPointerLockElement || 
                          document.webkitPointerLockElement;
            
            this.isLocked = (element === this.domElement);
            
            if (this.isLocked) {
                console.log('🎮 Controls locked');
                if (this.onLock) this.onLock();
            } else {
                console.log('🎮 Controls unlocked');
                if (this.onUnlock) this.onUnlock();
            }
        };
        
        document.addEventListener('pointerlockchange', lockChange);
        document.addEventListener('mozpointerlockchange', lockChange);
        document.addEventListener('webkitpointerlockchange', lockChange);
    }
    
    onKeyDown(event) {
        switch (event.code) {
            case 'KeyW':
            case 'ArrowUp':
                this.keys.forward = true;
                break;
            case 'KeyS':
            case 'ArrowDown':
                this.keys.backward = true;
                break;
            case 'KeyA':
            case 'ArrowLeft':
                this.keys.left = true;
                break;
            case 'KeyD':
            case 'ArrowRight':
                this.keys.right = true;
                break;
        }
    }
    
    onKeyUp(event) {
        switch (event.code) {
            case 'KeyW':
            case 'ArrowUp':
                this.keys.forward = false;
                break;
            case 'KeyS':
            case 'ArrowDown':
                this.keys.backward = false;
                break;
            case 'KeyA':
            case 'ArrowLeft':
                this.keys.left = false;
                break;
            case 'KeyD':
            case 'ArrowRight':
                this.keys.right = false;
                break;
        }
    }
    
    onMouseMove(event) {
        if (!this.isLocked) return;
        
        const movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
        const movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;
        
        this.euler.setFromQuaternion(this.camera.quaternion);
        
        this.euler.y -= movementX * this.sensitivity;
        this.euler.x -= movementY * this.sensitivity;
        
        // Limita pitch (su/giù)
        this.euler.x = Math.max(
            this.PI_2 - this.maxPolarAngle,
            Math.min(this.PI_2 - this.minPolarAngle, this.euler.x)
        );
        
        this.camera.quaternion.setFromEuler(this.euler);
    }
    
    /**
     * Update player movement
     * @param {number} deltaTime - Time since last frame
     * @param {Function} checkCollision - Callback per verificare collisioni
     */
    update(deltaTime, checkCollision) {
        if (!this.isLocked) return;
        
        // Reset velocity
        this.velocity.x = 0;
        this.velocity.z = 0;
        
        // Get direction vectors
        this.direction.z = Number(this.keys.forward) - Number(this.keys.backward);
        this.direction.x = Number(this.keys.right) - Number(this.keys.left);
        this.direction.normalize();
        
        // Calculate movement
        const speed = this.moveSpeed * deltaTime;
        
        if (this.keys.forward || this.keys.backward) {
            this.velocity.z -= this.direction.z * speed;
        }
        
        if (this.keys.left || this.keys.right) {
            this.velocity.x -= this.direction.x * speed;
        }
        
        // Apply movement with collision check
        const newPosition = this.camera.position.clone();
        
        // Move forward/backward
        const forward = new THREE.Vector3();
        this.camera.getWorldDirection(forward);
        forward.y = 0;
        forward.normalize();
        
        newPosition.add(forward.multiplyScalar(-this.velocity.z));
        
        // Check collision for forward/backward
        if (!checkCollision(newPosition)) {
            this.camera.position.copy(newPosition);
        }
        
        // Move left/right
        newPosition.copy(this.camera.position);
        const right = new THREE.Vector3();
        right.crossVectors(this.camera.up, forward).normalize();
        
        newPosition.add(right.multiplyScalar(-this.velocity.x));
        
        // Check collision for left/right
        if (!checkCollision(newPosition)) {
            this.camera.position.copy(newPosition);
        }
        
        // Keep camera at fixed height
        this.camera.position.y = this.cameraHeight;
    }
    
    setPosition(x, y, z) {
        this.camera.position.set(x, y || this.cameraHeight, z);
    }
    
    dispose() {
        document.removeEventListener('keydown', this.onKeyDown);
        document.removeEventListener('keyup', this.onKeyUp);
        document.removeEventListener('mousemove', this.onMouseMove);
    }
}

