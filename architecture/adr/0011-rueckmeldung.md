# ADR-0011 — Rückmeldung des Benachrichtigten

**Status:** vorgeschlagen · 27.08.2026 · erweitert [ADR-0008](0008-anonyme-benachrichtigung.md)

## Kontext

ADR-0008 hat „keine Antwort des Empfängers“ als bewusste Lücke geführt, mit
der Begründung, ein Rückkanal setze eine Absenderkennung voraus.

Die Lücke ist praktisch teuer. Wer eine Benachrichtigung sendet, weiß nicht,
ob sie angekommen ist — bei einem Befund, der eine Behandlung auslöst, ist das
die naheliegendste Frage. Und der Empfänger hat keinen Weg zu signalisieren,
dass er gehandelt hat, außer über einen anderen Kanal, den es vielleicht nicht
gibt.

Die ursprüngliche Begründung war zu kurz gedacht: Ein Rückkanal braucht keine
Absender*identität*, nur eine Absender*adresse* — und die kann für jede
Benachrichtigung neu und zufällig sein.

## Entscheidung

Die Antwort ist eine Benachrichtigung in die Gegenrichtung. Kein neues Konzept
im Relay, nur ein zusätzliches Feld.

**Rückadresse.** Eine gesendete Benachrichtigung kann ein *Antwort-Token*
enthalten. Es wird **je Benachrichtigung frisch erzeugt**, ist mit nichts
anderem verknüpft und wird lokal beim Absender gegen den Kontakt gemerkt. Der
Absender ruft Antworten zu seinen offenen Antwort-Tokens ab wie eigene
Benachrichtigungen.

Das Mitsenden ist eine **bewusste Entscheidung des Absenders**, kein Standard.
Wer keine Antwort will oder keinen Rückkanal öffnen möchte, sendet ohne.

**Antwortvokabular — geschlossene Liste, nie Freitext.** Freitext würde
bedeuten, dass das Relay Inhalte trägt, und er wäre ein Belästigungskanal.
Vorschlag, in dieser Reihenfolge angeboten:

| Antwort | Bedeutung |
|---|---|
| gelesen | Nur Kenntnisnahme |
| kümmere mich | Absicht, ohne Zeitzusage |
| erledigt | Getestet, **ohne Befund** |
| negativ getestet | Befund geteilt — ausdrückliche, zusätzliche Wahl |

**Keine automatischen Zustell- oder Lesebestätigungen.** Jedes Signal ist eine
aktive Handlung des Empfängers. Das ist die wichtigste Regel dieser ADR: Wer
„du warst möglicherweise exponiert“ empfängt, muss die Option haben, *nicht*
zu antworten. Eine automatische Bestätigung nimmt sie ihm.

Aus demselben Grund steht „erledigt“ in der Liste **vor** „negativ getestet“.
Der Absender hat gerade einen positiven Befund offengelegt; die
Gegenseitigkeitserwartung ist real. Die Oberfläche darf nicht dorthin schubsen.

## Konsequenzen

**Positiv**

- Der Absender erfährt, dass etwas passiert ist — der häufigste Grund, warum
  Menschen den Kanal sonst verlassen und zum Telefon greifen.
- Kein neues Relay-Konzept. Dieselben drei Vorgänge, ein Feld mehr.
- Das Relay lernt weiterhin keine Identitäten.

**Negativ**

- **Korrelationsrisiko.** Das Relay sieht das Antwort-Token in derselben Zeile
  wie das Empfänger-Token. Wer beide Abrufe beobachtet, kann folgern, dass
  dasselbe Gerät die Benachrichtigung an diesen Empfänger gesendet hat. Das
  ist derselbe Rückstand, den das Threat Model unter A4 bereits benennt — er
  wird durch diese ADR größer, nicht neu.
- Zusätzlicher Zustand beim Absender: offene Antwort-Tokens müssen verwaltet
  und irgendwann verworfen werden.
- Das Antwortvokabular ist eine inhaltliche Festlegung, die schwer zu ändern
  ist, sobald Geräte mit unterschiedlichen App-Ständen im Umlauf sind.

**Abschwächung des Korrelationsrisikos**

Antwort-Tokens werden gebündelt mit dem eigenen Token abgerufen, nicht einzeln
und nicht unmittelbar nach dem Versand. Vollständig aufheben lässt sich der
Rückstand gegen ein böswilliges Relay nicht; er gehört benannt statt
wegdiskutiert.

## Verworfene Alternativen

**Feste Absenderkennung statt Token je Benachrichtigung.** Einfacher, aber sie
macht das Relay zu einem Verzeichnis von Beziehungen — genau das, was ADR-0008
verhindert.

**Zustellbestätigung durch das Relay.** Technisch trivial, ethisch falsch. Sie
verrät dem Absender, dass gelesen wurde, ohne dass der Empfänger zugestimmt
hat.

**Freitextantwort.** Würde Inhalte auf den Server bringen und einen
Belästigungskanal öffnen, den niemand moderieren kann.
