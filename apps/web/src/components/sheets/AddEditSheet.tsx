import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { FONT } from "../../theme/tokens";
import {
  Sheet,
  Pill,
  Checkbox,
  Input,
  Select,
  Button,
  FieldLabel,
} from "../ui";
import { useApp } from "../../state/store";
import { ACT_KEYS, type ActKey, emptyActs } from "@sexdiary/core";
import type {
  Contact,
  Intercourse,
  TestRecord,
  Vaccination,
} from "@sexdiary/core";
import { ACT_NEEDS, LOW_RISK_ACTIVITIES, STI_NAMES } from "@sexdiary/core";
import { dateString } from "@sexdiary/core";
import { gid, genToken } from "@sexdiary/core";

export type EditType = "intercourse" | "test" | "contact" | "vaccination";

interface Props {
  onClose: () => void;
  editType?: EditType | null;
  editData?: unknown;
  initTab?: EditType | null;
  onAfterSave?: (type: EditType, saved: unknown) => void;
}

export function AddEditSheet({
  onClose,
  editType,
  editData,
  initTab,
  onAfterSave,
}: Props) {
  const { data, dispatch, palette, t } = useApp();
  const isEdit = !!editData;
  const [tab, setTab] = useState<EditType>(editType ?? initTab ?? "intercourse");

  // Intercourse
  const ed = (editData ?? {}) as Partial<Intercourse & TestRecord & Contact & Vaccination>;
  const [iD, setID] = useState<string>((ed.date as string) ?? dateString(new Date()));
  const [iA, setIA] = useState<boolean>(isEdit ? !(ed as Intercourse).cid : false);
  const [iC, setIC] = useState<string>((ed as Intercourse).cid ?? "");
  const [acts, setActs] = useState(() =>
    (ed as Intercourse).t ? { ...(ed as Intercourse).t } : emptyActs(),
  );
  const [prot, setProt] = useState(() =>
    (ed as Intercourse).p ? { ...(ed as Intercourse).p } : emptyActs(),
  );

  // Test
  const [tD, setTD] = useState<string>((ed.date as string) ?? dateString(new Date()));
  const [tF, setTF] = useState<string>((ed as TestRecord).fac ?? "");
  const [tN, setTN] = useState<string>((ed as TestRecord).num ?? "");
  const [tS, setTS] = useState<Record<string, 0 | 1>>(() => {
    const init = (ed as TestRecord).ts ?? {};
    return Object.fromEntries(STI_NAMES.map((s) => [s, (init[s] ?? 0) as 0 | 1]));
  });
  const [tR, setTR] = useState<Record<string, "negative" | "positive">>(() => {
    const init = (ed as TestRecord).results ?? {};
    return Object.fromEntries(
      Object.entries(init).filter(([, v]) => v !== undefined),
    ) as Record<string, "negative" | "positive">;
  });

  // Contact
  const [cN, setCN] = useState<string>((ed as Contact).name ?? "");
  const [cNo, setCNo] = useState<string>((ed as Contact).notes ?? "");
  const [cT, setCT] = useState<string>((ed as Contact).token ?? genToken());
  const [cX, setCX] = useState<Contact["cx"]>(() => ({ ...((ed as Contact).cx ?? {}) }));

  // Vaccination
  const vac = ed as Vaccination;
  const [vK, setVK] = useState<Vaccination["kind"]>(vac.kind ?? "vaccine");
  const [vT, setVT] = useState<string>(vac.type ?? "Hep B");
  const [vD, setVD] = useState<string>(vac.date ?? dateString(new Date()));
  const [vM, setVM] = useState<string>(vac.manufacturer ?? "");
  const [vDose, setVDose] = useState<number>(vac.dose ?? 1);
  const [vS, setVS] = useState<string>(vac.startDate ?? dateString(new Date()));
  const [vE, setVE] = useState<string>(vac.endDate ?? "");
  const [vO, setVO] = useState<boolean>(isEdit ? !vac.endDate : true);

  const [actNote, setActNote] = useState<ActKey | null>(null);
  const pPref = data.profile.pa;

  useEffect(() => {
    if (editType) setTab(editType);
  }, [editType]);

  const isGrey = (k: ActKey) => {
    if (pPref === "both" || !pPref) return false;
    const need = ACT_NEEDS[k];
    return need ? need !== pPref : false;
  };

  const visibleActs = ACT_KEYS.filter(
    (k) => !data.prefs.hideLowRisk || !LOW_RISK_ACTIVITIES.includes(k),
  );

  const doSave = () => {
    if (tab === "intercourse") {
      const saved: Intercourse = {
        id: (ed.id as string) ?? gid("i"),
        date: iD,
        cid: iA ? null : iC || null,
        t: { ...acts },
        p: { ...prot },
      };
      dispatch({ type: "saveIntercourse", payload: saved });
      onAfterSave?.("intercourse", saved);
    } else if (tab === "test") {
      const rs: Record<string, "negative" | "positive"> = {};
      Object.entries(tS).forEach(([k, v]) => {
        if (v) rs[k] = tR[k] ?? "negative";
      });
      const saved: TestRecord = {
        id: (ed.id as string) ?? gid("t"),
        date: tD,
        fac: tF,
        num: tN,
        ts: { ...tS },
        results: rs,
      };
      dispatch({ type: "saveTest", payload: saved });
      onAfterSave?.("test", saved);
    } else if (tab === "contact") {
      const saved: Contact = {
        id: (ed.id as string) ?? gid("c"),
        name: cN,
        notes: cNo || null,
        token: cT,
        cx: { ...cX },
      };
      dispatch({ type: "saveContact", payload: saved });
      onAfterSave?.("contact", saved);
    } else if (tab === "vaccination") {
      const base: Vaccination = { id: (ed.id as string) ?? gid("v"), kind: vK };
      if (vK === "vaccine")
        Object.assign(base, {
          type: vT,
          date: vD,
          manufacturer: vM,
          dose: vDose,
        });
      else if (vK === "prep")
        Object.assign(base, { startDate: vS, endDate: vO ? null : vE });
      else base.date = vD;
      dispatch({ type: "saveVaccination", payload: base });
      onAfterSave?.("vaccination", base);
    }
    onClose();
  };

  const doDelete = () => {
    if (!isEdit || !ed.id) return;
    if (!window.confirm(t("confirmDelete"))) return;
    dispatch({ type: "deleteEntry", entry: tab, id: ed.id as string });
    onClose();
  };

  return (
    <Sheet onClose={onClose} title={isEdit ? t("editEntry") : t("addEntry")}>
      <div
        style={{
          display: "flex",
          gap: 6,
          marginBottom: 22,
          overflowX: "auto",
          paddingBottom: 2,
        }}
      >
        {(isEdit ? [tab] : (["intercourse", "test", "contact", "vaccination"] as EditType[])).map(
          (id) => (
            <Pill key={id} active={tab === id} onClick={() => setTab(id)}>
              {
                {
                  intercourse: t("intercourse"),
                  test: t("testEntry"),
                  contact: t("contact"),
                  vaccination: t("vaccination"),
                }[id]
              }
            </Pill>
          ),
        )}
      </div>

      {tab === "intercourse" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <FieldLabel>{t("date")}</FieldLabel>
            <Input type="date" value={iD} onChange={setID} />
          </div>
          <Checkbox checked={iA} onChange={setIA} label={t("anonymousPartner")} />
          {!iA && (
            <div>
              <FieldLabel>{t("selectContact")}</FieldLabel>
              <Select
                value={iC}
                onChange={setIC}
                placeholder={t("selectContact")}
                options={data.contacts.map((c) => ({ value: c.id, label: c.name }))}
              />
            </div>
          )}
          <div>
            <FieldLabel>{t("activities")}</FieldLabel>
            {visibleActs.map((k) => {
              const grey = isGrey(k);
              return (
                <div key={k}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <div
                      onClick={() => {
                        if (grey && !acts[k]) setActNote(k);
                      }}
                      style={{ flex: 1 }}
                    >
                      <Checkbox
                        checked={!!acts[k]}
                        onChange={(v) => {
                          if (grey && v) {
                            setActNote(k);
                            return;
                          }
                          setActs((a) => ({ ...a, [k]: v ? 1 : 0 }));
                          if (!v) setProt((p) => ({ ...p, [k]: 0 }));
                        }}
                        label={t(k)}
                        color={palette.rose}
                        dim={grey && !acts[k]}
                      />
                    </div>
                    {!!acts[k] && (
                      <Checkbox
                        checked={!!prot[k]}
                        onChange={(v) => setProt((a) => ({ ...a, [k]: v ? 1 : 0 }))}
                        label={t("protected")}
                        color={palette.green}
                      />
                    )}
                  </div>
                  {actNote === k && grey && (
                    <div
                      style={{
                        marginLeft: 32,
                        marginBottom: 10,
                        padding: "10px 14px",
                        borderRadius: 10,
                        background: palette.amber + "0C",
                        border: `1px solid ${palette.amber}30`,
                      }}
                    >
                      <div
                        style={{
                          fontFamily: FONT,
                          fontSize: 12,
                          color: palette.amber,
                          lineHeight: 1.5,
                        }}
                      >
                        {t("activityNote")}
                      </div>
                      <button
                        onClick={() => setActNote(null)}
                        style={{
                          background: "none",
                          border: "none",
                          fontFamily: FONT,
                          fontSize: 12,
                          color: palette.teal,
                          fontWeight: 600,
                          cursor: "pointer",
                          marginTop: 6,
                          padding: 0,
                        }}
                      >
                        {t("ok")}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {tab === "test" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <FieldLabel>{t("date")}</FieldLabel>
            <Input type="date" value={tD} onChange={setTD} />
          </div>
          <div>
            <FieldLabel>{t("facility")}</FieldLabel>
            <Input value={tF} onChange={setTF} placeholder={t("facility")} />
          </div>
          <div>
            <FieldLabel>{t("testNumber")}</FieldLabel>
            <Input value={tN} onChange={setTN} placeholder="T-2026-003" />
          </div>
          <div>
            <FieldLabel>{t("testedFor")}</FieldLabel>
            {STI_NAMES.map((s) => (
              <div
                key={s}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "3px 0",
                }}
              >
                <Checkbox
                  checked={!!tS[s]}
                  onChange={(v) => {
                    setTS((a) => ({ ...a, [s]: v ? 1 : 0 }));
                    if (!v) {
                      setTR((r) => {
                        const n = { ...r };
                        delete n[s];
                        return n;
                      });
                    } else {
                      setTR((r) => ({ ...r, [s]: "negative" }));
                    }
                  }}
                  label={s}
                  color={palette.teal}
                />
                {!!tS[s] && (
                  <div style={{ display: "flex", gap: 6 }}>
                    {(["negative", "positive"] as const).map((r) => (
                      <button
                        key={r}
                        onClick={() => setTR((x) => ({ ...x, [s]: r }))}
                        style={{
                          padding: "5px 14px",
                          borderRadius: 12,
                          minHeight: 32,
                          background:
                            tR[s] === r
                              ? r === "positive"
                                ? palette.rose
                                : palette.green
                              : "transparent",
                          border: `1.5px solid ${r === "positive" ? palette.rose : palette.green}`,
                          color:
                            tR[s] === r
                              ? "#fff"
                              : r === "positive"
                              ? palette.rose
                              : palette.green,
                          fontFamily: FONT,
                          fontSize: 11,
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        {r === "negative" ? "−" : "+"}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "contact" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <FieldLabel>{t("name")}</FieldLabel>
            <Input value={cN} onChange={setCN} placeholder={t("name")} />
          </div>
          <div>
            <FieldLabel>
              {t("notes")} ({t("optional")})
            </FieldLabel>
            <Input value={cNo} onChange={setCNo} />
          </div>
          <div>
            <FieldLabel>{t("anonymousToken")}</FieldLabel>
            <div style={{ display: "flex", gap: 8 }}>
              <div
                style={{
                  flex: 1,
                  padding: "12px 14px",
                  borderRadius: 12,
                  background: palette.cardEl,
                  border: `1.5px solid ${palette.border}`,
                  fontFamily: "monospace",
                  fontSize: 11,
                  color: palette.muted,
                  wordBreak: "break-all",
                  lineHeight: 1.5,
                }}
              >
                {cT}
              </div>
              <button
                onClick={() => setCT(genToken())}
                style={{
                  padding: "0 14px",
                  borderRadius: 12,
                  background: palette.cardEl,
                  border: `1.5px solid ${palette.border}`,
                  color: palette.muted,
                  cursor: "pointer",
                  flexShrink: 0,
                  minWidth: 44,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <RefreshCw size={16} />
              </button>
            </div>
          </div>
          <div>
            <FieldLabel>
              {t("contactHandles")} ({t("optional")})
            </FieldLabel>
            {(["instagram", "telegram", "signal", "whatsapp", "snapchat"] as const).map((s) => (
              <div key={s} style={{ marginBottom: 10 }}>
                <span
                  style={{
                    fontFamily: FONT,
                    fontSize: 11,
                    color: palette.muted,
                    textTransform: "capitalize",
                    display: "block",
                    marginBottom: 4,
                  }}
                >
                  {s}
                </span>
                <Input
                  value={cX[s] ?? ""}
                  onChange={(v) =>
                    setCX((x) => {
                      const next = { ...x };
                      if (v) next[s] = v;
                      else delete next[s];
                      return next;
                    })
                  }
                  placeholder={"@" + s}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "vaccination" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <FieldLabel>{t("kind")}</FieldLabel>
            <div style={{ display: "flex", gap: 6 }}>
              {(
                [
                  ["vaccine", t("vaccine")],
                  ["prep", "PrEP"],
                  ["doxypep", "Doxy-PEP"],
                ] as const
              ).map(([k, l]) => (
                <Pill
                  key={k}
                  active={vK === k}
                  onClick={() => setVK(k as Vaccination["kind"])}
                  color={palette.amber}
                >
                  {l}
                </Pill>
              ))}
            </div>
          </div>
          {vK === "vaccine" && (
            <>
              <div>
                <FieldLabel>{t("vaccineType")}</FieldLabel>
                <Select
                  value={vT}
                  onChange={setVT}
                  options={["Hep B", "Hep A", "Mpox", "HPV"]}
                />
              </div>
              <div>
                <FieldLabel>{t("date")}</FieldLabel>
                <Input type="date" value={vD} onChange={setVD} />
              </div>
              <div>
                <FieldLabel>
                  {t("manufacturer")} ({t("optional")})
                </FieldLabel>
                <Input value={vM} onChange={setVM} />
              </div>
              <div>
                <FieldLabel>{t("doseNumber")}</FieldLabel>
                <Select
                  value={String(vDose)}
                  onChange={(v) => setVDose(Number(v))}
                  options={[1, 2, 3, 4].map((n) => ({
                    value: String(n),
                    label: t("dose") + " " + n,
                  }))}
                />
              </div>
            </>
          )}
          {vK === "prep" && (
            <>
              <div>
                <FieldLabel>{t("startDate")}</FieldLabel>
                <Input type="date" value={vS} onChange={setVS} />
              </div>
              <Checkbox checked={vO} onChange={setVO} label={t("ongoing")} />
              {!vO && (
                <div>
                  <FieldLabel>{t("endDate")}</FieldLabel>
                  <Input type="date" value={vE} onChange={setVE} />
                </div>
              )}
            </>
          )}
          {vK === "doxypep" && (
            <div>
              <FieldLabel>{t("dateTaken")}</FieldLabel>
              <Input type="date" value={vD} onChange={setVD} />
            </div>
          )}
        </div>
      )}

      <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
        {isEdit && (
          <Button onClick={doDelete} danger outline style={{ flex: 1 }}>
            {t("delete")}
          </Button>
        )}
        <Button onClick={doSave} full style={{ flex: isEdit ? 2 : 1 }}>
          {t("save")}
        </Button>
      </div>
    </Sheet>
  );
}
