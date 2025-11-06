# 📋 REGOLE DI GESTIONE CONFIGURAZIONI

## ⚠️ REGOLA #1: File con credenziali NON SI TOCCANO mai senza consenso

### File PROTETTI (modificabili solo su richiesta esplicita):
- `.env.private` - Configurazioni e credenziali personali
- `EBAY_INTEGRATION_GUIDE.md` - Credenziali eBay
- `EBAY_OAUTH_SETUP.md` - Setup OAuth eBay
- `docs/ebay-oauth-checkpoint.md` - Checkpoint OAuth
- `ebay-config-help.html` - Helper configurazione

### Operazioni VIETATE senza consenso:
- ❌ Modificare valori esistenti nei file protetti
- ❌ Rimuovere credenziali o API keys
- ❌ Cambiare configurazioni funzionanti
- ❌ Aggiornare file con "placeholder" al posto di valori reali

### Operazioni CONSENTITE:
- ✅ Leggere file per capire configurazione (solo se necessario)
- ✅ Suggerire modifiche (ma attendere conferma utente)
- ✅ Aggiungere NUOVE variabili in `.env.private` (senza toccare esistenti)
- ✅ Creare file `.env` sul server (non locale)

---

## 🔐 Come funziona `.env.private`

Questo file è il **centro di controllo** delle tue configurazioni:

1. **Contiene tutte le credenziali** - eBay, MongoDB, DigitalOcean, ecc.
2. **Resta sul tuo PC** - Mai committato su GitHub (protetto da .gitignore)
3. **Viene aggiornato da te** - Compili man mano che ottieni credenziali
4. **Copilot lo legge** - Ma NON lo modifica senza permesso

---

## 📝 Workflow corretto

### Quando ricevi nuove credenziali:
```
Tu: "Ho ottenuto la connection string MongoDB: mongodb+srv://..."
Copilot: "Perfetto! Aggiungo al file .env.private"
[Copilot aggiunge SOLO la nuova variabile MONGODB_URI]
```

### Quando serve leggere configurazione:
```
Tu: "Configura il server con MongoDB"
Copilot: [Legge .env.private per ottenere MONGODB_URI]
Copilot: [Usa il valore per configurare server]
[NON modifica .env.private]
```

### Quando serve modificare:
```
Tu: "Cambia l'IP del droplet in 164.90.123.456"
Copilot: "Aggiorno DROPLET_IP nel file .env.private"
[Copilot modifica SOLO dopo consenso esplicito]
```

---

## 🛡️ Protezioni attive

1. **`.gitignore`** - File protetti non vanno mai su GitHub
2. **Questo documento** - Reminder delle regole per Copilot
3. **Backup consigliato** - Copia `.env.private` su OneDrive/USB

---

## 🚀 Prossimi passaggi

Ora che il sistema è pronto, dammi le informazioni che hai ottenuto:

### Già configurato ✅
- ✅ Email Student Pack: marco.pietraforte@studenti.luiss.it
- ✅ GitHub account: shapironeil
- ✅ Repository: https://github.com/shapironeil/shappa
- ✅ eBay Sandbox credentials (salvate in .env.private)

### Da configurare ⏳
Ti servono questi strumenti — dimmi cosa hai già attivato:

1. **MongoDB Atlas**
   - Hai creato il cluster?
   - Hai la connection string `mongodb+srv://...`?

2. **DigitalOcean**
   - Hai riscattato i $200 di crediti?
   - Hai creato il droplet?
   - Qual è l'IP del droplet?

3. **Domini**
   - Hai registrato un dominio? (es. `shappa.me`)
   - Se sì, quale?

4. **Telegram Bot** (opzionale per notifiche)
   - Hai creato un bot con @BotFather?
   - Hai il token?

---

## 📦 Requisiti strumenti

### MongoDB Atlas (Database)
**Cosa ti serve:**
- Account GitHub (già hai)
- Cluster M0 Free (512MB gratis forever)
- Connection string formato: `mongodb+srv://username:password@cluster.mongodb.net/shappa`

**Come ottenerlo:**
1. Vai su https://cloud.mongodb.com/
2. Login con GitHub
3. "Create a Database" → M0 FREE → Frankfurt region
4. Security → Database Access → Add User (username: shappa_app, autogenerate password)
5. Security → Network Access → Add IP: `0.0.0.0/0` (temporaneo)
6. Database → Connect → Drivers → Copia connection string

### DigitalOcean (Server VPS)
**Cosa ti serve:**
- $200 crediti Student Pack
- Droplet Ubuntu 22.04, 1GB RAM ($6/mese = 33 mesi gratis)
- IP pubblico del droplet

**Come ottenerlo:**
1. Vai su https://education.github.com/pack/offers
2. Trova "DigitalOcean" → Get access
3. Ricevi email con link attivazione
4. Create Droplet → Ubuntu 22.04 → Basic $6/mo → Amsterdam
5. Authentication → SSH Key (se non hai: genera con `ssh-keygen`)
6. Salva IP pubblico che appare (es. 164.90.123.456)

### Dominio (Opzionale ma consigliato)
**Cosa ti serve:**
- Dominio .me gratis per 1 anno (Namecheap Student Pack)

**Come ottenerlo:**
1. Vai su https://education.github.com/pack/offers
2. Trova "Namecheap" → Get access
3. Registra dominio (es. shappa.me)
4. DNS Management → A Record → punta a IP droplet

---

## ✅ Checklist

**Dimmi cosa hai completato:**

- [ ] MongoDB Atlas cluster creato + connection string ottenuta
- [ ] DigitalOcean crediti attivati + droplet creato + IP ottenuto
- [ ] Dominio registrato (opzionale)
- [ ] SSH key generata (se non hai)

**Poi procediamo con:**
1. Salvo le tue credenziali in `.env.private`
2. Configuriamo il server DigitalOcean
3. Deploy dell'app
4. SSL + dominio
5. CI/CD automatico
6. Monitoring attivo

Dimmi cosa hai già pronto! 🚀
