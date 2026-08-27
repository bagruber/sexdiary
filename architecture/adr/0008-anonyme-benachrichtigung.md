# ADR-0008 — Tokenbasierte Benachrichtigung ohne Konten

**Status:** angenommen · 10.07.2026

## Kontext

Nach einem positiven Befund sollen fruehere Kontakte erfahren, dass ein Test
sinnvoll waere. Das ist der eine Vorgang, bei dem Information zwischen zwei
Menschen fliessen muss — und damit die einzige Stelle, an der ueberhaupt ein
Server noetig ist.

Gesundheitsaemter machen Kontaktnachverfolgung heute per Telefon. Die App soll
das ergaenzen, nicht ersetzen, und sie soll den Weg fuer die Faelle oeffnen, in
denen ein Anruf nicht stattfindet.

## Entscheidung

Benachrichtigung ueber zufaellige Token statt ueber Identitaeten.

- Jeder Nutzer haelt ein selbst erzeugtes, nicht zurueckrechenbares Token.
- Kontakte tauschen Token aus, wenn sie das wollen — per QR oder Link.
- Eine Benachrichtigung besteht aus `{Empfaenger-Token, Erreger-Label,
  Zeitstempel}`. **Kein Absender. Kein Nachrichtentext. Keine IP-Vorhaltung
  ueber den Transport hinaus.**
- Der Empfaenger fragt Benachrichtigungen zu seinem eigenen Token ab.
- **`DELETE` ab dem ersten Tag**, nicht spaeter nachgeruestet: „Alles loeschen“
  in der App muss auch die serverseitigen Benachrichtigungen zum eigenen Token
  erfassen (Art. 17).
- Vor jedem Versand zeigt die App, was genau uebertragen wird.

## Konsequenzen

**Positiv**

- Ein vollstaendig kompromittiertes Relay gibt Token, Labels und Zeitstempel
  preis — keine Identitaeten, keine Historien, keine Verbindungsgraphen ueber
  das hinaus, was die Tokenpaare ohnehin zeigen.
- Keine Konten heisst keine Anmeldung, keine Passwortwiederherstellung, keine
  Kontouebernahme.
- Der Dienst ist klein genug, dass eine Sicherheitspruefung guenstig ist.

**Negativ**

- Ein verlorenes Token ist nicht wiederherstellbar.
- Kein Zustellungsnachweis. Der Absender erfaehrt nicht, ob jemand gelesen hat.
- Missbrauch — jemand sendet grundlos — ist nicht vollstaendig zu verhindern.
  Abschwaechung: Token werden bewusst ausgetauscht, nicht erraten.

**Offen**

Aufbewahrungsdauer serverseitiger Benachrichtigungen. Vorschlag: kurz, mit
automatischem Verfall.

## Verworfene Alternativen

**Benachrichtigung per E-Mail oder Telefonnummer.** Waere personenbezogen, damit
serverseitige Verarbeitung besonderer Kategorien — Widerspruch zu ADR-0003.

**Push mit Inhalt.** Ein Push-Payload mit Gesundheitsbezug laeuft ueber die
Infrastruktur der Plattformanbieter. Falls Push noetig wird: inhaltsleerer
Weckruf, der einen Abruf ausloest.
