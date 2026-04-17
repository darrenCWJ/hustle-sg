import { describe, expect, test } from "vitest";
import {
  buildGigEmbeddingText,
  buildProfileEmbeddingText,
  cosine,
} from "@/lib/ai/embeddings";

describe("embedding text builders", () => {
  test("profile text concatenates fields", () => {
    const text = buildProfileEmbeddingText({
      headline: "UX designer",
      bio: "Ex-NUS",
      certTitles: ["WSQ UX"],
      extractedSkills: ["figma"],
      portfolioTags: ["ux"],
      portfolioDescriptions: ["Case study"],
    });
    expect(text).toContain("UX designer");
    expect(text).toContain("WSQ UX");
    expect(text).toContain("figma");
    expect(text).toContain("Case study");
  });

  test("gig text concatenates title/desc/skills", () => {
    const text = buildGigEmbeddingText({
      title: "UX role",
      description: "Fintech",
      skills: ["figma", "research"],
      category: "design",
    });
    expect(text).toContain("UX role");
    expect(text).toContain("figma, research");
    expect(text).toContain("design");
  });

  test("cosine similarity on unit vectors", () => {
    expect(cosine([1, 0, 0], [1, 0, 0])).toBeCloseTo(1, 5);
    expect(cosine([1, 0, 0], [0, 1, 0])).toBeCloseTo(0, 5);
    expect(cosine([1, 0, 0], [-1, 0, 0])).toBeCloseTo(-1, 5);
  });

  test("cosine handles zero vectors", () => {
    expect(cosine([0, 0, 0], [1, 2, 3])).toBe(0);
  });

  test("cosine rejects mismatched dims", () => {
    expect(cosine([1, 2], [1, 2, 3])).toBe(0);
  });
});
