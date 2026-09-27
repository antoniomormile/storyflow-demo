# StoryFlow — Atelier 2.0

Seconda direzione visiva del prototipo. Il wordmark visibile riprende **StoryAtelier** dai mockup approvati; repository, URL pubblico e chiave di storage StoryFlow non cambiano.

## Identità

Inchiostro bordeaux `#100c10`, superfici prugna `#1b141a`, testo avorio `#f7eee4`, oro caldo `#dfbc83` e rosa `#ee91aa`. Le azioni principali usano un gradiente rubino con testo chiaro. Tre firme ricorrenti: penna editoriale lineare, segnalibro digitale e sottile filetto di capitolo con rombo. Nessun font esterno, nuova libreria runtime, texture pesante o cornice barocca.

Titoli serif di sistema, testo funzionale sans-serif. Navigazione inferiore flottante su smartphone e tablet, superficie traslucida con fallback scuro, focus visibile e animazioni riducibili. Il reader mantiene i controlli fissi fuori da antenati trasformati.

## Pagine e sorgenti

Tutte le 56 pagine esistenti restano file HTML reali nella root. Home e paywall ricevono una gerarchia chapter-first; le altre schermate ereditano il nuovo sistema condiviso. Non vengono introdotti hash router, ZIP, file binari di codice o redirect che mascherano 404.

- `assets/css/atelier.css`: token e stile, caricato dopo `styles.css`.
- `assets/js/atelier.js`: wordmark, Home, paywall e navigazione attiva; utilizza gli handler originali.
- `assets/js/data.js`, `views.js`, `app.js`: catalogo, componenti e logica esistenti, preservati.
- `tools/build-atelier.mjs`: genera le 56 pagine e verifica i riferimenti locali.
- `docs/ATELIER_PAGE_AUDIT.json`: elenco di tutte le pagine e risultato del controllo statico.

Ricostruzione opzionale: `node tools/build-atelier.mjs`. Solo verifica: `node tools/build-atelier.mjs --check`. Non usare un generatore precedente che non carichi `atelier.js`.

Per consultare il sito non sono richiesti Node o npm. Per un server locale usare, dalla root, `python3 -m http.server 8000`.

## Funzionalità preservate

Accesso ospite e login dimostrativi, onboarding, ricerca, filtri, classifiche, preferiti, libreria, lettura webtoon e manga, luminosità, riduzione movimento, progresso, fine capitolo, sblocco sequenziale, bundle, wallet, acquisti dimostrativi, Free Pass, annunci facoltativi, check-in, missioni, Premium, impostazioni, notifiche e stati di sistema. Shorts e fumetto immersivo restano concept.

La nuova grafica non modifica i prezzi o gli accessi. Premium **non** diventa lettura illimitata. Un annuncio assegna i Credits bonus previsti dalla configurazione e non promette lo sblocco gratuito immediato. Nessuna ricarica sblocca automaticamente un capitolo. Tutti gli acquisti, login e annunci restano simulazioni.

## Verifiche e limiti

Il controllo statico comprende tutte le pagine, CSS, script, immagini e collegamenti HTML, inclusi i cinque link della barra inferiore. Test di rendering Chromium eseguiti in una fixture locale: il codice UI/controller è reale, ma storage e destinazioni di navigazione sono adattati perché l'ambiente di lavoro non permette la navigazione del browser. La suite delle interazioni preesistente ha superato 52 verifiche (saldo, conferme, annullamento, acquisti, accessi, Premium, pass, filtri e altro).

Non è un collaudo su iPhone/iPad fisici, Safari o Android reali, né una certificazione di accessibilità. La verifica del sito pubblico e del deployment è distinta dai test locali.

## Pubblicazione

Indirizzo invariato: https://antoniomormile.github.io/storyflow-demo/

Sorgenti su `main`; file statici pubblicati su `gh-pages`. Le modifiche conservano la cronologia e non richiedono di ricreare il repository o modificare il dominio.
