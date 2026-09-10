/**
 * Inhalt der Informationsseite, ohne DOM und ohne Stylesheet-Import.
 *
 * Getrennt von `main.ts`, damit die Seite ausserhalb eines Browsers
 * gerendert und geprüft werden kann — und damit der Build sie statisch
 * in index.html schreiben kann. Sie trägt Impressum und
 * Datenschutzerklärung; ohne JavaScript darf dort nicht nichts stehen.
 *
 * Reihenfolge: zwei Abläufe, die Motive dahinter, die Module, die
 * Architektur, und was offen ist. Erst zeigen, dann benennen.
 * Die Seite kennt keinen Nutzer, verarbeitet keine Gesundheitsdaten und
 * lädt nichts von Drittanbietern.
 */
import { STI_NAMES, paletteFor } from "@sexdiary/core";

export function themeStyles(): string {
  const vars = (p: ReturnType<typeof paletteFor>) =>
    Object.entries(p)
      .map(([k, v]) => `--${k}: ${v};`)
      .join("");
  return [
    `:root{${vars(paletteFor("light"))}}`,
    `:root[data-theme="dark"]{${vars(paletteFor("dark"))}}`,
  ].join("\n");
}

const section = (id: string, title: string, body: string): string => `
  <section id="${id}" aria-labelledby="${id}-h">
    <h2 id="${id}-h">${title}</h2>
${body}
  </section>`;

const karten = (items: [string, string][]): string => `    <div class="karten">
${items
  .map(([t, b]) => `      <div class="karte"><h3>${t}</h3><p>${b}</p></div>`)
  .join("\n")}
    </div>`;

/**
 * Ein Ablauf ist ein Schritt der Person und daneben, was das Werkzeug
 * dabei tut. Die Trennung ist der Inhalt: die App handelt nie von sich
 * aus, sie rechnet an dem weiter, was jemand eingetragen hat.
 */
interface Schritt {
  tat: string;
  folge: string;
  offen?: boolean;
}

const ablauf = (schritte: Schritt[]): string => `    <ol class="ablauf">
${schritte
  .map(
    (s) => `      <li${s.offen ? ' class="offen"' : ""}>
        <p class="tat">${s.tat}</p>
        <p class="folge">${s.folge}</p>
      </li>`,
  )
  .join("\n")}
    </ol>`;

/**
 * Module mit Stand. Der Stand steht neutral, nicht in den Semantikfarben
 * (ADR-0015): die Farbskala gehört der Risikobewertung, und „gebaut“ ist
 * kein niedriges Risiko.
 */
interface Modul {
  name: string;
  text: string;
  stand: string;
}

const module = (items: Modul[]): string => `    <ul class="module">
${items
  .map(
    (m) => `      <li>
        <h3>${m.name} <span class="stand">${m.stand}</span></h3>
        <p>${m.text}</p>
      </li>`,
  )
  .join("\n")}
    </ul>`;

/**
 * Platzhalter, die als Platzhalter aussehen. Ein Impressum mit
 * erfundenen Angaben wäre schlimmer als keines, und erfundene
 * Teststellen schicken Menschen an Türen, hinter denen niemand ist.
 */
const fehlt = (was: string): string =>
  `    <p class="fehlt"><strong>Fehlt noch:</strong> ${was}</p>`;

/**
 * Beide Diagramme sind von Hand geschrieben, weil eine Bibliothek dafür
 * ein Drittanbieter-Skript wäre. Sie tragen ihre Aussage auch als Text:
 * ein `role="img"` mit Beschriftung, und daneben steht dasselbe im
 * Fließtext. Wer das SVG nicht sieht, verliert nichts.
 */
const pfeile = (p: string): string => `
    <defs>
      <marker id="${p}-spitze" viewBox="0 0 10 10" refX="9" refY="5"
        markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M0 0 L10 5 L0 10 z" fill="var(--text)" />
      </marker>
      <marker id="${p}-spitze-leise" viewBox="0 0 10 10" refX="9" refY="5"
        markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M0 0 L10 5 L0 10 z" fill="var(--sub)" />
      </marker>
    </defs>`;

