# Anforderungen

Was die Anwendung können muss, mit stabilen Kennungen, damit Entwurf, Code,
Test und Prüfung dasselbe meinen, wenn sie dieselbe Nummer nennen.

Angelegt am 10.09.2026. Der Status beschreibt den **Ist**-Zustand, nicht die
Absicht — eine Anforderungsliste, die den Sollzustand als erledigt führt, ist
schlimmer als keine.

## Wie das hier zu lesen ist

**Kennungen.** `FA-` funktionale Anforderung, `NFA-` nicht-funktionale. Die
Nummer wird nie neu vergeben. Eine entfallene Anforderung bleibt mit dem Status
*zurückgezogen* stehen, damit ein Verweis aus einer ADR oder einem Commit nicht
ins Leere zeigt.

**Status.** Vier Werte, bewusst als Wort und nicht als Farbe — Grün, Gelb und
Rot sind in dieser Anwendung für die Risikoskala vergeben
([ADR-0015](adr/0015-farbtokens.md)).

| Status | Bedeutung |
|---|---|
| gebaut | In der App vorhanden und benutzbar |
| teilweise | Kern oder Modell vorhanden, die Oberfläche oder der Aufruf fehlt |
| offen | Nicht gebaut |
| zurückgezogen | War einmal gefordert, ist es nicht mehr; Begründung dabei |

**Geltungsbereich.** Anforderungen an das Produkt, also `apps/mobile` und
`packages/core`. Die Infoseite (`apps/web`) ist kein Werkzeug, sondern
Erklärung, und trägt daher nur NFA. Der Relay-Server hat eigene funktionale
Anforderungen, weil er ein zweites Gerät ist — sie stehen hier mit, sind aber
als `FA-6x` gruppiert.

## Akteure

| Akteur | Beschreibung |
|---|---|
| **Nutzer** | Führt das eigene Protokoll. Der einzige Akteur mit Zugriff auf Gesundheitsdaten. |
| **Kontakt** | Eine andere Person, mit der ein Token getauscht wurde. Kennt den Nutzer, nicht dessen Daten. |
| **Teststelle** | Stellt ein signiertes Ergebnis aus ([ADR-0007](adr/0007-signierte-testergebnisse.md)). Heute hypothetisch. |
| **Gesundheitsamt** | Möglicher Betreiber; im SMS-Pfad möglicher Absender. Sieht keine Gerätedaten. |
| **Relay** | Kein Mensch, aber ein eigener Vertrauensbereich: nimmt Benachrichtigungen entgegen, ohne zu wissen, wer sie schickt. |

---

## FA-1x — Protokoll führen

| ID | Anforderung | Status |
|---|---|---|
| FA-11 | Der Nutzer kann eine **Begegnung** mit Datum, Praktik und optionalem Kontaktbezug erfassen. | gebaut |
| FA-12 | Die Praktik wird je Richtung getrennt erfasst (rezeptiv/insertiv, oral/vaginal/anal, manuell, Küssen). | gebaut |
| FA-13 | Zu **jeder einzelnen Praktik** kann getrennt vermerkt werden, ob geschützt war. | gebaut |
| FA-14 | Der Nutzer kann ein **Testergebnis** mit Datum, Teststelle und Befund je Erreger erfassen. | gebaut |
| FA-15 | Der Nutzer kann **Impfungen, PrEP und Doxy-PEP** erfassen, Impfungen mit Dosisnummer. | gebaut |
| FA-16 | Der Nutzer kann **Kontakte** anlegen, mit Namen, Notiz, Token und optionalem Handle. | gebaut |
| FA-17 | Jeder Eintrag kann **bearbeitet und gelöscht** werden. | gebaut |
| FA-18 | Einträge sind in einer **Monatsansicht** mit Tagesblatt erreichbar. | gebaut |

Der Zuschnitt von FA-13 ist nicht kosmetisch: das Risikomodell rechnet je
Praktik, ein Schalter „geschützt" für die ganze Begegnung würde die Rechnung
verfälschen.

## FA-2x — Risiko und Testfenster

Der Kernnutzen. Alles andere in dieser Liste trägt dazu bei oder folgt daraus.

