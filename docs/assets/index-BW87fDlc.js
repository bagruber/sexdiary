import{a as e,b as t}from"./dist-FzsQM_we.js";var n=1.7,r={pulse:[`M3 12.5h4.2L10 6l4 12 2.4-5.5H21`],calendar:[`M7 5h10a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z`,`M5 10h14`,`M9 3v4`,`M15 3v4`],bell:[`M6.2 10a5.8 5.8 0 0 1 11.6 0c0 4.6 1.4 6 2.2 6.9H4c.8-.9 2.2-2.3 2.2-6.9z`,`M10 20a2 2 0 0 0 4 0`],plus:[`M12 5.5v13`,`M5.5 12h13`],close:[`M6.5 6.5l11 11`,`M17.5 6.5l-11 11`],chevronRight:[`M9.5 5.5l6.5 6.5-6.5 6.5`],chevronLeft:[`M14.5 5.5L8 12l6.5 6.5`],heart:[`M12 20.3l-7.1-7.1a4.4 4.4 0 0 1 6.2-6.2l.9.9.9-.9a4.4 4.4 0 0 1 6.2 6.2z`],droplet:[`M12 3.4c0 0 5.6 6.2 5.6 9.8a5.6 5.6 0 0 1-11.2 0c0-3.6 5.6-9.8 5.6-9.8z`],user:[`M12 12.2a4.1 4.1 0 1 0 0-8.2 4.1 4.1 0 0 0 0 8.2z`,`M4.6 20.4a7.4 7.4 0 0 1 14.8 0`],shield:[`M12 3.3l7 2.5v5.4c0 4.4-2.9 7.7-7 9.5-4.1-1.8-7-5.1-7-9.5V5.8z`,`M12 9.2v5.6`,`M9.2 12h5.6`],qr:[`M4.6 4.6h5.2v5.2H4.6z`,`M14.2 4.6h5.2v5.2h-5.2z`,`M4.6 14.2h5.2v5.2H4.6z`,`M14.2 14.6v1.8`,`M18 14.6v1.8`,`M14.2 18.2v1.6`,`M18 18.2v1.6`],gear:[`M9.72 5.17L9.82 2.55L14.18 2.55L14.28 5.17L15.21 5.56L17.14 3.77L20.23 6.86L18.44 8.79L18.83 9.72L21.45 9.82L21.45 14.18L18.83 14.28L18.44 15.21L20.23 17.14L17.14 20.23L15.21 18.44L14.28 18.83L14.18 21.45L9.82 21.45L9.72 18.83L8.79 18.44L6.86 20.23L3.77 17.14L5.56 15.21L5.17 14.28L2.55 14.18L2.55 9.82L5.17 9.72L5.56 8.79L3.77 6.86L6.86 3.77L8.79 5.56Z`,`M12 15.4a3.4 3.4 0 1 0 0-6.8 3.4 3.4 0 0 0 0 6.8z`],lock:[`M6.6 10.4h10.8a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H6.6a1 1 0 0 1-1-1v-8a1 1 0 0 1 1-1z`,`M8.6 10.4V7.8a3.4 3.4 0 0 1 6.8 0v2.6`,`M12 14.4v2.4`],gauge:[`M3 17a9 9 0 0 1 18 0`,`M12 17l4.5-4.5`,`M12 15.9a1.1 1.1 0 1 0 0 2.2 1.1 1.1 0 1 0 0-2.2`],handoff:[`M4.5 9.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 1 0 0-5`,`M19.5 9.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 1 0 0-5`,`M8 12h5.6`,`M13.2 9.6 15.8 12l-2.6 2.4`]};function i(){let t=e=>Object.entries(e).map(([e,t])=>`--${e}: ${t};`).join(``);return[`:root{${t(e(`light`))}}`,`:root[data-theme="dark"]{${t(e(`dark`))}}`].join(`
`)}var a=(e,t,n)=>`
  <section id="${e}" aria-labelledby="${e}-h">
    <h2 id="${e}-h">${t}</h2>
${n}
  </section>`,o=(e,t=`icon`)=>`<svg class="${t}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${n}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${r[e].map(e=>`<path d="${e}" />`).join(``)}</svg>`,s=e=>`    <div class="karten">
${e.map(([e,t,n])=>`      <div class="karte">
        ${o(e)}
        <h3>${t}</h3>
        <p>${n}</p>
      </div>`).join(`
