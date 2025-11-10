# 🚀 Deploy Automatico - README

## ✅ Stato Attuale

**Tutto è pronto per il deploy automatico!**

- ✅ Problemi codice risolti (MongoDB e Puppeteer opzionali)
- ✅ Script di setup creati
- ✅ Guide complete disponibili

**Manca solo:** Configurare i secrets GitHub (5 minuti)

---

## 🎯 Setup Rapido (2 Passi)

### 1️⃣ Setup Server

```bash
ssh root@207.154.218.16
bash scripts/setup-deploy-complete.sh
# Copia la chiave privata mostrata
```

### 2️⃣ Configura GitHub

Vai su: https://github.com/shapironeil/shappa/settings/secrets/actions

Aggiungi:
- `SSH_PRIVATE_KEY` = (chiave copiata)
- `DEPLOY_HOST` = `207.154.218.16`
- `DEPLOY_USER` = `deploy`
- `DEPLOY_PATH` = `/var/www/shappa`

---

## 📚 Guide Disponibili

- `SETUP_DEPLOY.md` - Guida principale
- `docs/AUTO_SETUP_DEPLOY.md` - Guida completa
- `docs/SETUP_SECRETS_NOW.md` - Guida rapida
- `docs/QUICK_SETUP_SECRETS.md` - Guida veloce

---

**Dopo il setup, ogni push su `main` deployerà automaticamente!** 🚀

