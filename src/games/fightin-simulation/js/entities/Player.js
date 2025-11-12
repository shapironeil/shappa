/**
 * Player - Personaggio controllato dal giocatore
 */

class Player extends Character {
    constructor(stats) {
        super('Player', stats);
        this.keys = {
            forward: false,
            backward: false,
            left: false,
            right: false,
            attack: false,
            defend: false
        };
        
        this.setupControls();
    }
    
    setupControls() {
        // Keyboard controls
        document.addEventListener('keydown', (e) => this.onKeyDown(e));
        document.addEventListener('keyup', (e) => this.onKeyUp(e));
    }
    
    onKeyDown(event) {
        switch(event.code) {
            case 'KeyW': this.keys.forward = true; break;
            case 'KeyS': this.keys.backward = true; break;
            case 'KeyA': this.keys.left = true; break;
            case 'KeyD': this.keys.right = true; break;
            case 'Space': this.keys.attack = true; break;
            case 'ShiftLeft': this.keys.defend = true; break;
        }
    }
    
    onKeyUp(event) {
        switch(event.code) {
            case 'KeyW': this.keys.forward = false; break;
            case 'KeyS': this.keys.backward = false; break;
            case 'KeyA': this.keys.left = false; break;
            case 'KeyD': this.keys.right = false; break;
            case 'Space': this.keys.attack = false; break;
            case 'ShiftLeft': this.keys.defend = false; break;
        }
    }
    
    update(deltaTime) {
        super.update(deltaTime);
        
        // Movement
        const moveSpeed = this.stats.speed * deltaTime;
        if (this.keys.forward) this.position.z -= moveSpeed;
        if (this.keys.backward) this.position.z += moveSpeed;
        if (this.keys.left) this.position.x -= moveSpeed;
        if (this.keys.right) this.position.x += moveSpeed;
        
        // Update mesh position
        if (this.mesh) {
            this.mesh.position.copy(this.position);
        }
        
        // Attack
        if (this.keys.attack && this.stats.stamina >= 10) {
            this.attack();
        }
    }
    
    attack() {
        // TODO: Implement attack logic
        this.useStamina(10);
    }
}