| ID | Anforderung | Status |
|---|---|---|
| FA-21 | Die App berechnet je Erreger ein **Risiko** aus Praktik, Schutz, Impfstatus und Prophylaxe. | gebaut |
| FA-22 | Die App leitet je Erreger ab, **ab wann ein Test aussagekräftig** ist (diagnostisches Fenster). | gebaut |
| FA-23 | Die App zeigt eine **einzelne nächste Handlung** — testen, warten, nichts zu tun. | gebaut |
| FA-24 | Jede Risikoangabe ist **aufklappbar** bis zu ihrer Begründung. | gebaut |
| FA-25 | Die App **erinnert**, wenn ein diagnostisches Fenster schliesst. | gebaut |
| FA-26 | Die App führt den **Impfserien-Fortschritt** je Erreger mit. | gebaut |
| FA-27 | Jede medizinische Zahl im Modell ist **belegt oder als unbelegt gekennzeichnet**. | gebaut |
| FA-28 | Die fünf offenen medizinischen Befunde sind **ärztlich geprüft**. | offen |

FA-28 ist die einzige Anforderung dieser Liste, die kein Code erfüllen kann.
Sie ist trotzdem eine Anforderung, und die schwerste: FA-22 meldet heute für
HSV-2 und Mpox „testbar", wo ein negativer Befund nichts ausschliesst. Details
in [`risikomodell-quellen.md`](risikomodell-quellen.md), Abschnitt 7.

## FA-3x — Kontakte und Tokentausch

| ID | Anforderung | Status |
|---|---|---|
| FA-31 | Der Nutzer besitzt ein **eigenes Token**, das keine Personendaten enthält. | gebaut |
| FA-32 | Zwei Geräte können Token per **QR-Code** tauschen — anzeigen und scannen. | gebaut |
| FA-33 | Ein Token kann auf eine **NFC-Karte** geschrieben und von ihr gelesen werden. | gebaut, ungeprüft |
| FA-34 | Statt des Tokens kann wahlweise ein **Messenger-Handle** geteilt werden. | gebaut |
| FA-35 | Ein Token kann als **Text eingefügt** werden, wenn keine Kamera zur Hand ist. | gebaut |

FA-33 steht bewusst als Karte und nicht als Gerätepaarung da: Android Beam ist
seit Android 10 entfernt, von Telefon zu Telefon geht es nicht mehr.

## FA-4x — Benachrichtigung nach positivem Befund

| ID | Anforderung | Status |
|---|---|---|
| FA-41 | Nach einem positiven Befund schlägt die App die **betroffenen Kontakte** anhand des Zeitfensters vor. | gebaut |
| FA-42 | Der Nutzer kann eine Benachrichtigung **anonym über den Relay** senden. | offen |
| FA-43 | Der Nutzer kann vermerken, dass er **persönlich** benachrichtigt hat. | gebaut |
| FA-44 | Die App zeigt **vor dem Senden**, was genau übertragen würde. | gebaut |
| FA-45 | Solange der Relay fehlt, **täuscht die App keinen Versand vor**. | gebaut |
| FA-46 | Ein Empfänger kann aus geschlossenem Vokabular **antworten** (gelesen, kümmere mich, erledigt, negativ getestet). | teilweise |
| FA-47 | Der Nutzer sieht, **wen er wann über welchen Befund** benachrichtigt hat. | gebaut |

FA-45 ist als Anforderung formuliert, obwohl sie wie eine Nichthandlung
aussieht. Sie ist der Grund, warum FA-42 offen sein *darf*, ohne dass die App
gefährlich wird.

FA-46 liegt vollständig im Modell (`ALERT_REPLIES`, `SentAlert.reply`,
[ADR-0011](adr/0011-rueckmeldung.md)) und hat keine Oberfläche, weil der
Rückkanal den Relay voraussetzt.

## FA-5x — Schutz, Diskretion, Datenhoheit

Aus dem Bedrohungsmodell: der realistische Angreifer ist die Person daneben.

| ID | Anforderung | Status |
|---|---|---|
| FA-51 | Alle Daten liegen **verschlüsselt auf dem Gerät**; nichts wird ohne ausdrückliche Handlung übertragen. | gebaut |
| FA-52 | Die Oberfläche kann hinter der **Geräteauthentifizierung** liegen. | gebaut |
| FA-53 | **Screenshots und Bildschirmaufnahme** sind unterbunden. | gebaut |
| FA-54 | Die **Vorschau im App-Umschalter** zeigt keine Inhalte. | gebaut |
| FA-55 | Die App kann unter **neutralem Namen** auftreten (Tarnmodus). | gebaut |
| FA-56 | Ein Griff öffnet einen **harmlosen Ersatzbildschirm**. | gebaut |
| FA-57 | Die App bietet ein **alternatives Symbol** für den Startbildschirm. | offen |
| FA-58 | Der Nutzer kann **alle Daten in einem Zug löschen**. | gebaut |
| FA-59 | Der Nutzer kann **alle Rohdaten einsehen**, die die App über ihn führt. | gebaut |

