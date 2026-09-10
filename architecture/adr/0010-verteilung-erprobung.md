# ADR-0010 — Verteilung während der Erprobung

**Status:** vorgeschlagen · 27.08.2026

## Kontext

Die App muss auf Geräten von Testpersonen laufen, bevor sie öffentlich
verfügbar ist. Zwei Anforderungen stehen dabei in Spannung: Es soll nicht
öffentlich sein, und es soll bei einer kommunalen Vorführung nicht nach
Bastellösung aussehen.

## Entscheidung

Zwei Wege parallel, mit unterschiedlichem Zweck:

**Als Erzählung — selbstgehostetes signiertes Paket.** Die signierte
Android-Anwendung liegt hinter einer nicht verlinkten Adresse, erreichbar über
einen QR-Code. Null Drittanbieter. Das ist genau der Punkt, der bei einer
Kommune zieht: Die Verteilung braucht keinen App Store. Preis: Systemwarnung
bei der Installation, kein automatisches Update.

**Als Werkzeug — interner Testkanal des Stores.** Begrenzte Testerzahl per
E-Mail-Einladung, nicht auffindbar, mit automatischem Update und ohne
Installationsreibung. Damit lässt sich tatsächlich iterieren. Preis: Ein
Entwicklerkonto, und der Plattformanbieter sieht Anwendung und Testerliste.

Auf iOS gibt es zum zweiten Weg ein Aequivalent; ein selbstgehosteter Weg
existiert dort nicht, weshalb iOS in der Erprobung an den Testkanal gebunden ist.

## Konsequenzen

**Positiv**

- Der selbstgehostete Weg belegt die Souveränitätsaussage praktisch statt
  theoretisch — er ist gleichzeitig Verteilung und Argument.
- Der Testkanal hält die Iterationsschleife kurz.
- Beide Wege sind mit ADR-0006 vereinbar: In beiden Fällen geht jede Aenderung
  durch einen vollständigen Build.

**Negativ**

- Zwei Verteilungswege bedeuten zwei Prozesse und die Gefahr abweichender
  Stände. Gegenmaßnahme: derselbe Build-Artefaktstand für beide.
- Der Testkanal bedeutet, dass der Plattformanbieter die Anwendung sieht,
  bevor sie öffentlich ist.
- Sideloading erzeugt bei Testpersonen Erklärungsbedarf.

**Offen**

Ob der selbstgehostete Weg für die Endfassung bestehen bleibt. Bei einer
quelloffenen Lizenz käme zusätzlich ein Verzeichnis in Frage, das aus der
Quelle baut — starkes Vertrauenssignal für diese Anwendungskategorie, und es
umgeht die Datenschutzangaben-Erklärung im kommerziellen Store. Es verlangt
reproduzierbare Builds, also genau das, was der lokale Bauweg ohnehin liefert.

## Verworfene Alternativen

**Nur der Testkanal des Stores.** Bequem, aber er gibt die Souveränitäts-
aussage aus der Hand, bevor sie einmal vorgeführt wurde.

**Nur selbstgehostet.** Schön konsequent, aber ohne automatisches Update wird
die Iteration mit mehreren Testpersonen zäh, und iOS fällt vollständig aus.

**Verteilung über einen Cloud-Build-Dienst.** Bequem, aber er schiebt fremde
Server in einen Ablauf, dessen ganzer Zweck ist, ohne sie auszukommen.
