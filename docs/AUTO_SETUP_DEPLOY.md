# 🚀 Setup Automatico Deploy - Guida Completa

## 🎯 Obiettivo

Configurare completamente il deploy automatico GitHub Actions in **2 passi semplici**.

---

## 📋 Passo 1: Setup sul Server (5 minuti)

### Connettiti al server e esegui lo script:

```bash
# Connettiti al server
ssh root@207.154.218.16

# Scarica ed esegui lo script di setup
cd /tmp
curl -O https://raw.githubusercontent.com/shapironeil/shappa/main/scripts/setup-deploy-complete.sh
# OPPURE se hai già il file localmente:
bash scripts/setup-deploy-complete.sh
```

**Lo script fa automaticamente:**
- ✅ Crea utente `deploy` (se non esiste)
- ✅ Crea directory `/var/www/shappa` (se non esiste)
- ✅ Genera chiave SSH per GitHub Actions
- ✅ Configura permessi corretti
- ✅ **Mostra la chiave privata da copiare**

**⚠️ IMPORTANTE:** Copia l'intera chiave privata mostrata dallo script!

---

## 📋 Passo 2: Configura Secrets GitHub (3 minuti)

### Opzione A: Con GitHub CLI (Automatico)

```powershell
# Installa GitHub CLI (se non ce l'hai)
winget install --id GitHub.cli

# Autenticati
gh auth login

# Esegui lo script con la chiave SSH
# (sostituisci 'CHIAVE_PRIVATA' con quella copiata dal server)
.\scripts\setup-github-secrets-auto.ps1 -SshKeyContent "CHIAVE_PRIVATA"
```

### Opzione B: Manuale (Più Sicuro)

1. Vai su: **https://github.com/shapironeil/shappa/settings/secrets/actions**

2. Aggiungi questi 4 secrets (clicca "New repository secret" per ognuno):

| Nome Secret | Valore |
|-------------|--------|
| `SSH_PRIVATE_KEY` | (chiave privata copiata dal server) |
| `DEPLOY_HOST` | `207.154.218.16` |
| `DEPLOY_USER` | `deploy` |
| `DEPLOY_PATH` | `/var/www/shappa` |

---

## ✅ Verifica

1. **Verifica Secrets:**
   - https://github.com/shapironeil/shappa/settings/secrets/actions
   - Dovresti vedere tutti e 4 i secrets ✅

2. **Testa Deploy:**
   - https://github.com/shapironeil/shappa/actions
   - "Deploy to DigitalOcean via SSH" → "Run workflow"
   - Il deploy dovrebbe completarsi con successo ✅

---

## 🎉 Fatto!

Dopo questi 2 passi, ogni push su `main` triggererà automaticamente il deploy! 🚀

**Ora puoi concentrarti su Figma e lasciare che il sistema gestisca il deploy automaticamente.** ✨

