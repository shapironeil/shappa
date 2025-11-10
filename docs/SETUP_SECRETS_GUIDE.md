# 🔐 Guida Completa: Configurare GitHub Secrets

## ⚠️ Cosa Ti Serve

Per configurare i secrets GitHub, ti servono:

1. **Accesso SSH al server** (per generare/ottenere la chiave SSH)
2. **GitHub CLI installato** (opzionale, ma più facile)
3. **I seguenti valori:**
   - Hostname/IP del server
   - Username SSH
   - Path del progetto sul server

---

## 🚀 Metodo 1: Script Automatico (Consigliato)

### Prerequisiti

1. **Installa GitHub CLI:**
   ```powershell
   winget install --id GitHub.cli
   # oppure scarica da: https://cli.github.com/
   ```

2. **Autenticati:**
   ```powershell
   gh auth login
   ```

3. **Esegui lo script:**
   ```powershell
   .\scripts\setup-github-secrets.ps1
   ```

Lo script ti guiderà passo-passo nella configurazione di tutti i secrets.

---

## 📝 Metodo 2: Configurazione Manuale

### Passo 1: Ottieni la Chiave SSH

**Opzione A: Se hai già accesso SSH al server**

```bash
# Connettiti al server
ssh deploy@shapiro.ninja

# Se hai già una chiave SSH, mostra il contenuto
cat ~/.ssh/id_ed25519
# oppure
cat ~/.ssh/id_rsa
```

**Opzione B: Genera una nuova chiave SSH**

```bash
# Connettiti al server
ssh deploy@shapiro.ninja

# Genera nuova chiave SSH (senza passphrase)
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/github_deploy_key -N ""

# Aggiungi chiave pubblica ad authorized_keys
cat ~/.ssh/github_deploy_key.pub >> ~/.ssh/authorized_keys

# Mostra chiave privata (COPIA QUESTO INTERAMENTE)
cat ~/.ssh/github_deploy_key
```

**⚠️ IMPORTANTE:**
- Copia TUTTO il contenuto, incluse le righe `-----BEGIN...` e `-----END...`
- Non includere spazi extra o caratteri aggiuntivi

### Passo 2: Configura Secrets su GitHub

1. Vai su: https://github.com/shapironeil/shappa/settings/secrets/actions
2. Clicca **"New repository secret"** per ogni secret

#### Secret 1: `SSH_PRIVATE_KEY`
- **Nome:** `SSH_PRIVATE_KEY` (esatto, case-sensitive)
- **Valore:** Incolla l'intera chiave privata copiata sopra

#### Secret 2: `DEPLOY_HOST`
- **Nome:** `DEPLOY_HOST`
- **Valore:** `shapiro.ninja` (o l'IP del server se non hai dominio)

#### Secret 3: `DEPLOY_USER`
- **Nome:** `DEPLOY_USER`
- **Valore:** `deploy` (o `root` se usi root)

#### Secret 4: `DEPLOY_PATH`
- **Nome:** `DEPLOY_PATH`
- **Valore:** `/var/www/shappa` (o il path dove si trova il progetto)

### Passo 3: Verifica

1. Torna su: https://github.com/shapironeil/shappa/settings/secrets/actions
2. Dovresti vedere tutti e 4 i secrets elencati
3. **⚠️ Nota:** I valori sono nascosti per sicurezza

---

## 🔍 Metodo 3: Usando GitHub CLI Manualmente

Se preferisci configurare manualmente con GitHub CLI:

```powershell
# Autenticati (se non l'hai già fatto)
gh auth login

# Configura SSH_PRIVATE_KEY (da file)
gh secret set SSH_PRIVATE_KEY --repo shapironeil/shappa < ~/.ssh/github_deploy_key

# Oppure incolla direttamente
gh secret set SSH_PRIVATE_KEY --repo shapironeil/shappa --body "-----BEGIN OPENSSH PRIVATE KEY-----..."

# Configura gli altri secrets
gh secret set DEPLOY_HOST --repo shapironeil/shappa --body "shapiro.ninja"
gh secret set DEPLOY_USER --repo shapironeil/shappa --body "deploy"
gh secret set DEPLOY_PATH --repo shapironeil/shappa --body "/var/www/shappa"

# Verifica
gh secret list --repo shapironeil/shappa
```

---

## ✅ Verifica Finale

Dopo aver configurato i secrets:

1. **Verifica su GitHub:**
   - https://github.com/shapironeil/shappa/settings/secrets/actions
   - Dovresti vedere tutti e 4 i secrets

2. **Testa la connessione SSH:**
   ```bash
   # Se hai la chiave localmente
   ssh -i ~/.ssh/github_deploy_key deploy@shapiro.ninja
   ```

3. **Triggera il deploy:**
   - Vai su: https://github.com/shapironeil/shappa/actions
   - Seleziona "Deploy to DigitalOcean via SSH"
   - Clicca "Run workflow" → "Run workflow"

---

## 🐛 Troubleshooting

### Errore: "Permission denied (publickey)"

**Causa:** La chiave pubblica non è in `authorized_keys` sul server.

**Soluzione:**
```bash
# Sul server
ssh deploy@shapiro.ninja
cat ~/.ssh/github_deploy_key.pub >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
chmod 700 ~/.ssh
```

### Errore: "Secret not found"

**Causa:** Il nome del secret è sbagliato.

**Soluzione:** Verifica che i nomi siano ESATTAMENTE:
- `SSH_PRIVATE_KEY` (non `SSH_PRIVATE_KEY_` o `ssh_private_key`)
- `DEPLOY_HOST` (non `DEPLOYHOST`)
- `DEPLOY_USER` (non `DEPLOYUSER`)
- `DEPLOY_PATH` (non `DEPLOYPATH`)

### Errore: "Connection refused"

**Causa:** Il server non è raggiungibile o la porta SSH è bloccata.

**Soluzione:**
- Verifica che il server sia online
- Verifica che la porta 22 sia aperta nel firewall

---

## 📞 Supporto

Se hai problemi:
1. Verifica che tutti i 4 secrets siano configurati
2. Verifica che i nomi siano esatti (case-sensitive)
3. Verifica che la chiave SSH sia valida
4. Controlla i log GitHub Actions per errori specifici

---

**Una volta configurati i secrets, il deploy funzionerà automaticamente ad ogni push su `main`!** 🚀

