import { useEffect, useState } from "react";
import { encodeQrSvg } from "../../lib/qr-encode";
import { useApp } from "../../state/store";

interface Props {
  data: string;
  size?: number;
}

export function QRCode({ data, size = 220 }: Props) {
  const { palette } = useApp();
  const [svg, setSvg] = useState<string>("");

  useEffect(() => {
    let cancelled = false;
    encodeQrSvg(data, { dark: palette.text, light: palette.card, margin: 1 })
      .then((s) => {
        if (!cancelled) setSvg(s);
      })
      .catch(() => {
        if (!cancelled) setSvg("");
      });
    return () => {
      cancelled = true;
    };
  }, [data, palette.text, palette.card]);

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: 14,
        overflow: "hidden",
        background: palette.card,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      dangerouslySetInnerHTML={{
        __html: svg.replace(/<svg /, `<svg width="${size}" height="${size}" `),
      }}
    />
  );
}
