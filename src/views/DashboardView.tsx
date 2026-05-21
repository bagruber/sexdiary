import { AlertTriangle, Bell, ChevronRight } from "lucide-react";
import { FONT, shadow } from "../theme/tokens";
import { useApp } from "../state/store";
import { calcRisk, getAlerts, type RiskData } from "../lib/risk";
import { RISK_ORDER } from "../types/domain";
import { formatDate } from "../lib/date";
import { STI_NAMES } from "../data/stis";
import { SectionLabel } from "../components/ui";
import { RiskCard } from "../components/widgets/RiskCard";
import { StatusBanner } from "../components/widgets/StatusBanner";
import { ProtectionsStrip } from "../components/widgets/ProtectionsStrip";

interface Props {
  onAlerts: () => void;
}

export function DashboardView({ onAlerts }: Props) {
  const { data, palette, isDark, t } = useApp();
  const { lastTest, risks, lastMap } = calcRisk(
    data.intercourse,
    data.tests,
    data.vaccinations,
    data.prefs.country,
    data.profile.conditions,
  );
  const lang = data.prefs.lang;

  const exposed = (Object.entries(risks) as [string, RiskData][]).filter(
    ([, r]) => r.exposed && RISK_ORDER[r.mr ?? "none"] > RISK_ORDER.negligible,
  );
  const testable = exposed.filter(([, r]) => r.testable);
  const inWindow = exposed.filter(([, r]) => !r.testable);
  const daysSince = lastTest
    ? Math.floor((Date.now() - new Date(lastTest.date + "T12:00:00").getTime()) / 86_400_000)
    : null;
  const alerts = getAlerts(data.tests, data.intercourse, data.contacts);

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "28px 16px 100px" }}>
      <div style={{ marginBottom: 24 }}>
        <h1
          style={{
            fontFamily: FONT,
            fontSize: 26,
            fontWeight: 700,
            color: palette.text,
            margin: "0 0 4px",
          }}
        >
          {t("dashboard")}
        </h1>
        <p
          style={{
            fontFamily: FONT,
            fontSize: 13,
            color: palette.muted,
            margin: 0,
          }}
        >
          {new Date().toLocaleDateString(lang === "de" ? "de-DE" : "en-GB", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>
      </div>

      {testable.length > 0 && (
        <StatusBanner
          state="testable"
          primary={t("testNow")}
          secondary={t("testNowBanner", {
            names: testable.map(([n]) => n).join(", "),
          })}
        />
      )}
      {inWindow.length > 0 && testable.length === 0 && (
        <StatusBanner
          state="window"
          primary={t("windowPeriod")}
          secondary={t("windowPeriodSub")}
        />
      )}
      {exposed.length === 0 && (
        <StatusBanner
          state="clear"
          primary={t("allClear")}
          secondary={t("allClearSub")}
        />
      )}

      {alerts.length > 0 && (
        <button
          onClick={onAlerts}
          style={{
            width: "100%",
            padding: "14px 18px",
            borderRadius: 16,
            marginBottom: 14,
            background: palette.rose + "06",
            border: `1.5px solid ${palette.rose}40`,
            display: "flex",
            alignItems: "center",
            gap: 14,
            cursor: "pointer",
          }}
        >
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: 12,
              background: palette.rose + "14",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Bell size={20} color={palette.rose} strokeWidth={2} />
          </div>
          <div style={{ flex: 1, textAlign: "left" }}>
            <div
              style={{
                fontFamily: FONT,
                fontWeight: 700,
                fontSize: 14,
                color: palette.rose,
              }}
            >
              {t("partnerAlerts")}
            </div>
            <div style={{ fontFamily: FONT, fontSize: 12, color: palette.muted }}>
              {t("partnerAlertsSub")}
            </div>
          </div>
          <ChevronRight size={18} color={palette.rose} />
        </button>
      )}

      <ProtectionsStrip />

      <SectionLabel>{t("lastTest")}</SectionLabel>
      {lastTest ? (
        <div
          style={{
            background: palette.card,
            borderRadius: 16,
            padding: "16px 18px",
            marginBottom: 24,
            border: `1px solid ${palette.border}`,
            boxShadow: shadow(isDark),
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: 14,
            }}
          >
            <div>
              <div
                style={{
                  fontFamily: FONT,
                  fontWeight: 700,
                  fontSize: 15,
                  color: palette.text,
                  marginBottom: 3,
                }}
              >
                {lastTest.fac}
              </div>
              <div style={{ fontFamily: FONT, fontSize: 12, color: palette.muted }}>
                {formatDate(lastTest.date, lang)} · #{lastTest.num}
              </div>
            </div>
            <div
              style={{
                fontFamily: FONT,
                fontSize: 12,
                color: palette.teal,
                fontWeight: 600,
              }}
            >
              {t("daysAgo", { n: daysSince ?? 0 })}
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            {[...STI_NAMES]
              .sort((a, b) => {
                const ra = risks[a];
                const rb = risks[b];
                const aTested = !!lastMap[a];
                const bTested = !!lastMap[b];
                if (aTested !== bTested) return aTested ? -1 : 1;
                const aPos = lastMap[a]?.result === "positive" ? 1 : 0;
                const bPos = lastMap[b]?.result === "positive" ? 1 : 0;
                if (aPos !== bPos) return bPos - aPos;
                return RISK_ORDER[rb?.mr ?? "none"] - RISK_ORDER[ra?.mr ?? "none"];
              })
              .map((sti) => {
                const info = lastMap[sti];
                const r = risks[sti];
                const isR = r?.exposed && RISK_ORDER[r.mr ?? "none"] > RISK_ORDER.negligible;
                return (
                  <div
                    key={sti}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: FONT,
                        fontSize: 13,
                        color: info ? (isR ? palette.text : palette.sub) : palette.muted,
                        fontWeight: isR ? 600 : 400,
                      }}
                    >
                      {sti}
                    </span>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                        fontFamily: FONT,
                        fontSize: 11,
                        color: info
                          ? info.result === "positive"
                            ? palette.rose
                            : palette.muted
                          : palette.muted,
                      }}
                    >
                      {info ? formatDate(info.date, lang) : t("notTested")}
                      {info?.result === "positive" && (
                        <AlertTriangle size={11} color={palette.rose} />
                      )}
                    </span>
                  </div>
                );
              })}
          </div>
        </div>
      ) : (
        <div
          style={{
            background: palette.card,
            borderRadius: 16,
            padding: "16px 18px",
            marginBottom: 24,
            border: `1px solid ${palette.border}`,
          }}
        >
          <div style={{ fontFamily: FONT, fontSize: 14, color: palette.muted }}>
            {t("noTests")}
          </div>
        </div>
      )}

      {testable.length > 0 && (
        <>
          <SectionLabel>{t("testNow")}</SectionLabel>
          {testable
            .sort(([, a], [, b]) => RISK_ORDER[b.mr ?? "none"] - RISK_ORDER[a.mr ?? "none"])
            .map(([n, d]) => (
              <RiskCard key={n} name={n} data={d} />
            ))}
        </>
      )}
      {inWindow.length > 0 && (
        <>
          <SectionLabel>
            {t("riskAssessment")} ·{" "}
            <span style={{ fontWeight: 400 }}>
              {t("sinceLastTest")} · {t("tapExpand")}
            </span>
          </SectionLabel>
          {inWindow
            .sort(([, a], [, b]) => RISK_ORDER[b.mr ?? "none"] - RISK_ORDER[a.mr ?? "none"])
            .map(([n, d]) => (
              <RiskCard key={n} name={n} data={d} />
            ))}
        </>
      )}
    </div>
  );
}
