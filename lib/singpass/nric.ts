export type NricPrefix = "S" | "T" | "F" | "G" | "M";

export function isValidNric(raw: string): boolean {
  if (!raw) return false;
  return /^[STFGM]\d{7}[A-Z]$/i.test(raw.trim());
}

export function maskNric(raw: string): string {
  const n = raw.trim().toUpperCase();
  if (n.length < 9) return n;
  return `${n[0]}••••${n.slice(5)}`;
}

export async function hashNric(raw: string, salt = "hustle-sg"): Promise<string> {
  const normalized = raw.trim().toUpperCase();
  const enc = new TextEncoder().encode(`${salt}:${normalized}`);
  const buf = await crypto.subtle.digest("SHA-256", enc);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// Deterministic mock email for Supabase Auth from NRIC hash.
// Keeps same user across sessions without storing raw NRIC.
export function mockEmailForHash(hash: string): string {
  return `${hash.slice(0, 24)}@singpass.mock`;
}

// Derived deterministic password so we can re-sign-in without real credential flow.
// Acceptable for mock-only; real Singpass would issue a session via OAuth.
export function mockPasswordForHash(hash: string): string {
  return `hustle-${hash.slice(16, 40)}`;
}
