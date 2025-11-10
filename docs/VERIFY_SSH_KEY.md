# 🔑 Verifica Chiave SSH Privata per GitHub

## ⚠️ Importante

**Non posso vedere la chiave privata configurata su GitHub** - questo è normale per sicurezza!

Per verificare o rigenerare la chiave SSH, devi farlo **sul server**.

---

## 🔍 Verifica Chiave Attuale

### Opzione 1: Sul Server (se hai accesso SSH)

Connettiti al server e verifica la chiave esistente:

```bash
# Connettiti al server
ssh root@YOUR_SERVER_IP

# Passa all'utente deploy (se usi deploy)
su - deploy

# Verifica se esiste una chiave
ls -la ~/.ssh/

# Mostra la chiave privata (se esiste)
cat ~/.ssh/github_deploy_key
```

**La chiave privata deve:**
- Iniziare con: `-----BEGIN OPENSSH PRIVATE KEY-----`
- Finire con: `-----END OPENSSH PRIVATE KEY-----`
- Avere diverse righe di contenuto base64 nel mezzo

---

## 🔄 Genera Nuova Chiave (se necessario)

Se la chiave non esiste o vuoi rigenerarla:

```bash
# Sul server, come utente deploy (o root)
ssh root@YOUR_SERVER_IP
su - deploy  # Se usi deploy

# Elimina chiave vecchia (se esiste)
rm -f ~/.ssh/github_deploy_key ~/.ssh/github_deploy_key.pub

# Genera nuova chiave SSH (ed25519 è il formato più moderno)
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/github_deploy_key -N ""

# Aggiungi chiave pubblica ad authorized_keys
cat ~/.ssh/github_deploy_key.pub >> ~/.ssh/authorized_keys

# Imposta permessi corretti
chmod 600 ~/.ssh/github_deploy_key
chmod 600 ~/.ssh/authorized_keys
chmod 700 ~/.ssh

# Mostra la chiave PRIVATA completa (questa è quella che serve per GitHub)
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "COPIA QUESTA CHIAVE PRIVATA COMPLETA (inclusi BEGIN e END):"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
cat ~/.ssh/github_deploy_key
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
```

---

## 📋 Formato Chiave Corretto

La chiave privata deve essere così:

```
-----BEGIN OPENSSH PRIVATE KEY-----
b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAAAMwAAAAtzc2gtZW
QyNTUxOQAAACCd0YXTDkkSLuYWpIykTqsMt/XLSzSpDZNLLieijgJneAAAAKA4/zJuOP8y
bgAAAAtzc2gtZWQyNTUxOQAAACCd0YXTDkkSLuYWpIykTqsMt/XLSzSpDZNLLieijgJneA
AAAEASmqXtuxeV1ot+QO1zYs9TNpVQjTH2ui4kLq4FHqb/A53RhdMOSRIu5hakjKROqwy3
9ctLNKkNk0suJ6KOAmd4AAAAHG1hcmNvLnBpZXRyYWZvcnRlQHRpc2NhbGkuaXQB
-----END OPENSSH PRIVATE KEY-----
```

**Caratteristiche:**
- ✅ Inizia con `-----BEGIN OPENSSH PRIVATE KEY-----`
- ✅ Ha 6-8 righe di contenuto base64
- ✅ Finisce con `-----END OPENSSH PRIVATE KEY-----`
- ✅ Non ha spazi o caratteri extra

---

## 🔧 Configura su GitHub

1. Vai su: https://github.com/shapironeil/shappa/settings/secrets/actions
2. Cerca `SSH_PRIVATE_KEY`
3. Se esiste, clicca "Update"
4. Se non esiste, clicca "New repository secret"
5. **Name:** `SSH_PRIVATE_KEY`
6. **Secret:** Incolla la chiave PRIVATA completa (tutto, incluse le righe BEGIN/END)
7. Clicca "Add secret" o "Update secret"

---

## ✅ Verifica

Dopo aver configurato, il prossimo deploy dovrebbe mostrare:

```
✅ SSH_PRIVATE_KEY: configured (length: 419 chars)
```

Se la lunghezza è inferiore a 100, la chiave potrebbe essere incompleta.

---

## 🚨 Se Non Hai Accesso SSH al Server

Se non puoi accedere al server per verificare la chiave:

1. **Contatta chi ha accesso** al server per generare/verificare la chiave
2. **Oppure** usa una chiave esistente se ne hai una salvata localmente
3. **Oppure** genera una nuova chiave sul server e copiala su GitHub

---

**La chiave privata deve essere generata sul server e poi copiata su GitHub Secrets!** 🔑

