# ADR-0010 — Verteilung waehrend der Erprobung

**Status:** vorgeschlagen · 27.08.2026

## Kontext

Die App muss auf Geraeten von Testpersonen laufen, bevor sie oeffentlich
verfuegbar ist. Zwei Anforderungen stehen dabei in Spannung: Es soll nicht
oeffentlich sein, und es soll bei einer kommunalen Vorfuehrung nicht nach
Bastelloesung aussehen.

## Entscheidung

Zwei Wege parallel, mit unterschiedlichem Zweck:

**Als Erzaehlung — selbstgehostetes signiertes Paket.** Die signierte
Android-Anwendung liegt hinter einer nicht verlinkten Adresse, erreichbar ueber
einen QR-Code. Null Drittanbieter. Das ist genau der Punkt, der bei einer
Kommune zieht: Die Verteilung braucht keinen App Store. Preis: Systemwarnung
bei der Installation, kein automatisches Update.

**Als Werkzeug — interner Testkanal des Stores.** Begrenzte Testerzahl per
E-Mail-Einladung, nicht auffindbar, mit automatischem Update und ohne
Installationsreibung. Damit laesst sich tatsaechlich iterieren. Preis: Ein
Entwicklerkonto, und der Plattformanbieter sieht Anwendung und Testerliste.

Auf iOS gibt es zum zweiten Weg ein Aequivalent; ein selbstgehosteter Weg
existiert dort nicht, weshalb iOS in der Erprobung an den Testkanal gebunden ist.

## Konsequenzen

**Positiv**

- Der selbstgehostete Weg belegt die Souveraenitaetsaussage praktisch statt
  theoretisch — er ist gleichzeitig Verteilung und Argument.
- Der Testkanal haelt die Iterationsschleife kurz.
- Beide Wege sind mit ADR-0006 vereinbar: In beiden Faellen geht jede Aenderung
  durch einen vollstaendigen Build.

**Negativ**

- Zwei Verteilungswege bedeuten zwei Prozesse und die Gefahr abweichender
  Staende. Gegenmassnahme: derselbe Build-Artefaktstand fuer beide.
- Der Testkanal bedeutet, dass der Plattformanbieter die Anwendung sieht,
  bevor sie oeffentlich ist.
- Sideloading erzeugt bei Testpersonen Erklaerungsbedarf.

**Offen**

Ob der selbstgehostete Weg fuer die Endfassung bestehen bleibt. Bei einer
quelloffenen Lizenz kaeme zusaetzlich ein Verzeichnis in Frage, das aus der
Quelle baut — starkes Vertrauenssignal fuer diese Anwendungskategorie, und es
umgeht die Datenschutzangaben-Erklaerung im kommerziellen Store. Es verlangt
reproduzierbare Builds, also genau das, was der lokale Bauweg ohnehin liefert.

## Verworfene Alternativen

**Nur der Testkanal des Stores.** Bequem, aber er gibt die Souveraenitaets-
aussage aus der Hand, bevor sie einmal vorgefuehrt wurde.

**Nur selbstgehostet.** Schoen konsequent, aber ohne automatisches Update wird
die Iteration mit mehreren Testpersonen zaeh, und iOS faellt vollstaendig aus.

**Verteilung ueber einen Cloud-Build-Dienst.** Bequem, aber er schiebt fremde
Server in einen Ablauf, dessen ganzer Zweck ist, ohne sie auszukommen.
