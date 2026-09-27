# Atelier 2.0 — verifiche

## Sorgente e copertura

Base di lavoro: commit `b968ab575ac62751cdb1c2027f27a632a0cfcc4b`. Le copie locali dei sorgenti principali sono state confrontate tramite Git blob SHA con i file del repository. Nessuna modifica alla logica di `data.js`, `views.js` o `app.js` né al foglio base `styles.css`.

56 pagine HTML esistenti aggiornate. Il report generato `ATELIER_PAGE_AUDIT.json` elenca ogni pagina e controlla tutti i riferimenti locali `href` e `src`: nessun riferimento mancante. Il report `ATELIER_HTTP_AUDIT.json` è prodotto dal runner GitHub verificando pagine e asset su un server HTTP sotto `/storyflow-demo/`.

## Rendering locale

56 pagine controllate a ciascuna delle larghezze 320, 390, 834 e 1440 px. Nessun errore JavaScript, nessuna immagine mancante e nessun overflow orizzontale del documento nelle esecuzioni completate. La pagina Welcome presentava inizialmente 2 px di overflow a 390 px; corretta e ricontrollata.

Home, paywall, Esplora, libreria, profilo, onboarding, reader e schermate Premium/crediti sono stati anche renderizzati in PNG per verifica visiva. La CTA del paywall è stata avvicinata all'inizio della pagina su smartphone.

Metodo: Chromium headless, fixture `set_content` con controller UI reale, storage in memoria e registrazione delle destinazioni al posto della navigazione effettiva. L'ambiente locale impedisce la navigazione del browser. Questi risultati NON equivalgono a test di rete sul sito pubblico, test Safari/iOS/Android fisici o audit completo di accessibilità.

## Interazioni

52 verifiche della suite del prototipo superate: ricerca, filtri, salvataggi, preferiti, onboarding, saldo insufficiente, ricarica, conferma e annullamento dello sblocco, assenza di doppio addebito, progresso lettura, accesso temporaneo, Premium, ricompense e altre interazioni dimostrative.

## Pubblicazione

Il workflow `Publish StoryFlow demo` verifica separatamente il sito pubblico: attende il commit atteso in `deploy-version.json`, quindi controlla via HTTP tutte le 56 pagine e tutti gli asset. Il risultato del singolo deployment è nei log e nell'artifact `atelier-deployment-report`. Non considera un semplice aggiornamento di `gh-pages` come prova che il sito sia già online.
