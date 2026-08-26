# Refactor-Vorschlag — Design, Usability, Code Quality, Verwaltungstauglichkeit

Erstellt 26.08.2026. Loest `VERSION-UPGRADE.md` in der Sache ab (siehe Welle 0)
und schreibt `notes/01-refactor-audit.md` fort. Auf Deutsch, weil der groesste
Teil davon deutsche Verwaltung betrifft; ASCII-Umschrift wie in den anderen
Dateien von 08/2026.

---

## 0. Der Befund, der die Reihenfolge aendert

**Der in `VERSION-UPGRADE.md` dokumentierte React-Konflikt existiert nicht mehr.**

Das Briefing wurde geschrieben, als Expo SDK 54 aktuell war. Inzwischen steht
Expo bei **57.0.17** mit React Native **0.87.1**, und dessen Peer-Requirement
lautet `react: ^19.2.3`. Das offizielle Expo-57-Template pinnt `react 19.2.3`,
`react-dom 19.2.3`, `@types/react ~19.2.2`.

Damit gilt: Wer `apps/mobile` auf Expo 57 zieht, landet ohne Zutun auf React
19.2.x — also genau auf dem, was `hausbasis/baseline.json` fuer alle Repos
vorgibt (`react ^19.2.8`). Es gibt danach **eine** React-Major *und* eine
React-Minor im Workspace.

Konsequenzen:

- Der Weg ist nicht mehr "web auf 19 ziehen und mobile auf 19.1.0 stehen
  lassen" (was zwei Minors hinterlassen haette), sondern **beide Apps auf
  19.2.x**.
- Der Ausnahme-Eintrag `"sexdiary"` in `hausbasis/baseline.json` kann danach
  ersatzlos weg.
- pnpm wird moeglich, ohne dass `lucide-react` in TS2786 laeuft.
- **Expo zuerst, dann web** — nicht umgekehrt. Wenn Expo 57 aus einem
  unerwarteten Grund nicht durchgeht, will man das wissen, bevor `apps/web`
  angefasst wurde.

**Einziges echtes Risiko der Welle:** hausbasis will `typescript ~7.0.2`, das
Expo-57-Template liefert `~6.0.3`. TypeScript 7 (die Go-Portierung) gegen die
Typflaeche von React Native ist die am wenigsten erprobte Kombination in diesem
Repo. Das gehoert **als erstes** geprueft, nicht als letztes.

---

## 1. Code Quality — was messbar im Weg steht

Zahlen aus `apps/web/src`, Stand 26.08.2026.

### 1.1 `FONT` zeigt ins Leere — 91-mal

`theme/tokens.ts:1` definiert `FONT = "'DM Sans', system-ui, …"`. DM Sans wurde
am 10.07.2026 entfernt (Google-Fonts-Request, DSGVO). Der Verweis blieb stehen.
91 Komponenten setzen `fontFamily: FONT` inline — jede einzelne loest auf den
Fallback auf, den `global.css` ohnehin schon auf `body` setzt.

91 Zeilen reine Subtraktion, kein Pixel aendert sich. Guter Einstieg, weil er
den Diff-Laerm aus allen folgenden Wellen nimmt.

### 1.2 Theming liegt in JavaScript — 244 Inline-Styles, 263 `palette.`-Zugriffe

Audit-Befund Q8, und der teuerste. Die Farbe kommt aus einem JS-Objekt in den
React-Baum. Das kostet nicht primaer Performance, es kostet **Faehigkeiten**:

- Kein `prefers-contrast`, kein `forced-colors` (Windows-Kontrastmodus — BITV-relevant).
- Kein Druck-Stylesheet. Wer seine Testhistorie zum Arzt mitnehmen will, kann nicht drucken.
- Kein maschineller Kontrast-Check. Ein Auditor kann keine CSS-Datei pruefen, er muesste den Bundle lesen.

Ziel: Palette als CSS-Custom-Properties auf `:root[data-theme="…"]`, JS-Objekt
nur noch dort, wo wirklich ein Farbwert gebraucht wird (QR-Canvas). Das ist die
Voraussetzung fuer Welle 3 und nicht nachtraeglich billiger zu haben.

### 1.3 Zwei Designsysteme fuer ein Produkt

`apps/web/src/theme/palette.ts` und `apps/mobile/src/theme.ts` sind unabhaengig
entstanden und stimmen in nichts ueberein:

