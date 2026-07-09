import QRCode from "qrcode";

export async function encodeQrSvg(
  data: string,
  opts: { dark: string; light: string; margin?: number } = {
    dark: "#1F1D2B",
    light: "#FFFFFF",
  },
): Promise<string> {
  return QRCode.toString(data, {
    type: "svg",
    margin: opts.margin ?? 1,
    color: { dark: opts.dark, light: opts.light },
    errorCorrectionLevel: "M",
  });
}
