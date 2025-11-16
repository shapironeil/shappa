# ⚡ Quick Install - GLB Viewer

## 🚀 Installazione Rapida (2 minuti)

### 1. Installa Dipendenze

```bash
cd frontend
npm install three@^0.169.0
npm install --save-dev @types/three@^0.169.0
```

### 2. Aggiungi un Modello

Copia il tuo file `.glb` in:
```
frontend/public/models/character.glb
```

### 3. Usa il Componente

```tsx
import GLBViewer from '@/components/GLBViewer';

function App() {
  return (
    <div style={{ width: '800px', height: '600px' }}>
      <GLBViewer modelPath="/models/character.glb" />
    </div>
  );
}
```

### 4. Testa

```bash
npm run dev
```

Apri `http://localhost:3000` e verifica che il modello appaia.

---

## ✅ Verifica Installazione

```bash
# Verifica che three sia installato
npm list three @types/three

# Verifica che il file sia servito (con dev server attivo)
curl http://localhost:3000/models/character.glb -I
```

---

## 📚 Documentazione Completa

- **Checklist dettagliata**: `GLB_INTEGRATION_CHECKLIST.md`
- **Guida completa**: `GLB_INTEGRATION_GUIDE.md`
- **Esempi**: `src/components/GLBViewer.example.tsx`

---

## 🐛 Problemi?

Vedi la sezione **Troubleshooting** in `GLB_INTEGRATION_GUIDE.md`.

