export type NricPrefix = "S" | "T" | "F" | "G" | "M";

/**
 * Format-only NRIC check (prefix + 7 digits + suffix letter). Deliberately does
 * NOT verify the checksum: the demo seeds fabricated NRICs (e.g. S1111111A,
 * M1001001A) that are already hashed into Supabase Auth, so the mock login must
 * accept them. For REAL identity verification use isValidNricChecksum().
 */
export function isValidNric(raw: string): boolean {
  if (!raw) return false;
  return /^[STFGM]\d{7}[A-Z]$/i.test(raw.trim());
}

const NRIC_WEIGHTS = [2, 7, 6, 5, 4, 3, 2] as const;
const NRIC_CHECK_ST = ["J", "Z", "I", "H", "G", "F", "E", "D", "C", "B", "A"];
const NRIC_CHECK_FG = ["X", "W", "U", "T", "R", "Q", "P", "N", "M", "L", "K"];
const NRIC_CHECK_M = ["K", "L", "J", "N", "P", "Q", "R", "T", "U", "W", "X"];

/**
 * Validates the real Singapore NRIC/FIN checksum (public algorithm), not just
 * the format. This is what a production identity flow should use.
 */
export function isValidNricChecksum(raw: string): boolean {
  const n = raw.trim().toUpperCase();
  if (!/^[STFGM]\d{7}[A-Z]$/.test(n)) return false;

  const prefix = n[0];
  let sum = 0;
  for (let i = 0; i < 7; i++) sum += Number(n[i + 1]) * NRIC_WEIGHTS[i];
  if (prefix === "T" || prefix === "G") sum += 4;
  else if (prefix === "M") sum += 3;

  const remainder = sum % 11;
  const table =
    prefix === "S" || prefix === "T"
      ? NRIC_CHECK_ST
      : prefix === "F" || prefix === "G"
        ? NRIC_CHECK_FG
        : NRIC_CHECK_M;
  const index = prefix === "M" ? 10 - remainder : remainder;
  return n[8] === table[index];
}

export function maskNric(raw: string): string {
  const n = raw.trim().toUpperCase();
  if (n.length < 9) return n;
  return `${n[0]}••••${n.slice(5)}`;
}

// Per-deployment salt (IMPROVEMENT_PLAN.md Phase 0.3). The public default keeps
// the seeded demo accounts working; any non-demo deployment must set
// NRIC_HASH_SALT so derived credentials are not computable offline from the
// well-known string. Server-only: every call site is a server action/RSC/seed.
export async function hashNric(
  raw: string,
  salt = process.env.NRIC_HASH_SALT ?? "hustle-sg",
): Promise<string> {
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
