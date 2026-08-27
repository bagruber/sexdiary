# ADR-0003 — Keine Gesundheitsdaten auf dem Server

**Status:** angenommen · 10.07.2026

## Kontext

Sexuelle Aktivitaet und Gesundheitszustand fallen unter Art. 9 DSGVO,
besondere Kategorien personenbezogener Daten. Der Betrieb durch eine oeffentliche
Stelle verschaerft die Anforderungen zusaetzlich.

Jede serverseitige Speicherung solcher Daten erzeugt: eine
Datenschutz-Folgenabschaetzung, Verantwortlichkeitsregelungen, Loeschkonzepte,
Zugriffsprotokolle, eine wachsende Angriffsflaeche — und ein Vertrauensproblem
gegenueber genau der Zielgruppe, die Diskretion am dringendsten braucht.

## Entscheidung

Gesundheitsdaten werden **niemals** an einen Server uebertragen. Konkret nicht
uebertragen werden: Begegnungen, Praktiken, Kontakte, Testergebnisse, Impfungen,
Prophylaxen, Risikobewertungen, Profilangaben.

Der einzige Dienst, der ueberhaupt Daten entgegennimmt, ist das Alert-Relay, und
er speichert ausschliesslich Empfaenger-Token, Erreger-Label und Zeitstempel
(ADR-0008).

Fuer jeden neuen Endpunkt gilt die Pruefrage: **Koennte das auf dem Geraet
bleiben?** Wenn ja, bleibt es dort.

## Konsequenzen

**Positiv**

- Die serverseitige datenschutzrechtliche Flaeche ist minimal. Das ist das
  staerkste Argument fuer eine Genehmigungsfaehigkeit ueberhaupt.
- Ein vollstaendig kompromittierter Server gibt keine Gesundheitshistorien preis.
- Kein Konto, keine Anmeldung, keine Passwortwiederherstellung.

**Negativ**

- **Geraeteverlust bedeutet Datenverlust**, solange keine Sicherung existiert.
  Dieser Punkt ist der Preis der Entscheidung und der Grund fuer ADR-0009.
- Kein Geraetewechsel ohne bewusste Sicherung.
- Keine geraeteuebergreifende Nutzung.
- Keine Auswertung ueber Nutzer hinweg, auch keine gutgemeinte epidemiologische.

**Nicht verhandelbar**

Diese Entscheidung ist die Grundlage aller anderen. Sie fuer Bequemlichkeit
aufzuweichen — „nur die Testergebnisse synchronisieren“ — wuerde die Architektur
in ein anderes Produkt verwandeln und die datenschutzrechtliche Argumentation
zerstoeren.

## Verworfene Alternativen

**Verschluesselte Serversynchronisation mit nutzergehaltenem Schluessel.**
Technisch sauber, aber sie verlagert die Argumentation von „wir haben die Daten
nicht“ zu „wir koennen die Daten nicht lesen“. Der erste Satz ueberzeugt eine
Datenschutzpruefung, der zweite muss belegt werden.

**Konten mit serverseitiger Speicherung.** Bequem, aber unvereinbar mit dem
Vertrauensmodell und mit Art. 9.
