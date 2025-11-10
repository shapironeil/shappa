# 🔑 TROVA IL TOKEN FIGMA - Istruzioni Corrette

## ✅ METODO CORRETTO (2024)

### Passo 1: Accedi a Figma
1. Vai su **https://www.figma.com**
2. Accedi con il tuo account

### Passo 2: Vai alle Impostazioni
1. Clicca sul tuo **avatar** (foto profilo) in **alto a sinistra** (non destra!)
2. Nel menu a discesa, clicca su **"Settings"** o **"Impostazioni"**

### Passo 3: Vai alla Scheda "Sicurezza" ⭐ IMPORTANTE!
1. Nella pagina Settings, cerca le **schede** in alto:
   - Profile
   - Account  
   - **Security** ← **CLICCA QUI!**
   - Notifications
   - etc.

2. **Clicca sulla scheda "Security"** (o "Sicurezza")

### Passo 4: Trova "Personal Access Tokens"
1. Nella pagina Security, **scorri verso il basso**
2. Cerca la sezione **"Personal access tokens"** o **"Token di accesso personale"**
3. Dovresti vedere qualcosa come:

```
┌─────────────────────────────────────┐
│  Personal access tokens             │
│                                     │
│  Generate new token                 │
│  [Button]                           │
│                                     │
│  Active tokens:                     │
│  (lista dei token esistenti)        │
└─────────────────────────────────────┘
```

### Passo 5: Genera il Token
1. Clicca su **"Generate new token"** o **"Genera nuovo token"**
2. Dai un nome (es: "LifeManager")
3. Clicca su **"Generate"** o **"Genera"**
4. **COPIA SUBITO IL TOKEN** - inizia con `figd_`

## 🎯 Link Diretto

Prova questo link diretto:
**https://www.figma.com/settings/security**

Poi scorri fino a "Personal access tokens"

## 📸 Struttura della Pagina

Quando sei nella pagina Security, dovresti vedere:

```
Settings > Security
├── Password
├── Two-factor authentication
├── Active sessions
├── Personal access tokens  ← QUI!
│   ├── Generate new token
│   └── Active tokens list
└── ...
```

## 🔍 Se Non Vedi "Security"

### Possibili Motivi:

1. **Account Gratuito**: Alcuni account gratuiti potrebbero non avere questa opzione
   - **Soluzione**: Verifica di avere un account attivo

2. **Permessi Team**: Se sei in un team, potresti non avere i permessi
   - **Soluzione**: Contatta l'admin del team

3. **Interfaccia Diversa**: Potrebbe essere chiamata diversamente
   - Cerca: "API", "Developer", "Tokens", "Access tokens"

## 🚀 Link Diretti da Provare

Prova questi link in ordine:

1. **Security Settings**: https://www.figma.com/settings/security
2. **Personal Access Tokens**: https://www.figma.com/settings/personal-access-tokens
3. **Developer Settings**: https://www.figma.com/developers

## 💡 Alternativa: Cerca nella Barra di Ricerca

1. Vai su **https://www.figma.com**
2. Clicca sulla **barra di ricerca** in alto
3. Cerca: **"personal access token"** o **"API token"**
4. Dovrebbe portarti direttamente alla sezione corretta

## ⚠️ Se Ancora Non Lo Trovi

### Verifica Account:

1. **Tipo di Account**: 
   - Vai a Settings > Account
   - Verifica se hai un account attivo o gratuito

2. **Permessi**:
   - Se sei in un team, verifica i permessi
   - Potresti aver bisogno di permessi admin

3. **Contatta Support**:
   - Vai a https://help.figma.com
   - Cerca "personal access token"
   - Contatta il supporto se necessario

## 🎯 Riepilogo Rapido

1. ✅ Vai su **https://www.figma.com**
2. ✅ Clicca **avatar** → **Settings**
3. ✅ Clicca sulla scheda **"Security"** (non Account!)
4. ✅ Scorri fino a **"Personal access tokens"**
5. ✅ Clicca **"Generate new token"**
6. ✅ Copia il token (inizia con `figd_`)

## 📝 Una Volta Ottenuto il Token

Aggiungilo al file `.env` nella root del progetto:

```env
FIGMA_API_KEY=figd_tuo-token-qui
```

**IMPORTANTE**: 
- Il token inizia sempre con `figd_`
- Non condividere mai il token
- Non committare il token su Git

## 🆘 Se Hai Ancora Problemi

Dimmi:
1. Cosa vedi quando vai in Settings?
2. Vedi la scheda "Security"?
3. Che tipo di account Figma hai? (gratuito/professional/organization)

E ti aiuto a trovare la soluzione! 🚀

