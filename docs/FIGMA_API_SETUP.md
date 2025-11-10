# 🔑 Come Ottenere la Figma API Key

## Passo 1: Accedi a Figma

1. Vai su [https://www.figma.com](https://www.figma.com)
2. Accedi con il tuo account (devi avere un abbonamento Figma attivo)

## Passo 2: Vai alle Impostazioni Account

1. Clicca sul tuo avatar in alto a destra
2. Seleziona **Settings** (Impostazioni)

## Passo 3: Genera Personal Access Token

1. Nella pagina Settings, scorri fino alla sezione **Account**
2. Cerca la sezione **Personal access tokens** o **Access tokens**
3. Clicca su **Create new token** o **Generate new token**
4. Dai un nome al token (es: "LifeManager Agent System")
5. Clicca su **Generate token**
6. **IMPORTANTE**: Copia subito il token! Non lo vedrai più dopo questa schermata

## Passo 4: Aggiungi al Progetto

Aggiungi il token al file `.env` nella root del progetto:

```env
FIGMA_API_KEY=figd_your-token-here
```

**Nota**: Il token inizia sempre con `figd_`

## Passo 5: Ottieni il File Key

Per usare l'API con un file Figma specifico:

1. Apri il file Figma nel browser
2. Guarda l'URL nella barra degli indirizzi
3. L'URL sarà simile a: `https://www.figma.com/file/ABC123xyz/MyDesign`
4. Il **File Key** è la parte dopo `/file/` → `ABC123xyz`

## Link Diretti

- **Settings Account**: https://www.figma.com/settings
- **Documentazione API**: https://www.figma.com/developers/api
- **Personal Access Tokens**: https://www.figma.com/developers/api#access-tokens

## Sicurezza

⚠️ **IMPORTANTE**: 
- Non condividere mai il tuo token
- Non committare il token su Git (è già nel `.gitignore`)
- Se il token viene compromesso, rigeneralo immediatamente
- Il token ha accesso completo ai tuoi file Figma

