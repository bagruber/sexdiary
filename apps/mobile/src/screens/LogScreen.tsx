import { useMemo, useState } from "react";
import {
  Modal,
  ScrollView,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  ACT_KEYS,
  PROTECTABLE_ACTS,
  STI_NAMES,
  emptyActs,
  formatDate,
  gid,
  isIsoDate,
  today,
  type ActKey,
  type Intercourse,
  type TestRecord,
  type TestResultValue,
} from "@sexdiary/core";
import { useApp } from "../state/store";
import {
  Card,
  Chip,
  GhostButton,
  PrimaryButton,
  Screen,
  SectionTitle,
  Title,
} from "../ui";

function DateField({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const { t, palette } = useApp();
  const valid = isIsoDate(value);
  return (
    <View style={{ marginBottom: 12 }}>
      <Text style={{ color: palette.sub, fontSize: 13, marginBottom: 6 }}>
        {t("date")} (YYYY-MM-DD)
      </Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={today()}
        placeholderTextColor={palette.sub}
        autoCapitalize="none"
        style={{
          borderWidth: 1,
          borderColor: valid ? palette.border : palette.bad,
          borderRadius: 12,
          padding: 12,
          color: palette.text,
        }}
      />
    </View>
  );
}

function AddEncounter({ onClose }: { onClose: () => void }) {
  const { data, dispatch, t, palette } = useApp();
  const [date, setDate] = useState(today());
  const [acts, setActs] = useState<Set<ActKey>>(new Set());
  const [prot, setProt] = useState<Set<ActKey>>(new Set());
  const [cid, setCid] = useState<string | null>(null);

  // The chosen acts where a barrier changes the arithmetic at all.
  // The set comes from the STI table, so it cannot drift away from
  // the medicine, and kissing-only entries show no switch.
  const protectable = PROTECTABLE_ACTS.filter((k) => acts.has(k));

  const save = () => {
    const tf = emptyActs();
    const pf = emptyActs();
    for (const a of acts) {
      tf[a] = 1;
      if (prot.has(a)) pf[a] = 1;
    }
    const entry: Intercourse = { id: gid("i"), date, cid, t: tf, p: pf };
    dispatch({ type: "saveIntercourse", payload: entry });
    onClose();
  };

  return (
    <ScrollView keyboardShouldPersistTaps="handled">
      <Title>{t("intercourse")}</Title>
      <DateField value={date} onChange={setDate} />

      <SectionTitle>{t("activities")}</SectionTitle>
      <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
        {ACT_KEYS.map((k) => (
          <Chip
            key={k}
            label={t(k)}
            active={acts.has(k)}
            onPress={() =>
              setActs((prev) => {
                const next = new Set(prev);
                if (next.has(k)) {
                  next.delete(k);
                  setProt((p) => {
                    if (!p.has(k)) return p;
                    const q = new Set(p);
                    q.delete(k);
                    return q;
                  });
                } else next.add(k);
                return next;
              })
            }
          />
        ))}
      </View>

      {protectable.length > 0 && (
        <>
          <SectionTitle>{t("protection")}</SectionTitle>
          {protectable.map((k) => (
            <View
              key={k}
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                paddingVertical: 8,
              }}
            >
              <Text style={{ color: palette.text }}>{t(k)}</Text>
              <Switch
                value={prot.has(k)}
                onValueChange={(on) =>
                  setProt((prev) => {
                    const next = new Set(prev);
                    if (on) next.add(k);
                    else next.delete(k);
                    return next;
                  })
                }
              />
            </View>
          ))}
        </>
      )}

      <SectionTitle>{t("selectContact")}</SectionTitle>
      <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
        <Chip
          label={t("anonymousPartner")}
          active={cid === null}
          onPress={() => setCid(null)}
        />
        {data.contacts.map((c) => (
          <Chip
            key={c.id}
            label={c.name}
            active={cid === c.id}
            onPress={() => setCid(c.id)}
          />
        ))}
      </View>

      <PrimaryButton
        label={t("save")}
        onPress={save}
        disabled={!isIsoDate(date) || acts.size === 0}
      />
      <GhostButton label={t("cancel")} onPress={onClose} />
      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

function AddTest({ onClose }: { onClose: () => void }) {
  const { dispatch, t, palette } = useApp();
  const [date, setDate] = useState(today());
  const [facility, setFacility] = useState("");
  const [panel, setPanel] = useState<Set<string>>(
    new Set(["HIV", "Gonorrhea", "Chlamydia", "Syphilis"]),
  );
  const [results, setResults] = useState<Record<string, TestResultValue>>({});

  const save = () => {
    const ts: Record<string, 0 | 1> = {};
    const res: Record<string, TestResultValue> = {};
    for (const sti of panel) {
      ts[sti] = 1;
      res[sti] = results[sti] ?? "negative";
    }
    const record: TestRecord = {
      id: gid("t"),
      date,
      num: "",
      fac: facility,
      ts,
      results: res,
    };
    dispatch({ type: "saveTest", payload: record });
    onClose();
  };

  return (
    <ScrollView keyboardShouldPersistTaps="handled">
      <Title>{t("testEntry")}</Title>
      <DateField value={date} onChange={setDate} />

      <Text style={{ color: palette.sub, fontSize: 13, marginBottom: 6 }}>
        {t("facility")} ({t("optional")})
      </Text>
      <TextInput
        value={facility}
        onChangeText={setFacility}
        style={{
          borderWidth: 1,
          borderColor: palette.border,
          borderRadius: 12,
          padding: 12,
          color: palette.text,
          marginBottom: 12,
        }}
      />

      <SectionTitle>{t("testedFor")}</SectionTitle>
      <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
        {STI_NAMES.map((sti) => (
          <Chip
            key={sti}
            label={sti}
            active={panel.has(sti)}
            onPress={() =>
              setPanel((prev) => {
                const next = new Set(prev);
                if (next.has(sti)) next.delete(sti);
                else next.add(sti);
                return next;
              })
            }
          />
        ))}
      </View>

      <SectionTitle>{t("results")}</SectionTitle>
      {[...panel].map((sti) => {
        const positive = results[sti] === "positive";
        return (
          <View
            key={sti}
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 8,
            }}
          >
            <Text style={{ color: palette.text }}>{sti}</Text>
            <Chip
              label={positive ? t("positive") : t("negative")}
              active={positive}
              onPress={() =>
                setResults((prev) => ({
                  ...prev,
                  [sti]: positive ? "negative" : "positive",
                }))
              }
            />
          </View>
        );
      })}

      <PrimaryButton
        label={t("save")}
        onPress={save}
        disabled={!isIsoDate(date) || panel.size === 0}
      />
      <GhostButton label={t("cancel")} onPress={onClose} />
      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

/**
 * What to say about protection for one encounter.
 *
 * Only the acts a barrier actually affects are counted. An entry that
 * is nothing but kissing gets no line at all, rather than an
 * "unprotected" that reads as a warning about something harmless.
 */
function ProtectionLine({ e }: { e: Intercourse }) {
  const { t, palette } = useApp();
  const relevant = PROTECTABLE_ACTS.filter((k) => e.t[k]);
  if (relevant.length === 0) return null;

  const n = relevant.filter((k) => e.p[k]).length;
  const key =
    n === 0 ? "unprotected" : n === relevant.length ? "protected" : "partlyProtected";
  const color =
    n === 0 ? palette.sub : n === relevant.length ? palette.good : palette.warn;

  return <Text style={{ color, marginTop: 2, fontSize: 13 }}>{t(key)}</Text>;
}

export function LogScreen() {
  const { data, t, palette } = useApp();
  const [adding, setAdding] = useState<"intercourse" | "test" | null>(null);

  const timeline = useMemo(() => {
    const enc = data.intercourse.map((e) => ({ kind: "enc" as const, date: e.date, e }));
    const tests = data.tests.map((r) => ({ kind: "test" as const, date: r.date, r }));
    return [...enc, ...tests].sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, 50);
  }, [data.intercourse, data.tests]);

  const contactName = (cid: string | null) =>
    cid
      ? (data.contacts.find((c) => c.id === cid)?.name ?? t("anonymousPartner"))
      : t("anonymousPartner");

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Title>{t("calendar")}</Title>
        <PrimaryButton label={`+ ${t("intercourse")}`} onPress={() => setAdding("intercourse")} />
        <GhostButton label={`+ ${t("testEntry")}`} onPress={() => setAdding("test")} />

        <SectionTitle>{t("addEntry")}</SectionTitle>
        {timeline.length === 0 && (
          <Card>
            <Text style={{ color: palette.sub }}>{t("noEntries")}</Text>
          </Card>
        )}
        {timeline.map((item) =>
          item.kind === "enc" ? (
            <Card key={item.e.id}>
              <Text style={{ color: palette.text, fontWeight: "600" }}>
                {formatDate(item.e.date, data.prefs.lang)} ·{" "}
                {contactName(item.e.cid)}
              </Text>
              <Text style={{ color: palette.sub, marginTop: 4, fontSize: 13 }}>
                {ACT_KEYS.filter((k) => item.e.t[k]).map((k) => t(k)).join(", ")}
              </Text>
              <ProtectionLine e={item.e} />
            </Card>
          ) : (
            <Card key={item.r.id}>
              <Text style={{ color: palette.text, fontWeight: "600" }}>
                {formatDate(item.r.date, data.prefs.lang)} · {t("testEntry")}
              </Text>
              <Text style={{ color: palette.sub, marginTop: 4, fontSize: 13 }}>
                {Object.keys(item.r.ts).join(", ")}
              </Text>
              {/* ADR-0007 A6: every record says where it came from. This
                  is the part that works before a single test centre
                  takes part — it turns each entry into a labelled claim
                  instead of an unqualified fact. */}
              <Text
                style={{
                  color: item.r.signed ? palette.good : palette.sub,
                  marginTop: 4,
                  fontSize: 12,
                  fontWeight: item.r.signed ? "600" : "400",
                }}
              >
                {item.r.signed
                  ? t("signedBy", { name: item.r.signed.issuer })
                  : t("selfEntered")}
              </Text>
              {Object.entries(item.r.results ?? {}).some(([, v]) => v === "positive") && (
                <Text style={{ color: palette.bad, marginTop: 2, fontSize: 13 }}>
                  {t("positive")}:{" "}
                  {Object.entries(item.r.results ?? {})
                    .filter(([, v]) => v === "positive")
                    .map(([k]) => k)
                    .join(", ")}
                </Text>
              )}
            </Card>
          ),
        )}
        <View style={{ height: 24 }} />
      </ScrollView>

      <Modal visible={adding !== null} animationType="slide" onRequestClose={() => setAdding(null)}>
        <View style={{ flex: 1, backgroundColor: palette.bg, padding: 16, paddingTop: 48 }}>
          {adding === "intercourse" && <AddEncounter onClose={() => setAdding(null)} />}
          {adding === "test" && <AddTest onClose={() => setAdding(null)} />}
        </View>
      </Modal>
    </Screen>
  );
}
