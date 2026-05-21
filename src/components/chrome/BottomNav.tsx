import type { ReactNode } from "react";
import { FONT } from "../../theme/tokens";
import { useApp } from "../../state/store";

export type ViewId = "dashboard" | "calendar" | "share" | "settings";

interface Props {
  view: ViewId;
  setView: (v: ViewId) => void;
}

const icon = (path: ReactNode) => (
  <svg
    width={21}
    height={21}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.8}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {path}
  </svg>
);

const TAB_ICONS: Record<ViewId, ReactNode> = {
  dashboard: icon(
    <>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </>,
  ),
  calendar: icon(
    <>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </>,
  ),
  share: icon(
    <>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <rect x="7" y="7" width="3" height="3" />
      <rect x="14" y="7" width="3" height="3" />
      <rect x="7" y="14" width="3" height="3" />
      <rect x="14" y="14" width="3" height="3" />
    </>,
  ),
  settings: icon(
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </>,
  ),
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
      {tabs.map((tb) => (
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
            color: view === tb.id ? palette.teal : palette.muted,
            transition: "color .2s",
            minHeight: 50,
          }}
        >
          {TAB_ICONS[tb.id]}
          <span
            style={{
              fontFamily: FONT,
              fontSize: 10,
              letterSpacing: ".04em",
              fontWeight: view === tb.id ? 700 : 400,
            }}
          >
            {tb.label}
          </span>
        </button>
      ))}
    </nav>
  );
}
