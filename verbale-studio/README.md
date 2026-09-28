# Verbale Studio

App **locale e personale** per revisionare i transcript dei checkpoint Teams in sincrono con la registrazione, preparare l'email di riepilogo e tenere lo storico dei checkpoint per progetto (es. ATAC).

- Gira solo sul tuo computer (`http://localhost:4310`, accessibile solo da questa macchina).
- Tutto viene salvato nella cartella `data/` accanto all'app: nessun cloud, nessun account.
- Funziona **senza AI**. Se in futuro inserisci una API key Claude nelle Impostazioni compaiono i pulsanti “Compila con AI”, “Correggi con AI” e “Previsione con AI”.

## Avvio

Serve [Node.js](https://nodejs.org) (versione 18 o superiore).

- **Windows**: doppio clic su `Avvia Verbale Studio.bat`
- **Mac**: doppio clic su `Avvia Verbale Studio.command`
- Da terminale: `npm install` (solo la prima volta) e poi `npm start`

Si apre il browser su `http://localhost:4310`. Per chiudere l'app chiudi la finestra del terminale.

## Flusso di lavoro

1. **Nuovo checkpoint** (menu a sinistra): scegli la data della riunione.
2. Trascina nella finestra il **video** scaricato da Teams (MP4) e il **transcript** (`.vtt` o `.docx`). Vengono copiati in `data/`.
3. **Revisione** (colonna destra): il testo scorre in sincrono con il video, parola per parola, come il testo di una canzone.
   - clic sull'orario → salta a quel punto; clic sul testo → modifica (`Invio` salva, `Tab` passa al blocco successivo);
   - clic sul nome → rinomina lo speaker ovunque;
   - ⚑ segna i punti da verificare; *Pulizia rapida* toglie gli intercalari (ehm, eh…) e le parole ripetute;
   - cerca / sostituisci in tutto il transcript; ogni modifica massiva si può annullare dal messaggio in basso.
   - `Ctrl+Spazio` play/pausa anche mentre scrivi, `Alt+←` riascolta gli ultimi 3 secondi.
4. **Punti discussi** (in basso a sinistra): compila Attività completate / In corso / Prossimi passi / Punti di attenzione.
   - *Riporta dal precedente* copia attività in corso, prossimi passi e punti di attenzione del checkpoint precedente: poi segni con ✓ quelle concluse;
   - seleziona una frase nel transcript e premi `Alt+1…4` per aggiungerla alla sezione corrispondente;
   - trascina le voci per spostarle tra le sezioni.
5. **Email**: il testo si genera automaticamente nello stesso formato delle email di riepilogo. *Copia per Outlook* copia la versione formattata con gli elenchi; *.eml* scarica una bozza apribile con Outlook.
6. **Storico checkpoint**: timeline di tutti i checkpoint, punti di attenzione ancora aperti e deadline scadute.
7. **Prossimo checkpoint**: temi previsti per la prossima riunione, calcolati dallo storico (deadline vicine, prossimi passi ricorrenti, attività in corso da troppo tempo).

## Dove sono i dati

```
data/
  settings.json                       firma, (eventuale) API key
  projects/atac/project.json          destinatari, oggetto, glossario, email di esempio
  projects/atac/checkpoints/2026-09-28-xxxx/
      checkpoint.json                 transcript revisionato, punti, email, note
      video.mp4                       registrazione
```

Per fare un backup basta copiare la cartella `data/`. La cartella è esclusa da git.
