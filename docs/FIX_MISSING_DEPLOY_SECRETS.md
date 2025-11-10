# 🔧 Fix: Secrets DEPLOY_HOST e DEPLOY_USER Mancanti

## ❌ Problema

Il workflow GitHub Actions rileva che i seguenti secrets non sono configurati:
- `DEPLOY_HOST` - IP o hostname del server
- `DEPLOY_USER` - Username SSH per il deploy

## ✅ Soluzione: Configura i Secrets su GitHub

### Step 1: Vai alle Impostazioni Secrets

1. Vai su: https://github.com/shapironeil/shappa/settings/secrets/actions
2. Clicca su **"New repository secret"** per ogni secret mancante

### Step 2: Configura DEPLOY_HOST

1. **Name:** `DEPLOY_HOST`
2. **Secret:** Inserisci l'IP del tuo server
   - Esempio: `207.154.218.16` (sostituisci con il tuo IP)
   - Oppure: `shapiro.ninja` (se hai un dominio)
3. Clicca **"Add secret"**

### Step 3: Configura DEPLOY_USER

1. **Name:** `DEPLOY_USER`
2. **Secret:** Inserisci l'username SSH
   - Esempio: `deploy` (consigliato)
   - Oppure: `root` (se usi root)
3. Clicca **"Add secret"**

---

## 📋 Checklist Secrets Richiesti

Assicurati di avere tutti questi secrets configurati:

- [x] `SSH_PRIVATE_KEY` - ✅ Già configurato (419 chars)
- [ ] `DEPLOY_HOST` - ❌ **MANCANTE** - Configura ora!
- [ ] `DEPLOY_USER` - ❌ **MANCANTE** - Configura ora!
- [x] `DEPLOY_PATH` - ✅ Già configurato

---

## 🔍 Verifica Valori Corretti

### DEPLOY_HOST
- **Valore atteso:** IP del server DigitalOcean
- **Esempio:** `207.154.218.16`
- **Come verificare:** Controlla il tuo server DigitalOcean o usa il comando:
  ```bash
  # Se hai accesso SSH al server
  curl ifconfig.me
  ```

### DEPLOY_USER
- **Valore atteso:** Username SSH configurato sul server
- **Esempio:** `deploy` (se hai creato l'utente deploy)
- **Esempio:** `root` (se usi root)
- **Come verificare:** Controlla quale utente hai configurato per SSH

---

## 🚀 Dopo la Configurazione

1. **Salva tutti i secrets**
2. **Riprova il deploy:**
   - Vai su: https://github.com/shapironeil/shappa/actions
   - Clicca su "Run workflow" → "Run workflow"
   - Oppure fai un nuovo commit e push

---

## ⚠️ Nota Importante

**NON committare mai questi valori nel codice!** Usa sempre GitHub Secrets per informazioni sensibili.

---

**Dopo aver configurato i secrets, il deploy funzionerà automaticamente!** 🎉

