# 🔄 Migrazione File GLB su Digital Ocean Spaces

## 📋 Situazione Attuale

I file GLB sono stati aggiunti a `.gitignore` per evitare di committarli su GitHub (sono troppo pesanti).

Ora dobbiamo:
1. ✅ Caricarli su Digital Ocean Spaces
2. ✅ Aggiornare i path nei file per usare Spaces
3. ✅ Rimuoverli dal repository Git (se già committati)

---

## 🚀 Passo 1: Configura Digital Ocean Spaces

### 1.1 Crea Space su Digital Ocean

1. Vai su https://cloud.digitalocean.com/spaces
2. Crea nuovo Space:
   - **Nome**: `shappa-assets`
   - **Region**: `nyc3` (o la tua preferita)
   - **CDN**: ✅ Abilita
   - **File Listing**: ❌ Disabilita

### 1.2 Ottieni Credenziali

1. Vai su **API** → **Spaces Keys**
2. Genera nuova key pair
3. Salva:
   - Access Key
   - Secret Key
   - Endpoint (es: `https://nyc3.digitaloceanspaces.com`)

### 1.3 Aggiungi a `.env.private`

```env
DO_SPACES_ENDPOINT=https://nyc3.digitaloceanspaces.com
DO_SPACES_BUCKET=shappa-assets
DO_SPACES_KEY=your_access_key
DO_SPACES_SECRET=your_secret_key
```

---

## 📤 Passo 2: Carica File GLB

### Opzione A: Carica Tutti i File

```bash
node scripts/upload-glb-to-spaces.js
```

### Opzione B: Carica File Singolo

```bash
node scripts/upload-glb-to-spaces.js frontend/public/models/laptop_free.glb
```

### Output Atteso

```
🚀 Upload file GLB su Digital Ocean Spaces
📍 Endpoint: https://nyc3.digitaloceanspaces.com
📦 Bucket: shappa-assets

📁 Cartella: frontend/public/models
📤 Caricamento: laptop_free.glb → models/laptop_free.glb
✅ Caricato: https://nyc3.digitaloceanspaces.com/shappa-assets/models/laptop_free.glb
...
```

---

## 🔄 Passo 3: Aggiorna Path nei File

### 3.1 Maze Runner (`src/games/maze-runner/index.html`)

**Prima**:
```javascript
loadModel('/3d/bench_model_free.glb', ...)
```

**Dopo** (opzione 1 - URL diretto):
```javascript
loadModel('https://shappa-assets.nyc3.cdn.digitaloceanspaces.com/models/bench_model_free.glb', ...)
```

**Dopo** (opzione 2 - API endpoint):
```javascript
loadModel('/api/models/bench_model_free.glb', ...)
```

### 3.2 Componenti React (`frontend/src/components/`)

**Prima**:
```tsx
<GLBViewerFixed modelPath="/models/laptop_free.glb" />
```

**Dopo**:
```tsx
<GLBViewerFixed modelPath="https://shappa-assets.nyc3.cdn.digitaloceanspaces.com/models/laptop_free.glb" />
```

Oppure:
```tsx
<GLBViewerFixed modelPath="/api/models/laptop_free.glb" />
```

---

## 🧹 Passo 4: Rimuovi File GLB da Git

Se i file GLB sono già stati committati, rimuovili:

```bash
# Rimuovi file GLB dal tracking Git (ma mantienili localmente)
git rm --cached frontend/public/models/*.glb
git rm --cached 3d/*.glb

# Commit
git commit -m "chore: rimossi file GLB da Git (ora su Digital Ocean Spaces)"

# Push
git push origin main
```

---

## ✅ Verifica

### 1. Verifica File su Spaces

Apri nel browser:
```
https://shappa-assets.nyc3.cdn.digitaloceanspaces.com/models/laptop_free.glb
```

Dovresti vedere il file scaricarsi (non errore 404).

### 2. Verifica Endpoint API

```bash
curl -I http://localhost:3000/api/models/laptop_free.glb
```

Dovresti vedere un redirect 302 a Spaces.

### 3. Test nel Gioco

Apri Maze Runner e verifica che i modelli si carichino correttamente.

---

## 📝 Configurazione Finale

### Path da Usare

**Per sviluppo locale** (se file ancora locali):
```javascript
'/3d/model.glb'
'/models/model.glb'
```

**Per produzione** (da Digital Ocean Spaces):
```javascript
'https://shappa-assets.nyc3.cdn.digitaloceanspaces.com/models/model.glb'
// Oppure
'/api/models/model.glb'  // Se endpoint API configurato
```

### Variabile Ambiente per Switch

Puoi creare una funzione helper:

```javascript
function getModelPath(filename) {
    // Se Spaces configurato, usa Spaces
    if (process.env.DO_SPACES_ENDPOINT) {
        return `https://shappa-assets.nyc3.cdn.digitaloceanspaces.com/models/${filename}`;
    }
    // Altrimenti usa file locale
    return `/3d/${filename}`;
}
```

---

## 🎯 Checklist Completa

- [ ] Digital Ocean Space creato
- [ ] Credenziali ottenute e aggiunte a `.env.private`
- [ ] AWS SDK installato (`npm install @aws-sdk/client-s3`)
- [ ] File GLB caricati su Spaces
- [ ] Path aggiornati in `src/games/maze-runner/index.html`
- [ ] Path aggiornati nei componenti React (se necessario)
- [ ] File GLB rimossi da Git (se erano committati)
- [ ] `.gitignore` aggiornato per escludere `.glb`
- [ ] Test: file accessibili da Spaces
- [ ] Test: modelli si caricano nel gioco

---

## 🔗 Riferimenti

- **Setup Guide**: `docs/SPACES_GLB_SETUP.md`
- **Metodo Caricamento**: `docs/GLB_LOADING_METHOD.md`
- **Script Upload**: `scripts/upload-glb-to-spaces.js`

