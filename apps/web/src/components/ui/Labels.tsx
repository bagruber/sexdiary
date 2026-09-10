import type { ReactNode } from "react";
import { useApp } from "../../state/store";

export function SectionLabel({ children }: { children: ReactNode }) {
  const { palette } = useApp();
  return (
    <div
      style={{
        fontSize: 11,
        fontWeight: 700,
        color: palette.muted,
        letterSpacing: ".07em",
        textTransform: "uppercase",
        marginBottom: 10,
      }}
    >
      {children}
    </div>
  );
}

export function FieldLabel({ children }: { children: ReactNode }) {
  const { palette } = useApp();
  return (
    <label
      style={{
        fontSize: 12,
        fontWeight: 600,
        color: palette.muted,
        display: "block",
        marginBottom: 6,
      }}
    >
      {children}
    </label>
  );
}
