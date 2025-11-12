# ✅ Guida Verifica Secrets GitHub

## Problema: "The ssh-private-key argument is empty"

Se ricevi questo errore anche se i secrets dovrebbero essere configurati, segui questi passaggi per verificare.

---

## 📋 Passo 1: Verifica che i Secrets Esistano

1. Vai su: https://github.com/shapironeil/shappa/settings/secrets/actions
2. Verifica che vedi questi 4 secrets:
   - `SSH_PRIVATE_KEY`
   - `DEPLOY_HOST`
   - `DEPLOY_USER`
   - `DEPLOY_PATH`

**⚠️ IMPORTANTE:** Se non vedi tutti e 4 i secrets, devono essere aggiunti.

---

## 📋 Passo 2: Verifica che i Secrets Non Siano Vuoti

Anche se un secret esiste, potrebbe essere vuoto. Per verificare:

1. **SSH_PRIVATE_KEY:**
   - Clicca sul secret `SSH_PRIVATE_KEY`
   - Clicca "Update" (non cambiare nulla, solo per vedere se c'è contenuto)
   - Se il campo è vuoto, il secret è vuoto e va riempito
   - **NON salvare se non devi cambiare nulla!**

2. **DEPLOY_HOST, DEPLOY_USER, DEPLOY_PATH:**
   - Stesso procedimento: clicca "Update" per verificare che abbiano un valore
   - **NON salvare se non devi cambiare nulla!**

---

## 📋 Passo 3: Verifica il Nome del Secret

Il nome del secret deve essere **ESATTAMENTE** come nel workflow:
- `SSH_PRIVATE_KEY` (non `SSH_PRIVATE_KEY_` o `ssh_private_key` o altro)
- `DEPLOY_HOST` (non `DEPLOYHOST` o `deploy_host`)
- `DEPLOY_USER` (non `DEPLOYUSER` o `deploy_user`)
- `DEPLOY_PATH` (non `DEPLOYPATH` o `deploy_path`)

**⚠️ I nomi sono case-sensitive!**

---

## 📋 Passo 4: Verifica il Formato della Chiave SSH

Se `SSH_PRIVATE_KEY` esiste ma è vuoto o malformato:

1. **Formato corretto della chiave SSH:**
   ```
   -----BEGIN OPENSSH PRIVATE KEY-----
   [contenuto chiave]
   -----END OPENSSH PRIVATE KEY-----
   ```
   O per chiavi RSA più vecchie:
   ```
   -----BEGIN RSA PRIVATE KEY-----
   [contenuto chiave]
   -----END RSA PRIVATE KEY-----
   ```

2. **Verifica che la chiave non abbia spazi extra:**
   - Non deve avere spazi all'inizio o alla fine
   - Non deve avere caratteri nascosti
   - Deve essere una singola stringa senza interruzioni

3. **Verifica che la chiave non richieda passphrase:**
   - La chiave deve essere generata senza passphrase: `ssh-keygen -N ""`

---

## 📋 Passo 5: Rigenera la Chiave SSH (se necessario)

Se la chiave è vuota o non funziona, rigenerala:

```bash
# Sul server DigitalOcean
ssh deploy@shapiro.ninja

# Genera nuova chiave SSH (senza passphrase)
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/github_deploy_key -N ""

# Aggiungi chiave pubblica ad authorized_keys
cat ~/.ssh/github_deploy_key.pub >> ~/.ssh/authorized_keys

# Verifica permessi
chmod 600 ~/.ssh/github_deploy_key
chmod 600 ~/.ssh/authorized_keys
chmod 700 ~/.ssh

# Mostra chiave privata (COPIA QUESTO INTERAMENTE)
cat ~/.ssh/github_deploy_key
```

Poi aggiorna il secret `SSH_PRIVATE_KEY` su GitHub con il nuovo contenuto.

---

## 📋 Passo 6: Verifica i Valori degli Altri Secrets

1. **DEPLOY_HOST:**
   - Deve essere l'IP o hostname del server (es: `shapiro.ninja` o `164.90.xxx.xxx`)
   - Non deve avere `http://` o `https://`
   - Non deve avere spazi

2. **DEPLOY_USER:**
   - Deve essere l'username SSH (es: `deploy`, `root`, `ubuntu`)
   - Non deve avere spazi

3. **DEPLOY_PATH:**
   - Deve essere il path assoluto (es: `/var/www/shappa`)
   - Deve iniziare con `/`
   - Non deve finire con `/` (opzionale, ma meglio evitare)

---

## 📋 Passo 7: Testa Manualmente

Dopo aver verificato/aggiornato i secrets, testa manualmente:

```bash
# Sul tuo computer locale
ssh -i ~/.ssh/github_deploy_key deploy@shapiro.ninja

# Dovresti essere in grado di connetterti senza password
```

Se questo funziona, il problema potrebbe essere con GitHub Actions, non con la chiave SSH.

---

## 🐛 Troubleshooting

### Il secret esiste ma GitHub Actions dice che è vuoto

**Possibili cause:**
1. Il secret è vuoto (solo spazi o nulla)
2. Il secret ha caratteri nascosti
3. Il secret è in un repository diverso
4. GitHub Actions non ha permessi per leggere i secrets

**Soluzione:**
- Elimina il secret e ricrealo
- Assicurati di copiare/incollare esattamente il contenuto
- Verifica che stai lavorando sul repository corretto

### Il secret è configurato ma il workflow fallisce

**Possibili cause:**
1. Il formato della chiave SSH è sbagliato
2. La chiave richiede una passphrase
3. La chiave pubblica non è in `authorized_keys` sul server

**Soluzione:**
- Rigenera la chiave SSH senza passphrase
- Aggiungi la chiave pubblica a `authorized_keys`
- Verifica i permessi delle chiavi SSH

---

## ✅ Checklist Completa

- [ ] Tutti e 4 i secrets esistono su GitHub
- [ ] Nessun secret è vuoto
- [ ] I nomi dei secrets sono corretti (case-sensitive)
- [ ] `SSH_PRIVATE_KEY` ha il formato corretto
- [ ] `SSH_PRIVATE_KEY` non richiede passphrase
- [ ] La chiave pubblica è in `authorized_keys` sul server
- [ ] `DEPLOY_HOST` è corretto (senza http/https)
- [ ] `DEPLOY_USER` è corretto
- [ ] `DEPLOY_PATH` è corretto (path assoluto)
- [ ] Test SSH manuale funziona
- [ ] Workflow GitHub Actions eseguito dopo aver verificato

---

## 🔗 Link Utili

- GitHub Secrets: https://github.com/shapironeil/shappa/settings/secrets/actions
- GitHub Actions: https://github.com/shapironeil/shappa/actions
- Guida Setup Secrets: docs/GITHUB_SECRETS_SETUP.md



