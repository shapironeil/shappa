# 🚨 Fix: Secrets Vuoti nel Workflow

## ❌ Errore Attuale

```
usage: ssh [-46AaCfGgKkMNnqsTtVvXxYy] ...
Error: Process completed with exit code 255.
```

Il comando SSH viene eseguito come:
```bash
ssh -o StrictHostKeyChecking=no @ "echo 'SSH connection successful'"
```

**Problema:** I secrets `DEPLOY_USER` e `DEPLOY_HOST` sono **vuoti** o **non configurati**.

---

## ✅ Soluzione Immediata

### 1. Verifica Secrets su GitHub

Vai su: **https://github.com/shapironeil/shappa/settings/secrets/actions**

Devi vedere questi 4 secrets:

| Secret | Valore Atteso | Stato |
|--------|---------------|-------|
| `SSH_PRIVATE_KEY` | (chiave privata completa) | ❓ |
| `DEPLOY_HOST` | `207.154.218.16` | ❓ |
| `DEPLOY_USER` | `deploy` | ❓ |
| `DEPLOY_PATH` | `/var/www/shappa` | ❓ |

### 2. Se un Secret è Mancante o Vuoto

#### A. Configura `DEPLOY_HOST`

1. Clicca su `DEPLOY_HOST` (o "New repository secret" se non esiste)
2. **Nome:** `DEPLOY_HOST`
3. **Valore:** `207.154.218.16`
4. Clicca "Update secret"

#### B. Configura `DEPLOY_USER`

1. Clicca su `DEPLOY_USER` (o "New repository secret" se non esiste)
2. **Nome:** `DEPLOY_USER`
3. **Valore:** `deploy`
4. Clicca "Update secret"

#### C. Configura `DEPLOY_PATH`

1. Clicca su `DEPLOY_PATH` (o "New repository secret" se non esiste)
2. **Nome:** `DEPLOY_PATH`
3. **Valore:** `/var/www/shappa`
4. Clicca "Update secret"

#### D. Configura `SSH_PRIVATE_KEY`

Se manca anche questo:

1. **Sul server**, genera la chiave:
```bash
ssh root@207.154.218.16
bash scripts/get-ssh-key-for-github.sh
```

2. **Copia la chiave PRIVATA completa** (inclusi BEGIN/END)

3. **Su GitHub**, aggiungi il secret:
   - **Nome:** `SSH_PRIVATE_KEY`
   - **Valore:** (incolla la chiave copiata)
   - Clicca "Add secret"

---

## 🔍 Verifica Rapida

Dopo aver configurato tutti i secrets, il workflow ora include un **step di validazione** che:

1. ✅ Verifica che tutti i secrets esistano
2. ✅ Mostra i valori (senza esporre SSH_PRIVATE_KEY)
3. ✅ Fornisce link diretto per configurare secrets mancanti

Se un secret è vuoto, vedrai un errore chiaro come:
```
❌ ERROR: DEPLOY_HOST secret is missing!
   Configure it at: https://github.com/shapironeil/shappa/settings/secrets/actions
```

---

## 📋 Checklist Completa

- [ ] `SSH_PRIVATE_KEY` configurato (chiave privata completa)
- [ ] `DEPLOY_HOST` = `207.154.218.16`
- [ ] `DEPLOY_USER` = `deploy`
- [ ] `DEPLOY_PATH` = `/var/www/shappa`
- [ ] Tutti i secrets visibili su GitHub (anche se non puoi vedere i valori)
- [ ] Workflow rieseguito dopo la configurazione

---

## 🚀 Test

Dopo aver configurato tutti i secrets:

1. Vai su: **https://github.com/shapironeil/shappa/actions**
2. Clicca "Deploy to DigitalOcean via SSH"
3. Clicca "Run workflow"
4. Verifica che lo step "Validate secrets" passi ✅

---

**Fatto! Il deploy dovrebbe funzionare ora.** 🎉