const datenflussSvg = (): string => `    <div class="diagramm">
      <svg viewBox="0 0 720 262" role="img" aria-label="Auf dem Gerät liegen Begegnungen, Kontakte, Tests, Impfungen, Profil und die gesamte Risikoberechnung. Zum Alert-Relay gehen nur Empfänger-Token, Erreger-Label und Zeitstempel, von dort ruft der Kontakt ab. Die Teststelle liefert einen signierten Befund als QR-Code an das Gerät. In die Cloud des Nutzers geht auf Wunsch eine verschlüsselte Sicherung.">
${pfeile("fluss")}
        <rect x="255" y="0" width="245" height="250" rx="12" fill="var(--card)" stroke="var(--text)" stroke-width="2" />
        <text x="275" y="32" class="d-titel">Auf dem Gerät</text>
        <text x="275" y="62" class="d-zeile">Begegnungen und Praktiken</text>
        <text x="275" y="84" class="d-zeile">Kontakte und ihre Token</text>
        <text x="275" y="106" class="d-zeile">Tests, Impfungen, Prophylaxe</text>
        <text x="275" y="128" class="d-zeile">Profil und Impfstatus</text>
        <text x="275" y="150" class="d-zeile">Die gesamte Risikoberechnung</text>
        <text x="275" y="182" class="d-leise">Verschlüsselt, hinter einer Sperre,</text>
        <text x="275" y="198" class="d-leise">und nichts davon geht weg.</text>

        <rect x="0" y="10" width="150" height="80" rx="10" fill="none" stroke="var(--border)" />
        <text x="14" y="36" class="d-titel-klein">Teststelle</text>
        <text x="14" y="58" class="d-leise">signierter Befund</text>
        <text x="14" y="74" class="d-leise">als QR-Code</text>

        <rect x="0" y="150" width="150" height="100" rx="10" fill="none" stroke="var(--border)" stroke-dasharray="4 4" />
        <text x="14" y="176" class="d-titel-klein">Cloud des Nutzers</text>
        <text x="14" y="198" class="d-leise">verschlüsselte</text>
        <text x="14" y="214" class="d-leise">Sicherung, für den</text>
        <text x="14" y="230" class="d-leise">Anbieter undurch-</text>
        <text x="14" y="246" class="d-leise">dringlich</text>

        <rect x="600" y="10" width="120" height="110" rx="10" fill="none" stroke="var(--border)" />
        <text x="612" y="34" class="d-titel-klein">Alert-Relay</text>
        <text x="612" y="56" class="d-leise">Empfänger-Token</text>
        <text x="612" y="72" class="d-leise">Erreger-Label</text>
        <text x="612" y="88" class="d-leise">Zeitstempel</text>
        <text x="612" y="108" class="d-leise">sonst nichts</text>

        <rect x="600" y="160" width="120" height="90" rx="10" fill="none" stroke="var(--border)" />
        <text x="612" y="184" class="d-titel-klein">Kontakt</text>
        <text x="612" y="206" class="d-leise">ruft ab und</text>
        <text x="612" y="222" class="d-leise">erfährt keinen</text>
        <text x="612" y="238" class="d-leise">Absender</text>

        <line x1="150" y1="50" x2="249" y2="50" stroke="var(--text)" marker-end="url(#fluss-spitze)" />
        <text x="200" y="38" class="d-marke">signierter QR</text>
        <text x="200" y="66" class="d-marke">offline geprüft</text>

        <line x1="500" y1="50" x2="594" y2="50" stroke="var(--text)" marker-end="url(#fluss-spitze)" />
        <text x="548" y="32" class="d-marke">nur beim Senden</text>
        <text x="548" y="66" class="d-marke">Token, Erreger,</text>
        <text x="548" y="80" class="d-marke">Zeitstempel</text>

        <line x1="660" y1="120" x2="660" y2="154" stroke="var(--text)" marker-end="url(#fluss-spitze)" />

        <line x1="255" y1="200" x2="156" y2="200" stroke="var(--sub)" stroke-dasharray="4 4" marker-end="url(#fluss-spitze-leise)" />
        <text x="205" y="188" class="d-marke">nur auf Wunsch</text>
        <text x="205" y="216" class="d-marke">verschlüsselt</text>
      </svg>
    </div>`;

