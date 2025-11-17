# 🚀 Upload Rapido File GLB su Digital Ocean Spaces

## ⚡ Setup Veloce (1 minuto)

### 1. Aggiungi Credenziali

Aggiungi al file `.env.private`:

```env
DO_SPACES_ENDPOINT=https://nyc3.digitaloceanspaces.com
DO_SPACES_BUCKET=shappa-assets
DO_SPACES_KEY=your_access_key_here
DO_SPACES_SECRET=your_secret_key_here
```

**Come ottenere le credenziali:**
1. Vai su https://cloud.digitalocean.com/spaces
2. Crea Space: `shappa-assets` (region: nyc3)
3. Abilita CDN
4. Vai su **API** → **Spaces Keys** → Genera nuova key
5. Copia Access Key e Secret Key

### 2. Esegui Upload

```bash
node scripts/upload-glb-direct.js
```

**Fatto!** I 22 file GLB (180 MB) saranno caricati su Spaces.

---

## 📋 Cosa Fa lo Script

- ✅ Carica tutti i file `.glb` da `frontend/public/models/`
- ✅ Li carica su Digital Ocean Spaces nella cartella `models/`
- ✅ Li rende pubblici e accessibili via CDN
- ✅ Mostra gli URL finali per ogni file

---

## 🔗 URL Finali

Dopo l'upload, i file saranno disponibili a:

```
https://shappa-assets.nyc3.cdn.digitaloceanspaces.com/models/[nome_file].glb
```

Oppure tramite endpoint API:

```
/api/models/[nome_file].glb
```

---

## ✅ Verifica

Dopo l'upload, testa un file:

```bash
curl -I https://shappa-assets.nyc3.cdn.digitaloceanspaces.com/models/laptop_free.glb
```

Dovresti vedere `HTTP/1.1 200 OK`.

---

## 🎯 Prossimi Passi

Dopo l'upload, aggiorna i path nei file:

**Maze Runner** (`src/games/maze-runner/index.html`):
```javascript
// Prima
loadModel('/3d/laptop_free.glb', ...)

// Dopo
loadModel('/api/models/laptop_free.glb', ...)
```

**Componenti React**:
```tsx
// Prima
<GLBViewerFixed modelPath="/models/laptop_free.glb" />

// Dopo
<GLBViewerFixed modelPath="/api/models/laptop_free.glb" />
```

---

## 🐛 Troubleshooting

**Errore: "DO_SPACES_KEY non configurato"**
→ Aggiungi le credenziali a `.env.private`

**Errore: "Access Denied"**
→ Verifica che le credenziali siano corrette
→ Verifica che il bucket esista

**Errore: "Bucket not found"**
→ Verifica il nome del bucket in `DO_SPACES_BUCKET`

---

**Tempo stimato upload**: 2-5 minuti per 180 MB

