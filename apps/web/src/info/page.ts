/**
 * Inhalt der Informationsseite, ohne DOM und ohne Stylesheet-Import.
 *
 * Getrennt von `main.ts`, damit die Seite ausserhalb eines Browsers
 * gerendert und geprüft werden kann — und damit der Build sie statisch
 * in index.html schreiben kann. Sie trägt Impressum und
 * Datenschutzerklärung; ohne JavaScript darf dort nicht nichts stehen.
 *
 * Inhalt und Reihenfolge folgen der Konzeptvorstellung vom 21.05.2026.
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
 * Platzhalter, die als Platzhalter aussehen. Ein Impressum mit
 * erfundenen Angaben wäre schlimmer als keines, und erfundene
 * Teststellen schicken Menschen an Türen, hinter denen niemand ist.
 */
const fehlt = (was: string): string =>
  `    <p class="fehlt"><strong>Fehlt noch:</strong> ${was}</p>`;

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
  "funktionen",
  "Zwei Funktionen",
  `    <h3>Persönliches Risiko-Dashboard</h3>
    <ul>
      <li>Dokumentation von Kontakten, Tests und Impfungen</li>
      <li>Window-Period-Tracking pro Infektion</li>
      <li>Schutzfaktoren: Kondom je Praktik, PrEP, Doxy-PEP, Impfstatus</li>
      <li>Alles lokal, kein Konto</li>
    </ul>
    <h3>Anonyme Partner-Notification</h3>
    <p>Zwei Wege, je nachdem wer die App hat:</p>
    <ul>
      <li><strong>Nur der Absender.</strong> Das Token ist ein Kontakt-Handle
        auf einer beliebigen Plattform — Signal, Telegram, WhatsApp, Grindr.
        Die Benachrichtigung geht dorthin, mit Opt-Out-Hinweis.</li>
      <li><strong>Beide.</strong> Benachrichtigung in der App, verknüpft mit
        dem Dashboard. Kein Handle nötig.</li>
    </ul>
    <p>
      Berücksichtigte Infektionen:
      <span class="stis">${STI_NAMES.join(" · ")}</span>
    </p>`,
)}
${section(
  "architektur",
  "Lokal denken, minimal zentralisieren",
  `    <div class="gegenueber">
      <div>
        <h3>Auf dem Gerät</h3>
        <ul>
          <li>Kontakte und Testergebnisse</li>
          <li>Window-Period-Berechnung</li>
          <li>Impf- und PrEP-Status</li>
          <li>Das komplette Risikoprofil</li>
        </ul>
      </div>
      <div>
        <h3>Auf dem Server</h3>
        <ul>
          <li>Pseudonymisiertes Token</li>
          <li>Zuordnung zu einem Kontakt</li>
          <li>Nichts Personenbezogenes</li>
        </ul>
      </div>
    </div>
    <p class="zitat">So wenig zentralisieren wie möglich — so viel Nutzen wie nötig.</p>
    <p>
      Die Benachrichtigung ist die einzige Stelle, an der Information zwischen
      zwei Menschen fließt, und damit die einzige, für die es überhaupt einen
      Server braucht. Übertragen wird Empfänger-Token, Erreger und Zeitstempel.
      Kein Absender, kein Nachrichtentext. Vor jedem Versand zeigt die App, was
      genau übertragen wird.
    </p>`,
)}
${section(
  "diskretion",
  "Gebaut gegen den Blick von nebenan",
  `    <p>
      Das realistische Risiko ist die Person daneben, nicht der Angreifer im
      Netz. Dagegen wirken vier Dinge, die nur eine native App leisten kann:
    </p>
    <ul>
      <li><strong>Sperre</strong> über Biometrie oder Geräte-PIN.</li>
      <li><strong>Keine Bildschirmfotos</strong>, und in der App-Übersicht
        bleibt die Vorschau leer.</li>
      <li><strong>Tarnmodus</strong>: neutraler Name, unauffällige Sperrseite,
        ein Griff auf einen harmlosen Bildschirm.</li>
      <li><strong>Erinnerungen ohne Inhalt</strong>: keine Infektion, keine
        Zahl, kein Datum auf dem Sperrbildschirm.</li>
    </ul>`,
)}
${section(
  "dazu",
  "Was dazugehört",
  karten([
    [
      "Kontextualisierte Information",
      "Zu Infektionen und Testmöglichkeiten, situationsbezogen statt generisch.",
    ],
    [
      "Import per QR",
      "Testergebnisse und Impfdaten direkt aus dem Testangebot übernehmen.",
    ],
    [
      "PrEP und Doxy-PEP",
      "Einnahme- und Adhärenzstatus fließen in die Risikoberechnung ein.",
    ],
  ]),
)}
${section(
  "offen",
  "Klare Augen: was noch nicht gelöst ist",
  `    <p>
      Die medizinischen Zeiträume stehen zur ärztlichen Prüfung und werden hier
      deshalb noch nicht im Einzelnen genannt. Fünf Werte sind als vermutlich
      unzutreffend vermerkt, zwei davon würden zu früh „testbar“ melden. Sie
      werden geändert, wenn eine Infektiologin darauf geschaut hat.
    </p>
    <h3>Risiken</h3>
    <ul>
      <li><strong>Vertrauen.</strong> Akzeptanz hängt an transparenter
        Kommunikation und Community-Einbindung.</li>
      <li><strong>Awareness.</strong> Das Tool hilft nur, wenn es gefunden
        wird. Verteilung über Testangebote und Community-Organisationen ist
        entscheidend.</li>
      <li><strong>Normalisierungseffekt.</strong> Falsch kommuniziert könnte
        die App Risikoverhalten als gemanagt erscheinen lassen.</li>
    </ul>
    <h3>Offene Fragen</h3>
    <ul>
      <li>Was gilt als personenbezogen? Darf ein pseudonymisiertes Token ohne
        Personendaten auf einem Server liegen?</li>
      <li>Ist eine Benachrichtigung per Opt-Out-Link rechtlich möglich, für
        Menschen ohne die App?</li>
      <li>Wie lässt sich Wirksamkeit evaluieren? Studiendesign,
        Kooperationspartner?</li>
      <li>Welche Förder- und Finanzierungsmodelle sind realistisch?</li>
      <li>Strukturierte Nutzerevaluation der einzelnen Funktionen steht aus.</li>
    </ul>`,
)}
${section(
  "ausprobieren",
  "Ansehen",
  `    <p>
      Die <a href="./demo.html">Demo im Browser</a> zeigt den Aufbau. Sie
      speichert nichts — ein Neuladen beginnt von vorn. Die vier Funktionen
      oben kann ein Browser nicht leisten; sie sind dort sichtbar, aber als
      nicht verfügbar gekennzeichnet.
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
