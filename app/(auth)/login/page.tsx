import Link from "next/link";
import { safeNext } from "@/lib/security/safe-redirect";
import { DEMO_MODE } from "@/lib/config/demo";
import { LoginForm } from "./LoginForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const next = safeNext((await searchParams).next, "/feed");

  return (
    <main className="min-h-screen grid place-items-center px-6 py-20">
      <div style={{ width: "100%", maxWidth: 400 }}>
        <p style={{ fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", fontWeight: 600, color: "var(--color-ink-soft)", margin: "0 0 10px" }}>
          Sign in
        </p>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2rem, 4vw, 2.8rem)", margin: "0 0 8px", letterSpacing: "-0.03em" }}>
          Welcome back.
        </h1>
        <p style={{ fontSize: 14, color: "var(--color-ink-soft)", margin: "0 0 28px", lineHeight: 1.55 }}>
          Enter your email and we&apos;ll send a one-time code — no password needed.
        </p>

        <LoginForm next={next} />

        {DEMO_MODE && (
          <p style={{ fontSize: 12.5, color: "var(--color-ink-mute)", margin: "24px 0 0", textAlign: "center" }}>
            Exploring the demo?{" "}
            <Link href={`/singpass?next=${encodeURIComponent(next)}`} style={{ color: "var(--color-ink-soft)", fontWeight: 600 }}>
              Use mock Singpass instead
            </Link>
          </p>
        )}
      </div>
    </main>
  );
}
