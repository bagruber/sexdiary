import { useApp } from "../../state/store";

/**
 * Says what this build is, on every screen, without a dismiss control.
 *
 * A banner people can close is a banner people close, and the whole
 * point of ADR-0001 is that a browser cannot keep this product's
 * promises. So it stays. It is deliberately plain: this is a statement
 * of fact, not a decoration, and it should read as part of the chrome
 * rather than as something that happened to the page.
 */
export function DemoBar() {
  const { t, palette } = useApp();

  return (
    <div
      role="note"
      style={{
        padding: "8px 14px",
        background: palette.card,
        borderBottom: `1px solid ${palette.border}`,
        flexShrink: 0,
      }}
    >
      <div style={{ color: palette.text, fontSize: 12, fontWeight: 600 }}>
        {t("demoBar")}
      </div>
      <div style={{ color: palette.sub, fontSize: 12, marginTop: 1 }}>
        {t("demoBarSub")}
      </div>
    </div>
  );
}
