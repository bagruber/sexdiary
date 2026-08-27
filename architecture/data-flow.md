# Datenfluesse und Verarbeitungsuebersicht

Vorarbeit fuer das Verzeichnis von Verarbeitungstaetigkeiten nach Art. 30 DSGVO
und fuer die Datenschutz-Folgenabschaetzung nach Art. 35.

**Kein Rechtsrat.** Das Dokument beschreibt, was technisch geschieht, damit ein
Datenschutzbeauftragter darauf aufsetzen kann.

## Ausgangslage

Alle fachlichen Daten fallen unter **Art. 9 Abs. 1 DSGVO** — Gesundheitsdaten
und Daten zum Sexualleben. Die Architektur zielt darauf, die Verarbeitung durch
den Betreiber so weit zu reduzieren, dass sie in einer Tabelle Platz findet.

## Wo Daten liegen

```mermaid
graph LR
    subgraph G["Geraet — Verantwortung des Nutzers"]
        D1["Begegnungen<br/>Kontakte<br/>Tests<br/>Impfungen<br/>Profil"]
    end

    subgraph B["Betreiber"]
        D2["Empfaenger-Token<br/>Erreger-Label<br/>Zeitstempel"]
        D3["Infoseite<br/><i>keine Personenbezuege</i>"]
    end

    subgraph C["Cloud des Nutzers — Dritter"]
        D4["verschluesselte Sicherung<br/><i>fuer den Anbieter undurchdringlich</i>"]
    end

    D1 -->|"nur bei Versand,<br/>nur Token + Label"| D2
    D1 -.->|"opt-in"| D4

    style D1 fill:#1B7276,color:#fff
    style D2 fill:#B0414D,color:#fff
    style D3 fill:#F5F3EF
    style D4 fill:#F5F3EF
```

Der rote Kasten ist die **gesamte** Verarbeitung durch den Betreiber.

## Verarbeitungstaetigkeiten

### V1 — Fuehren des persoenlichen Protokolls

| | |
|---|---|
| Zweck | Der Nutzer protokolliert seine eigenen Daten und laesst sich Testzeitpunkte ableiten |
| Kategorien | Begegnungen, Praktiken, Kontaktbezeichnungen, Testergebnisse, Impfungen, Prophylaxen, Alter, anatomische Angabe |
| Betroffene | Der Nutzer; mittelbar seine Kontakte, soweit er sie benennt |
| Empfaenger | keine |
| Uebermittlung an Drittlaender | keine |
| Speicherdauer | bis der Nutzer loescht |
| Technische Massnahmen | AES-256-GCM, Schluessel im Keystore, App-Lock, Systembackup aus |
| **Verarbeitet der Betreiber?** | **Nein.** Die Verarbeitung findet ausschliesslich auf dem Geraet statt |

Die letzte Zeile ist die zentrale Aussage. Ob damit ueberhaupt eine
Verarbeitung im Sinne der Verordnung durch den Betreiber vorliegt, ist die
Frage, die fachlich zu klaeren ist — die technische Antwort lautet: Der
Betreiber hat zu keinem Zeitpunkt Zugriff.

### V2 — Partner-Benachrichtigung

| | |
|---|---|
| Zweck | Einen frueheren Kontakt anonym auf einen sinnvollen Test hinweisen |
| Kategorien | Empfaenger-Token (Pseudonym), Erreger-Label, Zeitstempel |
| Betroffene | Der Empfaenger |
| **Nicht** verarbeitet | Absenderidentitaet, Klarnamen, Kontaktdaten, Nachrichtentext, IP ueber den Transport hinaus |
| Rechtsgrundlage | Einwilligung; der Versand erfolgt auf ausdrueckliche Handlung nach einem Bildschirm, der den Inhalt zeigt |
| Speicherdauer | kurz, mit automatischem Verfall — **Dauer noch festzulegen** |
| Loeschung | `DELETE` auf das eigene Token, ausgeloest durch „Alles loeschen“ in der App (Art. 17) |
| Technische Massnahmen | Transportverschluesselung, keine Zugriffsprotokolle mit Personenbezug, ein Dienst ohne ausgehende Verbindungen |

### V3 — Betrieb der Infoseite

| | |
|---|---|
| Zweck | Erklaerung, Impressum, Datenschutzerklaerung, Teststellenverzeichnis |
| Kategorien | keine ueber die technisch notwendigen Server-Logs hinaus |
| Besonderheit | **Keine Requests an Dritte.** Keine externen Schriften, keine Einbettungen, keine Analytik, kein Consent-Banner noetig |
| Speicherdauer | Server-Logs kurz, IP gekuerzt oder gar nicht |

### V4 — Sicherung in die Cloud des Nutzers

| | |
|---|---|
| Status | vorgeschlagen, ADR-0009 |
| Zweck | Wiederherstellung nach Geraeteverlust |
| Kategorien | wie V1, jedoch ausschliesslich als Chiffrat |
| Empfaenger | Der Cloud-Anbieter des Nutzers — **nicht der Betreiber** |
| Rechtsbeziehung | zwischen Nutzer und seinem Cloud-Anbieter. Der Betreiber ist nicht beteiligt |
| Technische Massnahmen | Verschluesselung mit nutzerabgeleitetem Schluessel vor dem Upload |

## Betroffenenrechte

| Recht | Umsetzung |
|---|---|
| Auskunft (Art. 15) | Der Nutzer hat die Daten selbst; die App zeigt zusaetzlich alle Rohdatensaetze in lesbarer Form |
| Berichtigung (Art. 16) | Jeder Datensatz ist in der App bearbeitbar |
| Loeschung (Art. 17) | „Alles loeschen“ in der App, plus `DELETE` auf das eigene Token beim Relay |
| Datenuebertragbarkeit (Art. 20) | Export als Datei in einem dokumentierten Format |
| Widerspruch (Art. 21) | Es findet keine Verarbeitung statt, der widersprochen werden koennte, ausser V2 — und die erfolgt nur auf ausdrueckliche Handlung |

Die Auskunft ist hier ungewoehnlich einfach, weil der Betroffene die Daten
ohnehin besitzt. Das ist ein Nebeneffekt der Architektur, den man im Gespraech
benennen sollte.

## Offene Punkte fuer die fachliche Pruefung

1. Ob V1 ueberhaupt eine Verarbeitung durch den Betreiber darstellt.
2. Aufbewahrungsdauer in V2.
3. Ob die Nennung eines Kontakts durch den Nutzer eine Verarbeitung
   personenbezogener Daten Dritter darstellt und was daraus folgt.
4. Notwendigkeit und Umfang der Folgenabschaetzung — vermutlich ab dem Moment
   verpflichtend, in dem das Relay oeffentlich betrieben wird.
5. Rolle des Cloud-Anbieters in V4.
