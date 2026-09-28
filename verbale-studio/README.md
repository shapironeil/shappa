# Verbale Studio

App **locale e personale** per revisionare i transcript delle riunioni Teams in sincrono con la registrazione, preparare l'email di riepilogo con il template giusto e tenere lo storico dei checkpoint per progetto (es. ATAC).

- Gira solo sul tuo computer (`http://localhost:4310`, raggiungibile solo da questa macchina).
- Lavora **nella cartella in cui la metti**: legge i video e i transcript presenti lì e salva l'archivio in `data/` nella stessa cartella.
- Funziona **senza AI e senza token**. Opzionali: AI locale gratuita (Ollama) e Claude API.

## Pacchetto pronto (Windows e Mac)

1. Scarica `release/VerbaleStudio.zip` e **estrailo** (tasto destro → *Estrai tutto…*), ad esempio in Documenti. Se lo apri direttamente dall'interno dello zip, quello che salvi va perso; in quel caso l'app mostra un avviso rosso.
2. Avvio:
   - **Windows:** doppio clic su `VerbaleStudio.exe`. Se compare “PC protetto da Windows”: *Ulteriori informazioni → Esegui comunque*. Si apre una finestra nera (il motore dell'app, da lasciare aperta) e il browser.
   - **Mac (Apple Silicon):** tasto destro su `Avvia su Mac.command` → *Apri* (serve solo la prima volta).
   - **Se l'eseguibile è bloccato** (es. su un PC aziendale): installa Node.js e usa `alternativa-node/Avvia con Node (Windows).bat`.
3. Per chiudere l'app chiudi la finestra nera.

```
VerbaleStudio\
  VerbaleStudio.exe
  Registrazioni\                        ← qui scarichi video e transcript di Teams (opzionale)
  Archivio\ATAC\2026-09-28 Checkpoint settimanale\
      Registrazione.mp4                 ← copia del video trascinato nell'app
      Transcript originale.vtt          ← copia del transcript trascinato
      Transcript revisionato.txt        ← aggiornato a ogni salvataggio
      Email di riepilogo.txt            ← aggiornata a ogni salvataggio
  data\                                 ← archivio interno dell'app (checkpoint, template, apprendimento)
```

I file **trascinati nella finestra** vengono copiati in `Archivio/<progetto>/<data> <titolo>/`; la cartella si rinomina se cambi data o titolo. I file già presenti nella cartella di lavoro (es. `Registrazioni/`) vengono invece collegati senza spostarli. Il menu `⋯` → *Apri cartella del checkpoint* apre la cartella in Esplora risorse. Per il backup basta copiare l'intera cartella `VerbaleStudio`.

## Flusso di lavoro

1. **Cartella di lavoro** (menu a sinistra): trovi i video e i transcript presenti nella cartella (esclusa `Archivio/`). *Nuovo checkpoint* crea il checkpoint dal file, con la data letta dal nome, e collega anche il file “gemello” (video ↔ transcript). I video vengono collegati, non copiati né spostati. In alternativa puoi trascinare i file direttamente nella finestra.
2. **Revisione** (colonna destra): il transcript scorre in sincrono con il video, parola per parola.
   - Clic sull'orario per saltare a quel punto; clic sul testo per modificarlo (`Invio` salva, `Tab` passa al blocco successivo).
   - Clic sul nome per rinominare lo speaker ovunque; ⚑ segna i blocchi da verificare; *Pulizia rapida* toglie gli intercalari.
   - Le etichette colorate (Prossimo passo, Attenzione…) indicano i punti rilevati dall'analisi; il filtro *Punti rilevati* mostra solo quelli.
3. **Analisi** (scheda in basso a sinistra), tutto da confermare a mano:
   - *Temi del checkpoint precedente*: per ogni attività in corso, prossimo passo o punto di attenzione dell'incontro precedente dice se è stato discusso, dove (orari cliccabili) e se sembra completato, in corso o bloccato. Un clic la aggiunge alla sezione giusta.
   - *Nuovi punti rilevati*: frasi che sembrano attività completate, prossimi passi, criticità o decisioni, con scadenze (“entro venerdì”, “24/10”) e owner rilevati. Puoi correggere il testo prima di aggiungerlo oppure scartarlo con ✕.
   - *Argomenti principali*: i temi più citati; clic per cercarli nel transcript.
   - Il rilevatore **impara dalle tue scelte**: ogni punto aggiunto o scartato lo rende più preciso sul progetto.
4. **Punti discussi**: le sezioni del template scelto (menu in alto nella scheda).
   - *Riporta dal precedente* copia le voci ancora aperte; ✓ le segna come completate.
   - `Alt+1…9` aggiunge alla sezione il testo selezionato nel transcript.
   - “↺ N collegate” mostra la storia di quella voce nei checkpoint passati.
5. **Email**: il testo si compone dal template. *Copia per Outlook* copia la versione formattata; *.eml* scarica una bozza.
6. **Storico**: timeline, punti di attenzione aperti con le scadenze e *Filo delle attività* (come una voce è passata da prossimo passo a in corso a completata).
7. **Prossimo checkpoint**: i temi previsti per il prossimo incontro, calcolati dallo storico.

## Template email

Nella sezione *Template email* trovi i modelli predefiniti:

- Checkpoint settimanale (formato ATAC)
- Stato avanzamento lavori (SAL)
- Verbale di riunione formale
- Riunione tecnica / troubleshooting
- Kick-off di progetto
- Riepilogo breve

*Duplica* crea una copia modificabile: sezioni, titoli, tipo (elenco, numerato, azioni con owner e deadline, paragrafo), ruolo, saluto, chiusura e firma. Il **ruolo** di ogni sezione (completato, in corso, prossimo passo, attenzione, decisione, informazione) collega tra loro template diversi: riporto dal checkpoint precedente, analisi, storico e previsione funzionano con qualsiasi template.

## AI locale (Ollama), facoltativa

Dalla sezione *AI locale*:

1. **Installa Ollama**: su Windows l'app scarica l'installer e lo apre.
2. **Scarica un modello**: consigliato `qwen2.5:3b`, circa 2 GB; dopo il download funziona anche offline.
3. **Addestra**: crea un modello personalizzato (`verbale-atac`) con il tuo stile, il glossario e gli esempi dai tuoi verbali. Ogni frase del transcript che trasformi in una voce approvata diventa un esempio. Riaddestralo ogni tanto.
4. Compaiono i pulsanti ✨ per riformulare un punto in stile verbale e per correggere un blocco del transcript.

Tutto resta sul computer.

## Sviluppo

```
npm install
npm start               # avvia dal codice sorgente (cartella di lavoro = questa cartella)
npm run build:exe       # crea dist/VerbaleStudio.exe (Node SEA, nessuna installazione richiesta)
npm run build:zip       # crea release/VerbaleStudio.zip (Windows + Mac + alternativa Node)
```
