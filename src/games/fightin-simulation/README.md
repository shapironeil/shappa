# 🥊 FightinSimulation

Gioco di combattimento 3D con due modalità: **Storia** e **Simulation**.

## 🎮 Modalità di Gioco

### 📖 Modalità Storia
- Campagna narrativa con livelli progressivi
- Boss fights
- Sblocchi personaggi e abilità
- Dialoghi e cutscene

### 🎯 Modalità Simulation
- **Combattimento Libero**: Combatti contro nemici AI
- **Training Mode**: Pratica mosse e combo
- **VS Mode**: Combattimento PvP locale
- **Endless Mode**: Ondate infinite di nemici

## 🎨 Struttura File

### Modelli 3D
I modelli devono essere in formato **GLTF/GLB** e posizionati in:
- `models/characters/player/` - Modelli del giocatore
- `models/characters/enemies/` - Modelli nemici
- `models/environments/` - Ambientazioni (arene, dojo, ecc.)
- `models/weapons/` - Armi e oggetti
- `models/effects/` - Effetti particellari

### Formato Consigliato
- **Formato**: GLTF 2.0 (`.glb` per file binari, `.gltf` per testo)
- **Animazioni**: Incluse nel file GLTF o separate
- **Texture**: Embedded o referenziate
- **Dimensioni**: Ottimizzare per web (max 5MB per modello)

### Fonti Modelli Gratuiti
- **Mixamo** (Adobe): https://www.mixamo.com - Personaggi e animazioni
- **Sketchfab**: https://sketchfab.com - Modelli 3D vari
- **Poly Haven**: https://polyhaven.com - Asset gratuiti
- **Blender**: Crea i tuoi modelli con Blender (gratuito)

## 🎯 Controlli

- **WASD**: Movimento
- **Spazio**: Attacca
- **Shift**: Difendi
- **Mouse**: Rotazione camera (da implementare)

## 📦 Dipendenze

Il gioco usa:
- **Three.js** (CDN): Motore 3D
- **Cannon.js** (CDN): Fisica (opzionale)

## 🚀 Sviluppo

### Aggiungere un Nuovo Personaggio

1. Crea il modello 3D in Blender o esporta da Mixamo
2. Salva in `models/characters/player/` o `models/characters/enemies/`
3. Aggiungi le statistiche in `data/characters.json`:

```json
{
  "id": "new_character",
  "name": "Character Name",
  "model": "models/characters/player/new_character.glb",
  "stats": {
    "health": 100,
    "stamina": 100,
    "attack": 10,
    "defense": 5,
    "speed": 8
  }
}
```

4. Carica il modello in `Loader.js`:

```javascript
const gltf = await loader.loadModel('models/characters/player/new_character.glb');
const character = gltf.scene;
```

### Aggiungere una Nuova Mossa

1. Aggiungi l'animazione al modello GLTF
2. Definisci la mossa in `data/characters.json`:

```json
{
  "id": "new_move",
  "name": "New Move",
  "damage": 25,
  "stamina": 20,
  "range": 2.5,
  "animation": "new_move_animation"
}
```

3. Implementa la logica in `CombatSystem.js`

## 📝 TODO

- [ ] Caricamento modelli 3D reali
- [ ] Sistema di animazioni
- [ ] Fisica e collisioni
- [ ] Sistema combo
- [ ] UI completa (inventario, menu pause)
- [ ] Sistema di salvataggio progressi
- [ ] Integrazione con gaming profile API
- [ ] Audio e musica
- [ ] Ottimizzazioni performance

## 🎨 Design Notes

- **Stile**: Futuristico/cyberpunk con palette viola-blu
- **Illuminazione**: Drammatica con ombre soft
- **Camera**: Terza persona, seguibile
- **Animazioni**: Fluide e responsive

