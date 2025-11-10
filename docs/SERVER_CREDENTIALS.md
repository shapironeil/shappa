# 🔐 Credenziali Server - Documentazione

## 📋 Informazioni Server

- **Host:** `207.154.218.16`
- **User SSH:** `root` (o `deploy` se configurato)
- **Path Deploy:** `/var/www/shappa`
- **Chiave SSH:** `id_ed25519` (o `github_deploy_key`)
- **PM2 App:** `shappa`
- **Porta:** `3000`
- **Proxy:** Nginx (443 → 3000)

---

## 🚀 Comandi Rapid Server

### PM2 - Gestione Applicazione

```bash
# Controlla stato
ssh root@207.154.218.16 "pm2 status"

# Vedi logs in tempo reale
ssh root@207.154.218.16 "pm2 logs shappa"

# Restart manuale
ssh root@207.154.218.16 "pm2 restart shappa"

# Riavvio completo (se serve)
ssh root@207.154.218.16 "pm2 stop shappa && cd /var/www/shappa && git pull && pm2 start shappa"

# Vedi ultimi log
ssh root@207.154.218.16 "pm2 logs shappa --lines 50"
```

### Verifica Server

```bash
# Verifica che il server risponda
curl https://207.154.218.16/health

# Verifica PM2
ssh root@207.154.218.16 "pm2 status"

# Verifica directory deploy
ssh root@207.154.218.16 "ls -la /var/www/shappa"
```

### Setup Completo

```bash
# Esegui script verifica setup
ssh root@207.154.218.16 "bash -s" < scripts/verify-server-setup.sh
```

---

## 🔑 Chiave SSH

La chiave SSH si trova in:
- `~/.ssh/id_ed25519` (chiave principale)
- `~/.ssh/github_deploy_key` (chiave per GitHub Actions)

**Per GitHub Secrets serve la chiave PRIVATA completa:**
```bash
# Sul server, come utente deploy
cat ~/.ssh/id_ed25519
# OPPURE
cat ~/.ssh/github_deploy_key
```

---

## 📝 GitHub Secrets Configurazione

| Secret | Valore |
|--------|--------|
| `SSH_PRIVATE_KEY` | (chiave privata completa dal server) |
| `DEPLOY_HOST` | `207.154.218.16` |
| `DEPLOY_USER` | `deploy` |
| `DEPLOY_PATH` | `/var/www/shappa` |

---

## ✅ Verifica Deploy

Dopo il deploy, verifica:

```bash
# Health check
curl https://207.154.218.16/health

# Verifica PM2
ssh root@207.154.218.16 "pm2 status"

# Verifica ultimo deploy
ssh root@207.154.218.16 "cd /var/www/shappa && git log --oneline -1"
```

---

**Tutte le informazioni sono salvate qui per riferimento futuro!** 📚

