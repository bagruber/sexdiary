import { LayoutGrid, Calendar, QrCode, Settings, type LucideIcon } from "lucide-react";
import { FONT } from "../../theme/tokens";
import { useApp } from "../../state/store";

export type ViewId = "dashboard" | "calendar" | "share" | "settings";

interface Props {
  view: ViewId;
  setView: (v: ViewId) => void;
}

const TAB_ICONS: Record<ViewId, LucideIcon> = {
  dashboard: LayoutGrid,
  calendar: Calendar,
  share: QrCode,
  settings: Settings,
};

export function BottomNav({ view, setView }: Props) {
  const { palette, t } = useApp();
  const tabs: { id: ViewId; label: string }[] = [
    { id: "dashboard", label: t("dashboard") },
    { id: "calendar", label: t("calendar") },
    { id: "share", label: t("share") },
    { id: "settings", label: t("settings") },
  ];
  return (
    <nav
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        background: palette.bg + "F2",
        borderTop: `1px solid ${palette.border}`,
        display: "flex",
        paddingBottom: "env(safe-area-inset-bottom, 8px)",
        zIndex: 40,
        backdropFilter: "blur(20px)",
      }}
    >
      {tabs.map((tb) => {
        const Icon = TAB_ICONS[tb.id];
        const active = view === tb.id;
        return (
          <button
            key={tb.id}
            onClick={() => setView(tb.id)}
            style={{
              flex: 1,
              padding: "10px 0 8px",
              background: "none",
              border: "none",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 3,
              cursor: "pointer",
              color: active ? palette.teal : palette.muted,
              transition: "color .2s",
              minHeight: 50,
            }}
          >
            <Icon size={21} strokeWidth={active ? 2.2 : 1.8} />
            <span
              style={{
                fontFamily: FONT,
                fontSize: 10,
                letterSpacing: ".04em",
                fontWeight: active ? 700 : 400,
              }}
            >
              {tb.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
