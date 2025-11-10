# 🚨 Fix Immediato: Deploy Fallito - Secrets Mancanti

## ❌ Errore Attuale

```
The ssh-private-key argument is empty. Maybe the secret has not been configured, 
or you are using a wrong secret name in your workflow file.
```

## ✅ Soluzione Rapida (5 minuti)

### Passo 1: Vai su GitHub Secrets

1. Apri: https://github.com/shapironeil/shappa/settings/secrets/actions
2. Verifica se vedi questi 4 secrets:
   - `SSH_PRIVATE_KEY` ❌ **MANCANTE**
   - `DEPLOY_HOST` ❓
   - `DEPLOY_USER` ❓
   - `DEPLOY_PATH` ❓

### Passo 2: Genera Chiave SSH (se non ce l'hai)

**Opzione A: Se hai accesso SSH al server**

```bash
# Connettiti al server
ssh deploy@shapiro.ninja  # o l'IP del tuo server

# Genera nuova chiave SSH (senza passphrase)
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/github_deploy_key -N ""

# Aggiungi chiave pubblica ad authorized_keys
cat ~/.ssh/github_deploy_key.pub >> ~/.ssh/authorized_keys

# Mostra chiave privata (COPIA QUESTO INTERAMENTE)
cat ~/.ssh/github_deploy_key
```

**Opzione B: Se NON hai accesso SSH al server**

1. Contatta chi gestisce il server per ottenere la chiave SSH
2. Oppure genera una nuova chiave e chiedi di aggiungerla al server

### Passo 3: Aggiungi i Secrets su GitHub

1. Vai su: https://github.com/shapironeil/shappa/settings/secrets/actions
2. Clicca **"New repository secret"** per ogni secret

#### Secret 1: `SSH_PRIVATE_KEY`

- **Nome:** `SSH_PRIVATE_KEY` (esatto, case-sensitive)
- **Valore:** Incolla l'intera chiave privata (inclusi `-----BEGIN...` e `-----END...`)
- **⚠️ IMPORTANTE:** Copia TUTTO, incluso le righe iniziali e finali

#### Secret 2: `DEPLOY_HOST`

- **Nome:** `DEPLOY_HOST`
- **Valore:** `shapiro.ninja` oppure l'IP del server (es: `164.90.xxx.xxx`)

#### Secret 3: `DEPLOY_USER`

- **Nome:** `DEPLOY_USER`
- **Valore:** `deploy` oppure `root` (l'username SSH sul server)

#### Secret 4: `DEPLOY_PATH`

- **Nome:** `DEPLOY_PATH`
- **Valore:** `/var/www/shappa` oppure il path dove si trova il progetto sul server

### Passo 4: Verifica i Secrets

1. Torna su: https://github.com/shapironeil/shappa/settings/secrets/actions
2. Dovresti vedere tutti e 4 i secrets elencati
3. **⚠️ Nota:** I valori sono nascosti per sicurezza, vedrai solo i nomi

### Passo 5: Triggera il Deploy

1. Vai su: https://github.com/shapironeil/shappa/actions
2. Seleziona **"Deploy to DigitalOcean via SSH"**
3. Clicca **"Run workflow"** → **"Run workflow"**
4. Il deploy dovrebbe partire e completarsi con successo ✅

---

## 🔍 Verifica Rapida

Dopo aver configurato i secrets, verifica:

```bash
# Se hai accesso al server, testa la connessione SSH
ssh -i ~/.ssh/github_deploy_key deploy@shapiro.ninja

# Dovresti connetterti senza password
```

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

### Errore: "Connection refused"

**Causa:** Il server non è raggiungibile o la porta SSH è bloccata.

**Soluzione:**
- Verifica che il server sia online
- Verifica che la porta 22 sia aperta nel firewall

### Errore: "Secret not found"

**Causa:** Il nome del secret è sbagliato.

**Soluzione:** Verifica che i nomi siano ESATTAMENTE:
- `SSH_PRIVATE_KEY` (non `SSH_PRIVATE_KEY_` o `ssh_private_key`)
- `DEPLOY_HOST` (non `DEPLOYHOST`)
- `DEPLOY_USER` (non `DEPLOYUSER`)
- `DEPLOY_PATH` (non `DEPLOYPATH`)

---

## 📞 Supporto

Se hai problemi:
1. Verifica che tutti i 4 secrets siano configurati
2. Verifica che i nomi siano esatti (case-sensitive)
3. Verifica che la chiave SSH sia valida
4. Controlla i log GitHub Actions per errori specifici

---

**Una volta configurati i secrets, il deploy funzionerà automaticamente ad ogni push su `main`!** 🚀

