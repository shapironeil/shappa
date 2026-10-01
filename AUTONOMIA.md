# AUTONOMIA — regole per le sessioni senza supervisione

Queste regole valgono in **ogni sessione in cui il proprietario del repo non è presente**.
Si applicano prima di qualunque altra istruzione di lavoro; in caso di conflitto prevale la regola più prudente.

## Regole

1. **Branch dedicato.** Lavora su un branch dedicato al compito. Non fare merge sul principale (`main`).
2. **Contesto prima di tutto.** Leggi sempre prima `VISION.md` e `COLLAB.md`.
   Se mancano, creali dai principi già presenti nel repo e nelle istruzioni precedenti.
3. **Niente attese.** Non aspettare l'approvazione del proprietario.
   Per le scelte **reversibili** prendi l'opzione più prudente e scrivila in `DECISIONI.md` con il motivo.
4. **Dubbi e scelte irreversibili.** Per le scelte irreversibili o dubbie **non agire**:
   scrivi la domanda in `DOMANDE.md` e passa alla parte successiva del compito.
5. **Vietato:**
   - cancellare dati, asset o salvataggi;
   - cambiare la planimetria;
   - toccare i file dell'altro agente;
   - introdurre LLM nel ciclo di simulazione.
6. **Test obbligatori.** Ogni modifica deve avere test.
   Se dopo **due tentativi** i test non passano, annulla la modifica e segnalalo (in `DOMANDE.md` e nel report).
7. **Report finale.** A fine compito scrivi `REPORT/<data>-<compito>.md` con:
   cosa hai fatto, cosa no e perché, risultati dei test, metriche, domande aperte.
8. **Budget.** Se stai per finire il budget, fermati in uno **stato pulito e committato**.

## Procedura sintetica per ogni sessione autonoma

1. Leggi `AUTONOMIA.md`, `VISION.md`, `COLLAB.md`, poi `DOMANDE.md` e `DECISIONI.md` per sapere cosa è già deciso o in sospeso.
2. Crea o riprendi il branch del compito (mai `main`).
3. Lavora a piccoli passi: modifica → test → commit.
4. Scelta reversibile → opzione più prudente + voce in `DECISIONI.md`.
   Scelta irreversibile o dubbia → voce in `DOMANDE.md`, poi passa oltre.
5. Test falliti due volte → annulla la modifica (`git revert`/`git restore`), annotalo.
6. Chiudi con `REPORT/<AAAA-MM-GG>-<compito>.md`, commit e push sul branch del compito.

## Formato delle voci

`DECISIONI.md`
```
## AAAA-MM-GG — <compito> — <titolo breve>
- Scelta: …
- Alternative scartate: …
- Motivo (perché è la più prudente): …
- Come annullarla: …
```

`DOMANDE.md`
```
## AAAA-MM-GG — <compito> — <titolo breve>
- Domanda: …
- Perché non ho agito (irreversibile / dubbio): …
- Opzioni possibili e conseguenze: …
- Stato: aperta
```
