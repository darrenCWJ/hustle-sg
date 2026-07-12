import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/server";
import { SwipeCardDeck } from "./SwipeCardDeck";
import type { MobileGig } from "./SwipeCardDeck";
import { FeedModeChips } from "./FeedModeChips";
import type { FeedMode } from "./FeedModeChips";
import type { MatchInstantGigRow } from "@/lib/supabase/types";

function sgtDayBounds() {
  const SGT = 8 * 3600000;
  const now = new Date();
  const sgtNow = new Date(now.getTime() + SGT);
  const start = new Date(
    Date.UTC(sgtNow.getUTCFullYear(), sgtNow.getUTCMonth(), sgtNow.getUTCDate()) - SGT,
  );
  return { start, end: new Date(start.getTime() + 24 * 3600000) };
}

async function resolveEmployerNames(
  service: ReturnType<typeof createServiceClient>,
  employerIds: string[],
): Promise<Record<string, string>> {
  if (employerIds.length === 0) return {};
  const { data: profiles } = await service
    .from("profiles")
    .select("id, display_name")
    .in("id", employerIds);
  const nameMap: Record<string, string> = {};
  for (const p of profiles ?? []) nameMap[p.id] = p.display_name ?? "Employer";
  return nameMap;
}

export default async function MobileFeedPage({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string }>;
}) {
  const params = await searchParams;
  const mode: FeedMode = params.mode === "nearby" ? "nearby" : "all";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const service = createServiceClient();
  const { start, end } = sgtDayBounds();

  let gigs: MobileGig[];

  let hasEmbedding = false;
  if (user) {
    const { count } = await service
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("id", user.id)
      .not("embedding", "is", null);
    hasEmbedding = (count ?? 0) > 0;
  }

  if (user && hasEmbedding) {
    const { data: matched } = await service.rpc("match_instant_gigs_for_user", {
      p_user_id: user.id,
      p_day_start: start.toISOString(),
      p_day_end: end.toISOString(),
      p_limit: mode === "nearby" ? 50 : 20,
    });

    let rows = (matched ?? []) as MatchInstantGigRow[];

    if (mode === "nearby") {
      rows = rows
        .filter((r) => r.instant_urgency === "now")
        .sort((a, b) => (a.distance_km ?? Infinity) - (b.distance_km ?? Infinity))
        .slice(0, 20);
    }

    const employerIds = [...new Set(rows.map((r) => r.employer_id))];
    const nameMap = await resolveEmployerNames(service, employerIds);

    gigs = rows.map((r) => ({
      id: r.gig_id,
      title: r.title,
      description: r.description ?? null,
      location: r.location ?? "Singapore",
      lat: r.lat,
      lon: r.lon,
      budget_cents: r.budget_cents,
      budget_kind: r.budget_kind as "fixed" | "hourly",
      instant_urgency: r.instant_urgency as "now" | "today" | "weekend",
      skills_required: r.skills_required ?? [],
      employerName: nameMap[r.employer_id] ?? "Employer",
      score: r.score,
    }));
  } else {
    let query = service
      .from("gigs")
      .select(
        "id, title, description, location, lat, lon, budget_cents, budget_kind, instant_urgency, skills_required, employer_id",
      )
      .eq("is_instant", true)
      .eq("status", "open")
      .or(`start_at.is.null,and(start_at.gte.${start.toISOString()},start_at.lt.${end.toISOString()})`);

    if (mode === "nearby") {
      query = query.eq("instant_urgency", "now");
    }

    const { data: raw } = await query
      .order("created_at", { ascending: false })
      .limit(20);

    const employerIds = [...new Set((raw ?? []).map((g) => g.employer_id))];
    const nameMap = await resolveEmployerNames(service, employerIds);

    gigs = (raw ?? []).map((g) => ({
      id: g.id,
      title: g.title,
      description: g.description ?? null,
      location: g.location ?? "Singapore",
      lat: g.lat ?? null,
      lon: g.lon ?? null,
      budget_cents: g.budget_cents ?? 0,
      budget_kind: g.budget_kind as "fixed" | "hourly",
      instant_urgency: g.instant_urgency as "now" | "today" | "weekend",
      skills_required: g.skills_required ?? [],
      employerName: nameMap[g.employer_id] ?? "Employer",
    }));
  }

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
          {mode === "nearby" ? "Nearby Now" : "Instant Gigs"}
        </h1>
        <p style={{ fontSize: 11, color: "var(--color-ink-mute)", margin: 0 }}>
          {mode === "nearby"
            ? "Urgent gigs closest to you"
            : "Swipe right to accept · left to skip"}
        </p>
        <Suspense>
          <FeedModeChips />
        </Suspense>
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
