# ⚡ Setup Secrets GitHub - Guida Rapida (5 minuti)

## 🎯 Valori da Configurare

- **DEPLOY_HOST:** `207.154.218.16`
- **DEPLOY_USER:** `deploy`
- **DEPLOY_PATH:** `/var/www/shappa`
- **SSH_PRIVATE_KEY:** (da generare sul server)

---

## 🚀 Metodo Veloce

### 1. Genera Chiave SSH sul Server

```bash
# Connettiti al server
ssh root@207.154.218.16

# Esegui questo script (o i comandi manualmente)
bash <(curl -s https://raw.githubusercontent.com/shapironeil/shappa/main/scripts/generate-ssh-key.sh)

# OPPURE manualmente:
su - deploy
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/github_deploy_key -N ""
cat ~/.ssh/github_deploy_key.pub >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/github_deploy_key ~/.ssh/authorized_keys
cat ~/.ssh/github_deploy_key  # COPIA QUESTO
```

### 2. Configura su GitHub

Vai su: **https://github.com/shapironeil/shappa/settings/secrets/actions**

Aggiungi questi 4 secrets:

| Nome | Valore |
|------|--------|
| `SSH_PRIVATE_KEY` | (chiave privata copiata dal server) |
| `DEPLOY_HOST` | `207.154.218.16` |
| `DEPLOY_USER` | `deploy` |
| `DEPLOY_PATH` | `/var/www/shappa` |

### 3. Testa Deploy

Vai su: **https://github.com/shapironeil/shappa/actions** → "Run workflow"

---

**Fatto! Il deploy funzionerà automaticamente.** ✅

