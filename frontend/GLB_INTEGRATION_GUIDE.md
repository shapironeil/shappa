# 🎯 Guida Completa: Integrazione GLB in React/TypeScript con Vite

## 📋 Panoramica

Questa guida ti accompagna passo-passo nell'integrazione di modelli 3D GLB in una web app React/TypeScript usando:
- **Three.js r169+** per rendering 3D
- **Vite 6+** come bundler
- **React 18+** con TypeScript strict mode
- **GLTFLoader** per caricare file .glb

---

## 🚀 Quick Start (5 minuti)

### 1. Installa Dipendenze

```bash
cd frontend
npm install three@^0.169.0
npm install --save-dev @types/three@^0.169.0
```

### 2. Crea Struttura Cartelle

```bash
mkdir -p public/models
```

### 3. Copia il File GLB

Copia il tuo file `.glb` in `frontend/public/models/` (es. `character.glb`)

### 4. Usa il Componente

```tsx
import GLBViewer from '@/components/GLBViewer';

function App() {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <GLBViewer modelPath="/models/character.glb" />
    </div>
  );
}
```

### 5. Testa

```bash
npm run dev
```

Apri `http://localhost:3000` e verifica che il modello appaia.

---

## 📦 Dettagli Installazione

### Dipendenze Obbligatorie

| Pacchetto | Versione | Scopo |
|-----------|----------|-------|
| `three` | `^0.169.0` | Libreria 3D principale |
| `@types/three` | `^0.169.0` | TypeScript definitions |

**Nota**: `GLTFLoader` e `OrbitControls` sono inclusi in `three/examples/jsm/` e **non** richiedono pacchetti separati.

### Installazione

```bash
npm install three@^0.169.0
npm install --save-dev @types/three@^0.169.0
```

### Verifica Installazione

```bash
npm list three @types/three
```

Dovresti vedere:
```
three@0.169.x
@types/three@0.169.x
```

---

## ⚙️ Configurazione

### vite.config.ts

**Nessuna modifica necessaria** - Vite gestisce automaticamente file binari da `public/`.

La configurazione esistente è già corretta:
```typescript
export default defineConfig({
  plugins: [react()],
  // ... resto della config
});
```

### tsconfig.json

**Nessuna modifica necessaria** - la configurazione esistente è già corretta:
```json
{
  "compilerOptions": {
    "moduleResolution": "bundler", // ✅
    "strict": true, // ✅
    "lib": ["DOM", "DOM.Iterable"] // ✅
  }
}
```

---

## 📁 Struttura File

### Layout Consigliato

```
frontend/
├── public/
│   └── models/
│       ├── character.glb
│       ├── environment.glb
│       └── ...
├── src/
│   └── components/
│       └── GLBViewer.tsx
└── package.json
```

### Path nel Componente

**✅ Corretto**:
```tsx
<GLBViewer modelPath="/models/character.glb" />
```

**❌ SBAGLIATO**:
```tsx
// Import diretto non funziona per .glb
import modelUrl from '/models/character.glb'; // ❌

// Path relativo non funziona da public/
<GLBViewer modelPath="./models/character.glb" /> // ❌
<GLBViewer modelPath="models/character.glb" /> // ❌ (manca / iniziale)
```

**Regola**: Path assoluti che iniziano con `/` puntano a `public/`.

---

## 🎨 Utilizzo del Componente

### Props Disponibili

```typescript
interface GLBViewerProps {
  /** Path al file .glb (es. '/models/character.glb') */
  modelPath: string;
  
  /** Dimensione target per auto-scaling (default: 2) */
  targetSize?: number;
  
  /** Abilita/disabilita OrbitControls (default: true) */
  enableControls?: boolean;
  
  /** Callback quando il modello è caricato */
  onLoad?: (model: THREE.Group) => void;
  
  /** Callback per errori */
  onError?: (error: Error) => void;
  
  /** Classe CSS per il container */
  className?: string;
  
  /** Stile inline per il container */
  style?: React.CSSProperties;
}
```

### Esempi di Utilizzo

#### Esempio Base

```tsx
import GLBViewer from '@/components/GLBViewer';

function MyPage() {
  return (
    <div style={{ width: '800px', height: '600px' }}>
      <GLBViewer modelPath="/models/character.glb" />
    </div>
  );
}
```

#### Esempio con Callbacks

```tsx
import GLBViewer from '@/components/GLBViewer';
import { useState } from 'react';

function MyPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  return (
    <div style={{ width: '800px', height: '600px' }}>
      {loading && <div>Caricamento...</div>}
      {error && <div>Errore: {error}</div>}
      
      <GLBViewer
        modelPath="/models/character.glb"
        targetSize={3}
        onLoad={(model) => {
          console.log('Modello caricato:', model);
          setLoading(false);
        }}
        onError={(err) => {
          console.error('Errore:', err);
          setError(err.message);
          setLoading(false);
        }}
      />
    </div>
  );
}
```

#### Esempio con Styling

```tsx
import GLBViewer from '@/components/GLBViewer';

function MyPage() {
  return (
    <div className="container">
      <GLBViewer
        modelPath="/models/character.glb"
        className="glb-viewer"
        style={{ border: '1px solid #ccc', borderRadius: '8px' }}
      />
    </div>
  );
}
```

#### Esempio Senza Controls

```tsx
<GLBViewer
  modelPath="/models/character.glb"
  enableControls={false}
/>
```

---

## 🐛 Troubleshooting

### Problema: Modello Nero

**Sintomi**: Il modello carica ma appare completamente nero.

