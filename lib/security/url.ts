/**
 * True only for http(s) URLs. Blocks XSS-capable schemes such as `javascript:`,
 * `data:`, and `vbscript:` that `z.string().url()` / the URL constructor accept
 * but must never be rendered into an anchor `href`.
 */
export function isHttpUrl(value: string): boolean {
  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    return false;
  }
  return parsed.protocol === "http:" || parsed.protocol === "https:";
}

/** Returns the URL if it is http(s), otherwise null. Safe for use in `href`. */
export function safeHref(value: string | null | undefined): string | null {
  if (!value) return null;
  return isHttpUrl(value) ? value : null;
}
