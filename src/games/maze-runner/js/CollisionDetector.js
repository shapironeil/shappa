/**
 * CollisionDetector - Gestisce collisioni con muri del labirinto
 */

class CollisionDetector {
    constructor(mazeGrid, cellSize) {
        this.mazeGrid = mazeGrid;
        this.cellSize = cellSize;
        this.collisionRadius = 0.3; // Raggio del giocatore per collisioni
    }
    
    /**
     * Controlla se la posizione è valida (no collisioni con muri)
     * @param {THREE.Vector3} position - Posizione da controllare
     * @returns {boolean} true se c'è collisione, false altrimenti
     */
    checkCollision(position) {
        // Converti coordinate world in coordinate griglia
        const gridX = Math.floor(position.x / this.cellSize);
        const gridZ = Math.floor(position.z / this.cellSize);
        
        // Fuori dai limiti del labirinto
        if (!this.isValidGridPosition(gridX, gridZ)) {
            return true;
        }
        
        // Controlla collisione con i muri della cella corrente
        const cell = this.mazeGrid[gridZ][gridX];
        
        // Posizione relativa nella cella (0-1)
        const relX = (position.x % this.cellSize) / this.cellSize;
        const relZ = (position.z % this.cellSize) / this.cellSize;
        
        // Controlla ogni muro
        const margin = this.collisionRadius / this.cellSize;
        
        // North wall
        if (cell.walls[0] && relZ < margin) {
            return true;
        }
        
        // East wall
        if (cell.walls[1] && relX > (1 - margin)) {
            return true;
        }
        
        // South wall
        if (cell.walls[2] && relZ > (1 - margin)) {
            return true;
        }
        
        // West wall
        if (cell.walls[3] && relX < margin) {
            return true;
        }
        
        return false;
    }
    
    /**
     * Trova la posizione valida più vicina
     */
    getValidPosition(position) {
        if (!this.checkCollision(position)) {
            return position;
        }
        
        // Prova a muovere leggermente in direzioni diverse
        const offsets = [
            { x: 0.1, z: 0 },
            { x: -0.1, z: 0 },
            { x: 0, z: 0.1 },
            { x: 0, z: -0.1 }
        ];
        
        for (const offset of offsets) {
            const testPos = position.clone().add(new THREE.Vector3(offset.x, 0, offset.z));
            if (!this.checkCollision(testPos)) {
                return testPos;
            }
        }
        
        return position;
    }
    
    isValidGridPosition(x, z) {
        return x >= 0 && x < this.mazeGrid[0].length && 
               z >= 0 && z < this.mazeGrid.length;
    }
    
    /**
     * Controlla se il giocatore è vicino a un oggetto collezionabile
     * @param {THREE.Vector3} playerPos - Posizione giocatore
     * @param {THREE.Vector3} objectPos - Posizione oggetto
     * @param {number} radius - Raggio di raccolta
     */
    isNearObject(playerPos, objectPos, radius = 0.5) {
        const dx = playerPos.x - objectPos.x;
        const dz = playerPos.z - objectPos.z;
        const distance = Math.sqrt(dx * dx + dz * dz);
        return distance < radius;
    }
}