| | web | mobile |
|---|---|---|
| Benennung | `teal`, `rose`, `amber`, `green` | `accent`, `good`, `warn`, `bad` |
| Hintergrund dunkel | `#16161D` | `#17151F` |
| Karte dunkel | `#1F1F28` | `#211E2B` |
| Risikoskala | 7 eigene Hexwerte | Mapping auf 3 Palettenfarben |

Dieselbe Risikostufe hat auf beiden Plattformen eine andere Farbe. Das ist kein
Schoenheitsfehler: Die Risikofarbe ist der **einzige** Kodierungskanal fuer die
Kernaussage der App (s. 3.4). Sie gehoert nach `packages/core` — dann ist sie
auch testbar, wie der Rest der Gesundheitslogik.

### 1.4 Zwei Schalter, die den Nutzer anluegen

- `prefs.lock` — Audit-Befund Q10, in `apps/web` weiterhin offen.
- `prefs.notifs` — **neu, im Audit nicht erfasst.** `SettingsView.tsx:267`
  schreibt den Wert, gelesen wird er von nichts. Es gibt keinerlei
  Benachrichtigungscode im Web-Client.

Beide stehen im Einstellungsdialog einer Gesundheitsapp und versprechen Schutz
bzw. Erinnerungen. Entweder implementieren oder ausbauen — stehenlassen ist die
einzige Option, die nicht geht.

### 1.5 `window.confirm` / `alert` an vier Stellen

Audit Q9, offen. Besonders `App.tsx:107`: Delete-All haengt an einem
hartkodierten `lang === "de" ? … : …`, waehrend daneben ein vollstaendig
typisiertes `t()` liegt. Systembestaetigungsdialoge sind nicht stylebar, nicht
lokalisierbar ueber die eigene i18n, und ihr Fokusverhalten ist nicht kontrollierbar.

### 1.6 `mock-server.ts` ist eine Implementierung, keine Schnittstelle

Audit Q12, offen — und es ist **die Naht, an der der Hostinger-Server andockt**
(Abschnitt 5). Zusaetzlich benutzt `sendAlert()` `Math.random()` fuer IDs,
obwohl `packages/core/src/id.ts` genau dafuer krypto-basierte IDs bereitstellt
(Q4 wurde in core geloest, hier nicht nachgezogen).

### 1.7 Kein Linter, kein Formatter, keine CI

Audit Q7, offen. `notes/02` behauptet gegenueber der Verwaltung "reproducible
builds, pinned dependencies, unit tests" — durchgesetzt wird davon nichts. Die
45 Tests laufen nur, wenn jemand daran denkt. Fuer Welle 0 (Versionsupgrade
ueber drei Expo-Majors) ist eine CI nicht Kosmetik, sondern das Netz.

### 1.8 `packages/core` ist kein Paket, sondern ein Alias

`main: src/index.ts` plus ein Vite-Alias auf die Quelldatei. Funktioniert im
Monorepo, hat aber zwei Folgen: core wird nie als eigenstaendiges Artefakt
typgeprueft, und **nichts ausserhalb des Monorepos kann es importieren**. Der
Alert-Server (Abschnitt 5) muss aber dieselben Schemata validieren wie die App
— sonst gibt es zwei Wahrheiten ueber das Payload-Format. Spaetestens dann
braucht core einen echten `exports`-Block.

### 1.9 `AddEditSheet.tsx`, 564 Zeilen

Das einzige Modul, das wirklich zu gross ist: vier Formulare
(Intercourse/Test/Contact/Vaccination) in einer Datei. Nicht dringend, aber es
ist die Datei, in der jede neue Feldaenderung landet.

---

## 2. Design — was ein Aussenstehender zuerst sieht

### 2.1 Ein 430px-Telefon in einer leeren Flaeche

`App.tsx` rahmt alles auf `maxWidth: 430` mittig. Auf einem Desktop-Browser ist
das ein Telefon-Mockup im Nichts. Wenn ein Gesundheitsamt von seiner Seite auf
die Web-App verlinkt, ist das der erste Eindruck — und er liest sich als
"unfertiger Prototyp", unabhaengig von der Qualitaet dahinter.

Zwei ehrliche Optionen, keine dritte:

- **Bekennen**: Desktop bekommt eine gestaltete Rahmung (Erklaertext,
  Datenschutzaussage, Install-Hinweis) und das Telefon sitzt bewusst darin.
- **Responsiv**: ab `md` ein zweispaltiges Layout, Bottom-Nav wird Sidebar.

