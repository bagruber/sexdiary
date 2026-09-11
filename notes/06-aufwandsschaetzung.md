# Aufwandsschätzung — vom Prototyp zur prüffähigen Anwendung

*Erstellt 10.09.2026. Alle Zahlen mit ±40 % Unsicherheit; das ist bei
Schätzungen dieser Art normal und wird nicht besser, wenn man Nachkommastellen
dranschreibt.*

Angesetzt sind Entwicklerstunden unter KI-Assistenz, also mit dem Tempo, in dem
dieses Repo entstanden ist. Externe Leistungen — Rechtsberatung, Pentest,
ärztliche Prüfung — sind **nicht** enthalten; wo Entwicklungszeit für die
Zuarbeit nötig ist, steht sie dabei.

## Gemessene Grundlage

| | |
|---|---:|
| `packages/core` — die Prüffläche, null Runtime-Abhängigkeiten | 3 155 Zeilen |
| `apps/mobile` | 4 869 Zeilen |
| `apps/web` — Infoseite und Demo | 5 309 Zeilen |
| Tests, **alle im Kern** | 1 152 Zeilen, 115 Stück |
| ADRs | 16 |
| Architektur- und Notizdokumentation | 4 580 Zeilen |
| Abhängigkeiten mit nativem Code oder Kryptographie | 20 |

## A — Diesen Prototyp produktionsreif und prüffähig machen

| Block | Stunden |
|---|---:|
| Relay-Server: bauen, härten, ausrollen, Löschpfad | 40–70 |
| Testabdeckung der App — heute null | 60–100 |
| Sicherheitsprüfung: Krypto, Schlüsselhaltung, 20 Abhängigkeiten, Threat Model | 80–140 |
| BITV-Audit und Behebung | 40–80 |
| Rechtliches zuarbeiten: DSFA, Art. 13, TOM, Verarbeitungsverzeichnis | 30–60 |
| Medizinisches Modell nach ärztlicher Prüfung nachziehen | 20–40 |
| iOS-Parität samt Build und Store | 80–150 |
| Cloud-Sicherung auf beiden Plattformen | 60–100 |
| Signatur, Verteilung, Update-Weg, Release-Prozess | 30–50 |
| Härtung: Fehlerzustände, Datenverlustfälle, Gerätematrix | 60–100 |
| Umsetzung der Research-Befunde | 40–80 |

**Summe 540–970, realistisch 600–900 Stunden** — vier bis sechs Monate Vollzeit
für eine Person.

## B — Von null, mit vollständiger Anweisung

**80–150 Stunden** bis zu einem vergleichbaren Prototyp.

Der Punkt daran ist nicht die Zahl, sondern was sie über das Projekt sagt:
**die Anweisung ist das Asset, nicht der Code.** Teuer war hier nicht das
Tippen, sondern die Entscheidungen — 16 ADRs, das medizinische Modell mit
Quellen, das Bedrohungsmodell, der Befund dass Telefon-zu-Telefon-NFC seit
Android 10 tot ist, die Pfadlängen-Jagd unter Windows, die Frage was ein Relay
überhaupt speichern darf.

Wer das auf dem Tisch hat, baut die 13 300 Zeilen schnell nach. Wer es nicht
hat, zahlt es noch einmal und merkt die Fehler später.

Für die Produktionsreife ändert das wenig: von Anfang an mit Prüfblick gebaut
spart gegenüber dem Nachrüsten vielleicht 10–15 %, also **550–850 statt
600–900**. Den Prototyp neu zu bauen lohnt nicht.

## C — User Research

| | Stunden |
|---|---:|
| Formativ: 8–12 qualitative Interviews samt Rekrutierung und Auswertung | 55–95 |
| Usability-Tests am Prototyp, 8–10 moderierte Sitzungen | 30–50 |
| Diskretionsfunktionen im Kontext | 15–25 |
| Akzeptanz der Partner-Benachrichtigung | 40–80 |
| Barrierefreiheit mit Betroffenen | 20–30 |

