/**
 * Create or restore an encrypted backup file (ADR-0009, file leg).
 *
 * Both directions are irreversible in a way worth slowing down for: a
 * forgotten passphrase cannot be recovered, and a restore overwrites
 * everything on the device. Each says so before the button, not after.
 */
import { useState } from "react";
import { ScrollView, Text, TextInput, View } from "react-native";
import { File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";
import { today, type AppData } from "@sexdiary/core";
import { useApp } from "../state/store";
import { createBackup, restoreBackup } from "../lib/backup";
import { Card, GhostButton, PrimaryButton, Title } from "../ui";

const MIN_LENGTH = 8;

export function BackupSheet({
  mode,
  onClose,
}: {
  mode: "export" | "import";
  onClose: () => void;
}) {
  const { data, dispatch, t, palette } = useApp();
  const [pass, setPass] = useState("");
  const [repeat, setRepeat] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  const field = {
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 12,
    padding: 12,
    color: palette.text,
    marginBottom: 12,
  };

  const tooShort = pass.length > 0 && pass.length < MIN_LENGTH;
  const mismatch = mode === "export" && repeat.length > 0 && pass !== repeat;
  const ready =
    pass.length >= MIN_LENGTH && (mode === "import" || pass === repeat);

  const run = async () => {
    setBusy(true);
    setError(null);
    try {
      if (mode === "export") {
        const file = new File(Paths.cache, `sexdiary-${today()}.backup.json`);
        if (file.exists) file.delete();
        file.create();
        file.write(createBackup(data, pass));
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(file.uri, { mimeType: "application/json" });
        }
        setDone(t("backupDone"));
      } else {
        const picked = await File.pickFileAsync();
        const file = Array.isArray(picked) ? picked[0] : picked;
        if (!file) return;
        const restored: AppData = restoreBackup(file.text(), pass, data.prefs.lang);
        dispatch({ type: "replaceAll", payload: restored });
        setDone(t("backupRestored"));
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg === "wrongPassphraseOrDamaged" ? t("backupWrongPassphrase") : msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScrollView keyboardShouldPersistTaps="handled">
      <Title>{mode === "export" ? t("backupExport") : t("backupImport")}</Title>

      <Card>
        <Text style={{ color: palette.warn, fontSize: 13, lineHeight: 19 }}>
          {mode === "export" ? t("backupPassphraseWarn") : t("backupReplaceWarn")}
        </Text>
      </Card>

      <Text style={{ color: palette.sub, fontSize: 13, marginTop: 16, marginBottom: 6 }}>
        {t("backupPassphrase")}
      </Text>
      <TextInput
        value={pass}
        onChangeText={setPass}
        secureTextEntry
        autoCapitalize="none"
        autoCorrect={false}
        accessibilityLabel={t("backupPassphrase")}
        style={field}
      />
      {tooShort && (
        <Text style={{ color: palette.warn, fontSize: 12, marginBottom: 8 }}>
          {t("backupTooShort")}
        </Text>
      )}

      {mode === "export" && (
        <>
          <Text style={{ color: palette.sub, fontSize: 13, marginBottom: 6 }}>
            {t("backupPassphraseRepeat")}
          </Text>
          <TextInput
            value={repeat}
            onChangeText={setRepeat}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            accessibilityLabel={t("backupPassphraseRepeat")}
            style={field}
          />
          {mismatch && (
            <Text style={{ color: palette.warn, fontSize: 12, marginBottom: 8 }}>
              {t("backupMismatch")}
            </Text>
          )}
        </>
      )}

      {error && (
        <Card>
          <Text style={{ color: palette.bad, fontSize: 13, lineHeight: 19 }}>{error}</Text>
        </Card>
      )}
      {done && (
        <Card>
          <Text style={{ color: palette.good, fontSize: 13 }}>{done}</Text>
        </Card>
      )}

      <PrimaryButton
        label={mode === "export" ? t("backupExport") : t("backupImport")}
        onPress={() => void run()}
        disabled={!ready || busy}
      />
      <GhostButton label={t("back")} onPress={onClose} />
      <View style={{ height: 32 }} />
    </ScrollView>
  );
}
