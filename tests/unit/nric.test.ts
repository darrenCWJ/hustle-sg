import { describe, expect, test } from "vitest";
import {
  hashNric,
  isValidNric,
  isValidNricChecksum,
  maskNric,
  mockEmailForHash,
} from "@/lib/singpass/nric";

describe("NRIC format validation (isValidNric)", () => {
  test("rejects empty/short/bad format", () => {
    expect(isValidNric("")).toBe(false);
    expect(isValidNric("S123")).toBe(false);
    expect(isValidNric("X1234567A")).toBe(false);
    expect(isValidNric("S12345678")).toBe(false);
    expect(isValidNric("S1234567")).toBe(false);
  });

  test("accepts well-formed NRICs (format only, no checksum)", () => {
    expect(isValidNric("S1234567D")).toBe(true);
    expect(isValidNric("S2345678H")).toBe(true);
    expect(isValidNric("T0123456G")).toBe(true);
    expect(isValidNric("M1023456L")).toBe(true);
    // Format-valid even though the checksum is wrong — the demo relies on this.
    expect(isValidNric("S1234567A")).toBe(true);
  });

  test("is case-insensitive on input", () => {
    expect(isValidNric("s1234567d")).toBe(true);
  });
});

describe("NRIC checksum validation (isValidNricChecksum)", () => {
  test("accepts NRICs with a correct check letter", () => {
    expect(isValidNricChecksum("S1234567D")).toBe(true);
    expect(isValidNricChecksum("S2345678H")).toBe(true);
    expect(isValidNricChecksum("S3456789A")).toBe(true);
    expect(isValidNricChecksum("T0123456G")).toBe(true);
    expect(isValidNricChecksum("M1023456L")).toBe(true);
    expect(isValidNricChecksum("M2023457U")).toBe(true);
  });

  test("rejects a wrong check letter", () => {
    expect(isValidNricChecksum("S1234567A")).toBe(false);
    expect(isValidNricChecksum("M1023456A")).toBe(false);
  });

  test("rejects bad format", () => {
    expect(isValidNricChecksum("S123")).toBe(false);
    expect(isValidNricChecksum("")).toBe(false);
  });
});

describe("NRIC hashing + masking", () => {

  test("masks NRIC keeping prefix and last 4", () => {
    expect(maskNric("S1234567D")).toBe("S••••567D");
  });

  test("hashNric is deterministic and hex", async () => {
    const a = await hashNric("S1234567D");
    const b = await hashNric("s1234567d");
    expect(a).toBe(b);
    expect(a).toMatch(/^[0-9a-f]{64}$/);
  });

  test("mockEmailForHash produces a stable mock email", () => {
    const email = mockEmailForHash("abcdefabcdefabcdefabcdef012345");
    expect(email).toMatch(/@singpass\.mock$/);
  });
});
