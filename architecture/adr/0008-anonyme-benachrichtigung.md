# ADR-0008 — Tokenbasierte Benachrichtigung ohne Konten

**Status:** angenommen · 10.07.2026 · erweitert durch [ADR-0011](0011-rueckmeldung.md)

## Kontext

Nach einem positiven Befund sollen frühere Kontakte erfahren, dass ein Test
sinnvoll wäre. Das ist der eine Vorgang, bei dem Information zwischen zwei
Menschen fließen muss — und damit die einzige Stelle, an der überhaupt ein
Server nötig ist.

Gesundheitsämter machen Kontaktnachverfolgung heute per Telefon. Die App soll
das ergänzen, nicht ersetzen, und sie soll den Weg für die Fälle öffnen, in
denen ein Anruf nicht stattfindet.

## Entscheidung

Benachrichtigung über zufällige Token statt über Identitäten.

- Jeder Nutzer hält ein selbst erzeugtes, nicht zurückrechenbares Token.
- Kontakte tauschen Token aus, wenn sie das wollen — per QR oder Link.
- Eine Benachrichtigung besteht aus `{Empfänger-Token, Erreger-Label,
  Zeitstempel}`. **Kein Absender. Kein Nachrichtentext. Keine IP-Vorhaltung
  über den Transport hinaus.**
- Der Empfänger fragt Benachrichtigungen zu seinem eigenen Token ab.
- **`DELETE` ab dem ersten Tag**, nicht später nachgerüstet: „Alles löschen“
  in der App muss auch die serverseitigen Benachrichtigungen zum eigenen Token
  erfassen (Art. 17).
- Vor jedem Versand zeigt die App, was genau übertragen wird.

## Konsequenzen

**Positiv**

- Ein vollständig kompromittiertes Relay gibt Token, Labels und Zeitstempel
  preis — keine Identitäten, keine Historien, keine Verbindungsgraphen über
  das hinaus, was die Tokenpaare ohnehin zeigen.
- Keine Konten heißt keine Anmeldung, keine Passwortwiederherstellung, keine
  Kontoübernahme.
- Der Dienst ist klein genug, dass eine Sicherheitsprüfung günstig ist.

**Negativ**

- Ein verlorenes Token ist nicht wiederherstellbar.
- Kein Zustellungsnachweis. Der Absender erfährt nicht, ob jemand gelesen hat.
- Missbrauch — jemand sendet grundlos — ist nicht vollständig zu verhindern.
  Abschwächung: Token werden bewusst ausgetauscht, nicht erraten.

**Offen**

Aufbewahrungsdauer serverseitiger Benachrichtigungen. Vorschlag: kurz, mit
automatischem Verfall.

## Verworfene Alternativen

**Benachrichtigung per E-Mail oder Telefonnummer.** Wäre personenbezogen, damit
serverseitige Verarbeitung besonderer Kategorien — Widerspruch zu ADR-0003.

**Push mit Inhalt.** Ein Push-Payload mit Gesundheitsbezug läuft über die
Infrastruktur der Plattformanbieter. Falls Push nötig wird: inhaltsleerer
Weckruf, der einen Abruf auslöst.
