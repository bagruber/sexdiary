import{a as e,b as t}from"./dist-FzsQM_we.js";function n(){let t=e=>Object.entries(e).map(([e,t])=>`--${e}: ${t};`).join(``);return[`:root{${t(e(`light`))}}`,`:root[data-theme="dark"]{${t(e(`dark`))}}`].join(`
`)}var r=(e,t,n)=>`
  <section id="${e}" aria-labelledby="${e}-h">
    <h2 id="${e}-h">${t}</h2>
${n}
  </section>`,i={messgeraet:`<path d="M3 17a9 9 0 0 1 18 0" /><path d="M12 17l4.5-4.5" /><circle cx="12" cy="17" r="1.6" fill="currentColor" stroke="none" />`,weitergabe:`<circle cx="4.5" cy="12" r="2.5" /><circle cx="19.5" cy="12" r="2.5" /><path d="M8 12h8" /><path d="M13.5 9.5 16.5 12l-3 2.5" />`,schloss:`<rect x="4" y="10.5" width="16" height="9.5" rx="2" /><path d="M8 10.5V7a4 4 0 0 1 8 0v3.5" /><path d="M12 14.5v2" />`},a=e=>`    <div class="karten">
${e.map(([e,t,n])=>`      <div class="karte">
        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${i[e]}</svg>
        <h3>${t}</h3>
        <p>${n}</p>
      </div>`).join(`
`)}
    </div>`,o=e=>`    <div class="karten">
${e.map(([e,t])=>`      <div class="karte"><h3>${e}</h3><p>${t}</p></div>`).join(`
`)}
    </div>`,s=e=>`    <ol class="ablauf">
${e.map(e=>`      <li${e.offen?` class="offen"`:``}>
        <p class="tat">${e.tat}</p>${e.folge?`\n        <p class="folge">${e.folge}</p>`:``}
      </li>`).join(`
`)}
    </ol>`,c=e=>`    <ul class="module">
${e.map(([e,t,n])=>`      <li>
        <h3>${e} <span class="stand">${t}</span></h3>
        <p>${n}</p>
      </li>`).join(`
