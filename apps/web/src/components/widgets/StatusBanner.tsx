import { Stethoscope, Clock, CheckCircle2, type LucideIcon } from "lucide-react";
import { useApp } from "../../state/store";

interface Props {
  state: "testable" | "window" | "clear";
  primary: string;
  secondary: string;
}

const ICONS: Record<Props["state"], LucideIcon> = {
  testable: Stethoscope,
  window: Clock,
  clear: CheckCircle2,
};

export function StatusBanner({ state, primary, secondary }: Props) {
  const { palette } = useApp();
  const color =
    state === "testable" ? palette.green : state === "window" ? palette.amber : palette.green;
  const Icon = ICONS[state];
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
          flexShrink: 0,
        }}
      >
        <Icon size={22} color={color} strokeWidth={2} />
      </div>
      <div style={{ minWidth: 0 }}>
        <div
          style={{
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
