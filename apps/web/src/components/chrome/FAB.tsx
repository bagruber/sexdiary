import { useState } from "react";
import {
  Plus,
  Heart,
  FileText,
  UserPlus,
  Shield,
  type LucideIcon,
} from "lucide-react";
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
  Icon: LucideIcon;
}

const ICONS: Record<EditType, LucideIcon> = {
  intercourse: Heart,
  test: FileText,
  contact: UserPlus,
  vaccination: Shield,
};

export function FAB({ onAdd }: Props) {
  const { palette, t } = useApp();
  const [open, setOpen] = useState(false);

  const items: Item[] = [
    { id: "intercourse", color: "rose", label: t("intercourse"), Icon: ICONS.intercourse },
    { id: "test", color: "teal", label: t("testEntry"), Icon: ICONS.test },
    { id: "contact", color: "muted", label: t("contact"), Icon: ICONS.contact },
    { id: "vaccination", color: "amber", label: t("vaccination"), Icon: ICONS.vaccination },
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
                <it.Icon size={18} color="#fff" strokeWidth={2} />
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
          cursor: "pointer",
          boxShadow: `0 4px 16px ${palette.teal}59`,
          zIndex: 39,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "transform .25s cubic-bezier(.32,.72,0,1)",
          transform: open ? "rotate(45deg)" : "rotate(0deg)",
        }}
      >
        <Plus size={26} color="#fff" strokeWidth={2.2} />
      </button>
    </>
  );
}
