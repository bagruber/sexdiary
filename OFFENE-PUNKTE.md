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
   `eas.json` liegt mit beiden Profilen bereit. Der lokale Bauweg
   **erzeugt seit dem 28.08.2026 ein APK** (71 MB, alle vier ABIs); das
   Rezept samt der drei nicht offensichtlichen Voraussetzungen steht im
   README von `apps/mobile`. Offen bleibt: **eigener Keystore** statt des
   Debug-Schluessels (geprueft: `CN=Android Debug`), bevor irgendetwas
   verteilt wird.
4. **Alternatives Icon und OS-Name.** Ohne das verrät eine Benachrichtigung im
   Tarnmodus auf dem Sperrbildschirm weiterhin den App-Namen.

Bewusst nicht gebaut: der Schlüssel ist **nicht** an die Authentisierung
gebunden (`SecureStore` mit `requireAuthentication`). Das wäre der stärkere
Schutz, aber Android verwirft den Schlüssel, wenn sich die hinterlegte
Biometrie ändert. Ohne Backup ist das ein Datenverlust ohne Ausweg. Nach
Punkt 1 neu zu bewerten.


## Fünf medizinische Befunde warten auf ärztliche Prüfung

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
- **Mpox, Küssen, Kondomeffekt 0,2.** Syphilis führt für Küssen korrekt 0.
  Dieser Wert ist der einzige Grund, warum die App beim Küssen einen
  Schutzschalter anbietet.

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


## Die App laeuft, und was dabei auffiel

Am 09.09.2026 zum ersten Mal auf einem Geraet gelaufen — der aelteste offene
Punkt, seit dem 10.07.2026. App-Lock, Tarnmodus und die Berechtigungsabfrage
fuer Benachrichtigungen funktionieren.

Aufgefallen ist, dass die App ein unfertiger Port des Web-Trackers war: das
Datenmodell konnte alles, die Oberflaeche fehlte. Seither gebaut sind
Onboarding mit Profil, Schutz pro Akt, Kontakte, Impfungen und eine Zeile, mit
der sich die Erinnerungen pruefen lassen, ohne bis 10 Uhr zu warten.

**Noch nicht auf einem Geraet geprueft** ist genau das, was seitdem entstanden
ist. Der Build dazu liegt unter `dist/`, benannt nach Commit.

Offen bleibt aus der Beobachtungsliste:

- **QR und NFC.** Das Web hat einen QR-Scanner, die App nicht. NFC existiert
  nirgends ausser als Platzhalter mit dem Text „erfordert native App“.
- **Einstellungen.** Die Web-Einstellungen sind reicher als die der App:
  bekannte Vorerkrankungen, Region, Token-oder-Handle samt Plattform und
  Handle. All das fehlt nativ.


## Gepusht, CI laeuft

Seit dem 09.09.2026 auf `refactor/wellen-0-bis-3` (umbenannt, der alte Name
trug laengst mehr als Welle 0), PR #1 gegen `main`. Die Pruefung ist mehrfach
gruen gelaufen — auch der Schritt, der lange ungeprueft war: Linux erzeugt
dieselben `docs/`-Hashes wie Windows.

`pnpm/action-setup@v4` laeuft auf Node 20, das GitHub als veraltet meldet und
auf 24 zwingt. Noch kein Fehler.

**Weiter offen: zwei Aenderungen ausserhalb dieses Repos**, beide uncommitted
im Working Tree von `hausbasis`:

- Der Ausnahme-Eintrag fuer sexdiary ist entfernt (gegenstandslos, seit web und
  mobile auf derselben React-Version stehen).
- `baseline.json` fuehrt jetzt die sechs ESLint-Pakete als Zielversionen, in
  denselben Ranges wie freshdoc und freshpost.


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
