"use client";

import { useState, useTransition } from "react";
import { requestLoginCode, verifyLoginCode } from "./actions";

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "13px 16px",
  borderRadius: 12,
  border: "1px solid var(--color-line)",
  background: "var(--color-surface)",
  color: "var(--color-ink)",
  fontSize: 15,
  boxSizing: "border-box",
};

export function LoginForm({ next }: { next: string }) {
  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const sendCode = () => {
    setError(null);
    startTransition(async () => {
      const res = await requestLoginCode(email);
      if (!res.ok) {
        setError(res.error ?? "Could not send the code.");
        return;
      }
      setStep("code");
    });
  };

  const verify = () => {
    setError(null);
    startTransition(async () => {
      const res = await verifyLoginCode(email, code, next);
      // On success the action redirects; a return value means failure.
      if (res && !res.ok) setError(res.error ?? "That code didn't work.");
    });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {step === "email" ? (
        <>
          <label htmlFor="login-email" style={{ fontSize: 12, fontWeight: 600, color: "var(--color-ink-soft)" }}>
            Email address
          </label>
          <input
            id="login-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                sendCode();
              }
            }}
            placeholder="you@example.com"
            style={inputStyle}
          />
          {error && <p style={{ fontSize: 13, color: "#dc2626", margin: 0 }}>{error}</p>}
          <button
            type="button"
            onClick={sendCode}
            disabled={pending || !email.includes("@")}
            style={{
              padding: 14,
              borderRadius: 999,
              border: "none",
              background: email.includes("@") && !pending ? "var(--color-ink)" : "var(--color-muted)",
              color: email.includes("@") && !pending ? "var(--color-surface)" : "var(--color-ink-mute)",
              fontWeight: 700,
              fontSize: 15,
              cursor: email.includes("@") && !pending ? "pointer" : "default",
            }}
          >
            {pending ? "Sending…" : "Email me a code"}
          </button>
        </>
      ) : (
        <>
          <p style={{ fontSize: 13.5, color: "var(--color-ink-soft)", margin: 0, lineHeight: 1.5 }}>
            We sent a 6-digit code to <strong>{email}</strong>. It expires in about an hour.
          </p>
          <label htmlFor="login-code" style={{ fontSize: 12, fontWeight: 600, color: "var(--color-ink-soft)" }}>
            6-digit code
          </label>
          <input
            id="login-code"
            inputMode="numeric"
            autoComplete="one-time-code"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                verify();
              }
            }}
            placeholder="123456"
            style={{ ...inputStyle, letterSpacing: "0.35em", fontFamily: "var(--font-mono)", textAlign: "center", fontSize: 20 }}
          />
          {error && <p style={{ fontSize: 13, color: "#dc2626", margin: 0 }}>{error}</p>}
          <button
            type="button"
            onClick={verify}
            disabled={pending || code.length !== 6}
            style={{
              padding: 14,
              borderRadius: 999,
              border: "none",
              background: code.length === 6 && !pending ? "var(--color-ink)" : "var(--color-muted)",
              color: code.length === 6 && !pending ? "var(--color-surface)" : "var(--color-ink-mute)",
              fontWeight: 700,
              fontSize: 15,
              cursor: code.length === 6 && !pending ? "pointer" : "default",
            }}
          >
            {pending ? "Checking…" : "Sign in"}
          </button>
          <button
            type="button"
            onClick={() => {
              setStep("email");
              setCode("");
              setError(null);
            }}
            style={{ background: "none", border: "none", fontSize: 12.5, color: "var(--color-ink-soft)", cursor: "pointer", padding: 4 }}
          >
            Use a different email
          </button>
        </>
      )}
    </div>
  );
}
