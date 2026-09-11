# ADR-0006 — Keine Over-the-Air-Updates

**Status:** angenommen · 10.07.2026

## Kontext

Das eingesetzte Rahmenwerk kann Anwendungscode nach der Installation
nachladen, ohne dass eine neue Version durch den Store geht. Für viele Produkte
ist das ein Vorteil: Fehler sind in Minuten behoben.

Für dieses Produkt kollidiert es mit der Prüfbarkeit. Wenn Code nach der
Auslieferung ausgetauscht werden kann, gilt die Aussage „der ausgelieferte Code
ist der geprüfte Code“ nicht mehr.

## Entscheidung

Over-the-Air-Updates sind ausgeschaltet. Jede Codeänderung geht durch einen
vollständigen Build und die reguläre Verteilung.

## Konsequenzen

**Positiv**

- Was auf dem Gerät läuft, entspricht einem Stand aus der Quellcodeverwaltung.
  Ein Prüfteam kann sich darauf berufen.
- Kein Kanal, über den jemand mit Zugriff auf das Verteilungskonto Code
  einschleusen könnte.
- Voraussetzung für reproduzierbare Builds und für eine Aufnahme in
  Verzeichnisse, die aus der Quelle bauen.

**Negativ**

- Dringende Korrekturen brauchen eine Store-Freigabe.
- Nutzer laufen länger auf alten Ständen.

## Verworfene Alternativen

**Updates nur für Nicht-Sicherheitscode.** Die Grenze ist nicht sauber zu
ziehen und im Audit nicht zu erklären.

**Updates mit Signaturprüfung.** Verlagert das Vertrauen auf die
Schlüsselverwaltung, statt es zu vermeiden. Der Gewinn rechtfertigt die
Erklärungslast nicht.
