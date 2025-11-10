# 🔒 Linee Guida di Sicurezza

## ⚠️ Informazioni Sensibili da NON Committare

### ❌ NON committare mai:
- **IP addresses del server** - Usa placeholder come `YOUR_SERVER_IP` o `$DEPLOY_HOST`
- **Password** - Usa variabili d'ambiente o secrets
- **Chiavi private SSH** - Solo nei GitHub Secrets
- **Token API** - Solo nei GitHub Secrets o variabili d'ambiente
- **Credenziali database** - Solo in `.env.private` (non committato)

---

## ✅ Best Practices

### 1. IP Addresses
**❌ SBAGLIATO:**
```bash
ssh root@207.154.218.16
```

**✅ CORRETTO:**
```bash
# Usa placeholder o variabili d'ambiente
ssh root@YOUR_SERVER_IP
# oppure
ssh root@$DEPLOY_HOST
```

### 2. Documentazione
Quando scrivi documentazione:
- Usa placeholder generici (`YOUR_SERVER_IP`, `YOUR_DOMAIN`, etc.)
- Riferisciti a variabili d'ambiente (`$DEPLOY_HOST`, `$DEPLOY_USER`, etc.)
- Aggiungi note che spiegano dove trovare i valori reali

### 3. File di Configurazione
- Usa `.env.private` per valori sensibili (non committato)
- Usa `.env.example` con placeholder per template
- Non committare mai `.env.private`

---

## 🔍 Verifica Prima del Commit

Prima di committare, verifica che non ci siano:
- IP addresses hardcoded
- Password in chiaro
- Token o chiavi private
- Credenziali database

**Comando utile:**
```bash
# Cerca IP addresses nel codice
grep -r "207\.154\.218\.16" . --exclude-dir=.git

# Cerca pattern comuni di password
grep -r "password.*=" . --exclude-dir=.git --exclude="*.md"
```

---

## 📝 Template per Documentazione

Quando documenti comandi che richiedono informazioni sensibili:

```markdown
## Setup Server

1. **Configura variabili d'ambiente:**
   ```bash
   export DEPLOY_HOST="YOUR_SERVER_IP"
   export DEPLOY_USER="deploy"
   ```

2. **Connettiti al server:**
   ```bash
   ssh $DEPLOY_USER@$DEPLOY_HOST
   ```

**Nota:** Sostituisci `YOUR_SERVER_IP` con l'IP del tuo server.
```

---

## 🚨 Se Hai Già Committato Informazioni Sensibili

1. **Rimuovi immediatamente** dal repository
2. **Rigenera** tutte le credenziali esposte
3. **Rivedi** la cronologia Git per assicurarti che siano rimosse
4. **Considera** di cambiare tutte le credenziali esposte

---

**Ricorda: La sicurezza è una responsabilità condivisa. Verifica sempre prima di committare!** 🔒