Empfehlung: bekennen. Die App ist inhaltlich ein Telefonwerkzeug, und die
Rahmung kann genau die Vertrauensarbeit leisten, die der App-Inhalt selbst
nicht leisten kann.

### 2.2 `overflow: hidden` + versteckte Scrollbars

`global.css` schaltet Scrollbars global ab (`::-webkit-scrollbar { display:
none }`, `scrollbar-width: none`) und setzt `body { overflow: hidden }`. Auf dem
Telefon ist das App-Shell-Konvention. Am Desktop nimmt es die
Positionsanzeige — fuer Nutzer mit eingeschraenktem Sehvermoegen und fuer alle,
die per Scrollbar navigieren, ist das ein echter Verlust. Innerhalb der
430px-Spalte verstecken, ausserhalb nicht.

### 2.3 Der Fokusring hat keinen eigenen Farbwert

`outline: 2px solid currentColor` auf `:focus-visible`. Auf einem gefuellten
Button ist `currentColor` gleich `#fff` — weisser Ring auf tealfarbenem Button,
Kontrast praktisch null. Der Fokusindikator braucht ein eigenes Token mit
gepruefetem Kontrast gegen *beide* Themes. WCAG 2.4.11 haengt daran.

### 2.4 Kein Druck-Stylesheet

Siehe 1.2. Ein Anwendungsfall, der in der Zielgruppe real ist: Testhistorie
ausdrucken oder als PDF zum Arzt mitnehmen. Kostet eine `@media print`-Regel,
sobald die Farben in CSS liegen.

---

## 3. Usability — nach Schadenspotenzial sortiert

### 3.1 Die Web-App startet mit erfundenen Sexualkontakten (Audit Q11)

`freshAppData()` liefert Demo-Daten als Default. Mobile hat das am 10.07.2026
hinter eine explizite Auswahl gelegt, **web nicht**. Ein realer Nutzer oeffnet
die App und sieht fremde, erfundene Kontakte und Testergebnisse als seine
eigenen.

Das ist der schaedlichste offene Punkt im ganzen Repo. Nicht wegen Datenschutz —
die Daten sind erfunden — sondern weil es die eine Eigenschaft zerstoert, auf
der alles andere steht: dass der Nutzer dem glaubt, was da steht. Wer einmal
gesehen hat, dass die App Daten erfindet, prueft danach jede Zahl.

Gehoert vor jede andere Usability-Arbeit.

### 3.2 Vier Features existieren nur auf mobile

Erklaerung der Bewertung, Next-Action, Impfserie, "Deine Daten" — die Logik
liegt vollstaendig in core, es fehlt nur die Web-Oberflaeche. Solange das so
ist, gibt es zwei Produkte mit einem Namen, und jede Demo muss vorher klaeren,
welches gerade gezeigt wird.

Die Erklaerung der Bewertung ist dabei die wichtigste: Sie ist gleichzeitig das
staerkste Vertrauensfeature *und* das Argument, das die App vom "Diagnosescore"
zur "Aufklaerung" verschiebt — also die MDR-Position entschaerft (s. 6.2).

### 3.3 Kein Undo, kein Soft-Delete

Ein `window.confirm` steht zwischen dem Nutzer und dem Verlust der gesamten
Historie. Bei Daten, die nirgends sonst existieren und nicht rekonstruierbar
sind, ist das zu wenig. Delete-All gehoert hinter eine getippte Bestaetigung,
Einzelloeschungen hinter ein Undo-Fenster.

### 3.4 Risiko wird ausschliesslich ueber Farbe kodiert

`riskColor()` bildet sieben Stufen auf eine Gruen-Gelb-Rot-Skala ab. Rot-Gruen-
Schwaeche betrifft rund 8 % der maennlichen Bevoelkerung — in der Zielgruppe
dieser App also einen erheblichen Anteil. Zweiter Kanal noetig: Textlabel und
Form/Icon, nicht nur Farbe. BITV-Pflicht, aber unabhaengig davon schlicht richtig.

### 3.5 Keine Erinnerungen

Das Produktkonzept ist "Fenster schliesst sich in n Tagen". Ohne Benachrichtigung
muss der Nutzer selbst daran denken, die App zu oeffnen, um daran erinnert zu
werden. Das ist der Punkt, an dem die native App (Abschnitt 4) mehr ist als eine
Verpackung.

### 3.6 Kein "Was jetzt?" nach einem positiven Ergebnis

Der Flow endet beim Alert-Versand. Genau dort braucht der Nutzer Behandlungs-
information und eine Beratungsstelle in der Naehe. Das ist zugleich der
konkreteste Andockpunkt an ein Gesundheitsamt (s. 6.4).

