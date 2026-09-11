/**
 * Panic-hide decoy. One tap on the header replaces the whole app with a
 * neutral notes list. Shoulder-surfing is a likelier threat for this app
 * than a remote attacker, and a decoy is the cheapest defense against it.
 *
 * Exit is deliberately non-obvious: three taps on the title.
 */
import { useRef } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { useApp } from "../state/store";
import { tapLight } from "../haptics";
import { Card, Text } from "../ui";

export function DecoyScreen({ onExit }: { onExit: () => void }) {
  const { t, palette } = useApp();
  const taps = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const onTitlePress = () => {
    tapLight();
    taps.current += 1;
    if (timer.current) clearTimeout(timer.current);
    if (taps.current >= 3) {
      taps.current = 0;
      onExit();
      return;
    }
    timer.current = setTimeout(() => {
      taps.current = 0;
    }, 1200);
  };

  const notes = [t("decoyNote1"), t("decoyNote2"), t("decoyNote3")];

  return (
    <View style={{ flex: 1, backgroundColor: palette.bg, padding: 16 }}>
      <Pressable
        onPress={onTitlePress}
        accessibilityRole="button"
        accessibilityLabel={t("decoyHint")}
      >
        <Text
          style={{
            color: palette.text,
            fontSize: 30,
            fontWeight: "700",
            marginTop: 12,
            marginBottom: 16,
          }}
        >
          {t("decoyTitle")}
        </Text>
      </Pressable>

      <ScrollView showsVerticalScrollIndicator={false}>
        {notes.map((n) => (
          <Card key={n}>
            <Text style={{ color: palette.text, fontSize: 15 }}>{n}</Text>
          </Card>
        ))}
      </ScrollView>
    </View>
  );
}
