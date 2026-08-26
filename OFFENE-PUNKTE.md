# Offene Punkte

*Notiert am 26.08.2026, fortgeschrieben am 27.08.2026. Erledigte Punkte bitte
streichen, nicht abhaken — die Datei soll kurz bleiben.*


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
`refactor/welle-0-versionen`.

Dazu kommt eine Aenderung **ausserhalb dieses Repos**: in
`hausbasis/baseline.json` ist der Ausnahme-Eintrag fuer sexdiary entfernt
(er ist gegenstandslos, seit web und mobile auf derselben React-Version
stehen). Die liegt dort uncommitted im Working Tree.


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
