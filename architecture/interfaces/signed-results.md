# Schnittstelle: signierter Ergebnis-QR

**Status:** Entwurf · 27.08.2026 · setzt [ADR-0007](../adr/0007-signierte-testergebnisse.md) um

Richtung: Teststelle -> App. Traeger: QR-Code auf Ausdruck oder Bildschirm.
Kein Netzwerkweg zwischen Teststelle und Betreiber.

## Anforderungen

| # | Anforderung | Warum |
|---|---|---|
| A1 | Ein Dritter kann kein Ergebnis erzeugen, das die App als Befund einer Teststelle annimmt | Der eigentliche Zweck |
| A2 | Die Pruefung laeuft **vollstaendig offline** | Ein Netzwerkaufruf beim Scannen verriete dem Betreiber, wann wer importiert — Widerspruch zu ADR-0003 |
| A3 | Die Teststelle erfaehrt nichts ueber den Nutzer oder den Zeitpunkt des Imports | Kein Rueckkanal |
| A4 | Ein kompromittierter Schluessel ist sperrbar | Betrieb ueber Jahre |
| A5 | Die Nutzlast passt in einen QR, der auf einem Kassenbon lesbar bleibt | Praxistauglichkeit |
| A6 | Die App unterscheidet **sichtbar** zwischen signiert und selbst eingetragen | Der groesste Teil des Vertrauensgewinns |

A6 ist die wichtigste Zeile der Tabelle. Sie wirkt bereits, solange noch keine
einzige Teststelle mitmacht — sie macht aus jeder Eingabe eine ehrlich
etikettierte Aussage.

## Vorbild

Das EU-COVID-Zertifikat hat dieses Problem im deutschen Kontext bereits
geloest: signierte Nutzlast im QR, nationale Trust List, offline pruefbar. Die
Form ist bekannt, erprobt und im Gespraech mit einer Verwaltung ohne langes
Vorwort erklaerbar. Sie wird hier uebernommen, nicht neu erfunden.

## Nutzlast

Inhaltlich enthalten:

| Feld | Bedeutung |
|---|---|
| Kennung der Einrichtung | wird dem Nutzer angezeigt |
| Ausstellungsdatum | |
| Probendatum | fuer die Fensterberechnung ausschlaggebend |
| Untersuchte Erreger mit Befund | je Erreger ein Ergebnis |
| Nonce | verhindert, dass zwei identische Befunde denselben QR ergeben |
| Signatur ueber alle vorgenannten Felder | |

Ausdruecklich **nicht** enthalten: Name, Geburtsdatum oder sonstige
Identifikatoren des Nutzers. Der QR ist ein Befund, kein Ausweis — er belegt,
dass *diese Probe* *dieses Ergebnis* hatte, nicht wer sie abgegeben hat.

Das ist ein bewusster Unterschied zum COVID-Zertifikat und die datenschutz-
freundlichere Variante. Der Preis: Ein QR ist weitergebbar. Fuer den Zweck —
die eigene Historie fuehren — ist das hinnehmbar.

## Ablauf

```mermaid
sequenceDiagram
    participant T as Teststelle
    participant N as Nutzer
    participant A as App
    participant V as Schluesselverzeichnis

    Note over A,V: selten, unabhaengig vom Scan
    A->>V: Trust List abrufen
    V-->>A: oeffentliche Schluessel + Sperrliste

    T->>T: Nutzlast signieren
    T->>N: QR
    N->>A: scannen

    rect rgb(240,248,248)
    Note over A: offline
    A->>A: Schema pruefen
    A->>A: Schluessel in Trust List?
    A->>A: gesperrt?
    A->>A: Signatur gueltig?
    end

    alt alles gueltig
        A-->>N: Befund von <Einrichtung>, mit Pruefzeichen
    else
        A-->>N: Ablehnung mit Grund
    end
```

## Verhalten bei Fehlern

Die App sagt, **warum** sie ablehnt — unbekannter Aussteller, gesperrter
Schluessel, ungueltige Signatur, unlesbares Format. Eine pauschale Ablehnung
erzeugt beim Nutzer den Verdacht, die App sei kaputt, und bei der Teststelle
keinen Hinweis auf die Ursache.

Ein abgelehnter QR darf als **selbst eingetragener** Datensatz uebernommen
werden koennen, sofern der Nutzer das ausdruecklich waehlt. Er ist dann als
solcher etikettiert. Andernfalls waere die App bei einer nicht teilnehmenden
Teststelle schlechter benutzbar als ohne die ganze Funktion.

## Trust List

- Wird mit der App ausgeliefert, damit die erste Pruefung ohne Netz funktioniert.
- Aktualisierung selten und unabhaengig vom Scanvorgang, damit der Abruf nichts
  ueber einen Import verraet.
- Enthaelt je Aussteller: Kennung, oeffentlicher Schluessel, Gueltigkeitszeitraum,
  Anzeigename.
- Sperrliste getrennt, damit sie haeufiger aktualisiert werden kann.

## Offen

1. Signaturverfahren und konkrete Kodierung der Nutzlast.
2. Wer das Schluesselverzeichnis betreibt. Bei einer kommunalen Einfuehrung
   naheliegend die einfuehrende Stelle.
3. Werkzeug fuer die Teststelle, das QRs erzeugt — ohne das ist die ganze
   Schnittstelle theoretisch.
4. Verhalten bei abgelaufenem, aber zum Probenzeitpunkt gueltigem Schluessel.
   Vorschlag: gueltig, wenn die Signatur zum Probendatum gueltig war.
