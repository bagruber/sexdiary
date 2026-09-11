import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { shadow } from "../theme/tokens";
import { Dot } from "../components/ui";
import { DaySheet } from "../components/sheets/DaySheet";
import { useApp } from "../state/store";

interface Props {
  onEdit: (type: "intercourse" | "test" | "vaccination", data: unknown) => void;
}

export function CalendarView({ onEdit }: Props) {
  const { data, palette, isDark, t } = useApp();
  const todayD = new Date();
  const [yr, setYr] = useState(todayD.getFullYear());
  const [mo, setMo] = useState(todayD.getMonth());
  const [animKey, setAnimKey] = useState(0);
  const [sel, setSel] = useState<string | null>(null);
  const touchX = useRef<number | null>(null);

  const months = t("months") as unknown as string[];
  const dsh = t("daysShort") as unknown as string[];

  const changeMonth = (dir: 1 | -1) => {
    setAnimKey((k) => k + 1);
    if (dir > 0) {
      if (mo === 11) {
        setMo(0);
        setYr((y) => y + 1);
      } else setMo((m) => m + 1);
    } else {
      if (mo === 0) {
        setMo(11);
        setYr((y) => y - 1);
      } else setMo((m) => m - 1);
    }
  };

  const dim = new Date(yr, mo + 1, 0).getDate();
  let startDay = new Date(yr, mo, 1).getDay();
  startDay = startDay === 0 ? 6 : startDay - 1;
  const cells = [
    ...Array(startDay).fill(null),
    ...Array.from({ length: dim }, (_, i) => i + 1),
  ];
  const dstr = (d: number) =>
    `${yr}-${String(mo + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  const isToday = (d: number) =>
    d === todayD.getDate() &&
    mo === todayD.getMonth() &&
    yr === todayD.getFullYear();

  const dayEvents = (d: number) => {
    const s = dstr(d);
    return {
      ic: data.intercourse.some((e) => e.date === s),
      te: data.tests.some((e) => e.date === s),
      vx: data.vaccinations.some((e) => e.date === s || e.startDate === s),
    };
  };

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "28px 16px 100px" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 24,
        }}
      >
        <h1
          style={{
            margin: 0,
            fontSize: 26,
            fontWeight: 700,
            color: palette.text,
          }}
        >
          {months[mo]}
          <span style={{ color: palette.muted, fontWeight: 300 }}> {yr}</span>
        </h1>
        <div style={{ display: "flex", gap: 6 }}>
          {[-1, 1].map((dir) => {
            const Icon = dir === -1 ? ChevronLeft : ChevronRight;
            return (
              <button
                key={dir}
                onClick={() => changeMonth(dir as 1 | -1)}
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 10,
                  background: palette.card,
                  border: `1px solid ${palette.border}`,
                  color: palette.text,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: shadow(isDark),
                }}
              >
                <Icon size={18} />
              </button>
            );
          })}
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          marginBottom: 6,
        }}
      >
        {dsh.map((d) => (
          <div
            key={d}
            style={{
              textAlign: "center",
              fontSize: 11,
              fontWeight: 700,
              color: palette.muted,
              letterSpacing: ".05em",
              paddingBottom: 8,
            }}
          >
            {d}
          </div>
        ))}
      </div>

      <div
        key={animKey}
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          gap: 3,
          animation: "calIn .22s ease",
        }}
        onTouchStart={(e) => {
          touchX.current = e.touches[0].clientX;
        }}
        onTouchEnd={(e) => {
          if (touchX.current == null) return;
          const dx = e.changedTouches[0].clientX - touchX.current;
          if (Math.abs(dx) > 45) changeMonth(dx < 0 ? 1 : -1);
          touchX.current = null;
        }}
      >
        {cells.map((d, i) => {
          if (!d) return <div key={`e${i}`} />;
          const ev = dayEvents(d);
          const hasAny = ev.ic || ev.te || ev.vx;
          // accent color based on which event is dominant (test > intercourse > vaccination)
          const accent = ev.te
            ? palette.teal
            : ev.ic
            ? palette.rose
            : ev.vx
            ? palette.amber
            : null;
          return (
            <div
              key={dstr(d)}
              onClick={() => setSel(dstr(d))}
              style={{
                aspectRatio: "1",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 12,
                cursor: "pointer",
                position: "relative",
                background: isToday(d)
                  ? palette.teal + "10"
                  : accent
                  ? accent + "08"
                  : "transparent",
                border: isToday(d)
                  ? `1.5px solid ${palette.teal}50`
                  : accent
                  ? `1px solid ${accent}25`
                  : "1.5px solid transparent",
                transition: "background .15s",
              }}
            >
              <span
                style={{
                  fontSize: 13,
                  fontWeight: isToday(d) ? 700 : 400,
                  color: isToday(d) ? palette.teal : palette.text,
                }}
              >
                {d}
              </span>
              {hasAny && (
                <div
                  style={{
                    display: "flex",
                    gap: 2,
                    position: "absolute",
                    bottom: 4,
                  }}
                >
                  {ev.ic && <Dot color={palette.rose} size={5} />}
                  {ev.te && <Dot color={palette.teal} size={5} />}
                  {ev.vx && <Dot color={palette.amber} size={5} />}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div
        style={{
          display: "flex",
          gap: 20,
          marginTop: 20,
          padding: "12px 16px",
          background: palette.card,
          borderRadius: 14,
          border: `1px solid ${palette.border}`,
        }}
      >
        {(
          [
            [palette.rose, t("legend_intercourse")],
            [palette.teal, t("legend_test")],
            [palette.amber, t("legend_vaccination")],
          ] as const
        ).map(([c, l]) => (
          <div
            key={l}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 7,
            }}
          >
            <Dot color={c} size={8} />
            <span style={{ fontSize: 12, color: palette.muted }}>{l}</span>
          </div>
        ))}
      </div>

      {sel && (
        <DaySheet
          date={sel}
          onClose={() => setSel(null)}
          onEdit={(ty, d) => {
            setSel(null);
            onEdit(ty, d);
          }}
        />
      )}
    </div>
  );
}
