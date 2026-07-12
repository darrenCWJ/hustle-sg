import { describe, expect, test } from "vitest";
import { isVerifiedIssuer } from "@/lib/ai/cert-parser";

// The issuer whitelist feeds the demo cert-parse flow. It must match loosely
// on case/whitespace but never on substrings or lookalikes.

describe("isVerifiedIssuer", () => {
  test("recognises whitelisted issuers case-insensitively", () => {
    expect(isVerifiedIssuer("NUS")).toBe(true);
    expect(isVerifiedIssuer("nus")).toBe(true);
    expect(isVerifiedIssuer("  Singapore Polytechnic  ")).toBe(true);
    expect(isVerifiedIssuer("Institution of Engineers Singapore")).toBe(true);
  });

  test("rejects unknown and lookalike issuers", () => {
    expect(isVerifiedIssuer("")).toBe(false);
    expect(isVerifiedIssuer("Totally Real University")).toBe(false);
    expect(isVerifiedIssuer("NUS ")).toBe(true); // trims
    expect(isVerifiedIssuer("NUS-adjacent Academy")).toBe(false); // no substring match
    expect(isVerifiedIssuer("nus2")).toBe(false);
  });
});
