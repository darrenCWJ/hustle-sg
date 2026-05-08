"use client";

import { useState, useTransition } from "react";
import { isValidNric } from "@/lib/singpass/nric";
import { mockSingpassSignIn } from "@/app/(auth)/singpass/actions";
import { MOCK_MYINFO } from "@/lib/singpass/mock-profiles";

interface Props {
  next?: string;
}

export function NRICForm({ next = "/feed" }: Props) {
  const [nric, setNric] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const isValid = isValidNric(nric);
  const needsName = isValid && !MOCK_MYINFO[nric];

  const onContinue = () => {
    if (!isValid) {
      setError("Enter a valid NRIC (e.g. S1234567D).");
      return;
    }
    if (needsName && !name.trim()) {
      setError("Please enter your name.");
      return;
    }
    setError(null);

    const fd = new FormData();
    fd.set("nric", nric);
    fd.set("next", next);
    if (name.trim()) fd.set("display_name", name.trim());

    startTransition(async () => {
      const res = await mockSingpassSignIn(fd);
      if (res && !res.ok) {
        setError(res.error);
      }
    });
  };

  return (
    <div className="w-full max-w-md">
      <div className="flex items-center gap-3 mb-8">
        <div className="h-10 w-10 rounded-full bg-trust grid place-items-center text-surface font-bold">
          S
        </div>
        <div>
          <p className="text-xs uppercase tracking-wider text-ink-soft">Mock Singpass</p>
          <p className="font-semibold">Secure log-in · demo mode</p>
        </div>
      </div>

      <h2 className="font-display text-display-md mb-2">Verify your identity</h2>
      <p className="text-ink-soft mb-8">
        This is a Singpass-style demo. Your NRIC is hashed, never stored as plaintext.
      </p>

      <label className="block">
        <span className="text-sm font-medium">NRIC / FIN</span>
        <input
          type="text"
          value={nric}
          onChange={(e) => {
            setNric(e.target.value.toUpperCase());
            setError(null);
          }}
          placeholder="S1234567D"
          autoComplete="off"
          maxLength={9}
          className="mt-2 w-full rounded-xl border border-line bg-surface-raised px-4 py-3 font-mono tracking-wider focus:border-trust focus:outline-none focus:ring-4 focus:ring-trust-soft transition"
        />
      </label>

      {needsName && (
        <label className="block mt-5">
          <span className="text-sm font-medium">Full name</span>
          <input
            type="text"
            value={name}
            onChange={(e) => { setName(e.target.value); setError(null); }}
            placeholder="e.g. John Tan"
            autoComplete="name"
            className="mt-2 w-full rounded-xl border border-line bg-surface-raised px-4 py-3 focus:border-trust focus:outline-none focus:ring-4 focus:ring-trust-soft transition"
          />
        </label>
      )}

      {error && <p className="text-sm text-accent mt-3">{error}</p>}

      <div className="mt-3 text-xs text-ink-soft">
        Try demo identities:{" "}
        <button
          type="button"
          className="underline"
          onClick={() => setNric("S1234567D")}
        >
          S1234567D
        </button>
        {" · "}
        <button
          type="button"
          className="underline"
          onClick={() => setNric("S2345678H")}
        >
          S2345678H
        </button>
        {" · "}
        <button
          type="button"
          className="underline"
          onClick={() => setNric("T0123456G")}
        >
          T0123456G
        </button>
      </div>

      <button
        onClick={onContinue}
        disabled={!isValid || isPending}
        className="mt-8 w-full rounded-xl bg-ink text-surface py-3 font-semibold hover:bg-accent-ink disabled:opacity-40 transition"
      >
        {isPending ? "Verifying…" : "Log in"}
      </button>

      <p className="text-xs text-ink-soft mt-6 leading-relaxed">
        Mock Singpass uses a public NRIC checksum for validity and stores only a SHA-256 hash.
        No real government identity is contacted. For demonstration only.
      </p>
    </div>
  );
}
