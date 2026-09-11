/**
 * Beispiel-QR-Codes zum Ausprobieren, wie sie die Konzeptvorstellung auf
 * ihrer vorletzten Folie zeigt.
 *
 * Nur zur Bauzeit: dieses Modul wird ausschliesslich von `vite.config.ts`
 * importiert, nie von `main.ts`. Dadurch bleibt `qrcode` aus dem Bundle,
 * das der Browser laedt — die fertigen Bilder stehen ohnehin im HTML.
 *
 * Die Nutzlasten sind echt. Sie durchlaufen dieselbe `parseImportPayload`
 * wie ein gescannter Code, und wer sie mit der App einliest, bekommt
 * einen Kontakt beziehungsweise ein Testergebnis in seine Daten. Erfunden
 * ist nur der Inhalt, nicht das Format.
 */
import QRCode from "qrcode";

const PANEL = ["HIV", "Syphilis", "Gonorrhea", "Chlamydia"] as const;
const ts = Object.fromEntries(PANEL.map((s) => [s, 1]));
const negativ = Object.fromEntries(PANEL.map((s) => [s, "negative"]));

const test = (results: Record<string, string>) => ({
  v: 1,
  type: "test_result",
  date: "2026-08-24",
  facility: "Checkpoint München",
  ts,
  results,
});

export const BEISPIELE: { label: string; hinweis: string; payload: string }[] = [
  {
    label: "Kontakt",
    hinweis: "Robin, mit Telegram-Handle",
    payload: JSON.stringify({
      v: 1,
      type: "contact",
      token: "7d3f1a9c4e8b2650",
      name: "Robin",
      platform: "telegram",
      handle: "@robin_muc",
    }),
  },
  {
    label: "Testergebnis, negativ",
    hinweis: "Vier Infektionen, alle ohne Befund",
    payload: JSON.stringify(test(negativ)),
  },
  {
    label: "Testergebnis, positiv",
    hinweis: "Chlamydien positiv — löst den Benachrichtigungsweg aus",
    payload: JSON.stringify(test({ ...negativ, Chlamydia: "positive" })),
  },
];

/**
 * Matrix zu SVG. Zusammenhaengende dunkle Module werden zu einem
 * Pfadsegment zusammengefasst, sonst hat die Datei ein Rechteck je Modul.
 */
function svgOf(payload: string): string {
  const qr = QRCode.create(payload, { errorCorrectionLevel: "M" });
  const n = qr.modules.size;
  const d = qr.modules.data;
  const quiet = 4;
  const total = n + quiet * 2;

  const parts: string[] = [];
  for (let row = 0; row < n; row++) {
    let from = -1;
    for (let col = 0; col <= n; col++) {
      const dark = col < n && d[row * n + col] === 1;
      if (dark && from === -1) from = col;
      if (!dark && from !== -1) {
        const len = col - from;
        parts.push(`M${from + quiet} ${row + quiet}h${len}v1h-${len}z`);
        from = -1;
      }
    }
  }

  return [
    `<svg viewBox="0 0 ${total} ${total}" role="img"`,
    ` aria-label="QR-Code" xmlns="http://www.w3.org/2000/svg">`,
    `<rect width="${total}" height="${total}" fill="#FFFFFF"/>`,
    `<path d="${parts.join("")}" fill="#000000"/>`,
    `</svg>`,
  ].join("");
}

export function beispielQrs(): { label: string; hinweis: string; svg: string }[] {
  return BEISPIELE.map(({ label, hinweis, payload }) => ({
    label,
    hinweis,
    svg: svgOf(payload),
  }));
}
