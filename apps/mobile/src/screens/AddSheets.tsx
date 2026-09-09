/**
 * Die vier Eingabeblaetter und der Umschalter dazwischen.
 *
 * Zusammengezogen, weil sie von zwei Stellen gebraucht werden: von der
 * Plus-Taste, die ueber allen Seiten schwebt, und aus dem Verlauf. Und
 * weil der Umschalter nur dann Sinn ergibt, wenn alle vier
 * nebeneinanderliegen.
 *
 * Der Umschalter ist bewusste Redundanz. Die Plus-Taste gibt auf langes
 * Druecken einen Faecher, aber Langdruck findet niemand von allein — wer
 * ihn nicht kennt, kommt ueber diese Leiste trotzdem ueberall hin.
 */
import { useState } from "react";
import {
  ScrollView,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  ACT_KEYS,
  ACT_NEEDS,
  PROTECTABLE_ACTS,
  STI_NAMES,
  emptyActs,
  genToken,
  gid,
  isIsoDate,
  today,
  type ActKey,
  type Contact,
  type Intercourse,
  type TestRecord,
  type TestResultValue,
  type VaccineKind,
  type Vaccination,
} from "@sexdiary/core";
import { useApp } from "../state/store";
import {
  Chip,
  GhostButton,
  PrimaryButton,
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

export function AddEncounter({ onClose }: { onClose: () => void }) {
  const { data, dispatch, t, palette } = useApp();
  const [date, setDate] = useState(today());
  const [acts, setActs] = useState<Set<ActKey>>(new Set());
  const [prot, setProt] = useState<Set<ActKey>>(new Set());
  const [cid, setCid] = useState<string | null>(null);

  // The chosen acts where a barrier changes the arithmetic at all.
  // The set comes from the STI table, so it cannot drift away from
  // the medicine, and kissing-only entries show no switch.
  const protectable = PROTECTABLE_ACTS.filter((k) => acts.has(k));

  // ACT_NEEDS records which anatomy an act requires. Offering acts the
  // stated partner anatomy rules out is noise, not flexibility; "both"
  // and the unanswered case both fall through to the full list.
  const offered = ACT_KEYS.filter((k) => {
    const needs = ACT_NEEDS[k];
    return (
      needs === null || data.profile.pa === "both" || needs === data.profile.pa
    );
  });

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
        {offered.map((k) => (
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

function AddContact({ onClose }: { onClose: () => void }) {
  const { dispatch, t, palette } = useApp();
  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");

  const field = {
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 12,
    padding: 12,
    color: palette.text,
    marginBottom: 12,
  };

  const save = () => {
    dispatch({
      type: "saveContact",
      payload: {
        id: gid("c"),
        name: name.trim(),
        notes: notes.trim() || null,
        // Every contact gets a token the moment it is created. Anonymous
        // notification must not depend on having thought of it earlier —
        // by the time it is needed, the conversation is hard enough.
        token: genToken(),
        cx: {},
      } satisfies Contact,
    });
    onClose();
  };

  return (
    <ScrollView keyboardShouldPersistTaps="handled">
      <Title>{t("contact")}</Title>

      <Text style={{ color: palette.sub, fontSize: 13, marginBottom: 6 }}>
        {t("name")}
      </Text>
      <TextInput value={name} onChangeText={setName} style={field} />

      <Text style={{ color: palette.sub, fontSize: 13, marginBottom: 6 }}>
        {t("notes")} ({t("optional")})
      </Text>
      <TextInput value={notes} onChangeText={setNotes} multiline style={field} />

      <PrimaryButton label={t("save")} onPress={save} disabled={!name.trim()} />
      <GhostButton label={t("cancel")} onPress={onClose} />
      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

/**
 * Vaccinations, PrEP and Doxy-PEP share one record type because they
 * answer the same question — what was protecting you on a given date —
 * but they carry different fields, so the form follows the choice.
 */
function AddVaccination({ onClose }: { onClose: () => void }) {
  const { dispatch, t, palette } = useApp();
  const [kind, setKind] = useState<VaccineKind>("vaccine");
  const [type, setType] = useState("Hep B");
  const [manufacturer, setManufacturer] = useState("");
  const [date, setDate] = useState(today());
  const [endDate, setEndDate] = useState("");

  const kinds: { id: VaccineKind; label: string }[] = [
    { id: "vaccine", label: t("vaccine") },
    { id: "prep", label: t("prep") },
    { id: "doxypep", label: t("doxyPep") },
  ];

  // Only the two series the app actually tracks (vaccineSeries targets
  // Hep B at 3 doses and Mpox at 2). Offering more would record doses
  // nothing ever counts.
  const types = ["Hep B", "Mpox"];

  const save = () => {
    const base = { id: gid("v"), kind };
    const record: Vaccination =
      kind === "vaccine"
        ? {
            ...base,
            type,
            ...(manufacturer.trim() ? { manufacturer: manufacturer.trim() } : {}),
            date,
          }
        : kind === "prep"
          ? { ...base, startDate: date, endDate: endDate.trim() || null }
          : { ...base, date };
    dispatch({ type: "saveVaccination", payload: record });
    onClose();
  };

  const valid = isIsoDate(date) && (kind !== "prep" || !endDate || isIsoDate(endDate));

  return (
    <ScrollView keyboardShouldPersistTaps="handled">
      <Title>{t("vaccination")}</Title>

      <View style={{ flexDirection: "row", flexWrap: "wrap", marginBottom: 8 }}>
        {kinds.map((k) => (
          <Chip
            key={k.id}
            label={k.label}
            active={kind === k.id}
            onPress={() => setKind(k.id)}
          />
        ))}
      </View>

      {kind === "vaccine" && (
        <>
          <SectionTitle>{t("vaccineType")}</SectionTitle>
          <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
            {types.map((ty) => (
              <Chip
                key={ty}
                label={ty}
                active={type === ty}
                onPress={() => setType(ty)}
              />
            ))}
          </View>

          <Text
            style={{ color: palette.sub, fontSize: 13, marginTop: 12, marginBottom: 6 }}
          >
            {t("manufacturer")} ({t("optional")})
          </Text>
          <TextInput
            value={manufacturer}
            onChangeText={setManufacturer}
            style={{
              borderWidth: 1,
              borderColor: palette.border,
              borderRadius: 12,
              padding: 12,
              color: palette.text,
              marginBottom: 12,
            }}
          />
        </>
      )}

      <DateField value={date} onChange={setDate} />

      {kind === "prep" && (
        <>
          <Text style={{ color: palette.sub, fontSize: 13, marginBottom: 6 }}>
            {t("endDate")} ({t("ongoing")})
          </Text>
          <DateField value={endDate} onChange={setEndDate} />
        </>
      )}

      <PrimaryButton label={t("save")} onPress={save} disabled={!valid} />
      <GhostButton label={t("cancel")} onPress={onClose} />
      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

export type AddKind = "intercourse" | "test" | "contact" | "vaccination";

export function AddSheet({
  kind,
  onKind,
  onClose,
}: {
  kind: AddKind;
  onKind: (k: AddKind) => void;
  onClose: () => void;
}) {
  const { t } = useApp();
  const kinds: { id: AddKind; label: string }[] = [
    { id: "intercourse", label: t("intercourse") },
    { id: "test", label: t("testEntry") },
    { id: "contact", label: t("contact") },
    { id: "vaccination", label: t("vaccination") },
  ];

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 4 }}
      >
        {kinds.map((k) => (
          <Chip
            key={k.id}
            label={k.label}
            active={kind === k.id}
            onPress={() => onKind(k.id)}
          />
        ))}
      </ScrollView>

      {kind === "intercourse" && <AddEncounter onClose={onClose} />}
      {kind === "test" && <AddTest onClose={onClose} />}
      {kind === "contact" && <AddContact onClose={onClose} />}
      {kind === "vaccination" && <AddVaccination onClose={onClose} />}
    </View>
  );
}
