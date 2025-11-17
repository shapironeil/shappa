# 🎯 Metodo Corretto per Caricare e Visualizzare Modelli GLB in Three.js

## ✅ Metodo Testato e Funzionante

Questo documento descrive il metodo **completamente funzionante** per caricare e visualizzare modelli 3D GLB in Three.js. Questo metodo è stato testato e funziona correttamente sia in React che in vanilla JavaScript.

---

## 📋 Prerequisiti

### 1. Librerie Necessarie

```javascript
// Three.js (versione r169+)
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
```

### 2. Struttura File

```
progetto/
├── public/
│   └── models/          ← File GLB qui (per React/Vite)
│       └── model.glb
├── 3d/                  ← File GLB qui (per server Express)
│   └── model.glb
└── src/
    └── game.html        ← Pagina del gioco
```

---

## 🔧 Setup Iniziale

### 1. Inizializza Scene, Camera, Renderer

```javascript
// SCENA
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf5f5f5);

// CAMERA
const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
camera.position.set(0, 3, 8);
camera.lookAt(0, 1, 0);

// RENDERER
const renderer = new THREE.WebGLRenderer({ 
    canvas: canvas, 
    antialias: true,
    powerPreference: 'high-performance'
});
renderer.setSize(width, height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;
```

### 2. LUCI (ESSENZIALI - Senza queste i GLB appaiono neri!)

```javascript
// Luce ambientale (illumina tutto uniformemente)
const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
scene.add(ambientLight);

// Luce direzionale (simula sole)
const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
directionalLight.position.set(-5, 8, 5);
directionalLight.castShadow = true;
directionalLight.shadow.camera.left = -10;
directionalLight.shadow.camera.right = 10;
directionalLight.shadow.camera.top = 10;
directionalLight.shadow.camera.bottom = -10;
directionalLight.shadow.mapSize.width = 2048;
directionalLight.shadow.mapSize.height = 2048;
scene.add(directionalLight);

// Luce emisferica (illuminazione ambiente)
const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.6);
hemisphereLight.position.set(0, 10, 0);
scene.add(hemisphereLight);
```

**⚠️ IMPORTANTE**: Senza almeno 2 luci (Ambient + Directional), i modelli GLB appariranno completamente neri!

---

## 🎯 Funzione di Caricamento GLB (METODO CORRETTO)

### Codice Completo Funzionante

```javascript
// GLTFLoader
const gltfLoader = new THREE.GLTFLoader();

/**
 * Carica un modello GLB e lo posiziona correttamente nella scena
 * 
 * @param {string} path - Path al file GLB (es: '/models/model.glb')
 * @param {THREE.Vector3} position - Posizione target [x, y, z]
 * @param {Object} rotation - Rotazione {x, y, z} in radianti
 * @param {number} targetSize - Dimensione target per auto-scaling
 * @param {Object} options - Opzioni aggiuntive (interactable, type, ecc.)
 * @returns {Promise<THREE.Group>} - Promise che risolve con il modello caricato
 */
function loadModel(path, position, rotation, targetSize, options = {}) {
    return new Promise((resolve, reject) => {
        gltfLoader.load(
            path,
            // SUCCESS CALLBACK
            (gltf) => {
                // ✅ USA DIRETTAMENTE gltf.scene - NON clonare!
                const model = gltf.scene;
                const modelName = path.split('/').pop();
                console.log(`📦 GLB ${modelName} caricato, processando...`);
                
                // ==========================================
                // STEP 1: Bounding box PRIMA di scaling
                // ==========================================
                const box = new THREE.Box3().setFromObject(model);
                const size = box.getSize(new THREE.Vector3());
                const center = box.getCenter(new THREE.Vector3());
                console.log(`  📐 Bounding box:`, size, 'Center:', center);
                
                // ==========================================
                // STEP 2: SCALING PRIMA (ordine importante!)
                // ==========================================
                const maxSize = Math.max(size.x, size.y, size.z);
                if (maxSize > 0) {
                    const scale = targetSize / maxSize;
                    model.scale.set(scale, scale, scale);
                    console.log(`  🔍 Scaling applicato: ${scale.toFixed(3)}`);
                }
                
                // ==========================================
                // STEP 3: Ricalcola bounding box DOPO scaling
                // ==========================================
                const boxAfter = new THREE.Box3().setFromObject(model);
                const centerAfter = boxAfter.getCenter(new THREE.Vector3());
                
                // ==========================================
                // STEP 4: POSIZIONE DOPO scaling
                // ==========================================
                model.position.set(position.x, position.y, position.z);
                model.position.sub(centerAfter);
                console.log(`  📍 Posizione finale:`, model.position);
                
                // ==========================================
                // STEP 5: Rotazione
                // ==========================================
                if (rotation) {
                    model.rotation.set(
                        rotation.x || 0, 
                        rotation.y || 0, 
                        rotation.z || 0
                    );
                    console.log(`  🔄 Rotazione:`, rotation);
                }
                
                // ==========================================
                // STEP 6: Configura Materiali e Mesh
                // ==========================================
                model.traverse((child) => {
                    if (child instanceof THREE.Mesh) {
                        // FORZA visibilità
                        child.visible = true;
                        child.castShadow = true;
                        child.receiveShadow = true;
                        
                        if (child.material) {
                            const mats = Array.isArray(child.material) 
                                ? child.material 
                                : [child.material];
                            
                            mats.forEach((mat) => {
                                mat.needsUpdate = true;
                                
                                if (mat instanceof THREE.MeshStandardMaterial) {
                                    mat.transparent = false;
                                    mat.opacity = 1.0;
                                    
                                    // Aggiorna texture se presente
                                    if (mat.map) {
                                        mat.map.needsUpdate = true;
                                    }
                                }
                            });
                        }
                    }
                });
                
                // ==========================================
                // STEP 7: Opzioni aggiuntive (interattività, ecc.)
                // ==========================================
                if (options.interactable) {
                    model.userData.interactable = true;
                    model.userData.type = options.type || 'object';
                }
                
                // ==========================================
                // STEP 8: Aggiungi alla scena
                // ==========================================
                model.visible = true;
                scene.add(model);
                
                console.log(`✅ ${modelName} caricato e aggiunto alla scena`);
                resolve(model);
            },
            // PROGRESS CALLBACK
            (progress) => {
                if (progress.total > 0) {
                    const percent = (progress.loaded / progress.total) * 100;
                    const modelName = path.split('/').pop();
                    console.log(`📥 Caricamento ${modelName}: ${percent.toFixed(0)}%`);
                }
            },
            // ERROR CALLBACK
            (error) => {
                console.error(`❌ ERRORE caricamento ${path}:`, error);
                reject(error);
            }
        );
    });
}
```

