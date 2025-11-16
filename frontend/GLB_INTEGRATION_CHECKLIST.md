# ✅ Checklist Integrazione GLB con Three.js r169+ (2025)

## 📦 1. Dipendenze da Installare

### Obbligatorie

```bash
npm install three@^0.169.0
npm install --save-dev @types/three@^0.169.0
```

**Nota**: `GLTFLoader` e `OrbitControls` sono inclusi in `three/examples/jsm/` e non richiedono pacchetti separati.

### Facoltative ma Consigliate

```bash
# Per debug e sviluppo (opzionale)
npm install --save-dev @types/node
```

**Non necessarie**:
- ❌ `three-gltf-loader` (deprecato, usa `GLTFLoader` da three)
- ❌ `@react-three/fiber` (solo se vuoi React Three Fiber, non necessario per questo setup)
- ❌ CDN o script globali (usiamo bundler)

---

## ⚙️ 2. Configurazioni Necessarie

### vite.config.ts

**Nessuna modifica necessaria** per file `.glb` o `.bin` - Vite li serve automaticamente da `public/`.

Se vuoi configurare CORS esplicitamente (opzionale):

```typescript
export default defineConfig({
  // ... existing config
  server: {
    // ... existing server config
    cors: true, // Già abilitato di default in dev
  },
});
```

**Non serve**:
- ❌ Plugin per `.glb` (Vite gestisce binari automaticamente)
- ❌ `vite-plugin-glsl` (solo se usi shader GLSL personalizzati)
- ❌ Configurazioni speciali per asset binari

### tsconfig.json

**Nessuna modifica necessaria** - la configurazione esistente è già corretta:

```json
{
  "compilerOptions": {
    "moduleResolution": "bundler", // ✅ Già presente
    "strict": true, // ✅ Già presente
    // ...
  }
}
```

**Verifica che**:
- ✅ `"moduleResolution": "bundler"` è presente
- ✅ `"strict": true` è abilitato
- ✅ `"lib": ["DOM", "DOM.Iterable"]` include DOM

---

## 📁 3. Struttura dei File

### Dove Mettere il File .glb

**Opzione 1: `public/models/` (Raccomandato)**

```
frontend/
├── public/
│   └── models/
│       └── character.glb
├── src/
│   └── components/
│       └── GLBViewer.tsx
```

**Uso nel componente**:
```tsx
<GLBViewer modelPath="/models/character.glb" />
```

**Opzione 2: `public/` (root)**

```
frontend/
├── public/
│   └── character.glb
```

**Uso nel componente**:
```tsx
<GLBViewer modelPath="/character.glb" />
```

### Import in Componente React

**✅ Corretto** (path assoluto da public):
```tsx
<GLBViewer modelPath="/models/character.glb" />
```

**❌ SBAGLIATO** (import diretto):
```tsx
// NON FUNZIONA - i .glb non sono importabili come moduli
import modelUrl from '/models/character.glb'; // ❌
```

**Nota**: Vite serve file da `public/` con path assoluti che iniziano con `/`.

---

## 🐛 4. Errori Comuni + Fix

### Problema: Modello Appare Nero

**Cause possibili**:
1. Mancanza di luci
2. Materiali non compatibili (es. PBR materials senza texture)
3. Normali invertite nel modello

**Fix**:
- ✅ Il componente `GLBViewer` include già `HemisphereLight` + `DirectionalLight`
- ✅ Se ancora nero, verifica che il modello abbia materiali corretti in Blender/export
- ✅ Aggiungi `console.log` per verificare materiali:
  ```typescript
  model.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      console.log('Material:', child.material);
    }
  });
  ```

### Problema: Non Si Vede Niente (Nessun Errore)

**Cause possibili**:
1. Camera troppo vicina/lontana
2. Modello troppo grande/piccolo (scaling)
3. Modello fuori dal view frustum

**Fix**:
- ✅ Il componente `GLBViewer` fa auto-scaling e auto-centratura
- ✅ Verifica bounding box in console:
  ```typescript
  const box = new THREE.Box3().setFromObject(model);
  console.log('Bounding box:', box);
  ```
- ✅ Aggiungi `targetSize` più grande se il modello è troppo piccolo:
  ```tsx
  <GLBViewer modelPath="/models/character.glb" targetSize={5} />
  ```

### Problema: `GLTFLoader is not a constructor`

**Causa**: Import errato o versione Three.js incompatibile

