/**
 * Der Inhalt der Doku-Seite, ohne DOM und ohne Stylesheet-Import.
 *
 * Getrennt von `main.ts`, damit die Seite ausserhalb eines Browsers
 * gerendert und angesehen werden kann — in diesem Repo hat sich zu oft
 * gezeigt, dass ein gruener Build wenig ueber das Ergebnis sagt.
 *
 * Die Seite schreibt keine Werte ab. Farben, Stufen und Kontrastzahlen
 * kommen aus `@sexdiary/core` und werden mit derselben `contrast()`
 * gerechnet, die auch der Test benutzt. Eine geaenderte Token-Datei malt
 * diese Seite neu, ohne dass jemand sie anfasst.
 */
import {
  BRAND,
  DARK,
  LIGHT,
  RISK_ORDER,
  contrast,
  makeT,
  paletteFor,
  riskColor,
  type Palette,
  type RiskLevel,
} from "@sexdiary/core";

const TEXT = 4.5;
const CONTROL = 3;

const t = makeT("de");
const ratio = (n: number) => n.toFixed(2).replace(".", ",");

/** Ein Kontrastwert plus sein Urteil gegen die passende Schwelle. */
function judge(fg: string, bg: string, threshold: number): string {
  const r = contrast(fg, bg);
  const ok = r >= threshold;
  return `${ratio(r)}<span class="verdict ${ok ? "pass" : "fail"}">${
    ok ? "erfüllt" : "verfehlt"
  }</span>`;
}

interface TokenRow {
  name: keyof Palette;
  role: string;
  /** Text braucht 4,5:1, Bedienelemente 3:1, Linien gar nichts. */
  threshold: number | null;
}

const interaction: TokenRow[] = [
  { name: "bg", role: "Bildschirmgrund", threshold: null },
  { name: "card", role: "Fläche darüber", threshold: null },
  { name: "text", role: "Fließtext", threshold: TEXT },
  { name: "sub", role: "Zweitrangiger Text", threshold: TEXT },
  { name: "accent", role: "Die eine Aktionsfarbe", threshold: CONTROL },
  { name: "border", role: "Trennlinie, rein dekorativ", threshold: null },
];

const semantic: TokenRow[] = [
  { name: "good", role: "Nichts zu tun", threshold: TEXT },
  { name: "warn", role: "Erhöht", threshold: TEXT },
  { name: "bad", role: "Handeln", threshold: TEXT },
];

function tokenTable(rows: TokenRow[], p: Palette): string {
  const body = rows
    .map((row) => {
      const value = p[row.name];
      const cells =
        row.threshold === null
          ? `<td class="num" colspan="2">—</td>`
          : `<td class="num">${judge(value, p.bg, row.threshold)}</td>
             <td class="num">${judge(value, p.card, row.threshold)}</td>`;
      return `<tr>
        <td><span class="swatch" style="background:${value}"></span></td>
        <td>
          <span class="name">${row.name}</span>
          <span class="role">${row.role}</span>
        </td>
        <td><span class="hex">${value}</span></td>
        ${cells}
      </tr>`;
    })
    .join("");

  return `<div class="tokens"><table>
    <thead><tr>
      <th></th><th>Token</th><th>Wert</th>
      <th class="num">auf bg</th><th class="num">auf card</th>
    </tr></thead>
    <tbody>${body}</tbody>
  </table></div>`;
}

function riskScale(p: Palette): string {
  const levels = (Object.keys(RISK_ORDER) as RiskLevel[]).sort(
    (a, b) => RISK_ORDER[a] - RISK_ORDER[b],
  );
  return `<div class="scale">${levels
    .map((level) => {
      const c = riskColor(p, level);
      return `<div class="step">
        <span class="dot" style="background:${c}"></span>
        <span class="lvl" style="color:${c}">${t(level)}</span>
        <span class="key">${level} → ${c.toUpperCase()}</span>
      </div>`;
    })
    .join("")}</div>`;
}

