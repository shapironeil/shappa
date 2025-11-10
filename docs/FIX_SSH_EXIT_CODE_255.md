# 🔧 Fix Errore SSH Exit Code 255

## ❌ Problema

```
Process completed with exit code 255
```

**Exit code 255 in SSH** significa che la connessione SSH è fallita. Possibili cause:

1. **Chiave SSH non valida o malformata**
2. **Permessi chiave SSH errati**
3. **Utente deploy non esiste o non ha permessi**
4. **Chiave pubblica non in authorized_keys**
5. **Server non raggiungibile**

---

## ✅ Soluzione Passo-Passo

### 1. Verifica Chiave SSH sul Server

```bash
# Connettiti al server
ssh root@207.154.218.16

# Passa all'utente deploy
su - deploy

# Verifica che la chiave esista
ls -la ~/.ssh/github_deploy_key

# Verifica permessi (devono essere 600)
chmod 600 ~/.ssh/github_deploy_key

# Mostra chiave privata COMPLETA
cat ~/.ssh/github_deploy_key
```

**Verifica che la chiave:**
- ✅ Inizia con `-----BEGIN OPENSSH PRIVATE KEY-----`
- ✅ Ha 6-8 righe di contenuto
- ✅ Finisce con `-----END OPENSSH PRIVATE KEY-----`
- ✅ Non ha spazi extra o caratteri strani

### 2. Verifica Chiave Pubblica in authorized_keys

```bash
# Sul server, come utente deploy
cat ~/.ssh/github_deploy_key.pub

# Verifica che sia in authorized_keys
grep "$(cat ~/.ssh/github_deploy_key.pub)" ~/.ssh/authorized_keys

# Se non c'è, aggiungila
cat ~/.ssh/github_deploy_key.pub >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

### 3. Test Connessione SSH Manuale

```bash
# Sul server, come utente deploy
ssh -i ~/.ssh/github_deploy_key deploy@207.154.218.16 "echo 'SSH funziona!'"
```

Se questo comando funziona, la chiave è corretta.

### 4. Verifica Utente Deploy

```bash
# Sul server, come root
id deploy

# Verifica che l'utente esista e abbia home directory
ls -la /home/deploy

# Verifica permessi directory
chown -R deploy:deploy /home/deploy
chmod 700 /home/deploy
```

### 5. Rigenera Chiave SSH (Se Necessario)

```bash
# Sul server, come root
bash scripts/fix-ssh-key.sh

# OPPURE manualmente:
su - deploy
rm -f ~/.ssh/github_deploy_key*
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/github_deploy_key -N ""
cat ~/.ssh/github_deploy_key.pub >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/github_deploy_key ~/.ssh/authorized_keys
chmod 700 ~/.ssh
cat ~/.ssh/github_deploy_key  # COPIA QUESTO COMPLETO
```

---

## 🔍 Debug Dettagliato

### Verifica Log GitHub Actions

Nel workflow GitHub Actions, clicca sullo step fallito e verifica:
- Quale comando ha fallito
- Il messaggio di errore completo
- Se c'è "Permission denied" o "Connection refused"

### Test Locale Chiave SSH

Se hai la chiave localmente, testa:

```bash
# Salva la chiave in un file temporaneo
echo "CHIAVE_PRIVATA_COMPLETA" > test_key
chmod 600 test_key

# Testa connessione
ssh -i test_key -o StrictHostKeyChecking=no deploy@207.154.218.16 "echo 'Test'"
```

---

## 🐛 Problemi Comuni

### Errore: "Permission denied (publickey)"

**Causa:** Chiave pubblica non in authorized_keys

**Soluzione:**
```bash
# Sul server
cat ~/.ssh/github_deploy_key.pub >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

### Errore: "Could not resolve hostname"

**Causa:** Server non raggiungibile

**Soluzione:** Verifica che `207.154.218.16` sia raggiungibile

### Errore: "Connection refused"

**Causa:** Porta SSH (22) bloccata o server down

**Soluzione:** Verifica che il server sia online e la porta 22 aperta

---

## ✅ Checklist Finale

- [ ] Chiave SSH generata con `ssh-keygen -t ed25519`
- [ ] Chiave PRIVATA completa (inclusi BEGIN/END)
- [ ] Permessi chiave: `chmod 600`
- [ ] Chiave pubblica in `authorized_keys`
- [ ] Permessi authorized_keys: `chmod 600`
- [ ] Test connessione SSH manuale funziona
- [ ] Secret `SSH_PRIVATE_KEY` configurato su GitHub
- [ ] Secret contiene chiave COMPLETA (non troncata)

---

**Dopo aver verificato tutto, riprova il deploy!** 🚀


