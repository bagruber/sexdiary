import { useState } from "react";
import { Camera, Link2, Lock } from "lucide-react";
import { FONT, shadow } from "../theme/tokens";
import { Pill, Button } from "../components/ui";
import { QRCode } from "../components/widgets/QRCode";
import { QRScanner } from "../components/widgets/QRScanner";
import { useApp } from "../state/store";
import { parseImportPayload } from "../data/schema";

type Tab = "share" | "import";

export function ConnectView() {
  const { data, dispatch, palette, isDark, t } = useApp();
  const [tab, setTab] = useState<Tab>("share");
  const [scannerOpen, setScannerOpen] = useState(false);
  const [pasteBuf, setPasteBuf] = useState("");
  const [pasteOpen, setPasteOpen] = useState(false);
  const [status, setStatus] = useState<{ ok: boolean; msg: string } | null>(null);

  const isHandle =
    data.prefs.shareMode === "handle" && data.prefs.sharePlatform && data.prefs.shareHandle;
  const payload = isHandle
    ? JSON.stringify({
        v: 1,
        type: "contact",
        token: data.myToken,
        platform: data.prefs.sharePlatform,
        handle: data.prefs.shareHandle,
      })
    : JSON.stringify({ v: 1, type: "contact", token: data.myToken });

  const handleImport = (raw: string) => {
    const r = parseImportPayload(raw);
    if (r.kind === "test") {
      dispatch({ type: "saveTest", payload: r.record });
      setStatus({ ok: true, msg: t("importedTest") });
    } else if (r.kind === "contact") {
      dispatch({ type: "saveContact", payload: r.record });
      setStatus({ ok: true, msg: t("importedContact") });
    } else {
      setStatus({ ok: false, msg: t("importInvalid") });
    }
    setScannerOpen(false);
    setPasteOpen(false);
    setPasteBuf("");
    setTimeout(() => setStatus(null), 4000);
  };

  return (
    <div
      style={{
        flex: 1,
        overflowY: "auto",
        padding: "28px 16px 100px",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <h1
        style={{
          fontFamily: FONT,
          fontSize: 26,
          fontWeight: 700,
          color: palette.text,
          margin: "0 0 4px",
        }}
      >
        {t("shareTitle")}
      </h1>
      <p
        style={{
          fontFamily: FONT,
          fontSize: 13,
          color: palette.muted,
          margin: "0 0 22px",
        }}
      >
        {t("shareSub")}
      </p>

      <div style={{ display: "flex", gap: 8, marginBottom: 22 }}>
        <Pill active={tab === "share"} onClick={() => setTab("share")}>
          {t("shareTab")}
        </Pill>
        <Pill active={tab === "import"} onClick={() => setTab("import")}>
          {t("importTab")}
        </Pill>
      </div>

      {status && (
        <div
          style={{
            padding: "12px 16px",
            borderRadius: 12,
            marginBottom: 14,
            background: (status.ok ? palette.green : palette.rose) + "10",
            border: `1px solid ${(status.ok ? palette.green : palette.rose)}40`,
            fontFamily: FONT,
            fontSize: 13,
            color: status.ok ? palette.green : palette.rose,
            fontWeight: 600,
          }}
        >
          {status.msg}
        </div>
      )}

      {tab === "share" && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <div
            style={{
              padding: 20,
              background: palette.card,
              borderRadius: 24,
              border: `1px solid ${palette.border}`,
              boxShadow: shadow(isDark),
              marginBottom: 16,
            }}
          >
            <QRCode data={payload} size={220} />
          </div>
          <Button onClick={() => alert(t("nfcAlert"))} outline style={{ marginBottom: 18 }}>
            {t("shareNFC")}
          </Button>
          <div
            style={{
              width: "100%",
              padding: "14px 18px",
              borderRadius: 14,
              background: isHandle ? palette.teal + "06" : palette.cardEl,
              border: `1px solid ${isHandle ? palette.teal + "30" : palette.border}`,
            }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
              {isHandle ? (
                <Link2 size={16} color={palette.teal} />
              ) : (
                <Lock size={16} color={palette.muted} />
              )}
              <div>
                <div
                  style={{
                    fontFamily: FONT,
                    fontSize: 13,
                    color: palette.text,
                    lineHeight: 1.5,
                  }}
                >
                  {isHandle
                    ? t("shareHandleHint", {
                        platform: data.prefs.sharePlatform,
                        handle: data.prefs.shareHandle,
                      })
                    : t("shareTokenOnly")}
                </div>
                <div
                  style={{
                    fontFamily: "monospace",
                    fontSize: 10,
                    color: palette.muted,
                    marginTop: 6,
                    wordBreak: "break-all",
                  }}
                >
                  Token: {data.myToken}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === "import" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <p style={{ fontFamily: FONT, fontSize: 13, color: palette.muted }}>
            {t("importSub")}
          </p>
          <Button onClick={() => setScannerOpen(true)} full>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
              <Camera size={16} />
              {t("importScan")}
            </span>
          </Button>
          <Button onClick={() => setPasteOpen((o) => !o)} outline full>
            {t("importPaste")}
          </Button>
          {pasteOpen && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <textarea
                value={pasteBuf}
                onChange={(e) => setPasteBuf(e.target.value)}
                placeholder={t("importPasteHint")}
                rows={6}
                style={{
                  width: "100%",
                  padding: 12,
                  borderRadius: 12,
                  border: `1.5px solid ${palette.border}`,
                  background: palette.cardEl,
                  fontFamily: "monospace",
                  fontSize: 12,
                  color: palette.text,
                  outline: "none",
                  resize: "vertical",
                  boxSizing: "border-box",
                }}
              />
              <Button onClick={() => handleImport(pasteBuf)} full disabled={!pasteBuf.trim()}>
                {t("save")}
              </Button>
            </div>
          )}
        </div>
      )}

      <QRScanner
        active={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onData={handleImport}
      />
    </div>
  );
}
