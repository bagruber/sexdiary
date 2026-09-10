# ADR-0016 — Eigener Symbolsatz, und eine dritte Farbskala für die Eintragsarten

**Status:** angenommen · 10.09.2026

## Kontext

Die App hat ihre Symbole bis heute als **Schriftzeichen** getragen:
`♥ ✓ ☺ ✚ ▣` für die vier Eintragsarten und den QR, dazu `›` als Chevron und
`⚙` für die Einstellungen. Die Begründung im Code war Größe — `@expo/vector-icons`
bringt für vierzehn Zeichen ein Schriftpaket von über einem Megabyte mit.

Die Rechnung stimmt für das Paket, aber nicht für die Schlussfolgerung. Ein
Zeichen aus der Textschrift folgt deren Formsprache statt einer eigenen,
skaliert und färbt sich anders als alles daneben, und existiert nur in der
Strichstärke, die die Schrift dafür vorsieht. `☺` sieht in Atkinson
Hyperlegible aus wie ein Emoticon, nicht wie ein Kontakt.

Dazu zwei Dinge, die zeitgleich anlagen:

**Die zwei runden Knöpfe.** `OFFENE-PUNKTE.md` führt seit dem 10.09.2026 den
Einwand, dass zwei gleich große Kreise nebeneinander über der Reiterleiste
verwechselt werden — das eine legt einen Eintrag an, das andere öffnet die
Kamera. Abgemildert war er nur durch die Füllung.

**Der QR aus 447 Views.** `QrCode.tsx` zeichnet jedes Modul als eigenes
`View`. Ob das auf einem älteren Telefon ruckelt, steht als offener Punkt.

## Entscheidung

**Ein eigener Symbolsatz in `apps/mobile/src/icons.tsx`**, gezeichnet als
SVG-Pfade für dieses Projekt. Vierzehn Symbole auf 24×24, ausschließlich
gestrichen, eine gemeinsame Strichstärke von 1,7 — die nicht einstellbar ist,
weil sie das Einzige ist, was den Satz zusammenhält.

Der Preis ist **`react-native-svg`**, ein weiteres natives Modul. Es zahlt sich
zweimal: derselbe Umbau macht aus den 447 Views des QR einen einzigen `Path`.

Die Pfade sind selbst geschrieben, nicht aus einer Bibliothek übernommen. Das
ist kein Stolz, sondern Lizenzhygiene — dieses Repo hat noch keine Lizenz
(NFA-09), und fremde Icon-Pfade mitzuschleppen macht diese Frage größer.

**Die beiden Knöpfe stehen übereinander am rechten Rand**, nicht nebeneinander
in der Mitte. Das Plus oben, 58 px, gefüllt, weil daraus der Fächer aufgeht;
der QR darunter, 46 px, umrandet. Ort, Größe und Füllung unterscheiden sich
jetzt, statt nur die Füllung. Das ist die Bauform, die Signal und Telegram für
dasselbe Problem gewählt haben.

**Der Fächer läuft auf einem Viertelkreis** von links nach oben, Radius 104,
vier Positionen zu 30 Grad. Ein Drittelkreis war zuerst überlegt und schiebt
den letzten Knopf rechts am Plus vorbei über den Bildschirmrand.

**Eine dritte Farbskala, `CATEGORY_LIGHT` und `CATEGORY_DARK` im Kern**, für die
vier Eintragsarten.

## Warum eine dritte Skala vertretbar ist

[ADR-0015](0015-farbtokens.md) trennt Interaktion und Semantik und begründet,
warum sie sich nie berühren dürfen: wenn ein Bedienelement aussieht wie eine
Warnung, hört Farbe auf, in einer App Bedeutung zu tragen, in der sie die
Botschaft *ist*. Eine dritte Skala ist zunächst ein Angriff auf genau dieses
Argument.

Sie ist zulässig unter drei Bedingungen, und alle drei stehen im Code:

1. **Sie gilt an genau einer Stelle** — den vier Knöpfen im Fächer. Der Fächer
   ist ein Overlay über abgedunkeltem Hintergrund und lebt Sekunden.
   Kategoriefarbe und Risikofarbe stehen dort nie gleichzeitig lesbar
   nebeneinander. Außerhalb des Fächers hat die Eintragsart kein Farbe, sondern
   nur ihr Symbol.
2. **Sie berührt die Risikorampe nicht.** Die vier Farbtöne liegen zwischen 190
   und 330 Grad; Rot, Amber und Grün bleiben dem Risiko. Der Abstand zu jedem
   Risikofarbton beträgt mindestens 25 Grad, der Abstand der vier untereinander
   mindestens 30.
3. **Sie ist gerechnet, nicht nach Augenmaß gesetzt.** Beide Bedingungen und die
   Kontraste stehen als Behauptungen in `packages/core/test/tokens.test.ts`.
   Wer einen Wert nach Gefühl verschiebt, fällt dort auf.

Farbe ist im Fächer außerdem der **zweite** Marker, nicht der erste — jeder
Knopf trägt sein Symbol. Wer die Farben nicht unterscheiden kann, verliert
nichts.

| Eintragsart | Hell | Dunkel | Symbol |
|---|---|---|---|
| Begegnung | `#8C2157` | `#E58AB8` | Herz |
| Testergebnis | `#21268C` | `#8A8EE5` | Tropfen |
| Kontakt | `#70218C` | `#CD8AE5` | Person |
| Impfung, PrEP, Doxy-PEP | `#217B8C` | `#8AD6E5` | Schild mit Kreuz |

Vordergrund auf jeder Fläche ist `#FFFFFF` (hell) beziehungsweise `#0D1A1E`
(dunkel), mindestens 4,91:1.

Zwei Motive sind bewusst gewählt und nicht das Naheliegende. Das Testergebnis
trägt einen **Tropfen und keinen Haken** — ein Haken hieße „negativ", und die
App trägt auch positive Befunde. Impfung, PrEP und Doxy-PEP teilen ein
**Schild und keine Spritze**, weil zwei der drei Tabletten sind.

## Konsequenzen

**Gut.** Der Symbolsatz sieht aus wie ein Satz. Der Verwechslungseinwand ist
konstruktiv aufgelöst statt abgemildert. Der QR-Bildschirm verliert 446 Views.
`EntryType` ist jetzt das einzige Vokabular für die Eintragsarten — vorher
standen `EntryType`, `AddKind` und die Symbolliste nebeneinander und konnten
auseinanderlaufen.

**Schlecht.** Ein viertes natives Drittanbieter-Modul. Jedes davon ist eine
Abhängigkeit, die bei einem Expo-Major bricht, und eine Fläche, die eine
Sicherheitsprüfung mitlesen muss.

**Offen.** Der Fächer bewegt sich nicht — er ist da oder nicht. Eine Animation
wäre das, was ihn geschmeidig machte, muss aber `prefs.reducedMotion` achten
und ist ohne Gerät nicht zu beurteilen. Bewusst zurückgestellt.

**Nicht geprüft.** Ein natives Modul heißt Neubau des Android-Projekts. Lint,
drei Typechecks, 135 Tests, Build und ein Metro-Export sind grün, und eine
Sonde gegen das Bundle findet die Pfade und die Farbwerte und keine der alten
Glyphen mehr. Keiner dieser Schritte sagt, wie die Symbole auf einem Bildschirm
aussehen. Das ist ein eigener Schritt.
