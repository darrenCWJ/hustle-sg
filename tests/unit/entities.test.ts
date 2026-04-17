import { describe, expect, test } from "vitest";
import {
  ENTITIES,
  looksReserved,
  mockAcraUEN,
} from "@/lib/entrepreneur/entities";

describe("entrepreneur entities", () => {
  test("both entity types exposed", () => {
    expect(ENTITIES.sole_prop.label).toMatch(/sole/i);
    expect(ENTITIES.pte_ltd.label).toMatch(/pte|private/i);
  });

  test("looksReserved flags restricted terms", () => {
    expect(looksReserved("Arif Bank Consulting")).toBe("bank");
    expect(looksReserved("CPF Advisors")).toBe("cpf");
    expect(looksReserved("Kaya Toast Creative")).toBeNull();
  });

  test("mockAcraUEN shape", () => {
    const uen = mockAcraUEN();
    expect(uen).toMatch(/^\d{4}\d{5}[A-HJKLMNPRTX]$/);
  });
});
