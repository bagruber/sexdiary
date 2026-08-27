# ADR-0007 — Signierte Ergebnis-QRs nach dem Muster des EU-COVID-Zertifikats

**Status:** vorgeschlagen · 27.08.2026

## Kontext

Testergebnisse sollen von einer Teststelle in die App gelangen, ohne dass ein
Konto, eine Anmeldung oder eine Datenuebertragung zwischen Teststelle und
Betreiber noetig ist. Der Weg ist ein QR-Code, den der Nutzer selbst scannt.

Die Anforderung lautet: **nicht leicht zu faelschen.** Ein unsigniertes Payload
kann jeder erzeugen; damit waere „Ergebnis der Teststelle X“ eine Behauptung
ohne Wert.

Es gibt dafuer ein deutsches Vorbild, das jeder Beteiligte kennt: das
EU-COVID-Zertifikat. Signierte Nutzlast im QR, nationale Trust List,
**offline verifizierbar**.

## Entscheidung

Vorgeschlagen wird dieselbe Form:

- Die Teststelle haelt einen privaten Schluessel und signiert
  `{Einrichtung, Datum, Analyt, Ergebnis, Nonce}`.
- Die App verifiziert gegen eine mitgelieferte Trust List, die selten ueber ein
  Schluesselverzeichnis aktualisiert wird.
- **Die Pruefung findet vollstaendig offline statt.** Das ist keine
  Bequemlichkeit: Ein Netzwerkaufruf beim Scannen wuerde dem Betreiber verraten,
  wann wer ein Ergebnis importiert — und damit ADR-0003 unterlaufen.
- Eine Sperrliste fuer kompromittierte Schluessel.
- Das Speicherformat sieht ein optionales Signaturfeld vor, damit spaeter keine
  Schemamigration noetig wird.

**Der wichtigste Teil ist nicht die Kryptografie, sondern die Anzeige.** Die
Oberflaeche unterscheidet sichtbar zwischen „signiertes Ergebnis von
<Einrichtung>“ und „selbst eingetragen“. Diese Trennung traegt den groessten
Teil des Vertrauensgewinns — und sie funktioniert bereits, solange noch keine
einzige Teststelle mitmacht.

## Konsequenzen

**Positiv**

- Ein Ergebnis ist ueberpruefbar, ohne dass die Teststelle etwas ueber den
  Nutzer erfaehrt.
- Offline-Verifikation erhaelt Local-First vollstaendig.
- Ein Vorbild, das im deutschen Verwaltungskontext bekannt ist, senkt die
  Erklaerungslast im Gespraech erheblich.
- Es ist der konkreteste denkbare Andockpunkt an eine Teststelle, ohne ein
  Fachverfahren anzubinden.

**Negativ**

- Braucht Schluesselverwaltung auf Seiten der Teststelle — organisatorisch der
  schwierigste Teil, nicht technisch.
- Braucht ein Werkzeug, mit dem eine Teststelle QRs erzeugt.
- Sperrung erfordert, dass die App die Liste gelegentlich aktualisiert. Der
  Abruf darf nichts ueber den Nutzer verraten.

**Offen**

Signaturverfahren, genaues Nutzlastformat, Betreiber des
Schluesselverzeichnisses. Zu klaeren, bevor gebaut wird — Spezifikation unter
`architecture/interfaces/signed-results.md`.

## Verworfene Alternativen

**Unsignierter QR.** Der heutige Zustand. Bequem, aber „Ergebnis von X“ ist
damit eine unbelegte Behauptung.

**Abruf beim Betreiber statt Signatur im QR.** Wuerde bedeuten, dass der
Betreiber jeden Import sieht — direkter Widerspruch zu ADR-0003.

**Signatur mit Pruefung online gegen die Teststelle.** Verraet der Teststelle,
wann das Ergebnis importiert wird, und funktioniert ohne Netz nicht.
