/**
 * MazeGenerator - Genera labirinti procedurali usando Recursive Backtracking
 */

class MazeGenerator {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.grid = [];
        this.stack = [];
        
        // Direzioni: North, East, South, West
        this.directions = [
            { dx: 0, dy: -1, opposite: 2 }, // North
            { dx: 1, dy: 0, opposite: 3 },  // East
            { dx: 0, dy: 1, opposite: 0 },  // South
            { dx: -1, dy: 0, opposite: 1 }  // West
        ];
        
        this.initialize();
    }
    
    initialize() {
        // Inizializza griglia con tutte le celle "murate"
        for (let y = 0; y < this.height; y++) {
            this.grid[y] = [];
            for (let x = 0; x < this.width; x++) {
                this.grid[y][x] = {
                    x: x,
                    y: y,
                    walls: [true, true, true, true], // [N, E, S, W]
                    visited: false
                };
            }
        }
    }
    
    /**
     * Genera il labirinto usando algoritmo Recursive Backtracking
     */
    generate() {
        // Inizia da posizione casuale
        const startX = Math.floor(Math.random() * this.width);
        const startY = Math.floor(Math.random() * this.height);
        
        const startCell = this.grid[startY][startX];
        startCell.visited = true;
        this.stack.push(startCell);
        
        while (this.stack.length > 0) {
            const current = this.stack[this.stack.length - 1];
            const neighbors = this.getUnvisitedNeighbors(current);
            
            if (neighbors.length > 0) {
                // Scegli un vicino casuale
                const next = neighbors[Math.floor(Math.random() * neighbors.length)];
                
                // Rimuovi muro tra current e next
                this.removeWall(current, next);
                
                // Marca come visitato e aggiungi allo stack
                next.visited = true;
                this.stack.push(next);
            } else {
                // Backtrack
                this.stack.pop();
            }
        }
        
        console.log('✅ Labirinto generato:', this.width, 'x', this.height);
        return this.grid;
    }
    
    getUnvisitedNeighbors(cell) {
        const neighbors = [];
        
        for (let i = 0; i < this.directions.length; i++) {
            const dir = this.directions[i];
            const nx = cell.x + dir.dx;
            const ny = cell.y + dir.dy;
            
            if (this.isValidCell(nx, ny) && !this.grid[ny][nx].visited) {
                neighbors.push({ cell: this.grid[ny][nx], direction: i });
            }
        }
        
        return neighbors;
    }
    
    removeWall(current, next) {
        const dx = next.cell.x - current.x;
        const dy = next.cell.y - current.y;
        
        if (dx === 1) {
            // Moving East
            current.walls[1] = false;
            next.cell.walls[3] = false;
        } else if (dx === -1) {
            // Moving West
            current.walls[3] = false;
            next.cell.walls[1] = false;
        } else if (dy === 1) {
            // Moving South
            current.walls[2] = false;
            next.cell.walls[0] = false;
        } else if (dy === -1) {
            // Moving North
            current.walls[0] = false;
            next.cell.walls[2] = false;
        }
    }
    
    isValidCell(x, y) {
        return x >= 0 && x < this.width && y >= 0 && y < this.height;
    }
    
    /**
     * Trova posizioni casuali per oggetti (chiavi, uscita)
     * @param {number} count - Numero di posizioni da trovare
     * @returns {Array} Array di posizioni {x, y, z}
     */
    getRandomPositions(count) {
        const positions = [];
        const cells = [];
        
        // Raccogli tutte le celle
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                cells.push({ x, y });
            }
        }
        
        // Mescola e prendi 'count' celle
        for (let i = cells.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [cells[i], cells[j]] = [cells[j], cells[i]];
        }
        
        for (let i = 0; i < Math.min(count, cells.length); i++) {
            const cell = cells[i];
            positions.push({
                x: cell.x,
                y: 0.5, // Altezza per oggetti a terra
                z: cell.y
            });
        }
        
        return positions;
    }
    
    /**
     * Trova la posizione di start più lontana dall'uscita
     */
    getStartPosition(exitPos) {
        let maxDist = 0;
        let startPos = { x: 0, z: 0 };
        
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const dist = Math.sqrt(
                    Math.pow(x - exitPos.x, 2) + Math.pow(y - exitPos.z, 2)
                );
                if (dist > maxDist) {
                    maxDist = dist;
                    startPos = { x, z: y };
                }
            }
        }
        
        return startPos;
    }
}

