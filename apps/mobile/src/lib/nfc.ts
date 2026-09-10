/**
 * Token per NFC-Karte tauschen.
 *
 * **Nicht** von Telefon zu Telefon: Android Beam ist seit Android 10
 * abgekuendigt und inzwischen entfernt, ein direkter Austausch zwischen
 * zwei Geraeten geht damit nicht mehr. Was geht, ist eine guenstige
 * NDEF-Karte — genau das, was die Konzeptvorstellung unter „Smartwatch /
 * NFC-Karte“ als Fernziel nennt.
 *
 * Der Reiz liegt in der Situation: eine Karte hinzuhalten ist diskreter
 * als ein leuchtender Bildschirm, und sie verraet beim Weiterreichen
 * nichts ausser dem Token.
 *
 * Gelesen wird derselbe JSON-Text, den auch ein QR traegt. Die Karte ist
 * ein anderer Transportweg, kein anderes Format — `parseImportPayload`
 * im Kern entscheidet in beiden Faellen.
 */
import NfcManager, { Ndef, NfcTech } from "react-native-nfc-manager";

let gestartet = false;

/** Ob das Geraet NFC hat und es eingeschaltet ist. */
export async function nfcVerfuegbar(): Promise<boolean> {
  try {
    if (!(await NfcManager.isSupported())) return false;
    if (!gestartet) {
      await NfcManager.start();
      gestartet = true;
    }
    return await NfcManager.isEnabled();
  } catch {
    return false;
  }
}

/**
 * Auf eine Karte warten und ihren Text zurueckgeben.
 *
 * Der Aufrufer muss abbrechen koennen: die Anfrage bleibt sonst offen,
 * bis jemand eine Karte anlegt, und blockiert danach jede weitere.
 */
export async function karteLesen(): Promise<string | null> {
  await NfcManager.requestTechnology(NfcTech.Ndef);
  try {
    const tag = await NfcManager.getTag();
    const nachricht = tag?.ndefMessage;
    if (!nachricht?.length) return null;
    const text = Ndef.text.decodePayload(
      Uint8Array.from(nachricht[0].payload),
    );
    return text || null;
  } finally {
    await NfcManager.cancelTechnologyRequest().catch(() => undefined);
  }
}

/** Den eigenen Token auf eine beschreibbare Karte legen. */
export async function karteSchreiben(nutzlast: string): Promise<void> {
  await NfcManager.requestTechnology(NfcTech.Ndef);
  try {
    const bytes = Ndef.encodeMessage([Ndef.textRecord(nutzlast)]);
    if (!bytes) throw new Error("nfcEncodeFailed");
    await NfcManager.ndefHandler.writeNdefMessage(bytes);
  } finally {
    await NfcManager.cancelTechnologyRequest().catch(() => undefined);
  }
}

/** Eine offene Anfrage beenden, etwa wenn der Bildschirm geschlossen wird. */
export async function nfcAbbrechen(): Promise<void> {
  await NfcManager.cancelTechnologyRequest().catch(() => undefined);
}
