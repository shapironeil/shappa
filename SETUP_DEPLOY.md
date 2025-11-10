# 🚀 Setup Deploy Automatico - Tutto Pronto

## ✅ Cosa Ho Preparato

Ho creato tutto il necessario per configurare il deploy automatico. Tu devi solo eseguire **2 comandi**.

---

## 📋 Passo 1: Setup sul Server (1 comando)

**Connettiti al server e esegui:**

```bash
ssh root@207.154.218.16 "bash -s" < scripts/setup-deploy-complete.sh
```

**OPPURE se preferisci copiare lo script:**

```bash
ssh root@207.154.218.16
cd /tmp
# Copia il contenuto di scripts/setup-deploy-complete.sh qui
bash setup-deploy-complete.sh
```

**Lo script farà automaticamente:**
- ✅ Crea utente `deploy`
- ✅ Crea directory `/var/www/shappa`
- ✅ Genera chiave SSH
- ✅ **Mostra la chiave privata da copiare**

**⚠️ COPIA la chiave privata mostrata!**

---

## 📋 Passo 2: Configura GitHub Secrets (1 click)

### Vai su GitHub e aggiungi i secrets:

**Link diretto:** https://github.com/shapironeil/shappa/settings/secrets/actions

**Aggiungi questi 4 secrets:**

1. **SSH_PRIVATE_KEY**
   - Nome: `SSH_PRIVATE_KEY`
   - Valore: (chiave privata copiata dal server)

2. **DEPLOY_HOST**
   - Nome: `DEPLOY_HOST`
   - Valore: `207.154.218.16`

3. **DEPLOY_USER**
   - Nome: `DEPLOY_USER`
   - Valore: `deploy`

4. **DEPLOY_PATH**
   - Nome: `DEPLOY_PATH`
   - Valore: `/var/www/shappa`

---

## ✅ Verifica

1. Verifica secrets: https://github.com/shapironeil/shappa/settings/secrets/actions
2. Testa deploy: https://github.com/shapironeil/shappa/actions → "Run workflow"

---

## 🎉 Fatto!

**Ora ogni push su `main` triggererà automaticamente il deploy!**

Puoi concentrarti su Figma, il sistema gestisce tutto il resto. 🚀

---

## 📁 File Creati

- `scripts/setup-deploy-complete.sh` - Script setup server
- `scripts/setup-github-secrets-auto.ps1` - Script setup secrets (opzionale)
- `docs/AUTO_SETUP_DEPLOY.md` - Guida completa
- `docs/SETUP_SECRETS_NOW.md` - Guida rapida
- `docs/QUICK_SETUP_SECRETS.md` - Guida veloce