---

## 4. (A) Native App — was dadurch real wird

Ausgangslage ehrlich: `apps/mobile` **ist nie auf einem Geraet gelaufen**.
Verifiziert sind Typecheck und Metro-Bundle-Export. Der erste Schritt jeder
Native-Arbeit ist deshalb nicht Feature-Arbeit, sondern ein Smoke-Test — und der
faellt ohnehin in Welle 0 an, weil Expo 54 -> 57 drei Majors sind.

Was ein echter Build freischaltet, das im Browser prinzipiell nicht geht:

| Feature | heute | nativ |
|---|---|---|
| App-Lock | simuliert, im UI als solches beschriftet | `expo-local-authentication`, Keystore-gebunden — echte Grenze |
| Screenshot-Schutz | nicht moeglich | Android `FLAG_SECURE`, iOS Recents-Blur |
| Tarnung | nur In-App-Name + Decoy | alternatives App-Icon + OS-Name |
| Erinnerungen | keine | lokale Notifications, **ohne Server, ohne DSGVO-Flaeche** |
| Verschluesselung at rest | SecureStore + AES-GCM | zusaetzlich `NSFileProtectionComplete` |
| QR-Scan | jsQR ueber getUserMedia | `expo-camera` |

Der Screenshot-Schutz verdient Hervorhebung: Fuer diese App ist das
realistische Bedrohungsmodell die Person, die neben einem sitzt oder das
entsperrte Telefon in der Hand hat — nicht ein Angreifer im Netz. Genau dagegen
wirken FLAG_SECURE, Recents-Blur, Tarnicon und biometrischer Lock. Das sind
keine Politur, das ist das Kernversprechen.

### 4.1 EAS oder lokal — die Frage aus `notes/04` ist falsch gestellt

Sie ist keine Entweder-oder-Frage:

- **Fuer die taegliche Arbeit: EAS.** Ohne Mac gibt es sonst keinen iOS-Build,
  und Android-Toolchain-Pflege kostet Zeit ohne Gegenwert.
- **Fuer den Verwaltungs-Pitch: der lokale Pfad muss bewiesen und dokumentiert
  sein.** `expo prebuild` + Gradle, ein Kommando, ein signiertes APK, in der
  README mit exakten Toolchain-Versionen. Nicht, weil die Stadt selbst bauen
  wird, sondern weil "wir sind auf keinen Cloud-Dienst angewiesen" nur zaehlt,
  wenn es jemand einmal vorgefuehrt hat.

Praktische Reihenfolge: **Android zuerst**. Laesst sich vollstaendig lokal unter
Windows bauen; iOS braucht Apple-Developer-Account und Mac.

### 4.2 F-Droid als Verteilungsweg

Wenn die Lizenz auf EUPL-1.2 geht (Abschnitt 6.1), wird F-Droid moeglich. Fuer
eine Sexualgesundheits-App ist das aus zwei Gruenden interessant: Es ist ein
starkes Vertrauenssignal, und es umgeht die Data-Safety-Deklaration im Play
Store, die bei dieser Kategorie unangenehme Fragen erzeugt. F-Droid verlangt
reproduzierbare Builds aus Quellcode — also genau das, was der lokale Buildpfad
aus 4.1 ohnehin liefert. Zwei Ziele, ein Arbeitspaket.

---

## 5. (B) Hostinger — was dadurch real wird, und was nicht

**Offene Frage, die alles danach bestimmt: Shared Hosting oder VPS?**
Shared Hosting bedeutet kein langlaufender Node-Prozess — dann geht Punkt 5.3
nicht, ohne PHP zu schreiben. VPS mit Root und Docker macht alles unten moeglich.

### 5.1 Domain und TLS — der billigste grosse Gewinn

Loest eine ganze Reihe von Problemen auf einmal:

- `base: "./"` und der GitHub-Pages-Unterpfad entfallen.
- **PWA wird moeglich**: Manifest, Service Worker, installierbar, offlinefaehig.
  Unter Android ist das faktisch eine App und deckt die Reichweite ab, waehrend
  der Store-Weg laeuft.
- Impressum und Datenschutzerklaerung bekommen stabile URLs — nach TMG/DDG
  Pflicht, sobald das Ding oeffentlich angeboten wird (`notes/02`, Punkt 5), und
  die Store-Listings verlangen ohnehin eine Datenschutz-URL.