## FA-6x — Ein- und Ausfuhr

| ID | Anforderung | Status |
|---|---|---|
| FA-61 | Der Nutzer kann eine **passwortverschlüsselte Sicherungsdatei** erzeugen und wieder einlesen. | gebaut |
| FA-62 | Der Nutzer kann in die **Cloud seiner Wahl** sichern. | offen |
| FA-63 | Ein von einer Teststelle **signiertes Ergebnis** wird beim Einlesen kryptographisch geprüft. | gebaut |
| FA-64 | Ein eingelesenes Ergebnis ist als **signiert oder selbst eingetragen** erkennbar. | gebaut |
| FA-66 | Ein **abgelehnter** Code darf auf ausdrückliche Wahl als selbst eingetragener Datensatz übernommen werden. | gebaut |
| FA-67 | Mindestens eine **Teststelle nimmt teil** — die ausgelieferte Vertrauensliste hat einen Eintrag. | offen |
| FA-65 | Der Nutzer kann **freiwillig anonymisierte Daten** zur Forschung beitragen. | offen |

Seit dem 10.09.2026 hängt der Verifizierer nicht mehr in der Luft. Die Weiche
liegt als `readScannedCode` im Kern — nicht im Bildschirm, weil sie entscheidet,
welche *Herkunft* ein Datensatz bekommt, und das ist die Aussage, um die es bei
signierten Befunden geht. Ed25519 kommt aus `@noble/curves` und wird
hereingereicht; der Kern bleibt abhängigkeitsfrei.

**FA-67 ist der Rest, und er ist keine technische Frage.** Die ausgelieferte
Vertrauensliste ist leer, weil keine Teststelle teilnimmt. Ein erfundener
Demo-Aussteller wäre schlimmer als eine leere Liste — er würde genau die
Zusicherung vortäuschen, um die es hier geht. Die Folge ist gewollt: jeder
signierte Code wird heute mit `unknown_issuer` abgelehnt, und FA-66 fängt den
Fall auf.

## FA-7x — Relay-Server

Eigener Vertrauensbereich, deshalb eigene Gruppe. Spezifikation in
[`interfaces/alert-relay.md`](interfaces/alert-relay.md),
Entscheidung in [ADR-0008](adr/0008-anonyme-benachrichtigung.md).

| ID | Anforderung | Status |
|---|---|---|
| FA-71 | Der Relay nimmt `{Empfänger-Token, Erreger, Zeitstempel}` entgegen — **nicht mehr**. | offen |
| FA-72 | Ein Gerät kann die zu **seinem eigenen Token** hinterlegten Benachrichtigungen abholen. | offen |
| FA-73 | Eine abgeholte Benachrichtigung kann **gelöscht** werden (Art. 17 DSGVO). | offen |
| FA-74 | Der Relay kennt **keinen Absender** und kann zwei Benachrichtigungen nicht demselben zuordnen. | offen |
| FA-75 | Der Relay läuft auf **Shared Hosting** — PHP und MySQL, kein langlaufender Prozess. | offen |

FA-75 ist eine Randbedingung, keine Wahl: der vorhandene Hostinger-Plan ist
Shared. Für den Zuschnitt ist das kein Verlust — drei Vorgänge in einer
lesbaren PHP-Datei prüft sich leichter als eine Serverless-Funktion mit
Anbieterbindung.

---

## Nicht-funktionale Anforderungen

Die messbaren Qualitätsszenarien stehen in [`arc42.md`](arc42.md),
Abschnitt 10. Hier stehen die Anforderungen, die kein Szenario, sondern eine
Eigenschaft sind.

| ID | Anforderung | Status |
|---|---|---|
| NFA-01 | `packages/core` hat **null Runtime-Dependencies** und keine Ein-/Ausgabe. | gebaut |
| NFA-02 | Die App stellt **keine Anfrage an Dritte** — keine Analytik, keine externen Schriften. | gebaut |
| NFA-03 | Farbkontraste erfüllen **WCAG 2.1 AA**, geprüft im Test, nicht behauptet. | gebaut |
| NFA-04 | Die Oberfläche liegt vollständig auf **Deutsch und Englisch** vor. | gebaut |
| NFA-05 | Die Interaktionsfarbe und die Risikofarben sind **zwei getrennte Skalen**. | gebaut |
| NFA-06 | Die App kommt **ohne Netzverbindung** vollständig zurecht, bis auf FA-42. | gebaut |
| NFA-07 | Es gibt **keine OTA-Updates**; jede Änderung geht über ein signiertes Paket. | gebaut |
| NFA-08 | Die App ist mit einem **eigenen Schlüssel** signiert, nicht dem Debug-Schlüssel. | offen |
| NFA-09 | Das Projekt hat eine **Lizenz**. | offen |
| NFA-10 | `apps/mobile` hat **automatisierte Tests**. | offen |

