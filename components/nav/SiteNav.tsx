import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export async function SiteNav({ variant = "surface" }: { variant?: "surface" | "ink" }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const profile = user
    ? (
        await supabase
          .from("profiles")
          .select("handle, display_name")
          .eq("id", user.id)
          .single()
      ).data
    : null;

  const isInk = variant === "ink";

  return (
    <header
      className={`sticky top-0 z-40 backdrop-blur border-b ${
        isInk
          ? "bg-ink/70 border-white/10 text-surface"
          : "bg-surface/70 border-line text-ink"
      }`}
    >
      <div className="mx-auto max-w-7xl px-6 py-4 flex items-center gap-8">
        <Link href="/" className="flex items-center gap-2 font-display text-xl font-medium">
          <span className="inline-block h-6 w-6 rounded-md bg-accent" aria-hidden />
          Hustle<span className={isInk ? "text-accent" : "text-accent-ink"}>.sg</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm">
          <Link href="/gigs" className="opacity-80 hover:opacity-100">Gigs</Link>
          <Link href="/feed" className="opacity-80 hover:opacity-100">My feed</Link>
          <Link href="/start-a-business" className="opacity-80 hover:opacity-100">
            Start a business
          </Link>
        </nav>

        <div className="ml-auto flex items-center gap-3">
          {profile ? (
            <>
              <Link
                href={`/profile/${profile.handle}`}
                className="text-sm font-medium opacity-80 hover:opacity-100"
              >
                {profile.display_name}
              </Link>
              <Link
                href="/dashboard"
                className={`rounded-pill px-4 py-2 text-sm font-semibold ${
                  isInk ? "bg-surface text-ink" : "bg-ink text-surface"
                }`}
              >
                Dashboard
              </Link>
            </>
          ) : (
            <>
              <Link href="/singpass" className="text-sm font-medium opacity-80 hover:opacity-100">
                Log in
              </Link>
              <Link
                href="/singpass"
                className={`rounded-pill px-4 py-2 text-sm font-semibold ${
                  isInk ? "bg-accent text-ink" : "bg-ink text-surface"
                }`}
              >
                Get verified →
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
