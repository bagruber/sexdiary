import type { CSSProperties, ReactNode } from "react";
import { FONT } from "../../theme/tokens";

interface Props {
  color: string;
  children: ReactNode;
  small?: boolean;
  filled?: boolean;
  style?: CSSProperties;
}

export function Tag({ color, children, small, filled, style }: Props) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: small ? "3px 9px" : "4px 12px",
        borderRadius: 20,
        background: filled ? color : color + "14",
        border: `1px solid ${color}40`,
        color: filled ? "#fff" : color,
        fontSize: small ? 10 : 11,
        fontWeight: 600,
        letterSpacing: ".02em",
        whiteSpace: "nowrap",
        fontFamily: FONT,
        ...style,
      }}
    >
      {children}
    </span>
  );
}
