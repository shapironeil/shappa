# 🔧 Fix Errore SSH Key - "error in libcrypto"

## ❌ Problema

```
Error loading key "(stdin)": error in libcrypto
```

Questo errore significa che la chiave SSH non è valida o è in un formato non supportato.

---

## ✅ Soluzione

### ⚠️ IMPORTANTE: Usa la Chiave PRIVATA, NON quella Pubblica!

**Per GitHub Secrets serve:**
- ✅ **Chiave PRIVATA** (`-----BEGIN OPENSSH PRIVATE KEY-----`)
- ❌ **NON** la chiave pubblica (`ssh-ed25519 AAAAC3...`)

---

## 🔑 Genera Nuova Chiave SSH (Sul Server)

### Connettiti al server e genera una nuova chiave:

```bash
# Connettiti al server
ssh root@207.154.218.16

# Passa all'utente deploy
su - deploy

# Elimina chiave vecchia se esiste
rm -f ~/.ssh/github_deploy_key ~/.ssh/github_deploy_key.pub

# Genera nuova chiave SSH (ed25519 è il formato più moderno e compatibile)
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/github_deploy_key -N ""

# Aggiungi chiave pubblica ad authorized_keys
cat ~/.ssh/github_deploy_key.pub >> ~/.ssh/authorized_keys

# Imposta permessi corretti
chmod 600 ~/.ssh/github_deploy_key
chmod 600 ~/.ssh/authorized_keys
chmod 700 ~/.ssh

# Mostra chiave PRIVATA (questa è quella che serve per GitHub)
cat ~/.ssh/github_deploy_key
```

---

## 📋 Verifica Formato Chiave

La chiave PRIVATA deve iniziare e finire così:

```
-----BEGIN OPENSSH PRIVATE KEY-----
[contenuto chiave - molte righe]
-----END OPENSSH PRIVATE KEY-----
```

**⚠️ NON deve essere:**
- `-----BEGIN RSA PRIVATE KEY-----` (formato vecchio, può dare problemi)
- `ssh-ed25519 AAAAC3...` (questa è la chiave PUBBLICA, non serve)

---

## 🔍 Come Distinguere Chiave Pubblica da Privata

### Chiave PRIVATA (quella che serve):
```
-----BEGIN OPENSSH PRIVATE KEY-----
b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAAAlwAAAAdzc2gtcn
... (molte righe) ...
-----END OPENSSH PRIVATE KEY-----
```

### Chiave PUBBLICA (NON serve per GitHub Secrets):
```
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAI... github-actions-deploy
```

---

## ✅ Configura su GitHub

1. Vai su: https://github.com/shapironeil/shappa/settings/secrets/actions
2. Se `SSH_PRIVATE_KEY` esiste già, clicca "Update"
3. Incolla la **chiave PRIVATA completa** (tutto, incluse le righe BEGIN/END)
4. Salva

---

## 🧪 Test Chiave

Dopo aver configurato, testa la connessione:

```bash
# Sul server, come utente deploy
ssh -i ~/.ssh/github_deploy_key deploy@207.154.218.16 "echo 'SSH funziona!'"
```

Se funziona, la chiave è corretta.

---

## 🐛 Se Continua a Dare Errore

### Opzione 1: Converti formato chiave

Se hai una chiave RSA vecchia, convertila:

```bash
# Sul server
ssh-keygen -p -f ~/.ssh/github_deploy_key -m PEM
```

### Opzione 2: Genera chiave in formato PEM (più compatibile)

```bash
# Sul server, come deploy
ssh-keygen -t rsa -b 4096 -C "github-actions-deploy" -f ~/.ssh/github_deploy_key -N "" -m PEM
cat ~/.ssh/github_deploy_key.pub >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/github_deploy_key
cat ~/.ssh/github_deploy_key
```

---

## ✅ Checklist

- [ ] Chiave generata con `ssh-keygen -t ed25519`
- [ ] Chiave PRIVATA (non pubblica)
- [ ] Formato: `-----BEGIN OPENSSH PRIVATE KEY-----`
- [ ] Copiata COMPLETA (inclusi BEGIN/END)
- [ ] Configurata su GitHub come `SSH_PRIVATE_KEY`
- [ ] Test connessione funziona

---

**Dopo aver configurato la chiave corretta, il deploy funzionerà!** 🚀

