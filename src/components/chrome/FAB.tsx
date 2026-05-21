import { useState, type ReactNode } from "react";
import { FONT } from "../../theme/tokens";
import { useApp } from "../../state/store";
import type { EditType } from "../sheets/AddEditSheet";

interface Props {
  onAdd: (kind: EditType) => void;
}

type ColorKey = "rose" | "teal" | "muted" | "amber";

interface Item {
  id: EditType;
  color: ColorKey;
  label: string;
  icon: ReactNode;
}

const ICONS: Record<EditType, ReactNode> = {
  intercourse: (
    <svg
      width={18}
      height={18}
      viewBox="0 0 24 24"
      fill="none"
      stroke="#fff"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  ),
  test: (
    <svg
      width={18}
      height={18}
      viewBox="0 0 24 24"
      fill="none"
      stroke="#fff"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  ),
  contact: (
    <svg
      width={18}
      height={18}
      viewBox="0 0 24 24"
      fill="none"
      stroke="#fff"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  vaccination: (
    <svg
      width={18}
      height={18}
      viewBox="0 0 24 24"
      fill="none"
      stroke="#fff"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
};

export function FAB({ onAdd }: Props) {
  const { palette, t } = useApp();
  const [open, setOpen] = useState(false);

  const items: Item[] = [
    { id: "intercourse", color: "rose", label: t("intercourse"), icon: ICONS.intercourse },
    { id: "test", color: "teal", label: t("testEntry"), icon: ICONS.test },
    { id: "contact", color: "muted", label: t("contact"), icon: ICONS.contact },
    { id: "vaccination", color: "amber", label: t("vaccination"), icon: ICONS.vaccination },
  ];

  const colorFor = (k: Item["color"]): string => {
    switch (k) {
      case "rose":
        return palette.rose;
      case "teal":
        return palette.teal;
      case "amber":
        return palette.amber;
      default:
        return palette.muted;
    }
  };

  return (
    <>
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 38,
            background: "rgba(0,0,0,.12)",
          }}
        />
      )}
      {open &&
        items.map((it, i) => {
          const c = colorFor(it.color);
          return (
            <div
              key={it.id}
              style={{
                position: "absolute",
                bottom: 82 + (i + 1) * 56,
                right: 18,
                display: "flex",
                alignItems: "center",
                gap: 10,
                zIndex: 39,
                animation: `fabItem .2s ease ${i * 0.04}s both`,
              }}
            >
              <div
                style={{
                  fontFamily: FONT,
                  fontSize: 12,
                  fontWeight: 600,
                  color: palette.text,
                  background: palette.card,
                  padding: "5px 12px",
                  borderRadius: 8,
                  boxShadow: "0 2px 8px rgba(0,0,0,.08)",
                  whiteSpace: "nowrap",
                }}
              >
                {it.label}
              </div>
              <button
                onClick={() => {
                  setOpen(false);
                  onAdd(it.id);
                }}
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: 14,
                  background: c,
                  border: "none",
                  color: "#fff",
                  cursor: "pointer",
                  boxShadow: `0 3px 12px ${c}40`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {it.icon}
              </button>
            </div>
          );
        })}
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          position: "absolute",
          bottom: 76,
          right: 18,
          width: 54,
          height: 54,
          borderRadius: 16,
          background: palette.teal,
          border: "none",
          color: "#fff",
          fontSize: 26,
          fontWeight: 300,
          cursor: "pointer",
          boxShadow: `0 4px 16px ${palette.teal}59`,
          zIndex: 39,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          lineHeight: 1,
          transition: "transform .25s cubic-bezier(.32,.72,0,1)",
          transform: open ? "rotate(45deg)" : "rotate(0deg)",
        }}
      >
        +
      </button>
    </>
  );
}
