import { describe, expect, test } from "vitest";
import { haversineKm, rowToMobileGig } from "@/app/(mobile)/m/feed/deck-utils";

describe("haversineKm", () => {
  test("returns 0 for identical points", () => {
    expect(haversineKm(1.3521, 103.8198, 1.3521, 103.8198)).toBe(0);
  });

  test("Raffles Place → Changi Airport is roughly 17 km", () => {
    const km = haversineKm(1.284, 103.8514, 1.3644, 103.9915);
    expect(km).toBeGreaterThan(15);
    expect(km).toBeLessThan(20);
  });
});

describe("rowToMobileGig", () => {
  const baseRow = {
    id: "gig-1",
    title: "Move boxes",
    budget_cents: 5_000,
    budget_kind: "fixed",
    instant_urgency: "now",
  };

  test("fills safe defaults for optional fields", () => {
    const gig = rowToMobileGig(baseRow, "Acme Events");
    expect(gig).toEqual({
      id: "gig-1",
      title: "Move boxes",
      description: null,
      location: "Singapore",
      lat: null,
      lon: null,
      budget_cents: 5_000,
      budget_kind: "fixed",
      instant_urgency: "now",
      skills_required: [],
      employerName: "Acme Events",
      score: undefined,
    });
  });

  test("passes through description, coordinates, skills and numeric score", () => {
    const gig = rowToMobileGig(
      {
        ...baseRow,
        description: "Two hours of lifting",
        location: "Jurong East",
        lat: 1.33,
        lon: 103.74,
        skills_required: ["lifting"],
        score: 0.87,
      },
      "Acme Events",
    );
    expect(gig.description).toBe("Two hours of lifting");
    expect(gig.location).toBe("Jurong East");
    expect(gig.lat).toBe(1.33);
    expect(gig.skills_required).toEqual(["lifting"]);
    expect(gig.score).toBe(0.87);
  });

  test("ignores a non-numeric score", () => {
    const gig = rowToMobileGig({ ...baseRow, score: "high" }, "Acme");
    expect(gig.score).toBeUndefined();
  });
});
