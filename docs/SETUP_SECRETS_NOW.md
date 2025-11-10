# 🚀 Configurazione Secrets GitHub - Guida Rapida

## ✅ Valori Confermati

- **DEPLOY_HOST:** `207.154.218.16`
- **DEPLOY_USER:** `deploy` (consigliato)
- **DEPLOY_PATH:** `/var/www/shappa`

---

## 📋 Passo 1: Genera Chiave SSH sul Server

Connettiti al server come root e genera la chiave SSH per l'utente deploy:

```bash
# Connettiti al server
ssh root@207.154.218.16

# Verifica che l'utente deploy esista, altrimenti crealo
id deploy || (adduser deploy && usermod -aG sudo deploy)

# Passa all'utente deploy
su - deploy

# Genera chiave SSH per GitHub Actions (senza passphrase)
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/github_deploy_key -N ""

# Aggiungi chiave pubblica ad authorized_keys
cat ~/.ssh/github_deploy_key.pub >> ~/.ssh/authorized_keys

# Imposta permessi corretti
chmod 600 ~/.ssh/github_deploy_key
chmod 600 ~/.ssh/authorized_keys
chmod 700 ~/.ssh

# Mostra chiave privata (COPIA QUESTO INTERAMENTE)
cat ~/.ssh/github_deploy_key
```

**⚠️ IMPORTANTE:** Copia TUTTO il contenuto della chiave privata, incluse le righe:
- `-----BEGIN OPENSSH PRIVATE KEY-----`
- `-----END OPENSSH PRIVATE KEY-----`

---

## 📋 Passo 2: Configura Secrets su GitHub

1. Vai su: **https://github.com/shapironeil/shappa/settings/secrets/actions**

2. Clicca **"New repository secret"** per ogni secret:

### Secret 1: `SSH_PRIVATE_KEY`
- **Nome:** `SSH_PRIVATE_KEY` (esatto, case-sensitive)
- **Valore:** Incolla l'intera chiave privata copiata dal server

### Secret 2: `DEPLOY_HOST`
- **Nome:** `DEPLOY_HOST`
- **Valore:** `207.154.218.16`

### Secret 3: `DEPLOY_USER`
- **Nome:** `DEPLOY_USER`
- **Valore:** `deploy`

### Secret 4: `DEPLOY_PATH`
- **Nome:** `DEPLOY_PATH`
- **Valore:** `/var/www/shappa`

---

## ✅ Passo 3: Verifica

1. Torna su: https://github.com/shapironeil/shappa/settings/secrets/actions
2. Dovresti vedere tutti e 4 i secrets elencati:
   - ✅ `SSH_PRIVATE_KEY`
   - ✅ `DEPLOY_HOST`
   - ✅ `DEPLOY_USER`
   - ✅ `DEPLOY_PATH`

---

## 🚀 Passo 4: Testa il Deploy

1. Vai su: https://github.com/shapironeil/shappa/actions
2. Seleziona **"Deploy to DigitalOcean via SSH"**
3. Clicca **"Run workflow"** → **"Run workflow"**
4. Il deploy dovrebbe partire e completarsi con successo ✅

---

## 🐛 Troubleshooting

### Errore: "Permission denied (publickey)"

**Soluzione:**
```bash
# Sul server, come utente deploy
ssh deploy@207.154.218.16
cat ~/.ssh/github_deploy_key.pub >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
chmod 700 ~/.ssh
```

### Errore: "User deploy does not exist"

**Soluzione:**
```bash
# Come root sul server
adduser deploy
usermod -aG sudo deploy
# Poi ripeti il Passo 1
```

### Errore: "Directory /var/www/shappa does not exist"

**Soluzione:**
```bash
# Come root sul server
mkdir -p /var/www/shappa
chown deploy:deploy /var/www/shappa
```

---

**Una volta configurati i secrets, il deploy funzionerà automaticamente ad ogni push su `main`!** 🚀

