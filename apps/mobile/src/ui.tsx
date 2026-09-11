import { useState, type ReactNode } from "react";
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
import { categoryScale, type EntryType } from "@sexdiary/core";
import { Icon, type IconName } from "./icons";
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
  /** Symbol vor der Beschriftung. */
  icon?: IconName;
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
        <Icon
          name={icon}
          size={15}
          color={active ? palette.accentText : palette.sub}
        />
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
 * Symbol je Eintragsart. Eine Stelle, damit Faecher, Blattleiste und
 * Kalender dasselbe Zeichen zeigen — vier Listen, die auseinanderlaufen
 * koennen, waren vorher genau ein Fehler zu viel.
 */
export const KIND_ICON: Record<EntryType, IconName> = {
  intercourse: "heart",
  test: "droplet",
  contact: "user",
  vaccination: "shield",
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
      {right ??
        (onPress ? (
          <Icon name="chevronRight" size={18} color={palette.sub} />
        ) : null)}
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
 * Uebereinander am rechten Rand statt nebeneinander in der Mitte. Zwei
 * gleich grosse Kreise nebeneinander werden verwechselt — das war beim
 * alten Aufbau notiert und ist der Grund fuer den Umbau. Hier
 * unterscheiden sich Ort, Groesse und Fuellung: das Plus oben, gross und
 * gefuellt, weil daraus der Faecher aufgeht; der QR darunter, kleiner
 * und umrandet.
 *
 * Der Faecher laeuft auf einem Viertelkreis nach links und oben, also in
 * den freien Bildschirm hinein und nicht ueber den Daumen. Ein
 * Drittelkreis, wie zuerst ueberlegt, schoebe den letzten Knopf rechts
 * am Plus vorbei ueber den Rand.
 *
 * Farbe tragen nur die Faecherknoepfe, und nur hier: siehe
 * `CATEGORY_LIGHT` in `@sexdiary/core`, wo steht, warum das die
 * Risikoskala nicht antastet.
 */

/** Rechter Abstand und Fusshoehe der ganzen Gruppe. */
const FAB_EDGE = 16;
const FAB_BOTTOM = 14;
const ADD_SIZE = 58;
const QR_SIZE = 46;
const FAN_SIZE = 46;
/** Abstand zwischen Plus und QR. */
const FAB_GAP = 12;
/** Radius des Viertelkreises, gemessen von der Mitte des Plus. */
const FAN_RADIUS = 104;
/** Breite eines Faechereintrags samt Beschriftung, und deren Hoehe. */
const FAN_ITEM_W = 72;
const FAN_LABEL_H = 18;

/** Mitte des Plus-Knopfes, gemessen von der rechten unteren Ecke. */
const ADD_CX = FAB_EDGE + QR_SIZE / 2;
const ADD_CY = FAB_BOTTOM + QR_SIZE + FAB_GAP + ADD_SIZE / 2;

/** Vier Winkel von 0 (links) bis 90 (oben). */
const FAN_ORDER: EntryType[] = ["intercourse", "test", "contact", "vaccination"];

export function FabPair({
  onAdd,
  onPick,
  onQr,
  addLabel,
  qrLabel,
  closeLabel,
  kindLabels,
}: {
  /** Kurzer Tipp: der haeufigste Fall, ohne Umweg ueber den Faecher. */
  onAdd: () => void;
  /** Aus dem Faecher gewaehlt. */
  onPick: (kind: EntryType) => void;
  onQr: () => void;
  addLabel: string;
  qrLabel: string;
  /** Beschriftung der Flaeche, die den Faecher wieder schliesst. */
  closeLabel: string;
  kindLabels: Record<EntryType, string>;
}) {
  const { palette, isDark } = useApp();
  const [fan, setFan] = useState(false);
  const cat = categoryScale(isDark ? "dark" : "light");

  return (
    <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
      {fan && (
        <Pressable
          accessibilityLabel={closeLabel}
          accessibilityRole="button"
          onPress={() => setFan(false)}
          style={[StyleSheet.absoluteFill, { backgroundColor: "rgba(0,0,0,0.35)" }]}
        />
      )}

      {fan &&
        FAN_ORDER.map((kind, i) => {
          // 0 Grad ist links, 90 ist oben. Drei Schritte zu 30 Grad.
          const phi = ((i * 30) * Math.PI) / 180;
          const cx = ADD_CX + FAN_RADIUS * Math.cos(phi);
          const cy = ADD_CY + FAN_RADIUS * Math.sin(phi);
          return (
            <Pressable
              key={kind}
              accessibilityRole="button"
              accessibilityLabel={kindLabels[kind]}
              onPress={() => {
                tapMedium();
                setFan(false);
                onPick(kind);
              }}
              style={{
                position: "absolute",
                right: cx - FAN_ITEM_W / 2,
                bottom: cy - FAN_SIZE / 2 - FAN_LABEL_H,
                width: FAN_ITEM_W,
                alignItems: "center",
              }}
            >
              <View
                style={{
                  width: FAN_SIZE,
                  height: FAN_SIZE,
                  borderRadius: FAN_SIZE / 2,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: cat.fill[kind],
                  elevation: 4,
                }}
              >
                <Icon name={KIND_ICON[kind]} size={22} color={cat.on} />
              </View>
              <Text
                numberOfLines={1}
                style={{
                  color: palette.text,
                  fontSize: 11,
                  marginTop: 4,
                  height: FAN_LABEL_H - 4,
                }}
              >
                {kindLabels[kind]}
              </Text>
            </Pressable>
          );
        })}

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={qrLabel}
        onPress={() => {
          tapMedium();
          setFan(false);
          onQr();
        }}
        style={{
          position: "absolute",
          right: FAB_EDGE,
          bottom: FAB_BOTTOM,
          width: QR_SIZE,
          height: QR_SIZE,
          borderRadius: QR_SIZE / 2,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: palette.card,
          borderWidth: 1,
          borderColor: palette.border,
          elevation: 3,
        }}
      >
        <Icon name="qr" size={22} color={palette.text} />
      </Pressable>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={addLabel}
        accessibilityState={{ expanded: fan }}
        onPress={() => {
          tapMedium();
          // Offen heisst: der Faecher ist die Frage, nicht der Eintrag.
          // Ein zweiter Tipp schliesst ihn, statt hinter ihm etwas
          // anzulegen.
          if (fan) setFan(false);
          else onAdd();
        }}
        onLongPress={() => {
          tapMedium();
          setFan(true);
        }}
        style={{
          position: "absolute",
          right: FAB_EDGE + (QR_SIZE - ADD_SIZE) / 2,
          bottom: FAB_BOTTOM + QR_SIZE + FAB_GAP,
          width: ADD_SIZE,
          height: ADD_SIZE,
          borderRadius: ADD_SIZE / 2,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: palette.accent,
          elevation: 6,
        }}
      >
        <Icon name={fan ? "close" : "plus"} size={26} color={palette.accentText} />
      </Pressable>
    </View>
  );
}
