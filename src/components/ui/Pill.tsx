import type { ReactNode } from "react";
import { FONT } from "../../theme/tokens";
import { useApp } from "../../state/store";

interface Props {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
  color?: string;
}

export function Pill({ active, onClick, children, color }: Props) {
  const { palette } = useApp();
  const c = color ?? palette.teal;
  return (
    <button
      onClick={onClick}
      style={{
        padding: "9px 16px",
        borderRadius: 20,
        minHeight: 38,
        background: active ? c : "transparent",
        border: `1.5px solid ${active ? c : palette.border}`,
        color: active ? "#fff" : palette.muted,
        fontFamily: FONT,
        fontSize: 13,
        fontWeight: 600,
        cursor: "pointer",
        transition: "all .15s",
      }}
    >
      {children}
    </button>
  );
}
