# COLLAB — come si collabora su questo repository

> Prima stesura ricavata dai documenti del repo e dalle istruzioni del proprietario.
> Le regole per le sessioni senza supervisione sono in `AUTONOMIA.md` e hanno la precedenza.

## Ruoli

- **Proprietario**: decide obiettivi, priorità e tutto ciò che è irreversibile. Risponde alle domande in `DOMANDE.md`.
- **Agenti di sviluppo** (Claude Code e altri assistenti): implementano, testano, documentano.
  Ogni agente lavora sui propri file e sul proprio branch.

## Convivenza tra agenti

- **Non toccare i file dell'altro agente.** Se un compito li richiede, scrivi la necessità in `DOMANDE.md` e prosegui con il resto.
- Prima di modificare un file, controlla con `git log` chi lo ha toccato di recente; se è stato creato o mantenuto da un altro agente, consideralo suo.
- Un branch per compito; niente merge su `main` da parte degli agenti: il merge lo decide il proprietario.

## File di coordinamento (alla radice)

| File | Uso |
|---|---|
| `AUTONOMIA.md` | Regole per le sessioni senza supervisione |
| `VISION.md` | Obiettivi e principi del progetto |
| `COLLAB.md` | Questo file: ruoli e modalità di collaborazione |
| `DECISIONI.md` | Scelte reversibili prese in autonomia, con motivo e modo per annullarle |
| `DOMANDE.md` | Domande aperte per il proprietario (scelte irreversibili o dubbie) |
| `REPORT/<data>-<compito>.md` | Resoconto di fine compito |

## Regole di lavoro

- **File protetti** (`CONFIGURATION_RULES.md`): `.env.private` e i file con credenziali non si modificano; si possono aggiungere nuove variabili senza toccare le esistenti.
- **Dati e salvataggi**: mai cancellare dati, asset, archivi o backup.
- **Test**: ogni modifica ha un test (unitario o end-to-end nel browser). Dopo due tentativi falliti la modifica si annulla e si segnala.
- **Commit** piccoli e descrittivi, in italiano; push sul branch del compito.
- **Comunicazione con il proprietario**: in italiano, semplice e concreta; dire chiaramente cosa è stato verificato e cosa no.
