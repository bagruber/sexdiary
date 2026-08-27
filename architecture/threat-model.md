# Threat Model

Angreiferzentriert statt kategorienzentriert: Fuer jede Lage, in die jemand
realistisch kommt, steht hier, was er erfaehrt und was ihn aufhaelt.

Stand 27.08.2026. Was heute noch nicht wirkt, ist als **offen** markiert — ein
Threat Model, das den Sollzustand als Ist beschreibt, ist wertlos.

## Was ueberhaupt schuetzenswert ist

| Gut | Warum |
|---|---|
| Begegnungen mit Datum, Praktik, Kontaktbezug | Rekonstruiert Sexualleben und Partnerkreis |
| Testergebnisse | Gesundheitsdaten, potenziell stigmatisierend |
| Impfungen und Prophylaxen | Laesst auf Risikoverhalten und Orientierung schliessen |
| Kontakt-Token | Verbindet zwei Menschen |
| **Die blosse Anwesenheit der App** | In manchen Lebenslagen bereits das Problem |

Der letzte Punkt wird gern uebersehen und ist hier der wichtigste. Wer in einer
kontrollierenden Beziehung oder in einem ablehnenden Umfeld lebt, hat ein
Problem, sobald jemand das Symbol auf dem Startbildschirm sieht — unabhaengig
davon, wie gut die Daten darunter verschluesselt sind.

## Die Angreifer

### A1 — Jemand mit dem entsperrten Geraet

**Der realistischste Angreifer dieser App.** Partner, Familie, Mitbewohner,
Kollege. Kein Werkzeug, wenig Zeit, oft Gelegenheit.

| Massnahme | Stand |
|---|---|
| App-Lock beim Start und bei Rueckkehr aus dem Hintergrund | **offen** — heute simuliert, PIN sperrt nur die Oberflaeche |
| Biometrie, an den Keystore gebunden | **offen** — Welle 3 |
| Tarnmodus: neutraler Name im Betriebssystem, alternatives Symbol | teilweise — in der App vorhanden, auf Betriebssystemebene offen |
| Tarnbildschirm auf einen Griff | vorhanden |
| Verdeckte Vorschau in der App-Uebersicht | **offen** |

Erfaehrt heute: alles, sobald die App offen ist. Nach Welle 3: nichts ohne
Biometrie oder PIN.

### A2 — Jemand mit dem gesperrten oder ausgeschalteten Geraet

Dieb, Finder, Behoerde mit dem Geraet.

Erfaehrt: einen verschluesselten Blob. Der Schluessel liegt im Keystore mit der
Einstellung „nur bei entsperrtem Geraet, nur dieses Geraet“ und ist ohne
Geraetesperrcode nicht zugaenglich. Auf Geraeten mit Sicherheitshardware ist er
hardwaregebunden.

Grenze: Wer den Geraetesperrcode hat, ist A1.

### A3 — Jemand mit einem Systembackup

Zugriff auf ein Cloud- oder Rechnerbackup des Geraets.

Erfaehrt: **nichts.** Systembackup ist ausgeschaltet, der Schluessel ist als
nicht uebertragbar markiert. Selbst ein Blob im Backup waere ohne Schluessel
wertlos.

Sobald ADR-0009 umgesetzt ist, kommt eine bewusste Sicherung hinzu — diese ist
mit einer nutzergehaltenen Passphrase verschluesselt und dem Angreifer damit
ebenso verschlossen, solange die Passphrase es ist.

### A4 — Angreifer mit vollstaendiger Kontrolle ueber das Alert-Relay

Kompromittierter Server, boeswilliger Betreiber, Beschlagnahme.

Erfaehrt: Empfaenger-Token, Erreger-Label, Zeitstempel. Und was daraus folgt —
dass zwischen zwei Token eine Beziehung besteht, sofern beide beobachtet werden.

