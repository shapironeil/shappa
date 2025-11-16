# 🚀 Deploy Ready - Ristrutturazione Calendario

**Data:** 2025-01-XX  
**Status:** ✅ Pronto per deploy

---

## 📋 Modifiche da Deployare

### File Modificati

1. **`server.js`**
   - ✅ Aggiunti endpoint API calendario (`/api/calendar/events/:userId`)
   - ✅ Integrazione con schede settimanali Sport, Dieta, Impegni
   - ✅ Funzione helper `getRecurringDatesForDayIndex()` per eventi ricorrenti
   - ✅ Directory `data/calendar/` creata automaticamente

2. **`src/pages/calendario.html`**
   - ✅ Ristrutturazione completa UI/UX
   - ✅ Sidebar eventi ripristinata (ben visibile)
   - ✅ Integrazione con API server (no localStorage)
   - ✅ Rimossi tutti i dati fittizi
   - ✅ Pulsante "+ Nuovo Impegno" funzionante

3. **`CHANGELOG-calendar.md`**
   - ✅ Documentazione completa modifiche

---

## 🔄 Workflow Deploy

Il deploy avverrà **automaticamente** quando viene fatto `git push` su `main`:

1. **GitHub Actions** si attiva automaticamente
2. **Workflow:** `.github/workflows/deploy-ssh.yml`
3. **Server:** DigitalOcean (207.154.218.16)
4. **Path:** `/var/www/shappa`
5. **Restart:** PM2 automatico via `restart.sh`

---

## ✅ Verifica Post-Deploy

Dopo il deploy, verifica:

1. **Health Check:**
   ```bash
   curl https://shapiro.ninja/health
   ```

2. **API Calendario:**
   ```bash
   curl https://shapiro.ninja/api/calendar/events/USER_ID
   ```

3. **Pagina Calendario:**
   - Apri: `https://shapiro.ninja/src/pages/calendario.html`
   - Verifica che la sidebar eventi sia visibile
   - Verifica che gli eventi da Sport/Dieta/Impegni appaiano

4. **PM2 Status:**
   ```bash
   ssh deploy@207.154.218.16 "pm2 status"
   ```

---

## 📊 Modifiche API

### Nuovi Endpoint

- `GET /api/calendar/events/:userId` - Carica eventi (con integrazione schede settimanali)
- `POST /api/calendar/events/:userId` - Crea evento personalizzato
- `DELETE /api/calendar/events/:userId/:eventId` - Elimina evento

### Integrazione Schede Settimanali

- **Sport:** Legge `weekSchedule` da `data/sport/{userId}_program.json`
- **Dieta:** Legge `weekPlan` da `data/diet/{userId}.json`
- **Impegni:** Legge eventi personalizzati da `data/calendar/{userId}.json`

---

## 🎯 Cosa Aspettarsi

Dopo il deploy:
- ✅ Calendario con sidebar eventi ben visibile
- ✅ Eventi ricorrenti da Sport e Dieta
- ✅ Possibilità di creare nuovi impegni
- ✅ Nessun dato fittizio
- ✅ Tutto sincronizzato via API server

---

**Deploy automatico attivo!** 🚀






