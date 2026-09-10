# Offene Punkte

*Notiert am 26.08.2026, fortgeschrieben am 27.08.2026 nach Welle 2. Erledigte
Punkte bitte streichen, nicht abhaken — die Datei soll kurz bleiben.*


## Welle 3 ist zur Hälfte gebaut

Fertig: echter App-Lock, Bildschirmschutz, Erinnerungen, und das Format der
signierten Befunde samt Vertrauensliste.

Offen, in dieser Reihenfolge sinnvoll:

1. **Backup ([ADR-0009](architecture/adr/0009-backup-modell.md)).** Der
   **verschlüsselte Dateiexport steht** seit dem 09.09.2026: scrypt über eine
   Passphrase, AES-256-GCM, selbstbeschreibendes Format. Offen bleibt die
   Cloud-Sicherung — und die ist es, die den Lock-Härtungsschritt freigibt,
   denn ein Dateiexport verlangt Disziplin und existiert im Ernstfall nicht.
   Auf einem Gerät ist der Export noch nicht geprüft, auch nicht, wie lange
   scrypt dort braucht.
2. **QR-Scanner und Ed25519-Verifizierer auf dem Gerät.** Das Format steht und
   ist getestet, gescannt wird noch nichts. Braucht einen Kamerabildschirm.
3. **Verteilung ([ADR-0010](architecture/adr/0010-verteilung-erprobung.md)).**
   `eas.json` liegt mit beiden Profilen bereit. Der lokale Bauweg
   **erzeugt seit dem 28.08.2026 ein APK** (71 MB, alle vier ABIs); das
   Rezept samt der drei nicht offensichtlichen Voraussetzungen steht im
   README von `apps/mobile`. Offen bleibt: **eigener Keystore** statt des
   Debug-Schluessels (geprueft: `CN=Android Debug`), bevor irgendetwas
   verteilt wird.
4. **Alternatives Icon.** Der OS-Name ist seit dem 10.09.2026 dauerhaft
   „Journal“ — eine Benachrichtigung auf dem Sperrbildschirm nennt damit keinen
   verräterischen Absender mehr. Das **Icon** bleibt das eigene: es zur Laufzeit
   zu wechseln geht auf Android nur über `activity-alias` und eine weitere
   Drittanbieter-Abhängigkeit. Bewusst vertagt, bis klar ist, ob es das wert
   ist.

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


## Was der Web-Prototyp kann und die App noch nicht

Vollstaendige Gegenueberstellung, aufgenommen am 09.09.2026. Nichts davon soll
verlorengehen. Reihenfolge = Vorschlag fuer die Umsetzung.

| Funktion | Web | App |
|---|---|---|
| **Token teilen per QR** (eigenes Token oder Handle) | ja | **fehlt** |
| **QR scannen** — Kontakt oder Testergebnis importieren | ja | **fehlt** |
| **Code einfuegen** statt scannen | ja | **fehlt** |
| **NFC** | nur Platzhalter | **fehlt** |
| **Benachrichtigungsansicht**: wen informieren, pro Infektion | ja | **fehlt** |
| **Anonym benachrichtigen** ueber das Relay | ja | **fehlt** |
| **Persoenlich benachrichtigt** manuell markieren | ja | **fehlt** |
| **Rueckmeldungen**: wartet, bestaetigt, negativ getestet | ja | **fehlt** |
| **Positiv-Ablauf** (eigener Befund, wer ist betroffen) | ja | **fehlt** |
| **Kalender** mit Monatsansicht und Tagesblatt | ja | Liste statt Kalender |
| **Kontaktliste** verwalten, Tokens einsehen | ja | nur anlegen |
| **Testliste** | ja | nur anlegen |
| Einstellung **Token oder Handle**, Plattform, Handle | ja | **fehlt** |
| Einstellung **bekannte Vorerkrankungen** | ja | **fehlt** |
| Einstellung **Region** | ja | **fehlt** |
| Einstellung **hohe Praevalenz**, **wenig Bewegung**, **Risikoarmes ausblenden** | ja | **fehlt** |
| Onboarding mit Profil | ja | seit 09.09. auch nativ |
| Schutz pro Praktik | im Tagesblatt | seit 09.09. auch nativ |

Nur nativ, im Web bewusst nicht moeglich: App-Sperre, Bildschirmschutz,
Tarnmodus, lokale Erinnerungen, verschluesselte Sicherung.


## Aufteilung der App ist noch nicht entschieden

Heute drei Reiter (Heute, Verlauf, Einstellungen) und eine Plus-Taste fuer
Begegnungen. Offen ist, ob das die richtige Verteilung ist: Einstellungen
werden selten gebraucht und belegen einen von drei Plaetzen, waehrend die
Benachrichtigung — laut Konzeptvorstellung eine der beiden Kernfunktionen —
gar keinen hat. Vorschlaege stehen zur Entscheidung an.


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


## Relay laeuft auf Shared Hosting, also PHP

Geklaert am 10.09.2026: der Hostinger-Plan ist **Shared**, kein VPS. Damit ist
kein langlaufender Node-Prozess moeglich, und der Partner-Alert-Server aus
ADR-0008 wird PHP mit MySQL.

Fuer den Zuschnitt ist das kein Verlust. Der Relay traegt
`{Empfaenger-Token, Erreger, Zeitstempel}` und kennt drei Vorgaenge: ablegen,
zum eigenen Token abholen, loeschen. Das sind ein paar Dutzend Zeilen, und fuer
eine Sicherheitspruefung ist eine lesbare PHP-Datei eher ein Vorteil als eine
Serverless-Funktion mit Anbieterbindung.

Was damit **nicht** geht und in `notes/05` anders stand: Docker, eigene Ports,
Hintergrundprozesse. Der Direktabruf von Testergebnissen (ADR-0012) und alles,
was einen laufenden Dienst braucht, bleibt davon beruehrt.

Offen bleibt die Frage aus dem Pitch, die keine technische ist: **darf ein
pseudonymisiertes Token ohne Personendaten ueberhaupt auf einem Server
liegen?** Die gehoert rechtlich geklaert, bevor der Relay Daten annimmt.


## index.html hat kein Favicon

Jeder Seitenaufruf erzeugt einen 404. Vorbestehend, harmlos, aber vor einer
oeffentlichen Instanz zu beheben.
