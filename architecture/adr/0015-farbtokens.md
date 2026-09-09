# ADR-0015 — Farbtokens: zwei Skalen, die sich nie berühren

**Status:** angenommen · 27.08.2026

## Kontext

`architecture/design-tokens.md` hat am 27.08.2026 einen Farbvorschlag mit
Münchner Bezug geprüft und eine Fassung vorgeschlagen, die Entscheidung aber
offen gelassen. Ohne sie konnte Welle 2 nicht beginnen: Tokens in den Kern zu
legen heißt, ihre Werte festzuschreiben.

Zwei Dinge sind seither dazugekommen, beide gerechnet, nicht geschätzt:

**Die bestehende Warnfarbe fällt durch.** `#B7791F` liegt bei **3,29:1** auf
`#F5F3EF` und 3,64:1 auf Weiß. Das war als R16 notiert.

**Die Risikorampe des Web-Trackers ist schlechter als ihr Ruf.** Sieben
Hexwerte, davon sechs unter 3:1 auf Hell — und auf Dunkel ist ausgerechnet
`very_high` mit **3,19:1** der schwächste Wert der ganzen Rampe. Die
schwerste Stufe war die am schlechtesten sichtbare.

| Stufe | Wert | auf `#F5F3EF` | auf `#16161D` |
|---|---|---|---|
| none | `#6CB088` | 2,31 | 7,03 |
| negligible | `#6BC98F` | 1,83 | 8,89 |
| very_low | `#8ABB3A` | 2,05 | 7,93 |
| low | `#D4B033` | 1,88 | 8,62 |
| moderate | `#E08840` | 2,44 | 6,66 |
| high | `#DB5E5E` | 3,28 | 4,95 |
| very_high | `#C4264A` | 5,09 | **3,19** |

## Entscheidung

**Die Tokens liegen in `packages/core/src/tokens.ts`** und trennen zwei
Skalen, die sich nie berühren:

| Skala | Aufgabe | Regel |
|---|---|---|
| Interaktion | Identität, Bedienelemente, Navigation | Eine Farbe plus Neutrale |
| Semantik | die Risikobewertung — der Inhalt | Eigene Skala, nie als Bedienelement |

**Hell** — `bg #F5F3EF`, `card #FFFFFF`, `text`/`accent #14262B` (14,12:1),
`sub #5A6B70`, `border #E3E0D8`, `good #2B7A4E`, `warn #8C6208`,
`bad #C0392B`.

**Dunkel** — `bg #0D1A1E`, `card #142429`, `text`/`accent #E6EFEF` (15,17:1),
`sub #8FA5AA`, `border #234047`, `good #5BBB8A`, `warn #D9A441`,
`bad #E87A6A`.

**Marke** — `#F2B705` als *Fläche* mit `#14262B` darauf (8,61:1). App-Icon,
Splash, ein Akzent auf der Infoseite. Nie als Vordergrundfarbe.

**Sieben Risikostufen, vier Farben.** `none`/`negligible` neutral,
`very_low`/`low` auf `good`, `moderate` auf `warn`, `high`/`very_high` auf
`bad`. Die Stufe wird über ihren *Namen* unterschieden, nicht über den
Farbton.

### Drei Werte, die sich gegenüber heute ändern

- `warn` hell: `#B7791F` → **`#8C6208`** (3,29 → 4,90). Behebt R16.
- `bad` dunkel: `#E06A5A` → **`#E87A6A`** (4,96 → 5,78 auf Karte). War der
  schwächste der drei Semantikwerte — also wieder die schwerste Stufe.
- `good` hell: `#2E7D52` → **`#2B7A4E`** (4,54 → 4,74). 4,54 besteht nur auf
  der zweiten Nachkommastelle; das ist kein Bestehen, das ist ein Rundungsglück.

Ergebnis: die drei Semantikfarben liegen auf Hell bei 4,74 / 4,90 / 4,91 —
gleich schwer. Keine Stufe schreit lauter als die andere, weil sie
zufälligerweise dunkler ist.

### Der dunkle Grund bleibt `#17151F`

`architecture/design-tokens.md` empfahl, hier bewusst zu entscheiden statt auf
`#121212` zu fallen. Entschieden: bleibt. Der Wert ist leicht violett getönt
und die gesamte dunkle Neutralfamilie (`#211E2B`, `#322E3F`, `#9B96A8`,
`#F1EFF7`) ist darauf abgestimmt. Ihn zu ändern hieße, sie alle zu ändern —
für einen Gewinn, den niemand messen kann. Die Markenfarbe erscheint nicht in
der dunklen App-Fläche, sondern auf Icon, Splash und Infoseite; der Einwand
„kühles Neutral neben warmem Gelb“ trifft dort, nicht hier.

### Die Schriftentscheidung wird vertagt

`architecture/design-tokens.md` empfiehlt **Atkinson Hyperlegible durchgehend**.
Die Empfehlung steht, aber sie kommt **nicht jetzt** in die Tokens.