NFA-09 kostet eine Datei und blockiert Code-Audit, openCode.de, F-Droid und die
Nachnutzung durch ein zweites Gesundheitsamt. Empfehlung EUPL-1.2.

NFA-10 ist der Punkt, an dem Sparen teuer wird. Der Kern ist gut getestet, die
App gar nicht — und in diesem Repo haben grüne Builds mehrfach nichts bewiesen.

## Ausdrücklich keine Anforderungen

Das Weglassen ist hier so entworfen wie das Bauen, deshalb steht es mit auf der
Liste. Wer eine dieser Zeilen wieder aufmachen will, braucht eine neue ADR.

| Nicht gefordert | Warum nicht | Quelle |
|---|---|---|
| Konto, Anmeldung, Serverprofil | Ein Konto ist eine Personendatenhaltung, die die App nicht braucht | [ADR-0003](adr/0003-local-first.md) |
| Gesundheitsdaten im Browser | Keine der Abwehrmassnahmen ist im Browser umsetzbar | [ADR-0001](adr/0001-native-only.md) |
| Benachrichtigung per Telefonnummer durch die App | Der Betreiber der App sähe eine Nummer und damit eine Person | [ADR-0008](adr/0008-anonyme-benachrichtigung.md) |
| Freitext in der Benachrichtigung | Wäre ein Belästigungskanal, und der Relay trüge Inhalte | [ADR-0011](adr/0011-rueckmeldung.md) |
| Standort, Kalenderzugriff, Adressbuch | Nichts davon verbessert eine Antwort, die die App gibt | Threat Model |
| Diagnose oder Therapieempfehlung | Kein Medizinprodukt. Die App sagt *wann testen*, nicht *was du hast* | arc42 §1.1 |

---

## Nachverfolgbarkeit

Von der Anforderung zur Entscheidung zum Code. Nur die Zeilen, wo der Weg nicht
offensichtlich ist.

| Anforderung | Entscheidung | Wo im Code |
|---|---|---|
| FA-21 … FA-24 | — | `packages/core/src/risk.ts` |
| FA-25 | — | `apps/mobile/src/lib/reminders.ts` |
| FA-31 … FA-35 | [ADR-0008](adr/0008-anonyme-benachrichtigung.md) | `screens/ConnectScreen.tsx`, `lib/nfc.ts` |
| FA-41 … FA-47 | [ADR-0008](adr/0008-anonyme-benachrichtigung.md), [ADR-0011](adr/0011-rueckmeldung.md) | `screens/AlertsScreen.tsx`, `core/src/risk.ts` (`getAlerts`) |
| FA-51 | [ADR-0005](adr/0005-verschluesselung-at-rest.md) | `lib/secure-storage.ts` |
| FA-52 | [ADR-0005](adr/0005-verschluesselung-at-rest.md) | `lib/app-lock.ts`, `screens/LockScreen.tsx` |
| FA-55, FA-56 | — | `branding.ts`, `screens/DecoyScreen.tsx` |
| FA-61, FA-62 | [ADR-0009](adr/0009-backup-modell.md) | `core/src/backup.ts`, `screens/BackupSheet.tsx` |
| FA-63, FA-64, FA-66 | [ADR-0007](adr/0007-signierte-testergebnisse.md) | `core/src/scan.ts`, `core/src/signed-result.ts`, `mobile/src/lib/trust.ts` |
| FA-65 | [ADR-0013](adr/0013-forschungsdaten.md) | — |
| FA-71 … FA-75 | [ADR-0008](adr/0008-anonyme-benachrichtigung.md) | — |
| NFA-03, NFA-05 | [ADR-0015](adr/0015-farbtokens.md) | `core/src/tokens.ts`, `core/test/tokens.test.ts` |
| NFA-07 | [ADR-0006](adr/0006-keine-ota-updates.md) | `app.json` |

## Was diese Liste noch nicht kann

Sie ist nicht auf Testfälle abgebildet. Solange `apps/mobile` keine Tests hat
(NFA-10), wäre eine Spalte „geprüft durch" für die Hälfte der Zeilen eine
Behauptung. Sie kommt, wenn die Tests kommen.
