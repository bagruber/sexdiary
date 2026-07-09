import { FONT } from "../../theme/tokens";
import { Sheet, Tag, Dot } from "../ui";
import { useApp } from "../../state/store";
import { formatDate } from "@sexdiary/core";
import type {
  Contact,
  Intercourse,
  TestRecord,
  Vaccination,
} from "@sexdiary/core";

interface Props {
  date: string;
  onClose: () => void;
  onEdit: (type: "intercourse" | "test" | "vaccination", data: unknown) => void;
}

export function DaySheet({ date, onClose, onEdit }: Props) {
  const { data, palette, t } = useApp();
  const ic = data.intercourse.filter((e) => e.date === date);
  const te = data.tests.filter((e) => e.date === date);
  const vx = data.vaccinations.filter(
    (e) => e.date === date || e.startDate === date,
  );
  const hasAny = ic.length || te.length || vx.length;
  const findContact = (id: string | null): Contact | undefined =>
    id ? data.contacts.find((c) => c.id === id) : undefined;

  return (
    <Sheet onClose={onClose} title={formatDate(date, data.prefs.lang)}>
      {!hasAny && (
        <p
          style={{
            color: palette.muted,
            fontSize: 14,
            fontFamily: FONT,
            padding: "16px 0",
          }}
        >
          {t("noEntries")}
        </p>
      )}

      {te.map((rec: TestRecord) => (
        <div
          key={rec.id}
          style={{
            background: palette.cardEl,
            borderRadius: 14,
            padding: "14px 16px",
            marginBottom: 10,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <Dot color={palette.teal} />
            <span
              style={{
                fontFamily: FONT,
                fontWeight: 700,
                fontSize: 13,
                color: palette.teal,
              }}
            >
              {t("testEntry")}
            </span>
            <span
              style={{
                fontFamily: FONT,
                fontSize: 11,
                color: palette.muted,
                marginLeft: "auto",
              }}
            >
              {rec.num}
            </span>
            <button
              onClick={() => onEdit("test", rec)}
              style={{
                background: "none",
                border: "none",
                color: palette.teal,
                fontFamily: FONT,
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                padding: 4,
                minHeight: 32,
              }}
            >
              {t("edit")}
            </button>
          </div>
          <div
            style={{
              fontFamily: FONT,
              fontSize: 12,
              color: palette.muted,
              marginBottom: 8,
            }}
          >
            {rec.fac}
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
            {Object.entries(rec.ts)
              .filter(([, v]) => v)
              .map(([k]) => (
                <Tag
                  key={k}
                  color={rec.results?.[k] === "positive" ? palette.rose : palette.teal}
                  small
                >
                  {k}
                  {rec.results?.[k] === "positive" ? " +" : ""}
                </Tag>
              ))}
          </div>
        </div>
      ))}

      {vx.map((v: Vaccination) => (
        <div
          key={v.id}
          style={{
            background: palette.cardEl,
            borderRadius: 14,
            padding: "14px 16px",
            marginBottom: 10,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <Dot color={palette.amber} />
            <span
              style={{
                fontFamily: FONT,
                fontWeight: 700,
                fontSize: 13,
                color: palette.amber,
              }}
            >
              {v.kind === "vaccine"
                ? `${v.type} ${t("vaccine")}`
                : v.kind === "prep"
                ? "PrEP"
                : "Doxy-PEP"}
            </span>
            <button
              onClick={() => onEdit("vaccination", v)}
              style={{
                background: "none",
                border: "none",
                color: palette.amber,
                fontFamily: FONT,
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                marginLeft: "auto",
                padding: 4,
                minHeight: 32,
              }}
            >
              {t("edit")}
            </button>
          </div>
          {v.kind === "vaccine" && (
            <div style={{ fontFamily: FONT, fontSize: 12, color: palette.muted }}>
              {v.manufacturer} · {t("dose")} {v.dose}
            </div>
          )}
          {v.kind === "prep" && (
            <div style={{ fontFamily: FONT, fontSize: 12, color: palette.muted }}>
              {v.startDate && formatDate(v.startDate, data.prefs.lang)}
              {v.endDate
                ? ` — ${formatDate(v.endDate, data.prefs.lang)}`
                : ` (${t("ongoing")})`}
            </div>
          )}
        </div>
      ))}

      {ic.map((e: Intercourse) => {
        const c = findContact(e.cid);
        const at = Object.entries(e.t).filter(([, v]) => v);
        return (
          <div
            key={e.id}
            style={{
              background: palette.cardEl,
              borderRadius: 14,
              padding: "14px 16px",
              marginBottom: 10,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <Dot color={palette.rose} />
              <span
                style={{
                  fontFamily: FONT,
                  fontWeight: 700,
                  fontSize: 13,
                  color: palette.rose,
                }}
              >
                {c ? c.name : t("anonymousPartner")}
              </span>
              <button
                onClick={() => onEdit("intercourse", e)}
                style={{
                  background: "none",
                  border: "none",
                  color: palette.rose,
                  fontFamily: FONT,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                  marginLeft: "auto",
                  padding: 4,
                  minHeight: 32,
                }}
              >
                {t("edit")}
              </button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {at.map(([ty]) => (
                <div
                  key={ty}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span style={{ fontFamily: FONT, fontSize: 13, color: palette.text }}>
                    {t(ty as keyof typeof e.t)}
                  </span>
                  <Tag
                    color={e.p[ty as keyof typeof e.p] ? palette.green : palette.rose}
                    small
                  >
                    {e.p[ty as keyof typeof e.p] ? t("protected") : t("unprotected")}
                  </Tag>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </Sheet>
  );
}
