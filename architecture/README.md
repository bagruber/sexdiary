# Architekturdokumentation

Dieses Verzeichnis ist die Architektur-Fläche des Projekts. Es richtet sich an
drei Leserkreise: an eine kommunale IT-Prüfung, an einen behördlichen
Datenschutzbeauftragten, und an die nächste Person, die den Code übernimmt.

Nicht zu verwechseln mit `docs/` — das ist Build-Output der Webseite, keine
Dokumentation. Und nicht zu verwechseln mit `notes/` — das ist das
Entscheidungslog der laufenden Arbeit, also Rohmaterial, nicht Ergebnis.

## Aufbau

| Datei | Format | Für wen |
|---|---|---|
| [`arc42.md`](arc42.md) | arc42 | Architekturüberblick in zwölf Abschnitten, mit C4-Diagrammen |
| [`threat-model.md`](threat-model.md) | angreiferzentriert | Sicherheitsprüfung: was erfährt wer in welcher Lage |
| [`data-flow.md`](data-flow.md) | Verarbeitungsübersicht | Datenschutz: Vorarbeit für Art. 30 und die Folgenabschätzung |
| [`adr/`](adr/) | MADR | Einzelne Entscheidungen mit Kontext und Konsequenz |
| [`design-tokens.md`](design-tokens.md) | Analyse | Farben und Schriften: gerechnete Kontraste, Vorschlag, offene Punkte |
| [`interfaces/`](interfaces/) | Spezifikation | Die Stellen, an denen Daten das Gerät verlassen — Befunde, Benachrichtigung, Forschungsbeitrag |

## Warum diese Formate

**arc42** ist im deutschsprachigen Raum der De-facto-Standard für
Architekturdokumentation. Der Vorteil ist nicht inhaltlich, sondern sozial: Ein
Reviewer, der arc42 kennt, weiß ohne Suchen, in welchem Abschnitt was steht.

**C4** löst das Problem, dass ein einzelnes Architekturbild gleichzeitig
Überblick und Detail sein will und dadurch beides schlecht macht. Vier
Zoomstufen, jede mit ihrem eigenen Publikum. Dieses Projekt nutzt Stufe 1 bis 3.

**ADRs** beantworten „warum ist das so?“ ohne den Autor. Bei einem Projekt mit
Bus-Faktor 1 ist das die wichtigste Eigenschaft der ganzen Dokumentation. Format
ist [MADR](https://adr.github.io/madr/) — Markdown, ein Dokument pro
Entscheidung, unveränderlich; eine revidierte Entscheidung bekommt eine neue ADR,
die die alte ablöst, statt sie zu überschreiben.

**Diagramme als Text.** Alle Diagramme sind Mermaid-Quelltext im Dokument, keine
Bilddateien. Sie sind damit versionierbar, im Diff lesbar und rendern direkt in
der Codeverwaltung. Ein Architekturbild, das nur als PNG existiert, ist nach
sechs Monaten falsch und niemand merkt es.

## Stand

Angelegt am 27.08.2026. Der Code ist an mehreren Stellen noch nicht dort, wo
diese Dokumente ihn beschreiben — jede solche Stelle ist in `arc42.md`,
Abschnitt 11 „Risiken und technische Schulden“ benannt. Die Dokumentation
beschönigt nicht; wo etwas simuliert ist, steht das dort.
