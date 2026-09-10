/**
 * Token teilen und einlesen (ADR-0008).
 *
 * Das ist der Vorgang, der im Moment passiert — laut Konzeptvorstellung
 * in Kontexten, in denen ein schneller, namenloser Austausch der Sinn
 * der Sache ist. Er muss deshalb ohne Nachdenken erreichbar sein und
 * ohne Eingabe funktionieren.
 *
 * Gelesen wird mit `readScannedCode` aus dem Kern. Die Weiche liegt
 * dort und nicht hier, weil sie entscheidet, welche *Herkunft* ein
 * Datensatz bekommt — signiert und geprueft, oder selbst eingetragen.
 * Die Kamera liefert nur Text.
 *
 * Bis zum 10.09.2026 ging jeder Code durch `parseImportPayload` und ein
 * Testergebnis wurde ungeprueft uebernommen; das signierte Format hatte
 * gar keinen Leser. Jetzt wird geprueft, und was nicht durchkommt, darf
 * der Nutzer ausdruecklich als selbst eingetragen behalten
 * (ADR-0007, `interfaces/signed-results.md`).
 */
import { useState } from "react";
import { ScrollView, TextInput, View } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import {
  readScannedCode,
  type RejectionReason,
  type TestRecord,
} from "@sexdiary/core";
import { useApp } from "../state/store";
import { Card, Chip, GhostButton, PrimaryButton, SectionTitle, Text, Title} from "../ui";
import { QrCode } from "./QrCode";
import { PositivePrompt } from "./AddSheets";
import { karteLesen, karteSchreiben, nfcAbbrechen, nfcVerfuegbar } from "../lib/nfc";
import { TRUST_LIST, verifySignature } from "../lib/trust";

type Tab = "share" | "import";

/**
 * Ein Grund, ein Satz. Die Zuordnung steht als Tabelle da, damit der
 * Compiler meckert, sobald der Kern einen Ablehnungsgrund dazubekommt —
 * bei einem `switch` mit `default` faellt ein neuer Grund still
 * hindurch und niemand erfaehrt, warum.
 */
const REJECTION_TEXT: Record<RejectionReason, "sigUnknownIssuer" | "sigRevoked" | "sigOutsideValidity" | "sigBadSignature" | "sigMalformed"> = {
  unknown_issuer: "sigUnknownIssuer",
  revoked: "sigRevoked",
  outside_validity: "sigOutsideValidity",
  bad_signature: "sigBadSignature",
  malformed: "sigMalformed",
};