Grund: ein `fontFamily`-Token, das auf eine Schrift zeigt, die nicht im Bundle
liegt, ist exakt der Fehler, den dieselbe Welle gerade ausbaut — `FONT` zeigt
seit dem 10.07.2026 auf DM Sans, das es nicht mehr gibt, und wird 91-mal
gesetzt. Die Schrift wird zum Token, wenn die Dateien mitgeliefert werden:
nativ in Welle 3, Infoseite in Welle 4.

## Nachtrag 10.09.2026 — die Neutralen sind nicht mehr violett

Die ursprüngliche Reihe war durchgehend violett gestimmt: `#1F1D2B` im Hellen,
`#17151F` und `#322E3F` im Dunkeln, `#F1EFF7` als Textfarbe. Das las sich
generisch — ein Ton, den man in beliebigen Oberflächen findet.

Die Neutralen liegen jetzt auf Petrol, im selben Bereich wie die
Konzeptvorstellung vom 21.05.2026. Damit sprechen Präsentation, Infoseite und
App dieselbe Sprache, statt drei Farbwelten zu haben.

Die Helligkeiten sind mitgewandert, nicht neu gewählt: alle Schwellen aus den
Tests bleiben erfüllt, der Textkontrast im Hellen sinkt von 14,93 auf 14,12
und im Dunkeln steigt er auf 15,17. Die semantische Skala — grün, gelb, rot —
ist unberührt; sie beschreibt den Inhalt und hat mit der Identität nichts zu
tun.

## Konsequenzen

**Positiv**

- Die Werte sind maschinell geprüft. `packages/core/test/tokens.test.ts`
  rechnet jedes Paar gegen beide Gründe seines Themes und schlägt fehl, wenn
  ein Wert unter die Schwelle rutscht. Ein Auditor führt `pnpm test` aus,
  statt ein Bundle zu lesen — das war vorher unmöglich (Befund 1.2).
- Die Risikofarbe ist damit Teil der getesteten Gesundheitslogik, wo sie
  hingehört: sie ist der einzige Kodierungskanal für die Kernaussage.
- R16 ist behoben, und zwar so, dass es nicht zurückkommen kann.

**Negativ**

- **Vier Farbtöne weniger auf der Risikoskala.** Wer die siebenstufige Rampe
  als Fortschrittsanzeige gelesen hat, verliert Auflösung. Das ist gewollt: die
  verlorenen Stufen waren ohnehin nicht unterscheidbar, und der zweite
  Kodierungskanal aus R17 (Text und Form) muss die Arbeit ohnehin übernehmen.
- **Die Marke ist im Produkt fast unsichtbar.** Münchner Gelb erscheint auf
  Icon, Splash und Infoseite — im App-Inneren nirgends. Wer eine sichtbar
  „münchnerische“ App erwartet, bekommt sie nicht. Der Tausch ist bewusst:
  Farbe trägt hier Bedeutung, nicht Identität.
- **`apps/web` bleibt vorerst gespalten.** Der Tracker behält seine eigene
  Palette (siehe unten). Zwei Designsysteme bestehen fort, bis Welle 4 den
  Tracker ersetzt.

## Was mit `apps/web` passiert

Der Tracker übernimmt aus dem Kern **nur `riskColor`**, nicht die Palette.

Die Palette zu übernehmen hieße, sein Erscheinungsbild zu ändern — die
Aktionsfarbe ist dort `teal #238A8E`, nicht das nahezu schwarze `#1F1D2B`. Das
wäre keine Refaktorierung, sondern ein Redesign an einer Anwendung, die nach
[ADR-0001](0001-native-only.md) in Welle 4 durch die Infoseite ersetzt wird.

`riskColor` dagegen ist eine Funktion, ein Aufrufort, und behebt einen
gemessenen Barrierefreiheitsmangel in Code, der heute läuft.

## Verworfene Alternativen

**Münchner Gelb als Aktionsfarbe.** 1,51 bis 1,82:1 auf Hell. Der schwerere
Einwand ist aber semantisch: Gelb ist auf der Risikoskala bereits „erhöht“.
CTA und Warnung sähen gleich aus.

**Medical Blue `#2F70B1` als Informationsfarbe.** Fällt im Dark Mode als Text
durch (3,17 bis 3,63:1) und bräuchte eine eigene Variante. Inhaltlich zieht es
Richtung „Medizinprodukt“ — genau das Signal, das die regulatorische Position
vermeidet.

**Safe Green `#009933`.** Fällt auf Hell durch (3,38 bis 3,75:1). Und das Wort
trägt nicht: „sicher“ ist ein Zustand, den diese App nicht bescheinigen kann.
Sie sagt „testbar“ und „nichts zu tun“.

**Eine Radius- und Abstandsskala gleich mit in den Kern.** Genau das Muster,
das `notes/05` am Web-Tracker belegt: `theme/tokens.ts` exportiert vier
benannte Radien, importiert werden sie null Mal, daneben stehen 57 hartkodierte
Werte. Eine Skala kommt in den Kern, wenn sie verkabelt wird — die Bildschirme
werden in Welle 3 ohnehin neu gebaut.
