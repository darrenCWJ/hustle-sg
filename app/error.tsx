"use client";

import { useEffect } from "react";
import Link from "next/link";
import { reportClientError } from "@/app/actions/errors";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[route-error]", error);
    // Persist to the first-party error store (app_errors → /admin/errors).
    reportClientError({
      message: error.message || "Unknown root error",
      digest: error.digest,
      url: typeof window !== "undefined" ? window.location.href : undefined,
      scope: "root-error-boundary",
    }).catch(() => {});
  }, [error]);

  return (
    <main className="min-h-screen grid place-items-center px-6 bg-surface text-ink">
      <div className="max-w-md text-center">
        <p className="text-xs uppercase tracking-widest text-ink-soft">Something went wrong</p>
        <h1 className="font-display text-display-md mt-3">We hit a snag</h1>
        <p className="text-ink-soft mt-3">
          This page failed to load. It&apos;s not you — try again, and if it keeps happening
          head back home.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="rounded-pill bg-ink text-surface px-5 py-2.5 font-semibold hover:bg-accent-ink transition"
          >
            Try again
          </button>
          <Link
            href="/"
            className="rounded-pill border border-line px-5 py-2.5 font-semibold text-ink-soft hover:text-ink transition"
          >
            Go home
          </Link>
        </div>
        {error.digest && (
          <p className="mt-6 font-mono text-xs text-ink-mute">Ref: {error.digest}</p>
        )}
      </div>
    </main>
  );
}
