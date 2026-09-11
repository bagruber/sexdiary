# Screen-Entwürfe

Quelldateien der Entwürfe für die native App. Angelegt 27.08.2026.

Das sind **keine Produktivdateien** — sie werden nicht gebaut, nicht getestet
und von nichts importiert. Sie liegen hier, damit die Entwurfsarbeit
fortsetzbar bleibt, statt in einer Sitzung zu verschwinden.

## Was drin ist

| Datei | Zeigt |
|---|---|
| `Main.dc.html` | **Heute** — die gewählte Richtung ([ADR-0014](../architecture/adr/0014-hauptbildschirm.md)) |
| `SchnellLoggen.dc.html` | Progressive Erfassung: ein Tipp genügt, Details später |
| `Erklaerung.dc.html` | Woraus eine Einschätzung entsteht, inklusive Quellenangabe |
| `Befund.dc.html` | Sichtbare Trennung signiert / selbst eingetragen, plus Wartezustand beim Abrufcode |
| `Positiv.dc.html` | Der geführte Ablauf nach einem positiven Befund |
| `Rueckmeldung.dc.html` | Was der Benachrichtigte sieht, mit dem Antwortvokabular aus [ADR-0011](../architecture/adr/0011-rueckmeldung.md) |
| `Struktur.dc.html` | Seitenstruktur alt gegen neu |
| `Zeitachse.dc.html` | **Variante B**, zurückgestellt — nicht verworfen |
| `canvas.json` | Anordnung, zwei Seiten: „App“ und „Variante B“ |

## Stand der Entwürfe

Sie zeigen die **heutige** App-Palette aus `apps/mobile/src/theme.ts`, weil
Farben und Schriften noch nicht entschieden sind. Sobald das passiert ist
(siehe [`design-tokens.md`](../architecture/design-tokens.md)), sind die
Entwürfe nachzuziehen — sonst zeigen sie ein Produkt, das es so nicht geben
wird.

## Zwei Fallstricke, die hier schon zugeschlagen haben

**Eine Zeitachse aus Liniensegmenten pro Zeile bricht.** `flex:1` wächst in
einem Zeilen-Flex in die *Breite*, nicht in die Höhe — aus der Linie werden
Blöcke. Lösung in `Zeitachse.dc.html`: eine durchgehende, absolut
positionierte Achse.

**Absolut positionierte Elemente übermalen normalen Fluss.** Die Achse lag
über den Punkten, bis die Punktcontainer `position:relative` bekamen.

Beides war im Quelltext unsichtbar und nur im gerenderten Bild zu sehen. Also
rendern statt schätzen.

## Nicht enthalten

Der Canvas-Editor selbst. Die Dateien werden zu einer veröffentlichten Seite
zusammengesetzt; der Weg dorthin läuft über die Design-Fähigkeit von Claude
Code, nicht über dieses Verzeichnis. Wer die veröffentlichte Fassung ändern
will, ohne diese Dateien zu haben, kann sie aus der veröffentlichten Seite
zurückgewinnen.
