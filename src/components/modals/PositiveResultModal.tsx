import { FONT } from "../../theme/tokens";
import { Modal, Button } from "../ui";
import { useApp } from "../../state/store";

interface Props {
  stis: string[];
  onGo: () => void;
  onDismiss: () => void;
}

export function PositiveResultModal({ stis, onGo, onDismiss }: Props) {
  const { palette, t } = useApp();
  return (
    <Modal onClose={onDismiss}>
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: 16,
          background: palette.rose + "12",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 16px",
          fontSize: 28,
        }}
      >
        ⚠
      </div>
      <div
        style={{
          fontFamily: FONT,
          fontSize: 19,
          fontWeight: 700,
          color: palette.text,
          textAlign: "center",
          marginBottom: 8,
        }}
      >
        {t("positiveResultTitle")}
      </div>
      <div
        style={{
          fontFamily: FONT,
          fontSize: 14,
          color: palette.muted,
          textAlign: "center",
          lineHeight: 1.6,
          marginBottom: 24,
        }}
      >
        {t("positiveResultBody", { stis: stis.join(", ") })}
      </div>
      <Button onClick={onGo} color={palette.rose} full style={{ marginBottom: 10 }}>
        {t("goToPartnerAlerts")}
      </Button>
      <button
        onClick={onDismiss}
        style={{
          width: "100%",
          padding: 13,
          background: "none",
          border: "none",
          fontFamily: FONT,
          fontSize: 14,
          color: palette.muted,
          cursor: "pointer",
          minHeight: 44,
        }}
      >
        {t("dismissForNow")}
      </button>
    </Modal>
  );
}
