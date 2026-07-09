import type { ReactNode } from "react";
import { shadowLg } from "../../theme/tokens";
import { useApp } from "../../state/store";

interface Props {
  onClose: () => void;
  children: ReactNode;
  width?: number;
}

export function Modal({ onClose, children, width = 380 }: Props) {
  const { palette, isDark } = useApp();
  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: palette.overlay,
          zIndex: 60,
          backdropFilter: "blur(4px)",
          animation: "fadeIn .2s ease",
        }}
      />
      <div
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "calc(100% - 48px)",
          maxWidth: width,
          background: palette.card,
          borderRadius: 22,
          zIndex: 61,
          padding: "28px 24px",
          boxShadow: shadowLg(isDark),
          animation: "popIn .25s ease",
        }}
      >
        {children}
      </div>
    </>
  );
}
