# 🎯 Guida Rapida - Lavorare su Frontend e Backend

## 📁 Struttura del Progetto

```
LifeManager/
├── backend/                    # TU NON TOCCHI (io lavoro qui)
│   ├── server.js              # Server Express principale
│   ├── monitors/              # Monitor Shopify
│   ├── routes/                # API routes
│   └── src/pages/             # Vecchie pagine HTML (da eliminare)
│
├── frontend/                   # TU LAVORI QUI
│   ├── src/
│   │   ├── App.tsx            # Pagina Sport da Figma
│   │   ├── components/        # Tutti i componenti React
│   │   ├── api/sport.ts       # Client API per backend
│   │   └── data/              # Dati statici schede allenamento
│   ├── package.json
│   └── vite.config.ts
│
├── docs/                       # CONDIVISO (documentazione)
│   └── API-SPORT.md           # API che io implemento
│
└── README.md
```

---

## 🚀 Setup Frontend (FALLO ADESSO)

### 1. Apri un nuovo terminale

```powershell
cd C:\Users\marco\OneDrive\Desktop\LifeManager\frontend
```

### 2. Installa le dipendenze

```powershell
npm install
```

Questo installerà:
- React 18
- TypeScript
- Vite (build tool velocissimo)
- Tailwind CSS
- Radix UI (tutti i componenti UI)
- Lucide Icons
- Sonner (toast notifications)

**Tempo:** ~2-3 minuti

### 3. Avvia il dev server

```powershell
npm run dev
```

Dovrebbe aprire automaticamente http://localhost:3000 con la pagina Sport!

---

## 💻 Come Lavorare

### **Tu sul Frontend:**

1. **Modifica i componenti** in `frontend/src/components/`
   - `WeeklyCalendar.tsx` → Calendario settimanale
   - `WorkoutCards.tsx` → Card schede allenamento
   - `PersonalCard.tsx` → Card profilo utente
   - `ProfileDialog.tsx` → Popup configurazione profilo
   - `ProgressWidget.tsx` → Widget progressi

2. **Usa Tailwind CSS** per gli stili
   - Già configurato con `globals.css`
   - Usa classi utility: `bg-blue-500 p-4 rounded-lg`

3. **Salva e vedi live reload**
   - Vite aggiorna automaticamente la pagina
   - HMR (Hot Module Replacement) super veloce

4. **Quando finisci modifiche:**
   ```powershell
   git add .
   git commit -m "🎨 FE: Descrizione modifiche"
   git push
   ```

### **Io sul Backend:**

1. **Implemento le API** documentate in `docs/API-SPORT.md`
   - `GET /api/sport/profile`
   - `POST /api/sport/profile`
   - `GET /api/sport/scheduled`
   - `POST /api/sport/scheduled`
   - `DELETE /api/sport/scheduled/:id`
   - `GET /api/sport/templates`

2. **Creo i file JSON per storage:**
   - `data/sport_profiles.json`
   - `data/scheduled_workouts.json`

3. **Testo con curl/Postman**

4. **Quando finisco:**
   ```powershell
   git add .
   git commit -m "⚙️ BE: Descrizione API implementate"
   git push
   ```

---

## 🔄 Flusso di Lavoro

### **Scenario 1: Tu modifichi UI**

1. Tu apri Figma → modifichi design Sport
2. Esporti nuovo codice React
3. Copi dentro `frontend/src/components/`
4. Vedi live reload in `localhost:3000`
5. Se tutto ok: `git commit + push`
6. Io faccio `git pull` e vedo le tue modifiche

### **Scenario 2: Io creo nuove API**

1. Io implemento `GET /api/sport/profile` in `server.js`
2. Aggiorno `docs/API-SPORT.md` con esempi
3. `git commit + push`
4. Tu fai `git pull`
5. Leggi `docs/API-SPORT.md` per capire come chiamare l'API
6. Usi `sportApi.getProfile()` nel tuo componente React

### **Scenario 3: Integriamo**

1. Io finisco API backend
2. Tu modifichi `frontend/src/components/PersonalCard.tsx`:
   ```tsx
   import { sportApi } from '@/api/sport';
   
   useEffect(() => {
     sportApi.getProfile()
       .then(profile => setProfile(profile))
       .catch(err => toast.error('Errore caricamento profilo'));
   }, []);
   ```
3. Testi chiamando backend su `localhost:3000`
4. Tutto funziona → commit entrambi

---

## 📝 Connettere Frontend e Backend

### Configurazione attuale:

Il file `frontend/src/api/sport.ts` è già pronto! Chiama automaticamente:
```
http://localhost:3000/api/sport/*
```

### Quando backend è pronto:

