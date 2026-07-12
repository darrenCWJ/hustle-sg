// Maps desktop routes to their /m equivalents for phone auto-redirect.
// Imported by middleware — keep this edge-safe (no Node APIs, no server-only).

// "desktop" = the user tapped "Use desktop site" on a phone; middleware
// stops auto-redirecting until they switch back.
export const VIEW_COOKIE = "hustle_view";

const EXACT: Record<string, string> = {
  "/": "/m/feed",
  "/feed": "/m/feed",
  "/gigs": "/m/browse",
  "/applications": "/m/applications",
  "/notifications": "/m/notifications",
  "/singpass": "/m/singpass",
};

const GIG_DETAIL = /^\/gigs\/([0-9a-f-]{36})$/i;

// Returns the /m path a phone should land on, or null when the desktop
// page has no mobile equivalent (deep pages like /messages, /interviews,
// /rate, /admin intentionally stay desktop — the mobile app cross-links
// into them).
export function mobilePathFor(pathname: string): string | null {
  const exact = EXACT[pathname];
  if (exact) return exact;
  const gig = pathname.match(GIG_DETAIL);
  if (gig) return `/m/gigs/${gig[1]}`;
  return null;
}
