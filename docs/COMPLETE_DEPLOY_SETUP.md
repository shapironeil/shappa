# 🚀 Setup Completo Deploy - Guida Definitiva

## 📋 Credenziali Server

- **Host:** `207.154.218.16`
- **User SSH:** `deploy` (consigliato) o `root`
- **Path Deploy:** `/var/www/shappa`
- **Chiave SSH:** `id_ed25519` (o `github_deploy_key`)
- **PM2 App:** `shappa`
- **Porta:** `3000`

---

## ✅ Passo 1: Ottieni Chiave SSH Privata

### Sul Server:

```bash
# Connettiti al server
ssh root@207.154.218.16

# Esegui script per ottenere chiave
bash scripts/get-ssh-key-for-github.sh

# OPPURE manualmente:
su - deploy
cat ~/.ssh/id_ed25519
# Se non esiste id_ed25519:
cat ~/.ssh/github_deploy_key
```

**⚠️ COPIA la chiave PRIVATA completa (inclusi BEGIN/END)!**

---

## ✅ Passo 2: Configura GitHub Secrets

Vai su: **https://github.com/shapironeil/shappa/settings/secrets/actions**

Configura questi 4 secrets:

| Secret | Valore |
|--------|--------|
| `SSH_PRIVATE_KEY` | (chiave privata copiata dal server) |
| `DEPLOY_HOST` | `207.154.218.16` |
| `DEPLOY_USER` | `deploy` |
| `DEPLOY_PATH` | `/var/www/shappa` |

---

## ✅ Passo 3: Verifica Setup Server

```bash
# Sul server
ssh root@207.154.218.16
bash scripts/verify-server-setup.sh
```

Questo script verifica:
- ✅ Utente deploy esiste
- ✅ Directory `/var/www/shappa` esiste
- ✅ Chiave SSH generata
- ✅ PM2 installato
- ✅ Nginx configurato

---

## ✅ Passo 4: Test Deploy

Dopo aver configurato i secrets, il deploy partirà automaticamente ad ogni push.

**Test manuale:**
- Vai su: https://github.com/shapironeil/shappa/actions
- "Deploy to DigitalOcean via SSH" → "Run workflow"

---

## 🐛 Troubleshooting

### Exit Code 255

**Causa:** Chiave SSH non valida o incompleta

**Soluzione:**
```bash
# Sul server
bash scripts/fix-ssh-key.sh
# Copia la chiave COMPLETA mostrata
# Aggiorna SSH_PRIVATE_KEY su GitHub
```

### Permission Denied

**Causa:** Chiave pubblica non in authorized_keys

**Soluzione:**
```bash
# Sul server, come deploy
cat ~/.ssh/id_ed25519.pub >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

---

## 📝 Comandi Utili Server

```bash
# PM2 Status
ssh root@207.154.218.16 "pm2 status"

# PM2 Logs
ssh root@207.154.218.16 "pm2 logs shappa"

# Restart App
ssh root@207.154.218.16 "pm2 restart shappa"

# Health Check
curl https://207.154.218.16/health
```

---

**Dopo il setup, ogni push su `main` farà deploy automatico!** 🚀

