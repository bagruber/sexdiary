/**
 * QR-Anzeige ohne react-native-svg.
 *
 * `qrcode` liefert die Modulmatrix als reines JavaScript; gezeichnet wird
 * sie hier aus gewoehnlichen Views. Das spart zwei Abhaengigkeiten —
 * react-native-svg und einen Wrapper darum — fuer eine Flaeche, die aus
 * Quadraten besteht.
 *
 * Zusammenhaengende dunkle Module werden zu einem Rechteck
 * zusammengefasst. Ohne das waeren es je nach Datenmenge vierhundert bis
 * tausend Views; mit Zusammenfassung sind es typischerweise unter
 * zweihundert.
 */
import { useMemo } from "react";
import { View } from "react-native";
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
      {qr.runs.map((r) => (
        <View
          key={`${r.row}-${r.from}`}
          style={{
            position: "absolute",
            left: offset + r.from * cell,
            top: offset + r.row * cell,
            width: r.len * cell,
            height: cell,
            // Immer schwarz auf weiss, unabhaengig vom Thema: ein QR im
            // Dunkelmodus mit invertierten Farben wird von vielen
            // Kameras nicht erkannt.
            backgroundColor: "#000000",
          }}
        />
      ))}
    </View>
  );
}
