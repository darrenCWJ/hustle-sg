import { describe, expect, test } from "vitest";
import { hashNric, isValidNric, maskNric, mockEmailForHash } from "@/lib/singpass/nric";

describe("NRIC validation", () => {
  test("rejects empty/short/bad format", () => {
    expect(isValidNric("")).toBe(false);
    expect(isValidNric("S123")).toBe(false);
    expect(isValidNric("X1234567A")).toBe(false);
    expect(isValidNric("S12345678")).toBe(false);
    expect(isValidNric("S1234567")).toBe(false);
  });

  test("accepts known valid demo NRICs", () => {
    // Check letters computed from the public SG checksum algorithm.
    expect(isValidNric("S1234567D")).toBe(true);
    expect(isValidNric("S2345678H")).toBe(true);
    expect(isValidNric("T0123456G")).toBe(true);
    expect(isValidNric("M1023456L")).toBe(true);
  });

  test("rejects wrong check letter", () => {
    expect(isValidNric("S1234567A")).toBe(false);
  });

  test("is case-insensitive on input", () => {
    expect(isValidNric("s1234567d")).toBe(true);
  });

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
