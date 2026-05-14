import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/server";
import { SwipeCardDeck } from "./SwipeCardDeck";
import type { MobileGig } from "./SwipeCardDeck";

function sgtDayBounds() {
  const SGT = 8 * 3600000;
  const now = new Date();
  const sgtNow = new Date(now.getTime() + SGT);
  const start = new Date(
    Date.UTC(sgtNow.getUTCFullYear(), sgtNow.getUTCMonth(), sgtNow.getUTCDate()) - SGT,
  );
  return { start, end: new Date(start.getTime() + 24 * 3600000) };
}

export default async function MobileFeedPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const service = createServiceClient();
  const { start, end } = sgtDayBounds();

  const { data: raw } = await service
    .from("gigs")
    .select(
      "id, title, description, location, lat, lon, budget_cents, budget_kind, instant_urgency, skills_required, employer_id",
    )
    .eq("is_instant", true)
    .eq("status", "open")
    .or(`start_at.is.null,and(start_at.gte.${start.toISOString()},start_at.lt.${end.toISOString()})`)
    .order("created_at", { ascending: false })
    .limit(20);

  const employerIds = [...new Set((raw ?? []).map((g) => g.employer_id))];
  const { data: profiles } = await service
    .from("profiles")
    .select("id, display_name")
    .in("id", employerIds.length > 0 ? employerIds : ["00000000-0000-0000-0000-000000000000"]);

  const nameMap: Record<string, string> = {};
  for (const p of profiles ?? []) nameMap[p.id] = p.display_name ?? "Employer";

  const gigs: MobileGig[] = (raw ?? []).map((g) => ({
    id: g.id,
    title: g.title,
    description: g.description ?? null,
    location: g.location ?? "Singapore",
    lat: g.lat ?? null,
    lon: g.lon ?? null,
    budget_cents: g.budget_cents,
    budget_kind: g.budget_kind as "fixed" | "hourly",
    instant_urgency: g.instant_urgency as "now" | "today" | "weekend",
    skills_required: g.skills_required ?? [],
    employerName: nameMap[g.employer_id] ?? "Employer",
  }));

  const nowCount = gigs.filter((g) => g.instant_urgency === "now").length;
  const todayCount = gigs.filter((g) => g.instant_urgency === "today").length;

  return (
    <>
      {/* Page header */}
      <div style={{ padding: "10px 16px 8px", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              padding: "3px 10px",
              borderRadius: 999,
              background: "#dc2626",
              color: "#fff",
              fontSize: 10,
              fontWeight: 800,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "#fff",
                animation: "pulse 1.4s ease-in-out infinite",
              }}
            />
            Live
          </span>
          {nowCount > 0 && (
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                color: "var(--color-ink-mute)",
              }}
            >
              {nowCount} urgent · {todayCount} today
            </span>
          )}
        </div>
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 20,
            margin: "0 0 2px",
            letterSpacing: "-0.025em",
            color: "var(--color-ink)",
          }}
        >
          Instant Gigs
        </h1>
        <p style={{ fontSize: 11, color: "var(--color-ink-mute)", margin: 0 }}>
          Swipe right to accept · left to skip
        </p>
      </div>

      {/* Card deck */}
      <div style={{ flex: 1, overflow: "hidden", position: "relative" }}>
        <SwipeCardDeck gigs={gigs} isLoggedIn={!!user} />
      </div>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
      `}</style>
    </>
  );
}
