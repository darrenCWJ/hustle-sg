/**
 * Same-origin guard for plain Route Handlers.
 *
 * Next.js Server Actions get built-in same-origin enforcement; Route Handlers do
 * not. This rejects a cross-site state-changing request by comparing the request
 * Origin to the request host. A missing Origin header (same-origin navigations,
 * server-to-server, curl) is allowed; a present, mismatched Origin is rejected.
 */
export function isSameOrigin(req: Request): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return true;
  try {
    return new URL(origin).host === new URL(req.url).host;
  } catch {
    return false;
  }
}
