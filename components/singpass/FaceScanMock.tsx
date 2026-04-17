"use client";

import { useEffect, useRef, useState } from "react";

interface Props {
  onComplete: () => void;
}

export function FaceScanMock({ onComplete }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let stream: MediaStream | null = null;
    let animFrame = 0;
    let startTs = 0;

    const getCam = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480, facingMode: "user" },
          audio: false,
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
      } catch {
        setPermissionDenied(true);
      }
    };

    const tick = (ts: number) => {
      if (!startTs) startTs = ts;
      const elapsed = ts - startTs;
      const pct = Math.min(1, elapsed / 2200);
      setProgress(pct);
      if (pct < 1) {
        animFrame = requestAnimationFrame(tick);
      } else {
        setTimeout(onComplete, 400);
      }
    };

    getCam();
    animFrame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(animFrame);
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, [onComplete]);

  if (permissionDenied) {
    return (
      <div className="w-full max-w-md text-center">
        <h2 className="font-display text-display-md mb-4">Camera blocked</h2>
        <p className="text-ink-soft mb-6">
          Singpass needs camera access for face verification. In demo mode we&apos;ll
          proceed without it.
        </p>
        <button
          onClick={onComplete}
          className="rounded-xl bg-ink text-surface px-6 py-3 font-semibold"
        >
          Continue anyway
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <div className="mb-6 text-center">
        <p className="text-xs uppercase tracking-widest text-trust font-semibold">Face scan</p>
        <h2 className="font-display text-display-md mt-2">Hold still</h2>
        <p className="text-ink-soft mt-2">Aligning face with Singpass biometric template…</p>
      </div>

      <div className="relative aspect-square rounded-3xl overflow-hidden bg-ink">
        <video
          ref={videoRef}
          playsInline
          muted
          className="h-full w-full object-cover"
          style={{ transform: "scaleX(-1)" }}
        />

        {/* Scan overlay */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-6 rounded-full border-2 border-trust/70" />
          <div
            className="absolute inset-x-6 h-1 bg-trust/80 shadow-[0_0_24px_rgba(90,140,230,0.9)]"
            style={{
              top: `${6 + progress * (100 - 12)}%`,
              transition: "top 16ms linear",
            }}
          />
          {/* Corner crosshairs */}
          {["tl", "tr", "bl", "br"].map((pos) => (
            <span
              key={pos}
              data-pos={pos}
              className="absolute h-6 w-6 border-trust"
              style={{
                top: pos.startsWith("t") ? 24 : undefined,
                bottom: pos.startsWith("b") ? 24 : undefined,
                left: pos.endsWith("l") ? 24 : undefined,
                right: pos.endsWith("r") ? 24 : undefined,
                borderTopWidth: pos.startsWith("t") ? 2 : 0,
                borderBottomWidth: pos.startsWith("b") ? 2 : 0,
                borderLeftWidth: pos.endsWith("l") ? 2 : 0,
                borderRightWidth: pos.endsWith("r") ? 2 : 0,
              }}
            />
          ))}
        </div>
      </div>

      <div className="mt-6">
        <div className="h-1 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full bg-trust transition-[width] duration-100"
            style={{ width: `${Math.round(progress * 100)}%` }}
          />
        </div>
        <p className="text-xs text-ink-soft mt-2">
          {progress < 1 ? "Matching…" : "Identity verified ✓"}
        </p>
      </div>
    </div>
  );
}
