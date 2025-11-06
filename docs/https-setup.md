# HTTPS locale per Shappa

Questa guida spiega come generare e installare un certificato dev valido per `localhost` e `www.localhost`, necessario perché eBay richiede HTTPS e la `redirect_uri` deve usare `https://www.localhost:3000/auth/ebay/callback`.

## 1) Generare il certificato (Windows PowerShell, eseguire come amministratore)
Apri PowerShell come amministratore e lancia:

```powershell
cd C:\Users\marco\OneDrive\Desktop\shappa\scripts
.\generate-dev-cert.ps1
```

Il comando creerà un PFX in `ssl/key.pfx`. Se hai OpenSSL installato, estrarrà `key.pem` e `cert.pem` nella cartella `ssl`.

## 2) Installare il certificato come Trusted Root
- Apri `mmc.exe` → File > Add/Remove Snap-in > Certificates > Computer account > Local Computer
- Importa `ssl\key.pfx` nella sezione `Personal` e copia il certificato in `Trusted Root Certification Authorities` (o importa direttamente il `.cer` in Trusted Root)

## 3) Aggiornare i file di configurazione
- Assicurati che in `.env.local` e `.env` la variabile `EBAY_REDIRECT_URI` sia impostata su `https://www.localhost:3000/auth/ebay/callback`.
- `src/core/apiClient.js` usa `https://www.localhost:3000` come base in sviluppo.

## 4) Avviare il server
Nella root del progetto:

```powershell
node server.js
```

Il server si avvierà in HTTPS e userà i file `ssl/key.pem` e `ssl/cert.pem`.

## 5) Verifica
- Apri: https://www.localhost:3000/src/pages/settings.html e prova la connessione eBay
- Endpoint health: https://www.localhost:3000/health

## Troubleshooting
- Se il browser mostra errori SSL, assicurati di aver importato il certificato in Trusted Root
- Se OpenSSL non è installato, puoi convertire il PFX in PEM con OpenSSL installato successivamente o usare MMC per esportare in PEM

---
Questa procedura permette di avere un ambiente locale che rispetti i requisiti del portale eBay per redirect HTTPS con `www.localhost`.