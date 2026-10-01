# VISION

> Prima stesura ricavata dai documenti già presenti nel repo (`.cursorrules`, `CONFIGURATION_RULES.md`,
> `WORKFLOW.md`, `AGENT_SYSTEM_GUIDE.md`, `README.md`) e dalle istruzioni date per Verbale Studio.
> Da rivedere e correggere dal proprietario: dove questo file e le sue indicazioni divergono, valgono le sue.

## Cos'è questo repository

Un monorepo personale (Shappa / LifeManager) che raccoglie più progetti:

| Area | Cartella | Scopo |
|---|---|---|
| Shappa / LifeManager | `server.js`, `src/`, `frontend/`, `agents/`, `monitors/` | App web personale: monitor prodotti Shopify con notifiche Discord, dashboard, sistema di agenti coordinati |
| Giochi / simulazioni | `src/games/` (es. `fightin-simulation`, Maze Runner) | Giochi e simulazioni 3D nel browser |
| Verbale Studio | `verbale-studio/` | App **locale** per revisionare i transcript delle riunioni Teams in sincrono con il video, preparare l'email di riepilogo dei checkpoint e tenerne lo storico |

## Principi comuni

- **Non perdere mai dati.** Salvataggi, archivi, asset e configurazioni funzionanti non si cancellano né si sovrascrivono senza consenso.
- **Credenziali protette.** `.env.private` e i file con credenziali non si modificano; si possono solo aggiungere nuove variabili.
- **Configurazioni funzionanti non si cambiano** senza motivo e senza test.
- **Qualità professionale e semplicità d'uso**: interfaccia curata, testi in italiano, nessun passaggio tecnico superfluo per l'utente.
- **Prudenza**: tra due opzioni equivalenti si sceglie quella reversibile e meno invasiva.

## Principi per area

### Shappa / LifeManager
- Architettura **online-first**: i dati runtime stanno sul server/DB (MongoDB Atlas), non nel browser (`WORKFLOW.md`: niente `localStorage` per dati runtime).
- Task complessi passano dal **Coordinator** del sistema agenti (`AGENT_SYSTEM_GUIDE.md`).

### Giochi / simulazioni
- La **planimetria** (layout dei livelli/mappe) non si cambia.
- Il **ciclo di simulazione** resta deterministico: **nessun LLM** al suo interno.

### Verbale Studio (`verbale-studio/`)
- Gira **solo in locale** sul PC dell'utente (Windows aziendale, Node.js standalone senza installazione), nessun cloud obbligatorio.
- Funziona **senza AI**; l'AI è facoltativa (Ollama locale; Claude API solo se configurata).
- **I dati dell'utente sono sacri**: `data\`, `Archivio\`, `Backup\`, `Registrazioni\` non si toccano mai negli aggiornamenti; salvataggi su più livelli (versioni, cestino, backup giornaliero, copia aggiuntiva).
- Gli aggiornamenti si distribuiscono come zip che contiene solo il programma (`app\` + file di avvio).
- Design ispirato a Claude: sobrio, caldo, professionale; italiano.
- Revisione (lavoro sul transcript) e dashboard del checkpoint (consultazione e consegna) hanno scopi diversi e restano distinte.
- Ogni modifica va verificata con prove automatiche nel browser (Playwright) prima della consegna.
