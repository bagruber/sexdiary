import { useState, type ReactNode } from "react";
import { FONT, shadow } from "../theme/tokens";
import { SectionLabel, Toggle, Sheet, Checkbox, Button } from "../components/ui";
import { useApp } from "../state/store";
import { COUNTRIES, STI_NAMES } from "@sexdiary/core";
import { ChevronRight, Download, Upload, Trash2 } from "lucide-react";
import type {
  Lang,
  PartnerAnatomy,
  Preferences,
  Profile,
  ShareMode,
  Theme,
} from "@sexdiary/core";

interface Props {
  onExport: () => void;
  onImport: () => void;
  onDelAll: () => void;
  onTestsList: () => void;
  onContactsList: () => void;
}

interface RowBase {
  label: string;
  sub?: string;
  danger?: boolean;
  onClick?: () => void;
}
type Row =
  | (RowBase & { type: "select"; value: string; onChange: (v: string) => void; options: { value: string; label: string }[] | string[] })
  | (RowBase & { type: "input"; value: string; onChange: (v: string) => void; placeholder?: string })
  | (RowBase & { type: "toggle"; value: boolean; onChange: (v: boolean) => void })
  | (RowBase & { type: "info"; value: string })
  | (RowBase & { type: "action"; icon: ReactNode });

