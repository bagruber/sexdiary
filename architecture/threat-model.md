# Threat Model

Angreiferzentriert statt kategorienzentriert: Für jede Lage, in die jemand
realistisch kommt, steht hier, was er erfährt und was ihn aufhält.

Stand 27.08.2026. Was heute noch nicht wirkt, ist als **offen** markiert — ein
Threat Model, das den Sollzustand als Ist beschreibt, ist wertlos.

## Was überhaupt schützenswert ist

| Gut | Warum |
|---|---|
| Begegnungen mit Datum, Praktik, Kontaktbezug | Rekonstruiert Sexualleben und Partnerkreis |
| Testergebnisse | Gesundheitsdaten, potenziell stigmatisierend |
| Impfungen und Prophylaxen | Lässt auf Risikoverhalten und Orientierung schließen |
| Kontakt-Token | Verbindet zwei Menschen |
| **Die blosse Anwesenheit der App** | In manchen Lebenslagen bereits das Problem |

Der letzte Punkt wird gern übersehen und ist hier der wichtigste. Wer in einer
kontrollierenden Beziehung oder in einem ablehnenden Umfeld lebt, hat ein
Problem, sobald jemand das Symbol auf dem Startbildschirm sieht — unabhängig
davon, wie gut die Daten darunter verschlüsselt sind.

## Die Angreifer

### A1 — Jemand mit dem entsperrten Gerät

**Der realistischste Angreifer dieser App.** Partner, Familie, Mitbewohner,
Kollege. Kein Werkzeug, wenig Zeit, oft Gelegenheit.

| Maßnahme | Stand |
|---|---|
| App-Lock beim Start und bei Rückkehr aus dem Hintergrund | **offen** — heute simuliert, PIN sperrt nur die Oberfläche |
| Biometrie, an den Keystore gebunden | **offen** — Welle 3 |
| Tarnmodus: neutraler Name im Betriebssystem, alternatives Symbol | teilweise — in der App vorhanden, auf Betriebssystemebene offen |
| Tarnbildschirm auf einen Griff | vorhanden |
| Verdeckte Vorschau in der App-Uebersicht | **offen** |

Erfährt heute: alles, sobald die App offen ist. Nach Welle 3: nichts ohne
Biometrie oder PIN.

### A2 — Jemand mit dem gesperrten oder ausgeschalteten Gerät

Dieb, Finder, Behörde mit dem Gerät.

Erfährt: einen verschlüsselten Blob. Der Schlüssel liegt im Keystore mit der
Einstellung „nur bei entsperrtem Gerät, nur dieses Gerät“ und ist ohne
Gerätesperrcode nicht zugänglich. Auf Geräten mit Sicherheitshardware ist er
hardwaregebunden.

Grenze: Wer den Gerätesperrcode hat, ist A1.

### A3 — Jemand mit einem Systembackup

Zugriff auf ein Cloud- oder Rechnerbackup des Geräts.

Erfährt: **nichts.** Systembackup ist ausgeschaltet, der Schlüssel ist als
nicht übertragbar markiert. Selbst ein Blob im Backup wäre ohne Schlüssel
wertlos.

Sobald ADR-0009 umgesetzt ist, kommt eine bewusste Sicherung hinzu — diese ist
mit einer nutzergehaltenen Passphrase verschlüsselt und dem Angreifer damit
ebenso verschlossen, solange die Passphrase es ist.

### A4 — Angreifer mit vollständiger Kontrolle über das Alert-Relay

Kompromittierter Server, böswilliger Betreiber, Beschlagnahme.

Erfährt: Empfänger-Token, Erreger-Label, Zeitstempel. Und was daraus folgt —
dass zwischen zwei Token eine Beziehung besteht, sofern beide beobachtet werden.

Erfährt **nicht**: wer gesendet hat, Klarnamen, Begegnungshistorien,
Testergebnisse außer dem einen Label, IP-Adressen über den Transport hinaus.

Das ist der Zweck von ADR-0008: Der Wert eines vollständig übernommenen
Servers soll gering sein.

Verbleibendes Risiko: Zeitstempel und Labels erlauben Häufungsanalysen. Wer
viele Token beobachtet, kann Ausbruchsmuster erkennen — Personen aber nicht
identifizieren. Abschwächung: kurze Aufbewahrung mit automatischem Verfall.

### A5 — Jemand mit einem gefälschten QR

Fälscht ein Testergebnis, um es jemandem als echt zu zeigen.

| Maßnahme | Stand |
|---|---|
| Signatur gegen Trust List, offline geprüft | **offen** — ADR-0007, vorgeschlagen |
| Sichtbare Trennung signiert / selbst eingetragen | **offen** — und der wichtigere Teil |
| Längenbegrenzung und Schemavalidierung der Nutzlast | vorhanden |

Heute: Jeder kann ein Ergebnis erzeugen, das die App annimmt. Wichtig ist die
Einordnung — die App gibt es als Selbstauskunft aus, nicht als Befund. Nach
ADR-0007 ist die Unterscheidung sichtbar und kryptografisch gedeckt.

