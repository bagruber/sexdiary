/**
 * Partner benachrichtigen (ADR-0008, ADR-0011).
 *
 * Der seltene Vorgang, auf den alles andere hinarbeitet. Er passiert
 * vielleicht nie und ist trotzdem der Moment, in dem die App zaehlt.
 *
 * Zwei Wege, und der persoenliche ist ausdruecklich kein zweitklassiger:
 * wer es selbst sagt, schreibt oder anruft, hat es getan. Die App merkt
 * es sich nur, damit niemand zweimal gefragt wird und damit sichtbar
 * bleibt, wer noch aussteht.
 *
 * Der anonyme Weg zeigt erst, was genau uebertragen wuerde — das
 * verlangt ADR-0008 vor jedem Versand — und sagt danach, dass das Relay
 * noch nicht existiert. Ein vorgetaeuschter Versand waere hier der
 * schlimmste denkbare Fehler: jemand haelt einen Befund fuer
 * weitergegeben, der niemanden erreicht hat.
 */
import { useMemo, useState } from "react";
import { ScrollView, View } from "react-native";
import {
  formatDate,
  getAlerts,
  gid,
  today,
  type Contact,
  type SentAlert,
} from "@sexdiary/core";
import { useApp } from "../state/store";
import {
  Card,
  GhostButton,
  PrimaryButton,
  Row,
  Screen,
  SectionTitle,
  Text,
  Title,
} from "../ui";

export function AlertsScreen({
  onClose,
  onEditContact,
}: {
  /** Fehlt, wenn der Schirm als Reiter steht statt als Blatt. */
  onClose?: () => void;
  onEditContact?: (c: Contact) => void;
}) {
  const { data, dispatch, t, palette } = useApp();
  const [showPayload, setShowPayload] = useState<string | null>(null);

  const groups = useMemo(
    () => getAlerts(data.tests, data.intercourse, data.contacts),
    [data.tests, data.intercourse, data.contacts],
  );

  const sentFor = (cid: string, sti: string): SentAlert | undefined =>
    data.alerts.find((a) => a.cid === cid && a.sti === sti);

  const record = (cid: string, sti: string, channel: SentAlert["channel"]) =>
    dispatch({
      type: "saveAlert",
      payload: { id: gid("al"), cid, sti, sentAt: today(), channel },
    });

  const undo = (cid: string, sti: string) => {
    const keep = data.alerts.filter((a) => !(a.cid === cid && a.sti === sti));
    dispatch({ type: "replaceAll", payload: { ...data, alerts: keep } });
  };

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Title>{t("partnerAlertsPage")}</Title>

        {groups.length === 0 && (
          <Card>
            <Text style={{ color: palette.sub }}>{t("noAlerts")}</Text>
          </Card>
        )}

        {groups.map((g) => (
          <View key={`${g.sti}-${g.testDate}`}>
            <SectionTitle>
              {g.sti} · {formatDate(g.testDate, data.prefs.lang)}
            </SectionTitle>

            {g.hasAnon && (
              <Card>
                <Text style={{ color: palette.warn, fontSize: 13, lineHeight: 19 }}>
                  {t("alertAnonPartners", { n: 1 })}
                </Text>
              </Card>
            )}

            {g.contacts.length === 0 && (
              <Card>
                <Text style={{ color: palette.sub }}>{t("noContactsToNotify")}</Text>
              </Card>
            )}

            {g.contacts.map((c) => {
              const sent = sentFor(c.id, g.sti);
              const key = `${c.id}-${g.sti}`;
              return (
                <Card key={c.id}>
                  <Text style={{ color: palette.text, fontWeight: "600" }}>
                    {c.name}
                  </Text>

                  {sent ? (
                    <>
                      <Text
                        style={{
                          color: palette.good,
                          fontSize: 13,
                          marginTop: 4,
                        }}
                      >
                        {t(
                          sent.channel === "personal"
                            ? "alertSentPersonally"
                            : "alertSentRelay",
                          { date: formatDate(sent.sentAt, data.prefs.lang) },
                        )}
                      </Text>
                      <GhostButton
                        label={t("alertUndo")}
                        onPress={() => undo(c.id, g.sti)}
                      />
                    </>
                  ) : (
                    <>
                      <PrimaryButton
                        label={t("notifiedPersonally")}
                        onPress={() => record(c.id, g.sti, "personal")}
                      />
                      <GhostButton
                        label={t("notifyAnonymously")}
                        onPress={() =>
                          setShowPayload(showPayload === key ? null : key)
                        }
                      />
                    </>
                  )}

                  {showPayload === key && !sent && (
                    <Card>
                      <Text
                        style={{
                          color: palette.text,
                          fontWeight: "600",
                          fontSize: 13,
                        }}
                      >
                        {t("alertWhatIsSent")}
                      </Text>
                      <Text
                        selectable
                        style={{
                          color: palette.sub,
                          fontSize: 12,
                          marginTop: 6,
                          lineHeight: 18,
                        }}
                      >
                        {JSON.stringify(
                          { to: c.token, sti: g.sti, at: today() },
                          null,
                          2,
                        )}
                      </Text>
                      <Text
                        style={{ color: palette.sub, fontSize: 12, marginTop: 8 }}
                      >
                        {t("alertPayloadNote")}
                      </Text>
                      <Text
                        style={{
                          color: palette.warn,
                          fontSize: 13,
                          marginTop: 10,
                          lineHeight: 19,
                        }}
                      >
                        {t("alertNoRelay")}
                      </Text>
                    </Card>
                  )}
                </Card>
              );
            })}
          </View>
        ))}

        {/*
          Kontakte stehen hier, weil man Kontakte benachrichtigt. Sie an
          einen eigenen Ort zu legen hiesse, im Ernstfall zwischen zwei
          Bildschirmen zu wechseln.
        */}
        <SectionTitle>{t("contactsHeading")}</SectionTitle>
        {data.contacts.length === 0 ? (
          <Card>
            <Text style={{ color: palette.sub }}>{t("noContacts")}</Text>
          </Card>
        ) : (
          data.contacts.map((c) => (
            <Row
              key={c.id}
              label={c.name}
              sub={
                Object.entries(c.cx)
                  .map(([pf, h]) => `${pf}: ${h}`)
                  .join(" · ") || t("shareTokenOnly")
              }
              onPress={onEditContact ? () => onEditContact(c) : undefined}
            />
          ))
        )}

        {onClose && <GhostButton label={t("back")} onPress={onClose} />}
        <View style={{ height: 96 }} />
      </ScrollView>
    </Screen>
  );
}
