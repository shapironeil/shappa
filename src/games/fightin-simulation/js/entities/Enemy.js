/**
 * Enemy - Nemico controllato da AI
 */

class Enemy extends Character {
    constructor(name, stats) {
        super(name, stats);
        this.target = null;
        this.aiState = 'idle'; // idle, chase, attack, defend
    }
    
    setTarget(target) {
        this.target = target;
    }
    
    update(deltaTime) {
        super.update(deltaTime);
        
        if (!this.target) return;
        
        // Simple AI: chase and attack
        const distance = this.position.distanceTo(this.target.position);
        
        if (distance > 5) {
            this.aiState = 'chase';
            // Move towards target
            const direction = new THREE.Vector3()
                .subVectors(this.target.position, this.position)
                .normalize();
            this.position.add(direction.multiplyScalar(this.stats.speed * deltaTime));
        } else if (distance < 2) {
            this.aiState = 'attack';
            // Attack target
            if (this.stats.stamina >= 10) {
                this.attack();
            }
        } else {
            this.aiState = 'idle';
        }
        
        // Update mesh position
        if (this.mesh) {
            this.mesh.position.copy(this.position);
            this.mesh.lookAt(this.target.position);
        }
    }
    
    attack() {
        // TODO: Implement attack logic
        this.useStamina(10);
    }
}

