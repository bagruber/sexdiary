# ADR-0007 — Signierte Ergebnis-QRs nach dem Muster des EU-COVID-Zertifikats

**Status:** vorgeschlagen · 27.08.2026 · erweitert durch [ADR-0012](0012-befundabruf.md)

## Kontext

Testergebnisse sollen von einer Teststelle in die App gelangen, ohne dass ein
Konto, eine Anmeldung oder eine Datenübertragung zwischen Teststelle und
Betreiber nötig ist. Der Weg ist ein QR-Code, den der Nutzer selbst scannt.

Die Anforderung lautet: **nicht leicht zu fälschen.** Ein unsigniertes Payload
kann jeder erzeugen; damit wäre „Ergebnis der Teststelle X“ eine Behauptung
ohne Wert.

Es gibt dafür ein deutsches Vorbild, das jeder Beteiligte kennt: das
EU-COVID-Zertifikat. Signierte Nutzlast im QR, nationale Trust List,
**offline verifizierbar**.

## Entscheidung

Vorgeschlagen wird dieselbe Form:

- Die Teststelle hält einen privaten Schlüssel und signiert
  `{Einrichtung, Datum, Analyt, Ergebnis, Nonce}`.
- Die App verifiziert gegen eine mitgelieferte Trust List, die selten über ein
  Schlüsselverzeichnis aktualisiert wird.
- **Die Prüfung findet vollständig offline statt.** Das ist keine
  Bequemlichkeit: Ein Netzwerkaufruf beim Scannen würde dem Betreiber verraten,
  wann wer ein Ergebnis importiert — und damit ADR-0003 unterlaufen.
- Eine Sperrliste für kompromittierte Schlüssel.
- Das Speicherformat sieht ein optionales Signaturfeld vor, damit später keine
  Schemamigration nötig wird.

**Der wichtigste Teil ist nicht die Kryptografie, sondern die Anzeige.** Die
Oberfläche unterscheidet sichtbar zwischen „signiertes Ergebnis von
<Einrichtung>“ und „selbst eingetragen“. Diese Trennung trägt den größten
Teil des Vertrauensgewinns — und sie funktioniert bereits, solange noch keine
einzige Teststelle mitmacht.

## Konsequenzen

**Positiv**

- Ein Ergebnis ist überprüfbar, ohne dass die Teststelle etwas über den
  Nutzer erfährt.
- Offline-Verifikation erhält Local-First vollständig.
- Ein Vorbild, das im deutschen Verwaltungskontext bekannt ist, senkt die
  Erklärungslast im Gespräch erheblich.
- Es ist der konkreteste denkbare Andockpunkt an eine Teststelle, ohne ein
  Fachverfahren anzubinden.

**Negativ**

- Braucht Schlüsselverwaltung auf Seiten der Teststelle — organisatorisch der
  schwierigste Teil, nicht technisch.
- Braucht ein Werkzeug, mit dem eine Teststelle QRs erzeugt.
- Sperrung erfordert, dass die App die Liste gelegentlich aktualisiert. Der
  Abruf darf nichts über den Nutzer verraten.

**Offen**

Signaturverfahren, genaues Nutzlastformat, Betreiber des
Schlüsselverzeichnisses. Zu klären, bevor gebaut wird — Spezifikation unter
`architecture/interfaces/signed-results.md`.

## Verworfene Alternativen

**Unsignierter QR.** Der heutige Zustand. Bequem, aber „Ergebnis von X“ ist
damit eine unbelegte Behauptung.

**Abruf beim Betreiber statt Signatur im QR.** Würde bedeuten, dass der
Betreiber jeden Import sieht — direkter Widerspruch zu ADR-0003.

**Signatur mit Prüfung online gegen die Teststelle.** Verrät der Teststelle,
wann das Ergebnis importiert wird, und funktioniert ohne Netz nicht.
