import { useEffect, useRef, useState } from "react";
import { useApp } from "../../state/store";
import { startCameraScan, type ScanResult } from "../../lib/qr-scan";

interface Props {
  onData: (data: string) => void;
  onClose: () => void;
  active: boolean;
}

export function QRScanner({ onData, onClose, active }: Props) {
  const { palette, t } = useApp();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!active) return;
    setError(null);
    if (!videoRef.current || !canvasRef.current) return;
    const ctrl = startCameraScan(videoRef.current, canvasRef.current, (r: ScanResult) => {
      if (r.ok) onData(r.data);
      else if (r.reason === "denied") setError(t("cameraDenied"));
      else if (r.reason === "unavailable") setError(t("cameraUnavailable"));
    });
    return () => ctrl.stop();
  }, [active, onData, t]);

  if (!active) return null;
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 70,
        background: "#000",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <video
        ref={videoRef}
        style={{
          flex: 1,
          objectFit: "cover",
          width: "100%",
          height: "100%",
          background: "#000",
        }}
        muted
        playsInline
      />
      <canvas ref={canvasRef} style={{ display: "none" }} />
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: 240,
            height: 240,
            border: `2px solid ${palette.teal}`,
            borderRadius: 18,
            boxShadow: "0 0 0 9999px rgba(0,0,0,.45)",
          }}
        />
      </div>
      <div
        style={{
          position: "absolute",
          top: "max(20px, env(safe-area-inset-top, 20px))",
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          padding: "0 20px",
        }}
      >
        <span
          style={{
            background: "rgba(0,0,0,.5)",
            color: "#fff",
            padding: "8px 14px",
            borderRadius: 20,
            fontSize: 13,
            backdropFilter: "blur(4px)",
          }}
        >
          {error ?? t("scanning")}
        </span>
      </div>
      <div
        style={{
          position: "absolute",
          bottom: "max(24px, env(safe-area-inset-bottom, 24px))",
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <button
          onClick={onClose}
          style={{
            padding: "13px 28px",
            borderRadius: 14,
            background: palette.card,
            border: "none",
            fontSize: 14,
            fontWeight: 600,
            color: palette.text,
            cursor: "pointer",
            minHeight: 44,
          }}
        >
          {t("closeScanner")}
        </button>
      </div>
    </div>
  );
}
