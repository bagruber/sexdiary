/**
 * "Why this rating?" — the audit trail for a single STI's rating.
 *
 * Everything shown here is derived from RiskData.contributions, which the
 * risk engine emits alongside the score. Nothing is recomputed in the UI,
 * so what the user reads is exactly what the engine used.
 */
import { Modal, ScrollView, View } from "react-native";
import {
  WIKI,
  formatDate,
  plurals,
  riskColor,
  type ActKey,
  type RiskData,
} from "@sexdiary/core";
import { useApp } from "../state/store";
import { Card, GhostButton, SectionTitle, Text } from "../ui";

export function ExplainSheet({
  sti,
  risk,
  onClose,
}: {
  sti: string;
  risk: RiskData;
  onClose: () => void;
}) {
  const { data, t, palette } = useApp();
  const lang = data.prefs.lang;

  const contactName = (cid: string | null) =>
    cid
      ? (data.contacts.find((c) => c.id === cid)?.name ?? t("anonymousPartner"))
      : t("anonymousPartner");

  const remaining = Math.max((risk.wd ?? 0) - (risk.days ?? 0), 1);

  return (
    <Modal visible animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: palette.bg }}>
        <ScrollView contentContainerStyle={{ padding: 16, paddingTop: 48 }}>
          <Text style={{ color: palette.sub, fontSize: 13 }}>
            {t("whyThisRating")}
          </Text>
          <Text
            style={{
              color: palette.text,
              fontSize: 28,
              fontWeight: "700",
              marginTop: 2,
              marginBottom: 14,
            }}
          >
            {sti}
          </Text>

          {/* Not-scored cases get a direct answer and nothing else. */}
          {risk.preexisting && (
            <Card>
              <Text style={{ color: palette.text }}>
                {t("explainPreexisting", { sti })}
              </Text>
            </Card>
          )}
          {risk.vaccinated && (
            <Card>
              <Text style={{ color: palette.good }}>
                {t("explainVaccinated", { sti })}
              </Text>
            </Card>
          )}

          {!risk.preexisting && !risk.vaccinated && (
            <>
              <Card>
                <Text style={{ color: palette.text, lineHeight: 20 }}>
                  {risk.exposed
                    ? t("explainIntro")
                    : t("explainNoExposure", { sti })}
                </Text>
              </Card>

              {risk.exposed && (
                <>
                  <SectionTitle>{t("windowPeriod")}</SectionTitle>
                  <Card>
                    <Text style={{ color: palette.text, lineHeight: 20 }}>
                      {t("explainWindow", { sti, n: risk.wd ?? 0 })}
                    </Text>
                    <View style={{ marginTop: 12 }}>
                      <Text
                        style={{
                          color: risk.testable ? palette.good : palette.warn,
                          fontWeight: "600",
                          marginBottom: 8,
                        }}
                      >
                        {risk.testable
                          ? t("explainWindowClosed")
                          : t("explainWindowOpen", {
                              n: remaining,
                              ...plurals(t, remaining),
                            })}
                      </Text>
                    </View>
                  </Card>

                  <SectionTitle>{t("contributingEncounters")}</SectionTitle>
                  {(risk.contributions ?? []).map((c, i) => (
                    <Card key={`${c.date}-${i}`}>
                      <View
                        style={{
                          flexDirection: "row",
                          justifyContent: "space-between",
                        }}
                      >
                        <Text style={{ color: palette.text, fontWeight: "600" }}>
                          {formatDate(c.date, lang)}
                        </Text>
                        <Text
                          style={{
                            color: riskColor(palette, c.level),
                            fontSize: 12,
                            fontWeight: "600",
                          }}
                        >
                          {t(c.level)}
                        </Text>
                      </View>
                      <Text
                        style={{ color: palette.sub, fontSize: 13, marginTop: 4 }}
                      >
                        {contactName(c.cid)}
                      </Text>
                      <Text
                        style={{ color: palette.text, fontSize: 13, marginTop: 6 }}
                      >
                        {c.acts.map((a) => t(a as ActKey)).join(", ")}
                      </Text>
                      <Text
                        style={{
                          color:
                            c.protectedActs.length === c.acts.length
                              ? palette.good
                              : palette.sub,
                          fontSize: 12,
                          marginTop: 6,
                        }}
                      >
                        {c.protectedActs.length === c.acts.length
                          ? t("factorProtection")
                          : t("factorNoProtection")}
                      </Text>
                      {c.doxyReduced && (
                        <Text
                          style={{ color: palette.good, fontSize: 12, marginTop: 2 }}
                        >
                          {t("factorDoxy")}
                        </Text>
                      )}
                    </Card>
                  ))}
                </>
              )}

              {!!risk.prepExcluded && (
                <Card>
                  <Text style={{ color: palette.good, fontSize: 13 }}>
                    {t("explainPrepExcluded", {
                      n: risk.prepExcluded,
                      ...plurals(t, risk.prepExcluded),
                    })}
                  </Text>
                </Card>
              )}

              {risk.exposed && !!risk.sym?.length && (
                <>
                  <SectionTitle>{t("symptoms")}</SectionTitle>
                  <Card>
                    {risk.sym.map((s) => (
                      <Text
                        key={s}
                        style={{ color: palette.text, fontSize: 13, marginBottom: 4 }}
                      >
                        • {s}
                      </Text>
                    ))}
                  </Card>
                </>
              )}
            </>
          )}

          <Text
            style={{
              color: palette.sub,
              fontSize: 12,
              marginTop: 16,
              lineHeight: 17,
            }}
          >
            {t("explainSources")}
            {WIKI[sti] ? `\n${WIKI[sti]}` : ""}
          </Text>

          <GhostButton label={t("back")} onPress={onClose} />
          <View style={{ height: 32 }} />
        </ScrollView>
      </View>
    </Modal>
  );
}
