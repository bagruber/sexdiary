# Sexdiary

Persönliches Werkzeug zur sexuellen Gesundheit: protokolliert Begegnungen,
Tests, Impfungen und Prophylaxen, leitet daraus ab **wann ein Test
aussagekräftig wird**, und ermöglicht anonyme Partner-Benachrichtigung nach
einem positiven Befund. Ziel ist eine Einführung durch ein deutsches
Gesundheitsamt (Beispielfall München).

## Bevor du irgendetwas tust

1. **`notes/00-project-log.md`** lesen — umgekehrt chronologisches
   Entscheidungslog, neuester Eintrag zuerst. Vor Sitzungsende fortschreiben.
2. **`OFFENE-PUNKTE.md`** — was gerade offen ist. Kurz halten, Erledigtes
   streichen statt abhaken.
3. **`architecture/`** — arc42, ADRs, Threat Model, Datenflüsse,
   Schnittstellen. Bei allem Architektonischen zuerst dort nachsehen; eine
   Entscheidung, die einer ADR widerspricht, braucht eine neue ADR.

## Die eine Entscheidung, aus der alles folgt

**Das Produkt ist die native App. Der Browser bekommt eine reine
Informationsseite.** Gesundheitsdaten verlassen das Gerät nicht
([ADR-0001](architecture/adr/0001-native-only.md),
[ADR-0003](architecture/adr/0003-local-first.md)).

Das realistische Bedrohungsmodell ist die Person daneben, nicht der Angreifer
im Netz — und keine der Abwehrmaßnahmen dagegen (Screenshot-Sperre, verdeckte
Vorschau, Keystore-Lock, Tarnicon) ist im Browser umsetzbar.

Für jede neue Außenschnittstelle gilt die Pflichtfrage: **könnte das auf dem
Gerät bleiben?**

## Wo was liegt

| Pfad | Was | Achtung |
|---|---|---|
| `packages/core` | Gesundheitslogik, Schemata, Speicherhülle, i18n | **Null Runtime-Dependencies, keine Ein-/Ausgabe.** Das ist die Audit-Fläche — die Regel verteidigen. |
| `apps/mobile` | Expo/React Native — **das Produkt** | Läuft. Bauweg im README, er braucht CMake 3.31.6 |
| `apps/web` | Infoseite (`index`) + Demo (`demo.html`) | Die Demo speichert nichts. Infoseite folgt dem Pitch |
| `architecture/` | arc42, ADRs, Threat Model, Schnittstellen, Risikomodell-Quellen | Auf Deutsch, echte Umlaute |
| `notes/` | Entscheidungslog, Audits, Roadmap | Rohmaterial, nicht Lieferobjekt |
| `design/` | Screen-Entwürfe als Quelldateien | Keine Produktivdateien. Zeigen noch die heutige Palette |
| `docs/` | **Build-Output** der Webseite | Keine Dokumentation. Soll perspektivisch aus dem Repo. Enthält `design.html`, die interne Designsystem-Seite |
| `dist/` | Gebaute APKs | Gitignored. Nach Commit benannt |

## Arbeitsregeln in diesem Repo

- **pnpm**, nicht npm. Versionen kommen aus `../hausbasis/baseline.json` —
  dort ändern, nie in einem einzelnen Repo. `node ../hausbasis/check.mjs --kurz`
  zeigt Abweichungen.
- **`packages/core` wird gebaut, nicht aliassiert.** `exports` zeigt auf
  `dist`. `pnpm dev` startet den Kern im Watch-Modus neben dem Dev-Server;
  `build`, `typecheck` und die CI bauen ihn vorher. Wer ihn direkt aufruft:
  `pnpm build:core`.
- `apps/mobile/package.json` hat `expo.install.exclude` für typescript, react
  und @types/react. Die folgen bewusst der Hausbasis statt dem Expo-Template;
  ohne den Eintrag meldet `expo-doctor` das dauerhaft als Fehler.
- **Keine KI-Erwähnungen** in Commits, Code, Dokumentation — nirgends.
- **Keine Drittanbieter-Requests.** Keine Analytik, keine externen Schriften.
  Google Fonts wurde im Juli 2026 aus DSGVO-Gründen entfernt; Schriften werden
  mitgeliefert, nie verlinkt.

## Verifizieren, nicht hoffen

In diesem Repo hat sich mehrfach gezeigt, dass grüne Builds wenig beweisen:

- `pnpm run lint` · `pnpm run typecheck` · `pnpm run test` (104 Tests) ·
  `pnpm run build`. Dieselben vier Schritte laufen in der CI
  (`.github/workflows/pruefung.yml`), dazu die Prüfung, ob `docs/` dem
  Quellstand entspricht.
