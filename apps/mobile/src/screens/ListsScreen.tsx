/**
 * Angelegtes wieder loswerden.
 *
 * `deleteEntry` gab es im Reducer seit jeher, benutzt hat es niemand:
 * ein vertippter Kontakt oder ein doppelt erfasster Test blieben
 * dauerhaft stehen. Fuer ein Tagebuch, das jemand ueber Jahre fuehrt,
 * ist das kein Randfall.
 *
 * Loeschen fragt nach. Nicht aus Vorsicht vor dem Fehlgriff — die Liste
 * ist kurz und die Ziele sind gross —, sondern weil ein geloeschter
 * Kontakt seinen Token mitnimmt, und damit die Moeglichkeit, diese
 * Person je anonym zu benachrichtigen.
 */
import { useState } from "react";
import { Alert, ScrollView, Text, View } from "react-native";
import { formatDate, type EntryType } from "@sexdiary/core";
import { useApp } from "../state/store";
import { Card, Chip, GhostButton, Screen, Title } from "../ui";

type Kind = "contact" | "test" | "vaccination";

export function ListsScreen({ onClose }: { onClose: () => void }) {
  const { data, dispatch, t, palette } = useApp();
  const [kind, setKind] = useState<Kind>("contact");

  const kinds: { id: Kind; label: string }[] = [
    { id: "contact", label: t("contactsHeading") },
    { id: "test", label: t("testsHeading") },
    { id: "vaccination", label: t("vaccination") },
  ];

  const remove = (entry: EntryType, id: string, was: string) =>
    Alert.alert(was, t("deleteEntryConfirm"), [
      { text: t("cancel"), style: "cancel" },
      {
        text: t("delete"),
        style: "destructive",
        onPress: () => dispatch({ type: "deleteEntry", entry, id }),
      },
    ]);

  const zeile = (
    key: string,
    titel: string,
    unter: string,
    onDelete: () => void,
  ) => (
    <Card key={key}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 12,
        }}
      >
        <View style={{ flex: 1 }}>
          <Text style={{ color: palette.text, fontWeight: "600" }}>{titel}</Text>
          <Text style={{ color: palette.sub, fontSize: 13, marginTop: 2 }}>
            {unter}
          </Text>
        </View>
        <Text
          accessibilityRole="button"
          accessibilityLabel={`${t("delete")}: ${titel}`}
          onPress={onDelete}
          style={{ color: palette.bad, fontSize: 13, paddingVertical: 2 }}
        >
          {t("delete")}
        </Text>
      </View>
    </Card>
  );

  const leer = (text: string) => (
    <Card>
      <Text style={{ color: palette.sub }}>{text}</Text>
    </Card>
  );

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Title>{t("data")}</Title>

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

        {kind === "contact" &&
          (data.contacts.length === 0
            ? leer(t("noContacts"))
            : data.contacts.map((c) =>
                zeile(
                  c.id,
                  c.name,
                  Object.entries(c.cx)
                    .map(([p, h]) => `${p}: ${h}`)
                    .join(" · ") || t("shareTokenOnly"),
                  () => remove("contact", c.id, c.name),
                ),
              ))}

        {kind === "test" &&
          (data.tests.length === 0
            ? leer(t("noTestsLong"))
            : data.tests.map((r) =>
                zeile(
                  r.id,
                  formatDate(r.date, data.prefs.lang),
                  Object.entries(r.results ?? {})
                    .filter(([, v]) => v !== undefined)
                    .map(([sti, v]) => `${sti}: ${t(v as "negative" | "positive")}`)
                    .join(" · ") || Object.keys(r.ts).join(" · "),
                  () => remove("test", r.id, formatDate(r.date, data.prefs.lang)),
                ),
              ))}

        {kind === "vaccination" &&
          (data.vaccinations.length === 0
            ? leer(t("noEntries"))
            : data.vaccinations.map((v) =>
                zeile(
                  v.id,
                  v.type ?? t(v.kind === "prep" ? "prep" : "doxyPep"),
                  formatDate(v.date ?? v.startDate ?? "", data.prefs.lang),
                  () => remove("vaccination", v.id, v.type ?? v.kind),
                ),
              ))}

        <GhostButton label={t("back")} onPress={onClose} />
        <View style={{ height: 32 }} />
      </ScrollView>
    </Screen>
  );
}
