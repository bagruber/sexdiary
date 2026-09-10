/**
 * Der Symbolsatz, als reine Pfaddaten.
 *
 * Warum im Kern und nicht in der App: die Infoseite zeichnet dieselben
 * Symbole wie die App. Zwei Kopien derselben Pfade laufen auseinander,
 * und man sieht es erst, wenn beide nebeneinander liegen — was bei einer
 * Seite und einer App nie passiert. Aus demselben Grund liegen hier
 * schon die Farbtokens (ADR-0015).
 *
 * Es sind Zeichenketten, keine Elemente: der Kern kennt weder DOM noch
 * React Native. Jede Hülle rendert sie selbst — die App als `<Path>` aus
 * react-native-svg, die Infoseite als Text im `<svg>`.
 *
 * Alle Symbole sitzen auf 24×24 und sind ausschliesslich gestrichen.
 * Keine Füllung, keine Halbtöne, eine Strichstärke. Das ist die
 * Eigenschaft, die einen Satz wie einen Satz aussehen lässt — nicht die
 * Motivwahl (ADR-0016).
 *
 * Eigene Pfade, nicht aus einer Bibliothek übernommen. Das Projekt hat
 * noch keine Lizenz; fremde Icon-Pfade machten diese Frage grösser.
 */

/**
 * Gemeinsame Strichstärke. Absichtlich hier und nicht je Aufrufer: sie
 * ist das Einzige, was den Satz zusammenhält, und sobald sie einstellbar
 * ist, verstellt sie irgendwann jemand.
 */
export const ICON_STROKE = 1.7;

export const ICON_PATHS = {
  /** Heute — Gesundheitsstand, deshalb Pulslinie und kein Haus. */
  pulse: ["M3 12.5h4.2L10 6l4 12 2.4-5.5H21"],
  calendar: [
    "M7 5h10a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z",
    "M5 10h14",
    "M9 3v4",
    "M15 3v4",
  ],
  bell: [
    "M6.2 10a5.8 5.8 0 0 1 11.6 0c0 4.6 1.4 6 2.2 6.9H4c.8-.9 2.2-2.3 2.2-6.9z",
    "M10 20a2 2 0 0 0 4 0",
  ],
  plus: ["M12 5.5v13", "M5.5 12h13"],
  close: ["M6.5 6.5l11 11", "M17.5 6.5l-11 11"],
  chevronRight: ["M9.5 5.5l6.5 6.5-6.5 6.5"],
  chevronLeft: ["M14.5 5.5L8 12l6.5 6.5"],

  /** Begegnung. Zwei Kreisbögen und ein V — symmetrisch gerechnet. */
  heart: [
    "M12 20.3l-7.1-7.1a4.4 4.4 0 0 1 6.2-6.2l.9.9.9-.9a4.4 4.4 0 0 1 6.2 6.2z",
  ],
  /** Testergebnis. Tropfen, nicht Haken: ein Haken hiesse „negativ". */
  droplet: ["M12 3.4c0 0 5.6 6.2 5.6 9.8a5.6 5.6 0 0 1-11.2 0c0-3.6 5.6-9.8 5.6-9.8z"],
  user: [
    "M12 12.2a4.1 4.1 0 1 0 0-8.2 4.1 4.1 0 0 0 0 8.2z",
    "M4.6 20.4a7.4 7.4 0 0 1 14.8 0",
  ],
  /**
   * Impfung, PrEP und Doxy-PEP teilen ein Symbol, und es ist bewusst
   * keine Spritze: zwei der drei sind Tabletten. Schild mit Kreuz heisst
   * Schutz und trifft alle drei.
   */
  shield: [
    "M12 3.3l7 2.5v5.4c0 4.4-2.9 7.7-7 9.5-4.1-1.8-7-5.1-7-9.5V5.8z",
    "M12 9.2v5.6",
    "M9.2 12h5.6",
  ],
  /** Drei Suchmuster und ein Datenfeld — die Gestalt, die jeder kennt. */
  qr: [
    "M4.6 4.6h5.2v5.2H4.6z",
    "M14.2 4.6h5.2v5.2h-5.2z",
    "M4.6 14.2h5.2v5.2H4.6z",
    "M14.2 14.6v1.8",
    "M18 14.6v1.8",
    "M14.2 18.2v1.6",
    "M18 18.2v1.6",
  ],
  /**
   * Einstellungen. Acht Zähne, aus Winkel und Radius gerechnet statt
   * nach Augenmass gesetzt — von Hand gezeichnet wird ein Zahnrad an
   * genau einer Stelle schief, und man sieht es erst auf dem Gerät.
   */
  gear: [
    "M9.72 5.17L9.82 2.55L14.18 2.55L14.28 5.17L15.21 5.56L17.14 3.77L20.23 6.86L18.44 8.79L18.83 9.72L21.45 9.82L21.45 14.18L18.83 14.28L18.44 15.21L20.23 17.14L17.14 20.23L15.21 18.44L14.28 18.83L14.18 21.45L9.82 21.45L9.72 18.83L8.79 18.44L6.86 20.23L3.77 17.14L5.56 15.21L5.17 14.28L2.55 14.18L2.55 9.82L5.17 9.72L5.56 8.79L3.77 6.86L6.86 3.77L8.79 5.56Z",
    "M12 15.4a3.4 3.4 0 1 0 0-6.8 3.4 3.4 0 0 0 0 6.8z",
  ],
  lock: [
    "M6.6 10.4h10.8a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H6.6a1 1 0 0 1-1-1v-8a1 1 0 0 1 1-1z",
    "M8.6 10.4V7.8a3.4 3.4 0 0 1 6.8 0v2.6",
    "M12 14.4v2.4",
  ],

  /**
   * Die folgenden zwei zeichnen keine Funktion der App, sondern die
   * ersten beiden Probleme auf der Infoseite. Sie stehen trotzdem hier:
   * derselbe Satz, dieselbe Strichstärke, ein Ort.
   */
  /** „Wie hoch ist mein Risiko?" — Skala mit Zeiger. */
  gauge: [
    "M3 17a9 9 0 0 1 18 0",
    "M12 17l4.5-4.5",
    // Der Drehpunkt als gestrichener Minikreis. Bei Strichstaerke 1,7
    // schliesst sich die Flaeche und liest sich als Punkt — ohne dass
    // der Satz eine Fuellregel braucht, die sonst nirgends vorkommt.
    "M12 15.9a1.1 1.1 0 1 0 0 2.2 1.1 1.1 0 1 0 0-2.2",
  ],
  /** „Wer muss es erfahren?" — Weitergabe von einem zum anderen. */
  handoff: [
    "M4.5 9.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 1 0 0-5",
    "M19.5 9.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 1 0 0-5",
    // Spitze bei 15,8 statt 16,5: der rechte Kreis beginnt bei 17, und
    // ein halber Punkt Luft dazwischen verschmilzt bei 24 px zu einem
    // Zeichen, das aussieht wie ein Buchstabe.
    "M8 12h5.6",
    "M13.2 9.6 15.8 12l-2.6 2.4",
  ],
} as const;

export type IconName = keyof typeof ICON_PATHS;
