# 🍝 Integrazione GialloZafferano.it

Sistema completo per integrare ricette reali da [GialloZafferano.it](https://www.giallozafferano.it/) nel database del progetto.

## 📋 Panoramica

Il sistema utilizza `RecipeAgent` per:
- **Cercare** ricette su GialloZafferano.it
- **Scraping** dettagli completi delle ricette (ingredienti, istruzioni, tempi, difficoltà)
- **Convertire** ricette nel formato database del progetto
- **Scaricare** e salvare immagini delle ricette
- **Salvare** ricette in MongoDB Atlas

## 🚀 Utilizzo

### 1. Cercare Ricette

```bash
curl -X POST http://localhost:3000/api/recipes/search \
  -H "Content-Type: application/json" \
  -d '{
    "query": "pasta carbonara",
    "limit": 10
  }'
```

**Risposta:**
```json
{
  "success": true,
  "query": "pasta carbonara",
  "recipes": [
    {
      "title": "Pasta alla Carbonara",
      "url": "https://www.giallozafferano.it/ricette/...",
      "image": "https://...",
      "rating": "4.5",
      "difficulty": "Facile"
    }
  ],
  "count": 10
}
```

### 2. Fetch Ricetta Completa

```bash
curl -X POST http://localhost:3000/api/recipes/fetch \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://www.giallozafferano.it/ricette/Pasta-alla-Carbonara.html",
    "saveToDatabase": true,
    "downloadImage": true
  }'
```

**Risposta:**
```json
{
  "success": true,
  "recipe": {
    "id": "pasta-alla-carbonara",
    "name": "Pasta alla Carbonara",
    "description": "La classica carbonara romana...",
    "difficulty": "Facile",
    "prepTime": 10,
    "cookTime": 15,
    "servings": 4,
    "category": "primo",
    "cuisine": "italiana",
    "ingredients": [
      {
        "foodId": "pasta",
        "name": "Spaghetti",
        "quantity": 320,
        "unit": "g"
      },
      {
        "foodId": "uova",
        "name": "Uova",
        "quantity": 4,
        "unit": "pz"
      }
    ],
    "instructions": [
      "Cuocere la pasta al dente",
      "Preparare il guanciale...",
      "..."
    ],
    "tags": ["veloce", "tradizionale"],
    "imageUrl": "https://...",
    "localImageUrl": "/api/recipes/images/pasta-alla-carbonara/main.jpg",
    "source": {
      "url": "https://...",
      "site": "GialloZafferano",
      "scrapedAt": "2025-01-XX..."
    }
  }
}
```

### 3. Import Batch

```bash
curl -X POST http://localhost:3000/api/recipes/batch-import \
  -H "Content-Type: application/json" \
  -d '{
    "urls": [
      "https://www.giallozafferano.it/ricette/Pasta-alla-Carbonara.html",
      "https://www.giallozafferano.it/ricette/Risotto-alla-Milanese.html",
      "https://www.giallozafferano.it/ricette/Tiramisu.html"
    ],
    "saveToDatabase": true,
    "downloadImages": true
  }'
```

## 🗄️ Database

Le ricette vengono salvate in MongoDB Atlas nella collection `recipes`:

```javascript
{
  id: "pasta-alla-carbonara",
  name: "Pasta alla Carbonara",
  description: "...",
  difficulty: "Facile",
  prepTime: 10,
  cookTime: 15,
  servings: 4,
  category: "primo",
  cuisine: "italiana",
  ingredients: [...],
  instructions: [...],
  tags: [...],
  imageUrl: "...",
  localImageUrl: "/api/recipes/images/.../main.jpg",
  source: {
    url: "https://...",
    site: "GialloZafferano",
    scrapedAt: "..."
  },
  createdAt: "...",
  updatedAt: "..."
}
```

## 📁 Struttura File

```
data/
├── recipes/              # Cache dati ricette
└── recipe-images/        # Immagini scaricate
    └── {recipeId}/
        └── main.jpg
```

## 🔧 Configurazione

Aggiungi in `.env.private`:

```env
MONGODB_URI=mongodb+srv://...
MONGODB_DB_NAME=lifemanager
```

## 📝 Note Importanti

1. **Respect Robots.txt**: Il sistema rispetta le policy di GialloZafferano
2. **Rate Limiting**: Evita troppe richieste simultanee
3. **Error Handling**: Gestisce errori di scraping gracefully
4. **Image Storage**: Le immagini vengono salvate localmente e servite via API
5. **Database**: Le ricette vengono salvate in MongoDB per persistenza

## 🎯 Prossimi Passi

- [ ] Integrare ricette nel componente `DinnerAlternatives`
- [ ] Aggiungere ricerca ricette nella pagina dieta
- [ ] Creare sistema di rating ricette
- [ ] Aggiungere suggerimenti basati su ingredienti disponibili
- [ ] Implementare cache per ricette popolari