**Esempio ProfileDialog.tsx:**
```tsx
import { sportApi, SportProfile } from '@/api/sport';
import { toast } from 'sonner';

function ProfileDialog() {
  const [profile, setProfile] = useState<SportProfile | null>(null);
  const [loading, setLoading] = useState(false);

  // Carica profilo all'apertura
  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      setLoading(true);
      const data = await sportApi.getProfile();
      setProfile(data);
    } catch (error) {
      toast.error('Profilo non configurato');
    } finally {
      setLoading(false);
    }
  }

  async function saveProfile(data: SportProfile) {
    try {
      setLoading(true);
      await sportApi.saveProfile(data);
      toast.success('Profilo salvato! 🎉');
      closeDialog();
    } catch (error) {
      toast.error('Errore salvataggio');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog>
      {loading ? (
        <p>Caricamento...</p>
      ) : (
        <form onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.target);
          saveProfile({
            birthdate: formData.get('birthdate'),
            height: Number(formData.get('height')),
            weight: Number(formData.get('weight')),
            frequency: Number(formData.get('frequency')),
            sports: selectedSports
          });
        }}>
          {/* Form fields */}
        </form>
      )}
    </Dialog>
  );
}
```

---

## 🛠️ Comandi Utili

### Frontend:
```powershell
cd frontend

npm run dev          # Avvia dev server (localhost:3000)
npm run build        # Build per produzione
npm install <pkg>    # Installa nuova dipendenza
```

### Backend:
```powershell
# Root del progetto
npm start            # Avvia server Express
pm2 restart shappa   # Restart in produzione
pm2 logs shappa      # Vedi logs
```

### Git:
```powershell
git pull             # Scarica modifiche
git status           # Vedi cosa è cambiato
git add .            # Aggiungi tutto
git commit -m "msg"  # Commit
git push             # Push su GitHub
```

---

## 🐛 Debug

### Frontend non parte?
```powershell
cd frontend
rm -rf node_modules
rm package-lock.json
npm install
npm run dev
```

### API non funzionano?
1. Backend attivo? `npm start` nella root
2. URL corretto? Vedi `frontend/src/api/sport.ts`
3. Token valido? Controlla localStorage
4. CORS? Aggiungi header in `server.js`:
   ```javascript
   app.use(cors({
     origin: 'http://localhost:3000',
     credentials: true
   }));
   ```

### Modifiche non si vedono?
1. Ctrl+C → Stop dev server
2. `npm run dev` → Restart
3. Ctrl+Shift+R → Hard refresh browser

---

## 📚 Risorse

### Per Te (Frontend):
- **Tailwind CSS**: https://tailwindcss.com/docs
- **Radix UI**: https://www.radix-ui.com/
- **Lucide Icons**: https://lucide.dev/icons/
- **React Docs**: https://react.dev/

### Per Me (Backend):
- **Express.js**: https://expressjs.com/
- **JWT Auth**: https://jwt.io/
- **Node.js FS**: https://nodejs.org/api/fs.html

### API Documentation:
- **`docs/API-SPORT.md`** → Specifiche complete di tutte le API

---

## 🎯 Prossimi Step

### Io (Backend):
1. [ ] Creare `routes/sport.js`
2. [ ] Implementare API profilo
3. [ ] Implementare API scheduled
4. [ ] Implementare API templates
5. [ ] Testare con curl
6. [ ] Documentare esempi in `docs/API-SPORT.md`

### Tu (Frontend):
1. [x] Fare `npm install` in `frontend/`
2. [x] Avviare `npm run dev`
3. [ ] Testare che tutti i componenti si vedano
4. [ ] Modificare stili se necessario (Tailwind)
5. [ ] Quando API pronte → sostituire localStorage con `sportApi.*`
6. [ ] Aggiungere loading states
7. [ ] Aggiungere error handling con toast

---

## 💡 Tips

### Per Te:
- **Non toccare `backend/`, `server.js`, `monitors/`** → sono roba mia
- **Lavora solo in `frontend/`** → è la tua area
- **Se serve nuova API** → dimmi e la aggiungo in `docs/API-SPORT.md`
- **Usa sempre TypeScript** → il type checking ti salva dai bug
- **Toast per feedback** → `toast.success()` / `toast.error()`

### Per Me:
- **Mantengo compatibilità** con API documentate
- **Testo sempre** prima di commit
- **Aggiorno docs** quando cambio API
- **Avviso** se modifico contratti API

---

## 📞 Comunicazione

### Tu hai bisogno di:
- Nuova API? → Mi dici cosa serve e io la implemento
- Modificare dati schede? → Chiedi e aggiorno `data/`
- Errore API? → Mandami l'errore e debuggo

### Io ho bisogno di:
- Modifiche UI? → Ti chiedo e tu sistemi Figma/React
- Feedback design? → Ti mostro e tu valuti
- Test frontend? → Ti chiedo di provare feature

---

## ✅ Checklist Inizio

### Adesso fai:
- [ ] `cd frontend`
- [ ] `npm install`
- [ ] `npm run dev`
- [ ] Apri http://localhost:3000
- [ ] Vedi la pagina Sport con calendario e schede
- [ ] Prova a cliccare sui pulsanti (dati locali per ora)
- [ ] Se tutto ok → sei pronto! 🎉

### Io intanto:
- [ ] Implemento API backend
- [ ] Creo JSON storage
- [ ] Testo endpoints
- [ ] Ti avviso quando è pronto per integrazione

---

**Domande? Scrivimi e ti aiuto! 🚀**
