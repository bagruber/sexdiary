import type { ReactNode } from "react";
import {
  Pressable,
  StyleSheet,
  Text as RNText,
  View,
  type StyleProp,
  type TextProps,
  type TextStyle,
  type ViewStyle,
} from "react-native";
import { useApp } from "./state/store";
import { tapLight, tapMedium } from "./haptics";

/**
 * Text mit Atkinson Hyperlegible.
 *
 * React Native vererbt `fontFamily` nicht — sie muss an jedes Element.
 * Statt sie hundertfach hinzuschreiben, sitzt sie hier einmal, und die
 * Bildschirme importieren `Text` von hier statt von react-native.
 *
 * Der zweite Schnitt ist die Staerke: Android synthetisiert bei einer
 * mitgelieferten Schrift kein Fett, es braucht die Bold-Datei als eigene
 * Familie. Deshalb wird `fontWeight` ausgewertet und umgesetzt, statt
 * sich auf den Renderer zu verlassen.
 */
export function Text({ style, ...rest }: TextProps) {
  const flat = StyleSheet.flatten(style) as TextStyle | undefined;
  const w = flat?.fontWeight;
  const fett = w === "bold" || (typeof w === "string" && Number(w) >= 600);
  return (
    <RNText
      {...rest}
      style={[
        { fontFamily: fett ? "Atkinson-Bold" : "Atkinson" },
        style,
        // Die Familie traegt die Staerke; ein zusaetzliches fontWeight
        // liesse Android zusaetzlich synthetisch fetten.
        fett ? { fontWeight: "normal" } : null,
      ]}
    />
  );
}

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
  icon,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
  /** Ein kurzes Zeichen vor der Beschriftung. Siehe `GLYPH` unten. */
  icon?: string;
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
      {icon && (
        <Text
          style={{
            color: active ? palette.accentText : palette.sub,
            fontSize: 13,
          }}
        >
          {icon}
        </Text>
      )}
      <Text
        numberOfLines={1}
        style={{ color: active ? palette.accentText : palette.text, fontSize: 13 }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

/**
 * Zeichen fuer die vier Eintragsarten.
 *
 * Bewusst Text statt einer Icon-Bibliothek: @expo/vector-icons ist hier
 * nicht installiert, und ein Schriftpaket von ueber einem Megabyte fuer
 * vier Symbole waere ein schlechter Tausch — zumal die App ohnehin schon
 * drei Drittanbieter-Pakete mit nativem Code traegt.
 *
 * Und bewusst keine Farbcodierung: ADR-0015 haelt Gruen, Gelb und Rot
 * fuer die Risikoskala frei. Zwei Bedeutungen auf derselben Farbe waeren
 * auf einem Bildschirm, der beides zeigt, schlechter als gar keine.
 */
export const GLYPH = {
  intercourse: "♥",
  test: "✓",
  contact: "☺",
  vaccination: "✚",
  qr: "▣",
} as const;

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
  danger,
}: {
  label: string;
  onPress: () => void;
  /**
   * Zerstoerend, aber zweitrangig. Rot in der Schrift statt in der
   * Flaeche: ein vollflaechig roter Knopf neben "Speichern" zoege den
   * Blick auf sich, obwohl er der seltenere Fall ist.
   */
  danger?: boolean;
}) {
  const { palette } = useApp();
  return (
    <Pressable
      onPress={() => {
        tapLight();
        onPress();
      }}
      accessibilityRole="button"
      style={[
        styles.button,
        { borderWidth: 1, borderColor: danger ? palette.bad : palette.border },
      ]}
    >
      <Text
        style={{ color: danger ? palette.bad : palette.text, fontWeight: "600" }}
      >
        {label}
      </Text>
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
    // Ohne die drei Zeilen wird der Chip in einer Zeile so hoch wie der
    // groesste daneben (alignItems faellt sonst auf "stretch"), und in
    // einer horizontalen ScrollView schrumpft er, bis das Wort umbricht.
    alignSelf: "flex-start",
    flexShrink: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  button: {
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: "center",
    marginTop: 10,
  },
});

/**
 * Die beiden Aktionen, die von jeder Seite aus erreichbar sein muessen.
 *
 * Mittig ueber der Reiterleiste, weil beide unter Zeitdruck getroffen
 * werden. Eine Begegnung traegt man zwar in Ruhe nach; der Tokentausch
 * passiert im Moment, mit jemandem daneben, und ADR-0014 verlangt fuer
 * die Begegnung ohnehin einen staendig erreichbaren Platz.
 *
 * Bewusst keine Zwillinge: das Plus ist gefuellt, der QR umrandet. Zwei
 * gleich aussehende Ziele nebeneinander werden verwechselt, und hier
 * legt das eine einen Eintrag an, waehrend das andere die Kamera
 * oeffnet.
 */
export function FabPair({
  onAdd,
  onAddLong,
  onQr,
  addLabel,
  qrLabel,
}: {
  onAdd: () => void;
  onAddLong?: () => void;
  onQr: () => void;
  addLabel: string;
  qrLabel: string;
}) {
  const { palette } = useApp();

  const knopf = (
    label: string,
    zeichen: string,
    gefuellt: boolean,
    onPress: () => void,
    onLongPress?: () => void,
  ) => (
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
        width: 58,
        height: 58,
        borderRadius: 29,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: gefuellt ? palette.accent : palette.card,
        borderWidth: gefuellt ? 0 : 1,
        borderColor: palette.border,
        elevation: 3,
      }}
    >
      <Text
        style={{
          color: gefuellt ? palette.accentText : palette.text,
          fontSize: gefuellt ? 28 : 22,
          lineHeight: gefuellt ? 32 : 26,
          fontWeight: "300",
        }}
      >
        {zeichen}
      </Text>
    </Pressable>
  );

  return (
    <View
      pointerEvents="box-none"
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 14,
        flexDirection: "row",
        justifyContent: "center",
        gap: 22,
      }}
    >
      {knopf(addLabel, "+", true, onAdd, onAddLong)}
      {knopf(qrLabel, GLYPH.qr, false, onQr)}
    </View>
  );
}
