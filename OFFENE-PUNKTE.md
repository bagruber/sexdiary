# Offene Punkte

*Notiert am 26.08.2026, zuletzt fortgeschrieben am 10.09.2026 (abends). Erledigte Punkte
bitte streichen, nicht abhaken — die Datei soll kurz bleiben.*


## Was als Nächstes ansteht

**Der Relay-Server ist das Nadelöhr.** Alles andere in Welle 3 steht. Der
anonyme Versand zeigt in der App sichtbar, dass der Server fehlt — bewusst,
statt einen Versand vorzutäuschen. Daran hängen auch die Rückmeldungen aus
[ADR-0011](architecture/adr/0011-rueckmeldung.md), die im Modell liegen und
keine Oberfläche haben.

Zuschnitt steht: PHP mit MySQL auf Shared Hosting, `{Empfänger-Token, Erreger,
Zeitstempel}`, drei Vorgänge — ablegen, zum eigenen Token abholen, löschen.
`DELETE` ab dem ersten Tag (Art. 17). Ein pseudonymisiertes Token darf für den
Prototyp dort liegen; die rechtliche Frage darüber hinaus bleibt offen.

**Der Ed25519-Verifizierer hängt in der Luft.** `verifySignedResult` liegt im
Kern und ist getestet, aber **keine App ruft es auf** — der Scanpfad geht über
`parseImportPayload` und importiert ungeprüft. Ein eingelesenes Testergebnis
ist damit heute nicht mehr wert als ein von Hand eingetragenes, und
[ADR-0007](architecture/adr/0007-signierte-testergebnisse.md) ist nur auf dem
Papier umgesetzt. Die Infoseite sagt das seit dem 10.09.2026 offen.

**Auf einem Gerät zu prüfen**, alles drei nur dort feststellbar:

- Läuft `qrcode` zur Laufzeit? Es ist eine Browser-Bibliothek, Metro bündelt
  sie, aber ohne Node-Polyfills ist das ungeprüft.
- Zeichnen sich der neue Symbolsatz und der Fächer auf einem Bildschirm so,
  wie sie gedacht sind? Nichts davon lief bisher auf einem Gerät.
- Lesen sich die Kalender-Marker in drei Grauwerten überhaupt?
- NFC ist ungetestet — es braucht ein NFC-Telefon und eine beschreibbare
  NDEF-Karte.

**Entscheidungen, die niemand außer Benedict treffen kann:** eigener Keystore
statt des Debug-Schlüssels, Lizenz, die Angaben für Impressum und
Datenschutzerklärung, das Teststellenverzeichnis, und die ärztliche Prüfung der
fünf medizinischen Werte.

**Kleiner:** Cloud-Sicherung (der Dateiexport steht), Alternativ-Icon,
`user-scalable=no` in der Demo, Favicon, Merge nach `main`.


## Aufwand ist geschätzt

`notes/06-aufwandsschaetzung.md`, Stand 10.09.2026. Kurz: **600–900 Stunden**
vom Prototyp zur prüffähigen Anwendung, **380–600** wenn man Android-only
beginnt, als Pilot zuschneidet und NFC streicht. Dazu **160–280 Stunden**
User Research.

Die Notiz sagt auch, wo die Zahlen **nicht** nachgeben: DSFA, ärztliche Prüfung
und die Sicherheitsprüfung der Kryptographie. Und wo Sparen teurer wird —
`apps/mobile` hat null Tests, und grüne Builds haben in diesem Repo mehrfach
nichts bewiesen.


## Ein Einwand bleibt stehen

Beim Entscheiden vorgebracht, bewusst überstimmt — gehört notiert, nicht
weggelassen.

**Küssen bekommt einen Schutzschalter**, weil Mpox dort einen Kondomeffekt von
0,2 führt. Der Wert ist als fünfter Befund notiert und bleibt unverändert
stehen, bis eine Infektiologin darauf geschaut hat.

Der zweite Einwand — **die zwei runden Knöpfe** — ist am 10.09.2026 erledigt.
Sie stehen nicht mehr nebeneinander in der Mitte, sondern übereinander am
rechten Rand, und unterscheiden sich jetzt in Ort, Grösse und Füllung statt nur
in der Füllung. [ADR-0016](architecture/adr/0016-symbolsatz-und-kategoriefarbe.md).


## Die Oberfläche ist halb umgebaut

Seit dem 10.09.2026 gebaut: eigener Symbolsatz statt der Schriftzeichen,
Reiterleiste mit Symbol und gefüllter Pille, gestapelte Knöpfe mit
Viertelkreis-Fächer, QR als ein Pfad statt 447 Views.

