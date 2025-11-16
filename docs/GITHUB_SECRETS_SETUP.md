# 🔐 Guida Configurazione GitHub Secrets

## Problema: "The ssh-private-key argument is empty"

Questo errore significa che il secret `SSH_PRIVATE_KEY` non è configurato nel repository GitHub.

---

## 📋 Passo 1: Configurare i Secrets su GitHub

### 1. Vai su GitHub Repository Settings

1. Vai su: https://github.com/shapironeil/shappa
2. Clicca su **Settings** (in alto a destra)
3. Nel menu a sinistra, clicca su **Secrets and variables** → **Actions**
4. Clicca su **New repository secret**

### 2. Aggiungi i 4 Secrets Richiesti

Devi aggiungere questi 4 secrets:

#### Secret 1: `SSH_PRIVATE_KEY`

**Nome:** `SSH_PRIVATE_KEY`

**Valore:** La chiave privata SSH per accedere al server

**Come ottenerla:**

**Opzione A: Se hai già una chiave SSH sul server**
```bash
# Connettiti al server
ssh deploy@shapiro.ninja  # o l'IP del server

# Mostra la chiave privata esistente
cat ~/.ssh/id_rsa
# oppure
cat ~/.ssh/id_ed25519
```

**Opzione B: Genera una nuova chiave SSH**
```bash
# Sul server DigitalOcean
ssh deploy@shapiro.ninja

# Genera nuova chiave SSH (senza passphrase)
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/github_deploy_key -N ""

# Aggiungi chiave pubblica ad authorized_keys
cat ~/.ssh/github_deploy_key.pub >> ~/.ssh/authorized_keys

# Mostra chiave privata (COPIA QUESTO INTERAMENTE)
cat ~/.ssh/github_deploy_key
```

**⚠️ IMPORTANTE:**
- Copia l'intero contenuto della chiave privata, incluse le righe `-----BEGIN OPENSSH PRIVATE KEY-----` e `-----END OPENSSH PRIVATE KEY-----`
- Non includere spazi extra o caratteri aggiuntivi
- Incolla esattamente come appare nel file

#### Secret 2: `DEPLOY_HOST`

**Nome:** `DEPLOY_HOST`

**Valore:** L'IP o hostname del server DigitalOcean

**Esempi:**
- `shapiro.ninja`
- `164.90.xxx.xxx` (IP del server)

#### Secret 3: `DEPLOY_USER`

**Nome:** `DEPLOY_USER`

**Valore:** L'username SSH sul server

**Esempi:**
- `deploy`
- `root`
- `ubuntu`

#### Secret 4: `DEPLOY_PATH`

**Nome:** `DEPLOY_PATH`

**Valore:** La directory dove si trova il progetto sul server

**Esempi:**
- `/var/www/shappa`
- `/home/deploy/shappa`
- `/opt/shappa`

---

## 📋 Passo 2: Verifica che i Secrets siano Configurati

1. Vai su: https://github.com/shapironeil/shappa/settings/secrets/actions
2. Dovresti vedere tutti e 4 i secrets elencati:
   - ✅ `SSH_PRIVATE_KEY`
   - ✅ `DEPLOY_HOST`
   - ✅ `DEPLOY_USER`
   - ✅ `DEPLOY_PATH`

**⚠️ Nota:** I secrets sono nascosti per sicurezza, quindi vedrai solo il nome, non il valore.

---

## 📋 Passo 3: Testa la Connessione SSH Manualmente

Prima di usare GitHub Actions, verifica che la chiave SSH funzioni:

```bash
# Sul tuo computer locale (se hai la chiave SSH)
ssh -i ~/.ssh/github_deploy_key deploy@shapiro.ninja

# Dovresti essere in grado di connetterti senza password
```

---

## 📋 Passo 4: Triggera il Deploy

Dopo aver configurato i secrets:

1. Vai su: https://github.com/shapironeil/shappa/actions
2. Seleziona "Deploy to DigitalOcean via SSH"
3. Clicca "Run workflow" → "Run workflow"
4. Il workflow dovrebbe partire e completarsi con successo

---

## 🐛 Troubleshooting

### Errore: "Permission denied (publickey)"

**Causa:** La chiave pubblica non è in `authorized_keys` sul server.

**Soluzione:**
```bash
# Sul server
ssh deploy@shapiro.ninja

# Aggiungi chiave pubblica
cat ~/.ssh/github_deploy_key.pub >> ~/.ssh/authorized_keys

# Verifica permessi
chmod 600 ~/.ssh/authorized_keys
chmod 700 ~/.ssh
```

### Errore: "Host key verification failed"

**Causa:** Il server non è in `known_hosts`.

**Soluzione:** Il workflow usa `-o StrictHostKeyChecking=no` per evitare questo problema.

### Errore: "Connection refused"

**Causa:** Il server non è raggiungibile o la porta SSH (22) è bloccata.

**Soluzione:**
- Verifica che il server sia online
- Verifica che la porta 22 sia aperta nel firewall
- Verifica che `DEPLOY_HOST` sia corretto

### Errore: "No such file or directory" (DEPLOY_PATH)

**Causa:** La directory `DEPLOY_PATH` non esiste sul server.

**Soluzione:**
```bash
# Sul server
ssh deploy@shapiro.ninja

# Crea la directory
sudo mkdir -p /var/www/shappa
sudo chown -R deploy:deploy /var/www/shappa
```

---

## 🔗 Link Utili

- GitHub Secrets: https://github.com/shapironeil/shappa/settings/secrets/actions
- GitHub Actions: https://github.com/shapironeil/shappa/actions
- Documentazione SSH: https://docs.github.com/en/authentication/connecting-to-github-with-ssh

---

## ✅ Checklist Completa

- [ ] Secret `SSH_PRIVATE_KEY` configurato su GitHub
- [ ] Secret `DEPLOY_HOST` configurato su GitHub
- [ ] Secret `DEPLOY_USER` configurato su GitHub
- [ ] Secret `DEPLOY_PATH` configurato su GitHub
- [ ] Chiave pubblica SSH aggiunta a `authorized_keys` sul server
- [ ] Test connessione SSH manuale riuscito
- [ ] Workflow GitHub Actions eseguito con successo










