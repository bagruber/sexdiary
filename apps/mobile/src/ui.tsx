import type { ReactNode } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { useApp } from "./state/store";
import { tapLight, tapMedium } from "./haptics";

export function Screen({ children }: { children: ReactNode }) {
  const { palette } = useApp();
  return (
    <View style={[styles.screen, { backgroundColor: palette.bg }]}>
      {children}
    </View>
  );
}

export function Title({ children }: { children: ReactNode }) {
  const { palette } = useApp();
  return (
    <Text style={[styles.title, { color: palette.text }]}>{children}</Text>
  );
}

export function SectionTitle({ children }: { children: ReactNode }) {
  const { palette } = useApp();
  return (
    <Text style={[styles.section, { color: palette.sub }]}>{children}</Text>
  );
}

export function Card({
  children,
  style,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const { palette } = useApp();
  return (
    <View
      style={[
        styles.card,
        { backgroundColor: palette.card, borderColor: palette.border },
        style,
      ]}
    >
      {children}
    </View>
  );
}

export function Chip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  const { palette } = useApp();
  return (
    <Pressable
      onPress={() => {
        tapLight();
        onPress();
      }}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      style={[
        styles.chip,
        {
          backgroundColor: active ? palette.accent : palette.card,
          borderColor: active ? palette.accent : palette.border,
        },
      ]}
    >
      <Text style={{ color: active ? palette.accentText : palette.text, fontSize: 13 }}>
        {label}
      </Text>
    </Pressable>
  );
}

/** Horizontal progress meter with an accessible value. */
export function Meter({
  pct,
  color,
  label,
}: {
  pct: number;
  color: string;
  label?: string;
}) {
  const { palette } = useApp();
  const clamped = Math.max(0, Math.min(100, Math.round(pct)));
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel={label}
      accessibilityValue={{ min: 0, max: 100, now: clamped }}
      style={{
        height: 6,
        borderRadius: 3,
        backgroundColor: palette.border,
        overflow: "hidden",
      }}
    >
      <View style={{ width: `${clamped}%`, height: 6, backgroundColor: color }} />
    </View>
  );
}

/** Tappable settings/navigation row with a chevron affordance. */
export function Row({
  label,
  sub,
  onPress,
  right,
  danger,
}: {
  label: string;
  sub?: string;
  onPress?: () => void;
  right?: ReactNode;
  danger?: boolean;
}) {
  const { palette } = useApp();
  const body = (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <View style={{ flex: 1, paddingRight: 12 }}>
        <Text
          style={{
            color: danger ? palette.bad : palette.text,
            fontSize: 15,
            fontWeight: "500",
          }}
        >
          {label}
        </Text>
        {sub ? (
          <Text style={{ color: palette.sub, fontSize: 12, marginTop: 3 }}>
            {sub}
          </Text>
        ) : null}
      </View>
      {right ?? (onPress ? <Text style={{ color: palette.sub }}>›</Text> : null)}
    </View>
  );
  if (!onPress) return <Card>{body}</Card>;
  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => {
        tapLight();
        onPress();
      }}
    >
      <Card>{body}</Card>
    </Pressable>
  );
}

/** 4-digit PIN pad. Purely a UI gate — see Preferences.lockPin. */
export function Keypad({
  value,
  onChange,
  deleteLabel,
}: {
  value: string;
  onChange: (next: string) => void;
  deleteLabel: string;
}) {
  const { palette } = useApp();
  const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "del"];

  return (
    <View>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "center",
          marginBottom: 28,
        }}
      >
        {[0, 1, 2, 3].map((i) => (
          <View
            key={i}
            style={{
              width: 14,
              height: 14,
              borderRadius: 7,
              marginHorizontal: 8,
              borderWidth: 1,
              borderColor: palette.sub,
              backgroundColor: i < value.length ? palette.text : "transparent",
            }}
          />
        ))}
      </View>
      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          width: 260,
          alignSelf: "center",
        }}
      >
        {keys.map((k, i) => {
          if (k === "") return <View key={i} style={styles.key} />;
          const isDel = k === "del";
          return (
            <Pressable
              key={i}
              accessibilityRole="button"
              accessibilityLabel={isDel ? deleteLabel : k}
              onPress={() => {
                tapLight();
                if (isDel) onChange(value.slice(0, -1));
                else if (value.length < 4) onChange(value + k);
              }}
              style={({ pressed }) => [
                styles.key,
                {
                  backgroundColor: pressed ? palette.border : "transparent",
                  borderRadius: 40,
                },
              ]}
            >
              <Text style={{ color: palette.text, fontSize: isDel ? 16 : 26 }}>
                {isDel ? "⌫" : k}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export function PrimaryButton({
  label,
  onPress,
  disabled,
  danger,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  danger?: boolean;
}) {
  const { palette } = useApp();
  return (
    <Pressable
      onPress={() => {
        tapMedium();
        onPress();
      }}
      disabled={disabled}
      accessibilityRole="button"
      style={[
        styles.button,
        {
          backgroundColor: danger ? palette.bad : palette.accent,
          opacity: disabled ? 0.4 : 1,
        },
      ]}
    >
      <Text style={{ color: danger ? "#fff" : palette.accentText, fontWeight: "600" }}>
        {label}
      </Text>
    </Pressable>
  );
}

export function GhostButton({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) {
  const { palette } = useApp();
  return (
    <Pressable
      onPress={() => {
        tapLight();
        onPress();
      }}
      accessibilityRole="button"
      style={[styles.button, { borderWidth: 1, borderColor: palette.border }]}
    >
      <Text style={{ color: palette.text, fontWeight: "600" }}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, paddingHorizontal: 16, paddingTop: 8 },
  title: { fontSize: 26, fontWeight: "700", marginVertical: 12 },
  section: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginTop: 18,
    marginBottom: 8,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    marginBottom: 10,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
    marginRight: 8,
    marginBottom: 8,
  },
  button: {
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: "center",
    marginTop: 10,
  },
  key: {
    width: 80,
    height: 68,
    alignItems: "center",
    justifyContent: "center",
  },
});
