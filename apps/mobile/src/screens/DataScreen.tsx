/**
 * "Your data" — a plain-language statement of where data lives, plus a
 * raw viewer. People trust what they can inspect; this screen exists to
 * be checkable rather than believed.
 */
import { useMemo, useState } from "react";
import { Modal, Platform, ScrollView, View } from "react-native";
import { useApp } from "../state/store";
import { Card, GhostButton, Row, SectionTitle, Text } from "../ui";

export function DataScreen({ onClose }: { onClose: () => void }) {
  const { data, t, palette } = useApp();
  const [showRaw, setShowRaw] = useState(false);

  const raw = useMemo(() => JSON.stringify(data, null, 2), [data]);

  const counts: { label: string; n: number }[] = [
    { label: t("dataEncounters"), n: data.intercourse.length },
    { label: t("dataTests"), n: data.tests.length },
    { label: t("dataContacts"), n: data.contacts.length },
    { label: t("dataVaccinations"), n: data.vaccinations.length },
  ];

  return (
    <Modal visible animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: palette.bg }}>
        <ScrollView contentContainerStyle={{ padding: 16, paddingTop: 48 }}>
          <Text style={{ color: palette.text, fontSize: 26, fontWeight: "700" }}>
            {t("yourData")}
          </Text>
          <Text style={{ color: palette.sub, marginTop: 4 }}>
            {t("yourDataSub")}
          </Text>

          <SectionTitle>{t("dataFlowTitle")}</SectionTitle>
          <Card>
            <Text style={{ color: palette.text, lineHeight: 21 }}>
              {t("dataFlowBody")}
            </Text>
            <Text
              style={{
                color: palette.good,
                marginTop: 12,
                fontWeight: "600",
                lineHeight: 20,
              }}
            >
              {t("dataNeverLeaves")}
            </Text>
          </Card>
          <Card>
            <View
              style={{ flexDirection: "row", justifyContent: "space-between" }}
            >
              <Text style={{ color: palette.text, fontWeight: "600" }}>
                {t("dataEncryption")}
              </Text>
            </View>
            <Text style={{ color: palette.sub, fontSize: 13, marginTop: 4 }}>
              {t("dataEncryptionValue")}
            </Text>
            <Text style={{ color: palette.sub, fontSize: 12, marginTop: 6 }}>
              {Platform.OS === "ios" ? "iOS Keychain" : "Android Keystore"}
            </Text>
          </Card>

          <SectionTitle>{t("dataCounts")}</SectionTitle>
          {counts.map((c) => (
            <Row
              key={c.label}
              label={c.label}
              right={
                <Text style={{ color: palette.text, fontWeight: "600" }}>
                  {c.n}
                </Text>
              }
            />
          ))}

          <SectionTitle>{t("dataInspect")}</SectionTitle>
          <Row
            label={showRaw ? t("dataHideRaw") : t("dataInspect")}
            sub={t("dataInspectSub")}
            onPress={() => setShowRaw((v) => !v)}
          />
          {showRaw && (
            <Card>
              <ScrollView horizontal showsHorizontalScrollIndicator>
                <Text
                  selectable
                  style={{
                    color: palette.text,
                    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
                    fontSize: 11,
                    lineHeight: 16,
                  }}
                >
                  {raw}
                </Text>
              </ScrollView>
            </Card>
          )}

          <GhostButton label={t("back")} onPress={onClose} />
          <View style={{ height: 32 }} />
        </ScrollView>
      </View>
    </Modal>
  );
}
