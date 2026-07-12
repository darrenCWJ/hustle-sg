import { describe, expect, test } from "vitest";
import { mobilePathFor } from "@/lib/device/mobile-routes";

describe("mobilePathFor", () => {
  test("maps desktop pages to their /m equivalents", () => {
    expect(mobilePathFor("/")).toBe("/m/feed");
    expect(mobilePathFor("/feed")).toBe("/m/feed");
    expect(mobilePathFor("/gigs")).toBe("/m/browse");
    expect(mobilePathFor("/applications")).toBe("/m/applications");
    expect(mobilePathFor("/notifications")).toBe("/m/notifications");
    expect(mobilePathFor("/singpass")).toBe("/m/singpass");
  });

  test("maps gig detail pages by UUID", () => {
    expect(mobilePathFor("/gigs/123e4567-e89b-12d3-a456-426614174000")).toBe(
      "/m/gigs/123e4567-e89b-12d3-a456-426614174000",
    );
  });

  test("leaves desktop-only and non-UUID paths alone", () => {
    expect(mobilePathFor("/messages")).toBeNull();
    expect(mobilePathFor("/interviews/abc")).toBeNull();
    expect(mobilePathFor("/rate/abc")).toBeNull();
    expect(mobilePathFor("/admin")).toBeNull();
    expect(mobilePathFor("/dashboard")).toBeNull();
    expect(mobilePathFor("/gigs/new")).toBeNull(); // posting stays desktop
    expect(mobilePathFor("/gigs/not-a-uuid")).toBeNull();
    expect(mobilePathFor("/profile/somehandle")).toBeNull();
    expect(mobilePathFor("/m/feed")).toBeNull(); // already mobile
  });
});
