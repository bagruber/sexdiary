/**
 * Simulated app lock.
 *
 * This gates the *interface*, not the data: the store is encrypted at
 * rest independently of the PIN, and the PIN is not used to derive any
 * key. It exists to demonstrate the interaction and to defend against
 * someone picking up an unlocked phone. Treat it as UX, not as a
 * security boundary, until the biometric/keystore milestone lands.
 */
import { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { useApp } from "../state/store";
import { notifyError, notifySuccess } from "../haptics";
import { APP_NAME } from "../branding";
import { Keypad } from "../ui";

type Mode = "verify" | "set" | "confirm";

export function LockScreen({
  initialMode = "verify",
  onUnlock,
  onPinSet,
  onCancel,
}: {
  initialMode?: "verify" | "set";
  onUnlock?: () => void;
  onPinSet?: (pin: string) => void;
  onCancel?: () => void;
}) {
  const { data, t, palette } = useApp();
  const [mode, setMode] = useState<Mode>(initialMode);
  const [entry, setEntry] = useState("");
  const [firstPin, setFirstPin] = useState("");
  const [error, setError] = useState<string | null>(null);

  const appName = data.prefs.disguise ? t("neutralAppName") : APP_NAME;

  useEffect(() => {
    if (entry.length !== 4) return;

    if (mode === "verify") {
      if (entry === data.prefs.lockPin) {
        notifySuccess();
        onUnlock?.();
      } else {
        notifyError();
        setError(t("lockWrongPin"));
        setEntry("");
      }
      return;
    }
    if (mode === "set") {
      setFirstPin(entry);
      setEntry("");
      setError(null);
      setMode("confirm");
      return;
    }
    // confirm
    if (entry === firstPin) {
      notifySuccess();
      onPinSet?.(entry);
    } else {
      notifyError();
      setError(t("lockPinMismatch"));
      setEntry("");
      setFirstPin("");
      setMode("set");
    }
  }, [entry]);

  const prompt =
    mode === "verify"
      ? t("lockEnterPin")
      : mode === "set"
        ? t("lockSetPin")
        : t("lockConfirmPin");

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: palette.bg,
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <Text
        style={{
          color: palette.text,
          fontSize: 24,
          fontWeight: "700",
          marginBottom: 4,
        }}
      >
        {appName}
      </Text>
      <Text style={{ color: palette.sub, marginBottom: 28 }}>
        {error ?? prompt}
      </Text>

      <Keypad value={entry} onChange={setEntry} deleteLabel={t("lockDelete")} />

      {mode === "verify" && (
        <Pressable
          accessibilityRole="button"
          onPress={() => {
            // Stands in for expo-local-authentication; always succeeds.
            notifySuccess();
            onUnlock?.();
          }}
          style={{ marginTop: 28 }}
        >
          <Text style={{ color: palette.sub, textDecorationLine: "underline" }}>
            {t("lockSimBiometric")}
          </Text>
        </Pressable>
      )}

      {onCancel && mode !== "verify" && (
        <Pressable accessibilityRole="button" onPress={onCancel} style={{ marginTop: 24 }}>
          <Text style={{ color: palette.sub }}>{t("cancel")}</Text>
        </Pressable>
      )}
    </View>
  );
}
