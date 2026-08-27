# Architekturentscheidungen

Format: [MADR](https://adr.github.io/madr/). Ein Dokument pro Entscheidung,
fortlaufend nummeriert, **unveraenderlich**. Eine revidierte Entscheidung
bekommt eine neue ADR, die die alte ausdruecklich abloest — die alte bleibt
stehen, damit nachvollziehbar ist, was wann warum galt.

Status: `vorgeschlagen` · `angenommen` · `abgeloest durch ADR-XXXX` · `verworfen`

| Nr | Entscheidung | Status | Datum |
|---|---|---|---|
| [0001](0001-native-only.md) | Native App als Produkt, Web nur informierend | angenommen | 27.08.2026 |
| [0002](0002-geteilter-kern.md) | Geteilte Gesundheitslogik in einem E/A-freien Paket | angenommen | 10.07.2026 |
| [0003](0003-local-first.md) | Keine Gesundheitsdaten auf dem Server | angenommen | 10.07.2026 |
| [0004](0004-react-native.md) | React Native statt zweier nativer Codebasen | angenommen | 10.07.2026 |
| [0005](0005-verschluesselung-at-rest.md) | Keystore-gehaltener Schluessel, AES-256-GCM | angenommen | 10.07.2026 |
| [0006](0006-keine-ota-updates.md) | Keine Over-the-Air-Updates | angenommen | 10.07.2026 |
| [0007](0007-signierte-testergebnisse.md) | Signierte Ergebnis-QRs | vorgeschlagen | 27.08.2026 |
| [0008](0008-anonyme-benachrichtigung.md) | Tokenbasierte Benachrichtigung ohne Konten | angenommen | 10.07.2026 |
| [0009](0009-backup-modell.md) | Sicherung in die Cloud des Nutzers, E2E-verschluesselt | vorgeschlagen | 27.08.2026 |
| [0010](0010-verteilung-erprobung.md) | Verteilung waehrend der Erprobung | vorgeschlagen | 27.08.2026 |

Die Entscheidungen von 10.07.2026 wurden damals getroffen, aber erst am
27.08.2026 in dieses Format ueberfuehrt. Kontext und Begruendung stammen aus
`notes/00-project-log.md` und `notes/04-mobile-app-plan.md`.
