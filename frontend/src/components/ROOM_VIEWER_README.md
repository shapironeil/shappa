# 🏠 RoomViewer - Componente Camera 3D

Componente React per visualizzare una camera 3D completa con arredamento posizionato automaticamente.

## 📋 Caratteristiche

- ✅ Carica automaticamente tutti gli oggetti della camera
- ✅ Posizionamento automatico di ogni oggetto
- ✅ Auto-scaling basato su bounding box
- ✅ OrbitControls per navigazione 3D
- ✅ Luci ottimizzate per la scena
- ✅ Pavimento e pareti per contesto
- ✅ Gestione errori e loading state
- ✅ Cleanup automatico per evitare memory leak

## 🎯 Oggetti Caricati

Il componente carica e posiziona automaticamente:

1. **Tavolino** (`bench_model_free.glb`)
   - Posizione: centro camera
   - Dimensione: 1.2 unità

2. **Computer** (`laptop_free.glb`)
   - Posizione: sopra il tavolino
   - Dimensione: 0.4 unità
   - Interattivo: ✅

3. **Divano** (`old_sofa_free.glb`)
   - Posizione: sinistra
   - Dimensione: 1.5 unità

4. **TV Vintage** (`vintage_tv_free.glb`)
   - Posizione: sinistra, di fronte al divano
   - Dimensione: 0.8 unità

5. **Libreria** (`chocolate_beech_bookshelf_free.glb`)
   - Posizione: destra
   - Dimensione: 1.5 unità

6. **Libreria Vecchia** (`dusty_old_bookshelf_free.glb`)
   - Posizione: sinistra
   - Dimensione: 1.5 unità

## 🚀 Utilizzo

### Esempio Base

```tsx
import RoomViewer from '@/components/RoomViewer';

function MyPage() {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <RoomViewer />
    </div>
  );
}
```

### Con Callback

```tsx
import RoomViewer from '@/components/RoomViewer';

function MyPage() {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <RoomViewer
        onAllLoaded={() => {
          console.log('Tutti gli oggetti caricati!');
        }}
      />
    </div>
  );
}
```

### Test Component

Per testare rapidamente:

```tsx
import TestRoom from '@/components/TestRoom';

function App() {
  return <TestRoom />;
}
```

## 🎮 Controlli

- **Click + Trascina**: Ruota la camera
- **Scroll**: Zoom in/out
- **Click Destro + Trascina**: Pan (sposta la vista)

## 📁 File Necessari

Assicurati che questi file siano presenti in `public/models/`:

- ✅ `bench_model_free.glb`
- ✅ `laptop_free.glb`
- ✅ `old_sofa_free.glb`
- ✅ `vintage_tv_free.glb`
- ✅ `chocolate_beech_bookshelf_free.glb`
- ✅ `dusty_old_bookshelf_free.glb`

## ⚙️ Personalizzazione

Per modificare posizioni, dimensioni o aggiungere oggetti, modifica l'array `roomObjects` in `RoomViewer.tsx`:

```typescript
const roomObjects: RoomObject[] = [
  {
    path: '/models/nuovo_oggetto.glb',
    position: [x, y, z],
    rotation: [rx, ry, rz],
    targetSize: 1.0,
    name: 'Nuovo Oggetto',
    interactable: false,
  },
  // ... altri oggetti
];
```

## 🐛 Troubleshooting

### Alcuni oggetti non appaiono

- Verifica che i file `.glb` siano in `public/models/`
- Controlla la console per errori di caricamento
- Alcuni modelli potrebbero non caricarsi (il componente continua comunque)

### Modelli troppo grandi/piccoli

- Modifica `targetSize` nell'array `roomObjects`
- Valori più grandi = oggetti più grandi
- Valori più piccoli = oggetti più piccoli

### Performance

- Il componente usa `clone()` per evitare conflitti
- Tutti gli oggetti vengono disposed correttamente
- Se vedi lag, riduci il numero di oggetti o la qualità delle luci

## 📚 Vedi Anche

- `GLBViewer.tsx` - Componente per singoli modelli
- `GLB_INTEGRATION_GUIDE.md` - Guida completa integrazione GLB