**160–280 Stunden**, vor jeder summativen Wirksamkeitsstudie — die wäre ein
Forschungsprojekt, keine Designaktivität, und steht als offene Frage in der
Konzeptvorstellung.

Zwei Dinge, die keine Stundenzahl sind:

**Rekrutierung ist der teure Teil**, nicht die Sitzungen. Die Zielgruppe ist
stigmatisiert und schwer erreichbar; ohne Community-Organisationen als
Türöffner wird es nichts. Das ist Kalenderzeit, nicht Arbeitszeit.

**Die Partner-Benachrichtigung gehört zuerst untersucht**, nicht zuletzt. Wenn
Menschen sie nicht benutzen würden, ist die halbe Architektur — Relay, Token,
Rückmeldungen, ADR-0008 und 0011 — für einen Zweck gebaut, den es nicht gibt.
Das ist die billigste Erkenntnis, die man früh haben kann.

## Wo die Zahlen nachgeben — und wo nicht

### Echte Hebel

**Android zuerst, iOS später.** Streicht 80–150 Stunden, den größten
Einzelposten. Der Pilot zielt auf München; iOS kann eine zweite Phase sein.
Kostet Reichweite, kostet keine Substanz.

**Den Piloten als Pilot zuschneiden, nicht als Produkt.** Ein kontrollierter
Pilot mit informierten Teilnehmenden braucht keine Store-Listings, keine
Update-Infrastruktur für Fremde und keine vollständige
Barrierefreiheitszertifizierung. Die DSFA bleibt, das andere verschiebt sich:
60–120 Stunden.

**Abhängigkeiten streichen.** Zwanzig native Pakete sind zwanzig Lieferketten,
und jede kostet Prüfzeit. NFC ist der offensichtlichste Kandidat: ungetestet,
hardwareabhängig, und in der Konzeptvorstellung ohnehin als Fernziel geführt.

**Das Relay klein halten.** Drei Endpunkte, eine Tabelle. Der Verzicht auf
Funktionswachstum am Server ist mehr wert als jede Optimierung daran.

**Was schon getan ist, senkt die Prüfkosten am stärksten:** der Kern hat null
Runtime-Abhängigkeiten und 115 Tests, und die medizinischen Zahlen tragen
Quellen. Das ist der Teil, den ein Audit sonst am teuersten aufarbeitet.

### Keine Hebel

**Die DSFA.** Gesundheitsdaten, Art. 35 DSGVO. Nicht verhandelbar, und die
Zuarbeit wird nicht kürzer, wenn man geschickt ist.

**Die ärztliche Prüfung der fünf Werte.** Das ist fremde Kalenderzeit, keine
komprimierbaren Stunden — und ohne sie darf die App niemand benutzen.

**Die Sicherheitsprüfung der Kryptographie.** Billiger wird sie nur durch eine
kleine Fläche, was ohnehin die Strategie ist. Weglassen und trotzdem
„prüffähig“ sagen geht nicht.

### Der Hebel, der nach hinten losgeht

**Die App-Tests streichen**, um 60–100 Stunden zu sparen. Die Historie dieses
Repos spricht dagegen: grüne Builds haben hier wiederholt nichts bewiesen — die
doppelte React-Kopie, die im Browser abstürzte; ein APK mit falschem Commit im
Dateinamen; der QR-Import, der den Positiv-Ablauf übersprungen hätte. Alle drei
fielen durch gezieltes Nachsehen auf, nicht durch die Pipeline.

`apps/mobile` hat heute **null Tests**. Das ist die Lücke, die am ehesten mehr
kostet als sie spart.

## Realistisch reduziert

Android-only, als Pilot zugeschnitten, NFC gestrichen, Tests behalten:

**380–600 Stunden** statt 600–900. Plus 160–280 Stunden Research, davon die
Akzeptanzfrage zuerst.
