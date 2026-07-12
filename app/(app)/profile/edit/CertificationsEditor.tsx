"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  addCertification,
  deleteCertification,
} from "./actions";
import { verifyOpenCertUpload } from "@/app/actions/opencerts";
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
  const [openCertFile, setOpenCertFile] = useState<File | null>(null);
  const [openCertError, setOpenCertError] = useState<string | null>(null);
  const [openCertFlash, setOpenCertFlash] = useState<string | null>(null);

  const submitOpenCert = () => {
    if (!openCertFile) return;
    setOpenCertError(null);
    setOpenCertFlash(null);
    const fd = new FormData();
    fd.set("opencert", openCertFile);
    startTransition(async () => {
      const res = await verifyOpenCertUpload(fd);
      if (!res.ok) {
        setOpenCertError(res.error ?? "Verification failed.");
        return;
      }
      setOpenCertFile(null);
      setOpenCertFlash(`Verified ✓ — "${res.title}" from ${res.issuer} added with a verified badge.`);
      router.refresh();
    });
  };

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

      {/* OpenCerts upload — a passing document is real evidence, so it earns
          the verified badge instantly (unlike self-typed certs, which queue
          for manual review). */}
      <div className="mb-4 rounded-card bg-surface-raised border border-line p-6">
        <p className="text-xs uppercase tracking-widest text-ink-soft font-semibold mb-1">
          Have an OpenCerts file?
        </p>
        <p className="text-sm text-ink-soft mb-4">
          Upload the <span className="font-mono text-xs">.opencert</span> file issued with your
          Singapore qualification — we verify its integrity, issuance status and issuer, and the
          badge is granted immediately.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <label
            htmlFor="opencert-file"
            className="text-xs uppercase tracking-widest text-ink-soft"
            style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}
          >
            OpenCerts file
          </label>
          <input
            id="opencert-file"
            type="file"
            accept=".opencert,.json,application/json"
            onChange={(e) => setOpenCertFile(e.target.files?.[0] ?? null)}
            className="text-sm text-ink-soft file:mr-3 file:rounded-pill file:border file:border-line file:bg-surface file:px-4 file:py-2 file:text-xs file:font-semibold file:text-ink-soft"
          />
          <button
            type="button"
            onClick={submitOpenCert}
            disabled={isPending || !openCertFile}
            className="rounded-pill bg-ink text-surface px-5 py-2 text-sm font-semibold hover:bg-accent-ink transition disabled:opacity-50"
          >
            {isPending ? "Verifying…" : "Verify & add"}
          </button>
        </div>
        {openCertError && <p className="text-sm text-accent mt-3">{openCertError}</p>}
        {openCertFlash && <p className="text-sm text-trust mt-3">{openCertFlash}</p>}
      </div>

      <div className="mb-8 rounded-card bg-surface-raised border border-line p-6">
        {/* Real labels, not placeholder-only fields (Phase 5.2). */}
        <div className="grid md:grid-cols-2 gap-3">
          <div>
            <label htmlFor="cert-issuer" className="text-xs uppercase tracking-widest text-ink-soft">
              Issuer
            </label>
            <input
              id="cert-issuer"
              placeholder="e.g. SkillsFuture SG"
              value={issuer}
              onChange={(e) => setIssuer(e.target.value)}
              className="mt-2 w-full rounded-xl border border-line px-4 py-3 bg-surface"
            />
          </div>
          <div>
            <label htmlFor="cert-title" className="text-xs uppercase tracking-widest text-ink-soft">
              Certificate title
            </label>
            <input
              id="cert-title"
              placeholder="e.g. Food Safety Level 1"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-2 w-full rounded-xl border border-line px-4 py-3 bg-surface"
            />
          </div>
          <div>
            <label htmlFor="cert-kind" className="text-xs uppercase tracking-widest text-ink-soft">
              Type
            </label>
            <select
              id="cert-kind"
              value={kind}
              onChange={(e) => setKind(e.target.value as any)}
              className="mt-2 w-full rounded-xl border border-line px-4 py-3 bg-surface"
            >
              <option value="wsq">WSQ</option>
              <option value="university">University</option>
              <option value="accreditation">Accreditation</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label htmlFor="cert-issued-at" className="text-xs uppercase tracking-widest text-ink-soft">
              Issue date
            </label>
            <input
              id="cert-issued-at"
              type="date"
              value={issuedAt}
              onChange={(e) => setIssuedAt(e.target.value)}
              className="mt-2 w-full rounded-xl border border-line px-4 py-3 bg-surface"
            />
          </div>
        </div>
        <label htmlFor="cert-raw-text" className="mt-4 block text-xs uppercase tracking-widest text-ink-soft">
          Certificate text (optional)
        </label>
        <textarea
          id="cert-raw-text"
          placeholder="Paste the certificate text for AI to extract skills"
          value={rawText}
          onChange={(e) => setRawText(e.target.value)}
          rows={3}
          className="mt-2 w-full rounded-xl border border-line px-4 py-3 bg-surface"
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