const schichtenSvg = (): string => `    <div class="diagramm">
      <svg viewBox="0 0 720 250" role="img" aria-label="Vier Schichten übereinander: die Bildschirme der App, darunter die Gerätefunktionen mit sieben Fremdpaketen, darunter der Kern @sexdiary/core ohne Runtime-Abhängigkeiten und ohne Ein- und Ausgabe, darunter Android und iOS.">
        <rect x="1" y="1" width="718" height="248" rx="12" fill="none" stroke="var(--border)" />

        <text x="20" y="28" class="d-titel-klein">Bildschirme</text>
        <text x="20" y="48" class="d-leise">Heute · Kalender · Melden · Einträge · Einstellungen</text>
        <line x1="1" y1="60" x2="719" y2="60" stroke="var(--border)" />

        <text x="20" y="86" class="d-titel-klein">Gerätefunktionen</text>
        <text x="20" y="106" class="d-leise">Sperre · Bildschirmschutz · Speicher · Krypto · Kamera · NFC · Erinnerungen</text>
        <text x="20" y="124" class="d-leise">Sieben Fremdpakete, jedes mit genau einer Aufgabe</text>
        <line x1="1" y1="136" x2="719" y2="136" stroke="var(--border)" />

        <rect x="1" y="136" width="718" height="74" fill="var(--text)" />
        <text x="20" y="163" class="d-titel d-invers">@sexdiary/core</text>
        <text x="20" y="185" class="d-zeile d-invers">Risikomodell · diagnostische Fenster · Schemata · Farbtokens · i18n</text>
        <text x="20" y="203" class="d-zeile d-invers">Null Runtime-Abhängigkeiten. Keine Ein- und Ausgabe.</text>

        <text x="20" y="234" class="d-titel-klein">Android und iOS</text>
        <text x="196" y="234" class="d-leise">Ein Browser kann nicht leisten, was hier zu schützen ist.</text>
      </svg>
    </div>`;

export interface BeispielQr {
  label: string;
  hinweis: string;
  svg: string;
}

/**
 * Die Beispielcodes kommen von aussen herein, statt hier erzeugt zu
 * werden: sonst zoege dieses Modul `qrcode` in das Bundle, das der
 * Browser laedt — fuer Bilder, die im HTML ohnehin schon fertig stehen.
 */
