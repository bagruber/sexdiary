# ADR-0003 — Keine Gesundheitsdaten auf dem Server

**Status:** angenommen · 10.07.2026

## Kontext

Sexuelle Aktivität und Gesundheitszustand fallen unter Art. 9 DSGVO,
besondere Kategorien personenbezogener Daten. Der Betrieb durch eine öffentliche
Stelle verschärft die Anforderungen zusätzlich.

Jede serverseitige Speicherung solcher Daten erzeugt: eine
Datenschutz-Folgenabschätzung, Verantwortlichkeitsregelungen, Löschkonzepte,
Zugriffsprotokolle, eine wachsende Angriffsfläche — und ein Vertrauensproblem
gegenüber genau der Zielgruppe, die Diskretion am dringendsten braucht.

## Entscheidung

Gesundheitsdaten werden **niemals** an einen Server übertragen. Konkret nicht
übertragen werden: Begegnungen, Praktiken, Kontakte, Testergebnisse, Impfungen,
Prophylaxen, Risikobewertungen, Profilangaben.

Der einzige Dienst, der überhaupt Daten entgegennimmt, ist das Alert-Relay, und
er speichert ausschließlich Empfänger-Token, Erreger-Label und Zeitstempel
(ADR-0008).

Für jeden neuen Endpunkt gilt die Prüfrage: **Könnte das auf dem Gerät
bleiben?** Wenn ja, bleibt es dort.

## Konsequenzen

**Positiv**

- Die serverseitige datenschutzrechtliche Fläche ist minimal. Das ist das
  stärkste Argument für eine Genehmigungsfähigkeit überhaupt.
- Ein vollständig kompromittierter Server gibt keine Gesundheitshistorien preis.
- Kein Konto, keine Anmeldung, keine Passwortwiederherstellung.

**Negativ**

- **Geräteverlust bedeutet Datenverlust**, solange keine Sicherung existiert.
  Dieser Punkt ist der Preis der Entscheidung und der Grund für ADR-0009.
- Kein Gerätewechsel ohne bewusste Sicherung.
- Keine geräteübergreifende Nutzung.
- Keine Auswertung über Nutzer hinweg, auch keine gutgemeinte epidemiologische.

**Nicht verhandelbar**

Diese Entscheidung ist die Grundlage aller anderen. Sie für Bequemlichkeit
aufzuweichen — „nur die Testergebnisse synchronisieren“ — würde die Architektur
in ein anderes Produkt verwandeln und die datenschutzrechtliche Argumentation
zerstören.

## Verworfene Alternativen

**Verschlüsselte Serversynchronisation mit nutzergehaltenem Schlüssel.**
Technisch sauber, aber sie verlagert die Argumentation von „wir haben die Daten
nicht“ zu „wir können die Daten nicht lesen“. Der erste Satz überzeugt eine
Datenschutzprüfung, der zweite muss belegt werden.

**Konten mit serverseitiger Speicherung.** Bequem, aber unvereinbar mit dem
Vertrauensmodell und mit Art. 9.
