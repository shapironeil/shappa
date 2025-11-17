# 🚀 Setup Digital Ocean Spaces per File GLB

## 📋 Panoramica

I file GLB sono troppo pesanti per GitHub. Questo documento spiega come configurare Digital Ocean Spaces per ospitare i modelli 3D.

---

## 🔧 Setup Iniziale

### 1. Crea Digital Ocean Space

1. Vai su [Digital Ocean Dashboard](https://cloud.digitalocean.com/spaces)
2. Crea un nuovo Space:
   - **Nome**: `shappa-assets` (o altro)
   - **Region**: `nyc3` (o la tua preferita)
   - **CDN**: Abilita per performance migliori
   - **File Listing**: Disabilita (non serve)

### 2. Ottieni Credenziali

1. Vai su **API** → **Spaces Keys**
2. Genera una nuova key pair
3. Salva:
   - **Access Key**
   - **Secret Key**
   - **Endpoint** (es: `https://nyc3.digitaloceanspaces.com`)

### 3. Configura Variabili Ambiente

Aggiungi al tuo `.env.private`:

```env
DO_SPACES_ENDPOINT=https://nyc3.digitaloceanspaces.com
DO_SPACES_BUCKET=shappa-assets
DO_SPACES_KEY=your_access_key_here
DO_SPACES_SECRET=your_secret_key_here
```

**⚠️ IMPORTANTE**: Non committare queste credenziali su GitHub!

---

## 📦 Installazione Dipendenze

```bash
npm install @aws-sdk/client-s3
```

---

## 🚀 Caricamento File GLB

### Opzione 1: Carica Tutti i File

```bash
node scripts/upload-glb-to-spaces.js
```

Carica automaticamente tutti i file `.glb` da:
- `frontend/public/models/`
- `3d/`

### Opzione 2: Carica File Singolo

```bash
node scripts/upload-glb-to-spaces.js frontend/public/models/laptop_free.glb
```

---

## 🔗 URL dei File

Dopo il caricamento, i file saranno disponibili a:

```
https://nyc3.digitaloceanspaces.com/shappa-assets/models/nome_file.glb
```

Oppure se hai CDN abilitato:

```
https://shappa-assets.nyc3.cdn.digitaloceanspaces.com/models/nome_file.glb
```

---

## 🔄 Aggiornare Path nei File

Dopo aver caricato i file su Spaces, aggiorna i path nei tuoi file:

### Prima (file locale):
```javascript
loadModel('/3d/bench_model_free.glb', ...)
```

### Dopo (Digital Ocean Spaces):
```javascript
loadModel('https://shappa-assets.nyc3.cdn.digitaloceanspaces.com/models/bench_model_free.glb', ...)
```

---

## 📝 Endpoint API per Servire File

Puoi anche creare un endpoint API che serve i file da Spaces:

```javascript
// In server.js
app.get('/api/models/:filename', async (req, res) => {
    const { filename } = req.params;
    const url = `https://shappa-assets.nyc3.cdn.digitaloceanspaces.com/models/${filename}`;
    
    // Redirect o proxy
    res.redirect(url);
});
```

Poi usa:
```javascript
loadModel('/api/models/bench_model_free.glb', ...)
```

---

## ✅ Checklist

- [ ] Digital Ocean Space creato
- [ ] Credenziali ottenute
- [ ] Variabili ambiente configurate in `.env.private`
- [ ] AWS SDK installato (`npm install @aws-sdk/client-s3`)
- [ ] File GLB caricati su Spaces
- [ ] Path aggiornati nei file del progetto
- [ ] File GLB aggiunti a `.gitignore`

---

## 🐛 Troubleshooting

### Errore: "Access Denied"

- Verifica che le credenziali siano corrette
- Verifica che il bucket esista
- Verifica che la key abbia permessi di scrittura

### Errore: "Bucket not found"

- Verifica il nome del bucket in `DO_SPACES_BUCKET`
- Verifica la region (endpoint corretto)

### File non accessibili pubblicamente

- Verifica che i file siano caricati con `ACL: 'public-read'`
- Verifica che il bucket permetta accesso pubblico

---

## 📚 Riferimenti

- [Digital Ocean Spaces Docs](https://docs.digitalocean.com/products/spaces/)
- [AWS S3 SDK (compatibile)](https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/s3-examples.html)

