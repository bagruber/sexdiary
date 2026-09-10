/**
 * Token teilen und einlesen (ADR-0008).
 *
 * Das ist der Vorgang, der im Moment passiert — laut Konzeptvorstellung
 * in Kontexten, in denen ein schneller, namenloser Austausch der Sinn
 * der Sache ist. Er muss deshalb ohne Nachdenken erreichbar sein und
 * ohne Eingabe funktionieren.
 *
 * Gelesen wird mit derselben Funktion wie im Web: `parseImportPayload`
 * liegt im Kern und entscheidet, ob ein Code ein Kontakt, ein
 * Testergebnis oder nichts davon ist. Die Kamera liefert nur Text.
 */
import { useState } from "react";
import { ScrollView, TextInput, View } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { parseImportPayload } from "@sexdiary/core";
import { useApp } from "../state/store";
import { Card, Chip, GhostButton, PrimaryButton, SectionTitle, Text, Title} from "../ui";
import { QrCode } from "./QrCode";
import { PositivePrompt } from "./AddSheets";
import { karteLesen, karteSchreiben, nfcAbbrechen, nfcVerfuegbar } from "../lib/nfc";

type Tab = "share" | "import";

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

  const take = (raw: string) => {
    const r = parseImportPayload(raw);
    if (r.kind === "test") {
      dispatch({ type: "saveTest", payload: r.record });
      setStatus({ ok: true, msg: t("importedTest") });
      // Ein eingelesener Befund ist derselbe Befund wie ein getippter.
      // Ohne das haette ausgerechnet der Weg, den die App bewirbt --
      // Ergebnis per QR aus dem Testangebot -- keinen Anschluss an die
      // Benachrichtigung gehabt.
      const pos = Object.entries(r.record.results ?? {})
        .filter(([, v]) => v === "positive")
        .map(([sti]) => sti);
      if (pos.length) setPositiv(pos);
    } else if (r.kind === "contact") {
      dispatch({ type: "saveContact", payload: r.record });
      setStatus({ ok: true, msg: t("importedContact") });
    } else {
      setStatus({ ok: false, msg: t("importInvalid") });
    }
    setScanning(false);
    setPasting(false);
    setBuf("");
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

      <GhostButton label={t("back")} onPress={onClose} />
      <View style={{ height: 32 }} />
    </ScrollView>
  );
}
