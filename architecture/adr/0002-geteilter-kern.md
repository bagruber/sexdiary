# ADR-0002 — Geteilte Gesundheitslogik in einem E/A-freien Paket

**Status:** angenommen · 10.07.2026

## Kontext

Die Risikologik ist das vertrauenskritische Artefakt dieses Projekts. Sie
entscheidet, wann die App zu einem Test raet, und sie ist der Teil, den ein
Gesundheitsamt pruefen wird.

Im urspruenglichen Prototyp lag sie mitten im Web-Code: Die Startwerte lasen
`navigator`, die Speicherung sprach direkt `localStorage` an. Damit war sie
weder auf einer zweiten Plattform nutzbar noch isoliert testbar.

## Entscheidung

Die gesamte plattformfreie Logik liegt in `packages/core`: Domaenenmodell,
Erregerdaten, Risikoberechnung, Import- und Exportschemata, Speicherhuelle mit
Migrationen, Uebersetzungen, Zustandsuebergaenge.

Bindende Regeln fuer dieses Paket:

- **Keine Ein-/Ausgabe.** Kein Dateisystem, kein Netzwerk, kein DOM, keine
  Plattform-Programmierschnittstellen. Die Schale reicht Bytes hinein und heraus.
- **Keine Laufzeit-Abhaengigkeiten.** Ein Pruefer soll die Zahlen lesen koennen,
  ohne einen Abhaengigkeitsbaum zu durchdringen.
- **Unit-getestet.** Derzeit 45 Tests.

## Konsequenzen

**Positiv**

- Ein Pruefteam liest ein Paket statt einer Anwendung.
- Eine einzige Implementierung der Gesundheitslogik. Kein Abgleich zwischen
  Plattformen, kein Auseinanderlaufen der Aussagen.
- Reine Funktionen sind ohne Testgeruest testbar.

**Negativ**

- Die Schalen muessen Byte-Speicher selbst bereitstellen. Etwas mehr
  Plattformcode.
- Die Grenze muss verteidigt werden. Eine Plattform-Abhaengigkeit rutscht leicht
  hinein. **Gegenmassnahme:** ein Test, der fehlschlaegt, sobald das Paket eine
  Laufzeit-Abhaengigkeit bekommt.

**Bekannte Luecke (Stand 27.08.2026)**

Das Paket wird ueber einen Bundler-Alias als Quelle eingebunden, nicht als
Paket mit Einstiegspunkt. Damit kann nichts ausserhalb des Monorepos es nutzen —
insbesondere nicht das Alert-Relay, das dieselben Schemata validieren muesste.
Zwei Wahrheiten ueber ein Payload-Format sind bei signierten Nutzlasten kein
Schoenheitsfehler mehr. Behebung in Welle 2.

## Verworfene Alternativen

**Logik pro Plattform duplizieren.** Zwei Implementierungen derselben
Gesundheitsaussagen, die auseinanderlaufen und beide geprueft werden muessen.

**Logik als Dienst auf dem Server.** Haette bedeutet, dass Expositionsdaten das
Geraet verlassen — unvereinbar mit ADR-0003.
