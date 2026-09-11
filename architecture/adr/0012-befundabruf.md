# ADR-0012 — Befundabruf über einen Code

**Status:** vorgeschlagen · 27.08.2026 · erweitert [ADR-0007](0007-signierte-testergebnisse.md)

## Kontext

ADR-0007 beschreibt einen signierten QR, den die Teststelle übergibt. Dabei ist
eine Selbstverständlichkeit übersehen worden:

**Zum Zeitpunkt des Tests liegt der Befund nicht vor.** Zwischen Probenabgabe
und Ergebnis liegen Tage. Ein QR, der am Tresen überreicht wird, kann kein
Ergebnis enthalten.

Damit deckt ADR-0007 nur den Fall ab, in dem das Ergebnis bereits existiert —
ein Folgetermin, ein Ausdruck, eine spätere Übergabe. Der häufigste Fall
bleibt offen, und ohne ihn ist die ganze Funktion theoretisch.

## Entscheidung

Zwei Wege, ein Nutzlastformat.

**Übergabe** (ADR-0007). Das Ergebnis existiert und wird als signierter QR
übergeben. Kein Netzweg.

**Abholung** (neu). Bei der Probenabgabe erhält der Nutzer einen
**Abrufcode**. Tage später holt die App den signierten Befund damit ab. Die
Nutzlast ist identisch zu ADR-0007 — nur der Transportweg unterscheidet sich,
und die Signaturprüfung läuft danach genauso.

Bindende Eigenschaften:

1. **Der Abruf geht an die Teststelle, nicht an den Betreiber.** Der Betreiber
   ist an diesem Weg nicht beteiligt und erfährt nichts. Wäre er im Pfad,
   wüsste er, wer wann testet — direkter Widerspruch zu ADR-0003.
2. **Zwei Faktoren.** Der Code allein ist ein Inhaberausweis: Wer den Zettel
   findet, bekommt den Befund. Deshalb Code plus ein zweiter Faktor, den nur der
   Nutzer kennt — am Tresen gewählte PIN oder Geburtsdatum. Das entspricht der
   gängigen Praxis beim Befundabruf.
3. **Begrenzte Gültigkeit.** Der Code verfällt; ein einmal abgeholter Befund
   liegt in der App, nicht mehr auf dem Server.
4. **Abruf standardmäßig auf Handlung des Nutzers**, nicht im Hintergrund.
   Ein Hintergrundabruf ist als ausdrückliche Option vertretbar — die
   Teststelle weiß ohnehin, dass dort getestet wurde, der zusätzliche
   Erkenntnisgewinn ist gering, und die Benachrichtigung „Befund liegt vor“ ist
   praktisch wertvoll.

Die Adresse der Abrufschnittstelle kommt aus derselben Vertrauensliste wie die
Signaturschlüssel. Ein Verzeichnis, zwei Zwecke.

## Konsequenzen

**Positiv**

- Die Funktion passt zum tatsächlichen Ablauf einer Teststelle statt zu einem
  gedachten.
- Der Befund kommt strukturiert und signiert in die App, ohne Abtippen und ohne
  Uebertragungsfehler.
- Für die Teststelle ist es ein Weg, den es organisatorisch oft schon gibt —
  Befundabruf per Nummer ist etabliert. Neu ist nur die Signatur.
- Eine Benachrichtigung „dein Befund liegt vor“ ist ein starker Grund, die App
  überhaupt geöffnet zu halten.

**Negativ**

- **Eine dritte Außenschnittstelle.** Die Regel aus `interfaces/README.md`
  verlangt dafür eine Begründung; sie liegt vor, aber die Regel wird damit zum
  ersten Mal in Anspruch genommen.
- Der Betreiber kann diesen Weg nicht garantieren — er hängt an der
  Teststelle. Fällt deren Schnittstelle aus, fällt der Abruf aus.
- Die Teststelle erfährt den Abrufzeitpunkt. Unvermeidbar bei jedem Abrufweg.
- Braucht auf Seiten der Teststelle mehr als einen Signaturschlüssel: einen
  Endpunkt, eine Codeverwaltung, eine Verfallslogik.

**Offen**

1. Codeformat und Entropie. Muss vom Tresenpersonal vorlesbar und vom Nutzer
   abtippbar sein, falls der QR nicht scannt.
2. Ob der zweite Faktor Geburtsdatum oder eine gewählte PIN ist. PIN ist
   datensparsamer, Geburtsdatum ist gewohnt.
3. Verhalten bei mehreren Befunden zu einem Code.
4. Ob der Betreiber eine Referenzimplementierung der Teststellen-Seite
   mitliefert. Vermutlich ja, sonst macht niemand mit.

## Verworfene Alternativen

**Abruf über den Betreiber.** Bequem, ein Endpunkt statt vieler. Der Betreiber
wüsste damit, wer wann testet — die Verarbeitung, die ADR-0003 ausschließt.

**Ergebnis per E-Mail an den Nutzer, manuelles Eintragen.** Der heutige
Zustand. Funktioniert, verliert aber Signatur und Struktur — und damit alles,
was ADR-0007 gewinnen wollte.

**Warten, bis Teststellen QRs am Tresen ausgeben können.** Setzt voraus, dass
der Befund sofort vorliegt. Das ist bei Laboranalytik nicht der Fall.
