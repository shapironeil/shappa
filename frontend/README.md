
  # 🏋️ Shappa Frontend - React + Vite

Frontend moderno per l'applicazione Shappa, sviluppato con React, TypeScript e Vite.

Questo è il contenuto della pagina Sport esportata da Figma e integrata con il backend Node.js esistente.

## 📁 Struttura del Progetto

```
frontend/
├── src/
│   ├── App.tsx                    # App principale (solo contenuto Sport)
│   ├── main.tsx                   # Entry point
│   ├── components/                # Componenti Sport da Figma
│   │   ├── WeeklyCalendar.tsx    # Calendario settimanale
│   │   ├── WorkoutCards.tsx      # Card schede allenamento
│   │   ├── PersonalCard.tsx      # Card profilo personale
│   │   ├── ProgressWidget.tsx    # Widget progressi
│   │   ├── ProfileDialog.tsx     # Dialog configurazione profilo
│   │   └── ui/                   # Componenti UI (Radix + shadcn)
│   ├── data/
│   │   └── workoutPrograms.ts    # Schede allenamento predefinite
│   └── styles/
│       └── globals.css           # Stili globali Tailwind
│
├── package.json                   # Dipendenze React
├── vite.config.ts                # Configurazione Vite
└── tsconfig.json                 # Configurazione TypeScript
```

## 🚀 Quick Start

### Installazione
```bash
cd frontend
npm install
```

### Sviluppo
```bash
npm run dev
```
Apre su http://localhost:3000

### Build Produzione
```bash
npm run build
```

## 🔌 Integrazione con Backend

Il frontend si connette al backend Node.js esistente su `http://localhost:3000/api`

### API Endpoints da Implementare

```typescript
// Profilo Sport
GET    /api/sport/profile
POST   /api/sport/profile
PUT    /api/sport/profile

// Allenamenti Programmati
GET    /api/sport/scheduled
POST   /api/sport/scheduled
DELETE /api/sport/scheduled/:id

// Schede Allenamento
GET    /api/sport/templates
```

## 📦 Tecnologie

- React 18 + TypeScript
- Vite (build tool)
- Tailwind CSS
- Radix UI + shadcn/ui
- Lucide React (icone)
- Sonner (toast)

## 🎨 Design System

Usa Tailwind CSS con palette che matcha Venus Design System del backend.

## 📝 Note

**Stato Attuale:**
- ✅ UI completa da Figma
- ✅ Design system Tailwind
- ⏳ DA FARE: Connessione API backend
- ⏳ DA FARE: Integrazione sidebar esistente
  