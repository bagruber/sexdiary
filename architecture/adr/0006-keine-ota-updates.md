# ADR-0006 — Keine Over-the-Air-Updates

**Status:** angenommen · 10.07.2026

## Kontext

Das eingesetzte Rahmenwerk kann Anwendungscode nach der Installation
nachladen, ohne dass eine neue Version durch den Store geht. Fuer viele Produkte
ist das ein Vorteil: Fehler sind in Minuten behoben.

Fuer dieses Produkt kollidiert es mit der Pruefbarkeit. Wenn Code nach der
Auslieferung ausgetauscht werden kann, gilt die Aussage „der ausgelieferte Code
ist der geprueefte Code“ nicht mehr.

## Entscheidung

Over-the-Air-Updates sind ausgeschaltet. Jede Codeaenderung geht durch einen
vollstaendigen Build und die regulaere Verteilung.

## Konsequenzen

**Positiv**

- Was auf dem Geraet laeuft, entspricht einem Stand aus der Quellcodeverwaltung.
  Ein Pruefteam kann sich darauf berufen.
- Kein Kanal, ueber den jemand mit Zugriff auf das Verteilungskonto Code
  einschleusen koennte.
- Voraussetzung fuer reproduzierbare Builds und fuer eine Aufnahme in
  Verzeichnisse, die aus der Quelle bauen.

**Negativ**

- Dringende Korrekturen brauchen eine Store-Freigabe.
- Nutzer laufen laenger auf alten Staenden.

## Verworfene Alternativen

**Updates nur fuer Nicht-Sicherheitscode.** Die Grenze ist nicht sauber zu
ziehen und im Audit nicht zu erklaeren.

**Updates mit Signaturpruefung.** Verlagert das Vertrauen auf die
Schluesselverwaltung, statt es zu vermeiden. Der Gewinn rechtfertigt die
Erklaerungslast nicht.
