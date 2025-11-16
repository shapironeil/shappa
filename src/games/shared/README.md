# 🎮 Shared Game Systems

Sistema modulare per gestire asset 3D e interazioni nei giochi.

## 📦 Moduli Disponibili

### 1. **AssetManager.js**
Gestisce caricamento e caching di modelli 3D GLB.

**Features:**
- ✅ Caricamento asincrono con progress tracking
- ✅ Caching automatico per performance
- ✅ Catalogo organizzato per categorie
- ✅ Preload per giochi specifici
- ✅ Gestione memoria con dispose

**Categorie Asset:**
- `environment` - Ambienti e scenografie
- `furniture` - Arredamento e props
- `collectibles` - Oggetti raccoglibili
- `weapons` - Armi ed equipaggiamento
- `characters` - Personaggi e NPC

**Uso:**
```javascript
const assetManager = new AssetManager();

// Carica singolo asset
const eyeball = await assetManager.loadAsset('collectibles', 'eyeball');
scene.add(eyeball);

// Carica multipli
const assets = await assetManager.loadMultiple([
    { category: 'weapons', name: 'sword' },
    { category: 'collectibles', name: 'hat' }
]);

// Preload per gioco specifico
await assetManager.preloadForGame('maze-runner');
```

---

### 2. **InteractionSystem.js**
Gestisce interazioni con oggetti 3D (raccolta, uso, inventario).

**Features:**
- ✅ Raycast per detection oggetti
- ✅ Sistema inventario
- ✅ Registrazione oggetti interattivi
- ✅ Callbacks UI per feedback
- ✅ Distanza interazione configurabile

**Tipi Interazione:**
- `collectible` - Oggetti raccoglibili (es: chiavi, monete)
- `usable` - Oggetti usabili (es: porte, leve)
- `trigger` - Trigger eventi (es: checkpoint)

**Uso:**
```javascript
const interactionSystem = new InteractionSystem(camera, scene);

// Registra oggetto interattivo
interactionSystem.registerInteractable(mesh, {
    type: 'collectible',
    name: 'Chiave Dorata',
    description: 'Apre la porta magica',
    canCollect: true,
    onInteract: (data, system) => {
        console.log('Raccolto:', data.name);
    }
});

// Update nel game loop
interactionSystem.update();

// Callbacks UI
interactionSystem.onItemCollected = (data, count) => {
    showMessage(`Raccolto: ${data.name}`);
};

interactionSystem.onInteractionAvailable = (data, distance) => {
    if (data) {
        showHint(`[E] Raccogli ${data.name}`);
    }
};
```

---

## 🎯 Integrazione nei Giochi

### Maze Runner ✅ (Implementato)

**Asset Usati:**
- `collectibles/eyeball` - 3 occhi blu (collezionabili)
- `weapons/sword` - Spada magica (premio finale)
- `environment/rocks` - Rocce decorative
- `environment/barricade` - Barricata (ostacoli)

**Controlli:**
- **WASD** - Movimento
- **Mouse** - Guarda
- **E** - Interagisci/Raccogli

**Gameplay:**
1. Raccogli 3 Occhi Misteriosi 👁️
2. Trova la Spada Magica ⚔️
3. Completa il labirinto!

---

### Fighting Simulation (Da Implementare)

**Asset Proposti:**
- `characters/male` - Personaggio giocatore
- `characters/repo` - Personaggio nemico
- `weapons/beretta` - Arma da fuoco
- `weapons/sword` - Arma melee

**Controlli Proposti:**
- **WASD** - Movimento
- **Mouse** - Camera
- **Click** - Attacco
- **E** - Interagisci/Cambia arma

---

## 📚 Asset 3D Disponibili

### 🏗️ Environment (7 modelli)
- `warehouse` - Magazzino
- `interior` - Interni
- `road` - Strada
- `barricade` - Barricata
- `grass` - Erba
- `rocks` - Rocce stilizzate
- `trees` - Scene alberi

### 🪑 Furniture (6 modelli)
- `bookshelf` - Libreria moderna
- `bookshelfOld` - Libreria vecchia
- `sofa` - Divano vecchio
- `bench` - Panchina
- `tv` - TV vintage
- `laptop` - Laptop

