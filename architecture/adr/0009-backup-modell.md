# ADR-0009 — Sicherung in die Cloud des Nutzers, Ende-zu-Ende verschluesselt

**Status:** vorgeschlagen · 27.08.2026

## Kontext

ADR-0003 hat einen Preis: **Geraeteverlust bedeutet Datenverlust.** Fuer ein
Werkzeug, in dem jemand ueber Jahre seine Testhistorie fuehrt, ist das auf Dauer
nicht zumutbar — und es ist der Punkt, an dem Nutzer die App verlassen.

Gleichzeitig darf die Loesung ADR-0003 nicht aufweichen. Der Betreiber darf die
Daten nicht bekommen, auch nicht verschluesselt.

## Entscheidung

Vorgeschlagen wird das Modell, das aus verbreiteten Messengern bekannt ist:

- Die Sicherung geht in die **Cloud des Nutzers** — iCloud oder Google Drive —,
  nicht an den Betreiber.
- Verschluesselt mit einem Schluessel, der aus einer **Passphrase des Nutzers**
  abgeleitet wird, oder alternativ mit einem angezeigten Wiederherstellungscode.
- Der Cloud-Anbieter sieht undurchdringliche Bytes. Der Betreiber sieht nichts,
  weil er nicht beteiligt ist.
- **Ausdruecklich opt-in.** Ohne Zutun gibt es keine Sicherung.
- Klar abgegrenzt vom automatischen Systembackup, das ausgeschaltet bleibt
  (ADR-0005). Das hier ist ein bewusster, separater Kanal.

Der eigentliche Vorteil ist nicht technisch, sondern erklaererisch: Das mentale
Modell ist bereits verbreitet und laesst sich in einem Satz sagen. Auch die
unangenehme Konsequenz ist bereits bekannt — wer die Passphrase verliert,
verliert die Sicherung.

## Konsequenzen

**Positiv**

- Geraetewechsel und Geraeteverlust werden ueberlebbar, ohne dass der Betreiber
  Daten haelt.
- Keine zusaetzliche datenschutzrechtliche Flaeche beim Betreiber. Die
  Rechtsbeziehung besteht zwischen Nutzer und seinem Cloud-Anbieter.
- Vertrautes Modell, geringe Erklaerungslast.

**Negativ**

- Verlorene Passphrase heisst verlorene Sicherung. Muss vor der Einrichtung
  unmissverstaendlich gesagt werden, nicht im Kleingedruckten.
- Bindet an die Cloud-Dienste der Plattformanbieter. Fuer Nutzer, die diese
  bewusst meiden, braucht es zusaetzlich einen Dateiexport.
- Zwei Implementierungen, eine je Plattform.

**Offen**

Schluesselableitung und Parameter, Format der Sicherungsdatei, Umgang mit
Teilwiederherstellung bei Schemadifferenz. Und ob ein Dateiexport als dritter
Weg von Anfang an dazugehoert — Empfehlung: ja, er ist billig und macht
unabhaengig.

## Verworfene Alternativen

**Sicherung beim Betreiber, verschluesselt.** Technisch aequivalent sicher,
aber die Argumentation verschiebt sich von „wir haben die Daten nicht“ zu
„wir koennen sie nicht lesen“. Der erste Satz ueberzeugt eine
Datenschutzpruefung ohne Beweisfuehrung.

**Nur Dateiexport.** Billig und unabhaengig, aber niemand macht es regelmaessig.
Eine Sicherung, die manuelle Disziplin verlangt, existiert im Ernstfall nicht.
Gehoert als Ergaenzung dazu, nicht als einziger Weg.

**Automatisches Systembackup einschalten.** Wuerde Gesundheitsdaten unkontrolliert
in Plattform-Backups tragen. Widerspruch zu ADR-0005.
