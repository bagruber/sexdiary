# Design-Tokens — Analyse und Vorschlag

**Status:** entschieden am 27.08.2026 durch [ADR-0015](adr/0015-farbtokens.md).
Dieses Dokument bleibt als Analyse stehen; verbindlich ist die ADR.

Anlass: ein Farb- und Schriftvorschlag mit Münchner Bezug. Dieses Dokument
prüft ihn und schlägt eine Fassung vor, die trägt. Kontrastwerte sind
gerechnet, nicht geschätzt.

## Die tragende Unterscheidung

Diese App hat **zwei Farbaufgaben, die sich nie berühren dürfen**:

| | Aufgabe | Regel |
|---|---|---|
| **Interaktion / Marke** | Identität, Buttons, Navigation | Eine Farbe plus Neutrale. Mehr nicht. |
| **Semantik** | Die Risikoskala — der eigentliche Inhalt | Eigene Skala. Taucht **nie** als Bedienelement auf. |

Der geprüfte Vorschlag verletzt das: Gelb (semantisch: Achtung) und Grün
(semantisch: unbedenklich) sollten zu Marken- und Aktionsfarben werden. Dann
sehen „erhöhtes Risiko“ und „hier tippen“ gleich aus — in einer App, in der
Farbe die Kernaussage trägt.

## Kontrastprüfung des Vorschlags

Schwellen: 4,5:1 für Text, 3:1 für Bedienelemente (WCAG 2.1 AA, via BITV 2.0).

| Farbe | Kombination | Ratio | Text | UI |
|---|---|---|---|---|
| `#F2B705` Münchner Gelb | auf Weiß | **1,82:1** | ✗ | ✗ |
| `#F2B705` | auf `#F5F3EF` | **1,64:1** | ✗ | ✗ |
| `#F2B705` | `#1A1A1A` darauf | 9,57:1 | ✓ | ✓ |
| `#FFCC00` | auf Weiß | **1,51:1** | ✗ | ✗ |
| `#FFCC00` | `#1A1A1A` darauf | 11,51:1 | ✓ | ✓ |
| `#2F70B1` Medical Blue | auf Weiß | 5,16:1 | ✓ | ✓ |
| `#2F70B1` | auf `#121212` | **3,63:1** | ✗ | ✓ |
| `#2F70B1` | auf `#1E2022` | **3,17:1** | ✗ | ✓ |
| `#009933` Safe Green | auf Weiß | **3,75:1** | ✗ | ✓ |
| `#009933` | auf `#121212` | 5,00:1 | ✓ | ✓ |
| `#E0E0E0` | auf `#121212` | 14,19:1 | ✓ | ✓ |
| `#1A1A1A` | auf `#F5F3EF` | 15,70:1 | ✓ | ✓ |
| `#1F1D2B` (heute in der App) | auf `#F5F3EF` | 14,93:1 | ✓ | ✓ |
| `#B7791F` (heute in der App) | auf Weiß | **3,64:1** | ✗ | ✓ |

Die letzte Zeile ist ein **vorbestehender Befund**: Die aktuelle Warnfarbe
fällt als Text ebenfalls durch. Unabhängig von dieser Entscheidung zu beheben.

## Vorschlag

### Interaktion

- **Aktionsfarbe bleibt `#1F1D2B`** hell / `#F1EFF7` dunkel. Mit 14,93:1 ist
  das das Stärkste in der bestehenden Palette, es kostet nichts, und es hält
  die gesamte Farbskala für Semantik frei.
- **Münchner Gelb `#F2B705` wird Markenfarbe, nicht CTA.** App-Icon, Splash,
  der eine Akzent auf der Infoseite. Immer als *Fläche* mit `#1A1A1A` darauf,
  nie als Vordergrundfarbe. `#F2B705` statt `#FFCC00`: etwas tiefer, etwas
  besser im Kontrast, und weniger nah am Warndreieck.
  - Vor einer Partnerschaft ist eine Stadtfarbe zurückhaltend einzusetzen —
    sie liest sich sonst als Behauptung einer Trägerschaft.

### Semantik

Eigene Skala, nie als Bedienelement. Die bestehenden Werte tragen und sind
geprüft; der Warnton braucht eine Korrektur:

| Rolle | hell | dunkel |
|---|---|---|
| unbedenklich | `#2E7D52` (5,03:1) | `#5BBB8A` |
| erhöht | **korrekturbedürftig**, `#B7791F` liegt bei 3,64:1 | `#D9A441` |
| hoch | `#C0392B` (5,44:1) | `#E06A5A` |

