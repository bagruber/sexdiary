# Offene Punkte

*Notiert am 26.08.2026, fortgeschrieben am 27.08.2026 nach Welle 2. Erledigte
Punkte bitte streichen, nicht abhaken — die Datei soll kurz bleiben.*


## Welle 3 ist zur Hälfte gebaut

Fertig: echter App-Lock, Bildschirmschutz, Erinnerungen, und das Format der
signierten Befunde samt Vertrauensliste.

Offen, in dieser Reihenfolge sinnvoll:

1. **Backup ([ADR-0009](architecture/adr/0009-backup-modell.md)).** Kommt
   zuerst, weil der nächste Härtungsschritt am Lock ohne Sicherung eine
   Datenverlustfalle wäre — siehe unten.
2. **QR-Scanner und Ed25519-Verifizierer auf dem Gerät.** Das Format steht und
   ist getestet, gescannt wird noch nichts. Braucht einen Kamerabildschirm.
3. **Verteilung ([ADR-0010](architecture/adr/0010-verteilung-erprobung.md)).**
   Signiertes Paket, lokaler Build dokumentiert.
4. **Alternatives Icon und OS-Name.** Ohne das verrät eine Benachrichtigung im
   Tarnmodus auf dem Sperrbildschirm weiterhin den App-Namen.

Bewusst nicht gebaut: der Schlüssel ist **nicht** an die Authentisierung
gebunden (`SecureStore` mit `requireAuthentication`). Das wäre der stärkere
Schutz, aber Android verwirft den Schlüssel, wenn sich die hinterlegte
Biometrie ändert. Ohne Backup ist das ein Datenverlust ohne Ausweg. Nach
Punkt 1 neu zu bewerten.


## Vier medizinische Befunde warten auf ärztliche Prüfung

Aus Welle 2, ausführlich in `architecture/risikomodell-quellen.md`,
Abschnitt 7. Der schwerste zuerst:

- **HSV-2, Fenster 16 Tage.** Die IgG-Serokonversion dauert 3 bis 12 Wochen.
  Die App sagt „jetzt testbar“, wo ein negatives Ergebnis nichts ausschließt.
- **Mpox, Fenster 21 Tage.** Mpox wird per PCR aus Läsionsmaterial
  diagnostiziert. Ein serologisches Fenster gibt es nicht.
- **Syphilis 21 und Gonorrhoe 7** liegen am optimistischen Ende ihrer
  Spannen, während HIV am konservativen liegt.
- **Hep B rezeptiv anal 0,37** sieht aus wie die Nadelstich-Zahl — anderer
  Übertragungsweg, und sie erzeugt heute `very_high`.

Bewusst nicht geändert. Ein medizinisches Modell aufgrund einer
Literaturrecherche zu verstellen wäre derselbe Fehler wie es ohne Quellen zu
schreiben, nur schwerer zu bemerken. Das ist der Kernnutzen der App — es
gehört einer Infektiologin vorgelegt, bevor jemand die App benutzt.


## Schriftentscheidung wartet auf die Schriftdateien

Farben sind entschieden ([ADR-0015](architecture/adr/0015-farbtokens.md)),
die Schrift nicht. **Atkinson Hyperlegible durchgehend** bleibt die
Empfehlung — vom Braille Institute für maximale Zeichenunterscheidbarkeit
entworfen, also ein BITV-Argument statt eines Stilentscheids.

Sie kommt erst in die Tokens, wenn die Dateien mitgeliefert werden: nativ in
Welle 3, Infoseite in Welle 4. Ein Token, das auf eine nicht mitgelieferte
Schrift zeigt, wäre genau der Fehler, den `FONT` drei Wellen lang vorgemacht
hat. **Schriftdateien mitliefern, niemals Google Fonts verlinken.**


## Web-Tracker: Rente oder beschriftete Demo?

Seit der Native-Only-Entscheidung vom 27.08.2026 ist `apps/web` nicht mehr das
Produkt. Er existiert aber noch, dupliziert die App und kostet Pflege.

Empfehlung: **Rente.** Ein anklickbarer Web-Klon einer nativen App suggeriert im
Pitch „wir haben eine Web-App gebaut und nennen sie nativ“. Ueberzeugender ist
die echte App auf einem echten Telefon plus ein Test-Link fuer die Runde. Der
Code bleibt in der Historie, `packages/core` wandert unveraendert mit.

Betrifft Welle 4. Begruendung in `architecture/adr/0001-native-only.md`.


## Mobile-App ist noch nie auf einem Geraet gelaufen

Der aelteste offene Punkt, seit dem 10.07.2026. Verifiziert sind bisher nur
Typecheck, `expo-doctor` und der Metro-Bundle-Export — das sagt nichts darueber,
ob die App startet, ob SecureStore den Schluessel haelt und ob die
Entschluesselung beim zweiten Start durchlaeuft.

Seit dem 27.08.2026 wiegt das schwerer: die App ist ueber drei Expo-Majors
gesprungen (54 -> 57) und laeuft jetzt auf der New Architecture, die in SDK 57
nicht mehr abschaltbar ist. `npx expo start` und einmal durchklicken.


## Nichts ist gepusht

Alle Aenderungen vom 26. und 27.08.2026 liegen als lokale Commits auf
`refactor/welle-0-versionen`. Der Branchname passt nicht mehr — inzwischen
liegen Welle 0, 1 und 2 darauf.

Dazu kommen **zwei Aenderungen ausserhalb dieses Repos**, beide uncommitted im
Working Tree von `hausbasis`:

- Der Ausnahme-Eintrag fuer sexdiary ist entfernt (gegenstandslos, seit web und
  mobile auf derselben React-Version stehen).
- `baseline.json` fuehrt jetzt die sechs ESLint-Pakete als Zielversionen, in
  denselben Ranges wie freshdoc und freshpost. `node check.mjs --kurz` meldet
  dafuer keine Abweichung — die drei Repos teilen sich eine Kopie im Store.

**Die CI ist noch nie gelaufen.** Ein Schritt darin ist ungeprueft: der
Vergleich, ob `docs/` dem Quellstand entspricht. Lokal geht er durch; ob der
Build unter Linux dieselben Hashes erzeugt wie unter Windows, zeigt erst der
erste Lauf.


## Lizenz weiterhin offen

Steht seit dem 10.07.2026 auf "all rights reserved". Am 27.08.2026 bewusst
offen gelassen. Blockiert Code-Audit, Veroeffentlichung auf openCode.de,
F-Droid und die Nachnutzung durch ein zweites Gesundheitsamt. Empfehlung
unveraendert EUPL-1.2. Begruendung in `notes/05`, Abschnitt 6.1.


## Hostinger-Produkt unbekannt

Shared Hosting oder VPS entscheidet, ob der Partner-Alert-Server ueberhaupt
gebaut werden kann (kein langlaufender Node-Prozess auf Shared Hosting).
Siehe `notes/05`, Abschnitt 5.


## index.html hat kein Favicon

Jeder Seitenaufruf erzeugt einen 404. Vorbestehend, harmlos, aber vor einer
oeffentlichen Instanz zu beheben.
