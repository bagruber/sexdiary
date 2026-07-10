import { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import {
  calcRisk,
  formatDate,
  nextAction,
  plurals,
  summarizeProtections,
  today,
  vaccineSeries,
  type RiskData,
} from "@sexdiary/core";
import { useApp } from "../state/store";
import { riskColor } from "../theme";
import { Card, Meter, Screen, SectionTitle, Title } from "../ui";
import { ExplainSheet } from "./ExplainSheet";

/**
 * The single sentence that answers "what should I do?". Everything else
 * on this screen is detail behind it.
 */
function NextActionCard({
  action,
  color,
}: {
  action: ReturnType<typeof nextAction>;
  color: string;
}) {
  const { t, palette } = useApp();

  let title: string;
  let sub: string;
  if (action.kind === "testNow") {
    title = t("naTestNow");
    sub = t("naTestNowSub", { names: action.testable.join(", ") });
  } else if (action.kind === "wait") {
    const n = action.soonestDays ?? 1;
    title = t("naWait");
    sub = t("naWaitSub", { sti: action.soonestSti ?? "", n, ...plurals(t, n) });
  } else {
    title = t("naAllClear");
    sub = t("naAllClearSub");
  }

  return (
    <Card style={{ borderLeftWidth: 4, borderLeftColor: color, paddingVertical: 18 }}>
      <Text style={{ color: palette.sub, fontSize: 11, letterSpacing: 0.8 }}>
        {t("nextAction").toUpperCase()}
      </Text>
      <Text
        style={{
          color: palette.text,
          fontSize: 21,
          fontWeight: "700",
          marginTop: 6,
        }}
      >
        {title}
      </Text>
      <Text style={{ color: palette.sub, marginTop: 6, lineHeight: 19 }}>
        {sub}
      </Text>
    </Card>
  );
}

function VaccineSeriesCard() {
  const { data, t, palette } = useApp();
  const series = useMemo(() => vaccineSeries(data.vaccinations), [data.vaccinations]);

  return (
    <Card>
      {series.map((s, i) => {
        const remaining = s.target - s.doses;
        return (
          <View key={s.sti} style={{ marginTop: i ? 16 : 0 }}>
            <View
              style={{ flexDirection: "row", justifyContent: "space-between" }}
            >
              <Text style={{ color: palette.text, fontWeight: "600" }}>
                {s.sti}
              </Text>
              <Text style={{ color: palette.sub, fontSize: 12 }}>
                {t("vaccineDoses", { have: s.doses, target: s.target })}
              </Text>
            </View>
            <View style={{ marginTop: 8 }}>
              <Meter
                pct={(s.doses / s.target) * 100}
                color={s.complete ? palette.good : palette.warn}
                label={s.sti}
              />
            </View>
            <Text
              style={{
                color: s.complete ? palette.good : palette.sub,
                fontSize: 12,
                marginTop: 6,
              }}
            >
              {s.complete
                ? t("vaccineComplete")
                : s.doses === 0
                  ? t("vaccineNotStarted")
                  : t("vaccineNextDose", {
                      n: remaining,
                      ...plurals(t, remaining),
                    })}
            </Text>
          </View>
        );
      })}
    </Card>
  );
}

function RiskRow({
  sti,
  risk,
  onPress,
}: {
  sti: string;
  risk: RiskData;
  onPress: () => void;
}) {
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
    const remaining = Math.max((risk.wd ?? 0) - (risk.days ?? 0), 1);
    status = t("notYetMeaningful", { n: remaining });
  } else {
    status = t("allClear");
    color = palette.good;
  }

  const pct = risk.exposed ? (risk.wPct ?? 0) * 100 : 0;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityHint={t("whyThisRating")}
      onPress={onPress}
    >
      <Card>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Text style={{ color: palette.text, fontSize: 16, fontWeight: "600" }}>
            {sti}
          </Text>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text style={{ color, fontSize: 13, fontWeight: "600" }}>
              {status}
            </Text>
            <Text style={{ color: palette.sub, marginLeft: 8 }}>›</Text>
          </View>
        </View>
        {risk.exposed && (
          <>
            <View style={{ marginTop: 10 }}>
              <Meter
                pct={pct}
                color={risk.testable ? palette.good : palette.warn}
                label={sti}
              />
            </View>
            <Text style={{ color: palette.sub, fontSize: 12, marginTop: 6 }}>
              {t("exposures", {
                n: risk.n ?? 0,
                s: (risk.n ?? 0) === 1 ? "" : "s",
              })}
              {risk.allP ? ` · ${t("allProtected")}` : ""}
            </Text>
          </>
        )}
      </Card>
    </Pressable>
  );
}

export function DashboardScreen() {
  const { data, t, palette } = useApp();
  const [explain, setExplain] = useState<string | null>(null);

  const report = useMemo(
    () =>
      calcRisk(
        data.intercourse,
        data.tests,
        data.vaccinations,
        data.prefs.country,
        data.profile.conditions,
      ),
    [
      data.intercourse,
      data.tests,
      data.vaccinations,
      data.prefs.country,
      data.profile.conditions,
    ],
  );

  const action = useMemo(() => nextAction(report), [report]);
  const actionColor =
    action.kind === "testNow"
      ? palette.warn
      : action.kind === "wait"
        ? palette.sub
        : palette.good;

  const prot = useMemo(
    () => summarizeProtections(data.vaccinations, today()),
    [data.vaccinations],
  );

  const entries = Object.entries(report.risks);

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Title>{t("dashboard")}</Title>

        <NextActionCard action={action} color={actionColor} />

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
          {!prot.prep.active && !prot.doxy.recent ? (
            <Text style={{ color: palette.sub }}>{t("noProtections")}</Text>
          ) : (
            <View>
              {prot.prep.active && (
                <Text style={{ color: palette.good, marginBottom: 4 }}>
                  {t("prepActive")}
                </Text>
              )}
              {prot.doxy.recent && (
                <Text style={{ color: palette.good }}>{t("doxyRecent")}</Text>
              )}
            </View>
          )}
        </Card>

        <SectionTitle>{t("vaccineSeriesTitle")}</SectionTitle>
        <VaccineSeriesCard />

        <SectionTitle>{t("riskAssessment")}</SectionTitle>
        {entries.map(([sti, risk]) => (
          <RiskRow
            key={sti}
            sti={sti}
            risk={risk}
            onPress={() => setExplain(sti)}
          />
        ))}
        <View style={{ height: 24 }} />
      </ScrollView>

      {explain && report.risks[explain] && (
        <ExplainSheet
          sti={explain}
          risk={report.risks[explain]}
          onClose={() => setExplain(null)}
        />
      )}
    </Screen>
  );
}
