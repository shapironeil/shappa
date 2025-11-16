# 📁 Cartella Models

Questa cartella contiene i file `.glb` (modelli 3D) utilizzati dall'applicazione.

## 📋 Come Aggiungere un Modello

1. Copia il file `.glb` in questa cartella
2. Usa il path assoluto nel componente:

```tsx
<GLBViewer modelPath="/models/nome-file.glb" />
```

## ✅ Esempio

Se hai un file `character.glb`:
- Path file: `frontend/public/models/character.glb`
- Path nel componente: `"/models/character.glb"`

## 📝 Note

- I file in `public/` sono serviti staticamente da Vite
- Usa sempre path assoluti che iniziano con `/`
- Non importare i file come moduli (non funziona con `.glb`)

