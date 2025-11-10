# 🚀 Deploy Ora - Istruzioni Immediate

## ⚡ Setup Veloce (5 minuti)

### 1. Sul Server - Genera Chiave SSH

```bash
ssh root@207.154.218.16
bash scripts/get-ssh-key-for-github.sh
```

**COPIA la chiave PRIVATA completa mostrata (inclusi BEGIN/END)**

### 2. Su GitHub - Configura Secrets

Vai su: **https://github.com/shapironeil/shappa/settings/secrets/actions**

Configura questi 4 secrets:

| Secret | Valore |
|--------|--------|
| `SSH_PRIVATE_KEY` | (chiave privata copiata) |
| `DEPLOY_HOST` | `207.154.218.16` |
| `DEPLOY_USER` | `deploy` |
| `DEPLOY_PATH` | `/var/www/shappa` |

### 3. Test Deploy

Vai su: **https://github.com/shapironeil/shappa/actions**

Clicca "Deploy to DigitalOcean via SSH" → "Run workflow"

---

## ✅ Verifica

Dopo il deploy:
- ✅ Workflow completato con successo
- ✅ Server aggiornato
- ✅ PM2 riavviato
- ✅ App online su porta 3000

---

**Fatto! Ora ogni push su `main` farà deploy automatico.** 🚀