**Cause**:
1. Mancanza di luci (improbabile, il componente le include)
2. Materiali PBR senza texture
3. Normali invertite nel modello

**Soluzioni**:
1. Verifica che il modello abbia materiali corretti in Blender
2. Esporta con "Export Materials" abilitato
3. Aggiungi texture al modello se usa PBR materials

**Debug**:
```typescript
model.traverse((child) => {
  if (child instanceof THREE.Mesh) {
    console.log('Material:', child.material);
    console.log('Has texture:', child.material.map !== undefined);
  }
});
```

### Problema: Modello Non Visibile

**Sintomi**: Nessun errore in console, ma il modello non appare.

**Cause**:
1. Camera troppo vicina/lontana
2. Modello troppo grande/piccolo
3. Modello fuori dal view frustum

**Soluzioni**:
1. Aumenta `targetSize` se il modello è troppo piccolo:
   ```tsx
   <GLBViewer modelPath="/models/character.glb" targetSize={5} />
   ```
2. Verifica bounding box in console (il componente logga automaticamente)
3. Aggiungi helper visivi per debug:
   ```typescript
   // Nel componente, aggiungi dopo scene.add(model):
   const helper = new THREE.BoxHelper(model, 0xff0000);
   scene.add(helper);
   ```

### Problema: 404 Not Found

**Sintomi**: Errore 404 in console per il file .glb

**Cause**:
1. File non in `public/`
2. Path errato nel componente

**Soluzioni**:
1. Verifica che il file sia in `frontend/public/models/character.glb`
2. Verifica che il path inizi con `/`:
   ```tsx
   // ✅ Corretto
   modelPath="/models/character.glb"
   
   // ❌ Sbagliato
   modelPath="models/character.glb"
   modelPath="./models/character.glb"
   ```
3. Testa con curl:
   ```bash
   curl http://localhost:3000/models/character.glb -I
   ```

### Problema: GLTFLoader is not a constructor

**Sintomi**: Errore `GLTFLoader is not a constructor`

**Cause**: Import errato

**Soluzione**:
```typescript
// ✅ CORRETTO
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// ❌ SBAGLIATO
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'; // Vecchia sintassi
import GLTFLoader from 'three/examples/jsm/loaders/GLTFLoader'; // Manca .js
```

### Problema: Memory Leak

**Sintomi**: Performance degradano dopo unmount/remount del componente

**Cause**: Oggetti Three.js non disposed

**Soluzione**: Il componente `GLBViewer` include già cleanup completo. Se vedi ancora leak:
1. Verifica che il componente venga unmountato correttamente
2. Aggiungi log nel cleanup per verificare che venga chiamato:
   ```typescript
   return () => {
     console.log('Cleanup GLBViewer');
     // ... cleanup code
   };
   ```

---

## 🧪 Testing

### Test 1: Verifica File Servito

Con Vite dev server attivo:

```bash
# Windows PowerShell
curl http://localhost:3000/models/character.glb -I

# Dovrebbe restituire:
# HTTP/1.1 200 OK
# Content-Type: application/octet-stream
```

Oppure apri nel browser:
```
http://localhost:3000/models/character.glb
```

Se vedi il file scaricarsi o un errore 404, il path è sbagliato.

### Test 2: Test Componente

Crea `src/TestGLB.tsx`:

```tsx
import GLBViewer from './components/GLBViewer';

export default function TestGLB() {
  return (
    <div style={{ width: '800px', height: '600px', margin: '2rem' }}>
      <h1>Test GLB Viewer</h1>
      <GLBViewer 
        modelPath="/models/character.glb"
        targetSize={2}
        onLoad={(model) => {
          console.log('✅ Modello caricato:', model);
          console.log('Bounding box:', new THREE.Box3().setFromObject(model));
        }}
        onError={(err) => {
          console.error('❌ Errore:', err);
        }}
      />
    </div>
  );
}
```

Aggiungi temporaneamente a `App.tsx`:
```tsx
import TestGLB from './TestGLB';

function App() {
  return <TestGLB />;
}
```

### Test 3: Verifica Console

Apri DevTools Console e verifica:
- ✅ Nessun errore 404
- ✅ Nessun errore CORS
- ✅ Log "Loading ...: 100%"
- ✅ Log "✅ Modello caricato"
- ✅ Nessun warning su memory leak

---

## 📚 Riferimenti

- [Three.js Documentation](https://threejs.org/docs/)
- [GLTFLoader Examples](https://threejs.org/examples/?q=gltf)
- [Vite Static Assets](https://vitejs.dev/guide/assets.html#static-assets)
- [Three.js r169 Release Notes](https://github.com/mrdoob/three.js/releases)

---

## ✅ Checklist Finale

Prima di considerare l'integrazione completa:

- [ ] `three@^0.169.0` installato
- [ ] `@types/three@^0.169.0` installato
- [ ] File `.glb` in `public/models/`
- [ ] Path corretto nel componente (inizia con `/`)
- [ ] Componente `GLBViewer.tsx` in `src/components/`
- [ ] Test con `curl` restituisce 200 OK
- [ ] Console non mostra errori 404 o CORS
- [ ] Modello visibile e scalato correttamente
- [ ] OrbitControls funzionanti (rotazione con mouse)
- [ ] Animazioni funzionanti (se presenti nel GLB)
- [ ] Cleanup funzionante (nessun memory leak dopo unmount)

---

**Ultimo aggiornamento**: Gennaio 2025  
**Three.js**: r169+  
**Vite**: 6.3.5  
**React**: 18.3.1

