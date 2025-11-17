# 🆓 Setup File GLB sul Droplet (GRATIS)

## ✅ Soluzione Implementata

I file GLB vengono serviti **direttamente dal droplet** invece di Digital Ocean Spaces. Questo è **completamente GRATIS** e usa lo spazio disponibile sul tuo droplet (50 GB).

---

## 📁 Struttura File sul Server

I file GLB sono disponibili in due posizioni:

1. **`/var/www/shappa/3d/`** - 22 file GLB
2. **`/var/www/shappa/frontend/public/models/`** - 22 file GLB (copiati)

**Totale spazio usato**: ~180 MB (su 50 GB disponibili)

---

## 🔗 URL Disponibili

I file sono accessibili tramite:

### Opzione 1: Path diretto
```
https://shapiro.ninja/models/laptop_free.glb
https://shapiro.ninja/3d/laptop_free.glb
```

### Opzione 2: Endpoint API (raccomandato)
```
https://shapiro.ninja/api/models/laptop_free.glb
```

L'endpoint API cerca prima in `frontend/public/models/`, poi in `3d/`.

---

## 🎯 Come Usare nei File

### Maze Runner (`src/games/maze-runner/index.html`)

**Prima** (path locale):
```javascript
loadModel('/3d/laptop_free.glb', ...)
```

**Dopo** (endpoint API - funziona sempre):
```javascript
loadModel('/api/models/laptop_free.glb', ...)
```

### Componenti React

```tsx
<GLBViewerFixed modelPath="/api/models/laptop_free.glb" />
```

---

## ✅ Vantaggi

- ✅ **GRATIS** - Nessun costo aggiuntivo
- ✅ **Veloce** - File serviti direttamente dal server
- ✅ **Semplice** - Nessuna configurazione esterna necessaria
- ✅ **Spazio sufficiente** - 180 MB su 50 GB disponibili

---

## 🔄 Aggiungere Nuovi File GLB

### Metodo 1: Copia Manuale

```bash
# Sul tuo PC
scp frontend/public/models/nuovo_file.glb deploy@shapiro.ninja:/var/www/shappa/frontend/public/models/
```

### Metodo 2: Via Git (se file < 50 MB)

```bash
# Aggiungi file a Git (se piccolo)
git add frontend/public/models/nuovo_file.glb
git commit -m "feat: aggiunto nuovo modello GLB"
git push origin main

# Sul server
ssh deploy@shapiro.ninja "cd /var/www/shappa && sudo git pull origin main"
```

---

## 📊 Spazio Disponibile

**Droplet attuale**:
- **RAM**: 2 GB
- **Disco**: 50 GB
- **File GLB**: ~180 MB
- **Spazio rimanente**: ~49.8 GB

**Conclusione**: Hai spazio più che sufficiente per molti altri file GLB!

---

## 🐛 Troubleshooting

### File non trovato (404)

1. Verifica che il file esista sul server:
   ```bash
   ssh deploy@shapiro.ninja "ls -lh /var/www/shappa/frontend/public/models/[nome_file].glb"
   ```

2. Verifica permessi:
   ```bash
   ssh deploy@shapiro.ninja "sudo chown -R deploy:deploy /var/www/shappa/frontend/public/models"
   ```

3. Riavvia il server:
   ```bash
   ssh deploy@shapiro.ninja "sudo pm2 restart shappa"
   ```

### File troppo lento da caricare

- I file GLB sono grandi (fino a 51 MB)
- Il caricamento dipende dalla connessione dell'utente
- Considera di ottimizzare i file GLB se necessario

---

## 🎉 Risultato

Ora tutti i file GLB sono serviti **gratis** dal tuo droplet e accessibili tramite:

- `/models/[file].glb`
- `/3d/[file].glb`
- `/api/models/[file].glb` ⭐ (raccomandato)

**Nessun costo aggiuntivo!** 🎊

