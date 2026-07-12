/**
 * Returns `next` only when it is a safe, same-origin relative path.
 *
 * Prevents open-redirect (CWE-601): rejects absolute URLs (`https://evil`),
 * protocol-relative URLs (`//evil`), backslash variants browsers normalise to
 * `//` (`/\evil`), and anything containing control/whitespace characters that
 * could smuggle a scheme. Falls back to a known in-app path otherwise.
 */
export function safeNext(next: unknown, fallback = "/feed"): string {
  if (typeof next !== "string" || next.length === 0) return fallback;
  if (!next.startsWith("/")) return fallback;
  if (next.startsWith("//") || next.startsWith("/\\")) return fallback;
  // Reject any control character or whitespace (0x00–0x20, 0x7f) that could
  // smuggle a scheme or break out of the intended relative path.
  for (let i = 0; i < next.length; i++) {
    const code = next.charCodeAt(i);
    if (code <= 0x20 || code === 0x7f) return fallback;
  }
  return next;
}