export function render(scheme: "light" | "dark"): string {
  const p = paletteFor(scheme);

  return `<div class="page">
  <header>
    <p class="eyebrow">Sexdiary · Interne Fassung</p>
    <h1>Ein Designsystem aus zwei Skalen</h1>
    <p class="lede">
      Diese App sagt ihre Kernaussage über Farbe. Deshalb darf keine
      Bedienfarbe wie eine Risikofarbe aussehen — und umgekehrt. Alles
      Weitere folgt daraus.
    </p>
    <div class="controls">
      <button class="theme" id="theme">
        ${scheme === "dark" ? "Zur hellen Fassung" : "Zur dunklen Fassung"}
      </button>
      <span class="note">
        Alle Zahlen auf dieser Seite sind gerechnet, nicht eingetragen.
      </span>
    </div>
  </header>

  <section>
    <h2>Die tragende Regel</h2>
    <div class="rule">
      <div>
        <h4>Interaktion</h4>
        <p>
          Identität, Bedienelemente, Navigation. Eine Farbe plus Neutrale,
          mehr nicht.
        </p>
      </div>
      <div>
        <h4>Semantik</h4>
        <p>
          Die Risikobewertung — der eigentliche Inhalt. Eigene Skala, die
          nie als Bedienelement auftaucht.
        </p>
      </div>
    </div>
    <div class="aside">
      <p>
        Der ursprüngliche Vorschlag verletzte das: Münchner Gelb als
        Aktionsfarbe, Grün als Marke. Dann sähen „erhöhtes Risiko“ und
        „hier tippen“ gleich aus.
      </p>
    </div>
  </section>

  <section>
    <h2>Interaktion und Neutrale</h2>
    <p>
      Die Aktionsfarbe ist nahezu schwarz beziehungsweise nahezu weiß. Das
      ist Absicht: mit rund 15:1 ist sie der stärkste Wert der Palette, sie
      kostet nichts, und sie hält die gesamte Farbskala für die Semantik
      frei.
    </p>
    ${tokenTable(interaction, p)}
    <p class="aside">
      Schwellen nach WCAG 2.1 AA, auf das die BITV 2.0 verweist:
      <strong>4,5:1</strong> für Text, <strong>3:1</strong> für
      Bedienelemente. Trennlinien sind dekorativ und davon ausgenommen.
    </p>
  </section>

  <section>
    <h2>Semantik</h2>
    <p>
      Drei Farben, absichtlich gleich schwer. Läge „handeln“ am unteren Ende
      der Lesbarkeit, wäre die Skala verkehrt herum gebaut — die wichtigste
      Stufe wäre die am schlechtesten sichtbare.
    </p>
    ${tokenTable(semantic, p)}
    <div class="aside">
      <p>
        Zwei dieser Werte mussten sich ändern. Die alte Warnfarbe
        <code>#B7791F</code> lag bei
        <strong>${ratio(contrast("#B7791F", LIGHT.bg))}:1</strong> und fiel
        als Text durch. Die alte dunkle Warnfarbe für „handeln“
        <code>#E06A5A</code> lag bei
        <strong>${ratio(contrast("#E06A5A", DARK.card))}:1</strong> auf der
        Karte und war damit der schwächste der drei.
      </p>
    </div>
  </section>

  <section>
    <h2>Die Risikoskala</h2>
    <p>
      Sieben Stufen, vier Farben. Eine siebenstufige Rampe lässt sich nicht
      auseinanderhalten, und die vorherige verteilte ihre schwächsten
      Kontraste ausgerechnet auf die schwersten Stufen. Unterschieden wird
      über den <em>Namen</em> der Stufe; die Farbe gruppiert nur.
    </p>
    ${riskScale(p)}
    <div class="aside">
      <p>
        Farbe bleibt damit ein Kanal von zweien. Der zweite ist heute der
        Text — Position und Form kommen dazu, sobald der Hauptbildschirm
        nach ADR-0014 gebaut ist.
      </p>
    </div>
  </section>

  <section>
    <h2>Die Marke</h2>
    <p>
      Münchner Gelb <code>${BRAND.surface}</code> ist eine <em>Fläche</em>,
      nie ein Vordergrund. Es erscheint auf App-Icon, Splash und Infoseite
      — im Inneren der App nirgends.
    </p>
    <div class="brand">
      <figure>
        <div class="demo" style="background:${BRAND.surface};color:${
          BRAND.onSurface
        }">
          So ja
        </div>
        <figcaption>
          Fläche mit <code>${BRAND.onSurface}</code> darauf —
          ${ratio(contrast(BRAND.onSurface, BRAND.surface))}:1
        </figcaption>
      </figure>
      <figure>
        <div class="demo" style="background:${LIGHT.bg};color:${BRAND.surface}">
          So nicht
        </div>
        <figcaption>
          Als Vordergrund auf <code>${LIGHT.bg}</code> —
          ${ratio(contrast(BRAND.surface, LIGHT.bg))}:1, unter der Schwelle
          für Bedienelemente
        </figcaption>
      </figure>
    </div>
    <div class="aside">
      <p>
        Auf dunklem Grund würde dasselbe Gelb die Kontrastschwelle übrigens
        nehmen — ${ratio(contrast(BRAND.surface, DARK.bg))}:1 auf
        <code>${DARK.bg}</code>. Es bleibt trotzdem verboten, und daran
        zeigt sich, welches Argument hier wirklich trägt: Gelb bedeutet auf
        der Risikoskala bereits „erhöht“. Eine Schaltfläche in dieser Farbe
        sähe aus wie eine Warnung, in beiden Themes.
      </p>
    </div>
    <p>
      Vor einer Partnerschaft ist eine Stadtfarbe zurückhaltend einzusetzen.
      Sie liest sich sonst als Behauptung einer Trägerschaft.
    </p>
  </section>

  <section>
    <h2>Schrift</h2>
    <p>
      Noch nicht entschieden, und das ist kein Versäumnis. Empfohlen ist
      <strong>Atkinson Hyperlegible</strong> durchgehend — vom Braille
      Institute entworfen, um Zeichen maximal unterscheidbar zu machen.
      Wo die BITV Zulassungsbedingung ist, ist das ein Argument und kein
      Stilentscheid.
    </p>
    <p>
      Sie kommt erst dann in die Tokens, wenn die Schriftdateien
      mitgeliefert werden. Ein Token, das auf eine fehlende Schrift zeigt,
      wäre genau der Fehler, den diese Codebasis gerade ausgebaut hat: eine
      Konstante verwies 91-mal auf eine Schrift, die seit Juli nicht mehr
      da war. Bis dahin: System-Stack, und niemals ein Google-Fonts-Link.
    </p>
  </section>

  <footer>
    <p>
      Die Werte stehen in <code>packages/core/src/tokens.ts</code> und
      werden von <code>packages/core/test/tokens.test.ts</code> bei jedem
      Testlauf gegen beide Gründe ihres Themes nachgerechnet. Begründung
      der Entscheidung in ADR-0015. Diese Seite importiert dieselben
      Tokens und dieselbe Kontrastfunktion — sie kann nicht auseinanderlaufen.
    </p>
  </footer>
</div>`;
}

/** Beide Themes als Custom Properties, direkt aus den Tokens. */
export function themeStyles(): string {
  const block = (selector: string, p: Palette) =>
    `${selector}{${Object.entries(p)
      .map(([k, v]) => `--${k.replace(/[A-Z]/g, (c) => "-" + c.toLowerCase())}:${v};`)
      .join("")}}`;
  return block(':root, :root[data-theme="light"]', LIGHT) +
    block(':root[data-theme="dark"]', DARK);
}

