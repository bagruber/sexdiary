import { useState } from "react";
import { FONT } from "../theme/tokens";
import { Pill, Input, Button, FieldLabel } from "../components/ui";
import { useApp } from "../state/store";
import type { Lang, PartnerAnatomy } from "../types/domain";

interface Props {
  onDone: () => void;
}

export function OnboardingView({ onDone }: Props) {
  const { data, dispatch, palette, t } = useApp();
  const [step, setStep] = useState(0);
  const [age, setAge] = useState(data.profile.age);
  const [pa, setPa] = useState<PartnerAnatomy>(data.profile.pa);
  const lang = data.prefs.lang;
  const setLang = (l: Lang) => dispatch({ type: "updatePrefs", patch: { lang: l } });

  const finish = () => {
    dispatch({ type: "updateProfile", patch: { age, pa } });
    dispatch({ type: "setOnboarded", value: true });
    onDone();
  };

  const skip = () => {
    dispatch({ type: "setOnboarded", value: true });
    onDone();
  };

  return (
    <div
      style={{
        flex: 1,
        overflowY: "auto",
        padding: "48px 24px 32px",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div style={{ flex: 1 }}>
        <h1
          style={{
            fontFamily: FONT,
            fontSize: 30,
            fontWeight: 700,
            color: palette.text,
            margin: "0 0 12px",
          }}
        >
          {t("welcomeTitle")}
        </h1>
        <p
          style={{
            fontFamily: FONT,
            fontSize: 14,
            color: palette.muted,
            lineHeight: 1.6,
            margin: "0 0 32px",
          }}
        >
          {t("welcomeBody")}
        </p>

        {step === 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <FieldLabel>{t("onboardLang")}</FieldLabel>
            <div style={{ display: "flex", gap: 8 }}>
              <Pill active={lang === "en"} onClick={() => setLang("en")}>
                English
              </Pill>
              <Pill active={lang === "de"} onClick={() => setLang("de")}>
                Deutsch
              </Pill>
            </div>
          </div>
        )}

        {step === 1 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <FieldLabel>{t("onboardAge")}</FieldLabel>
            <Input value={age} onChange={setAge} placeholder="28" type="number" />
          </div>
        )}

        {step === 2 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <FieldLabel>{t("onboardAnatomy")}</FieldLabel>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <Pill active={pa === "both"} onClick={() => setPa("both")}>
                {t("both")}
              </Pill>
              <Pill active={pa === "penis"} onClick={() => setPa("penis")}>
                {t("penis")}
              </Pill>
              <Pill active={pa === "vagina"} onClick={() => setPa("vagina")}>
                {t("vagina")}
              </Pill>
            </div>
          </div>
        )}
      </div>

      <div style={{ display: "flex", gap: 10, marginTop: 32 }}>
        <Button onClick={skip} outline style={{ flex: 1 }}>
          {t("onboardSkip")}
        </Button>
        {step < 2 ? (
          <Button onClick={() => setStep((s) => s + 1)} style={{ flex: 2 }} full>
            {t("onboardContinue")}
          </Button>
        ) : (
          <Button onClick={finish} style={{ flex: 2 }} full>
            {t("onboardStart")}
          </Button>
        )}
      </div>

      <div
        style={{
          display: "flex",
          gap: 6,
          justifyContent: "center",
          marginTop: 20,
        }}
      >
        {[0, 1, 2].map((s) => (
          <div
            key={s}
            style={{
              width: s === step ? 20 : 6,
              height: 6,
              borderRadius: 3,
              background: s === step ? palette.teal : palette.border,
              transition: "width .2s",
            }}
          />
        ))}
      </div>
    </div>
  );
}
