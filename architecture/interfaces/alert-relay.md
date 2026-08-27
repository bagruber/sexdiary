# Schnittstelle: Alert-Relay

**Status:** Entwurf · 27.08.2026 · setzt [ADR-0008](../adr/0008-anonyme-benachrichtigung.md) um

Der einzige Dienst des Betreibers, der Daten entgegennimmt.

## Gestaltungsregeln

Diese Regeln stehen über jeder späteren Funktionsanforderung:

1. **Kein Absender.** Der Dienst erfährt nie, wer gesendet hat. Auch nicht
   pseudonym, auch nicht zur Missbrauchsabwehr.
2. **Kein Inhalt.** Eine Benachrichtigung ist ein Erreger-Label, kein Text.
3. **Keine Konten.** Ein Token ist der einzige Bezeichner.
4. **Keine IP-Vorhaltung** über den Transport hinaus. Keine Zugriffsprotokolle
   mit Personenbezug.
5. **Keine ausgehenden Verbindungen.** Der Dienst ruft nichts auf.
6. **Löschen von Anfang an**, nicht nachgerüstet.

## Vorgänge

| Vorgang | Wirkung | Antwort |
|---|---|---|
| Benachrichtigung senden | speichert `{Empfänger-Token, Label, Zeit, optional Antwort-Token}` | Quittung ohne Inhalt |
| Eigene Benachrichtigungen abrufen | liefert Einträge zum angefragten Token | Liste aus Label und Zeit |
| Eigenes Token löschen | entfernt alle Einträge zu diesem Token | Bestätigung |

Mehr Vorgänge gibt es nicht. Eine Rückmeldung ist **kein neuer Vorgang**,
sondern eine Benachrichtigung an das Antwort-Token — derselbe Sendevorgang in
die Gegenrichtung. Jeder Vorschlag für einen echten weiteren Vorgang muss zuerst
begründen, warum er nicht auf dem Gerät stattfinden kann.

## Rückmeldung ([ADR-0011](../adr/0011-rueckmeldung.md))

Eine gesendete Benachrichtigung kann ein **Antwort-Token** enthalten. Es wird je
Benachrichtigung frisch erzeugt, ist mit nichts anderem verknüpft und wird lokal
beim Absender gegen den Kontakt gemerkt. Der Absender ruft Antworten dazu ab wie
eigene Benachrichtigungen.

Das Mitsenden ist eine bewusste Entscheidung des Absenders, kein Standardwert.

**Antwortvokabular — geschlossene Liste, in dieser Reihenfolge angeboten:**

| Antwort | Bedeutung |
|---|---|
| gelesen | Nur Kenntnisnahme |
| kümmere mich | Absicht, ohne Zeitzusage |
| erledigt | Getestet, **ohne Befund** |
| negativ getestet | Befund geteilt — ausdrückliche, zusätzliche Wahl |

Zwei Regeln, die nicht verhandelbar sind:

**Keine automatischen Zustell- oder Lesebestätigungen.** Jedes Signal ist eine
aktive Handlung. Wer „du warst möglicherweise exponiert“ empfängt, muss die
Option haben, *nicht* zu antworten.

**„erledigt“ steht vor „negativ getestet“.** Der Absender hat gerade einen
positiven Befund offengelegt; die Gegenseitigkeitserwartung ist real. Die
Oberfläche darf nicht dorthin schubsen.

Freitext ist ausgeschlossen — er brächte Inhalte auf den Server und wäre ein
Belästigungskanal, den niemand moderieren kann.

**Rückstand:** Das Relay sieht Antwort-Token und Empfänger-Token in derselben
Zeile. Wer beide Abrufe beobachtet, kann folgern, dass dasselbe Gerät gesendet
hat. Abschwächung: gebündelter Abruf, nicht unmittelbar nach dem Versand.
Vollständig aufheben lässt es sich nicht — siehe Threat Model, A4.

## Was der Dienst nicht kann, und warum das Absicht ist

- **Kein Zustellungsnachweis.** Wäre nur mit einem Rückkanal zum Absender
  möglich — und damit mit einer Absenderkennung.
- ~~**Keine Antwort des Empfängers.**~~ Aufgehoben durch ADR-0011: Ein
  Rückkanal braucht keine Absenderidentität, nur eine Absenderadresse, und die
  kann je Benachrichtigung frisch sein.
- **Kein Widerruf einer gesendeten Benachrichtigung.** Ohne Absenderbezug nicht
  zuordenbar.

Diese drei Lücken sind der Preis für Regel 1. Er ist bewusst bezahlt.

## Missbrauch

Ohne Absenderkennung ist gezielte Missbrauchsabwehr begrenzt. Die tragende
Abschwächung ist strukturell: Token werden **bewusst ausgetauscht**, nicht
erraten. Wer kein Token hat, kann niemanden erreichen.

Ergänzend denkbar, ohne Regel 1 zu verletzen: Ratenbegrenzung je Ziel-Token,
automatischer Verfall alter Einträge, Längenbegrenzung des Labels auf eine
feste Liste bekannter Erreger.

Nicht denkbar: Sperrung von Absendern. Das setzte voraus, sie zu kennen.

## Betrieb

Ein Prozess, eine Datei-Datenbank, keine ausgehenden Verbindungen. Die
Auslieferung an eine Kommune ist nicht die laufende Instanz, sondern das
Deployment-Artefakt: Container-Definition, Compose-Datei, Betriebshandbuch,
Sicherungs- und Wiederherstellungsprozedur.

Je langweiliger der Dienst, desto günstiger seine Sicherheitsprüfung. Das ist
hier kein Sparzwang, sondern das Entwurfsziel.

## Offen

1. Aufbewahrungsdauer und Verfallslogik.
2. Ob das Label auf eine feste Liste beschränkt wird — spricht viel dafür.
3. Ob der Abruf gebündelt oder je Token erfolgt, und was das über
   Nutzungsmuster verrät.
4. Transportabsicherung über TLS hinaus bei kommunalem Betrieb.
