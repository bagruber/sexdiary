# ADR-0002 — Geteilte Gesundheitslogik in einem E/A-freien Paket

**Status:** angenommen · 10.07.2026

## Kontext

Die Risikologik ist das vertrauenskritische Artefakt dieses Projekts. Sie
entscheidet, wann die App zu einem Test rät, und sie ist der Teil, den ein
Gesundheitsamt prüfen wird.

Im ursprünglichen Prototyp lag sie mitten im Web-Code: Die Startwerte lasen
`navigator`, die Speicherung sprach direkt `localStorage` an. Damit war sie
weder auf einer zweiten Plattform nutzbar noch isoliert testbar.

## Entscheidung

Die gesamte plattformfreie Logik liegt in `packages/core`: Domänenmodell,
Erregerdaten, Risikoberechnung, Import- und Exportschemata, Speicherhülle mit
Migrationen, Uebersetzungen, Zustandsübergänge.

Bindende Regeln für dieses Paket:

- **Keine Ein-/Ausgabe.** Kein Dateisystem, kein Netzwerk, kein DOM, keine
  Plattform-Programmierschnittstellen. Die Schale reicht Bytes hinein und heraus.
- **Keine Laufzeit-Abhängigkeiten.** Ein Prüfer soll die Zahlen lesen können,
  ohne einen Abhängigkeitsbaum zu durchdringen.
- **Unit-getestet.** Derzeit 45 Tests.

## Konsequenzen

**Positiv**

- Ein Prüfteam liest ein Paket statt einer Anwendung.
- Eine einzige Implementierung der Gesundheitslogik. Kein Abgleich zwischen
  Plattformen, kein Auseinanderlaufen der Aussagen.
- Reine Funktionen sind ohne Testgerüst testbar.

**Negativ**

- Die Schalen müssen Byte-Speicher selbst bereitstellen. Etwas mehr
  Plattformcode.
- Die Grenze muss verteidigt werden. Eine Plattform-Abhängigkeit rutscht leicht
  hinein. **Gegenmaßnahme:** ein Test, der fehlschlägt, sobald das Paket eine
  Laufzeit-Abhängigkeit bekommt.

**Bekannte Lücke (Stand 27.08.2026)**

Das Paket wird über einen Bundler-Alias als Quelle eingebunden, nicht als
Paket mit Einstiegspunkt. Damit kann nichts außerhalb des Monorepos es nutzen —
insbesondere nicht das Alert-Relay, das dieselben Schemata validieren müsste.
Zwei Wahrheiten über ein Payload-Format sind bei signierten Nutzlasten kein
Schönheitsfehler mehr. Behebung in Welle 2.

## Verworfene Alternativen

**Logik pro Plattform duplizieren.** Zwei Implementierungen derselben
Gesundheitsaussagen, die auseinanderlaufen und beide geprüft werden müssen.

**Logik als Dienst auf dem Server.** Hätte bedeutet, dass Expositionsdaten das
Gerät verlassen — unvereinbar mit ADR-0003.
