# 🐛 Debug: Exit Code 1 nel Deploy

## ❌ Problema

Il workflow GitHub Actions fallisce con **exit code 1**, ma non è chiaro quale step fallisce.

---

## 🔍 Come Diagnosticare

### 1. Controlla i Log GitHub Actions

1. Vai su: **https://github.com/shapironeil/shappa/actions**
2. Clicca sull'ultimo workflow fallito
3. Espandi ogni step per vedere quale fallisce

Gli step sono:
- ✅ **Validate secrets** - Verifica che tutti i secrets siano configurati
- ✅ **Setup SSH** - Configura la chiave SSH e testa la connessione
- ✅ **Sync files to server** - Sincronizza i file con rsync
- ✅ **Remote post-deploy** - Esegue comandi sul server (npm install, PM2 restart)
- ✅ **Verify deployment** - Verifica che il deploy sia riuscito

### 2. Errori Comuni per Step

#### Step "Validate secrets" fallisce

**Errore:** `❌ ERROR: [SECRET_NAME] secret is missing!`

**Soluzione:**
- Vai su: https://github.com/shapironeil/shappa/settings/secrets/actions
- Verifica che tutti i 4 secrets esistano:
  - `SSH_PRIVATE_KEY`
  - `DEPLOY_HOST` = `207.154.218.16`
  - `DEPLOY_USER` = `deploy`
  - `DEPLOY_PATH` = `/var/www/shappa`

#### Step "Setup SSH" fallisce

**Errore:** `❌ SSH connection failed!`

**Possibili cause:**
1. Chiave SSH non valida o incompleta
2. Chiave pubblica non in `authorized_keys` sul server
3. Utente `deploy` non esiste sul server
4. Server non raggiungibile

**Soluzione:**
```bash
# Sul server
ssh root@207.154.218.16
su - deploy

# Verifica chiave
cat ~/.ssh/github_deploy_key.pub
grep "$(cat ~/.ssh/github_deploy_key.pub)" ~/.ssh/authorized_keys

# Se non c'è, aggiungila
cat ~/.ssh/github_deploy_key.pub >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

#### Step "Sync files to server" fallisce

**Errore:** `❌ File sync failed!`

**Possibili cause:**
1. Directory di destinazione non esiste
2. Permessi insufficienti
3. Spazio disco insufficiente

**Soluzione:**
```bash
# Sul server
ssh root@207.154.218.16
mkdir -p /var/www/shappa
chown -R deploy:deploy /var/www/shappa
df -h  # Verifica spazio disco
```

#### Step "Remote post-deploy" fallisce

**Errore:** `npm ci failed` o `PM2 restart failed`

**Possibili cause:**
1. `package.json` non valido
2. Dipendenze non installabili
3. PM2 non configurato correttamente
4. `server.js` ha errori

**Soluzione:**
```bash
# Sul server
cd /var/www/shappa
npm install --production
pm2 restart shappa
pm2 logs shappa  # Vedi errori
```

---

## ✅ Workflow Migliorato

Il workflow è stato aggiornato con:

1. **Logging dettagliato** - Ogni step mostra cosa sta facendo
2. **Validazione migliorata** - Verifica formato chiave SSH
3. **Messaggi di errore chiari** - Indica esattamente cosa è andato storto
4. **Gestione errori robusta** - Ogni step gestisce i propri errori

---

## 🚀 Test Locale (Opzionale)

Se vuoi testare la connessione SSH localmente:

```bash
# Salva la chiave SSH in un file
echo "CHIAVE_PRIVATA_COMPLETA" > test_key
chmod 600 test_key

# Testa connessione
ssh -i test_key -o StrictHostKeyChecking=no deploy@207.154.218.16 "echo 'OK'"

# Test rsync
rsync -avz -e "ssh -i test_key -o StrictHostKeyChecking=no" \
  ./ deploy@207.154.218.16:/var/www/shappa --dry-run
```

---

## 📋 Checklist Debug

- [ ] Tutti i 4 secrets configurati su GitHub
- [ ] Chiave SSH completa (inclusi BEGIN/END)
- [ ] Chiave pubblica in `authorized_keys` sul server
- [ ] Utente `deploy` esiste sul server
- [ ] Directory `/var/www/shappa` esiste e ha permessi corretti
- [ ] Server raggiungibile: `ping 207.154.218.16`
- [ ] PM2 installato sul server: `pm2 --version`
- [ ] Node.js installato: `node --version`

---

**Dopo aver verificato tutto, riprova il deploy!** 🚀

