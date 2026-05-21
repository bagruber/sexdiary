import type { ReactNode } from "react";
import { X } from "lucide-react";
import { FONT, shadowLg } from "../../theme/tokens";
import { useApp } from "../../state/store";

interface Props {
  onClose: () => void;
  children: ReactNode;
  title?: ReactNode;
}

export function Sheet({ onClose, children, title }: Props) {
  const { palette, isDark } = useApp();
  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: palette.overlay,
          zIndex: 50,
          backdropFilter: "blur(4px)",
          animation: "fadeIn .2s ease",
        }}
      />
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: "50%",
          transform: "translateX(-50%)",
          width: "100%",
          maxWidth: 430,
          background: palette.card,
          borderRadius: "22px 22px 0 0",
          zIndex: 51,
          paddingBottom: "max(24px, env(safe-area-inset-bottom, 24px))",
          animation: "slideUp .3s cubic-bezier(.32,.72,0,1)",
          maxHeight: "88vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: shadowLg(isDark),
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            padding: "12px 0 4px",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: 36,
              height: 4,
              borderRadius: 2,
              background: palette.border,
            }}
          />
        </div>
        {title && (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "4px 20px 14px",
              flexShrink: 0,
            }}
          >
            <span
              style={{
                fontFamily: FONT,
                fontSize: 18,
                fontWeight: 700,
                color: palette.text,
              }}
            >
              {title}
            </span>
            <button
              onClick={onClose}
              style={{
                background: "none",
                border: "none",
                color: palette.muted,
                cursor: "pointer",
                padding: 8,
                minWidth: 44,
                minHeight: 44,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <X size={22} />
            </button>
          </div>
        )}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "0 20px 20px",
            WebkitOverflowScrolling: "touch",
          }}
        >
          {children}
        </div>
      </div>
    </>
  );
}
