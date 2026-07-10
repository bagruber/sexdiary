import { useState } from "react";
import { Alert, Modal, ScrollView, Switch, Text, View } from "react-native";
import type { Lang, Theme } from "@sexdiary/core";
import { useApp } from "../state/store";
import { APP_NAME } from "../branding";
import { Card, Chip, PrimaryButton, Row, Screen, SectionTitle, Title } from "../ui";
import { DataScreen } from "./DataScreen";
import { LockScreen } from "./LockScreen";

const THEMES: Theme[] = ["system", "light", "dark"];
const LANGS: { value: Lang; label: string }[] = [
  { value: "en", label: "English" },
  { value: "de", label: "Deutsch" },
];

export function SettingsScreen() {
  const { data, dispatch, t, palette } = useApp();
  const [showData, setShowData] = useState(false);
  const [settingPin, setSettingPin] = useState(false);
  const lang = data.prefs.lang;

  const themeLabel: Record<Theme, string> = {
    system: t("themeSystem"),
    light: t("themeLight"),
    dark: t("themeDark"),
  };

  const toggleLock = (on: boolean) => {
    if (on) setSettingPin(true);
    else dispatch({ type: "updatePrefs", patch: { lockPin: null, lock: false } });
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

        <SectionTitle>{t("privacy")}</SectionTitle>
        <Row
          label={t("appLockSim")}
          sub={t("appLockSimSub")}
          right={
            <Switch
              value={data.prefs.lockPin !== null}
              onValueChange={toggleLock}
              accessibilityLabel={t("appLockSim")}
            />
          }
        />
        {data.prefs.lockPin !== null && (
          <Card>
            <Text style={{ color: palette.sub, fontSize: 12, lineHeight: 17 }}>
              {t("lockSimWarning")}
            </Text>
          </Card>
        )}
        <Row
          label={t("disguiseMode")}
          sub={t("disguiseModeSub")}
          right={
            <Switch
              value={data.prefs.disguise}
              onValueChange={(v) =>
                dispatch({ type: "updatePrefs", patch: { disguise: v } })
              }
              accessibilityLabel={t("disguiseMode")}
            />
          }
        />
        {data.prefs.disguise && (
          <Card>
            <Text style={{ color: palette.sub, fontSize: 12, lineHeight: 17 }}>
              {t("disguiseNote")}
            </Text>
          </Card>
        )}

        <SectionTitle>{t("data")}</SectionTitle>
        <Row
          label={t("yourData")}
          sub={t("yourDataSub")}
          onPress={() => setShowData(true)}
        />
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
            {APP_NAME} · {t("version")} 0.2.0
          </Text>
        </Card>
        <View style={{ height: 24 }} />
      </ScrollView>

      {showData && <DataScreen onClose={() => setShowData(false)} />}

      <Modal visible={settingPin} animationType="slide" onRequestClose={() => setSettingPin(false)}>
        <LockScreen
          initialMode="set"
          onPinSet={(pin) => {
            dispatch({ type: "updatePrefs", patch: { lockPin: pin, lock: true } });
            setSettingPin(false);
          }}
          onCancel={() => setSettingPin(false)}
        />
      </Modal>
    </Screen>
  );
}
