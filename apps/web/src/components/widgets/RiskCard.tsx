import { useState } from "react";
import { ChevronDown, Check, ExternalLink } from "lucide-react";
import { FONT, shadow } from "../../theme/tokens";
import { riskColor } from "../../theme/palette";
import { Tag } from "../ui";
import { useApp } from "../../state/store";
import type { RiskData } from "@sexdiary/core";
import { WIKI } from "@sexdiary/core";

interface Props {
  name: string;
  data: RiskData;
}

export function RiskCard({ name, data }: Props) {
  const { t, palette, isDark } = useApp();
  const [open, setOpen] = useState(false);
  const [rem, setRem] = useState(false);
  const color = riskColor(data.mr, isDark);
  const isT = !!data.testable;

  return (
    <div
      style={{
        background: palette.card,
        borderRadius: 16,
        overflow: "hidden",
        marginBottom: 10,
        border: isT
          ? `2px solid ${palette.green}50`
          : `1px solid ${palette.border}`,
        boxShadow: isT
          ? `0 0 0 1px ${palette.green}20, ${shadow(isDark)}`
          : shadow(isDark),
      }}
    >
      <div
        onClick={() => setOpen((o) => !o)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: 16,
          cursor: "pointer",
          minHeight: 64,
        }}
      >
        <div
          style={{
            width: 4,
            height: 44,
            borderRadius: 2,
            background: isT ? palette.green : color,
            flexShrink: 0,
          }}
        />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 3,
              flexWrap: "wrap",
            }}
          >
            <span
              style={{
                fontFamily: FONT,
                fontWeight: 700,
                fontSize: 15,
                color: palette.text,
              }}
            >
              {name}
            </span>
            {data.isPositive && (
              <Tag color={palette.rose} small filled>
                {t("positive")}
              </Tag>
            )}
            {data.highPrev && (
              <Tag color={palette.amber} small>
                {t("highPrevalence")}
              </Tag>
            )}
          </div>
          <div
            style={{
              fontFamily: FONT,
              fontSize: 12,
              color: isT ? palette.green : palette.muted,
              fontWeight: isT ? 700 : 400,
            }}
          >
            <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
              {isT && <Check size={12} strokeWidth={3} />}
              {isT
                ? t("testableNow")
                : t("notYetMeaningful", { n: (data.wd ?? 0) - (data.days ?? 0) })}
            </span>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
          <Tag color={color}>{t(data.mr ?? "none")}</Tag>
          {data.allP && (
            <span
              style={{
                fontFamily: FONT,
                fontSize: 10,
                color: palette.green,
                fontWeight: 600,
              }}
            >
              {t("allProtected")}
            </span>
          )}
        </div>
        <span
          style={{
            color: palette.muted,
            marginLeft: 4,
            display: "inline-flex",
            transition: "transform .2s",
            transform: open ? "rotate(180deg)" : "none",
          }}
        >
          <ChevronDown size={16} />
        </span>
      </div>
      {!isT && (
        <div style={{ padding: "0 16px 14px" }}>
          <div
            style={{
              position: "relative",
              height: 6,
              borderRadius: 3,
              background: palette.cardEl,
              overflow: "visible",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${(data.wPct ?? 0) * 100}%`,
                background: color,
                borderRadius: 3,
                transition: "width .4s ease",
              }}
            />
            <div
              style={{
                position: "absolute",
                right: -1,
                top: -3,
                width: 12,
                height: 12,
                borderRadius: "50%",
                background: palette.green,
                border: `2.5px solid ${palette.card}`,
                boxShadow: `0 0 0 1px ${palette.green}40`,
              }}
            />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
            <span style={{ fontFamily: FONT, fontSize: 10, color: palette.muted }}>
              {data.days}d / {data.wd}d
            </span>
            <span style={{ fontFamily: FONT, fontSize: 10, color: palette.muted }}>
              {t("exposures", { n: data.n ?? 0, s: (data.n ?? 0) > 1 ? "s" : "" })}
            </span>
          </div>
          {!open && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setRem((r) => !r);
              }}
              style={{
                width: "100%",
                padding: 10,
                marginTop: 12,
                borderRadius: 10,
                minHeight: 40,
                background: rem ? palette.green + "0C" : palette.cardEl,
                border: `1.5px solid ${rem ? palette.green : palette.border}`,
                fontFamily: FONT,
                fontSize: 12,
                color: rem ? palette.green : palette.muted,
                fontWeight: 600,
                cursor: "pointer",
                transition: "all .15s",
              }}
            >
              {rem ? t("cancelReminder") : t("notifyWhenReady")}
            </button>
          )}
        </div>
      )}
      {open && (
        <div style={{ padding: "0 16px 16px", borderTop: `1px solid ${palette.border}` }}>
          <div style={{ fontFamily: FONT, fontSize: 12, color: palette.muted, margin: "14px 0 8px" }}>
            {t("exposures", { n: data.n ?? 0, s: (data.n ?? 0) > 1 ? "s" : "" })}
          </div>
          <div
            style={{
              fontFamily: FONT,
              fontSize: 11,
              fontWeight: 700,
              color: palette.muted,
              letterSpacing: ".07em",
              textTransform: "uppercase",
              marginBottom: 10,
            }}
          >
            {t("symptoms")}
          </div>
          {(data.sym ?? []).map((s, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                gap: 8,
                alignItems: "flex-start",
                marginBottom: 8,
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: color,
                  marginTop: 6,
                  flexShrink: 0,
                }}
              />
              <span style={{ fontFamily: FONT, fontSize: 13, color: palette.text, lineHeight: 1.55 }}>
                {s}
              </span>
            </div>
          ))}
          <a
            href={WIKI[name]}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontFamily: FONT,
              fontSize: 12,
              color: palette.teal,
              fontWeight: 600,
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              marginTop: 4,
            }}
          >
            {t("moreInfo")}
            <ExternalLink size={12} />
          </a>
        </div>
      )}
    </div>
  );
}
