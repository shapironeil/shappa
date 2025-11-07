# 🚀 Setup Ambiente di Sviluppo - Shappa

Guida completa per configurare il tuo ambiente di sviluppo locale per Shappa.

## 📋 Prerequisiti

- **Node.js** >= 18.x ([Download](https://nodejs.org/))
- **Git** per clonare il repository
- **MongoDB Atlas** - Database già configurato in produzione
- **DigitalOcean Droplet** - Server production già online
- **Dominio** - shapiro.ninja (già puntato al droplet)

## 🎯 Architettura

```
┌─────────────────┐         ┌──────────────────┐
│  PC Locale      │         │  DigitalOcean    │
│  (Sviluppo)     │────────▶│  (Production)    │
│                 │         │                  │
│  localhost:3000 │         │  shapiro.ninja   │
└─────────────────┘         └──────────────────┘
         │                           │
         └───────────────────────────┘
                    │
              ┌─────▼──────┐
              │  MongoDB   │
              │   Atlas    │
              │ (Condiviso)│
              └────────────┘
```

## 📦 Installazione

### 1. Clona il Repository

```powershell
cd C:\Users\marco\OneDrive\Desktop
git clone https://github.com/shapironeil/shappa.git
cd shappa
```

### 2. Installa Dipendenze

```powershell
npm install
```

### 3. Configura Variabili d'Ambiente

Crea il file `.env` dalla template:

```powershell
Copy-Item .env.example .env
```

Poi modifica `.env` e compila:

```bash
# MongoDB (IMPORTANTE: usa la stessa stringa del server production)
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/shappa

# eBay Sandbox (per testing locale)
EBAY_SANDBOX_CLIENT_ID=your_sandbox_client_id
EBAY_SANDBOX_CLIENT_SECRET=your_sandbox_secret

# OpenWebNinja (opzionale, per testare scraping)
OPENWEBNINJA_API_KEY=your_api_key
```

**NOTA IMPORTANTE**: Il database MongoDB è condiviso tra sviluppo locale e produzione. Questo ti permette di vedere in tempo reale i dati del sito online mentre sviluppi.

### 4. Certificato SSL Locale (per eBay OAuth)

eBay richiede HTTPS anche in locale. Genera certificati self-signed:

```powershell
npm install -g mkcert
mkcert -install
mkcert localhost
```

I certificati verranno salvati in `ssl/localhost.pem` e `ssl/localhost-key.pem`.

### 5. Avvia il Server di Sviluppo

```powershell
npm run dev
```

Il server sarà disponibile su:
- **HTTPS**: `https://localhost:3000` (per eBay OAuth)
- **HTTP**: `http://localhost:3000` (per sviluppo generale)

## 🔑 Variabili d'Ambiente - Spiegazione

### Sviluppo Locale vs Produzione

| Variabile | Locale | Produzione (DigitalOcean) |
|-----------|---------|---------------------------|
| `NODE_ENV` | development | production |
| `PORT` | 3000 | 3000 (dietro Nginx) |
| `MONGODB_URI` | ✅ Condiviso | ✅ Condiviso |
| `EBAY_*` | Sandbox | Production |
| `OPENWEBNINJA_API_KEY` | Opzionale | Richiesto |

### Database Condiviso

**Vantaggi**:
- Vedi dati reali mentre sviluppi
- Nessun sync manuale necessario
- Test immediato delle modifiche

**Attenzione**:
- Le modifiche al DB sono REALI
- Usa sempre transazioni per operazioni critiche
- Testa su dati di staging quando possibile

## 🛠️ Workflow Sviluppo

### 1. Branch Git

```powershell
# Crea un nuovo branch per la tua feature
git checkout -b feature/nuova-funzionalita

# Lavora sul codice...

# Commit
git add .
git commit -m "feat: descrizione modifiche"

# Push
git push origin feature/nuova-funzionalita
```

### 2. Testing Locale

```powershell
# Avvia in modalità sviluppo (auto-reload)
npm run dev

# Testa le modifiche su http://localhost:3000
```

### 3. Deploy in Produzione

#### Opzione A: Push diretto su `main` (deploy automatico)

```powershell
git checkout main
git merge feature/nuova-funzionalita
git push origin main
```

Il server DigitalOcean pullerà automaticamente le modifiche (se configurato con webhook/cron).

#### Opzione B: Deploy manuale sul server

```powershell
# SSH nel droplet
ssh root@207.154.218.16

# Naviga nella cartella del progetto
cd /var/www/shappa

# Pull delle modifiche
git pull origin main

# Riavvia il server
pm2 restart shappa
```

## 📁 Struttura Progetto

```
shappa/
├── server.js              # Server Express principale
├── package.json           # Dipendenze e scripts
├── .env                   # Variabili ambiente LOCALE (non committare!)
├── .env.example           # Template variabili
├── lib/
│   ├── scraper/          # Scraper Amazon/Playwright
│   └── services/         # Business logic
├── src/
│   ├── pages/            # Pagine HTML app
│   ├── utils/            # Utilities JS frontend
│   └── styles/           # CSS
├── public/               # Asset statici
├── docs/                 # Documentazione
└── ssl/                  # Certificati HTTPS locali
```

## 🐛 Troubleshooting

### Errore: "Cannot connect to MongoDB"

```powershell
# Verifica la stringa di connessione nel .env
# Assicurati che l'IP del tuo PC sia whitelistato in MongoDB Atlas
# Network Access → Add IP Address → Add Current IP
```

### Errore: "eBay OAuth callback failed"

```powershell
# Verifica che stai usando HTTPS (https://localhost:3000)
# Controlla che il certificato SSL sia trusted (mkcert -install)
# Verifica che EBAY_SANDBOX_REDIRECT_URI sia https://localhost:3000/auth/ebay/callback
```

### Server non si avvia

```powershell
# Verifica che la porta 3000 sia libera
netstat -ano | findstr :3000

# Se occupata, uccidi il processo o cambia PORT nel .env
```

## 📚 Risorse Utili

- **MongoDB Atlas Dashboard**: [cloud.mongodb.com](https://cloud.mongodb.com)
- **DigitalOcean Droplet**: [cloud.digitalocean.com](https://cloud.digitalocean.com)
- **eBay Developer**: [developer.ebay.com](https://developer.ebay.com)
- **OpenWebNinja Docs**: [openwebninja.com/docs](https://openwebninja.com/docs)

## 🔐 Sicurezza

- **MAI** committare il file `.env`
- **MAI** condividere le chiavi API
- Usa sempre credenziali SANDBOX per sviluppo
- Mantieni separati JWT_SECRET tra dev e production

## 📞 Supporto

Per problemi o domande:
1. Controlla la documentazione in `docs/`
2. Verifica i log del server: `pm2 logs shappa`
3. Consulta il README principale

---

**Buon sviluppo! 🚀**
