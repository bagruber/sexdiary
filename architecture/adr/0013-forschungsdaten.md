# ADR-0013 — Beitrag zu Forschungsdaten, nur aggregiert

**Status:** vorgeschlagen · 27.08.2026

## Kontext

Ein Gesundheitsamt hätte an epidemiologischen Signalen aus dieser App echtes
Interesse, und Nutzer hätten teils die Bereitschaft, dazu beizutragen. Die
Roadmap führt das seit Juli als Idee mit dem Vermerk „sehr sensibel“.

Die Anfrage lautete „opt-in für pseudonymisierte Forschungsdaten“. Dieser
Formulierung ist zu widersprechen, und zwar aus einem Grund, der die ganze
Entscheidung trägt:

**Pseudonymisiert ist nicht anonym.** Nach Art. 4 Nr. 5 DSGVO bleiben
pseudonymisierte Daten personenbezogen. Art. 9 gilt vollständig weiter —
Folgenabschätzung, Verzeichnis, Löschkonzept, Betroffenenrechte, alles.

Erschwerend: Sexualgesundheitsdaten sind außergewöhnlich
re-identifizierbar. Ein Datensatz aus Altersband, Region, Anatomie,
Begegnungsdaten und Befund ist in einer mittleren Stadt häufig eindeutig. Der
Datensatz wäre pseudonym auf dem Papier und identifizierend in der Praxis.

Würde die App pseudonymisierte Einzeldatensätze hochladen, wäre das Ende von
ADR-0003 — und damit des einzigen Arguments, mit dem dieses Produkt bei einer
Datenschutzprüfung besteht.

## Entscheidung

Ein Forschungsbeitrag ist möglich, aber **nur als Aggregat, nie als
Einzeldatensatz.**

1. **Aggregation auf dem Gerät.** Die App berechnet lokal Kennzahlen und
   überträgt nur diese. Rohdaten verlassen das Gerät nie.
2. **Vergröberung vor der Aggregation.** Kein Datum, sondern Monat. Keine
   Postleitzahl, sondern Kreis oder gröber. Kein Alter, sondern Altersband.
3. **Lokale Differential Privacy.** Kalibriertes Rauschen wird **auf dem
   Gerät** addiert, bevor etwas gesendet wird. Damit kann auch der Empfänger
   den Beitrag eines Einzelnen nicht rekonstruieren — die Zusicherung hängt
   nicht am Wohlverhalten des Betreibers.
4. **Schwellwert beim Empfänger.** Eine Zelle wird erst veröffentlicht, wenn
   genügend Beiträge eingegangen sind.
5. **Getrennter, nicht verknüpfbarer Kanal.** Nicht das Benachrichtigungs-Token,
   nicht derselbe Zeitpunkt, nicht dieselbe Sitzung wie ein Alert-Versand.
6. **Einwilligung, die diesen Namen verdient.** Granular, jederzeit widerrufbar,
   und **mit einer Vorschau der tatsächlich zu sendenden Werte** vor jedem
   Versand. Die App hat dafür bereits das Muster des Datenbildschirms.
7. **Abschaltbar je Installation.** Der Beitrag ist so gebaut, dass eine
   Einführung ihn vollständig deaktiviert ausliefern kann.

Halten diese sieben Punkte, ist das Ergebnis **echt anonym** — damit außerhalb
des Anwendungsbereichs der DSGVO, und ADR-0003 bleibt unangetastet.

**Zusätzliche Empfehlung: nicht bauen, bevor es einen Forschungspartner mit
Ethikvotum gibt.** Ein Export, der ohne Forschungsfrage entworfen wird, ist der
falsche Export — man aggregiert dann über Dimensionen, die niemand braucht,
und vergröbert die, auf die es angekommen wäre. Die Spezifikation entsteht
jetzt trotzdem, weil sie das Datenmodell einschränkt: Vergröberung muss
möglich sein, und das entscheidet sich beim Entwurf, nicht danach.

## Konsequenzen

**Positiv**

- Ein echter Nutzen für den öffentlichen Gesundheitsdienst, ohne die
  Vertrauensarchitektur aufzugeben.
- Im Gespräch ein starkes Signal: Wir haben die naheliegende Lösung geprüfte
  und verworfen, weil sie nicht trägt.
- Lokale Differential Privacy verlagert die Zusicherung von einem Versprechen
  auf eine Eigenschaft.

**Negativ**

- **Deutlich weniger Aussagekraft** als Einzeldatensätze. Verrauschte
  Aggregate beantworten grobe Fragen, keine feinen. Das ist der Preis, und er
  ist zu benennen, nicht zu beschönigen.
- Erheblicher Aufwand: Rauschkalibrierung, Budgetverwaltung über die Zeit,
  Schwellwertlogik.
- Ein Datenschutzbeauftragter wird die Anonymitätsbehauptung prüfen wollen.
  Sie muss belegt sein, nicht behauptet.
- **Wiederholte Beiträge derselben Person** verbrauchen Privatsphärebudget.
  Ohne Budgetverwaltung über die Zeit ist die Zusicherung nach genügend
  Uebertragungen wertlos.

**Offen**

1. Welche Kennzahlen überhaupt — hängt an der Forschungsfrage.
2. Rauschparameter und Budgetverwaltung über die Lebensdauer einer Installation.
3. Schwellwert beim Empfänger.
4. Ob der Beitrag überhaupt in dieses Produkt gehört oder besser in eine
   getrennte, ausdrücklich als Studienteilnahme gestaltete Funktion.

## Verworfene Alternativen

**Pseudonymisierte Einzeldatensätze.** Die ursprüngliche Anfrage. Verworfen:
weiterhin personenbezogen, bei diesen Daten praktisch re-identifizierbar,
beendet ADR-0003.

**Anonymisierte Einzeldatensätze.** Klingt sicherer, ist es bei
Sexualgesundheitsdaten kaum. Eine Kombination aus wenigen Merkmalen genügt zur
Re-Identifikation; echte Anonymisierung auf Einzelsatzebene würde so stark
vergröbern, dass nichts Auswertbares bleibt. Dann kann man gleich aggregieren.

**Zentrale Differential Privacy** (Rohwerte hochladen, Rauschen beim
Empfänger). Statistisch besser, aber die Zusicherung hängt daran, dass der
Empfänger sich korrekt verhält und nicht kompromittiert wird. Lokale DP
braucht dieses Vertrauen nicht.

**Gar nichts anbieten.** Die sichere Wahl und lange die richtige. Sie verschenkt
aber einen Beitrag, den Nutzer teils leisten wollen, und ein Argument, das im
Gespräch mit einem Gesundheitsamt zählt.