Nebenbei: Der gefährlichere Fall ist nicht der gefälschte *negative* Befund
gegenüber einem Partner, sondern die Selbsttäuschung. Deshalb gehört die
Trennung in die Oberfläche, nicht nur in die Prüfung.

### A6 — Angreifer im Netz

Mitlesendes WLAN, kompromittierter Zwischenknoten.

Erfährt: dass ein Gerät mit dem Relay spricht. Der Inhalt ist durch Transport-
verschlüsselung geschützt; darin steht ohnehin nur Token und Label.

Verbleibendes Risiko: Verkehrsanalyse. Wer eine Verbindung zum Relay beobachtet,
weiß, dass die Person die App benutzt. Abschwächung nur teilweise möglich.

### A7 — Kompromittierte oder böswillige Teststelle

Eine Teststelle mit gültigem Signaturschlüssel signiert Falsches.

Erfährt: nur, was sie ohnehin weiß — sie hat den Test durchgeführt.

Kann: gültig signierte Falschbefunde erzeugen. Gegenmaßnahme ist nicht
technisch, sondern organisatorisch: Sperrliste, begrenzte Schlüsselgültigkeit,
und die Tatsache, dass eine Teststelle mit ihrem Namen im Befund steht.

### A8 — Der Betreiber selbst

Die Frage, die eine Datenschutzprüfung tatsächlich stellt.

Erfährt: was in A4 steht. Der Betreiber hat keinen privilegierten Zugang zu
Geräten, keine Fernwartung, keinen Update-Kanal für Code (ADR-0006), keine
Analytik.

Das ist die Aussage, die die Architektur überhaupt tragen soll: Der Betreiber
kann seinen Nutzern nicht schaden, weil er nichts hat.

### A9 — Jemand, der Einzelne im Forschungsbeitrag wiedererkennen will

Empfänger der Aggregate, ein Angreifer mit deren Datenbank, oder ein Dritter,
der veröffentlichte Auswertungen mit anderen Quellen verschneidet.

**Der gefährlichste Angreifer dieser Liste**, weil Sexualgesundheitsdaten
außergewöhnlich re-identifizierbar sind. Altersband, Region, Anatomie und ein
Befund genügen in einer mittleren Stadt häufig zur Eindeutigkeit.

| Maßnahme | Stand |
|---|---|
| Nur Aggregate, nie Einzeldatensätze | **offen** — ADR-0013, vorgeschlagen |
| Vergröberung vor der Aggregation: Monat statt Datum, Kreis statt PLZ, Altersband statt Alter | **offen** |
| Rauschen **auf dem Gerät**, nicht beim Empfänger | **offen** — verlagert die Zusicherung vom Wohlverhalten auf eine Eigenschaft |
| Schwellwert, bevor eine Zelle veröffentlicht wird | **offen** |
| Getrennter, nicht mit dem Benachrichtigungs-Token verknüpfbarer Kanal | **offen** |
| Budgetverwaltung über wiederholte Beiträge | **offen** — ohne sie verfällt die Zusicherung mit der Zeit |

Erfährt bei korrekter Umsetzung: nichts über Einzelne. Genau deshalb verwirft
ADR-0013 den ursprünglichen Vorschlag „pseudonymisierte Daten“ ausdrücklich —
pseudonymisiert bleibt personenbezogen, und bei diesen Daten faktisch
identifizierend.

Bis ADR-0013 umgesetzt ist gilt: **Es gibt keinen Forschungsbeitrag.** Das ist
der sichere Zustand, und er ist ein zulässiger Endzustand.

### A10 — Jemand mit einem gefundenen Abrufcode

Zettel verloren, aus dem Papierkorb gefischt, über die Schulter gelesen.

Erfährt ohne zweiten Faktor: den vollständigen Befund. Ein Abrufcode ist ein
Inhaberausweis — wer ihn hat, bekommt das Ergebnis.

| Maßnahme | Stand |
|---|---|
| Zweiter Faktor: am Tresen gewählte PIN oder Geburtsdatum | **offen** — ADR-0012 |
| Begrenzte Gültigkeit des Codes | **offen** |
| Nach dem Abruf liegt der Befund in der App, nicht mehr auf dem Server | **offen** |

Die Verantwortung fällt hier teilweise an die Teststelle. Das gehört in eine
Referenzimplementierung, nicht in eine Empfehlung — sonst setzt es niemand um.

## Was ausdrücklich nicht abgedeckt ist

- **Kompromittiertes Betriebssystem.** Ein Gerät mit Schadsoftware auf
  Systemebene ist nicht zu verteidigen. Keine App kann das.
- **Zwang.** Wer gezwungen wird, die App zu entsperren, ist nicht durch Technik
  zu schützen. Der Tarnmodus hilft gegen den beiläufigen Blick, nicht gegen
  gezielte Nötigung.
- **Forensik am beschlagnahmten, entsperrten Gerät.** Ein Ziel außerhalb
  dessen, was dieses Projekt leisten kann.

Diese Grenzen gehören benannt. Ein Threat Model, das Vollständigkeit
suggeriert, wird im Ernstfall als Zusicherung gelesen.