- **Nach einem React-Major zusätzlich eine Laufzeitprobe im Browser.** Am
  27.08.2026 waren Build, 45 Tests und drei Typechecks grün, während die App
  im Browser abstürzte — npm hatte eine alte React-Kopie gehoistet stehen
  lassen. Anleitung im Anhang von `notes/05-refactor-verwaltung-2026-08.md`.
- **Mermaid-Diagramme rendern, nicht nur Fences zählen.** Ausgeglichene
  Code-Fences beweisen nicht, dass ein Diagramm parst.
- `apps/mobile`: `npx expo-doctor` und ein Metro-Export. Beides sagt nichts
  darüber, ob die App auf einem Gerät startet — das ist ein eigener Schritt.
- **Gebaute Pakete gegen ihren Inhalt prüfen, nicht gegen ihren Namen.** Am
  09.09.2026 trug ein APK den falschen Commit im Dateinamen, weil das Bauskript
  den Stand erst beim Kopieren las. Sonden gegen das JS-Bundle taugen nur für
  Zeichenketten, die zur Laufzeit existieren — ein TypeScript-Typ ist keine.

## Stand und Reihenfolge

| Welle | Inhalt | Stand |
|---|---|---|
| 0 | Versionen, Expo 57, pnpm | erledigt 27.08.2026 |
| 1 | Architektur festschreiben | erledigt 27.08.2026 |
| 2 | Design-Tokens in den Kern, Lint und CI, tote Konstanten, Quellenangaben an den medizinischen Zahlen, Kern als echtes Paket | erledigt 27.08.2026 |
| 3 | Mobile wird das Produkt: Lock, Screenshot-Schutz, Erinnerungen, signierte QRs, Backup, Verteilung | erledigt bis auf Cloud-Sicherung |
| 4 | Infoseite ersetzt den Web-Tracker | erledigt 10.09.2026 |
| 5 | Server: Alert-Relay, Schlüsselverzeichnis, Deployment-Artefakt | **das Nadelöhr**, siehe unten |

Die App **lief am 09.09.2026 zum ersten Mal auf einem Gerät** und hat seither
den Web-Prototyp funktional eingeholt: Schutz pro Praktik, Onboarding mit
Profil, Kontakte, Impfungen, Bearbeiten und Löschen, Monatsansicht, QR teilen
und scannen, NFC-Karten, Benachrichtigung und Positiv-Ablauf.

**Das Nadelöhr ist jetzt der Relay-Server.** Der anonyme Versand zeigt in der
App sichtbar an, dass er fehlt — bewusst, statt einen Versand vorzutäuschen.
Geklärt: Hostinger ist Shared Hosting, also PHP mit MySQL, kein Node-Dienst.
Ein pseudonymisiertes Token darf für den Prototyp dort liegen.

Ebenfalls offen aus Welle 3: die **Cloud-Sicherung** (der verschlüsselte
Dateiexport steht) und ein **eigener Keystore** statt des Debug-Schlüssels.

Aus Welle 2 mitgenommen: die **vier medizinischen Befunde** in
`architecture/risikomodell-quellen.md`, Abschnitt 7. Zwei diagnostische Fenster
(HSV-2, Mpox) melden „testbar“, wo ein negativer Befund nichts aussagt. Das ist
der Kernnutzen der App — gehört einer Infektiologin vorgelegt, bevor jemand
sie benutzt.

Querschnitt, unabhängig von allem: **Lizenz festlegen.** Blockiert Code-Audit,
openCode.de, F-Droid und Nachnutzung. Empfehlung EUPL-1.2. Kostet eine Datei.

Vollständige Begründung aller Wellen:
`notes/05-refactor-verwaltung-2026-08.md`.

## Veröffentlichte Fassungen

Zwei Artifacts, beide privat, beide aktualisierbar statt neu anzulegen. In
einer neuen Sitzung mit `/artifacts` erreichbar; wer sie ändern will, gibt die
URL als `url` mit, sonst entsteht ein zweites Exemplar.

| Was | URL |
|---|---|
| Refactor- und Verwaltungsplan | `https://claude.ai/code/artifact/6e08b184-17ed-423a-87b3-92c74933107c` |
| Screen-Entwürfe (Canvas, zwei Seiten) | `https://claude.ai/code/artifact/fa0b7d00-34f9-47b4-aa76-6f01876f8280` |

Die Entwurfsquellen liegen in `design/` — daraus wird der Canvas neu
zusammengesetzt, nicht aus der veröffentlichten Seite.