export function render(qrs: BeispielQr[] = []): string {
  return `
<a class="skip" href="#inhalt">Zum Inhalt springen</a>

<header>
  <p class="marke">STI-Risikotracker</p>
  <button id="theme" type="button">Darstellung wechseln</button>
</header>

<main id="inhalt">
  <section class="hero" aria-labelledby="hero-h">
    <h1 id="hero-h">Es scheitert nicht am Willen, sondern am System.</h1>
    <p class="lead">
      Ein Werkzeug, das ausrechnet, wann ein Test aussagekräftig wird, und
      Kontakte benachrichtigt, ohne jemanden zu benennen. Alles Persönliche
      bleibt auf dem Telefon.
    </p>
  </section>
${section(
  "problem",
  "Drei Lücken",
  karten([
    [
      "Risiko und Testbereitschaft",
      "Viele schätzen ihr Expositionsrisiko falsch ein oder handeln nicht entsprechend.",
    ],
    [
      "Partner-Notification",
      "Stigmatisiert, aufwändig, schambesetzt. Die häufigste Reaktion ist Unterlassen, nicht Handeln.",
    ],
    [
      "Kein passendes Werkzeug",
      "Bestehende Angebote sind selten zugleich anonym, niedrigschwellig und alltagstauglich.",
    ],
  ]),
)}
${section(
  "julia",
  "Julia will jemanden erreichen, den sie nicht mehr sehen will",
  `    <p class="vorspann">
      Julia und Stefan hatten einmal Sex und danach keinen Kontakt mehr. Daran
      will sie nichts ändern. Sie will ihn nur erreichen.
    </p>
${ablauf([
  {
    tat: "Der Abend wird ein Eintrag.",
    folge:
      "Datum, welche Praktiken, ob geschützt. Stefan wird ein Kontakt ohne Namen — ein Kürzel, das nur sie versteht. Ab diesem Datum läuft für jede Infektion ihr eigenes diagnostisches Fenster: die Rechnung, die kaum jemand im Kopf hat.",
  },
  {
    tat: "Wochen später der Test.",
    folge:
      "Das Ergebnis kommt als QR-Code, sie liest ihn ein. Chlamydien positiv, alles Übrige ohne Befund. Von Hand eintragen geht genauso — der Code spart Tippen und bringt die Signatur der Teststelle mit, geprüft wird sie auf dem Gerät.",
  },
  {
    tat: "Die App rechnet rückwärts.",
    folge:
      "Nicht „wen kennst du“, sondern: welche Begegnungen liegen in dem Zeitraum, in dem genau diese Infektion weitergegeben worden sein kann? Es sind zwei.",
  },
  {
    tat: "Sie entscheidet je Kontakt, wie.",
    folge:
      "Den einen ruft sie an; sie kennt ihn gut, ein Anruf ist der bessere Weg. Die App hält fest, dass er Bescheid weiß, und hört auf, ihn anzumahnen. Persönlich ist hier kein Kanal zweiter Klasse.",
  },
  {
    tat: "Stefan bekommt die anonyme Benachrichtigung.",
    folge:
      "Vor dem Senden steht auf dem Bildschirm, was übertragen wird: sein Token, das Wort „Chlamydien“, ein Zeitstempel. Kein Absender, kein Text, kein Weg zurück zu ihr. Wenn sie will, legt sie eine Rückadresse bei — dann kann er antworten, mit einem von vier Wörtern, mehr gibt es nicht.",
  },
  {
    offen: true,
    tat: "Offen: Stefan hat die App nicht.",
    folge:
      "Von App zu App trägt der Weg, sobald der Dienst steht. Über eine Telefonnummer ist er vorgesehen — aber es wäre der einzige Punkt im ganzen Entwurf, an dem ein Server etwas erführe, das eine Person bezeichnet. Deshalb steht er unter „Was dazukommt“ und nicht in der Basis: erst die rechtliche Klärung, dann der Code.",
  },
])}`,
)}
${section(
  "max",
  "Max tauscht kein Wort und trotzdem etwas aus",
  `    <p class="vorspann">
      Max geht cruisen. Es fällt kein Name, es wird keine Nummer getauscht, und
      daran soll sich nichts ändern.
    </p>
${ablauf([
  {
    tat: "Einer der Männer hat eine Karte.",
    folge:
      "Max hält sein Telefon dran, eine Sekunde. Getauscht wird eine Zufallszahl — kein Name, keine Nummer, kein Profil, keine Verbindung zu irgendeinem Konto, auf keiner Seite.",
  },
  {
    tat: "Später trägt er nach, was war.",
    folge:
      "Anal rezeptiv, ohne Kondom. Der Schutz wird je Praktik erfasst, nicht pauschal für den Abend. Der Kontakt heißt „Karte, Donnerstag“ oder gar nichts.",
  },
  {
    tat: "Die App sagt ihm nicht, wie gefährlich das war.",
    folge:
      "Sie sagt, ab wann welcher Test etwas aussagt, und woraus sich das ergibt. Ein Test vor seinem Fenster ist ein Test ohne Aussage — das ist der eigentliche Nutzen.",
  },
  {
    tat: "Einige Wochen später eine Erinnerung.",
    folge:
      "Auf dem Sperrbildschirm steht keine Infektion, keine Zahl, kein Datum. Dort liest die Person mit, vor der diese App schützt. Erst dahinter, entsperrt: Syphilis ist ab heute aussagekräftig testbar.",
  },
  {
    tat: "Und andersherum.",
    folge:
      "Bekäme der Mann mit der Karte einen Befund, erreichte er Max über dieselbe Zufallszahl — ohne je erfahren zu haben, wer Max ist.",
  },
])}`,
)}
${section(
  "motive",
  "Drei Gründe, das zu benutzen",
  `    <p>
      Sie hängen nicht voneinander ab. Der erste trägt allein, auch wenn nie
      jemand eine Benachrichtigung sendet.
    </p>
${karten([
  [
    "Den Überblick behalten",
    "Der Nutzen beginnt beim ersten Eintrag. Wer weiß, wann ein Test etwas aussagt, testet zum richtigen Zeitpunkt statt zu früh, zu oft oder gar nicht.",
  ],
  [
    "Jemanden erreichen, ohne sich zu zeigen",
    "Das Hindernis ist die Hemmschwelle, nicht die Technik. Wer nicht anrufen kann oder will, unterlässt es heute meistens ganz.",
  ],
  [
    "Und dafür nicht mit Daten bezahlen",
    "So wenig auf einem Server wie möglich, und was dort liegt, in öffentlicher statt privater Hand. Auf dem Gerät eine Darstellung, die auch dann nichts verrät, wenn jemand danebensteht.",
  ],
])}`,
)}
${section(
  "basis",
  "Ohne diese drei ist es nicht das Produkt",
  module([
    {
      name: "Kalender",
      stand: "gebaut",
      text: "Begegnungen, Tests, Impfungen und Prophylaxen in einer Zeitachse und einer Monatsansicht. Nachträglich änderbar und löschbar, weil ein Protokoll, das sich nicht korrigieren lässt, nicht geführt wird.",
    },
    {
      name: "Ein Dashboard, das mitrechnet",
      stand: "gebaut",
      text: "Was heute testbar ist, was noch wartet, und woraus sich das ergibt. Keine unerklärte Zahl: jede Aussage lässt sich auf den Eintrag zurückführen, der sie erzeugt hat.",
    },
    {
      name: "Anonyme Benachrichtigung über ein Relay",
      stand: "Ablauf gebaut, Dienst fehlt",
      text: "Von App zu App über beidseitig getauschte Token. Ablauf, Format und Rückmeldung stehen in der App; der Dienst, der die Nachricht hält, ist das größte offene Stück.",
    },
  ]),
)}
${section(
  "dazu",
  "Was dazukommt",
  `    <p>
      In dieser Reihenfolge sinnvoll, nicht in dieser Reihenfolge zwingend.
      Jede Zeile ist einzeln streichbar, ohne dass die Basis darunter bricht.
    </p>
${module([
  {
    name: "QR-Codes für Tests und Kontakte",
    stand: "gebaut, Signaturprüfung nicht angeschlossen",
    text: "Ergebnisse und Kontakte wandern per Code statt per Tippen. Format und Prüfverfahren liegen im Kern und sind getestet — im Scanpfad wird die Signatur noch nicht geprüft. Bis das steht, ist ein eingelesenes Ergebnis nicht mehr wert als ein von Hand eingetragenes.",
  },
  {
    name: "NFC-Karten für Kontakte",
    stand: "gebaut, auf einem Gerät nicht erprobt",
    text: "Eine Karte, die eine Zufallszahl trägt. Für Orte, an denen ein Telefon herauszuholen unpassend ist, und für Menschen, die keines herausholen wollen.",
  },
  {
    name: "Personalisierung",
    stand: "teilweise gebaut",
    text: "Anatomie und Region bestimmen, welche Zahlen überhaupt gelten. Ohne diese Angabe rechnet die App mit dem ungünstigsten Fall — sicher, aber es warnt Menschen vor Wegen, die sie nicht gehen.",
  },
  {
    name: "Diskretion auf dem Gerät",
    stand: "gebaut",
    text: "Sperre, kein Bildschirmfoto, neutraler Name im Betriebssystem, inhaltsleere Erinnerungen. Was davon warum nötig ist, steht im nächsten Abschnitt.",
  },
  {
    name: "Weiterführende Information",
    stand: "in Ansätzen",
    text: "Zu Infektionen, Symptomen und Testmöglichkeiten — an der Stelle, an der jemand gerade etwas wissen will, statt als Broschüre.",
  },
  {
    name: "Anbindung an die Testinfrastruktur",
    stand: "Konzept",
    text: "Termin buchen, Befund abrufen. Der Abruf läuft zwischen Gerät und Teststelle; ein Betreiber der App steht nicht dazwischen und erfährt nichts.",
  },
  {
    name: "Hinweis bei örtlichem Geschehen",
    stand: "Konzept",
    text: "Wenn eine Infektion in einer Region gerade auffällig oft auftritt. Der Hinweis geht an alle gleich und trägt keinen Personenbezug — die App fragt ihn ab, sie meldet sich nicht an.",
  },
  {
    name: "Benachrichtigung an eine Telefonnummer",
    stand: "rechtlich ungeklärt",
    text: "Der Fall Stefan: der Empfänger hat die App nicht. Technisch die kleinere Aufgabe, rechtlich die größere — der Dienst bekäme eine Rufnummer zu sehen, müsste sie an einen Versanddienstleister weiterreichen, und der Empfänger hat in nichts davon eingewilligt. Steht deshalb hier und nicht in der Basis.",
  },
])}`,
)}
${section(
  "diskretion",
  "Gebaut gegen den Blick von nebenan",
  `    <p>
      Das realistische Risiko ist die Person daneben, nicht der Angreifer im
      Netz. Kein einziges Mittel dagegen lässt sich im Browser bauen — das ist
      der Grund, warum das Produkt eine native App ist und diese Seite hier nur
      erklärt.
    </p>
    <ul>
      <li><strong>Sperre</strong> über Biometrie oder Geräte-PIN, mit dem
        Schlüssel im Sicherheitsspeicher des Geräts.</li>
      <li><strong>Keine Bildschirmfotos</strong>, und in der App-Übersicht
        bleibt die Vorschau leer.</li>
      <li><strong>Neutraler Name</strong> im Betriebssystem, unauffällige
        Sperrseite, ein Griff auf einen harmlosen Bildschirm.</li>
      <li><strong>Erinnerungen ohne Inhalt</strong>: keine Infektion, keine
        Zahl, kein Datum auf dem Sperrbildschirm.</li>
    </ul>
    <p>
      Berücksichtigte Infektionen:
      <span class="stis">${STI_NAMES.join(" · ")}</span>
    </p>`,
)}
${section(
  "architektur",
  "Lokal denken, minimal zentralisieren",
  `    <p>
      Die Benachrichtigung ist die einzige Stelle, an der Information zwischen
      zwei Menschen fließen muss — und damit die einzige, für die es überhaupt
      einen Server braucht. Für jede weitere Idee gilt die Pflichtfrage:
      könnte das auf dem Gerät bleiben?
    </p>
${datenflussSvg()}
    <p>
      Links steht, was ein Gerät geliefert bekommt und wohin es sichern kann.
      In der Mitte liegt alles Persönliche. Rechts liegt, was ein vollständig
      übernommener Server preisgäbe: Token, Erreger, Zeitpunkt. Keine Namen,
      keine Historien, keine Absender.
    </p>
    <p class="zitat">So wenig zentralisieren wie möglich — so viel Nutzen wie nötig.</p>`,
)}
${section(
  "bausteine",
  "Bausteine und Abhängigkeiten",
  `    <p>
      Die Gesundheitslogik liegt in einem eigenen Paket, das nichts nachlädt und
      weder liest noch schreibt. Das ist die Fläche, die ein Prüfteam lesen
      muss — und sie bleibt lesbar, weil sie keine fremde Zeile enthält.
    </p>
${schichtenSvg()}
    <p>
      Darüber die Hülle mit den Paketen, die eine App braucht, um an das Gerät
      zu kommen: Sperre, Bildschirmschutz, Speicher, Verschlüsselung, Kamera,
      NFC, Erinnerungen. Sieben Stück, jedes für eine Aufgabe. Was hier
      <em>nicht</em> steht, ist die eigentliche Aussage:
    </p>
    <ul>
      <li>Keine Analytik und kein Fehlerbericht, der irgendwohin geht.</li>
      <li>Keine externen Schriften. Sie liegen bei, auch auf dieser Seite.</li>
      <li>Keine Aktualisierung über die Luft. Ausgeliefert wird, was geprüft
        wurde.</li>
      <li>Keine Anmeldung, kein Konto, kein Verzeichnis von Nutzern.</li>
    </ul>`,
)}
${section(
  "server",
  "Was der Server können muss, und was er nicht dürfen darf",
  `    <p>
      Ein Vorgang zum Senden, einer zum Abrufen, einer zum Löschen. Gespeichert
      wird Empfänger-Token, Erreger-Label, Zeitstempel und auf Wunsch eine
      Rückadresse. Mehr gibt es nicht, und jeder Vorschlag für einen weiteren
      Vorgang muss zuerst begründen, warum er nicht auf dem Gerät stattfinden
      kann.
    </p>
    <ul>
      <li><strong>Kein Absender</strong> — auch nicht pseudonym, auch nicht zur
        Missbrauchsabwehr. Der Preis dafür ist ehrlich: kein Zustellnachweis,
        kein Widerruf, keine Sperre gegen jemanden, der grundlos sendet.</li>
      <li><strong>Kein Inhalt.</strong> Eine Benachrichtigung ist ein Wort aus
        einer festen Liste, kein Text. Freitext wäre ein Belästigungskanal, den
        niemand moderieren kann.</li>
      <li><strong>Löschen ab dem ersten Tag</strong>, nicht nachgerüstet: „Alles
        löschen“ in der App muss auch die Einträge zum eigenen Token treffen.</li>
      <li><strong>Keine ausgehenden Verbindungen</strong>, keine Protokolle mit
        Personenbezug, kein Vorhalten von IP-Adressen über den Transport
        hinaus.</li>
    </ul>
    <p>
      Je langweiliger der Dienst, desto günstiger seine Sicherheitsprüfung. Das
      ist kein Sparzwang, sondern das Entwurfsziel: eine Datei Programmcode und
      eine Tabelle, ohne Framework, lesbar an einem Nachmittag.
    </p>
    <h3>Betrieb und Auslieferung</h3>
    <p>
      Für Entwicklung, Vorführung und einen Pilotbetrieb reicht gewöhnliches
      Webhosting. Für den echten Betrieb reicht es <em>nicht</em>: eine deutsche
      Kommune wird Daten dieser Kategorie nicht bei einem kommerziellen
      Massenhoster verarbeiten lassen, und die Nachweise, die sie dafür
      verlangt, sind dort nicht zu bekommen.
    </p>
    <p>
      Das ist keine Lücke, sondern die Vorgabe: <strong>ausgeliefert wird kein
      Dienst, sondern ein Artefakt</strong> — Quellcode, Datenbankschema,
      Betriebshandbuch, Sicherungs- und Wiederherstellungsprozedur. Wer es
      betreibt, betreibt es selbst, auf eigener Infrastruktur, und kann es
      vorher lesen. Selbst-Hostbarkeit ist damit ein Merkmal und keine
      Nachrüstung.
    </p>`,
)}
${section(
  "offen",
  "Klare Augen: was noch nicht gelöst ist",
  `    <h3>Medizinisch — das Dringendste</h3>
    <p>
      Die diagnostischen Fenster stehen zur ärztlichen Prüfung und werden hier
      deshalb noch nicht im Einzelnen genannt. Fünf Werte sind als vermutlich
      unzutreffend vermerkt; bei zweien würde die App „testbar“ melden, wo ein
      negatives Ergebnis nichts ausschließt. Genau das ist der Kernnutzen, und
      genau deshalb gehört es einer Infektiologin vorgelegt, bevor jemand die
      App benutzt.
    </p>
    <h3>Rechtlich</h3>
    <ul>
      <li>Ist ein Token ohne Personendaten personenbezogen, sobald ein
        Erreger-Label daneben steht? Worauf stützt sich das Speichern, und wie
        lange darf es liegen?</li>
      <li>Die Benachrichtigung an eine Telefonnummer: geht das überhaupt, wenn
        der Empfänger in nichts eingewilligt hat und ein Versanddienstleister
        die Nummer zu sehen bekommt?</li>
      <li>Einordnung nach der Medizinprodukteverordnung. Der Entwurf zielt auf
        informierend statt bewertend, entschieden ist das nicht.</li>
      <li>Die Lizenz fehlt. Sie blockiert Code-Audit, Veröffentlichung und
        Nachnutzung durch andere Kommunen.</li>
    </ul>
    <h3>Betrieb und Verbreitung</h3>
    <ul>
      <li>Wer betreibt das Relay, und wer haftet dafür?</li>
      <li>Wie kommt die App auf die Telefone — Stores, F-Droid, oder beides?</li>
      <li>Missbrauch lässt sich ohne Absenderkennung nicht gezielt abwehren. Was
        trägt, ist strukturell: Token werden bewusst getauscht, nicht erraten.
        Wer keines hat, erreicht niemanden.</li>
    </ul>
    <h3>Wirkung</h3>
    <ul>
      <li>Vertrauen. Akzeptanz hängt an transparenter Kommunikation und an der
        Einbindung der Community, nicht an Funktionen.</li>
      <li>Awareness. Das Werkzeug hilft nur, wenn es gefunden wird. Verteilung
        über Testangebote und Community-Organisationen ist entscheidend.</li>
      <li>Normalisierung. Falsch kommuniziert könnte die App Risikoverhalten als
        gemanagt erscheinen lassen.</li>
      <li>Eine strukturierte Nutzerevaluation der einzelnen Funktionen steht
        aus, ebenso ein Studiendesign für die Wirksamkeit.</li>
    </ul>`,
)}
${section(
  "ausprobieren",
  "Ansehen",
  `    <p>
      Die <a href="./demo.html">Demo im Browser</a> zeigt den Aufbau. Sie
      speichert nichts — ein Neuladen beginnt von vorn. Was oben unter
      Diskretion steht, kann ein Browser nicht leisten; es ist dort sichtbar,
      aber als nicht verfügbar gekennzeichnet.
    </p>
${
    qrs.length
      ? `    <h3>Drei Szenarien zum Ausprobieren</h3>
    <p>
      Diese Codes sind echt: mit der App eingelesen legen sie einen Kontakt
      beziehungsweise ein Testergebnis an. Erfunden ist nur der Inhalt.
    </p>
    <div class="qrs">
${qrs
  .map(
    (q) => `      <figure class="qr">
        ${q.svg}
        <figcaption><strong>${q.label}</strong><br />${q.hinweis}</figcaption>
      </figure>`,
  )
  .join("")}
    </div>`
      : ""
  }
${fehlt("Bezugsweg für die Android-App, sobald die Verteilung steht.")}`,
)}
${section(
  "teststellen",
  "Wo man sich testen lassen kann",
  fehlt(
    "Verzeichnis der Teststellen. Gehört mit geprüften Angaben gefüllt, " +
      "etwa vom Gesundheitsreferat oder der Aidshilfe.",
  ),
)}
${section(
  "impressum",
  "Impressum",
  fehlt(
    "Anbieterkennzeichnung nach § 5 DDG: Name, ladungsfähige Anschrift, Kontakt.",
  ),
)}
${section(
  "datenschutz",
  "Datenschutz",
  `    <p>
      Diese Seite setzt keine Cookies, bindet nichts von Drittanbietern ein und
      misst nichts. Auch die Schriften sind mitgeliefert und werden nicht
      nachgeladen.
    </p>
${fehlt(
    "Erklärung nach Art. 13 DSGVO samt Verantwortlichem, Rechtsgrundlagen " +
      "und Betroffenenrechten. Gehört juristisch geprüft.",
  )}`,
)}
</main>

<footer>
  <p>Kein Medizinprodukt. Ersetzt keine ärztliche Beratung.</p>
</footer>`;
}
