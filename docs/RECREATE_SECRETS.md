# 🔄 Ricreare Secrets su GitHub

## ⚠️ Nota Importante

**GitHub non mostra mai i valori dei secrets quando li editi** - questo è normale per sicurezza! Anche se vedi un campo vuoto, il secret potrebbe essere configurato.

Tuttavia, se il workflow rileva ancora `length=0`, dobbiamo ricreare i secrets da zero.

---

## ✅ Soluzione: Elimina e Ricrea i Secrets

### Step 1: Elimina i Secrets Esistenti

1. Vai su: https://github.com/shapironeil/shappa/settings/secrets/actions
2. Trova `DEPLOY_HOST` nella lista
3. Clicca sul secret → Clicca **"Delete"** → Conferma
4. Trova `DEPLOY_USER` nella lista
5. Clicca sul secret → Clicca **"Delete"** → Conferma

### Step 2: Crea DEPLOY_HOST da Zero

1. Clicca **"New repository secret"** (pulsante in alto a destra)
2. **Name:** `DEPLOY_HOST` (esatto, tutto maiuscolo con underscore)
3. **Secret:** Inserisci l'IP del server
   - Esempio: `207.154.218.16`
   - **COPIA E INCOLLA** direttamente (non digitare manualmente per evitare errori)
   - **NON** aggiungere spazi prima o dopo
   - **NON** aggiungere virgolette
4. Clicca **"Add secret"**
5. Verifica che appaia nella lista

### Step 3: Crea DEPLOY_USER da Zero

1. Clicca **"New repository secret"** (pulsante in alto a destra)
2. **Name:** `DEPLOY_USER` (esatto, tutto maiuscolo con underscore)
3. **Secret:** Inserisci l'username SSH
   - Esempio: `deploy` (se usi l'utente deploy)
   - Oppure: `root` (se usi root)
   - **COPIA E INCOLLA** direttamente
   - **NON** aggiungere spazi prima o dopo
   - **NON** aggiungere virgolette
4. Clicca **"Add secret"**
5. Verifica che appaia nella lista

---

## 🔍 Verifica i Valori

Dopo aver creato i secrets, verifica che:

- [ ] `DEPLOY_HOST` appare nella lista secrets
- [ ] `DEPLOY_USER` appare nella lista secrets
- [ ] Entrambi hanno un'icona di "occhio" (indicano che hanno un valore)
- [ ] Quando clicchi "Edit", vedi asterischi `***` (non un campo completamente vuoto)

**Nota:** Se vedi asterischi quando editi, il secret è configurato correttamente!

---

## 🧪 Test il Deploy

Dopo aver ricreato i secrets:

1. Vai su: https://github.com/shapironeil/shappa/actions
2. Clicca su "Deploy to DigitalOcean via SSH"
3. Clicca "Run workflow" → "Run workflow"
4. Controlla i log - dovresti vedere:
   ```
   ✅ DEPLOY_HOST: configured (length: 15 chars, value: 207***)
   ✅ DEPLOY_USER: configured (length: 6 chars, value: deploy)
   ```

---

## ⚠️ Se Ancora Non Funziona

Se dopo aver ricreato i secrets risultano ancora vuoti:

1. **Attendi 1-2 minuti** - GitHub potrebbe aver bisogno di tempo per propagare i secrets
2. **Verifica il nome esatto:**
   - `DEPLOY_HOST` (non `Deploy_Host` o `deploy_host`)
   - `DEPLOY_USER` (non `Deploy_User` o `deploy_user`)
3. **Verifica che non ci siano spazi nel nome:**
   - `DEPLOY_HOST` (non `DEPLOY_HOST ` con spazio finale)
4. **Prova a creare un secret di test:**
   - Crea `TEST_SECRET` con valore `test123`
   - Se anche questo risulta vuoto, potrebbe esserci un problema con GitHub Actions

---

## 📋 Valori da Usare

Se non ricordi i valori corretti:

- **DEPLOY_HOST:** IP del server DigitalOcean (es: `207.154.218.16`)
- **DEPLOY_USER:** Username SSH configurato sul server (es: `deploy` o `root`)
- **DEPLOY_PATH:** Path di deploy (es: `/var/www/shappa`)

---

**Dopo aver ricreato i secrets, il deploy dovrebbe funzionare!** 🚀

