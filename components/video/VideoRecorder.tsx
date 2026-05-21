"use client";

import { useEffect, useRef, useState } from "react";

interface Props {
  maxSeconds: number;
  onRecorded: (blob: Blob, durationSec: number) => void;
}

export function VideoRecorder({ maxSeconds, onRecorded }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const [phase, setPhase] = useState<"idle" | "recording" | "review">("idle");
  const [elapsed, setElapsed] = useState(0);
  const [blob, setBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const ensureCamera = async () => {
    if (streamRef.current) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720, facingMode: "user" },
        audio: true,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.muted = true;
      }
    } catch (err: any) {
      setError(err?.message ?? "Camera access denied");
    }
  };

  const start = async () => {
    await ensureCamera();
    if (!streamRef.current) return;
    chunksRef.current = [];
    const rec = new MediaRecorder(streamRef.current, {
      mimeType: supportedMimeType(),
    });
    rec.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };
    rec.onstop = () => {
      const b = new Blob(chunksRef.current, { type: rec.mimeType });
      setBlob(b);
      setPhase("review");
      if (videoRef.current) {
        videoRef.current.srcObject = null;
        videoRef.current.src = URL.createObjectURL(b);
        videoRef.current.muted = false;
        videoRef.current.controls = true;
      }
    };
    rec.start(1000);
    recorderRef.current = rec;
    setPhase("recording");
    setElapsed(0);
    const tick = setInterval(() => {
      setElapsed((e) => {
        if (e + 1 >= maxSeconds) {
          clearInterval(tick);
          rec.state === "recording" && rec.stop();
          return maxSeconds;
        }
        return e + 1;
      });
    }, 1000);
  };

  const stop = () => {
    recorderRef.current?.state === "recording" && recorderRef.current?.stop();
  };

  const submit = () => {
    if (blob) onRecorded(blob, elapsed);
  };

  const redo = async () => {
    setBlob(null);
    setElapsed(0);
    if (!streamRef.current) {
      await ensureCamera();
    }
    if (videoRef.current) {
      videoRef.current.controls = false;
      videoRef.current.muted = true;
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.removeAttribute("src");
    }
    setPhase("idle");
  };

  return (
    <div className="rounded-card overflow-hidden bg-ink text-surface">
      <div className="relative aspect-video bg-black">
        <video ref={videoRef} playsInline autoPlay muted className="h-full w-full object-cover" />
        {phase === "recording" && (
          <div className="absolute top-3 left-3 flex items-center gap-2 rounded-pill bg-accent px-3 py-1 text-ink text-xs font-bold uppercase tracking-widest">
            <span className="h-2 w-2 rounded-full bg-ink animate-pulse" />
            REC · {formatClock(elapsed)} / {formatClock(maxSeconds)}
          </div>
        )}
      </div>
      <div className="p-4 flex items-center gap-3">
        {phase === "idle" && (
          <button
            type="button"
            onClick={start}
            className="rounded-pill bg-accent text-ink px-5 py-2 font-semibold"
          >
            Start recording
          </button>
        )}
        {phase === "recording" && (
          <button
            type="button"
            onClick={stop}
            className="rounded-pill bg-surface text-ink px-5 py-2 font-semibold"
          >
            Stop
          </button>
        )}
        {phase === "review" && (
          <>
            <button
              type="button"
              onClick={redo}
              className="rounded-pill border border-surface/30 px-5 py-2 font-semibold"
            >
              Re-record
            </button>
            <button
              type="button"
              onClick={submit}
              className="rounded-pill bg-accent text-ink px-5 py-2 font-semibold"
            >
              Use this take →
            </button>
          </>
        )}
        {error && <p className="ml-auto text-xs text-accent">{error}</p>}
      </div>
    </div>
  );
}

function formatClock(s: number): string {
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m.toString().padStart(2, "0")}:${r.toString().padStart(2, "0")}`;
}

function supportedMimeType(): string {
  const candidates = [
    "video/webm;codecs=vp9,opus",
    "video/webm;codecs=vp8,opus",
    "video/webm",
    "video/mp4",
  ];
  for (const c of candidates) {
    if (MediaRecorder.isTypeSupported?.(c)) return c;
  }
  return "video/webm";
}