---

## 📝 Esempio di Utilizzo

### Esempio 1: Caricamento Singolo Modello

```javascript
// Carica un tavolino
loadModel(
    '/3d/bench_model_free.glb',
    new THREE.Vector3(5, 0, 7),
    { y: 0 },
    1.5,
    { showHelper: false }
).then((model) => {
    console.log('Tavolino caricato!', model);
}).catch((error) => {
    console.error('Errore:', error);
});
```

### Esempio 2: Modello Interattivo

```javascript
// Carica un computer interattivo
loadModel(
    '/3d/laptop_free.glb',
    new THREE.Vector3(5, 0.8, 7),
    { y: Math.PI },
    0.5,
    {
        interactable: true,
        type: 'pc',
        showHelper: false
    }
).then((model) => {
    // Aggiungi luce al PC
    const pcLight = new THREE.PointLight(0x3b82f6, 0.6, 4);
    pcLight.position.set(0, 0.2, 0);
    model.add(pcLight);
});
```

### Esempio 3: Caricare Più Modelli

```javascript
// Carica tutti i modelli della camera
const roomObjects = [
    {
        path: '/3d/bench_model_free.glb',
        position: new THREE.Vector3(5, 0, 7),
        rotation: { y: 0 },
        targetSize: 1.5,
        name: 'Tavolino'
    },
    {
        path: '/3d/laptop_free.glb',
        position: new THREE.Vector3(5, 0.8, 7),
        rotation: { y: Math.PI },
        targetSize: 0.5,
        name: 'Computer',
        interactable: true
    },
    // ... altri oggetti
];

// Carica tutti in parallelo
Promise.all(
    roomObjects.map(obj => 
        loadModel(obj.path, obj.position, obj.rotation, obj.targetSize, {
            interactable: obj.interactable,
            type: obj.name?.toLowerCase(),
            showHelper: false
        })
    )
).then(() => {
    console.log('✅ Tutti i modelli caricati!');
});
```

---

## 🔍 Debug e Troubleshooting

### Problema: Modello Non Visibile

