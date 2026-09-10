/**
 * The lock screen.
 *
 * It carries no PIN pad of its own any more. The app used to keep a
 * four-digit code inside its own data, which looked like security and
 * was not: the code sat in the same blob it was supposed to protect.
 * Authentication is the device's job now — biometrics where enrolled,
 * the device PIN or pattern otherwise.
 *
 * The prompt is raised once on mount, because a lock that needs a tap
 * before it does anything is a lock people switch off.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { Pressable, View } from "react-native";
import { Text } from "../ui";
import { useApp } from "../state/store";
import { notifyError, notifySuccess } from "../haptics";
import { APP_NAME } from "../branding";
import { authenticate } from "../lib/app-lock";

export function LockScreen({ onUnlock }: { onUnlock: () => void }) {
  const { data, t, palette } = useApp();
  const [failed, setFailed] = useState(false);
  const running = useRef(false);

  const appName = data.prefs.disguise ? t("neutralAppName") : APP_NAME;

  const prompt = useCallback(async () => {
    // The OS shows one dialog at a time; a second call while the first
    // is open is rejected on Android and silently queued on iOS.
    if (running.current) return;
    running.current = true;
    try {
      const ok = await authenticate(t("lockPrompt"));
      if (ok) {
        notifySuccess();
        onUnlock();
      } else {
        notifyError();
        setFailed(true);
      }
    } finally {
      running.current = false;
    }
  }, [onUnlock, t]);

  useEffect(() => {
    void prompt();
  }, [prompt]);

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
      <Text style={{ color: palette.sub, marginBottom: 32 }}>
        {failed ? t("lockFailed") : t("lockTitle")}
      </Text>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t("lockUnlock")}
        onPress={() => void prompt()}
        style={{
          backgroundColor: palette.accent,
          borderRadius: 999,
          paddingVertical: 14,
          paddingHorizontal: 32,
          minHeight: 48,
          justifyContent: "center",
        }}
      >
        <Text style={{ color: palette.accentText, fontWeight: "700" }}>
          {t("lockUnlock")}
        </Text>
      </Pressable>
    </View>
  );
}
