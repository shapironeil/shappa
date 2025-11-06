# 🔒 Security & Token Management

## ⚠️ AZIONE IMMEDIATA RICHIESTA

Se hai esposto accidentalmente un Personal Access Token (PAT) o una chiave API:

### 1. Revoca il token immediatamente

**Per GitHub Personal Access Tokens:**
1. Vai su [GitHub Settings → Developer settings → Personal access tokens](https://github.com/settings/tokens)
2. Trova il token esposto nella lista
3. Clicca **Delete** o **Revoke**
4. Conferma la revoca

**Token esposto in questa sessione:** `ghp_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX`  
👉 **Questo token DEVE essere revocato immediatamente.**

*Nota: Il token è stato rimosso per sicurezza. Se hai esposto un token, revocalo su GitHub Settings.*

### 2. Genera un nuovo token

1. Vai su [GitHub Settings → Developer settings → Personal access tokens → Generate new token](https://github.com/settings/tokens/new)
2. Seleziona scope minimo necessario:
   - **repo** (per accesso completo ai repository privati/pubblici)
3. Imposta una data di scadenza ragionevole (es. 90 giorni)
4. Copia il token generato (verrà mostrato una sola volta)
5. **NON condividere MAI il token pubblicamente**

### 3. Usa il nuovo token in modo sicuro

Usa lo script aggiornato `scripts/push_to_github.ps1` che:
- Accetta il token come input sicuro (nascosto)
- Usa il token solo temporaneamente per il push
- Rimuove il token dalla configurazione git dopo l'uso
- Non salva il token in `.git/config`

## 🛡️ Best Practices per la Sicurezza

### Non committare mai:
- ❌ Personal Access Tokens (PAT)
- ❌ Chiavi API
- ❌ Password
- ❌ Chiavi SSH private
- ❌ File `.env` con credenziali
- ❌ Certificati o file `.pem`/`.key`

Il file `.gitignore` del progetto è già configurato per escludere i file sensibili comuni.

### Metodi di autenticazione consigliati:

1. **SSH (migliore per automazioni)**
   ```powershell
   ssh-keygen -t ed25519 -C "tuo-email@example.com"
   # Aggiungi ~/.ssh/id_ed25519.pub su GitHub → Settings → SSH keys
   ```

2. **GitHub CLI (migliore per uso interattivo)**
   ```powershell
   gh auth login
   # Segui il wizard interattivo
   ```

3. **Git Credential Manager (integrato in Git per Windows)**
   - Gestisce automaticamente le credenziali in modo sicuro
   - Usa il credential store di Windows

4. **Personal Access Token (solo se necessario)**
   - Usa scope minimi
   - Imposta scadenza
   - Usa lo script sicuro per il push
   - Non salvare in plaintext

## 🔍 Verifica se un token è stato compromesso

Se hai pushato accidentalmente un token:

1. Controlla la history di git:
   ```powershell
   git log --all --full-history --source -- "*"
   git grep -i "ghp_" $(git rev-list --all)
   ```

2. Se trovi token nella history:
   - Revoca il token immediatamente
   - Considera di riscrivere la history (attenzione: operazione rischiosa)
   - Forza push dopo pulizia (solo se repository privato e sei l'unico collaboratore)

## 📞 Supporto

Per questioni di sicurezza relative a GitHub:
- [GitHub Security Advisories](https://github.com/security/advisories)
- [GitHub Support](https://support.github.com/)

Per segnalare vulnerabilità nel progetto:
- Apri una Security Advisory privata sul repository
- Non pubblicare vulnerabilità negli issue pubblici