**Noch offen aus derselben Durchsicht**, nach Wirkung geordnet:

- **Zeilen in eine Karte gruppieren.** Jede `Row` ist heute eine eigene `Card`
  mit 10 px Abstand — ein Stapel schwebender Kästchen. Die Referenzen setzen ein
  gedämpftes Label über *eine* Karte mit Haarlinien zwischen den Zeilen. Nach
  den Symbolen der zweitgrösste Effekt.
- **Rahmen *und* Füllung** auf jeder Karte. Beides zusammen sieht nach Wireframe
  aus; die Haarlinie gehört nach innen als Trenner.
- **`SectionTitle` in Grossversalien** mit Sperrung. Keine der Referenzen macht
  das noch.
- **Die Kopfzeile trägt den App-Namen** in 13 px, und darunter rendert jeder
  Bildschirm nochmal seinen eigenen `Title`. Die Referenzen setzen den
  Seitentitel gross in die Kopfzeile und lassen den Namen weg — er steht auf dem
  Icon.
- **Typo-Sprung zu klein** (26/15/12 gegen ~30/16/13), und 12 px Sekundärtext
  untergräbt die Entscheidung für Atkinson Hyperlegible.
- **Abstände nach Gefühl** — `marginVertical: 12`, `marginTop: 18`,
  `padding: 14`, `gap: 22`. Eine 4er-Skala als Token neben den Farben.
- **Der Fächer bewegt sich nicht.** Eine Animation muss `prefs.reducedMotion`
  achten und ist ohne Gerät nicht zu beurteilen.

Nicht anzufassen: die Palette. Gerechnet, getestet, und die Trennung von
Interaktions- und Risikoskala ist eine der besseren Entscheidungen im Repo.


## Fünf medizinische Befunde warten auf ärztliche Prüfung

Aus Welle 2, ausführlich in `architecture/risikomodell-quellen.md`,
Abschnitt 7. Der schwerste zuerst:

- **HSV-2, Fenster 16 Tage.** Die IgG-Serokonversion dauert 3 bis 12 Wochen.
  Die App sagt „jetzt testbar“, wo ein negatives Ergebnis nichts ausschließt.
- **Mpox, Fenster 21 Tage.** Mpox wird per PCR aus Läsionsmaterial
  diagnostiziert. Ein serologisches Fenster gibt es nicht.
- **Syphilis 21 und Gonorrhoe 7** liegen am optimistischen Ende ihrer
  Spannen, während HIV am konservativen liegt.
- **Hep B rezeptiv anal 0,37** sieht aus wie die Nadelstich-Zahl — anderer
  Übertragungsweg, und sie erzeugt heute `very_high`.
- **Mpox, Küssen, Kondomeffekt 0,2.** Syphilis führt für Küssen korrekt 0.
  Dieser Wert ist der einzige Grund, warum die App beim Küssen einen
  Schutzschalter anbietet.

Bewusst nicht geändert. Ein medizinisches Modell aufgrund einer
Literaturrecherche zu verstellen wäre derselbe Fehler wie es ohne Quellen zu
schreiben, nur schwerer zu bemerken. Das ist der Kernnutzen der App — es
gehört einer Infektiologin vorgelegt, bevor jemand die App benutzt.


## Der Web-Prototyp ist eingeholt

Die Gegenüberstellung vom 09.09.2026 hatte elf Lücken. Sie sind zu. Gebaut sind
seither: Schutz pro Praktik, Onboarding mit Profil, Kontakte, Impfungen,
Bearbeiten und Löschen, Monatsansicht mit Tagesblatt, QR teilen und scannen,
Code einfügen, NFC-Karten, Benachrichtigung mit persönlichem Weg, Positiv-Ablauf
und die fehlenden Einstellungen.

Zwei Dinge sind **anders** gelöst als im Web, beide bewusst:

- **NFC ist eine Karte, kein Telefonpaar.** Android Beam ist seit Android 10
  abgekündigt und entfernt; von Telefon zu Telefon geht es nicht mehr. Eine
  NDEF-Karte geht — und ist das, was die Konzeptvorstellung unter „Smartwatch /
  NFC-Karte“ ohnehin nennt.
- **Der anonyme Versand täuscht nichts vor.** Er zeigt, was übertragen würde,
  und sagt dann, dass der Server fehlt.

## Aufteilung entschieden

Seit dem 10.09.2026: **Heute · Kalender · Melden**, jeder Reiter mit Symbol,
das aktive Ziel in einer gefüllten Pille. Dazu zwei Aktionen übereinander am
rechten Rand — das Plus oben für die Begegnung (langes Drücken fächert alle
vier Arten auf einem Viertelkreis auf), der QR darunter.