export function ConnectScreen({ onClose }: { onClose: () => void }) {
  const { data, dispatch, t, palette } = useApp();
  const [tab, setTab] = useState<Tab>("share");
  const [scanning, setScanning] = useState(false);
  const [pasting, setPasting] = useState(false);
  const [buf, setBuf] = useState("");
  const [status, setStatus] = useState<{ ok: boolean; msg: string } | null>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [positiv, setPositiv] = useState<string[] | null>(null);
  const [nfcBusy, setNfcBusy] = useState<"read" | "write" | null>(null);
  /**
   * Ein abgelehnter Befund, der noch nicht weggeworfen ist. Solange er
   * hier liegt, steht dem Nutzer der Weg offen, ihn als selbst
   * eingetragen zu behalten — und nur dieser Weg, nicht der stille.
   */
  const [abgelehnt, setAbgelehnt] = useState<{
    reason: RejectionReason;
    draft: TestRecord | null;
  } | null>(null);

  const { shareMode, sharePlatform, shareHandle } = data.prefs;
  const withHandle = shareMode === "handle" && !!sharePlatform && !!shareHandle;
  const payload = JSON.stringify(
    withHandle
      ? {
          v: 1,
          type: "contact",
          token: data.myToken,
          platform: sharePlatform,
          handle: shareHandle,
        }
      : { v: 1, type: "contact", token: data.myToken },
  );

  /** Ein Testergebnis liegt vor — der Positiv-Ablauf haengt daran. */
  const nachTest = (record: TestRecord) => {
    // Ein eingelesener Befund ist derselbe Befund wie ein getippter.
    // Ohne das haette ausgerechnet der Weg, den die App bewirbt --
    // Ergebnis per QR aus dem Testangebot -- keinen Anschluss an die
    // Benachrichtigung gehabt.
    const pos = Object.entries(record.results ?? {})
      .filter(([, v]) => v === "positive")
      .map(([sti]) => sti);
    if (pos.length) setPositiv(pos);
  };

  const schliessen = () => {
    setScanning(false);
    setPasting(false);
    setBuf("");
  };

  const take = (raw: string) => {
    const r = readScannedCode(raw, {
      trust: TRUST_LIST,
      verify: verifySignature,
      now: new Date().toISOString(),
    });

    if (r.kind === "signed") {
      dispatch({ type: "saveTest", payload: r.record });
      setAbgelehnt(null);
      setStatus({ ok: true, msg: t("importedSigned", { name: r.issuer }) });
      nachTest(r.record);
    } else if (r.kind === "test") {
      dispatch({ type: "saveTest", payload: r.record });
      setAbgelehnt(null);
      setStatus({ ok: true, msg: t("importedTest") });
      nachTest(r.record);
    } else if (r.kind === "contact") {
      dispatch({ type: "saveContact", payload: r.record });
      setAbgelehnt(null);
      setStatus({ ok: true, msg: t("importedContact") });
    } else if (r.kind === "rejected") {
      // Nichts wird gespeichert. Der Entwurf wartet auf eine
      // ausdrueckliche Entscheidung.
      setAbgelehnt({ reason: r.reason, draft: r.draft });
      setStatus({ ok: false, msg: t("sigRejected") });
    } else {
      setAbgelehnt(null);
      setStatus({ ok: false, msg: t("importInvalid") });
    }
    schliessen();
  };

  /** Der ausdrueckliche Weg aus `interfaces/signed-results.md`. */
  const trotzdemBehalten = () => {
    if (!abgelehnt?.draft) return;
    dispatch({ type: "saveTest", payload: abgelehnt.draft });
    setStatus({ ok: true, msg: t("importedSelfEntered") });
    nachTest(abgelehnt.draft);
    setAbgelehnt(null);
  };

  /**
   * Lesen und Schreiben teilen sich Vorpruefung, Fehlerbehandlung und
   * Aufraeumen; getrennt waeren es zwei fast gleiche Bloecke, in denen
   * je einer das Abbrechen vergessen kann.
   */
  const nfc = async (was: "read" | "write") => {
    setStatus(null);
    if (!(await nfcVerfuegbar())) {
      setStatus({ ok: false, msg: t("nfcUnavailable") });
      return;
    }
    setNfcBusy(was);
    try {
      if (was === "read") {
        const roh = await karteLesen();
        if (roh) take(roh);
        else setStatus({ ok: false, msg: t("importInvalid") });
      } else {
        await karteSchreiben(payload);
        setStatus({ ok: true, msg: t("nfcWritten") });
      }
    } catch {
      setStatus({ ok: false, msg: t("nfcFailed") });
    } finally {
      setNfcBusy(null);
    }
  };

  const startScan = async () => {
    setStatus(null);
    if (!permission?.granted) {
      const asked = await requestPermission();
      if (!asked.granted) return;
    }
    setScanning(true);
  };

  if (positiv) return <PositivePrompt stis={positiv} onClose={onClose} />;

  return (
    <ScrollView
      contentContainerStyle={{ padding: 16, paddingTop: 48 }}
      keyboardShouldPersistTaps="handled"
    >
      <Title>{t("shareTitle")}</Title>

      <View style={{ flexDirection: "row", marginBottom: 8 }}>
        <Chip label={t("shareTab")} active={tab === "share"} onPress={() => setTab("share")} />
        <Chip label={t("importTab")} active={tab === "import"} onPress={() => setTab("import")} />
      </View>

      {tab === "share" && (
        <>
          <Text style={{ color: palette.sub, marginBottom: 16 }}>{t("shareSub")}</Text>
          <QrCode value={payload} />
          <Card>
            <Text style={{ color: palette.sub, fontSize: 12 }}>
              {withHandle ? `${sharePlatform} · ${shareHandle}` : t("shareTokenOnly")}
            </Text>
            <Text
              selectable
              style={{ color: palette.text, marginTop: 6, fontSize: 13 }}
            >
              {data.myToken}
            </Text>
          </Card>
        </>
      )}

      {tab === "import" && (
        <>
          <Text style={{ color: palette.sub, marginBottom: 16 }}>{t("importSub")}</Text>

          {scanning ? (
            <>
              <View
                style={{
                  height: 300,
                  borderRadius: 12,
                  overflow: "hidden",
                  borderWidth: 1,
                  borderColor: palette.border,
                }}
              >
                <CameraView
                  style={{ flex: 1 }}
                  facing="back"
                  barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
                  onBarcodeScanned={({ data: raw }) => take(raw)}
                />
              </View>
              <GhostButton label={t("cancel")} onPress={() => setScanning(false)} />
            </>
          ) : (
            <PrimaryButton label={t("importScan")} onPress={() => void startScan()} />
          )}

          {permission && !permission.granted && !permission.canAskAgain && (
            <Card>
              <Text style={{ color: palette.warn, fontSize: 13, lineHeight: 19 }}>
                {t("cameraDenied")}
              </Text>
            </Card>
          )}

          <GhostButton label={t("importPaste")} onPress={() => setPasting((v) => !v)} />
          {pasting && (
            <>
              <TextInput
                value={buf}
                onChangeText={setBuf}
                multiline
                placeholder={t("importPasteHint")}
                placeholderTextColor={palette.sub}
                accessibilityLabel={t("importPaste")}
                style={{
                  borderWidth: 1,
                  borderColor: palette.border,
                  borderRadius: 12,
                  padding: 12,
                  color: palette.text,
                  minHeight: 90,
                  marginBottom: 12,
                }}
              />
              <PrimaryButton
                label={t("save")}
                onPress={() => take(buf)}
                disabled={!buf.trim()}
              />
            </>
          )}

          <SectionTitle>{t("shareNFC")}</SectionTitle>
          <Card>
            <Text style={{ color: palette.sub, fontSize: 13, lineHeight: 19 }}>
              {t("nfcNoPhoneToPhone")}
            </Text>
          </Card>
          {nfcBusy ? (
            <>
              <Card>
                <Text style={{ color: palette.text, fontSize: 13 }}>
                  {t("nfcHold")}
                </Text>
              </Card>
              <GhostButton
                label={t("cancel")}
                onPress={() => {
                  void nfcAbbrechen();
                  setNfcBusy(null);
                }}
              />
            </>
          ) : (
            <>
              <GhostButton label={t("nfcCardRead")} onPress={() => void nfc("read")} />
              <GhostButton label={t("nfcCardWrite")} onPress={() => void nfc("write")} />
            </>
          )}
        </>
      )}

      {status && (
        <Card>
          <Text style={{ color: status.ok ? palette.good : palette.bad, fontSize: 13 }}>
            {status.msg}
          </Text>
        </Card>
      )}

      {/*
        Warum abgelehnt wurde, im Klartext. Eine pauschale Absage laesst
        Leute glauben, die App sei kaputt, und sagt der Teststelle
        nichts darueber, was zu beheben waere.
      */}
      {abgelehnt && (
        <Card>
          <Text style={{ color: palette.text, fontSize: 13, lineHeight: 19 }}>
            {t(REJECTION_TEXT[abgelehnt.reason])}
          </Text>
          {abgelehnt.draft && (
            <>
              <Text
                style={{
                  color: palette.sub,
                  fontSize: 12,
                  lineHeight: 18,
                  marginTop: 10,
                }}
              >
                {t("sigKeepAnywayNote")}
              </Text>
              <GhostButton label={t("sigKeepAnyway")} onPress={trotzdemBehalten} />
            </>
          )}
        </Card>
      )}

      <GhostButton label={t("back")} onPress={onClose} />
      <View style={{ height: 32 }} />
    </ScrollView>
  );
}
