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

**Entschieden am 09.09.2026: beschriftete Demo, ohne Speicher**

Die ursprüngliche Empfehlung war Rente. Dagegen stand ein praktischer Einwand:
wem die App vorgeführt wird, der installiert nicht im selben Moment ein APK.
Ohne etwas Vorzeigbares im Browser hängt jedes Gespräch daran, dass ein Gerät
zur Hand ist.

Der Web-Tracker bleibt deshalb als Demo. Was ihn von einem zweiten Produkt
unterscheidet, ist nicht die Beschriftung, sondern dass er **nichts speichert**:
der Zustand lebt im Speicher des Tabs, ein Neuladen beginnt von vorn mit
Beispieldaten. Das ist die eigentliche Schutzmaßnahme. Ein Hinweisbanner, das
man wegklicken kann, ist ein Banner, das weggeklickt wird; eine Anwendung, in
der sich nichts ansammeln *kann*, braucht kein Vertrauen.

Die vier Verteidigungen, um die herum das Produkt gebaut ist — App-Sperre,
Tarnmodus, Erinnerungen, Bildschirmsperre — stehen in der Demo sichtbar, aber
als nicht verfügbar markiert. Sie zu verstecken hiesse zu verschweigen, wofür
die App da ist; sie nachzuahmen wäre genau der kosmetische Fehler, an dem die
PWA-Variante unten scheitert.

Der Preis bleibt: eine zweite Oberfläche, die gepflegt werden will, und die
Gefahr, dass jemand sie für das Produkt hält. Der fehlende Speicher begrenzt
den Schaden auf ein Missverständnis statt auf Gesundheitsdaten im Browser.

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
