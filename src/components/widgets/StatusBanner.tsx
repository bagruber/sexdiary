import { FONT } from "../../theme/tokens";
import { useApp } from "../../state/store";

interface Props {
  state: "testable" | "window" | "clear";
  primary: string;
  secondary: string;
}

const ICONS = {
  testable: "🩺",
  window: "⏳",
  clear: "✓",
} as const;

export function StatusBanner({ state, primary, secondary }: Props) {
  const { palette } = useApp();
  const color =
    state === "testable" ? palette.green : state === "window" ? palette.amber : palette.green;
  return (
    <div
      style={{
        background: color + "0A",
        border: `1.5px solid ${color}40`,
        borderRadius: 16,
        padding: "16px 18px",
        marginBottom: 14,
        display: "flex",
        alignItems: "center",
        gap: 14,
      }}
    >
      <div
        style={{
          width: 42,
          height: 42,
          borderRadius: 12,
          background: color + "18",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 20,
          flexShrink: 0,
        }}
      >
        {ICONS[state]}
      </div>
      <div style={{ minWidth: 0 }}>
        <div
          style={{
            fontFamily: FONT,
            fontWeight: 700,
            fontSize: 15,
            color,
            marginBottom: 2,
          }}
        >
          {primary}
        </div>
        <div
          style={{
            fontFamily: FONT,
            fontSize: 12,
            color: palette.sub,
            lineHeight: 1.4,
          }}
        >
          {secondary}
        </div>
      </div>
    </div>
  );
}
