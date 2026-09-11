import { useMemo, useState } from "react";
import { Modal, Pressable, ScrollView, View } from "react-native";
import {
  ACT_KEYS,
  PROTECTABLE_ACTS,
  formatDate,
  type Intercourse,
} from "@sexdiary/core";
import { useApp } from "../state/store";
import { Card, Chip, GhostButton, Screen, SectionTitle, Text, Title} from "../ui";
import { AddSheet, type AddKind, type EditTarget } from "./AddSheets";
import { DayDetail, MonthView } from "./MonthView";

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
  const [adding, setAdding] = useState<AddKind | null>(null);
  const [ansicht, setAnsicht] = useState<"list" | "month">("list");
  const [tag, setTag] = useState<string | null>(null);
  const [edit, setEdit] = useState<EditTarget | null>(null);

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

        <View style={{ flexDirection: "row", marginBottom: 8 }}>
          <Chip
            label={t("viewList")}
            active={ansicht === "list"}
            onPress={() => setAnsicht("list")}
          />
          <Chip
            label={t("viewMonth")}
            active={ansicht === "month"}
            onPress={() => setAnsicht("month")}
          />
        </View>

        {ansicht === "month" && (
          <>
            <MonthView onPickDay={setTag} />
            {tag && <DayDetail date={tag} onEdit={setEdit} />}
          </>
        )}
        <GhostButton label={`+ ${t("testEntry")}`} onPress={() => setAdding("test")} />
        <GhostButton label={`+ ${t("contact")}`} onPress={() => setAdding("contact")} />
        <GhostButton
          label={`+ ${t("vaccination")}`}
          onPress={() => setAdding("vaccination")}
        />

        {ansicht === "list" && (
          <>
        <SectionTitle>{t("addEntry")}</SectionTitle>
        {timeline.length === 0 && (
          <Card>
            <Text style={{ color: palette.sub }}>{t("noEntries")}</Text>
          </Card>
        )}
        {timeline.map((item) =>
          item.kind === "enc" ? (
            <Pressable
              key={item.e.id}
              accessibilityRole="button"
              accessibilityHint={t("edit")}
              onPress={() => setEdit({ kind: "intercourse", record: item.e })}
            >
            <Card>
              <Text style={{ color: palette.text, fontWeight: "600" }}>
                {formatDate(item.e.date, data.prefs.lang)} ·{" "}
                {contactName(item.e.cid)}
              </Text>
              <Text style={{ color: palette.sub, marginTop: 4, fontSize: 13 }}>
                {ACT_KEYS.filter((k) => item.e.t[k]).map((k) => t(k)).join(", ")}
              </Text>
              <ProtectionLine e={item.e} />
            </Card>
            </Pressable>
          ) : (
            <Pressable
              key={item.r.id}
              accessibilityRole="button"
              accessibilityHint={t("edit")}
              onPress={() => setEdit({ kind: "test", record: item.r })}
            >
            <Card>
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
            </Pressable>
          ),
        )}
          </>
        )}
        <View style={{ height: 24 }} />
      </ScrollView>

      <Modal
        visible={edit !== null}
        animationType="slide"
        onRequestClose={() => setEdit(null)}
      >
        <View
          style={{ flex: 1, backgroundColor: palette.bg, padding: 16, paddingTop: 48 }}
        >
          {edit && (
            <AddSheet
              kind={edit.kind}
              onKind={() => undefined}
              onClose={() => setEdit(null)}
              edit={edit}
            />
          )}
        </View>
      </Modal>

      <Modal visible={adding !== null} animationType="slide" onRequestClose={() => setAdding(null)}>
        <View style={{ flex: 1, backgroundColor: palette.bg, padding: 16, paddingTop: 48 }}>
          {adding && (
            <AddSheet
              kind={adding}
              onKind={setAdding}
              onClose={() => setAdding(null)}
            />
          )}
        </View>
      </Modal>
    </Screen>
  );
}
