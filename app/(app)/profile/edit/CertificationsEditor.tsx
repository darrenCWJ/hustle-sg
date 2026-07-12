"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  addCertification,
  deleteCertification,
} from "./actions";
import type { Certification } from "@/lib/supabase/types";
import { VerifiedBadge } from "@/components/profile/VerifiedBadge";

export function CertificationsEditor({ certs }: { certs: Certification[] }) {
  const router = useRouter();
  const [issuer, setIssuer] = useState("");
  const [title, setTitle] = useState("");
  const [kind, setKind] = useState<"wsq" | "university" | "accreditation" | "other">("wsq");
  const [issuedAt, setIssuedAt] = useState("");
  const [rawText, setRawText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [flash, setFlash] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const submit = () => {
    setError(null);
    setFlash(null);
    const fd = new FormData();
    fd.set("issuer", issuer);
    fd.set("title", title);
    fd.set("kind", kind);
    if (issuedAt) fd.set("issued_at", issuedAt);
    if (rawText) fd.set("raw_text", rawText);

    startTransition(async () => {
      const res = await addCertification(fd);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setIssuer("");
      setTitle("");
      setIssuedAt("");
      setRawText("");
      setFlash("Added — pending verification against the issuer.");
      router.refresh();
    });
  };

  return (
    <div id="certifications" className="scroll-mt-24">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-display-md">Credentials</h2>
        <Link
          href="/skillsfuture"
          className="inline-flex items-center gap-1.5 rounded-pill border border-line px-3 py-1.5 text-xs font-semibold text-ink-soft hover:text-ink transition"
        >
          <span>🇸🇬</span> Import from SkillsFuture
        </Link>
      </div>

      <div className="mb-8 rounded-card bg-surface-raised border border-line p-6">
        <div className="grid md:grid-cols-2 gap-3">
          <input
            placeholder="Issuer (e.g. SkillsFuture SG)"
            value={issuer}
            onChange={(e) => setIssuer(e.target.value)}
            className="rounded-xl border border-line px-4 py-3 bg-surface"
          />
          <input
            placeholder="Certificate title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="rounded-xl border border-line px-4 py-3 bg-surface"
          />
          <select
            value={kind}
            onChange={(e) => setKind(e.target.value as any)}
            className="rounded-xl border border-line px-4 py-3 bg-surface"
          >
            <option value="wsq">WSQ</option>
            <option value="university">University</option>
            <option value="accreditation">Accreditation</option>
            <option value="other">Other</option>
          </select>
          <input
            type="date"
            value={issuedAt}
            onChange={(e) => setIssuedAt(e.target.value)}
            className="rounded-xl border border-line px-4 py-3 bg-surface"
          />
        </div>
        <textarea
          placeholder="Paste the certificate text for AI to extract skills (optional)"
          value={rawText}
          onChange={(e) => setRawText(e.target.value)}
          rows={3}
          className="mt-3 w-full rounded-xl border border-line px-4 py-3 bg-surface"
        />

        {error && <p className="text-sm text-accent mt-2">{error}</p>}
        {flash && <p className="text-sm text-trust mt-2">{flash}</p>}

        <button
          type="button"
          disabled={isPending || !issuer || !title}
          onClick={submit}
          className="mt-4 rounded-pill bg-ink text-surface px-5 py-2 font-semibold disabled:opacity-40"
        >
          {isPending ? "Adding…" : "Add credential"}
        </button>
      </div>

      <ul className="space-y-3">
        {certs.map((c) => (
          <li
            key={c.id}
            className="flex items-center gap-4 rounded-card border border-line p-4 bg-surface-raised"
          >
            <div className="flex-1">
              <p className="font-semibold">{c.title}</p>
              <p className="text-sm text-ink-soft">
                {c.kind.toUpperCase()} · {c.issuer}
              </p>
            </div>
            {c.verified ? (
              <VerifiedBadge>Verified</VerifiedBadge>
            ) : (
              <span className="text-xs px-2.5 py-1 rounded-pill border border-line text-ink-soft">
                Pending verification
              </span>
            )}
            <button
              type="button"
              className="text-xs text-ink-soft hover:text-accent"
              onClick={() => {
                startTransition(async () => {
                  await deleteCertification(c.id);
                  router.refresh();
                });
              }}
            >
              Remove
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
