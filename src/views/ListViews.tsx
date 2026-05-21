import { FONT, shadow } from "../theme/tokens";
import { Tag } from "../components/ui";
import { useApp } from "../state/store";
import { formatDate } from "../lib/date";

interface BaseProps {
  onBack: () => void;
  onEdit: (id: string) => void;
}

function BackHeader({ onBack, title }: { onBack: () => void; title: string }) {
  const { palette } = useApp();
  return (
    <>
      <button
        onClick={onBack}
        style={{
          background: "none",
          border: "none",
          fontFamily: FONT,
          fontSize: 14,
          color: palette.teal,
          fontWeight: 600,
          cursor: "pointer",
          padding: "0 0 16px",
          display: "block",
          minHeight: 44,
        }}
      >
        ← Back
      </button>
      <h1
        style={{
          fontFamily: FONT,
          fontSize: 26,
          fontWeight: 700,
          color: palette.text,
          margin: "0 0 20px",
        }}
      >
        {title}
      </h1>
    </>
  );
}

export function TestsListView({ onBack, onEdit }: BaseProps) {
  const { data, palette, isDark, t } = useApp();
  const sorted = [...data.tests].sort((a, b) =>
    b.date.localeCompare(a.date),
  );
  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "28px 16px 100px" }}>
      <BackHeader onBack={onBack} title={t("testsHeading")} />
      {sorted.length === 0 && (
        <p style={{ fontFamily: FONT, fontSize: 14, color: palette.muted }}>
          {t("noTestsLong")}
        </p>
      )}
      {sorted.map((rec) => (
        <div
          key={rec.id}
          onClick={() => onEdit(rec.id)}
          style={{
            background: palette.card,
            borderRadius: 14,
            padding: "14px 16px",
            marginBottom: 10,
            border: `1px solid ${palette.border}`,
            boxShadow: shadow(isDark),
            cursor: "pointer",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 6,
            }}
          >
            <div
              style={{
                fontFamily: FONT,
                fontWeight: 700,
                fontSize: 14,
                color: palette.text,
              }}
            >
              {rec.fac || rec.num || "Test"}
            </div>
            <div style={{ fontFamily: FONT, fontSize: 12, color: palette.muted }}>
              {formatDate(rec.date, data.prefs.lang)}
            </div>
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
    </div>
  );
}

export function ContactsListView({ onBack, onEdit }: BaseProps) {
  const { data, palette, isDark, t } = useApp();
  const sorted = [...data.contacts].sort((a, b) => a.name.localeCompare(b.name));
  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "28px 16px 100px" }}>
      <BackHeader onBack={onBack} title={t("contactsHeading")} />
      {sorted.length === 0 && (
        <p style={{ fontFamily: FONT, fontSize: 14, color: palette.muted }}>
          {t("noContacts")}
        </p>
      )}
      {sorted.map((c) => (
        <div
          key={c.id}
          onClick={() => onEdit(c.id)}
          style={{
            background: palette.card,
            borderRadius: 14,
            padding: "14px 16px",
            marginBottom: 10,
            border: `1px solid ${palette.border}`,
            boxShadow: shadow(isDark),
            cursor: "pointer",
          }}
        >
          <div
            style={{
              fontFamily: FONT,
              fontWeight: 700,
              fontSize: 14,
              color: palette.text,
              marginBottom: 4,
            }}
          >
            {c.name}
          </div>
          {c.notes && (
            <div
              style={{
                fontFamily: FONT,
                fontSize: 12,
                color: palette.muted,
                marginBottom: 4,
              }}
            >
              {c.notes}
            </div>
          )}
          <div
            style={{
              fontFamily: "monospace",
              fontSize: 10,
              color: palette.muted,
            }}
          >
            {c.token.slice(0, 12)}…
          </div>
        </div>
      ))}
    </div>
  );
}
