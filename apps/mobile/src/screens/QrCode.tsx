/**
 * QR-Anzeige als ein einziger Pfad.
 *
 * `qrcode` liefert die Modulmatrix als reines JavaScript. Gezeichnet wurde
 * sie frueher aus gewoehnlichen Views — ein Rechteck je zusammenhaengendem
 * dunklen Lauf, bei einem Handle-QR 447 Stueck. Das stand als Verdacht auf
 * Ruckeln in `OFFENE-PUNKTE.md`.
 *
 * Seit ADR-0016 traegt die App ohnehin `react-native-svg` fuer den
 * Symbolsatz. Damit werden aus den 447 Views 447 Teilstrecken *eines*
 * Pfades, und die Zeichenlast faellt auf ein Element.
 *
 * Die Zusammenfassung der Laeufe bleibt: sie kuerzt jetzt die
 * Pfadbeschreibung statt der Anzahl Views.
 */
import { useMemo } from "react";
import { View } from "react-native";
import Svg, { Path } from "react-native-svg";
import QRCode from "qrcode";
import { useApp } from "../state/store";

/** Ruhezone in Modulen, wie die Spezifikation sie verlangt. */
const QUIET = 4;

interface Run {
  row: number;
  from: number;
  len: number;
}

function runsOf(data: Uint8Array, size: number): Run[] {
  const runs: Run[] = [];
  for (let row = 0; row < size; row++) {
    let from = -1;
    for (let col = 0; col <= size; col++) {
      const dark = col < size && data[row * size + col] === 1;
      if (dark && from === -1) from = col;
      if (!dark && from !== -1) {
        runs.push({ row, from, len: col - from });
        from = -1;
      }
    }
  }
  return runs;
}

export function QrCode({ value, size = 240 }: { value: string; size?: number }) {
  const { palette } = useApp();

  const qr = useMemo(() => {
    const created = QRCode.create(value, { errorCorrectionLevel: "M" });
    const modules = created.modules.size;
    return {
      modules,
      runs: runsOf(created.modules.data as unknown as Uint8Array, modules),
    };
  }, [value]);

  // Auf ganze Pixel abrunden: ein krummer Modulabstand erzeugt Fugen, die
  // manche Scanner als Modulgrenze lesen.
  const cell = Math.max(1, Math.floor(size / (qr.modules + QUIET * 2)));
  const side = cell * (qr.modules + QUIET * 2);
  const offset = cell * QUIET;

  // Ein Rechteck je Lauf, alle in derselben Pfadbeschreibung.
  const d = useMemo(
    () =>
      qr.runs
        .map((r) => {
          const x = offset + r.from * cell;
          const y = offset + r.row * cell;
          return `M${x} ${y}h${r.len * cell}v${cell}h-${r.len * cell}z`;
        })
        .join(""),
    [qr.runs, cell, offset],
  );

  return (
    <View
      accessibilityRole="image"
      style={{
        width: side,
        height: side,
        backgroundColor: "#FFFFFF",
        alignSelf: "center",
        borderRadius: 8,
        borderWidth: 1,
        borderColor: palette.border,
      }}
    >
      <Svg width={side} height={side}>
        {/*
          Immer schwarz auf weiss, unabhaengig vom Thema: ein QR im
          Dunkelmodus mit invertierten Farben wird von vielen Kameras
          nicht erkannt.
        */}
        <Path d={d} fill="#000000" />
      </Svg>
    </View>
  );
}
