import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen grid place-items-center px-6 bg-surface text-ink">
      <div className="max-w-md text-center">
        <p className="font-mono text-xs uppercase tracking-widest text-ink-soft">404</p>
        <h1 className="font-display text-display-md mt-3">Page not found</h1>
        <p className="text-ink-soft mt-3">
          The page you&apos;re looking for doesn&apos;t exist or may have moved.
        </p>
        <div className="mt-8">
          <Link
            href="/"
            className="rounded-pill bg-ink text-surface px-5 py-2.5 font-semibold hover:bg-accent-ink transition"
          >
            Back to home
          </Link>
        </div>
      </div>
    </main>
  );
}
