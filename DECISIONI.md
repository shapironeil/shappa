# DECISIONI

Scelte reversibili prese in autonomia (vedi `AUTONOMIA.md`). Le più recenti in alto.

## 2026-10-01 — Verbale Studio nel portale — Sviluppo spostato su hspiteammanager
- Scelta: Verbale Studio prosegue dentro il portale HSPI Team Manager (repo shapironeil/hspiteammanager); la copia in `verbale-studio/` resta intatta.
- Alternative scartate: tenere due versioni sviluppate in parallelo (doppio lavoro, archivi separati).
- Motivo: richiesta del proprietario ("dobbiamo lavorare su HSP Team Manager"); un solo archivio nei progetti del portale.
- Come annullarla: continuare a usare `verbale-studio/` v1.5.0, che non è stata toccata.

## 2026-10-01 — regole di autonomia — Creazione di VISION.md, COLLAB.md e CLAUDE.md
- Scelta: creati `VISION.md` e `COLLAB.md` ricavandoli dai documenti già presenti (`.cursorrules`, `CONFIGURATION_RULES.md`, `WORKFLOW.md`, `AGENT_SYSTEM_GUIDE.md`) e dalle istruzioni date per Verbale Studio; creato un `CLAUDE.md` minimo che rimanda ad `AUTONOMIA.md`.
- Alternative scartate: lasciarli da creare alla prima sessione autonoma (le regole avrebbero avuto riferimenti a file inesistenti); scrivere un `CLAUDE.md` completo (rischio di duplicare e contraddire i documenti esistenti).
- Motivo: senza un `CLAUDE.md` le sessioni future di Claude Code non leggono automaticamente `AUTONOMIA.md`; tenerlo minimo evita di introdurre regole nuove.
- Come annullarla: eliminare o modificare i tre file; nessun codice dipende da essi.
