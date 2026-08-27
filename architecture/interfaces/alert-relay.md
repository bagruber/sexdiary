# Schnittstelle: Alert-Relay

**Status:** Entwurf · 27.08.2026 · setzt [ADR-0008](../adr/0008-anonyme-benachrichtigung.md) um

Der einzige Dienst des Betreibers, der Daten entgegennimmt.

## Gestaltungsregeln

Diese Regeln stehen ueber jeder spaeteren Funktionsanforderung:

1. **Kein Absender.** Der Dienst erfaehrt nie, wer gesendet hat. Auch nicht
   pseudonym, auch nicht zur Missbrauchsabwehr.
2. **Kein Inhalt.** Eine Benachrichtigung ist ein Erreger-Label, kein Text.
3. **Keine Konten.** Ein Token ist der einzige Bezeichner.
4. **Keine IP-Vorhaltung** ueber den Transport hinaus. Keine Zugriffsprotokolle
   mit Personenbezug.
5. **Keine ausgehenden Verbindungen.** Der Dienst ruft nichts auf.
6. **Loeschen von Anfang an**, nicht nachgeruestet.

## Vorgaenge

| Vorgang | Wirkung | Antwort |
|---|---|---|
| Benachrichtigung senden | speichert `{Empfaenger-Token, Label, Zeit}` | Quittung ohne Inhalt |
| Eigene Benachrichtigungen abrufen | liefert Eintraege zum angefragten Token | Liste aus Label und Zeit |
| Eigenes Token loeschen | entfernt alle Eintraege zu diesem Token | Bestaetigung |

Mehr Vorgaenge gibt es nicht. Jeder Vorschlag fuer einen weiteren muss zuerst
begruenden, warum er nicht auf dem Geraet stattfinden kann.

## Was der Dienst nicht kann, und warum das Absicht ist

- **Kein Zustellungsnachweis.** Waere nur mit einem Rueckkanal zum Absender
  moeglich — und damit mit einer Absenderkennung.
- **Keine Antwort des Empfaengers.** Dasselbe Argument. Das Gespraech gehoert
  ohnehin nicht in diesen Kanal.
- **Kein Widerruf einer gesendeten Benachrichtigung.** Ohne Absenderbezug nicht
  zuordenbar.

Diese drei Luecken sind der Preis fuer Regel 1. Er ist bewusst bezahlt.

## Missbrauch

Ohne Absenderkennung ist gezielte Missbrauchsabwehr begrenzt. Die tragende
Abschwaechung ist strukturell: Token werden **bewusst ausgetauscht**, nicht
erraten. Wer kein Token hat, kann niemanden erreichen.

Ergaenzend denkbar, ohne Regel 1 zu verletzen: Ratenbegrenzung je Ziel-Token,
automatischer Verfall alter Eintraege, Laengenbegrenzung des Labels auf eine
feste Liste bekannter Erreger.

Nicht denkbar: Sperrung von Absendern. Das setzte voraus, sie zu kennen.

## Betrieb

Ein Prozess, eine Datei-Datenbank, keine ausgehenden Verbindungen. Die
Auslieferung an eine Kommune ist nicht die laufende Instanz, sondern das
Deployment-Artefakt: Container-Definition, Compose-Datei, Betriebshandbuch,
Sicherungs- und Wiederherstellungsprozedur.

Je langweiliger der Dienst, desto guenstiger seine Sicherheitspruefung. Das ist
hier kein Sparzwang, sondern das Entwurfsziel.

## Offen

1. Aufbewahrungsdauer und Verfallslogik.
2. Ob das Label auf eine feste Liste beschraenkt wird — spricht viel dafuer.
3. Ob der Abruf gebuendelt oder je Token erfolgt, und was das ueber
   Nutzungsmuster verraet.
4. Transportabsicherung ueber TLS hinaus bei kommunalem Betrieb.
