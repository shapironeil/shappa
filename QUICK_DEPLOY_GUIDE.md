# ⚡ Quick Deploy Guide - Workflow Online-First

## 🎯 Workflow Veloce

Questa app è **completamente online**. Il server è l'ambiente principale.

### ✅ Workflow Standard (3 passi)

```bash
# 1. Modifica file localmente
# 2. Commit
git add .
git commit -m "Descrizione modifiche"

# 3. Push → Deploy automatico!
git push origin main
```

**Fatto!** Il deploy avviene automaticamente in ~2-3 minuti.

---

## 🔍 Verifica Deploy

### GitHub Actions
- **URL:** https://github.com/shapironeil/shappa/actions
- Clicca sull'ultimo workflow → Verifica che sia ✅ completato

### Server
```bash
# Controlla status
ssh deploy@207.154.218.16 "pm2 status"

# Vedi logs
ssh deploy@207.154.218.16 "pm2 logs shappa"
```

---

## 🚨 Se il Deploy Fallisce

1. **Controlla GitHub Actions** → Leggi l'errore
2. **Verifica Secrets** → https://github.com/shapironeil/shappa/settings/secrets/actions
3. **Controlla Server** → `ssh deploy@207.154.218.16`

---

## 📋 Secrets Richiesti

| Secret | Valore |
|--------|--------|
| `SSH_PRIVATE_KEY` | Chiave privata SSH |
| `DEPLOY_HOST` | `207.154.218.16` |
| `DEPLOY_USER` | `deploy` |
| `DEPLOY_PATH` | `/var/www/shappa` |

---

## ⚠️ Regole Importanti

1. **Non modificare file direttamente sul server** (usa Git)
2. **Ogni push su `main` fa deploy automatico**
3. **File sensibili NON in Git** (`.env`, credenziali)
4. **Commit frequenti** = deploy frequenti = rollback facile

---

**Per dettagli completi:** Vedi `docs/ONLINE_FIRST_WORKFLOW.md`

