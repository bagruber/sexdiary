import{E as e,a as t,i as n,n as r,o as i,r as a,s as o,t as s}from"./dist-B_QlVvAR.js";var c=4.5,l=3,u=o(`de`),d=e=>e.toFixed(2).replace(`.`,`,`);function f(e,t,r){let i=n(e,t),a=i>=r;return`${d(i)}<span class="verdict ${a?`pass`:`fail`}">${a?`erfüllt`:`verfehlt`}</span>`}var p=[{name:`bg`,role:`Bildschirmgrund`,threshold:null},{name:`card`,role:`Fläche darüber`,threshold:null},{name:`text`,role:`Fließtext`,threshold:c},{name:`sub`,role:`Zweitrangiger Text`,threshold:c},{name:`accent`,role:`Die eine Aktionsfarbe`,threshold:l},{name:`border`,role:`Trennlinie, rein dekorativ`,threshold:null}],m=[{name:`good`,role:`Nichts zu tun`,threshold:c},{name:`warn`,role:`Erhöht`,threshold:c},{name:`bad`,role:`Handeln`,threshold:c}];function h(e,t){return`<div class="tokens"><table>
    <thead><tr>
      <th></th><th>Token</th><th>Wert</th>
      <th class="num">auf bg</th><th class="num">auf card</th>
    </tr></thead>
    <tbody>${e.map(e=>{let n=t[e.name],r=e.threshold===null?`<td class="num" colspan="2">—</td>`:`<td class="num">${f(n,t.bg,e.threshold)}</td>
             <td class="num">${f(n,t.card,e.threshold)}</td>`;return`<tr>
        <td><span class="swatch" style="background:${n}"></span></td>
        <td>
          <span class="name">${e.name}</span>
          <span class="role">${e.role}</span>
        </td>
        <td><span class="hex">${n}</span></td>
        ${r}
      </tr>`}).join(``)}</tbody>
  </table></div>`}function g(t){return`<div class="scale">${Object.keys(e).sort((t,n)=>e[t]-e[n]).map(e=>{let n=i(t,e);return`<div class="step">
        <span class="dot" style="background:${n}"></span>
        <span class="lvl" style="color:${n}">${u(e)}</span>
        <span class="key">${e} → ${n.toUpperCase()}</span>
      </div>`}).join(``)}</div>`}function _(e){let i=t(e);return`<div class="page">
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
        ${e===`dark`?`Zur hellen Fassung`:`Zur dunklen Fassung`}
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
    ${h(p,i)}
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
    ${h(m,i)}
    <div class="aside">
      <p>
        Zwei dieser Werte mussten sich ändern. Die alte Warnfarbe
        <code>#B7791F</code> lag bei
        <strong>${d(n(`#B7791F`,a.bg))}:1</strong> und fiel
        als Text durch. Die alte dunkle Warnfarbe für „handeln“
        <code>#E06A5A</code> lag bei
        <strong>${d(n(`#E06A5A`,r.card))}:1</strong> auf der
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
    ${g(i)}
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
      Münchner Gelb <code>${s.surface}</code> ist eine <em>Fläche</em>,
      nie ein Vordergrund. Es erscheint auf App-Icon, Splash und Infoseite
      — im Inneren der App nirgends.
    </p>
    <div class="brand">
      <figure>
        <div class="demo" style="background:${s.surface};color:${s.onSurface}">
          So ja
        </div>
        <figcaption>
          Fläche mit <code>${s.onSurface}</code> darauf —
          ${d(n(s.onSurface,s.surface))}:1
        </figcaption>
      </figure>
      <figure>
        <div class="demo" style="background:${a.bg};color:${s.surface}">
          So nicht
        </div>
        <figcaption>
          Als Vordergrund auf <code>${a.bg}</code> —
          ${d(n(s.surface,a.bg))}:1, unter der Schwelle
          für Bedienelemente
        </figcaption>
      </figure>
    </div>
    <div class="aside">
      <p>
        Auf dunklem Grund würde dasselbe Gelb die Kontrastschwelle übrigens
        nehmen — ${d(n(s.surface,r.bg))}:1 auf
        <code>${r.bg}</code>. Es bleibt trotzdem verboten, und daran
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
</div>`}function v(){let e=(e,t)=>`${e}{${Object.entries(t).map(([e,t])=>`--${e.replace(/[A-Z]/g,e=>`-`+e.toLowerCase())}:${t};`).join(``)}}`;return e(`:root, :root[data-theme="light"]`,a)+e(`:root[data-theme="dark"]`,r)}var y=document.createElement(`style`);y.textContent=v(),document.head.append(y);var b=document.getElementById(`root`);function x(e){document.documentElement.dataset.theme=e,b.innerHTML=_(e),document.getElementById(`theme`).addEventListener(`click`,()=>{x(e===`dark`?`light`:`dark`)})}x(window.matchMedia?.(`(prefers-color-scheme: dark)`).matches?`dark`:`light`);