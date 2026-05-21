import jsQR from "jsqr";

export type ScanResult =
  | { ok: true; data: string }
  | { ok: false; reason: "denied" | "unavailable" | "stopped" };

export interface ScanController {
  stop: () => void;
}

export function startCameraScan(
  video: HTMLVideoElement,
  canvas: HTMLCanvasElement,
  onResult: (r: ScanResult) => void,
): ScanController {
  let stopped = false;
  let stream: MediaStream | null = null;
  let raf = 0;

  if (
    typeof navigator === "undefined" ||
    !navigator.mediaDevices?.getUserMedia
  ) {
    onResult({ ok: false, reason: "unavailable" });
    return { stop: () => {} };
  }

  navigator.mediaDevices
    .getUserMedia({ video: { facingMode: "environment" } })
    .then((s) => {
      if (stopped) {
        s.getTracks().forEach((t) => t.stop());
        return;
      }
      stream = s;
      video.srcObject = s;
      video.setAttribute("playsinline", "true");
      video.play().catch(() => {});
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) {
        onResult({ ok: false, reason: "unavailable" });
        return;
      }

      const tick = () => {
        if (stopped) return;
        if (video.readyState === video.HAVE_ENOUGH_DATA) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(img.data, img.width, img.height, {
            inversionAttempts: "dontInvert",
          });
          if (code?.data) {
            onResult({ ok: true, data: code.data });
            return;
          }
        }
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    })
    .catch(() => {
      onResult({ ok: false, reason: "denied" });
    });

  return {
    stop: () => {
      stopped = true;
      if (raf) cancelAnimationFrame(raf);
      stream?.getTracks().forEach((t) => t.stop());
    },
  };
}
