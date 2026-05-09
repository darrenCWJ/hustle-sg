"use client";

import { useState, useTransition } from "react";
import { Button, SkillChip } from "@/components/ui/interactive";
import { Eyebrow, VerifiedBadge } from "@/components/ui/primitives";
import { parseCertAction, type ParseResult } from "./actions";

const SAMPLE = `SkillsFuture Singapore
Certificate of Completion

This certifies that:
TAN MEI LING

has successfully completed the programme:

WSQ Diploma in Design Thinking and Innovation

Skills acquired:
- Service Design
- User Research Methods
- Prototyping and Iteration
- Problem Framing
- Stakeholder Engagement

Issued: 15 March 2024
Training Provider: NTUC LearningHub`;

export function CertParserDemo() {
  const [text, setText] = useState(SAMPLE);
  const [result, setResult] = useState<ParseResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleParse() {
    setError(null);
    startTransition(async () => {
      try {
        const res = await parseCertAction(text);
        setResult(res);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Parse failed");
        setResult(null);
      }
    });
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, alignItems: "start" }}>
      {/* Input column */}
      <div>
        <label
          htmlFor="cert-input"
          style={{
            fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase",
            color: "var(--color-ink-soft)", display: "block", marginBottom: 8,
          }}
        >
          Paste cert text (or use the sample)
        </label>
        <textarea
          id="cert-input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={13}
          style={{
            width: "100%",
            borderRadius: 14,
            border: "1px solid var(--color-line)",
            background: "var(--color-surface-raised)",
            padding: "14px 16px",
            fontSize: 12,
            fontFamily: "var(--font-mono)",
            lineHeight: 1.75,
            resize: "vertical",
            color: "var(--color-ink)",
            boxSizing: "border-box",
            outline: "none",
          }}
          onFocus={(e) => { e.currentTarget.style.borderColor = "var(--color-ink)"; }}
          onBlur={(e) => { e.currentTarget.style.borderColor = "var(--color-line)"; }}
        />
        <div style={{ marginTop: 12, display: "flex", gap: 10, alignItems: "center" }}>
          <Button onClick={handleParse} variant="primary">
            {isPending ? "Parsing…" : "Parse with Claude →"}
          </Button>
          <span style={{ fontSize: 11, color: "var(--color-ink-mute)", fontFamily: "var(--font-mono)" }}>
            claude-haiku-4-5
          </span>
        </div>
      </div>

      {/* Output column */}
      <div>
        <p style={{
          fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase",
          color: "var(--color-ink-soft)", marginBottom: 8,
        }}>
          Parsed output
        </p>

        {!result && !error && !isPending && (
          <div style={{
            borderRadius: 14, border: "1px dashed var(--color-line)",
            padding: "48px 24px", textAlign: "center",
            color: "var(--color-ink-mute)", fontSize: 13,
            minHeight: 200, display: "grid", placeItems: "center",
          }}>
            <div>
              <p style={{ fontSize: 28, margin: "0 0 10px" }}>↑</p>
              <p style={{ margin: 0 }}>Click Parse to see Claude extract structured data</p>
            </div>
          </div>
        )}

        {isPending && (
          <div style={{
            borderRadius: 14, border: "1px solid var(--color-line)",
            padding: "48px 24px", textAlign: "center",
            color: "var(--color-ink-soft)", fontSize: 13,
            minHeight: 200, display: "grid", placeItems: "center",
          }}>
            <div>
              <div style={{
                width: 36, height: 36, borderRadius: "50%",
                border: "2px solid var(--color-line)",
                borderTopColor: "var(--color-accent)",
                animation: "spin 0.8s linear infinite",
                margin: "0 auto 12px",
              }} />
              <p style={{ margin: 0 }}>Claude Haiku is reading the cert…</p>
            </div>
          </div>
        )}

        {error && (
          <div style={{
            borderRadius: 14, border: "1px solid var(--color-warn)",
            padding: 20, fontSize: 13, color: "var(--color-ink-soft)",
            background: "oklch(97% 0.03 78)",
          }}>
            <strong style={{ color: "var(--color-warn)" }}>Error:</strong> {error}
          </div>
        )}

        {result && !isPending && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12, animation: "fadeUp 0.4s var(--ease-out-expo) both" }}>
            {/* Cert summary card */}
            <div style={{
              borderRadius: 14, border: "1px solid var(--color-line)",
              padding: 18, background: "var(--color-surface-raised)",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", gap: 12, marginBottom: 10 }}>
                <Eyebrow>{result.kind.toUpperCase()} CERTIFICATE</Eyebrow>
                {result.verified
                  ? <VerifiedBadge tone="jade">{result.issuer}</VerifiedBadge>
                  : <span style={{
                      fontSize: 11, color: "var(--color-ink-mute)",
                      fontFamily: "var(--font-mono)",
                    }}>{result.issuer} · pending review</span>
                }
              </div>
              <p style={{
                fontFamily: "var(--font-display)", fontSize: 20,
                margin: "0 0 6px", letterSpacing: "-0.02em", lineHeight: 1.15,
              }}>
                {result.title}
              </p>
              {result.issued_at && (
                <p style={{ fontSize: 12, color: "var(--color-ink-soft)", margin: 0, fontFamily: "var(--font-mono)" }}>
                  Issued: {result.issued_at}
                </p>
              )}
            </div>

            {/* Extracted skills */}
            <div style={{
              borderRadius: 14, border: "1px solid var(--color-line)",
              padding: 16, background: "var(--color-surface-raised)",
            }}>
              <Eyebrow>Extracted skills → added to embedding</Eyebrow>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
                {result.skills.map((s) => (
                  <SkillChip key={s} tone="accent">{s}</SkillChip>
                ))}
              </div>
            </div>

            {/* Raw JSON */}
            <div style={{
              borderRadius: 14, background: "var(--color-ink)",
              padding: 16, overflow: "auto",
            }}>
              <Eyebrow tone="surface">Raw JSON from Claude Haiku</Eyebrow>
              <pre style={{
                fontFamily: "var(--font-mono)", fontSize: 11,
                color: "oklch(80% 0.03 240)", margin: "10px 0 0",
                whiteSpace: "pre-wrap", lineHeight: 1.65,
              }}>
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