**Fix**:
```typescript
// ✅ CORRETTO
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// ❌ SBAGLIATO
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'; // Vecchia sintassi
import GLTFLoader from 'three/examples/jsm/loaders/GLTFLoader'; // Manca .js
```

### Problema: 404 Not Found per .glb

**Causa**: File non in `public/` o path errato

**Fix**:
1. Verifica che il file sia in `frontend/public/models/character.glb`
2. Verifica che il path inizi con `/` (path assoluto)
3. Testa con curl (vedi sezione 5)

### Problema: CORS Error in Dev

**Causa**: Vite dev server non serve correttamente il file

**Fix**:
- ✅ Vite serve `public/` automaticamente senza CORS issues
- ✅ Se vedi errori CORS, verifica che il file sia in `public/` e non in `src/`
- ✅ Verifica `vite.config.ts` non abbia configurazioni che bloccano asset statici

### Problema: Memory Leak / Performance

**Causa**: Oggetti Three.js non vengono disposed

**Fix**:
- ✅ Il componente `GLBViewer` include cleanup completo in `useEffect` return
- ✅ Verifica che tutti i refs vengano puliti:
  - `mixer.dispose()`
  - `controls.dispose()`
  - `geometry.dispose()`
  - `material.dispose()`
  - `renderer.dispose()`

---

## 🧪 5. Verifica Rapida (Smoke Test)

### Test 1: Verifica che il File Sia Servito

**Con Vite dev server attivo** (`npm run dev`):

```bash
# Windows PowerShell
curl http://localhost:3000/models/character.glb -I

# Dovrebbe restituire:
# HTTP/1.1 200 OK
# Content-Type: application/octet-stream (o application/gltf-binary)
```

**Oppure apri nel browser**:
```
http://localhost:3000/models/character.glb
```

Se vedi il file scaricarsi o un errore 404, il path è sbagliato.

### Test 2: Verifica Componente

Crea un file di test `src/TestGLB.tsx`:

```tsx
import GLBViewer from './components/GLBViewer';

export default function TestGLB() {
  return (
    <div style={{ width: '800px', height: '600px' }}>
      <GLBViewer 
        modelPath="/models/character.glb"
        targetSize={2}
        onLoad={(model) => console.log('✅ Modello caricato:', model)}
        onError={(err) => console.error('❌ Errore:', err)}
      />
    </div>
  );
}
```

Aggiungi a `App.tsx` temporaneamente:
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

---

## 📝 6. Esempio Completo di Utilizzo

### Setup Iniziale

```bash
# 1. Installa dipendenze
cd frontend
npm install three@^0.169.0
npm install --save-dev @types/three@^0.169.0

# 2. Crea cartella per modelli
mkdir -p public/models

# 3. Copia il file .glb
# (copia character.glb in public/models/)

# 4. Avvia dev server
npm run dev
```

### Utilizzo nel Componente

```tsx
import GLBViewer from '@/components/GLBViewer';

function MyPage() {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <GLBViewer 
        modelPath="/models/character.glb"
        targetSize={2}
        enableControls={true}
        onLoad={(model) => {
          console.log('Modello pronto:', model);
        }}
        onError={(error) => {
          console.error('Errore caricamento:', error);
        }}
      />
    </div>
  );
}
```

---

## ✅ Checklist Finale

Prima di considerare l'integrazione completa:

- [ ] `three@^0.169.0` installato
- [ ] `@types/three@^0.169.0` installato
- [ ] File `.glb` in `public/models/`
- [ ] Path corretto nel componente (inizia con `/`)
- [ ] Componente `GLBViewer.tsx` in `src/components/`
- [ ] Test con `curl` o browser restituisce 200 OK
- [ ] Console non mostra errori 404 o CORS
- [ ] Modello visibile e scalato correttamente
- [ ] OrbitControls funzionanti (rotazione con mouse)
- [ ] Animazioni funzionanti (se presenti nel GLB)
- [ ] Cleanup funzionante (nessun memory leak dopo unmount)

---

## 🔗 Riferimenti

- [Three.js Documentation](https://threejs.org/docs/)
- [GLTFLoader Examples](https://threejs.org/examples/?q=gltf)
- [Vite Static Asset Handling](https://vitejs.dev/guide/assets.html#static-assets)

---

**Ultimo aggiornamento**: Gennaio 2025  
**Three.js versione**: r169+  
**Vite versione**: 6.3.5  
**React versione**: 18.3.1

