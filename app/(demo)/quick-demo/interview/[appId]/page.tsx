"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useDemo } from "../../DemoProvider";
import { GIGS } from "../../data";
import { saveVideoBlob } from "../../lib/videoStore";
import { VideoRecorder } from "@/components/video/VideoRecorder";

export default function DemoInterviewPage() {
  const params = useParams();
  const router = useRouter();
  const appId = params.appId as string;

  const {
    activeAccount,
    applications,
    getInterviewResponses,
    recordInterviewResponse,
    submitInterview,
    saveInterviewVideo,
    getGigsForAccount,
  } = useDemo();

  const [currentIdx, setCurrentIdx] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [rerecordSet, setRerecordSet] = useState<Set<number>>(new Set());

  const app = applications.find((a) => a.id === appId);
  const allGigs = [...GIGS, ...getGigsForAccount()];
  const gig = app ? allGigs.find((g) => g.id === app.gigId) : null;
  const questions = gig?.questions ?? [];
  const answered = getInterviewResponses(appId);

  if (!app || !gig) {
    return (
      <div style={{ padding: 40, textAlign: "center", color: "var(--color-ink-mute)", fontSize: 14 }}>
        Application not found.
      </div>
    );
  }

  if (activeAccount.id !== app.freelancerId) {
    return (
      <div style={{ padding: 40, textAlign: "center", color: "var(--color-ink-mute)", fontSize: 14 }}>
        This interview belongs to a different account.
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div style={{ padding: 40, textAlign: "center", color: "var(--color-ink-mute)", fontSize: 14 }}>
        No interview questions for this gig.
      </div>
    );
  }

  if (submitted || app.status === "interviewing") {
    return (
      <div style={{ maxWidth: 560, margin: "0 auto", padding: "80px 24px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
        <div style={{ fontSize: 48 }}>🎬</div>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: 28, margin: 0, letterSpacing: "-0.025em" }}>
          Interview submitted!
        </h2>
        <p style={{ fontSize: 14, color: "var(--color-ink-soft)", margin: 0, maxWidth: 360 }}>
          Your {questions.length} video answer{questions.length > 1 ? "s" : ""} for <strong>{gig.title}</strong> have been sent to the employer.
        </p>
        <button
          onClick={() => router.push("/quick-demo/gigs")}
          style={{ marginTop: 8, padding: "11px 28px", borderRadius: 999, border: "none", background: "var(--color-ink)", color: "var(--color-surface)", fontSize: 14, fontWeight: 700, cursor: "pointer" }}
        >
          Back to Browse
        </button>
      </div>
    );
  }

  const allAnswered = questions.every((_, i) => answered.includes(i));
  const question = questions[currentIdx];
  const isAnswered = answered.includes(currentIdx) && !rerecordSet.has(currentIdx);

  function handleRecorded(blob: Blob, _durationSec: number) {
    saveVideoBlob(appId, currentIdx, blob);
    saveInterviewVideo(appId, currentIdx, blob); // upload to Supabase for cross-device access
    setRerecordSet((prev) => { const s = new Set(prev); s.delete(currentIdx); return s; });
    recordInterviewResponse(appId, currentIdx);
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(currentIdx + 1);
    }
  }

  function handleSubmit() {
    submitInterview(appId);
    setSubmitted(true);
  }

  return (
    <div style={{ maxWidth: 640, margin: "0 auto", padding: "32px 20px 80px", display: "flex", flexDirection: "column", gap: 0 }}>
      {/* Back */}
      <button
        onClick={() => router.back()}
        style={{ fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--color-ink-mute)", background: "none", border: "none", cursor: "pointer", padding: 0, marginBottom: 28, fontWeight: 600, alignSelf: "flex-start" }}
      >
        ← Back
      </button>

      {/* Header */}
      <p style={{ fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", fontWeight: 600, color: "var(--color-ink-soft)", margin: "0 0 6px" }}>
        Async interview
      </p>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.5rem, 4vw, 2rem)", margin: "0 0 4px", letterSpacing: "-0.025em", lineHeight: 1.1 }}>
        {gig.title}
      </h1>
      <p style={{ fontSize: 13, color: "var(--color-ink-mute)", margin: "0 0 28px" }}>
        Record a short video answer for each question. Max 90 seconds each.
      </p>

      {/* Progress dots */}
      <div style={{ display: "flex", gap: 8, marginBottom: 28 }}>
        {questions.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setCurrentIdx(i)}
            style={{
              width: 32, height: 32, borderRadius: "50%", border: "2px solid",
              borderColor: answered.includes(i) ? "#16a34a" : i === currentIdx ? "var(--color-ink)" : "var(--color-line)",
              background: answered.includes(i) ? "#dcfce7" : i === currentIdx ? "var(--color-ink)" : "transparent",
              color: answered.includes(i) ? "#16a34a" : i === currentIdx ? "var(--color-surface)" : "var(--color-ink-mute)",
              fontSize: 12, fontWeight: 700, cursor: "pointer", display: "grid", placeItems: "center",
            }}
          >
            {answered.includes(i) ? "✓" : i + 1}
          </button>
        ))}
        <span style={{ fontSize: 12, color: "var(--color-ink-mute)", alignSelf: "center", marginLeft: 4 }}>
          {answered.length} / {questions.length} recorded
        </span>
      </div>

      {/* Current question */}
      <div style={{ padding: "16px 18px", borderRadius: 12, background: "var(--color-surface-raised)", border: "1px solid var(--color-line)", marginBottom: 20 }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--color-ink-mute)", margin: "0 0 8px" }}>
          Question {currentIdx + 1} of {questions.length}
        </p>
        <p style={{ fontSize: 16, color: "var(--color-ink)", margin: 0, lineHeight: 1.5 }}>
          {question}
        </p>
      </div>

      {/* Recorder or recorded state */}
      {isAnswered ? (
        <div style={{ padding: 20, borderRadius: 12, background: "#dcfce7", border: "1px solid #bbf7d0", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 20 }}>✓</span>
            <span style={{ fontSize: 14, fontWeight: 600, color: "#166534" }}>Answer recorded</span>
          </div>
          <button
            onClick={() => setRerecordSet((prev) => new Set([...prev, currentIdx]))}
            style={{ fontSize: 12, color: "#166534", background: "transparent", border: "1px solid #86efac", borderRadius: 999, padding: "6px 14px", cursor: "pointer", fontWeight: 600 }}
          >
            Re-record
          </button>
        </div>
      ) : (
        <div style={{ marginBottom: 20 }}>
          <VideoRecorder maxSeconds={90} onRecorded={handleRecorded} />
        </div>
      )}

      {/* Navigation */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: 8 }}>
          {currentIdx > 0 && (
            <button
              onClick={() => setCurrentIdx(currentIdx - 1)}
              style={{ padding: "9px 20px", borderRadius: 999, border: "1px solid var(--color-line)", background: "transparent", fontSize: 13, fontWeight: 600, cursor: "pointer", color: "var(--color-ink-soft)" }}
            >
              ← Prev
            </button>
          )}
          {currentIdx < questions.length - 1 && (
            <button
              onClick={() => setCurrentIdx(currentIdx + 1)}
              style={{ padding: "9px 20px", borderRadius: 999, border: "1px solid var(--color-line)", background: "transparent", fontSize: 13, fontWeight: 600, cursor: "pointer", color: "var(--color-ink-soft)" }}
            >
              Next →
            </button>
          )}
        </div>

        {allAnswered && (
          <button
            onClick={handleSubmit}
            style={{ padding: "11px 28px", borderRadius: 999, border: "none", background: "var(--color-ink)", color: "var(--color-surface)", fontSize: 14, fontWeight: 700, cursor: "pointer" }}
          >
            Submit interview →
          </button>
        )}
      </div>
    </div>
  );
}
