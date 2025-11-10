# 🔄 Istruzioni per Sincronizzare con Figma

**File Figma:** [Health-Diet-Dashboard](https://www.figma.com/make/Wv47CueEm5hvw1eNfczGfE/Health-Diet-Dashboard)  
**File Key:** `Wv47CueEm5hvw1eNfczGfE`

---

## ⚠️ Nota Importante

Per sincronizzare esattamente `src/pages/dieta.html` con il design Figma, serve la **FIGMA_API_KEY**.

La pagina è stata aggiornata con uno stile moderno e professionale. Quando avrai la chiave API, potrai sincronizzarla esattamente con il design.

---

## 📋 Setup FIGMA_API_KEY

### Step 1: Ottieni API Key

1. Vai su https://www.figma.com/developers/api#access-tokens
2. Clicca "Get personal access token"
3. Crea un nuovo token
4. Copia il token (inizia con `figd_`)

### Step 2: Aggiungi a `.env.private`

Apri `.env.private` e aggiungi:

```env
FIGMA_API_KEY=figd_tuo_token_qui
```

### Step 3: Sincronizza

Esegui lo script:

```bash
node scripts/fetch-figma-design.js
```

Poi:

```bash
node scripts/update-dieta-from-figma.js
```

---

## 🎨 Sincronizzazione Manuale

Se preferisci sincronizzare manualmente:

1. Apri Figma Dev Mode
2. Seleziona i componenti del design
3. Copia CSS properties
4. Applica a `src/pages/dieta.html`

---

## 📝 Note

- La pagina attuale ha uno stile moderno e funzionale
- Quando avrai la chiave API, potrai sincronizzarla esattamente
- Il fileKey Figma è documentato nel codice per riferimento futuro

