/**
 * Character - Classe base per tutti i personaggi
 */

class Character {
    constructor(name, stats) {
        this.name = name;
        this.stats = {
            health: stats.health || 100,
            maxHealth: stats.health || 100,
            stamina: stats.stamina || 100,
            maxStamina: stats.stamina || 100,
            attack: stats.attack || 10,
            defense: stats.defense || 5,
            speed: stats.speed || 8
        };
        
        this.mesh = null;
        this.position = new THREE.Vector3(0, 0, 0);
        this.rotation = new THREE.Euler(0, 0, 0);
    }
    
    takeDamage(amount) {
        const actualDamage = Math.max(0, amount - this.stats.defense);
        this.stats.health = Math.max(0, this.stats.health - actualDamage);
        return actualDamage;
    }
    
    useStamina(amount) {
        this.stats.stamina = Math.max(0, this.stats.stamina - amount);
    }
    
    regenerateStamina(amount, deltaTime) {
        this.stats.stamina = Math.min(
            this.stats.maxStamina,
            this.stats.stamina + amount * deltaTime
        );
    }
    
    isAlive() {
        return this.stats.health > 0;
    }
    
    update(deltaTime) {
        // Regenerate stamina
        this.regenerateStamina(10, deltaTime);
    }
}

