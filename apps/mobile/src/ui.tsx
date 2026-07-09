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
      onPress={onPress}
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
      onPress={onPress}
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
      onPress={onPress}
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
