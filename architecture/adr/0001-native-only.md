# ADR-0001 — Native App als Produkt, Web nur informierend

**Status:** angenommen · 27.08.2026

## Kontext

Bis hierher liefen zwei Anwendungen parallel: ein Web-Tracker (~4 700 LOC) und
eine native App (~2 150 LOC), beide auf demselben geteilten Kern. Sie sind
auseinandergelaufen — vier Funktionen existieren nur nativ, der Demo-Modus nur
nativ, die Paletten unterscheiden sich, dieselbe Risikostufe hat auf beiden
Plattformen eine andere Farbe.

Entscheidender als die Drift ist aber, was der Browser prinzipiell nicht kann.
Das realistische Bedrohungsmodell dieser App ist die Person, die daneben sitzt
oder das entsperrte Telefon in der Hand hält. Dagegen wirken Screenshot-Sperre,
verdeckte Vorschau in der App-Uebersicht, ein an den Keystore gebundener Lock,
ein alternatives Icon und lokale Erinnerungen. **Keine dieser Maßnahmen ist im
Browser umsetzbar.** Der Web-Tracker konnte das Kernversprechen des Produkts
nie einlösen.

## Entscheidung

Die native App ist das Produkt. Alle Gesundheitsdaten — Begegnungen, Kontakte,
Tests, Impfungen — existieren ausschließlich dort und werden nirgendwo sonst
gespeichert.

Der Browser bekommt eine **Informationsseite**: Erklärung der Funktionsweise,
Impressum, Datenschutzerklärung, Teststellenverzeichnis. Sie kennt keinen
Nutzer, verarbeitet keine Gesundheitsdaten und hat keine Verbindung zur App.

## Konsequenzen

**Positiv**

- Die Kernversprechen werden einlösbar statt simuliert.
- Nur noch eine Codebasis, die Gesundheitsdaten berührt — die Prüffläche
  schrumpft, und damit der Aufwand jeder Sicherheitsprüfung.
- Die Infoseite kann von Grund auf barrierefrei gebaut werden. Das ist erheblich
  billiger, als einen gewachsenen Tracker nachträglich zu sanieren.
- Die datenschutzrechtliche Aussage wird einfach genug, um sie in einem Satz zu
  sagen: Gesundheitsdaten verlassen das Gerät nicht.

**Negativ**

- Reichweite ohne Installation entfällt. Wer die App nur ausprobieren will,
  muss installieren.
- Die Arbeit am Web-Tracker ist abgeschrieben. Der geteilte Kern bleibt.
- iOS braucht Entwicklerkonto und Mac. Android geht vollständig lokal.
- Ohne Store-Präsenz ist Verteilung ein eigenes Thema (siehe ADR-0010).

**Offen**

Ob der Web-Tracker als beschriftete Demo bestehen bleibt oder in Rente geht.
Empfehlung: Rente. Ein anklickbarer Web-Klon einer nativen App suggeriert im
Pitch „wir haben eine Web-App gebaut und nennen sie nativ“, und er kostet
dauerhaft Pflege.

## Verworfene Alternativen

**Installierbare Web-App (PWA).** Naheliegend, weil sie unter Android fast wie
eine App wirkt. Scheitert an denselben Grenzen: kein Screenshot-Schutz, kein
Hardware-Keystore, keine verdeckte Vorschau, kein alternatives Icon. Unter iOS
zusätzlich schwach. Sie hätte die Diskretionsversprechen kosmetisch gemacht.

**Funktionsgleichheit beider Plattformen.** Der bisherige Zustand. Bedeutet
dauerhaft doppelte Pflege für eine Plattform, die das Kernversprechen nicht
einlösen kann.

**Nur Web.** Hätte die Diskretionsfunktionen vollständig gestrichen — also
genau das, was die App gegenüber einer Notiz-App auszeichnet.