`)}
    </div>`,c=e=>`    <div class="karten">
${e.map(([e,t])=>`      <div class="karte"><h3>${e}</h3><p>${t}</p></div>`).join(`
`)}
    </div>`,l=e=>`    <ol class="ablauf">
${e.map(e=>`      <li${e.offen?` class="offen"`:``}>
        <p class="tat">${e.tat}</p>${e.folge?`\n        <p class="folge">${e.folge}</p>`:``}
      </li>`).join(`
`)}
    </ol>`,u=e=>`    <ul class="module">
${e.map(([e,t,n])=>`      <li>
        <h3>${e} <span class="stand${t===`gebaut`?` ist`:``}">${t}</span></h3>
        <p>${n}</p>
      </li>`).join(`
`)}
    </ul>`,d=e=>`    <p class="fehlt"><strong>Fehlt noch:</strong> ${e}</p>`,f=e=>`
    <defs>
      <marker id="${e}-spitze" viewBox="0 0 10 10" refX="9" refY="5"
        markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M0 0 L10 5 L0 10 z" fill="var(--text)" />
      </marker>
      <marker id="${e}-spitze-leise" viewBox="0 0 10 10" refX="9" refY="5"
        markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M0 0 L10 5 L0 10 z" fill="var(--sub)" />
      </marker>
    </defs>`,p=()=>`    <div class="diagramm">
      <svg viewBox="0 0 720 340" role="img" aria-label="Auf dem Gerät liegen Begegnungen, Kontakte, Tests, Impfungen, Profil und die Risikoberechnung. Zum Relay gehen nur Empfänger-Token, Erreger-Label und Zeitstempel. Von dort ruft ein Kontakt mit App ab; der SMS-Weg über das Gesundheitsreferat ist geplant, nicht gebaut. Die Teststelle liefert einen signierten Befund als QR-Code. In die Cloud des Nutzers geht auf Wunsch eine verschlüsselte Sicherung.">
${f(`fluss`)}
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
    </div>`,m=()=>`    <div class="diagramm">
      <svg viewBox="0 0 720 250" role="img" aria-label="Vier Schichten: die Bildschirme der App, darunter die Gerätefunktionen mit acht Fremdpaketen, darunter der Kern @sexdiary/core ohne Runtime-Abhängigkeiten und ohne Ein- und Ausgabe, darunter Android und iOS.">
        <rect x="1" y="1" width="718" height="248" rx="12" fill="none" stroke="var(--border)" />

        <text x="20" y="28" class="d-titel-klein">Bildschirme</text>
        <text x="20" y="48" class="d-leise">Heute · Kalender · Melden · Einträge · Einstellungen</text>
        <line x1="1" y1="60" x2="719" y2="60" stroke="var(--border)" />

        <text x="20" y="86" class="d-titel-klein">Gerätefunktionen</text>
        <text x="20" y="106" class="d-leise">Sperre · Bildschirmschutz · Speicher · Krypto · Kamera · NFC · Erinnerungen · Zeichnen</text>
        <text x="20" y="124" class="d-leise">Acht Fremdpakete, jedes mit genau einer Aufgabe</text>
        <line x1="1" y1="136" x2="719" y2="136" stroke="var(--border)" />

        <rect x="1" y="136" width="718" height="74" fill="var(--text)" />
        <text x="20" y="163" class="d-titel d-invers">@sexdiary/core</text>
        <text x="20" y="185" class="d-zeile d-invers">Risikomodell · diagnostische Fenster · Schemata · Farbtokens · i18n</text>
        <text x="20" y="203" class="d-zeile d-invers">Null Runtime-Abhängigkeiten. Keine Ein- und Ausgabe.</text>

        <text x="20" y="234" class="d-titel-klein">Android und iOS</text>
        <text x="196" y="234" class="d-leise">Ein Browser kann nicht leisten, was hier zu schützen ist.</text>
      </svg>
    </div>`;function h(e=[]){return`
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
${a(`problem`,`Drei Probleme`,s([[`gauge`,`Risk Awareness &amp; Testbereitschaft`,`Menschen schätzen ihr Expositionsrisiko falsch ein oder handeln nicht entsprechend.`],[`handoff`,`Partner Notification`,`STI-Infektionen sind stigmatisiert. Partner:innen zu kontaktieren, kann aufwändig und schambesetzt sein. Deshalb werden potentiell angesteckte Partner:innen oft gar nicht oder spät informiert.`],[`lock`,`Sensible Daten &amp; einfache Bedienung`,`Bestehende Dienste zur persönlichen Dokumentation oder zur Integration von Testergebnissen sind selten sowohl anonym als auch niedrigschwellig und alltagstauglich.`]]))}
${a(`julia`,`Julia will anonym ihr Sex Date benachrichtigen`,`    <p class="vorspann">
      Julia und Stefan hatten einmal Sex, danach keinen Kontakt mehr. Daran will
      sie nichts ändern. Sie will ihn dennoch wissen lassen, dass er sich testen
      lassen sollte.
    </p>
${l([{tat:`Sex — danach in der App eingetragen.`,folge:`Datum, Praktiken, Schutz. Stefan wird ein Kontakt ohne Namen.`},{tat:`Wochen später erinnert die App, dass ein Test sinnvoll wäre.`,folge:`Jede Infektion hat ihr eigenes diagnostisches Fenster. Ein Test davor sagt nichts aus.`},{tat:`Der Test kommt positiv zurück: Chlamydien.`},{tat:`Wer könnte sich angesteckt haben? Die App rechnet rückwärts.`,folge:`Zwei Kontakte liegen im relevanten Zeitraum.`},{tat:`Julia entscheidet je Kontakt, ob und wie sie benachrichtigt.`,folge:`Einen ruft sie an. Stefan soll es anonym erfahren.`},{offen:!0,tat:`Stefan bekommt eine SMS vom Gesundheitsreferat.`,folge:`Absenderin ist nicht Julia. Die SMS nennt keinen Namen. <strong>Rechtlich noch zu klären</strong> — siehe offene Fragen.`},{tat:`Stefan meldet zurück, dass er sich testen lässt.`,folge:`Vier feste Antworten, kein Freitext.`}])}`)}
${a(`max`,`Max wird benachrichtigt und geht doch zum Test`,`    <p class="vorspann">
      Max geht cruisen. Das Handy bleibt zu Hause, dabei ist nur die NFC-Karte.
      Es fällt kein Name, es wird keine Nummer getauscht, und daran soll sich
      nichts ändern.
    </p>
${l([{tat:`Der andere scannt Max’ Karte. Eine Sekunde.`,folge:`Übertragen wird eine Zufallszahl. Kein Name, keine Nummer, kein Profil — und kein Telefon nötig.`},{tat:`Zu Hause trägt Max den Abend nach.`,folge:`Praktiken und Schutz, je Praktik erfasst.`},{tat:`Max schätzt das Risiko gering ein und lässt es dabei.`,folge:`Die App drängt nicht. Sie zeigt nur, ab wann welcher Test etwas aussagen würde.`},{tat:`Wochen später kommt eine Benachrichtigung.`,folge:`Der andere wurde positiv auf Syphilis getestet und hat über die Karte benachrichtigt. Kein Absender, kein Name.`},{tat:`Max geht zum Test.`,folge:`Der Test ist für Syphilis ab jetzt aussagekräftig. Die App rechnet es aus.`},{tat:`Max meldet zurück, dass er sich kümmert.`}])}
    <p class="pointe">Ohne die Benachrichtigung wäre Max nicht gegangen.</p>`)}
${a(`motive`,`Drei Motive`,c([[`Überblick behalten`,`Nutzen ab dem ersten Eintrag, auch ohne je zu benachrichtigen.`],[`Anonym benachrichtigen`,`Senkt die Hemmschwelle. Wer nicht anrufen will, unterlässt es sonst ganz.`],[`Privatsphäre schützen`,`So wenig wie möglich auf dem Server, und der in öffentlicher Hand.`]]))}
${a(`basis`,`Basisfunktionen`,u([[`Kalender`,`gebaut`,`Begegnungen, Tests, Impfungen, Prophylaxen. Zeitachse und Monatsansicht, änderbar und löschbar.`],[`Dashboard`,`gebaut`,`Was heute testbar ist, was noch wartet, und woraus sich das ergibt. Jede Aussage lässt sich auf ihren Eintrag zurückführen.`],[`Anonyme Benachrichtigung über Server-Relay`,`Ablauf gebaut, Dienst fehlt`,`App zu App über beidseitig getauschte Token. Der Dienst ist das größte offene Stück.`]]))}
${a(`soll`,`Sollfunktionen`,u([[`QR-Code für Tests und Kontakte`,`gebaut`,`Ein signierter Befund wird beim Einlesen kryptographisch geprüft (Ed25519). Was nicht durchkommt, wird nicht stillschweigend übernommen — es steht dann als selbst eingetragen da, oder gar nicht.`],[`Teilnehmende Teststellen`,`keine`,`Die Prüfung läuft, das Verzeichnis der Aussteller ist leer. Solange keine Teststelle einen Schlüssel veröffentlicht, wird jeder signierte Code abgelehnt — richtig so, aber ohne Nutzen. Das ist eine Frage der Beteiligung, keine technische.`],[`NFC für Kontakte`,`gebaut, auf Gerät ungetestet`,`Eine Karte, die eine Zufallszahl trägt. Wer sie dabei hat, braucht kein Telefon.`],[`Personalisierung`,`teilweise gebaut`,`Anatomie und Region bestimmen, welche Zahlen gelten. Ohne Angabe rechnet die App mit dem ungünstigsten Fall.`],[`Privacy-Features`,`gebaut`,`Sperre, Bildschirmschutz, neutraler Name, inhaltsleere Erinnerungen. Details unten.`],[`Weiterführende Information`,`in Ansätzen`,`Zu Infektionen, Symptomen und Testmöglichkeiten, situationsbezogen statt als Broschüre.`],[`Integration von Testinfrastruktur`,`Konzept`,`Terminbuchung und Befundabruf. Läuft zwischen Gerät und Teststelle, ein Betreiber steht nicht dazwischen.`],[`Warnung bei örtlichem Ausbruchsgeschehen`,`Konzept`,`Wenn eine Infektion in einer Region auffällig oft auftritt. Geht an alle gleich, ohne Personenbezug.`],[`SMS an Menschen ohne App`,`rechtlich offen`,`Der Fall Stefan. Versand über das Gesundheitsreferat, nicht über den Betreiber der App.`]]))}
${a(`diskretion`,`Diskretion auf dem Gerät`,`    <p>Nichts davon lässt sich im Browser bauen. Deshalb ist das Produkt eine native App.</p>
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
${a(`architektur`,`Architektur`,`    <p>
      Die Benachrichtigung ist die einzige Stelle, an der Information zwischen
      zwei Menschen fließt — und die einzige, für die es einen Server braucht.
    </p>
${p()}
    <ul>
      <li>Alle Gesundheitsdaten liegen auf dem Gerät, verschlüsselt.</li>
      <li>Der Server hält Empfänger-Token, Erreger-Label, Zeitstempel. Sonst nichts.</li>
      <li>Ein vollständig übernommener Server gibt keine Namen, keine Historien,
        keine Absender preis.</li>
    </ul>`)}
${a(`bausteine`,`Bausteine und Abhängigkeiten`,`${m()}
    <ul>
      <li>Die Gesundheitslogik liegt in einem eigenen Paket ohne
        Runtime-Abhängigkeiten. Das ist die Prüffläche.</li>
      <li>Acht Fremdpakete in der App-Hülle: Sperre, Bildschirmschutz,
        Speicher, Krypto, Kamera, NFC, Erinnerungen, Zeichnen.</li>
      <li>Keine Analytik, kein Crash-Reporting, keine externen Schriften.</li>
      <li>Keine Over-the-Air-Updates. Ausgeliefert wird, was geprüft wurde.</li>
      <li>Keine Konten, keine Anmeldung, kein Nutzerverzeichnis.</li>
    </ul>`)}
${a(`server`,`Anforderungen an den Server`,`    <ul>
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
${a(`offen`,`Offene Fragen`,`    <h3>Medizinisch</h3>
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
${a(`ausprobieren`,`Ansehen`,`    <p>
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
${d(`Bezugsweg für die Android-App, sobald die Verteilung steht.`)}`)}
${a(`teststellen`,`Wo man sich testen lassen kann`,d(`Verzeichnis der Teststellen. Gehört mit geprüften Angaben gefüllt, etwa vom Gesundheitsreferat oder der Aidshilfe.`))}
${a(`impressum`,`Impressum`,d(`Anbieterkennzeichnung nach § 5 DDG: Name, ladungsfähige Anschrift, Kontakt.`))}
${a(`datenschutz`,`Datenschutz`,`    <p>
      Diese Seite setzt keine Cookies, bindet nichts von Drittanbietern ein und
      misst nichts. Die Schriften sind mitgeliefert, nicht nachgeladen.
    </p>
${d(`Erklärung nach Art. 13 DSGVO samt Verantwortlichem, Rechtsgrundlagen und Betroffenenrechten. Gehört juristisch geprüft.`)}`)}
</main>

<footer>
  <p>Kein Medizinprodukt. Ersetzt keine ärztliche Beratung.</p>
</footer>`}var g=document.getElementById(`root`);if(!g.firstElementChild){let e=document.createElement(`style`);e.textContent=i(),document.head.append(e),g.innerHTML=h()}function _(e){document.documentElement.dataset.theme=e,document.getElementById(`theme`).onclick=()=>{_(e===`dark`?`light`:`dark`)}}_(window.matchMedia?.(`(prefers-color-scheme: dark)`).matches?`dark`:`light`);