- **`docs/` kann aus dem Repo verschwinden.** Build in der CI, Deploy per
  rsync/SSH. Damit liegen keine unreviewten Bytes mehr im Repo — was Auditoren
  konkret stoert und was heute eine Warnung in `notes/00` noetig macht.

### 5.2 Staging

Eine zweite Subdomain, um einem Amt etwas zu zeigen, ohne die oeffentliche
Instanz anzufassen. Klingt banal, ist im Gespraech mit einer Verwaltung der
Unterschied zwischen "koennen wir das mal sehen" und "schicken Sie uns was".

### 5.3 Der Partner-Alert-Server (Roadmap P2)

Aus `mock-server.ts` wird eine echte Schnittstelle. Zuschnitt kommt vollstaendig
aus `notes/02`:

- Gespeichert wird ausschliesslich `{ recipientToken, stiLabel, timestamp }`.
  Kein Absender, keine IP ueber den Transport hinaus, kein Nachrichtentext.
- **`DELETE` ab Tag eins**, nicht spaeter — Art. 17 verlangt, dass Delete-All in
  der App auch serverseitige Alerts an das eigene Token loescht.
- Ein Container, eine SQLite-Datei, keine ausgehenden Verbindungen. Je
  langweiliger, desto billiger die Sicherheitspruefung.
- Validierung gegen dieselben Schemata wie die App — siehe 1.8, core braucht
  dafuer einen echten `exports`-Block.

### 5.4 Signierte Klinik-QRs

Eine Seite, auf der eine Teststelle ein JWS-signiertes Ergebnis-Payload erzeugt;
die App verifiziert gegen einen hinterlegten Public Key und zeigt "verifiziertes
Ergebnis von <Einrichtung>". `notes/02` empfiehlt, das `sig`-Feld jetzt schon im
Envelope vorzusehen — das kostet heute nichts und spart spaeter eine
Schema-Migration.

### 5.5 Der Vorbehalt, der explizit werden muss

**Hostinger ist nicht der Produktionshost fuer eine kommunale Nutzung.** Eine
deutsche Kommune wird Art.-9-Daten nicht auf einem kommerziellen Massenhoster
verarbeiten lassen — unabhaengig davon, dass Hostinger EU-Rechenzentren und
einen AV-Vertrag anbietet. Verlangt werden Nachweise, die dort nicht zu
bekommen sind: BSI-IT-Grundschutz-Bezug, definierte Verantwortlichkeiten,
ein AV-Vertrag mit ihren Klauseln.

Das ist kein Problem, sondern die Architekturvorgabe: **Hostinger = Entwicklung,
Demo, Staging, oeffentliche Demo-Instanz. Produktion = "hier ist das
Dockerfile".** Wenn das von Anfang an so gebaut ist — ein Container, eine
Datei, kein Vendor-Dienst — ist die Selbst-Hostbarkeit ein Verkaufsargument
statt einer Nachruestung.

Und ein zweiter Vorbehalt: **Mit dem ersten Server wird die DSFA nach Art. 35
faellig**, und das Local-First-Argument muss haerter verteidigt werden. Fuer
jeden neuen Endpunkt die Frage stellen: koennte das auf dem Geraet bleiben?

---

## 6. Verwaltungssicht — Integrierbarkeit, Wartbarkeit, Datenschutz

Gedacht am Beispiel einer Grossstadt wie Muenchen. Organisationsbezeichnungen
und Ratsbeschluesse vor einem tatsaechlichen Gespraech verifizieren — hier steht
die Struktur des Arguments, nicht der Aktenstand.

### 6.1 Die Lizenz blockiert alles andere — und kostet null Code

Aktuell "all rights reserved". Das verhindert gleichzeitig:

- den Code-Audit, der in jeder kommunalen Beschaffung verlangt wird,
- die Veroeffentlichung auf **openCode.de** (die Open-Source-Plattform der
  oeffentlichen Verwaltung, betrieben vom ZenDiS) — der kanonische Weg, auf dem
  ein zweites Gesundheitsamt das Ding ueberhaupt findet,
- F-Droid (4.2),
- die Nachnutzung durch eine andere Kommune, was das eigentliche Ziel ist.

Empfehlung unveraendert **EUPL-1.2**: die Lizenz der EU-Kommission, in deutschen
Verwaltungen bekannt, in 23 Sprachen rechtsverbindlich, mit Copyleft, das
Rueckfluss sichert. Eine Datei, ein README-Absatz. Von allen offenen Punkten der
mit dem besten Verhaeltnis von Aufwand zu Wirkung — und Muenchens
Open-Source-Linie macht ihn zur Eintrittskarte statt zur Kuer.

