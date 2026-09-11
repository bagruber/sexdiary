import { useEffect, useState } from "react";
import {
  Circle,
  CircleDashed,
  CircleDot,
  CheckCircle2,
  ChevronLeft,
  type LucideIcon,
} from "lucide-react";
import { shadow } from "../theme/tokens";
import { Tag, Checkbox, Button } from "../components/ui";
import { useApp } from "../state/store";
import { getAlerts } from "@sexdiary/core";
import { formatDate } from "@sexdiary/core";
import { sendAlert, statusFor, type AlertStatus } from "../lib/mock-server";

interface Props {
  onBack: () => void;
}

const STATUS_ICON: Record<AlertStatus, LucideIcon> = {
  pending: Circle,
  notified: CircleDashed,
  confirmed: CircleDot,
  testedNegative: CheckCircle2,
};

export function AlertsView({ onBack }: Props) {
  const { data, palette, isDark, t } = useApp();
  const alerts = getAlerts(data.tests, data.intercourse, data.contacts);
  const [, force] = useState(0);
  const [personally, setPersonally] = useState<Record<string, boolean>>({});

  // Poll mock-server status every 2s while view is open (status auto-advances from sentAt)
  useEffect(() => {
    const id = setInterval(() => force((n) => n + 1), 2000);
    return () => clearInterval(id);
  }, []);

  const STATUS_LABEL: Record<AlertStatus, string> = {
    pending: t("pending"),
    notified: t("awaitingResponse"),
    confirmed: t("contactConfirmed"),
    testedNegative: t("testedNegative"),
  };
  const STATUS_COLOR: Record<AlertStatus, string> = {
    pending: palette.muted,
    notified: palette.amber,
    confirmed: palette.teal,
    testedNegative: palette.green,
  };

  const personalKey = (sti: string, cid: string) => `${sti}:${cid}`;

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "28px 16px 100px" }}>
      <button
        onClick={onBack}
        style={{
          background: "none",
          border: "none",
          fontSize: 14,
          color: palette.teal,
          fontWeight: 600,
          cursor: "pointer",
          padding: "0 0 16px",
          display: "inline-flex",
          alignItems: "center",
          gap: 4,
          minHeight: 44,
        }}
      >
        <ChevronLeft size={16} />
        {t("back")}
      </button>
      <h1
        style={{
          fontSize: 26,
          fontWeight: 700,
          color: palette.text,
          margin: "0 0 20px",
        }}
      >
        {t("partnerAlertsPage")}
      </h1>

      {alerts.length === 0 && (
        <p style={{ fontSize: 14, color: palette.muted }}>
          {t("noAlerts")}
        </p>
      )}

      {alerts.map((al, ai) => (
        <div key={ai} style={{ marginBottom: 28 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <Tag color={palette.rose} filled>
              {al.sti} +
            </Tag>
            <span style={{ fontSize: 12, color: palette.muted }}>
              {formatDate(al.testDate, data.prefs.lang)}
            </span>
          </div>
          <div
            style={{
              fontSize: 13,
              color: palette.muted,
              lineHeight: 1.6,
              marginBottom: 16,
            }}
          >
            {t("partnerAlertsExplain", { sti: al.sti })}
          </div>
          {al.contacts.length === 0 && (
            <div
              style={{
                fontSize: 13,
                color: palette.muted,
                fontStyle: "italic",
              }}
            >
              {t("noContactsToNotify")}
            </div>
          )}
          {al.contacts.map((c) => {
            const status = statusFor(c.token, al.sti);
            const col = STATUS_COLOR[status];
            const pk = personalKey(al.sti, c.id);
            const Icon = STATUS_ICON[status];
            return (
              <div
                key={c.id}
                style={{
                  background: palette.card,
                  borderRadius: 16,
                  padding: "16px 18px",
                  marginBottom: 10,
                  border: `1px solid ${palette.border}`,
                  boxShadow: shadow(isDark),
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 12,
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: 15,
                        color: palette.text,
                      }}
                    >
                      {c.name}
                    </div>
                    <div
                      style={{
                        fontFamily: "monospace",
                        fontSize: 10,
                        color: palette.muted,
                        marginTop: 2,
                      }}
                    >
                      Token: {c.token.slice(0, 8)}…
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <Icon size={14} color={col} strokeWidth={2.2} />
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        color: col,
                      }}
                    >
                      {STATUS_LABEL[status]}
                    </span>
                  </div>
                </div>
                {status === "pending" && (
                  <Button
                    onClick={() => {
                      sendAlert(c.token, al.sti);
                      force((n) => n + 1);
                    }}
                    color={palette.rose}
                    full
                    small
                  >
                    {t("notifyAnonymously")}
                  </Button>
                )}
                {status !== "pending" && (
                  <div
                    style={{
                      padding: "10px 14px",
                      borderRadius: 12,
                      background: col + "0C",
                      border: `1px solid ${col}30`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 6,
                    }}
                  >
                    <Icon size={14} color={col} strokeWidth={2.2} />
                    <span
                      style={{
                        fontSize: 12,
                        color: col,
                        fontWeight: 600,
                      }}
                    >
                      {STATUS_LABEL[status]}
                    </span>
                  </div>
                )}
                <div style={{ marginTop: 10 }}>
                  <Checkbox
                    checked={!!personally[pk]}
                    onChange={(v) => setPersonally((p) => ({ ...p, [pk]: v }))}
                    label={t("notifiedPersonally")}
                    color={palette.green}
                  />
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