export function SettingsView({
  onExport,
  onImport,
  onDelAll,
  onTestsList,
  onContactsList,
}: Props) {
  const { data, dispatch, palette, isDark, t } = useApp();
  const { prefs, profile } = data;
  const [condOpen, setCondOpen] = useState(false);

  const updPrefs = (patch: Partial<Preferences>) =>
    dispatch({ type: "updatePrefs", patch });
  const updProfile = (patch: Partial<Profile>) =>
    dispatch({ type: "updateProfile", patch });

  const renderSection = (label: string, items: Row[]) => (
    <div style={{ marginBottom: 24 }}>
      <SectionLabel>{label}</SectionLabel>
      <div
        style={{
          background: palette.card,
          borderRadius: 16,
          overflow: "hidden",
          border: `1px solid ${palette.border}`,
          boxShadow: shadow(isDark),
        }}
      >
        {items.map((item, i) => (
          <div
            key={item.label || i}
            onClick={item.onClick}
            style={{
              padding: "14px 18px",
              borderBottom:
                i < items.length - 1 ? `1px solid ${palette.border}` : "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
              cursor: item.onClick ? "pointer" : "default",
              minHeight: 52,
            }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontFamily: FONT,
                  fontSize: 14,
                  fontWeight: 500,
                  color: item.danger ? palette.rose : palette.text,
                }}
              >
                {item.label}
              </div>
              {item.sub && (
                <div
                  style={{
                    fontFamily: FONT,
                    fontSize: 12,
                    color: palette.muted,
                    marginTop: 2,
                    lineHeight: 1.4,
                  }}
                >
                  {item.sub}
                </div>
              )}
            </div>
            {item.type === "select" && (
              <select
                value={item.value}
                onChange={(e) => item.onChange(e.target.value)}
                style={{
                  background: palette.cardEl,
                  border: `1px solid ${palette.border}`,
                  borderRadius: 8,
                  color: palette.text,
                  fontFamily: FONT,
                  fontSize: 12,
                  padding: "7px 10px",
                  cursor: "pointer",
                  outline: "none",
                  maxWidth: 155,
                }}
              >
                {item.options.map((o) =>
                  typeof o === "string" ? (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ) : (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ),
                )}
              </select>
            )}
            {item.type === "input" && (
              <input
                value={item.value}
                onChange={(e) => item.onChange(e.target.value)}
                placeholder={item.placeholder}
                style={{
                  background: palette.cardEl,
                  border: `1px solid ${palette.border}`,
                  borderRadius: 8,
                  color: palette.text,
                  fontFamily: FONT,
                  fontSize: 12,
                  padding: "7px 10px",
                  outline: "none",
                  maxWidth: 155,
                  boxSizing: "border-box",
                }}
              />
            )}
            {item.type === "toggle" && (
              <Toggle value={item.value} onChange={item.onChange} />
            )}
            {item.type === "info" && (
              <span
                style={{
                  fontFamily: FONT,
                  fontSize: 12,
                  color: palette.muted,
                  textAlign: "right",
                  maxWidth: 160,
                }}
              >
                {item.value}
              </span>
            )}
            {item.type === "action" && (
              <span
                style={{
                  color: item.danger ? palette.rose : palette.muted,
                  fontSize: 16,
                  flexShrink: 0,
                }}
              >
                {item.icon}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "28px 16px 100px" }}>
      <h1
        style={{
          fontFamily: FONT,
          fontSize: 26,
          fontWeight: 700,
          color: palette.text,
          margin: "0 0 24px",
        }}
      >
        {t("settings")}
      </h1>

      {renderSection(t("profile"), [
        {
          type: "input",
          label: t("age"),
          value: profile.age,
          onChange: (v) => updProfile({ age: v }),
          placeholder: "e.g. 28",
        },
        {
          type: "select",
          label: t("partnerAnatomy"),
          value: profile.pa,
          onChange: (v) => updProfile({ pa: v as PartnerAnatomy }),
          options: [
            { value: "both", label: t("both") },
            { value: "penis", label: t("penis") },
            { value: "vagina", label: t("vagina") },
          ],
        },
        {
          type: "action",
          label: t("knownConditions"),
          sub:
            profile.conditions.length > 0
              ? profile.conditions.join(", ")
              : t("knownConditionsSub"),
          icon: <ChevronRight size={16} />,
          onClick: () => setCondOpen(true),
        },
      ])}

      {renderSection(t("general"), [
        {
          type: "select",
          label: t("language"),
          value: prefs.lang,
          onChange: (v) => updPrefs({ lang: v as Lang }),
          options: [
            { value: "en", label: "English" },
            { value: "de", label: "Deutsch" },
          ],
        },
        {
          type: "select",
          label: t("theme"),
          value: prefs.theme,
          onChange: (v) => updPrefs({ theme: v as Theme }),
          options: [
            { value: "system", label: t("themeSystem") },
            { value: "light", label: t("themeLight") },
            { value: "dark", label: t("themeDark") },
          ],
        },
        {
          type: "select",
          label: t("region"),
          sub: t("regionSub"),
          value: prefs.country,
          onChange: (v) => updPrefs({ country: v }),
          options: COUNTRIES.map((c) => ({ value: c, label: c })),
        },
        {
          type: "toggle",
          label: t("testReminders"),
          sub: t("testRemindersSub"),
          value: prefs.notifs,
          onChange: (v) => updPrefs({ notifs: v }),
        },
        {
          type: "toggle",
          label: t("appLock"),
          sub: t("appLockSub"),
          value: prefs.lock,
          onChange: (v) => updPrefs({ lock: v }),
        },
        {
          type: "toggle",
          label: t("highPrevToggle"),
          sub: t("highPrevToggleSub"),
          value: prefs.highPrev,
          onChange: (v) => updPrefs({ highPrev: v }),
        },
        {
          type: "toggle",
          label: t("reducedMotion"),
          sub: t("reducedMotionSub"),
          value: prefs.reducedMotion,
          onChange: (v) => updPrefs({ reducedMotion: v }),
        },
        {
          type: "toggle",
          label: t("hideLowRisk"),
          sub: t("hideLowRiskSub"),
          value: prefs.hideLowRisk,
          onChange: (v) => updPrefs({ hideLowRisk: v }),
        },
      ])}

      {renderSection(t("sharingPrefs"), [
        {
          type: "select",
          label: t("shareMode"),
          value: prefs.shareMode,
          onChange: (v) => updPrefs({ shareMode: v as ShareMode }),
          options: [
            { value: "token", label: t("shareTokenOnlyLabel") },
            { value: "handle", label: t("shareWithHandle") },
          ],
        },
        ...(prefs.shareMode === "handle"
          ? ([
              {
                type: "select" as const,
                label: t("sharePlatform"),
                value: prefs.sharePlatform,
                onChange: (v: string) =>
                  updPrefs({ sharePlatform: v as typeof prefs.sharePlatform }),
                options: (
                  ["instagram", "telegram", "signal", "whatsapp", "snapchat"] as const
                ).map((s) => ({
                  value: s,
                  label: s[0].toUpperCase() + s.slice(1),
                })),
              },
              {
                type: "input" as const,
                label: t("shareHandle"),
                value: prefs.shareHandle,
                onChange: (v: string) => updPrefs({ shareHandle: v }),
                placeholder: "@handle",
              },
            ] as Row[])
          : []),
      ])}

      {renderSection(t("data"), [
        {
          type: "action",
          label: t("testsList"),
          sub: t("testsListSub"),
          icon: <ChevronRight size={16} />,
          onClick: onTestsList,
        },
        {
          type: "action",
          label: t("contactsList"),
          sub: t("contactsListSub"),
          icon: <ChevronRight size={16} />,
          onClick: onContactsList,
        },
        {
          type: "action",
          label: t("exportData"),
          sub: t("exportDataSub"),
          icon: <Download size={16} />,
          onClick: onExport,
        },
        {
          type: "action",
          label: t("importData"),
          sub: t("importDataSub"),
          icon: <Upload size={16} />,
          onClick: onImport,
        },
        {
          type: "action",
          label: t("deleteAllData"),
          sub: t("deleteAllDataSub"),
          icon: <Trash2 size={16} />,
          danger: true,
          onClick: onDelAll,
        },
      ])}

      {renderSection(t("about"), [
        { type: "info", label: t("version"), value: "0.4.0 prototype" },
        { type: "info", label: t("storage"), value: t("storageValue") },
        {
          type: "action",
          label: t("medicalDisclaimer"),
          sub: t("medicalDisclaimerSub"),
          icon: <ChevronRight size={16} />,
        },
      ])}

      {condOpen && (
        <Sheet onClose={() => setCondOpen(false)} title={t("knownConditionsTitle")}>
          <p
            style={{
              fontFamily: FONT,
              fontSize: 13,
              color: palette.muted,
              lineHeight: 1.5,
              marginBottom: 14,
            }}
          >
            {t("knownConditionsHint")}
          </p>
          {STI_NAMES.map((s) => (
            <Checkbox
              key={s}
              checked={profile.conditions.includes(s)}
              onChange={(v) => {
                const set = new Set(profile.conditions);
                if (v) set.add(s);
                else set.delete(s);
                updProfile({ conditions: [...set] });
              }}
              label={s}
            />
          ))}
          <Button onClick={() => setCondOpen(false)} full style={{ marginTop: 18 }}>
            {t("save")}
          </Button>
        </Sheet>
      )}
    </div>
  );
}