### 6.2 Der MDR-Punkt entscheidet, wie das Gespraech laeuft

`notes/02` laesst die Frage bewusst offen. Fuer ein Verwaltungsgespraech ist
"offen" aber keine Position — die Frage kommt in den ersten zwanzig Minuten.

Der praktische Weg ist der, den die Arbeit vom 10.07.2026 schon eingeschlagen
hat, ohne ihn so zu benennen: **`contributions[]` verschiebt das Produkt vom
Score zur Aufklaerung.** Wer erklaert, welche konkreten Begegnungen zu welcher
Aussage gefuehrt haben und welche Fenster gelten, informiert; wer eine Zahl
ausgibt, bewertet. Diese Verschiebung konsequent zu Ende zu fuehren — Sprache,
Darstellung, Onboarding — ist wahrscheinlich der Unterschied zwischen "ausserhalb
MDR" und "Klasse IIa nach Regel 11".

Direkt daran haengt: **Quellenangaben in `stis.ts`.** Jede Uebertragungs- und
Fensterzahl braucht eine Referenz (RKI/WHO/CDC). Das ist der erste Punkt, den
ein Fachreferat auseinandernimmt, und es ist reine Fleissarbeit ohne
Architekturrisiko. Nebeneffekt: Es stuetzt die Aufklaerungs-Position, weil
belegte Fakten anders gelesen werden als berechnete Scores.

### 6.3 Barrierefreiheit ist bei einer oeffentlichen Stelle Zulassungsbedingung

Kein Nice-to-have, kein spaeterer Durchgang. BITV 2.0 (~ WCAG 2.1 AA), dazu eine
**Barrierefreiheitserklaerung** und ein Feedback-Mechanismus, dazu Leichte
Sprache und ein DGS-Hinweis auf der oeffentlichen Einstiegsseite.

Der aktuelle Stand wuerde eine Pruefung nicht bestehen. Konkret, aus dieser
Analyse:

- Risiko nur ueber Farbe kodiert (3.4)
- Kein Fokus-Trap, kein Fokus-Restore, kein `role="dialog"`, kein Esc in
  `Sheet` und `Modal`
- Fokusring ohne Kontrast auf gefuellten Buttons (2.3)
- Scrollbars global abgeschaltet (2.2)
- Icon-only-Controls in FAB und BottomNav ohne Label
- Kontrast in beiden Themes nie geprueft

Positiv und erwaehnenswert: `prefers-reduced-motion` ist bereits sauber geloest,
`min-height: 44` auf Buttons ebenfalls.

Das ist ein abschliessbares Arbeitspaket, kein Fass ohne Boden — vorausgesetzt,
die Farben liegen vorher in CSS (1.2). Deshalb steht 1.2 vor Welle 3.

### 6.4 Integration: die Reihenfolge ist entscheidend

Aufsteigend nach Aufwand und **absteigend** nach Sicherheit, dass es klappt:

1. **Beratungsstellen-Verzeichnis nach PLZ.** Statisches JSON, kein Server,
   keine Integration, kein Datenschutz-Thema. Macht die App lokal nuetzlich und
   schliesst gleichzeitig die "Was jetzt?"-Luecke (3.6). Damit faengt man an.
2. **QR-Handzettel in der Beratungsstelle.** Verlinkt die App, uebertraegt
   nichts. Null Integration, null Daten, sofort machbar.
3. **Signierte Ergebnis-QRs** (5.4). Echte Integration, echter Vertrauensgewinn,
   braucht einen Signaturschluessel bei der Teststelle.
4. **Anbindung an Fachverfahren: nicht.** Jede Verbindung zu Aktensystemen
   zerstoert Local-First — und Local-First ist das einzige Argument, mit dem
   diese App bei Art.-9-Daten ueberhaupt genehmigungsfaehig ist. Der Satz
   gehoert offensiv in den Pitch, nicht defensiv auf Nachfrage.

### 6.5 Wartbarkeit — die Frage lautet "wer repariert das in drei Jahren"

Das ist die Frage, an der kommunale Projekte scheitern, und sie wird frueh
gestellt. Aktueller Stand: Bus-Faktor 1, keine CI, kein Lint, kein Changelog,
kein Releaseprozess, keine Dependency-Policy.

Belastbare und billige Antworten:

