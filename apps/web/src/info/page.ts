/**
 * Inhalt der Informationsseite, ohne DOM und ohne Stylesheet-Import.
 *
 * Getrennt von `main.ts` aus demselben Grund wie bei der Designseite: so
 * laesst sich die Seite ausserhalb eines Browsers rendern und ansehen.
 * In diesem Repo hat sich zu oft gezeigt, dass ein gruener Build wenig
 * ueber das Ergebnis sagt.
 *
 * Die Seite kennt keinen Nutzer, verarbeitet keine Gesundheitsdaten und
 * hat keine Verbindung zur App (ADR-0001). Sie laedt nichts von
 * Drittanbietern — keine Schriften, keine Analytik, keine Einbettungen.
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

/**
 * Platzhalter, die als Platzhalter aussehen sollen. Ein Impressum mit
 * erfundenen Angaben waere schlimmer als keines, und ein
 * Teststellenverzeichnis mit erfundenen Adressen schickt Menschen an
 * Tueren, hinter denen niemand ist.
 */
const fehlt = (was: string): string =>
  `    <p class="fehlt"><strong>Fehlt noch:</strong> ${was}</p>`;

export function render(): string {
  return `
<a class="skip" href="#inhalt">Zum Inhalt springen</a>

<header>
  <p class="marke">Sexdiary</p>
  <button id="theme" type="button">Darstellung wechseln</button>
</header>

<main id="inhalt">
  <section class="hero" aria-labelledby="hero-h">
    <h1 id="hero-h">
      Ein Test sagt erst dann etwas aus, wenn genug Zeit vergangen ist.
    </h1>
    <p class="lead">
      Sexdiary rechnet aus, wann dieser Zeitpunkt gekommen ist. Bis dahin
      sagt es, was ein Ergebnis ueberhaupt wert waere. Alles bleibt auf
      dem Telefon.
    </p>
  </section>
${section(
  "fenster",
  "Das diagnostische Fenster",
  `    <p>
      Zwischen einer moeglichen Ansteckung und dem Moment, in dem ein Test
      sie finden kann, liegt Zeit. Wer zu frueh testet, bekommt ein
      negatives Ergebnis, das nichts ausschliesst — und geht beruhigt nach
      Hause. Dieses Fenster ist je nach Infektion unterschiedlich lang.
    </p>
    <p>
      Die App fuehrt Buch ueber Begegnungen und leitet daraus ab, ab wann
      ein Test welche Infektion sinnvoll ausschliesst. Sie beruecksichtigt
      dabei, welche Praktiken stattgefunden haben und was dabei geschuetzt
      war — einzeln, nicht pauschal.
    </p>
    <p class="hinweis">
      <strong>Die hinterlegten Zeitraeume stehen zur aerztlichen
      Pruefung</strong> und werden hier deshalb noch nicht im Einzelnen
      veroeffentlicht. Fuenf Werte sind im Projekt als vermutlich
      unzutreffend vermerkt; zwei davon wuerden zu frueh „testbar“ melden.
      Geaendert werden sie erst, wenn eine Infektiologin darauf geschaut
      hat. Ein medizinisches Modell aufgrund einer Literaturrecherche zu
      verstellen waere derselbe Fehler wie es ohne Quellen zu schreiben,
      nur schwerer zu bemerken.
    </p>
    <p>
      Beruecksichtigt werden derzeit:
      <span class="stis">${STI_NAMES.join(" · ")}</span>
    </p>`,
)}
${section(
  "geraet",
  "Die Daten verlassen das Geraet nicht",
  `    <p>
      Es gibt kein Konto, keinen Server und keine Synchronisierung. Alles
      liegt verschluesselt auf dem Telefon; der Schluessel steckt im
      Schluesselspeicher des Geraets und wandert nicht in Systembackups.
    </p>
    <p>
      Das ist keine Einstellung, sondern der Aufbau. Es gibt niemanden,
      der die Daten herausgeben koennte, weil niemand sie hat.
    </p>`,
)}
${section(
  "diskretion",
  "Gebaut gegen den Blick von nebenan",
  `    <p>
      Das realistische Risiko ist nicht der Angreifer im Netz, sondern die
      Person, die daneben sitzt oder das entsperrte Telefon in der Hand
      haelt. Dagegen wirken vier Dinge, die es nur nativ gibt:
    </p>
    <ul>
      <li><strong>Sperre.</strong> Vor dem Oeffnen fragt das Geraet nach
        Biometrie oder PIN — der des Geraets, nicht einer eigenen.</li>
      <li><strong>Kein Bildschirmfoto.</strong> Aufnahmen sind gesperrt,
        und in der App-Uebersicht bleibt die Vorschau leer.</li>
      <li><strong>Tarnmodus.</strong> Neutraler Name, unauffaellige
        Sperrseite, ein Griff auf einen harmlosen Bildschirm.</li>
      <li><strong>Erinnerungen ohne Inhalt.</strong> Eine Meldung sagt,
        dass etwas ansteht — keine Infektion, keine Zahl, kein Datum.</li>
    </ul>`,
)}
${section(
  "benachrichtigung",
  "Partner benachrichtigen, ohne sich zu erkennen zu geben",
  `    <p>
      Nach einem positiven Befund ist die schwierigste Aufgabe, die
      Menschen zu erreichen, die es angeht. Sexdiary erzeugt fuer jeden
      Kontakt ein Kennzeichen ohne Namen. Eine Benachrichtigung sagt, dass
      ein Test sinnvoll ist, und nennt nicht, von wem sie kommt.
    </p>`,
)}
${section(
  "ausprobieren",
  "Ansehen und bekommen",
  `    <p>
      Es gibt eine <a href="./demo.html">Demo im Browser</a>. Sie zeigt den
      Aufbau, speichert aber nichts: ein Neuladen beginnt von vorn. Die
      vier Funktionen oben kann ein Browser grundsaetzlich nicht leisten —
      sie sind dort sichtbar, aber als nicht verfuegbar gekennzeichnet.
    </p>
${fehlt("Bezugsweg fuer die Android-Anwendung, sobald die Verteilung steht.")}`,
)}
${section(
  "teststellen",
  "Wo man sich testen lassen kann",
  fehlt(
    "Verzeichnis der Teststellen. Erfundene Adressen schicken Menschen an " +
      "Tueren, hinter denen niemand ist — hier gehoeren geprüfte Angaben " +
      "hin, etwa vom Gesundheitsamt oder der Aidshilfe.",
  ),
)}
${section(
  "impressum",
  "Impressum",
  fehlt(
    "Anbieterkennzeichnung nach § 5 DDG: Name, ladungsfaehige Anschrift " +
      "und Kontakt. Muss von der verantwortlichen Person kommen und darf " +
      "nicht geraten werden.",
  ),
)}
${section(
  "datenschutz",
  "Datenschutz",
  `    <p>
      Diese Seite setzt keine Cookies, bindet nichts von Drittanbietern
      ein und misst nichts. Sie laedt ausschliesslich Dateien von diesem
      Server; auch die Schriften sind mitgeliefert und werden nicht
      nachgeladen.
    </p>
    <p>
      Die App selbst verarbeitet Gesundheitsdaten ausschliesslich auf dem
      Geraet. Es findet keine Uebermittlung an den Anbieter statt.
    </p>
${fehlt(
    "Vollstaendige Erklaerung nach Art. 13 DSGVO samt Verantwortlichem, " +
      "Rechtsgrundlagen und Betroffenenrechten. Gehoert juristisch geprueft.",
  )}`,
)}
</main>

<footer>
  <p>
    Kein Medizinprodukt. Ersetzt keine aerztliche Beratung.
  </p>
</footer>`;
}