**Checklist**:
1. ✅ Verifica che le luci siano configurate (minimo Ambient + Directional)
2. ✅ Controlla console per errori di caricamento
3. ✅ Verifica che il path sia corretto (Network tab → status 200)
4. ✅ Controlla bounding box nei log (se è 0,0,0 c'è un problema)
5. ✅ Verifica che `model.visible = true` sia impostato

### Problema: Modello Nero

**Causa**: Mancanza di luci

**Soluzione**: Aggiungi sempre almeno 2 luci:
```javascript
const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
```

### Problema: Modello Troppo Piccolo/Grande

**Soluzione**: Modifica `targetSize`:
```javascript
// Più grande
loadModel(path, position, rotation, 5.0); // targetSize = 5

// Più piccolo
loadModel(path, position, rotation, 0.5); // targetSize = 0.5
```

### Problema: Modello Fuori Posizione

**Causa**: Bounding box calcolato prima dello scaling

**Soluzione**: Il metodo corretto ricalcola il bounding box DOPO lo scaling (vedi STEP 3)

---

## ⚠️ Errori Comuni da Evitare

### ❌ SBAGLIATO: Clonare la scena
```javascript
const model = gltf.scene.clone(); // ❌ Può causare problemi con materiali
```

### ✅ CORRETTO: Usare direttamente la scena
```javascript
const model = gltf.scene; // ✅ Preserva materiali e texture
```

### ❌ SBAGLIATO: Posizionare prima di scalare
```javascript
model.position.set(...position); // ❌
model.scale.set(scale, scale, scale); // ❌ Ordine sbagliato!
```

### ✅ CORRETTO: Scalare prima, poi posizionare
```javascript
model.scale.set(scale, scale, scale); // ✅ Prima scaling
const boxAfter = new THREE.Box3().setFromObject(model); // Ricalcola
model.position.set(...position); // ✅ Poi posizione
```

### ❌ SBAGLIATO: Usare BoxHelper in produzione
```javascript
const boxHelper = new THREE.BoxHelper(model, 0xff0000);
scene.add(boxHelper); // ❌ Mostra solo parallelepipedi!
```

### ✅ CORRETTO: Rimuovere BoxHelper
```javascript
// BoxHelper rimosso - mostra i modelli 3D reali
```

---

## 📊 Ordine delle Operazioni (CRITICO)

L'ordine è **fondamentale** per il corretto funzionamento:

1. ✅ Carica GLB → `gltf.scene`
2. ✅ Calcola bounding box originale
3. ✅ Applica scaling
4. ✅ Ricalcola bounding box dopo scaling
5. ✅ Applica posizione (sottraendo center dopo scaling)
6. ✅ Applica rotazione
7. ✅ Configura materiali
8. ✅ Aggiungi alla scena

**NON cambiare questo ordine!**

---

## 🎮 Integrazione in Giochi FPS

Per giochi first-person (come Maze Runner):

```javascript
// Setup camera FPS
const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 100);
camera.position.set(5, 1.6, 5); // Altezza occhi umani

// Carica modelli (stesso metodo)
loadModel('/3d/bench_model_free.glb', new THREE.Vector3(5, 0, 7), { y: 0 }, 1.5);

// Mantieni controlli FPS esistenti
// ... (WASD, mouse look, pointer lock, ecc.)
```

---

## 📁 Path dei File

### Opzione 1: File Locali (Sviluppo)

**Per React/Vite**:
```
frontend/public/models/model.glb
→ Path: '/models/model.glb'
```

**Per Server Express**:
```
3d/model.glb
→ Path: '/3d/model.glb'
```

### Opzione 2: Digital Ocean Spaces (Produzione) ⭐ RACCOMANDATO

I file GLB sono troppo pesanti per GitHub. Usa Digital Ocean Spaces:

**Setup**:
1. Crea Space su Digital Ocean
2. Carica file con: `node scripts/upload-glb-to-spaces.js`
3. Configura variabili in `.env.private`:
   ```env
   DO_SPACES_ENDPOINT=https://nyc3.digitaloceanspaces.com
   DO_SPACES_BUCKET=shappa-assets
   DO_SPACES_KEY=your_key
   DO_SPACES_SECRET=your_secret
   ```

**Path da usare**:
```javascript
// URL diretto a Spaces
'https://shappa-assets.nyc3.cdn.digitaloceanspaces.com/models/model.glb'

// Oppure endpoint API (redirect)
'/api/models/model.glb'
```

**Vedi**: `docs/SPACES_GLB_SETUP.md` per setup completo

### Verifica Path
```javascript
// Test nel browser
fetch('/3d/model.glb')
    .then(res => {
        console.log('Status:', res.status); // Deve essere 200
        console.log('Content-Type:', res.headers.get('content-type')); // Non deve essere text/html
    });
```

---

## ✅ Checklist Finale

Prima di considerare il caricamento completo:

- [ ] Three.js r169+ installato
- [ ] GLTFLoader importato correttamente
- [ ] File GLB in cartella corretta (`public/models/` o `3d/`)
- [ ] Path corretto nel codice (inizia con `/`)
- [ ] Scene, Camera, Renderer inizializzati
- [ ] **Almeno 2 luci configurate** (Ambient + Directional)
- [ ] Renderer con shadow mapping abilitato
- [ ] Funzione `loadModel` usa l'ordine corretto
- [ ] Materiali configurati (`needsUpdate = true`)
- [ ] BoxHelper rimosso (non in produzione)
- [ ] Console mostra log di successo
- [ ] Network tab mostra status 200 per file GLB

---

## 🔗 Riferimenti

- **Three.js Docs**: https://threejs.org/docs/
- **GLTFLoader Examples**: https://threejs.org/examples/?q=gltf
- **Metodo testato in**: `frontend/src/components/RoomViewerFixed.tsx`
- **Implementazione Maze Runner**: `src/games/maze-runner/index.html`

---

**Ultimo aggiornamento**: Gennaio 2025  
**Three.js versione**: r169+  
**Metodo testato e funzionante**: ✅