- **CI**: GitHub Actions, bei jedem Push Typecheck + 45 Tests + Build. Node >= 22
  (`hausbasis/baseline.json` dokumentiert, warum: pnpm 11 laedt `node:sqlite`).
- **Dependency-Minimalismus als Regel statt als Zufall.** `packages/core` hat
  *null* Runtime-Dependencies. Das ist ein ausgezeichnetes Audit-Argument und
  gehoert festgeschrieben — am besten als Test, der rot wird, sobald core eine
  Dependency bekommt. `apps/web` haelt vier, mobile bleibt bei Expo-Modulen.
- **Reproduzierbare Builds**: `notes/02` behauptet sie, geprueft werden sie
  nicht. Ein CI-Job, der zweimal baut und die Hashes vergleicht, ist ein Tag
  Arbeit und ein ungewoehnlich starkes Audit-Artefakt.
- **Renovate/Dependabot**, `CHANGELOG.md`, SemVer-Tags, `SECURITY.md` mit
  Kontaktadresse.
- **Dokumentation trennen.** `notes/` ist ein Entscheidungslog fuer die eigene
  Arbeit und als solches gut. Eine Verwaltung braucht andere Dokumente:
  Betriebshandbuch, Datenschutzerklaerung, Art.-30-Verzeichnis (Vorlage),
  Threat-Model, und das Risikomodell mit Quellen als lesbares Dokument. Die
  Notes sind das Rohmaterial dafuer, nicht das Ergebnis.

### 6.6 Mehrsprachigkeit ist in Muenchen kein P3

`notes/03` fuehrt TR/RU/AR unter "Ideen, nicht zugesagt". Fuer ein
grossstaedtisches Gesundheitsamt ist Mehrsprachigkeit dagegen ein
Kernkriterium — die Zielgruppe einer STI-Beratungsstelle ist genau die, die
DE/EN nicht abdeckt. UA gehoert inzwischen dazu.

Die Infrastruktur ist da und typisiert. Drei Punkte vorher klaeren:

- **RTL** fuer Arabisch ist Layoutarbeit, nicht Uebersetzungsarbeit. Wenn AR
  ernsthaft geplant ist, sollte das Layout es vorher koennen.
- Die eigene `plurals(t, n)`-Loesung in core ist ein Zeichen, dass die i18n
  handgebaut ist. Bei zwei Sprachen traegt das. Bei sechs erwarten
  professionelle Uebersetzer **ICU MessageFormat** und ihre Werkzeuge auch.
  Der Wechsel ist genau dann faellig, wenn die dritte Sprache kommt — nicht
  danach.
- Medizinische Terminologie braucht fachliche Pruefung, nicht nur Uebersetzung.

### 6.7 Web-Storage ist die schwache Flanke

Mobile verschluesselt at rest mit einem Keystore-gehaltenen Schluessel. Web legt
Klartext-JSON in localStorage. `notes/02` nennt die beiden zulaessigen Antworten:
passphrasenbasierte WebCrypto-Verschluesselung — oder eine ehrliche Aussage.

Da die native App existiert, ist die ehrliche Aussage vertretbar. Aber sie muss
**in der App stehen**, im "Deine Daten"-Screen (der auf web ohnehin noch fehlt,
3.2), nicht nur in einer Notiz im Repo. Wer im Browser trackt, soll wissen, dass
der Schutz dort so gut ist wie das Geraeteprofil — und dass die App den
besseren Weg anbietet.

---

## 7. Vorgeschlagene Reihenfolge

Jede Welle mit ihrem Abnahmekriterium. Wellen sind sequenziell, innerhalb einer
Welle ist die Reihenfolge frei.

### Welle 0 — Versionen und pnpm

0. TS-7-Risiko zuerst probieren: `apps/mobile` mit `typescript ~7.0.2` gegen die
   RN-Typen typechecken. Faellt das durch, ist es besser hier bekannt als nach
   dem Expo-Upgrade. -> **verify:** `tsc --noEmit` in mobile
1. `apps/mobile` auf Expo 57 (`react-native 0.87.1`, `react 19.2.8`,
   expo-Module auf 57.x, `react-native-safe-area-context 5.9.1`,
   `@react-native-async-storage/async-storage 3.1.1`)
   -> **verify:** `expo-doctor` sauber, Metro-Export gruen, **App laeuft auf
   einem echten Geraet** (ueberfaellig seit 10.07.)
