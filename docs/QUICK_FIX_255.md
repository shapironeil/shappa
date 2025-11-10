# ⚡ Fix Rapido: Exit Code 255

## 🔍 Cosa Significa

**Exit code 255** = Errore connessione SSH

---

## ✅ Fix Veloce (2 minuti)

### Sul Server:

```bash
ssh root@207.154.218.16
su - deploy

# Rigenera chiave
rm -f ~/.ssh/github_deploy_key*
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/github_deploy_key -N ""
cat ~/.ssh/github_deploy_key.pub >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/github_deploy_key ~/.ssh/authorized_keys

# Mostra chiave COMPLETA
cat ~/.ssh/github_deploy_key
```

### Su GitHub:

1. Vai su: https://github.com/shapironeil/shappa/settings/secrets/actions
2. Clicca `SSH_PRIVATE_KEY` → "Update"
3. Incolla la chiave COMPLETA (inclusi BEGIN/END)
4. Salva

### Test:

```bash
# Sul server
ssh -i ~/.ssh/github_deploy_key deploy@207.154.218.16 "echo 'OK'"
```

Se funziona, la chiave è corretta!

---

**Poi riprova il deploy.** 🚀

