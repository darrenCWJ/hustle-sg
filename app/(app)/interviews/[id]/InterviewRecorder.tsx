"use client";

import { useState, useTransition } from "react";
import { VideoRecorder } from "@/components/video/VideoRecorder";
import { createClient } from "@/lib/supabase/client";
import { recordInterviewResponse } from "./actions";

interface Props {
  applicationId: string;
  questions: Array<{ id: string; prompt: string; max_duration_sec: number }>;
  answered: Record<string, { video_url: string; duration_sec: number | null }>;
}

export function InterviewRecorder({ applicationId, questions, answered }: Props) {
  const [current, setCurrent] = useState(() => firstUnansweredIndex(questions, answered));
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const q = questions[current];

  if (!q) {
    return (
      <div className="rounded-card bg-trust-soft text-trust p-6">
        <p className="font-semibold">All responses submitted ✓</p>
        <p className="text-sm mt-1">
          The employer will review when convenient. Thanks for recording.
        </p>
      </div>
    );
  }

  const onRecorded = async (blob: Blob, durationSec: number) => {
    setError(null);
    // Request signed upload URL
    const signRes = await fetch("/api/storage/sign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        bucket: "interview-responses",
        filename: `q${current}-${Date.now()}.webm`,
        contentType: blob.type,
      }),
    });
    const signed = await signRes.json();
    if (!signRes.ok) {
      setError(signed.error ?? "Upload failed");
      return;
    }

    const supabase = createClient();
    const up = await supabase.storage
      .from("interview-responses")
      .uploadToSignedUrl(signed.path, signed.token, blob, {
        contentType: blob.type,
      });
    if (up.error) {
      setError(up.error.message);
      return;
    }

    startTransition(async () => {
      const res = await recordInterviewResponse({
        applicationId,
        questionId: q.id,
        videoPath: signed.path,
        durationSec,
      });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setCurrent((c) => c + 1);
    });
  };

  return (
    <div>
      <div className="mb-6">
        <p className="text-xs uppercase tracking-widest text-accent-ink">
          Question {current + 1} of {questions.length}
        </p>
        <h2 className="font-display text-2xl mt-2">{q.prompt}</h2>
        <p className="text-sm text-ink-soft mt-1">
          Up to {q.max_duration_sec} seconds. Review before submitting.
        </p>
      </div>

      <VideoRecorder maxSeconds={q.max_duration_sec} onRecorded={onRecorded} />

      {error && <p className="text-sm text-accent mt-3">{error}</p>}
      {isPending && <p className="text-sm text-trust mt-3">Uploading…</p>}

      <div className="mt-6 flex justify-between text-sm">
        <button
          type="button"
          onClick={() => setCurrent((c) => Math.max(0, c - 1))}
          disabled={current === 0}
          className="text-ink-soft hover:text-ink disabled:opacity-40"
        >
          ← Previous
        </button>
        <button
          type="button"
          onClick={() => setCurrent((c) => Math.min(questions.length - 1, c + 1))}
          disabled={current === questions.length - 1}
          className="text-ink-soft hover:text-ink disabled:opacity-40"
        >
          Skip →
        </button>
      </div>
    </div>
  );
}

function firstUnansweredIndex(
  questions: Array<{ id: string }>,
  answered: Record<string, unknown>,
): number {
  for (let i = 0; i < questions.length; i++) {
    if (!answered[questions[i].id]) return i;
  }
  return questions.length;
}
