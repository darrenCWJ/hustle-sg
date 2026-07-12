// Pure helpers for the mobile swipe deck. No React — unit-testable.

export interface MobileGig {
  id: string;
  title: string;
  description: string | null;
  location: string;
  lat: number | null;
  lon: number | null;
  budget_cents: number;
  budget_kind: "fixed" | "hourly";
  instant_urgency: "now" | "today" | "weekend";
  skills_required: string[];
  employerName: string;
  score?: number;
}

export const URGENCY = {
  now: { label: "Right Now", bg: "#dc2626", text: "#fff" },
  today: { label: "Today", bg: "#d97706", text: "#fff" },
  weekend: { label: "Weekend", bg: "#16a34a", text: "#fff" },
};

// Horizontal drag distance (px) past which a card commits to accept/skip
export const SWIPE_THRESHOLD = 85;

// Pull-to-refresh: vertical drag distance (px) that triggers a refresh
export const PTR_THRESHOLD = 72;

export function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Maps a raw gig row (Realtime payload or /api/instant-gigs JSON) to a
// MobileGig. Both sources share this so the deck can't drift between them.
export function rowToMobileGig(row: Record<string, unknown>, employerName: string): MobileGig {
  return {
    id: row.id as string,
    title: row.title as string,
    description: (row.description as string | undefined) ?? null,
    location: (row.location as string | undefined) ?? "Singapore",
    lat: (row.lat as number | undefined) ?? null,
    lon: (row.lon as number | undefined) ?? null,
    budget_cents: row.budget_cents as number,
    budget_kind: row.budget_kind as "fixed" | "hourly",
    instant_urgency: row.instant_urgency as "now" | "today" | "weekend",
    skills_required: (row.skills_required as string[] | undefined) ?? [],
    employerName,
    score: typeof row.score === "number" ? row.score : undefined,
  };
}
