Guida rapida per caricare il progetto su GitHub e collegarlo al server

1) Preparazione (da PowerShell nella cartella del progetto)

   # inizializza git se non esiste
   git init
   git add .
   git commit -m "Initial commit - upload local Shappa workspace"

2) Aggiungi remote (usa la tua URL repo)

   git branch -M main
   git remote add origin https://github.com/shapironeil/shappa.git
   git push -u origin main

Nota: se preferisci SSH:
   git remote add origin git@github.com:shapironeil/shappa.git
   git push -u origin main

3) Se hai file binari/immagini grandi

   # installa Git LFS una volta
   git lfs install
   # traccia i tipi grandi
   git lfs track "*.jpg" "*.png" "*.webp"
   git add .gitattributes
   git add .
   git commit -m "Add LFS tracking"
   git push

4) Aggiungi il workflow di deploy (opzionale)

   Ho aggiunto un esempio in `.github/workflows/deploy-ssh.yml`. Prima di usarlo, imposta i segreti nel repository (Settings -> Secrets):
   - SSH_PRIVATE_KEY (chiave privata del deploy user)
   - DEPLOY_HOST
   - DEPLOY_USER
   - DEPLOY_PATH

5) Modificare file online

   - Puoi modificare direttamente sul sito GitHub (editor web) o usare Codespaces per lavorare online.
   - Le modifiche su GitHub non applicheranno automaticamente modifiche al tuo server a meno che non configuri un workflow CI/CD (es. il deploy-ssh.yml) o il server non esegua periodici pull dal repo.

Se vuoi, posso generare e personalizzare uno script di deploy più sofisticato (Docker, PM2, systemd) e i file di esempio per il tuo server.
