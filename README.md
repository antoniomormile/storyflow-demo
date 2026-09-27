<!-- ATELIER-2 -->
# StoryFlow · Atelier 2.0

Nuova identità editoriale su tutte le 56 pagine. Apri [la demo](https://antoniomormile.github.io/storyflow-demo/) oppure [tutte le schermate](https://antoniomormile.github.io/storyflow-demo/prototype.html).

Documentazione aggiornata: [docs/ATELIER.md](docs/ATELIER.md). Per ricostruire questa versione usare **`node tools/build-atelier.mjs`**, non il vecchio generatore. Il sito resta composto da HTML, CSS e JavaScript leggibili, senza ZIP come sorgente.

---

# StoryFlow · template visuale interattivo

**56 pagine HTML, CSS condiviso e JavaScript senza framework.**

Un riferimento concreto per passare dal mockup allo sviluppo di un’app di fumetti serializzati. Include il catalogo, il reader, i principali percorsi di monetizzazione e le schermate di sistema. È un **prototipo frontend**, non un’app collegata a un servizio di produzione.

## Apri il progetto

Estrai lo ZIP prima di aprire i file. **`index.html`** è la Home; **`prototype.html`** è l’indice navigabile di tutte le schermate. Per il flusso di primo accesso apri **`welcome.html`**.

Le pagine, le immagini, gli stili e gli script sono locali: non servono npm, un framework, una CDN o una connessione Internet. L’apertura diretta dei file permette di consultare il template; disponibilità e condivisione di localStorage sotto `file://` dipendono dal browser. Per verificare correttamente stato e passaggi tra pagine è preferibile il server locale.

### Server locale consigliato

Con Python 3 disponibile, esegui dalla cartella del progetto:

```sh
python3 AVVIA_LOCALE.py
```

Su Windows puoi usare `py -3 AVVIA_LOCALE.py` oppure `AVVIA_WINDOWS.bat`. Su macOS/Linux è incluso `AVVIA_MAC_LINUX.command`. Lo script apre l’indice nel browser, si limita a `127.0.0.1` e usa una porta libera. Non installa pacchetti. Chiudi il processo con Ctrl+C.

Alternativa dalla cartella del progetto:

```sh
python3 -m http.server 8080 --bind 127.0.0.1
```

Apri nel browser `http://127.0.0.1:8080/prototype.html`.

## Da quali pagine partire

| File | Scopo |
|---|---|
| `index.html` | Home completa e ingresso nel prodotto |
| `prototype.html` | Tutte le 56 schermate e gli stati |
| `flows.html` | Sei percorsi utente collegati visivamente |
| `components.html` | Palette, tipografia, componenti e stati UI |
| `welcome.html` | Onboarding completo |
| `series.html` | Serie di esempio, capitoli e accessi |
| `reader.html` | Reader webtoon con tavola dimostrativa |
| `paywall.html` | Sblocco del capitolo 9 nello scenario iniziale |

## Cosa puoi provare

Ricerca e filtri del catalogo; salvataggio in libreria e preferiti; selezione dei generi; reader verticale e manga, doppia pagina da tablet, direzione di lettura e luminosità simulata; avanzamento dei capitoli; confronto tra Credits e Free Pass; ricariche con conferma; acquisto di capitoli singoli e bundle; attivazione Premium; check-in, missioni e annunci simulati con controllo dei duplicati; profilo e preferenze locali.

Lo scenario iniziale contiene **12 Credits demo**, **8 capitoli contigui letti di Midnight Love**, Premium non attivo e un Free Pass in attesa. Il capitolo 9 costa **20 Credits**: è il percorso ideale per provare il primo paywall. Il saldo iniziale è un dato fittizio, non il risultato di un acquisto reale.

Per ripartire: **Profilo → Impostazioni → Azzera tutti i dati della demo**. È richiesta una conferma. I dati restano nel browser e non sono sincronizzati tra dispositivi.

## Cosa NON è implementato

Nessun backend, account remoto, autenticazione Apple/Google, pagamento store, pubblicità reale, notifica push, download episodio, streaming video o traduzione dei testi. Non sono inclusi episodi completi: il reader riutilizza alcune vignette illustrative. I messaggi di supporto non vengono inviati. Privacy e Termini sono chiaramente segnaposto, non documenti legali.

Prezzi, bonus, contenuti, autori, lettori e valutazioni sono dimostrativi. I concept Shorts e fumetto immersivo sono separati dall’MVP. Il player Shorts anima solo un cursore; non contiene video o audio. La scelta lingua memorizza la preferenza, ma l’interfaccia resta in italiano.

## Struttura

```text
storyflow-template/
├── index.html, prototype.html, ...     56 pagine HTML già generate
├── assets/
│   ├── css/tokens.css                 Identità e token del design system
│   ├── css/styles.css                 Layout, componenti e responsive
│   ├── js/data.js                     Catalogo, prezzi, pagine, stato iniziale
│   ├── js/views.js                    Componenti e sorgenti delle 56 viste
│   ├── js/app.js                      Interazioni e stato locale
│   └── images/                       Artwork WebP e favicon SVG
├── docs/                             Handoff AI, flussi, requisiti, decisioni
├── references/                       10 mockup iniziali, in JPEG
├── previews/                         Schermate del template realmente renderizzato
├── tools/build.mjs                   Rigenerazione facoltativa con Node
├── tests/                            Controlli, fixture browser e report
├── AVVIA_LOCALE.py                    Server locale Python, senza dipendenze
└── README.md
```

## Come modificare il template

I file HTML contengono markup già renderizzato: non sono involucri vuoti e sono consultabili anche con JavaScript disattivato. All’avvio, JavaScript riallinea il markup allo stato del browser.

**La sorgente delle pagine è `assets/js/views.js`.** Modificare soltanto l’HTML generato non basta: il rendering JavaScript sovrascriverebbe la modifica. Per cambiare una schermata modifica la relativa funzione in `views.js`; per i contenuti usa `data.js`; per lo stile usa i due CSS. Poi, con Node disponibile:

```sh
node tools/build.mjs
```

Il comando rigenera i 56 HTML e le mappe JSON. **Node è facoltativo per usare il progetto e necessario solo per questa rigenerazione.** Non viene installato alcun pacchetto. Il progetto non usa React, Vue, Tailwind, Bootstrap o plugin esterni.

## Passaggio al modello AI

Carica l’intero ZIP nella chat di sviluppo. Chiedi al modello di iniziare da:

1. `docs/AI_HANDOFF.md` e `docs/PROMPT_SVILUPPO.md`;
2. `docs/UI_SPEC.md`, `docs/DECISIONI_PROTOTIPO.md` e `docs/REQUISITI_COPERTURA.md`;
3. `prototype.html`, `flows.html`, `assets/css/` e `assets/js/`.

Il mockup è il riferimento visuale. Lo stato client e le simulazioni **non** sono un’architettura sicura per il prodotto finale. I contratti di dominio proposti si trovano in `docs/DATA_AND_SERVICE_CONTRACTS.md` e vanno adattati allo stack concordato.

## Verifiche e limiti dei test

`tests/static-report.json` documenta il controllo dei file e dei collegamenti. I report layout e interazioni specificano metodo e risultati. Nel contesto di creazione, il browser non consentiva navigazioni URL: il rendering è stato verificato in Chromium con HTML/CSS/JS caricati in memoria, adattatore di storage e registrazione delle destinazioni. Questo **non equivale** a un test end-to-end su Safari/iOS, Android, server pubblico o store.

Prima dello sviluppo produttivo eseguire i test di navigazione e persistenza nel proprio browser tramite server locale, poi sui dispositivi di destinazione. Nessuna certificazione di accessibilità o conformità agli store è implicita.