Einstellungen, Profil, Sicherung und Datenansicht liegen hinter dem Zahnrad in
der Kopfzeile. Sie werden selten gebraucht; ein Drittel der Grundfläche dafür
wäre die Gleichbehandlung ungleicher Aufgaben, die ADR-0014 am alten
Vierfach-Aufbau kritisiert.

„Melden“ trägt Benachrichtigung **und** Kontakte, weil man Kontakte
benachrichtigt — sie an getrennte Orte zu legen hiesse, im Ernstfall zwischen
zwei Bildschirmen zu wechseln.

## Gepusht, CI läuft, nichts ist in `main`

30 Commits auf `refactor/wellen-0-bis-3`, PR #1 gegen `main`. Die Prüfung läuft
seit dem 09.09.2026 und war durchgehend grün — auch der Schritt, der lange
ungeprüft war: Linux erzeugt dieselben `docs/`-Hashes wie Windows.

**GitHub Pages liefert weiterhin den alten, speichernden Tracker aus `main`.**
Bewusst so gelassen, bis die Infoseite mitgemerged wird. Wer die URL hat, legt
dort bis dahin Gesundheitsdaten im Browser ab.

`pnpm/action-setup@v4` läuft auf Node 20, das GitHub als veraltet meldet.

Weiter offen: zwei Änderungen im Working Tree von `hausbasis`, beide uncommitted
— der gegenstandslose Ausnahme-Eintrag für sexdiary ist entfernt, und
`baseline.json` führt die sechs ESLint-Pakete.

## Die Anforderungen stehen jetzt geschrieben

`architecture/anforderungen.md`, seit dem 10.09.2026: FA und NFA mit festen
Kennungen, Ist-Status statt Soll-Status, was ausdrücklich *nicht* gefordert ist,
und eine Nachverfolgbarkeitstabelle Anforderung → ADR → Code.

**Als Nächstes daneben**, jeweils eine Datei: `datenmodell.md`
(Klassendiagramm der Domäne plus das eine MySQL-Schema des Relays — ein
klassisches DB-Schema gibt es nicht, die App führt ein verschlüsseltes
JSON-Dokument, und genau das gehört aufgeschrieben), `zustaende.md` (Lock,
Benachrichtigungs-Lebenszyklus, und der wichtigste: der Testfenster-Zustand je
Erreger) und `bildschirmfluss.md`.

Was `architecture/` schon hat und in keiner neuen Datei wiederholt gehört:
Architekturdiagramm als C4 Stufe 1 bis 3, drei Sequenzdiagramme und die
Verteilungssicht stehen in `arc42.md`, die Schnittstellen in `interfaces/`.


## Lizenz weiterhin offen

Steht seit dem 10.07.2026 auf "all rights reserved". Am 27.08.2026 bewusst
offen gelassen. Blockiert Code-Audit, Veroeffentlichung auf openCode.de,
F-Droid und die Nachnutzung durch ein zweites Gesundheitsamt. Empfehlung
unveraendert EUPL-1.2. Begruendung in `notes/05`, Abschnitt 6.1.


## Relay laeuft auf Shared Hosting, also PHP

Geklaert am 10.09.2026: der Hostinger-Plan ist **Shared**, kein VPS. Damit ist
kein langlaufender Node-Prozess moeglich, und der Partner-Alert-Server aus
ADR-0008 wird PHP mit MySQL.

Fuer den Zuschnitt ist das kein Verlust. Der Relay traegt
`{Empfaenger-Token, Erreger, Zeitstempel}` und kennt drei Vorgaenge: ablegen,
zum eigenen Token abholen, loeschen. Das sind ein paar Dutzend Zeilen, und fuer
eine Sicherheitspruefung ist eine lesbare PHP-Datei eher ein Vorteil als eine
Serverless-Funktion mit Anbieterbindung.

Was damit **nicht** geht und in `notes/05` anders stand: Docker, eigene Ports,
Hintergrundprozesse. Der Direktabruf von Testergebnissen (ADR-0012) und alles,
was einen laufenden Dienst braucht, bleibt davon beruehrt.

Offen bleibt die Frage aus dem Pitch, die keine technische ist: **darf ein
pseudonymisiertes Token ohne Personendaten ueberhaupt auf einem Server
liegen?** Die gehoert rechtlich geklaert, bevor der Relay Daten annimmt.


## index.html hat kein Favicon

Jeder Seitenaufruf erzeugt einen 404. Vorbestehend, harmlos, aber vor einer
oeffentlichen Instanz zu beheben.
