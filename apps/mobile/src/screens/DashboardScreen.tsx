import { useMemo } from "react";
import { ScrollView, Text, View } from "react-native";
import {
  calcRisk,
  formatDate,
  summarizeProtections,
  today,
  type RiskData,
} from "@sexdiary/core";
import { useApp } from "../state/store";
import { riskColor } from "../theme";
import { Card, Screen, SectionTitle, Title } from "../ui";

function RiskRow({ sti, risk }: { sti: string; risk: RiskData }) {
  const { t, palette } = useApp();
  const colors = riskColor(palette);

  let status: string;
  let color = palette.sub;
  if (risk.preexisting) {
    status = t("preexisting");
  } else if (risk.vaccinated) {
    status = t("immune");
    color = palette.good;
  } else if (risk.isPositive) {
    status = t("positive");
    color = palette.bad;
  } else if (risk.exposed && risk.testable) {
    status = t("testableNow");
    color = risk.mr ? colors[risk.mr] : palette.warn;
  } else if (risk.exposed) {
    status = t("notYetMeaningful", {
      n: Math.max((risk.wd ?? 0) - (risk.days ?? 0), 1),
    });
    color = palette.sub;
  } else {
    status = t("allClear");
    color = palette.good;
  }

  const pct = risk.exposed ? Math.round((risk.wPct ?? 0) * 100) : 0;

  return (
    <Card>
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <Text style={{ color: palette.text, fontSize: 16, fontWeight: "600" }}>
          {sti}
        </Text>
        <Text style={{ color, fontSize: 13, fontWeight: "600" }}>{status}</Text>
      </View>
      {risk.exposed && (
        <View
          accessibilityRole="progressbar"
          accessibilityValue={{ min: 0, max: 100, now: pct }}
          style={{
            height: 6,
            borderRadius: 3,
            backgroundColor: palette.border,
            marginTop: 10,
            overflow: "hidden",
          }}
        >
          <View
            style={{
              width: `${pct}%`,
              height: 6,
              backgroundColor: risk.testable ? palette.good : palette.warn,
            }}
          />
        </View>
      )}
      {risk.exposed && (
        <Text style={{ color: palette.sub, fontSize: 12, marginTop: 6 }}>
          {t("exposures", {
            n: risk.n ?? 0,
            s: (risk.n ?? 0) === 1 ? "" : "s",
          })}
          {risk.allP ? ` · ${t("allProtected")}` : ""}
        </Text>
      )}
    </Card>
  );
}

export function DashboardScreen() {
  const { data, t, palette } = useApp();

  const report = useMemo(
    () =>
      calcRisk(
        data.intercourse,
        data.tests,
        data.vaccinations,
        data.prefs.country,
        data.profile.conditions,
      ),
    [data.intercourse, data.tests, data.vaccinations, data.prefs.country, data.profile.conditions],
  );

  const entries = Object.entries(report.risks);
  const testable = entries.filter(([, r]) => r.exposed && r.testable);
  const inWindow = entries.filter(([, r]) => r.exposed && !r.testable);

  const banner = testable.length
    ? {
        title: t("testingRecommended"),
        sub: t("testingRecommendedSub", {
          n: testable.length,
          s: testable.length === 1 ? "" : "s",
        }),
        color: palette.warn,
      }
    : inWindow.length
      ? { title: t("windowPeriod"), sub: t("windowPeriodSub"), color: palette.sub }
      : { title: t("allClear"), sub: t("allClearSub"), color: palette.good };

  const prot = useMemo(
    () => summarizeProtections(data.vaccinations, today()),
    [data.vaccinations],
  );

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Title>{t("dashboard")}</Title>

        <Card style={{ borderLeftWidth: 4, borderLeftColor: banner.color }}>
          <Text style={{ color: palette.text, fontSize: 17, fontWeight: "700" }}>
            {banner.title}
          </Text>
          <Text style={{ color: palette.sub, marginTop: 4 }}>{banner.sub}</Text>
        </Card>

        <SectionTitle>{t("lastTest")}</SectionTitle>
        <Card>
          <Text style={{ color: palette.text }}>
            {report.lastTest
              ? formatDate(report.lastTest.date, data.prefs.lang)
              : t("noTests")}
          </Text>
        </Card>

        <SectionTitle>{t("protections")}</SectionTitle>
        <Card>
          {!prot.prep.active && !prot.doxy.recent && prot.vaccines.length === 0 ? (
            <Text style={{ color: palette.sub }}>{t("noProtections")}</Text>
          ) : (
            <View>
              {prot.prep.active && (
                <Text style={{ color: palette.good, marginBottom: 4 }}>
                  {t("prepActive")}
                </Text>
              )}
              {prot.doxy.recent && (
                <Text style={{ color: palette.good, marginBottom: 4 }}>
                  {t("doxyRecent")}
                </Text>
              )}
              {prot.vaccines.map((v) => (
                <Text key={v.sti} style={{ color: palette.text, marginBottom: 4 }}>
                  {v.sti}: {v.status === "immune" ? t("immune") : t("partial")}{" "}
                  ({v.doses})
                </Text>
              ))}
            </View>
          )}
        </Card>

        <SectionTitle>{t("riskAssessment")}</SectionTitle>
        {entries.map(([sti, risk]) => (
          <RiskRow key={sti} sti={sti} risk={risk} />
        ))}
        <View style={{ height: 24 }} />
      </ScrollView>
    </Screen>
  );
}
