"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface Props {
  bucket: "portfolio-media" | "interview-responses" | "certifications";
  onUploaded: (payload: { path: string; publicUrl: string | null }) => void;
  accept?: string;
  label?: string;
  maxBytes?: number;
}

export function VideoUploader({
  bucket,
  onUploaded,
  accept = "video/*",
  label = "Upload video",
  maxBytes = 100 * 1024 * 1024,
}: Props) {
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onFile = async (file: File) => {
    if (file.size > maxBytes) {
      setError(`File too large. Limit: ${Math.round(maxBytes / 1024 / 1024)}MB`);
      return;
    }
    setError(null);
    setProgress(1);

    const signRes = await fetch("/api/storage/sign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        bucket,
        filename: sanitize(file.name),
        contentType: file.type,
      }),
    });
    const signed = await signRes.json();
    if (!signRes.ok) {
      setError(signed.error ?? "Upload failed");
      setProgress(null);
      return;
    }

    const supabase = createClient();
    const up = await supabase.storage
      .from(bucket)
      .uploadToSignedUrl(signed.path, signed.token, file, {
        contentType: file.type,
      });

    if (up.error) {
      setError(up.error.message);
      setProgress(null);
      return;
    }
    setProgress(100);
    onUploaded({ path: signed.path, publicUrl: signed.publicUrl });
    setTimeout(() => setProgress(null), 1200);
  };

  return (
    <label className="block cursor-pointer">
      <div className="rounded-card border-2 border-dashed border-line hover:border-accent transition p-8 text-center">
        <p className="font-semibold">{label}</p>
        <p className="text-xs text-ink-soft mt-2">
          Click to choose a file. Max {Math.round(maxBytes / 1024 / 1024)}MB.
        </p>
        {progress != null && (
          <div className="mt-4 h-1 w-full rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-accent transition-[width] duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
        {error && <p className="text-xs text-accent mt-3">{error}</p>}
      </div>
      <input
        type="file"
        accept={accept}
        className="sr-only"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onFile(f);
        }}
      />
    </label>
  );
}

function sanitize(n: string): string {
  return n.replace(/[^\w.\-]+/g, "_").slice(0, 120) || "file";
}