### 🎯 Collectibles (3 modelli)
- `eyeball` - Occhio blu misterioso 👁️
- `hat` - Cappello cowboy 🤠
- `tools` - Pack attrezzi 🔧

### ⚔️ Weapons (3 modelli)
- `beretta` - Pistola Beretta 🔫
- `pistol` - Pistola tattica
- `sword` - Spada Paladin ⚔️

### 👤 Characters (3 modelli)
- `male` - Personaggio maschile realistico
- `repo` - Personaggio REPO
- `deer` - Cervo (NPC decorativo) 🦌

---

## 🔧 API Reference

### AssetManager

#### Methods

**`loadAsset(category, name, onProgress)`**
- Carica un singolo asset
- Returns: `Promise<THREE.Group>`

**`loadMultiple(assetList, onProgress)`**
- Carica asset multipli in parallelo
- Returns: `Promise<Map>`

**`preloadForGame(gameType)`**
- Precarica asset essenziali per un gioco
- gameType: `'maze-runner'`, `'fighting-simulation'`, `'warehouse-explorer'`

**`getAssetsByCategory(category)`**
- Lista asset in una categoria

**`dispose(key)`**
- Libera memoria di un asset

---

### InteractionSystem

#### Methods

**`registerInteractable(mesh, data)`**
- Registra oggetto come interattivo

**`unregisterInteractable(mesh)`**
- Rimuove oggetto dagli interattivi

**`update()`**
- Aggiorna sistema (chiamare nel game loop)

**`interact()`**
- Interagisci con oggetto più vicino

**`getInventory()`**
- Ottieni inventario corrente

**`countItemsByType(type)`**
- Conta oggetti per tipo

**`hasItem(name)`**
- Check se oggetto è in inventario

---

## 🎨 Best Practices

### 1. Caricamento Asset
```javascript
// ✅ GOOD: Async/await con try/catch
try {
    const model = await assetManager.loadAsset('weapons', 'sword');
    scene.add(model);
} catch (error) {
    console.error('Fallback:', error);
    // Usa placeholder semplice
}

// ❌ BAD: Senza error handling
const model = await assetManager.loadAsset('weapons', 'sword');
```

### 2. Performance
```javascript
// ✅ GOOD: Preload all'inizio
await assetManager.preloadForGame('maze-runner');
// Poi usa i modelli cached

// ❌ BAD: Carica on-demand durante gameplay
const model = await assetManager.loadAsset(...); // Causa lag!
```

### 3. Cleanup
```javascript
// ✅ GOOD: Dispose quando non serve più
gameEngine.destroy();
assetManager.dispose();

// ❌ BAD: Memory leak
// ... nessun cleanup
```

---

## 🚀 Roadmap

### Fase 1: MVP ✅ (Completata)
- [x] AssetManager base
- [x] InteractionSystem base
- [x] Integrazione Maze Runner
- [x] 3 Occhi + Spada

### Fase 2: Enhancement 🚧 (In Corso)
- [ ] Animazioni modelli 3D
- [ ] Effetti particellari
- [ ] Audio system
- [ ] Inventory UI visuale

### Fase 3: Advanced 📅 (Futuro)
- [ ] Multiplayer sync
- [ ] Physics integration
- [ ] AI pathfinding
- [ ] Procedural generation

---

## 📝 Notes

- **Path modelli:** `../../3d/nome_file.glb` (relativo da `src/games/shared/`)
- **Three.js version:** r150
- **GLTFLoader:** Caricato da CDN
- **Performance:** Limita modelli a <5MB ciascuno
- **Compatibilità:** Chrome/Edge/Firefox moderni

---

## 🤝 Contribuire

Per aggiungere nuovi asset:
1. Converti in GLB (Blender export)
2. Ottimizza geometria (<100k triangoli)
3. Aggiungi al catalogo in `AssetManager.js`
4. Documenta utilizzo qui

---

**Creato per:** LifeManager Gaming Hub
**Ultima modifica:** 2025-11-16

