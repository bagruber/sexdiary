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
| `apps/mobile` | Expo/React Native — **das Produkt** | Lief noch nie auf einem Gerät |
| `apps/web` | Alter Tracker | Nicht mehr das Produkt. Wird durch die Infoseite ersetzt (Welle 4) |
| `architecture/` | arc42, ADRs, Threat Model, Schnittstellen | Auf Deutsch, echte Umlaute |
| `notes/` | Entscheidungslog, Audits, Roadmap | Rohmaterial, nicht Lieferobjekt |
| `design/` | Screen-Entwürfe als Quelldateien | Keine Produktivdateien. Zeigen noch die heutige Palette |
| `docs/` | **Build-Output** der Webseite | Keine Dokumentation. Soll perspektivisch aus dem Repo |

## Arbeitsregeln in diesem Repo

- **pnpm**, nicht npm. Versionen kommen aus `../hausbasis/baseline.json` —
  dort ändern, nie in einem einzelnen Repo. `node ../hausbasis/check.mjs --kurz`
  zeigt Abweichungen.
- `apps/mobile/package.json` hat `expo.install.exclude` für typescript, react
  und @types/react. Die folgen bewusst der Hausbasis statt dem Expo-Template;
  ohne den Eintrag meldet `expo-doctor` das dauerhaft als Fehler.
- **Keine KI-Erwähnungen** in Commits, Code, Dokumentation — nirgends.
- **Keine Drittanbieter-Requests.** Keine Analytik, keine externen Schriften.
  Google Fonts wurde im Juli 2026 aus DSGVO-Gründen entfernt; Schriften werden
  mitgeliefert, nie verlinkt.

## Verifizieren, nicht hoffen

In diesem Repo hat sich mehrfach gezeigt, dass grüne Builds wenig beweisen:

- `pnpm run build` · `pnpm run test` (45 Tests) · `pnpm run typecheck`
- **Nach einem React-Major zusätzlich eine Laufzeitprobe im Browser.** Am
  27.08.2026 waren Build, 45 Tests und drei Typechecks grün, während die App
  im Browser abstürzte — npm hatte eine alte React-Kopie gehoistet stehen
  lassen. Anleitung im Anhang von `notes/05-refactor-verwaltung-2026-08.md`.
- **Mermaid-Diagramme rendern, nicht nur Fences zählen.** Ausgeglichene
  Code-Fences beweisen nicht, dass ein Diagramm parst.
- `apps/mobile`: `npx expo-doctor` und ein Metro-Export. Beides sagt nichts
  darüber, ob die App auf einem Gerät startet — das ist ein eigener Schritt.

## Stand und Reihenfolge

| Welle | Inhalt | Stand |
|---|---|---|
| 0 | Versionen, Expo 57, pnpm | erledigt 27.08.2026 |
| 1 | Architektur festschreiben | erledigt 27.08.2026 |
| 2 | Design-Tokens in den Kern, Lint und CI, tote Konstanten, Quellenangaben an den medizinischen Zahlen, Kern als echtes Paket | **als Nächstes** |
| 3 | Mobile wird das Produkt: echter Lock, Screenshot-Schutz, Erinnerungen, signierte QRs, Backup, Verteilung | offen |
| 4 | Infoseite ersetzt den Web-Tracker | offen |
| 5 | Server: Alert-Relay, Schlüsselverzeichnis, Deployment-Artefakt | offen |

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
