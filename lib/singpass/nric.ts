// Singapore NRIC/FIN validation.
// Algorithm: first character is prefix (S,T,F,G,M), followed by 7 digits and
// a check character. The check character is derived from a weighted sum of
// the 7 digits and a lookup table that differs per prefix.
// Reference: public SG identifier spec (not sensitive).

const WEIGHTS = [2, 7, 6, 5, 4, 3, 2];

// Check letters for citizens (S,T) and foreigners (F,G) / post-2022 migrants (M)
const CHECK_ST = ["J", "Z", "I", "H", "G", "F", "E", "D", "C", "B", "A"];
const CHECK_FG = ["X", "W", "U", "T", "R", "Q", "P", "N", "M", "L", "K"];
const CHECK_M = ["K", "L", "J", "N", "P", "Q", "R", "T", "U", "W", "X"];

export type NricPrefix = "S" | "T" | "F" | "G" | "M";

export function isValidNric(raw: string): boolean {
  if (!raw) return false;
  const nric = raw.trim().toUpperCase();
  if (!/^[STFGM]\d{7}[A-Z]$/.test(nric)) return false;

  const prefix = nric[0] as NricPrefix;
  const digits = nric.slice(1, 8).split("").map(Number);
  const provided = nric[8];

  let sum = digits.reduce((acc, d, i) => acc + d * WEIGHTS[i], 0);
  // Offsets per prefix
  if (prefix === "T" || prefix === "G") sum += 4;
  if (prefix === "M") sum += 3;

  const remainder = sum % 11;

  let table: string[];
  if (prefix === "S" || prefix === "T") table = CHECK_ST;
  else if (prefix === "F" || prefix === "G") table = CHECK_FG;
  else table = CHECK_M;

  // M-series reverses the remainder index per ICA spec
  const index = prefix === "M" ? 10 - remainder : remainder;
  return table[index] === provided;
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
