import { ICON_PATHS, ICON_STROKE, type IconName } from "@sexdiary/core";
import Svg, { Path } from "react-native-svg";

export type { IconName };

/**
 * Der Symbolsatz, gerendert fuer React Native.
 *
 * Die Pfaddaten liegen im Kern (`packages/core/src/icons.ts`), weil die
 * Infoseite dieselben Symbole zeichnet. Hier steht nur, wie sie auf
 * diesem Bildschirm zu Elementen werden.
 */
export function Icon({
  name,
  size = 22,
  color,
}: {
  name: IconName;
  size?: number;
  color: string;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {ICON_PATHS[name].map((d) => (
        <Path
          key={d}
          d={d}
          stroke={color}
          strokeWidth={ICON_STROKE}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
    </Svg>
  );
}
