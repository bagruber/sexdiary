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
});

/**
 * The one action ADR-0014 asks to be reachable at all times.
 *
 * Deliberately a single action, not a menu that fans out: "I had sex"
 * and "am I okay" are together most of why the app is opened, while a
 * vaccination is entered a handful of times ever. Giving all four the
 * same tap target would treat a skewed distribution as a flat one.
 *
 * Plain circle, plain plus. No colour coding, no glow — it sits over
 * content that people read in public, and it should not draw a stranger
 * eye more than it has to.
 */
export function Fab({
  label,
  onPress,
  onLongPress,
}: {
  label: string;
  onPress: () => void;
  onLongPress?: () => void;
}) {
  const { palette } = useApp();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={() => {
        tapMedium();
        onPress();
      }}
      onLongPress={
        onLongPress &&
        (() => {
          tapMedium();
          onLongPress();
        })
      }
      style={{
        position: "absolute",
        right: 18,
        bottom: 18,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: palette.accent,
        alignItems: "center",
        justifyContent: "center",
        elevation: 3,
      }}
    >
      <Text
        style={{
          color: palette.accentText,
          fontSize: 30,
          lineHeight: 34,
          fontWeight: "300",
        }}
      >
        +
      </Text>
    </Pressable>
  );
}