2. `apps/web` auf `react/react-dom ^19.2.8`, `@types/react ^19.2.18`,
   `@types/react-dom ^19.2.5`, `vite ^8.2.2`, `@vitejs/plugin-react ^6.1.0`,
   `typescript ~7.0.2`
   -> **verify:** Build gruen **plus Laufzeitprobe im Browser** — bei einem
   React-Major beweist ein gruener Build wenig (Lehre aus pridemap,
   `VERSION-UPGRADE.md`)
3. `packages/core` auf `vitest ^4.1.11`, `typescript ~7.0.2`
   -> **verify:** 45/45
4. Umstieg auf pnpm nach dem Rezept in `VERSION-UPGRADE.md`, inklusive
   `"@sexdiary/core": "workspace:*"`
   -> **verify:** alles oben nochmal, danach `pnpm store prune`
5. Ausnahme `"sexdiary"` aus `hausbasis/baseline.json` streichen,
   `VERSION-UPGRADE.md` loeschen

### Welle 1 — Subtraktion, ohne Verhaltensaenderung

- `FONT` und 91 Inline-Deklarationen entfernen (1.1)
- Palette nach CSS-Custom-Properties, `data-theme` am `<html>` (1.2)
- Design-Tokens nach core, web und mobile konsumieren dieselben (1.3)
- ESLint + Prettier + CI (1.7)
- `mock-server.ts` hinter ein `AlertTransport`-Interface (1.6)

-> **verify:** Build gruen, 45/45, Screenshots vorher/nachher identisch

### Welle 2 — Ehrlichkeit

- Demo-Modus auf web (3.1) — **hoechste Prioritaet der ganzen Liste**
- In-App-Bestaetigung statt `window.confirm`, Delete-All getippt (1.5, 3.3)
- `prefs.notifs` und `prefs.lock` implementieren oder ausbauen (1.4)
- Die vier Mobile-Features nach web portieren (3.2)
- Quellenangaben in `stis.ts` (6.2)

-> **verify:** frisches Profil zeigt null Datensaetze; jede destruktive Aktion
nur ueber Tastatur durchspielbar

### Welle 3 — BITV-Arbeitspaket

- Fokus-Trap und -Restore, `role="dialog"`, `aria-modal`, Esc in Sheet/Modal
- Zweiter Kanal neben der Risikofarbe (3.4)
- Fokusring-Token mit geprueftem Kontrast (2.3), Scrollbars zurueck (2.2)
- aria-labels auf Icon-Controls, Kontrastpruefung beider Themes
- Desktop-Rahmung (2.1), Druck-Stylesheet (2.4)
- Barrierefreiheitserklaerung + Feedback-Weg

-> **verify:** axe ohne Befund, vollstaendiger Tastaturdurchlauf, Kontraste belegt

### Welle 4 — Native (A)

- Echter App-Lock, FLAG_SECURE, Recents-Blur
- Lokale Erinnerungen (3.5)
- Alternatives Icon / OS-Name
- Lokaler Android-Build dokumentiert, EAS fuer den Alltag (4.1)

-> **verify:** signiertes APK installiert, Lock haelt ueber Backgrounding,
Erinnerung feuert an einem Fenstergrenztag

### Welle 5 — Server (B)

- Hostinger-Produkt klaeren (5.0)
- Domain, TLS, PWA, Impressum, Datenschutzerklaerung (5.1)
- Deploy aus der CI, `docs/` aus dem Repo (5.1)
- Alert-Backend: ein Container, SQLite, `DELETE` ab Tag eins (5.3)

-> **verify:** DSFA-Entwurf existiert, **bevor** der Dienst oeffentlich ist

### Querschnitt, sofort und unabhaengig

- **Lizenz EUPL-1.2** (6.1). Blockiert Audit, openCode, F-Droid und
  Nachnutzung. Kostet eine Datei.

---

## 8. Was entschieden werden muss, bevor gearbeitet wird

1. **Hostinger: Shared oder VPS?** Bestimmt, ob 5.3 ueberhaupt geht.
2. **Lizenz.** Empfehlung EUPL-1.2, Entscheidung offen seit 10.07.2026.
3. **MDR-Position** (6.2). Fuer die Arbeit reicht "Aufklaerung, nicht Score";
   fuer ein Amtsgespraech muss es ausformuliert sein.
4. **Zielsprachen** (6.6). Ob AR dabei ist, entscheidet, ob das Layout RTL
   koennen muss — und das entscheidet man vor Welle 3, nicht danach.
5. **Fuehrende Plattform.** `notes/04` fragt das seit 10.07. Solange web und
   mobile auseinanderlaufen (3.2), kostet jede Feature-Entscheidung doppelt.
