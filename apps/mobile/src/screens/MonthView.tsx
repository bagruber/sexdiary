/**
 * Monatsansicht des Verlaufs.
 *
 * Der Verlauf als Liste beantwortet "was war zuletzt". Diese Ansicht
 * beantwortet "wie dicht war der Monat" und "was war an dem einen Tag,
 * an den ich denke" — beides Fragen, auf die eine Liste schlecht
 * antwortet, sobald sie laenger als ein Bildschirm ist.
 *
 * Die Marker nutzen bewusst nur die Neutralen. Gruen, Gelb und Rot
 * gehoeren laut ADR-0015 der Risikoskala; sie hier zweitzuverwenden
 * hiesse, zwei Bedeutungen um dieselbe Farbe konkurrieren zu lassen.
 */
import { useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { formatDate, today, type Lang } from "@sexdiary/core";
import { useApp } from "../state/store";
import { Card, SectionTitle } from "../ui";

/** Montag als erster Tag der Woche, wie `daysShort` es vorgibt. */
function firstWeekday(year: number, month: number): number {
  return (new Date(year, month, 1).getDay() + 6) % 7;
}

const iso = (y: number, m: number, d: number) =>
  `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

export function MonthView({ onPickDay }: { onPickDay: (date: string) => void }) {
  const { data, t, palette } = useApp();
  const heute = today();
  const [jahr, setJahr] = useState(() => Number(heute.slice(0, 4)));
  const [monat, setMonat] = useState(() => Number(heute.slice(5, 7)) - 1);

  const monate = t("months") as unknown as string[];
  const wochentage = t("daysShort") as unknown as string[];

  const belegt = useMemo(() => {
    const map = new Map<string, { ic: boolean; te: boolean; vx: boolean }>();
    const mark = (d: string, key: "ic" | "te" | "vx") => {
      if (!d) return;
      const cur = map.get(d) ?? { ic: false, te: false, vx: false };
      cur[key] = true;
      map.set(d, cur);
    };
    for (const e of data.intercourse) mark(e.date, "ic");
    for (const r of data.tests) mark(r.date, "te");
    for (const v of data.vaccinations) {
      mark(v.date ?? "", "vx");
      mark(v.startDate ?? "", "vx");
    }
    return map;
  }, [data.intercourse, data.tests, data.vaccinations]);

  const blaetter = (richtung: 1 | -1) => {
    const m = monat + richtung;
    if (m < 0) {
      setMonat(11);
      setJahr(jahr - 1);
    } else if (m > 11) {
      setMonat(0);
      setJahr(jahr + 1);
    } else setMonat(m);
  };

  const tage = new Date(jahr, monat + 1, 0).getDate();
  const vorlauf = firstWeekday(jahr, monat);
  const zellen: (number | null)[] = [
    ...Array<null>(vorlauf).fill(null),
    ...Array.from({ length: tage }, (_, i) => i + 1),
  ];

  const pfeil = (richtung: 1 | -1, zeichen: string) => (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={richtung === -1 ? t("back") : t("onboardContinue")}
      onPress={() => blaetter(richtung)}
      hitSlop={14}
    >
      <Text style={{ color: palette.text, fontSize: 20 }}>{zeichen}</Text>
    </Pressable>
  );

  const punkt = (farbe: string) => (
    <View
      style={{
        width: 5,
        height: 5,
        borderRadius: 2.5,
        backgroundColor: farbe,
      }}
    />
  );

  return (
    <>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 12,
        }}
      >
        {pfeil(-1, "‹")}
        <Text style={{ color: palette.text, fontSize: 17, fontWeight: "700" }}>
          {monate[monat]} {jahr}
        </Text>
        {pfeil(1, "›")}
      </View>

      <View style={{ flexDirection: "row" }}>
        {wochentage.map((w) => (
          <Text
            key={w}
            style={{
              flex: 1,
              textAlign: "center",
              color: palette.sub,
              fontSize: 11,
              marginBottom: 6,
            }}
          >
            {w}
          </Text>
        ))}
      </View>

      <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
        {zellen.map((tag, i) => {
          if (tag === null)
            return <View key={`l${i}`} style={{ width: `${100 / 7}%`, height: 46 }} />;
          const datum = iso(jahr, monat, tag);
          const e = belegt.get(datum);
          const istHeute = datum === heute;
          return (
            <Pressable
              key={datum}
              accessibilityRole="button"
              accessibilityLabel={formatDate(datum, data.prefs.lang as Lang)}
              onPress={() => onPickDay(datum)}
              style={{
                width: `${100 / 7}%`,
                height: 46,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <View
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 15,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: istHeute ? palette.accent : "transparent",
                }}
              >
                <Text
                  style={{
                    color: istHeute ? palette.accentText : palette.text,
                    fontSize: 14,
                  }}
                >
                  {tag}
                </Text>
              </View>
              <View style={{ flexDirection: "row", gap: 3, height: 7, marginTop: 2 }}>
                {e?.ic && punkt(palette.text)}
                {e?.te && punkt(palette.sub)}
                {e?.vx && punkt(palette.border)}
              </View>
            </Pressable>
          );
        })}
      </View>

      <Card>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 14 }}>
          {(
            [
              [palette.text, t("intercourse")],
              [palette.sub, t("testEntry")],
              [palette.border, t("vaccination")],
            ] as [string, string][]
          ).map(([farbe, label]) => (
            <View
              key={label}
              style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
            >
              {punkt(farbe)}
              <Text style={{ color: palette.sub, fontSize: 12 }}>{label}</Text>
            </View>
          ))}
        </View>
      </Card>
    </>
  );
}

/** Was an einem Tag steht, als Abschnitt unter dem Raster. */
export function DayDetail({ date }: { date: string }) {
  const { data, t, palette } = useApp();

  const ic = data.intercourse.filter((e) => e.date === date);
  const te = data.tests.filter((r) => r.date === date);
  const vx = data.vaccinations.filter(
    (v) => v.date === date || v.startDate === date,
  );
  const leer = ic.length + te.length + vx.length === 0;

  return (
    <>
      <SectionTitle>{formatDate(date, data.prefs.lang)}</SectionTitle>
      {leer && (
        <Card>
          <Text style={{ color: palette.sub }}>{t("noEntries")}</Text>
        </Card>
      )}
      {ic.map((e) => (
        <Card key={e.id}>
          <Text style={{ color: palette.text, fontWeight: "600" }}>
            {t("intercourse")}
          </Text>
          <Text style={{ color: palette.sub, fontSize: 13, marginTop: 2 }}>
            {e.cid
              ? (data.contacts.find((c) => c.id === e.cid)?.name ??
                t("anonymousPartner"))
              : t("anonymousPartner")}
          </Text>
        </Card>
      ))}
      {te.map((r) => (
        <Card key={r.id}>
          <Text style={{ color: palette.text, fontWeight: "600" }}>
            {t("testEntry")}
          </Text>
          <Text style={{ color: palette.sub, fontSize: 13, marginTop: 2 }}>
            {Object.keys(r.ts).join(" · ")}
          </Text>
        </Card>
      ))}
      {vx.map((v) => (
        <Card key={v.id}>
          <Text style={{ color: palette.text, fontWeight: "600" }}>
            {v.type ?? t(v.kind === "prep" ? "prep" : "doxyPep")}
          </Text>
        </Card>
      ))}
    </>
  );
}
