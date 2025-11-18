# 📦 Modelli 3D per Maze Runner

I modelli 3D devono essere scaricati gratuitamente e posizionati in questa cartella.

## ⬇️ Lista Modelli da Scaricare

Tutti i modelli sono disponibili su **Sketchfab** (free download con licenza CC):

### 1. **Bench Model** (`bench_model_free.glb`)
- 🔗 Link: https://sketchfab.com/3d-models/bench-model-free
- 📦 Download come: `bench_model_free.glb`
- 📏 Dimensione: ~1-2 MB
- 🎨 Uso: Tavolino/Scrivania nella camera

### 2. **Laptop** (`laptop_free.glb`)
- 🔗 Link: https://sketchfab.com/3d-models/laptop-free
- 📦 Download come: `laptop_free.glb`
- 📏 Dimensione: ~500 KB - 1 MB
- 🎨 Uso: Computer interattivo sul tavolino

### 3. **Old Sofa** (`old_sofa_free.glb`)
- 🔗 Link: https://sketchfab.com/3d-models/old-sofa-free
- 📦 Download come: `old_sofa_free.glb`
- 📏 Dimensione: ~2-3 MB
- 🎨 Uso: Divano nella camera

### 4. **Chocolate Beech Bookshelf** (`chocolate_beech_bookshelf_free.glb`)
- 🔗 Link: https://sketchfab.com/3d-models/chocolate-beech-bookshelf-free
- 📦 Download come: `chocolate_beech_bookshelf_free.glb`
- 📏 Dimensione: ~1-2 MB
- 🎨 Uso: Libreria a destra

### 5. **Vintage TV** (`vintage_tv_free.glb`)
- 🔗 Link: https://sketchfab.com/3d-models/vintage-tv-free
- 📦 Download come: `vintage_tv_free.glb`
- 📏 Dimensione: ~1 MB
- 🎨 Uso: TV vintage di fronte al divano

### 6. **Dusty Old Bookshelf** (`dusty_old_bookshelf_free.glb`)
- 🔗 Link: https://sketchfab.com/3d-models/dusty-old-bookshelf-free
- 📦 Download come: `dusty_old_bookshelf_free.glb`
- 📏 Dimensione: ~2 MB
- 🎨 Uso: Seconda libreria

---

## 📥 Come Scaricare

1. Visita i link sopra
2. Cerca modelli simili (bench, laptop, sofa, bookshelf, TV)
3. Scarica in formato **GLB** (preferito) o **GLTF**
4. Rinomina i file con i nomi esatti sopra
5. Posiziona i file `.glb` in questa cartella

---

## 🆓 Alternative Gratuite (Siti Consigliati)

Se i link specifici non funzionano, cerca modelli gratuiti su:

### **Sketchfab** (⭐ Consigliato)
- URL: https://sketchfab.com/
- Filtro: "Downloadable" + "Free"
- Formato: GLB/GLTF
- Licenza: CC BY (attribution)

### **Poly Pizza**
- URL: https://poly.pizza/
- Modelli low-poly ottimi per giochi
- Formato: GLB
- Licenza: CC0 (public domain)

### **Quaternius**
- URL: https://quaternius.com/
- Collezioni complete gratuite
- Stile: Low-poly cartoon
- Licenza: CC0

### **cgtrader.com/free-3d-models**
- URL: https://www.cgtrader.com/free-3d-models
- Filtro: "Free" + "GLB/GLTF"
- Molte opzioni disponibili

---

## 🔧 Requisiti Tecnici

- **Formato**: `.glb` (preferito) o `.gltf`
- **Dimensione**: Max 5 MB per modello
- **Texture**: Embedded (incluse nel GLB)
- **Poligoni**: Max 50k triangoli per performance

---

## 🚀 Dopo il Download

1. Posiziona tutti i `.glb` in questa cartella
2. Verifica che i nomi corrispondano esattamente
3. Fai il deploy sul server:
   ```bash
   git add frontend/public/models/*.glb
   git commit -m "Add 3D models for Maze Runner"
   git push origin main
   ```
4. Sul server:
   ```bash
   ssh root@207.154.218.16 "cd /var/www/shappa && git pull && pm2 restart shappa"
   ```

---

## ✅ Checklist

- [ ] bench_model_free.glb
- [ ] laptop_free.glb
- [ ] old_sofa_free.glb
- [ ] chocolate_beech_bookshelf_free.glb
- [ ] vintage_tv_free.glb
- [ ] dusty_old_bookshelf_free.glb

---

## 🐛 Troubleshooting

### I modelli non si vedono (rettangoli neri)
✅ **Soluzione**:
- Verifica che i modelli abbiano texture embedded
- Controlla che il file sia `.glb` (non `.gltf` separato)
- Controlla la console browser per errori 404
- Verifica i MIME types nel server.js (già configurato)

### Modelli troppo grandi/piccoli
✅ **Soluzione**:
- Il codice normalizza automaticamente le dimensioni
- Non serve modificare la scala manualmente

### Performance lente
✅ **Soluzione**:
- Usa modelli low-poly (<50k triangoli)
- Verifica che le texture siano compresse
- Limita le dimensioni texture a 1024x1024 px

---

## 📝 Note Licenze

Quando scarichi modelli, verifica sempre:
- ✅ Licenza CC BY: OK per uso commerciale (con attribuzione)
- ✅ Licenza CC0: OK per uso commerciale (nessuna attribuzione)
- ❌ Licenza NC (Non-Commercial): Solo uso personale

Per attribuzione, aggiungi i crediti in `README.md` del progetto.
