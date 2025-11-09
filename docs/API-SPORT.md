# 🏋️ API Sport - Documentazione Backend

API REST per gestire profili utente, allenamenti programmati e schede di allenamento.

## 🔐 Autenticazione

Tutte le API richiedono autenticazione tramite JWT token:
```
Authorization: Bearer <token>
```

---

## 📊 Profilo Sport

### GET /api/sport/profile

Recupera il profilo sport dell'utente autenticato.

**Response 200:**
```json
{
  "birthdate": "1995-03-15",
  "height": 175,
  "weight": 70,
  "frequency": 3,
  "sports": ["palestra", "cardio"]
}
```

**Response 404:** Profilo non configurato
```json
{
  "error": "Profile not found"
}
```

---

### POST /api/sport/profile

Crea o aggiorna il profilo sport.

**Request Body:**
```json
{
  "birthdate": "1995-03-15",
  "height": 175,
  "weight": 70,
  "frequency": 3,
  "sports": ["palestra", "cardio"]
}
```

**Response 200:**
```json
{
  "success": true,
  "profile": {
    "birthdate": "1995-03-15",
    "height": 175,
    "weight": 70,
    "frequency": 3,
    "sports": ["palestra", "cardio"],
    "userId": "user123",
    "updatedAt": "2025-11-09T12:00:00Z"
  }
}
```

**Validazione:**
- `birthdate`: required, formato ISO date
- `height`: required, numero 100-250 (cm)
- `weight`: required, numero 30-300 (kg)
- `frequency`: required, numero 1-7 (giorni/settimana)
- `sports`: required, array non vuoto

---

## 📅 Allenamenti Programmati

### GET /api/sport/scheduled

Recupera tutti gli allenamenti programmati dell'utente.

**Response 200:**
```json
[
  {
    "id": "sched123",
    "dayIndex": 0,
    "workoutId": 1,
    "workoutTitle": "Full Body Workout",
    "workoutType": "strength",
    "duration": 60,
    "userId": "user123",
    "createdAt": "2025-11-09T10:00:00Z"
  },
  {
    "id": "sched124",
    "dayIndex": 2,
    "workoutId": 2,
    "workoutTitle": "Cardio HIIT",
    "workoutType": "cardio",
    "duration": 45,
    "userId": "user123",
    "createdAt": "2025-11-09T10:30:00Z"
  }
]
```

**dayIndex:**
- 0 = Lunedì
- 1 = Martedì
- 2 = Mercoledì
- 3 = Giovedì
- 4 = Venerdì
- 5 = Sabato
- 6 = Domenica

---

### POST /api/sport/scheduled

Aggiunge un allenamento al calendario settimanale.

**Request Body:**
```json
{
  "dayIndex": 0,
  "workoutId": 1,
  "workoutTitle": "Full Body Workout",
  "workoutType": "strength",
  "duration": 60
}
```

**Response 201:**
```json
{
  "success": true,
  "scheduled": {
    "id": "sched125",
    "dayIndex": 0,
    "workoutId": 1,
    "workoutTitle": "Full Body Workout",
    "workoutType": "strength",
    "duration": 60,
    "userId": "user123",
    "createdAt": "2025-11-09T12:00:00Z"
  }
}
```

**Response 400:** Validazione fallita
```json
{
  "error": "Invalid dayIndex. Must be 0-6."
}
```

---

### DELETE /api/sport/scheduled/:id

Rimuove un allenamento programmato.

**Response 200:**
```json
{
  "success": true,
  "message": "Workout removed from schedule"
}
```

**Response 404:**
```json
{
  "error": "Scheduled workout not found"
}
```

---

## 💪 Schede Allenamento (Templates)

### GET /api/sport/templates

Recupera tutte le schede di allenamento predefinite.

**Response 200:**
```json
[
  {
    "id": 1,
    "name": "Full Body Beginner",
    "type": "strength",
    "difficulty": "beginner",
    "duration": 60,
    "exercises": [
      {
        "name": "Squat",
        "sets": 3,
        "reps": 12,
        "rest": 90
      },
      {
        "name": "Bench Press",
        "sets": 3,
        "reps": 10,
        "rest": 90
      }
    ],
    "description": "Allenamento completo per principianti",
    "imageUrl": "/assets/workouts/fullbody-beginner.jpg"
  },
  {
    "id": 2,
    "name": "HIIT Cardio",
    "type": "cardio",
    "difficulty": "intermediate",
    "duration": 45,
    "exercises": [
      {
        "name": "Burpees",
        "sets": 4,
        "reps": 15,
        "rest": 60
      },
      {
        "name": "Mountain Climbers",
        "sets": 4,
        "reps": 20,
        "rest": 60
      }
    ],
    "description": "Alta intensità per bruciare calorie",
    "imageUrl": "/assets/workouts/hiit-cardio.jpg"
  }
]
```