Erfaehrt **nicht**: wer gesendet hat, Klarnamen, Begegnungshistorien,
Testergebnisse ausser dem einen Label, IP-Adressen ueber den Transport hinaus.

Das ist der Zweck von ADR-0008: Der Wert eines vollstaendig uebernommenen
Servers soll gering sein.

Verbleibendes Risiko: Zeitstempel und Labels erlauben Haeufungsanalysen. Wer
viele Token beobachtet, kann Ausbruchsmuster erkennen — Personen aber nicht
identifizieren. Abschwaechung: kurze Aufbewahrung mit automatischem Verfall.

### A5 — Jemand mit einem gefaelschten QR

Faelscht ein Testergebnis, um es jemandem als echt zu zeigen.

| Massnahme | Stand |
|---|---|
| Signatur gegen Trust List, offline geprueft | **offen** — ADR-0007, vorgeschlagen |
| Sichtbare Trennung signiert / selbst eingetragen | **offen** — und der wichtigere Teil |
| Laengenbegrenzung und Schemavalidierung der Nutzlast | vorhanden |

Heute: Jeder kann ein Ergebnis erzeugen, das die App annimmt. Wichtig ist die
Einordnung — die App gibt es als Selbstauskunft aus, nicht als Befund. Nach
ADR-0007 ist die Unterscheidung sichtbar und kryptografisch gedeckt.

Nebenbei: Der gefaehrlichere Fall ist nicht der gefaelschte *negative* Befund
gegenueber einem Partner, sondern die Selbsttaeuschung. Deshalb gehoert die
Trennung in die Oberflaeche, nicht nur in die Pruefung.

### A6 — Angreifer im Netz

Mitlesendes WLAN, kompromittierter Zwischenknoten.

Erfaehrt: dass ein Geraet mit dem Relay spricht. Der Inhalt ist durch Transport-
verschluesselung geschuetzt; darin steht ohnehin nur Token und Label.

Verbleibendes Risiko: Verkehrsanalyse. Wer eine Verbindung zum Relay beobachtet,
weiss, dass die Person die App benutzt. Abschwaechung nur teilweise moeglich.

### A7 — Kompromittierte oder boeswillige Teststelle

Eine Teststelle mit gueltigem Signaturschluessel signiert Falsches.

Erfaehrt: nur, was sie ohnehin weiss — sie hat den Test durchgefuehrt.

Kann: gueltig signierte Falschbefunde erzeugen. Gegenmassnahme ist nicht
technisch, sondern organisatorisch: Sperrliste, begrenzte Schluesselgueltigkeit,
und die Tatsache, dass eine Teststelle mit ihrem Namen im Befund steht.

### A8 — Der Betreiber selbst

Die Frage, die eine Datenschutzpruefung tatsaechlich stellt.

Erfaehrt: was in A4 steht. Der Betreiber hat keinen privilegierten Zugang zu
Geraeten, keine Fernwartung, keinen Update-Kanal fuer Code (ADR-0006), keine
Analytik.

Das ist die Aussage, die die Architektur ueberhaupt tragen soll: Der Betreiber
kann seinen Nutzern nicht schaden, weil er nichts hat.

## Was ausdruecklich nicht abgedeckt ist

- **Kompromittiertes Betriebssystem.** Ein Geraet mit Schadsoftware auf
  Systemebene ist nicht zu verteidigen. Keine App kann das.
- **Zwang.** Wer gezwungen wird, die App zu entsperren, ist nicht durch Technik
  zu schuetzen. Der Tarnmodus hilft gegen den beilaeufigen Blick, nicht gegen
  gezielte Noetigung.
- **Forensik am beschlagnahmten, entsperrten Geraet.** Ein Ziel ausserhalb
  dessen, was dieses Projekt leisten kann.

Diese Grenzen gehoeren benannt. Ein Threat Model, das Vollstaendigkeit
suggeriert, wird im Ernstfall als Zusicherung gelesen.
