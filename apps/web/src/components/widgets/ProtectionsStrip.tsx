import { Pill, Zap, Shield, ShieldCheck, type LucideIcon } from "lucide-react";
import { shadow } from "../../theme/tokens";
import { useApp } from "../../state/store";
import { summarizeProtections } from "@sexdiary/core";
import { today } from "@sexdiary/core";
import { SectionLabel } from "../ui/Labels";

export function ProtectionsStrip() {
  const { data, palette, isDark, t } = useApp();
  const summary = summarizeProtections(data.vaccinations, today());
  const items: { Icon: LucideIcon; label: string; sub: string; color: string }[] = [];

  if (summary.prep.active) {
    items.push({
      Icon: Pill,
      label: t("prepActive"),
      sub: summary.prep.since ? t("prepActiveSub", { date: summary.prep.since }) : "",
      color: palette.teal,
    });
  }
  if (summary.doxy.recent) {
    items.push({
      Icon: Zap,
      label: t("doxyRecent"),
      sub: t("doxyRecentSub"),
      color: palette.amber,
    });
  }
  for (const v of summary.vaccines) {
    items.push({
      Icon: v.status === "immune" ? ShieldCheck : Shield,
      label: v.sti,
      sub: v.status === "immune" ? t("immune") : `${t("partial")} (${v.doses})`,
      color: v.status === "immune" ? palette.green : palette.amber,
    });
  }

  if (items.length === 0) return null;

  return (
    <div style={{ marginBottom: 18 }}>
      <SectionLabel>{t("protections")}</SectionLabel>
      <div
        style={{
          display: "flex",
          gap: 8,
          overflowX: "auto",
          padding: "2px 2px 4px",
          margin: "0 -2px",
        }}
      >
        {items.map((it, i) => (
          <div
            key={i}
            style={{
              flexShrink: 0,
              minWidth: 130,
              background: palette.card,
              borderRadius: 14,
              padding: "12px 14px",
              border: `1px solid ${palette.border}`,
              boxShadow: shadow(isDark),
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 10,
                background: it.color + "18",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <it.Icon size={16} color={it.color} strokeWidth={2.2} />
            </div>
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: it.color,
                  lineHeight: 1.2,
                }}
              >
                {it.label}
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: palette.muted,
                  marginTop: 2,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {it.sub}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