`)}
    </ul>`,l=e=>`    <p class="fehlt"><strong>Fehlt noch:</strong> ${e}</p>`,u=e=>`
    <defs>
      <marker id="${e}-spitze" viewBox="0 0 10 10" refX="9" refY="5"
        markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M0 0 L10 5 L0 10 z" fill="var(--text)" />
      </marker>
      <marker id="${e}-spitze-leise" viewBox="0 0 10 10" refX="9" refY="5"
        markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M0 0 L10 5 L0 10 z" fill="var(--sub)" />
      </marker>
    </defs>`,d=()=>`    <div class="diagramm">
      <svg viewBox="0 0 720 340" role="img" aria-label="Auf dem Gerät liegen Begegnungen, Kontakte, Tests, Impfungen, Profil und die Risikoberechnung. Zum Relay gehen nur Empfänger-Token, Erreger-Label und Zeitstempel. Von dort ruft ein Kontakt mit App ab; der SMS-Weg über das Gesundheitsreferat ist geplant, nicht gebaut. Die Teststelle liefert einen signierten Befund als QR-Code. In die Cloud des Nutzers geht auf Wunsch eine verschlüsselte Sicherung.">
${u(`fluss`)}
        <rect x="255" y="0" width="245" height="250" rx="12" fill="var(--card)" stroke="var(--text)" stroke-width="2" />
        <text x="275" y="32" class="d-titel">Auf dem Gerät</text>
        <text x="275" y="62" class="d-zeile">Begegnungen und Praktiken</text>
        <text x="275" y="84" class="d-zeile">Kontakte und ihre Token</text>
        <text x="275" y="106" class="d-zeile">Tests, Impfungen, Prophylaxe</text>
        <text x="275" y="128" class="d-zeile">Profil und Impfstatus</text>
        <text x="275" y="150" class="d-zeile">Die Risikoberechnung</text>
        <text x="275" y="182" class="d-leise">AES-256-GCM, hinter einer Sperre.</text>
        <text x="275" y="198" class="d-leise">Nichts davon geht weg.</text>

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
        <text x="612" y="34" class="d-titel-klein">Relay</text>
        <text x="612" y="56" class="d-leise">Empfänger-Token</text>
        <text x="612" y="72" class="d-leise">Erreger-Label</text>
        <text x="612" y="88" class="d-leise">Zeitstempel</text>
        <text x="612" y="108" class="d-leise">sonst nichts</text>

        <rect x="600" y="150" width="120" height="80" rx="10" fill="none" stroke="var(--border)" />
        <text x="612" y="174" class="d-titel-klein">Kontakt mit App</text>
        <text x="612" y="196" class="d-leise">ruft ab, erfährt</text>
        <text x="612" y="212" class="d-leise">keinen Absender</text>

        <rect x="600" y="255" width="120" height="80" rx="10" fill="none" stroke="var(--sub)" stroke-dasharray="4 4" />
        <text x="612" y="279" class="d-titel-klein">SMS — geplant</text>
        <text x="612" y="301" class="d-leise">über das Gesund-</text>
        <text x="612" y="317" class="d-leise">heitsreferat, für</text>
        <text x="612" y="333" class="d-leise">Menschen ohne App</text>

        <line x1="150" y1="50" x2="249" y2="50" stroke="var(--text)" marker-end="url(#fluss-spitze)" />
        <text x="200" y="38" class="d-marke">signierter QR</text>
        <text x="200" y="66" class="d-marke">offline geprüft</text>

        <line x1="500" y1="50" x2="594" y2="50" stroke="var(--text)" marker-end="url(#fluss-spitze)" />
        <text x="548" y="32" class="d-marke">nur beim Senden</text>
        <text x="548" y="66" class="d-marke">Token, Erreger,</text>
        <text x="548" y="80" class="d-marke">Zeitstempel</text>

        <line x1="660" y1="120" x2="660" y2="144" stroke="var(--text)" marker-end="url(#fluss-spitze)" />

        <polyline points="600,95 575,95 575,295 594,295" fill="none" stroke="var(--sub)" stroke-dasharray="4 4" marker-end="url(#fluss-spitze-leise)" />

        <line x1="255" y1="200" x2="156" y2="200" stroke="var(--sub)" stroke-dasharray="4 4" marker-end="url(#fluss-spitze-leise)" />
        <text x="205" y="188" class="d-marke">nur auf Wunsch</text>
        <text x="205" y="216" class="d-marke">verschlüsselt</text>
      </svg>
    </div>`,f=()=>`    <div class="diagramm">
      <svg viewBox="0 0 720 250" role="img" aria-label="Vier Schichten: die Bildschirme der App, darunter die Gerätefunktionen mit sieben Fremdpaketen, darunter der Kern @sexdiary/core ohne Runtime-Abhängigkeiten und ohne Ein- und Ausgabe, darunter Android und iOS.">
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
    </div>`;function p(e=[]){return`
<a class="skip" href="#inhalt">Zum Inhalt springen</a>

<header>
  <p class="marke">Sex Diary</p>
  <button id="theme" type="button">Darstellung wechseln</button>
</header>

<main id="inhalt">
  <section class="hero" aria-labelledby="hero-h">
    <h1 id="hero-h">Sex Diary</h1>
    <p class="lead">STI Tracing mittels App.</p>
  </section>
${r(`problem`,`Drei Probleme`,a([[`messgeraet`,`Risk Awareness &amp; Testbereitschaft`,`Menschen schätzen ihr Expositionsrisiko falsch ein oder handeln nicht entsprechend.`],[`weitergabe`,`Partner Notification`,`STI-Infektionen sind stigmatisiert. Partner:innen zu kontaktieren, kann aufwändig und schambesetzt sein. Deshalb werden potentiell angesteckte Partner:innen oft gar nicht oder spät informiert.`],[`schloss`,`Sensible Daten &amp; einfache Bedienung`,`Bestehende Dienste zur persönlichen Dokumentation oder zur Integration von Testergebnissen sind selten sowohl anonym als auch niedrigschwellig und alltagstauglich.`]]))}
${r(`julia`,`Julia will anonym ihr Sex Date benachrichtigen`,`    <p class="vorspann">
      Julia und Stefan hatten einmal Sex, danach keinen Kontakt mehr. Daran will
      sie nichts ändern. Sie will ihn dennoch wissen lassen, dass er sich testen
      lassen sollte.
    </p>
${s([{tat:`Sex — danach in der App eingetragen.`,folge:`Datum, Praktiken, Schutz. Stefan wird ein Kontakt ohne Namen.`},{tat:`Wochen später erinnert die App, dass ein Test sinnvoll wäre.`,folge:`Jede Infektion hat ihr eigenes diagnostisches Fenster. Ein Test davor sagt nichts aus.`},{tat:`Der Test kommt positiv zurück: Chlamydien.`},{tat:`Wer könnte sich angesteckt haben? Die App rechnet rückwärts.`,folge:`Zwei Kontakte liegen im relevanten Zeitraum.`},{tat:`Julia entscheidet je Kontakt, ob und wie sie benachrichtigt.`,folge:`Einen ruft sie an. Stefan soll es anonym erfahren.`},{offen:!0,tat:`Stefan bekommt eine SMS vom Gesundheitsreferat.`,folge:`Absenderin ist nicht Julia. Die SMS nennt keinen Namen. <strong>Rechtlich noch zu klären</strong> — siehe offene Fragen.`},{tat:`Stefan meldet zurück, dass er sich testen lässt.`,folge:`Vier feste Antworten, kein Freitext.`}])}`)}
${r(`max`,`Max wird benachrichtigt und geht doch zum Test`,`    <p class="vorspann">
      Max geht cruisen. Das Handy bleibt zu Hause, dabei ist nur die NFC-Karte.
      Es fällt kein Name, es wird keine Nummer getauscht, und daran soll sich
      nichts ändern.
    </p>
${s([{tat:`Der andere scannt Max’ Karte. Eine Sekunde.`,folge:`Übertragen wird eine Zufallszahl. Kein Name, keine Nummer, kein Profil — und kein Telefon nötig.`},{tat:`Zu Hause trägt Max den Abend nach.`,folge:`Praktiken und Schutz, je Praktik erfasst.`},{tat:`Max schätzt das Risiko gering ein und lässt es dabei.`,folge:`Die App drängt nicht. Sie zeigt nur, ab wann welcher Test etwas aussagen würde.`},{tat:`Wochen später kommt eine Benachrichtigung.`,folge:`Der andere wurde positiv auf Syphilis getestet und hat über die Karte benachrichtigt. Kein Absender, kein Name.`},{tat:`Max geht zum Test.`,folge:`Der Test ist für Syphilis ab jetzt aussagekräftig. Die App rechnet es aus.`},{tat:`Max meldet zurück, dass er sich kümmert.`}])}
    <p class="pointe">Ohne die Benachrichtigung wäre Max nicht gegangen.</p>`)}
${r(`motive`,`Drei Motive`,o([[`Überblick behalten`,`Nutzen ab dem ersten Eintrag, auch ohne je zu benachrichtigen.`],[`Anonym benachrichtigen`,`Senkt die Hemmschwelle. Wer nicht anrufen will, unterlässt es sonst ganz.`],[`Privatsphäre schützen`,`So wenig wie möglich auf dem Server, und der in öffentlicher Hand.`]]))}
${r(`basis`,`Basisfunktionen`,c([[`Kalender`,`gebaut`,`Begegnungen, Tests, Impfungen, Prophylaxen. Zeitachse und Monatsansicht, änderbar und löschbar.`],[`Dashboard`,`gebaut`,`Was heute testbar ist, was noch wartet, und woraus sich das ergibt. Jede Aussage lässt sich auf ihren Eintrag zurückführen.`],[`Anonyme Benachrichtigung über Server-Relay`,`Ablauf gebaut, Dienst fehlt`,`App zu App über beidseitig getauschte Token. Der Dienst ist das größte offene Stück.`]]))}
${r(`soll`,`Sollfunktionen`,c([[`QR-Code für Tests und Kontakte`,`gebaut, Signaturprüfung fehlt`,`Format und Prüfverfahren liegen getestet im Kern, im Scanpfad wird die Signatur noch nicht geprüft.`],[`NFC für Kontakte`,`gebaut, auf Gerät ungetestet`,`Eine Karte, die eine Zufallszahl trägt. Wer sie dabei hat, braucht kein Telefon.`],[`Personalisierung`,`teilweise gebaut`,`Anatomie und Region bestimmen, welche Zahlen gelten. Ohne Angabe rechnet die App mit dem ungünstigsten Fall.`],[`Privacy-Features`,`gebaut`,`Sperre, Bildschirmschutz, neutraler Name, inhaltsleere Erinnerungen. Details unten.`],[`Weiterführende Information`,`in Ansätzen`,`Zu Infektionen, Symptomen und Testmöglichkeiten, situationsbezogen statt als Broschüre.`],[`Integration von Testinfrastruktur`,`Konzept`,`Terminbuchung und Befundabruf. Läuft zwischen Gerät und Teststelle, ein Betreiber steht nicht dazwischen.`],[`Warnung bei örtlichem Ausbruchsgeschehen`,`Konzept`,`Wenn eine Infektion in einer Region auffällig oft auftritt. Geht an alle gleich, ohne Personenbezug.`],[`SMS an Menschen ohne App`,`rechtlich offen`,`Der Fall Stefan. Versand über das Gesundheitsreferat, nicht über den Betreiber der App.`]]))}
${r(`diskretion`,`Diskretion auf dem Gerät`,`    <p>Nichts davon lässt sich im Browser bauen. Deshalb ist das Produkt eine native App.</p>
    <ul>
      <li>Sperre über Biometrie oder Geräte-PIN, Schlüssel im Keystore.</li>
      <li>Keine Bildschirmfotos, leere Vorschau in der App-Übersicht.</li>
      <li>Neutraler Name im Betriebssystem, Griff auf einen harmlosen Bildschirm.</li>
      <li>Erinnerungen ohne Inhalt: keine Infektion, keine Zahl, kein Datum.</li>
    </ul>
    <p>
      Berücksichtigte Infektionen:
      <span class="stis">${t.join(` · `)}</span>
    </p>`)}
${r(`architektur`,`Architektur`,`    <p>
      Die Benachrichtigung ist die einzige Stelle, an der Information zwischen
      zwei Menschen fließt — und die einzige, für die es einen Server braucht.
    </p>
${d()}
    <ul>
      <li>Alle Gesundheitsdaten liegen auf dem Gerät, verschlüsselt.</li>
      <li>Der Server hält Empfänger-Token, Erreger-Label, Zeitstempel. Sonst nichts.</li>
      <li>Ein vollständig übernommener Server gibt keine Namen, keine Historien,
        keine Absender preis.</li>
    </ul>`)}
${r(`bausteine`,`Bausteine und Abhängigkeiten`,`${f()}
    <ul>
      <li>Die Gesundheitslogik liegt in einem eigenen Paket ohne
        Runtime-Abhängigkeiten. Das ist die Prüffläche.</li>
      <li>Sieben Fremdpakete in der App-Hülle: Sperre, Bildschirmschutz,
        Speicher, Krypto, Kamera, NFC, Erinnerungen.</li>
      <li>Keine Analytik, kein Crash-Reporting, keine externen Schriften.</li>
      <li>Keine Over-the-Air-Updates. Ausgeliefert wird, was geprüft wurde.</li>
      <li>Keine Konten, keine Anmeldung, kein Nutzerverzeichnis.</li>
    </ul>`)}
${r(`server`,`Anforderungen an den Server`,`    <ul>
      <li>Drei Vorgänge: senden, zum eigenen Token abrufen, löschen.</li>
      <li>Gespeichert wird Empfänger-Token, Erreger-Label, Zeitstempel,
        optional eine Rückadresse für die Antwort.</li>
      <li>Kein Absender, kein Freitext, keine Konten.</li>
      <li>Keine ausgehenden Verbindungen, keine Zugriffslogs mit Personenbezug,
        keine IP-Vorhaltung über den Transport hinaus.</li>
      <li><code>DELETE</code> ab dem ersten Tag (Art. 17 DSGVO).</li>
      <li>Technisch: PHP mit einer Tabelle, kein Framework.</li>
    </ul>
    <h3>Deployment</h3>
    <ul>
      <li>Ausgeliefert wird ein Artefakt, kein Dienst: Quellcode, Schema,
        Betriebshandbuch, Sicherungs- und Wiederherstellungsprozedur.</li>
      <li>Die Kommune hostet selbst, auf eigener Infrastruktur.</li>
      <li>Kommerzielles Webhosting nur für Entwicklung, Demo und Pilot — für
        Art.-9-Daten fehlen dort die verlangten Nachweise.</li>
      <li>Mit dem ersten Server wird die Datenschutz-Folgenabschätzung nach
        Art. 35 fällig.</li>
    </ul>`)}
${r(`offen`,`Offene Fragen`,`    <h3>Medizinisch</h3>
    <ul>
      <li>Fünf Werte im Risikomodell sind als vermutlich unzutreffend vermerkt.
        Bei zwei Infektionen meldet die App „testbar“, wo ein negativer Befund
        nichts aussagt. Braucht infektiologische Prüfung, bevor jemand die App
        benutzt. Deshalb nennt diese Seite die Fenster noch nicht.</li>
    </ul>
    <h3>Rechtlich</h3>
    <ul>
      <li>Ist ein Token personenbezogen, sobald ein Erreger-Label daneben steht?
        Rechtsgrundlage, Aufbewahrungsdauer?</li>
      <li>SMS-Weg: Der Versender sieht eine Rufnummer, der Empfänger hat nicht
        eingewilligt. Trägt der gesetzliche Auftrag des Gesundheitsamts zur
        Kontaktnachverfolgung das?</li>
      <li>Einordnung nach MDR ist offen.</li>
      <li>Lizenz fehlt. Blockiert Code-Audit, openCode.de und Nachnutzung.
        Empfehlung: EUPL-1.2.</li>
      <li>Impressum und Datenschutzerklärung fehlen (siehe unten).</li>
    </ul>
    <h3>Betrieb</h3>
    <ul>
      <li>Wer betreibt das Relay, wer haftet?</li>
      <li>Verteilung über Stores, F-Droid, oder beides?</li>
      <li>Missbrauch ist ohne Absenderkennung nicht gezielt abwehrbar. Was
        trägt, ist strukturell: Token werden bewusst getauscht, nicht erraten.</li>
    </ul>
    <h3>Wirkung</h3>
    <ul>
      <li>Evaluationsdesign und Kooperationspartner für eine Wirksamkeitsstudie
        fehlen.</li>
      <li>Strukturierte Nutzerforschung zu den einzelnen Funktionen steht aus.</li>
      <li>Risiko Normalisierung: falsch kommuniziert könnte die App
        Risikoverhalten als gemanagt erscheinen lassen.</li>
    </ul>`)}
${r(`ausprobieren`,`Ansehen`,`    <p>
      Die <a href="./demo.html">Demo im Browser</a> zeigt den Aufbau. Sie
      speichert nichts, ein Neuladen beginnt von vorn.
    </p>
${e.length?`    <h3>Drei Szenarien zum Ausprobieren</h3>
    <p>
      Die Codes sind echt: mit der App eingelesen legen sie einen Kontakt oder
      ein Testergebnis an. Erfunden ist nur der Inhalt.
    </p>
    <div class="qrs">
${e.map(e=>`      <figure class="qr">
        ${e.svg}
        <figcaption><strong>${e.label}</strong><br />${e.hinweis}</figcaption>
      </figure>`).join(``)}
    </div>`:``}
${l(`Bezugsweg für die Android-App, sobald die Verteilung steht.`)}`)}
${r(`teststellen`,`Wo man sich testen lassen kann`,l(`Verzeichnis der Teststellen. Gehört mit geprüften Angaben gefüllt, etwa vom Gesundheitsreferat oder der Aidshilfe.`))}
${r(`impressum`,`Impressum`,l(`Anbieterkennzeichnung nach § 5 DDG: Name, ladungsfähige Anschrift, Kontakt.`))}
${r(`datenschutz`,`Datenschutz`,`    <p>
      Diese Seite setzt keine Cookies, bindet nichts von Drittanbietern ein und
      misst nichts. Die Schriften sind mitgeliefert, nicht nachgeladen.
    </p>
${l(`Erklärung nach Art. 13 DSGVO samt Verantwortlichem, Rechtsgrundlagen und Betroffenenrechten. Gehört juristisch geprüft.`)}`)}
</main>

<footer>
  <p>Kein Medizinprodukt. Ersetzt keine ärztliche Beratung.</p>
</footer>`}var m=document.getElementById(`root`);if(!m.firstElementChild){let e=document.createElement(`style`);e.textContent=n(),document.head.append(e),m.innerHTML=p()}function h(e){document.documentElement.dataset.theme=e,document.getElementById(`theme`).onclick=()=>{h(e===`dark`?`light`:`dark`)}}h(window.matchMedia?.(`(prefers-color-scheme: dark)`).matches?`dark`:`light`);