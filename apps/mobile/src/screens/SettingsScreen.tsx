import { Alert, ScrollView, Text, View } from "react-native";
import type { Lang, Theme } from "@sexdiary/core";
import { useApp } from "../state/store";
import { Card, Chip, PrimaryButton, Screen, SectionTitle, Title } from "../ui";

const THEMES: Theme[] = ["system", "light", "dark"];
const LANGS: { value: Lang; label: string }[] = [
  { value: "en", label: "English" },
  { value: "de", label: "Deutsch" },
];

export function SettingsScreen() {
  const { data, dispatch, t, palette } = useApp();
  const lang = data.prefs.lang;

  const themeLabel: Record<Theme, string> = {
    system: t("themeSystem"),
    light: t("themeLight"),
    dark: t("themeDark"),
  };

  const confirmDeleteAll = () => {
    Alert.alert(
      t("deleteAllData"),
      t("deleteAllDataSub"),
      [
        { text: t("cancel"), style: "cancel" },
        {
          text: t("delete"),
          style: "destructive",
          onPress: () => dispatch({ type: "clearAll" }),
        },
      ],
      { cancelable: true },
    );
  };

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Title>{t("settings")}</Title>

        <SectionTitle>{t("general")}</SectionTitle>
        <Card>
          <Text style={{ color: palette.text, marginBottom: 8 }}>{t("language")}</Text>
          <View style={{ flexDirection: "row" }}>
            {LANGS.map((l) => (
              <Chip
                key={l.value}
                label={l.label}
                active={lang === l.value}
                onPress={() =>
                  dispatch({ type: "updatePrefs", patch: { lang: l.value } })
                }
              />
            ))}
          </View>
        </Card>
        <Card>
          <Text style={{ color: palette.text, marginBottom: 8 }}>{t("theme")}</Text>
          <View style={{ flexDirection: "row" }}>
            {THEMES.map((th) => (
              <Chip
                key={th}
                label={themeLabel[th]}
                active={data.prefs.theme === th}
                onPress={() =>
                  dispatch({ type: "updatePrefs", patch: { theme: th } })
                }
              />
            ))}
          </View>
        </Card>

        <SectionTitle>{t("data")}</SectionTitle>
        <Card>
          <Text style={{ color: palette.text, fontWeight: "600" }}>
            {t("storage")}
          </Text>
          <Text style={{ color: palette.sub, marginTop: 4, fontSize: 13 }}>
            {lang === "de"
              ? "Lokal, AES-256-verschlüsselt. Schlüssel im Geräte-Keystore. Keine Cloud, keine Server."
              : "Local, AES-256 encrypted. Key held in the device keystore. No cloud, no servers."}
          </Text>
        </Card>
        <PrimaryButton label={t("deleteAllData")} onPress={confirmDeleteAll} danger />

        <SectionTitle>{t("about")}</SectionTitle>
        <Card>
          <Text style={{ color: palette.text, fontWeight: "600" }}>
            {t("medicalDisclaimer")}
          </Text>
          <Text style={{ color: palette.sub, marginTop: 4, fontSize: 13 }}>
            {lang === "de"
              ? "Diese App ist kein Medizinprodukt und ersetzt keine ärztliche Beratung. Risikoangaben sind Schätzungen zu Informationszwecken."
              : "This app is not a medical device and does not replace professional medical advice. Risk figures are informational estimates."}
          </Text>
        </Card>
        <Card>
          <Text style={{ color: palette.sub, fontSize: 13 }}>
            {t("version")} 0.1.0
          </Text>
        </Card>
        <View style={{ height: 24 }} />
      </ScrollView>
    </Screen>
  );
}
