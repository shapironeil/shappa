# 🧩 Maze Runner

Un gioco labirinto 3D in prima persona dove raccogli chiavi per sbloccare l'uscita.

## 🎮 Gameplay

**Obiettivo:** Raccogli tutte le chiavi dorate e trova il portale viola per uscire dal labirinto!

### Controlli
- **WASD** o **Frecce** - Movimento
- **Mouse** - Guarda attorno
- **Click** - Inizia il gioco (attiva Pointer Lock)
- **ESC** - Rilascia mouse

### Meccaniche
- **Chiavi:** Raccogli 3 chiavi dorate sparse nel labirinto
- **Uscita:** Il portale viola si attiverà solo quando hai tutte le chiavi
- **Timer:** Il tuo tempo viene registrato automaticamente
- **Collisioni:** Non puoi attraversare i muri!

## 🏆 Features

### ✅ MVP Completate
- ✅ Generazione procedurale labirinto (Recursive Backtracking)
- ✅ Movimento FPS fluido con collisioni
- ✅ 3 chiavi collezionabili
- ✅ Portale d'uscita
- ✅ Timer e statistiche
- ✅ Salvataggio best time su server
- ✅ Integrazione con Gaming Hub
- ✅ Victory screen con statistiche
- ✅ UI overlay pulita e minimale

### 🎨 Design
- **Stile:** Minimale e performante
- **Muri:** Grigio scuro solido
- **Chiavi:** Sfere dorate luminose con rotazione
- **Uscita:** Portale viola luminoso
- **Cielo:** Gradiente azzurro
- **Illuminazione:** Luci dinamiche per oggetti

## 🗂️ Struttura File

```
maze-runner/
├── index.html              # Pagina principale
├── js/
│   ├── MazeGenerator.js    # Generazione labirinto procedurale
│   ├── MazeEngine.js       # Motore Three.js principale
│   ├── PlayerController.js # Controlli FPS (WASD + mouse)
│   ├── CollisionDetector.js # Sistema collisioni
│   ├── SaveManager.js      # Salvataggio MongoDB
│   └── main.js             # Entry point e game loop
├── styles/
│   └── game.css            # Stili UI overlay
└── README.md               # Questo file
```

## 🔧 Tecnologie

- **Three.js r150** - Rendering 3D
- **Pointer Lock API** - Controlli FPS
- **Vanilla JavaScript** - Nessuna dipendenza aggiuntiva
- **Node.js + Express** - Backend API
- **File system** - Storage progressi (JSON)

## 📊 API Endpoints

### Progressi Giocatore
```javascript
// Carica progressi
GET /api/maze/progress/:userId

// Salva completamento
POST /api/maze/complete/:userId
{
  "level": 1,
  "time": 125.5,
  "keysCollected": 3,
  "completedAt": "2025-11-16T..."
}
```

### Leaderboard
```javascript
// Ottieni top 10
GET /api/maze/leaderboard/1?limit=10
```

### Statistiche
```javascript
// Aggiorna stats
POST /api/maze/stats/:userId
```

## 💾 Dati Salvati

**Progressi Utente** (`data/gaming/maze/{userId}_progress.json`):
```json
{
  "userId": "username",
  "bestTime": 125.5,
  "completedLevels": [1],
  "totalCompletions": 5,
  "totalTime": 650.2,
  "lastPlayed": "2025-11-16T...",
  "updatedAt": "2025-11-16T..."
}
```

**Leaderboard** (`data/gaming/maze/leaderboard_level1.json`):
```json
[
  {
    "userId": "username",
    "time": 125.5,
    "keysCollected": 3,
    "completedAt": "2025-11-16T..."
  }
]
```

## 🚀 Come Giocare

1. Accedi al **Gaming Hub** (`gaming-hub-dashboard.html`)
2. Clicca sulla card **Maze Runner** 🧩
3. Clicca sullo schermo per attivare i controlli
4. Usa **WASD** per muoverti e **mouse** per guardare
5. Raccogli le **3 chiavi dorate** 🔑
6. Trova il **portale viola** per vincere!
7. Cerca di battere il tuo record! ⏱️

## 🎯 Strategie

- **Esplora sistematicamente:** Visita ogni corridoio per non perderti chiavi
- **Usa il cielo:** Guarda in alto per orientarti nel labirinto
- **Velocità:** Più veloce completi, più esperienza guadagni!
- **Ricorda il percorso:** Una volta raccolte le chiavi, torna al portale

## 🔮 Future Features (Possibili Espansioni)

- [ ] **Minimap** con fog of war
- [ ] **Livelli multipli** con difficoltà crescente
- [ ] **Power-ups** (velocità, visione estesa)
- [ ] **Nemici/Ostacoli** che pattugliano il labirinto
- [ ] **Tema selezionabile** (cyberpunk, fantasy, horror)
- [ ] **Modalità multiplayer** competitiva
- [ ] **Daily challenges** con labirinti speciali
- [ ] **Achievements** (velocista, esploratore, etc.)
- [ ] **Audio** (musica ambientale, effetti sonori)
- [ ] **Mobile support** (touch controls)

## 🐛 Troubleshooting

**Il mouse non si muove:**
- Assicurati di aver cliccato sullo schermo
- Premi ESC per rilasciare e riclicca

**Il gioco è lento:**
- Riduci la dimensione della finestra
- Chiudi altre tab del browser
- Il labirinto è 15x15, ottimizzato per performance

**Progressi non salvati:**
- Verifica di essere loggato (non guest)
- Controlla che il server sia attivo
- Modalità guest non salva progressi

## 📝 Note Tecniche

### Algoritmo Generazione Labirinto
- **Recursive Backtracking:** Garantisce un labirinto perfetto (un solo percorso tra due punti)
- **Dimensioni:** 15x15 celle (ottimale per gameplay)
- **Celle:** Ogni cella ha 4 muri (N, E, S, W)

### Sistema Collisioni
- **Raycasting:** Verifica collisioni con i muri
- **Raggio giocatore:** 0.3 unità
- **Cell size:** 2 unità

### Performance
- **FPS Target:** 60 FPS
- **Oggetti 3D:** ~450 muri + 3 chiavi + 1 uscita
- **Draw calls:** Ottimizzati con geometrie statiche
- **Shadow mapping:** Soft shadows per realismo

## 👨‍💻 Sviluppo

Per modificare il gioco:

1. **Dimensione labirinto:** Cambia `mazeWidth` e `mazeHeight` in `MazeEngine.js`
2. **Numero chiavi:** Cambia `totalKeys` in `MazeEngine.js`
3. **Velocità:** Cambia `moveSpeed` in `PlayerController.js`
4. **Colori:** Modifica i materiali in `MazeEngine.js`

## 📄 Licenza

Parte del progetto **LifeManager** - GameHub

---

**Buon divertimento! 🎮**