**Campi:**
- `type`: `"strength" | "cardio" | "flexibility" | "mixed"`
- `difficulty`: `"beginner" | "intermediate" | "advanced"`
- `duration`: minuti
- `exercises`: array con nome, sets, reps, rest (secondi)

---

## 🗂️ Schema Database

### Tabella: sport_profiles
```sql
CREATE TABLE sport_profiles (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) UNIQUE NOT NULL,
  birthdate DATE NOT NULL,
  height INT NOT NULL,
  weight INT NOT NULL,
  frequency INT NOT NULL,
  sports JSON NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### Tabella: scheduled_workouts
```sql
CREATE TABLE scheduled_workouts (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  day_index INT NOT NULL,
  workout_id INT NOT NULL,
  workout_title VARCHAR(255) NOT NULL,
  workout_type VARCHAR(50) NOT NULL,
  duration INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  UNIQUE KEY unique_user_day (user_id, day_index)
);
```

### Tabella: workout_templates
```sql
CREATE TABLE workout_templates (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL,
  difficulty VARCHAR(50) NOT NULL,
  duration INT NOT NULL,
  exercises JSON NOT NULL,
  description TEXT,
  image_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 📝 Note Implementazione

### Storage Attuale
Il backend usa **file JSON** per storage:
- `data/users.json` - Utenti e autenticazione
- `data/sport_profiles.json` - Profili sport (DA CREARE)
- `data/scheduled_workouts.json` - Allenamenti programmati (DA CREARE)

### File da Creare in server.js

```javascript
// routes/sport.js
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');

// GET /api/sport/profile
router.get('/profile', authenticateToken, async (req, res) => {
  // Leggi da data/sport_profiles.json
  // Filtra per req.user.userId
  // Return profilo o 404
});

// POST /api/sport/profile
router.post('/profile', authenticateToken, async (req, res) => {
  // Valida body
  // Salva in data/sport_profiles.json
  // Return success + profilo
});

// GET /api/sport/scheduled
router.get('/scheduled', authenticateToken, async (req, res) => {
  // Leggi da data/scheduled_workouts.json
  // Filtra per req.user.userId
  // Return array allenamenti
});

// POST /api/sport/scheduled
router.post('/scheduled', authenticateToken, async (req, res) => {
  // Valida body
  // Salva in data/scheduled_workouts.json
  // Return success + scheduled
});

// DELETE /api/sport/scheduled/:id
router.delete('/scheduled/:id', authenticateToken, async (req, res) => {
  // Leggi data/scheduled_workouts.json
  // Trova per id + userId
  // Rimuovi e salva
  // Return success
});

// GET /api/sport/templates
router.get('/templates', authenticateToken, async (req, res) => {
  // Leggi da frontend/src/data/workoutPrograms.ts
  // O crea data/workout_templates.json
  // Return array templates
});

module.exports = router;
```

### Integrazione in server.js

```javascript
// server.js
const sportRoutes = require('./routes/sport');

app.use('/api/sport', sportRoutes);
```

---

## 🧪 Testing con curl

```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"password"}'

# Salva token
TOKEN="eyJhbGc..."

# Crea profilo
curl -X POST http://localhost:3000/api/sport/profile \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "birthdate": "1995-03-15",
    "height": 175,
    "weight": 70,
    "frequency": 3,
    "sports": ["palestra", "cardio"]
  }'

# Get profilo
curl http://localhost:3000/api/sport/profile \
  -H "Authorization: Bearer $TOKEN"

# Programma allenamento
curl -X POST http://localhost:3000/api/sport/scheduled \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "dayIndex": 0,
    "workoutId": 1,
    "workoutTitle": "Full Body",
    "workoutType": "strength",
    "duration": 60
  }'

# Get allenamenti
curl http://localhost:3000/api/sport/scheduled \
  -H "Authorization: Bearer $TOKEN"

# Get templates
curl http://localhost:3000/api/sport/templates \
  -H "Authorization: Bearer $TOKEN"
```

---

## ✅ Checklist Implementazione

Backend (server.js):
- [ ] Creare `routes/sport.js`
- [ ] Implementare GET /api/sport/profile
- [ ] Implementare POST /api/sport/profile
- [ ] Implementare GET /api/sport/scheduled
- [ ] Implementare POST /api/sport/scheduled
- [ ] Implementare DELETE /api/sport/scheduled/:id
- [ ] Implementare GET /api/sport/templates
- [ ] Creare `data/sport_profiles.json`
- [ ] Creare `data/scheduled_workouts.json`
- [ ] Aggiungere validazione input
- [ ] Testare con curl/Postman

Frontend (React):
- [ ] Sostituire localStorage con fetch API
- [ ] Gestire loading states
- [ ] Gestire errori con toast
- [ ] Aggiungere refresh dopo mutations
- [ ] Configurare proxy Vite per /api
