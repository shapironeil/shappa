/**
 * CombatSystem - Sistema di combattimento
 */

class CombatSystem {
    constructor() {
        this.activeCombatants = [];
    }
    
    addCombatant(character) {
        this.activeCombatants.push(character);
    }
    
    removeCombatant(character) {
        const index = this.activeCombatants.indexOf(character);
        if (index > -1) {
            this.activeCombatants.splice(index, 1);
        }
    }
    
    processAttack(attacker, target, attackData) {
        if (!attacker.isAlive() || !target.isAlive()) {
            return { success: false, reason: 'Character is dead' };
        }
        
        // Check range
        const distance = attacker.position.distanceTo(target.position);
        if (distance > attackData.range || distance < attackData.minRange) {
            return { success: false, reason: 'Out of range' };
        }
        
        // Check stamina
        if (attacker.stats.stamina < attackData.staminaCost) {
            return { success: false, reason: 'Not enough stamina' };
        }
        
        // Calculate damage
        const baseDamage = attackData.damage || attacker.stats.attack;
        const actualDamage = target.takeDamage(baseDamage);
        
        // Consume stamina
        attacker.useStamina(attackData.staminaCost);
        
        return {
            success: true,
            damage: actualDamage,
            attacker,
            target
        };
    }
}

