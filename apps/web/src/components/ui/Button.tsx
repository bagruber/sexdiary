import type { CSSProperties, ReactNode } from "react";
import { useApp } from "../../state/store";

interface Props {
  onClick?: () => void;
  children: ReactNode;
  color?: string;
  outline?: boolean;
  danger?: boolean;
  full?: boolean;
  small?: boolean;
  disabled?: boolean;
  style?: CSSProperties;
}

export function Button({
  onClick,
  children,
  color,
  outline,
  danger,
  full,
  small,
  disabled,
  style,
}: Props) {
  const { palette } = useApp();
  const base = color ?? palette.teal;
  const c = danger ? palette.rose : base;
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: small ? "9px 14px" : "13px 22px",
        borderRadius: 12,
        minHeight: 44,
        background: outline ? "transparent" : c,
        border: `1.5px solid ${c}`,
        color: outline ? c : "#fff",
        fontSize: small ? 13 : 14,
        fontWeight: 600,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.45 : 1,
        transition: "all .15s",
        textAlign: "center",
        width: full ? "100%" : "auto",
        ...style,
      }}
    >
      {children}
    </button>
  );
}