### Verworfen

- **Medical Blue.** Zwei Gründe. Er fällt im Dark Mode als Text durch (3,17
  bis 3,63:1) und bräuchte eine eigene Variante. Und inhaltlich ist es das
  generische Gesundheits-App-Blau — es zieht in Richtung „Medizinprodukt“,
  also genau das Signal, das die regulatorische Position vermeiden will.
  Falls eine Informationsfarbe gebraucht wird (Links, „mehr erfahren“): eine
  eigene, geprüfte, in beiden Themes.
- **Safe Green `#009933`.** Fällt auf Hell als Text durch (3,38 bis 3,75:1).
  Und das Wort trägt nicht: „sicher“ ist ein Zustand, den diese App nicht
  bescheinigen kann. Sie sagt „testbar“ und „nichts zu tun“.

### Dunkler Grund

`#121212` ist brauchbar, aber ein reines Neutral neben einem warmen Gelb wirkt
kühl und unverbunden. Der heutige Wert `#17151F` ist leicht violett getönt —
also *gewählt*, nicht geerbt. Empfehlung: bewusst entscheiden statt auf den
Material-Standardwert zu fallen.

`#E0E0E0` als Textfarbe auf Dunkel übernehmen — bewusst kein reines Weiß,
das reduziert das Nachleuchten.

## Schriften

| Vorschlag | Bewertung |
|---|---|
| **Inter + Roboto** | Abzuraten. Inter steht in der Arbeitsvereinbarung namentlich als LLM-Tell. Und es ist kein Pairing, sondern eine Dopplung — zwei Neo-Grotesken für dieselbe Aufgabe. Roboto *ist* die Android-Systemschrift: dort unsichtbar, auf iOS wie eine portierte Android-App. |
| **Atkinson Hyperlegible + Open Sans** | **Empfohlen, mit Änderung.** Atkinson wurde vom Braille Institute entworfen, um Zeichen maximal unterscheidbar zu machen (l/I/1, O/0). Wo BITV Zulassungsbedingung ist, ist das ein Argument, kein Stilentscheid. **Änderung: Atkinson durchgehend**, nicht mit Open Sans gepaart — das macht dieselbe Arbeit schlechter. Hierarchie aus Gewicht und Größe; für echten Kontrast eine andere *Kategorie* (Serif für Langtext auf der Infoseite), keine zweite Grotesk. |
| **Montserrat / Jost + Source Sans Pro** | Montserrat ist der Canva-Standardlook. Jost hat echten Charakter (Futura-Wiederbelebung), aber geometrische Grotesken sind in kleinen Graden schlechter lesbar — das arbeitet gegen das Barrierefreiheitsziel. |

Zu prüfen vor der Festlegung: Atkinson hat wenige Schnitte (Regular/Bold plus
Kursive; die neuere „Next“-Fassung mehr). Für eine App reicht das meist, für
eine Infoseite mit Langtext eher knapp.

### Randbedingung, die leicht untergeht

Die App liefert heute **keine Webfont** aus — System-Stack, weil Google Fonts
im Juli aus DSGVO-Gründen entfernt wurde (`notes/00`, Eintrag 10.07.2026).

Jede dieser Schriften heißt: **Schriftdateien mitliefern.** Nativ ins Bundle,
Infoseite selbst gehostet. **Niemals ein Google-Fonts-Link** — das holt exakt
das Problem zurück, das damals behoben wurde. Der Punkt gehört in die
Definition of Done der Infoseite.

## Was daraus wurde

1. ~~Für den Warnton einen Wert mit mindestens 4,5:1 auf Hell finden.~~
   `#8C6208`, 4,90:1 auf `#F5F3EF`.
2. ~~Alle Paare in beiden Themes nachrechnen.~~ Rechnet jetzt
   `packages/core/test/tokens.test.ts` bei jedem Testlauf.
3. ~~Die Tokens nach `packages/core` legen.~~ `packages/core/src/tokens.ts`.
4. **Offen: die Schrift.** Atkinson Hyperlegible bleibt empfohlen, kommt aber
   erst in die Tokens, wenn die Dateien mitgeliefert werden — nativ in Welle 3,
   Infoseite in Welle 4. Ein Token, das auf eine nicht mitgelieferte Schrift
   zeigt, wäre genau der Fehler, den `FONT` drei Wellen lang vorgemacht hat.
